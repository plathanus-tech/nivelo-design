(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('nnop-form');
  var pageTitle = document.getElementById('nnop-page-title');
  var presetsSection = document.getElementById('nnop-presets-section');

  var params = new URLSearchParams(location.search);
  var editCodigo = params.get('codigo');
  var isEditMode = !!editCodigo;

  if (isEditMode) {
    pageTitle.textContent = 'Editar Natureza de Operação';
    presetsSection.hidden = true;
  }

  // ---------- Dropdown genérico (mesmo padrão de Categorias/Produtos/
  // Cadastro: position:fixed via JS, escapa de qualquer overflow do card). ----------
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
    function clearError() {
      root.classList.remove('error');
    }
    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      clearError();
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

    function setValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
    }

    return { setValue: setValue, getValue: function () { return root.dataset.value || ''; } };
  }

  var tipoDropdown = initDropdown(document.getElementById('tipo-field'));
  var regimeDropdown = initDropdown(document.getElementById('regime-field'));
  var snCsosnDropdown = initDropdown(document.getElementById('sn-csosn-field'));
  var ipiCodigoDropdown = initDropdown(document.getElementById('ipi-codigo-field'));
  var issqnCstDropdown = initDropdown(document.getElementById('issqn-cst-field'));

  // ---------- Abas (Configuração tributária) — trocou de Accordion pra Tab
  // (ver nota no HTML/CSS: o `.trigger` do Accordion colidia com o do
  // Dropdown e apagava borda/fundo de todos os selects da tela). Só um
  // imposto fica visível por vez, mesmo padrão das abas Entrada/Saída da
  // listagem. ----------
  var taxTablist = document.getElementById('nnop-tax-tablist');
  var taxSubtitle = document.getElementById('nnop-tax-subtitle');
  var taxPanels = Array.prototype.slice.call(document.querySelectorAll('.nnop-tax-panel'));
  var TAX_TAB_SUBTITLE = {
    simples: 'Regras do Simples Nacional aplicáveis a esta natureza de operação.',
    ipi: 'Configurações do Imposto sobre Produtos Industrializados (IPI) para esta natureza de operação.',
    issqn: 'Configurações do Imposto sobre Serviços (ISSQN) para esta natureza de operação.',
    pis: 'Configurações da contribuição para o PIS aplicáveis a esta natureza de operação.',
    cofins: 'Configurações da contribuição para o COFINS aplicáveis a esta natureza de operação.'
  };
  function selectTaxTab(key) {
    Array.prototype.slice.call(taxTablist.querySelectorAll('.tab')).forEach(function (t) {
      var active = t.dataset.taxTab === key;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    taxPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.taxPanel !== key;
    });
    taxSubtitle.textContent = TAX_TAB_SUBTITLE[key] || '';
  }
  taxTablist.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    selectTaxTab(tabBtn.dataset.taxTab);
  });

  // ---------- Radio helpers ----------
  // RadioButton.module.css só desenha a bolinha marcada via classe `.checked`
  // no `<label class="option">` (não usa o `:checked` nativo do input) —
  // sem sincronizar essa classe em JS, o clique muda o `input.checked` mas
  // a UI nunca reflete: as opções pareciam nunca ficar selecionadas.
  function syncRadioChecked(name) {
    Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]')).forEach(function (input) {
      input.closest('.option').classList.toggle('checked', input.checked);
    });
  }
  function getRadio(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  }
  function setRadio(name, value) {
    var input = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (input) input.checked = true;
    syncRadioChecked(name);
  }
  var RADIO_GROUPS = ['finalizada', 'padrao', 'consumidor-final', 'sn-difal', 'issqn-desconto'];
  RADIO_GROUPS.forEach(function (name) {
    syncRadioChecked(name);
    form.querySelectorAll('input[name="' + name + '"]').forEach(function (input) {
      input.addEventListener('change', function () { syncRadioChecked(name); });
    });
  });

  // ---------- Padrões pré-configurados ----------
  var PRESETS = {
    venda: {
      tipo: 'saida',
      descricao: 'Venda de mercadoria dentro do estado',
      padrao: 'sim',
      serie: '1',
      regime: '1',
      consumidorFinal: 'nao',
      simples: { csosn: '101', cfop: '5102', difal: 'nao' }
    },
    remessa: {
      tipo: 'saida',
      descricao: 'Remessa',
      padrao: 'nao',
      serie: '1',
      regime: '1',
      consumidorFinal: 'nao',
      simples: { csosn: '400', cfop: '5905', difal: 'nao' }
    },
    devolucao: {
      tipo: 'entrada',
      descricao: 'Devolução de venda',
      padrao: 'nao',
      serie: '1',
      regime: '1',
      consumidorFinal: 'nao',
      simples: { csosn: '202', cfop: '1202', difal: 'nao' }
    }
  };

  function applyPreset(key) {
    var preset = PRESETS[key];
    if (!preset) return;
    tipoDropdown.setValue(preset.tipo);
    document.getElementById('nnop-descricao').value = preset.descricao;
    setRadio('padrao', preset.padrao);
    document.getElementById('nnop-serie').value = preset.serie;
    regimeDropdown.setValue(preset.regime);
    setRadio('consumidor-final', preset.consumidorFinal);
    snCsosnDropdown.setValue(preset.simples.csosn);
    document.getElementById('sn-cfop').value = preset.simples.cfop;
    setRadio('sn-difal', preset.simples.difal);
  }

  var presetButtons = Array.prototype.slice.call(document.querySelectorAll('.nnop-preset-btn'));
  presetButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      presetButtons.forEach(function (b) { b.classList.toggle('selected', b === btn); });
      applyPreset(btn.dataset.preset);
    });
  });

  // ---------- Validação (borda vermelha, mesmo padrão do resto do sistema) ----------
  function setFieldError(fieldEl, hasError) {
    fieldEl.classList.toggle('error', hasError);
  }

  function validate() {
    var valid = true;
    var tipoField = document.getElementById('tipo-field');
    if (!tipoDropdown.getValue()) { setFieldError(tipoField, true); valid = false; } else setFieldError(tipoField, false);

    var descricaoField = document.getElementById('descricao-field');
    var descricaoInput = document.getElementById('nnop-descricao');
    if (!descricaoInput.value.trim()) { setFieldError(descricaoField, true); valid = false; } else setFieldError(descricaoField, false);

    var serieField = document.getElementById('serie-field');
    var serieInput = document.getElementById('nnop-serie');
    if (!serieInput.value.trim()) { setFieldError(serieField, true); valid = false; } else setFieldError(serieField, false);

    var regimeField = document.getElementById('regime-field');
    if (!regimeDropdown.getValue()) { setFieldError(regimeField, true); valid = false; } else setFieldError(regimeField, false);

    return valid;
  }

  // ---------- Prefill em modo edição ----------
  function prefill(natureza) {
    tipoDropdown.setValue(natureza.tipo);
    document.getElementById('nnop-descricao').value = natureza.descricao;
    setRadio('finalizada', natureza.finalizada ? 'sim' : 'nao');
    setRadio('padrao', natureza.padrao ? 'sim' : 'nao');
    document.getElementById('nnop-serie').value = natureza.serie;
    regimeDropdown.setValue(natureza.codigoRegimeTributario);
    setRadio('consumidor-final', natureza.consumidorFinal ? 'sim' : 'nao');
    document.getElementById('nnop-observacao').value = natureza.observacao || '';

    var t = natureza.tributacao || {};
    if (t.simplesNacional) {
      if (t.simplesNacional.csosn) snCsosnDropdown.setValue(t.simplesNacional.csosn);
      document.getElementById('sn-cfop').value = t.simplesNacional.cfop || '';
      setRadio('sn-difal', t.simplesNacional.icmsDifal ? 'sim' : 'nao');
      document.getElementById('sn-observacao').value = t.simplesNacional.observacao || '';
      document.getElementById('sn-info-fisco').value = t.simplesNacional.informacaoFisco || '';
    }
    if (t.ipi) {
      ipiCodigoDropdown.setValue(t.ipi.codigo || 'nao-destacar');
      document.getElementById('ipi-aliquota').value = t.ipi.aliquota || '';
      document.getElementById('ipi-enquadramento').value = t.ipi.codigoEnquadramento || '';
      document.getElementById('ipi-observacao').value = t.ipi.observacao || '';
      document.getElementById('ipi-info-fisco').value = t.ipi.informacaoFisco || '';
    }
    if (t.issqn) {
      if (t.issqn.cst) issqnCstDropdown.setValue(t.issqn.cst);
      document.getElementById('issqn-aliquota').value = t.issqn.aliquota || '';
      document.getElementById('issqn-base').value = t.issqn.base || '';
      setRadio('issqn-desconto', t.issqn.descontarIss ? 'sim' : 'nao');
      document.getElementById('issqn-observacao').value = t.issqn.observacao || '';
      document.getElementById('issqn-info-fisco').value = t.issqn.informacaoFisco || '';
    }
    if (t.pis) {
      document.getElementById('pis-cst').value = t.pis.cst || '';
      document.getElementById('pis-aliquota').value = t.pis.aliquota || '';
      document.getElementById('pis-base').value = t.pis.base || '';
      document.getElementById('pis-observacao').value = t.pis.observacao || '';
      document.getElementById('pis-info-fisco').value = t.pis.informacaoFisco || '';
    }
    if (t.cofins) {
      document.getElementById('cofins-cst').value = t.cofins.cst || '';
      document.getElementById('cofins-aliquota').value = t.cofins.aliquota || '';
      document.getElementById('cofins-base').value = t.cofins.base || '';
      document.getElementById('cofins-observacao').value = t.cofins.observacao || '';
      document.getElementById('cofins-info-fisco').value = t.cofins.informacaoFisco || '';
    }
  }

  if (isEditMode) {
    var natureza = window.NiveloNaturezasOperacao.findByCodigo(editCodigo);
    if (natureza) prefill(natureza);
  } else {
    var prefTipo = params.get('tipo');
    if (prefTipo === 'entrada' || prefTipo === 'saida') tipoDropdown.setValue(prefTipo);
  }

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;

    var payload = {
      tipo: tipoDropdown.getValue(),
      descricao: document.getElementById('nnop-descricao').value.trim(),
      finalizada: getRadio('finalizada') === 'sim',
      padrao: getRadio('padrao') === 'sim',
      serie: document.getElementById('nnop-serie').value.trim(),
      codigoRegimeTributario: regimeDropdown.getValue(),
      consumidorFinal: getRadio('consumidor-final') === 'sim',
      observacao: document.getElementById('nnop-observacao').value.trim(),
      tributacao: {
        simplesNacional: {
          csosn: snCsosnDropdown.getValue(),
          cfop: document.getElementById('sn-cfop').value.trim(),
          icmsDifal: getRadio('sn-difal') === 'sim',
          observacao: document.getElementById('sn-observacao').value.trim(),
          informacaoFisco: document.getElementById('sn-info-fisco').value.trim()
        },
        ipi: {
          codigo: ipiCodigoDropdown.getValue() || 'nao-destacar',
          aliquota: document.getElementById('ipi-aliquota').value.trim(),
          codigoEnquadramento: document.getElementById('ipi-enquadramento').value.trim(),
          observacao: document.getElementById('ipi-observacao').value.trim(),
          informacaoFisco: document.getElementById('ipi-info-fisco').value.trim()
        },
        issqn: {
          cst: issqnCstDropdown.getValue(),
          aliquota: document.getElementById('issqn-aliquota').value.trim(),
          base: document.getElementById('issqn-base').value.trim(),
          descontarIss: getRadio('issqn-desconto') === 'sim',
          observacao: document.getElementById('issqn-observacao').value.trim(),
          informacaoFisco: document.getElementById('issqn-info-fisco').value.trim()
        },
        pis: {
          cst: document.getElementById('pis-cst').value.trim(),
          aliquota: document.getElementById('pis-aliquota').value.trim(),
          base: document.getElementById('pis-base').value.trim(),
          observacao: document.getElementById('pis-observacao').value.trim(),
          informacaoFisco: document.getElementById('pis-info-fisco').value.trim()
        },
        cofins: {
          cst: document.getElementById('cofins-cst').value.trim(),
          aliquota: document.getElementById('cofins-aliquota').value.trim(),
          base: document.getElementById('cofins-base').value.trim(),
          observacao: document.getElementById('cofins-observacao').value.trim(),
          informacaoFisco: document.getElementById('cofins-info-fisco').value.trim()
        }
      }
    };

    var successMessage;
    if (isEditMode) {
      window.NiveloNaturezasOperacao.update(editCodigo, payload);
      successMessage = 'Natureza de operação editada com sucesso.';
    } else {
      window.NiveloNaturezasOperacao.add(payload);
      successMessage = 'Natureza de operação cadastrada com sucesso.';
    }

    try { sessionStorage.setItem('nivelo.novanatureza.success', successMessage); } catch (e) {}
    window.location.href = 'naturezas-operacao.html';
  });
})();
