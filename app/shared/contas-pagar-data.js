/* ══════════════════════════════════════════════════════════
   window.NiveloContasPagar — catálogo central das contas a pagar
   (Financeiro > Contas a pagar). Mesma convenção IIFE de caixa-data.js/
   categorias-financeiras-data.js — módulo próprio, consumido por
   contas-a-pagar.html (listagem) e nova-conta-pagar.html (criação).

   Cada conta a pagar: {
     codigo,               // 'CTP-0001' — auto-gerado, sequencial, nunca editável
     fornecedorCodigo,     // código do cadastro (NiveloCadastros), opcional
     fornecedorNome,
     fornecedorDocumento,
     formaPagamentoCodigo, // NiveloFormasPagamento
     formaPagamentoNome,
     vencimento,           // 'AAAA-MM-DD' — data de vencimento DESTA parcela/conta
     dataEmissao,          // 'AAAA-MM-DD'
     valor,                // number, sempre positivo — valor desta parcela/conta
     numeroDocumento,      // texto livre (nº da nota/boleto/contrato)
     historico,            // texto livre
     categoriaCodigo,      // NiveloCategoriasFinanceiras
     competencia,          // 'AAAA-MM' — opcional
     ocorrencia,           // 'unica'|'semanal'|'quinzenal'|'mensal'|'semestral'|'anual'|'parcelada'
     numeroParcelas,       // int, só quando ocorrencia==='parcelada'; senão null
     parcelaAtual,         // int (1-based) — só em contas parceladas; senão null
     parcelaTotal,         // int — só em contas parceladas; senão null
     grupoParcelamento,    // codigo da 1ª parcela do grupo — liga as parcelas de uma
                            // mesma conta parcelada entre si; null quando não parcelada
     diaVencimento,        // int 1-31, opcional — dia usado pra calcular o vencimento
                            // das parcelas seguintes (se não informado, usa o dia do
                            // vencimento da 1ª parcela)
     saldo,                // number — inicia igual a `valor`, decresce a cada pagamento
     pago,                 // number — soma de tudo já pago nesta conta/parcela
     status,               // 'emitida' | 'em-aberto' | 'paga' | 'atrasada' | 'cancelada'
     historicoPagamentos   // array de {data, valor} — auditoria simples dos pagamentos
   }

   Regras de negócio (ver pedido do usuário):
   - Código sempre auto-gerado (nextCodigo()).
   - Saldo inicia igual ao Valor; conta nasce com status 'emitida'.
   - Depois do vencimento, com saldo pendente, o status vira 'atrasada'
     automaticamente — recalculado a cada list() (nunca gravado "errado" no
     array, sempre uma leitura fresca a partir de `vencimento`/`saldo`,
     mesmo espírito de "Estoque Comprometido" recalcular pendente/situação
     em cada render em vez de confiar num campo desatualizado).
   - Pagamento parcial reduz o saldo e mantém/ajusta o status pra
     'em-aberto'; saldo chegando a R$ 0,00 vira 'paga'.
   - Contas 'cancelada' não recebem novos pagamentos (guard em
     registrarPagamento()).
   - Sem persistência entre páginas (mesma decisão já documentada em todo o
     protótipo) — uma conta criada em nova-conta-pagar.js só existe durante a
     sessão de JS daquela página.

   Data de referência fixa (sem relógio real neste protótipo, mesmo
   princípio de todo o resto do app): TODAY = '2026-07-31'. */
