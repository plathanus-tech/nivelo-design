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
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  // ---------- Resolve o título pelo `?codigo=` (catálogo GLOBAL, mesma
  // técnica direta já usada em detalhe-conta-pagar.js — sem handoff via
  // sessionStorage, `window.NiveloContasPagarV2` já está carregado). ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var titulo = codigo ? window.NiveloContasPagarV2.findByCodigo(codigo) : null;

  if (!titulo) {
    document.querySelector('.rpg-page').innerHTML =
      '<div class="ncp-header">' +
        '<a href="contas-a-pagar-v2.html" class="ncp-back"><i data-lucide="arrow-left" width="18" height="18"></i>Voltar</a>' +
        '<h1 class="ncp-title text-heading-6">Conta não encontrada</h1>' +
        '<p class="ncp-subtitle text-body-s">O código informado não corresponde a nenhuma conta a pagar.</p>' +
      '</div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // ---------- Card "Conta" (somente-leitura) ----------
  function renderContaCard() {
    var saldo = window.NiveloContasPagarV2.saldoPrincipal(titulo);
    document.getElementById('rpg-conta-fornecedor').textContent = titulo.fornecedorNome;
    document.getElementById('rpg-conta-descricao').textContent = titulo.descricao;
    document.getElementById('rpg-conta-documento').textContent = titulo.documento || '—';
    document.getElementById('rpg-conta-valor-original').textContent = formatMoeda(titulo.valorOriginal);
    document.getElementById('rpg-conta-pago').textContent = formatMoeda(titulo.pago);
    document.getElementById('rpg-conta-saldo').textContent = formatMoeda(saldo);
  }
  renderContaCard();

  // ---------- Accordion "Histórico de Pagamentos" ----------
  var historicoHeader = document.getElementById('rpg-historico-header');
  var historicoToggle = document.getElementById('rpg-historico-toggle');
  var historicoContent = document.getElementById('rpg-historico-content');

  function setHistoricoExpanded(expanded) {
    historicoContent.hidden = !expanded;
    historicoToggle.setAttribute('aria-expanded', String(expanded));
    historicoToggle.setAttribute('aria-label', expanded ? 'Recolher histórico' : 'Expandir histórico');
  }
  historicoHeader.addEventListener('click', function () {
    setHistoricoExpanded(historicoContent.hidden);
  });

  function renderHistorico() {
    var tbody = document.getElementById('rpg-historico-tbody');
    var emptyEl = document.getElementById('rpg-historico-empty');
    var pagamentos = titulo.pagamentos.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });

    if (!pagamentos.length) {
      tbody.innerHTML = '';
      emptyEl.classList.add('is-visible');
      return;
    }
    emptyEl.classList.remove('is-visible');
    tbody.innerHTML = pagamentos.map(function (p) {
      return (
        '<tr class="tr">' +
          '<td class="td">' + formatDataPt(p.data) + '</td>' +
          '<td class="td">' + p.contaFinanceiraNome + '</td>' +
          '<td class="td">' + formatMoeda(p.valorPago) + '</td>' +
          '<td class="td">' + formatMoeda(p.juros) + '</td>' +
          '<td class="td">' + formatMoeda(p.desconto) + '</td>' +
          '<td class="td">' + formatMoeda(p.totalSaida) + '</td>' +
          '<td class="td">' + formatMoeda(p.saldoApos) + '</td>' +
        '</tr>'
      );
    }).join('');
  }
  renderHistorico();

  // ---------- Card "Novo Pagamento" ----------
  var contaSaidaField = document.getElementById('rpg-conta-saida-field');
  var contaSaidaMenu = document.getElementById('rpg-conta-saida-menu');
  var valorPagoInput = document.getElementById('rpg-valor-pago-input');
  var valorPagoField = document.getElementById('rpg-valor-pago-field');
  var jurosInput = document.getElementById('rpg-juros-input');
  var descontoInput = document.getElementById('rpg-desconto-input');
  var totalSaidaInput = document.getElementById('rpg-total-saida-input');
  var saldoAposInput = document.getElementById('rpg-saldo-apos-input');

  // Conta de saída: Contas Financeiras cadastradas em Configuração (pedido
  // explícito) — nunca solicitada no cadastro da obrigação, só aqui.
  window.NiveloContasFinanceiras.list().forEach(function (conta) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = conta.codigo;
    optionEl.textContent = conta.nome;
    contaSaidaMenu.appendChild(optionEl);
  });

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
    function onWindowScroll(event) {
      if (menu.contains(event.target)) return;
      close();
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onWindowScroll, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      root.classList.remove('error');
      close();
    }

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });
    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (optionEl) selectOption(optionEl);
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    return { selectOption: selectOption };
  }
  initDropdown(contaSaidaField);

  // Data: nasce preenchida com hoje, editável.
  var dataPicker = window.NiveloDatePicker.initDay({
    rootId: 'rpg-data-field', triggerId: 'rpg-data-trigger', valueId: 'rpg-data-value',
    hiddenInputId: 'rpg-data-input', popoverId: 'rpg-data-popover', placeholder: 'Selecionar data'
  });
  dataPicker.setValue(new Date().toISOString().slice(0, 10));

  function attachMoneyInput(input, onChange) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      input.dataset.cents = digitsToCents(digits);
      input.value = formatCentavosBRL(digitsToCents(digits));
      if (onChange) onChange();
    });
  }

  function recalcular() {
    var saldoAtual = window.NiveloContasPagarV2.saldoPrincipal(titulo);
    var valorPagoCents = Number(valorPagoInput.dataset.cents || 0);
    var jurosCents = Number(jurosInput.dataset.cents || 0);
    var descontoCents = Number(descontoInput.dataset.cents || 0);

    var totalSaidaCents = Math.max(0, valorPagoCents + jurosCents - descontoCents);
    var saldoAposCents = Math.max(0, Math.round(saldoAtual * 100) - Math.min(valorPagoCents, Math.round(saldoAtual * 100)));

    totalSaidaInput.value = formatCentavosBRL(totalSaidaCents);
    saldoAposInput.value = formatCentavosBRL(saldoAposCents);

    if (valorPagoField.classList.contains('error') && valorPagoCents > 0 && valorPagoCents <= Math.round(saldoAtual * 100)) {
      valorPagoField.classList.remove('error');
    }
  }

  attachMoneyInput(valorPagoInput, recalcular);
  attachMoneyInput(jurosInput, recalcular);
  attachMoneyInput(descontoInput, recalcular);
  recalcular();

  // ---------- Toast de sucesso (mesma composição já usada em toda a
  // jornada de Contas a Pagar). ----------
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

  // ---------- Validação + envio ----------
  var form = document.getElementById('rpg-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var saldoAtual = window.NiveloContasPagarV2.saldoPrincipal(titulo);
    var valorPago = Number(valorPagoInput.dataset.cents || 0) / 100;

    var contaSaidaInvalid = !contaSaidaField.dataset.value;
    contaSaidaField.classList.toggle('error', contaSaidaInvalid);

    var valorPagoInvalid = !(valorPago > 0 && valorPago <= saldoAtual);
    valorPagoField.classList.toggle('error', valorPagoInvalid);

    if (contaSaidaInvalid || valorPagoInvalid) return;

    window.NiveloContasPagarV2.registrarPagamento(titulo.codigo, {
      data: document.getElementById('rpg-data-input').value || window.NiveloContasPagarV2.TODAY,
      contaFinanceiraCodigo: contaSaidaField.dataset.value,
      valorPago: valorPago,
      juros: Number(jurosInput.dataset.cents || 0) / 100,
      desconto: Number(descontoInput.dataset.cents || 0) / 100
    });

    try {
      sessionStorage.setItem('nivelo.novacontapagarv2.success', 'Pagamento registrado com sucesso.');
    } catch (e) {}
    window.location.href = 'contas-a-pagar-v2.html';
  });
})();
