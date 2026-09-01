// Catálogo compartilhado de Locais de estoque (Depósito/Fazenda/Galpão) —
// diferente de `produtos-data.js` (só em memória, perdido ao recarregar,
// decisão já validada pros dados de estoque em si), este catálogo usa
// `localStorage` de propósito: um local novo, criado em "Novo registro de
// estoque", precisa continuar disponível em qualquer registro futuro,
// mesmo depois de recarregar a página — não é mutação de um registro de
// negócio, é só uma lista de referência compartilhada.
//
// Round 2026-08 (extensão): cada item passou de string pura pra objeto
// `{nome, tipo, fazendaId, uso, ativo}`. Migração dos 4 seeds originais (as
// mesmas strings de sempre, com defaults plausíveis, documentados aqui):
// - 'Fazenda Boa Vista'/'Fazenda São João': tipo 'Silo próprio' (nomes de
//   fazenda sugerem estrutura própria na propriedade).
// - 'Armazém da Fazenda'/'Galpão 1': tipo 'Depósito de produtos' (galpão/
//   armazém genérico).
// - Todos: uso 'Ambos' (não há informação prévia pra restringir), ativo
//   true, fazendaId null (nenhum vínculo com fazenda tinha sido
//   estabelecido até aqui — ver `window.NiveloFazendas`).
//
// API aditiva: `list()`/`add(nome)` continuam com a MESMA assinatura e
// comportamento de antes (dedupe por nome, persistência na mesma chave de
// localStorage) — usados hoje pelo quick-create inline de
// `novo-estoque.js`/`novo-pedido-venda.js` (V1/equivalente), que a pedido
// explícito do usuário NÃO tiveram esse fluxo removido. `add(nome)` sempre
// cria um registro mínimo `{nome, tipo:'Depósito de produtos',
// fazendaId:null, uso:'Ambos', ativo:true}` — sem essas telas saberem (nem
// precisarem saber) da forma rica do objeto.
window.NiveloLocais = (function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.estoque.locais';
  var DEFAULT_LOCAIS = [
    { nome: 'Fazenda Boa Vista', tipo: 'Silo próprio', fazendaId: null, uso: 'Ambos', ativo: true },
    { nome: 'Fazenda São João', tipo: 'Silo próprio', fazendaId: null, uso: 'Ambos', ativo: true },
    { nome: 'Armazém da Fazenda', tipo: 'Depósito de produtos', fazendaId: null, uso: 'Ambos', ativo: true },
    { nome: 'Galpão 1', tipo: 'Depósito de produtos', fazendaId: null, uso: 'Ambos', ativo: true }
  ];

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
  // Guard de compatibilidade: se o localStorage ainda tiver o formato antigo
  // (array de strings, de uma sessão anterior a esta migração), descarta e
  // recria com os seeds ricos — este é um protótipo sem dado real de
  // usuário persistido, então não há necessidade de um script de migração.
  if (!LOCAIS || !LOCAIS.length || typeof LOCAIS[0] === 'string') {
    LOCAIS = DEFAULT_LOCAIS.slice();
    writeStored(LOCAIS);
  }

  function list() {
    return LOCAIS;
  }

  function findByNome(nome) {
    return LOCAIS.filter(function (l) { return l.nome === nome; })[0] || null;
  }

  function add(nome) {
    var trimmed = String(nome || '').trim();
    if (!trimmed) return null;
    var existing = findByNome(trimmed);
    if (!existing) {
      LOCAIS.push({ nome: trimmed, tipo: 'Depósito de produtos', fazendaId: null, uso: 'Ambos', ativo: true });
      writeStored(LOCAIS);
    }
    return trimmed;
  }

  function isNomeDuplicado(nome, ignorarNome) {
    var alvo = String(nome || '').trim().toLowerCase();
    return LOCAIS.some(function (l) {
      if (ignorarNome && l.nome === ignorarNome) return false;
      return l.nome.trim().toLowerCase() === alvo;
    });
  }

  function addCompleto(dados) {
    var nome = String((dados && dados.nome) || '').trim();
    if (!nome || isNomeDuplicado(nome)) return null;
    var registro = {
      nome: nome,
      tipo: dados.tipo || 'Depósito de produtos',
      fazendaId: dados.fazendaId || null,
      uso: dados.uso || 'Ambos',
      ativo: dados.ativo !== false
    };
    LOCAIS.push(registro);
    writeStored(LOCAIS);
    return registro;
  }

  function update(nomeOriginal, patch) {
    var registro = findByNome(nomeOriginal);
    if (!registro) return null;
    if (patch && patch.nome && patch.nome.trim() !== nomeOriginal) {
      if (isNomeDuplicado(patch.nome, nomeOriginal)) return null;
    }
    Object.assign(registro, patch);
    if (registro.nome) registro.nome = String(registro.nome).trim();
    writeStored(LOCAIS);
    return registro;
  }

  function toggleAtivo(nome) {
    var registro = findByNome(nome);
    if (!registro) return null;
    registro.ativo = !registro.ativo;
    writeStored(LOCAIS);
    return registro;
  }

  return {
    list: list,
    add: add,
    findByNome: findByNome,
    addCompleto: addCompleto,
    update: update,
    toggleAtivo: toggleAtivo
  };
})();
