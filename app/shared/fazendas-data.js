// Catálogo central de Fazendas (Configuração > Cadastro de fazenda). Mesma
// convenção IIFE `window.NiveloX` já usada em produtos-data.js/
// cadastros-data.js/locais-data.js. Nomes das 3 fazendas seed reaproveitados
// de propósito do seletor "Fazenda" do Dashboard (`dashboard.js`'s `FARMS`:
// São João/Santa Rita/Boa Esperança) só pra consistência de nome entre
// telas — cópia de dado independente, sem import cruzado entre arquivos.
//
// `talhoes`: lista de talhões vinculados a cada fazenda, compartilhada pelas
// DUAS telas de "Detalhe da fazenda" que existem no sistema — a operacional
// (`fazenda-detalhe.html`, Jornada · Caderno de Campo) e a cadastral
// (`fazenda-detalhe-cadastro.html`, Jornada · Fazendas). O total de talhões
// mostrado tanto no card da Listagem quanto no indicador "Talhões" do Resumo
// operacional é sempre `talhoes.length` — uma única fonte pra esse número,
// sem contagem duplicada. Por isso os valores de área de cada talhão de uma
// fazenda somam exatamente a área total dela (`areaHa`). `status` pode ser
// `'em-producao'`, `'disponivel'` ou `'em-pousio'` — usado só pela tela
// OPERACIONAL (`fazenda-detalhe.js`), sobre o estágio da lavoura.
//
// `ativo` (boolean) é um campo DIFERENTE e independente de `status`: é o
// estado de ativação/desativação do talhão, usado só pela tela CADASTRAL
// (`fazenda-detalhe-cadastro.js` — round 2026-07-29). Deliberadamente
// aditivo/paralelo a `status`, não uma migração dele — um talhão pode estar
// "em pousio" (status) e ainda assim "ativo" (cadastro continua válido). Não
// remover `status` nem seus 3 valores: a tela operacional depende deles.
//
// Campos cadastrais (`codigo`, `proprietario`, `cnpj`, `inscricaoEstadual`,
// `matricula`, `enderecoCompleto`, `latitude`, `longitude`,
// `areaAgricultura`, `arrendamento`) são usados só pela tela cadastral.
// `arrendamento` é opcional de propósito — só a Santa Rita tem, pra
// demonstrar o caso "exibir apenas quando houver informação cadastrada".
window.NiveloFazendas = (function () {
  'use strict';

  var FAZENDAS = [
    {
      id: 'sao-joao', nome: 'Fazenda São João', cidade: 'Tijucas', estado: 'SC',
      areaHa: 125, atualizadoEm: '2026-07-28',
      culturaAtual: 'Soja', safraAtual: '2026/27',
      codigo: '0001', proprietario: 'João Machado', cnpj: '12.345.678/0001-90',
      inscricaoEstadual: '123.456.789.112', matricula: '45.678',
      enderecoCompleto: 'Estrada Geral do Rio Formoso, s/n, Zona Rural, Tijucas - SC, CEP 88200-000',
      latitude: '-27.2400', longitude: '-48.6350', areaAgricultura: 98,
      arrendamento: null,
      talhoes: [
        { id: 't1', codigo: '001', nome: 'Talhão 01', areaHa: 18, cultura: 'Soja', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't2', codigo: '002', nome: 'Talhão 02', areaHa: 24, cultura: 'Milho', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't3', codigo: '003', nome: 'Talhão 03', areaHa: 12, cultura: null, safra: null, status: 'disponivel', ativo: true },
        { id: 't4', codigo: '004', nome: 'Talhão 04', areaHa: 15, cultura: 'Soja', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't5', codigo: '005', nome: 'Talhão 05', areaHa: 10, cultura: null, safra: null, status: 'em-pousio', ativo: true },
        { id: 't6', codigo: '006', nome: 'Talhão 06', areaHa: 20, cultura: 'Milho', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't7', codigo: '007', nome: 'Talhão 07', areaHa: 14, cultura: 'Soja', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't8', codigo: '008', nome: 'Talhão 08', areaHa: 12, cultura: null, safra: null, status: 'disponivel', ativo: false }
      ]
    },
    {
      id: 'santa-rita', nome: 'Fazenda Santa Rita', cidade: 'Ribeirão Preto', estado: 'SP',
      areaHa: 340, atualizadoEm: '2026-07-15',
      culturaAtual: 'Cana-de-açúcar', safraAtual: '2026/27',
      codigo: '0002', proprietario: 'Ricardo Andrade Neto', cnpj: '23.456.789/0001-11',
      inscricaoEstadual: '234.567.890.113', matricula: '78.912',
      enderecoCompleto: 'Rodovia SP-333, Km 12, Zona Rural, Ribeirão Preto - SP, CEP 14000-000',
      latitude: '-21.1775', longitude: '-47.8103', areaAgricultura: 290,
      arrendamento: { arrendatario: 'Cooperativa Central do Agro Ltda.', areaHa: 40, vigencia: '01/03/2024 a 01/03/2029' },
      talhoes: [
        { id: 't1', codigo: '001', nome: 'Talhão 01', areaHa: 80, cultura: 'Cana-de-açúcar', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't2', codigo: '002', nome: 'Talhão 02', areaHa: 65, cultura: 'Milho', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't3', codigo: '003', nome: 'Talhão 03', areaHa: 50, cultura: 'Soja', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't4', codigo: '004', nome: 'Talhão 04', areaHa: 40, cultura: null, safra: null, status: 'disponivel', ativo: true },
        { id: 't5', codigo: '005', nome: 'Talhão 05', areaHa: 35, cultura: null, safra: null, status: 'disponivel', ativo: false }
      ]
    },
    {
      id: 'boa-esperanca', nome: 'Fazenda Boa Esperança', cidade: 'Rio Verde', estado: 'GO',
      areaHa: 62, atualizadoEm: '2026-06-30',
      culturaAtual: 'Café', safraAtual: '2026/27',
      codigo: '0003', proprietario: 'Marta Souza Lima', cnpj: '34.567.890/0001-22',
      inscricaoEstadual: '345.678.901.114', matricula: '12.345',
      enderecoCompleto: 'Fazenda Boa Esperança, Zona Rural, Rio Verde - GO, CEP 75900-000',
      latitude: '-17.7975', longitude: '-50.9264', areaAgricultura: 45,
      arrendamento: null,
      talhoes: [
        { id: 't1', codigo: '001', nome: 'Talhão 01', areaHa: 22, cultura: 'Café', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't2', codigo: '002', nome: 'Talhão 02', areaHa: 18, cultura: 'Café', safra: '2026/27', status: 'em-producao', ativo: true },
        { id: 't3', codigo: '003', nome: 'Talhão 03', areaHa: 12, cultura: null, safra: null, status: 'disponivel', ativo: true },
        { id: 't4', codigo: '004', nome: 'Talhão 04', areaHa: 10, cultura: null, safra: null, status: 'disponivel', ativo: false }
      ]
    }
  ];

  // ---------- Persistência entre páginas (sessionStorage) ----------
  // Fazendas cadastradas pelo wizard (nova-fazenda.js) precisam sobreviver a
  // uma navegação real de página — cada tela recarrega este script do zero,
  // então sem isso a fazenda "sumia" ao navegar pra fazendas.html/
  // fazenda-detalhe-cadastro.html. Guarda só as fazendas CRIADAS na sessão
  // (não duplica o seed) — sessionStorage de propósito, não localStorage,
  // consistente com o resto do protótipo (nada persiste entre sessões/abas
  // fechadas de verdade).
  var SESSION_KEY = 'nivelo.fazendas.criadas';

  (function loadPersisted() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(function (f) { FAZENDAS.push(f); });
    } catch (e) {}
  })();

  function persist(farm) {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      var criadas = raw ? JSON.parse(raw) : [];
      criadas.push(farm);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(criadas));
    } catch (e) {}
  }

  // Edições (via `update()`, ver "Editar fazenda") também precisam
  // sobreviver a uma navegação real de página — mesmo motivo de `persist()`
  // acima, mas guardadas separadamente: um mapa `{id: patch}` reaplicado por
  // cima do array (seed + criadas) a cada load, em vez de duplicar a
  // fazenda inteira. Funciona igual pra fazendas seed e pra criadas nesta
  // mesma sessão.
  var EDITS_KEY = 'nivelo.fazendas.editadas';

  function persistEdit(id, patch) {
    try {
      var raw = sessionStorage.getItem(EDITS_KEY);
      var edits = raw ? JSON.parse(raw) : {};
      edits[id] = Object.assign(edits[id] || {}, patch);
      sessionStorage.setItem(EDITS_KEY, JSON.stringify(edits));
    } catch (e) {}
  }

  (function loadEdits() {
    try {
      var raw = sessionStorage.getItem(EDITS_KEY);
      if (!raw) return;
      var edits = JSON.parse(raw);
      Object.keys(edits).forEach(function (id) {
        var f = findById(id);
        if (f) Object.assign(f, edits[id]);
      });
    } catch (e) {}
  })();

  function list() {
    return FAZENDAS;
  }

  function findById(id) {
    return FAZENDAS.filter(function (f) { return f.id === id; })[0] || null;
  }

  // Código sequencial (mesmo algoritmo de `nextCodigo()` do talhão em
  // fazenda-detalhe-cadastro.js), zero-padded a 4 dígitos (mesmo formato das
  // 3 fazendas seed: '0001'/'0002'/'0003').
  function nextCodigo() {
    var max = FAZENDAS.reduce(function (acc, f) {
      var n = parseInt(f.codigo, 10);
      return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    var padded = String(max + 1);
    while (padded.length < 4) padded = '0' + padded;
    return padded;
  }

  function slugify(nome) {
    return nome
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'fazenda';
  }

  // Usado pelo fluxo de "Cadastro de Nova Fazenda" (nova-fazenda.html/js).
  // `id` é gerado a partir do nome (slug), com sufixo numérico se colidir com
  // uma fazenda já existente. Não sobrescreve/recalcula nenhum campo de
  // fazendas já cadastradas.
  function add(farm) {
    var baseId = slugify(farm.nome);
    var id = baseId;
    var suffix = 2;
    while (findById(id)) {
      id = baseId + '-' + suffix;
      suffix++;
    }
    var novaFazenda = Object.assign({ id: id, codigo: nextCodigo() }, farm);
    FAZENDAS.push(novaFazenda);
    persist(novaFazenda);
    return novaFazenda;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // Usado pelo fluxo de "Editar fazenda" (nova-fazenda.html?id=...). Nunca
  // toca em `talhoes` — a edição de talhões continua exclusiva da tabela
  // dedicada em fazenda-detalhe-cadastro.js, então `patch` nunca inclui essa
  // chave (ver nova-fazenda.js).
  function update(id, patch) {
    var farm = findById(id);
    if (!farm) return null;
    Object.assign(farm, patch, { atualizadoEm: todayISO() });
    persistEdit(id, Object.assign({}, patch, { atualizadoEm: farm.atualizadoEm }));
    return farm;
  }

  return { list: list, findById: findById, add: add, update: update };
})();
