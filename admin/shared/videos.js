(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success vid-toast';
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
      raw = sessionStorage.getItem('nivelo.novovideo.success');
      if (raw) sessionStorage.removeItem('nivelo.novovideo.success');
    } catch (e) {}
    if (!raw) return;
    try {
      var parsed = JSON.parse(raw);
      showSuccessToast(parsed.title, parsed.message);
    } catch (e) {}
  })();

  // Mesmo padrão de cor+ícone por categoria já usado na tela de Vídeos do cliente.
  var CATEGORIA_COR = {
    'Primeiros passos': 'info',
    'Notas Fiscais': 'indigo',
    'Financeiro': 'success',
    'Estoque': 'orange',
    'Caderno de Campo': 'violet',
    'Assistente IA': 'pink'
  };
  var CATEGORIA_ICONE = {
    'Primeiros passos': 'flag',
    'Notas Fiscais': 'receipt',
    'Financeiro': 'wallet',
    'Estoque': 'package',
    'Caderno de Campo': 'book-open',
    'Assistente IA': 'bot'
  };

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }
  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
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

  // ---------- Popula o Dropdown de Categoria a partir do catálogo central ----------
  var categoriaMenu = document.getElementById('vid-categoria-menu');
  window.NiveloAdminVideos.categorias().forEach(function (categoria) {
    var option = document.createElement('div');
    option.className = 'option';
    option.dataset.value = categoria;
    option.textContent = categoria;
    categoriaMenu.appendChild(option);
  });

  // ---------- Grid de cards ----------
  var gridEl = document.getElementById('vid-grid');
  var emptyEl = document.getElementById('vid-empty-state');
  var emptyMessageEl = document.getElementById('vid-empty-message');
  var emptyLimparBtn = document.getElementById('vid-empty-limpar');

  function buildThumbHTML(video) {
    if (video.thumbnail) {
      return '<img src="' + escapeHtml(video.thumbnail) + '" alt="" loading="lazy" />';
    }
    return '<div class="videos-thumb-placeholder"><i data-lucide="play-circle" width="32" height="32"></i></div>';
  }

  function buildActionsHTML(video) {
    var url = window.NiveloAdminVideos.urlFor(video);
    return (
      '<a class="actionBtn" data-action="ver-cliente" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer" aria-label="Visualizar como cliente"><i data-lucide="external-link" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Visualizar como cliente</span></a>' +
      '<button type="button" class="actionBtn" data-action="editar" data-id="' + video.id + '" aria-label="Editar vídeo"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar vídeo</span></button>' +
      '<button type="button" class="actionBtn" data-action="toggle" data-id="' + video.id + '" aria-label="' + (video.status === 'ativo' ? 'Desativar vídeo' : 'Ativar vídeo') + '"><i data-lucide="' + (video.status === 'ativo' ? 'ban' : 'check-circle') + '" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>' + (video.status === 'ativo' ? 'Desativar vídeo' : 'Ativar vídeo') + '</span></button>' +
      '<button type="button" class="actionBtn actionDanger" data-action="excluir" data-id="' + video.id + '" aria-label="Excluir vídeo"><i data-lucide="trash-2" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Excluir vídeo</span></button>'
    );
  }

  function buildCardHTML(video) {
    var cor = CATEGORIA_COR[video.categoria] || 'info';
    var icone = CATEGORIA_ICONE[video.categoria] || 'circle';
    var searchText = normalize(video.titulo + ' ' + video.categoria);
    return (
      '<article class="card videos-card" data-video-id="' + escapeHtml(video.id) + '" data-categoria="' + escapeHtml(video.categoria) + '" data-status="' + video.status + '" data-search="' + searchText + '">' +
        '<div class="videos-card-thumb">' + buildThumbHTML(video) + '</div>' +
        '<div class="videos-card-body">' +
          '<div class="vid-card-badges">' +
            '<span class="badge videos-card-category" data-status="' + cor + '"><i data-lucide="' + icone + '" width="12" height="12"></i>' + escapeHtml(video.categoria) + '</span>' +
            '<span class="badge" data-status="' + (video.status === 'ativo' ? 'success' : 'warning') + '"><span class="badgeDot"></span>' + (video.status === 'ativo' ? 'Ativo' : 'Inativo') + '</span>' +
          '</div>' +
          '<h2 class="videos-card-title text-subtitle-m">' + escapeHtml(video.titulo) + '</h2>' +
          '<div class="videos-card-footer">' +
            '<span class="videos-card-yt-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>' +
            '<span class="videos-card-cta text-body-s">YouTube</span>' +
          '</div>' +
        '</div>' +
        '<div class="vid-card-actions">' + buildActionsHTML(video) + '</div>' +
      '</article>'
    );
  }

  // ---------- Estado (busca + filtros) ----------
  var searchInput = document.getElementById('vid-search-input');
  var state = { search: '', categoria: '', status: '' };

  function cardMatches(card) {
    if (state.categoria && card.dataset.categoria !== state.categoria) return false;
    if (state.status && card.dataset.status !== state.status) return false;
    if (state.search) {
      var haystack = normalize(card.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  function applyFilters() {
    var videos = window.NiveloAdminVideos.list();
    var totalCount = videos.length;

    if (!totalCount) {
      gridEl.hidden = true;
      emptyEl.hidden = false;
      emptyMessageEl.textContent = 'Nenhum vídeo cadastrado ainda.';
      emptyLimparBtn.hidden = true;
      return;
    }

    gridEl.innerHTML = videos.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();

    var cards = Array.prototype.slice.call(gridEl.querySelectorAll('.videos-card'));
    var anyVisible = false;
    cards.forEach(function (card) {
      var matches = cardMatches(card);
      card.hidden = !matches;
      if (matches) anyVisible = true;
    });

    gridEl.hidden = !anyVisible;
    emptyEl.hidden = anyVisible;
    if (!anyVisible) {
      emptyMessageEl.textContent = 'Nenhum vídeo encontrado para os filtros selecionados.';
      emptyLimparBtn.hidden = false;
    }
  }

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Dropdowns do popover ----------
  var categoriaDropdown = initDropdown(document.getElementById('dropdown-categoria'));
  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  // ---------- Agrupamento de Filtros (Popover) ----------
  var filtrosPopoverEl = document.getElementById('vid-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('vid-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('vid-filtros-trigger');

  function positionFiltrosPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(300, window.innerWidth - margin * 2);
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

  document.getElementById('vid-filtros-aplicar').addEventListener('click', function () {
    state.categoria = document.getElementById('dropdown-categoria').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });

  function limparFiltros() {
    categoriaDropdown.reset('', 'Todas as categorias');
    statusDropdown.reset('', 'Todos os status');
    searchInput.value = '';
    state = { search: '', categoria: '', status: '' };
    applyFilters();
  }
  document.getElementById('vid-filtros-limpar').addEventListener('click', function () {
    limparFiltros();
    closeFiltrosPopover();
  });
  emptyLimparBtn.addEventListener('click', limparFiltros);

  // ---------- Navegação ----------
  document.getElementById('vid-novo-btn').addEventListener('click', function () {
    window.location.href = 'novo-video.html';
  });

  // ---------- Modal: Ativar / Desativar ----------
  var toggleOverlay = document.getElementById('vid-toggle-dialog-overlay');
  var toggleState = { id: null };

  function openToggleDialog(id) {
    var video = window.NiveloAdminVideos.findById(id);
    if (!video) return;
    toggleState.id = id;
    var confirmBtn = document.getElementById('vid-toggle-dialog-confirm');
    if (video.status === 'ativo') {
      document.getElementById('vid-toggle-dialog-title').textContent = 'Desativar vídeo';
      document.getElementById('vid-toggle-dialog-message').textContent = 'Tem certeza que deseja desativar o vídeo "' + video.titulo + '"? Ele deixará de ser exibido para os clientes.';
      confirmBtn.className = 'btn destructive sm';
      confirmBtn.textContent = 'Desativar';
    } else {
      document.getElementById('vid-toggle-dialog-title').textContent = 'Ativar vídeo';
      document.getElementById('vid-toggle-dialog-message').textContent = 'Tem certeza que deseja ativar o vídeo "' + video.titulo + '"? Ele passará a ser exibido para os clientes.';
      confirmBtn.className = 'btn primary sm';
      confirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }
  function closeToggleDialog() { toggleOverlay.hidden = true; }

  document.getElementById('vid-toggle-dialog-close').addEventListener('click', closeToggleDialog);
  document.getElementById('vid-toggle-dialog-cancel').addEventListener('click', closeToggleDialog);
  toggleOverlay.addEventListener('click', function (event) { if (event.target === toggleOverlay) closeToggleDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleDialog(); });

  document.getElementById('vid-toggle-dialog-confirm').addEventListener('click', function () {
    var video = window.NiveloAdminVideos.toggleAtivo(toggleState.id);
    if (!video) return;
    closeToggleDialog();
    applyFilters();
    showSuccessToast('Vídeo ' + (video.status === 'ativo' ? 'ativado' : 'desativado') + ' com sucesso', video.titulo + '.');
  });

  // ---------- Modal: Excluir ----------
  var deleteOverlay = document.getElementById('vid-delete-dialog-overlay');
  var deleteState = { id: null };

  function openDeleteDialog(id) {
    var video = window.NiveloAdminVideos.findById(id);
    if (!video) return;
    deleteState.id = id;
    document.getElementById('vid-delete-dialog-message').textContent = 'Tem certeza que deseja excluir este vídeo? "' + video.titulo + '" será removido da biblioteca e deixará de ser exibido para os clientes.';
    deleteOverlay.hidden = false;
  }
  function closeDeleteDialog() { deleteOverlay.hidden = true; }

  document.getElementById('vid-delete-dialog-close').addEventListener('click', closeDeleteDialog);
  document.getElementById('vid-delete-dialog-cancel').addEventListener('click', closeDeleteDialog);
  deleteOverlay.addEventListener('click', function (event) { if (event.target === deleteOverlay) closeDeleteDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !deleteOverlay.hidden) closeDeleteDialog(); });

  document.getElementById('vid-delete-dialog-confirm').addEventListener('click', function () {
    var video = window.NiveloAdminVideos.findById(deleteState.id);
    if (!video) return;
    window.NiveloAdminVideos.remove(deleteState.id);
    closeDeleteDialog();
    applyFilters();
    showSuccessToast('Vídeo excluído com sucesso', video.titulo + '.');
  });

  // ---------- Dispatcher de ações (Editar/Ativar-Desativar/Excluir) ----------
  gridEl.addEventListener('click', function (event) {
    var editarBtn = event.target.closest('.actionBtn[data-action="editar"]');
    if (editarBtn) { window.location.href = 'novo-video.html?id=' + editarBtn.dataset.id; return; }

    var toggleBtn = event.target.closest('.actionBtn[data-action="toggle"]');
    if (toggleBtn) { openToggleDialog(toggleBtn.dataset.id); return; }

    var excluirBtn = event.target.closest('.actionBtn[data-action="excluir"]');
    if (excluirBtn) { openDeleteDialog(excluirBtn.dataset.id); return; }
  });

  // ---------- Tooltip padrão dos ícones de ação — mesma técnica de `cupons.js`/`usuarios.js`/
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
  applyFilters();
})();
