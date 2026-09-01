/* ══════════════════════════════════════════════════════════
   window.NiveloWhatsappNumeros — o número de WhatsApp do próprio produtor,
   conectado ao Assistente de IA (Assistente IA > Configurar WhatsApp).

   Um único número por conta (não mais uma lista) — o próprio produtor
   configura o WhatsApp que ele mesmo vai usar pra conversar com o
   Assistente, não uma lista de números de terceiros autorizados.

     nome,          // nome de quem está conectando o número (obrigatório,
                     // texto livre) — null quando nenhum número está
                     // conectado
     numero,        // normalizado: '+55' + DDD + número, só dígitos além do
                     // '+' (ex.: '+5547999999999') — formato pronto pra
                     // integração futura com a API do WhatsApp; null quando
                     // nenhum número está conectado
     connectedAt,    // data da 1ª conexão (null quando desconectado)
     updatedAt       // data da última conexão/atualização

   Sem persistência entre páginas (mesma decisão de todo o protótipo) — o
   estado só existe durante a sessão de JS desta página. */
(function () {
  'use strict';

  var TODAY = '2026-08-04';

  // Seed: já nasce conectado, pra demonstrar de cara o estado "Conectado"
  // (o estado "sem número" é só um clique de Desconectar de distância).
  var state = {
    nome: 'João da Silva',
    numero: '+5547999990001',
    connectedAt: TODAY,
    updatedAt: TODAY
  };

  function getNumero() {
    return state.numero;
  }

  function getNome() {
    return state.nome;
  }

  function isConnected() {
    return !!state.numero;
  }

  // Só dígitos, sem '+' — usado pra normalizar antes de guardar.
  function onlyDigits(value) {
    return (value || '').toString().replace(/\D/g, '');
  }

  // Aceita o valor já mascarado ('+55 (47) 99999-9999') ou só dígitos;
  // sempre garante o DDI 55 na frente e retorna '+55DDDNNNNNNNNN'.
  function normalizeNumero(value) {
    var digits = onlyDigits(value);
    if (digits.indexOf('55') === 0 && digits.length > 11) {
      digits = digits.slice(2);
    }
    return '+55' + digits;
  }

  // Exibição: '+55 (47) 99999-9999' — DDI + DDD entre parênteses + número
  // com hífen (9 dígitos: 5+4) ou (8 dígitos: 4+4) pra número fixo.
  function formatNumero(value) {
    var digits = onlyDigits(value);
    if (digits.indexOf('55') === 0) digits = digits.slice(2);
    var ddd = digits.slice(0, 2);
    var resto = digits.slice(2);
    var out = '+55';
    if (ddd) out += ' (' + ddd + ')';
    if (resto) {
      var splitAt = resto.length > 8 ? resto.length - 4 : Math.ceil(resto.length / 2);
      out += ' ' + resto.slice(0, splitAt) + (resto.length > splitAt ? '-' + resto.slice(splitAt) : '');
    }
    return out;
  }

  function connect(value, nome) {
    if (!state.connectedAt) state.connectedAt = TODAY;
    state.numero = normalizeNumero(value);
    state.nome = (nome || '').toString().trim();
    state.updatedAt = TODAY;
    return state;
  }

  function disconnect() {
    state.numero = null;
    state.nome = null;
    state.connectedAt = null;
    state.updatedAt = TODAY;
    return state;
  }

  window.NiveloWhatsappNumeros = {
    getNumero: getNumero,
    getNome: getNome,
    isConnected: isConnected,
    normalizeNumero: normalizeNumero,
    formatNumero: formatNumero,
    connect: connect,
    disconnect: disconnect
  };
})();
