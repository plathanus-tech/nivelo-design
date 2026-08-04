// Catálogo compartilhado de Safras — mesmo padrão de `categorias-data.js`
// (Categoria de Produto): usa `localStorage` de propósito, diferente de
// `fazendas-data.js`/`caderno-data.js` (só sessionStorage/memória). Uma
// safra nova, criada em "Nova anotação", precisa continuar disponível em
// qualquer anotação futura, mesmo depois de recarregar a página.
window.NiveloSafras = (function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.caderno.safras';
  var DEFAULT_SAFRAS = ['2024/25', '2025/26', '2026/27', '2027/28'];

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(safras) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safras));
    } catch (e) {}
  }

  var SAFRAS = readStored();
  if (!SAFRAS || !SAFRAS.length) {
    SAFRAS = DEFAULT_SAFRAS.slice();
    writeStored(SAFRAS);
  }

  function list() {
    return SAFRAS;
  }

  function add(nome) {
    var trimmed = String(nome || '').trim();
    if (!trimmed) return null;
    if (SAFRAS.indexOf(trimmed) === -1) {
      SAFRAS.push(trimmed);
      writeStored(SAFRAS);
    }
    return trimmed;
  }

  return { list: list, add: add };
})();
