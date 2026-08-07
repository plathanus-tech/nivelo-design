(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var COLLAPSED_KEY = 'nivelo.admin.shell.sidebarCollapsed';

  var sidebar = document.getElementById('app-sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.app-nav-item, .app-nav-subitem'))
    .filter(function (item) { return !item.hasAttribute('data-group-toggle'); });

  // ---------- Tooltip (Sidebar retraída) — mesma técnica de
  // app/shared/interface-principal.js (`position:fixed` calculado do rect
  // do alvo, escapa do `overflow-x:hidden` da Sidebar). ----------
  var tooltipEl = document.getElementById('app-tooltip');

  function showTooltip(target) {
    var text = target.getAttribute('data-tooltip');
    if (!text || !sidebar.classList.contains('is-collapsed')) return;
    var rect = target.getBoundingClientRect();
    tooltipEl.textContent = text;
    tooltipEl.style.top = (rect.top + rect.height / 2) + 'px';
    tooltipEl.style.left = (rect.right + 12) + 'px';
    tooltipEl.style.transform = 'translateY(-50%)';
    tooltipEl.classList.add('is-visible');
  }

  function hideTooltip() {
    tooltipEl.classList.remove('is-visible');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-tooltip]')).forEach(function (el) {
    el.addEventListener('mouseenter', function () { showTooltip(el); });
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('focus', function () { showTooltip(el); });
    el.addEventListener('blur', hideTooltip);
  });

  // ---------- Grupos de navegação — só "Assinantes" por agora. Mesma
  // arquitetura genérica de interface-principal.js (accordion de topo +
  // popover na sidebar retraída), pronta pra crescer com novos grupos
  // (ex. "Administração") sem precisar reescrever esta lógica. ----------
  var TOP_LEVEL_GROUP_IDS = ['group-assinantes'];
  var SUBGROUP_PARENTS = {};
  var SUBGROUP_IDS = Object.keys(SUBGROUP_PARENTS);

  function closeGroup(id) {
    var group = document.getElementById(id);
    if (!group) return;
    group.classList.remove('is-open');
    group.classList.remove('is-popover-open');
    var submenu = group.querySelector('.app-nav-submenu, .app-nav-subsubmenu');
    if (submenu) { submenu.style.top = ''; submenu.style.left = ''; }
    var toggle = document.querySelector('[data-group-toggle="' + id + '"]');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function closeAllTopLevelGroups() {
    TOP_LEVEL_GROUP_IDS.forEach(closeGroup);
    SUBGROUP_IDS.forEach(closeGroup);
  }

  function closeAllPopovers() {
    var anyClosed = false;
    TOP_LEVEL_GROUP_IDS.forEach(function (id) {
      var group = document.getElementById(id);
      if (group && group.classList.contains('is-popover-open')) { closeGroup(id); anyClosed = true; }
    });
    if (anyClosed) SUBGROUP_IDS.forEach(closeGroup);
  }

  // ---------- Sidebar: retrair/expandir (desktop) ----------
  function setCollapsed(collapsed) {
    closeAllTopLevelGroups();
    hideTooltip();
    sidebar.classList.toggle('is-collapsed', collapsed);
    sidebarToggleBtn.setAttribute('aria-expanded', String(!collapsed));
    sidebarToggleBtn.setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Retrair menu');
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0'); } catch (e) {}
  }

  sidebarToggleBtn.addEventListener('click', function () {
    setCollapsed(!sidebar.classList.contains('is-collapsed'));
  });

  // ---------- Sidebar: drawer mobile ----------
  function setMobileOpen(open) {
    sidebar.classList.toggle('is-mobile-open', open);
    backdrop.classList.toggle('is-visible', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    hamburgerBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  hamburgerBtn.addEventListener('click', function () {
    setMobileOpen(!sidebar.classList.contains('is-mobile-open'));
  });

  backdrop.addEventListener('click', function () { setMobileOpen(false); });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (sidebar.classList.contains('is-mobile-open')) setMobileOpen(false);
    closeAllPopovers();
  });

  // ---------- Grupos: accordion + Popover na Sidebar retraída ----------
  Array.prototype.slice.call(document.querySelectorAll('[data-group-toggle]')).forEach(function (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var groupId = toggleBtn.dataset.groupToggle;
      var group = document.getElementById(groupId);
      var isTopLevel = TOP_LEVEL_GROUP_IDS.indexOf(groupId) !== -1;
      var willOpen = !group.classList.contains('is-open');

      if (!isTopLevel) {
        group.classList.toggle('is-open', willOpen);
        toggleBtn.setAttribute('aria-expanded', String(willOpen));
        return;
      }

      if (!willOpen) { closeGroup(groupId); return; }

      TOP_LEVEL_GROUP_IDS.forEach(function (id) { if (id !== groupId) closeGroup(id); });
      SUBGROUP_IDS.forEach(function (subId) { if (SUBGROUP_PARENTS[subId] !== groupId) closeGroup(subId); });

      if (sidebar.classList.contains('is-collapsed')) {
        hideTooltip();
        var rect = toggleBtn.getBoundingClientRect();
        var submenu = group.querySelector('.app-nav-submenu');
        submenu.style.top = rect.top + 'px';
        submenu.style.left = (rect.right + 8) + 'px';
        group.classList.add('is-popover-open');
      }

      group.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    });
  });

  document.addEventListener('click', function (event) {
    TOP_LEVEL_GROUP_IDS.forEach(function (id) {
      var group = document.getElementById(id);
      if (group.classList.contains('is-popover-open') && !group.contains(event.target)) {
        closeGroup(id);
      }
    });
  });

  // ---------- Item ativo + navegação real ----------
  // Só "Canal de ideias" tem tela construída até aqui — os demais itens
  // (Usuários, Assinantes > Planos/Assinantes/Histórico, Cupons e
  // afiliados, Vídeos) ainda são só estrutura de menu, sem destino real
  // (mesmo padrão já usado no shell do cliente pra itens sem tela ainda).
  var NAV_DESTINATIONS = { 'admin-canal-ideias': 'canal-ideias.html' };

  navItems.forEach(function (item) {
    if (item.dataset.nav === 'admin-sair' || NAV_DESTINATIONS[item.dataset.nav]) return;
    item.addEventListener('click', function () {
      navItems.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');
      closeAllPopovers();
    });
  });

  var sairBtn = document.querySelector('[data-nav="admin-sair"]');
  if (sairBtn) {
    sairBtn.addEventListener('click', function () {
      window.location.href = 'login.html';
    });
  }

  Object.keys(NAV_DESTINATIONS).forEach(function (navId) {
    var el = document.querySelector('[data-nav="' + navId + '"]');
    if (el) el.addEventListener('click', function () { window.location.href = NAV_DESTINATIONS[navId]; });
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão, expandida) | collapsed | assinantes
  var stateMatch = location.hash.match(/state=([a-z-]+)/);
  var state = stateMatch ? stateMatch[1] : null;

  var storedCollapsed = null;
  try { storedCollapsed = localStorage.getItem(COLLAPSED_KEY) === '1'; } catch (e) {}

  if (state === 'collapsed') {
    setCollapsed(true);
  } else if (state === null && storedCollapsed) {
    setCollapsed(true);
  }

  function openGroup(id) {
    var group = document.getElementById(id);
    if (!group) return;
    group.classList.add('is-open');
    var toggle = document.querySelector('[data-group-toggle="' + id + '"]');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }

  if (state === 'assinantes') openGroup('group-assinantes');
})();
