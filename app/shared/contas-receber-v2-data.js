/* ══════════════════════════════════════════════════════════
   window.NiveloContasReceberV2 — catálogo central das contas a receber, V2
   da tela (Financeiro > Contas a receber). Reescrito para seguir o MESMO
   padrão arquitetural de `contas-pagar-v2-data.js` (pedido explícito:
   "seguindo o mesmo padrão visual, estrutural e de usabilidade já
   utilizado em Contas a Pagar") — substitui por completo a versão anterior
   (round 65), que usava Contas Bancárias + múltiplos recebimentos sem
   separação principal×juros×desconto. Coexiste com `window.NiveloContasReceber`
   (V1, contas-receber-data.js) — arquivo próprio e independente.

   Cada título: {
     codigo,                  // 'CTR-0001' — auto-gerado, sequencial, nunca editável
     clienteCodigo, clienteNome, clienteDocumento,
     formaRecebimentoCodigo, formaRecebimentoNome, // NiveloFormasRecebimento — sugestão
     vencimento,               // 'AAAA-MM-DD'
     dataEmissao,              // 'AAAA-MM-DD'
     valorOriginal,            // number, sempre positivo — nunca alterado por um recebimento
     documento,                // texto livre (Documento / NF), opcional
     descricao,                // texto livre, obrigatório
     categoriaCodigo,          // NiveloCategoriasFinanceiras
     ocorrencia, numeroParcelas, parcelaAtual, parcelaTotal, grupoParcelamento, diaVencimento,
     status,                   // 'em-aberto' | 'vencida' | 'recebida' (só 3, pedido explícito)
     recebido,                 // number — soma de tudo já recebido do PRINCIPAL
     recebimentos              // [{ id, data, contaFinanceiraCodigo, contaFinanceiraNome,
                                //    valorRecebido, juros, desconto, totalEntrada, saldoApos, criadoEm }]
   }

   Saldo principal (nunca gravado, sempre derivado): saldoPrincipal =
   valorOriginal - recebido. Mesma regra de negócio central já usada em
   Contas a Pagar V2 (espelhada aqui, ver contas-pagar-v2-data.js para o
   raciocínio completo):
   - "Valor recebido" reduz o principal diretamente.
   - Juros NUNCA reduzem o principal (custo adicional cobrado do cliente).
   - Desconto também não reduz o principal — só entra no TOTAL QUE ENTRA NA
     CONTA: total entrada = valor recebido + juros − desconto.
   - Quando saldoPrincipal chega a zero, o título vira 'recebida'.
   - Recebimento parcial NUNCA encerra a conta — permanece 'em-aberto' (ou
     'vencida') até o saldo principal zerar.

   Integração com Caixa: `registrarRecebimento()` cria, além do recebimento
   em si, um lançamento de ENTRADA real em `window.NiveloCaixa` no valor do
   TOTAL QUE ENTRA NA CONTA.

   Sem persistência entre páginas (mesma decisão de sempre neste
   protótipo) — TODAY fixo, igual a Contas a Pagar V2. */
