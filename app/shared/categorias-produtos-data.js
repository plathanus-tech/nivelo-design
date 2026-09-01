/* ══════════════════════════════════════════════════════════
   window.NiveloCategoriasProdutos — catálogo central das Categorias de
   Produtos (Configuração > Categorias de produtos). Mesma convenção IIFE de
   categorias-financeiras-data.js/contas-financeiras-data.js — módulo
   próprio, consumido por categorias-produtos.html (listagem) e
   nova-categoria-produto.html (cadastro).

   Distinto de `window.NiveloCategorias` (categorias-data.js): aquele é a
   lista flat de "Categoria" (Grãos/Sementes/Fertilizantes/...) já usada no
   campo do mesmo nome em Novo Produto, sem separação por Grupo nem status
   Ativo/Inativo. Esta tela é uma organização administrativa NOVA e
   independente — mesmo grupo de dois valores ('venda'/'uso') já usado como
   `tipoProduto` em produtos-data.js, mas sem nenhuma integração com o
   formulário de Produto nesta rodada (não foi pedido).

   Cada categoria: {
     id,      // INT auto-increment, nunca editável (equivalente a uma PK)
     nome,    // texto livre, obrigatório e ÚNICO dentro do mesmo `grupo`
              // (comparação ignora maiúsculas/minúsculas e espaços extras
              // nas pontas — ver isNomeDuplicado()). O MESMO nome pode
              // existir em grupos diferentes, por design (pedido explícito).
     grupo,   // 'venda' | 'uso'
     ativo    // boolean — nunca é excluída de verdade, só ativada/
              // desativada via toggleAtivo() (mesmo padrão de Categorias
              // financeiras/Talhões: preserva o histórico de produtos já
              // classificados com ela) */
(function () {
  'use strict';

  var CATEGORIAS = [
    { id: 1, nome: 'Grãos', grupo: 'venda', ativo: true },
    { id: 2, nome: 'Frutas', grupo: 'venda', ativo: true },
    { id: 3, nome: 'Hortaliças', grupo: 'venda', ativo: false },
    { id: 4, nome: 'Fertilizantes', grupo: 'uso', ativo: true },
    { id: 5, nome: 'Defensivos', grupo: 'uso', ativo: true },
    { id: 6, nome: 'Sementes', grupo: 'uso', ativo: true },
    { id: 7, nome: 'Insumos', grupo: 'uso', ativo: false }
  ];

  function list() {
    return CATEGORIAS;
  }

  function listByGrupo(grupo) {
    return CATEGORIAS.filter(function (c) { return c.grupo === grupo; });
  }

  function findById(id) {
    var idNum = Number(id);
    return CATEGORIAS.filter(function (c) { return c.id === idNum; })[0] || null;
  }

  function nextId() {
    var max = 0;
    CATEGORIAS.forEach(function (c) { max = Math.max(max, c.id); });
    return max + 1;
  }

  // Ignora maiúsculas/minúsculas e espaços extras nas pontas — "Grãos",
  // "grãos " e "GRÃOS" contam como o mesmo nome.
  function normalizeNome(nome) {
    return (nome || '').trim().toLowerCase();
  }

  // Duplicidade é escopada ao MESMO grupo — o mesmo nome pode existir em
  // "Produtos de venda" e "Produtos de uso" ao mesmo tempo (pedido
  // explícito: "permitir o mesmo nome em grupos diferentes").
  function isNomeDuplicado(nome, grupo, excludeId) {
    var normalized = normalizeNome(nome);
    return CATEGORIAS.some(function (c) {
      if (excludeId != null && c.id === Number(excludeId)) return false;
      return c.grupo === grupo && normalizeNome(c.nome) === normalized;
    });
  }

  function add(payload) {
    var categoria = {
      id: nextId(),
      nome: payload.nome.trim(),
      grupo: payload.grupo,
      ativo: true
    };
    CATEGORIAS.push(categoria);
    return categoria;
  }

  // Ativar/Desativar: a categoria nunca é excluída de verdade (mesma regra
  // já usada em Categorias financeiras/Talhões).
  function toggleAtivo(id) {
    var categoria = findById(id);
    if (!categoria) return null;
    categoria.ativo = !categoria.ativo;
    return categoria;
  }

  window.NiveloCategoriasProdutos = {
    list: list,
    listByGrupo: listByGrupo,
    findById: findById,
    nextId: nextId,
    isNomeDuplicado: isNomeDuplicado,
    add: add,
    toggleAtivo: toggleAtivo
  };
})();
