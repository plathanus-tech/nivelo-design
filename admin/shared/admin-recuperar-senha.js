(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('admin-recover-form');
  var emailField = document.getElementById('admin-recover-email-field');
  var emailInput = document.getElementById('admin-recover-email');
  var emailErrorText = emailField.querySelector('.admin-recover-email-error-text');
  var sendErrorBanner = document.getElementById('admin-send-error-banner');
  var submitBtn = document.getElementById('admin-recover-submit');
  var backLink = document.getElementById('admin-back-to-login-link');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function setFieldError(hasError, message) {
    emailField.classList.toggle('error', hasError);
    emailInput.setAttribute('aria-invalid', String(hasError));
    if (message) emailErrorText.textContent = message;
  }

  emailInput.addEventListener('input', function () {
    if (emailField.classList.contains('error') && emailInput.value) {
      setFieldError(!isValidEmail(emailInput.value), 'Informe um e-mail válido.');
    }
  });

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!emailInput.value) {
      setFieldError(true, 'Informe seu e-mail.');
      return;
    }
    if (!isValidEmail(emailInput.value)) {
      setFieldError(true, 'Informe um e-mail válido.');
      return;
    }

    setFieldError(false);
    sendErrorBanner.hidden = true;

    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;
    emailInput.disabled = true;
    backLink.setAttribute('aria-disabled', 'true');
    backLink.tabIndex = -1;

    window.setTimeout(function () {
      try {
        sessionStorage.setItem('nivelo.admin.recovery.email', emailInput.value);
      } catch (e) {}

      window.location.href = 'codigo-verificacao.html';
    }, 700);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | required | invalid | senderror
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'required') {
    setFieldError(true, 'Informe seu e-mail.');
  }

  if (state === 'invalid') {
    emailInput.value = 'admin@invalido';
    setFieldError(true, 'Informe um e-mail válido.');
  }

  if (state === 'senderror') {
    emailInput.value = 'admin@nivelo.com.br';
    sendErrorBanner.hidden = false;
    form.setAttribute('data-state', 'senderror');
  }
})();
