(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação da tabela — mesma técnica
  // exata já usada em contas-a-pagar.js (V1)/cadastros.js/estoque.js. ----------
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

  // ---------- Toast de sucesso (mesma composição já usada em Contas a
  // Pagar V1/Caixa/Categorias). ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ctp-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novacontapagarv2.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novacontapagarv2.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A conta já está disponível na listagem.');
  }

  // ---------- Rótulos — só 3 status na V2 (pedido explícito). ----------
  var STATUS_BADGE = {
    'em-aberto': { status: 'info', label: 'Em aberto' },
    vencida: { status: 'error', label: 'Vencida' },
    paga: { status: 'success', label: 'Paga' }
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

  // Situação de pagamento (integral/parcial/não pago) — dimensão derivada de
  // saldo×pago, mesma distinção já feita na V1.
  function situacaoPagamento(titulo, saldo) {
    if (saldo <= 0) return 'integral';
    if (titulo.pago > 0) return 'parcial';
    return 'nao-pago';
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloContasPagarV2) — única fonte de dados. ----------
  var tbody = document.getElementById('ctp-tbody');

  function buildRowHTML(titulo) {
    var badge = STATUS_BADGE[titulo.status];
    var saldo = window.NiveloContasPagarV2.saldoPrincipal(titulo);
    var situacao = situacaoPagamento(titulo, saldo);
    var descricaoText = titulo.descricao;
    if (titulo.parcelaTotal) {
      descricaoText += '<span class="ctp-cell-parcela text-body-xs">Parcela ' + titulo.parcelaAtual + '/' + titulo.parcelaTotal + '</span>';
    }
    var podePagar = saldo > 0 && titulo.status !== 'paga';

    // Único ícone de ação na V2 (pedido explícito: remover as demais).
    var actionsHTML = podePagar
      ? '<button type="button" class="actionBtn" data-action="registrar-pagamento" aria-label="Registrar pagamento"><i data-lucide="circle-dollar-sign" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Registrar pagamento</span></button>'
      : '';

    var searchText = normalize(titulo.descricao + ' ' + titulo.fornecedorNome + ' ' + (titulo.documento || ''));

    return (
      '<tr class="tr" id="ctp-row-' + titulo.codigo + '" data-codigo="' + titulo.codigo + '" data-situacao="' + situacao + '" data-status="' + titulo.status + '" data-vencimento="' + titulo.vencimento + '" data-valor-original="' + titulo.valorOriginal + '" data-saldo="' + saldo + '" data-pago="' + titulo.pago + '" data-search="' + searchText + '">' +
        '<td class="td">' + titulo.fornecedorNome + '</td>' +
        '<td class="td">' + descricaoText + '</td>' +
        '<td class="td">' + (titulo.documento || '—') + '</td>' +
        '<td class="td">' + formatDataPt(titulo.vencimento) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td">' + formatMoeda(titulo.valorOriginal) + '</td>' +
        '<td class="td">' + formatMoeda(titulo.pago) + '</td>' +
        '<td class="td">' + formatMoeda(saldo) + '</td>' +
        '<td class="td"><div class="cellActions">' + actionsHTML + '</div></td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var rows = window.NiveloContasPagarV2.list().slice().sort(function (a, b) { return a.vencimento < b.vencimento ? 1 : -1; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (aba + busca + filtros + paginação) ----------
  var emptyState = document.getElementById('ctp-empty-state');
  var emptyGlobal = document.getElementById('ctp-empty-global');
  var searchInput = document.getElementById('ctp-search-input');
  var PAGE_SIZE = 10;

  var state = {
    tab: 'todas',
    search: '',
    situacao: '',
    status: '',
    periodStart: null,
    periodEnd: null,
    page: 1
  };

  // "Em aberto" agrupa 'em-aberto' E 'vencida' (ambos ainda devidos);
  // "Pagas" é só 'paga'. Decisão documentada: as 3 abas cobrem os 3
  // status sem sobreposição visual (nenhum título aparece em 2 abas),
  // mesmo raciocínio de tab "coarse" sobre um filtro fino já existente.
  function rowMatchesTab(row) {
    if (state.tab === 'todas') return true;
    if (state.tab === 'em-aberto') return row.dataset.status === 'em-aberto' || row.dataset.status === 'vencida';
    if (state.tab === 'pagas') return row.dataset.status === 'paga';
    return true;
  }

  function rowMatches(row) {
    if (!rowMatchesTab(row)) return false;
    if (state.situacao && row.dataset.situacao !== state.situacao) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.periodStart && row.dataset.vencimento < state.periodStart) return false;
    if (state.periodEnd && row.dataset.vencimento > state.periodEnd) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  var paginationEl = document.getElementById('ctp-pagination');
  var paginationInfoEl = document.getElementById('ctp-pagination-info');
  var paginationPagesEl = document.getElementById('ctp-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  // ---------- KPIs (Total a pagar/Vencido/Vence hoje/Próximos vencimentos)
  // — calculados a partir das linhas que casam com aba+busca+Agrupamento de
  // Filtros no momento (nunca o dataset inteiro, nunca só a página atual da
  // paginação). ----------
  var kpiTotalEl = document.getElementById('ctp-kpi-total');
  var kpiVencidoEl = document.getElementById('ctp-kpi-vencido');
  var kpiHojeEl = document.getElementById('ctp-kpi-hoje');
  var kpiProximosEl = document.getElementById('ctp-kpi-proximos');

  function addDaysISO(iso, days) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function updateKpis(matching) {
    var today = window.NiveloContasPagarV2.TODAY;
    var limite7 = addDaysISO(today, 7);
    var totalAPagar = 0, vencido = 0, venceHoje = 0, proximos7 = 0;

    matching.forEach(function (row) {
      var saldo = Number(row.dataset.saldo) || 0;
      if (saldo <= 0) return;
      var vencimento = row.dataset.vencimento;

      totalAPagar += saldo;
      if (vencimento < today) vencido += saldo;
      else if (vencimento === today) venceHoje += saldo;
      else if (vencimento <= limite7) proximos7 += saldo;
    });

    kpiTotalEl.textContent = formatMoeda(totalAPagar);
    kpiVencidoEl.textContent = formatMoeda(vencido);
    kpiHojeEl.textContent = formatMoeda(venceHoje);
    kpiProximosEl.textContent = formatMoeda(proximos7);
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.forEach(function (row) { row.classList.toggle('is-filtered-out', !rowMatches(row)); });
    updateKpis(rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); }));
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
      ? 'Nenhuma conta a pagar encontrada.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' contas';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="ctp-pagination-page' + (p === state.page ? ' is-active' : '') +
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

  // ---------- Abas (Todas/Em aberto/Pagas) ----------
  var tablistEl = document.getElementById('ctp-tablist');
  tablistEl.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    Array.prototype.slice.call(tablistEl.querySelectorAll('.tab')).forEach(function (t) {
      t.classList.toggle('active', t === tabBtn);
      t.setAttribute('aria-selected', String(t === tabBtn));
    });
    state.tab = tabBtn.dataset.tab;
    state.page = 1;
    applyFilters();
  });

  // ---------- Ordenação das colunas ----------
  var SORTABLE_COLUMNS = {
    fornecedor: { cellIndex: 0, type: 'text' },
    descricao: { cellIndex: 1, type: 'text' },
    documento: { cellIndex: 2, type: 'text' },
    vencimento: { cellIndex: 3, type: 'date' },
    status: { cellIndex: 4, type: 'text' },
    valorOriginal: { cellIndex: 5, type: 'number' },
    pago: { cellIndex: 6, type: 'number' },
    saldo: { cellIndex: 7, type: 'number' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('ctp-header-row');

  function sortRows() {
    if (!sortState.key) return;
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (sortState.key === 'vencimento') {
        va = a.dataset.vencimento; vb = b.dataset.vencimento;
      } else if (sortState.key === 'valorOriginal') {
        va = Number(a.dataset.valorOriginal); vb = Number(b.dataset.valorOriginal);
      } else if (sortState.key === 'pago' || sortState.key === 'saldo') {
        va = Number(a.dataset[sortState.key]); vb = Number(b.dataset[sortState.key]);
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

  var situacaoDropdown = initDropdown(document.getElementById('dropdown-situacao'));
  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  // ---------- Agrupamento de Filtros (FilterPopover) ----------
  var filtrosPopoverEl = document.getElementById('ctp-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('ctp-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('ctp-filtros-trigger');

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
    document.removeEventListener('click', outsideFiltrosClickHandler);
  }

  filtrosTriggerBtn.addEventListener('click', function () {
    if (filtrosPopoverEl.hidden) openFiltrosPopover(); else closeFiltrosPopover();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filtrosPopoverEl.hidden) closeFiltrosPopover();
  });

  document.getElementById('ctp-filtros-aplicar').addEventListener('click', function () {
    state.situacao = document.getElementById('dropdown-situacao').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('ctp-filtros-limpar').addEventListener('click', function () {
    situacaoDropdown.reset('', 'Todas');
    statusDropdown.reset('', 'Todas');
    resetPeriod();
    state.situacao = '';
    state.status = '';
    state.page = 1;
    applyFilters();
  });

  // ---------- Período: mesmo componente de sempre (period-filter.js),
  // aplicado sobre `vencimento`. ----------
  var periodFilter = window.NiveloPeriodFilter.init({
    mount: document.getElementById('ctp-period-mount'),
    onApply: function (result) {
      state.periodStart = result.mode === 'none' ? null : result.start;
      state.periodEnd = result.mode === 'none' ? null : result.end;
    }
  });

  function resetPeriod() {
    periodFilter.reset();
    state.periodStart = null;
    state.periodEnd = null;
  }

  // ---------- Navegação (Nova conta) ----------
  document.getElementById('new-conta-btn').addEventListener('click', function () {
    window.location.href = 'nova-conta-pagar-v2.html';
  });
  var emptyGlobalBtn = document.getElementById('ctp-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'nova-conta-pagar-v2.html';
    });
  }

  // ---------- Ações da linha (delegado em `document`, cobre tabela E cards)
  // — única ação: Registrar pagamento, que agora é uma PÁGINA própria
  // (pedido explícito), não mais um modal. ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var rowId = btn.closest('[data-row-id]') ? btn.closest('[data-row-id]').dataset.rowId : null;
    var row = rowId ? document.getElementById(rowId) : btn.closest('.tr');
    if (!row) return;
    var codigo = row.dataset.codigo;

    if (btn.dataset.action === 'registrar-pagamento') {
      window.location.href = 'registrar-pagamento-conta-pagar-v2.html?codigo=' + encodeURIComponent(codigo);
    }
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('ctp-cards');

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card ctp-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="ctp-mobile-card-header">' +
          '<span class="ctp-mobile-card-fornecedor text-subtitle-s">' + cellText(row.children[0]) + '</span>' +
          row.children[4].innerHTML +
        '</div>' +
        '<dl class="ctp-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Descrição</dt><dd class="text-12-regular">' + row.children[1].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Documento / NF</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Vencimento</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor original</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Pago</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Saldo</dt><dd class="text-12-regular">' + cellText(row.children[7]) + '</dd></div>' +
        '</dl>' +
        '<div class="ctp-mobile-card-actions">' + row.children[8].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Exportar Excel (mesmo padrão exato de Estoque/V1: CSV com
  // BOM, respeita busca/filtros/aba aplicados, não a paginação nem o
  // dataset inteiro, exclui a coluna Ações). ----------
  function exportToExcel() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    var headers = ['Fornecedor', 'Descrição', 'Documento / NF', 'Vencimento', 'Status', 'Valor original', 'Pago', 'Saldo'];
    var lines = [headers.join(';')];
    rows.forEach(function (row) {
      var values = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return cellText(row.children[i]); });
      lines.push(values.join(';'));
    });

    var BOM = String.fromCharCode(0xFEFF);
    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'contas-a-pagar.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  document.getElementById('ctp-export-btn').addEventListener('click', exportToExcel);

  // ---------- Boot: estado de carregamento breve > conteúdo real (mesmo
  // padrão exato de Categorias de receitas e despesas/V1). ----------
  var tableCard = document.querySelector('.ctp-table-card');
  tableCard.classList.add('is-loading');
  window.setTimeout(function () {
    tableCard.classList.remove('is-loading');
    renderInitialRows();
    applyFilters();
  }, 350);
})();
