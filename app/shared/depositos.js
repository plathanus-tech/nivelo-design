(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // naturezas-operacao.js/categorias-financeiras.js/produtos.js). ----------
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
    toast.className = 'alert success dep-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novodeposito.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novodeposito.success');
  } catch (e) {}
  if (successMessage) showSuccessToast(successMessage, 'O depósito já está disponível na listagem.');

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  function fazendaNome(fazendaId) {
    if (!fazendaId || !window.NiveloFazendas) return '—';
    var fazenda = window.NiveloFazendas.findById(fazendaId);
    return fazenda ? fazenda.nome : '—';
  }

  var tbody = document.getElementById('dep-tbody');

  function buildActionsHTML(local) {
    var toggle = local.ativo
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

  function buildRowHTML(local) {
    var statusBadge = ATIVO_BADGE[local.ativo ? 'ativo' : 'inativo'];
    var searchText = normalize(local.nome);
    return (
      '<tr class="tr" id="dep-row-' + encodeURIComponent(local.nome) + '" data-nome="' + local.nome.replace(/"/g, '&quot;') + '" data-status="' + (local.ativo ? 'ativo' : 'inativo') + '" data-search="' + searchText + '">' +
        '<td class="td">' + local.nome + '</td>' +
        '<td class="td">' + local.tipo + '</td>' +
        '<td class="td">' + fazendaNome(local.fazendaId) + '</td>' +
        '<td class="td">' + local.uso + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(local) + '</td>' +
      '</tr>'
    );
  }

  var emptyState = document.getElementById('dep-empty-state');
  var emptyGlobal = document.getElementById('dep-empty-global');
  var searchInput = document.getElementById('dep-search-input');
  var listCard = document.querySelector('.card.dep-list-card');

  var state = { search: '' };

  function renderInitialRows() {
    var locais = window.NiveloLocais.list();
    if (!locais.length) {
      listCard.hidden = true;
      emptyGlobal.hidden = false;
      return;
    }
    listCard.hidden = false;
    emptyGlobal.hidden = true;
    tbody.innerHTML = locais.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  function rowMatches(row) {
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
    nome: { cellIndex: 0, type: 'text' },
    tipo: { cellIndex: 1, type: 'text' },
    status: { cellIndex: 4, type: 'status' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('dep-header-row');

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

  // ---------- Ativar/Desativar (real, com modal de confirmação) ----------
  function updateRowInPlace(local) {
    var row = document.getElementById('dep-row-' + encodeURIComponent(local.nome));
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(local);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
  }

  function toggleAtivo(nome) {
    var local = window.NiveloLocais.toggleAtivo(nome);
    if (!local) return;
    updateRowInPlace(local);
    applyFilters();
    showSuccessToast(
      local.ativo ? 'Depósito ativado com sucesso.' : 'Depósito desativado com sucesso.',
      '"' + local.nome + '" agora está ' + (local.ativo ? 'ativo' : 'inativo') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleNome = null;

  function openToggleAtivoDialog(nome) {
    var local = window.NiveloLocais.findByNome(nome);
    if (!local) return;
    pendingToggleNome = nome;
    if (local.ativo) {
      toggleTitle.textContent = 'Desativar depósito';
      toggleMessage.textContent = 'Tem certeza que deseja desativar "' + local.nome + '"?';
      toggleConfirmBtn.className = 'btn destructive sm';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar depósito';
      toggleMessage.textContent = 'Tem certeza que deseja ativar "' + local.nome + '"?';
      toggleConfirmBtn.className = 'btn primary sm';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }
  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleNome = null;
  }
  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var nome = pendingToggleNome;
    closeToggleAtivoDialog();
    if (nome) toggleAtivo(nome);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  // ---------- Ações da tabela ----------
  function openEditScreen(row) {
    window.location.href = 'novo-deposito.html?nome=' + encodeURIComponent(row.dataset.nome);
  }
  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'editar') openEditScreen(row);
    else if (action === 'ativar' || action === 'desativar') openToggleAtivoDialog(row.dataset.nome);
  }
  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  function goToNovoDeposito() {
    window.location.href = 'novo-deposito.html';
  }
  document.getElementById('new-deposito-btn').addEventListener('click', goToNovoDeposito);
  var emptyGlobalBtn = document.getElementById('dep-empty-global-btn');
  if (emptyGlobalBtn) emptyGlobalBtn.addEventListener('click', goToNovoDeposito);

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('dep-cards');
  function cellText(cell) { return cell.textContent.trim(); }
  function buildCardHTML(row) {
    var actionsHTML = row.children[5].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card dep-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="dep-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
        '<dl class="dep-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Tipo</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Fazenda Vinculada</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Uso</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[4].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions dep-mobile-card-actions">' + actionsHTML + '</div>' +
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
