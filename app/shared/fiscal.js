(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STORAGE_KEY = 'nivelo.fiscal.notaEntrada.autoReceber';
  var form = document.getElementById('nota-entrada-field');
  var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="nota-entrada-auto"]'));
  var salvarBtn = document.getElementById('nota-entrada-salvar');
  var toastRegion = document.getElementById('toast-region');

  function syncRadioChecked() {
    radios.forEach(function (input) {
      input.closest('.option').classList.toggle('checked', input.checked);
    });
  }

  function getValue() {
    var checked = form.querySelector('input[name="nota-entrada-auto"]:checked');
    return checked ? checked.value : 'nao';
  }

  function setValue(value) {
    radios.forEach(function (input) { input.checked = input.value === value; });
    syncRadioChecked();
  }

  // ---------- Carrega preferência salva (localStorage — configuração da
  // conta, sobrevive a reload, mesma convenção de categorias-financeiras-
  // data.js/safras-data.js). ----------
  var saved = null;
  try { saved = window.localStorage.getItem(STORAGE_KEY); } catch (e) {}
  setValue(saved === 'sim' ? 'sim' : 'nao');

  radios.forEach(function (input) {
    input.addEventListener('change', syncRadioChecked);
  });

  function showToast() {
    var alertEl = document.createElement('div');
    alertEl.className = 'alert success fis-toast';
    alertEl.setAttribute('role', 'status');
    alertEl.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">Preferência salva com sucesso.</div>' +
      '</div>' +
      '<button type="button" class="closeBtn" aria-label="Fechar"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.innerHTML = '';
    toastRegion.appendChild(alertEl);
    if (window.lucide) lucide.createIcons();

    var dismiss = function () { alertEl.remove(); };
    alertEl.querySelector('.closeBtn').addEventListener('click', dismiss);
    window.setTimeout(dismiss, 6000);
  }

  salvarBtn.addEventListener('click', function () {
    var value = getValue();
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    showToast();
  });
})();
