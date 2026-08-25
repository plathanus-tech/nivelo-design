// Catálogo central de anotações do Caderno de Campo (Jornada · Caderno de
// Campo). Mesma convenção IIFE `window.NiveloX` já usada em fazendas-data.js/
// produtos-data.js/cadastros-data.js. Registro exclusivamente informativo e
// de controle pessoal do produtor: NUNCA gera lançamento em Financeiro nem
// movimentação em Estoque (ver app/CLAUDE.md). `fazendaId`/`talhaoId`
// referenciam os ids de `window.NiveloFazendas` (mesmo array `talhoes` das
// duas telas de Detalhe da fazenda) — sem duplicar dado entre os módulos.
//
// `tipo`: 'despesa' | 'venda' | 'colheita' | 'anotacao'.
// `valor` (reais, número) existe só em despesa/venda. `quantidade`/`unidade`
// existem só em colheita (`unidade` é 'Saca'/'Kg'/'Litro', mesmo vocabulário
// já usado no campo `unidade` de produtos-data.js) — nunca os dois pares
// juntos, pra não ambiguar valor monetário com quantidade produzida.
// `anotacao` é um registro livre, independente dos demais: só `observacao`
// (obrigatória nesse tipo), sem `valor`/`quantidade`/`unidade`/`cultura`/
// `safra`.
//
// `cultura` (round 42, campo do Storybook = `window.NiveloProdutos`,
// categoria 'Grãos') e `safra` (`window.NiveloSafras`) registram QUAL
// cultura/safra a anotação se refere — cada anotação é um "retrato" da
// cultura do talhão naquele momento, não algo fixo por talhão. Uma nova
// anotação pré-seleciona a cultura da ÚLTIMA anotação daquele talhão (ver
// `findUltimaCultura`), caindo pra `talhao.cultura` (fazendas-data.js) se
// ainda não houver nenhuma anotação. Não existem em anotações do tipo
// `anotacao` (ver acima).
window.NiveloCaderno = (function () {
  'use strict';

  var ANOTACOES = [
    { id: 'a1', fazendaId: 'sao-joao', talhaoId: 't1', tipo: 'despesa', observacao: 'Compra de adubo para o Talhão 01', valor: 1450, cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-29T09:15:00' },
    { id: 'a2', fazendaId: 'sao-joao', talhaoId: 't2', tipo: 'colheita', observacao: 'Colheita de milho concluída', quantidade: 480, unidade: 'Saca', cultura: 'Milho', safra: '2026/27', dataHora: '2026-07-30T16:40:00' },
    { id: 'a3', fazendaId: 'sao-joao', talhaoId: 't4', tipo: 'venda', observacao: 'Venda de soja para cooperativa local', valor: 32000, cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-31T08:05:00' },
    { id: 'a4', fazendaId: 'sao-joao', talhaoId: 't1', tipo: 'despesa', observacao: 'Aplicação de defensivo agrícola', valor: 890, cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-31T14:32:00' },
    { id: 'a5', fazendaId: 'santa-rita', talhaoId: 't1', tipo: 'colheita', observacao: 'Colheita de cana-de-açúcar', quantidade: 1200, unidade: 'Kg', cultura: 'Cana-de-açúcar', safra: '2026/27', dataHora: '2026-07-28T11:00:00' },
    { id: 'a6', fazendaId: 'santa-rita', talhaoId: 't3', tipo: 'despesa', observacao: 'Compra de sementes de soja', valor: 2100, cultura: 'Soja', safra: '2026/27', dataHora: '2026-07-30T10:20:00' },
    { id: 'a7', fazendaId: 'boa-esperanca', talhaoId: 't1', tipo: 'venda', observacao: 'Venda de café para exportação', valor: 18500, cultura: 'Café', safra: '2026/27', dataHora: '2026-07-27T13:50:00' }
  ];

  // ---------- Persistência entre páginas (sessionStorage) ----------
  // Mesma técnica de fazendas-data.js: anotações criadas em nova-anotacao.js
  // precisam sobreviver a uma navegação real de página (cada tela recarrega
  // este script do zero). Guarda só as anotações CRIADAS na sessão (não
  // duplica o seed) — sessionStorage de propósito, não localStorage.
  var SESSION_KEY = 'nivelo.caderno.anotacoes';

  (function loadPersisted() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(function (a) { ANOTACOES.push(a); });
    } catch (e) {}
  })();

  function persist(anotacao) {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      var criadas = raw ? JSON.parse(raw) : [];
      criadas.push(anotacao);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(criadas));
    } catch (e) {}
  }

  function list() {
    return ANOTACOES;
  }

  function listByFazenda(fazendaId) {
    return ANOTACOES.filter(function (a) { return a.fazendaId === fazendaId; });
  }

  // `talhaoId` sozinho NÃO é único no sistema — cada fazenda numera seus
  // talhões a partir de 't1' (ver fazendas-data.js), então é preciso
  // sempre filtrar por fazendaId + talhaoId juntos, senão anotações de
  // talhões de fazendas diferentes (mas com o mesmo id local) se misturam.
  function listByTalhao(fazendaId, talhaoId) {
    return ANOTACOES.filter(function (a) { return a.fazendaId === fazendaId && a.talhaoId === talhaoId; });
  }

  // Cultura da anotação MAIS RECENTE deste talhão (por `dataHora`), pra
  // pré-selecionar o campo Cultura de uma nova anotação — ver comentário do
  // arquivo. `null` se o talhão ainda não tem nenhuma anotação com cultura.
  function findUltimaCultura(fazendaId, talhaoId) {
    var doTalhao = listByTalhao(fazendaId, talhaoId).filter(function (a) { return a.cultura; });
    if (!doTalhao.length) return null;
    doTalhao.sort(function (a, b) { return b.dataHora.localeCompare(a.dataHora); });
    return doTalhao[0].cultura;
  }

  // `anotacao` já vem com fazendaId/talhaoId/tipo/observacao/dataHora +
  // valor OU quantidade+unidade (nunca os dois pares juntos, ver comentário
  // do arquivo). `id` gerado aqui, nunca pedido ao usuário.
  function add(anotacao) {
    var nova = Object.assign({ id: 'a-' + Date.now() }, anotacao);
    ANOTACOES.push(nova);
    persist(nova);
    return nova;
  }

  return { list: list, listByFazenda: listByFazenda, listByTalhao: listByTalhao, findUltimaCultura: findUltimaCultura, add: add };
})();
