(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // produtos.js/cadastros.js/estoque.js). ----------
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
    toast.className = 'alert success produtos-toast';
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

  var cameFromNovoProduto = false;
  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novoproduto.success') || '';
    if (successMessage) {
      cameFromNovoProduto = true;
      sessionStorage.removeItem('nivelo.novoproduto.success');
    }
  } catch (e) {}

  var stateMatch = location.hash.match(/state=([a-z]+)/);
  if (cameFromNovoProduto) {
    showSuccessToast(successMessage, 'O produto já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'created') {
    showSuccessToast('Produto cadastrado com sucesso.', 'O novo produto já está disponível na listagem.');
  } else if (stateMatch && stateMatch[1] === 'edited') {
    showSuccessToast('Produto editado com sucesso.', 'As alterações já estão disponíveis na listagem.');
  }

  var isEmptyDemo = !!(stateMatch && stateMatch[1] === 'empty');
  var emptyGlobalEl = document.getElementById('produtos-empty-global');
  var emptyGlobalBtn = document.getElementById('produtos-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'novo-produto-v2.html';
    });
  }

  // ---------- Normalização ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(DIACRITICS_RE, '')
      .replace(/[.\-\/]/g, '');
  }

  var STATUS_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  // ---------- Unidade de medida: exibir sempre de acordo com o que está
  // cadastrado em Configuração > Unidade de medida (ex. "Saca — 60 KG"),
  // nunca só a sigla crua salva no produto. ----------
  function formatUnidadeMedida(sigla) {
    if (!sigla) return '—';
    var unidade = window.NiveloUnidadesMedida && window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!unidade) return sigla;
    return unidade.nome + ' — ' + unidade.correspondeA + ' ' + unidade.unidadeBaseSigla;
  }

  // Estoque mínimo/máximo mostrados com a sigla da unidade de medida do
  // próprio produto ao lado (ex. "200sc"), nunca um número solto sem
  // contexto de unidade.
  function formatQtdComUnidade(qtd, sigla) {
    if (qtd == null) return '—';
    var suffix = sigla ? sigla.toLowerCase() : '';
    return qtd + suffix;
  }

  // ---------- Tabs ----------
  var tablist = document.getElementById('produtos-tablist');
  var panels = {
    venda: document.getElementById('panel-venda'),
    uso: document.getElementById('panel-uso')
  };
  var activeTab = 'venda';

  tablist.addEventListener('click', function (event) {
    var btn = event.target.closest('.tab');
    if (!btn) return;
    var tab = btn.dataset.tab;
    if (tab === activeTab) return;
    activeTab = tab;
    Array.prototype.forEach.call(tablist.querySelectorAll('.tab'), function (b) {
      var isActive = b.dataset.tab === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    Object.keys(panels).forEach(function (key) { panels[key].hidden = key !== tab; });
    state.page = 1;
    applyFilters();
  });

  // ---------- Renderiza as tabelas a partir do catálogo central ----------
  var tbodyByTipo = {
    venda: document.getElementById('produtos-tbody-venda'),
    uso: document.getElementById('produtos-tbody-uso')
  };
  var cardsByTipo = {
    venda: document.getElementById('produtos-cards-venda'),
    uso: document.getElementById('produtos-cards-uso')
  };
  var emptyByTipo = {
    venda: document.querySelector('.produtos-empty[data-empty-for="venda"]'),
    uso: document.querySelector('.produtos-empty[data-empty-for="uso"]')
  };

  function actionsHTML(sku, ativo) {
    var toggleIcon = ativo ? 'ban' : 'check-circle';
    var toggleLabel = ativo ? 'Desativar' : 'Ativar';
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" data-sku="' + sku + '" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn" data-action="toggle" data-sku="' + sku + '" aria-label="' + toggleLabel + '"><i data-lucide="' + toggleIcon + '" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>' + toggleLabel + '</span></button>' +
      '</div>'
    );
  }

  function buildRowHTML(product) {
    var ativo = product.ativo !== false;
    var badge = STATUS_BADGE[ativo ? 'ativo' : 'inativo'];
    var statusHTML = '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';
    var searchText = normalize(product.nome + ' ' + product.sku + ' ' + (product.codigoReferencia || ''));
    var qtdMin = formatQtdComUnidade(product.qtdMinima, product.unidadeMedida);
    var qtdMax = formatQtdComUnidade(product.qtdMaxima, product.unidadeMedida);
    var unidadeLabel = formatUnidadeMedida(product.unidadeMedida);
    var commonAttrs = 'id="prod-row-' + product.sku + '" data-sku="' + product.sku + '" data-ativo="' + (ativo ? '1' : '0') + '" data-categoria="' + (product.categoria || '') + '" data-atualizado="' + (product.atualizadoEm || '') + '" data-search="' + searchText + '"';

    if (product.tipoProduto === 'uso') {
      return (
        '<tr class="tr" ' + commonAttrs + '>' +
          '<td class="td">' + product.sku + '</td>' +
          '<td class="td">' + product.nome + '</td>' +
          '<td class="td">' + unidadeLabel + '</td>' +
          '<td class="td">' + qtdMin + '</td>' +
          '<td class="td">' + qtdMax + '</td>' +
          '<td class="td">' + statusHTML + '</td>' +
          '<td class="td tdActions">' + actionsHTML(product.sku, ativo) + '</td>' +
        '</tr>'
      );
    }

    return (
      '<tr class="tr" ' + commonAttrs + '>' +
        '<td class="td">' + product.sku + '</td>' +
        '<td class="td">' + product.nome + '</td>' +
        '<td class="td">' + unidadeLabel + '</td>' +
        '<td class="td">' + (product.ncm || '—') + '</td>' +
        '<td class="td">' + (product.gtin || '—') + '</td>' +
        '<td class="td">' + qtdMin + '</td>' +
        '<td class="td">' + qtdMax + '</td>' +
        '<td class="td">' + statusHTML + '</td>' +
        '<td class="td tdActions">' + actionsHTML(product.sku, ativo) + '</td>' +
      '</tr>'
    );
  }

  function renderInitialRows() {
    var all = window.NiveloProdutos.list();
    var byTipo = { venda: [], uso: [] };
    all.forEach(function (p) {
      var tipo = p.tipoProduto === 'uso' ? 'uso' : 'venda';
      byTipo[tipo].push(p);
    });
    tbodyByTipo.venda.innerHTML = byTipo.venda.map(buildRowHTML).join('');
    tbodyByTipo.uso.innerHTML = byTipo.uso.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();

    if (all.length === 0) {
      document.querySelector('.produtos-tabs').hidden = true;
      document.querySelector('.produtos-list-card').hidden = true;
      emptyGlobalEl.hidden = false;
    }
  }
  renderInitialRows();

  var searchInput = document.getElementById('produtos-search-input');

  var state = {
    status: '',
    categoria: '',
    atualizadoDesde: null,
    search: '',
    sortKey: {},
    sortDir: {},
    page: 1
  };

  function rowMatches(row) {
    if (state.status) {
      var ativo = row.dataset.ativo === '1';
      if (state.status === 'ativo' && !ativo) return false;
      if (state.status === 'inativo' && ativo) return false;
    }
    if (state.categoria && row.dataset.categoria !== state.categoria) return false;

    if (state.atualizadoDesde) {
      var atualizado = row.dataset.atualizado;
      if (!atualizado || atualizado < state.atualizadoDesde) return false;
    }

    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }

    return true;
  }

  function applyFilters() {
    ['venda', 'uso'].forEach(function (tipo) {
      var tbody = tbodyByTipo[tipo];
      var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
      rows.forEach(function (row) {
        var matches = rowMatches(row);
        row.hidden = !matches;
      });
      sortRows(tipo);
      var visibleCount = rows.filter(function (row) { return !row.hidden; }).length;
      emptyByTipo[tipo].hidden = visibleCount > 0;
      renderCards(tipo);
    });
  }

  // ---------- Ordenação (por painel: SKU, Produto) ----------
  var SORTABLE_COLUMNS = { sku: { cellIndex: 0, type: 'text' }, nome: { cellIndex: 1, type: 'text' } };

  function getSortValue(row, config) {
    var cell = row.children[config.cellIndex];
    return normalize(cell.textContent);
  }

  function sortRows(tipo) {
    var key = state.sortKey[tipo];
    if (!key) return;
    var config = SORTABLE_COLUMNS[key];
    var dir = state.sortDir[tipo] === 'asc' ? 1 : -1;
    var tbody = tbodyByTipo[tipo];
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va = getSortValue(a, config);
      var vb = getSortValue(b, config);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  function updateSortIcons(tipo, headerRow) {
    Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (th) {
      var key = th.dataset.sortKey;
      var active = state.sortKey[tipo] === key;
      th.setAttribute('aria-sort', active ? (state.sortDir[tipo] === 'asc' ? 'ascending' : 'descending') : 'none');
      var iconName = active ? (state.sortDir[tipo] === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
      var iconEl = th.querySelector('[data-sort-icon]');
      iconEl.innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
    });
    if (window.lucide) lucide.createIcons();
  }

  ['venda', 'uso'].forEach(function (tipo) {
    var headerRow = document.getElementById('produtos-header-row-' + tipo);
    headerRow.addEventListener('click', function (event) {
      var th = event.target.closest('.th.sortable');
      if (!th) return;
      var key = th.dataset.sortKey;
      if (state.sortKey[tipo] === key) {
        state.sortDir[tipo] = state.sortDir[tipo] === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey[tipo] = key;
        state.sortDir[tipo] = 'asc';
      }
      updateSortIcons(tipo, headerRow);
      applyFilters();
    });
  });

  // ---------- Pesquisa ----------
  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    applyFilters();
  });

  // ---------- Dropdown genérico ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceAbove) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
      }
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
      var existingOptions = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existingOptions.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
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

  var categoriaMenuEl = document.getElementById('dropdown-categoria-menu');
  window.NiveloCategorias.list().forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria;
    optionEl.textContent = categoria;
    categoriaMenuEl.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(document.getElementById('dropdown-categoria'));

  var filtrosPopoverEl = document.getElementById('produtos-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('produtos-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('produtos-filtros-trigger');

  function positionFiltrosPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(320, window.innerWidth - margin * 2);
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

  document.getElementById('produtos-filtros-aplicar').addEventListener('click', function () {
    state.status = document.getElementById('dropdown-status').dataset.value || '';
    state.categoria = document.getElementById('dropdown-categoria').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });

  document.getElementById('produtos-filtros-limpar').addEventListener('click', function () {
    statusDropdown.reset('', 'Todos os status');
    categoriaDropdown.reset('', 'Todas as categorias');
    state.status = '';
    state.categoria = '';
    applyFilters();
  });

  window.NiveloDatePicker.initDay({
    rootId: 'atualizado-filter',
    triggerId: 'atualizado-trigger',
    valueId: 'atualizado-value',
    clearId: 'atualizado-clear',
    popoverId: 'atualizado-popover',
    placeholder: 'Atualizado a partir de',
    formatValue: function (date) {
      var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
      return 'Atualizado a partir de ' + pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear();
    },
    onChange: function (iso) {
      state.atualizadoDesde = iso;
      applyFilters();
    }
  });

  // ---------- Ações da tabela: Editar + Ativar/Desativar (com confirmação,
  // mesmo padrão de Categorias/Talhões/Natureza da Operação). ----------
  var toggleOverlay = document.getElementById('toggle-ativo-overlay');
  var toggleTitle = document.getElementById('toggle-ativo-title');
  var toggleMessage = document.getElementById('toggle-ativo-message');
  var toggleConfirmBtn = document.getElementById('toggle-ativo-confirm');
  var pendingToggleSku = null;

  function openToggleDialog(sku) {
    var product = window.NiveloProdutos.findBySku(sku);
    if (!product) return;
    pendingToggleSku = sku;
    var ativo = product.ativo !== false;
    if (ativo) {
      toggleTitle.textContent = 'Desativar produto';
      toggleMessage.textContent = 'Tem certeza que deseja desativar "' + product.nome + '"? O produto deixará de aparecer em novos lançamentos até ser reativado.';
      toggleConfirmBtn.textContent = 'Desativar';
      toggleConfirmBtn.className = 'btn destructive';
    } else {
      toggleTitle.textContent = 'Ativar produto';
      toggleMessage.textContent = 'Tem certeza que deseja ativar "' + product.nome + '" novamente?';
      toggleConfirmBtn.textContent = 'Ativar';
      toggleConfirmBtn.className = 'btn primary';
    }
    toggleOverlay.hidden = false;
  }
  function closeToggleDialog() {
    toggleOverlay.hidden = true;
    pendingToggleSku = null;
  }
  document.getElementById('toggle-ativo-close').addEventListener('click', closeToggleDialog);
  document.getElementById('toggle-ativo-cancel').addEventListener('click', closeToggleDialog);
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleDialog();
  });
  toggleConfirmBtn.addEventListener('click', function () {
    if (!pendingToggleSku) return;
    var product = window.NiveloProdutos.toggleAtivo(pendingToggleSku);
    closeToggleDialog();
    if (!product) return;
    renderInitialRows();
    applyFilters();
    showSuccessToast(
      product.ativo ? 'Produto ativado com sucesso.' : 'Produto desativado com sucesso.',
      product.nome
    );
  });

  function openEditScreen(sku) {
    window.location.href = 'novo-produto-v2.html?sku=' + encodeURIComponent(sku);
  }

  function handleRowAction(btn) {
    var action = btn.dataset.action;
    var sku = btn.dataset.sku;
    if (action === 'editar') openEditScreen(sku);
    else if (action === 'toggle') openToggleDialog(sku);
  }

  ['venda', 'uso'].forEach(function (tipo) {
    tbodyByTipo[tipo].addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      handleRowAction(btn);
    });
    cardsByTipo[tipo].addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      handleRowAction(btn);
    });
  });

  document.getElementById('new-produto-btn').addEventListener('click', function () {
    window.location.href = 'novo-produto-v2.html';
  });

  // ---------- Cards (Mobile) ----------
  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row, tipo) {
    var ativo = row.dataset.ativo === '1';
    var badge = STATUS_BADGE[ativo ? 'ativo' : 'inativo'];
    var actionsIndex = tipo === 'uso' ? 6 : 8;
    var actionsHTML2 = row.children[actionsIndex].querySelector('.cellActions').innerHTML;
    var fieldsHTML = tipo === 'uso'
      ? (
        '<div><dt class="text-10-regular">Unidade de medida</dt><dd class="text-12-regular">' + (cellText(row.children[2]) || '—') + '</dd></div>' +
        '<div><dt class="text-10-regular">Estoque mínimo</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
        '<div><dt class="text-10-regular">Estoque máximo</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>'
      )
      : (
        '<div><dt class="text-10-regular">Unidade de medida</dt><dd class="text-12-regular">' + (cellText(row.children[2]) || '—') + '</dd></div>' +
        '<div><dt class="text-10-regular">NCM</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
        '<div><dt class="text-10-regular">GTIN/EAN</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
        '<div><dt class="text-10-regular">Estoque mínimo</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
        '<div><dt class="text-10-regular">Estoque máximo</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>'
      );

    return (
      '<div class="card produtos-mobile-card" data-row-id="' + row.id + '" data-tipo-cards="' + tipo + '">' +
        '<div class="produtos-mobile-card-header">' +
          '<div class="produtos-mobile-card-name text-subtitle-s">' + row.dataset.sku + ' · ' + cellText(row.children[1]) + '</div>' +
          '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
        '</div>' +
        '<dl class="produtos-mobile-card-fields">' + fieldsHTML + '</dl>' +
        '<div class="cellActions produtos-mobile-card-actions">' + actionsHTML2 + '</div>' +
      '</div>'
    );
  }

  function renderCards(tipo) {
    var rows = Array.prototype.slice.call(tbodyByTipo[tipo].querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsByTipo[tipo].innerHTML = rows.map(function (row) { return buildCardHTML(row, tipo); }).join('');
    if (window.lucide) lucide.createIcons();
  }

  applyFilters();
})();
