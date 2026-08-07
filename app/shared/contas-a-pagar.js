(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação da tabela — mesma técnica
  // exata já usada em cadastros.js/estoque.js (position:fixed calculado via
  // JS, `.tip` reparentado pra `document.body` no primeiro hover pra escapar
  // do `filter:brightness()` das linhas zebradas). ----------
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

  // ---------- Toast de sucesso (mesma composição já usada em Caixa/
  // Categorias/Notas fiscais). ----------
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
    successMessage = sessionStorage.getItem('nivelo.novacontapagar.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novacontapagar.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A conta já está disponível na listagem.');
  }

  // ---------- Rótulos ----------
  var STATUS_BADGE = {
    emitida: { status: 'indigo', label: 'Emitida' },
    'em-aberto': { status: 'info', label: 'Em Aberto' },
    paga: { status: 'success', label: 'Paga' },
    atrasada: { status: 'error', label: 'Atrasada' },
    cancelada: { status: 'warning', label: 'Cancelada' }
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

  // Situação de pagamento (integral/parcial/não pago) — dimensão derivada de
  // saldo×pago, DISTINTA do Status do Pagamento (workflow emitida/em
  // aberto/paga/atrasada/cancelada): uma conta "Atrasada" ainda pode estar
  // "Não paga" ou "Pago parcialmente", por exemplo.
  function situacaoPagamento(conta) {
    if (conta.saldo <= 0) return 'integral';
    if (conta.pago > 0) return 'parcial';
    return 'nao-pago';
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloContasPagar) — única fonte de dados. ----------
  var tbody = document.getElementById('ctp-tbody');

  function buildRowHTML(conta) {
    var badge = STATUS_BADGE[conta.status];
    var categoriaText = categoriaDescricao(conta.categoriaCodigo);
    var situacao = situacaoPagamento(conta);
    var historicoText = conta.historico;
    if (conta.parcelaTotal) {
      historicoText += '<span class="ctp-cell-parcela text-body-xs">Parcela ' + conta.parcelaAtual + '/' + conta.parcelaTotal + '</span>';
    }
    var podeEditar = conta.status !== 'cancelada';
    var podePagar = conta.saldo > 0 && conta.status !== 'cancelada';
    var podeCancelar = conta.status !== 'cancelada' && conta.status !== 'paga';

    var actionsHTML =
      '<button type="button" class="actionBtn" data-action="visualizar" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>' +
      (podeEditar ? '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' : '') +
      (podePagar ? '<button type="button" class="actionBtn" data-action="registrar-pagamento" aria-label="Registrar pagamento"><i data-lucide="circle-dollar-sign" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Registrar pagamento</span></button>' : '') +
      (podeCancelar ? '<button type="button" class="actionBtn actionDanger" data-action="cancelar" aria-label="Cancelar"><i data-lucide="ban" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Cancelar</span></button>' : '');

    var searchText = normalize(conta.historico + ' ' + conta.fornecedorNome + ' ' + (conta.numeroDocumento || ''));

    return (
      '<tr class="tr" id="ctp-row-' + conta.codigo + '" data-codigo="' + conta.codigo + '" data-categoria="' + (conta.categoriaCodigo || '') + '" data-forma="' + (conta.formaPagamentoCodigo || '') + '" data-situacao="' + situacao + '" data-status="' + conta.status + '" data-vencimento="' + conta.vencimento + '" data-valor="' + conta.valor + '" data-saldo="' + conta.saldo + '" data-pago="' + conta.pago + '" data-search="' + searchText + '">' +
        '<td class="td">' + conta.fornecedorNome + '</td>' +
        '<td class="td">' + historicoText + '</td>' +
        '<td class="td">' + (conta.numeroDocumento || '—') + '</td>' +
        '<td class="td">' + formatDataPt(conta.vencimento) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td">' + formatMoeda(conta.valor) + '</td>' +
        '<td class="td">' + formatMoeda(conta.saldo) + '</td>' +
        '<td class="td">' + formatMoeda(conta.pago) + '</td>' +
        '<td class="td"><div class="cellActions">' + actionsHTML + '</div></td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var rows = window.NiveloContasPagar.list().slice().sort(function (a, b) { return a.vencimento < b.vencimento ? 1 : -1; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + filtros + paginação) ----------
  var emptyState = document.getElementById('ctp-empty-state');
  var emptyGlobal = document.getElementById('ctp-empty-global');
  var searchInput = document.getElementById('ctp-search-input');
  var PAGE_SIZE = 10;

  var state = {
    search: '',
    categoria: '',
    forma: '',
    situacao: '',
    status: '',
    periodStart: null,
    periodEnd: null,
    page: 1
  };

  function rowMatches(row) {
    if (state.categoria && row.dataset.categoria !== state.categoria) return false;
    if (state.forma && row.dataset.forma !== state.forma) return false;
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
  // — calculados a partir das linhas que casam com busca+Agrupamento de
  // Filtros no momento (nunca o dataset inteiro, nunca a página atual da
  // paginação), mesmo princípio de `updateResumo()` em caixa.js. Contas
  // `cancelada` nunca entram em nenhum dos 4 totais (dívida cancelada não é
  // "a pagar"). ----------
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
    var today = window.NiveloContasPagar.TODAY;
    var limite7 = addDaysISO(today, 7);
    var totalAPagar = 0, vencido = 0, venceHoje = 0, proximos7 = 0;

    matching.forEach(function (row) {
      if (row.dataset.status === 'cancelada') return;
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

  // ---------- Ordenação das colunas ----------
  var SORTABLE_COLUMNS = {
    fornecedor: { cellIndex: 0, type: 'text' },
    historico: { cellIndex: 1, type: 'text' },
    documento: { cellIndex: 2, type: 'text' },
    vencimento: { cellIndex: 3, type: 'date' },
    status: { cellIndex: 4, type: 'text' },
    valor: { cellIndex: 5, type: 'number' },
    saldo: { cellIndex: 6, type: 'number' },
    pago: { cellIndex: 7, type: 'number' }
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
      } else if (sortState.key === 'valor' || sortState.key === 'saldo' || sortState.key === 'pago') {
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
    // Mesmo fix de nova-conta-pagar.js: eventos de scroll não borbulham, mas
    // a fase de CAPTURA entrega ao listener do `window` também o scroll
    // interno do próprio `.menu` (overflow-y:auto) — sem este guard, rolar a
    // lista pela barra de rolagem fechava o dropdown sozinho.
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

  // Categoria/Forma de Pagamento: populadas em runtime a partir dos
  // catálogos centrais (todas as categorias, sem filtro de grupo — uma
  // conta a pagar é sempre despesa, mas o catálogo é compartilhado com
  // Caixa, que também usa categorias de receita).
  var categoriaMenu = document.getElementById('ctp-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    categoriaMenu.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(document.getElementById('dropdown-categoria'));

  var formaMenu = document.getElementById('ctp-forma-menu');
  window.NiveloFormasPagamento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaMenu.appendChild(optionEl);
  });
  var formaDropdown = initDropdown(document.getElementById('dropdown-forma'));

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
    closePeriodPopover();
    document.removeEventListener('click', outsideFiltrosClickHandler);
  }

  filtrosTriggerBtn.addEventListener('click', function () {
    if (filtrosPopoverEl.hidden) openFiltrosPopover(); else closeFiltrosPopover();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filtrosPopoverEl.hidden) closeFiltrosPopover();
  });

  document.getElementById('ctp-filtros-aplicar').addEventListener('click', function () {
    state.categoria = document.getElementById('dropdown-categoria').dataset.value || '';
    state.forma = document.getElementById('dropdown-forma').dataset.value || '';
    state.situacao = document.getElementById('dropdown-situacao').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('ctp-filtros-limpar').addEventListener('click', function () {
    categoriaDropdown.reset('', 'Todas as categorias');
    formaDropdown.reset('', 'Todas as formas');
    situacaoDropdown.reset('', 'Todas');
    statusDropdown.reset('', 'Todas');
    resetPeriod();
    state.categoria = '';
    state.forma = '';
    state.situacao = '';
    state.status = '';
    state.page = 1;
    applyFilters();
  });

  // ---------- Período (intervalo de datas): Popover + calendário aninhado
  // dentro do Agrupamento de Filtros — mesma composição já usada em
  // Caixa/Notas fiscais/Dashboard (dois cliques pra escolher início/fim),
  // aplicado sobre `vencimento` (a dimensão de data natural desta tela). ----------
  (function initPeriodPicker() {
    var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    var trigger = document.getElementById('ctp-period-trigger');
    var valueEl = document.getElementById('ctp-period-value');
    var popover = document.getElementById('ctp-period-popover');
    var startInput = document.getElementById('ctp-period-start-input');
    var endInput = document.getElementById('ctp-period-end-input');
    var calLabel = popover.querySelector('[data-period-label]');
    var calGrid = popover.querySelector('[data-period-grid]');

    var draft = { start: null, end: null, viewYear: 0, viewMonth: 0 };
    var applied = null;

    function pad2b(n) { return n < 10 ? '0' + n : String(n); }
    function toInputValue(date) { return date ? date.getFullYear() + '-' + pad2b(date.getMonth() + 1) + '-' + pad2b(date.getDate()) : ''; }
    function parseInputValue(value) {
      if (!value) return null;
      var parts = value.split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    function formatDatePt(date) { return pad2b(date.getDate()) + '/' + pad2b(date.getMonth() + 1) + '/' + date.getFullYear(); }
    function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
    function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

    function renderCalendar() {
      calLabel.textContent = capitalize(MONTH_NAMES[draft.viewMonth]) + ' de ' + draft.viewYear;
      var firstWeekday = new Date(draft.viewYear, draft.viewMonth, 1).getDay();
      var daysInMonth = new Date(draft.viewYear, draft.viewMonth + 1, 0).getDate();
      var html = '';
      for (var e = 0; e < firstWeekday; e++) html += '<span class="ctp-period-day-empty"></span>';
      for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(draft.viewYear, draft.viewMonth, day);
        var classes = ['ctp-period-day', 'text-12-regular'];
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
      var btn = event.target.closest('.ctp-period-day');
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

    document.getElementById('ctp-period-cancel').addEventListener('click', function () {
      draft.start = applied ? applied.start : null;
      draft.end = applied ? applied.end : null;
      startInput.value = toInputValue(draft.start);
      endInput.value = toInputValue(draft.end);
      closePeriodPopoverInternal();
    });

    document.getElementById('ctp-period-apply').addEventListener('click', function () {
      if (draft.start && draft.end) {
        applied = { start: draft.start, end: draft.end };
        valueEl.textContent = formatDatePt(draft.start) + ' até ' + formatDatePt(draft.end);
        valueEl.classList.remove('ctp-period-placeholder');
        state.periodStart = toInputValue(draft.start);
        state.periodEnd = toInputValue(draft.end);
      }
      closePeriodPopoverInternal();
    });

    window.resetPeriodPickerCtp = function () {
      draft = { start: null, end: null, viewYear: 0, viewMonth: 0 };
      applied = null;
      startInput.value = '';
      endInput.value = '';
      valueEl.textContent = 'Todo o período';
      valueEl.classList.add('ctp-period-placeholder');
      state.periodStart = null;
      state.periodEnd = null;
    };
    window.closePeriodPopoverPublicCtp = closePeriodPopoverInternal;
  })();

  function closePeriodPopover() { if (window.closePeriodPopoverPublicCtp) window.closePeriodPopoverPublicCtp(); }
  function resetPeriod() { if (window.resetPeriodPickerCtp) window.resetPeriodPickerCtp(); }

  // ---------- Navegação (Nova conta / Visualizar / Editar) ----------
  document.getElementById('new-conta-btn').addEventListener('click', function () {
    window.location.href = 'nova-conta-pagar.html';
  });
  var emptyGlobalBtn = document.getElementById('ctp-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'nova-conta-pagar.html';
    });
  }

  // ---------- Modal: Registrar pagamento ----------
  var pagamentoOverlay = document.getElementById('pagamento-dialog-overlay');
  var pagamentoState = { codigo: null };

  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var pagamentoValorInput = document.getElementById('pagamento-valor-input');
  var pagamentoValorField = document.getElementById('pagamento-valor-field');
  var pagamentoDataInput = document.getElementById('pagamento-data-input');
  // ---------- Data do pagamento: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var pagamentoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'pagamento-data-field',
    triggerId: 'pagamento-data-trigger',
    valueId: 'pagamento-data-value',
    hiddenInputId: 'pagamento-data-input',
    popoverId: 'pagamento-data-popover',
    placeholder: 'Selecionar data'
  });

  pagamentoValorInput.addEventListener('input', function () {
    var digits = pagamentoValorInput.value.replace(/\D/g, '');
    pagamentoValorInput.dataset.cents = digitsToCents(digits);
    pagamentoValorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (pagamentoValorField.classList.contains('error') && Number(pagamentoValorInput.dataset.cents) > 0) {
      pagamentoValorField.classList.remove('error');
    }
  });

  function openPagamentoModal(conta) {
    pagamentoState.codigo = conta.codigo;
    document.getElementById('pagamento-recap-title').textContent = conta.fornecedorNome + ' · ' + conta.historico;
    document.getElementById('pagamento-recap-documento').textContent = conta.numeroDocumento || '—';
    document.getElementById('pagamento-recap-vencimento').textContent = formatDataPt(conta.vencimento);
    document.getElementById('pagamento-recap-valor').textContent = formatMoeda(conta.valor);
    document.getElementById('pagamento-recap-saldo').textContent = formatMoeda(conta.saldo);
    pagamentoValorInput.value = '';
    pagamentoValorInput.dataset.cents = 0;
    pagamentoValorField.classList.remove('error');
    pagamentoDataPicker.setValue(window.NiveloContasPagar.TODAY);
    pagamentoOverlay.hidden = false;
    pagamentoValorInput.focus();
  }
  function closePagamentoModal() { pagamentoOverlay.hidden = true; }

  document.getElementById('pagamento-dialog-close').addEventListener('click', closePagamentoModal);
  document.getElementById('pagamento-cancel').addEventListener('click', closePagamentoModal);
  pagamentoOverlay.addEventListener('click', function (event) { if (event.target === pagamentoOverlay) closePagamentoModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !pagamentoOverlay.hidden) closePagamentoModal(); });

  document.getElementById('pagamento-confirm').addEventListener('click', function () {
    var conta = window.NiveloContasPagar.findByCodigo(pagamentoState.codigo);
    if (!conta) return;
    var valorPago = Number(pagamentoValorInput.dataset.cents || 0) / 100;
    var invalid = !(valorPago > 0 && valorPago <= conta.saldo);
    pagamentoValorField.classList.toggle('error', invalid);
    if (invalid) return;

    window.NiveloContasPagar.registrarPagamento(conta.codigo, valorPago, pagamentoDataInput.value || window.NiveloContasPagar.TODAY);
    closePagamentoModal();
    updateRow(conta.codigo);
    showSuccessToast('Pagamento registrado com sucesso', conta.fornecedorNome + ' · ' + formatMoeda(valorPago) + '.');
  });

  // ---------- Modal: Cancelar conta a pagar ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  var cancelarState = { codigo: null };

  function openCancelarModal(conta) {
    cancelarState.codigo = conta.codigo;
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar a conta "' + conta.historico + '" (' + conta.fornecedorNome + ')? Contas canceladas não podem mais receber pagamentos.';
    cancelarOverlay.hidden = false;
  }
  function closeCancelarModal() { cancelarOverlay.hidden = true; }

  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-voltar').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) { if (event.target === cancelarOverlay) closeCancelarModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal(); });

  document.getElementById('cancelar-dialog-confirmar').addEventListener('click', function () {
    var conta = window.NiveloContasPagar.findByCodigo(cancelarState.codigo);
    if (!conta) return;
    window.NiveloContasPagar.cancelar(conta.codigo);
    closeCancelarModal();
    updateRow(conta.codigo);
    showSuccessToast('Conta a pagar cancelada com sucesso', conta.fornecedorNome + ' · ' + conta.historico + '.');
  });

  // ---------- Re-render de UMA linha só (depois de pagamento/cancelamento),
  // nunca reconstrói o tbody inteiro (perderia ordenação/busca em
  // andamento) — mesmo princípio de Estoque. ----------
  function updateRow(codigo) {
    var conta = window.NiveloContasPagar.findByCodigo(codigo);
    var row = document.getElementById('ctp-row-' + codigo);
    if (!conta || !row) return;
    var newRow = document.createElement('tbody');
    newRow.innerHTML = buildRowHTML(conta);
    row.replaceWith(newRow.firstElementChild);
    if (window.lucide) lucide.createIcons();
    applyFilters();
  }

  // ---------- Ações da linha (delegado em `document`, cobre tabela E cards) ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var rowId = btn.closest('[data-row-id]') ? btn.closest('[data-row-id]').dataset.rowId : null;
    var row = rowId ? document.getElementById(rowId) : btn.closest('.tr');
    if (!row) return;
    var codigo = row.dataset.codigo;
    var conta = window.NiveloContasPagar.findByCodigo(codigo);
    if (!conta) return;

    var action = btn.dataset.action;
    if (action === 'visualizar') {
      window.location.href = 'detalhe-conta-pagar.html?codigo=' + encodeURIComponent(codigo);
    } else if (action === 'editar') {
      window.location.href = 'nova-conta-pagar.html?codigo=' + encodeURIComponent(codigo) + '&modo=editar';
    } else if (action === 'registrar-pagamento') {
      openPagamentoModal(conta);
    } else if (action === 'cancelar') {
      openCancelarModal(conta);
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
          '<div><dt class="text-10-regular">Histórico</dt><dd class="text-12-regular">' + row.children[1].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Nº Documento</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Vencimento</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Saldo</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Pago</dt><dd class="text-12-regular">' + cellText(row.children[7]) + '</dd></div>' +
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

  // ---------- Boot: estado de carregamento breve > conteúdo real (mesmo
  // padrão exato de Categorias de receitas e despesas). ----------
  var tableCard = document.querySelector('.ctp-table-card');
  tableCard.classList.add('is-loading');
  window.setTimeout(function () {
    tableCard.classList.remove('is-loading');
    renderInitialRows();
    applyFilters();
  }, 350);
})();
