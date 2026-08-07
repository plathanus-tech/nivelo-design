(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('admin-login-form');
  var emailField = document.getElementById('admin-email-field');
  var emailInput = document.getElementById('admin-login-email');
  var passwordField = document.getElementById('admin-password-field');
  var passwordInput = document.getElementById('admin-login-password');
  var toggleBtn = document.getElementById('admin-toggle-password');
  var rememberCheckbox = document.getElementById('admin-login-remember');
  var rememberWrapper = rememberCheckbox.closest('.admin-login-checkbox');
  var errorBanner = document.getElementById('admin-login-error-banner');
  var successBanner = document.getElementById('admin-login-success-banner');
  var submitBtn = document.getElementById('admin-login-submit');

  // ---------- Validação de e-mail ----------
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function setFieldError(field, hasError) {
    field.classList.toggle('error', hasError);
    var input = field.querySelector('.input');
    input.setAttribute('aria-invalid', String(hasError));
  }

  emailInput.addEventListener('blur', function () {
    if (!emailInput.value) { setFieldError(emailField, false); return; }
    setFieldError(emailField, !isValidEmail(emailInput.value));
  });
  emailInput.addEventListener('input', function () {
    if (emailField.classList.contains('error')) setFieldError(emailField, !isValidEmail(emailInput.value));
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
  // idle (padrão) | invalid | loading | error | passwordchanged
  // Hash, não query string — mesmo motivo já documentado em
  // app/shared/login.js (sobrevive a qualquer redirect de servidor
  // estático). Só pra navegar entre variantes no protótipo; nenhuma
  // lógica de autenticação real.
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';
  form.setAttribute('data-state', state === 'passwordchanged' ? 'idle' : state);

  if (state === 'invalid') {
    emailInput.value = 'admin@invalido';
    setFieldError(emailField, true);
    passwordInput.value = '123';
    setFieldError(passwordField, true);
  }

  if (state === 'error') {
    errorBanner.hidden = false;
  }

  if (state === 'passwordchanged') {
    successBanner.hidden = false;
  }

  if (state === 'loading') {
    submitBtn.disabled = true;
    emailInput.disabled = true;
    passwordInput.disabled = true;
    rememberCheckbox.disabled = true;
    rememberWrapper.classList.add('disabled');
    toggleBtn.disabled = true;
  }
})();
