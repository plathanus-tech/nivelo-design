(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('admin-newpass-form');
  var newpassField = document.getElementById('admin-newpass-field');
  var newpassInput = document.getElementById('admin-new-password');
  var newpassErrorText = document.querySelector('.admin-newpass-error-text');
  var confirmField = document.getElementById('admin-confirmpass-field');
  var confirmInput = document.getElementById('admin-confirm-password');
  var confirmErrorText = document.querySelector('.admin-confirmpass-error-text');
  var criteriaItems = Array.prototype.slice.call(document.querySelectorAll('.pwd-criteria-item'));
  var submitBtn = document.getElementById('admin-newpass-submit');
  var sameAsOldBanner = document.getElementById('admin-same-as-old-banner');
  var saveErrorBanner = document.getElementById('admin-save-error-banner');

  var RULES = {
    length: function (v) { return v.length >= 8; },
    upper: function (v) { return /[A-Z]/.test(v); },
    lower: function (v) { return /[a-z]/.test(v); },
    number: function (v) { return /[0-9]/.test(v); },
    special: function (v) { return /[^A-Za-z0-9]/.test(v); }
  };

  // Preparado para o futuro: hoje não há como saber a senha anterior no
  // protótipo (sem backend), então sempre retorna false.
  function isSameAsOldPassword(_value) {
    return false;
  }

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

  function updateSubmitState() {
    var criteriaOk = checkCriteria(newpassInput.value);
    var matchOk = passwordsMatch();
    submitBtn.disabled = !(criteriaOk && matchOk && confirmInput.value.length > 0);
    return { criteriaOk: criteriaOk, matchOk: matchOk };
  }

  function setMismatch(hasMismatch) {
    confirmField.classList.toggle('error', hasMismatch);
    newpassField.classList.toggle('mismatch', hasMismatch);
    confirmInput.setAttribute('aria-invalid', String(hasMismatch));
  }

  function setRequired(field, input, hasError, message, errorTextEl) {
    field.classList.toggle('error', hasError);
    input.setAttribute('aria-invalid', String(hasError));
    if (message && errorTextEl) errorTextEl.textContent = message;
  }

  newpassInput.addEventListener('input', function () {
    setRequired(newpassField, newpassInput, false);
    var state = updateSubmitState();
    if (confirmInput.value) {
      setMismatch(!state.matchOk);
      if (state.matchOk) confirmErrorText.textContent = 'As senhas informadas não coincidem.';
    }
  });

  confirmInput.addEventListener('input', function () {
    var state = updateSubmitState();
    setMismatch(confirmInput.value.length > 0 && !state.matchOk);
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
  wireToggle('admin-toggle-new-password', newpassInput);
  wireToggle('admin-toggle-confirm-password', confirmInput);

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!newpassInput.value) {
      setRequired(newpassField, newpassInput, true, 'Informe sua nova senha.', newpassErrorText);
      return;
    }
    if (!confirmInput.value) {
      setRequired(confirmField, confirmInput, true, 'Confirme sua nova senha.', confirmErrorText);
      return;
    }

    var state = updateSubmitState();
    if (!state.matchOk) {
      setMismatch(true);
      confirmErrorText.textContent = 'As senhas informadas não coincidem.';
      return;
    }
    if (!state.criteriaOk) return;

    if (isSameAsOldPassword(newpassInput.value)) {
      sameAsOldBanner.hidden = false;
      return;
    }

    saveErrorBanner.hidden = true;
    sameAsOldBanner.hidden = true;
    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;

    /* Sem dashboard administrativo ainda (fora de escopo desta etapa) — a
       confirmação de sucesso + retorno ao login (etapas 5 e 6 do fluxo
       pedido) são resolvidas na própria tela de login, via banner de
       sucesso ativado por #state=passwordchanged. */
    window.setTimeout(function () {
      try {
        sessionStorage.removeItem('nivelo.admin.recovery.email');
      } catch (e) {}
      window.location.href = 'login.html#state=passwordchanged';
    }, 700);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | required | criteriaunmet | mismatch | sameasold | saveerror
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'required') {
    setRequired(newpassField, newpassInput, true, 'Informe sua nova senha.', newpassErrorText);
    setRequired(confirmField, confirmInput, true, 'Confirme sua nova senha.', confirmErrorText);
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

  if (state === 'sameasold') {
    newpassInput.value = 'Segura@123';
    confirmInput.value = 'Segura@123';
    checkCriteria(newpassInput.value);
    sameAsOldBanner.hidden = false;
  }

  if (state === 'saveerror') {
    newpassInput.value = 'Segura@123';
    confirmInput.value = 'Segura@123';
    checkCriteria(newpassInput.value);
    saveErrorBanner.hidden = false;
  }

  updateSubmitState();
})();
