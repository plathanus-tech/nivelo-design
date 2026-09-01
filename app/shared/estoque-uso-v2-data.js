// ---------- window.NiveloEstoqueUsoV2 ----------
// Fonte única do "Estoque de Uso" na V2 (ver CLAUDE.md — ajuste "Estoque de
// Uso, V2"), mesma convenção IIFE de estoque-vendas-v2-data.js/
// estoque-comprometido-v2-data.js. Antes desta rodada, Estoque de Uso não
// tinha tratamento V2 nenhum — a listagem (`estoque-v2.js`'s `renderCompras`)
// lia direto de `window.NiveloEstoqueCompras` (V1, `app/shared/
// estoque-compras-data.js`), onde cada linha era uma COMPRA isolada (ex.:
// 3 linhas "Adubo" com códigos CMP-001/004/005), não um PRODUTO com saldo
// agregado.
//
// Códigos: introduzidos NOVOS `USO-00N` (não reaproveitados os `CMP-00N` do
// V1) — decisão deliberada, documentada aqui: o V1 tinha 1 código por COMPRA
// (14 registros/3-5 compras por produto), o V2 tem 1 código por PRODUTO (5
// registros, saldo agregado com histórico de compras dentro) — não há
// mapeamento 1:1 entre os dois conjuntos de códigos, então manter os CMP-00N
// só confundiria (um único CMP-00N deixaria de existir como registro próprio
// e viraria uma ENTRADA dentro do histórico de outro produto).
// `estoque-compras-data.js` (V1) continua intocado/órfão, mesmo princípio já
// usado em `bancos-data.js`/`contas-pagar-data.js`'s `excluir()` — nenhuma
// tela carrega mais esse módulo depois desta rodada.
//
// Shape de cada produto:
// { codigo, produto, sku, unidadeMedidaSigla,
//   depositos: [{deposito, quantidade}], quantidade (soma de depositos),
//   custoMedio (média ponderada das entradas, R$/unidade),
//   ultimaCompra (ISO, data da entrada mais recente),
//   historico: [
//     { tipo:'entrada', data, fornecedor (nullable), deposito, quantidade,
//       precoUnitario (nullable), valorTotal (nullable), documento (nullable,
//       texto livre), observacao (nullable), saldoApos },
//     { tipo:'consumo', data, quantidade, fazendaId, fazendaNome, talhaoId,
//       talhaoNome, custo, observacao (nullable), saldoApos }
//   ] }
//
// Seed: os 5 produtos de `estoque-compras-data.js` (Adubo/Semente/Defensivo/
// Calcário/Fungicida), cada um agregando as 2-3 compras que já existiam lá
// num único registro por produto — `historico` reconstituído a partir
// dessas mesmas compras (mesmos fornecedores/preços/datas/depósitos), e
// `custoMedio` calculado como média ponderada por quantidade das entradas
// que TÊM preço informado (a compra original de Defensivo, CMP-003, nunca
// teve `valorUnitario` — mantido `null` nesta entrada, excluído do cálculo
// da média, mesma fidelidade ao dado original). Depósito de CMP-003 (também
// `null` no V1) foi atribuído a "Depósito Central" por simplificação
// (documentado aqui, já que o V2 exige uma quebra por depósito).
// `unidadeMedidaSigla` resolvida a partir do catálogo de Unidades de Medida
// pelo NOME livre já usado no V1 (`unidade: 'Saca'/'Kg'/'Litro'`), mesmo
// helper `siglaFromUnidadeNome` já usado em `estoque-v2.js` pra Comprometido
// — Calcário/Fungicida (`PRD-011`/`PRD-012`) não têm entrada no catálogo de
// Produtos (`produtos-data.js`, que só vai até `PRD-010`); `sku` desses 2 é
// mantido literal (vindo do V1) já que não há um catálogo real pra resolver.
//
// 2 entradas de CONSUMO adicionadas ao seed (Adubo e Defensivo), usando
// Fazenda/Talhão reais de `fazendas-data.js` — só pra a tela de "Ver
// detalhes" (histórico) não nascer vazia de consumo; nenhuma outra compra do
// V1 tinha consumo registrado.
(function () {
  'use strict';

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // Bug real corrigido: `siglaFromUnidadeNome('Kg')` batia só contra `nome`
  // do catálogo (ex. "Quilograma" pra sigla KG) — "Kg"/"Litro" (nomes livres
  // já usados no V1) não batem com "Quilograma", só "Litro" bate por
  // coincidência (nome real da unidade LT). Corrigido checando primeiro se
  // o texto já É uma sigla válida do catálogo (`findBySigla`, que normaliza
  // maiúscula/minúscula) antes de cair pro fallback por nome.
  function siglaFromUnidadeNome(nome) {
    if (!nome) return '';
    var bySigla = window.NiveloUnidadesMedida.findBySigla(nome);
    if (bySigla) return bySigla.sigla;
    var match = window.NiveloUnidadesMedida.list().filter(function (u) {
      return u.nome.toLowerCase() === String(nome).toLowerCase();
    })[0];
    return match ? match.sigla : nome;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  // ---------- Construção do seed a partir de compras (V1) ----------
  function buildProduto(codigo, nome, sku, unidadeNome, deposito, compras) {
    var sigla = siglaFromUnidadeNome(unidadeNome);
    var comprasOrdenadas = compras.slice().sort(function (a, b) { return a.data < b.data ? -1 : 1; });

    var quantidadeTotal = 0;
    var somaPonderada = 0;
    var quantidadePonderavel = 0;
    var ultimaCompra = comprasOrdenadas[comprasOrdenadas.length - 1].data;

    var historico = [];
    comprasOrdenadas.forEach(function (c) {
      quantidadeTotal += c.quantidade;
      if (c.valorUnitario != null) {
        somaPonderada += c.valorUnitario * c.quantidade;
        quantidadePonderavel += c.quantidade;
      }
      historico.push({
        tipo: 'entrada',
        data: c.data,
        fornecedor: c.fornecedor || null,
        deposito: c.deposito || deposito,
        quantidade: c.quantidade,
        precoUnitario: c.valorUnitario != null ? c.valorUnitario : null,
        valorTotal: c.valorUnitario != null ? round2(c.valorUnitario * c.quantidade) : null,
        documento: null,
        observacao: null,
        saldoApos: 0 // recalculado abaixo
      });
    });

    var acumulado = 0;
    historico.forEach(function (h) {
      acumulado += h.quantidade;
      h.saldoApos = acumulado;
    });

    var custoMedio = quantidadePonderavel > 0 ? round2(somaPonderada / quantidadePonderavel) : 0;

    return {
      codigo: codigo,
      produto: nome,
      sku: sku,
      unidadeMedidaSigla: sigla,
      depositos: [{ deposito: deposito, quantidade: quantidadeTotal }],
      quantidade: quantidadeTotal,
      custoMedio: custoMedio,
      ultimaCompra: ultimaCompra,
      historico: historico
    };
  }

  var USO = [
    buildProduto('USO-001', 'Adubo', 'PRD-006', 'Saca', 'Depósito Central', [
      { data: '2026-01-12', quantidade: 150, valorUnitario: 78, fornecedor: 'Agropecuária Bom Plantio', deposito: 'Depósito Central' },
      { data: '2026-03-18', quantidade: 180, valorUnitario: 92, fornecedor: 'Agropecuária Bom Plantio', deposito: 'Depósito Central' },
      { data: '2026-06-05', quantidade: 200, valorUnitario: 85, fornecedor: 'Agropecuária Bom Plantio', deposito: 'Depósito Central' }
    ]),
    buildProduto('USO-002', 'Semente', 'PRD-007', 'Kg', 'Depósito Norte', [
      { data: '2026-02-05', quantidade: 400, valorUnitario: 11, fornecedor: 'Sementes Vale Verde', deposito: 'Depósito Norte' },
      { data: '2026-04-22', quantidade: 350, valorUnitario: 13.2, fornecedor: 'Sementes Vale Verde', deposito: 'Depósito Norte' },
      { data: '2026-06-20', quantidade: 500, valorUnitario: 12.5, fornecedor: 'Sementes Vale Verde', deposito: 'Depósito Norte' }
    ]),
    buildProduto('USO-003', 'Defensivo', 'PRD-008', 'Litro', 'Depósito Central', [
      { data: '2026-01-25', quantidade: 80, valorUnitario: 45, fornecedor: 'Defensivos Rurais Ltda', deposito: 'Depósito Central' },
      { data: '2026-05-10', quantidade: 90, valorUnitario: 42, fornecedor: 'Defensivos Rurais Ltda', deposito: 'Depósito Central' },
      { data: '2026-07-08', quantidade: 100, valorUnitario: null, fornecedor: null, deposito: 'Depósito Central' }
    ]),
    buildProduto('USO-004', 'Calcário', 'PRD-011', 'Saca', 'Depósito Central', [
      { data: '2026-01-08', quantidade: 300, valorUnitario: 60, fornecedor: 'Calcários do Sul', deposito: 'Depósito Central' },
      { data: '2026-04-14', quantidade: 250, valorUnitario: 65, fornecedor: 'Calcários do Sul', deposito: 'Depósito Central' },
      { data: '2026-07-01', quantidade: 280, valorUnitario: 58, fornecedor: 'Calcários do Sul', deposito: 'Depósito Central' }
    ]),
    buildProduto('USO-005', 'Fungicida', 'PRD-012', 'Litro', 'Depósito Norte', [
      { data: '2026-02-20', quantidade: 60, valorUnitario: 38, fornecedor: 'Defensivos Rurais Ltda', deposito: 'Depósito Norte' },
      { data: '2026-06-10', quantidade: 55, valorUnitario: 41.5, fornecedor: 'Defensivos Rurais Ltda', deposito: 'Depósito Norte' }
    ])
  ];

  // ---------- Demo: 2 consumos seed (Adubo/Defensivo), pra o histórico da
  // tela de "Ver detalhes" já nascer com pelo menos 1 exemplo de cada tipo,
  // usando Fazenda/Talhão reais de fazendas-data.js. ----------
  (function seedDemoConsumo() {
    function consumir(produto, quantidade, data, fazendaId, talhaoId, observacao) {
      var fazenda = (window.NiveloFazendas && window.NiveloFazendas.findById && window.NiveloFazendas.findById(fazendaId)) || null;
      var talhao = fazenda ? fazenda.talhoes.filter(function (t) { return t.id === talhaoId; })[0] : null;
      var deposito = produto.depositos.slice().sort(function (a, b) { return b.quantidade - a.quantidade; })[0];
      if (deposito) deposito.quantidade -= quantidade;
      produto.quantidade -= quantidade;
      var custo = round2(produto.custoMedio * quantidade);
      var entry = {
        tipo: 'consumo',
        data: data,
        quantidade: quantidade,
        fazendaId: fazendaId,
        fazendaNome: fazenda ? fazenda.nome : null,
        talhaoId: talhaoId,
        talhaoNome: talhao ? talhao.nome : null,
        custo: custo,
        observacao: observacao || null,
        saldoApos: produto.quantidade
      };
      produto.historico.push(entry);
      return entry;
    }
    consumir(USO[0], 20, '2026-07-20', 'sao-joao', 't1', 'Adubação de cobertura');
    consumir(USO[2], 15, '2026-07-22', 'boa-esperanca', 't1', 'Aplicação preventiva');
  })();

  function list() {
    return USO;
  }

  function findByCodigo(codigo) {
    return USO.filter(function (u) { return u.codigo === codigo; })[0] || null;
  }

  function findDeposito(produto, nomeDeposito) {
    return produto.depositos.filter(function (d) { return d.deposito === nomeDeposito; })[0] || null;
  }

  // ---------- Registrar entrada ----------
  // payload: { data, deposito, fornecedor, quantidade, precoUnitario,
  //   documento (texto livre, nullable), observacao (nullable) }
  function registrarEntrada(codigo, payload) {
    var produto = findByCodigo(codigo);
    if (!produto) return null;
    var quantidade = Number(payload.quantidade) || 0;
    if (quantidade <= 0) return null;
    var precoUnitario = Number(payload.precoUnitario) || 0;

    var quantidadeAtual = produto.quantidade;
    var custoMedioAtual = produto.custoMedio;
    produto.custoMedio = quantidadeAtual > 0
      ? round2((custoMedioAtual * quantidadeAtual + precoUnitario * quantidade) / (quantidadeAtual + quantidade))
      : round2(precoUnitario);
    produto.ultimaCompra = payload.data || todayISO();

    var deposito = findDeposito(produto, payload.deposito);
    if (!deposito) {
      deposito = { deposito: payload.deposito, quantidade: 0 };
      produto.depositos.push(deposito);
    }
    deposito.quantidade += quantidade;
    produto.quantidade = produto.depositos.reduce(function (sum, d) { return sum + d.quantidade; }, 0);

    var entry = {
      tipo: 'entrada',
      data: payload.data || todayISO(),
      fornecedor: payload.fornecedor || null,
      deposito: payload.deposito,
      quantidade: quantidade,
      precoUnitario: precoUnitario,
      valorTotal: round2(quantidade * precoUnitario),
      documento: payload.documento || null,
      observacao: payload.observacao || null,
      saldoApos: produto.quantidade
    };
    produto.historico.push(entry);
    return entry;
  }

  // ---------- Registrar consumo ----------
  // payload: { quantidade, data, fazendaId, fazendaNome, talhaoId, talhaoNome,
  //   observacao (nullable) } — `custo` é calculado aqui (custoMedio ×
  // quantidade), nunca recebido de fora. Reduz do depósito com maior saldo —
  // simplificação documentada em CLAUDE.md (o fluxo de consumo não tem campo
  // de depósito de saída).
  function registrarConsumo(codigo, payload) {
    var produto = findByCodigo(codigo);
    if (!produto) return null;
    var quantidade = Number(payload.quantidade) || 0;
    if (!(quantidade > 0 && quantidade <= produto.quantidade)) return null;

    var deposito = produto.depositos.slice().sort(function (a, b) { return b.quantidade - a.quantidade; })[0];
    if (deposito) deposito.quantidade -= quantidade;
    produto.quantidade -= quantidade;

    var custo = round2(produto.custoMedio * quantidade);
    var entry = {
      tipo: 'consumo',
      data: payload.data || todayISO(),
      quantidade: quantidade,
      fazendaId: payload.fazendaId || null,
      fazendaNome: payload.fazendaNome || null,
      talhaoId: payload.talhaoId || null,
      talhaoNome: payload.talhaoNome || null,
      custo: custo,
      observacao: payload.observacao || null,
      saldoApos: produto.quantidade
    };
    produto.historico.push(entry);
    return entry;
  }

  // ---------- Ajustar estoque (idêntico ao de Vendas) ----------
  function ajustarEstoque(codigo, nomeDeposito, saldoConferido, observacao) {
    var produto = findByCodigo(codigo);
    if (!produto) return null;
    var deposito = findDeposito(produto, nomeDeposito);
    if (!deposito) {
      deposito = { deposito: nomeDeposito, quantidade: 0 };
      produto.depositos.push(deposito);
    }
    var saldoAnterior = deposito.quantidade;
    var novoSaldo = Number(saldoConferido);
    var diferenca = novoSaldo - saldoAnterior;

    deposito.quantidade = novoSaldo;
    produto.quantidade = produto.depositos.reduce(function (sum, d) { return sum + d.quantidade; }, 0);

    var entry = {
      tipo: 'ajuste',
      data: todayISO(),
      deposito: nomeDeposito,
      quantidade: diferenca,
      saldoApos: produto.quantidade,
      observacao: (observacao && observacao.trim()) || null
    };
    produto.historico.push(entry);
    return entry;
  }

  window.NiveloEstoqueUsoV2 = {
    list: list,
    findByCodigo: findByCodigo,
    registrarEntrada: registrarEntrada,
    registrarConsumo: registrarConsumo,
    ajustarEstoque: ajustarEstoque
  };
})();
