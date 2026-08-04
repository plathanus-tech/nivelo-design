(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var params = new URLSearchParams(location.search);
  var editCodigo = params.get('codigo');
  var isEdit = !!editCodigo;

  if (isEdit) {
    document.getElementById('ncb-page-title').textContent = 'Editar Conta Bancária';
    document.title = 'Editar Conta Bancária — Nivelo';
  }

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema,
  // position:fixed via JS pra escapar de qualquer overflow:hidden). ----------
  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceAbove) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
      }
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

    function setValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
    }

    return { selectOption: selectOption, setValue: setValue };
  }

  // ---------- Banco: populado a partir do catálogo real de instituições
  // financeiras (window.NiveloBancosCatalogo), exibindo código + nome. ----------
  var bancoField = document.getElementById('banco-field');
  var bancoMenu = document.getElementById('banco-menu');
  window.NiveloBancosCatalogo.list().forEach(function (banco) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = banco.codigo;
    optionEl.textContent = banco.codigo + ' - ' + banco.nome;
    bancoMenu.appendChild(optionEl);
  });
  var bancoDropdown = initDropdown(bancoField);

  // ---------- Conta Financeira: populada a partir do catálogo real
  // (window.NiveloContasFinanceiras, Configuração > Conta Financeira). ----------
  var contaFinanceiraField = document.getElementById('conta-financeira-field');
  var contaFinanceiraMenu = document.getElementById('conta-financeira-menu');
  window.NiveloContasFinanceiras.list().forEach(function (contaFinanceira) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = contaFinanceira.codigo;
    optionEl.textContent = contaFinanceira.nome;
    contaFinanceiraMenu.appendChild(optionEl);
  });
  var contaFinanceiraDropdown = initDropdown(contaFinanceiraField);

  // ---------- Máscara Agência/Conta: dígitos + dígito verificador separado
  // por hífen (ex.: "1234-5", "987654-1") — mesma técnica de máscara
  // progressiva já usada em Área (ha)/CEP no resto do sistema, sem
  // biblioteca externa. `maxBeforeHyphen` limita quantos dígitos entram
  // antes do hífen (4 pra Agência, 6 pra Conta); o hífen só aparece quando
  // há pelo menos 1 dígito além desse limite (o dígito verificador). ----------
  function maskDigitsHyphen(input, maxBeforeHyphen) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '').slice(0, maxBeforeHyphen + 1);
      if (digits.length > maxBeforeHyphen) {
        input.value = digits.slice(0, maxBeforeHyphen) + '-' + digits.slice(maxBeforeHyphen);
      } else {
        input.value = digits;
      }
    });
  }

  var agenciaInput = document.getElementById('ncb-agencia');
  var contaInput = document.getElementById('ncb-conta');
  maskDigitsHyphen(agenciaInput, 4);
  maskDigitsHyphen(contaInput, 6);

  // ---------- Código: readonly, gerado automaticamente. Em modo criação já
  // mostra o próximo código real (preview cosmético — o valor definitivo só
  // é atribuído de verdade dentro de add()). ----------
  var codigoInput = document.getElementById('ncb-codigo');
  if (!isEdit) {
    codigoInput.value = window.NiveloContasBancarias.nextCodigo();
  }

  // ---------- Modo edição: pré-preenche todos os campos ----------
  if (isEdit) {
    var conta = window.NiveloContasBancarias.findByCodigo(editCodigo);
    if (conta) {
      codigoInput.value = conta.codigo;
      bancoDropdown.setValue(conta.bancoCodigo);
      document.getElementById('ncb-descricao').value = conta.descricao;
      agenciaInput.value = conta.agencia;
      contaInput.value = conta.conta;
      contaFinanceiraDropdown.setValue(conta.contaFinanceiraCodigo);
    }
  }

  // ---------- Validação ----------
  var descricaoInput = document.getElementById('ncb-descricao');
  var descricaoField = document.getElementById('descricao-field');
  var agenciaField = document.getElementById('agencia-field');
  var contaField = document.getElementById('conta-field');

  function validate() {
    var bancoInvalid = !bancoField.dataset.value;
    bancoField.classList.toggle('error', bancoInvalid);

    var descricaoInvalid = !descricaoInput.value.trim();
    descricaoField.classList.toggle('error', descricaoInvalid);

    var agenciaInvalid = !agenciaInput.value.trim();
    agenciaField.classList.toggle('error', agenciaInvalid);

    var contaInvalid = !contaInput.value.trim();
    contaField.classList.toggle('error', contaInvalid);

    var contaFinanceiraInvalid = !contaFinanceiraField.dataset.value;
    contaFinanceiraField.classList.toggle('error', contaFinanceiraInvalid);

    return !bancoInvalid && !descricaoInvalid && !agenciaInvalid && !contaInvalid && !contaFinanceiraInvalid;
  }

  // ---------- Submit ----------
  var form = document.getElementById('ncb-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;

    var payload = {
      bancoCodigo: bancoField.dataset.value,
      descricao: descricaoInput.value.trim(),
      agencia: agenciaInput.value.trim(),
      conta: contaInput.value.trim(),
      contaFinanceiraCodigo: contaFinanceiraField.dataset.value
    };

    var successMessage;
    if (isEdit) {
      window.NiveloContasBancarias.update(editCodigo, payload);
      successMessage = 'Conta bancária editada com sucesso.';
    } else {
      window.NiveloContasBancarias.add(payload);
      successMessage = 'Conta bancária cadastrada com sucesso.';
    }

    try { sessionStorage.setItem('nivelo.novacontabancaria.success', successMessage); } catch (e) {}
    window.location.href = 'contas-bancarias.html';
  });
})();
