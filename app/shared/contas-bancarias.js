(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // cadastros.js/produtos.js/contas-a-pagar.js: position:fixed via JS,
  // reparentado pra document.body no primeiro hover pra escapar do
  // filter:brightness() das linhas zebradas). ----------
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
    toast.className = 'alert success ctb-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novacontabancaria.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novacontabancaria.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A conta já está disponível na listagem.');
  }

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloContasBancarias) — única fonte de dados. ----------
  var tbody = document.getElementById('ctb-tbody');

  function buildActionsHTML(conta) {
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn actionDanger" data-action="excluir" aria-label="Excluir"><i data-lucide="trash-2" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Excluir</span></button>' +
      '</div>'
    );
  }

  function buildRowHTML(conta) {
    var bancoText = window.NiveloContasBancarias.bancoNome(conta);
    var searchText = normalize(bancoText + ' ' + conta.descricao);
    return (
      '<tr class="tr" id="ctb-row-' + conta.codigo + '" data-codigo="' + conta.codigo + '" data-search="' + searchText + '">' +
        '<td class="td">' + bancoText + '</td>' +
        '<td class="td">' + conta.descricao + '</td>' +
        '<td class="td">' + conta.agencia + '</td>' +
        '<td class="td">' + conta.conta + '</td>' +
        '<td class="td">' + buildActionsHTML(conta) + '</td>' +
      '</tr>'
    );
  }

  // `#state=empty` força a listagem vazia pra demonstração no
  // prototype-nav, sem precisar excluir os registros seed de verdade.
  var isEmptyDemo = /state=empty/.test(location.hash);

  function renderInitialRows() {
    if (isEmptyDemo) {
      tbody.innerHTML = '';
      return;
    }
    var rows = window.NiveloContasBancarias.list().slice().sort(function (a, b) { return a.codigo - b.codigo; });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + paginação) ----------
  var emptyState = document.getElementById('ctb-empty-state');
  var emptyGlobal = document.getElementById('ctb-empty-global');
  var searchInput = document.getElementById('ctb-search-input');
  var PAGE_SIZE = 10;

  var state = { search: '', page: 1 };

  function rowMatches(row) {
    if (!state.search) return true;
    return normalize(row.dataset.search).indexOf(normalize(state.search)) !== -1;
  }

  var paginationEl = document.getElementById('ctb-pagination');
  var paginationInfoEl = document.getElementById('ctb-pagination-info');
  var paginationPagesEl = document.getElementById('ctb-pagination-pages');
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
      ? 'Nenhuma conta bancária encontrada.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' contas';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="ctb-pagination-page' + (p === state.page ? ' is-active' : '') +
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
    banco: { cellIndex: 0, type: 'text' },
    descricao: { cellIndex: 1, type: 'text' },
    agencia: { cellIndex: 2, type: 'text' },
    conta: { cellIndex: 3, type: 'text' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('ctb-header-row');

  function sortRows() {
    if (!sortState.key) return;
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

  // ---------- Navegação (Nova conta / Editar) ----------
  document.getElementById('new-conta-bancaria-btn').addEventListener('click', function () {
    window.location.href = 'nova-conta-bancaria.html';
  });
  var emptyGlobalBtn = document.getElementById('ctb-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'nova-conta-bancaria.html';
    });
  }

  // ---------- Modal: Excluir conta bancária (exclusão real, mediante
  // confirmação — pedido explícito, diferente de Categorias/Talhões que só
  // ativam/desativam). ----------
  var excluirOverlay = document.getElementById('excluir-dialog-overlay');
  var excluirState = { codigo: null };

  function openExcluirModal(conta) {
    excluirState.codigo = conta.codigo;
    document.getElementById('excluir-dialog-message').textContent =
      'Tem certeza que deseja excluir a conta bancária "' + conta.descricao + '" (' + window.NiveloContasBancarias.bancoNome(conta) + ')? Esta ação não pode ser desfeita.';
    excluirOverlay.hidden = false;
  }
  function closeExcluirModal() { excluirOverlay.hidden = true; excluirState.codigo = null; }

  document.getElementById('excluir-dialog-close').addEventListener('click', closeExcluirModal);
  document.getElementById('excluir-dialog-cancel').addEventListener('click', closeExcluirModal);
  excluirOverlay.addEventListener('click', function (event) { if (event.target === excluirOverlay) closeExcluirModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !excluirOverlay.hidden) closeExcluirModal(); });

  document.getElementById('excluir-dialog-confirm').addEventListener('click', function () {
    var codigo = excluirState.codigo;
    var conta = window.NiveloContasBancarias.findByCodigo(codigo);
    if (!conta) return;
    var descricao = conta.descricao;
    window.NiveloContasBancarias.remove(codigo);
    closeExcluirModal();
    var row = document.getElementById('ctb-row-' + codigo);
    if (row) row.remove();
    applyFilters();
    showSuccessToast('Conta bancária excluída com sucesso', '"' + descricao + '" foi removida da listagem.');
  });

  // ---------- Ações da linha (delegado em `document`, cobre tabela E cards) ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var rowId = btn.closest('[data-row-id]') ? btn.closest('[data-row-id]').dataset.rowId : null;
    var row = rowId ? document.getElementById(rowId) : btn.closest('.tr');
    if (!row) return;
    var codigo = row.dataset.codigo;
    var conta = window.NiveloContasBancarias.findByCodigo(codigo);
    if (!conta) return;

    var action = btn.dataset.action;
    if (action === 'editar') {
      window.location.href = 'nova-conta-bancaria.html?codigo=' + encodeURIComponent(codigo);
    } else if (action === 'excluir') {
      openExcluirModal(conta);
    }
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('ctb-cards');

  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card ctb-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="ctb-mobile-card-banco text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
        '<dl class="ctb-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Descrição</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Agência</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Conta</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
        '</dl>' +
        '<div class="ctb-mobile-card-actions">' + row.children[4].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  renderInitialRows();
  applyFilters();
})();
