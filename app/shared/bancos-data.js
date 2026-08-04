/* ══════════════════════════════════════════════════════════
   window.NiveloBancos — lista de contas bancárias/caixas usadas no campo
   "Banco" de Caixa (Financeiro > Caixa). Mesma convenção IIFE de
   emitente-data.js: stub fixo simulando o que a futura tela real de
   Configuração > Conta bancária (hoje um item de Sidebar sem destino, ver
   `config-conta-bancaria`) já teria cadastrado. Sem tela de gestão própria
   nesta rodada — nenhum CRUD, só `list()`. */
(function () {
  'use strict';

  var BANCOS = [
    { codigo: 'BCO-001', nome: 'Banco do Brasil - Conta Corrente' },
    { codigo: 'BCO-002', nome: 'Sicredi - Conta Corrente' },
    { codigo: 'BCO-003', nome: 'Caixa Econômica Federal - Poupança' },
    { codigo: 'BCO-004', nome: 'Dinheiro em caixa' }
  ];

  function list() {
    return BANCOS;
  }

  window.NiveloBancos = { list: list };
})();
