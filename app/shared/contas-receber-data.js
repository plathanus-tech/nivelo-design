/* ══════════════════════════════════════════════════════════
   window.NiveloContasReceber — catálogo central das contas a receber
   (Financeiro > Contas a receber). Mesma convenção IIFE/arquitetura de
   `contas-pagar-data.js` (mesmo padrão explicitamente pedido), adaptado
   pra Cliente/Forma de Recebimento no lugar de Fornecedor/Forma de
   Pagamento e pra um status "recebida" no lugar de "paga".

   **Substitui a versão mínima criada numa rodada anterior** (só
   list/nextCodigo/add, sem tela própria — usada só pelo vínculo
   Estoque > Vendas > Registrar saída → "Criar conta a receber?"). Essa
   integração foi adaptada pra este contrato mais completo, ver
   `estoque.js`.

   Cada conta a receber: {
     codigo,                  // 'CTR-0001' — auto-gerado, sequencial, nunca editável
     clienteCodigo,           // código do cadastro (NiveloCadastros, tipo 'cliente'), opcional
     clienteNome,
     clienteDocumento,
     formaRecebimentoCodigo,  // NiveloFormasRecebimento
     formaRecebimentoNome,
     vencimento,              // 'AAAA-MM-DD' — data de vencimento DESTA parcela/ocorrência
     dataEmissao,             // 'AAAA-MM-DD'
     valor,                   // number, sempre positivo — valor desta parcela/ocorrência
     numeroDocumento,         // texto livre, opcional
     historico,               // texto livre
     categoriaCodigo,         // NiveloCategoriasFinanceiras
     ocorrencia,              // 'unica'|'semanal'|'quinzenal'|'mensal'|'semestral'|'anual'|'parcelada'
     numeroParcelas,          // int, só quando ocorrencia==='parcelada'; senão null
     parcelaAtual,            // int (1-based) — em contas parceladas OU recorrentes; senão null
     parcelaTotal,            // int — idem; senão null
     grupoParcelamento,       // codigo do 1º lançamento do grupo — liga entre si os lançamentos
                               // gerados de uma mesma conta parcelada/recorrente; null quando único
     diaVencimento,           // int 1-31, opcional — dia usado pra calcular o vencimento dos
                               // próximos lançamentos (recorrências mensais/semestrais/anuais e
                               // parcelas); não se aplica a semanal/quinzenal (intervalo em dias)
     saldo,                   // number — inicia igual a `valor`, decresce a cada recebimento
     recebido,                // number — soma de tudo já recebido nesta conta/ocorrência
     status,                  // 'emitida' | 'em-aberto' | 'recebida' | 'atrasada' | 'cancelada'
     historicoRecebimentos    // array de {data, valor} — auditoria simples dos recebimentos
   }

   Regras de negócio (ver pedido do usuário):
   - Código sempre auto-gerado (nextCodigo()).
   - Valor deve ser um valor monetário válido (validado na UI, ver
     nova-conta-receber.js).
   - Cliente, Valor, Vencimento, Data de Emissão, Histórico, Categoria,
     Forma de Recebimento e Ocorrência são obrigatórios (Nº Documento não).
   - Status inicial: 'emitida' (mapeado como "Em aberto"/"Emitidas" no
     filtro da listagem — mesma dualidade emitida/em-aberto já usada em
     Contas a Pagar: "emitida" é o estado inicial antes de qualquer
     recebimento parcial, "em-aberto" depois de um recebimento parcial).
   - Depois do vencimento, com saldo pendente, o status vira 'atrasada'
     automaticamente — recalculado a cada list() (nunca gravado
     "errado" no array), mesmo princípio de Contas a Pagar.
   - **Recorrências geram automaticamente os próximos lançamentos**
     (diferente de Contas a Pagar, que só gera múltiplos registros para
     "Parcelada" — aqui o pedido foi explícito: "As recorrências devem
     gerar automaticamente os lançamentos futuros conforme a
     periodicidade escolhida"). Como este é um protótipo estático sem
     backend/cron, a geração acontece de uma vez só, no momento do
     cadastro, com uma quantidade FIXA de ocorrências futuras
     (`RECORRENCIA_COUNT` = 12) — decisão de escopo documentada aqui,
     já que o pedido não especificou uma data-limite/quantidade. Cada
     ocorrência recorrente é um lançamento NOVO e completo (valor
     integral, não dividido) — diferente de "Parcelada", que DIVIDE um
     valor total entre N parcelas.
   - Quando parcelado, cada parcela possui vencimento e status próprios
     (saldo/recebido/status calculados por parcela, nunca por grupo).
   - Contas 'cancelada' não recebem novos recebimentos (guard em
     registrarRecebimento()).
   - Sem persistência entre páginas (mesma decisão documentada em todo o
     protótipo).

   Data de referência fixa (sem relógio real neste protótipo, mesmo
   princípio de Contas a Pagar): TODAY = '2026-07-31'. */
