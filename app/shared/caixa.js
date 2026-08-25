(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão (mesma técnica já usada em Novo Cadastro/
  // Estoque/Produtos: `position:fixed` calculado no hover/focus, nunca
  // `position:absolute` puro) — usado no botão só-ícone de Transferência
  // entre contas. ----------
  function initFixedTooltip(trigger, placement) {
    var tip = trigger.querySelector('.tip');
    if (!tip) return;

    function show() {
      var rect = trigger.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      tip.style.position = 'fixed';
      tip.style.left = centerX + 'px';
      tip.style.transform = 'translateX(-50%)';
      if (placement === 'bottom') {
        tip.style.top = (rect.bottom + 8) + 'px';
        tip.style.bottom = 'auto';
      } else {
        tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
        tip.style.top = 'auto';
      }
      tip.style.opacity = '1';

      var margin = 8;
      var tipRect = tip.getBoundingClientRect();
      if (tipRect.left < margin) {
        tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
      } else if (tipRect.right > window.innerWidth - margin) {
        tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
      }
    }
    function hide() { tip.style.opacity = '0'; }

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
  }
  initFixedTooltip(document.getElementById('transferencia-btn'), 'top');

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

  var transferenciaSuccessMessage = '';
  try {
    transferenciaSuccessMessage = sessionStorage.getItem('nivelo.transferenciacontas.success') || '';
    if (transferenciaSuccessMessage) sessionStorage.removeItem('nivelo.transferenciacontas.success');
  } catch (e) {}
  if (transferenciaSuccessMessage) {
    showSuccessToast(transferenciaSuccessMessage, 'Os lançamentos já estão disponíveis no Caixa.');
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
    var bancoText = lancamento.banco || '—';
    var isEntrada = lancamento.tipo === 'entrada';
    var sinal = isEntrada ? '+' : '-';
    var valorClass = isEntrada ? 'caixa-valor-entrada' : 'caixa-valor-saida';
    var valorText = sinal + formatMoeda(Math.abs(lancamento.valor));
    var searchText = normalize(lancamento.historico + ' ' + pessoaText + ' ' + categoriaText);
    return (
      '<tr class="tr" id="caixa-row-' + lancamento.codigo + '" data-codigo="' + lancamento.codigo + '" data-data="' + lancamento.data + '" data-categoria="' + (lancamento.categoriaCodigo || '') + '" data-banco="' + (lancamento.banco || '') + '" data-tipo="' + lancamento.tipo + '" data-valor="' + lancamento.valor + '" data-search="' + searchText + '">' +
        '<td class="td">' + formatDataPt(lancamento.data) + '</td>' +
        '<td class="td">' + lancamento.historico + '</td>' +
        '<td class="td">' + pessoaText + '</td>' +
        '<td class="td">' + categoriaText + '</td>' +
        '<td class="td">' + bancoText + '</td>' +
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
    banco: '',
    periodStart: null,
    periodEnd: null,
    page: 1
  };

  function rowMatches(row) {
    if (state.categoria && row.dataset.categoria !== state.categoria) return false;
    if (state.banco && row.dataset.banco !== state.banco) return false;
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
  var bancoTagEl = document.getElementById('caixa-summary-banco-tag');
  var bancoTagTextEl = document.getElementById('caixa-summary-banco-tag-text');

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

    bancoTagEl.hidden = !state.banco;
    if (state.banco) bancoTagTextEl.textContent = state.banco;
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
    banco: { cellIndex: 4, type: 'text' },
    tipo: { cellIndex: 5, type: 'text' },
    valor: { cellIndex: 6, type: 'number' }
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

  // Banco: populado com os valores REALMENTE presentes nos lançamentos
  // (nunca o catálogo de Contas Bancárias) — o texto livre gravado em cada
  // lançamento (`banco`) nem sempre bate com a descrição cadastrada ali,
  // então a única forma de garantir que toda opção do filtro filtra de
  // verdade é derivar as opções do próprio dataset.
  var bancoMenu = document.getElementById('caixa-banco-menu');
  var bancosUnicos = [];
  window.NiveloCaixa.list().forEach(function (l) {
    if (l.banco && bancosUnicos.indexOf(l.banco) === -1) bancosUnicos.push(l.banco);
  });
  bancosUnicos.sort();
  bancosUnicos.forEach(function (banco) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = banco;
    optionEl.textContent = banco;
    bancoMenu.appendChild(optionEl);
  });
  var bancoDropdown = initDropdown(document.getElementById('dropdown-banco'));

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
    state.banco = document.getElementById('dropdown-banco').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('caixa-filtros-limpar').addEventListener('click', function () {
    categoriaDropdown.reset('', 'Todas as categorias');
    bancoDropdown.reset('', 'Todos os bancos');
    state.categoria = '';
    state.banco = '';
    resetPeriod();
    state.page = 1;
    applyFilters();
  });

  // ---------- Período: seletor de modo (Sem filtro/Últimos 30 dias/Dia/
  // Mês/Intervalo), aninhado dentro do Agrupamento de Filtros — ver
  // period-filter.js (mesmo componente usado em toda tabela do sistema). ----------
  var periodFilter = window.NiveloPeriodFilter.init({
    mount: document.getElementById('caixa-period-mount'),
    onApply: function (result) {
      state.periodStart = result.mode === 'none' ? null : result.start;
      state.periodEnd = result.mode === 'none' ? null : result.end;
    }
  });

  function closePeriodPopover() {}
  function resetPeriod() {
    periodFilter.reset();
    state.periodStart = null;
    state.periodEnd = null;
  }

  // ---------- Navegação ----------
  document.getElementById('new-lancamento-btn').addEventListener('click', function () {
    window.location.href = 'novo-lancamento-caixa.html';
  });
  document.getElementById('transferencia-btn').addEventListener('click', function () {
    window.location.href = 'transferencia-entre-contas.html';
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
          '<div><dt class="text-10-regular">Banco</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Tipo</dt><dd class="text-12-regular">' + row.children[5].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + row.children[6].innerHTML + '</dd></div>' +
        '</dl>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Exportar Excel (mesmo padrão exato de Estoque: CSV com BOM,
  // respeita busca/filtros aplicados, não a paginação nem o dataset inteiro). ----------
  function exportToExcel() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    var headers = ['Data', 'Histórico', 'Cliente ou Fornecedor', 'Categoria', 'Banco', 'Tipo', 'Valor'];
    var lines = [headers.join(';')];
    rows.forEach(function (row) {
      var values = [0, 1, 2, 3, 4].map(function (i) { return cellText(row.children[i]); });
      values.push(cellText(row.children[5]));
      values.push(cellText(row.children[6]));
      lines.push(values.join(';'));
    });

    var BOM = String.fromCharCode(0xFEFF);
    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'caixa.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  document.getElementById('caixa-export-btn').addEventListener('click', exportToExcel);

  applyFilters();
})();
