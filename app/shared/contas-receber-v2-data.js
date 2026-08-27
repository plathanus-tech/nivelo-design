/* ══════════════════════════════════════════════════════════
   window.NiveloContasReceberV2 — catálogo central das contas a receber,
   V2 da tela (Financeiro > Contas a receber). Coexiste com
   `window.NiveloContasReceber` (V1, contas-receber-data.js) — arquivo
   próprio e independente, nenhum import cruzado, seguindo a mesma
   convenção já usada em outras coexistências deste projeto (`natureza-
   operacao-data.js` × `naturezas-operacao-data.js`). V1 permanece 100%
   intacta; esta é a evolução pedida explicitamente pelo usuário,
   mantendo as duas versões disponíveis lado a lado.

   Principal diferença estrutural pra V1: um título pode ter MÚLTIPLOS
   recebimentos (parciais, em bancos diferentes, cada um com seu próprio
   desconto) — em vez de um único par `saldo`/`recebido` atualizado por
   uma chamada só, o título guarda o array `recebimentos` completo e
   `saldo`/`recebido`/`desconto` são sempre DERIVADOS dele.

   Cada título: {
     codigo,                  // 'CTR-0001' — auto-gerado, sequencial, nunca editável
     origem,                  // 'manual' | 'nota-fiscal' | 'pedido'
     origemReferencia,        // número da nota fiscal/pedido de origem, ou null (manual)
     clienteCodigo, clienteNome, clienteDocumento,
     formaRecebimentoCodigo, formaRecebimentoNome, // NiveloFormasRecebimento — sugestão,
                               // o recebimento em si pode usar outra forma
     vencimento,               // 'AAAA-MM-DD'
     dataEmissao,              // 'AAAA-MM-DD'
     valor,                    // number, sempre positivo — valor ORIGINAL do título,
                               // nunca alterado por um recebimento
     numeroDocumento, historico,
     categoriaCodigo,          // NiveloCategoriasFinanceiras — pode faltar em títulos
                               // vindos de Nota Fiscal/Pedido (nenhum dos dois carrega
                               // essa classificação); nesse caso é preenchida no momento
                               // do primeiro recebimento (ver `registrarRecebimento`)
     ocorrencia, numeroParcelas, parcelaAtual, parcelaTotal, grupoParcelamento, diaVencimento,
     status,                   // 'emitida' | 'em-aberto' | 'recebida' | 'atrasada' | 'cancelada'
     recebimentos              // [{ id, data, valor, desconto, contaBancariaCodigo,
                               //    bancoLabel, formaRecebimentoCodigo, categoriaCodigo,
                               //    criadoEm }] — cada recebimento é um evento imutável
   }

   Totais derivados (nunca gravados, sempre recalculados a partir de
   `recebimentos`): totalRecebido, totalDesconto, saldo = valor -
   totalRecebido - totalDesconto. Regra do pedido: "quanto foi
   originalmente cobrado / quanto foi concedido de desconto / quanto
   efetivamente foi recebido" precisam ficar visíveis separadamente —
   por isso o desconto NUNCA é subtraído do `valor` original, só do
   saldo em aberto.

   Integração com Caixa (fluxo completo do pedido: Nota Fiscal/Pedido →
   Contas a Receber → Registrar Recebimento → Banco/Conta → Caixa):
   `registrarRecebimento()` cria, além do recebimento em si, um
   lançamento de ENTRADA real em `window.NiveloCaixa` com o banco
   escolhido — é assim que o sistema sabe onde aquele valor foi
   efetivamente recebido. O desconto NUNCA gera lançamento em Caixa
   (não é dinheiro que entrou em conta nenhuma).

   Sem persistência entre páginas (mesma decisão de sempre neste
   protótipo) — TODAY fixo, igual à V1. */
