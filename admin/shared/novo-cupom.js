(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var params = new URLSearchParams(location.search);
  var codigoEdicao = params.get('codigo');
  var current = codigoEdicao ? window.NiveloCupons.findByCodigo(codigoEdicao) : null;
  var isEdicao = !!current;

  // ---------- Dropdown genérico (seleção única) ----------
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
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
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
    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    return { selectOption: selectOption, reset: reset };
  }
  var tipoContaDropdown = initDropdown(document.getElementById('ncup-tipoconta-dropdown'));

  // ---------- Radio "Tipo de cupom": sincroniza `.checked` + alterna subseções ----------
  var tipoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="ncup-tipo"]'));
  var afiliadoSubsection = document.getElementById('ncup-afiliado-subsection');
  var comissaoSubsection = document.getElementById('ncup-comissao-subsection');
  var campanhaSubsection = document.getElementById('ncup-campanha-subsection');

  function syncTipoRadioChecked() {
    tipoRadios.forEach(function (radio) {
      radio.closest('.option').classList.toggle('checked', radio.checked);
    });
  }
  function tipoAtual() {
    var checked = tipoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'afiliado';
  }
  function refreshTipoVisibility() {
    var isAfiliado = tipoAtual() === 'afiliado';
    afiliadoSubsection.hidden = !isAfiliado;
    comissaoSubsection.hidden = !isAfiliado;
    campanhaSubsection.hidden = isAfiliado;
  }
  tipoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () { syncTipoRadioChecked(); refreshTipoVisibility(); });
  });
  syncTipoRadioChecked();
  refreshTipoVisibility();

  // ---------- Máscaras ----------
  var afiliadoTelefoneInput = document.getElementById('ncup-afiliado-telefone-input');
  afiliadoTelefoneInput.addEventListener('input', function () {
    var digits = afiliadoTelefoneInput.value.replace(/\D/g, '').slice(0, 13);
    var withoutCountry = digits.length > 11 ? digits.slice(2) : digits;
    var ddd = withoutCountry.slice(0, 2);
    var rest = withoutCountry.slice(2);
    var formatted = '+55';
    if (ddd) formatted += ' (' + ddd + ')';
    if (rest.length > 4) formatted += ' ' + rest.slice(0, rest.length - 4) + '-' + rest.slice(-4);
    else if (rest) formatted += ' ' + rest;
    afiliadoTelefoneInput.value = ddd ? formatted : '+55 ';
  });

  var documentoInput = document.getElementById('ncup-afiliado-documento-input');
  documentoInput.addEventListener('input', function () {
    var digits = documentoInput.value.replace(/\D/g, '').slice(0, 14);
    var formatted;
    if (digits.length <= 11) {
      formatted = digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      formatted = digits.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    documentoInput.value = formatted;
  });

  var codigoInput = document.getElementById('ncup-codigo-input');
  codigoInput.addEventListener('input', function () {
    codigoInput.value = codigoInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  var percentualInput = document.getElementById('ncup-percentual-input');
  percentualInput.addEventListener('input', function () {
    var digits = percentualInput.value.replace(/\D/g, '').slice(0, 3);
    if (Number(digits) > 100) digits = '100';
    percentualInput.value = digits;
  });

  // ---------- Calendário (Data inicial/final de validade) ----------
  var dataInicioPicker = window.NiveloDatePicker.initDay({
    rootId: 'ncup-inicio-field',
    triggerId: 'ncup-inicio-trigger',
    valueId: 'ncup-inicio-value',
    hiddenInputId: 'ncup-inicio-input',
    popoverId: 'ncup-inicio-popover',
    placeholder: 'Selecionar data'
  });
  var dataFimPicker = window.NiveloDatePicker.initDay({
    rootId: 'ncup-fim-field',
    triggerId: 'ncup-fim-trigger',
    valueId: 'ncup-fim-value',
    hiddenInputId: 'ncup-fim-input',
    popoverId: 'ncup-fim-popover',
    placeholder: 'Selecionar data'
  });

  // ---------- Preenchimento em modo edição ----------
  if (isEdicao) {
    document.getElementById('ncup-titulo').textContent = 'Editar cupom';
    document.title = 'Editar Cupom — Painel Administrativo — Nivelo';
    document.getElementById('ncup-tipo-subsection').hidden = true;
    tipoRadios.forEach(function (radio) { radio.checked = radio.value === current.tipo; });
    syncTipoRadioChecked();
    refreshTipoVisibility();

    codigoInput.value = current.codigo;
    codigoInput.disabled = true;
    percentualInput.value = String(current.percentualDesconto);
    dataInicioPicker.setValue(current.dataInicio);
    dataFimPicker.setValue(current.dataFim);

    if (current.tipo === 'afiliado') {
      var a = current.afiliado || {};
      document.getElementById('ncup-afiliado-nome-input').value = a.nomeCompleto || '';
      document.getElementById('ncup-afiliado-email-input').value = a.email || '';
      afiliadoTelefoneInput.value = a.telefone || '';
      documentoInput.value = a.documento || '';
      var comissao = a.comissao || {};
      document.getElementById('ncup-banco-input').value = comissao.banco || '';
      document.getElementById('ncup-agencia-input').value = comissao.agencia || '';
      document.getElementById('ncup-conta-input').value = comissao.conta || '';
      document.getElementById('ncup-pix-input').value = comissao.chavePix || '';
      document.getElementById('ncup-observacoes-input').value = comissao.observacoes || '';
      if (comissao.tipoConta) tipoContaDropdown.reset(comissao.tipoConta, comissao.tipoConta === 'corrente' ? 'Conta corrente' : 'Conta poupança');
    } else {
      document.getElementById('ncup-campanha-nome-input').value = current.nome || '';
    }
  }

  // ---------- Validação + submit ----------
  function setError(fieldId, hasError) {
    document.getElementById(fieldId).classList.toggle('error', hasError);
  }
  function isValidEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
  function isValidDocumento(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length === 11 || digits.length === 14;
  }

  document.getElementById('ncup-form').addEventListener('submit', function (event) {
    event.preventDefault();

    var tipo = tipoAtual();
    var valid = true;

    var codigo = codigoInput.value.trim();
    var codigoInvalido = !codigo || (!isEdicao && window.NiveloCupons.isCodigoDuplicado(codigo));
    setError('ncup-codigo-field', codigoInvalido);
    if (codigoInvalido) valid = false;

    var percentual = Number(percentualInput.value);
    var percentualInvalido = !percentual || percentual < 1 || percentual > 100;
    setError('ncup-percentual-field', percentualInvalido);
    if (percentualInvalido) valid = false;

    var dataInicio = document.getElementById('ncup-inicio-input').value;
    setError('ncup-inicio-field', !dataInicio);
    if (!dataInicio) valid = false;

    var dataFim = document.getElementById('ncup-fim-input').value;
    var fimInvalido = !dataFim || (dataInicio && dataFim < dataInicio);
    setError('ncup-fim-field', fimInvalido);
    if (fimInvalido) valid = false;

    var nome = '';
    var afiliadoPayload = null;

    if (tipo === 'afiliado') {
      var nomeCompleto = document.getElementById('ncup-afiliado-nome-input').value.trim();
      setError('ncup-afiliado-nome-field', !nomeCompleto);
      if (!nomeCompleto) valid = false;

      var email = document.getElementById('ncup-afiliado-email-input').value.trim();
      var emailInvalido = !isValidEmail(email);
      setError('ncup-afiliado-email-field', emailInvalido);
      if (emailInvalido) valid = false;

      var telefone = afiliadoTelefoneInput.value.trim();
      var telefoneInvalido = telefone.replace(/\D/g, '').length < 12;
      setError('ncup-afiliado-telefone-field', telefoneInvalido);
      if (telefoneInvalido) valid = false;

      var documento = documentoInput.value.trim();
      var documentoInvalido = !isValidDocumento(documento);
      setError('ncup-afiliado-documento-field', documentoInvalido);
      if (documentoInvalido) valid = false;

      nome = nomeCompleto;

      var banco = document.getElementById('ncup-banco-input').value.trim();
      var agencia = document.getElementById('ncup-agencia-input').value.trim();
      var conta = document.getElementById('ncup-conta-input').value.trim();
      var chavePix = document.getElementById('ncup-pix-input').value.trim();
      var observacoes = document.getElementById('ncup-observacoes-input').value.trim();
      var tipoConta = document.getElementById('ncup-tipoconta-dropdown').dataset.value || '';
      var temComissao = banco || agencia || conta || chavePix || tipoConta || observacoes;

      afiliadoPayload = {
        nomeCompleto: nomeCompleto,
        email: email,
        telefone: telefone,
        documento: documento,
        comissao: temComissao ? { banco: banco, agencia: agencia, conta: conta, tipoConta: tipoConta, chavePix: chavePix, observacoes: observacoes } : null
      };
    } else {
      var nomeCampanha = document.getElementById('ncup-campanha-nome-input').value.trim();
      setError('ncup-campanha-nome-field', !nomeCampanha);
      if (!nomeCampanha) valid = false;
      nome = nomeCampanha;
    }

    if (!valid) return;

    var payload = {
      tipo: tipo,
      nome: nome,
      percentualDesconto: percentual,
      dataInicio: dataInicio,
      dataFim: dataFim,
      afiliado: afiliadoPayload
    };

    var successMessage;
    if (isEdicao) {
      window.NiveloCupons.update(current.codigo, payload);
      successMessage = { title: 'Cupom atualizado com sucesso', message: codigo + ' foi atualizado.' };
    } else {
      payload.codigo = codigo;
      window.NiveloCupons.add(payload);
      successMessage = { title: 'Cupom cadastrado com sucesso', message: codigo + ' já está disponível na listagem.' };
    }

    try { sessionStorage.setItem('nivelo.novocupom.success', JSON.stringify(successMessage)); } catch (e) {}
    window.location.href = 'cupons.html';
  });
})();
