/* ══════════════════════════════════════════════════════════
   window.NiveloContasPagarV2 — catálogo central das contas a pagar, V2 da
   tela (Financeiro > Contas a pagar). Coexiste com `window.NiveloContasPagar`
   (V1, contas-pagar-data.js) — arquivo próprio e independente, nenhum
   import cruzado, mesma convenção já usada em outras coexistências deste
   projeto (contas-receber-v2-data.js × contas-receber-data.js).

   Regra de geração de títulos (pedido explícito do usuário):
   - Uma conta a pagar PARCELADA representa uma única compra/origem
     (ex.: uma compra de R$ 5.000,00 gera 5 títulos vinculados a ela via
     `grupoParcelamento`). Cada parcela é um título individual, com seu
     próprio vencimento/valor, que pode ser pago separadamente.
   - Se a condição for "À vista", gera-se somente 1 título com um único
     vencimento (mesmo raciocínio de `ocorrencia==='unica'` na V1, só que
     aqui a condição de pagamento em si já é binária: à vista/parcelado,
     sem o vocabulário de recorrência — semanal/mensal/etc — que a V1 tinha).
   - A soma das parcelas é validada contra o Valor total ANTES de salvar
     (na tela, `nova-conta-pagar-v2.js`) — este módulo recebe as parcelas
     já prontas/validadas, não recalcula nem redistribui valores sozinho.
   - Nunca se pede Conta Financeira/bancária no cadastro da obrigação — só
     no momento do pagamento (`registrarPagamento`).

   Cada título: {
     codigo,               // 'CTP-0001' — auto-gerado, sequencial, nunca editável
     fornecedorCodigo, fornecedorNome, fornecedorDocumento,
     dataEmissao,          // 'AAAA-MM-DD' — data de emissão/lançamento
     vencimento,           // 'AAAA-MM-DD' — vencimento DESTA parcela/conta
     categoriaCodigo,      // NiveloCategoriasFinanceiras
     documento,            // texto livre (nº da nota/boleto/contrato), opcional
     descricao,            // texto livre, obrigatório
     valorOriginal,        // number, sempre positivo — valor original desta
                            // parcela/conta, nunca alterado por um pagamento
     condicaoPagamento,    // 'avista' | 'parcelado'
     numeroParcelas, parcelaAtual, parcelaTotal, grupoParcelamento,
                            // preenchidos só quando condicaoPagamento==='parcelado'
     status,                // 'em-aberto' | 'vencida' | 'paga' (só 3, pedido
                            // explícito — sem "emitida"/"cancelada" na V2)
     pago,                  // number — soma de tudo já pago do PRINCIPAL
     pagamentos             // [{ id, data, contaFinanceiraCodigo,
                            //    contaFinanceiraNome, valorPago, juros,
                            //    desconto, totalSaida, saldoApos, criadoEm }]
   }

   Saldo principal (nunca gravado, sempre derivado): saldoPrincipal =
   valorOriginal - pago. Regra de negócio central (pedido explícito):
   - "Valor pago" (o que o usuário informa no pagamento) É o valor aplicado
     ao principal — reduz `pago`/`saldoPrincipal` diretamente.
   - Juros/Acréscimos NUNCA reduzem o principal (são um custo adicional).
   - Desconto obtido também não reduz o principal nesta modelagem — só
     entra no cálculo do TOTAL QUE SAI DA CONTA (dinheiro que efetivamente
     sai do banco), conforme a fórmula pedida explicitamente: total saída =
     valor pago + juros/acréscimos − desconto. Documentado aqui porque é
     uma decisão de negócio não 100% óbvia (um desconto poderia, em outra
     modelagem, quitar parte do principal também) — seguida a definição
     literal do pedido.
   - Quando saldoPrincipal chega a zero, o título vira 'paga'.
   - Pagamento parcial NUNCA encerra a conta — ela permanece 'em-aberto'
     (ou 'vencida', se já passou do vencimento) até o saldo principal
     zerar.

   Integração com Caixa (pedido explícito: "atualizar... Movimentação da
   Conta Financeira / Caixa / Livro Caixa"): `registrarPagamento()` cria,
   além do pagamento em si, um lançamento de SAÍDA real em
   `window.NiveloCaixa` no valor do TOTAL QUE SAI DA CONTA (não só o valor
   pago do principal) — é o dinheiro que realmente saiu do banco escolhido.

   Sem persistência entre páginas (mesma decisão de sempre neste
   protótipo) — TODAY fixo, igual à V1/Contas a Receber V2. */
