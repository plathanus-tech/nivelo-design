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

    var trigger0 = trigger, placeholder0 = valueEl.textContent;
    function clear() {
      root.dataset.value = '';
      valueEl.textContent = placeholder0;
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
    }
    function setDisabled(disabled) {
      trigger0.disabled = disabled;
      root.classList.toggle('is-readonly', disabled);
      if (disabled) close();
    }

    return { setValue: setValue, getValue: function () { return root.dataset.value || ''; }, clear: clear, setDisabled: setDisabled };
  }

  var tipoDropdown = initDropdown(document.getElementById('tipo-field'));
  var emitenteDropdown = initDropdown(document.getElementById('emitente-field'));
  var regimeDropdown = initDropdown(document.getElementById('regime-field'));

  // Tipo de emitente define o Regime tributário: PF é sempre Atividade rural
  // (somente leitura, sem outras opções); PJ escolhe entre 3 regimes e nasce
  // sem seleção. Trocar o tipo sempre limpa/recalcula o regime.
  var regimeMenu = document.querySelector('#regime-field [data-dropdown-menu]');
  function applyEmitente(tipo, keepRegime) {
    var pf = tipo === 'pf';
    Array.prototype.slice.call(regimeMenu.querySelectorAll('.option')).forEach(function (o) {
      o.hidden = pf ? o.dataset.value !== 'atividade-rural' : o.dataset.value === 'atividade-rural';
    });
    if (!keepRegime) regimeDropdown.clear();
    regimeDropdown.setDisabled(pf);
    if (pf) regimeDropdown.setValue('atividade-rural');
  }
  document.getElementById('emitente-field').addEventListener('click', function (event) {
    if (!event.target.closest('.option')) return;
    applyEmitente(emitenteDropdown.getValue(), false);
  });
  applyEmitente('', false);
  var icmsTipoDropdown = initDropdown(document.getElementById('icms-tipo-field'));
  var icmsCsosnDropdown = initDropdown(document.getElementById('icms-csosn-field'));
  var icmsCstDropdown = initDropdown(document.getElementById('icms-cst-field'));
  var icmsOrigemDropdown = initDropdown(document.getElementById('icms-origem-field'));
  var icmsModbcDropdown = initDropdown(document.getElementById('icms-modbc-field'));
  var icmsDifalDropdown = initDropdown(document.getElementById('icms-difal-field'));
  var icmsFcpDropdown = initDropdown(document.getElementById('icms-fcp-field'));
  // O tipo de código controla qual campo de situação tributária aparece;
  // nunca os dois juntos, e trocar o tipo limpa o código incompatível.
  function applyIcmsTipo(tipo) {
    document.getElementById('icms-csosn-field').hidden = tipo !== 'csosn';
    document.getElementById('icms-cst-field').hidden = tipo !== 'cst';
    if (tipo !== 'csosn') icmsCsosnDropdown.clear();
    if (tipo !== 'cst') icmsCstDropdown.clear();
  }
  document.getElementById('icms-tipo-field').addEventListener('click', function (event) {
    if (event.target.closest('.option')) applyIcmsTipo(icmsTipoDropdown.getValue());
  });
  applyIcmsTipo('');
  var ipiCodigoDropdown = initDropdown(document.getElementById('ipi-codigo-field'));
  var credpresCodigoDropdown = initDropdown(document.getElementById('ibscbs-credpres-codigo-field'));
  var monofasicaDropdown = initDropdown(document.getElementById('ibscbs-monofasica-field'));
  var transfCreditoDropdown = initDropdown(document.getElementById('ibscbs-transf-credito-field'));

  // ---------- V2: Inscrições estaduais (multiselect) + Numeração fiscal ----------
  // As IEs pertencem às Fazendas (fonte única: window.NiveloFazendas) e nunca
  // são cadastradas aqui. Cada opção é identificada por `fazendaId|IE`, já que
  // a mesma IE pode aparecer em mais de uma natureza, mas é única por fazenda.
  var IE_OPTIONS = [];
  (window.NiveloFazendas ? window.NiveloFazendas.list() : []).forEach(function (fazenda) {
    window.NiveloFazendas.listInscricoesEstaduais(fazenda).forEach(function (ie) {
      IE_OPTIONS.push({ key: fazenda.id + '|' + ie, ie: ie, fazenda: fazenda.nome, label: fazenda.nome + ' — ' + ie });
    });
  });
  function findIeOption(key) {
    for (var i = 0; i < IE_OPTIONS.length; i++) if (IE_OPTIONS[i].key === key) return IE_OPTIONS[i];
    return null;
  }

  var numeracao = []; // [{ id, ieKey, serie, ultima, uso }]
  var numSeq = 0;
  var USO_LABEL = { 'entrada-saida': 'Entrada e saída', entrada: 'Somente entrada', saida: 'Somente saída' };

  function numForIe(key) { return numeracao.filter(function (n) { return n.ieKey === key; }); }

  var ieField = document.getElementById('ie-field');
  var ieTrigger = ieField.querySelector('[data-dropdown-trigger]');
  var ieTagsEl = ieField.querySelector('[data-dropdown-value]');
  var ieMenu = ieField.querySelector('[data-dropdown-menu]');
  var ieSelected = []; // chaves, na ordem de seleção

  IE_OPTIONS.forEach(function (opt) {
    var div = document.createElement('div');
    div.className = 'option optionCheckbox';
    div.dataset.value = opt.key;
    div.innerHTML = '<span class="optionCheck"><i data-lucide="check" width="12" height="12"></i></span>';
    div.appendChild(document.createTextNode(opt.ie));
    var farmEl = document.createElement('span');
    farmEl.className = 'nnop-ie-farm';
    farmEl.textContent = ' · ' + opt.fazenda;
    div.appendChild(farmEl);
    ieMenu.appendChild(div);
  });
  if (!IE_OPTIONS.length) {
    var emptyOpt = document.createElement('div');
    emptyOpt.className = 'nnop-ie-empty text-body-s';
    emptyOpt.textContent = 'Nenhuma inscrição estadual cadastrada nas fazendas.';
    ieMenu.appendChild(emptyOpt);
  }

  function positionIeMenu() {
    var rect = ieTrigger.getBoundingClientRect();
    var spaceBelow = window.innerHeight - rect.bottom - 8;
    var spaceAbove = rect.top - 8;
    ieMenu.style.position = 'fixed';
    ieMenu.style.left = rect.left + 'px';
    ieMenu.style.width = rect.width + 'px';
    if (spaceBelow < 160 && spaceAbove > spaceBelow) {
      ieMenu.style.top = 'auto';
      ieMenu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      ieMenu.style.maxHeight = Math.min(240, spaceAbove) + 'px';
    } else {
      ieMenu.style.bottom = 'auto';
      ieMenu.style.top = (rect.bottom + 4) + 'px';
      ieMenu.style.maxHeight = Math.min(240, spaceBelow) + 'px';
    }
  }
  function closeIeMenu() {
    ieField.classList.remove('open');
    window.removeEventListener('scroll', onIeScroll, true);
    window.removeEventListener('resize', closeIeMenu);
  }
  function onIeScroll(event) { if (!ieMenu.contains(event.target)) closeIeMenu(); }
  function openIeMenu() {
    ieField.classList.add('open');
    positionIeMenu();
    window.addEventListener('scroll', onIeScroll, true);
    window.addEventListener('resize', closeIeMenu);
  }

  function renderIeTags() {
    Array.prototype.slice.call(ieMenu.querySelectorAll('.option')).forEach(function (o) {
      o.classList.toggle('selected', ieSelected.indexOf(o.dataset.value) !== -1);
    });
    if (!ieSelected.length) {
      ieTagsEl.classList.add('placeholder');
      ieTagsEl.textContent = ieTagsEl.dataset.placeholder;
      return;
    }
    ieTagsEl.classList.remove('placeholder');
    ieTagsEl.innerHTML = ieSelected.map(function (key) {
      var opt = findIeOption(key);
      var label = opt ? opt.label : key;
      var tagText = opt ? opt.ie + ' · ' + opt.fazenda : key;
      return '<span class="nnop-tag">' + tagText +
        '<button type="button" class="nnop-tag-remove" data-remove-key="' + key + '" aria-label="Remover ' + label + '"><i data-lucide="x" width="12" height="12"></i></button></span>';
    }).join('');
    if (window.lucide) lucide.createIcons();
  }

  function selectedIeAdded(key) {
    ieSelected.push(key);
    renderIeTags();
    renderNumeracao();
  }
  function selectedIeRemoved(key) {
    ieSelected = ieSelected.filter(function (k) { return k !== key; });
    numeracao = numeracao.filter(function (n) { return n.ieKey !== key; });
    renderIeTags();
    renderNumeracao();
  }

  // Remover uma IE que já tem séries configuradas nunca acontece em silêncio:
  // abre a confirmação, e só depois de confirmada remove a IE e suas séries.
  var ieRemoveOverlay = document.getElementById('ie-remove-overlay');
  var iePendingRemoval = null;
  function requestIeRemoval(key) {
    var linked = numForIe(key);
    if (!linked.length) { selectedIeRemoved(key); return; }
    var opt = findIeOption(key);
    iePendingRemoval = key;
    document.getElementById('ie-remove-text').textContent =
      'Existem ' + linked.length + (linked.length === 1 ? ' configuração de numeração vinculada' : ' configurações de numeração vinculadas') +
      ' a ' + (opt ? opt.label : 'esta inscrição') + '. Ao remover a inscrição, ' + (linked.length === 1 ? 'essa configuração também será removida.' : 'essas configurações também serão removidas.');
    ieRemoveOverlay.hidden = false;
  }
  function closeIeRemoveDialog() { ieRemoveOverlay.hidden = true; iePendingRemoval = null; }
  document.getElementById('ie-remove-close').addEventListener('click', closeIeRemoveDialog);
  document.getElementById('ie-remove-cancel').addEventListener('click', closeIeRemoveDialog);
  ieRemoveOverlay.addEventListener('click', function (event) { if (event.target === ieRemoveOverlay) closeIeRemoveDialog(); });
  document.getElementById('ie-remove-confirm').addEventListener('click', function () {
    if (iePendingRemoval) selectedIeRemoved(iePendingRemoval);
    closeIeRemoveDialog();
  });

  function toggleIe(key) {
    if (ieSelected.indexOf(key) === -1) selectedIeAdded(key);
    else requestIeRemoval(key);
  }
  ieTrigger.addEventListener('click', function () {
    if (ieField.classList.contains('open')) closeIeMenu(); else openIeMenu();
  });
  ieMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (optionEl) toggleIe(optionEl.dataset.value);
  });
  ieTagsEl.addEventListener('click', function (event) {
    var removeBtn = event.target.closest('[data-remove-key]');
    if (!removeBtn) return;
    event.stopPropagation();
    requestIeRemoval(removeBtn.dataset.removeKey);
  });
  document.addEventListener('click', function (event) {
    if (!ieField.contains(event.target)) closeIeMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeIeMenu();
      if (!ieRemoveOverlay.hidden) closeIeRemoveDialog();
      if (!numOverlay.hidden) closeNumDialog();
      if (!numRemoveOverlay.hidden) closeNumRemoveDialog();
    }
  });

  // ---------- Tabela de Numeração fiscal ----------
  var numTbody = document.getElementById('num-tbody');
  var numTableWrap = document.getElementById('num-table-wrap');
  var numEmpty = document.getElementById('num-empty');
  var numEmptyText = document.getElementById('num-empty-text');
  var numAddBtn = document.getElementById('num-add-btn');

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function renderNumeracao() {
    numAddBtn.disabled = !ieSelected.length;
    numTableWrap.hidden = !numeracao.length;
    numEmpty.hidden = !!numeracao.length;
    numEmptyText.textContent = ieSelected.length
      ? 'Nenhuma série configurada. Use "Adicionar série" para começar.'
      : 'Selecione ao menos uma inscrição estadual em Dados gerais para configurar a numeração.';
    numTbody.innerHTML = numeracao.map(function (n) {
      var opt = findIeOption(n.ieKey);
      return '<tr class="tr" data-num-id="' + n.id + '">' +
        '<td class="td">' + escapeHtml(opt ? opt.label : n.ieKey) + '</td>' +
        '<td class="td">55 – NF-e</td>' +
        '<td class="td">' + escapeHtml(n.serie) + '</td>' +
        '<td class="td">' + n.ultima + '</td>' +
        '<td class="td">' + (n.ultima + 1) + '</td>' +
        '<td class="td">' + USO_LABEL[n.uso] + '</td>' +
        '<td class="td"><div class="cellActions">' +
          '<button type="button" class="actionBtn" data-num-action="editar" aria-label="Editar série"><i data-lucide="pencil" width="16" height="16"></i></button>' +
          '<button type="button" class="actionBtn" data-num-action="remover" aria-label="Remover série"><i data-lucide="trash-2" width="16" height="16"></i></button>' +
        '</div></td></tr>';
    }).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Modal: Adicionar/Editar série ----------
  var numOverlay = document.getElementById('num-dialog-overlay');
  var numRemoveOverlay = document.getElementById('num-remove-overlay');
  var numIeField = document.getElementById('num-ie-field');
  var numIeMenu = numIeField.querySelector('[data-dropdown-menu]');
  var numIeDropdown = initDropdown(numIeField);
  var numUsoDropdown = initDropdown(document.getElementById('num-uso-field'));
  var numSerieInput = document.getElementById('num-serie');
  var numUltimaInput = document.getElementById('num-ultima');
  var numProximaInput = document.getElementById('num-proxima');
  var numEditingId = null;
  var numPendingRemoveId = null;

  function onlyDigits(input) { input.value = input.value.replace(/\D/g, ''); }
  function refreshProxima() {
    numProximaInput.value = numUltimaInput.value === '' ? '' : String(Number(numUltimaInput.value) + 1);
  }
  numSerieInput.addEventListener('input', function () { onlyDigits(numSerieInput); document.getElementById('num-serie-field').classList.remove('error'); });
  numUltimaInput.addEventListener('input', function () { onlyDigits(numUltimaInput); refreshProxima(); document.getElementById('num-ultima-field').classList.remove('error'); });

  function clearNumErrors() {
    ['num-ie-field', 'num-serie-field', 'num-ultima-field', 'num-uso-field'].forEach(function (id) {
      document.getElementById(id).classList.remove('error');
    });
    document.getElementById('num-serie-error').lastChild.textContent = ' Informe a série.';
  }
  function openNumDialog(record) {
    numEditingId = record ? record.id : null;
    clearNumErrors();
    numIeMenu.innerHTML = '';
    ieSelected.forEach(function (key) {
      var opt = findIeOption(key);
      if (!opt) return;
      var div = document.createElement('div');
      div.className = 'option';
      div.dataset.value = opt.key;
      div.textContent = opt.label;
      numIeMenu.appendChild(div);
    });
    numIeDropdown.clear();
    numUsoDropdown.clear();
    numSerieInput.value = record ? record.serie : '';
    numUltimaInput.value = record ? String(record.ultima) : '';
    refreshProxima();
    if (record) { numIeDropdown.setValue(record.ieKey); numUsoDropdown.setValue(record.uso); }
    document.getElementById('num-dialog-title').textContent = record ? 'Editar série' : 'Adicionar série';
    document.getElementById('num-dialog-confirm').textContent = record ? 'Salvar série' : 'Adicionar série';
    numOverlay.hidden = false;
  }
  function closeNumDialog() { numOverlay.hidden = true; numEditingId = null; }

  numAddBtn.addEventListener('click', function () { if (!numAddBtn.disabled) openNumDialog(null); });
  document.getElementById('num-dialog-close').addEventListener('click', closeNumDialog);
  document.getElementById('num-dialog-cancel').addEventListener('click', closeNumDialog);
  numOverlay.addEventListener('click', function (event) { if (event.target === numOverlay) closeNumDialog(); });

  document.getElementById('num-dialog-confirm').addEventListener('click', function () {
    var ieKey = numIeDropdown.getValue();
    var serie = numSerieInput.value.trim();
    var ultima = numUltimaInput.value;
    var uso = numUsoDropdown.getValue();
    var ok = true;
    function flag(id, bad) { document.getElementById(id).classList.toggle('error', bad); if (bad) ok = false; }
    flag('num-ie-field', !ieKey);
    flag('num-serie-field', !serie);
    flag('num-ultima-field', ultima === '');
    flag('num-uso-field', !uso);
    if (ieKey && serie) {
      var dup = numeracao.some(function (n) { return n.ieKey === ieKey && n.serie === serie && n.id !== numEditingId; });
      if (dup) {
        document.getElementById('num-serie-error').lastChild.textContent = ' Esta série já está configurada para este estabelecimento.';
        flag('num-serie-field', true);
      }
    }
    if (!ok) return;
    if (numEditingId) {
      numeracao.forEach(function (n) {
        if (n.id === numEditingId) { n.ieKey = ieKey; n.serie = serie; n.ultima = Number(ultima); n.uso = uso; }
      });
    } else {
      numeracao.push({ id: ++numSeq, ieKey: ieKey, serie: serie, ultima: Number(ultima), uso: uso });
    }
    renderNumeracao();
    closeNumDialog();
  });

  // Editar/remover uma linha da tabela
  function closeNumRemoveDialog() { numRemoveOverlay.hidden = true; numPendingRemoveId = null; }
  numTbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-num-action]');
    if (!btn) return;
    var id = Number(btn.closest('tr').dataset.numId);
    var record = numeracao.filter(function (n) { return n.id === id; })[0];
    if (!record) return;
    if (btn.dataset.numAction === 'editar') { openNumDialog(record); return; }
    numPendingRemoveId = id;
    var opt = findIeOption(record.ieKey);
    document.getElementById('num-remove-text').textContent =
      'Deseja remover a série ' + record.serie + ' de ' + (opt ? opt.label : 'este estabelecimento') + '?';
    numRemoveOverlay.hidden = false;
  });
  document.getElementById('num-remove-close').addEventListener('click', closeNumRemoveDialog);
  document.getElementById('num-remove-cancel').addEventListener('click', closeNumRemoveDialog);
  numRemoveOverlay.addEventListener('click', function (event) { if (event.target === numRemoveOverlay) closeNumRemoveDialog(); });
  document.getElementById('num-remove-confirm').addEventListener('click', function () {
    numeracao = numeracao.filter(function (n) { return n.id !== numPendingRemoveId; });
    renderNumeracao();
    closeNumRemoveDialog();
  });
  renderIeTags();
  renderNumeracao();

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
  var RADIO_GROUPS = ['finalizada', 'padrao', 'consumidor-final'];
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
      emitente: 'pj',
      regime: 'simples',
      consumidorFinal: 'nao',
      icms: { csosn: '101', difal: 'nao' }
    },
    remessa: {
      tipo: 'saida',
      descricao: 'Remessa',
      padrao: 'nao',
      emitente: 'pj',
      regime: 'simples',
      consumidorFinal: 'nao',
      icms: { csosn: '400', difal: 'nao' }
    },
    devolucao: {
      tipo: 'entrada',
      descricao: 'Devolução de venda',
      padrao: 'nao',
      emitente: 'pj',
      regime: 'simples',
      consumidorFinal: 'nao',
      icms: { csosn: '202', difal: 'nao' }
    }
  };

  function applyPreset(key) {
    var preset = PRESETS[key];
    if (!preset) return;
    tipoDropdown.setValue(preset.tipo);
    document.getElementById('nnop-descricao').value = preset.descricao;
    setRadio('padrao', preset.padrao);
    emitenteDropdown.setValue(preset.emitente);
    applyEmitente(preset.emitente, false);
    regimeDropdown.setValue(preset.regime);
    setRadio('consumidor-final', preset.consumidorFinal);
    icmsTipoDropdown.setValue('csosn');
    applyIcmsTipo('csosn');
    icmsCsosnDropdown.setValue(preset.icms.csosn);
    icmsDifalDropdown.setValue(preset.icms.difal);
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


    var emitenteField = document.getElementById('emitente-field');
    if (!emitenteDropdown.getValue()) { setFieldError(emitenteField, true); valid = false; } else setFieldError(emitenteField, false);
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
    var LEGACY = { '1': 'simples', '2': 'simples', '3': 'real' };
    var tipoEm = natureza.tipoEmitente || 'pj';
    emitenteDropdown.setValue(tipoEm);
    applyEmitente(tipoEm, false);
    regimeDropdown.setValue(natureza.regimeTributario || LEGACY[natureza.codigoRegimeTributario] || '');
    setRadio('consumidor-final', natureza.consumidorFinal ? 'sim' : 'nao');
    document.getElementById('nnop-observacao').value = natureza.observacao || '';

    ieSelected = (natureza.inscricoesEstaduais || []).filter(function (key) { return !!findIeOption(key); });
    numeracao = (natureza.numeracao || [])
      .filter(function (n) { return ieSelected.indexOf(n.ieKey) !== -1; })
      .map(function (n) { return { id: ++numSeq, ieKey: n.ieKey, serie: n.serie, ultima: n.ultima, uso: n.uso }; });
    renderIeTags();
    renderNumeracao();

    var t = natureza.tributacao || {};
    var ic = t.icms || (t.simplesNacional && {
      tipoCodigo: 'csosn', codigo: t.simplesNacional.csosn, difal: t.simplesNacional.icmsDifal ? 'sim' : 'nao',
      observacao: t.simplesNacional.observacao, informacaoFisco: t.simplesNacional.informacaoFisco
    });
    if (ic) {
      if (ic.tipoCodigo) {
        icmsTipoDropdown.setValue(ic.tipoCodigo);
        applyIcmsTipo(ic.tipoCodigo);
        if (ic.codigo) (ic.tipoCodigo === 'csosn' ? icmsCsosnDropdown : icmsCstDropdown).setValue(ic.codigo);
      }
      if (ic.origem) icmsOrigemDropdown.setValue(ic.origem);
      document.getElementById('icms-cbenef').value = ic.cBenef || '';
      if (ic.modalidadeBc) icmsModbcDropdown.setValue(ic.modalidadeBc);
      setPercentValue(document.getElementById('icms-reducao-base'), ic.reducaoBase);
      setPercentValue(document.getElementById('icms-aliquota'), ic.aliquota);
      if (ic.difal) icmsDifalDropdown.setValue(ic.difal);
      if (ic.fcp) icmsFcpDropdown.setValue(ic.fcp);
      document.getElementById('icms-observacao').value = ic.observacao || '';
      document.getElementById('icms-info-fisco').value = ic.informacaoFisco || '';
    }
    if (t.ipi) {
      ipiCodigoDropdown.setValue(t.ipi.codigo || 'nao-destacar');
      document.getElementById('ipi-aliquota').value = t.ipi.aliquota || '';
      document.getElementById('ipi-enquadramento').value = t.ipi.codigoEnquadramento || '';
      document.getElementById('ipi-observacao').value = t.ipi.observacao || '';
      document.getElementById('ipi-info-fisco').value = t.ipi.informacaoFisco || '';
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
    if (t.ibsCbs) {
      if (t.ibsCbs.credPresCodigo) credpresCodigoDropdown.setValue(t.ibsCbs.credPresCodigo);
      setPercentValue(document.getElementById('ibscbs-credpres-ibs'), t.ibsCbs.credPresIbs);
      setPercentValue(document.getElementById('ibscbs-credpres-cbs'), t.ibsCbs.credPresCbs);
      if (t.ibsCbs.monofasica) monofasicaDropdown.setValue(t.ibsCbs.monofasica);
      if (t.ibsCbs.transfCredito) transfCreditoDropdown.setValue(t.ibsCbs.transfCredito);
      setPercentValue(document.getElementById('ibscbs-mun-aliquota'), t.ibsCbs.ibsMunAliquota);
      setPercentValue(document.getElementById('ibscbs-mun-reducao'), t.ibsCbs.ibsMunReducao);
      setPercentValue(document.getElementById('ibscbs-mun-efetiva'), t.ibsCbs.ibsMunAliquotaEfetiva);
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
    var mun = {
      ibsMunAliquota: percentValue(document.getElementById('ibscbs-mun-aliquota')),
      ibsMunReducao: percentValue(document.getElementById('ibscbs-mun-reducao')),
      ibsMunAliquotaEfetiva: percentValue(document.getElementById('ibscbs-mun-efetiva'))
    };
    var cred = {
      credPresCodigo: credpresCodigoDropdown.getValue(),
      credPresIbs: percentValue(document.getElementById('ibscbs-credpres-ibs')),
      credPresCbs: percentValue(document.getElementById('ibscbs-credpres-cbs')),
      monofasica: monofasicaDropdown.getValue(),
      transfCredito: transfCreditoDropdown.getValue()
    };
    var hasMun = !!(mun.ibsMunAliquota || mun.ibsMunReducao || mun.ibsMunAliquotaEfetiva ||
      cred.credPresCodigo || cred.credPresIbs || cred.credPresCbs || cred.monofasica || cred.transfCredito);
    if (!ibscbsState.cst && !hasMun) return null;
    var config = ibsCbs.getFieldConfig(ibscbsState.cst);
    var payload = Object.assign({ cst: ibscbsState.cst, cclasstrib: ibscbsState.cclasstrib }, mun, cred);
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
      // `serie` continua existindo só como resumo pra listagem (que exibe uma
      // coluna Série); a fonte de verdade agora é `numeracao`.
      serie: numeracao.map(function (n) { return n.serie; }).filter(function (s, i, arr) { return arr.indexOf(s) === i; }).join(', '),
      inscricoesEstaduais: ieSelected.slice(),
      numeracao: numeracao.map(function (n) { return { ieKey: n.ieKey, modelo: '55', serie: n.serie, ultima: n.ultima, uso: n.uso }; }),
      tipoEmitente: emitenteDropdown.getValue(),
      regimeTributario: regimeDropdown.getValue(),
      codigoRegimeTributario: regimeDropdown.getValue(),
      consumidorFinal: getRadio('consumidor-final') === 'sim',
      observacao: document.getElementById('nnop-observacao').value.trim(),
      tributacao: {
        icms: {
          tipoCodigo: icmsTipoDropdown.getValue(),
          codigo: icmsTipoDropdown.getValue() === 'csosn' ? icmsCsosnDropdown.getValue() : (icmsTipoDropdown.getValue() === 'cst' ? icmsCstDropdown.getValue() : ''),
          origem: icmsOrigemDropdown.getValue(),
          cBenef: document.getElementById('icms-cbenef').value.trim(),
          modalidadeBc: icmsModbcDropdown.getValue(),
          reducaoBase: percentValue(document.getElementById('icms-reducao-base')),
          aliquota: percentValue(document.getElementById('icms-aliquota')),
          difal: icmsDifalDropdown.getValue(),
          fcp: icmsFcpDropdown.getValue(),
          observacao: document.getElementById('icms-observacao').value.trim(),
          informacaoFisco: document.getElementById('icms-info-fisco').value.trim()
        },
        ipi: {
          codigo: ipiCodigoDropdown.getValue() || 'nao-destacar',
          aliquota: document.getElementById('ipi-aliquota').value.trim(),
          codigoEnquadramento: document.getElementById('ipi-enquadramento').value.trim(),
          observacao: document.getElementById('ipi-observacao').value.trim(),
          informacaoFisco: document.getElementById('ipi-info-fisco').value.trim()
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