(function () {
  'use strict';

  var TODAY = '2026-07-31';

  var CONTAS = [
    { codigo: 'CTP-0001', fornecedorCodigo: 'F-2001', fornecedorNome: 'Insumos Agrícolas Vale Ltda', fornecedorDocumento: '12.345.678/0001-90', formaPagamentoCodigo: 'FP-003', formaPagamentoNome: 'Boleto bancário', vencimento: '2026-07-10', dataEmissao: '2026-06-10', valor: 15800, numeroDocumento: 'NF-88541', historico: 'Compra de fertilizantes NPK', categoriaCodigo: 'CAT-003', competencia: '2026-07', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 15800, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0002', fornecedorCodigo: 'F-2013', fornecedorNome: 'Adubos Cajuru S.A.', fornecedorDocumento: '91.234.567/0001-89', formaPagamentoCodigo: 'FP-002', formaPagamentoNome: 'PIX', vencimento: '2026-07-05', dataEmissao: '2026-06-20', valor: 5400, numeroDocumento: 'NF-77213', historico: 'Compra de adubo orgânico', categoriaCodigo: 'CAT-003', competencia: '2026-07', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 0, pago: 5400, status: 'paga', historicoPagamentos: [{ data: '2026-07-04', valor: 5400 }] },
    { codigo: 'CTP-0003', fornecedorCodigo: null, fornecedorNome: 'Distribuidora de Combustíveis Franca Ltda', fornecedorDocumento: '23.456.789/0001-01', formaPagamentoCodigo: 'FP-006', formaPagamentoNome: 'Transferência bancária', vencimento: '2026-07-15', dataEmissao: '2026-07-01', valor: 3200, numeroDocumento: 'NF-99120', historico: 'Abastecimento de tratores', categoriaCodigo: 'CAT-004', competencia: '2026-07', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 3200, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0004', fornecedorCodigo: 'F-2012', fornecedorNome: 'Sementes Dumont Ltda', fornecedorDocumento: '89.123.456/0001-78', formaPagamentoCodigo: 'FP-003', formaPagamentoNome: 'Boleto bancário', vencimento: '2026-06-20', dataEmissao: '2026-05-20', valor: 9400, numeroDocumento: 'NF-65210', historico: 'Compra de sementes certificadas', categoriaCodigo: 'CAT-003', competencia: '2026-06', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 4400, pago: 5000, status: 'em-aberto', historicoPagamentos: [{ data: '2026-06-18', valor: 5000 }] },
    { codigo: 'CTP-0005', fornecedorCodigo: null, fornecedorNome: 'Companhia de Energia Elétrica', fornecedorDocumento: '02.345.108/0001-42', formaPagamentoCodigo: 'FP-003', formaPagamentoNome: 'Boleto bancário', vencimento: '2026-07-12', dataEmissao: '2026-06-28', valor: 1450, numeroDocumento: 'FAT-330219', historico: 'Conta de energia elétrica da sede', categoriaCodigo: 'CAT-005', competencia: '2026-07', ocorrencia: 'mensal', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: 12, saldo: 1450, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0006', fornecedorCodigo: 'F-2010', fornecedorNome: 'Agropecuária Santa Fé Ltda', fornecedorDocumento: '12.345.679/0001-01', formaPagamentoCodigo: 'FP-004', formaPagamentoNome: 'Cartão de crédito', vencimento: '2026-06-05', dataEmissao: '2026-05-05', valor: 2100, numeroDocumento: 'NF-40218', historico: 'Impostos sobre a produção agrícola', categoriaCodigo: 'CAT-006', competencia: '2026-06', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 2100, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0007', fornecedorCodigo: 'F-2011', fornecedorNome: 'Insumos Cravinhos Comercial Ltda', fornecedorDocumento: '23.456.780/0001-12', formaPagamentoCodigo: 'FP-007', formaPagamentoNome: 'Cheque', vencimento: '2026-08-10', dataEmissao: '2026-07-25', valor: 2800, numeroDocumento: 'NF-10432', historico: 'Manutenção de maquinário agrícola', categoriaCodigo: 'CAT-004', competencia: '2026-08', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 2800, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0008', fornecedorCodigo: 'F-2016', fornecedorNome: 'Rações Ribeirão Ltda', fornecedorDocumento: '76.891.234/0001-56', formaPagamentoCodigo: 'FP-002', formaPagamentoNome: 'PIX', vencimento: '2026-06-28', dataEmissao: '2026-06-08', valor: 890, numeroDocumento: 'NF-20984', historico: 'Compra de ração para o rebanho', categoriaCodigo: 'CAT-003', competencia: '2026-06', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 890, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0009', fornecedorCodigo: null, fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', formaPagamentoCodigo: 'FP-006', formaPagamentoNome: 'Transferência bancária', vencimento: '2026-07-08', dataEmissao: '2026-01-08', valor: 4200, numeroDocumento: 'CT-5521/1', historico: 'Empréstimo agrícola', categoriaCodigo: 'CAT-006', competencia: '2026-07', ocorrencia: 'parcelada', numeroParcelas: 12, parcelaAtual: 7, parcelaTotal: 12, grupoParcelamento: 'CTP-0003X', diaVencimento: 8, saldo: 4200, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0010', fornecedorCodigo: null, fornecedorNome: 'Cooperativa de Crédito Rural', fornecedorDocumento: '34.567.891/0001-23', formaPagamentoCodigo: 'FP-006', formaPagamentoNome: 'Transferência bancária', vencimento: '2026-08-08', dataEmissao: '2026-01-08', valor: 4200, numeroDocumento: 'CT-5521/2', historico: 'Empréstimo agrícola', categoriaCodigo: 'CAT-006', competencia: '2026-08', ocorrencia: 'parcelada', numeroParcelas: 12, parcelaAtual: 8, parcelaTotal: 12, grupoParcelamento: 'CTP-0003X', diaVencimento: 8, saldo: 4200, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0011', fornecedorCodigo: 'F-2014', fornecedorNome: 'José Carlos Fontoura', fornecedorDocumento: '789.123.456-07', formaPagamentoCodigo: 'FP-001', formaPagamentoNome: 'Dinheiro', vencimento: '2026-06-15', dataEmissao: '2026-06-01', valor: 1200, numeroDocumento: 'REC-002', historico: 'Diária de trabalhador temporário', categoriaCodigo: 'CAT-003', competencia: '2026-06', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 1200, pago: 0, status: 'cancelada', historicoPagamentos: [] },
    { codigo: 'CTP-0012', fornecedorCodigo: 'F-2015', fornecedorNome: 'Máquinas Orlândia Ltda', fornecedorDocumento: '43.567.891/0001-23', formaPagamentoCodigo: 'FP-004', formaPagamentoNome: 'Cartão de crédito', vencimento: '2026-09-01', dataEmissao: '2026-07-20', valor: 6600, numeroDocumento: 'NF-15873', historico: 'Peças de reposição de colheitadeira', categoriaCodigo: 'CAT-004', competencia: '2026-09', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 6600, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0013', fornecedorCodigo: 'F-2003', fornecedorNome: 'Antônio Carlos Pereira', fornecedorDocumento: '345.678.901-22', formaPagamentoCodigo: 'FP-002', formaPagamentoNome: 'PIX', vencimento: '2026-07-31', dataEmissao: '2026-07-01', valor: 3500, numeroDocumento: 'REC-014', historico: 'Arrendamento de área de pastagem', categoriaCodigo: 'CAT-006', competencia: '2026-07', ocorrencia: 'mensal', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: 31, saldo: 3500, pago: 0, status: 'emitida', historicoPagamentos: [] },
    { codigo: 'CTP-0014', fornecedorCodigo: null, fornecedorNome: 'Cerealista Bom Grão S.A.', fornecedorDocumento: '98.765.432/0001-10', formaPagamentoCodigo: 'FP-003', formaPagamentoNome: 'Boleto bancário', vencimento: '2026-06-10', dataEmissao: '2026-05-25', valor: 12400, numeroDocumento: 'NF-33012', historico: 'Retirada de pró-labore', categoriaCodigo: 'CAT-003', competencia: '2026-06', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 12400, pago: 0, status: 'emitida', historicoPagamentos: [] }
  ];

  // ---------- Auto-flip pra "Atrasada": nunca gravado permanentemente,
  // recalculado a cada list() a partir de vencimento/saldo/status atual. ----------
  function refreshStatuses() {
    CONTAS.forEach(function (c) {
      if ((c.status === 'emitida' || c.status === 'em-aberto') && c.vencimento < TODAY && c.saldo > 0) {
        c.status = 'atrasada';
      }
    });
  }

  function list() {
    refreshStatuses();
    return CONTAS;
  }

  function findByCodigo(codigo) {
    return list().filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  // Maior sufixo numérico existente + 1, zero-pad até 4 dígitos — mesmo
  // algoritmo já usado em caixa-data.js.
  function nextCodigo() {
    var max = 0;
    CONTAS.forEach(function (c) {
      var match = /CTP-(\d+)/.exec(c.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 4) padded = '0' + padded;
    return 'CTP-' + padded;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  // Soma `months` meses a uma data 'AAAA-MM-DD', opcionalmente sobrescrevendo
  // o dia do mês (`diaVencimento`) — quando o dia pedido não existe no mês de
  // destino (ex.: dia 31 em abril), usa o último dia real do mês (mesma
  // técnica de "clamp" já usada em qualquer cálculo de data neste protótipo).
  function addMonthsClampDay(isoDate, months, overrideDay) {
    var parts = isoDate.split('-').map(Number);
    var year = parts[0], month = parts[1] - 1, day = parts[2];
    var targetDay = overrideDay || day;
    var targetMonthDate = new Date(year, month + months, 1);
    var lastDayOfTargetMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
    var finalDay = Math.min(targetDay, lastDayOfTargetMonth);
    var finalDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), finalDay);
    return finalDate.getFullYear() + '-' + pad2(finalDate.getMonth() + 1) + '-' + pad2(finalDate.getDate());
  }

  function competenciaFromVencimento(iso) {
    return iso.slice(0, 7);
  }

  // Cria a conta (ou, quando ocorrencia==='parcelada', TODAS as parcelas de
  // uma vez) — sempre retorna um array com os registros criados, mesmo pra
  // uma conta única (array de 1 item), pra `add()` ter uma única assinatura
  // de retorno independente do caso.
  function add(payload) {
    var criados = [];

    if (payload.ocorrencia === 'parcelada' && payload.numeroParcelas > 1) {
      var n = payload.numeroParcelas;
      var valorBase = Math.round((payload.valor / n) * 100) / 100;
      var somaParcelas = 0;
      var grupoCodigo = null;

      for (var i = 1; i <= n; i++) {
        var codigo = nextCodigo();
        if (i === 1) grupoCodigo = codigo;

        var valorParcela = i < n ? valorBase : Math.round((payload.valor - somaParcelas) * 100) / 100;
        somaParcelas += valorParcela;

        var vencimentoParcela = i === 1
          ? payload.vencimento
          : addMonthsClampDay(payload.vencimento, i - 1, payload.diaVencimento);

        var conta = {
          codigo: codigo,
          fornecedorCodigo: payload.fornecedorCodigo || null,
          fornecedorNome: payload.fornecedorNome,
          fornecedorDocumento: payload.fornecedorDocumento || null,
          formaPagamentoCodigo: payload.formaPagamentoCodigo,
          formaPagamentoNome: payload.formaPagamentoNome,
          vencimento: vencimentoParcela,
          dataEmissao: payload.dataEmissao,
          valor: valorParcela,
          numeroDocumento: payload.numeroDocumento,
          historico: payload.historico,
          categoriaCodigo: payload.categoriaCodigo,
          competencia: i === 1 ? (payload.competencia || competenciaFromVencimento(vencimentoParcela)) : competenciaFromVencimento(vencimentoParcela),
          ocorrencia: payload.ocorrencia,
          numeroParcelas: n,
          parcelaAtual: i,
          parcelaTotal: n,
          grupoParcelamento: grupoCodigo,
          diaVencimento: payload.diaVencimento || null,
          saldo: valorParcela,
          pago: 0,
          status: 'emitida',
          historicoPagamentos: []
        };
        CONTAS.push(conta);
        criados.push(conta);
      }
      return criados;
    }

    var unica = {
      codigo: nextCodigo(),
      fornecedorCodigo: payload.fornecedorCodigo || null,
      fornecedorNome: payload.fornecedorNome,
      fornecedorDocumento: payload.fornecedorDocumento || null,
      formaPagamentoCodigo: payload.formaPagamentoCodigo,
      formaPagamentoNome: payload.formaPagamentoNome,
      vencimento: payload.vencimento,
      dataEmissao: payload.dataEmissao,
      valor: payload.valor,
      numeroDocumento: payload.numeroDocumento,
      historico: payload.historico,
      categoriaCodigo: payload.categoriaCodigo,
      competencia: payload.competencia || null,
      ocorrencia: payload.ocorrencia,
      numeroParcelas: null,
      parcelaAtual: null,
      parcelaTotal: null,
      grupoParcelamento: null,
      diaVencimento: payload.diaVencimento || null,
      saldo: payload.valor,
      pago: 0,
      status: 'emitida',
      historicoPagamentos: []
    };
    CONTAS.push(unica);
    criados.push(unica);
    return criados;
  }

  // Editar: só os campos "de cadastro" (não mexe em saldo/pago/status/
  // parcelamento, que são geridos por registrarPagamento()/cancelar()/
  // add()). Uma conta parcelada edita só a parcela individual clicada —
  // as demais parcelas do grupo não são recalculadas (edição pontual,
  // mesmo espírito de "editar uma linha só" já usado em Estoque/Talhões).
  function update(codigo, payload) {
    var conta = findByCodigo(codigo);
    if (!conta) return null;
    conta.fornecedorCodigo = payload.fornecedorCodigo || null;
    conta.fornecedorNome = payload.fornecedorNome;
    conta.fornecedorDocumento = payload.fornecedorDocumento || null;
    conta.formaPagamentoCodigo = payload.formaPagamentoCodigo;
    conta.formaPagamentoNome = payload.formaPagamentoNome;
    conta.vencimento = payload.vencimento;
    conta.dataEmissao = payload.dataEmissao;
    conta.numeroDocumento = payload.numeroDocumento;
    conta.historico = payload.historico;
    conta.categoriaCodigo = payload.categoriaCodigo;
    conta.competencia = payload.competencia || null;
    conta.diaVencimento = payload.diaVencimento || null;
    // Valor só é ajustável enquanto a conta ainda não recebeu nenhum
    // pagamento — mudar o valor de uma conta já paga parcialmente quebraria
    // a relação saldo/pago já registrada.
    if (conta.pago === 0) {
      conta.valor = payload.valor;
      conta.saldo = payload.valor;
    }
    return conta;
  }

  // Registrar pagamento (total ou parcial): reduz o saldo, soma o pago,
  // recalcula o status ('paga' quando o saldo zera, 'em-aberto' quando fica
  // parcial). Contas canceladas nunca recebem pagamento (guard abaixo).
  function registrarPagamento(codigo, valorPago, dataPagamento) {
    var conta = findByCodigo(codigo);
    if (!conta || conta.status === 'cancelada' || conta.status === 'paga') return null;

    var valor = Math.min(valorPago, conta.saldo);
    conta.pago += valor;
    conta.saldo = Math.max(0, Math.round((conta.saldo - valor) * 100) / 100);
    conta.status = conta.saldo <= 0 ? 'paga' : 'em-aberto';
    conta.historicoPagamentos.push({ data: dataPagamento, valor: valor });
    return conta;
  }

  // Cancelar: contas já pagas não fazem sentido cancelar (dinheiro já
  // recebido pelo fornecedor) — guard simples, sem alterar saldo/pago.
  function cancelar(codigo) {
    var conta = findByCodigo(codigo);
    if (!conta || conta.status === 'paga') return null;
    conta.status = 'cancelada';
    return conta;
  }

  // Excluir: remoção real (não soft-delete) — diferente de Cadastro/
  // Categorias, aqui não existe pedido explícito de preservar histórico de
  // uma conta excluída, e "Excluir" nas ações da tabela foi pedido como uma
  // ação normal de exclusão.
  function excluir(codigo) {
    var index = CONTAS.findIndex(function (c) { return c.codigo === codigo; });
    if (index === -1) return false;
    CONTAS.splice(index, 1);
    return true;
  }

  window.NiveloContasPagar = {
    TODAY: TODAY,
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    update: update,
    registrarPagamento: registrarPagamento,
    cancelar: cancelar,
    excluir: excluir
  };
})();
