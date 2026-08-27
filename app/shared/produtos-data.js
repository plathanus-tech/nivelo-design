// Catálogo central de Produtos — antes vivia duplicado só dentro de
// novo-estoque.js; centralizado aqui porque as regras desta rodada (ver
// app/rules.md, "Estoque") exigem que Produto SEMPRE venha de uma única
// fonte, nunca duplicado por tela. A tela de gestão de Produtos (ver
// app/screens/produtos.html) lê direto deste mesmo array/arquivo.
//
// Campos `nome`/`unidade`/`sku` existem desde a criação deste arquivo (ver
// `novo-estoque.js`/`estoque.js`/`detalhe-estoque.js`, que já os consomem) —
// `sku` é o "Código" auto-incremento (formato `PRD-NNN`), nunca renomeado
// aqui. Os campos abaixo foram ACRESCENTADOS pra tela de Produtos, sem
// remover/renomear nenhum campo existente:
// - `codigoReferencia`: SKU de verdade digitado pelo usuário ("Código
//   Referência (SKU)" no formulário) — conceito distinto do `sku` interno.
// - `unidadeMedida`/`unidadeVolume`: vocabulário novo (CX/UN/KG/LT/PT/FR/SC)
//   pedido pra tela de Produtos, deliberadamente separado do `unidade`
//   existente (Saca/Kg/Litro/Unidade) que continua servindo só o combobox
//   de Produto do Estoque — dois vocabulários coexistindo de propósito,
//   nenhum substitui o outro.
// - `estoqueAtual`: número mockado isolado (decisão confirmada com o
//   usuário) — não cruza com os dados internos de `estoque.js`.
//
// Campos acrescentados pra Produtos V2 (ver produtos-v2.html/novo-produto-v2.html):
// - `tipoProduto` ('venda'/'uso'): dirige as 2 abas da listagem V2 e as
//   seções condicionais do formulário V2 (Dados Fiscais × Entrada Inicial no
//   Estoque). Aditivo — V1 não lê esse campo.
// - `ativo` (boolean): NOVO campo, independente de `status` (que continua
//   com seu significado original — ativo/cancelado/bloqueado, lido por V1 e
//   por qualquer outro consumidor existente). V2 introduz Ativar/Desativar
//   como ação de linha (pedido explícito do spec), mas criar esse
//   comportamento sobre `status` mudaria o significado de um campo que
//   outras telas já leem — por isso um campo novo, só consumido pela
//   listagem V2 (`toggleAtivo()` abaixo).
// - `gtin`: GTIN/EAN, só relevante pra "Produtos de venda" (coluna V2).
window.NiveloProdutos = (function () {
  'use strict';

  var PRODUTOS = [
    { nome: 'Soja', unidade: 'Saca', sku: 'PRD-001', codigoReferencia: 'REF-SOJA-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '1201.90.00', gtin: '7891234567895', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 200, qtdMaxima: 3000, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 1250, atualizadoEm: '2026-07-20' },
    { nome: 'Milho', unidade: 'Saca', sku: 'PRD-002', codigoReferencia: 'REF-MILHO-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '1005.90.10', gtin: '7891234567901', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 300, qtdMaxima: 4000, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 980, atualizadoEm: '2026-07-18' },
    { nome: 'Trigo', unidade: 'Saca', sku: 'PRD-003', codigoReferencia: 'REF-TRIGO-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '1001.99.00', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 100, qtdMaxima: 1500, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 430, atualizadoEm: '2026-07-10' },
    { nome: 'Sorgo', unidade: 'Saca', sku: 'PRD-004', codigoReferencia: 'REF-SORGO-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '1007.90.00', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 100, qtdMaxima: 1200, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 210, atualizadoEm: '2026-06-30' },
    { nome: 'Feijão', unidade: 'Saca', sku: 'PRD-005', codigoReferencia: 'REF-FEIJAO-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '0713.33.19', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 50, qtdMaxima: 600, status: 'cancelado', tipoProduto: 'venda', ativo: false, estoqueAtual: 0, atualizadoEm: '2026-05-15' },
    { nome: 'Adubo', unidade: 'Saca', sku: 'PRD-006', codigoReferencia: 'REF-ADUBO-01', categoria: 'Fertilizantes', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '3105.20.00', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 50, pesoBruto: 50.5, unidadeVolume: 'KG', fatorConversao: 50, controlaEstoque: true, qtdMinima: 100, qtdMaxima: 2000, status: 'ativo', tipoProduto: 'uso', ativo: true, estoqueAtual: 640, atualizadoEm: '2026-07-22' },
    { nome: 'Semente', unidade: 'Kg', sku: 'PRD-007', codigoReferencia: 'REF-SEMENTE-01', categoria: 'Sementes', origemIcms: '0', unidadeMedida: 'KG', cest: '', ncm: '1209.91.80', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 1, pesoBruto: 1.05, unidadeVolume: 'KG', fatorConversao: 1, controlaEstoque: true, qtdMinima: 50, qtdMaxima: 800, status: 'bloqueado', tipoProduto: 'uso', ativo: false, estoqueAtual: 120, atualizadoEm: '2026-04-02' },
    { nome: 'Defensivo', unidade: 'Litro', sku: 'PRD-008', codigoReferencia: 'REF-DEFENSIVO-01', categoria: 'Defensivos', origemIcms: '2', unidadeMedida: 'LT', cest: '20.038.00', ncm: '3808.93.99', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 1, pesoBruto: 1.2, unidadeVolume: 'LT', fatorConversao: 1, controlaEstoque: false, qtdMinima: null, qtdMaxima: null, status: 'ativo', tipoProduto: 'uso', ativo: true, estoqueAtual: 75, atualizadoEm: '2026-07-25' },
    // Café/Cana-de-açúcar acrescentados no round 42 (Caderno de Campo, campo
    // Cultura da Nova Anotação) — já eram usados como `talhao.cultura` em
    // fazendas-data.js (Santa Rita/Boa Esperança) só como texto solto, sem
    // existir de verdade no catálogo. `categoria:'Grãos'` é uma simplificação
    // deliberada (nenhum dos dois é botanicamente um grão) pra não introduzir
    // uma categoria nova só pra 2 itens — mesmo raciocínio de "reaproveitar
    // em vez de inventar" já aplicado no resto do projeto.
    { nome: 'Café', unidade: 'Saca', sku: 'PRD-009', codigoReferencia: 'REF-CAFE-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'SC', cest: '', ncm: '0901.11.10', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 60, pesoBruto: 60.5, unidadeVolume: 'KG', fatorConversao: 60, controlaEstoque: true, qtdMinima: 50, qtdMaxima: 1000, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 0, atualizadoEm: '2026-07-31' },
    { nome: 'Cana-de-açúcar', unidade: 'Kg', sku: 'PRD-010', codigoReferencia: 'REF-CANA-01', categoria: 'Grãos', origemIcms: '0', unidadeMedida: 'KG', cest: '', ncm: '1212.93.00', gtin: '', altura: null, largura: null, comprimento: null, pesoLiquido: 1, pesoBruto: 1, unidadeVolume: 'KG', fatorConversao: 1, controlaEstoque: true, qtdMinima: null, qtdMaxima: null, status: 'ativo', tipoProduto: 'venda', ativo: true, estoqueAtual: 0, atualizadoEm: '2026-07-31' }
  ];
  var seq = PRODUTOS.length;

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return String(text).normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
  }

  function list() {
    return PRODUTOS;
  }

  function findByNome(nome) {
    var normalized = normalize(nome || '');
    return PRODUTOS.filter(function (p) { return normalize(p.nome) === normalized; })[0];
  }

  function findBySku(sku) {
    return PRODUTOS.filter(function (p) { return p.sku === sku; })[0];
  }

  function add(product) {
    seq += 1;
    var stored = {
      nome: product.nome,
      unidade: product.unidade,
      sku: product.sku || ('PRD-' + String(seq).padStart(3, '0')),
      codigoReferencia: product.codigoReferencia || '',
      categoria: product.categoria || '',
      origemIcms: product.origemIcms || '',
      unidadeMedida: product.unidadeMedida || '',
      cest: product.cest || '',
      ncm: product.ncm || '',
      altura: product.altura != null ? product.altura : null,
      largura: product.largura != null ? product.largura : null,
      comprimento: product.comprimento != null ? product.comprimento : null,
      pesoLiquido: product.pesoLiquido != null ? product.pesoLiquido : null,
      pesoBruto: product.pesoBruto != null ? product.pesoBruto : null,
      unidadeVolume: product.unidadeVolume || '',
      fatorConversao: product.fatorConversao != null ? product.fatorConversao : null,
      controlaEstoque: !!product.controlaEstoque,
      qtdMinima: product.controlaEstoque && product.qtdMinima != null ? product.qtdMinima : null,
      qtdMaxima: product.controlaEstoque && product.qtdMaxima != null ? product.qtdMaxima : null,
      status: product.status || 'ativo',
      tipoProduto: product.tipoProduto === 'uso' ? 'uso' : 'venda',
      gtin: product.gtin || '',
      ativo: product.ativo !== false,
      estoqueAtual: product.estoqueAtual != null ? product.estoqueAtual : 0,
      atualizadoEm: product.atualizadoEm || todayISO()
    };
    PRODUTOS.push(stored);
    return stored;
  }

  function update(sku, patch) {
    var product = findBySku(sku);
    if (!product) return null;
    Object.keys(patch).forEach(function (key) { product[key] = patch[key]; });
    product.atualizadoEm = todayISO();
    return product;
  }

  // ---------- Ativar/Desativar (V2) ----------
  // Campo `ativo` independente de `status` — ver comentário no topo do
  // arquivo. Usado só pela listagem V2 (produtos-v2.html/.js).
  function toggleAtivo(sku) {
    var product = findBySku(sku);
    if (!product) return null;
    product.ativo = !product.ativo;
    product.atualizadoEm = todayISO();
    return product;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  return { list: list, findByNome: findByNome, findBySku: findBySku, add: add, update: update, toggleAtivo: toggleAtivo };
})();
