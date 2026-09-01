(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // categorias-financeiras.js/produtos.js/cadastros.js/estoque.js:
  // position:fixed via JS, reparentado pra document.body no primeiro hover
  // pra escapar do filter:brightness() das linhas zebradas). ----------
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
    toast.className = 'alert success catprod-toast';
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
    successMessage = sessionStorage.getItem('nivelo.novacategoriaproduto.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novacategoriaproduto.success');
  } catch (e) {}
  if (successMessage) {
    showSuccessToast(successMessage, 'A categoria já está disponível na listagem.');
  }

  // ---------- Rótulos ----------
  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  // ---------- Normalização (busca ignora acento/maiúsculas) — mesma
  // construção via String.fromCharCode já documentada em produtos.js/
  // categorias-financeiras.js/CLAUDE.md (editar o escape de diacríticos à
  // mão pode gravar os CARACTERES reais no arquivo em vez do texto do
  // escape). ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloCategoriasProdutos) — única fonte de dados. ----------
  var tbody = document.getElementById('catprod-tbody');

  // Só Ativar/Desativar (pedido explícito não inclui Editar nesta tabela) —
  // mesmo padrão exato de Categorias financeiras/Talhões em fazenda-
  // detalhe-cadastro.js.
  function buildActionsHTML(categoria) {
    var toggle = categoria.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" aria-label="' + toggle.label + '">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(categoria) {
    var statusBadge = ATIVO_BADGE[categoria.ativo ? 'ativo' : 'inativo'];
    var searchText = normalize(categoria.nome);
    return (
      '<tr class="tr" id="catprod-row-' + categoria.id + '" data-id="' + categoria.id + '" data-grupo="' + categoria.grupo + '" data-status="' + (categoria.ativo ? 'ativo' : 'inativo') + '" data-search="' + searchText + '">' +
        '<td class="td">' + categoria.nome + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(categoria) + '</td>' +
      '</tr>'
    );
  }

  function renderAllRows() {
    tbody.innerHTML = window.NiveloCategoriasProdutos.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  var emptyState = document.getElementById('catprod-empty-state');
  var emptyGlobal = document.getElementById('catprod-empty-global');
  var searchInput = document.getElementById('catprod-search-input');
  var tableCard = document.querySelector('.catprod-table-card');

  var state = {
    grupo: 'venda',
    search: ''
  };

  function rowMatches(row) {
    if (row.dataset.grupo !== state.grupo) return false;
    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }
    return true;
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var totalInGrupo = 0;
    var anyMatch = false;
    rows.forEach(function (row) {
      if (row.dataset.grupo !== state.grupo) {
        row.hidden = true;
        return;
      }
      totalInGrupo++;
      var matches = rowMatches(row);
      row.hidden = !matches;
      if (matches) anyMatch = true;
    });
    tableCard.classList.toggle('is-demo-empty', totalInGrupo === 0);
    emptyGlobal.hidden = totalInGrupo !== 0;
    emptyState.hidden = anyMatch || totalInGrupo === 0;
    renderCards();
  }

  // ---------- Ordenação das colunas ----------
  var STATUS_RANK = { ativo: 0, inativo: 1 };
  var SORTABLE_COLUMNS = {
    nome: { cellIndex: 0, type: 'text' },
    status: { cellIndex: 1, type: 'status' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('catprod-header-row');

  function sortRows() {
    if (!sortState.key) return;
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (config.type === 'status') {
        va = STATUS_RANK[a.dataset.status];
        vb = STATUS_RANK[b.dataset.status];
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
      var iconEl = th.querySelector('[data-sort-icon]');
      iconEl.innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
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

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Abas Produtos de venda/Produtos de uso — filtram a MESMA
  // tabela por `state.grupo` (mesma técnica já usada em Categorias
  // financeiras/Natureza da Operação). ----------
  var tablist = document.getElementById('catprod-tablist');

  tablist.addEventListener('click', function (event) {
    var btn = event.target.closest('.tab');
    if (!btn) return;
    var tab = btn.dataset.tab;
    if (tab === state.grupo) return;
    state.grupo = tab;
    Array.prototype.slice.call(tablist.querySelectorAll('.tab')).forEach(function (b) {
      var isActive = b.dataset.tab === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    applyFilters();
  });

  // ---------- Ativar/Desativar: ação real (não flash-disable) — altera
  // `categoria.ativo` em memória e re-renderiza, sem excluir o registro. Só
  // roda depois de confirmada no modal (mesmo padrão exato de Categorias
  // financeiras/Talhões em fazenda-detalhe-cadastro.js). ----------
  function updateRowInPlace(categoria) {
    var row = document.getElementById('catprod-row-' + categoria.id);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(categoria);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
  }

  function toggleAtivo(id) {
    var categoria = window.NiveloCategoriasProdutos.toggleAtivo(id);
    if (!categoria) return;
    updateRowInPlace(categoria);
    applyFilters();
    showSuccessToast(
      categoria.ativo ? 'Categoria ativada com sucesso.' : 'Categoria desativada com sucesso.',
      '"' + categoria.nome + '" agora está ' + (categoria.ativo ? 'ativa' : 'inativa') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleId = null;

  function openToggleAtivoDialog(id) {
    var categoria = window.NiveloCategoriasProdutos.findById(id);
    if (!categoria) return;
    pendingToggleId = id;
    if (categoria.ativo) {
      toggleTitle.textContent = 'Desativar categoria';
      toggleMessage.textContent = 'Tem certeza que deseja desativar a categoria "' + categoria.nome + '"?';
      toggleConfirmBtn.className = 'btn destructive sm';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar categoria';
      toggleMessage.textContent = 'Tem certeza que deseja ativar a categoria "' + categoria.nome + '"?';
      toggleConfirmBtn.className = 'btn primary sm';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }

  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleId = null;
  }

  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var id = pendingToggleId;
    closeToggleAtivoDialog();
    if (id) toggleAtivo(id);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  // ---------- Ações da tabela ----------
  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'ativar' || action === 'desativar') openToggleAtivoDialog(row.dataset.id);
  }

  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  // ---------- "Nova categoria" — a aba ativa vira o Grupo pré-selecionado
  // na página de cadastro (pedido explícito). ----------
  function goToNovaCategoria() {
    window.location.href = 'nova-categoria-produto.html?grupo=' + encodeURIComponent(state.grupo);
  }
  document.getElementById('new-categoria-btn').addEventListener('click', goToNovaCategoria);
  var emptyGlobalBtn = document.getElementById('catprod-empty-global-btn');
  if (emptyGlobalBtn) emptyGlobalBtn.addEventListener('click', goToNovaCategoria);

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('catprod-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var actionsHTML = row.children[2].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card catprod-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="catprod-mobile-card-info">' +
          '<span class="catprod-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</span>' +
          '<span class="text-12-regular">' + row.children[1].innerHTML + '</span>' +
        '</div>' +
        '<div class="cellActions">' + actionsHTML + '</div>' +
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

  // ---------- Boot ----------
  renderAllRows();
  applyFilters();
})();
