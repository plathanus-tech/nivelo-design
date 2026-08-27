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
  function todayISO() { return window.NiveloContasReceberV2.TODAY; }

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
    var saldo = window.NiveloContasReceberV2.saldoAtual(conta);
    if (saldo <= 0) return 'integral';
    if (window.NiveloContasReceberV2.totalRecebido(conta) > 0) return 'parcial';
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
    document.getElementById('di-recebido').textContent = formatMoeda(window.NiveloContasReceberV2.totalRecebido(currentConta));
    document.getElementById('di-desconto').textContent = formatMoeda(window.NiveloContasReceberV2.totalDesconto(currentConta));
    document.getElementById('di-saldo').textContent = formatMoeda(window.NiveloContasReceberV2.saldoAtual(currentConta));
    document.getElementById('di-situacao').textContent = SITUACAO_LABEL[situacaoRecebimento(currentConta)];
  }

  function renderStatusBadge() {
    var badge = STATUS_BADGE[currentConta.status];
    var el = document.getElementById('detalhe-status-badge');
    el.setAttribute('data-status', badge.status);
    el.innerHTML = '<span class="badgeDot"></span>' + badge.label;
  }

  // Timeline: cada recebimento mostra valor/desconto/banco (o pedido é
  // explícito que cada evento precisa registrar os 4 dados individualmente).
  function renderHistorico() {
    var timeline = document.getElementById('historico-timeline');
    var recebimentos = currentConta.recebimentos || [];
    if (!recebimentos.length) {
      timeline.innerHTML = '<li class="detalhe-ctr-timeline-empty">Nenhum recebimento registrado ainda.</li>';
    } else {
      timeline.innerHTML = recebimentos.map(function (r) {
        var descontoText = r.desconto > 0 ? ' · desconto ' + formatMoeda(r.desconto) : '';
        return '<li class="detalhe-ctr-timeline-item">' +
          '<span class="detalhe-ctr-timeline-icon"><i data-lucide="circle-dollar-sign" width="16" height="16"></i></span>' +
          '<div class="detalhe-ctr-timeline-body">' +
            '<div class="detalhe-ctr-timeline-label">Recebimento registrado · ' + formatMoeda(r.valor) + descontoText + '</div>' +
            '<div class="detalhe-ctr-timeline-meta">' + formatDataPt(r.data) + ' · ' + r.bancoLabel + '</div>' +
          '</div>' +
          '</li>';
      }).join('');
    }
    if (window.lucide) lucide.createIcons();
    document.getElementById('saldo-final-line').textContent = 'Saldo atual: ' + formatMoeda(window.NiveloContasReceberV2.saldoAtual(currentConta));
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
    var podeReceber = window.NiveloContasReceberV2.saldoAtual(currentConta) > 0 && currentConta.status !== 'cancelada';
    btn.hidden = !podeReceber;
    btn.onclick = function () { openRecebimentoModal(currentConta); };
  }

  // ---------- Modal: Registrar recebimento (réplica de contas-a-receber-v2.js) ----------
  var recebimentoOverlay = document.getElementById('recebimento-dialog-overlay');

  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
    }
    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', onWindowScroll, true);
      window.removeEventListener('resize', close);
    }
    function onWindowScroll(event) { if (!menu.contains(event.target)) close(); }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onWindowScroll, true);
      window.addEventListener('resize', close);
    }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      root.classList.remove('error');
      close();
    }
    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (optionEl) selectOption(optionEl);
    });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });

    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    return { reset: reset };
  }

  var recebimentoValorInput = document.getElementById('recebimento-valor-input');
  var recebimentoValorField = document.getElementById('recebimento-valor-field');
  var recebimentoDescontoInput = document.getElementById('recebimento-desconto-input');
  var recebimentoDataInput = document.getElementById('recebimento-data-input');
  var recebimentoBancoField = document.getElementById('recebimento-banco-field');

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
  recebimentoDescontoInput.addEventListener('input', function () {
    var digits = recebimentoDescontoInput.value.replace(/\D/g, '');
    recebimentoDescontoInput.dataset.cents = digitsToCents(digits);
    recebimentoDescontoInput.value = digits ? formatCentavosBRL(digitsToCents(digits)) : '';
  });

  var recebimentoBancoMenu = document.getElementById('recebimento-banco-menu');
  window.NiveloContasBancarias.list().forEach(function (contaBancaria) {
    var label = window.NiveloContasBancarias.bancoNome(contaBancaria) + ' · ' + contaBancaria.descricao;
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = String(contaBancaria.codigo);
    optionEl.textContent = label;
    recebimentoBancoMenu.appendChild(optionEl);
  });
  var recebimentoBancoDropdown = initDropdown(recebimentoBancoField);

  var recebimentoCategoriaMenu = document.getElementById('recebimento-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    recebimentoCategoriaMenu.appendChild(optionEl);
  });
  var recebimentoCategoriaDropdown = initDropdown(document.getElementById('recebimento-categoria-field'));

  var recebimentoFormaMenu = document.getElementById('recebimento-forma-menu');
  window.NiveloFormasRecebimento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    recebimentoFormaMenu.appendChild(optionEl);
  });
  var recebimentoFormaDropdown = initDropdown(document.getElementById('recebimento-forma-field'));

  function renderRecebimentosList(conta) {
    var listaEl = document.getElementById('recebimento-recap-lista');
    var itemsEl = document.getElementById('recebimento-recap-lista-items');
    if (!conta.recebimentos.length) { listaEl.hidden = true; return; }
    listaEl.hidden = false;
    itemsEl.innerHTML = conta.recebimentos.map(function (r) {
      var descontoText = r.desconto > 0 ? ' · desconto ' + formatMoeda(r.desconto) : '';
      return '<li class="text-12-regular">' + formatDataPt(r.data) + ' · ' + formatMoeda(r.valor) + descontoText + ' · ' + r.bancoLabel + '</li>';
    }).join('');
  }

  function openRecebimentoModal(conta) {
    document.getElementById('recebimento-recap-title').textContent = conta.clienteNome + ' · ' + conta.historico;
    document.getElementById('recebimento-recap-documento').textContent = conta.numeroDocumento || '—';
    document.getElementById('recebimento-recap-vencimento').textContent = formatDataPt(conta.vencimento);
    document.getElementById('recebimento-recap-valor').textContent = formatMoeda(conta.valor);
    document.getElementById('recebimento-recap-recebido').textContent = formatMoeda(window.NiveloContasReceberV2.totalRecebido(conta));
    document.getElementById('recebimento-recap-desconto').textContent = formatMoeda(window.NiveloContasReceberV2.totalDesconto(conta));
    document.getElementById('recebimento-recap-saldo').textContent = formatMoeda(window.NiveloContasReceberV2.saldoAtual(conta));
    renderRecebimentosList(conta);

    recebimentoValorInput.value = '';
    recebimentoValorInput.dataset.cents = 0;
    recebimentoValorField.classList.remove('error');
    recebimentoDescontoInput.value = '';
    recebimentoDescontoInput.dataset.cents = 0;
    recebimentoBancoDropdown.reset('', 'Selecione o banco');
    recebimentoBancoField.classList.remove('error');
    recebimentoCategoriaDropdown.reset(conta.categoriaCodigo || '', 'Selecione a categoria');
    recebimentoFormaDropdown.reset(conta.formaRecebimentoCodigo || '', 'Selecione a forma');
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
    var saldoDisponivel = window.NiveloContasReceberV2.saldoAtual(currentConta);
    var valorRecebido = Number(recebimentoValorInput.dataset.cents || 0) / 100;
    var desconto = Number(recebimentoDescontoInput.dataset.cents || 0) / 100;
    var bancoCodigo = recebimentoBancoField.dataset.value;

    var valorInvalid = !(valorRecebido > 0 && (valorRecebido + desconto) <= saldoDisponivel);
    var bancoInvalid = !bancoCodigo;
    recebimentoValorField.classList.toggle('error', valorInvalid);
    recebimentoBancoField.classList.toggle('error', bancoInvalid);
    if (valorInvalid || bancoInvalid) return;

    window.NiveloContasReceberV2.registrarRecebimento(currentConta.codigo, {
      valor: valorRecebido,
      desconto: desconto,
      data: recebimentoDataInput.value || todayISO(),
      contaBancariaCodigo: bancoCodigo,
      categoriaCodigo: document.getElementById('recebimento-categoria-field').dataset.value || null,
      formaRecebimentoCodigo: document.getElementById('recebimento-forma-field').dataset.value || null
    });
    closeRecebimentoModal();
    currentConta = window.NiveloContasReceberV2.findByCodigo(currentConta.codigo);
    refreshAll();
    showSuccessToast('Recebimento registrado com sucesso', currentConta.clienteNome + ' · ' + formatMoeda(valorRecebido) + '.');
  });

  // ---------- Boot: resolve a conta pelo `codigo` da query string —
  // window.NiveloContasReceberV2 é um catálogo global. ----------
  function boot() {
    var codigo = new URLSearchParams(location.search).get('codigo');
    var conta = codigo ? window.NiveloContasReceberV2.findByCodigo(codigo) : null;

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