(function () {
  'use strict';

  var TODAY = '2026-07-31';

  var TITULOS = [
    { codigo: 'CTP-0001', fornecedorCodigo: 'F-2001', fornecedorNome: 'Insumos Agrícolas Vale Ltda', fornecedorDocumento: '12.345.678/0001-90', dataEmissao: '2026-06-10', vencimento: '2026-07-10', categoriaCodigo: 'CAT-003', documento: 'NF-88541', descricao: 'Compra de fertilizantes NPK', valorOriginal: 15800, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0002', fornecedorCodigo: 'F-2013', fornecedorNome: 'Adubos Cajuru S.A.', fornecedorDocumento: '91.234.567/0001-89', dataEmissao: '2026-06-20', vencimento: '2026-07-05', categoriaCodigo: 'CAT-003', documento: 'NF-77213', descricao: 'Compra de adubo orgânico', valorOriginal: 5400, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'paga', pago: 5400, pagamentos: [
      { id: 1, data: '2026-07-04', contaFinanceiraCodigo: 2, contaFinanceiraNome: 'Conta Corrente Operacional', valorPago: 5400, juros: 0, desconto: 0, totalSaida: 5400, saldoApos: 0, criadoEm: '2026-07-04' }
    ] },
    { codigo: 'CTP-0003', fornecedorCodigo: null, fornecedorNome: 'Distribuidora de Combustíveis Franca Ltda', fornecedorDocumento: '23.456.789/0001-01', dataEmissao: '2026-07-01', vencimento: '2026-07-15', categoriaCodigo: 'CAT-004', documento: 'NF-99120', descricao: 'Abastecimento de tratores', valorOriginal: 3200, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0004', fornecedorCodigo: 'F-2012', fornecedorNome: 'Sementes Dumont Ltda', fornecedorDocumento: '89.123.456/0001-78', dataEmissao: '2026-05-20', vencimento: '2026-06-20', categoriaCodigo: 'CAT-003', documento: 'NF-65210', descricao: 'Compra de sementes certificadas', valorOriginal: 9400, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 5000, pagamentos: [
      { id: 2, data: '2026-06-18', contaFinanceiraCodigo: 1, contaFinanceiraNome: 'Caixa Geral', valorPago: 5000, juros: 0, desconto: 0, totalSaida: 5000, saldoApos: 4400, criadoEm: '2026-06-18' }
    ] },
    { codigo: 'CTP-0005', fornecedorCodigo: null, fornecedorNome: 'Companhia de Energia Elétrica', fornecedorDocumento: '02.345.108/0001-42', dataEmissao: '2026-06-28', vencimento: '2026-07-12', categoriaCodigo: 'CAT-005', documento: 'FAT-330219', descricao: 'Conta de energia elétrica da sede', valorOriginal: 1450, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0006', fornecedorCodigo: 'F-2010', fornecedorNome: 'Agropecuária Santa Fé Ltda', fornecedorDocumento: '12.345.679/0001-01', dataEmissao: '2026-05-05', vencimento: '2026-06-05', categoriaCodigo: 'CAT-006', documento: 'NF-40218', descricao: 'Impostos sobre a produção agrícola', valorOriginal: 2100, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0007', fornecedorCodigo: 'F-2011', fornecedorNome: 'Insumos Cravinhos Comercial Ltda', fornecedorDocumento: '23.456.780/0001-12', dataEmissao: '2026-07-25', vencimento: '2026-08-10', categoriaCodigo: 'CAT-004', documento: 'NF-10432', descricao: 'Manutenção de maquinário agrícola', valorOriginal: 2800, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0008', fornecedorCodigo: 'F-2016', fornecedorNome: 'Rações Ribeirão Ltda', fornecedorDocumento: '76.891.234/0001-56', dataEmissao: '2026-06-08', vencimento: '2026-06-28', categoriaCodigo: 'CAT-003', documento: 'NF-20984', descricao: 'Compra de ração para o rebanho', valorOriginal: 890, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    // Exemplo do fluxo pedido: compra de R$ 5.000,00 parcelada em 5 títulos
    // vinculados pela mesma origem (`grupoParcelamento`), 2ª parcela já paga
    // parcialmente (com juros e desconto num mesmo pagamento, pra
    // demonstrar a separação principal × juros × desconto).
    { codigo: 'CTP-0009', fornecedorCodigo: 'F-2014', fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', dataEmissao: '2026-06-08', vencimento: '2026-07-08', categoriaCodigo: 'CAT-006', documento: 'CT-5521', descricao: 'Compra de insumos parcelada em 5x', valorOriginal: 1000, condicaoPagamento: 'parcelado', numeroParcelas: 5, parcelaAtual: 1, parcelaTotal: 5, grupoParcelamento: 'CTP-0009', status: 'paga', pago: 1000, pagamentos: [
      { id: 3, data: '2026-07-06', contaFinanceiraCodigo: 2, contaFinanceiraNome: 'Conta Corrente Operacional', valorPago: 1000, juros: 0, desconto: 0, totalSaida: 1000, saldoApos: 0, criadoEm: '2026-07-06' }
    ] },
    { codigo: 'CTP-0010', fornecedorCodigo: 'F-2014', fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', dataEmissao: '2026-06-08', vencimento: '2026-08-08', categoriaCodigo: 'CAT-006', documento: 'CT-5521', descricao: 'Compra de insumos parcelada em 5x', valorOriginal: 1000, condicaoPagamento: 'parcelado', numeroParcelas: 5, parcelaAtual: 2, parcelaTotal: 5, grupoParcelamento: 'CTP-0009', status: 'em-aberto', pago: 350, pagamentos: [
      { id: 4, data: '2026-07-20', contaFinanceiraCodigo: 1, contaFinanceiraNome: 'Caixa Geral', valorPago: 350, juros: 25, desconto: 10, totalSaida: 365, saldoApos: 650, criadoEm: '2026-07-20' }
    ] },
    { codigo: 'CTP-0011', fornecedorCodigo: 'F-2014', fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', dataEmissao: '2026-06-08', vencimento: '2026-09-08', categoriaCodigo: 'CAT-006', documento: 'CT-5521', descricao: 'Compra de insumos parcelada em 5x', valorOriginal: 1000, condicaoPagamento: 'parcelado', numeroParcelas: 5, parcelaAtual: 3, parcelaTotal: 5, grupoParcelamento: 'CTP-0009', status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0012', fornecedorCodigo: 'F-2014', fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', dataEmissao: '2026-06-08', vencimento: '2026-10-08', categoriaCodigo: 'CAT-006', documento: 'CT-5521', descricao: 'Compra de insumos parcelada em 5x', valorOriginal: 1000, condicaoPagamento: 'parcelado', numeroParcelas: 5, parcelaAtual: 4, parcelaTotal: 5, grupoParcelamento: 'CTP-0009', status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0013', fornecedorCodigo: 'F-2014', fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', dataEmissao: '2026-06-08', vencimento: '2026-11-08', categoriaCodigo: 'CAT-006', documento: 'CT-5521', descricao: 'Compra de insumos parcelada em 5x', valorOriginal: 1000, condicaoPagamento: 'parcelado', numeroParcelas: 5, parcelaAtual: 5, parcelaTotal: 5, grupoParcelamento: 'CTP-0009', status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0014', fornecedorCodigo: 'F-2003', fornecedorNome: 'Antônio Carlos Pereira', fornecedorDocumento: '345.678.901-22', dataEmissao: '2026-07-01', vencimento: '2026-07-31', categoriaCodigo: 'CAT-006', documento: 'REC-014', descricao: 'Arrendamento de área de pastagem', valorOriginal: 3500, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] },
    { codigo: 'CTP-0015', fornecedorCodigo: null, fornecedorNome: 'Cerealista Bom Grão S.A.', fornecedorDocumento: '98.765.432/0001-10', dataEmissao: '2026-05-25', vencimento: '2026-06-10', categoriaCodigo: 'CAT-003', documento: 'NF-33012', descricao: 'Retirada de pró-labore', valorOriginal: 12400, condicaoPagamento: 'avista', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, status: 'em-aberto', pago: 0, pagamentos: [] }
  ];

  function saldoPrincipal(titulo) {
    return Math.max(0, Math.round((titulo.valorOriginal - titulo.pago) * 100) / 100);
  }

  // ---------- Auto-flip pra "Vencida": nunca gravado permanentemente,
  // recalculado a cada list() a partir de vencimento/saldo/status atual —
  // mesmo princípio já usado em toda conta a pagar/receber deste projeto. ----------
  function refreshStatuses() {
    TITULOS.forEach(function (t) {
      if (t.status === 'paga') return;
      var saldo = saldoPrincipal(t);
      if (saldo <= 0) { t.status = 'paga'; return; }
      t.status = t.vencimento < TODAY ? 'vencida' : 'em-aberto';
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
      var match = /CTP-(\d+)/.exec(t.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 4) padded = '0' + padded;
    return 'CTP-' + padded;
  }

  // Cria a conta (ou, quando condicaoPagamento==='parcelado', TODAS as
  // parcelas de uma vez, uma por item de `payload.parcelas`) — sempre
  // retorna um array com os títulos criados, mesmo pra uma conta à vista
  // (array de 1 item), pra `add()` ter uma única assinatura de retorno
  // independente do caso. As parcelas (vencimento/valor) já vêm prontas e
  // validadas da tela — este módulo não recalcula/redistribui nada.
  function add(payload) {
    var criados = [];

    if (payload.condicaoPagamento === 'parcelado' && payload.parcelas && payload.parcelas.length > 1) {
      var parcelas = payload.parcelas;
      var n = parcelas.length;
      var grupoCodigo = null;

      for (var i = 0; i < n; i++) {
        var codigo = nextCodigo();
        if (i === 0) grupoCodigo = codigo;

        var titulo = {
          codigo: codigo,
          fornecedorCodigo: payload.fornecedorCodigo || null,
          fornecedorNome: payload.fornecedorNome,
          fornecedorDocumento: payload.fornecedorDocumento || null,
          dataEmissao: payload.dataEmissao,
          vencimento: parcelas[i].vencimento,
          categoriaCodigo: payload.categoriaCodigo,
          documento: payload.documento || null,
          descricao: payload.descricao,
          valorOriginal: parcelas[i].valor,
          condicaoPagamento: 'parcelado',
          numeroParcelas: n,
          parcelaAtual: i + 1,
          parcelaTotal: n,
          grupoParcelamento: grupoCodigo,
          status: 'em-aberto',
          pago: 0,
          pagamentos: []
        };
        TITULOS.push(titulo);
        criados.push(titulo);
      }
      return criados;
    }

    var unico = {
      codigo: nextCodigo(),
      fornecedorCodigo: payload.fornecedorCodigo || null,
      fornecedorNome: payload.fornecedorNome,
      fornecedorDocumento: payload.fornecedorDocumento || null,
      dataEmissao: payload.dataEmissao,
      vencimento: payload.vencimento,
      categoriaCodigo: payload.categoriaCodigo,
      documento: payload.documento || null,
      descricao: payload.descricao,
      valorOriginal: payload.valor,
      condicaoPagamento: 'avista',
      numeroParcelas: null,
      parcelaAtual: null,
      parcelaTotal: null,
      grupoParcelamento: null,
      status: 'em-aberto',
      pago: 0,
      pagamentos: []
    };
    TITULOS.push(unico);
    criados.push(unico);
    return criados;
  }

  var pagamentoIdSeq = 1000;

  // Registrar pagamento (total ou parcial) — cada chamada empilha um novo
  // evento em `pagamentos`, nunca sobrescreve os anteriores. `valorPago` é
  // sempre clampado ao saldo principal disponível (não é possível pagar
  // mais principal do que resta da dívida); juros/desconto não têm esse
  // limite, já que não afetam o principal. Gera também o lançamento de
  // Saída correspondente em Caixa (ver nota no topo do arquivo).
  function registrarPagamento(codigo, payload) {
    var titulo = findByCodigo(codigo);
    if (!titulo || titulo.status === 'paga') return null;

    var saldoDisponivel = saldoPrincipal(titulo);
    var valorPago = Math.min(payload.valorPago, saldoDisponivel);
    var juros = payload.juros || 0;
    var desconto = payload.desconto || 0;
    var totalSaida = Math.max(0, Math.round((valorPago + juros - desconto) * 100) / 100);

    var contaFinanceira = window.NiveloContasFinanceiras.findByCodigo(payload.contaFinanceiraCodigo);

    titulo.pago = Math.round((titulo.pago + valorPago) * 100) / 100;
    var saldoApos = saldoPrincipal(titulo);

    var pagamento = {
      id: ++pagamentoIdSeq,
      data: payload.data,
      contaFinanceiraCodigo: payload.contaFinanceiraCodigo,
      contaFinanceiraNome: contaFinanceira ? contaFinanceira.nome : '—',
      valorPago: valorPago,
      juros: juros,
      desconto: desconto,
      totalSaida: totalSaida,
      saldoApos: saldoApos,
      criadoEm: payload.data
    };
    titulo.pagamentos.push(pagamento);

    if (totalSaida > 0 && contaFinanceira) {
      window.NiveloCaixa.add({
        data: payload.data,
        historico: 'Pagamento ' + titulo.codigo + ' - ' + titulo.fornecedorNome,
        pessoaNome: titulo.fornecedorNome,
        pessoaDocumento: titulo.fornecedorDocumento,
        categoriaCodigo: titulo.categoriaCodigo,
        contaFinanceiraCodigo: contaFinanceira.codigo,
        tipo: 'saida',
        valor: totalSaida,
        banco: contaFinanceira.nome
      });
    }

    refreshStatuses();
    return titulo;
  }

  window.NiveloContasPagarV2 = {
    TODAY: TODAY,
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    registrarPagamento: registrarPagamento,
    saldoPrincipal: saldoPrincipal
  };
})();
