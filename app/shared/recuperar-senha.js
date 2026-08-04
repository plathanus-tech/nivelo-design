(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('recover-form');
  var phoneField = document.getElementById('phone-field');
  var phoneInput = document.getElementById('recover-phone');
  var phoneErrorText = phoneField.querySelector('.phone-error-text');
  var sendErrorBanner = document.getElementById('send-error-banner');
  var submitBtn = document.getElementById('recover-submit');
  var backLink = document.getElementById('back-to-login-link');

  // ---------- Máscara de telefone (BR) ----------
  function formatPhone(value) {
    var digits = value.replace(/\D/g, '').slice(0, 11);
    var out = digits;
    if (digits.length > 0) out = '(' + digits.slice(0, 2);
    if (digits.length >= 2) out += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
    if (digits.length > 6) out += '-' + digits.slice(digits.length > 10 ? 7 : 6, 11);
    return out;
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11;
  }

  function setFieldError(hasError, message) {
    phoneField.classList.toggle('error', hasError);
    phoneInput.setAttribute('aria-invalid', String(hasError));
    if (message) phoneErrorText.textContent = message;
  }

  phoneInput.addEventListener('input', function () {
    if (phoneField.classList.contains('error') && phoneInput.value) {
      setFieldError(!isValidPhone(phoneInput.value), 'Informe um telefone válido.');
    }
  });

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!phoneInput.value) {
      setFieldError(true, 'Informe seu telefone.');
      return;
    }
    if (!isValidPhone(phoneInput.value)) {
      setFieldError(true, 'Informe um telefone válido.');
      return;
    }

    setFieldError(false);
    sendErrorBanner.hidden = true;

    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;
    phoneInput.disabled = true;
    backLink.setAttribute('aria-disabled', 'true');
    backLink.tabIndex = -1;

    window.setTimeout(function () {
      try {
        sessionStorage.setItem('nivelo.recovery.phone', phoneInput.value);
      } catch (e) {}

      window.location.href = 'codigo-verificacao.html';
    }, 700);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | required | invalid | senderror
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'required') {
    setFieldError(true, 'Informe seu telefone.');
  }

  if (state === 'invalid') {
    phoneInput.value = formatPhone('1199990');
    setFieldError(true, 'Informe um telefone válido.');
  }

  if (state === 'senderror') {
    phoneInput.value = formatPhone('11987654321');
    sendErrorBanner.hidden = false;
    form.setAttribute('data-state', 'senderror');
  }
})();
