(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var SITUACAO_BADGE = {
    teste: { status: 'info', label: 'Em teste' },
    assinante: { status: 'success', label: 'Assinante' },
    suspenso: { status: 'warning', label: 'Suspenso' },
    cancelado: { status: 'error', label: 'Cancelado' }
  };
  var ACESSO_BADGE = {
    ativo: { status: 'success', label: 'Ativo' },
    bloqueado: { status: 'error', label: 'Bloqueado' }
  };

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }

  function formatDateBR(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatDateTimeBR(iso) {
    if (!iso) return '—';
    var datePart = iso.split('T')[0];
    var timePart = (iso.split('T')[1] || '').slice(0, 5);
    return formatDateBR(datePart) + (timePart ? ' às ' + timePart : '');
  }
  function formatTokens(qtd) { return qtd.toLocaleString('pt-BR') + ' tokens'; }
  function formatBRL(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }

  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success assn-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
        '<div class="title">' + title + '</div>' +
        (message ? '<div class="message">' + message + '</div>' : '') +
      '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  var tbody = document.getElementById('assn-tbody');

  function buildActionsHTML(assinante) {
    return (
      '<div class="cellActions">' +
        '<a class="actionBtn" data-action="visualizar" href="assinante-detalhe.html#id=' + assinante.id + '" aria-label="Visualizar">' +
          '<i data-lucide="eye" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Visualizar</span>' +
        '</a>' +
        (assinante.acesso === 'bloqueado'
          ? '<button type="button" class="actionBtn" data-action="liberar" data-id="' + assinante.id + '" aria-label="Desbloquear">' +
              '<i data-lucide="unlock" width="16" height="16"></i>' +
              '<span class="tip text-body-xs top"><span class="arrow"></span>Desbloquear</span>' +
            '</button>'
          : '<button type="button" class="actionBtn" data-action="bloquear" data-id="' + assinante.id + '" aria-label="Bloquear">' +
              '<i data-lucide="lock" width="16" height="16"></i>' +
              '<span class="tip text-body-xs top"><span class="arrow"></span>Bloquear</span>' +
            '</button>') +
        '<button type="button" class="actionBtn" data-action="mais" data-id="' + assinante.id + '" aria-label="Mais ações">' +
          '<i data-lucide="more-vertical" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Mais ações</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildSituacaoTesteHTML(assinante) {
    if (assinante.situacao !== 'teste' || !assinante.trial) return '<span class="assn-tokens">—</span>';
    var dias = window.NiveloAssinantes.diasRestantesTeste(assinante);
    return '<span class="assn-tokens">Em teste · ' + dias + (dias === 1 ? ' dia restante' : ' dias restantes') + '</span>';
  }

  // ---------- Faixas usadas pelos filtros de Acesso recente/Próximo vencimento/Período de
  // teste — as mesmas faixas exibidas no bloco "Requer atenção" do Dashboard, calculadas uma
  // vez na montagem da linha e guardadas em `data-*` (mesmo padrão de `data-plano`/`data-situacao`). ----------
  function faixaAcessoRecente(assinante) {
    if (!assinante.ultimoAcesso) return 'antigo';
    var dias = Math.abs(window.NiveloAssinantes.diffDias(window.NiveloAssinantes.TODAY, assinante.ultimoAcesso.slice(0, 10)));
    return dias <= 14 ? 'recente' : 'antigo';
  }
  function faixaVencimento(assinante) {
    if (assinante.formaContratacao !== 'anual' || !assinante.dataVencimento) return '';
    var dias = window.NiveloAssinantes.diffDias(assinante.dataVencimento, window.NiveloAssinantes.TODAY);
    if (dias < 0) return '';
    if (dias <= 7) return 'until7';
    if (dias <= 15) return '8to15';
    if (dias <= 30) return '16to30';
    return 'over30';
  }
  function faixaTeste(assinante) {
    if (assinante.situacao !== 'teste' || !assinante.trial) return '';
    var dias = window.NiveloAssinantes.diasRestantesTeste(assinante);
    if (dias <= 3) return 'until3';
    if (dias <= 7) return '4to7';
    if (dias <= 14) return '8to14';
    return 'over14';
  }

  function buildRowHTML(assinante) {
    var plano = window.NiveloAssinantes.plano(assinante);
    var situacaoBadge = SITUACAO_BADGE[assinante.situacao];
    var acessoBadge = ACESSO_BADGE[assinante.acesso];
    var searchText = normalize(assinante.nome + ' ' + assinante.email);
    return (
      '<tr class="tr" id="assn-row-' + assinante.id + '" data-id="' + assinante.id + '" data-plano="' + assinante.planoId + '" data-situacao="' + assinante.situacao + '"' +
        ' data-acesso="' + assinante.acesso + '" data-acesso-recente="' + faixaAcessoRecente(assinante) + '" data-vencimento="' + faixaVencimento(assinante) + '"' +
        ' data-periodicidade="' + (assinante.formaContratacao || '') + '" data-teste="' + faixaTeste(assinante) + '"' +
        ' data-search="' + searchText + '">' +
        '<td class="td"><span class="assn-cliente-nome text-body-s">' + assinante.nome + '</span><span class="assn-cliente-email text-body-xs">' + assinante.email + '</span></td>' +
        '<td class="td">' + (plano ? plano.nome : '—') + '</td>' +
        '<td class="td"><span class="badge" data-status="' + situacaoBadge.status + '"><span class="badgeDot"></span>' + situacaoBadge.label + '</span></td>' +
        '<td class="td"><span class="badge" data-status="' + acessoBadge.status + '"><span class="badgeDot"></span>' + acessoBadge.label + '</span></td>' +
        '<td class="td">' + formatDateBR(assinante.dataInicioAssinatura) + '</td>' +
        '<td class="td">' + formatDateBR(assinante.dataVencimento) + '</td>' +
        '<td class="td">' + buildSituacaoTesteHTML(assinante) + '</td>' +
        '<td class="td"><span class="assn-tokens">' + formatTokens(assinante.tokensConsumidos) + '</span></td>' +
        '<td class="td">' + formatDateTimeBR(assinante.ultimoAcesso) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(assinante) + '</td>' +
      '</tr>'
    );
  }

  function updateRowInPlace(assinante) {
    var row = document.getElementById('assn-row-' + assinante.id);
    if (!row) return;
    var fresh = document.createElement('tbody');
    fresh.innerHTML = buildRowHTML(assinante);
    row.replaceWith(fresh.firstElementChild);
    if (window.lucide) lucide.createIcons();
    applyFilters();
  }

  function renderInitialRows() {
    tbody.innerHTML = window.NiveloAssinantes.list().map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  var emptyState = document.getElementById('assn-empty-state');
  var searchInput = document.getElementById('assn-search-input');

  var state = {
    plano: '', situacao: '', search: '',
    acesso: '', acessoRecente: '', vencimento: '', periodicidade: '', teste: ''
  };

  function rowMatches(row) {
    if (state.plano && row.dataset.plano !== state.plano) return false;
    if (state.situacao && row.dataset.situacao !== state.situacao) return false;
    if (state.acesso && row.dataset.acesso !== state.acesso) return false;
    if (state.acessoRecente && row.dataset.acessoRecente !== state.acessoRecente) return false;
    if (state.vencimento && row.dataset.vencimento !== state.vencimento) return false;
    if (state.periodicidade && row.dataset.periodicidade !== state.periodicidade) return false;
    if (state.teste && row.dataset.teste !== state.teste) return false;
    if (state.search && row.dataset.search.indexOf(normalize(state.search)) === -1) return false;
    return true;
  }

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var anyMatch = false;
    rows.forEach(function (row) {
      var matches = rowMatches(row);
      row.hidden = !matches;
      if (matches) anyMatch = true;
    });
    emptyState.hidden = anyMatch || rows.length === 0;
    renderCards();
  }

  searchInput.addEventListener('input', function () { state.search = searchInput.value; applyFilters(); });

  // ---------- Dropdown genérico ----------
  function initDropdown(root) {
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
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (root.__onChange) root.__onChange(optionEl.dataset.value);
    }
    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (event) { var o = event.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    function onChange(fn) { root.__onChange = fn; }
    return { selectOption: selectOption, reset: reset, onChange: onChange };
  }

  var planoDropdown = initDropdown(document.getElementById('dropdown-plano'));
  var situacaoDropdown = initDropdown(document.getElementById('dropdown-situacao'));
  var acessoDropdown = initDropdown(document.getElementById('dropdown-acesso'));
  var acessoRecenteDropdown = initDropdown(document.getElementById('dropdown-acesso-recente'));
  var vencimentoDropdown = initDropdown(document.getElementById('dropdown-vencimento'));
  var periodicidadeDropdown = initDropdown(document.getElementById('dropdown-periodicidade'));
  var testeDropdown = initDropdown(document.getElementById('dropdown-teste'));

  // ---------- Agrupamento de Filtros (FilterPopover) ----------
  var filtrosPopoverEl = document.getElementById('assn-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('assn-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('assn-filtros-trigger');

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

  document.getElementById('assn-filtros-aplicar').addEventListener('click', function () {
    state.plano = document.getElementById('dropdown-plano').dataset.value || '';
    state.situacao = document.getElementById('dropdown-situacao').dataset.value || '';
    state.acesso = document.getElementById('dropdown-acesso').dataset.value || '';
    state.acessoRecente = document.getElementById('dropdown-acesso-recente').dataset.value || '';
    state.vencimento = document.getElementById('dropdown-vencimento').dataset.value || '';
    state.periodicidade = document.getElementById('dropdown-periodicidade').dataset.value || '';
    state.teste = document.getElementById('dropdown-teste').dataset.value || '';
    closeFiltrosPopover();
    applyFilters();
  });
  function limparFiltrosPopover() {
    planoDropdown.reset('', 'Todos os planos');
    situacaoDropdown.reset('', 'Todas as situações');
    acessoDropdown.reset('', 'Todas');
    acessoRecenteDropdown.reset('', 'Todos');
    vencimentoDropdown.reset('', 'Todos');
    periodicidadeDropdown.reset('', 'Todos');
    testeDropdown.reset('', 'Todos');
    state.plano = '';
    state.situacao = '';
    state.acesso = '';
    state.acessoRecente = '';
    state.vencimento = '';
    state.periodicidade = '';
    state.teste = '';
  }
  document.getElementById('assn-filtros-limpar').addEventListener('click', function () {
    limparFiltrosPopover();
    applyFilters();
  });

  // ---------- Popula o dropdown de Plano a partir do catálogo real ----------
  (function populatePlanoDropdown() {
    var menu = document.querySelector('#dropdown-plano [data-dropdown-menu]');
    if (!window.NiveloAdminPlanos || !menu) return;
    window.NiveloAdminPlanos.list().forEach(function (plano) {
      var opt = document.createElement('div');
      opt.className = 'option';
      opt.dataset.value = plano.id;
      opt.textContent = plano.nome;
      menu.appendChild(opt);
    });
  })();

  function lockBodyScroll() { document.body.style.overflow = 'hidden'; }
  function unlockBodyScroll() { document.body.style.overflow = ''; }

  // ---------- "Mais ações" (···) — menu ancorado, mesmo padrão de "+ Novo Certificado" ----------
  var maisMenuOverlay = document.getElementById('assn-mais-menu');
  var maisMenuList = maisMenuOverlay.querySelector('[data-dropdown-menu]');
  var maisMenuTargetId = null;

  function positionMaisMenu(anchorBtn) {
    var rect = anchorBtn.getBoundingClientRect();
    maisMenuList.style.position = 'fixed';
    maisMenuList.style.top = (rect.bottom + 4) + 'px';
    maisMenuList.style.left = 'auto';
    maisMenuList.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
    maisMenuList.style.width = 'auto';
  }
  function closeMaisMenu() {
    maisMenuOverlay.classList.remove('open');
    window.removeEventListener('scroll', closeMaisMenu, true);
    window.removeEventListener('resize', closeMaisMenu);
    document.removeEventListener('click', outsideMaisMenuHandler);
  }
  function outsideMaisMenuHandler(event) {
    if (!maisMenuOverlay.contains(event.target) && !event.target.closest('[data-action="mais"]')) closeMaisMenu();
  }
  function openMaisMenu(anchorBtn, id) {
    maisMenuTargetId = id;
    positionMaisMenu(anchorBtn);
    maisMenuOverlay.classList.add('open');
    window.addEventListener('scroll', closeMaisMenu, true);
    window.addEventListener('resize', closeMaisMenu);
    window.setTimeout(function () { document.addEventListener('click', outsideMaisMenuHandler); }, 0);
  }
  maisMenuList.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    var id = maisMenuTargetId;
    closeMaisMenu();
    if (optionEl.dataset.value === 'plano') openPlanoDialog(id);
    else if (optionEl.dataset.value === 'dias') openDiasDialog(id);
    else if (optionEl.dataset.value === 'link') openLinkDialog(id);
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMaisMenu(); });

  // ---------- Ativar/bloquear/liberar — modal de confirmação ----------
  var toggleAcessoOverlay = document.getElementById('assn-acesso-dialog-overlay');
  var toggleAcessoTitle = document.getElementById('assn-acesso-dialog-title');
  var toggleAcessoMessage = document.getElementById('assn-acesso-dialog-message');
  var toggleAcessoConfirmBtn = document.getElementById('assn-acesso-dialog-confirm');
  var motivoField = document.getElementById('assn-motivo-field');
  var motivoInput = document.getElementById('assn-motivo-input');
  var pendingAcesso = null;

  function openAcessoDialog(id, action) {
    pendingAcesso = { id: id, action: action };
    motivoInput.value = '';
    motivoField.hidden = action !== 'bloquear';
    if (action === 'bloquear') {
      toggleAcessoTitle.textContent = 'Bloquear cliente';
      toggleAcessoMessage.textContent = 'Tem certeza que deseja bloquear manualmente o acesso deste cliente à plataforma?';
      toggleAcessoConfirmBtn.className = 'btn destructive sm';
      toggleAcessoConfirmBtn.textContent = 'Bloquear';
    } else {
      toggleAcessoTitle.textContent = 'Liberar cliente';
      toggleAcessoMessage.textContent = 'Tem certeza que deseja liberar manualmente o acesso deste cliente à plataforma?';
      toggleAcessoConfirmBtn.className = 'btn primary sm';
      toggleAcessoConfirmBtn.textContent = 'Liberar';
    }
    toggleAcessoOverlay.hidden = false;
    lockBodyScroll();
  }
  function closeAcessoDialog() { toggleAcessoOverlay.hidden = true; unlockBodyScroll(); pendingAcesso = null; }
  document.getElementById('assn-acesso-dialog-close').addEventListener('click', closeAcessoDialog);
  document.getElementById('assn-acesso-dialog-cancel').addEventListener('click', closeAcessoDialog);
  toggleAcessoOverlay.addEventListener('click', function (e) { if (e.target === toggleAcessoOverlay) closeAcessoDialog(); });
  toggleAcessoConfirmBtn.addEventListener('click', function () {
    var pending = pendingAcesso;
    var motivo = motivoInput.value.trim();
    closeAcessoDialog();
    if (!pending) return;
    var assinante = pending.action === 'bloquear'
      ? window.NiveloAssinantes.bloquear(pending.id, null, motivo || null)
      : window.NiveloAssinantes.liberar(pending.id);
    if (!assinante) return;
    updateRowInPlace(assinante);
    showSuccessToast(
      pending.action === 'bloquear' ? 'Cliente bloqueado com sucesso.' : 'Cliente liberado com sucesso.',
      '"' + assinante.nome + '" está com o acesso ' + (assinante.acesso === 'bloqueado' ? 'bloqueado' : 'liberado') + '.'
    );
  });

  // ---------- Modal: Alterar plano ----------
  var planoOverlay = document.getElementById('assn-plano-dialog-overlay');
  var planoDropdownEl = document.getElementById('assn-plano-dropdown');
  var planoModalDropdown = initDropdown(planoDropdownEl);
  var planoDialogTargetId = null;

  function openPlanoDialog(id) {
    var assinante = window.NiveloAssinantes.findById(id);
    if (!assinante) return;
    planoDialogTargetId = id;
    var menu = planoDropdownEl.querySelector('[data-dropdown-menu]');
    menu.innerHTML = window.NiveloAdminPlanos.list().map(function (p) {
      return '<div class="option' + (p.id === assinante.planoId ? ' selected' : '') + '" data-value="' + p.id + '">' + p.nome + '</div>';
    }).join('');
    var atual = window.NiveloAdminPlanos.findById(assinante.planoId);
    planoModalDropdown.reset(assinante.planoId, atual ? atual.nome : '');
    planoOverlay.hidden = false;
    lockBodyScroll();
  }
  function closePlanoDialog() { planoOverlay.hidden = true; unlockBodyScroll(); planoDialogTargetId = null; }
  document.getElementById('assn-plano-dialog-close').addEventListener('click', closePlanoDialog);
  document.getElementById('assn-plano-dialog-cancel').addEventListener('click', closePlanoDialog);
  planoOverlay.addEventListener('click', function (e) { if (e.target === planoOverlay) closePlanoDialog(); });
  document.getElementById('assn-plano-dialog-save').addEventListener('click', function () {
    var id = planoDialogTargetId;
    var novoPlanoId = planoDropdownEl.dataset.value;
    var assinante = window.NiveloAssinantes.findById(id);
    if (!assinante || !novoPlanoId || novoPlanoId === assinante.planoId) { closePlanoDialog(); return; }
    var atualizado = window.NiveloAssinantes.alterarPlano(id, novoPlanoId);
    closePlanoDialog();
    updateRowInPlace(atualizado);
    showSuccessToast('Plano alterado com sucesso.', 'O plano de "' + atualizado.nome + '" foi atualizado.');
  });

  // ---------- Modal: Conceder dias gratuitos ----------
  var diasOverlay = document.getElementById('assn-dias-dialog-overlay');
  var diasInput = document.getElementById('assn-dias-input');
  var diasField = document.getElementById('assn-dias-field');
  var diasDialogTargetId = null;

  function openDiasDialog(id) {
    diasDialogTargetId = id;
    diasInput.value = '';
    diasField.classList.remove('error');
    diasOverlay.hidden = false;
    lockBodyScroll();
    diasInput.focus();
  }
  function closeDiasDialog() { diasOverlay.hidden = true; unlockBodyScroll(); diasDialogTargetId = null; }
  document.getElementById('assn-dias-dialog-close').addEventListener('click', closeDiasDialog);
  document.getElementById('assn-dias-dialog-cancel').addEventListener('click', closeDiasDialog);
  diasOverlay.addEventListener('click', function (e) { if (e.target === diasOverlay) closeDiasDialog(); });
  document.getElementById('assn-dias-dialog-save').addEventListener('click', function () {
    var dias = Number(diasInput.value);
    if (!dias || dias <= 0) { diasField.classList.add('error'); return; }
    var id = diasDialogTargetId;
    var assinante = window.NiveloAssinantes.concederDiasGratuitos(id, dias);
    closeDiasDialog();
    if (!assinante) return;
    updateRowInPlace(assinante);
    showSuccessToast('Dias gratuitos concedidos com sucesso.', dias + ' dia(s) adicionado(s) para "' + assinante.nome + '".');
  });

  // ---------- Modal: Gerar link de pagamento (upgrade) ----------
  var linkOverlay = document.getElementById('assn-link-dialog-overlay');
  var linkPlanoDropdownEl = document.getElementById('assn-link-plano-dropdown');
  var linkPlanoDropdown = initDropdown(linkPlanoDropdownEl);
  var linkRecap = document.getElementById('assn-link-recap');
  var linkValorFinalInput = document.getElementById('assn-link-valor-final-input');
  var linkAjustadoNote = document.getElementById('assn-link-ajustado-note');
  var linkDialogTargetId = null;
  var currentProrateamento = null;
  var valorSugerido = null;

  // Mesmo padrão de máscara monetária já usado no projeto (`formatCentavosBRL`) — o "R$" faz
  // parte do próprio valor digitado no input, nunca um prefixo visual solto fora dele (sem
  // classe `.prefix` real em `Input.module.css`, o texto ficava sem estilo e "fora" da caixa).
  function formatCentavosBRLInput(centavos) {
    return centavos ? 'R$ ' + (centavos / 100).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.') : '';
  }
  function attachCurrencyMask(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      var centavos = digits ? Number(digits) : 0;
      input.value = formatCentavosBRLInput(centavos);
      input.dataset.centavos = String(centavos);
    });
  }
  attachCurrencyMask(linkValorFinalInput);

  function updateRecap() {
    var novoPlanoId = linkPlanoDropdownEl.dataset.value;
    if (!novoPlanoId) { linkRecap.hidden = true; return; }
    currentProrateamento = window.NiveloAssinantes.calcularProrateamentoUpgrade(linkDialogTargetId, novoPlanoId);
    if (!currentProrateamento) { linkRecap.hidden = true; return; }
    linkRecap.hidden = false;
    var atualLabel = currentProrateamento.planoAtual
      ? currentProrateamento.planoAtual.nome + (currentProrateamento.isTrial ? ' (em teste)' : ' — ' + formatBRL(currentProrateamento.planoAtual.valorAnual) + '/ano')
      : 'Nenhum (em período de teste)';
    document.getElementById('link-plano-atual').textContent = atualLabel;
    document.getElementById('link-plano-novo').textContent = currentProrateamento.planoNovo.nome + ' — ' + formatBRL(currentProrateamento.planoNovo.valorAnual) + '/ano';
    if (currentProrateamento.isTrial) {
      document.getElementById('link-periodo-restante').textContent = 'N/A (contratação nova, sem assinatura paga ativa)';
      document.getElementById('link-valor-proporcional').textContent = 'N/A';
      document.getElementById('link-proxima-renovacao').textContent = 'N/A';
    } else {
      document.getElementById('link-periodo-restante').textContent = currentProrateamento.mesesRestantes + (currentProrateamento.mesesRestantes === 1 ? ' mês' : ' meses');
      document.getElementById('link-valor-proporcional').textContent = formatBRL(currentProrateamento.valorProporcional);
      document.getElementById('link-proxima-renovacao').textContent = formatDateBR(currentProrateamento.proximaRenovacao);
    }
    valorSugerido = currentProrateamento.valorProporcional;
    linkValorFinalInput.value = formatCentavosBRLInput(Math.round(valorSugerido * 100));
    linkValorFinalInput.dataset.centavos = String(Math.round(valorSugerido * 100));
    linkAjustadoNote.hidden = true;
  }
  linkPlanoDropdown.onChange(updateRecap);

  linkValorFinalInput.addEventListener('input', function () {
    var atual = Number(linkValorFinalInput.dataset.centavos || '0') / 100;
    linkAjustadoNote.hidden = valorSugerido === null || atual === valorSugerido;
  });

  function openLinkDialog(id) {
    var assinante = window.NiveloAssinantes.findById(id);
    if (!assinante) return;
    linkDialogTargetId = id;
    var menu = linkPlanoDropdownEl.querySelector('[data-dropdown-menu]');
    // Em período de teste, nunca houve assinatura paga ativa — nenhum plano precisa ser
    // excluído da seleção (item explícito: não limitar a escolha com base no plano atual).
    menu.innerHTML = window.NiveloAdminPlanos.list()
      .filter(function (p) { return assinante.situacao === 'teste' || p.id !== assinante.planoId; })
      .map(function (p) { return '<div class="option" data-value="' + p.id + '">' + p.nome + '</div>'; })
      .join('');
    linkPlanoDropdown.reset('', 'Selecione o novo plano anual');
    linkRecap.hidden = true;
    currentProrateamento = null;
    linkOverlay.hidden = false;
    lockBodyScroll();
  }
  function closeLinkDialog() { linkOverlay.hidden = true; unlockBodyScroll(); linkDialogTargetId = null; }
  document.getElementById('assn-link-dialog-close').addEventListener('click', closeLinkDialog);
  document.getElementById('assn-link-dialog-cancel').addEventListener('click', closeLinkDialog);
  linkOverlay.addEventListener('click', function (e) { if (e.target === linkOverlay) closeLinkDialog(); });
  // Mesma técnica de cópia usada em `assinante-detalhe.js` (Clipboard API com
  // fallback via `<textarea>` + `execCommand`, pra navegadores sem suporte).
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return;
    }
    var helper = document.createElement('textarea');
    helper.value = text;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(helper);
  }

  document.getElementById('assn-link-dialog-gerar').addEventListener('click', function () {
    if (!currentProrateamento) return;
    var valorFinal = Number(linkValorFinalInput.dataset.centavos || '0') / 100;
    var ajustado = valorSugerido !== null && valorFinal !== valorSugerido;
    var resultado = window.NiveloAssinantes.gerarLinkPagamento(linkDialogTargetId, currentProrateamento.planoNovo.id, valorFinal, ajustado);
    var id = linkDialogTargetId;
    closeLinkDialog();
    if (!resultado) return;
    var assinante = window.NiveloAssinantes.findById(id);
    if (assinante) updateRowInPlace(assinante);
    copyToClipboard(resultado.link);
    showSuccessToast('Link de pagamento copiado com sucesso.', resultado.link);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!planoOverlay.hidden) closePlanoDialog();
    else if (!toggleAcessoOverlay.hidden) closeAcessoDialog();
    else if (!diasOverlay.hidden) closeDiasDialog();
    else if (!linkOverlay.hidden) closeLinkDialog();
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

  // ---------- Dispatcher de ações (tabela + Cards) ----------
  function handleRowAction(btn) {
    var action = btn.dataset.action;
    var id = Number(btn.dataset.id);
    if (action === 'bloquear') openAcessoDialog(id, 'bloquear');
    else if (action === 'liberar') openAcessoDialog(id, 'liberar');
    else if (action === 'mais') openMaisMenu(btn, id);
  }
  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (btn) handleRowAction(btn);
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('assn-cards');

  function cellText(cell) { return cell.textContent.trim(); }

  function buildCardHTML(row) {
    var actionsHTML = row.children[9].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card assn-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="assn-mobile-card-header">' +
          '<div>' +
            '<div class="assn-mobile-card-name text-subtitle-s">' + row.children[0].querySelector('.assn-cliente-nome').textContent + '</div>' +
            '<div class="assn-mobile-card-email text-body-xs">' + row.children[0].querySelector('.assn-cliente-email').textContent + '</div>' +
          '</div>' +
        '</div>' +
        '<dl class="assn-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Plano</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[2].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Acesso</dt><dd class="text-12-regular">' + row.children[3].innerHTML + '</dd></div>' +
          '<div><dt class="text-10-regular">Vencimento</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Tokens de IA</dt><dd class="text-12-regular">' + cellText(row.children[7]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Último acesso</dt><dd class="text-12-regular">' + cellText(row.children[8]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions assn-mobile-card-actions">' + actionsHTML + '</div>' +
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
    if (btn) handleRowAction(btn);
  });

  // ---------- Filtro vindo do Dashboard via query string — o Dashboard só passa o parâmetro,
  // quem filtra é o próprio Agrupamento de Filtros desta tela: o dropdown correspondente é
  // selecionado (mesmo `reset()` usado por Limpar/edição) e o `state` é atualizado direto,
  // sem nenhuma UI ou lógica de filtragem própria do Dashboard — é o filtro real da tabela,
  // já aplicado e visível no próprio trigger "Filtros" ao abrir o popover. ----------
  var QUERY_PARAM_CONFIG = {
    situacao: { dropdown: situacaoDropdown, stateKey: 'situacao',
      labels: { teste: 'Em teste', assinante: 'Assinante', suspenso: 'Suspenso', cancelado: 'Cancelado' } },
    acesso: { dropdown: acessoDropdown, stateKey: 'acesso',
      labels: { ativo: 'Ativo', bloqueado: 'Bloqueado' } },
    acessoRecente: { dropdown: acessoRecenteDropdown, stateKey: 'acessoRecente',
      labels: { recente: 'Últimos 14 dias', antigo: 'Mais de 14 dias sem acesso' } },
    vencimento: { dropdown: vencimentoDropdown, stateKey: 'vencimento',
      labels: { until7: 'Até 7 dias', '8to15': 'De 8 a 15 dias', '16to30': 'De 16 a 30 dias', over30: 'Mais de 30 dias' } },
    periodicidade: { dropdown: periodicidadeDropdown, stateKey: 'periodicidade',
      labels: { mensal: 'Mensal', anual: 'Anual' } },
    teste: { dropdown: testeDropdown, stateKey: 'teste',
      labels: { until3: 'Até 3 dias', '4to7': 'De 4 a 7 dias', '8to14': 'De 8 a 14 dias', over14: 'Mais de 14 dias' } }
  };

  function applyQueryFiltrosFromQuery() {
    var params = new URLSearchParams(location.search);
    Object.keys(QUERY_PARAM_CONFIG).forEach(function (param) {
      var cfg = QUERY_PARAM_CONFIG[param];
      var value = params.get(param);
      if (!value || !cfg.labels[value]) return;
      state[cfg.stateKey] = value;
      cfg.dropdown.reset(value, cfg.labels[value]);
    });
  }

  renderInitialRows();
  applyQueryFiltrosFromQuery();
  applyFilters();
})();
