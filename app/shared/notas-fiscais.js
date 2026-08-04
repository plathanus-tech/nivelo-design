(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // categorias-financeiras.js/produtos.js/cadastros.js). ----------
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
    toast.className = 'alert success nf-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novanotafiscal.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novanotafiscal.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A nota já está disponível na Central de Notas Fiscais.');
  }

  // ---------- Rótulos ----------
  var STATUS_BADGE = {
    pendente: { status: 'warning', label: 'Pendente' },
    emitida: { status: 'success', label: 'Emitida' },
    cancelada: { status: 'error', label: 'Cancelada' },
    rejeitada: { status: 'error', label: 'Rejeitada' }
  };

  function formatMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDataPt(iso) {
    var parts = (iso || '').split('-');
    if (parts.length !== 3) return iso || '';
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Renderiza as 2 tabelas a partir do catálogo central
  // (window.NiveloNotasFiscais) — cada aba é uma seção/tabela própria (mesmo
  // padrão de Estoque, que tem 3 tabelas com colunas diferentes por aba). ----------
  var tbodies = { saida: document.getElementById('saida-tbody'), entrada: document.getElementById('entrada-tbody') };

  // Considerar rejeitada/erro como "pendência que exige atenção": além do
  // badge de erro, uma linha de texto com o motivo, sempre visível (não só
  // no hover) — mais simples e mais acessível que um tooltip pra uma
  // informação que já é relevante o bastante pra aparecer direto na tabela.
  function buildStatusCellHTML(nota) {
    var badge = STATUS_BADGE[nota.status] || STATUS_BADGE.pendente;
    var html = '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';
    if (nota.status === 'rejeitada' && nota.motivoRejeicao) {
      html += '<span class="nf-status-note text-body-xs"><i data-lucide="alert-triangle" width="12" height="12"></i>' + nota.motivoRejeicao + '</span>';
    }
    return html;
  }

  // Corrigir nota só faz sentido pra notas de SAÍDA rejeitadas (é a única
  // situação em que o usuário tem dados pra revisar e reenviar — cancelada é
  // terminal, pendente/emitida não precisam de correção, e não existe fluxo
  // de criação/correção manual pra notas de entrada nesta etapa).
  function buildActionsHTML(nota) {
    var html = '<div class="cellActions">' +
      '<button type="button" class="actionBtn" data-action="ver" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>' +
      '<button type="button" class="actionBtn" data-action="pdf" aria-label="Baixar PDF"><i data-lucide="file-down" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Baixar PDF</span></button>';
    if (nota.tipo === 'saida' && nota.status === 'rejeitada') {
      html += '<button type="button" class="actionBtn" data-action="corrigir" aria-label="Corrigir nota"><i data-lucide="rotate-ccw" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Corrigir nota</span></button>';
    }
    html += '</div>';
    return html;
  }

  function buildRowHTML(nota) {
    var pessoaNome = nota.tipo === 'saida' ? nota.clienteNome : nota.fornecedorNome;
    var pessoaDocumento = nota.tipo === 'saida' ? nota.clienteDocumento : nota.fornecedorDocumento;
    var produtosTexto = nota.itens.map(function (item) { return item.produtoNome; }).join(' ');
    var searchText = normalize(nota.numero + ' ' + pessoaNome + ' ' + pessoaDocumento + ' ' + produtosTexto);
    return (
      '<tr class="tr" id="nf-row-' + nota.numero + '" data-numero="' + nota.numero + '" data-status="' + nota.status + '" data-data="' + nota.dataEmissao + '" data-search="' + searchText + '">' +
        '<td class="td">' + nota.numero + '</td>' +
        '<td class="td">' + formatDataPt(nota.dataEmissao) + '</td>' +
        '<td class="td">' + pessoaNome + '</td>' +
        '<td class="td">' + nota.uf + '</td>' +
        '<td class="td">' + formatMoeda(nota.valor) + '</td>' +
        '<td class="td nf-status-cell">' + buildStatusCellHTML(nota) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(nota) + '</td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    tbodies.saida.innerHTML = window.NiveloNotasFiscais.list('saida').map(buildRowHTML).join('');
    tbodies.entrada.innerHTML = window.NiveloNotasFiscais.list('entrada').map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }
  renderInitialRows();

  // ---------- Abas (mesmo padrão de Estoque: cada aba é uma seção/tabela
  // própria, hidden alterna entre elas). ----------
  var tablist = document.getElementById('nf-tablist');
  var panels = { saida: document.getElementById('panel-saida'), entrada: document.getElementById('panel-entrada') };
  var emptyGlobalEls = { saida: document.getElementById('saida-empty-global'), entrada: document.getElementById('entrada-empty-global') };

  function getActivePanelKey() {
    return Object.keys(panels).filter(function (k) { return !panels[k].hidden; })[0];
  }

  tablist.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    var target = tabBtn.dataset.tab;

    Array.prototype.forEach.call(tablist.querySelectorAll('.tab'), function (btn) {
      var isActive = btn === tabBtn;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== target; });
    applyVisibility(target);
  });

  // ---------- Estado (busca + filtros, compartilhado pelas 2 abas — cada
  // aba filtra sua própria tabela com o mesmo critério). ----------
  var searchInput = document.getElementById('nf-search-input');
  var state = { search: '', status: '', periodStart: null, periodEnd: null };

  function rowMatches(row) {
    if (state.status && row.dataset.status !== state.status) return false;
    if (state.periodStart && row.dataset.data < state.periodStart) return false;
    if (state.periodEnd && row.dataset.data > state.periodEnd) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  function applyVisibility(panelKey) {
    var tbody = tbodies[panelKey];
    var allRows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var anyMatch = false;
    allRows.forEach(function (row) {
      var matches = rowMatches(row);
      row.hidden = !matches;
      if (matches) anyMatch = true;
    });

    var panel = panels[panelKey];
    var totalRows = allRows.length;
    panel.querySelector('.tableWrap').hidden = totalRows === 0;
    panel.querySelector('.nf-mobile-cards').hidden = totalRows === 0;
    panel.querySelector('[data-empty]').hidden = totalRows === 0 || anyMatch;
    emptyGlobalEls[panelKey].hidden = totalRows > 0;

    renderCards(panelKey);
  }

  function applyFilters() {
    applyVisibility(getActivePanelKey());
  }

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Ordenação das colunas (independente por aba, mesma técnica de
  // Cadastro/Produtos/Categorias). ----------
  var SORTABLE_COLUMNS = {
    numero: { cellIndex: 0, type: 'text' },
    dataEmissao: { cellIndex: 1, type: 'text' },
    cliente: { cellIndex: 2, type: 'text' },
    fornecedor: { cellIndex: 2, type: 'text' },
    valor: { cellIndex: 4, type: 'number' }
  };
  var sortState = { saida: { key: null, dir: 'asc' }, entrada: { key: null, dir: 'asc' } };

  function initSortableTable(panelKey) {
    var headerRow = panels[panelKey].querySelector('.headerRow');
    headerRow.addEventListener('click', function (event) {
      var th = event.target.closest('.th.sortable');
      if (!th) return;
      var key = th.dataset.sortKey;
      var currentSort = sortState[panelKey];
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        currentSort.key = key;
        currentSort.dir = 'asc';
      }
      Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (t) {
        var active = t.dataset.sortKey === currentSort.key;
        t.setAttribute('aria-sort', active ? (currentSort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
        var iconName = active ? (currentSort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
        t.querySelector('[data-sort-icon]').innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
      });
      if (window.lucide) lucide.createIcons();

      var config = SORTABLE_COLUMNS[key];
      var dir = currentSort.dir === 'asc' ? 1 : -1;
      var tbody = tbodies[panelKey];
      var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
      rows.sort(function (a, b) {
        var va, vb;
        if (config.type === 'number') {
          va = parseFloat(a.children[config.cellIndex].textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
          vb = parseFloat(b.children[config.cellIndex].textContent.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
        } else {
          va = normalize(a.children[config.cellIndex].textContent);
          vb = normalize(b.children[config.cellIndex].textContent);
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
      rows.forEach(function (row) { tbody.appendChild(row); });
      applyVisibility(panelKey);
    });
  }
  initSortableTable('saida');
  initSortableTable('entrada');

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

  var statusDropdown = initDropdown(document.getElementById('dropdown-status'));

  // ---------- Agrupamento de Filtros (FilterPopover) ----------
  var filtrosPopoverEl = document.getElementById('nf-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('nf-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('nf-filtros-trigger');

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

  document.getElementById('nf-filtros-aplicar').addEventListener('click', function () {
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('nf-filtros-limpar').addEventListener('click', function () {
    statusDropdown.reset('', 'Todos os status');
    state.status = '';
    resetPeriod();
    applyFilters();
  });

  // ---------- Período (intervalo de datas): Popover + calendário aninhado
  // dentro do Agrupamento de Filtros — mesma composição de "Período
  // personalizado" do Dashboard (dois cliques pra escolher início/fim),
  // reaproveitada aqui com prefixo próprio (`nf-`). ----------
  (function initPeriodPicker() {
    var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    var fieldRoot = document.getElementById('nf-period-field');
    var trigger = document.getElementById('nf-period-trigger');
    var valueEl = document.getElementById('nf-period-value');
    var popover = document.getElementById('nf-period-popover');
    var startInput = document.getElementById('nf-period-start-input');
    var endInput = document.getElementById('nf-period-end-input');
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
      for (var e = 0; e < firstWeekday; e++) html += '<span class="nf-period-day-empty"></span>';
      for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(draft.viewYear, draft.viewMonth, day);
        var classes = ['nf-period-day', 'text-12-regular'];
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
      var btn = event.target.closest('.nf-period-day');
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

    document.getElementById('nf-period-cancel').addEventListener('click', function () {
      draft.start = applied ? applied.start : null;
      draft.end = applied ? applied.end : null;
      startInput.value = toInputValue(draft.start);
      endInput.value = toInputValue(draft.end);
      closePeriodPopoverInternal();
    });

    document.getElementById('nf-period-apply').addEventListener('click', function () {
      if (draft.start && draft.end) {
        applied = { start: draft.start, end: draft.end };
        valueEl.textContent = formatDatePt(draft.start) + ' até ' + formatDatePt(draft.end);
        valueEl.classList.remove('nf-period-placeholder');
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
      valueEl.classList.add('nf-period-placeholder');
      state.periodStart = null;
      state.periodEnd = null;
    };
    window.closePeriodPopoverPublic = closePeriodPopoverInternal;
  })();

  function closePeriodPopover() { if (window.closePeriodPopoverPublic) window.closePeriodPopoverPublic(); }
  function resetPeriod() { if (window.resetPeriodPicker) window.resetPeriodPicker(); }

  // ---------- Ações da tabela ----------
  function openViewScreen(numero) {
    window.location.href = 'nova-nota-fiscal.html?numero=' + encodeURIComponent(numero) + '&modo=ver';
  }
  function openCorrectionScreen(numero) {
    window.location.href = 'nova-nota-fiscal.html?numero=' + encodeURIComponent(numero) + '&modo=corrigir';
  }

  // ---------- Baixar PDF: gera um PDF mínimo (porém válido) no próprio
  // navegador, sem backend — mesmo espírito do "Exportar Excel" real de
  // Estoque (CSV gerado no cliente), aqui como PDF pra ficar coerente com o
  // que o usuário espera de um botão "Baixar PDF" de nota fiscal. ----------
  function escapePdfText(text) {
    // Remove acentos antes de escapar: a fonte Helvetica padrão do PDF é
    // declarada sem uma tabela de encoding própria, então caracteres fora
    // de ASCII (ex.: "ã", "ç") podem não renderizar corretamente em
    // leitores mais estritos — mesma técnica de normalize() já usada pra
    // busca, sem o lowercase.
    var withoutDiacritics = String(text == null ? '' : text).normalize('NFD').replace(DIACRITICS_RE, '');
    return withoutDiacritics.replace(/[\\()]/g, function (ch) { return '\\' + ch; });
  }

  function buildNotaPdfBlob(nota) {
    var pessoaLabel = nota.tipo === 'saida' ? 'Cliente' : 'Fornecedor';
    var pessoaNome = nota.tipo === 'saida' ? nota.clienteNome : nota.fornecedorNome;
    var pessoaDocumento = nota.tipo === 'saida' ? nota.clienteDocumento : nota.fornecedorDocumento;
    var statusLabel = (STATUS_BADGE[nota.status] || {}).label || nota.status;

    var lines = [
      'NOTA FISCAL ' + nota.numero,
      'Tipo: ' + (nota.tipo === 'saida' ? 'Saida' : 'Entrada'),
      'Data de emissao: ' + formatDataPt(nota.dataEmissao),
      pessoaLabel + ': ' + (pessoaNome || '-'),
      'Documento: ' + (pessoaDocumento || '-'),
      'UF: ' + (nota.uf || '-'),
      'Valor total: ' + formatMoeda(nota.valor),
      'Status: ' + statusLabel
    ];
    if (nota.status === 'rejeitada' && nota.motivoRejeicao) {
      lines.push('Motivo da rejeicao: ' + nota.motivoRejeicao);
    }
    lines.push('');
    lines.push('Itens:');
    (nota.itens || []).forEach(function (item) {
      lines.push('- ' + item.produtoNome + ' (' + item.sku + ') x' + item.quantidade + ' ' + item.unidade + ' - ' + formatMoeda(item.preco));
    });

    var opsParts = ['BT', '/F1 14 Tf', '50 760 Td'];
    lines.forEach(function (line, index) {
      if (index > 0) opsParts.push('0 -18 TD');
      opsParts.push('(' + escapePdfText(line) + ') Tj');
    });
    opsParts.push('ET');
    var streamText = opsParts.join('\n');

    var header = '%PDF-1.4\n';
    var obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
    var obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
    var obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n';
    var obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
    var obj5 = '5 0 obj\n<< /Length ' + streamText.length + ' >>\nstream\n' + streamText + '\nendstream\nendobj\n';

    var offset1 = header.length;
    var offset2 = offset1 + obj1.length;
    var offset3 = offset2 + obj2.length;
    var offset4 = offset3 + obj3.length;
    var offset5 = offset4 + obj4.length;
    var xrefStart = offset5 + obj5.length;

    function pad10(n) { var s = String(n); while (s.length < 10) s = '0' + s; return s; }
    var xref = 'xref\n0 6\n0000000000 65535 f \n' +
      [offset1, offset2, offset3, offset4, offset5].map(function (off) { return pad10(off) + ' 00000 n \n'; }).join('');
    var trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xrefStart + '\n%%EOF';

    var pdfText = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
    return new Blob([pdfText], { type: 'application/pdf' });
  }

  function downloadNotaPdf(numero) {
    var nota = window.NiveloNotasFiscais.findByNumero(numero);
    if (!nota) return;
    var blob = buildNotaPdfBlob(nota);
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = nota.numero + '.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    var numero = row.dataset.numero;
    if (action === 'ver') openViewScreen(numero);
    else if (action === 'corrigir') openCorrectionScreen(numero);
    else if (action === 'pdf') downloadNotaPdf(numero);
  }

  tbodies.saida.addEventListener('click', handleTbodyClick);
  tbodies.entrada.addEventListener('click', handleTbodyClick);
  function handleTbodyClick(event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  }

  document.getElementById('new-nota-btn').addEventListener('click', function () {
    window.location.href = 'nova-nota-fiscal.html';
  });
  var saidaEmptyBtn = document.getElementById('saida-empty-global-btn');
  if (saidaEmptyBtn) {
    saidaEmptyBtn.addEventListener('click', function () { window.location.href = 'nova-nota-fiscal.html'; });
  }

  // ---------- Cards (Mobile) ----------
  var cardsContainers = { saida: document.getElementById('saida-cards'), entrada: document.getElementById('entrada-cards') };

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row, panelKey) {
    var actionsHTML = row.children[6].querySelector('.cellActions').innerHTML;
    var pessoaLabel = panelKey === 'saida' ? 'Cliente' : 'Fornecedor';
    return (
      '<div class="card nf-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="nf-mobile-card-header">' +
          '<span class="nf-mobile-card-numero text-subtitle-s">' + cellText(row.children[0]) + '</span>' +
          '<span class="text-body-xs">' + cellText(row.children[1]) + '</span>' +
        '</div>' +
        '<dl class="nf-mobile-card-fields">' +
          '<div><dt class="text-10-regular">' + pessoaLabel + '</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">UF</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[5].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions nf-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards(panelKey) {
    var rows = Array.prototype.slice.call(tbodies[panelKey].querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainers[panelKey].innerHTML = rows.map(function (row) { return buildCardHTML(row, panelKey); }).join('');
    if (window.lucide) lucide.createIcons();
  }

  cardsContainers.saida.addEventListener('click', handleCardClick);
  cardsContainers.entrada.addEventListener('click', handleCardClick);
  function handleCardClick(event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var cardEl = btn.closest('[data-row-id]');
    var row = document.getElementById(cardEl.dataset.rowId);
    handleRowAction(btn, row);
  }

  applyVisibility('saida');
  applyVisibility('entrada');
})();
