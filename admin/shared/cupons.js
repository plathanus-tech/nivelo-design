(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success cup-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div>' + (message ? '<div class="message">' + message + '</div>' : '') + '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }
  (function showPendingToast() {
    var raw = null;
    try {
      raw = sessionStorage.getItem('nivelo.novocupom.success');
      if (raw) sessionStorage.removeItem('nivelo.novocupom.success');
    } catch (e) {}
    if (!raw) return;
    try {
      var parsed = JSON.parse(raw);
      showSuccessToast(parsed.title, parsed.message);
    } catch (e) {}
  })();

  var TODAY = window.NiveloCupons.TODAY;
  var TIPO_LABELS = window.NiveloCupons.TIPO_LABELS;
  var TIPO_BADGE = { afiliado: 'indigo', promocional: 'info' };

  function formatDateBR(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatBRL(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Dropdown genérico (seleção única), position:fixed via JS ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
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
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
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
    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    return { selectOption: selectOption, reset: reset };
  }

  // ---------- Período dos indicadores (KPIs) ----------
  function periodBoundsFor(value) {
    if (value === 'hoje') return { start: TODAY, end: TODAY };
    if (value === '7d') return { start: window.NiveloCupons.addDias(TODAY, -6), end: TODAY };
    if (value === '30d') return { start: window.NiveloCupons.addDias(TODAY, -29), end: TODAY };
    if (value === 'mes') return { start: TODAY.slice(0, 8) + '01', end: TODAY };
    return { start: null, end: null };
  }

  function updateKpis() {
    var periodo = document.getElementById('dropdown-kpi-periodo').dataset.value || 'mes';
    var bounds = periodBoundsFor(periodo);
    document.getElementById('cup-kpi-ativos').textContent = String(window.NiveloCupons.cuponsAtivosCount());
    document.getElementById('cup-kpi-afiliados').textContent = String(window.NiveloCupons.afiliadosAtivosCount());
    document.getElementById('cup-kpi-clientes').textContent = String(window.NiveloCupons.clientesUnicosNoPeriodo(bounds.start, bounds.end));
    document.getElementById('cup-kpi-utilizacoes').textContent = String(window.NiveloCupons.utilizacoesNoPeriodo(bounds.start, bounds.end));
    document.getElementById('cup-kpi-desconto').textContent = formatBRL(window.NiveloCupons.descontoNoPeriodo(bounds.start, bounds.end));
  }

  initDropdown(document.getElementById('dropdown-kpi-periodo'), updateKpis);

  // ---------- Renderiza a tabela a partir do catálogo central ----------
  var tbody = document.getElementById('cup-tbody');

  function buildActionsHTML(cupom) {
    return (
      '<a class="actionBtn" data-action="ver-detalhes" href="cupom-detalhe.html?codigo=' + cupom.codigo + '" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></a>' +
      '<a class="actionBtn" data-action="editar" href="novo-cupom.html?codigo=' + cupom.codigo + '" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></a>' +
      '<button type="button" class="actionBtn" data-action="toggle" data-codigo="' + cupom.codigo + '" aria-label="' + (cupom.ativo ? 'Desativar' : 'Ativar') + '"><i data-lucide="' + (cupom.ativo ? 'ban' : 'check-circle') + '" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>' + (cupom.ativo ? 'Desativar' : 'Ativar') + '</span></button>'
    );
  }

  function buildRowHTML(cupom) {
    var utilizacoes = cupom.utilizacoes.length;
    var desconto = window.NiveloCupons.totalDescontoConcedido(cupom);
    var searchText = normalize(cupom.nome + ' ' + cupom.codigo);
    return (
      '<tr class="tr" id="cup-row-' + cupom.codigo + '" data-codigo="' + cupom.codigo + '" data-tipo="' + cupom.tipo + '" data-status="' + (cupom.ativo ? 'ativo' : 'inativo') + '" data-inicio="' + cupom.dataInicio + '" data-fim="' + cupom.dataFim + '" data-search="' + searchText + '">' +
        '<td class="td"><span class="badge" data-status="' + TIPO_BADGE[cupom.tipo] + '"><span class="badgeDot"></span>' + TIPO_LABELS[cupom.tipo] + '</span></td>' +
        '<td class="td"><span class="cup-nome-cell">' + cupom.nome + '</span></td>' +
        '<td class="td"><span class="cup-codigo-cell">' + cupom.codigo + '</span></td>' +
        '<td class="td">' + cupom.percentualDesconto + '%</td>' +
        '<td class="td">' + formatDateBR(cupom.dataInicio) + ' até ' + formatDateBR(cupom.dataFim) + '</td>' +
        '<td class="td">' + utilizacoes + '</td>' +
        '<td class="td">' + formatBRL(desconto) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + (cupom.ativo ? 'success' : 'warning') + '"><span class="badgeDot"></span>' + (cupom.ativo ? 'Ativo' : 'Inativo') + '</span></td>' +
        '<td class="td"><div class="cellActions">' + buildActionsHTML(cupom) + '</div></td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var rows = window.NiveloCupons.list().slice().sort(function (a, b) { return a.dataCriacao < b.dataCriacao ? 1 : -1; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + filtros) ----------
  var emptyState = document.getElementById('cup-empty-state');
  var searchInput = document.getElementById('cup-search-input');

  var state = {
    search: '',
    tipo: '',
    status: '',
    validadeStart: null,
    validadeEnd: null
  };

  function rowMatches(row) {
    if (state.tipo && row.dataset.tipo !== state.tipo) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.validadeStart && row.dataset.fim < state.validadeStart) return false;
    if (state.validadeEnd && row.dataset.inicio > state.validadeEnd) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card cup-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="cup-mobile-card-header">' +
          '<div><div class="cup-mobile-card-name text-subtitle-s">' + cellText(row.children[1]) + '</div>' +
          '<span class="cup-mobile-card-codigo text-body-xs">' + cellText(row.children[2]) + '</span></div>' +
          row.children[0].innerHTML +
        '</div>' +
        '<dl class="cup-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Desconto</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Validade</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Utilizações</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Desconto concedido</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[7].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="cup-mobile-card-actions">' + row.children[8].innerHTML + '</div>' +
      '</div>'
    );
  }

  var cardsContainer = document.getElementById('cup-cards');

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var anyVisible = false;
    rows.forEach(function (row) {
      var matches = rowMatches(row);
      row.hidden = !matches;
      if (matches) anyVisible = true;
    });
    emptyState.hidden = anyVisible;
    renderCards();
  }

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Dropdowns do popover ----------
  var tipoDropdown = initDropdown(document.getElementById('dropdown-tipo'));
  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));
  var validadeStartInput = document.getElementById('cup-validade-start-input');
  var validadeEndInput = document.getElementById('cup-validade-end-input');

  // ---------- Agrupamento de Filtros (Popover) ----------
  var filtrosPopoverEl = document.getElementById('cup-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('cup-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('cup-filtros-trigger');

  function positionFiltrosPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(340, window.innerWidth - margin * 2);
    filtrosPopoverEl.style.width = width + 'px';
    var left = anchorRect.left;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    filtrosPopoverEl.style.left = left + 'px';
    filtrosPopoverEl.style.top = (anchorRect.bottom + 8) + 'px';
  }
  function outsideFiltrosClickHandler(event) {
    var path = event.composedPath ? event.composedPath() : [event.target];
    if (path.indexOf(filtrosPopoverEl) === -1 && path.indexOf(filtrosTriggerRoot) === -1) closeFiltrosPopover();
  }
  function openFiltrosPopover() {
    filtrosPopoverEl.hidden = false;
    positionFiltrosPopover(filtrosTriggerRoot.getBoundingClientRect());
    window.setTimeout(function () { document.addEventListener('click', outsideFiltrosClickHandler); }, 0);
  }
  function closeFiltrosPopover() {
    filtrosPopoverEl.hidden = true;
    document.removeEventListener('click', outsideFiltrosClickHandler);
  }
  filtrosTriggerBtn.addEventListener('click', function () {
    if (filtrosPopoverEl.hidden) openFiltrosPopover(); else closeFiltrosPopover();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filtrosPopoverEl.hidden) closeFiltrosPopover();
  });

  document.getElementById('cup-filtros-aplicar').addEventListener('click', function () {
    state.tipo = document.getElementById('dropdown-tipo').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.validadeStart = validadeStartInput.value || null;
    state.validadeEnd = validadeEndInput.value || null;
    closeFiltrosPopover();
    applyFilters();
  });

  function limparFiltros() {
    tipoDropdown.reset('', 'Todos os tipos');
    statusDropdown.reset('', 'Todos os status');
    validadeStartInput.value = '';
    validadeEndInput.value = '';
    searchInput.value = '';
    state = { search: '', tipo: '', status: '', validadeStart: null, validadeEnd: null };
    applyFilters();
  }
  document.getElementById('cup-filtros-limpar').addEventListener('click', function () {
    limparFiltros();
    closeFiltrosPopover();
  });
  document.getElementById('cup-empty-limpar').addEventListener('click', limparFiltros);

  // ---------- Navegação ----------
  document.getElementById('cup-novo-btn').addEventListener('click', function () {
    window.location.href = 'novo-cupom.html';
  });

  // ---------- Modal: Ativar / Desativar ----------
  var toggleOverlay = document.getElementById('cup-toggle-dialog-overlay');
  var toggleState = { codigo: null };

  function openToggleDialog(codigo) {
    var cupom = window.NiveloCupons.findByCodigo(codigo);
    if (!cupom) return;
    toggleState.codigo = codigo;
    var confirmBtn = document.getElementById('cup-toggle-dialog-confirm');
    if (cupom.ativo) {
      document.getElementById('cup-toggle-dialog-title').textContent = 'Desativar cupom';
      document.getElementById('cup-toggle-dialog-message').textContent = 'Tem certeza que deseja desativar o cupom "' + cupom.nome + '" (' + cupom.codigo + ')? Ele deixará de poder ser utilizado por novos clientes.';
      confirmBtn.className = 'btn destructive sm';
      confirmBtn.textContent = 'Desativar';
    } else {
      document.getElementById('cup-toggle-dialog-title').textContent = 'Ativar cupom';
      document.getElementById('cup-toggle-dialog-message').textContent = 'Tem certeza que deseja ativar o cupom "' + cupom.nome + '" (' + cupom.codigo + ')?';
      confirmBtn.className = 'btn primary sm';
      confirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }
  function closeToggleDialog() { toggleOverlay.hidden = true; }

  document.getElementById('cup-toggle-dialog-close').addEventListener('click', closeToggleDialog);
  document.getElementById('cup-toggle-dialog-cancel').addEventListener('click', closeToggleDialog);
  toggleOverlay.addEventListener('click', function (event) { if (event.target === toggleOverlay) closeToggleDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleDialog(); });

  document.getElementById('cup-toggle-dialog-confirm').addEventListener('click', function () {
    var cupom = window.NiveloCupons.toggleAtivo(toggleState.codigo);
    if (!cupom) return;
    closeToggleDialog();
    updateRow(cupom.codigo);
    updateKpis();
    showSuccessToast('Cupom ' + (cupom.ativo ? 'ativado' : 'desativado') + ' com sucesso', cupom.nome + ' (' + cupom.codigo + ').');
  });

  function updateRow(codigo) {
    var cupom = window.NiveloCupons.findByCodigo(codigo);
    var row = document.getElementById('cup-row-' + codigo);
    if (!cupom || !row) return;
    var wrapper = document.createElement('tbody');
    wrapper.innerHTML = buildRowHTML(cupom);
    row.replaceWith(wrapper.firstElementChild);
    if (window.lucide) lucide.createIcons();
    applyFilters();
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action="toggle"]');
    if (!btn) return;
    openToggleDialog(btn.dataset.codigo);
  });

  // ---------- Tooltip padrão dos ícones de ação — mesma técnica de `usuarios.js`/
  // `planos.js` (position:fixed calculado do rect do alvo). ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) {
      document.body.appendChild(tip);
      btn.__tip = tip;
    }
    return tip;
  }

  function positionActionTooltip(btn) {
    var tip = getActionTip(btn);
    if (!tip) return;
    var rect = btn.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    tip.style.position = 'fixed';
    tip.style.left = centerX + 'px';
    tip.style.transform = 'translateX(-50%)';
    tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    tip.style.top = 'auto';
    tip.style.opacity = '1';
  }

  function hideActionTooltip(btn) {
    var tip = btn.__tip;
    if (tip) tip.style.opacity = '0';
  }

  document.addEventListener('mouseover', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('mouseout', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) hideActionTooltip(btn);
  });
  document.addEventListener('focusin', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action]');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('focusout', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action]');
    if (btn) hideActionTooltip(btn);
  });

  // ---------- Boot ----------
  renderInitialRows();
  applyFilters();
  updateKpis();
})();
