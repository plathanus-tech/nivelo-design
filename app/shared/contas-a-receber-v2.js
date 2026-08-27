(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação da tabela — mesma técnica
  // exata já usada em contas-a-pagar.js. ----------
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
    toast.className = 'alert success ctr-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novacontareceberv2.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novacontareceberv2.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A conta já está disponível na listagem.');
  }

  // ---------- Rótulos ----------
  var STATUS_BADGE = {
    emitida: { status: 'indigo', label: 'Emitida' },
    'em-aberto': { status: 'info', label: 'Em Aberto' },
    recebida: { status: 'success', label: 'Recebida' },
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

  // ---------- Renderiza a tabela a partir do catálogo central ----------
  var tbody = document.getElementById('ctr-tbody');

  function buildRowHTML(conta) {
    var badge = STATUS_BADGE[conta.status];
    var categoriaText = categoriaDescricao(conta.categoriaCodigo);
    var historicoText = conta.historico;
    if (conta.parcelaTotal) {
      historicoText += '<span class="ctr-cell-parcela text-body-xs">Parcela ' + conta.parcelaAtual + '/' + conta.parcelaTotal + '</span>';
    }
    var saldo = window.NiveloContasReceberV2.saldoAtual(conta);
    var bancos = window.NiveloContasReceberV2.bancosDoTitulo(conta);
    var bancoText = bancos.length ? bancos.join(', ') : '—';
    var podeEditar = conta.status !== 'cancelada';
    var podeReceber = saldo > 0 && conta.status !== 'cancelada';
    var podeCancelar = conta.status !== 'cancelada' && conta.status !== 'recebida';

    var actionsHTML =
      '<button type="button" class="actionBtn" data-action="visualizar" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>' +
      (podeEditar ? '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' : '') +
      (podeReceber ? '<button type="button" class="actionBtn" data-action="registrar-recebimento" aria-label="Registrar recebimento"><i data-lucide="circle-dollar-sign" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Registrar recebimento</span></button>' : '') +
      (podeCancelar ? '<button type="button" class="actionBtn actionDanger" data-action="cancelar" aria-label="Cancelar"><i data-lucide="ban" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Cancelar</span></button>' : '');

    var searchText = normalize(conta.historico + ' ' + conta.clienteNome + ' ' + (conta.numeroDocumento || ''));

    return (
      '<tr class="tr" id="ctr-row-' + conta.codigo + '" data-codigo="' + conta.codigo + '" data-categoria="' + (conta.categoriaCodigo || '') + '" data-forma="' + (conta.formaRecebimentoCodigo || '') + '" data-status="' + conta.status + '" data-vencimento="' + conta.vencimento + '" data-valor="' + conta.valor + '" data-saldo="' + saldo + '" data-bancos="' + bancos.join('|') + '" data-search="' + searchText + '">' +
        '<td class="td">' + conta.clienteNome + '</td>' +
        '<td class="td">' + (conta.numeroDocumento || '—') + '</td>' +
        '<td class="td">' + historicoText + '</td>' +
        '<td class="td">' + formatDataPt(conta.vencimento) + '</td>' +
        '<td class="td">' + formatMoeda(conta.valor) + '</td>' +
        '<td class="td">' + formatDataPt(conta.dataEmissao) + '</td>' +
        '<td class="td">' + categoriaText + '</td>' +
        '<td class="td">' + bancoText + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td"><div class="cellActions">' + actionsHTML + '</div></td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var rows = window.NiveloContasReceberV2.list().slice().sort(function (a, b) { return a.vencimento < b.vencimento ? 1 : -1; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + filtros + paginação) ----------
  var emptyState = document.getElementById('ctr-empty-state');
  var emptyGlobal = document.getElementById('ctr-empty-global');
  var searchInput = document.getElementById('ctr-search-input');
  var PAGE_SIZE = 10;

  var state = {
    search: '',
    categorias: [], // múltipla escolha — array de códigos; vazio = todas
    forma: '',
    status: '',
    banco: '',
    periodStart: null,
    periodEnd: null,
    page: 1
  };

  function rowMatches(row) {
    if (state.categorias.length && state.categorias.indexOf(row.dataset.categoria) === -1) return false;
    if (state.forma && row.dataset.forma !== state.forma) return false;
    if (state.status && row.dataset.status !== state.status) return false;
    // Um título pode ter recebimentos em mais de um banco — o filtro
    // considera o título "do banco X" se QUALQUER recebimento dele usou
    // esse banco (pedido explícito: "se um título possuir recebimentos em
    // bancos diferentes, considerar corretamente essa informação").
    if (state.banco) {
      var bancos = row.dataset.bancos ? row.dataset.bancos.split('|') : [];
      if (bancos.indexOf(state.banco) === -1) return false;
    }
    if (state.periodStart && row.dataset.vencimento < state.periodStart) return false;
    if (state.periodEnd && row.dataset.vencimento > state.periodEnd) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  var paginationEl = document.getElementById('ctr-pagination');
  var paginationInfoEl = document.getElementById('ctr-pagination-info');
  var paginationPagesEl = document.getElementById('ctr-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  // ---------- KPIs ----------
  var kpiTotalEl = document.getElementById('ctr-kpi-total');
  var kpiVencidoEl = document.getElementById('ctr-kpi-vencido');
  var kpiHojeEl = document.getElementById('ctr-kpi-hoje');
  var kpiProximosEl = document.getElementById('ctr-kpi-proximos');
  var bancoTagEl = document.getElementById('ctr-summary-banco-tag');
  var bancoTagTextEl = document.getElementById('ctr-summary-banco-tag-text');

  function addDaysISO(iso, days) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1, parts[2] + days);
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function updateKpis(matching) {
    var today = window.NiveloContasReceberV2.TODAY;
    var limite7 = addDaysISO(today, 7);
    var totalAReceber = 0, vencido = 0, venceHoje = 0, proximos7 = 0;

    matching.forEach(function (row) {
      if (row.dataset.status === 'cancelada') return;
      var saldo = Number(row.dataset.saldo) || 0;
      if (saldo <= 0) return;
      var vencimento = row.dataset.vencimento;

      totalAReceber += saldo;
      if (vencimento < today) vencido += saldo;
      else if (vencimento === today) venceHoje += saldo;
      else if (vencimento <= limite7) proximos7 += saldo;
    });

    kpiTotalEl.textContent = formatMoeda(totalAReceber);
    kpiVencidoEl.textContent = formatMoeda(vencido);
    kpiHojeEl.textContent = formatMoeda(venceHoje);
    kpiProximosEl.textContent = formatMoeda(proximos7);

    bancoTagEl.hidden = !state.banco;
    if (state.banco) bancoTagTextEl.textContent = state.banco;
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
      ? 'Nenhuma conta a receber encontrada.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' contas';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="ctr-pagination-page' + (p === state.page ? ' is-active' : '') +
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
    cliente: { cellIndex: 0, type: 'text' },
    documento: { cellIndex: 1, type: 'text' },
    historico: { cellIndex: 2, type: 'text' },
    vencimento: { cellIndex: 3, type: 'date' },
    valor: { cellIndex: 4, type: 'number' },
    emissao: { cellIndex: 5, type: 'date' },
    categoria: { cellIndex: 6, type: 'text' },
    status: { cellIndex: 8, type: 'text' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('ctr-header-row');

  function sortRows() {
    if (!sortState.key) return;
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (sortState.key === 'vencimento') {
        va = a.dataset.vencimento; vb = b.dataset.vencimento;
      } else if (sortState.key === 'valor') {
        va = Number(a.dataset.valor); vb = Number(b.dataset.valor);
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

  // ---------- Dropdown genérico (seleção única) ----------
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

  // ---------- Dropdown de múltipla escolha (Categoria) — fica aberto entre
  // seleções, checkbox por opção; fecha só em clique-fora/Esc/no próprio
  // trigger. Único filtro desta tela com "uma ou mais" opções (pedido
  // explícito de Categoria). ----------
  function initMultiDropdown(root, placeholderAll) {
    var trigger = root.querySelector('[data-multidropdown-trigger]');
    var valueEl = root.querySelector('[data-multidropdown-value]');
    var menu = root.querySelector('[data-multidropdown-menu]');
    var selected = [];

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

    function updateLabel() {
      if (!selected.length) {
        valueEl.textContent = placeholderAll;
      } else if (selected.length === 1) {
        var opt = menu.querySelector('.ctr-multidropdown-option[data-value="' + selected[0] + '"]');
        valueEl.textContent = opt ? opt.dataset.label : selected[0];
      } else {
        valueEl.textContent = selected.length + ' categorias selecionadas';
      }
    }

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.ctr-multidropdown-option');
      if (!optionEl) return;
      var checkbox = optionEl.querySelector('input[type="checkbox"]');
      var value = optionEl.dataset.value;
      if (event.target !== checkbox) checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        if (selected.indexOf(value) === -1) selected.push(value);
      } else {
        selected = selected.filter(function (v) { return v !== value; });
      }
      updateLabel();
    });

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    function reset() {
      selected = [];
      Array.prototype.slice.call(menu.querySelectorAll('input[type="checkbox"]')).forEach(function (cb) { cb.checked = false; });
      updateLabel();
    }

    function getSelected() { return selected.slice(); }

    return { reset: reset, getSelected: getSelected };
  }

  // Categoria: dropdown de múltipla escolha, populado a partir do catálogo
  // central (só categorias ativas).
  var categoriaMenu = document.getElementById('ctr-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'ctr-multidropdown-option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.dataset.label = categoria.descricao;
    optionEl.innerHTML = '<input type="checkbox" /> <span>' + categoria.descricao + '</span>';
    categoriaMenu.appendChild(optionEl);
  });
  var categoriaMultiDropdown = initMultiDropdown(document.getElementById('dropdown-categoria'), 'Todas as categorias');

  var formaMenu = document.getElementById('ctr-forma-menu');
  window.NiveloFormasRecebimento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaMenu.appendChild(optionEl);
  });
  var formaDropdown = initDropdown(document.getElementById('dropdown-forma'));

  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  // Banco: populado com os valores REALMENTE presentes nos recebimentos já
  // registrados (mesma técnica já usada no filtro de Banco de Caixa) —
  // garante que toda opção do filtro filtra de verdade.
  var bancoMenu = document.getElementById('ctr-banco-menu');
  var bancosUnicos = [];
  window.NiveloContasReceberV2.list().forEach(function (titulo) {
    window.NiveloContasReceberV2.bancosDoTitulo(titulo).forEach(function (banco) {
      if (bancosUnicos.indexOf(banco) === -1) bancosUnicos.push(banco);
    });
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
  var filtrosPopoverEl = document.getElementById('ctr-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('ctr-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('ctr-filtros-trigger');

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

  document.getElementById('ctr-filtros-aplicar').addEventListener('click', function () {
    state.categorias = categoriaMultiDropdown.getSelected();
    state.forma = document.getElementById('dropdown-forma').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.banco = document.getElementById('dropdown-banco').dataset.value || '';
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('ctr-filtros-limpar').addEventListener('click', function () {
    categoriaMultiDropdown.reset();
    formaDropdown.reset('', 'Todas as formas');
    statusDropdown.reset('', 'Todos');
    bancoDropdown.reset('', 'Todos os bancos');
    resetPeriod();
    state.categorias = [];
    state.forma = '';
    state.status = '';
    state.banco = '';
    state.page = 1;
    applyFilters();
  });

  // ---------- Período: seletor de modo (Sem filtro/Últimos 30 dias/Dia/
  // Mês/Intervalo), aninhado dentro do Agrupamento de Filtros — ver
  // period-filter.js. Aplicado sobre `vencimento`. ----------
  var periodFilter = window.NiveloPeriodFilter.init({
    mount: document.getElementById('ctr-period-mount'),
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

  // ---------- Navegação (Nova conta / Visualizar / Editar) ----------
  document.getElementById('new-conta-btn').addEventListener('click', function () {
    window.location.href = 'nova-conta-receber-v2.html';
  });
  var emptyGlobalBtn = document.getElementById('ctr-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'nova-conta-receber-v2.html';
    });
  }

  // ---------- Modal: Registrar recebimento (V2 — valor/desconto/banco
  // obrigatório/data, com histórico dos recebimentos já feitos e suporte a
  // recebimentos parciais/múltiplos no mesmo título). ----------
  var recebimentoOverlay = document.getElementById('recebimento-dialog-overlay');
  var recebimentoState = { codigo: null };

  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var recebimentoValorInput = document.getElementById('recebimento-valor-input');
  var recebimentoValorField = document.getElementById('recebimento-valor-field');
  var recebimentoDescontoInput = document.getElementById('recebimento-desconto-input');
  var recebimentoDataInput = document.getElementById('recebimento-data-input');
  var recebimentoBancoField = document.getElementById('recebimento-banco-field');
  // ---------- Data do recebimento: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var recebimentoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'recebimento-data-field',
    triggerId: 'recebimento-data-trigger',
    valueId: 'recebimento-data-value',
    hiddenInputId: 'recebimento-data-input',
    popoverId: 'recebimento-data-popover',
    placeholder: 'Selecionar data'
  });

  recebimentoValorInput.addEventListener('input', function () {
    var digits = recebimentoValorInput.value.replace(/\D/g, '');
    recebimentoValorInput.dataset.cents = digitsToCents(digits);
    recebimentoValorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (recebimentoValorField.classList.contains('error') && Number(recebimentoValorInput.dataset.cents) > 0) {
      recebimentoValorField.classList.remove('error');
    }
  });
  recebimentoDescontoInput.addEventListener('input', function () {
    var digits = recebimentoDescontoInput.value.replace(/\D/g, '');
    recebimentoDescontoInput.dataset.cents = digitsToCents(digits);
    recebimentoDescontoInput.value = digits ? formatCentavosBRL(digitsToCents(digits)) : '';
  });

  // Banco/Conta de recebimento — catálogo real de Contas Bancárias, mesmo
  // rótulo já usado em Caixa/Contas a Pagar ("<banco> · <descrição>").
  var recebimentoBancoMenu = document.getElementById('recebimento-banco-menu');
  window.NiveloContasBancarias.list().forEach(function (contaBancaria) {
    var label = window.NiveloContasBancarias.bancoNome(contaBancaria) + ' · ' + contaBancaria.descricao;
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = String(contaBancaria.codigo);
    optionEl.textContent = label;
    recebimentoBancoMenu.appendChild(optionEl);
  });
  var recebimentoBancoDropdown = initDropdown(recebimentoBancoField);

  // Categoria/Forma de Recebimento — "demais informações que já existem em
  // Contas a Receber, mas que não estão disponíveis na Nota Fiscal",
  // selecionáveis no momento do recebimento (pedido explícito). Pré-
  // selecionadas com o valor já salvo no título quando existir.
  var recebimentoCategoriaMenu = document.getElementById('recebimento-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    recebimentoCategoriaMenu.appendChild(optionEl);
  });
  var recebimentoCategoriaDropdown = initDropdown(document.getElementById('recebimento-categoria-field'));

  var recebimentoFormaMenu = document.getElementById('recebimento-forma-menu');
  window.NiveloFormasRecebimento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    recebimentoFormaMenu.appendChild(optionEl);
  });
  var recebimentoFormaDropdown = initDropdown(document.getElementById('recebimento-forma-field'));

  function renderRecebimentosList(conta) {
    var listaEl = document.getElementById('recebimento-recap-lista');
    var itemsEl = document.getElementById('recebimento-recap-lista-items');
    if (!conta.recebimentos.length) { listaEl.hidden = true; return; }
    listaEl.hidden = false;
    itemsEl.innerHTML = conta.recebimentos.map(function (r) {
      var descontoText = r.desconto > 0 ? ' · desconto ' + formatMoeda(r.desconto) : '';
      return '<li class="text-12-regular">' + formatDataPt(r.data) + ' · ' + formatMoeda(r.valor) + descontoText + ' · ' + r.bancoLabel + '</li>';
    }).join('');
  }

  function openRecebimentoModal(conta) {
    recebimentoState.codigo = conta.codigo;
    document.getElementById('recebimento-recap-title').textContent = conta.clienteNome + ' · ' + conta.historico;
    document.getElementById('recebimento-recap-documento').textContent = conta.numeroDocumento || '—';
    document.getElementById('recebimento-recap-vencimento').textContent = formatDataPt(conta.vencimento);
    document.getElementById('recebimento-recap-valor').textContent = formatMoeda(conta.valor);
    document.getElementById('recebimento-recap-recebido').textContent = formatMoeda(window.NiveloContasReceberV2.totalRecebido(conta));
    document.getElementById('recebimento-recap-desconto').textContent = formatMoeda(window.NiveloContasReceberV2.totalDesconto(conta));
    document.getElementById('recebimento-recap-saldo').textContent = formatMoeda(window.NiveloContasReceberV2.saldoAtual(conta));
    renderRecebimentosList(conta);

    recebimentoValorInput.value = '';
    recebimentoValorInput.dataset.cents = 0;
    recebimentoValorField.classList.remove('error');
    recebimentoDescontoInput.value = '';
    recebimentoDescontoInput.dataset.cents = 0;
    recebimentoBancoDropdown.reset('', 'Selecione o banco');
    recebimentoBancoField.classList.remove('error');
    if (conta.categoriaCodigo) recebimentoCategoriaDropdown.reset(conta.categoriaCodigo, 'Selecione a categoria');
    else recebimentoCategoriaDropdown.reset('', 'Selecione a categoria');
    if (conta.formaRecebimentoCodigo) recebimentoFormaDropdown.reset(conta.formaRecebimentoCodigo, 'Selecione a forma');
    else recebimentoFormaDropdown.reset('', 'Selecione a forma');
    recebimentoDataPicker.setValue(window.NiveloContasReceberV2.TODAY);
    recebimentoOverlay.hidden = false;
    recebimentoValorInput.focus();
  }
  function closeRecebimentoModal() { recebimentoOverlay.hidden = true; }

  document.getElementById('recebimento-dialog-close').addEventListener('click', closeRecebimentoModal);
  document.getElementById('recebimento-cancel').addEventListener('click', closeRecebimentoModal);
  recebimentoOverlay.addEventListener('click', function (event) { if (event.target === recebimentoOverlay) closeRecebimentoModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !recebimentoOverlay.hidden) closeRecebimentoModal(); });

  document.getElementById('recebimento-confirm').addEventListener('click', function () {
    var conta = window.NiveloContasReceberV2.findByCodigo(recebimentoState.codigo);
    if (!conta) return;
    var saldoDisponivel = window.NiveloContasReceberV2.saldoAtual(conta);
    var valorRecebido = Number(recebimentoValorInput.dataset.cents || 0) / 100;
    var desconto = Number(recebimentoDescontoInput.dataset.cents || 0) / 100;
    var bancoCodigo = recebimentoBancoField.dataset.value;

    var valorInvalid = !(valorRecebido > 0 && (valorRecebido + desconto) <= saldoDisponivel);
    var bancoInvalid = !bancoCodigo;
    recebimentoValorField.classList.toggle('error', valorInvalid);
    recebimentoBancoField.classList.toggle('error', bancoInvalid);
    if (valorInvalid || bancoInvalid) return;

    window.NiveloContasReceberV2.registrarRecebimento(conta.codigo, {
      valor: valorRecebido,
      desconto: desconto,
      data: recebimentoDataInput.value || window.NiveloContasReceberV2.TODAY,
      contaBancariaCodigo: bancoCodigo,
      categoriaCodigo: document.getElementById('recebimento-categoria-field').dataset.value || null,
      formaRecebimentoCodigo: document.getElementById('recebimento-forma-field').dataset.value || null
    });
    closeRecebimentoModal();
    updateRow(conta.codigo);
    showSuccessToast('Recebimento registrado com sucesso', conta.clienteNome + ' · ' + formatMoeda(valorRecebido) + '.');
  });

  // ---------- Modal: Cancelar conta a receber ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  var cancelarState = { codigo: null };

  function openCancelarModal(conta) {
    cancelarState.codigo = conta.codigo;
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar a conta "' + conta.historico + '" (' + conta.clienteNome + ')? Contas canceladas não podem mais receber pagamentos do cliente.';
    cancelarOverlay.hidden = false;
  }
  function closeCancelarModal() { cancelarOverlay.hidden = true; }

  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-voltar').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) { if (event.target === cancelarOverlay) closeCancelarModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal(); });

  document.getElementById('cancelar-dialog-confirmar').addEventListener('click', function () {
    var conta = window.NiveloContasReceberV2.findByCodigo(cancelarState.codigo);
    if (!conta) return;
    window.NiveloContasReceberV2.cancelar(conta.codigo);
    closeCancelarModal();
    updateRow(conta.codigo);
    showSuccessToast('Conta a receber cancelada com sucesso', conta.clienteNome + ' · ' + conta.historico + '.');
  });

  // ---------- Re-render de UMA linha só (depois de recebimento/cancelamento) ----------
  function updateRow(codigo) {
    var conta = window.NiveloContasReceberV2.findByCodigo(codigo);
    var row = document.getElementById('ctr-row-' + codigo);
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
    var conta = window.NiveloContasReceberV2.findByCodigo(codigo);
    if (!conta) return;

    var action = btn.dataset.action;
    if (action === 'visualizar') {
      window.location.href = 'detalhe-conta-receber-v2.html?codigo=' + encodeURIComponent(codigo);
    } else if (action === 'editar') {
      window.location.href = 'nova-conta-receber-v2.html?codigo=' + encodeURIComponent(codigo) + '&modo=editar';
    } else if (action === 'registrar-recebimento') {
      openRecebimentoModal(conta);
    } else if (action === 'cancelar') {
      openCancelarModal(conta);
    }
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('ctr-cards');

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card ctr-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="ctr-mobile-card-header">' +
          '<span class="ctr-mobile-card-cliente text-subtitle-s">' + cellText(row.children[0]) + '</span>' +
          row.children[8].innerHTML +
        '</div>' +
        '<dl class="ctr-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Nº Documento</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Histórico</dt><dd class="text-12-regular">' + row.children[2].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Vencimento</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Data de Emissão</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Categoria</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Banco</dt><dd class="text-12-regular">' + cellText(row.children[7]) + '</dd></div>' +
        '</dl>' +
        '<div class="ctr-mobile-card-actions">' + row.children[9].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Exportar Excel (mesmo padrão exato de Estoque: CSV com BOM,
  // respeita busca/filtros aplicados, não a paginação nem o dataset inteiro,
  // exclui a coluna Ações). ----------
  function exportToExcel() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    var headers = ['Cliente', 'Nº Documento', 'Histórico', 'Vencimento', 'Valor', 'Data de Emissão', 'Categoria', 'Banco', 'Status'];
    var lines = [headers.join(';')];
    rows.forEach(function (row) {
      var values = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return cellText(row.children[i]); });
      lines.push(values.join(';'));
    });

    var BOM = String.fromCharCode(0xFEFF);
    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'contas-a-receber.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  document.getElementById('ctr-export-btn').addEventListener('click', exportToExcel);

  // ---------- Boot: estado de carregamento breve > conteúdo real ----------
  var tableCard = document.querySelector('.ctr-table-card');
  tableCard.classList.add('is-loading');
  window.setTimeout(function () {
    tableCard.classList.remove('is-loading');
    renderInitialRows();
    applyFilters();
  }, 350);
})();
