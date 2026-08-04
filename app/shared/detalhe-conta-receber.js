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
  function todayISO() { return window.NiveloContasReceber.TODAY; }

  var STATUS_BADGE = {
    emitida: { status: 'indigo', label: 'Emitida' },
    'em-aberto': { status: 'info', label: 'Em Aberto' },
    recebida: { status: 'success', label: 'Recebida' },
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
    integral: 'Recebido integralmente',
    parcial: 'Recebido parcialmente',
    'nao-recebido': 'Não recebido'
  };

  function situacaoRecebimento(conta) {
    if (conta.saldo <= 0) return 'integral';
    if (conta.recebido > 0) return 'parcial';
    return 'nao-recebido';
  }

  function categoriaDescricao(codigo) {
    if (!codigo) return '—';
    var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(codigo);
    return categoria ? categoria.descricao : '—';
  }

  // ---------- Estado atual (registro resolvido no boot) ----------
  var currentConta = null;

  function renderPrincipais() {
    document.getElementById('di-codigo').textContent = currentConta.codigo;
    document.getElementById('di-cliente').textContent = currentConta.clienteNome;
    document.getElementById('di-forma').textContent = currentConta.formaRecebimentoNome || '—';
    document.getElementById('di-documento').textContent = currentConta.numeroDocumento || '—';
    document.getElementById('di-emissao').textContent = formatDataPt(currentConta.dataEmissao);
    document.getElementById('di-vencimento').textContent = formatDataPt(currentConta.vencimento);
    document.getElementById('di-historico').textContent = currentConta.historico;
    document.getElementById('di-categoria').textContent = categoriaDescricao(currentConta.categoriaCodigo);
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
    document.getElementById('di-recebido').textContent = formatMoeda(currentConta.recebido);
    document.getElementById('di-situacao').textContent = SITUACAO_LABEL[situacaoRecebimento(currentConta)];
  }

  function renderStatusBadge() {
    var badge = STATUS_BADGE[currentConta.status];
    var el = document.getElementById('detalhe-status-badge');
    el.setAttribute('data-status', badge.status);
    el.innerHTML = '<span class="badgeDot"></span>' + badge.label;
  }

  function renderHistorico() {
    var timeline = document.getElementById('historico-timeline');
    var recebimentos = currentConta.historicoRecebimentos || [];
    if (!recebimentos.length) {
      timeline.innerHTML = '<li class="detalhe-ctr-timeline-empty">Nenhum recebimento registrado ainda.</li>';
    } else {
      timeline.innerHTML = recebimentos.map(function (entry) {
        return '<li class="detalhe-ctr-timeline-item">' +
          '<span class="detalhe-ctr-timeline-icon"><i data-lucide="circle-dollar-sign" width="16" height="16"></i></span>' +
          '<div class="detalhe-ctr-timeline-body">' +
            '<div class="detalhe-ctr-timeline-label">Recebimento registrado</div>' +
            '<div class="detalhe-ctr-timeline-meta">' + formatMoeda(entry.valor) + ' · ' + formatDataPt(entry.data) + '</div>' +
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

  // ---------- Ação contextual (Registrar recebimento) ----------
  function renderAcaoContextual() {
    var btn = document.getElementById('acao-contextual-btn');
    var podeReceber = currentConta.saldo > 0 && currentConta.status !== 'cancelada';
    btn.hidden = !podeReceber;
    btn.onclick = function () { openRecebimentoModal(currentConta); };
  }

  // ---------- Modal: Registrar recebimento ----------
  var recebimentoOverlay = document.getElementById('recebimento-dialog-overlay');

  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var recebimentoValorInput = document.getElementById('recebimento-valor-input');
  var recebimentoValorField = document.getElementById('recebimento-valor-field');
  var recebimentoDataInput = document.getElementById('recebimento-data-input');
  // ---------- Data do recebimento: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var recebimentoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'recebimento-data-field',
    triggerId: 'recebimento-data-trigger',
    valueId: 'recebimento-data-value',
    hiddenInputId: 'recebimento-data-input',
    popoverId: 'recebimento-data-popover',
    placeholder: 'Selecionar data'
  });

  recebimentoValorInput.addEventListener('input', function () {
    var digits = recebimentoValorInput.value.replace(/\D/g, '');
    recebimentoValorInput.dataset.cents = digitsToCents(digits);
    recebimentoValorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (recebimentoValorField.classList.contains('error') && Number(recebimentoValorInput.dataset.cents) > 0) {
      recebimentoValorField.classList.remove('error');
    }
  });

  function openRecebimentoModal(conta) {
    document.getElementById('recebimento-recap-title').textContent = conta.clienteNome + ' · ' + conta.historico;
    document.getElementById('recebimento-recap-documento').textContent = conta.numeroDocumento || '—';
    document.getElementById('recebimento-recap-vencimento').textContent = formatDataPt(conta.vencimento);
    document.getElementById('recebimento-recap-valor').textContent = formatMoeda(conta.valor);
    document.getElementById('recebimento-recap-saldo').textContent = formatMoeda(conta.saldo);
    recebimentoValorInput.value = '';
    recebimentoValorInput.dataset.cents = 0;
    recebimentoValorField.classList.remove('error');
    recebimentoDataPicker.setValue(todayISO());
    recebimentoOverlay.hidden = false;
    recebimentoValorInput.focus();
  }
  function closeRecebimentoModal() { recebimentoOverlay.hidden = true; }

  document.getElementById('recebimento-dialog-close').addEventListener('click', closeRecebimentoModal);
  document.getElementById('recebimento-cancel').addEventListener('click', closeRecebimentoModal);
  recebimentoOverlay.addEventListener('click', function (event) { if (event.target === recebimentoOverlay) closeRecebimentoModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !recebimentoOverlay.hidden) closeRecebimentoModal(); });

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ctr-toast';
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

  document.getElementById('recebimento-confirm').addEventListener('click', function () {
    if (!currentConta) return;
    var valorRecebido = Number(recebimentoValorInput.dataset.cents || 0) / 100;
    var invalid = !(valorRecebido > 0 && valorRecebido <= currentConta.saldo);
    recebimentoValorField.classList.toggle('error', invalid);
    if (invalid) return;

    window.NiveloContasReceber.registrarRecebimento(currentConta.codigo, valorRecebido, recebimentoDataInput.value || todayISO());
    closeRecebimentoModal();
    currentConta = window.NiveloContasReceber.findByCodigo(currentConta.codigo);
    refreshAll();
    showSuccessToast('Recebimento registrado com sucesso', currentConta.clienteNome + ' · ' + formatMoeda(valorRecebido) + '.');
  });

  // ---------- Boot: resolve a conta pelo `codigo` da query string —
  // window.NiveloContasReceber é um catálogo global. ----------
  function boot() {
    var codigo = new URLSearchParams(location.search).get('codigo');
    var conta = codigo ? window.NiveloContasReceber.findByCodigo(codigo) : null;

    if (!conta) {
      document.getElementById('detalhe-not-found').hidden = false;
      document.getElementById('detalhe-content').hidden = true;
      return;
    }

    currentConta = conta;
    document.getElementById('detalhe-not-found').hidden = true;
    document.getElementById('detalhe-content').hidden = false;
    document.getElementById('detalhe-titulo').textContent = currentConta.clienteNome + ' · ' + currentConta.codigo;
    refreshAll();
  }

  boot();
})();
