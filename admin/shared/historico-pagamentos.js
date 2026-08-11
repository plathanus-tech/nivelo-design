(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TODAY = window.NiveloPagamentos.TODAY;
  var STATUS_LABELS = window.NiveloPagamentos.STATUS_LABELS;
  var STATUS_BADGE = window.NiveloPagamentos.STATUS_BADGE;
  var TIPO_LABELS = window.NiveloPagamentos.TIPO_LABELS;

  function formatDateBR(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatBRL(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }
  function addDiasISO(iso, dias) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Monta o dataset enriquecido (pagamento + cliente + plano) ----------
  var ROWS = window.NiveloPagamentos.list().map(function (p) {
    var a = window.NiveloPagamentos.assinante(p);
    var plano = window.NiveloPagamentos.plano(p);
    return {
      pagamento: p,
      clienteNome: a ? a.nome : '—',
      clienteEmail: a ? a.email : '—',
      planoNome: plano ? plano.nome : '—'
    };
  });

  // ---------- Popular Dropdown de Plano a partir do catálogo central ----------
  var planoMenu = document.getElementById('hp-plano-menu');
  if (window.NiveloAdminPlanos) {
    window.NiveloAdminPlanos.list().forEach(function (plano) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = plano.id;
      optionEl.textContent = plano.nome;
      planoMenu.appendChild(optionEl);
    });
  }

  // ---------- Dropdown genérico (seleção única), position:fixed via JS ----------
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
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
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

  var periodoDropdown = initDropdown(document.getElementById('dropdown-periodo'));
  var planoDropdown = initDropdown(document.getElementById('dropdown-plano'));
  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  var periodCustomEl = document.getElementById('hp-period-custom');
  var periodStartInput = document.getElementById('hp-period-start-input');
  var periodEndInput = document.getElementById('hp-period-end-input');
  document.getElementById('dropdown-periodo').addEventListener('click', function () {
    window.setTimeout(function () {
      periodCustomEl.hidden = document.getElementById('dropdown-periodo').dataset.value !== 'custom';
    }, 0);
  });

  var cupomInput = document.getElementById('hp-cupom-input');
  var afiliadoInput = document.getElementById('hp-afiliado-input');
  var searchInput = document.getElementById('hp-search-input');

  // ---------- Agrupamento de Filtros (Popover) ----------
  var filtrosPopoverEl = document.getElementById('hp-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('hp-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('hp-filtros-trigger');

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

  // ---------- Estado (busca + filtros, aplicados só ao clicar "Filtrar") + paginação ----------
  var PAGE_SIZE = 10;
  var state = {
    search: '',
    periodo: '',
    periodStart: null,
    periodEnd: null,
    planoId: '',
    status: '',
    cupom: '',
    afiliado: '',
    page: 1
  };

  function periodBounds() {
    if (state.periodo === 'hoje') return { start: TODAY, end: TODAY };
    if (state.periodo === '7d') return { start: addDiasISO(TODAY, -6), end: TODAY };
    if (state.periodo === '30d') return { start: addDiasISO(TODAY, -29), end: TODAY };
    if (state.periodo === 'mes') return { start: TODAY.slice(0, 8) + '01', end: TODAY };
    if (state.periodo === 'custom' && (state.periodStart || state.periodEnd)) {
      return { start: state.periodStart, end: state.periodEnd };
    }
    return null;
  }

  function rowMatches(row) {
    var p = row.pagamento;
    if (state.search) {
      var haystack = normalize(row.clienteNome + ' ' + row.clienteEmail);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    var bounds = periodBounds();
    if (bounds) {
      if (bounds.start && p.data < bounds.start) return false;
      if (bounds.end && p.data > bounds.end) return false;
    }
    if (state.planoId && p.planoId !== state.planoId) return false;
    if (state.status && p.status !== state.status) return false;
    if (state.cupom && normalize(p.cupomCodigo || '').indexOf(normalize(state.cupom)) === -1) return false;
    if (state.afiliado && normalize(p.afiliado || '').indexOf(normalize(state.afiliado)) === -1) return false;
    return true;
  }

  function updateKpis(matching) {
    var totalRecebido = 0, realizados = 0, pendentes = 0, atraso = 0;
    matching.forEach(function (row) {
      var p = row.pagamento;
      if (p.status === 'pago') { totalRecebido += p.valorFinal; realizados++; }
      else if (p.status === 'pendente') pendentes++;
      else if (p.status === 'atraso') atraso++;
    });
    document.getElementById('hp-kpi-total').textContent = formatBRL(totalRecebido);
    document.getElementById('hp-kpi-realizados').textContent = String(realizados);
    document.getElementById('hp-kpi-pendentes').textContent = String(pendentes);
    document.getElementById('hp-kpi-atraso').textContent = String(atraso);
  }

  var tbody = document.getElementById('hp-tbody');
  var cardsContainer = document.getElementById('hp-cards');
  var emptyEl = document.getElementById('hp-empty-state');
  var paginationEl = document.getElementById('hp-pagination');
  var paginationInfoEl = document.getElementById('hp-pagination-info');
  var paginationPagesEl = document.getElementById('hp-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  function buildRowHTML(row) {
    var p = row.pagamento;
    var badge = STATUS_BADGE[p.status];
    return (
      '<tr class="tr" data-id="' + p.id + '">' +
        '<td class="td">' + formatDateBR(p.data) + '</td>' +
        '<td class="td"><span class="hp-cliente-nome">' + row.clienteNome + '</span><span class="hp-cliente-email">' + row.clienteEmail + '</span></td>' +
        '<td class="td">' + TIPO_LABELS[p.tipoCobranca] + '</td>' +
        '<td class="td">' + row.planoNome + '</td>' +
        '<td class="td">' + formatBRL(p.valorOriginal) + '</td>' +
        '<td class="td">' + (p.valorDesconto > 0 ? '<span class="hp-valor-desconto">-' + formatBRL(p.valorDesconto) + '</span>' : '—') + '</td>' +
        '<td class="td">' + formatBRL(p.valorFinal) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge + '"><span class="badgeDot"></span>' + STATUS_LABELS[p.status] + '</span></td>' +
        '<td class="td"><div class="cellActions">' +
          '<a class="actionBtn" data-action="ver-detalhes" href="pagamento-detalhe.html#id=' + p.id + '" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></a>' +
          (p.notaFiscalNumero
            ? '<button type="button" class="actionBtn" data-action="baixar-nf" data-id="' + p.id + '" aria-label="Baixar nota fiscal"><i data-lucide="download" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Baixar nota fiscal</span></button>'
            : '') +
        '</div></td>' +
      '</tr>'
    );
  }

  // ---------- Baixar nota fiscal — mesmo padrão de download (Blob + link) já usado em
  // Exportar Excel/CSV no resto do sistema. ----------
  function baixarNotaFiscal(pagamentoId) {
    var pagamento = window.NiveloPagamentos.findById(pagamentoId);
    if (!pagamento || !pagamento.notaFiscalNumero) return;
    var assinante = window.NiveloPagamentos.assinante(pagamento);
    var linhas = [
      'Nota fiscal: ' + pagamento.notaFiscalNumero,
      'Cliente: ' + (assinante ? assinante.nome : '—'),
      'Data da cobranca: ' + formatDateBR(pagamento.data),
      'Valor final: ' + formatBRL(pagamento.valorFinal)
    ];
    var blob = new Blob([linhas.join('\r\n')], { type: 'text/plain;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = pagamento.notaFiscalNumero + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action="baixar-nf"]');
    if (!btn) return;
    baixarNotaFiscal(btn.dataset.id);
  });

  // ---------- Tooltip padrão dos ícones de ação — mesma técnica de `usuarios.js`/
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

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(rowEl) {
    return (
      '<div class="card hp-mobile-card">' +
        '<div class="hp-mobile-card-header">' +
          '<div><div class="hp-mobile-card-name text-subtitle-s">' + rowEl.children[1].querySelector('.hp-cliente-nome').textContent + '</div>' +
          '<div class="hp-mobile-card-email text-body-xs">' + rowEl.children[1].querySelector('.hp-cliente-email').textContent + '</div></div>' +
          rowEl.children[7].innerHTML +
        '</div>' +
        '<dl class="hp-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Data</dt><dd class="text-12-regular">' + cellText(rowEl.children[0]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Descrição</dt><dd class="text-12-regular">' + cellText(rowEl.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Plano</dt><dd class="text-12-regular">' + cellText(rowEl.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + cellText(rowEl.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Desconto</dt><dd class="text-12-regular">' + rowEl.children[5].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor final</dt><dd class="text-12-regular">' + cellText(rowEl.children[6]) + '</dd></div>' +
        '</dl>' +
        '<div class="hp-mobile-card-actions">' + rowEl.children[8].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  function renderPaginationControls(totalCount, totalPages) {
    paginationEl.hidden = totalCount === 0;
    var rangeStart = totalCount === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var rangeEnd = Math.min(state.page * PAGE_SIZE, totalCount);
    paginationInfoEl.textContent = totalCount === 0
      ? ''
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' pagamentos';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="hp-pagination-page' + (p === state.page ? ' is-active' : '') +
        '" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
    }
    paginationPagesEl.innerHTML = pagesHTML;
    paginationPrevBtn.disabled = state.page <= 1;
    paginationNextBtn.disabled = state.page >= totalPages;
  }

  function applyPagination() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var matching = rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    emptyEl.hidden = matching.length > 0;

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

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var rowsById = {};
    ROWS.forEach(function (row) { rowsById[row.pagamento.id] = row; });
    rows.forEach(function (rowEl) {
      var row = rowsById[rowEl.dataset.id];
      rowEl.classList.toggle('is-filtered-out', !rowMatches(row));
    });
    var matchingRows = ROWS.filter(rowMatches);
    updateKpis(matchingRows);
    applyPagination();
  }

  paginationPrevBtn.addEventListener('click', function () { if (state.page > 1) { state.page--; applyPagination(); } });
  paginationNextBtn.addEventListener('click', function () { state.page++; applyPagination(); });
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

  document.getElementById('hp-filtros-aplicar').addEventListener('click', function () {
    state.periodo = document.getElementById('dropdown-periodo').dataset.value || '';
    state.periodStart = periodStartInput.value || null;
    state.periodEnd = periodEndInput.value || null;
    state.planoId = document.getElementById('dropdown-plano').dataset.value || '';
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.cupom = cupomInput.value;
    state.afiliado = afiliadoInput.value;
    state.page = 1;
    closeFiltrosPopover();
    applyFilters();
  });

  function limparFiltros() {
    periodoDropdown.reset('', 'Todo o período');
    planoDropdown.reset('', 'Todos os planos');
    statusDropdown.reset('', 'Todos os status');
    periodCustomEl.hidden = true;
    periodStartInput.value = '';
    periodEndInput.value = '';
    cupomInput.value = '';
    afiliadoInput.value = '';
    searchInput.value = '';
    state = { search: '', periodo: '', periodStart: null, periodEnd: null, planoId: '', status: '', cupom: '', afiliado: '', page: 1 };
    clearActiveClientNote();
    applyFilters();
  }
  document.getElementById('hp-filtros-limpar').addEventListener('click', function () {
    limparFiltros();
    closeFiltrosPopover();
  });
  document.getElementById('hp-empty-limpar').addEventListener('click', limparFiltros);

  // ---------- Filtro por cliente vindo do perfil do assinante (?assinanteId=) ----------
  var activeClientNoteEl = document.getElementById('hp-active-client-note');
  var activeClientNameEl = document.getElementById('hp-active-client-name');
  function clearActiveClientNote() { activeClientNoteEl.hidden = true; }
  document.getElementById('hp-active-client-clear').addEventListener('click', function () {
    searchInput.value = '';
    state.search = '';
    state.status = '';
    statusDropdown.reset('', 'Todos os status');
    state.page = 1;
    clearActiveClientNote();
    applyFilters();
  });

  function applyAssinanteIdFromQuery() {
    var params = new URLSearchParams(location.search);
    var assinanteId = params.get('assinanteId');
    if (!assinanteId || !window.NiveloAssinantes) return;
    var a = window.NiveloAssinantes.findById(assinanteId);
    if (!a) return;
    searchInput.value = a.nome;
    state.search = a.nome;
    activeClientNameEl.textContent = a.nome;
    activeClientNoteEl.hidden = false;
  }

  // ---------- Filtro de status vindo do Dashboard (?status=atraso, por exemplo) — reaproveita
  // a mesma nota de filtro ativo usada para ?assinanteId=, com um texto genérico. ----------
  function applyStatusFromQuery() {
    var params = new URLSearchParams(location.search);
    var status = params.get('status');
    if (!status || !STATUS_LABELS[status]) return;
    state.status = status;
    statusDropdown.reset(status, STATUS_LABELS[status]);
    activeClientNameEl.textContent = 'Pagamentos — ' + STATUS_LABELS[status];
    activeClientNoteEl.hidden = false;
  }

  // ---------- Boot ----------
  tbody.innerHTML = ROWS.slice().sort(function (a, b) { return a.pagamento.data < b.pagamento.data ? 1 : -1; }).map(buildRowHTML).join('');
  if (window.lucide) lucide.createIcons();
  applyAssinanteIdFromQuery();
  applyStatusFromQuery();
  applyFilters();
})();
