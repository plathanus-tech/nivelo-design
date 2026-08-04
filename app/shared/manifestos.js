(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // contas-bancarias.js/cadastros.js) ----------
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
    toast.className = 'alert success man-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novomanifesto.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novomanifesto.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'O manifesto já está disponível na listagem.');
  }

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  var STATUS_BADGE = {
    emitido: { status: 'success', label: 'Emitido' },
    cancelado: { status: 'error', label: 'Cancelado' }
  };

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloManifestos) ----------
  var tbody = document.getElementById('man-tbody');

  function buildActionsHTML(manifesto) {
    var actions =
      '<button type="button" class="actionBtn" data-action="ver" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>';
    if (manifesto.status !== 'cancelado') {
      actions +=
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn actionDanger" data-action="cancelar" aria-label="Cancelar"><i data-lucide="ban" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Cancelar</span></button>';
    }
    return '<div class="cellActions">' + actions + '</div>';
  }

  function placasText(manifesto) {
    return manifesto.placas.filter(Boolean).join(', ');
  }

  function buildRowHTML(manifesto) {
    var badge = STATUS_BADGE[manifesto.status];
    var origemDestino = manifesto.origem.cidade + '/' + manifesto.origem.estado + ' → ' + manifesto.destino.cidade + '/' + manifesto.destino.estado;
    var searchText = normalize(manifesto.numero + ' ' + manifesto.motorista.nome + ' ' + placasText(manifesto));
    return (
      '<tr class="tr" id="man-row-' + manifesto.numero + '" data-numero="' + manifesto.numero + '" data-search="' + searchText + '">' +
        '<td class="td">' + manifesto.numero + '</td>' +
        '<td class="td">' + manifesto.motorista.nome + '</td>' +
        '<td class="td">' + origemDestino + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '">' + badge.label + '</span></td>' +
        '<td class="td">' + buildActionsHTML(manifesto) + '</td>' +
      '</tr>'
    );
  }

  // `#state=empty` força a listagem vazia pra demonstração no
  // prototype-nav, sem precisar cancelar os registros seed de verdade.
  var isEmptyDemo = /state=empty/.test(location.hash);

  function renderInitialRows() {
    if (isEmptyDemo) {
      tbody.innerHTML = '';
      return;
    }
    var rows = window.NiveloManifestos.list().slice().sort(function (a, b) { return b.numero.localeCompare(a.numero); });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + paginação) ----------
  var emptyState = document.getElementById('man-empty-state');
  var emptyGlobal = document.getElementById('man-empty-global');
  var searchInput = document.getElementById('man-search-input');
  var PAGE_SIZE = 10;

  var state = { search: '', page: 1 };

  function rowMatches(row) {
    if (!state.search) return true;
    return normalize(row.dataset.search).indexOf(normalize(state.search)) !== -1;
  }

  var paginationEl = document.getElementById('man-pagination');
  var paginationInfoEl = document.getElementById('man-pagination-info');
  var paginationPagesEl = document.getElementById('man-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.forEach(function (row) { row.classList.toggle('is-filtered-out', !rowMatches(row)); });
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
      ? 'Nenhum manifesto encontrado.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' manifestos';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="man-pagination-page' + (p === state.page ? ' is-active' : '') +
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
    numero: { cellIndex: 0, type: 'text' },
    motorista: { cellIndex: 1, type: 'text' },
    status: { cellIndex: 3, type: 'text' }
  };
  var sortState = { key: 'numero', dir: 'desc' };
  var headerRow = document.getElementById('man-header-row');

  function sortRows() {
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va = normalize(a.children[config.cellIndex].textContent);
      var vb = normalize(b.children[config.cellIndex].textContent);
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

  // ---------- Navegação (Novo manifesto / Editar / Ver detalhes) ----------
  document.getElementById('new-manifesto-btn').addEventListener('click', function () {
    window.location.href = 'novo-manifesto.html';
  });
  var emptyGlobalBtn = document.getElementById('man-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'novo-manifesto.html';
    });
  }

  // ---------- Modal: Cancelar manifesto ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  var cancelarState = { numero: null };

  function openCancelarModal(manifesto) {
    cancelarState.numero = manifesto.numero;
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar o manifesto "' + manifesto.numero + '"? Esta ação não pode ser desfeita.';
    cancelarOverlay.hidden = false;
  }
  function closeCancelarModal() { cancelarOverlay.hidden = true; cancelarState.numero = null; }

  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-cancel').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) { if (event.target === cancelarOverlay) closeCancelarModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal(); });

  document.getElementById('cancelar-dialog-confirm').addEventListener('click', function () {
    var numero = cancelarState.numero;
    var manifesto = window.NiveloManifestos.cancelar(numero);
    if (!manifesto) return;
    closeCancelarModal();
    var row = document.getElementById('man-row-' + numero);
    if (row) {
      var newRow = document.createElement('template');
      newRow.innerHTML = buildRowHTML(manifesto).trim();
      row.replaceWith(newRow.content.firstChild);
    }
    applyFilters();
    if (window.lucide) lucide.createIcons();
    showSuccessToast('Manifesto cancelado com sucesso', '"' + numero + '" foi marcado como cancelado.');
  });

  // ---------- Ações da linha (delegado em `document`, cobre tabela E cards) ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var rowId = btn.closest('[data-row-id]') ? btn.closest('[data-row-id]').dataset.rowId : null;
    var row = rowId ? document.getElementById(rowId) : btn.closest('.tr');
    if (!row) return;
    var numero = row.dataset.numero;
    var manifesto = window.NiveloManifestos.findByNumero(numero);
    if (!manifesto) return;

    var action = btn.dataset.action;
    if (action === 'ver') {
      // Tela própria de leitura (mesmo padrão de "Ver detalhes" já usado em
      // Estoque/Talhão/Contas a Pagar/Certificado Digital) — nunca reaproveitar
      // o form de criação/edição em modo disabled.
      window.location.href = 'manifesto-detalhe.html#numero=' + encodeURIComponent(numero);
    } else if (action === 'editar') {
      window.location.href = 'novo-manifesto.html?numero=' + encodeURIComponent(numero) + '&modo=corrigir';
    } else if (action === 'cancelar') {
      openCancelarModal(manifesto);
    }
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('man-cards');

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card man-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="man-mobile-card-header">' +
          '<span class="man-mobile-card-numero text-subtitle-s">' + cellText(row.children[0]) + '</span>' +
          '<span>' + row.children[3].innerHTML + '</span>' +
        '</div>' +
        '<dl class="man-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Motorista</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Origem → Destino</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
        '</dl>' +
        '<div class="man-mobile-card-actions">' + row.children[4].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  renderInitialRows();
  sortRows();
  updateSortIcons();
  applyFilters();
})();
