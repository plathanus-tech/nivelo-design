/* ══════════════════════════════════════════════════════════
   window.NiveloFormasPagamento — stub fixo das formas de pagamento usadas em
   Contas a Pagar (Financeiro > Contas a pagar). Mesmo raciocínio de
   bancos-data.js (stub simulando uma futura Configuração > Formas de
   pagamento, ainda sem tela própria): só `list()`, sem CRUD. ══════════════ */
(function () {
  'use strict';

  var FORMAS = [
    { codigo: 'FP-001', nome: 'Dinheiro' },
    { codigo: 'FP-002', nome: 'PIX' },
    { codigo: 'FP-003', nome: 'Boleto bancário' },
    { codigo: 'FP-004', nome: 'Cartão de crédito' },
    { codigo: 'FP-005', nome: 'Cartão de débito' },
    { codigo: 'FP-006', nome: 'Transferência bancária' },
    { codigo: 'FP-007', nome: 'Cheque' }
  ];

  function list() {
    return FORMAS;
  }

  function findByCodigo(codigo) {
    return FORMAS.filter(function (f) { return f.codigo === codigo; })[0] || null;
  }

  window.NiveloFormasPagamento = { list: list, findByCodigo: findByCodigo };
})();
