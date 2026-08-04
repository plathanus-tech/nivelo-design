(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // produtos.js/cadastros.js/estoque.js: position:fixed via JS, reparentado
  // pra document.body no primeiro hover pra escapar do filter:brightness()
  // das linhas zebradas). ----------
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
    toast.className = 'alert success catfin-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      '<div class="message">' + message + '</div>' +
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

  var cameFromForm = false;
  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novacategoria.success') || '';
    if (successMessage) {
      cameFromForm = true;
      sessionStorage.removeItem('nivelo.novacategoria.success');
    }
  } catch (e) {}

  var stateMatch = location.hash.match(/state=([a-z]+)/);
  if (cameFromForm) {
    showSuccessToast(successMessage, 'A categoria já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'created') {
    showSuccessToast('Categoria cadastrada com sucesso.', 'A nova categoria já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'edited') {
    showSuccessToast('Categoria editada com sucesso.', 'As alterações já estão disponíveis na listagem.');
  }

  // ---------- Rótulos ----------
  var GRUPO_LABELS = { receita: 'Receita', despesa: 'Despesa' };
  var DRE_CLASSIFICACAO_LABELS = {
    'deducoes': 'Deduções',
    'despesas-operacionais': 'Despesas Operacionais',
    'outras': 'Outras Despesas ou Receitas',
    'tributos': 'Tributos',
    'taxas-tarifas': 'Taxas e Tarifas'
  };
  var COMPETENCIA_LABELS = {
    'sem-competencia': 'Sem competência',
    'mes-vencimento': 'Mês de vencimento',
    'mes-emissao': 'Mês da emissão',
    'mes-anterior-vencimento': 'Mês anterior ao vencimento'
  };
  var SIM_NAO_BADGE = {
    sim: { status: 'success', label: 'Sim' },
    nao: { status: 'info', label: 'Não' }
  };
  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  // ---------- Normalização (busca ignora acento/maiúsculas) — mesma
  // construção via String.fromCharCode já documentada em produtos.js/
  // CLAUDE.md (editar o escape de diacríticos à mão pode gravar os
  // CARACTERES reais no arquivo em vez do texto do escape). ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloCategoriasFinanceiras) — única fonte de dados. ----------
  var tbody = document.getElementById('catfin-tbody');
  var tableCard = document.querySelector('.catfin-table-card');

  // Editar (sempre) + Ativar/Desativar (conforme `categoria.ativo`) — mesmo
  // padrão exato de Talhões em fazenda-detalhe-cadastro.js. Nenhuma ação de
  // Excluir: a categoria nunca é removida de verdade, pra não quebrar o
  // histórico de lançamentos já classificados com ela.
  function buildActionsHTML(categoria) {
    var toggle = categoria.ativo
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

  function buildRowHTML(categoria) {
    var statusBadge = ATIVO_BADGE[categoria.ativo ? 'ativo' : 'inativo'];
    var dreBadge = SIM_NAO_BADGE[categoria.consideraDre ? 'sim' : 'nao'];
    var lcdprBadge = SIM_NAO_BADGE[categoria.consideraLcdpr ? 'sim' : 'nao'];
    var classificacaoDreText = categoria.consideraDre ? (DRE_CLASSIFICACAO_LABELS[categoria.classificacaoDre] || '—') : '—';
    var competenciaText = COMPETENCIA_LABELS[categoria.competenciaPadrao] || '—';
    var searchText = normalize(categoria.descricao + ' ' + categoria.codigo);
    return (
      '<tr class="tr" id="catfin-row-' + categoria.codigo + '" data-codigo="' + categoria.codigo + '" data-grupo="' + categoria.grupo + '" data-status="' + (categoria.ativo ? 'ativo' : 'inativo') + '" data-dre="' + (categoria.consideraDre ? 'sim' : 'nao') + '" data-lcdpr="' + (categoria.consideraLcdpr ? 'sim' : 'nao') + '" data-search="' + searchText + '">' +
        '<td class="td">' + categoria.codigo + '</td>' +
        '<td class="td">' + categoria.descricao + '</td>' +
        '<td class="td">' + (GRUPO_LABELS[categoria.grupo] || categoria.grupo) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td"><span class="badge" data-status="' + dreBadge.status + '"><span class="badgeDot"></span>' + dreBadge.label + '</span></td>' +
        '<td class="td">' + classificacaoDreText + '</td>' +
        '<td class="td"><span class="badge" data-status="' + lcdprBadge.status + '"><span class="badgeDot"></span>' + lcdprBadge.label + '</span></td>' +
        '<td class="td">' + competenciaText + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(categoria) + '</td>' +
      '</tr>'
    );
  }

  // ---------- Estado de carregamento (breve, simula uma busca real ao
  // catálogo) — mesmo espírito do `flashLoading()` já usado no Dashboard,
  // aqui só na carga inicial da tela. ----------
  var loadingState = document.getElementById('catfin-loading-state');

  function renderInitialRows() {
    tbody.innerHTML = window.NiveloCategoriasFinanceiras.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado de erro (demonstração via #state=error) ----------
  var isErrorDemo = !!(stateMatch && stateMatch[1] === 'error');

  var emptyState = document.getElementById('catfin-empty-state');
  var searchInput = document.getElementById('catfin-search-input');

  var state = {
    grupo: '',
    status: '',
    dre: '',
    lcdpr: '',
    search: ''
  };

  function rowMatches(row) {
    if (state.grupo && row.dataset.grupo !== state.grupo) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.dre && row.dataset.dre !== state.dre) return false;
    if (state.lcdpr && row.dataset.lcdpr !== state.lcdpr) return false;
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

  // ---------- Ordenação das colunas ----------
  var STATUS_RANK = { ativo: 0, inativo: 1 };
  var SORTABLE_COLUMNS = {
    codigo: { cellIndex: 0, type: 'text' },
    descricao: { cellIndex: 1, type: 'text' },
    grupo: { cellIndex: 2, type: 'text' },
    status: { cellIndex: 3, type: 'status' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('catfin-header-row');

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

  // ---------- Dropdown genérico (mesmo padrão de Produtos/Cadastro/Estoque) ----------
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

  var grupoDropdown = initDropdown(document.getElementById('dropdown-grupo'));
  var statusFilterDropdown = initDropdown(document.getElementById('dropdown-status'));
  var dreDropdown = initDropdown(document.getElementById('dropdown-dre'));
  var lcdprDropdown = initDropdown(document.getElementById('dropdown-lcdpr'));

  // ---------- Agrupamento de Filtros (FilterPopover) — mesma composição/
  // comportamento já usados em Produtos/Estoque Comprometido. ----------
  var filtrosPopoverEl = document.getElementById('catfin-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('catfin-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('catfin-filtros-trigger');

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

  document.getElementById('catfin-filtros-aplicar').addEventListener('click', function () {
    state.grupo = document.getElementById('dropdown-grupo').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.dre = document.getElementById('dropdown-dre').dataset.value || '';
    state.lcdpr = document.getElementById('dropdown-lcdpr').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('catfin-filtros-limpar').addEventListener('click', function () {
    grupoDropdown.reset('', 'Todos os grupos');
    statusFilterDropdown.reset('', 'Todos os status');
    dreDropdown.reset('', 'Todas');
    lcdprDropdown.reset('', 'Todas');
    state.grupo = '';
    state.status = '';
    state.dre = '';
    state.lcdpr = '';
    applyFilters();
  });

  // ---------- Ativar/Desativar: ação real (não flash-disable) — altera
  // `categoria.ativo` em memória e re-renderiza, sem excluir o registro. Só
  // roda depois de confirmada no modal (mesmo padrão exato de Talhões em
  // fazenda-detalhe-cadastro.js: Desativar é destrutivo, Ativar é primário). ----------
  function updateRowInPlace(categoria) {
    var row = document.getElementById('catfin-row-' + categoria.codigo);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(categoria);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
  }

  function toggleAtivo(codigo) {
    var categoria = window.NiveloCategoriasFinanceiras.toggleAtivo(codigo);
    if (!categoria) return;
    updateRowInPlace(categoria);
    applyFilters();
    showSuccessToast(
      categoria.ativo ? 'Categoria ativada com sucesso.' : 'Categoria desativada com sucesso.',
      '"' + categoria.descricao + '" agora está ' + (categoria.ativo ? 'ativa' : 'inativa') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleCodigo = null;

  function openToggleAtivoDialog(codigo) {
    var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(codigo);
    if (!categoria) return;
    pendingToggleCodigo = codigo;
    if (categoria.ativo) {
      toggleTitle.textContent = 'Desativar categoria';
      toggleMessage.textContent = 'Tem certeza que deseja desativar a categoria "' + categoria.descricao + '"?';
      toggleConfirmBtn.className = 'btn destructive';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar categoria';
      toggleMessage.textContent = 'Tem certeza que deseja ativar a categoria "' + categoria.descricao + '"?';
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
    window.location.href = 'nova-categoria-financeira.html?codigo=' + encodeURIComponent(row.dataset.codigo);
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

  document.getElementById('new-categoria-btn').addEventListener('click', function () {
    window.location.href = 'nova-categoria-financeira.html';
  });
  var emptyGlobalBtn = document.getElementById('catfin-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'nova-categoria-financeira.html';
    });
  }

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('catfin-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var actionsHTML = row.children[8].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card catfin-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="catfin-mobile-card-header">' +
          '<div class="catfin-mobile-card-name text-subtitle-s">' + cellText(row.children[1]) + '</div>' +
          '<span class="catfin-mobile-card-codigo text-body-xs">' + cellText(row.children[0]) + '</span>' +
        '</div>' +
        '<dl class="catfin-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Grupo</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[3].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Considera no DRE</dt><dd class="text-12-regular">' + row.children[4].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Classificação no DRE</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Considera no LCDPR</dt><dd class="text-12-regular">' + row.children[6].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Competência padrão</dt><dd class="text-12-regular">' + cellText(row.children[7]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions catfin-mobile-card-actions">' + actionsHTML + '</div>' +
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

  // ---------- Boot: estado de erro > carregamento breve > conteúdo real ----------
  var errorStateEl = document.getElementById('catfin-error-state');
  var isEmptyDemo = !!(stateMatch && stateMatch[1] === 'empty');

  if (isErrorDemo) {
    tableCard.classList.add('is-loading-error');
  } else {
    tableCard.classList.add('is-loading');
    window.setTimeout(function () {
      tableCard.classList.remove('is-loading');
      if (isEmptyDemo) {
        tableCard.classList.add('is-demo-empty');
      } else {
        renderInitialRows();
        applyFilters();
      }
    }, 350);
  }

  document.getElementById('catfin-retry-btn').addEventListener('click', function () {
    window.location.href = 'categorias-financeiras.html';
  });
})();
