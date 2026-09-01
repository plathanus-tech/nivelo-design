(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema) ----------
  function initDropdown(root, onChange) {
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
      if (onChange) onChange(optionEl.dataset.value, optionEl.textContent);
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

    return { selectOption: selectOption, root: root };
  }

  // ---------- Máscara de moeda (mesma técnica de Estoque/Caixa) ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }
  function formatMoedaSinal(valor) {
    var sinal = valor < 0 ? '-' : '';
    return sinal + 'R$ ' + Math.abs(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var valorInput = document.getElementById('tec-valor');
  var valorField = document.getElementById('valor-field');
  valorInput.addEventListener('input', function () {
    var digits = valorInput.value.replace(/\D/g, '');
    valorInput.dataset.cents = digitsToCents(digits);
    valorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (valorField.classList.contains('error') && Number(valorInput.dataset.cents) > 0) valorField.classList.remove('error');
    updateResumo();
  });

  // ---------- Campos ----------
  var dataField = document.getElementById('data-field');
  var dataInput = document.getElementById('tec-data');
  var origemField = document.getElementById('origem-field');
  var destinoField = document.getElementById('destino-field');
  var historicoInput = document.getElementById('tec-historico');

  // Data: nasce preenchida com hoje, mas o usuário pode alterar.
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  var dataPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-field',
    triggerId: 'data-trigger',
    valueId: 'data-value',
    hiddenInputId: 'tec-data',
    popoverId: 'data-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (dataField.classList.contains('error') && dataInput.value) dataField.classList.remove('error');
    }
  });
  dataPicker.setValue(todayISO());

  // Contas de origem/destino: mesmas opções (catálogo real de Contas
  // Bancárias, cada uma vinculada a uma Conta Financeira).
  function contaLabel(conta) {
    return window.NiveloContasBancarias.bancoNome(conta) + ' · ' + conta.descricao;
  }

  var origemMenu = document.getElementById('origem-menu');
  var destinoMenu = document.getElementById('destino-menu');
  window.NiveloContasBancarias.list().forEach(function (conta) {
    var label = contaLabel(conta);
    [origemMenu, destinoMenu].forEach(function (menu) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = String(conta.codigo);
      optionEl.textContent = label;
      menu.appendChild(optionEl);
    });
  });

  var origemDropdown = initDropdown(origemField, function () {
    revalidateContasDiferentes();
    updateResumo();
  });
  var destinoDropdown = initDropdown(destinoField, function () {
    revalidateContasDiferentes();
  });

  function revalidateContasDiferentes() {
    var origem = origemField.dataset.value;
    var destino = destinoField.dataset.value;
    if (origem && destino && origem !== destino) {
      destinoField.classList.remove('error');
    }
  }

  // ---------- Saldo disponível / Novo saldo estimado — só aparece depois de
  // escolher a conta de origem, recalcula sozinho conforme Origem/Valor
  // mudam. ----------
  var resumoEl = document.getElementById('tec-resumo');
  var resumoSaldoDisponivelEl = document.getElementById('tec-resumo-saldo-disponivel');
  var resumoNovoSaldoEl = document.getElementById('tec-resumo-novo-saldo');

  function updateResumo() {
    var origemCodigo = origemField.dataset.value;
    if (!origemCodigo) {
      resumoEl.hidden = true;
      return;
    }
    resumoEl.hidden = false;

    var contaOrigem = window.NiveloContasBancarias.findByCodigo(origemCodigo);
    var saldoDisponivel = contaOrigem
      ? window.NiveloCaixa.saldoPorContaFinanceira(contaOrigem.contaFinanceiraCodigo)
      : 0;
    var valor = Number(valorInput.dataset.cents || 0) / 100;
    var novoSaldo = saldoDisponivel - valor;

    resumoSaldoDisponivelEl.textContent = formatMoedaSinal(saldoDisponivel);
    resumoNovoSaldoEl.textContent = formatMoedaSinal(novoSaldo);
    resumoNovoSaldoEl.classList.toggle('caixa-valor-saida', novoSaldo < 0);
    resumoNovoSaldoEl.classList.toggle('caixa-valor-entrada', novoSaldo >= 0);
  }

  // ---------- Toast de sucesso (mesma composição já usada em Caixa) ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success caixa-toast';
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

  // ---------- Submit ----------
  var form = document.getElementById('tec-form');

  function validate() {
    var dataInvalid = !dataInput.value;
    dataField.classList.toggle('error', dataInvalid);

    var valorInvalid = !(Number(valorInput.dataset.cents) > 0);
    valorField.classList.toggle('error', valorInvalid);

    var origem = origemField.dataset.value;
    var destino = destinoField.dataset.value;
    var origemInvalid = !origem;
    origemField.classList.toggle('error', origemInvalid);

    var destinoInvalid = !destino || (origem && destino === origem);
    destinoField.classList.toggle('error', destinoInvalid);

    return !dataInvalid && !valorInvalid && !origemInvalid && !destinoInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;

    var contaOrigem = window.NiveloContasBancarias.findByCodigo(origemField.dataset.value);
    var contaDestino = window.NiveloContasBancarias.findByCodigo(destinoField.dataset.value);
    var data = dataInput.value;
    var valor = Number(valorInput.dataset.cents) / 100;
    var historico = historicoInput.value.trim() ||
      ('Transferência de ' + contaOrigem.descricao + ' para ' + contaDestino.descricao);

    // Categoria "Transferência entre contas próprias" (CAT-008) já existe no
    // catálogo justamente pra este uso — desconsiderada do DRE/LCDPR por
    // não representar receita/despesa real.
    window.NiveloCaixa.add({
      data: data,
      historico: historico,
      categoriaCodigo: 'CAT-008',
      contaFinanceiraCodigo: contaOrigem.contaFinanceiraCodigo,
      tipo: 'saida',
      valor: valor,
      banco: contaLabel(contaOrigem)
    });
    window.NiveloCaixa.add({
      data: data,
      historico: historico,
      categoriaCodigo: 'CAT-008',
      contaFinanceiraCodigo: contaDestino.contaFinanceiraCodigo,
      tipo: 'entrada',
      valor: valor,
      banco: contaLabel(contaDestino)
    });

    try {
      sessionStorage.setItem('nivelo.transferenciacontas.success', 'Transferência realizada com sucesso.');
    } catch (e) {}
    window.location.href = 'caixa-v2.html';
  });

  updateResumo();
})();
