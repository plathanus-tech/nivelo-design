/* ══════════════════════════════════════════════════════════
   window.NiveloContasFinanceiras — catálogo central das Contas Financeiras
   (Configuração > Conta Financeira). Mesma convenção IIFE de
   contas-bancarias-data.js/contas-pagar-data.js — módulo próprio, consumido
   por contas-financeiras.html (listagem) e nova-conta-financeira.html
   (cadastro/edição).

   Entidade simples de propósito (só Código + Nome) — é um plano de contas
   financeiro (ex.: "Caixa Geral", "Conta Corrente Operacional"), DISTINTA de
   "Categoria financeira" (categorias-financeiras-data.js, que classifica
   receita/despesa pra DRE/LCDPR com um vocabulário bem mais rico). Usada
   pra 2 coisas (ver pedido original): vínculo dos lançamentos de Caixa
   (`caixa-data.js`'s `contaFinanceiraCodigo`, novo campo) e base pra gerar o
   DRE. Também é o que `ContaBancaria.contaFinanceiraCodigo`
   (contas-bancarias-data.js) referencia — nas rodadas anteriores, antes
   desta entidade existir, esse campo apontava pra `NiveloCategoriasFinanceiras`
   como um stand-in temporário; agora que a Conta Financeira real existe,
   `contas-bancarias-data.js` foi corrigido pra referenciar este módulo.

   Cada conta financeira: {
     codigo,      // INT auto-increment, nunca editável (equivalente ao id/PK)
     nome,        // texto livre, obrigatório e ÚNICO (comparação ignora
                  // maiúsculas/minúsculas e espaços extras nas pontas — ver
                  // isNomeDuplicado())
     createdAt,   // 'AAAA-MM-DD', setada uma vez no add()
     updatedAt    // 'AAAA-MM-DD', atualizada a cada update()
   }

   Regra de exclusão: uma conta financeira EM USO (vinculada a algum
   lançamento de Caixa OU a alguma Conta Bancária) não pode ser excluída —
   ver isEmUso(). Como este protótipo não tem uma tela de DRE com dataset
   próprio (Relatórios > DRE ainda é só um card de entrada, sem fluxo
   construído — ver app/CLAUDE.md), "em uso no DRE" e "vinculada a
   lançamentos de Caixa" são checadas pela MESMA fonte de dados (os
   lançamentos de Caixa são a base que alimentaria o DRE), não duas
   verificações separadas. */
(function () {
  'use strict';

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  var CONTAS_FINANCEIRAS = [
    { codigo: 1, nome: 'Caixa Geral', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
    { codigo: 2, nome: 'Conta Corrente Operacional', createdAt: '2026-05-01', updatedAt: '2026-05-01' },
    { codigo: 3, nome: 'Conta Poupança Reserva', createdAt: '2026-06-01', updatedAt: '2026-06-01' },
    { codigo: 4, nome: 'Conta Investimentos', createdAt: '2026-06-15', updatedAt: '2026-06-15' }
  ];

  function list() {
    return CONTAS_FINANCEIRAS;
  }

  function findByCodigo(codigo) {
    var codigoNum = Number(codigo);
    return CONTAS_FINANCEIRAS.filter(function (c) { return c.codigo === codigoNum; })[0] || null;
  }

  function nextCodigo() {
    var max = 0;
    CONTAS_FINANCEIRAS.forEach(function (c) { max = Math.max(max, c.codigo); });
    return max + 1;
  }

  // Ignora maiúsculas/minúsculas e espaços extras nas pontas — "Caixa
  // Geral", "caixa geral " e "CAIXA GERAL" contam como o mesmo nome.
  function normalizeNome(nome) {
    return (nome || '').trim().toLowerCase();
  }

  function isNomeDuplicado(nome, excludeCodigo) {
    var normalized = normalizeNome(nome);
    return CONTAS_FINANCEIRAS.some(function (c) {
      if (excludeCodigo != null && c.codigo === Number(excludeCodigo)) return false;
      return normalizeNome(c.nome) === normalized;
    });
  }

  // Em uso: vinculada a algum lançamento de Caixa OU a alguma Conta
  // Bancária — nos dois casos, os módulos são carregados junto nas telas
  // que chamam isEmUso(), então window.NiveloCaixa/window.NiveloContasBancarias
  // já existem quando esta função roda.
  function isEmUso(codigo) {
    var codigoNum = Number(codigo);
    var usadaNoCaixa = window.NiveloCaixa
      ? window.NiveloCaixa.list().some(function (l) { return l.contaFinanceiraCodigo === codigoNum; })
      : false;
    var usadaEmContaBancaria = window.NiveloContasBancarias
      ? window.NiveloContasBancarias.list().some(function (c) { return c.contaFinanceiraCodigo === codigoNum; })
      : false;
    return usadaNoCaixa || usadaEmContaBancaria;
  }

  function add(payload) {
    var conta = {
      codigo: nextCodigo(),
      nome: payload.nome.trim(),
      createdAt: todayISO(),
      updatedAt: todayISO()
    };
    CONTAS_FINANCEIRAS.push(conta);
    return conta;
  }

  function update(codigo, payload) {
    var conta = findByCodigo(codigo);
    if (!conta) return null;
    conta.nome = payload.nome.trim();
    conta.updatedAt = todayISO();
    return conta;
  }

  function remove(codigo) {
    var codigoNum = Number(codigo);
    var index = CONTAS_FINANCEIRAS.findIndex(function (c) { return c.codigo === codigoNum; });
    if (index === -1) return false;
    CONTAS_FINANCEIRAS.splice(index, 1);
    return true;
  }

  window.NiveloContasFinanceiras = {
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    isNomeDuplicado: isNomeDuplicado,
    isEmUso: isEmUso,
    add: add,
    update: update,
    remove: remove
  };
})();
