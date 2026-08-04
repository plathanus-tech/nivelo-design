(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDataPt(iso) {
    var parts = (iso || '').split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : (iso || '—');
  }
  function todayISO() { return window.NiveloContasPagar.TODAY; }

  var STATUS_BADGE = {
    emitida: { status: 'indigo', label: 'Emitida' },
    'em-aberto': { status: 'info', label: 'Em Aberto' },
    paga: { status: 'success', label: 'Paga' },
    atrasada: { status: 'error', label: 'Atrasada' },
    cancelada: { status: 'warning', label: 'Cancelada' }
  };

  var OCORRENCIA_LABEL = {
    unica: 'Única',
    semanal: 'Semanal',
    quinzenal: 'Quinzenal',
    mensal: 'Mensal',
    semestral: 'Semestral',
    anual: 'Anual',
    parcelada: 'Parcelada'
  };

  var SITUACAO_LABEL = {
    integral: 'Pago integralmente',
    parcial: 'Pago parcialmente',
    'nao-pago': 'Não pago'
  };

  function situacaoPagamento(conta) {
    if (conta.saldo <= 0) return 'integral';
    if (conta.pago > 0) return 'parcial';
    return 'nao-pago';
  }

  function categoriaDescricao(codigo) {
    if (!codigo) return '—';
    var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(codigo);
    return categoria ? categoria.descricao : '—';
  }

  function formatCompetencia(competencia) {
    if (!competencia) return '—';
    var parts = competencia.split('-');
    var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    var mes = MESES[Number(parts[1]) - 1];
    return mes ? mes + ' de ' + parts[0] : competencia;
  }

  // ---------- Estado atual (registro resolvido no boot) ----------
  var currentConta = null;

  function renderPrincipais() {
    document.getElementById('di-codigo').textContent = currentConta.codigo;
    document.getElementById('di-fornecedor').textContent = currentConta.fornecedorNome;
    document.getElementById('di-forma').textContent = currentConta.formaPagamentoNome || '—';
    document.getElementById('di-documento').textContent = currentConta.numeroDocumento || '—';
    document.getElementById('di-emissao').textContent = formatDataPt(currentConta.dataEmissao);
    document.getElementById('di-vencimento').textContent = formatDataPt(currentConta.vencimento);
    document.getElementById('di-historico').textContent = currentConta.historico;
    document.getElementById('di-categoria').textContent = categoriaDescricao(currentConta.categoriaCodigo);
    document.getElementById('di-competencia').textContent = formatCompetencia(currentConta.competencia);
    document.getElementById('di-ocorrencia').textContent = OCORRENCIA_LABEL[currentConta.ocorrencia] || '—';

    var parcelaField = document.getElementById('di-parcela-field');
    if (currentConta.parcelaTotal) {
      parcelaField.hidden = false;
      document.getElementById('di-parcela').textContent = currentConta.parcelaAtual + '/' + currentConta.parcelaTotal;
    } else {
      parcelaField.hidden = true;
    }
  }

  function renderFinanceiras() {
    document.getElementById('di-valor').textContent = formatMoeda(currentConta.valor);
    document.getElementById('di-saldo').textContent = formatMoeda(currentConta.saldo);
    document.getElementById('di-pago').textContent = formatMoeda(currentConta.pago);
    document.getElementById('di-situacao').textContent = SITUACAO_LABEL[situacaoPagamento(currentConta)];
  }

  function renderStatusBadge() {
    var badge = STATUS_BADGE[currentConta.status];
    var el = document.getElementById('detalhe-status-badge');
    el.setAttribute('data-status', badge.status);
    el.innerHTML = '<span class="badgeDot"></span>' + badge.label;
  }

  function renderHistorico() {
    var timeline = document.getElementById('historico-timeline');
    var pagamentos = currentConta.historicoPagamentos || [];
    if (!pagamentos.length) {
      timeline.innerHTML = '<li class="detalhe-ctp-timeline-empty">Nenhum pagamento registrado ainda.</li>';
    } else {
      timeline.innerHTML = pagamentos.map(function (entry) {
        return '<li class="detalhe-ctp-timeline-item">' +
          '<span class="detalhe-ctp-timeline-icon"><i data-lucide="circle-dollar-sign" width="16" height="16"></i></span>' +
          '<div class="detalhe-ctp-timeline-body">' +
            '<div class="detalhe-ctp-timeline-label">Pagamento registrado</div>' +
            '<div class="detalhe-ctp-timeline-meta">' + formatMoeda(entry.valor) + ' · ' + formatDataPt(entry.data) + '</div>' +
          '</div>' +
          '</li>';
      }).join('');
    }
    if (window.lucide) lucide.createIcons();
    document.getElementById('saldo-final-line').textContent = 'Saldo atual: ' + formatMoeda(currentConta.saldo);
  }

  function refreshAll() {
    renderPrincipais();
    renderFinanceiras();
    renderStatusBadge();
    renderHistorico();
    renderAcaoContextual();
  }

  // ---------- Ação contextual (Registrar pagamento — mesmo modal da
  // listagem, réplica de markup+lógica, mesmo princípio já documentado em
  // Estoque > Ver detalhes: sem módulo de estado entre páginas). ----------
  function renderAcaoContextual() {
    var btn = document.getElementById('acao-contextual-btn');
    var podePagar = currentConta.saldo > 0 && currentConta.status !== 'cancelada';
    btn.hidden = !podePagar;
    btn.onclick = function () { openPagamentoModal(currentConta); };
  }

  // ---------- Modal: Registrar pagamento ----------
  var pagamentoOverlay = document.getElementById('pagamento-dialog-overlay');

  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var pagamentoValorInput = document.getElementById('pagamento-valor-input');
  var pagamentoValorField = document.getElementById('pagamento-valor-field');
  var pagamentoDataInput = document.getElementById('pagamento-data-input');
  // ---------- Data do pagamento: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var pagamentoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'pagamento-data-field',
    triggerId: 'pagamento-data-trigger',
    valueId: 'pagamento-data-value',
    hiddenInputId: 'pagamento-data-input',
    popoverId: 'pagamento-data-popover',
    placeholder: 'Selecionar data'
  });

  pagamentoValorInput.addEventListener('input', function () {
    var digits = pagamentoValorInput.value.replace(/\D/g, '');
    pagamentoValorInput.dataset.cents = digitsToCents(digits);
    pagamentoValorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (pagamentoValorField.classList.contains('error') && Number(pagamentoValorInput.dataset.cents) > 0) {
      pagamentoValorField.classList.remove('error');
    }
  });

  function openPagamentoModal(conta) {
    document.getElementById('pagamento-recap-title').textContent = conta.fornecedorNome + ' · ' + conta.historico;
    document.getElementById('pagamento-recap-documento').textContent = conta.numeroDocumento || '—';
    document.getElementById('pagamento-recap-vencimento').textContent = formatDataPt(conta.vencimento);
    document.getElementById('pagamento-recap-valor').textContent = formatMoeda(conta.valor);
    document.getElementById('pagamento-recap-saldo').textContent = formatMoeda(conta.saldo);
    pagamentoValorInput.value = '';
    pagamentoValorInput.dataset.cents = 0;
    pagamentoValorField.classList.remove('error');
    pagamentoDataPicker.setValue(todayISO());
    pagamentoOverlay.hidden = false;
    pagamentoValorInput.focus();
  }
  function closePagamentoModal() { pagamentoOverlay.hidden = true; }

  document.getElementById('pagamento-dialog-close').addEventListener('click', closePagamentoModal);
  document.getElementById('pagamento-cancel').addEventListener('click', closePagamentoModal);
  pagamentoOverlay.addEventListener('click', function (event) { if (event.target === pagamentoOverlay) closePagamentoModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !pagamentoOverlay.hidden) closePagamentoModal(); });

  // ---------- Toast de sucesso (mesmo padrão de contas-a-pagar.js) ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ctp-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      '<div class="message">' + message + '</div>' +
      '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  document.getElementById('pagamento-confirm').addEventListener('click', function () {
    if (!currentConta) return;
    var valorPago = Number(pagamentoValorInput.dataset.cents || 0) / 100;
    var invalid = !(valorPago > 0 && valorPago <= currentConta.saldo);
    pagamentoValorField.classList.toggle('error', invalid);
    if (invalid) return;

    window.NiveloContasPagar.registrarPagamento(currentConta.codigo, valorPago, pagamentoDataInput.value || todayISO());
    closePagamentoModal();
    currentConta = window.NiveloContasPagar.findByCodigo(currentConta.codigo);
    refreshAll();
    showSuccessToast('Pagamento registrado com sucesso', currentConta.fornecedorNome + ' · ' + formatMoeda(valorPago) + '.');
  });

  // ---------- Boot: resolve a conta pelo `codigo` da query string —
  // window.NiveloContasPagar é um catálogo global (não precisa de handoff via
  // sessionStorage como Estoque, cujo dado vive só dentro de estoque.js). ----------
  function boot() {
    var codigo = new URLSearchParams(location.search).get('codigo');
    var conta = codigo ? window.NiveloContasPagar.findByCodigo(codigo) : null;

    if (!conta) {
      document.getElementById('detalhe-not-found').hidden = false;
      document.getElementById('detalhe-content').hidden = true;
      return;
    }

    currentConta = conta;
    document.getElementById('detalhe-not-found').hidden = true;
    document.getElementById('detalhe-content').hidden = false;
    document.getElementById('detalhe-titulo').textContent = currentConta.fornecedorNome + ' · ' + currentConta.codigo;
    refreshAll();
  }

  boot();
})();
