(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('login-form');
  var cpfField = document.getElementById('cpf-field');
  var cpfInput = document.getElementById('login-cpf');
  var passwordField = document.getElementById('password-field');
  var passwordInput = document.getElementById('login-password');
  var toggleBtn = document.getElementById('toggle-password');
  var rememberCheckbox = document.getElementById('login-remember');
  var rememberWrapper = rememberCheckbox.closest('.login-checkbox');
  var errorBanner = document.getElementById('login-error-banner');
  var submitBtn = document.getElementById('login-submit');

  // ---------- Máscara de CPF ----------
  function formatCPF(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '.' + digits.slice(3, 6);
    if (digits.length > 6) out += '.' + digits.slice(6, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    return out;
  }

  cpfInput.addEventListener('input', function () {
    cpfInput.value = formatCPF(cpfInput.value);
  });

  // ---------- Validação de CPF (dígitos verificadores) ----------
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

  function setFieldError(field, hasError) {
    field.classList.toggle('error', hasError);
    var input = field.querySelector('.input');
    input.setAttribute('aria-invalid', String(hasError));
  }

  cpfInput.addEventListener('blur', function () {
    if (!cpfInput.value) { setFieldError(cpfField, false); return; }
    setFieldError(cpfField, !isValidCPF(cpfInput.value));
  });
  cpfInput.addEventListener('input', function () {
    if (cpfField.classList.contains('error')) setFieldError(cpfField, !isValidCPF(cpfInput.value));
  });

  // ---------- Mostrar/ocultar senha ----------
  function setPasswordVisible(visible) {
    passwordInput.type = visible ? 'text' : 'password';
    toggleBtn.setAttribute('aria-pressed', String(visible));
    toggleBtn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
    toggleBtn.innerHTML = '<i data-lucide="' + (visible ? 'eye-off' : 'eye') + '" width="18" height="18"></i>';
    if (window.lucide) lucide.createIcons();
  }

  toggleBtn.addEventListener('click', function () {
    setPasswordVisible(passwordInput.type === 'password');
  });

  // ---------- Checkbox "Lembrar-me" ----------
  rememberCheckbox.addEventListener('change', function () {
    rememberWrapper.classList.toggle('checked', rememberCheckbox.checked);
  });

  // ---------- Submit (sem lógica de autenticação real) ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | invalid | loading | error
  // Usa hash (não query string) de propósito: o servidor estático deste
  // protótipo (`serve`) redireciona *.html?query pra *.html sem a query
  // string (recurso de "clean URLs"), o que apagaria o estado. Hash nunca
  // é enviado ao servidor, então sobrevive a qualquer redirect.
  // Só serve pra navegar entre variantes no protótipo (prototype-nav);
  // não representa nenhuma lógica de autenticação real.
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';
  form.setAttribute('data-state', state);

  if (state === 'invalid') {
    cpfInput.value = formatCPF('12345678900');
    setFieldError(cpfField, true);
    passwordInput.value = '123';
    setFieldError(passwordField, true);
  }

  if (state === 'error') {
    errorBanner.hidden = false;
  }

  if (state === 'loading') {
    submitBtn.disabled = true;
    cpfInput.disabled = true;
    passwordInput.disabled = true;
    rememberCheckbox.disabled = true;
    rememberWrapper.classList.add('disabled');
    toggleBtn.disabled = true;
  }
})();
