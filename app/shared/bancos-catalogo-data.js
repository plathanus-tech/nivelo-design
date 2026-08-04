/* ══════════════════════════════════════════════════════════
   window.NiveloBancosCatalogo — catálogo de instituições financeiras
   (código Febraban + nome), usado só como fonte do campo "Banco" do
   cadastro de Contas Bancárias (Configuração > Conta bancária). Catálogo de
   referência: pré-cadastrado, sem tela de gestão própria (não pedido) —
   mesmo raciocínio já usado em `formas-pagamento-data.js`.

   Não confundir com `window.NiveloContasBancarias` (contas-bancarias-
   data.js): este módulo é só a lista de BANCOS (instituições financeiras);
   aquele é a lista de CONTAS BANCÁRIAS da fazenda (cada uma referenciando
   um banco daqui via `bancoCodigo`). */
(function () {
  'use strict';

  var BANCOS = [
    { codigo: '001', nome: 'Banco do Brasil' },
    { codigo: '033', nome: 'Santander' },
    { codigo: '104', nome: 'Caixa Econômica Federal' },
    { codigo: '077', nome: 'Banco Inter' },
    { codigo: '237', nome: 'Bradesco' },
    { codigo: '260', nome: 'Nu Pagamentos (Nubank)' },
    { codigo: '341', nome: 'Itaú Unibanco' },
    { codigo: '422', nome: 'Banco Safra' },
    { codigo: '748', nome: 'Banco Cooperativo Sicredi' },
    { codigo: '756', nome: 'Banco Cooperativo do Brasil (Sicoob)' }
  ];

  function list() {
    return BANCOS;
  }

  function findByCodigo(codigo) {
    return BANCOS.filter(function (b) { return b.codigo === codigo; })[0] || null;
  }

  window.NiveloBancosCatalogo = { list: list, findByCodigo: findByCodigo };
})();
