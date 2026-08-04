/* ══════════════════════════════════════════════════════════
   window.NiveloContasBancarias — catálogo central das contas bancárias da
   fazenda (Configuração > Conta bancária). Mesma convenção IIFE de
   contas-pagar-data.js/categorias-financeiras-data.js — módulo próprio,
   consumido por contas-bancarias.html (listagem) e nova-conta-bancaria.html
   (cadastro/edição).

   Cada conta bancária (ContaBancaria): {
     codigo,               // INT auto-increment, nunca editável (ver nextCodigo())
     bancoCodigo,           // FK -> window.NiveloBancosCatalogo (código Febraban)
     descricao,             // texto livre (ex.: "Conta Corrente Safra")
     agencia,               // texto, formato NNNN-N (ex.: "1234-5")
     conta,                 // texto, formato NNNNNN-N (ex.: "987654-1")
     contaFinanceiraCodigo, // FK -> window.NiveloContasFinanceiras (ver nota abaixo)
     dataCadastro,          // 'AAAA-MM-DD', setada uma vez no add()
     usuarioCadastro,       // texto fixo (sem sessão real neste protótipo)
     dataAlteracao,         // 'AAAA-MM-DD', atualizada a cada update()
     usuarioAlteracao       // texto fixo
   }

   Nota sobre "Conta Financeira": nas rodadas em que só esta tela existia
   (Contas Bancárias), esse campo apontava pra `NiveloCategoriasFinanceiras`
   como stand-in temporário, já documentado como decisão a ser revisitada.
   Agora que a entidade real "Conta Financeira" existe
   (`contas-financeiras-data.js`, Configuração > Conta Financeira),
   `contaFinanceiraCodigo` referencia `window.NiveloContasFinanceiras` de
   verdade. Os 4 registros seed abaixo foram migrados de códigos de
   Categoria (`CAT-00N`) pra códigos INT de Conta Financeira.

   Regra de negócio: exclusão é REAL (remove o registro de verdade), por
   pedido explícito ("Excluir conta mediante confirmação") — diferente de
   Categorias/Talhões, que usam Ativar/Desativar pra preservar histórico;
   não houve pedido equivalente aqui. */
(function () {
  'use strict';

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  var CURRENT_USER = 'Você';

  var CONTAS_BANCARIAS = [
    { codigo: 1, bancoCodigo: '001', descricao: 'Conta Corrente Safra', agencia: '1234-5', conta: '987654-1', contaFinanceiraCodigo: 2, dataCadastro: '2026-06-01', usuarioCadastro: CURRENT_USER, dataAlteracao: '2026-06-01', usuarioAlteracao: CURRENT_USER },
    { codigo: 2, bancoCodigo: '748', descricao: 'Conta Corrente Sicredi', agencia: '0452-9', conta: '112233-4', contaFinanceiraCodigo: 2, dataCadastro: '2026-06-03', usuarioCadastro: CURRENT_USER, dataAlteracao: '2026-06-03', usuarioAlteracao: CURRENT_USER },
    { codigo: 3, bancoCodigo: '104', descricao: 'Poupança Reserva', agencia: '2100-0', conta: '556677-2', contaFinanceiraCodigo: 3, dataCadastro: '2026-06-10', usuarioCadastro: CURRENT_USER, dataAlteracao: '2026-07-02', usuarioAlteracao: CURRENT_USER },
    { codigo: 4, bancoCodigo: '077', descricao: 'Conta digital Inter', agencia: '0001-8', conta: '998877-6', contaFinanceiraCodigo: 4, dataCadastro: '2026-07-01', usuarioCadastro: CURRENT_USER, dataAlteracao: '2026-07-01', usuarioAlteracao: CURRENT_USER }
  ];

  function list() {
    return CONTAS_BANCARIAS;
  }

  function findByCodigo(codigo) {
    var codigoNum = Number(codigo);
    return CONTAS_BANCARIAS.filter(function (c) { return c.codigo === codigoNum; })[0] || null;
  }

  // Autoincremento real: maior código existente + 1 (nunca reaproveita um
  // código já excluído, mesmo comportamento de uma PK auto-increment de banco
  // de dados real).
  function nextCodigo() {
    var max = 0;
    CONTAS_BANCARIAS.forEach(function (c) { max = Math.max(max, c.codigo); });
    return max + 1;
  }

  function bancoNome(conta) {
    var banco = window.NiveloBancosCatalogo.findByCodigo(conta.bancoCodigo);
    return banco ? banco.codigo + ' - ' + banco.nome : '—';
  }

  function contaFinanceiraDescricao(conta) {
    var contaFinanceira = window.NiveloContasFinanceiras.findByCodigo(conta.contaFinanceiraCodigo);
    return contaFinanceira ? contaFinanceira.nome : '—';
  }

  function add(payload) {
    var conta = {
      codigo: nextCodigo(),
      bancoCodigo: payload.bancoCodigo,
      descricao: payload.descricao,
      agencia: payload.agencia,
      conta: payload.conta,
      contaFinanceiraCodigo: payload.contaFinanceiraCodigo,
      dataCadastro: todayISO(),
      usuarioCadastro: CURRENT_USER,
      dataAlteracao: todayISO(),
      usuarioAlteracao: CURRENT_USER
    };
    CONTAS_BANCARIAS.push(conta);
    return conta;
  }

  function update(codigo, payload) {
    var conta = findByCodigo(codigo);
    if (!conta) return null;
    conta.bancoCodigo = payload.bancoCodigo;
    conta.descricao = payload.descricao;
    conta.agencia = payload.agencia;
    conta.conta = payload.conta;
    conta.contaFinanceiraCodigo = payload.contaFinanceiraCodigo;
    conta.dataAlteracao = todayISO();
    conta.usuarioAlteracao = CURRENT_USER;
    return conta;
  }

  function remove(codigo) {
    var codigoNum = Number(codigo);
    var index = CONTAS_BANCARIAS.findIndex(function (c) { return c.codigo === codigoNum; });
    if (index === -1) return false;
    CONTAS_BANCARIAS.splice(index, 1);
    return true;
  }

  window.NiveloContasBancarias = {
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    bancoNome: bancoNome,
    contaFinanceiraDescricao: contaFinanceiraDescricao,
    add: add,
    update: update,
    remove: remove
  };
})();
