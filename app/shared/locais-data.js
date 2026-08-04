// Catálogo compartilhado de Locais de estoque (Depósito/Fazenda/Galpão) —
// diferente de `produtos-data.js` (só em memória, perdido ao recarregar,
// decisão já validada pros dados de estoque em si), este catálogo usa
// `localStorage` de propósito: um local novo, criado em "Novo registro de
// estoque", precisa continuar disponível em qualquer registro futuro,
// mesmo depois de recarregar a página — não é mutação de um registro de
// negócio, é só uma lista de referência compartilhada.
window.NiveloLocais = (function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.estoque.locais';
  var DEFAULT_LOCAIS = ['Fazenda Boa Vista', 'Fazenda São João', 'Armazém da Fazenda', 'Galpão 1'];

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeStored(locais) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locais));
    } catch (e) {}
  }

  var LOCAIS = readStored();
  if (!LOCAIS || !LOCAIS.length) {
    LOCAIS = DEFAULT_LOCAIS.slice();
    writeStored(LOCAIS);
  }

  function list() {
    return LOCAIS;
  }

  function add(nome) {
    var trimmed = String(nome || '').trim();
    if (!trimmed) return null;
    if (LOCAIS.indexOf(trimmed) === -1) {
      LOCAIS.push(trimmed);
      writeStored(LOCAIS);
    }
    return trimmed;
  }

  return { list: list, add: add };
})();
