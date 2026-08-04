(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Toast de sucesso (mesma composição já usada em Categorias/
  // Notas fiscais: Feedback reaproveitado como Toast). ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success caixa-toast';
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

  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novolancamento.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novolancamento.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'O lançamento já está disponível no Caixa.');
  }

  // ---------- Rótulos ----------
  var TIPO_BADGE = {
    entrada: { status: 'success', label: 'Entrada' },
    saida: { status: 'error', label: 'Saída' }
  };

  function formatMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDataPt(iso) {
    var parts = (iso || '').split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : (iso || '—');
  }

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  function categoriaDescricao(codigo) {
    if (!codigo) return '—';
    var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(codigo);
    return categoria ? categoria.descricao : '—';
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloCaixa) — única fonte de dados. ----------
  var tbody = document.getElementById('caixa-tbody');

  function buildRowHTML(lancamento) {
    var badge = TIPO_BADGE[lancamento.tipo];
    var categoriaText = categoriaDescricao(lancamento.categoriaCodigo);
    var pessoaText = lancamento.pessoaNome || '—';
    var isEntrada = lancamento.tipo === 'entrada';
    var sinal = isEntrada ? '+' : '-';
    var valorClass = isEntrada ? 'caixa-valor-entrada' : 'caixa-valor-saida';
    var valorText = sinal + formatMoeda(Math.abs(lancamento.valor));
    var searchText = normalize(lancamento.historico + ' ' + pessoaText + ' ' + categoriaText);
    return (
      '<tr class="tr" id="caixa-row-' + lancamento.codigo + '" data-codigo="' + lancamento.codigo + '" data-data="' + lancamento.data + '" data-categoria="' + (lancamento.categoriaCodigo || '') + '" data-tipo="' + lancamento.tipo + '" data-valor="' + lancamento.valor + '" data-search="' + searchText + '">' +
        '<td class="td">' + formatDataPt(lancamento.data) + '</td>' +
        '<td class="td">' + lancamento.historico + '</td>' +
        '<td class="td">' + pessoaText + '</td>' +
        '<td class="td">' + categoriaText + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td"><span class="' + valorClass + '">' + valorText + '</span></td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var rows = window.NiveloCaixa.list().slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }
  renderInitialRows();

  // ---------- Estado (busca + filtros + paginação) ----------
  var emptyState = document.getElementById('caixa-empty-state');
  var emptyGlobal = document.getElementById('caixa-empty-global');
  var searchInput = document.getElementById('caixa-search-input');
  var PAGE_SIZE = 10;

  var state = {
    search: '',
    categoria: '',
    periodStart: null,
    periodEnd: null,
    page: 1
  };

  function rowMatches(row) {
    if (state.categoria && row.dataset.categoria !== state.categoria) return false;
    if (state.periodStart && row.dataset.data < state.periodStart) return false;
    if (state.periodEnd && row.dataset.data > state.periodEnd) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  var paginationEl = document.getElementById('caixa-pagination');
  var paginationInfoEl = document.getElementById('caixa-pagination-info');
  var paginationPagesEl = document.getElementById('caixa-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  var resumoEntradasEl = document.getElementById('caixa-resumo-entradas');
  var resumoSaidasEl = document.getElementById('caixa-resumo-saidas');
  var resumoSaldoEl = document.getElementById('caixa-resumo-saldo');

  function updateResumo(matching) {
    var totalEntradas = 0;
    var totalSaidas = 0;
    matching.forEach(function (row) {
      var valor = Number(row.dataset.valor) || 0;
      if (row.dataset.tipo === 'entrada') totalEntradas += valor;
      else totalSaidas += valor;
    });
    var saldo = totalEntradas - totalSaidas;
    resumoEntradasEl.textContent = formatMoeda(totalEntradas);
    resumoSaidasEl.textContent = formatMoeda(totalSaidas);
    resumoSaldoEl.textContent = (saldo < 0 ? '-' : '') + formatMoeda(Math.abs(saldo));
    resumoSaldoEl.classList.toggle('caixa-valor-saida', saldo < 0);
    resumoSaldoEl.classList.toggle('caixa-valor-entrada', saldo >= 0);
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.forEach(function (row) { row.classList.toggle('is-filtered-out', !rowMatches(row)); });
    updateResumo(rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); }));
    applyPagination();
  }

  function applyPagination() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var matching = rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    var totalRows = rows.length;
    emptyState.hidden = matching.length > 0 || totalRows === 0;
    emptyGlobal.hidden = totalRows > 0;

    var totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;

    matching.forEach(function (row, index) { row.hidden = index < start || index >= end; });
    rows.forEach(function (row) { if (row.classList.contains('is-filtered-out')) row.hidden = true; });

    renderPaginationControls(matching.length, totalPages);
    renderCards();
  }

  function renderPaginationControls(totalCount, totalPages) {
    paginationEl.hidden = totalCount === 0;
    var rangeStart = totalCount === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var rangeEnd = Math.min(state.page * PAGE_SIZE, totalCount);
    paginationInfoEl.textContent = totalCount === 0
      ? 'Nenhum lançamento encontrado.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' lançamentos';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="caixa-pagination-page' + (p === state.page ? ' is-active' : '') +
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

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    state.page = 1;
    applyFilters();
  });

  // ---------- Ordenação das colunas ----------
  var SORTABLE_COLUMNS = {
    data: { cellIndex: 0, type: 'text' },
    historico: { cellIndex: 1, type: 'text' },
    pessoa: { cellIndex: 2, type: 'text' },
    categoria: { cellIndex: 3, type: 'text' },
    tipo: { cellIndex: 4, type: 'text' },
    valor: { cellIndex: 5, type: 'number' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('caixa-header-row');

  function sortRows() {
    if (!sortState.key) return;
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (sortState.key === 'data') {
        va = a.dataset.data; vb = b.dataset.data;
      } else if (sortState.key === 'valor') {
        va = Number(a.dataset.valor) * (a.dataset.tipo === 'saida' ? -1 : 1);
        vb = Number(b.dataset.valor) * (b.dataset.tipo === 'saida' ? -1 : 1);
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
      th.querySelector('[data-sort-icon]').innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
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

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema) ----------
  function initDropdown(root) {
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

  // Categoria: populada em runtime com TODAS as categorias (receita e
  // despesa) — diferente de Nova Nota Fiscal, que filtra só receita, Caixa
  // registra entradas E saídas, então precisa das duas.
  var categoriaMenu = document.getElementById('caixa-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    categoriaMenu.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(document.getElementById('dropdown-categoria'));

  // ---------- Agrupamento de Filtros (FilterPopover) ----------
  var filtrosPopoverEl = document.getElementById('caixa-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('caixa-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('caixa-filtros-trigger');

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
    closePeriodPopover();
    document.removeEventListener('click', outsideFiltrosClickHandler);
  }

  filtrosTriggerBtn.addEventListener('click', function () {
    if (filtrosPopoverEl.hidden) openFiltrosPopover(); else closeFiltrosPopover();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filtrosPopoverEl.hidden) closeFiltrosPopover();
  });

  document.getElementById('caixa-filtros-aplicar').addEventListener('click', function () {
    state.categoria = document.getElementById('dropdown-categoria').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('caixa-filtros-limpar').addEventListener('click', function () {
    categoriaDropdown.reset('', 'Todas as categorias');
    state.categoria = '';
    resetPeriod();
    state.page = 1;
    applyFilters();
  });

  // ---------- Período (intervalo de datas): Popover + calendário aninhado
  // dentro do Agrupamento de Filtros — mesma composição já usada em Notas
  // fiscais/Dashboard (dois cliques pra escolher início/fim). ----------
  (function initPeriodPicker() {
    var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    var trigger = document.getElementById('caixa-period-trigger');
    var valueEl = document.getElementById('caixa-period-value');
    var popover = document.getElementById('caixa-period-popover');
    var startInput = document.getElementById('caixa-period-start-input');
    var endInput = document.getElementById('caixa-period-end-input');
    var calLabel = popover.querySelector('[data-period-label]');
    var calGrid = popover.querySelector('[data-period-grid]');

    var draft = { start: null, end: null, viewYear: 0, viewMonth: 0 };
    var applied = null;

    function pad2(n) { return n < 10 ? '0' + n : String(n); }
    function toInputValue(date) { return date ? date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) : ''; }
    function parseInputValue(value) {
      if (!value) return null;
      var parts = value.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    function formatDatePt(date) { return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear(); }
    function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

    function renderCalendar() {
      calLabel.textContent = capitalize(MONTH_NAMES[draft.viewMonth]) + ' de ' + draft.viewYear;
      var firstWeekday = new Date(draft.viewYear, draft.viewMonth, 1).getDay();
      var daysInMonth = new Date(draft.viewYear, draft.viewMonth + 1, 0).getDate();
      var html = '';
      for (var e = 0; e < firstWeekday; e++) html += '<span class="caixa-period-day-empty"></span>';
      for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(draft.viewYear, draft.viewMonth, day);
        var classes = ['caixa-period-day', 'text-12-regular'];
        if (draft.start && sameDay(date, draft.start)) classes.push('is-start');
        if (draft.end && sameDay(date, draft.end)) classes.push('is-end');
        if (draft.start && draft.end && date > draft.start && date < draft.end) classes.push('is-in-range');
        html += '<button type="button" class="' + classes.join(' ') + '" data-date="' + toInputValue(date) + '">' + day + '</button>';
      }
      calGrid.innerHTML = html;
    }

    function pickDate(date) {
      if (!draft.start || (draft.start && draft.end)) {
        draft.start = date;
        draft.end = null;
      } else if (date < draft.start) {
        draft.end = draft.start;
        draft.start = date;
      } else {
        draft.end = date;
      }
      startInput.value = toInputValue(draft.start);
      endInput.value = toInputValue(draft.end);
      renderCalendar();
    }

    calGrid.addEventListener('click', function (event) {
      var btn = event.target.closest('.caixa-period-day');
      if (!btn) return;
      pickDate(parseInputValue(btn.dataset.date));
    });

    popover.querySelector('[data-period-prev]').addEventListener('click', function () {
      draft.viewMonth--;
      if (draft.viewMonth < 0) { draft.viewMonth = 11; draft.viewYear--; }
      renderCalendar();
    });
    popover.querySelector('[data-period-next]').addEventListener('click', function () {
      draft.viewMonth++;
      if (draft.viewMonth > 11) { draft.viewMonth = 0; draft.viewYear++; }
      renderCalendar();
    });

    startInput.addEventListener('change', function () {
      var date = parseInputValue(startInput.value);
      if (!date) return;
      draft.start = date;
      if (draft.end && draft.end < draft.start) draft.end = null;
      draft.viewYear = date.getFullYear();
      draft.viewMonth = date.getMonth();
      renderCalendar();
    });
    endInput.addEventListener('change', function () {
      var date = parseInputValue(endInput.value);
      if (!date) return;
      if (draft.start && date < draft.start) {
        draft.end = draft.start;
        draft.start = date;
        startInput.value = toInputValue(draft.start);
      } else {
        draft.end = date;
      }
      renderCalendar();
    });

    function positionPeriodPopover() {
      var margin = 16;
      var width = Math.min(300, window.innerWidth - margin * 2);
      var rect = trigger.getBoundingClientRect();
      var left = rect.left;
      if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
      if (left < margin) left = margin;
      popover.style.position = 'fixed';
      popover.style.left = left + 'px';
      popover.style.width = width + 'px';
      popover.style.top = (rect.bottom + 4) + 'px';
    }

    function openPeriodPopover() {
      var base = draft.start || new Date();
      draft.viewYear = base.getFullYear();
      draft.viewMonth = base.getMonth();
      renderCalendar();
      popover.hidden = false;
      positionPeriodPopover();
    }
    function closePeriodPopoverInternal() { popover.hidden = true; }

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      if (popover.hidden) openPeriodPopover(); else closePeriodPopoverInternal();
    });

    document.getElementById('caixa-period-cancel').addEventListener('click', function () {
      draft.start = applied ? applied.start : null;
      draft.end = applied ? applied.end : null;
      startInput.value = toInputValue(draft.start);
      endInput.value = toInputValue(draft.end);
      closePeriodPopoverInternal();
    });

    document.getElementById('caixa-period-apply').addEventListener('click', function () {
      if (draft.start && draft.end) {
        applied = { start: draft.start, end: draft.end };
        valueEl.textContent = formatDatePt(draft.start) + ' até ' + formatDatePt(draft.end);
        valueEl.classList.remove('caixa-period-placeholder');
        state.periodStart = toInputValue(draft.start);
        state.periodEnd = toInputValue(draft.end);
      }
      closePeriodPopoverInternal();
    });

    window.resetPeriodPicker = function () {
      draft = { start: null, end: null, viewYear: 0, viewMonth: 0 };
      applied = null;
      startInput.value = '';
      endInput.value = '';
      valueEl.textContent = 'Todo o período';
      valueEl.classList.add('caixa-period-placeholder');
      state.periodStart = null;
      state.periodEnd = null;
    };
    window.closePeriodPopoverPublic = closePeriodPopoverInternal;
  })();

  function closePeriodPopover() { if (window.closePeriodPopoverPublic) window.closePeriodPopoverPublic(); }
  function resetPeriod() { if (window.resetPeriodPicker) window.resetPeriodPicker(); }

  // ---------- Navegação ----------
  document.getElementById('new-lancamento-btn').addEventListener('click', function () {
    window.location.href = 'novo-lancamento-caixa.html';
  });
  var emptyGlobalBtn = document.getElementById('caixa-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'novo-lancamento-caixa.html';
    });
  }

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('caixa-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card caixa-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="caixa-mobile-card-header">' +
          '<span class="caixa-mobile-card-historico text-subtitle-s">' + cellText(row.children[1]) + '</span>' +
          '<span class="text-body-xs">' + cellText(row.children[0]) + '</span>' +
        '</div>' +
        '<dl class="caixa-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Cliente ou Fornecedor</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Categoria</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Tipo</dt><dd class="text-12-regular">' + row.children[4].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + row.children[5].innerHTML + '</dd></div>' +
        '</dl>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  applyFilters();
})();
