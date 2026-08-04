/* ══════════════════════════════════════════════════════════
   window.NiveloCategoriasFinanceiras — catálogo central das categorias
   usadas pra classificar lançamentos de receitas/despesas (Configuração >
   Categorias de receitas e despesas). Mesma convenção IIFE de
   produtos-data.js/fazendas-data.js/cadastros-data.js — módulo próprio,
   consumido por categorias-financeiras.html (listagem) e
   nova-categoria-financeira.html (cadastro/edição).

   Cada categoria: {
     codigo,               // 'CAT-001' — auto-gerado, nunca editável
     descricao,            // nome livre (ex.: "Venda de soja")
     grupo,                // 'receita' | 'despesa'
     consideraDre,         // boolean
     classificacaoDre,     // uma das 5 opções fixas, só quando consideraDre=true; senão null
     consideraLcdpr,       // boolean
     classificacaoLcdpr,   // reservado pra uma classificação própria do LCDPR — ainda não
                            // especificada nos requisitos atuais (ver nota abaixo), sempre null
                            // por ora. Existe já no shape do dado pra não exigir migração
                            // quando a classificação real for definida.
     competenciaPadrao,    // 'sem-competencia' | 'mes-vencimento' | 'mes-emissao' | 'mes-anterior-vencimento'
     ativo                 // boolean — Ativo/Inativo (mesmo padrão de Talhões em
                            // fazenda-detalhe-cadastro.js: nunca é excluída de verdade, só
                            // ativada/desativada via toggleAtivo() abaixo, preservando o
                            // histórico de lançamentos já feitos com ela)
   }

   Nota sobre `classificacaoLcdpr`: o pedido que originou esta tela foi explícito em não
   inventar uma taxonomia pro LCDPR ainda ("não inventar opções... deixar a estrutura
   preparada pra receber essa configuração posteriormente") — por isso o campo existe no
   dado (pra não quebrar nenhum consumidor futuro que espere a chave) mas nunca é
   preenchido nem editável pela UI hoje. */
(function () {
  'use strict';

  var CATEGORIAS = [
    { codigo: 'CAT-001', descricao: 'Venda de soja', grupo: 'receita', consideraDre: true, classificacaoDre: 'outras', classificacaoLcdpr: null, consideraLcdpr: true, competenciaPadrao: 'mes-vencimento', ativo: true },
    { codigo: 'CAT-002', descricao: 'Venda de milho', grupo: 'receita', consideraDre: true, classificacaoDre: 'outras', classificacaoLcdpr: null, consideraLcdpr: true, competenciaPadrao: 'mes-vencimento', ativo: true },
    { codigo: 'CAT-003', descricao: 'Compra de fertilizantes', grupo: 'despesa', consideraDre: true, classificacaoDre: 'despesas-operacionais', classificacaoLcdpr: null, consideraLcdpr: true, competenciaPadrao: 'mes-emissao', ativo: true },
    { codigo: 'CAT-004', descricao: 'Combustível', grupo: 'despesa', consideraDre: true, classificacaoDre: 'despesas-operacionais', classificacaoLcdpr: null, consideraLcdpr: true, competenciaPadrao: 'mes-emissao', ativo: true },
    { codigo: 'CAT-005', descricao: 'Energia elétrica', grupo: 'despesa', consideraDre: true, classificacaoDre: 'despesas-operacionais', classificacaoLcdpr: null, consideraLcdpr: false, competenciaPadrao: 'mes-vencimento', ativo: true },
    { codigo: 'CAT-006', descricao: 'Impostos sobre a produção', grupo: 'despesa', consideraDre: true, classificacaoDre: 'tributos', classificacaoLcdpr: null, consideraLcdpr: true, competenciaPadrao: 'mes-anterior-vencimento', ativo: true },
    { codigo: 'CAT-007', descricao: 'Taxas bancárias', grupo: 'despesa', consideraDre: true, classificacaoDre: 'taxas-tarifas', classificacaoLcdpr: null, consideraLcdpr: false, competenciaPadrao: 'sem-competencia', ativo: true },
    { codigo: 'CAT-008', descricao: 'Transferência entre contas próprias', grupo: 'despesa', consideraDre: false, classificacaoDre: null, classificacaoLcdpr: null, consideraLcdpr: false, competenciaPadrao: 'sem-competencia', ativo: false }
  ];

  function list() {
    return CATEGORIAS;
  }

  function findByCodigo(codigo) {
    return CATEGORIAS.filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  // Maior sufixo numérico existente + 1, zero-pad até 3 dígitos — mesmo
  // algoritmo já usado em fazendas-data.js/fazenda-detalhe-cadastro.js.
  function nextCodigo() {
    var max = 0;
    CATEGORIAS.forEach(function (c) {
      var match = /CAT-(\d+)/.exec(c.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 3) padded = '0' + padded;
    return 'CAT-' + padded;
  }

  function add(payload) {
    var categoria = {
      codigo: nextCodigo(),
      descricao: payload.descricao,
      grupo: payload.grupo,
      consideraDre: !!payload.consideraDre,
      classificacaoDre: payload.consideraDre ? payload.classificacaoDre : null,
      consideraLcdpr: !!payload.consideraLcdpr,
      classificacaoLcdpr: null,
      competenciaPadrao: payload.competenciaPadrao,
      ativo: true
    };
    CATEGORIAS.push(categoria);
    return categoria;
  }

  function update(codigo, payload) {
    var categoria = findByCodigo(codigo);
    if (!categoria) return null;
    categoria.descricao = payload.descricao;
    categoria.grupo = payload.grupo;
    categoria.consideraDre = !!payload.consideraDre;
    categoria.classificacaoDre = payload.consideraDre ? payload.classificacaoDre : null;
    categoria.consideraLcdpr = !!payload.consideraLcdpr;
    categoria.competenciaPadrao = payload.competenciaPadrao;
    return categoria;
  }

  // Ativar/Desativar: a categoria nunca é excluída de verdade (mesma regra
  // de Talhões em fazenda-detalhe-cadastro.js) — preserva o histórico de
  // lançamentos financeiros já classificados com ela.
  function toggleAtivo(codigo) {
    var categoria = findByCodigo(codigo);
    if (!categoria) return null;
    categoria.ativo = !categoria.ativo;
    return categoria;
  }

  window.NiveloCategoriasFinanceiras = {
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    update: update,
    toggleAtivo: toggleAtivo
  };
})();
