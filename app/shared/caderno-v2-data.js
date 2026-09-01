// Catálogo central de registros do Caderno de Campo V2 (window.NiveloCadernoV2).
// V2 diverge o suficiente do shape de V1 (window.NiveloCaderno, ver
// caderno-data.js) pra justificar um módulo próprio, em vez de estender o
// existente: novos tipos de registro (aplicacao-insumo com Produto/Depósito/
// Custo calculado, despesa-manual com Categoria), campos novos obrigatórios
// (titulo em Anotação) e a regra "todo registro tem talhaoId, sem exceção" —
// V1 permitia registros só com fazendaId. `colheita` foi preservado do V1
// (não fazia parte da lista literal de 3 tipos do pedido, mas os KPIs de V2
// — Produtividade/Produção registrada/Produtividade média — dependem de um
// tipo de registro de produção; a lista pedida foi "pelo menos estes 3", o
// que deixa margem pra manter Colheita como um 4º tipo).
//
// `tipo`: 'anotacao' | 'aplicacao-insumo' | 'despesa-manual' | 'colheita'.
//
// Campos por tipo:
// - anotacao: titulo, descricao.
// - aplicacao-insumo: produtoSku, produtoNome, quantidade, unidade (sigla
//   derivada do produto, nunca escolhida pelo usuário), depositoNome,
//   custoCalculado (produto × quantidade, a partir do custo médio do
//   produto — ver getCustoMedioBySku).
// - despesa-manual: categoria ('Servico'|'Frete'|'Outro'), valor,
//   observacao (opcional).
// - colheita: produtoSku, produtoNome, quantidade, unidade.
//
// Todo registro (qualquer tipo) carrega fazendaId + talhaoId (obrigatórios,
// sem exceção — regra central de V2) + cultura/safra (retrato do estado do
// talhão no momento do registro, lidos de `talhao.cultura`/`talhao.safra`
// em fazendas-data.js, nunca escolhidos pelo usuário) + dataHora (ISO,
// automática).
window.NiveloCadernoV2 = (function () {
  'use strict';

  function getCustoMedioBySku(sku) {
    try {
      if (window.NiveloEstoqueUsoV2) {
        var item = window.NiveloEstoqueUsoV2.list().filter(function (p) { return p.sku === sku; })[0];
        if (item && item.custoMedio != null) return item.custoMedio;
      }
    } catch (e) {}
    return 0;
  }

  var REGISTROS = [
    { id: 'v2-1', fazendaId: 'sao-joao', talhaoId: 't1', tipo: 'despesa-manual', categoria: 'Servico', valor: 1450, observacao: 'Serviço de preparo do solo', cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-29T09:15:00' },
    { id: 'v2-2', fazendaId: 'sao-joao', talhaoId: 't2', tipo: 'colheita', produtoSku: 'PRD-002', produtoNome: 'Milho', quantidade: 480, unidade: 'sc', cultura: 'Milho', safra: '2026/27', dataHora: '2026-07-30T16:40:00' },
    { id: 'v2-3', fazendaId: 'sao-joao', talhaoId: 't4', tipo: 'colheita', produtoSku: 'PRD-001', produtoNome: 'Soja', quantidade: 620, unidade: 'sc', cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-31T08:05:00' },
    { id: 'v2-4', fazendaId: 'sao-joao', talhaoId: 't1', tipo: 'aplicacao-insumo', produtoSku: 'PRD-008', produtoNome: 'Defensivo', quantidade: 20, unidade: 'L', depositoNome: 'Armazém da Fazenda', custoCalculado: getCustoMedioBySku('PRD-008') * 20, cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-31T14:32:00' },
    { id: 'v2-5', fazendaId: 'sao-joao', talhaoId: 't6', tipo: 'anotacao', titulo: 'Monitoramento de pragas', descricao: 'Baixa incidência de lagarta, sem necessidade de aplicação imediata.', cultura: 'Milho', safra: '2026/27', dataHora: '2026-08-01T10:05:00' },
    { id: 'v2-6', fazendaId: 'santa-rita', talhaoId: 't1', tipo: 'colheita', produtoSku: 'PRD-010', produtoNome: 'Cana-de-açúcar', quantidade: 1200, unidade: 'kg', cultura: 'Cana-de-açúcar', safra: '2026/27', dataHora: '2026-07-28T11:00:00' },
    { id: 'v2-7', fazendaId: 'santa-rita', talhaoId: 't3', tipo: 'despesa-manual', categoria: 'Frete', valor: 2100, observacao: 'Frete de sementes de soja', cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-30T10:20:00' },
    { id: 'v2-8', fazendaId: 'santa-rita', talhaoId: 't2', tipo: 'aplicacao-insumo', produtoSku: 'PRD-006', produtoNome: 'Adubo', quantidade: 15, unidade: 'sc', depositoNome: 'Fazenda Boa Vista', custoCalculado: getCustoMedioBySku('PRD-006') * 15, cultura: 'Milho', safra: '2026/27', dataHora: '2026-08-02T08:40:00' },
    { id: 'v2-9', fazendaId: 'boa-esperanca', talhaoId: 't1', tipo: 'colheita', produtoSku: 'PRD-009', produtoNome: 'Café', quantidade: 340, unidade: 'sc', cultura: 'Café', safra: '2026/27', dataHora: '2026-07-27T13:50:00' },
    { id: 'v2-10', fazendaId: 'boa-esperanca', talhaoId: 't2', tipo: 'anotacao', titulo: 'Poda de manutenção', descricao: 'Poda realizada em toda a extensão do talhão, sem intercorrências.', cultura: 'Café', safra: '2026/27', dataHora: '2026-08-03T15:10:00' }
  ];

  // ---------- Persistência entre páginas (sessionStorage) ----------
  var SESSION_KEY = 'nivelo.caderno-v2.registros';

  (function loadPersisted() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(function (r) { REGISTROS.push(r); });
    } catch (e) {}
  })();

  function persist(registro) {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      var criados = raw ? JSON.parse(raw) : [];
      criados.push(registro);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(criados));
    } catch (e) {}
  }

  function list() {
    return REGISTROS;
  }

  function listByFazenda(fazendaId) {
    return REGISTROS.filter(function (r) { return r.fazendaId === fazendaId; });
  }

  // talhaoId sozinho não é único no sistema (mesmo motivo já documentado em
  // caderno-data.js) — sempre filtrar por fazendaId + talhaoId juntos.
  function listByTalhao(fazendaId, talhaoId) {
    return REGISTROS.filter(function (r) { return r.fazendaId === fazendaId && r.talhaoId === talhaoId; });
  }

  // Registro mais recente (qualquer tipo) de um talhão, usado pela coluna
  // "Última Anotação" da tabela de Talhões.
  function lastRecordByTalhao(fazendaId, talhaoId) {
    var registros = listByTalhao(fazendaId, talhaoId);
    if (!registros.length) return null;
    return registros.slice().sort(function (a, b) { return b.dataHora.localeCompare(a.dataHora); })[0];
  }

  function add(registro) {
    var novo = Object.assign({ id: 'v2-' + Date.now() }, registro);
    REGISTROS.push(novo);
    persist(novo);
    return novo;
  }

  return {
    list: list,
    listByFazenda: listByFazenda,
    listByTalhao: listByTalhao,
    lastRecordByTalhao: lastRecordByTalhao,
    add: add,
    getCustoMedioBySku: getCustoMedioBySku
  };
})();
