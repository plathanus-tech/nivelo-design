(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // categorias-financeiras.js/produtos.js: position:fixed via JS,
  // reparentado pra document.body no primeiro hover). ----------
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
    toast.className = 'alert success unidmed-toast';
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

  var cameFromForm = false;
  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novaunidade.success') || '';
    if (successMessage) {
      cameFromForm = true;
      sessionStorage.removeItem('nivelo.novaunidade.success');
    }
  } catch (e) {}
  if (cameFromForm) {
    showSuccessToast(successMessage, 'A unidade já está disponível na listagem.');
  }

  // ---------- Renderiza a tabela a partir do catálogo central
  // (window.NiveloUnidadesMedida) — única fonte de dados. ----------
  var tbody = document.getElementById('unidmed-tbody');

  var ATIVO_BADGE = {
    ativo: { status: 'success', label: 'Ativa' },
    inativo: { status: 'warning', label: 'Inativa' }
  };

  function formatCorrespondeA(unidade) {
    var n = unidade.correspondeA;
    var text = (Math.round(n * 100) / 100).toString().replace('.', ',');
    return text;
  }

  function unidadeBaseLabel(unidade) {
    var base = window.NiveloUnidadesMedida.findBySigla(unidade.unidadeBaseSigla);
    return base ? (base.sigla + ' — ' + base.nome) : unidade.unidadeBaseSigla;
  }

  // Editar (sempre, exceto unidades "sistema") + Ativar/Desativar (idem) —
  // unidades padrão do sistema (KG/LT/UN) não podem ser excluídas, editadas
  // nem desativadas: a coluna Ações mostra só um rótulo "Padrão do sistema"
  // pra deixar isso explícito, em vez de botões que não fariam nada.
  function buildActionsHTML(unidade) {
    if (unidade.sistema) {
      return '<span class="unidmed-sistema-tag text-body-xs">Padrão do sistema</span>';
    }
    var toggle = unidade.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" aria-label="' + toggle.label + '">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(unidade) {
    var statusBadge = ATIVO_BADGE[unidade.ativo ? 'ativo' : 'inativo'];
    return (
      '<tr class="tr" id="unidmed-row-' + unidade.sigla + '" data-sigla="' + unidade.sigla + '" data-status="' + (unidade.ativo ? 'ativo' : 'inativo') + '">' +
        '<td class="td">' + unidade.sigla + '</td>' +
        '<td class="td">' + unidade.nome + '</td>' +
        '<td class="td">' + formatCorrespondeA(unidade) + '</td>' +
        '<td class="td">' + unidadeBaseLabel(unidade) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(unidade) + '</td>' +
      '</tr>'
    );
  }

  function renderRows() {
    tbody.innerHTML = window.NiveloUnidadesMedida.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
    renderCards();
  }

  // ---------- Ordenação das colunas ----------
  var STATUS_RANK = { ativo: 0, inativo: 1 };
  var SORTABLE_COLUMNS = {
    sigla: { cellIndex: 0, type: 'text' },
    nome: { cellIndex: 1, type: 'text' },
    status: { cellIndex: 4, type: 'status' }
  };
  var sortState = { key: null, dir: 'asc' };
  var headerRow = document.getElementById('unidmed-header-row');

  // Mesma construção via String.fromCharCode já documentada em produtos.js/
  // categorias-financeiras.js/CLAUDE.md — digitar o escape de diacríticos à
  // mão pode gravar os CARACTERES reais no arquivo em vez do texto do escape.
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

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
    renderCards();
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
  });

  // ---------- Ativar/Desativar: ação real, com confirmação (mesmo padrão
  // exato de Categorias de receitas e despesas). ----------
  function updateRowInPlace(unidade) {
    var row = document.getElementById('unidmed-row-' + unidade.sigla);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(unidade);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
    renderCards();
  }

  function toggleAtivo(sigla) {
    var unidade = window.NiveloUnidadesMedida.toggleAtivo(sigla);
    if (!unidade) return;
    updateRowInPlace(unidade);
    showSuccessToast(
      unidade.ativo ? 'Unidade de medida ativada com sucesso.' : 'Unidade de medida desativada com sucesso.',
      '"' + unidade.nome + '" agora está ' + (unidade.ativo ? 'ativa' : 'inativa') + '.'
    );
  }

  var toggleOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleTitle = document.getElementById('toggle-dialog-title');
  var toggleMessage = document.getElementById('toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('toggle-dialog-confirm');
  var pendingToggleSigla = null;

  function openToggleAtivoDialog(sigla) {
    var unidade = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!unidade || unidade.sistema) return;
    pendingToggleSigla = sigla;
    if (unidade.ativo) {
      toggleTitle.textContent = 'Desativar unidade de medida';
      toggleMessage.textContent = 'Tem certeza que deseja desativar a unidade "' + unidade.nome + '" (' + unidade.sigla + ')?';
      toggleConfirmBtn.className = 'btn destructive';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar unidade de medida';
      toggleMessage.textContent = 'Tem certeza que deseja ativar a unidade "' + unidade.nome + '" (' + unidade.sigla + ')?';
      toggleConfirmBtn.className = 'btn primary';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }

  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleSigla = null;
  }

  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var sigla = pendingToggleSigla;
    closeToggleAtivoDialog();
    if (sigla) toggleAtivo(sigla);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  // ---------- Ações da tabela ----------
  function openEditScreen(row) {
    window.location.href = 'nova-unidade-medida.html?sigla=' + encodeURIComponent(row.dataset.sigla);
  }

  function handleRowAction(btn, row) {
    var action = btn.dataset.action;
    if (action === 'editar') openEditScreen(row);
    else if (action === 'ativar' || action === 'desativar') openToggleAtivoDialog(row.dataset.sigla);
  }

  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  document.getElementById('new-unidade-btn').addEventListener('click', function () {
    window.location.href = 'nova-unidade-medida.html';
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('unidmed-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var actionsCell = row.children[5];
    var actionsHTML = actionsCell.querySelector('.cellActions') ? actionsCell.querySelector('.cellActions').innerHTML : actionsCell.innerHTML;
    return (
      '<div class="card unidmed-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="unidmed-mobile-card-header">' +
          '<div class="unidmed-mobile-card-name text-subtitle-s">' + cellText(row.children[1]) + '</div>' +
          '<span class="unidmed-mobile-card-sigla text-body-xs">' + cellText(row.children[0]) + '</span>' +
        '</div>' +
        '<dl class="unidmed-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Corresponde a</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Unidade base</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[4].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="unidmed-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
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

  renderRows();
})();
