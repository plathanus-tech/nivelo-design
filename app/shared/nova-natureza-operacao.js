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
  var taxPanels = Array.prototype.slice.call(document.querySelectorAll('.nnop-tax-panel'));
  function selectTaxTab(key) {
    Array.prototype.slice.call(taxTablist.querySelectorAll('.tab')).forEach(function (t) {
      var active = t.dataset.taxTab === key;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });
    taxPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.taxPanel !== key;
    });
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

  // ---------- IBS/CBS (Reforma Tributária) ----------
  // Fonte única de dados: window.NiveloIbsCbs (ibs-cbs-data.js) — CST_OPTIONS,
  // cClassTrib por CST e a matriz de campos visíveis por CST. Nada disso é
  // duplicado aqui, só lido.
  var ibsCbs = window.NiveloIbsCbs;
  var ibscbsState = { cst: '', cclasstrib: '' };

  // Tooltip de texto longo — mesma técnica já usada em novo-cadastro.js
  // (`initFixedTooltip`), copiada (não compartilhada via import, convenção
  // do projeto). Necessária porque a regra ambiente `.wrapper:hover .tip`
  // do Tooltip.module.css dispararia sempre que o mouse estivesse em
  // QUALQUER parte do campo (ver `.wrapper .nnop-info-icon .tip{opacity:0}`
  // em page-nova-natureza-operacao.css, que neutraliza essa regra).
  function initFixedTooltip(trigger) {
    if (!trigger) return;
    var tip = trigger.querySelector('.tip');
    if (!tip) return;
    function show() {
      var rect = trigger.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      tip.style.position = 'fixed';
      tip.style.left = centerX + 'px';
      tip.style.transform = 'translateX(-50%)';
      tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
      tip.style.top = 'auto';
      tip.style.opacity = '1';
      var margin = 8;
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.left < margin) {
        tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
      } else if (tipRect.right > window.innerWidth - margin) {
        tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
      }
    }
    function hide() { tip.style.opacity = '0'; }
    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
  }
  Array.prototype.slice.call(document.querySelectorAll('.nnop-info-icon')).forEach(initFixedTooltip);

  // Máscara de percentual — não existe nenhum componente/input de percentual
  // no sistema ainda (grep exaustivo antes de escrever), modelado no mesmo
  // princípio da máscara de centavos (formatCentavosBRL, novo-estoque.js):
  // guarda os dígitos crus como estado, formata pra exibição a cada tecla.
  function initPercentMask(input) {
    if (!input) return;
    function digitsOf(value) { return (value || '').replace(/\D/g, ''); }
    function format(digits) {
      digits = digits.replace(/^0+(?=\d)/, '');
      while (digits.length < 3) digits = '0' + digits;
      var intPart = String(Number(digits.slice(0, -2)));
      var decPart = digits.slice(-2);
      return intPart + ',' + decPart + '%';
    }
    input.addEventListener('input', function () {
      var digits = digitsOf(input.value).slice(0, 6);
      input.value = digits ? format(digits) : '';
    });
    input.addEventListener('blur', function () {
      if (!input.value) setFieldError(input.closest('.wrapper'), false);
    });
  }
  Array.prototype.slice.call(document.querySelectorAll('.nnop-percent-input')).forEach(initPercentMask);
  function percentValue(input) {
    if (!input) return '';
    return input.value.trim();
  }
  function setPercentValue(input, value) {
    if (!input) return;
    if (value === '' || value == null) { input.value = ''; return; }
    var digits = String(value).replace(/[^\d,]/g, '').replace(',', '');
    input.value = digits ? (function () {
      while (digits.length < 3) digits = '0' + digits;
      return String(Number(digits.slice(0, -2))) + ',' + digits.slice(-2) + '%';
    })() : '';
  }

  var cstField = document.getElementById('ibscbs-cst-field');
  var cstMenu = cstField.querySelector('[data-dropdown-menu]');
  ibsCbs.getCstOptions().forEach(function (opt) {
    var div = document.createElement('div');
    div.className = 'option';
    div.dataset.value = opt.codigo;
    div.textContent = opt.codigo + ' - ' + opt.descricao;
    cstMenu.appendChild(div);
  });
  var cstDropdown = initDropdown(cstField);

  var cclasstribTrigger = document.getElementById('ibscbs-cclasstrib-trigger');
  var cclasstribValue = document.getElementById('ibscbs-cclasstrib-value');
  var cclasstribField = document.getElementById('ibscbs-cclasstrib-field');

  var cbsSection = document.getElementById('ibscbs-cbs-section');
  var ibsSection = document.getElementById('ibscbs-ibs-section');
  var CBS_FIELD_ID = { aliquota: 'ibscbs-cbs-aliquota-field', reducao: 'ibscbs-cbs-reducao-field', diferimento: 'ibscbs-cbs-diferimento-field' };
  var IBS_FIELD_ID = { aliquota: 'ibscbs-ibs-aliquota-field', reducao: 'ibscbs-ibs-reducao-field', diferimento: 'ibscbs-ibs-diferimento-field' };

  function refreshIbsCbsFieldVisibility() {
    var config = ibsCbs.getFieldConfig(ibscbsState.cst);
    var hasCbs = config.cbs.length > 0;
    var hasIbs = config.ibs.length > 0;
    cbsSection.hidden = !hasCbs;
    ibsSection.hidden = !hasIbs;
    Object.keys(CBS_FIELD_ID).forEach(function (key) {
      document.getElementById(CBS_FIELD_ID[key]).hidden = config.cbs.indexOf(key) === -1;
    });
    Object.keys(IBS_FIELD_ID).forEach(function (key) {
      document.getElementById(IBS_FIELD_ID[key]).hidden = config.ibs.indexOf(key) === -1;
    });
  }

  function setCclasstribValue(codigo) {
    ibscbsState.cclasstrib = codigo || '';
    if (!codigo) {
      cclasstribValue.textContent = ibscbsState.cst ? 'Selecione o cClassTrib' : 'Selecione o CST primeiro';
      cclasstribTrigger.removeAttribute('title');
      return;
    }
    var found = ibsCbs.findCclasstrib(ibscbsState.cst, codigo);
    var text = found ? (found.codigo + ' - ' + found.descricao) : codigo;
    cclasstribValue.textContent = text;
    // O texto some visualmente com ellipsis quando é longo demais pra caber
    // na caixa (ver .nnop-cclasstrib-value) — o `title` dá o texto completo
    // via tooltip nativo do navegador, além do modal de seleção (que sempre
    // mostra a descrição inteira) já cobrir esse caso.
    cclasstribTrigger.title = text;
  }

  function onCstChanged(newCst) {
    ibscbsState.cst = newCst || '';
    cclasstribTrigger.disabled = !ibscbsState.cst;
    // Invalida um cClassTrib incompatível: nunca deixa uma combinação
    // CST+cClassTrib inválida sobreviver a uma troca de CST.
    if (ibscbsState.cclasstrib && !ibsCbs.findCclasstrib(ibscbsState.cst, ibscbsState.cclasstrib)) {
      setCclasstribValue('');
    } else {
      setCclasstribValue(ibscbsState.cclasstrib);
    }
    refreshIbsCbsFieldVisibility();
  }
  cstMenu.addEventListener('click', function (event) {
    if (event.target.closest('.option')) onCstChanged(cstDropdown.getValue());
  });
  onCstChanged('');

  // ---------- Modal do cClassTrib ----------
  var cclasstribOverlay = document.getElementById('cclasstrib-dialog-overlay');
  var cclasstribOptionsEl = document.getElementById('cclasstrib-options');
  var cclasstribPendingValue = '';

  function renderCclasstribOptions() {
    var list = ibsCbs.getCclasstribList(ibscbsState.cst);
    cclasstribOptionsEl.innerHTML = '';
    list.forEach(function (item, index) {
      var id = 'cclasstrib-modal-opt-' + index;
      var label = document.createElement('label');
      label.className = 'option';
      label.innerHTML =
        '<input type="radio" class="input" name="cclasstrib-modal-option" id="' + id + '" value="' + item.codigo + '" />' +
        '<span class="circle"><span class="dot"></span></span>' +
        '<span class="optionLabel"><strong>' + item.codigo + '</strong>' + item.descricao + '</span>';
      cclasstribOptionsEl.appendChild(label);
    });
    var currentInput = cclasstribOptionsEl.querySelector('input[value="' + cclasstribPendingValue + '"]');
    if (currentInput) currentInput.checked = true;
    syncCclasstribChecked();
  }
  function syncCclasstribChecked() {
    Array.prototype.slice.call(cclasstribOptionsEl.querySelectorAll('input[type="radio"]')).forEach(function (input) {
      input.closest('.option').classList.toggle('checked', input.checked);
    });
  }
  cclasstribOptionsEl.addEventListener('change', syncCclasstribChecked);

  function openCclasstribDialog() {
    if (cclasstribTrigger.disabled) return;
    cclasstribPendingValue = ibscbsState.cclasstrib;
    renderCclasstribOptions();
    cclasstribOverlay.hidden = false;
  }
  function closeCclasstribDialog() { cclasstribOverlay.hidden = true; }

  cclasstribTrigger.addEventListener('click', openCclasstribDialog);
  document.getElementById('cclasstrib-dialog-close').addEventListener('click', closeCclasstribDialog);
  document.getElementById('cclasstrib-dialog-cancel').addEventListener('click', closeCclasstribDialog);
  document.getElementById('cclasstrib-dialog-confirm').addEventListener('click', function () {
    var checked = cclasstribOptionsEl.querySelector('input[type="radio"]:checked');
    setCclasstribValue(checked ? checked.value : '');
    setFieldError(cclasstribField, false);
    closeCclasstribDialog();
  });
  cclasstribOverlay.addEventListener('click', function (event) {
    if (event.target === cclasstribOverlay) closeCclasstribDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !cclasstribOverlay.hidden) closeCclasstribDialog();
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

    // IBS/CBS não é obrigatório (mesmo padrão dos outros 5 impostos), mas
    // nunca permite salvar um CST sem o cClassTrib correspondente — evita
    // uma combinação inválida/incompleta.
    if (ibscbsState.cst && !ibscbsState.cclasstrib) {
      setFieldError(cclasstribField, true);
      valid = false;
    } else {
      setFieldError(cclasstribField, false);
    }

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
    if (t.ibsCbs && t.ibsCbs.cst) {
      cstDropdown.setValue(t.ibsCbs.cst);
      onCstChanged(cstDropdown.getValue());
      if (t.ibsCbs.cclasstrib) setCclasstribValue(t.ibsCbs.cclasstrib);
      setPercentValue(document.getElementById('ibscbs-cbs-aliquota'), t.ibsCbs.cbsAliquota);
      setPercentValue(document.getElementById('ibscbs-cbs-reducao'), t.ibsCbs.cbsReducao);
      setPercentValue(document.getElementById('ibscbs-cbs-diferimento'), t.ibsCbs.cbsDiferimento);
      setPercentValue(document.getElementById('ibscbs-ibs-aliquota'), t.ibsCbs.ibsAliquota);
      setPercentValue(document.getElementById('ibscbs-ibs-reducao'), t.ibsCbs.ibsReducao);
      setPercentValue(document.getElementById('ibscbs-ibs-diferimento'), t.ibsCbs.ibsDiferimento);
      document.getElementById('ibscbs-observacao').value = t.ibsCbs.observacao || '';
      document.getElementById('ibscbs-info-fisco').value = t.ibsCbs.informacaoFisco || '';
    }
  }

  if (isEditMode) {
    var natureza = window.NiveloNaturezasOperacao.findByCodigo(editCodigo);
    if (natureza) prefill(natureza);
  } else {
    var prefTipo = params.get('tipo');
    if (prefTipo === 'entrada' || prefTipo === 'saida') tipoDropdown.setValue(prefTipo);
  }

  // Monta o payload de IBS/CBS só com os campos aplicáveis ao CST selecionado
  // (nunca deixa um valor de Alíquota/Redução/Diferimento sobrar no payload
  // quando o CST atual não usa aquele campo — ex.: trocar de CST 000 pra 410
  // não pode deixar uma "Alíquota CBS" antiga no envio).
  function buildIbsCbsPayload() {
    if (!ibscbsState.cst) return null;
    var config = ibsCbs.getFieldConfig(ibscbsState.cst);
    var payload = { cst: ibscbsState.cst, cclasstrib: ibscbsState.cclasstrib };
    if (config.cbs.indexOf('aliquota') !== -1) payload.cbsAliquota = percentValue(document.getElementById('ibscbs-cbs-aliquota'));
    if (config.cbs.indexOf('reducao') !== -1) payload.cbsReducao = percentValue(document.getElementById('ibscbs-cbs-reducao'));
    if (config.cbs.indexOf('diferimento') !== -1) payload.cbsDiferimento = percentValue(document.getElementById('ibscbs-cbs-diferimento'));
    if (config.ibs.indexOf('aliquota') !== -1) payload.ibsAliquota = percentValue(document.getElementById('ibscbs-ibs-aliquota'));
    if (config.ibs.indexOf('reducao') !== -1) payload.ibsReducao = percentValue(document.getElementById('ibscbs-ibs-reducao'));
    if (config.ibs.indexOf('diferimento') !== -1) payload.ibsDiferimento = percentValue(document.getElementById('ibscbs-ibs-diferimento'));
    payload.observacao = document.getElementById('ibscbs-observacao').value.trim();
    payload.informacaoFisco = document.getElementById('ibscbs-info-fisco').value.trim();
    return payload;
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
        },
        ibsCbs: buildIbsCbsPayload()
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
