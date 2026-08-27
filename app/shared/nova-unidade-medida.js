(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de nova-categoria-financeira.js) ----------
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
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
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
      updateResultado();
    }

    function selectValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
    }

    function setOptions(html) {
      menu.innerHTML = html;
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

    return { selectOption: selectOption, selectValue: selectValue, setOptions: setOptions, root: root };
  }

  // ---------- Campos ----------
  var nomeField = document.getElementById('nome-field');
  var nomeInput = document.getElementById('um-nome');
  var siglaField = document.getElementById('sigla-field');
  var siglaInput = document.getElementById('um-sigla');
  var descricaoInput = document.getElementById('um-descricao');
  var statusField = document.getElementById('status-field');
  var correspondeAField = document.getElementById('corresponde-a-field');
  var correspondeAInput = document.getElementById('um-corresponde-a');
  var correspondeALabel = document.getElementById('corresponde-a-label');
  var unidadeBaseField = document.getElementById('unidade-base-field');
  var resultadoEl = document.getElementById('unidmed-form-resultado');

  var statusDropdown = initDropdown(statusField);
  var unidadeBaseDropdown = initDropdown(unidadeBaseField);

  // Unidade base: só as unidades "sistema" (KG/LT/UN) servem de referência
  // de conversão — sourced do catálogo central, não hardcoded aqui, pra
  // continuar correto se o conjunto de unidades base crescer no futuro.
  unidadeBaseDropdown.setOptions(
    window.NiveloUnidadesMedida.listBase().map(function (u) {
      return '<div class="option" data-value="' + u.sigla + '">' + u.sigla + ' — ' + u.nome + '</div>';
    }).join('')
  );

  // Sigla sempre maiúscula ao digitar.
  siglaInput.addEventListener('input', function () {
    var start = siglaInput.selectionStart;
    siglaInput.value = siglaInput.value.toUpperCase();
    siglaInput.setSelectionRange(start, start);
    if (siglaField.classList.contains('error') && siglaInput.value.trim()) siglaField.classList.remove('error');
    updateResultado();
  });

  nomeInput.addEventListener('input', function () {
    if (nomeField.classList.contains('error') && nomeInput.value.trim()) nomeField.classList.remove('error');
    updateResultadoLabel();
    updateResultado();
  });

  correspondeAInput.addEventListener('input', function () {
    if (correspondeAField.classList.contains('error') && Number(correspondeAInput.value) > 0) {
      correspondeAField.classList.remove('error');
    }
    updateResultado();
  });

  // ---------- Rótulo dinâmico: "1 unidade corresponde a" vira
  // "1 <Nome digitado> corresponde a" (pedido explícito: nunca falar em
  // "fator de conversão", sempre essa frase). ----------
  function updateResultadoLabel() {
    var nome = nomeInput.value.trim();
    correspondeALabel.textContent = '1 ' + (nome || 'unidade') + ' corresponde a';
  }

  // ---------- Resultado ao vivo ("1 CX = 50 UN") — só aparece quando os 4
  // ingredientes (Sigla/Corresponde a/Unidade base) já foram informados,
  // reforçando o conceito com um exemplo concreto em tempo real. ----------
  function updateResultado() {
    var sigla = siglaInput.value.trim();
    var quantidade = correspondeAInput.value;
    var baseSigla = unidadeBaseField.dataset.value;
    if (!sigla || !quantidade || !baseSigla) {
      resultadoEl.hidden = true;
      return;
    }
    var quantidadeText = quantidade.toString().replace('.', ',');
    resultadoEl.textContent = 'Resultado: 1 ' + sigla + ' = ' + quantidadeText + ' ' + baseSigla;
    resultadoEl.hidden = false;
  }

  updateResultadoLabel();

  // ---------- Modo edição (?sigla=SC) vs. criação ----------
  var params = new URLSearchParams(location.search);
  var editSigla = params.get('sigla');
  var editingUnidade = editSigla ? window.NiveloUnidadesMedida.findBySigla(editSigla) : null;
  // Unidades "sistema" (KG/LT/UN) não têm tela de edição — sem caminho de UI
  // que aponte pra cá com a sigla delas (Ações mostra só "Padrão do
  // sistema"), mas se alguém navegar direto pela URL, trata como criação
  // nova em vez de deixar editar um registro protegido.
  if (editingUnidade && editingUnidade.sistema) editingUnidade = null;

  function fillForm(unidade) {
    nomeInput.value = unidade.nome;
    siglaInput.value = unidade.sigla;
    descricaoInput.value = unidade.descricaoComplementar || '';
    statusDropdown.selectValue(unidade.ativo ? 'ativa' : 'inativa');
    correspondeAInput.value = unidade.correspondeA;
    unidadeBaseDropdown.selectValue(unidade.unidadeBaseSigla);
    updateResultadoLabel();
    updateResultado();
  }

  if (editingUnidade) {
    document.getElementById('unidmed-form-page-title').textContent = 'Editar unidade de medida';
    document.getElementById('unidmed-form-page-subtitle').textContent = 'Altere o nome da unidade e quanto ela representa na unidade base.';
    document.title = 'Editar unidade de medida — Nivelo';
    document.getElementById('unidmed-form-submit').textContent = 'Salvar alterações';
    fillForm(editingUnidade);
  }

  // ---------- Validação + envio ----------
  var form = document.getElementById('unidmed-form');

  function runValidation() {
    var nomeInvalid = !nomeInput.value.trim();
    nomeField.classList.toggle('error', nomeInvalid);

    var siglaInvalid = !siglaInput.value.trim() ||
      window.NiveloUnidadesMedida.isSiglaDuplicada(siglaInput.value, editingUnidade ? editingUnidade.sigla : null);
    siglaField.classList.toggle('error', siglaInvalid);

    var correspondeAInvalid = !(Number(correspondeAInput.value) > 0);
    correspondeAField.classList.toggle('error', correspondeAInvalid);

    var unidadeBaseInvalid = !unidadeBaseField.dataset.value;
    unidadeBaseField.classList.toggle('error', unidadeBaseInvalid);

    return !nomeInvalid && !siglaInvalid && !correspondeAInvalid && !unidadeBaseInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var payload = {
      nome: nomeInput.value.trim(),
      sigla: siglaInput.value.trim(),
      descricaoComplementar: descricaoInput.value.trim(),
      correspondeA: Number(correspondeAInput.value),
      unidadeBaseSigla: unidadeBaseField.dataset.value,
      ativo: statusField.dataset.value !== 'inativa'
    };

    var message;
    try {
      if (editingUnidade) {
        window.NiveloUnidadesMedida.update(editingUnidade.sigla, payload);
        message = 'Unidade de medida editada com sucesso.';
      } else {
        window.NiveloUnidadesMedida.add(payload);
        message = 'Unidade de medida cadastrada com sucesso.';
      }
      sessionStorage.setItem('nivelo.novaunidade.success', message);
    } catch (e) {}

    window.location.href = 'unidades-medida.html';
  });
})();
