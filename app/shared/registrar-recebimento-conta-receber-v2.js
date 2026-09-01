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
  // técnica direta já usada em registrar-pagamento-conta-pagar-v2.js). ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var titulo = codigo ? window.NiveloContasReceberV2.findByCodigo(codigo) : null;

  if (!titulo) {
    document.querySelector('.rpg-page').innerHTML =
      '<div class="ncp-header">' +
        '<a href="contas-a-receber-v2.html" class="ncp-back"><i data-lucide="arrow-left" width="18" height="18"></i>Voltar</a>' +
        '<h1 class="ncp-title text-heading-6">Conta não encontrada</h1>' +
        '<p class="ncp-subtitle text-body-s">O código informado não corresponde a nenhuma conta a receber.</p>' +
      '</div>';
    if (window.lucide) lucide.createIcons();
    return;
  }

  // ---------- Card "Conta" (somente-leitura) ----------
  function renderContaCard() {
    var saldo = window.NiveloContasReceberV2.saldoPrincipal(titulo);
    document.getElementById('rpg-conta-cliente').textContent = titulo.clienteNome;
    document.getElementById('rpg-conta-descricao').textContent = titulo.descricao;
    document.getElementById('rpg-conta-documento').textContent = titulo.documento || '—';
    document.getElementById('rpg-conta-valor-original').textContent = formatMoeda(titulo.valorOriginal);
    document.getElementById('rpg-conta-recebido').textContent = formatMoeda(titulo.recebido);
    document.getElementById('rpg-conta-saldo').textContent = formatMoeda(saldo);
  }
  renderContaCard();

  // ---------- Accordion "Histórico de Recebimentos" ----------
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
    var recebimentos = titulo.recebimentos.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });

    if (!recebimentos.length) {
      tbody.innerHTML = '';
      emptyEl.classList.add('is-visible');
      return;
    }
    emptyEl.classList.remove('is-visible');
    tbody.innerHTML = recebimentos.map(function (r) {
      return (
        '<tr class="tr">' +
          '<td class="td">' + formatDataPt(r.data) + '</td>' +
          '<td class="td">' + r.contaFinanceiraNome + '</td>' +
          '<td class="td">' + formatMoeda(r.valorRecebido) + '</td>' +
          '<td class="td">' + formatMoeda(r.juros) + '</td>' +
          '<td class="td">' + formatMoeda(r.desconto) + '</td>' +
          '<td class="td">' + formatMoeda(r.totalEntrada) + '</td>' +
          '<td class="td">' + formatMoeda(r.saldoApos) + '</td>' +
        '</tr>'
      );
    }).join('');
  }
  renderHistorico();

  // ---------- Card "Novo Recebimento" ----------
  var contaEntradaField = document.getElementById('rpg-conta-entrada-field');
  var contaEntradaMenu = document.getElementById('rpg-conta-entrada-menu');
  var valorRecebidoInput = document.getElementById('rpg-valor-recebido-input');
  var valorRecebidoField = document.getElementById('rpg-valor-recebido-field');
  var jurosInput = document.getElementById('rpg-juros-input');
  var descontoInput = document.getElementById('rpg-desconto-input');
  var totalEntradaInput = document.getElementById('rpg-total-entrada-input');
  var saldoAposInput = document.getElementById('rpg-saldo-apos-input');

  // Conta de entrada: Contas Financeiras cadastradas em Configuração
  // (pedido explícito) — nunca solicitada no cadastro da obrigação, só aqui.
  window.NiveloContasFinanceiras.list().forEach(function (conta) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = conta.codigo;
    optionEl.textContent = conta.nome;
    contaEntradaMenu.appendChild(optionEl);
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
  initDropdown(contaEntradaField);

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
    var saldoAtual = window.NiveloContasReceberV2.saldoPrincipal(titulo);
    var valorRecebidoCents = Number(valorRecebidoInput.dataset.cents || 0);
    var jurosCents = Number(jurosInput.dataset.cents || 0);
    var descontoCents = Number(descontoInput.dataset.cents || 0);

    var totalEntradaCents = Math.max(0, valorRecebidoCents + jurosCents - descontoCents);
    var saldoAposCents = Math.max(0, Math.round(saldoAtual * 100) - Math.min(valorRecebidoCents, Math.round(saldoAtual * 100)));

    totalEntradaInput.value = formatCentavosBRL(totalEntradaCents);
    saldoAposInput.value = formatCentavosBRL(saldoAposCents);

    if (valorRecebidoField.classList.contains('error') && valorRecebidoCents > 0 && valorRecebidoCents <= Math.round(saldoAtual * 100)) {
      valorRecebidoField.classList.remove('error');
    }
  }

  attachMoneyInput(valorRecebidoInput, recalcular);
  attachMoneyInput(jurosInput, recalcular);
  attachMoneyInput(descontoInput, recalcular);
  recalcular();

  // ---------- Validação + envio ----------
  var form = document.getElementById('rpg-form');
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var saldoAtual = window.NiveloContasReceberV2.saldoPrincipal(titulo);
    var valorRecebido = Number(valorRecebidoInput.dataset.cents || 0) / 100;

    var contaEntradaInvalid = !contaEntradaField.dataset.value;
    contaEntradaField.classList.toggle('error', contaEntradaInvalid);

    var valorRecebidoInvalid = !(valorRecebido > 0 && valorRecebido <= saldoAtual);
    valorRecebidoField.classList.toggle('error', valorRecebidoInvalid);

    if (contaEntradaInvalid || valorRecebidoInvalid) return;

    window.NiveloContasReceberV2.registrarRecebimento(titulo.codigo, {
      data: document.getElementById('rpg-data-input').value || window.NiveloContasReceberV2.TODAY,
      contaFinanceiraCodigo: contaEntradaField.dataset.value,
      valorRecebido: valorRecebido,
      juros: Number(jurosInput.dataset.cents || 0) / 100,
      desconto: Number(descontoInput.dataset.cents || 0) / 100
    });

    try {
      sessionStorage.setItem('nivelo.novacontareceberv2.success', 'Recebimento registrado com sucesso.');
    } catch (e) {}
    window.location.href = 'contas-a-receber-v2.html';
  });
})();
