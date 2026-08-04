// Catálogo compartilhado de Categorias de Produto — mesmo padrão de
// `locais-data.js` (Local de estoque): usa `localStorage` de propósito,
// diferente de `produtos-data.js` (só em memória). Uma categoria nova,
// criada em "Novo produto", precisa continuar disponível em qualquer
// cadastro futuro, mesmo depois de recarregar a página.
window.NiveloCategorias = (function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.produtos.categorias';
  var DEFAULT_CATEGORIAS = ['Grãos', 'Sementes', 'Fertilizantes', 'Defensivos', 'Insumos'];

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(categorias) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias));
    } catch (e) {}
  }

  var CATEGORIAS = readStored();
  if (!CATEGORIAS || !CATEGORIAS.length) {
    CATEGORIAS = DEFAULT_CATEGORIAS.slice();
    writeStored(CATEGORIAS);
  }

  function list() {
    return CATEGORIAS;
  }

  function add(nome) {
    var trimmed = String(nome || '').trim();
    if (!trimmed) return null;
    if (CATEGORIAS.indexOf(trimmed) === -1) {
      CATEGORIAS.push(trimmed);
      writeStored(CATEGORIAS);
    }
    return trimmed;
  }

  return { list: list, add: add };
})();
