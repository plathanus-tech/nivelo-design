(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação da tabela ----------
  // Mesmo tooltip (Tooltip.module.css) e mesma técnica `position:fixed`
  // calculada via JS (ver `initFixedTooltip` em novo-cadastro.js) — não CSS
  // puro `:hover`, porque `.tableWrap` tem `overflow-x:auto` e um `.tip`
  // absolute seria cortado (mesmo bug já documentado da Sidebar). Delegado
  // em `document` (não um querySelectorAll na carga) porque os botões da
  // visão mobile (`.cellActions` clonado em `buildCardHTML`) são recriados
  // a cada paginação/resize.
  //
  // O `.tip` é movido pra `document.body` no primeiro hover: as linhas
  // zebradas da tabela aplicam `filter:brightness()` no `<td>` (ver
  // page-cadastros.css), e QUALQUER `filter` num ancestral vira o
  // "containing block" de um descendente `position:fixed` (spec CSS) — sem
  // mover pra `body`, o `bottom`/`left` calculados aqui (relativos à
  // viewport) ficavam relativos ao `<td>` minúsculo, jogando o balão pra
  // fora da tela. Referência de volta guardada em `btn.__tip` (propriedade
  // direta no nó, não `data-*`) porque depois de mover o `.tip` já não é
  // mais descendente do botão — `querySelector('.tip')` não o acha de novo.
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

  // ---------- Toast de sucesso ("Cadastro incluído com sucesso") ----------
  // Mesmo padrão do Dashboard (Feedback reaproveitado como Toast, ver
  // rules.md): `novo-cadastro.js` grava um flag em `sessionStorage` antes de
  // navegar de volta pra cá (mesmo mecanismo já usado no flag de sucesso do
  // fluxo de recuperação de senha). Também aceita `#state=created` via hash
  // pra poder ser demonstrado direto pelo prototype-nav sem precisar passar
  // pelo formulário inteiro primeiro.
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success cadastros-toast';
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

  var cameFromNovoCadastro = false;
  var cameFromEditCadastro = false;
  try {
    if (sessionStorage.getItem('nivelo.novocadastro.success') === '1') {
      cameFromNovoCadastro = true;
      sessionStorage.removeItem('nivelo.novocadastro.success');
    }
    if (sessionStorage.getItem('nivelo.editcadastro.success') === '1') {
      cameFromEditCadastro = true;
      sessionStorage.removeItem('nivelo.editcadastro.success');
    }
  } catch (e) {}

  var createdStateMatch = location.hash.match(/state=([a-z]+)/);
  if (cameFromNovoCadastro || (createdStateMatch && createdStateMatch[1] === 'created')) {
    showSuccessToast('Cadastro realizado com sucesso.', 'O novo cadastro já está disponível na listagem.');
  } else if (cameFromEditCadastro || (createdStateMatch && createdStateMatch[1] === 'edited')) {
    showSuccessToast('Cadastro editado com sucesso!', 'As alterações já estão disponíveis na listagem.');
  }

  // ---------- Tabela: versão final (2026-07-24) ----------
  // `.table-variant-compact` (cabeçalho compacto/uppercase + paginação) é a
  // única versão da tabela, já vem direto no HTML — as demais opções
  // testadas em rodadas anteriores foram removidas do protótipo.
  var TABLE_PAGINATION_ENABLED = true;
  var PAGE_SIZE = 10;

  // ---------- Estado vazio "nenhum cadastro" (2026-07-24) ----------
  // Variante de demonstração (`#state=empty`) pra quando o usuário ainda
  // não tem NENHUM cadastro — ver `.cadastros-table-card.is-demo-empty` em
  // page-cadastros.css. Search+filtros continuam na mesma posição/estado;
  // só a área da tabela é substituída pelo bloco centralizado.
  var isEmptyDemo = !!(createdStateMatch && createdStateMatch[1] === 'empty');
  if (isEmptyDemo) {
    document.querySelector('.cadastros-table-card').classList.add('is-demo-empty');
  }
  var emptyGlobalBtn = document.getElementById('cadastros-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () {
      window.location.href = 'novo-cadastro.html';
    });
  }

  var tbody = document.getElementById('cadastros-tbody');
  var emptyState = document.getElementById('cadastros-empty-state');
  var searchInput = document.getElementById('cadastros-search-input');
  var tablist = document.getElementById('cadastros-tablist');
  var paginationEl = document.getElementById('cad-pagination');
  var paginationInfoEl = document.getElementById('cad-pagination-info');
  var paginationPagesEl = document.getElementById('cad-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  var state = {
    tab: 'cliente',
    situacao: 'ativos',
    situacaoSince: null,
    search: '',
    sortKey: null,
    sortDir: 'asc',
    page: 1
  };

  // ---------- Normalização (busca ignora acento/maiúsculas/pontuação) ----------
  function normalize(text) {
    return (text || '')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[.\-\/]/g, '');
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function toInputValue(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }

  // ---------- Filtros ----------
  function rowMatches(row) {
    var tipos = (row.dataset.tipo || '').split(' ');
    if (tipos.indexOf(state.tab) === -1) return false;

    var situacaoMap = { ativos: 'ativo', inativos: 'inativo' };
    if (row.dataset.status !== situacaoMap[state.situacao]) return false;

    if (state.situacao !== 'ativos' && state.situacaoSince) {
      var since = row.dataset.situacaoSince;
      if (!since || since < state.situacaoSince) return false;
    }

    if (state.search) {
      var haystack = normalize(row.dataset.search);
      if (haystack.indexOf(normalize(state.search)) === -1) return false;
    }

    return true;
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    // `is-filtered-out` (não `hidden` direto): a visibilidade final de cada
    // linha também depende da PÁGINA atual (ver `applyPagination()`) quando
    // `TABLE_PAGINATION_ENABLED` — separar "não bate com o filtro" de
    // "está fora da página atual" evita as duas responsabilidades brigarem
    // pelo mesmo atributo `hidden`.
    rows.forEach(function (row) {
      row.classList.toggle('is-filtered-out', !rowMatches(row));
    });
    sortRows();
    applyPagination();
  }

  // ---------- Paginação (10 registros/página, só na variante `tablecompact`) ----------
  function applyPagination() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var matching = rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    emptyState.hidden = matching.length > 0;

    if (!TABLE_PAGINATION_ENABLED) {
      rows.forEach(function (row) { row.hidden = row.classList.contains('is-filtered-out'); });
      renderCards();
      return;
    }

    var totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;

    matching.forEach(function (row, index) {
      row.hidden = index < start || index >= end;
    });
    rows.forEach(function (row) {
      if (row.classList.contains('is-filtered-out')) row.hidden = true;
    });

    renderPaginationControls(matching.length, totalPages);
    renderCards();
  }

  function renderPaginationControls(totalCount, totalPages) {
    paginationEl.hidden = false;
    var rangeStart = totalCount === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var rangeEnd = Math.min(state.page * PAGE_SIZE, totalCount);
    // Sem travessão/meia-risca no texto (regra de conteúdo do projeto,
    // ver rules.md): "X a Y" em vez de "X–Y".
    paginationInfoEl.textContent = totalCount === 0
      ? 'Nenhum registro encontrado.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' registros';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="cad-pagination-page' + (p === state.page ? ' is-active' : '') +
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

  // ---------- Ordenação das colunas ----------
  // Só faz sentido ordenar campos que ajudam a localizar/comparar cadastros
  // (Nome, Código, Tipo, Status, Cidade); CPF/CNPJ, Contato e Ações ficam de
  // fora por não agregarem valor como critério de ordenação. "Data de
  // cadastro" não é coluna visível da tabela (só existe como dado de filtro),
  // então também não entra aqui.
  var STATUS_RANK = { ativo: 0, inativo: 1 };
  var SORTABLE_COLUMNS = {
    codigo: { cellIndex: 0, type: 'text' },
    nome: { cellIndex: 1, type: 'text-firstline' },
    tipo: { cellIndex: 4, type: 'text' },
    cidade: { cellIndex: 5, type: 'text' },
    status: { cellIndex: 6, type: 'status' }
  };

  var headerRow = document.getElementById('cadastros-header-row');

  function getSortValue(row, config) {
    if (config.type === 'status') {
      var rank = STATUS_RANK[row.dataset.status];
      return rank == null ? 99 : rank;
    }
    var cell = row.children[config.cellIndex];
    if (config.type === 'text-firstline') {
      var firstNode = cell.childNodes[0];
      var text = (firstNode && firstNode.nodeType === Node.TEXT_NODE) ? firstNode.nodeValue : cell.textContent;
      return normalize(text);
    }
    return normalize(cell.textContent);
  }

  function sortRows() {
    if (!state.sortKey) return;
    var config = SORTABLE_COLUMNS[state.sortKey];
    var dir = state.sortDir === 'asc' ? 1 : -1;
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

  function updateSortIcons() {
    Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (th) {
      var key = th.dataset.sortKey;
      var active = state.sortKey === key;
      th.setAttribute('aria-sort', active ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
      var iconName = active ? (state.sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
      var iconEl = th.querySelector('[data-sort-icon]');
      iconEl.innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
    });
    if (window.lucide) lucide.createIcons();
  }

  headerRow.addEventListener('click', function (event) {
    var th = event.target.closest('.th.sortable');
    if (!th) return;
    var key = th.dataset.sortKey;
    if (state.sortKey === key) {
      state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      state.sortKey = key;
      state.sortDir = 'asc';
    }
    updateSortIcons();
    applyFilters();
  });

  // ---------- Pesquisa ----------
  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    state.page = 1;
    applyFilters();
  });

  // ---------- Abas (Cliente / Fornecedor / Transportadora) ----------
  tablist.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    Array.prototype.slice.call(tablist.querySelectorAll('.tab')).forEach(function (t) {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tabBtn.classList.add('active');
    tabBtn.setAttribute('aria-selected', 'true');
    state.tab = tabBtn.dataset.tab;
    state.page = 1;
    applyFilters();
  });

  // ---------- Dropdown genérico (Situação) — mesmo padrão do Dashboard ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    // Menu em `position:fixed` calculado via JS (mesmo padrão duplicado em
    // novo-cadastro.js/dashboard.js) — escapa do `overflow:hidden` de
    // qualquer `.card` ancestral e nunca deixa a caixa sair da tela, ver
    // rules.md.
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

    return { selectOption: selectOption };
  }

  // ---------- Filtro de Situação + campo contextual "Inativo desde" ----------
  var SITUACAO_DATE_LABELS = { inativos: 'Inativo desde' };
  var situacaoDropdownEl = document.getElementById('dropdown-situacao');
  var situacaoDateField = document.getElementById('situacao-date-field');
  var situacaoDateLabel = document.getElementById('situacao-date-label');
  var situacaoDateInput = document.getElementById('situacao-date-input');

  function applySituacao(value) {
    state.situacao = value;
    var showDateField = value === 'inativos';
    situacaoDateField.hidden = !showDateField;
    if (showDateField) {
      situacaoDateLabel.textContent = SITUACAO_DATE_LABELS[value];
    } else {
      situacaoDateInput.value = '';
      state.situacaoSince = null;
    }
    state.page = 1;
    applyFilters();
  }

  initDropdown(situacaoDropdownEl, applySituacao);

  situacaoDateInput.addEventListener('change', function () {
    state.situacaoSince = situacaoDateInput.value || null;
    state.page = 1;
    applyFilters();
  });

  // ---------- Ações da tabela (Editar / Ativar-Desativar) ----------
  // "Editar" reaproveita o formulário de Novo Cadastro; "Ativar/Desativar"
  // substitui o antigo conceito de exclusão — o cadastro nunca é removido de
  // verdade, só troca de situação, sempre mediante confirmação.
  var STATUS_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    inativo: { status: 'warning', label: 'Inativo' }
  };

  function buildRowActionsHTML(status) {
    if (status === 'ativo') {
      return '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn actionDanger" data-action="desativar" aria-label="Desativar"><i data-lucide="ban" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Desativar</span></button>' +
        '</div>';
    }
    return '<div class="cellActions">' +
      '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
      '<button type="button" class="actionBtn" data-action="ativar" aria-label="Ativar"><i data-lucide="check-circle" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ativar</span></button>' +
      '</div>';
  }

  // Modal de confirmação (Dialog do Storybook) — mesmo padrão já usado no
  // toggle de Talhões (fazenda-detalhe-cadastro.js). Centralizado, não é
  // drawer/popover; o botão de confirmar usa o padrão visual destrutivo
  // (`.btn.destructive`) só quando a ação é Desativar.
  var toggleDialogOverlay = document.getElementById('toggle-dialog-overlay');
  var toggleDialogTitle = document.getElementById('toggle-dialog-title');
  var toggleDialogMessage = document.getElementById('toggle-dialog-message');
  var toggleDialogConfirm = document.getElementById('toggle-dialog-confirm');
  var pendingToggleRow = null;

  function openToggleDialog(row) {
    pendingToggleRow = row;
    var isAtivo = row.dataset.status === 'ativo';
    toggleDialogTitle.textContent = isAtivo ? 'Desativar cadastro' : 'Ativar cadastro';
    toggleDialogMessage.textContent = isAtivo
      ? 'Tem certeza que deseja desativar este cadastro? O cadastro continuará armazenado e poderá ser reativado a qualquer momento.'
      : 'Tem certeza que deseja ativar este cadastro?';
    toggleDialogConfirm.textContent = isAtivo ? 'Desativar' : 'Ativar';
    toggleDialogConfirm.classList.toggle('destructive', isAtivo);
    toggleDialogConfirm.classList.toggle('primary', !isAtivo);
    toggleDialogOverlay.hidden = false;
  }

  function closeToggleDialog() {
    toggleDialogOverlay.hidden = true;
    pendingToggleRow = null;
  }

  document.getElementById('toggle-dialog-close').addEventListener('click', closeToggleDialog);
  document.getElementById('toggle-dialog-cancel').addEventListener('click', closeToggleDialog);

  toggleDialogOverlay.addEventListener('click', function (event) {
    if (event.target === toggleDialogOverlay) closeToggleDialog();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleDialogOverlay.hidden) closeToggleDialog();
  });

  toggleDialogConfirm.addEventListener('click', function () {
    if (!pendingToggleRow) return;
    var row = pendingToggleRow;
    var newStatus = row.dataset.status === 'ativo' ? 'inativo' : 'ativo';
    row.dataset.status = newStatus;
    if (newStatus === 'inativo') {
      row.dataset.situacaoSince = toInputValue(new Date());
    } else {
      delete row.dataset.situacaoSince;
    }
    var badge = STATUS_BADGE[newStatus];
    row.children[6].innerHTML = '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';
    row.children[7].innerHTML = buildRowActionsHTML(newStatus);
    if (window.lucide) lucide.createIcons();
    closeToggleDialog();
    applyFilters();
  });

  // Handler compartilhado entre a tabela (desktop) e os Cards (mobile) —
  // ambos disparam a MESMA ação sobre a MESMA linha real da tabela (única
  // fonte de dados), nunca duas cópias de estado divergentes.
  // ---------- Editar cadastro ----------
  // Reaproveita a MESMA tela de Novo Cadastro (mesma estrutura/componentes,
  // só o título e os valores pré-preenchidos mudam) em vez de duplicar o
  // formulário inteiro num arquivo à parte. Os dados da linha selecionada
  // atravessam pra lá via `sessionStorage` (mesmo mecanismo já usado pro
  // flag de sucesso do fluxo de recuperação de senha e pro toast de "Cadastro
  // incluído com sucesso") — não dá pra usar hash/query aqui, o payload tem
  // endereço/veículos/placas inteiros, não cabe numa URL.
  function openEditScreen(row) {
    var record = {};
    try { record = JSON.parse(row.dataset.record || '{}'); } catch (e) {}

    // Tipo agora é multi-seleção no formulário (round 2026-08-03) — os
    // tipos da linha atravessam todos juntos, sem mais precisar priorizar
    // um único valor "representativo".
    var tipos = (row.dataset.tipo || '').split(' ').filter(Boolean);

    var nomeCell = row.children[1];
    var firstNode = nomeCell.childNodes[0];
    var nome = (firstNode && firstNode.nodeType === Node.TEXT_NODE) ? firstNode.nodeValue.trim() : nomeCell.textContent.trim();
    var fantasiaEl = nomeCell.querySelector('.cadastros-fantasia');
    var fantasia = fantasiaEl ? fantasiaEl.textContent.trim() : '';

    var documento = cellText(row.children[2]);
    var pessoaTipo = documento.indexOf('/') !== -1 ? 'juridica' : 'fisica';

    var cidadeParts = cellText(row.children[5]).split('/');
    var cidade = cidadeParts[0] || '';
    var estadoFromCell = cidadeParts[1] || '';

    var payload = {
      codigo: cellText(row.children[0]),
      nome: nome,
      fantasia: fantasia,
      tipo: tipos,
      pessoaTipo: pessoaTipo,
      documento: documento,
      ie: record.ie || '',
      contribuinte: record.contribuinte || '',
      telefone: record.telefone || '',
      email: record.email || '',
      cep: record.cep || '',
      rua: record.rua || '',
      numero: record.numero || '',
      complemento: record.complemento || '',
      bairro: record.bairro || '',
      cidade: cidade,
      estado: record.estadoUf || estadoFromCell,
      vehicles: record.vehicles || []
    };

    try { sessionStorage.setItem('nivelo.editcadastro.data', JSON.stringify(payload)); } catch (e) {}
    window.location.href = 'novo-cadastro.html#state=edit';
  }

  function handleRowAction(btn, row) {
    var action = btn.dataset.action;

    if (action === 'ativar' || action === 'desativar') {
      openToggleDialog(row);
      return;
    }

    if (action === 'editar') {
      openEditScreen(row);
      return;
    }

    btn.disabled = true;
    window.setTimeout(function () { btn.disabled = false; }, 300);
  }

  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn, btn.closest('.tr'));
  });

  document.getElementById('add-cadastro-btn').addEventListener('click', function () {
    window.location.href = 'novo-cadastro.html';
  });

  // ---------- Cards (Mobile) ----------
  // No mobile, comprimir a tabela inteira fica ilegível — cada cadastro
  // vira um Card (reaproveita `.card` do Table.module.css). Gerado via JS a
  // partir das linhas REAIS e já filtradas/ordenadas da tabela (nunca uma
  // segunda cópia dos dados), então fica sempre em sincronia com
  // busca/filtros/ordenação/soft delete sem esforço extra.
  var cardsContainer = document.getElementById('cadastros-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var nomeCell = row.children[1];
    var firstNode = nomeCell.childNodes[0];
    var nome = (firstNode && firstNode.nodeType === Node.TEXT_NODE) ? firstNode.nodeValue.trim() : nomeCell.textContent.trim();
    var fantasiaEl = nomeCell.querySelector('.cadastros-fantasia');
    var fantasiaHTML = fantasiaEl ? fantasiaEl.outerHTML : '';
    var statusHTML = row.children[6].innerHTML;
    var actionsHTML = row.children[7].querySelector('.cellActions').innerHTML;

    return (
      '<div class="card cadastros-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="cadastros-mobile-card-header">' +
          '<div class="cadastros-mobile-card-name text-subtitle-s">' + nome + fantasiaHTML + '</div>' +
          statusHTML +
        '</div>' +
        '<dl class="cadastros-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Código</dt><dd class="text-12-regular">' + cellText(row.children[0]) + '</dd></div>' +
          '<div><dt class="text-10-regular">CPF/CNPJ</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Telefone</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Tipo</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Cidade</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions cadastros-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
  }

  cardsContainer.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var cardEl = btn.closest('[data-row-id]');
    var row = document.getElementById(cardEl.dataset.rowId);
    handleRowAction(btn, row);
  });

  // Tooltip nativo (`title`) na coluna CPF/CNPJ: fallback do ellipsis
  // quando o valor não cabe numa linha só (ver `.table-variant-compact
  // .td:nth-child(5)` em page-cadastros.css — prioridade é sempre mostrar
  // o valor inteiro numa linha, ellipsis+tooltip só quando realmente não
  // couber). Conteúdo é estático por linha, então só precisa rodar uma vez
  // no carregamento, não a cada `applyFilters()`.
  Array.prototype.slice.call(tbody.querySelectorAll('.tr')).forEach(function (row) {
    var docCell = row.children[2];
    if (docCell) docCell.title = docCell.textContent.trim();
  });

  applyFilters();
})();
