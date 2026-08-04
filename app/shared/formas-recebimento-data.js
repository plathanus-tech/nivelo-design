/* ══════════════════════════════════════════════════════════
   window.NiveloFormasRecebimento — stub fixo das formas de recebimento
   usadas em Contas a Receber (Financeiro > Contas a receber). Catálogo
   próprio, distinto de `formas-pagamento-data.js` (Contas a Pagar) —
   inclui "Grão" (recebimento em produto agrícola, comum neste segmento),
   que não existe no catálogo de pagamento. Mesmo raciocínio de
   `bancos-data.js`: só `list()`, sem CRUD. ══════════════ */
(function () {
  'use strict';

  var FORMAS = [
    { codigo: 'FR-001', nome: 'Dinheiro' },
    { codigo: 'FR-002', nome: 'Cartão de Débito' },
    { codigo: 'FR-003', nome: 'Cartão de Crédito' },
    { codigo: 'FR-004', nome: 'Boleto' },
    { codigo: 'FR-005', nome: 'PIX' },
    { codigo: 'FR-006', nome: 'Grão' }
  ];

  function list() {
    return FORMAS;
  }

  function findByCodigo(codigo) {
    return FORMAS.filter(function (f) { return f.codigo === codigo; })[0] || null;
  }

  window.NiveloFormasRecebimento = { list: list, findByCodigo: findByCodigo };
})();
