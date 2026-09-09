// Catálogo compartilhado de Safras — mesmo padrão de `categorias-data.js`
// (Categoria de Produto): usa `localStorage` de propósito, diferente de
// `fazendas-data.js`/`caderno-data.js` (só sessionStorage/memória). Uma
// safra nova, criada em "Nova anotação", precisa continuar disponível em
// qualquer anotação futura, mesmo depois de recarregar a página.
window.NiveloSafras = (function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.caderno.safras';
  // Formato abreviado (no máximo 4 dígitos, ex. "24/25" ou um ano cheio
  // como "2026") — pedido explícito do usuário, mesmo padrão que "Nova
  // safra" já aceita livremente (o campo é texto livre, este catálogo só
  // preenche o valor inicial/semente).
  var DEFAULT_SAFRAS = ['24/25', '25/26', '26/27', '27/28'];

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

  // Migração de formato: `localStorage` de sessões/testes anteriores a este
  // round pode ter safras salvas no formato antigo (`"2024/25"`, ano cheio
  // dos 2 lados) — sem isso, mudar só `DEFAULT_SAFRAS` acima nunca teria
  // efeito pra quem já tem QUALQUER coisa gravada (`readStored()` sempre
  // prioriza o que já existe). Normaliza só o padrão "ano cheio/ano
  // abreviado" (`\d{4}/\d{2}`) pro formato abreviado pedido
  // (`\d{2}/\d{2}`) — nunca mexe em "2026" (ano cheio sozinho, formato
  // válido) nem em nomes já customizados pelo usuário.
  var FULL_YEAR_RANGE_RE = /^(\d{2})(\d{2})\/(\d{2})$/;
  function normalizeSafra(nome) {
    var match = FULL_YEAR_RANGE_RE.exec(nome);
    return match ? (match[2] + '/' + match[3]) : nome;
  }
  function migrateFormat(safras) {
    var seen = {};
    var migrated = [];
    var changed = false;
    safras.forEach(function (nome) {
      var normalized = normalizeSafra(nome);
      if (normalized !== nome) changed = true;
      if (!seen[normalized]) {
        seen[normalized] = true;
        migrated.push(normalized);
      } else {
        changed = true; // normalização colidiu com uma safra já existente — descarta o duplicado
      }
    });
    return changed ? migrated : safras;
  }

  var SAFRAS = readStored();
  if (!SAFRAS || !SAFRAS.length) {
    SAFRAS = DEFAULT_SAFRAS.slice();
    writeStored(SAFRAS);
  } else {
    var migrated = migrateFormat(SAFRAS);
    if (migrated !== SAFRAS) {
      SAFRAS = migrated;
      writeStored(SAFRAS);
    }
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