(function () {
  'use strict';

  var TODAY = '2026-07-31';

  var TITULOS = [
    { codigo: 'CTR-0001', clienteCodigo: null, clienteNome: 'Cerealista Bom Grão S.A.', clienteDocumento: '98.765.432/0001-10', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-07-01', vencimento: '2026-07-15', categoriaCodigo: 'CAT-001', documento: 'NF-2201', descricao: 'Venda de soja — safra 2025/2026', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 42500, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0002', clienteCodigo: null, clienteNome: 'Cooperativa Agrícola Ribeirão', clienteDocumento: '12.345.098/0001-77', formaRecebimentoCodigo: 'FR-006', formaRecebimentoNome: 'Grão', dataEmissao: '2026-06-20', vencimento: '2026-07-08', categoriaCodigo: 'CAT-002', documento: 'NF-2189', descricao: 'Venda de milho', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 18900, status: 'recebida', recebido: 18900, recebimentos: [
      { id: 1, data: '2026-07-07', contaFinanceiraCodigo: 2, contaFinanceiraNome: 'Conta Corrente Operacional', valorRecebido: 18900, juros: 0, desconto: 0, totalEntrada: 18900, saldoApos: 0, criadoEm: '2026-07-07' }
    ] },
    { codigo: 'CTR-0003', clienteCodigo: null, clienteNome: 'Laticínios Vale Verde Ltda', clienteDocumento: '23.456.109/0001-88', formaRecebimentoCodigo: 'FR-004', formaRecebimentoNome: 'Boleto', dataEmissao: '2026-06-15', vencimento: '2026-07-05', categoriaCodigo: 'CAT-001', documento: null, descricao: 'Arrendamento de pasto', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 6200, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0004', clienteCodigo: null, clienteNome: 'Grãos do Cerrado Comercial', clienteDocumento: '34.567.210/0001-99', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-05', vencimento: '2026-06-20', categoriaCodigo: 'CAT-002', documento: 'NF-2077', descricao: 'Venda de trigo', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 31000, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0005', clienteCodigo: null, clienteNome: 'Distribuidora Central de Alimentos', clienteDocumento: '45.678.321/0001-10', formaRecebimentoCodigo: 'FR-003', formaRecebimentoNome: 'Cartão de Crédito', dataEmissao: '2026-07-20', vencimento: '2026-08-05', categoriaCodigo: 'CAT-001', documento: 'NF-2255', descricao: 'Venda de produtos hortifrúti', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 4750, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0006', clienteCodigo: null, clienteNome: 'Nutrição Animal Sertão Ltda', clienteDocumento: '56.789.432/0001-21', formaRecebimentoCodigo: 'FR-002', formaRecebimentoNome: 'Cartão de Débito', dataEmissao: '2026-07-05', vencimento: '2026-07-25', categoriaCodigo: 'CAT-002', documento: 'NF-2311', descricao: 'Venda de excedente de milho', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 9600, status: 'em-aberto', recebido: 0, recebimentos: [] },
    // Exemplo do fluxo pedido (mesmo espírito do CTP-0009/0013 em Contas a
    // Pagar V2): compra parcelada em 5 títulos vinculados pela mesma origem
    // (`grupoParcelamento`), 2ª parcela já recebida parcialmente com juros e
    // desconto num mesmo recebimento, pra demonstrar a separação
    // principal × juros × desconto.
    { codigo: 'CTR-0007', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-01', vencimento: '2026-06-30', categoriaCodigo: 'CAT-001', documento: 'CT-9021/1', descricao: 'Venda de soja parcelada em 5x', ocorrencia: 'parcelada', numeroParcelas: 5, parcelaAtual: 1, parcelaTotal: 5, grupoParcelamento: 'CTR-0007', diaVencimento: null, valorOriginal: 1000, status: 'recebida', recebido: 1000, recebimentos: [
      { id: 2, data: '2026-06-28', contaFinanceiraCodigo: 2, contaFinanceiraNome: 'Conta Corrente Operacional', valorRecebido: 1000, juros: 0, desconto: 0, totalEntrada: 1000, saldoApos: 0, criadoEm: '2026-06-28' }
    ] },
    { codigo: 'CTR-0008', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-01', vencimento: '2026-07-30', categoriaCodigo: 'CAT-001', documento: 'CT-9021/2', descricao: 'Venda de soja parcelada em 5x', ocorrencia: 'parcelada', numeroParcelas: 5, parcelaAtual: 2, parcelaTotal: 5, grupoParcelamento: 'CTR-0007', diaVencimento: null, valorOriginal: 1000, status: 'em-aberto', recebido: 350, recebimentos: [
      { id: 3, data: '2026-07-20', contaFinanceiraCodigo: 1, contaFinanceiraNome: 'Caixa Geral', valorRecebido: 350, juros: 25, desconto: 10, totalEntrada: 365, saldoApos: 650, criadoEm: '2026-07-20' }
    ] },
    { codigo: 'CTR-0009', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-01', vencimento: '2026-08-30', categoriaCodigo: 'CAT-001', documento: 'CT-9021/3', descricao: 'Venda de soja parcelada em 5x', ocorrencia: 'parcelada', numeroParcelas: 5, parcelaAtual: 3, parcelaTotal: 5, grupoParcelamento: 'CTR-0007', diaVencimento: null, valorOriginal: 1000, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0010', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-01', vencimento: '2026-09-30', categoriaCodigo: 'CAT-001', documento: 'CT-9021/4', descricao: 'Venda de soja parcelada em 5x', ocorrencia: 'parcelada', numeroParcelas: 5, parcelaAtual: 4, parcelaTotal: 5, grupoParcelamento: 'CTR-0007', diaVencimento: null, valorOriginal: 1000, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0011', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', dataEmissao: '2026-06-01', vencimento: '2026-10-30', categoriaCodigo: 'CAT-001', documento: 'CT-9021/5', descricao: 'Venda de soja parcelada em 5x', ocorrencia: 'parcelada', numeroParcelas: 5, parcelaAtual: 5, parcelaTotal: 5, grupoParcelamento: 'CTR-0007', diaVencimento: null, valorOriginal: 1000, status: 'em-aberto', recebido: 0, recebimentos: [] },
    { codigo: 'CTR-0012', clienteCodigo: null, clienteNome: 'Fazenda Boa Esperança Agropecuária Ltda', clienteDocumento: '21.345.679/0001-01', formaRecebimentoCodigo: 'FR-004', formaRecebimentoNome: 'Boleto', dataEmissao: '2026-05-25', vencimento: '2026-06-10', categoriaCodigo: 'CAT-001', documento: 'NF-2400', descricao: 'Venda de soja — recebimento em atraso', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, valorOriginal: 13200, status: 'em-aberto', recebido: 0, recebimentos: [] }
  ];

  // ---------- Auto-flip pra "vencida"/"recebida" — nunca gravado
  // permanentemente, recalculado a cada list(). ----------
  function saldoPrincipal(titulo) {
    return Math.max(0, Math.round((titulo.valorOriginal - titulo.recebido) * 100) / 100);
  }

  function refreshStatuses() {
    TITULOS.forEach(function (titulo) {
      var saldo = saldoPrincipal(titulo);
      if (saldo <= 0) { titulo.status = 'recebida'; return; }
      titulo.status = titulo.vencimento < TODAY ? 'vencida' : 'em-aberto';
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

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function isoFromDate(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
  function addDaysISO(isoDate, days) {
    var parts = isoDate.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return isoFromDate(date);
  }
  function addMonthsISOClamped(isoDate, months, diaVencimento) {
    var parts = isoDate.split('-').map(Number);
    var year = parts[0], month = parts[1] - 1 + months, day = diaVencimento || parts[2];
    var lastDay = new Date(year, month + 1, 0).getDate();
    if (day > lastDay) day = lastDay;
    return new Date(year, month, day).getFullYear() + '-' + pad2(new Date(year, month, day).getMonth() + 1) + '-' + pad2(day);
  }

  var RECORRENCIA_COUNT = 12;

  // Cria a conta — quando `ocorrencia==='parcelada'`, divide o valor total
  // entre N parcelas (última absorve o resto do arredondamento), vinculadas
  // por `grupoParcelamento`. Qualquer outra ocorrência recorrente (semanal/
  // quinzenal/mensal/semestral/anual) gera RECORRENCIA_COUNT lançamentos
  // futuros, cada um com o valor INTEGRAL informado (não dividido — é uma
  // cobrança nova a cada período, não uma parcela de uma soma). Sempre
  // retorna um array com os títulos criados.
  function add(payload) {
    var valorCents = Math.round((payload.valor || payload.valorOriginal || 0) * 100);
    var descricao = payload.historico || payload.descricao;
    var documento = payload.numeroDocumento || payload.documento || null;
    var ocorrencia = payload.ocorrencia || 'unica';
    var criados = [];

    function baseFields(index, vencimento, dataEmissao, valorTituloCents, grupoCodigo, numeroParcelas) {
      return {
        clienteCodigo: payload.clienteCodigo || null,
        clienteNome: payload.clienteNome,
        clienteDocumento: payload.clienteDocumento || null,
        formaRecebimentoCodigo: payload.formaRecebimentoCodigo || null,
        formaRecebimentoNome: payload.formaRecebimentoNome || null,
        dataEmissao: dataEmissao,
        vencimento: vencimento,
        categoriaCodigo: payload.categoriaCodigo || null,
        documento: documento,
        descricao: descricao,
        ocorrencia: ocorrencia,
        numeroParcelas: numeroParcelas || null,
        parcelaAtual: numeroParcelas ? index + 1 : null,
        parcelaTotal: numeroParcelas || null,
        grupoParcelamento: grupoCodigo,
        diaVencimento: payload.diaVencimento || null,
        valorOriginal: valorTituloCents / 100,
        status: 'em-aberto',
        recebido: 0,
        recebimentos: []
      };
    }

    if (ocorrencia === 'parcelada' && payload.numeroParcelas > 1) {
      var n = payload.numeroParcelas;
      var baseCents = Math.floor(valorCents / n);
      var resto = valorCents - baseCents * n;
      var grupoCodigo = null;
      for (var i = 0; i < n; i++) {
        var codigo = nextCodigo();
        if (i === 0) grupoCodigo = codigo;
        var vencimentoParcela = i === 0 ? payload.vencimento : addMonthsISOClamped(payload.vencimento, i, payload.diaVencimento);
        var valorParcelaCents = baseCents + (i === n - 1 ? resto : 0);
        var titulo = baseFields(i, vencimentoParcela, payload.dataEmissao, valorParcelaCents, grupoCodigo, n);
        titulo.codigo = codigo;
        TITULOS.push(titulo);
        criados.push(titulo);
      }
      return criados;
    }

    if (['semanal', 'quinzenal', 'mensal', 'semestral', 'anual'].indexOf(ocorrencia) !== -1) {
      var intervaloDias = ocorrencia === 'semanal' ? 7 : ocorrencia === 'quinzenal' ? 15 : null;
      var intervaloMeses = ocorrencia === 'mensal' ? 1 : ocorrencia === 'semestral' ? 6 : ocorrencia === 'anual' ? 12 : null;
      var grupoCodigo2 = null;
      for (var j = 0; j < RECORRENCIA_COUNT; j++) {
        var codigo2 = nextCodigo();
        if (j === 0) grupoCodigo2 = codigo2;
        var vencimento2 = intervaloDias
          ? addDaysISO(payload.vencimento, intervaloDias * j)
          : addMonthsISOClamped(payload.vencimento, intervaloMeses * j, payload.diaVencimento);
        var emissao2 = intervaloDias
          ? addDaysISO(payload.dataEmissao, intervaloDias * j)
          : addMonthsISOClamped(payload.dataEmissao, intervaloMeses * j, null);
        var titulo2 = baseFields(j, vencimento2, emissao2, valorCents, grupoCodigo2, RECORRENCIA_COUNT);
        titulo2.codigo = codigo2;
        TITULOS.push(titulo2);
        criados.push(titulo2);
      }
      return criados;
    }

    var unico = baseFields(0, payload.vencimento, payload.dataEmissao, valorCents, null, null);
    unico.codigo = nextCodigo();
    TITULOS.push(unico);
    criados.push(unico);
    return criados;
  }

  // Título gerado automaticamente a partir da emissão de uma Nota Fiscal de
  // saída — mesma convenção já usada antes da reescrita deste módulo,
  // preservada porque `nova-nota-fiscal.js` chama esta função direto.
  var MEIOS_A_VISTA = ['dinheiro', 'pix', 'cartao-credito', 'cartao-debito'];
  function addFromNotaFiscal(nota) {
    var prazoDias = MEIOS_A_VISTA.indexOf(nota.meioPagamento) !== -1 ? 0 : 30;
    var vencimento = addDaysISO(nota.dataEmissao, prazoDias);
    return add({
      clienteNome: nota.clienteNome,
      clienteDocumento: nota.clienteDocumento,
      vencimento: vencimento,
      dataEmissao: nota.dataEmissao,
      valor: nota.valor,
      numeroDocumento: nota.numero,
      historico: 'Venda referente à Nota Fiscal ' + nota.numero,
      categoriaCodigo: nota.categoriaCodigo || null,
      ocorrencia: 'unica'
    })[0];
  }

  function addFromPedido(pedido) {
    return add({
      clienteNome: pedido.clienteNome,
      clienteDocumento: pedido.clienteDocumento || null,
      vencimento: pedido.vencimento || pedido.dataEmissao,
      dataEmissao: pedido.dataEmissao,
      valor: pedido.valor,
      numeroDocumento: pedido.numero,
      historico: 'Venda referente ao Pedido ' + pedido.numero,
      categoriaCodigo: pedido.categoriaCodigo || null,
      ocorrencia: 'unica'
    })[0];
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
    titulo.documento = payload.numeroDocumento || payload.documento || null;
    titulo.descricao = payload.historico || payload.descricao;
    titulo.categoriaCodigo = payload.categoriaCodigo || null;
    titulo.diaVencimento = payload.diaVencimento || null;
    if (titulo.recebido === 0 && (payload.valor || payload.valorOriginal)) {
      titulo.valorOriginal = payload.valor || payload.valorOriginal;
    }
    return titulo;
  }

  var recebimentoIdSeq = 1000;

  // Registrar recebimento (total ou parcial) — cada chamada empilha um novo
  // evento em `recebimentos`, nunca sobrescreve os anteriores. Gera também
  // o lançamento de Entrada correspondente em Caixa.
  function registrarRecebimento(codigo, payload) {
    var titulo = findByCodigo(codigo);
    if (!titulo || titulo.status === 'recebida') return null;

    var saldoDisponivel = saldoPrincipal(titulo);
    var valorRecebido = Math.min(payload.valorRecebido, saldoDisponivel);
    var juros = payload.juros || 0;
    var desconto = payload.desconto || 0;
    var totalEntrada = Math.max(0, Math.round((valorRecebido + juros - desconto) * 100) / 100);

    var contaFinanceira = window.NiveloContasFinanceiras.findByCodigo(payload.contaFinanceiraCodigo);

    titulo.recebido = Math.round((titulo.recebido + valorRecebido) * 100) / 100;
    var saldoApos = saldoPrincipal(titulo);

    var recebimento = {
      id: ++recebimentoIdSeq,
      data: payload.data,
      contaFinanceiraCodigo: payload.contaFinanceiraCodigo,
      contaFinanceiraNome: contaFinanceira ? contaFinanceira.nome : '—',
      valorRecebido: valorRecebido,
      juros: juros,
      desconto: desconto,
      totalEntrada: totalEntrada,
      saldoApos: saldoApos,
      criadoEm: payload.data
    };
    titulo.recebimentos.push(recebimento);

    if (totalEntrada > 0 && contaFinanceira) {
      window.NiveloCaixa.add({
        data: payload.data,
        historico: 'Recebimento ' + titulo.codigo + ' - ' + titulo.clienteNome,
        pessoaNome: titulo.clienteNome,
        pessoaDocumento: titulo.clienteDocumento,
        categoriaCodigo: titulo.categoriaCodigo,
        contaFinanceiraCodigo: contaFinanceira.codigo,
        tipo: 'entrada',
        valor: totalEntrada,
        banco: contaFinanceira.nome
      });
    }

    refreshStatuses();
    return titulo;
  }

  // Mantida só por compatibilidade com o caminho morto de "Cancelar conta"
  // do formulário de edição (`?modo=editar`, sem link algum na listagem V2
  // desde que "Cancelar" saiu das ações da tabela) — não existe mais status
  // "cancelada" nesta V2 (só 3 status, pedido explícito), então esta função
  // não altera o título, só evita um erro em runtime se o caminho morto for
  // alcançado via URL direta.
  function cancelar(codigo) {
    return findByCodigo(codigo);
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
    saldoPrincipal: saldoPrincipal
  };
})();
