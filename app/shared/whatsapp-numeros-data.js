/* ══════════════════════════════════════════════════════════
   window.NiveloWhatsappNumeros — catálogo dos números de WhatsApp
   autorizados a conversar com o Assistente de IA da conta (Assistente
   IA > Meus números). Mesma convenção IIFE de contas-financeiras-data.js.

   Cada registro: {
     id,          // interno, sequencial
     numero,      // normalizado: '+55' + DDD + número, só dígitos além do '+'
                   // (ex.: '+5547999999999') — formato pronto pra integração
                   // futura com a API do WhatsApp
     createdAt,
     updatedAt
   }

   Sem persistência entre páginas (mesma decisão de todo o protótipo) — um
   número adicionado aqui só existe durante a sessão de JS desta página,
   já que esta tela não navega para nenhum outro lugar. */
(function () {
  'use strict';

  var TODAY = '2026-08-04';

  var NUMEROS = [
    { id: 1, numero: '+5547999990001', createdAt: TODAY, updatedAt: TODAY },
    { id: 2, numero: '+5511988880002', createdAt: TODAY, updatedAt: TODAY }
  ];

  function list() {
    return NUMEROS;
  }

  function findById(id) {
    var idNum = Number(id);
    return NUMEROS.filter(function (n) { return n.id === idNum; })[0] || null;
  }

  // Só dígitos, sem '+' — usado pra comparar duplicidade e pra normalizar
  // antes de guardar.
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

  function isNumeroDuplicado(value, excludeId) {
    var normalized = normalizeNumero(value);
    return NUMEROS.some(function (n) {
      if (excludeId != null && n.id === Number(excludeId)) return false;
      return n.numero === normalized;
    });
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

  function nextId() {
    var max = 0;
    NUMEROS.forEach(function (n) { max = Math.max(max, n.id); });
    return max + 1;
  }

  function add(payload) {
    var registro = {
      id: nextId(),
      numero: normalizeNumero(payload.numero),
      createdAt: TODAY,
      updatedAt: TODAY
    };
    NUMEROS.push(registro);
    return registro;
  }

  function remove(id) {
    var idNum = Number(id);
    var index = NUMEROS.findIndex(function (n) { return n.id === idNum; });
    if (index === -1) return false;
    NUMEROS.splice(index, 1);
    return true;
  }

  window.NiveloWhatsappNumeros = {
    list: list,
    findById: findById,
    normalizeNumero: normalizeNumero,
    isNumeroDuplicado: isNumeroDuplicado,
    formatNumero: formatNumero,
    nextId: nextId,
    add: add,
    remove: remove
  };
})();