(function () {
  'use strict';

  var TODAY = '2026-07-31';
  var RECORRENCIA_COUNT = 12;

  var CONTAS = [
    { codigo: 'CTR-0001', clienteCodigo: null, clienteNome: 'Cerealista Bom Grão S.A.', clienteDocumento: '98.765.432/0001-10', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-07-15', dataEmissao: '2026-07-01', valor: 42500, numeroDocumento: 'NF-2201', historico: 'Venda de soja — safra 2025/2026', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 42500, recebido: 0, status: 'emitida', historicoRecebimentos: [] },
    { codigo: 'CTR-0002', clienteCodigo: null, clienteNome: 'Cooperativa Agrícola Ribeirão', clienteDocumento: '12.345.098/0001-77', formaRecebimentoCodigo: 'FR-006', formaRecebimentoNome: 'Grão', vencimento: '2026-07-08', dataEmissao: '2026-06-20', valor: 18900, numeroDocumento: 'NF-2189', historico: 'Venda de milho', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 0, recebido: 18900, status: 'recebida', historicoRecebimentos: [{ data: '2026-07-07', valor: 18900 }] },
    { codigo: 'CTR-0003', clienteCodigo: null, clienteNome: 'Laticínios Vale Verde Ltda', clienteDocumento: '23.456.109/0001-88', formaRecebimentoCodigo: 'FR-004', formaRecebimentoNome: 'Boleto', vencimento: '2026-07-05', dataEmissao: '2026-06-15', valor: 6200, numeroDocumento: null, historico: 'Arrendamento de pasto', categoriaCodigo: 'CAT-001', ocorrencia: 'mensal', numeroParcelas: null, parcelaAtual: 2, parcelaTotal: 12, grupoParcelamento: 'CTR-0003', diaVencimento: 5, saldo: 3400, recebido: 2800, status: 'em-aberto', historicoRecebimentos: [{ data: '2026-07-03', valor: 2800 }] },
    { codigo: 'CTR-0004', clienteCodigo: null, clienteNome: 'Grãos do Cerrado Comercial', clienteDocumento: '34.567.210/0001-99', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-06-20', dataEmissao: '2026-06-05', valor: 31000, numeroDocumento: 'NF-2077', historico: 'Venda de trigo', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 31000, recebido: 0, status: 'emitida', historicoRecebimentos: [] },
    { codigo: 'CTR-0005', clienteCodigo: null, clienteNome: 'Distribuidora Central de Alimentos', clienteDocumento: '45.678.321/0001-10', formaRecebimentoCodigo: 'FR-003', formaRecebimentoNome: 'Cartão de Crédito', vencimento: '2026-08-05', dataEmissao: '2026-07-20', valor: 4750, numeroDocumento: 'NF-2255', historico: 'Venda de produtos hortifrúti', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 4750, recebido: 0, status: 'emitida', historicoRecebimentos: [] },
    { codigo: 'CTR-0006', clienteCodigo: null, clienteNome: 'José Aparecido Souza', clienteDocumento: '456.789.012-33', formaRecebimentoCodigo: 'FR-001', formaRecebimentoNome: 'Dinheiro', vencimento: '2026-06-10', dataEmissao: '2026-05-25', valor: 1800, numeroDocumento: null, historico: 'Aluguel de maquinário agrícola', categoriaCodigo: 'CAT-001', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 1800, recebido: 0, status: 'cancelada', historicoRecebimentos: [] },
    { codigo: 'CTR-0007', clienteCodigo: null, clienteNome: 'Nutrição Animal Sertão Ltda', clienteDocumento: '56.789.432/0001-21', formaRecebimentoCodigo: 'FR-002', formaRecebimentoNome: 'Cartão de Débito', vencimento: '2026-07-25', dataEmissao: '2026-07-05', valor: 9600, numeroDocumento: 'NF-2311', historico: 'Venda de excedente de milho', categoriaCodigo: 'CAT-002', ocorrencia: 'unica', numeroParcelas: null, parcelaAtual: null, parcelaTotal: null, grupoParcelamento: null, diaVencimento: null, saldo: 9600, recebido: 0, status: 'emitida', historicoRecebimentos: [] },
    { codigo: 'CTR-0008', clienteCodigo: null, clienteNome: 'Agroindústria Pontal Ltda', clienteDocumento: '67.890.543/0001-32', formaRecebimentoCodigo: 'FR-005', formaRecebimentoNome: 'PIX', vencimento: '2026-06-30', dataEmissao: '2026-06-01', valor: 13200, numeroDocumento: 'CT-9021/3', historico: 'Parcela de venda de soja parcelada', categoriaCodigo: 'CAT-001', ocorrencia: 'parcelada', numeroParcelas: 4, parcelaAtual: 3, parcelaTotal: 4, grupoParcelamento: 'CTR-0006X', diaVencimento: 30, saldo: 13200, recebido: 0, status: 'atrasada', historicoRecebimentos: [] }
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

  function nextCodigo() {
    var max = 0;
    CONTAS.forEach(function (c) {
      var match = /CTR-(\d+)/.exec(c.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 4) padded = '0' + padded;
    return 'CTR-' + padded;
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function isoFromDate(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function addDaysISO(isoDate, days) {
    var parts = isoDate.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return isoFromDate(date);
  }

  // Soma `months` meses a uma data 'AAAA-MM-DD', opcionalmente sobrescrevendo
  // o dia do mês (`diaVencimento`) — quando o dia pedido não existe no mês de
  // destino (ex.: dia 31 em abril), usa o último dia real do mês (mesmo
  // "clamp" já usado em contas-pagar-data.js).
  function addMonthsClampDay(isoDate, months, overrideDay) {
    var parts = isoDate.split('-').map(Number);
    var year = parts[0], month = parts[1] - 1, day = parts[2];
    var targetDay = overrideDay || day;
    var targetMonthDate = new Date(year, month + months, 1);
    var lastDayOfTargetMonth = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0).getDate();
    var finalDay = Math.min(targetDay, lastDayOfTargetMonth);
    var finalDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), finalDay);
    return isoFromDate(finalDate);
  }

  function diffDaysISO(isoA, isoB) {
    var pa = isoA.split('-').map(Number), pb = isoB.split('-').map(Number);
    var da = new Date(pa[0], pa[1] - 1, pa[2]);
    var db = new Date(pb[0], pb[1] - 1, pb[2]);
    return Math.round((da.getTime() - db.getTime()) / 86400000);
  }

  // Calcula o vencimento da ocorrência `i` (1-based) a partir do vencimento
  // original, conforme o tipo de ocorrência. `diaVencimento` só se aplica a
  // ocorrências baseadas em mês (mensal/semestral/anual/parcelada) — em
  // semanal/quinzenal (intervalo em dias) não há "dia do mês" pra ancorar.
  function vencimentoDaOcorrencia(vencimentoBase, ocorrencia, i, diaVencimento) {
    if (i === 1) return vencimentoBase;
    switch (ocorrencia) {
      case 'semanal': return addDaysISO(vencimentoBase, (i - 1) * 7);
      case 'quinzenal': return addDaysISO(vencimentoBase, (i - 1) * 15);
      case 'mensal':
      case 'parcelada': return addMonthsClampDay(vencimentoBase, i - 1, diaVencimento);
      case 'semestral': return addMonthsClampDay(vencimentoBase, (i - 1) * 6, diaVencimento);
      case 'anual': return addMonthsClampDay(vencimentoBase, (i - 1) * 12, diaVencimento);
      default: return vencimentoBase;
    }
  }

  // Cria a conta (ou, quando a ocorrência gera múltiplos lançamentos —
  // 'parcelada' ou qualquer recorrência diferente de 'unica' — TODOS de uma
  // vez) — sempre retorna um array com os registros criados, mesmo pra uma
  // conta única (array de 1 item).
  function add(payload) {
    var ocorrencia = payload.ocorrencia || 'unica';
    var criados = [];

    var isParcelada = ocorrencia === 'parcelada' && payload.numeroParcelas > 1;
    var isRecorrente = !isParcelada && ocorrencia !== 'unica';

    if (isParcelada || isRecorrente) {
      var n = isParcelada ? payload.numeroParcelas : RECORRENCIA_COUNT;
      var valorBase = isParcelada ? Math.round((payload.valor / n) * 100) / 100 : payload.valor;
      var somaParcelas = 0;
      var grupoCodigo = null;
      var diaVencimentoOriginal = diffDaysISO(payload.vencimento, payload.dataEmissao);

      for (var i = 1; i <= n; i++) {
        var codigo = nextCodigo();
        if (i === 1) grupoCodigo = codigo;

        var valorOcorrencia;
        if (isParcelada) {
          valorOcorrencia = i < n ? valorBase : Math.round((payload.valor - somaParcelas) * 100) / 100;
          somaParcelas += valorOcorrencia;
        } else {
          valorOcorrencia = valorBase;
        }

        var vencimentoOcorrencia = vencimentoDaOcorrencia(payload.vencimento, ocorrencia, i, payload.diaVencimento);
        var dataEmissaoOcorrencia = i === 1 ? payload.dataEmissao : addDaysISO(vencimentoOcorrencia, -diaVencimentoOriginal);

        var conta = {
          codigo: codigo,
          clienteCodigo: payload.clienteCodigo || null,
          clienteNome: payload.clienteNome,
          clienteDocumento: payload.clienteDocumento || null,
          formaRecebimentoCodigo: payload.formaRecebimentoCodigo,
          formaRecebimentoNome: payload.formaRecebimentoNome,
          vencimento: vencimentoOcorrencia,
          dataEmissao: dataEmissaoOcorrencia,
          valor: valorOcorrencia,
          numeroDocumento: payload.numeroDocumento || null,
          historico: payload.historico,
          categoriaCodigo: payload.categoriaCodigo,
          ocorrencia: ocorrencia,
          numeroParcelas: isParcelada ? n : null,
          parcelaAtual: i,
          parcelaTotal: n,
          grupoParcelamento: grupoCodigo,
          diaVencimento: payload.diaVencimento || null,
          saldo: valorOcorrencia,
          recebido: 0,
          status: 'emitida',
          historicoRecebimentos: []
        };
        CONTAS.push(conta);
        criados.push(conta);
      }
      return criados;
    }

    var unica = {
      codigo: nextCodigo(),
      clienteCodigo: payload.clienteCodigo || null,
      clienteNome: payload.clienteNome,
      clienteDocumento: payload.clienteDocumento || null,
      formaRecebimentoCodigo: payload.formaRecebimentoCodigo,
      formaRecebimentoNome: payload.formaRecebimentoNome,
      vencimento: payload.vencimento,
      dataEmissao: payload.dataEmissao,
      valor: payload.valor,
      numeroDocumento: payload.numeroDocumento || null,
      historico: payload.historico,
      categoriaCodigo: payload.categoriaCodigo,
      ocorrencia: ocorrencia,
      numeroParcelas: null,
      parcelaAtual: null,
      parcelaTotal: null,
      grupoParcelamento: null,
      diaVencimento: payload.diaVencimento || null,
      saldo: payload.valor,
      recebido: 0,
      status: 'emitida',
      historicoRecebimentos: []
    };
    CONTAS.push(unica);
    criados.push(unica);
    return criados;
  }

  // Editar: só os campos "de cadastro" (não mexe em saldo/recebido/status/
  // parcelamento — edição pontual, mesmo espírito de contas-pagar-data.js).
  function update(codigo, payload) {
    var conta = findByCodigo(codigo);
    if (!conta) return null;
    conta.clienteCodigo = payload.clienteCodigo || null;
    conta.clienteNome = payload.clienteNome;
    conta.clienteDocumento = payload.clienteDocumento || null;
    conta.formaRecebimentoCodigo = payload.formaRecebimentoCodigo;
    conta.formaRecebimentoNome = payload.formaRecebimentoNome;
    conta.vencimento = payload.vencimento;
    conta.dataEmissao = payload.dataEmissao;
    conta.numeroDocumento = payload.numeroDocumento || null;
    conta.historico = payload.historico;
    conta.categoriaCodigo = payload.categoriaCodigo;
    conta.diaVencimento = payload.diaVencimento || null;
    // Valor só é ajustável enquanto a conta ainda não recebeu nada — mudar o
    // valor de uma conta já recebida parcialmente quebraria a relação
    // saldo/recebido já registrada.
    if (conta.recebido === 0) {
      conta.valor = payload.valor;
      conta.saldo = payload.valor;
    }
    return conta;
  }

  // Registrar recebimento (total ou parcial): reduz o saldo, soma o
  // recebido, recalcula o status ('recebida' quando o saldo zera,
  // 'em-aberto' quando fica parcial). Contas canceladas/recebidas nunca
  // recebem novo recebimento (guard abaixo).
  function registrarRecebimento(codigo, valorRecebido, dataRecebimento) {
    var conta = findByCodigo(codigo);
    if (!conta || conta.status === 'cancelada' || conta.status === 'recebida') return null;

    var valor = Math.min(valorRecebido, conta.saldo);
    conta.recebido += valor;
    conta.saldo = Math.max(0, Math.round((conta.saldo - valor) * 100) / 100);
    conta.status = conta.saldo <= 0 ? 'recebida' : 'em-aberto';
    conta.historicoRecebimentos.push({ data: dataRecebimento, valor: valor });
    return conta;
  }

  // Cancelar: contas já recebidas não fazem sentido cancelar (dinheiro já
  // recebido do cliente) — guard simples, sem alterar saldo/recebido.
  function cancelar(codigo) {
    var conta = findByCodigo(codigo);
    if (!conta || conta.status === 'recebida') return null;
    conta.status = 'cancelada';
    return conta;
  }

  window.NiveloContasReceber = {
    TODAY: TODAY,
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    update: update,
    registrarRecebimento: registrarRecebimento,
    cancelar: cancelar
  };
})();
