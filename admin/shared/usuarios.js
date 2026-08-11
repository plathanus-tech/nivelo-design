(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação ----------
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

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success usr-toast';
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

  // ---------- Rótulos ----------
  var PERFIL_LABELS = { administrador: 'Administrador', suporte: 'Suporte' };
  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  var tbody = document.getElementById('usr-tbody');

  function buildActionsHTML(usuario) {
    var toggle = usuario.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" aria-label="' + toggle.label + '">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(usuario) {
    var statusBadge = ATIVO_BADGE[usuario.ativo ? 'ativo' : 'inativo'];
    var searchText = normalize(usuario.nome + ' ' + usuario.email);
    return (
      '<tr class="tr" id="usr-row-' + usuario.id + '" data-id="' + usuario.id + '" data-perfil="' + usuario.perfil + '" data-status="' + (usuario.ativo ? 'ativo' : 'inativo') + '" data-search="' + searchText + '">' +
        '<td class="td">' + usuario.nome + '</td>' +
        '<td class="td">' + usuario.email + '</td>' +
        '<td class="td">' + (PERFIL_LABELS[usuario.perfil] || usuario.perfil) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(usuario) + '</td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    tbody.innerHTML = window.NiveloUsuarios.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  var emptyState = document.getElementById('usr-empty-state');
  var searchInput = document.getElementById('usr-search-input');

  var state = { perfil: '', status: '', search: '' };

  function rowMatches(row) {
    if (state.perfil && row.dataset.perfil !== state.perfil) return false;
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
    emptyState.hidden = anyMatch || rows.length === 0;
    renderCards();
  }

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Dropdown genérico ----------
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
      root.dataset.value = optionEl.dataset.value;
      close();
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

  var perfilDropdown = initDropdown(document.getElementById('dropdown-perfil'));
  var statusFilterDropdown = initDropdown(document.getElementById('dropdown-status'));

  // ---------- Agrupamento de Filtros (FilterPopover) ----------
  var filtrosPopoverEl = document.getElementById('usr-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('usr-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('usr-filtros-trigger');

  function positionFiltrosPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(320, window.innerWidth - margin * 2);
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

  document.getElementById('usr-filtros-aplicar').addEventListener('click', function () {
    state.perfil = document.getElementById('dropdown-perfil').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('usr-filtros-limpar').addEventListener('click', function () {
    perfilDropdown.reset('', 'Todos os perfis');
    statusFilterDropdown.reset('', 'Todos os status');
    state.perfil = '';
    state.status = '';
    applyFilters();
  });

  // ---------- Ativar/Desativar: modal de confirmação antes da alteração
  // (pedido explícito), mesmo padrão exato já usado em Talhões/Categorias
  // de receitas e despesas: Desativar é destrutivo, Ativar é primário. ----
  function updateRowInPlace(usuario) {
    var row = document.getElementById('usr-row-' + usuario.id);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(usuario);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
  }

  function toggleAtivo(id) {
    var usuario = window.NiveloUsuarios.toggleAtivo(id);
    if (!usuario) return;
    updateRowInPlace(usuario);
    applyFilters();
    showSuccessToast(
      usuario.ativo ? 'Usuário ativado com sucesso.' : 'Usuário desativado com sucesso.',
      '"' + usuario.nome + '" agora está ' + (usuario.ativo ? 'ativo' : 'inativo') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleId = null;

  function openToggleAtivoDialog(id) {
    var usuario = window.NiveloUsuarios.findById(id);
    if (!usuario) return;
    pendingToggleId = id;
    if (usuario.ativo) {
      toggleTitle.textContent = 'Desativar usuário';
      toggleMessage.textContent = 'Tem certeza que deseja desativar este usuário?';
      toggleConfirmBtn.className = 'btn destructive';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar usuário';
      toggleMessage.textContent = 'Tem certeza que deseja ativar este usuário?';
      toggleConfirmBtn.className = 'btn primary';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }

  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleId = null;
  }

  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var id = pendingToggleId;
    closeToggleAtivoDialog();
    if (id) toggleAtivo(id);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'ativar' || action === 'desativar') openToggleAtivoDialog(Number(row.dataset.id));
  }

  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  // ---------- Modal "Adicionar usuário" — Nome/E-mail/Perfil obrigatórios,
  // usuário nasce Ativo por padrão (pedido explícito). ----------
  var formOverlay = document.getElementById('usr-form-dialog-overlay');
  var form = document.getElementById('usr-form');
  var nomeInput = document.getElementById('usr-nome');
  var nomeField = document.getElementById('usr-nome-field');
  var emailInput = document.getElementById('usr-email');
  var emailField = document.getElementById('usr-email-field');
  var perfilField = document.getElementById('usr-perfil-field');

  function setFieldError(field, hasError, message, errorTextEl) {
    field.classList.toggle('error', hasError);
    if (message && errorTextEl) errorTextEl.textContent = message;
  }

  nomeInput.addEventListener('input', function () { setFieldError(nomeField, false); });
  emailInput.addEventListener('input', function () { setFieldError(emailField, false); });

  var perfilFormDropdown = initDropdown(perfilField);

  function openFormDialog() {
    form.reset();
    setFieldError(nomeField, false);
    setFieldError(emailField, false);
    perfilFormDropdown.reset('', 'Selecione um perfil');
    perfilField.classList.remove('error');
    formOverlay.hidden = false;
    nomeInput.focus();
  }
  function closeFormDialog() {
    formOverlay.hidden = true;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var nome = nomeInput.value.trim();
    var email = emailInput.value.trim();
    var perfil = perfilField.dataset.value;

    var valid = true;
    if (!nome) {
      setFieldError(nomeField, true, 'Informe o nome do usuário.', document.getElementById('usr-nome-error-text'));
      valid = false;
    }
    if (!email || !isValidEmail(email)) {
      setFieldError(emailField, true, !email ? 'Informe o e-mail do usuário.' : 'Informe um e-mail válido.', document.getElementById('usr-email-error-text'));
      valid = false;
    } else if (window.NiveloUsuarios.isEmailDuplicado(email)) {
      setFieldError(emailField, true, 'Já existe um usuário com este e-mail.', document.getElementById('usr-email-error-text'));
      valid = false;
    }
    if (!perfil) {
      perfilField.classList.add('error');
      valid = false;
    }
    if (!valid) return;

    window.NiveloUsuarios.add({ nome: nome, email: email, perfil: perfil });
    closeFormDialog();
    renderInitialRows();
    applyFilters();
    showSuccessToast('Usuário cadastrado com sucesso.', '"' + nome + '" já está disponível na listagem.');
  });

  document.getElementById('usr-form-dialog-close').addEventListener('click', closeFormDialog);
  document.getElementById('usr-form-dialog-cancel').addEventListener('click', closeFormDialog);
  formOverlay.addEventListener('click', function (event) { if (event.target === formOverlay) closeFormDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !formOverlay.hidden) closeFormDialog(); });

  document.getElementById('new-usuario-btn').addEventListener('click', openFormDialog);

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('usr-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var actionsHTML = row.children[4].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card usr-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="usr-mobile-card-header">' +
          '<div class="usr-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
        '</div>' +
        '<div class="usr-mobile-card-email text-body-xs">' + cellText(row.children[1]) + '</div>' +
        '<dl class="usr-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Perfil</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[3].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions usr-mobile-card-actions">' + actionsHTML + '</div>' +
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
