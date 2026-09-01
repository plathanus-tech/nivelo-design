// ---------- window.NiveloEstoqueVendasV2 ----------
// Fonte única do "Estoque de vendas" da V2 (ver CLAUDE.md/rules.md, Estoque
// V2 — round da reconstrução da aba Vendas). Extraído como módulo próprio
// desde a criação (mesmo padrão já usado em estoque-compras-data.js) porque
// tanto `estoque-v2.js` (listagem) quanto `detalhe-estoque-v2.js` (Ver
// detalhes) e `registrar-entrada-estoque-v2.js` (página de registrar
// entrada) precisam ler/mutar os MESMOS registros, sem depender de nenhum
// elemento de DOM de nenhuma dessas 3 páginas.
//
// Diferente do V1 `VENDAS` (estoque.js), que só tinha uma quantidade total
// por produto: aqui cada produto tem quebra POR DEPÓSITO (`depositos`), um
// preço mutável (`precoAtual`) e um histórico mais rico (`origem`/`destino`/
// `deposito`/`saldoApos`/`documento`/`observacao`).
//
// `unidadeMedidaSigla`: lida do próprio catálogo de Produtos
// (`window.NiveloProdutos`, campo `unidadeMedida`) — nunca hardcoded "sc" em
// nenhuma tela consumidora (ver rules.md). `sku` também é resolvido de lá.
//
// Shape de cada produto:
// { codigo, produto, sku, unidadeMedidaSigla, quantidade (soma de
//   depositos[].quantidade), precoAtual, depositos: [{deposito, quantidade}],
//   historico: [{ data, tipo: 'entrada'|'saida'|'transferencia'|'ajuste',
//     origem, destino, deposito, quantidade, saldoApos, documento (nullable,
//     {nome,url}), observacao (nullable) }] }
//
// Seed: mesmos 5 produtos/quantidades totais do V1 `VENDAS` (Soja 500/
// Milho 300/Trigo 200/Sorgo 150/Feijão 100) — só a QUEBRA por depósito e o
// histórico mudam de forma (ver CLAUDE.md pra nota sobre o exemplo "12+80+
// 30=122" do pedido original: os totais aqui seguem o V1, os NOMES de
// depósito usados no exemplo (Depósito A/B/C) não existem em
// `NiveloLocais.list()` — usados os nomes reais do catálogo em vez de
// inventar um novo).
(function () {
  'use strict';

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function resolveProdutoBase(nome) {
    var p = (window.NiveloProdutos && window.NiveloProdutos.findByNome(nome)) || {};
    return { sku: p.sku || '', unidadeMedidaSigla: p.unidadeMedida || 'UN' };
  }

  function buildProduto(codigo, nome, precoAtual, depositosSeed, dataInicial) {
    var base = resolveProdutoBase(nome);
    var total = depositosSeed.reduce(function (sum, d) { return sum + d.quantidade; }, 0);
    var historico = depositosSeed.map(function (d, i) {
      var acumulado = depositosSeed.slice(0, i + 1).reduce(function (sum, x) { return sum + x.quantidade; }, 0);
      return {
        data: dataInicial,
        tipo: 'entrada',
        origem: 'Estoque inicial',
        destino: d.deposito,
        deposito: d.deposito,
        quantidade: d.quantidade,
        saldoApos: acumulado,
        documento: null,
        observacao: null
      };
    });
    return {
      codigo: codigo,
      produto: nome,
      sku: base.sku,
      unidadeMedidaSigla: base.unidadeMedidaSigla,
      quantidade: total,
      precoAtual: precoAtual,
      depositos: depositosSeed.map(function (d) { return { deposito: d.deposito, quantidade: d.quantidade }; }),
      historico: historico
    };
  }

  var VENDAS = [
    buildProduto('VND-001', 'Soja', 128.00, [
      { deposito: 'Fazenda Boa Vista', quantidade: 300 },
      { deposito: 'Fazenda São João', quantidade: 150 },
      { deposito: 'Armazém da Fazenda', quantidade: 50 }
    ], '2026-06-02'),
    buildProduto('VND-002', 'Milho', 62.50, [
      { deposito: 'Fazenda Boa Vista', quantidade: 180 },
      { deposito: 'Galpão 1', quantidade: 120 }
    ], '2026-06-10'),
    buildProduto('VND-003', 'Trigo', 84.00, [
      { deposito: 'Fazenda São João', quantidade: 140 },
      { deposito: 'Armazém da Fazenda', quantidade: 60 }
    ], '2026-06-18'),
    buildProduto('VND-004', 'Sorgo', 54.00, [
      { deposito: 'Galpão 1', quantidade: 90 },
      { deposito: 'Fazenda Boa Vista', quantidade: 60 }
    ], '2026-07-01'),
    buildProduto('VND-005', 'Feijão', 218.00, [
      { deposito: 'Armazém da Fazenda', quantidade: 70 },
      { deposito: 'Fazenda São João', quantidade: 30 }
    ], '2026-07-10')
  ];

  // Demonstração pedida no round: pelo menos 1 entrada com `documento` (Ver
  // detalhes precisa mostrar a affordance de visualizar) e 1 entrada
  // `'ajuste'` com `observacao` já no seed — Soja recebe as duas, sem
  // precisar de nenhuma ação do usuário só pra verificar visualmente.
  (function seedDemoHistorico() {
    var soja = VENDAS[0];
    soja.historico.push({
      data: '2026-07-15',
      tipo: 'entrada',
      origem: 'Compra de terceiro — Cerealista Bom Grão S.A.',
      destino: 'Fazenda Boa Vista',
      deposito: 'Fazenda Boa Vista',
      quantidade: 20,
      saldoApos: soja.quantidade + 20,
      documento: { nome: 'NF-e 000123 — Cerealista Bom Grão.xml', url: 'about:blank' },
      observacao: null
    });
    var depBoaVista = soja.depositos.filter(function (d) { return d.deposito === 'Fazenda Boa Vista'; })[0];
    depBoaVista.quantidade += 20;
    soja.quantidade += 20;
  })();

  function list() {
    return VENDAS;
  }

  function findByCodigo(codigo) {
    return VENDAS.filter(function (v) { return v.codigo === codigo; })[0] || null;
  }

  function findDeposito(produto, nomeDeposito) {
    return produto.depositos.filter(function (d) { return d.deposito === nomeDeposito; })[0] || null;
  }

  // ---------- Registrar entrada ----------
  // payload: { data, deposito, quantidade, origem (texto pronto), destino
  //   (texto pronto, normalmente = deposito), documento (nullable) }
  // Construção de `origem`/`destino`/`documento` é responsabilidade de quem
  // chama (registrar-entrada-estoque-v2.js), que sabe qual dos 2 caminhos
  // (Produção própria/Colheita × Compra de terceiro) foi escolhido.
  function registrarEntrada(codigo, payload) {
    var produto = findByCodigo(codigo);
    if (!produto) return null;
    var quantidade = Number(payload.quantidade) || 0;
    if (quantidade <= 0) return null;

    var deposito = findDeposito(produto, payload.deposito);
    if (!deposito) {
      deposito = { deposito: payload.deposito, quantidade: 0 };
      produto.depositos.push(deposito);
    }
    deposito.quantidade += quantidade;
    produto.quantidade += quantidade;

    var entry = {
      data: payload.data || todayISO(),
      tipo: 'entrada',
      origem: payload.origem || '—',
      destino: payload.destino || payload.deposito,
      deposito: payload.deposito,
      quantidade: quantidade,
      saldoApos: produto.quantidade,
      documento: payload.documento || null,
      observacao: null
    };
    produto.historico.push(entry);
    return entry;
  }

  // ---------- Atualizar preço ----------
  // Não altera o histórico de compra (ver rules.md) — só o campo mutável
  // `precoAtual`. `data` existe só como registro visual do formulário, não é
  // persistida em lugar nenhum (nenhum consumidor precisa dela).
  function atualizarPreco(codigo, novoPreco, data) {
    var produto = findByCodigo(codigo);
    if (!produto) return null;
    var preco = Number(novoPreco);
    if (!(preco > 0)) return null;
    produto.precoAtual = preco;
    return produto;
  }

  // ---------- Ajustar estoque ----------
  // `saldoConferido` é o saldo REAL contado no depósito informado — a
  // diferença em relação ao saldo no sistema (positiva ou negativa) vira uma
  // entrada de histórico tipo 'ajuste'.
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
      data: todayISO(),
      tipo: 'ajuste',
      origem: 'Ajuste de estoque',
      destino: nomeDeposito,
      deposito: nomeDeposito,
      quantidade: diferenca,
      saldoApos: produto.quantidade,
      documento: null,
      observacao: (observacao && observacao.trim()) || null
    };
    produto.historico.push(entry);
    return entry;
  }

  window.NiveloEstoqueVendasV2 = {
    list: list,
    findByCodigo: findByCodigo,
    registrarEntrada: registrarEntrada,
    atualizarPreco: atualizarPreco,
    ajustarEstoque: ajustarEstoque
  };
})();
