(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // cadastros.js/estoque.js: position:fixed via JS, reparentado pra
  // document.body no primeiro hover pra escapar do filter:brightness() das
  // linhas zebradas). ----------
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

  // ---------- Toast de sucesso ("Produto salvo com sucesso") ----------
  // Mesmo padrão de Cadastro/Estoque: novo-produto.js grava um flag em
  // sessionStorage antes de voltar pra cá; também aceita `#state=created`
  // via hash pra poder ser demonstrado direto pelo prototype-nav.
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success produtos-toast';
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

  var cameFromNovoProduto = false;
  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novoproduto.success') || '';
    if (successMessage) {
      cameFromNovoProduto = true;
      sessionStorage.removeItem('nivelo.novoproduto.success');
    }
  } catch (e) {}

  var stateMatch = location.hash.match(/state=([a-z]+)/);
  if (cameFromNovoProduto) {
    showSuccessToast(successMessage, 'O produto já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'created') {
    showSuccessToast('Produto cadastrado com sucesso.', 'O novo produto já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'edited') {
    showSuccessToast('Produto editado com sucesso.', 'As alterações já estão disponíveis na listagem.');
  }

  // ---------- Estado vazio "nenhum produto" (demonstração via #state=empty) ----------
  var isEmptyDemo = !!(stateMatch && stateMatch[1] === 'empty');
  if (isEmptyDemo) {
    document.querySelector('.produtos-table-card').classList.add('is-demo-empty');
  }
  var emptyGlobalBtn = document.getElementById('produtos-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'novo-produto.html';
    });
  }

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  // Regex de diacríticos construída via String.fromCharCode (não um literal
  // `̀-ͯ` digitado direto) — gotcha já documentado em CLAUDE.md:
  // editar esse escape à mão às vezes grava os CARACTERES reais no arquivo
  // em vez do texto do escape.
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(DIACRITICS_RE, '')
      .replace(/[.\-\/]/g, '');
  }

  var STATUS_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    cancelado: { status: 'error', label: 'Cancelado' },
    bloqueado: { status: 'warning', label: 'Bloqueado' }
  };

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloProdutos) — única fonte de dados, nunca uma cópia local. ----------
  var tbody = document.getElementById('produtos-tbody');

  function buildRowHTML(product) {
    var badge = STATUS_BADGE[product.status] || STATUS_BADGE.ativo;
    var searchText = normalize(product.nome + ' ' + product.sku + ' ' + (product.codigoReferencia || ''));
    return (
      '<tr class="tr" id="prod-row-' + product.sku + '" data-sku="' + product.sku + '" data-status="' + product.status + '" data-categoria="' + (product.categoria || '') + '" data-atualizado="' + (product.atualizadoEm || '') + '" data-search="' + searchText + '">' +
        '<td class="td">' + product.nome + '</td>' +
        '<td class="td">' + (product.categoria || '') + '</td>' +
        '<td class="td">' + product.sku + '</td>' +
        '<td class="td">' + product.estoqueAtual + ' ' + (product.unidadeMedida || '') + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td tdActions">' +
          '<div class="cellActions">' +
            '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
          '</div>' +
        '</td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    tbody.innerHTML = window.NiveloProdutos.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }
  renderInitialRows();

  var emptyState = document.getElementById('produtos-empty-state');
  var searchInput = document.getElementById('produtos-search-input');
  var paginationEl = document.getElementById('produtos-pagination');
  var paginationInfoEl = document.getElementById('produtos-pagination-info');
  var paginationPagesEl = document.getElementById('produtos-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  var PAGE_SIZE = 10;

  var state = {
    status: '',
    categoria: '',
    atualizadoDesde: null,
    search: '',
    sortKey: null,
    sortDir: 'asc',
    page: 1
  };

  // ---------- Filtros ----------
  function rowMatches(row) {
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.categoria && row.dataset.categoria !== state.categoria) return false;

    if (state.atualizadoDesde) {
      var atualizado = row.dataset.atualizado;
      if (!atualizado || atualizado < state.atualizadoDesde) return false;
    }

    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }

    return true;
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.forEach(function (row) {
      row.classList.toggle('is-filtered-out', !rowMatches(row));
    });
    sortRows();
    applyPagination();
  }

  // ---------- Paginação (10 registros/página) ----------
  function applyPagination() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var matching = rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    emptyState.hidden = matching.length > 0;

    var totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;

    matching.forEach(function (row, index) {
      row.hidden = index < start || index >= end;
    });
    rows.forEach(function (row) {
      if (row.classList.contains('is-filtered-out')) row.hidden = true;
    });

    renderPaginationControls(matching.length, totalPages);
    renderCards();
  }

  function renderPaginationControls(totalCount, totalPages) {
    paginationEl.hidden = false;
    var rangeStart = totalCount === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var rangeEnd = Math.min(state.page * PAGE_SIZE, totalCount);
    paginationInfoEl.textContent = totalCount === 0
      ? 'Nenhum produto encontrado.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' produtos';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="prod-pagination-page' + (p === state.page ? ' is-active' : '') +
        '" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
    }
    paginationPagesEl.innerHTML = pagesHTML;

    paginationPrevBtn.disabled = state.page <= 1;
    paginationNextBtn.disabled = state.page >= totalPages;
  }

  paginationPrevBtn.addEventListener('click', function () {
    if (state.page <= 1) return;
    state.page -= 1;
    applyPagination();
  });
  paginationNextBtn.addEventListener('click', function () {
    state.page += 1;
    applyPagination();
  });
  paginationPagesEl.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-page]');
    if (!btn) return;
    state.page = Number(btn.dataset.page);
    applyPagination();
  });

  // ---------- Ordenação das colunas ----------
  var STATUS_RANK = { ativo: 0, bloqueado: 1, cancelado: 2 };
  var SORTABLE_COLUMNS = {
    nome: { cellIndex: 0, type: 'text' },
    categoria: { cellIndex: 1, type: 'text' },
    sku: { cellIndex: 2, type: 'text' },
    estoque: { cellIndex: 3, type: 'number' },
    status: { cellIndex: 4, type: 'status' }
  };

  var headerRow = document.getElementById('produtos-header-row');

  function getSortValue(row, config) {
    if (config.type === 'status') {
      var rank = STATUS_RANK[row.dataset.status];
      return rank == null ? 99 : rank;
    }
    var cell = row.children[config.cellIndex];
    if (config.type === 'number') {
      return parseFloat(cell.textContent) || 0;
    }
    return normalize(cell.textContent);
  }

  function sortRows() {
    if (!state.sortKey) return;
    var config = SORTABLE_COLUMNS[state.sortKey];
    var dir = state.sortDir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va = getSortValue(a, config);
      var vb = getSortValue(b, config);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  function updateSortIcons() {
    Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (th) {
      var key = th.dataset.sortKey;
      var active = state.sortKey === key;
      th.setAttribute('aria-sort', active ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
      var iconName = active ? (state.sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
      var iconEl = th.querySelector('[data-sort-icon]');
      iconEl.innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
    });
    if (window.lucide) lucide.createIcons();
  }

  headerRow.addEventListener('click', function (event) {
    var th = event.target.closest('.th.sortable');
    if (!th) return;
    var key = th.dataset.sortKey;
    if (state.sortKey === key) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key;
      state.sortDir = 'asc';
    }
    updateSortIcons();
    applyFilters();
  });

  // ---------- Pesquisa ----------
  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    state.page = 1;
    applyFilters();
  });

  // ---------- Dropdown genérico (Status) — mesmo padrão de Cadastro ----------
  function initDropdown(root, onChange) {
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
      var existingOptions = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existingOptions.forEach(function (o) { o.classList.remove('selected'); });
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

  // Status/Categoria só aplicam ao clicar "Aplicar" no popover (ver abaixo) —
  // por isso os `initDropdown` aqui não chamam `applyFilters()` no `onChange`,
  // diferente do padrão de outros filtros deste sistema (mesmo comportamento
  // já usado no popover "Filtros" de Estoque Comprometido).
  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  // ---------- Categoria: opções vêm do catálogo central (window.NiveloCategorias,
  // o mesmo usado em "Novo produto") — nunca uma lista fixa própria desta tela. ----------
  var categoriaMenuEl = document.getElementById('dropdown-categoria-menu');
  window.NiveloCategorias.list().forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria;
    optionEl.textContent = categoria;
    categoriaMenuEl.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(document.getElementById('dropdown-categoria'));

  // ---------- Agrupamento de Filtros (FilterPopover): Status + Categoria +
  // Atualizado a partir de num popover só, mesma composição/comportamento já
  // usados em Estoque Comprometido (`position:fixed` via JS, fecha em clique
  // fora/Esc, só aplica no clique em "Aplicar"). ----------
  var filtrosPopoverEl = document.getElementById('produtos-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('produtos-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('produtos-filtros-trigger');

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

  document.getElementById('produtos-filtros-aplicar').addEventListener('click', function () {
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.categoria = document.getElementById('dropdown-categoria').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('produtos-filtros-limpar').addEventListener('click', function () {
    statusDropdown.reset('', 'Todos os status');
    categoriaDropdown.reset('', 'Todas as categorias');
    state.status = '';
    state.categoria = '';
    state.page = 1;
    applyFilters();
  });

  // ---------- "Atualizado a partir de": padrão oficial de calendário do
  // sistema (dia único), ver app/shared/date-picker.js. ----------
  window.NiveloDatePicker.initDay({
    rootId: 'atualizado-filter',
    triggerId: 'atualizado-trigger',
    valueId: 'atualizado-value',
    clearId: 'atualizado-clear',
    popoverId: 'atualizado-popover',
    placeholder: 'Atualizado a partir de',
    formatValue: function (date) {
      var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
      return 'Atualizado a partir de ' + pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear();
    },
    onChange: function (iso) {
      state.atualizadoDesde = iso;
      state.page = 1;
      applyFilters();
    }
  });

  // ---------- Ações da tabela (só "Editar" — ver decisão confirmada com o
  // usuário: sem "Excluir", o Status (Ativo/Cancelado/Bloqueado) já cobre a
  // desativação de um produto). ----------
  function openEditScreen(row) {
    window.location.href = 'novo-produto.html?sku=' + encodeURIComponent(row.dataset.sku);
  }

  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'editar') {
      openEditScreen(row);
    }
  }

  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  document.getElementById('new-produto-btn').addEventListener('click', function () {
    window.location.href = 'novo-produto.html';
  });

  // ---------- Cards (Mobile) ----------
  // Gerados a partir das linhas REAIS e já filtradas/ordenadas/paginadas da
  // tabela (nunca uma segunda cópia dos dados) — mesma técnica de
  // Cadastro/Estoque.
  var cardsContainer = document.getElementById('produtos-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var badge = STATUS_BADGE[row.dataset.status] || STATUS_BADGE.ativo;
    var actionsHTML = row.children[5].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card produtos-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="produtos-mobile-card-header">' +
          '<div class="produtos-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
          '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
        '</div>' +
        '<dl class="produtos-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Categoria</dt><dd class="text-12-regular">' + (cellText(row.children[1]) || '—') + '</dd></div>' +
          '<div><dt class="text-10-regular">SKU</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Estoque</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions produtos-mobile-card-actions">' + actionsHTML + '</div>' +
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

  applyFilters();
})();
