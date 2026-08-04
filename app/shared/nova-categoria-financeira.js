(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de novo-produto.js/
  // novo-estoque.js/cadastros.js: wrapper/trigger/menu/option, menu em
  // `position:fixed` calculado via JS pra escapar do `overflow:hidden` de
  // `.card`). ----------
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
    }

    function selectValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
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

    return { selectOption: selectOption, selectValue: selectValue, root: root };
  }

  // ---------- Campos ----------
  var codigoInput = document.getElementById('nc-codigo');
  var descricaoField = document.getElementById('descricao-field');
  var descricaoInput = document.getElementById('nc-descricao');
  var grupoField = document.getElementById('grupo-field');
  var consideraDreRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="considera-dre"]'));
  var classificacaoDreField = document.getElementById('classificacao-dre-field');
  var consideraLcdprRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="considera-lcdpr"]'));
  var competenciaField = document.getElementById('competencia-field');

  var grupoDropdown = initDropdown(grupoField);
  var classificacaoDreDropdown = initDropdown(classificacaoDreField);
  var competenciaDropdown = initDropdown(competenciaField);

  // ---------- Considera no DRE: mostra/esconde Classificação no DRE (mesma
  // técnica de `refreshControlaEstoqueVisibility()` já usada em
  // novo-produto.js). ----------
  function getConsideraDre() {
    var checked = consideraDreRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'sim';
  }

  function syncRadioChecked(radios) {
    radios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function refreshClassificacaoDreVisibility() {
    var considera = getConsideraDre() === 'sim';
    classificacaoDreField.hidden = !considera;
    if (!considera) classificacaoDreField.classList.remove('error');
  }

  consideraDreRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncRadioChecked(consideraDreRadios);
      refreshClassificacaoDreVisibility();
    });
  });
  syncRadioChecked(consideraDreRadios);
  refreshClassificacaoDreVisibility();

  consideraLcdprRadios.forEach(function (radio) {
    radio.addEventListener('change', function () { syncRadioChecked(consideraLcdprRadios); });
  });
  syncRadioChecked(consideraLcdprRadios);

  // ---------- Erros somem ao corrigir ----------
  descricaoInput.addEventListener('input', function () {
    if (descricaoField.classList.contains('error') && descricaoInput.value.trim()) {
      descricaoField.classList.remove('error');
    }
  });

  // ---------- Modo edição (?codigo=CAT-001) vs. criação ----------
  var params = new URLSearchParams(location.search);
  var editCodigo = params.get('codigo');
  var editingCategoria = editCodigo ? window.NiveloCategoriasFinanceiras.findByCodigo(editCodigo) : null;

  function fillForm(categoria) {
    codigoInput.value = categoria.codigo;
    descricaoInput.value = categoria.descricao;
    grupoDropdown.selectValue(categoria.grupo);

    var dreRadio = document.querySelector('input[name="considera-dre"][value="' + (categoria.consideraDre ? 'sim' : 'nao') + '"]');
    if (dreRadio) dreRadio.checked = true;
    syncRadioChecked(consideraDreRadios);
    refreshClassificacaoDreVisibility();
    if (categoria.consideraDre && categoria.classificacaoDre) {
      classificacaoDreDropdown.selectValue(categoria.classificacaoDre);
    }

    var lcdprRadio = document.querySelector('input[name="considera-lcdpr"][value="' + (categoria.consideraLcdpr ? 'sim' : 'nao') + '"]');
    if (lcdprRadio) lcdprRadio.checked = true;
    syncRadioChecked(consideraLcdprRadios);

    competenciaDropdown.selectValue(categoria.competenciaPadrao);
  }

  if (editingCategoria) {
    document.getElementById('nova-categoria-page-title').textContent = 'Editar categoria';
    document.title = 'Editar categoria — Nivelo';
    document.getElementById('nova-categoria-submit').textContent = 'Salvar alterações';
    fillForm(editingCategoria);
  } else {
    // Preview cosmético de "Código" — o valor real (`CAT-NNN`) só é gerado
    // de verdade dentro de `NiveloCategoriasFinanceiras.add()` ao salvar,
    // mesmo escopo do resto do formulário (mesma convenção de novo-produto.js).
    codigoInput.value = 'Automático';
  }

  // ---------- Validação + envio ----------
  var form = document.getElementById('nova-categoria-form');

  function runValidation() {
    var descricaoInvalid = !descricaoInput.value.trim();
    descricaoField.classList.toggle('error', descricaoInvalid);

    var grupoInvalid = !grupoField.dataset.value;
    grupoField.classList.toggle('error', grupoInvalid);

    var considera = getConsideraDre() === 'sim';
    var classificacaoDreInvalid = considera && !classificacaoDreField.dataset.value;
    classificacaoDreField.classList.toggle('error', classificacaoDreInvalid);

    return !descricaoInvalid && !grupoInvalid && !classificacaoDreInvalid;
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

    var consideraDre = getConsideraDre() === 'sim';
    var consideraLcdpr = consideraLcdprRadios.filter(function (r) { return r.checked; })[0].value === 'sim';
    var payload = {
      descricao: descricaoInput.value.trim(),
      grupo: grupoField.dataset.value,
      consideraDre: consideraDre,
      classificacaoDre: consideraDre ? classificacaoDreField.dataset.value : null,
      consideraLcdpr: consideraLcdpr,
      competenciaPadrao: competenciaField.dataset.value || 'sem-competencia'
    };

    var message;
    try {
      if (editingCategoria) {
        window.NiveloCategoriasFinanceiras.update(editingCategoria.codigo, payload);
        message = 'Categoria editada com sucesso.';
      } else {
        window.NiveloCategoriasFinanceiras.add(payload);
        message = 'Categoria cadastrada com sucesso.';
      }
      sessionStorage.setItem('nivelo.novacategoria.success', message);
    } catch (e) {}

    window.location.href = 'categorias-financeiras.html';
  });
})();
