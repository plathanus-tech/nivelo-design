(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('signup-form');
  var nameField = document.getElementById('name-field');
  var nameInput = document.getElementById('signup-name');
  var nameErrorText = document.querySelector('.name-error-text');
  var cpfField = document.getElementById('cpf-field');
  var cpfInput = document.getElementById('signup-cpf');
  var cpfErrorText = document.querySelector('.cpf-error-text');
  var phoneField = document.getElementById('phone-field');
  var phoneInput = document.getElementById('signup-phone');
  var phoneErrorText = document.querySelector('.phone-error-text');
  var newpassField = document.getElementById('newpass-field');
  var newpassInput = document.getElementById('signup-password');
  var newpassErrorText = document.querySelector('.newpass-error-text');
  var confirmField = document.getElementById('confirmpass-field');
  var confirmInput = document.getElementById('signup-confirm-password');
  var confirmErrorText = document.querySelector('.confirmpass-error-text');
  var criteriaItems = Array.prototype.slice.call(document.querySelectorAll('.pwd-criteria-item'));
  var submitBtn = document.getElementById('signup-submit');

  // ---------- Documento único (CPF ou CNPJ): máscara auto-detectada por
  // tamanho, mesma técnica já usada em login.js/novo-manifesto.js — formata
  // como CPF enquanto tiver até 11 dígitos, vira CNPJ a partir do 12º. ----------
  function formatCPF(digits) {
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '.' + digits.slice(3, 6);
    if (digits.length > 6) out += '.' + digits.slice(6, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    return out;
  }
  function formatCNPJ(digits) {
    var out = digits.slice(0, 2);
    if (digits.length > 2) out += '.' + digits.slice(2, 5);
    if (digits.length > 5) out += '.' + digits.slice(5, 8);
    if (digits.length > 8) out += '/' + digits.slice(8, 12);
    if (digits.length > 12) out += '-' + digits.slice(12, 14);
    return out;
  }
  function formatCpfCnpjAuto(value) {
    var digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.length > 11 ? formatCNPJ(digits) : formatCPF(digits);
  }

  function isValidCPF(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    function checkDigit(base) {
      var sum = 0;
      for (var i = 0; i < base.length; i++) {
        sum += parseInt(base.charAt(i), 10) * (base.length + 1 - i);
      }
      var rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    }

    var d1 = checkDigit(digits.slice(0, 9));
    var d2 = checkDigit(digits.slice(0, 9) + d1);
    return digits.slice(9, 11) === String(d1) + String(d2);
  }

  function isValidCNPJ(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;

    function checkDigit(base, weights) {
      var sum = 0;
      for (var i = 0; i < base.length; i++) {
        sum += parseInt(base.charAt(i), 10) * weights[i];
      }
      var rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    }

    var w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var base = digits.slice(0, 12);
    var d1 = checkDigit(base, w1);
    var d2 = checkDigit(base + d1, w2);
    return digits.slice(12, 14) === String(d1) + String(d2);
  }

  function isValidCPF_orCNPJ(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length > 11 ? isValidCNPJ(value) : isValidCPF(value);
  }

  cpfInput.addEventListener('input', function () {
    cpfInput.value = formatCpfCnpjAuto(cpfInput.value);
    if (cpfField.classList.contains('error')) setFieldError(cpfField, !isValidCPF_orCNPJ(cpfInput.value));
  });
  cpfInput.addEventListener('blur', function () {
    if (!cpfInput.value) { setFieldError(cpfField, false); return; }
    setFieldError(cpfField, !isValidCPF_orCNPJ(cpfInput.value));
  });

  // ---------- Máscara de telefone (mesma regra de Recuperar Senha) ----------
  function formatPhone(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    var out = digits;
    if (digits.length > 0) out = '(' + digits.slice(0, 2);
    if (digits.length >= 2) out += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
    if (digits.length > 6) out += '-' + digits.slice(digits.length > 10 ? 7 : 6, 11);
    return out;
  }

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
    if (phoneField.classList.contains('error')) setFieldError(phoneField, !isValidPhone(phoneInput.value));
  });

  function setFieldError(field, hasError, message, errorTextEl) {
    field.classList.toggle('error', hasError);
    var input = field.querySelector('.input');
    if (input) input.setAttribute('aria-invalid', String(hasError));
    if (message && errorTextEl) errorTextEl.textContent = message;
  }

  nameInput.addEventListener('input', function () {
    if (nameField.classList.contains('error') && nameInput.value) setFieldError(nameField, false);
  });

  // ---------- Regras de senha (mesma regra de Criar Nova Senha) ----------
  var RULES = {
    length: function (v) { return v.length >= 8; },
    upper: function (v) { return /[A-Z]/.test(v); },
    lower: function (v) { return /[a-z]/.test(v); },
    number: function (v) { return /[0-9]/.test(v); },
    special: function (v) { return /[^A-Za-z0-9]/.test(v); }
  };

  function checkCriteria(value) {
    var allMet = true;
    criteriaItems.forEach(function (item) {
      var rule = RULES[item.dataset.rule];
      var met = rule ? rule(value) : false;
      item.classList.toggle('met', met);
      if (!met) allMet = false;
    });
    return allMet;
  }

  function passwordsMatch() {
    return newpassInput.value.length > 0 && newpassInput.value === confirmInput.value;
  }

  function setMismatch(hasMismatch) {
    confirmField.classList.toggle('error', hasMismatch);
    newpassField.classList.toggle('mismatch', hasMismatch);
    confirmInput.setAttribute('aria-invalid', String(hasMismatch));
  }

  newpassInput.addEventListener('input', function () {
    setFieldError(newpassField, false);
    checkCriteria(newpassInput.value);
    if (confirmInput.value) {
      var matchOk = passwordsMatch();
      setMismatch(!matchOk);
      if (matchOk) confirmErrorText.textContent = 'As senhas informadas não coincidem.';
    }
  });

  confirmInput.addEventListener('input', function () {
    setMismatch(confirmInput.value.length > 0 && !passwordsMatch());
  });

  // ---------- Mostrar/ocultar senha (2 campos independentes) ----------
  function wireToggle(buttonId, input) {
    var btn = document.getElementById(buttonId);
    btn.addEventListener('click', function () {
      var visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(visible));
      btn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
      btn.innerHTML = '<i data-lucide="' + (visible ? 'eye-off' : 'eye') + '" width="18" height="18"></i>';
      if (window.lucide) lucide.createIcons();
    });
  }
  wireToggle('toggle-signup-password', newpassInput);
  wireToggle('toggle-signup-confirm-password', confirmInput);

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var hasError = false;

    if (!nameInput.value.trim()) {
      setFieldError(nameField, true, 'Informe seu nome.', nameErrorText);
      hasError = true;
    }
    if (!cpfInput.value) {
      setFieldError(cpfField, true, 'Informe seu CPF ou CNPJ.', cpfErrorText);
      hasError = true;
    } else if (!isValidCPF_orCNPJ(cpfInput.value)) {
      setFieldError(cpfField, true, 'Informe um CPF ou CNPJ válido.', cpfErrorText);
      hasError = true;
    }
    if (!phoneInput.value) {
      setFieldError(phoneField, true, 'Informe seu telefone.', phoneErrorText);
      hasError = true;
    } else if (!isValidPhone(phoneInput.value)) {
      setFieldError(phoneField, true, 'Informe um telefone válido.', phoneErrorText);
      hasError = true;
    }
    if (!newpassInput.value) {
      setFieldError(newpassField, true, 'Crie sua senha.', newpassErrorText);
      hasError = true;
    } else if (!checkCriteria(newpassInput.value)) {
      hasError = true;
    }
    if (!confirmInput.value || !passwordsMatch()) {
      setMismatch(true);
      hasError = true;
    }

    if (hasError) return;

    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;

    window.setTimeout(function () {
      try {
        sessionStorage.setItem('nivelo.signup.name', nameInput.value.trim());
        sessionStorage.setItem('nivelo.signup.phone', phoneInput.value);
      } catch (e) {}
      window.location.href = 'cadastro-validar-telefone.html';
    }, 500);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | required | criteriaunmet | mismatch
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'required') {
    setFieldError(nameField, true, 'Informe seu nome.', nameErrorText);
    setFieldError(cpfField, true, 'Informe seu CPF ou CNPJ.', cpfErrorText);
    setFieldError(phoneField, true, 'Informe seu telefone.', phoneErrorText);
    setFieldError(newpassField, true, 'Crie sua senha.', newpassErrorText);
  }

  if (state === 'criteriaunmet') {
    newpassInput.value = 'abc';
    checkCriteria(newpassInput.value);
  }

  if (state === 'mismatch') {
    newpassInput.value = 'Segura@123';
    confirmInput.value = 'Diferente@456';
    checkCriteria(newpassInput.value);
    setMismatch(true);
  }
})();