(function () {
  'use strict';

  var TODAY = '2026-07-31';

  var TITULOS = [
    { codigo: 'CTR-0001', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Cerealista Bom Grão S.A.', clienteDocumento: '98.765.432/0001-10', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-07-15', dataEmissao: '2026-07-01', valor: 42500, numeroDocumento: 'NF-2201', historico: 'Venda de soja — safra 2025/2026', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'emitida', recebimentos: [] },
    { codigo: 'CTR-0002', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Cooperativa Agrícola Ribeirão', clienteDocumento: '12.345.098/0001-77', formaRecebimentoCodigo: 'FR-006', formaRecebimentoNome: 'Grão', vencimento: '2026-07-08', dataEmissao: '2026-06-20', valor: 18900, numeroDocumento: 'NF-2189', historico: 'Venda de milho', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'recebida', recebimentos: [{ id: 1, data: '2026-07-07', valor: 18900, desconto: 0, contaBancariaCodigo: 2, bancoLabel: '748 - Banco Cooperativo Sicredi · Conta Corrente Sicredi', formaRecebimentoCodigo: 'FR-006', categoriaCodigo: 'CAT-002', criadoEm: '2026-07-07' }] },
    { codigo: 'CTR-0003', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Laticínios Vale Verde Ltda', clienteDocumento: '23.456.109/0001-88', formaRecebimentoCodigo: 'FR-004', formaRecebimentoNome: 'Boleto', vencimento: '2026-07-05', dataEmissao: '2026-06-15', valor: 6200, numeroDocumento: null, historico: 'Arrendamento de pasto', categoriaCodigo: 'CAT-001', ocorrencia: 'mensal', numeroParcelas: null, parcelaAtual: 2, parcelaTotal: 12, grupoParcelamento: 'CTR-0003', diaVencimento: 5, status: 'em-aberto', recebimentos: [
      { id: 1, data: '2026-07-02', valor: 1600, desconto: 0, contaBancariaCodigo: 1, bancoLabel: '001 - Banco do Brasil · Conta Corrente Safra', formaRecebimentoCodigo: 'FR-004', categoriaCodigo: 'CAT-001', criadoEm: '2026-07-02' },
      { id: 2, data: '2026-07-05', valor: 1200, desconto: 0, contaBancariaCodigo: 2, bancoLabel: '748 - Banco Cooperativo Sicredi · Conta Corrente Sicredi', formaRecebimentoCodigo: 'FR-004', categoriaCodigo: 'CAT-001', criadoEm: '2026-07-05' }
    ] },
    { codigo: 'CTR-0004', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Grãos do Cerrado Comercial', clienteDocumento: '34.567.210/0001-99', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-06-20', dataEmissao: '2026-06-05', valor: 31000, numeroDocumento: 'NF-2077', historico: 'Venda de trigo', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'emitida', recebimentos: [] },
    { codigo: 'CTR-0005', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Distribuidora Central de Alimentos', clienteDocumento: '45.678.321/0001-10', formaRecebimentoCodigo: 'FR-003', formaRecebimentoNome: 'Cartão de Crédito', vencimento: '2026-08-05', dataEmissao: '2026-07-20', valor: 4750, numeroDocumento: 'NF-2255', historico: 'Venda de produtos hortifrúti', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'emitida', recebimentos: [] },
    { codigo: 'CTR-0006', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'José Aparecido Souza', clienteDocumento: '456.789.012-33', formaRecebimentoCodigo: 'FR-001', formaRecebimentoNome: 'Dinheiro', vencimento: '2026-06-10', dataEmissao: '2026-05-25', valor: 1800, numeroDocumento: null, historico: 'Aluguel de maquinário agrícola', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'cancelada', recebimentos: [] },
    { codigo: 'CTR-0007', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Nutrição Animal Sertão Ltda', clienteDocumento: '56.789.432/0001-21', formaRecebimentoCodigo: 'FR-002', formaRecebimentoNome: 'Cartão de Débito', vencimento: '2026-07-25', dataEmissao: '2026-07-05', valor: 9600, numeroDocumento: 'NF-2311', historico: 'Venda de excedente de milho', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'emitida', recebimentos: [] },
    { codigo: 'CTR-0008', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-06-30', dataEmissao: '2026-06-01', valor: 13200, numeroDocumento: 'CT-9021/3', historico: 'Parcela de venda de soja parcelada', categoriaCodigo: 'CAT-001', ocorrencia: 'parcelada', numeroParcelas: 4, parcelaAtual: 3, parcelaTotal: 4, grupoParcelamento: 'CTR-0006X', diaVencimento: 30, status: 'atrasada', recebimentos: [] },
    // Exemplo do fluxo do pedido: R$ 1.000, 3 recebimentos parciais em bancos
    // diferentes (X/Y/X) + um desconto num deles — demonstra o cenário exato
    // descrito ("1.000 · 400 Banco X · 300 Banco Y · 300 Banco X").
    { codigo: 'CTR-0009', origem: 'manual', origemReferencia: null, clienteCodigo: null, clienteNome: 'Fazenda Boa Esperança Agropecuária Ltda', clienteDocumento: '21.345.679/0001-01', formaRecebimentoCodigo: 'FR-004', formaRecebimentoNome: 'Boleto', vencimento: '2026-07-20', dataEmissao: '2026-07-01', valor: 100000, numeroDocumento: 'NF-2400', historico: 'Venda de soja — recebimento em parcelas por bancos diferentes', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, status: 'em-aberto', recebimentos: [
      { id: 1, data: '2026-07-05', valor: 40000, desconto: 0, contaBancariaCodigo: 1, bancoLabel: '001 - Banco do Brasil · Conta Corrente Safra', formaRecebimentoCodigo: 'FR-005', categoriaCodigo: 'CAT-001', criadoEm: '2026-07-05' },
      { id: 2, data: '2026-07-12', valor: 30000, desconto: 500, contaBancariaCodigo: 2, bancoLabel: '748 - Banco Cooperativo Sicredi · Conta Corrente Sicredi', formaRecebimentoCodigo: 'FR-005', categoriaCodigo: 'CAT-001', criadoEm: '2026-07-12' },
      { id: 3, data: '2026-07-19', valor: 29500, desconto: 0, contaBancariaCodigo: 1, bancoLabel: '001 - Banco do Brasil · Conta Corrente Safra', formaRecebimentoCodigo: 'FR-005', categoriaCodigo: 'CAT-001', criadoEm: '2026-07-19' }
    ] }
  ];

  // ---------- Totais derivados ----------
  function totalRecebido(titulo) {
    return titulo.recebimentos.reduce(function (sum, r) { return sum + r.valor; }, 0);
  }
  function totalDesconto(titulo) {
    return titulo.recebimentos.reduce(function (sum, r) { return sum + (r.desconto || 0); }, 0);
  }
  function saldoAtual(titulo) {
    return Math.max(0, Math.round((titulo.valor - totalRecebido(titulo) - totalDesconto(titulo)) * 100) / 100);
  }
  // Bancos distintos já usados nos recebimentos de um título — usado pelo
  // filtro de Banco da listagem (um título pode ter recebimentos em mais
  // de um banco, precisa aparecer nos dois quando filtrado).
  function bancosDoTitulo(titulo) {
    var labels = [];
    titulo.recebimentos.forEach(function (r) {
      if (r.bancoLabel && labels.indexOf(r.bancoLabel) === -1) labels.push(r.bancoLabel);
    });
    return labels;
  }

  // ---------- Auto-flip pra "Atrasada" + recálculo de em-aberto/recebida,
  // nunca gravado permanentemente, recalculado a cada list(). ----------
  function refreshStatuses() {
    TITULOS.forEach(function (titulo) {
      if (titulo.status === 'cancelada') return;
      var saldo = saldoAtual(titulo);
      if (saldo <= 0) { titulo.status = 'recebida'; return; }
      if (titulo.vencimento < TODAY) { titulo.status = 'atrasada'; return; }
      titulo.status = totalRecebido(titulo) > 0 || totalDesconto(titulo) > 0 ? 'em-aberto' : 'emitida';
    });
  }

  function list() {
    refreshStatuses();
    return TITULOS;
  }

  function findByCodigo(codigo) {
    return list().filter(function (t) { return t.codigo === codigo; })[0] || null;
  }

  function nextCodigo() {
    var max = 0;
    TITULOS.forEach(function (t) {
      var match = /CTR-(\d+)/.exec(t.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 4) padded = '0' + padded;
    return 'CTR-' + padded;
  }

  function add(payload) {
    var titulo = {
      codigo: nextCodigo(),
      origem: payload.origem || 'manual',
      origemReferencia: payload.origemReferencia || null,
      clienteCodigo: payload.clienteCodigo || null,
      clienteNome: payload.clienteNome,
      clienteDocumento: payload.clienteDocumento || null,
      formaRecebimentoCodigo: payload.formaRecebimentoCodigo || null,
      formaRecebimentoNome: payload.formaRecebimentoNome || null,
      vencimento: payload.vencimento,
      dataEmissao: payload.dataEmissao,
      valor: payload.valor,
      numeroDocumento: payload.numeroDocumento || null,
      historico: payload.historico,
      categoriaCodigo: payload.categoriaCodigo || null,
      ocorrencia: payload.ocorrencia || 'unica',
      numeroParcelas: payload.numeroParcelas || null,
      parcelaAtual: payload.parcelaAtual || null,
      parcelaTotal: payload.parcelaTotal || null,
      grupoParcelamento: payload.grupoParcelamento || null,
      diaVencimento: payload.diaVencimento || null,
      status: 'emitida',
      recebimentos: []
    };
    TITULOS.push(titulo);
    return titulo;
  }

  // Título gerado automaticamente a partir da emissão de uma Nota Fiscal de
  // saída (fluxo pedido: "Tudo que for gerado a partir de uma Nota Fiscal
  // deve ser enviado automaticamente para Contas a Receber") — chamada por
  // nova-nota-fiscal.js logo após `NiveloNotasFiscais.add()`.
  //
  // Decisão de prototipagem documentada aqui: a Nota Fiscal não modela um
  // prazo/vencimento próprio (só `meioPagamento`) — formas tipicamente à
  // vista (dinheiro/PIX/cartão) geram vencimento igual à emissão; boleto/
  // transferência (mais comuns com prazo comercial) recebem um vencimento
  // padrão de 30 dias. Sem essa heurística, todo título nascido de Nota
  // Fiscal ficaria "vencendo hoje", o que não reflete a prática real de
  // vendas a prazo.
  var MEIOS_A_VISTA = ['dinheiro', 'pix', 'cartao-credito', 'cartao-debito'];
  function addFromNotaFiscal(nota) {
    var prazoDias = MEIOS_A_VISTA.indexOf(nota.meioPagamento) !== -1 ? 0 : 30;
    var vencimento = addDaysISO(nota.dataEmissao, prazoDias);
    return add({
      origem: 'nota-fiscal',
      origemReferencia: nota.numero,
      clienteNome: nota.clienteNome,
      clienteDocumento: nota.clienteDocumento,
      vencimento: vencimento,
      dataEmissao: nota.dataEmissao,
      valor: nota.valor,
      numeroDocumento: nota.numero,
      historico: 'Venda referente à Nota Fiscal ' + nota.numero,
      categoriaCodigo: nota.categoriaCodigo || null
    });
  }

  // Título gerado a partir de um Pedido de venda — API pronta pro pedido
  // ("Caso seja gerado um Pedido, ele também deve ser enviado para Contas
  // a Receber"), mas SEM nenhum caminho de UI que a chame ainda: este
  // protótipo não tem um módulo de Pedidos de venda construído (removido
  // do sistema no round 64, ver app/CLAUDE.md) — quando esse módulo
  // existir, basta chamar esta função no momento da confirmação do
  // pedido, no mesmo espírito de `addFromNotaFiscal`.
  function addFromPedido(pedido) {
    return add({
      origem: 'pedido',
      origemReferencia: pedido.numero,
      clienteNome: pedido.clienteNome,
      clienteDocumento: pedido.clienteDocumento || null,
      vencimento: pedido.vencimento || pedido.dataEmissao,
      dataEmissao: pedido.dataEmissao,
      valor: pedido.valor,
      numeroDocumento: pedido.numero,
      historico: 'Venda referente ao Pedido ' + pedido.numero,
      categoriaCodigo: pedido.categoriaCodigo || null
    });
  }

  function update(codigo, payload) {
    var titulo = findByCodigo(codigo);
    if (!titulo) return null;
    titulo.clienteCodigo = payload.clienteCodigo || null;
    titulo.clienteNome = payload.clienteNome;
    titulo.clienteDocumento = payload.clienteDocumento || null;
    titulo.formaRecebimentoCodigo = payload.formaRecebimentoCodigo || null;
    titulo.formaRecebimentoNome = payload.formaRecebimentoNome || null;
    titulo.vencimento = payload.vencimento;
    titulo.dataEmissao = payload.dataEmissao;
    titulo.numeroDocumento = payload.numeroDocumento || null;
    titulo.historico = payload.historico;
    titulo.categoriaCodigo = payload.categoriaCodigo || null;
    titulo.diaVencimento = payload.diaVencimento || null;
    // Valor só é ajustável enquanto o título ainda não recebeu nada (mesma
    // regra de negócio já usada na V1/Contas a Pagar).
    if (totalRecebido(titulo) === 0) titulo.valor = payload.valor;
    return titulo;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function isoFromDate(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
  function addDaysISO(isoDate, days) {
    var parts = isoDate.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return isoFromDate(date);
  }

  var recebimentoIdSeq = 1000;

  // Registrar recebimento (total ou parcial, com desconto opcional e banco
  // OBRIGATÓRIO) — cada chamada empilha um novo evento em `recebimentos`,
  // nunca sobrescreve os anteriores. Também gera o lançamento de Entrada
  // correspondente em Caixa (fluxo completo do pedido: o banco escolhido é
  // usado pra identificar onde o valor foi efetivamente recebido) — o
  // desconto NUNCA entra em Caixa, só reduz o saldo em aberto do título.
  function registrarRecebimento(codigo, payload) {
    var titulo = findByCodigo(codigo);
    if (!titulo || titulo.status === 'cancelada' || titulo.status === 'recebida') return null;

    var saldoDisponivel = saldoAtual(titulo);
    var valor = Math.min(payload.valor, saldoDisponivel);
    var desconto = Math.min(payload.desconto || 0, saldoDisponivel - valor);
    var contaBancaria = window.NiveloContasBancarias.findByCodigo(payload.contaBancariaCodigo);
    var bancoLabel = contaBancaria ? (window.NiveloContasBancarias.bancoNome(contaBancaria) + ' · ' + contaBancaria.descricao) : '—';

    var recebimento = {
      id: ++recebimentoIdSeq,
      data: payload.data,
      valor: valor,
      desconto: desconto,
      contaBancariaCodigo: payload.contaBancariaCodigo,
      bancoLabel: bancoLabel,
      formaRecebimentoCodigo: payload.formaRecebimentoCodigo || titulo.formaRecebimentoCodigo,
      categoriaCodigo: payload.categoriaCodigo || titulo.categoriaCodigo,
      criadoEm: payload.data
    };
    titulo.recebimentos.push(recebimento);

    // Um título vindo de Nota Fiscal/Pedido pode não ter Categoria (nenhum
    // dos dois carrega essa classificação) — o 1º recebimento a informar
    // uma fica registrada no título também, pra próximos recebimentos e
    // pros relatórios que agregam por categoria.
    if (!titulo.categoriaCodigo && recebimento.categoriaCodigo) titulo.categoriaCodigo = recebimento.categoriaCodigo;

    if (valor > 0 && contaBancaria) {
      window.NiveloCaixa.add({
        data: payload.data,
        historico: 'Recebimento ' + titulo.codigo + ' - ' + titulo.clienteNome,
        categoriaCodigo: recebimento.categoriaCodigo,
        contaFinanceiraCodigo: contaBancaria.contaFinanceiraCodigo,
        tipo: 'entrada',
        valor: valor,
        banco: bancoLabel
      });
    }

    refreshStatuses();
    return titulo;
  }

  function cancelar(codigo) {
    var titulo = findByCodigo(codigo);
    if (!titulo || titulo.status === 'recebida') return null;
    titulo.status = 'cancelada';
    return titulo;
  }

  window.NiveloContasReceberV2 = {
    TODAY: TODAY,
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    addFromNotaFiscal: addFromNotaFiscal,
    addFromPedido: addFromPedido,
    update: update,
    registrarRecebimento: registrarRecebimento,
    cancelar: cancelar,
    totalRecebido: totalRecebido,
    totalDesconto: totalDesconto,
    saldoAtual: saldoAtual,
    bancosDoTitulo: bancosDoTitulo
  };
})();
