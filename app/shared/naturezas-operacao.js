(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // categorias-financeiras.js/produtos.js/cadastros.js). ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) { document.body.appendChild(tip); btn.__tip = tip; }
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
    var margin = 8;
    var tipRect = tip.getBoundingClientRect();
    if (tipRect.left < margin) {
      tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
    } else if (tipRect.right > window.innerWidth - margin) {
      tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
    }
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

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success nop-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      (message ? '<div class="message">' + message + '</div>' : '') +
      '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novanatureza.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novanatureza.success');
  } catch (e) {}
  if (successMessage) showSuccessToast(successMessage, 'A natureza de operação já está disponível na listagem.');

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  var SIM_NAO_LABEL = { sim: 'Sim', nao: 'Não' };
  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  var tbody = document.getElementById('nop-tbody');

  function buildActionsHTML(natureza) {
    var toggle = natureza.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" aria-label="' + toggle.label + '">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(natureza) {
    var statusBadge = ATIVO_BADGE[natureza.ativo ? 'ativo' : 'inativo'];
    var searchText = normalize(natureza.descricao + ' ' + natureza.codigo);
    return (
      '<tr class="tr" id="nop-row-' + natureza.codigo + '" data-codigo="' + natureza.codigo + '" data-tipo="' + natureza.tipo + '" data-status="' + (natureza.ativo ? 'ativo' : 'inativo') + '" data-search="' + searchText + '">' +
        '<td class="td">' + natureza.descricao + '</td>' +
        '<td class="td">' + (natureza.padrao ? SIM_NAO_LABEL.sim : SIM_NAO_LABEL.nao) + '</td>' +
        '<td class="td">' + natureza.serie + '</td>' +
        '<td class="td">' + (natureza.consumidorFinal ? SIM_NAO_LABEL.sim : SIM_NAO_LABEL.nao) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(natureza) + '</td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    tbody.innerHTML = window.NiveloNaturezasOperacao.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  var emptyState = document.getElementById('nop-empty-state');
  var searchInput = document.getElementById('nop-search-input');
  var tablist = document.getElementById('nop-tablist');

  var state = { tipo: 'entrada', status: '', search: '' };

  function rowMatches(row) {
    if (row.dataset.tipo !== state.tipo) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var anyMatch = false;
    rows.forEach(function (row) {
      var matches = rowMatches(row);
      row.hidden = !matches;
      if (matches) anyMatch = true;
    });
    emptyState.hidden = anyMatch;
    renderCards();
  }

  // ---------- Ordenação ----------
  var STATUS_RANK = { ativo: 0, inativo: 1 };
  var SORTABLE_COLUMNS = {
    descricao: { cellIndex: 0, type: 'text' },
    status: { cellIndex: 4, type: 'status' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('nop-header-row');

  function sortRows() {
    if (!sortState.key) return;
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (config.type === 'status') {
        va = STATUS_RANK[a.dataset.status];
        vb = STATUS_RANK[b.dataset.status];
      } else {
        va = normalize(a.children[config.cellIndex].textContent);
        vb = normalize(b.children[config.cellIndex].textContent);
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  function updateSortIcons() {
    Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (th) {
      var key = th.dataset.sortKey;
      var active = sortState.key === key;
      th.setAttribute('aria-sort', active ? (sortState.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      var iconName = active ? (sortState.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
      var iconEl = th.querySelector('[data-sort-icon]');
      iconEl.innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
    });
    if (window.lucide) lucide.createIcons();
  }

  headerRow.addEventListener('click', function (event) {
    var th = event.target.closest('.th.sortable');
    if (!th) return;
    var key = th.dataset.sortKey;
    if (sortState.key === key) {
      sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sortState.key = key;
      sortState.dir = 'asc';
    }
    updateSortIcons();
    sortRows();
    applyFilters();
  });

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Abas Entrada/Saída ----------
  tablist.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    Array.prototype.slice.call(tablist.querySelectorAll('.tab')).forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');
    state.tipo = tabBtn.dataset.tab;
    applyFilters();
  });

  // ---------- Dropdown genérico (mesmo padrão de Categorias/Produtos/Cadastro) ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 200;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 120 && spaceAbove > spaceBelow) {
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
    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
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
  }

  initDropdown(document.getElementById('dropdown-status'), function (value) {
    state.status = value;
    applyFilters();
  });

  // ---------- Ativar/Desativar (real, com modal de confirmação) ----------
  function updateRowInPlace(natureza) {
    var row = document.getElementById('nop-row-' + natureza.codigo);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(natureza);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
  }

  function toggleAtivo(codigo) {
    var natureza = window.NiveloNaturezasOperacao.toggleAtivo(codigo);
    if (!natureza) return;
    updateRowInPlace(natureza);
    applyFilters();
    showSuccessToast(
      natureza.ativo ? 'Natureza de operação ativada com sucesso.' : 'Natureza de operação desativada com sucesso.',
      '"' + natureza.descricao + '" agora está ' + (natureza.ativo ? 'ativa' : 'inativa') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleCodigo = null;

  function openToggleAtivoDialog(codigo) {
    var natureza = window.NiveloNaturezasOperacao.findByCodigo(codigo);
    if (!natureza) return;
    pendingToggleCodigo = codigo;
    if (natureza.ativo) {
      toggleTitle.textContent = 'Desativar natureza de operação';
      toggleMessage.textContent = 'Tem certeza que deseja desativar "' + natureza.descricao + '"?';
      toggleConfirmBtn.className = 'btn destructive';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar natureza de operação';
      toggleMessage.textContent = 'Tem certeza que deseja ativar "' + natureza.descricao + '"?';
      toggleConfirmBtn.className = 'btn primary';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }
  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleCodigo = null;
  }
  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var codigo = pendingToggleCodigo;
    closeToggleAtivoDialog();
    if (codigo) toggleAtivo(codigo);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  // ---------- Ações da tabela ----------
  function openEditScreen(row) {
    window.location.href = 'nova-natureza-operacao.html?codigo=' + encodeURIComponent(row.dataset.codigo);
  }
  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'editar') openEditScreen(row);
    else if (action === 'ativar' || action === 'desativar') openToggleAtivoDialog(row.dataset.codigo);
  }
  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  document.getElementById('new-natureza-btn').addEventListener('click', function () {
    window.location.href = 'nova-natureza-operacao.html?tipo=' + encodeURIComponent(state.tipo);
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('nop-cards');
  function cellText(cell) { return cell.textContent.trim(); }
  function buildCardHTML(row) {
    var actionsHTML = row.children[5].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card nop-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="nop-mobile-card-header">' +
          '<div class="nop-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
        '</div>' +
        '<dl class="nop-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Padrão</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Série</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Consumidor Final</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[4].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions nop-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }
  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }
  cardsContainer.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var cardEl = btn.closest('[data-row-id]');
    var row = document.getElementById(cardEl.dataset.rowId);
    handleRowAction(btn, row);
  });

  renderInitialRows();
  applyFilters();
})();
