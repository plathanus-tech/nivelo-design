(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var COLLAPSED_KEY = 'nivelo.shell.sidebarCollapsed';

  var sidebar = document.getElementById('app-sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  var hamburgerBtn = document.getElementById('hamburger-btn');
  var sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  // Exclui os botões de expandir/recolher grupo (Financeiro/Vendas/
  // Configuração/Fiscal) — eles também têm a classe `.app-nav-item`/
  // `.app-nav-subitem` (pro mesmo visual), mas clicar neles só abre/fecha
  // o submenu, nunca deve roubar o estado "ativo" de qual página está
  // selecionada.
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.app-nav-item, .app-nav-subitem, .app-nav-subsubitem'))
    .filter(function (item) { return !item.hasAttribute('data-group-toggle'); });

  // ---------- Tooltip (Sidebar retraída) ----------
  // `position:fixed` calculado do rect do alvo, em vez de `::after` em
  // CSS puro: o `::after` nascia dentro de `.app-sidebar-body`, que tem
  // `overflow-x:hidden` (necessário pra evitar vazamento de conteúdo
  // durante a transição de largura da Sidebar) — e por isso CORTAVA o
  // próprio tooltip, que precisa "vazar" pra direita da Sidebar.
  // `position:fixed` escapa desse corte, mesma solução do Popover.
  var tooltipEl = document.getElementById('app-tooltip');

  function showTooltip(target) {
    var text = target.getAttribute('data-tooltip');
    // Na Sidebar expandida o rótulo já está visível — tooltip seria redundante.
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

  // ---------- Grupos de navegação (Financeiro, Vendas, Assistente IA,
  // Configuração) e o subgrupo Fiscal — ver seção de accordion mais abaixo,
  // que precisa desses helpers antes de setCollapsed. ----------
  // Nota (2026-08-03): Caixa/Contas a pagar dentro de Financeiro NÃO viram
  // subgrupos aqui — essa nested foi tentada numa rodada anterior e revertida
  // por instrução explícita do usuário. O agrupamento em épicos (Caixa +
  // Incluir lançamento; Contas a pagar + Nova conta) vale só pro navegador de
  // protótipo (`prototype-nav/nav.config.js`), não pro menu lateral real do
  // produto — aqui cada um continua um único item leaf.
  var TOP_LEVEL_GROUP_IDS = ['group-cadastro', 'group-financeiro', 'group-vendas', 'group-assistente-ia', 'group-configuracao'];
  // Mapa subgrupo → grupo de topo dono dele. Generaliza o que antes era só
  // hardcoded pra Fiscal/Configuração — qualquer subgrupo futuro só precisa
  // entrar aqui.
  var SUBGROUP_PARENTS = { 'group-fiscal': 'group-configuracao' };
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

  // Mais restrito que closeAllTopLevelGroups: só fecha o que estiver como
  // Popover (Sidebar retraída) — nunca um grupo aberto inline na Sidebar
  // expandida, que é estado de navegação normal, não uma sobreposição
  // temporária pra fechar sozinha ao clicar num subitem.
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
    // Mudar o estado de retração sempre fecha grupos/popovers abertos —
    // evita estado "aberto" preso (com posição de popover obsoleta) ao
    // trocar de contexto expandido ⇄ retraído.
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

  // ---------- Grupos: accordion (só um grupo de topo aberto por vez) +
  // Popover na Sidebar retraída (Financeiro/Vendas/Assistente IA/
  // Configuração) ----------
  // Subgrupos de 2º nível (Fiscal dentro de Configuração; Caixa/Contas a
  // pagar dentro de Financeiro) não entram no accordion de topo — cada um só
  // abre/fecha ele mesmo, dentro do grupo de topo que já está aberto.
  Array.prototype.slice.call(document.querySelectorAll('[data-group-toggle]')).forEach(function (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var groupId = toggleBtn.dataset.groupToggle;
      var group = document.getElementById(groupId);
      var isTopLevel = TOP_LEVEL_GROUP_IDS.indexOf(groupId) !== -1;
      var willOpen = !group.classList.contains('is-open');

      if (!isTopLevel) {
        // Subgrupo: expande/recolhe inline, tanto na sidebar expandida
        // quanto dentro do Popover do grupo de topo dono dele (mesmo
        // mecanismo, CSS trata a apresentação em cada contexto).
        group.classList.toggle('is-open', willOpen);
        toggleBtn.setAttribute('aria-expanded', String(willOpen));
        return;
      }

      if (!willOpen) { closeGroup(groupId); return; }

      // Abrir um grupo de topo fecha qualquer outro que estivesse aberto
      // (accordion) — inclusive os subgrupos que não pertencem a ele, que só
      // fazem sentido junto do próprio pai.
      TOP_LEVEL_GROUP_IDS.forEach(function (id) { if (id !== groupId) closeGroup(id); });
      SUBGROUP_IDS.forEach(function (subId) { if (SUBGROUP_PARENTS[subId] !== groupId) closeGroup(subId); });

      if (sidebar.classList.contains('is-collapsed')) {
        // Sidebar retraída: não expande permanentemente — mostra os
        // subitens num Popover flutuando ao lado do ícone clicado.
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

  // Popover: fecha ao clicar fora dele (nunca no hover, só no clique).
  document.addEventListener('click', function (event) {
    TOP_LEVEL_GROUP_IDS.forEach(function (id) {
      var group = document.getElementById(id);
      if (group.classList.contains('is-popover-open') && !group.contains(event.target)) {
        closeGroup(id);
      }
    });
  });

  // ---------- Item ativo (demonstração visual, sem navegação real) ----------
  // "Sair", "Dashboard", "Caderno de campo", "Cadastro > Cliente e
  // fornecedor", "Cadastro > Produtos", "Estoque", "Configuração > Cadastro
  // de fazenda", "Configuração > Categorias de receitas e despesas" e
  // "Vendas > Notas fiscais" navegam de verdade (telas reais já existem, ver
  // NAV_DESTINATIONS abaixo); os demais itens só alternam o destaque
  // visual, sem destino ainda (nenhuma tela construída pra eles).
  var NAV_DESTINATIONS = { dashboard: 'dashboard.html', 'caderno-campo': 'caderno-de-campo.html', 'cadastro-pessoas': 'cadastros.html', 'cadastro-produtos': 'produtos.html', estoque: 'estoque.html', 'config-fazenda': 'fazendas.html', 'config-conta-bancaria': 'contas-bancarias.html', 'config-conta-financeira': 'contas-financeiras.html', 'config-categorias': 'categorias-financeiras.html', 'fiscal-natureza': 'naturezas-operacao.html', 'fiscal-certificado': 'certificado-digital.html', 'fiscal-nota-entrada': 'fiscal.html','vendas-nota-fiscal': 'notas-fiscais.html', 'financeiro-caixa': 'caixa.html', 'financeiro-pagar': 'contas-a-pagar.html', 'financeiro-receber': 'contas-a-receber.html', 'financeiro-relatorios': 'relatorios.html', 'canal-ideias': 'canal-ideias.html', 'assistente-numeros': 'meus-numeros-whatsapp.html', 'assistente-nova-conversa': 'nova-conversa.html', 'fiscal-manifesto': 'manifestos.html', videos: 'videos.html', 'config-minha-conta': 'minha-conta.html' };

  navItems.forEach(function (item) {
    if (item.dataset.nav === 'sair' || NAV_DESTINATIONS[item.dataset.nav]) return;
    item.addEventListener('click', function () {
      navItems.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');
      // Selecionar uma opção fecha o Popover, se houver um aberto.
      closeAllPopovers();
    });
  });

  // "Caderno de campo" agora é um item de topo real da Sidebar (antes vivia
  // só no Header) — navega de verdade via NAV_DESTINATIONS abaixo, junto com
  // os demais itens com tela real.
  document.querySelector('[data-nav="sair"]').addEventListener('click', function () {
    window.location.href = 'login.html';
  });

  // Cada item com tela real navega pra ela de verdade — antes só "Cadastro"
  // tinha isso, então o item "Dashboard" nunca levava de volta ao Dashboard
  // quando clicado a partir de outra tela (ex.: Cadastro), quebrando o fluxo
  // de ida e volta entre as duas telas existentes.
  Object.keys(NAV_DESTINATIONS).forEach(function (navId) {
    var el = document.querySelector('[data-nav="' + navId + '"]');
    if (el) el.addEventListener('click', function () { window.location.href = NAV_DESTINATIONS[navId]; });
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão, expandida) | collapsed | financeiro | vendas |
  // configuracao | configuracao-fiscal | assistente-ia
  // (Nota: com o accordion, só um grupo de topo fica aberto por vez — não
  // existe mais um estado que abra Financeiro+Vendas juntos. Sistema é
  // light-only, não há mais estados de tema.)
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

  if (state === 'financeiro') openGroup('group-financeiro');
  if (state === 'vendas') openGroup('group-vendas');
  if (state === 'configuracao' || state === 'configuracao-fiscal') openGroup('group-configuracao');
  if (state === 'configuracao-fiscal') openGroup('group-fiscal');
  if (state === 'assistente-ia') openGroup('group-assistente-ia');
})();
