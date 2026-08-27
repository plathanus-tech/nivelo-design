/* ══════════════════════════════════════════════════════════
   window.NiveloFormasCondicaoVenda — catálogos de "Forma de recebimento"
   (condição À vista/Recebido agora) e "Forma de cobrança" (condição A
   prazo) do Pedido de Venda.

   Nenhum catálogo existente bate literalmente com os 2 vocabulários
   pedidos aqui: `formas-pagamento-data.js` é pro lado das SAÍDAS
   (Contas a Pagar), `formas-recebimento-data.js` é o catálogo de Contas a
   Receber mas inclui "Grão" (não pedido aqui) e não inclui "Transferência"
   nem os rótulos "futuro" da cobrança a prazo. Em vez de forçar um dos
   dois catálogos existentes (que representam conceitos ligeiramente
   diferentes) ou hardcodar as opções direto no formulário, este módulo
   próprio — pequeno e no mesmo formato `list()` de todo catálogo do
   sistema — deixa as opções extensíveis sem tocar em `novo-pedido-
   venda.js` quando uma forma nova for pedida no futuro. ══════════════ */
window.NiveloFormasCondicaoVenda = (function () {
  'use strict';

  var FORMAS_RECEBIMENTO = [
    { codigo: 'PIX', nome: 'Pix' },
    { codigo: 'DINHEIRO', nome: 'Dinheiro' },
    { codigo: 'TRANSFERENCIA', nome: 'Transferência' }
  ];

  var FORMAS_COBRANCA = [
    { codigo: 'A_RECEBER', nome: 'A receber' },
    { codigo: 'BOLETO', nome: 'Boleto' },
    { codigo: 'PIX_FUTURO', nome: 'Pix futuro' },
    { codigo: 'TRANSFERENCIA_FUTURA', nome: 'Transferência futura' }
  ];

  function formasRecebimento() { return FORMAS_RECEBIMENTO; }
  function formasCobranca() { return FORMAS_COBRANCA; }
  function findRecebimentoByCodigo(codigo) { return FORMAS_RECEBIMENTO.filter(function (f) { return f.codigo === codigo; })[0] || null; }
  function findCobrancaByCodigo(codigo) { return FORMAS_COBRANCA.filter(function (f) { return f.codigo === codigo; })[0] || null; }

  return {
    formasRecebimento: formasRecebimento,
    formasCobranca: formasCobranca,
    findRecebimentoByCodigo: findRecebimentoByCodigo,
    findCobrancaByCodigo: findCobrancaByCodigo
  };
})();
