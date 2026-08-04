/* ══════════════════════════════════════════════════════════
   window.NiveloNaturezaOperacao — mapeamento Tipo de operação → CFOP,
   usado pela seção "Natureza da operação" de Nova Nota Fiscal.

   Este protótipo NÃO cria uma tela de configuração de Natureza de Operação
   (RF402, fora do escopo deste pedido) — o item de Sidebar
   `data-nav="fiscal-natureza"` continua um stub sem destino. Este módulo
   simula o resultado que essa configuração produziria (cada tipo de
   operação já teria um CFOP associado, configurado previamente pelo
   usuário) — mesma convenção de qualquer outro dado-mock deste projeto que
   representa uma configuração ainda não construída (ver
   emitente-data.js). Quando a tela de Natureza de Operação existir de
   verdade, este módulo deve virar uma leitura daquele cadastro em vez de
   uma lista fixa. */
(function () {
  'use strict';

  var NATUREZAS = [
    { tipoOperacao: 'venda-dentro-estado', label: 'Venda dentro do estado', cfop: '5102' },
    { tipoOperacao: 'venda-fora-estado', label: 'Venda fora do estado', cfop: '6102' },
    { tipoOperacao: 'remessa', label: 'Remessa', cfop: '5905' },
    { tipoOperacao: 'devolucao', label: 'Devolução', cfop: '5202' }
  ];

  function list() {
    return NATUREZAS;
  }

  function findByTipoOperacao(tipoOperacao) {
    return NATUREZAS.filter(function (n) { return n.tipoOperacao === tipoOperacao; })[0] || null;
  }

  window.NiveloNaturezaOperacao = {
    list: list,
    findByTipoOperacao: findByTipoOperacao
  };
})();
