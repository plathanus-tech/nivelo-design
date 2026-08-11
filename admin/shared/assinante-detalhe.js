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
  var PAGAMENTO_BADGE = {
    pago: { status: 'success', label: 'Pago' },
    pendente: { status: 'warning', label: 'Pendente' }
  };
  var HISTORICO_ICONS = {
    'assinatura-criada': 'sparkles',
    'plano-alterado': 'repeat',
    'upgrade-realizado': 'trending-up',
    'pagamento-realizado': 'circle-dollar-sign',
    'pagamento-pendente': 'clock-alert',
    'assinatura-suspensa': 'pause-circle',
    'assinatura-liberada': 'play-circle',
    'assinatura-cancelada': 'circle-x',
    'cliente-bloqueado': 'lock',
    'cliente-liberado': 'unlock',
    'dias-gratuitos-concedidos': 'gift'
  };
  var HISTORICO_LABELS = {
    'assinatura-criada': 'Assinatura criada',
    'plano-alterado': 'Plano alterado',
    'upgrade-realizado': 'Upgrade realizado',
    'pagamento-realizado': 'Pagamento realizado',
    'pagamento-pendente': 'Pagamento pendente',
    'assinatura-suspensa': 'Assinatura suspensa',
    'assinatura-liberada': 'Assinatura liberada',
    'assinatura-cancelada': 'Assinatura cancelada',
    'cliente-bloqueado': 'Cliente bloqueado',
    'cliente-liberado': 'Cliente liberado',
    'dias-gratuitos-concedidos': 'Dias gratuitos concedidos'
  };

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
  function formatBRL(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }
  function formatTokens(qtd) { return qtd.toLocaleString('pt-BR') + ' tokens'; }

  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success assndet-toast';
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

  var hashMatch = location.hash.match(/id=(\d+)/);
  var assinanteId = hashMatch ? Number(hashMatch[1]) : null;

  var notFoundEl = document.getElementById('assndet-not-found');
  var contentEl = document.getElementById('assndet-content');

  var current = null;

  function render() {
    current = assinanteId ? window.NiveloAssinantes.findById(assinanteId) : null;
    if (!current) {
      notFoundEl.hidden = false;
      contentEl.hidden = true;
      return;
    }
    notFoundEl.hidden = true;
    contentEl.hidden = false;

    document.getElementById('assndet-titulo').textContent = current.nome;

    var situacaoBadge = SITUACAO_BADGE[current.situacao];
    var acessoBadge = ACESSO_BADGE[current.acesso];
    document.getElementById('assndet-situacao-badge').outerHTML =
      '<span class="badge" id="assndet-situacao-badge" data-status="' + situacaoBadge.status + '"><span class="badgeDot"></span>' + situacaoBadge.label + '</span>';
    document.getElementById('assndet-acesso-badge').outerHTML =
      '<span class="badge" id="assndet-acesso-badge" data-status="' + acessoBadge.status + '"><span class="badgeDot"></span>Acesso ' + acessoBadge.label + '</span>';

    // Dados do cliente
    document.getElementById('di-nome').textContent = current.nome;
    document.getElementById('di-email').textContent = current.email;
    document.getElementById('di-telefone').textContent = current.telefone || '—';
    document.getElementById('di-cadastro').textContent = formatDateBR(current.dataCadastro);
    document.getElementById('di-ultimo-acesso').textContent = formatDateTimeBR(current.ultimoAcesso);

    // Assinatura
    var plano = window.NiveloAssinantes.plano(current);
    document.getElementById('as-plano').textContent = plano ? plano.nome : '—';
    document.getElementById('as-status').innerHTML = '<span class="badge" data-status="' + situacaoBadge.status + '"><span class="badgeDot"></span>' + situacaoBadge.label + '</span>';
    document.getElementById('as-inicio').textContent = formatDateBR(current.dataInicioAssinatura);
    document.getElementById('as-vencimento').textContent = formatDateBR(current.dataVencimento);
    document.getElementById('as-proxima-renovacao').textContent = formatDateBR(current.dataVencimento);
    document.getElementById('as-acesso').innerHTML = '<span class="badge" data-status="' + acessoBadge.status + '"><span class="badgeDot"></span>' + acessoBadge.label + '</span>';
    document.getElementById('as-forma-contratacao').textContent = current.formaContratacao === 'anual' ? 'Anual' : 'Mensal';

    // Período de teste
    var testeSection = document.getElementById('assndet-teste-section');
    if (current.trial) {
      testeSection.hidden = false;
      var diasRestantes = window.NiveloAssinantes.diasRestantesTeste(current);
      document.getElementById('teste-inicio').textContent = formatDateBR(current.trial.dataInicio);
      document.getElementById('teste-dias-padrao').textContent = current.trial.diasPadrao + ' dias';
      document.getElementById('teste-dias-manuais').textContent = current.trial.diasManuais + ' dias';
      document.getElementById('teste-fim').textContent = formatDateBR(current.trial.dataFim);
      document.getElementById('teste-restantes').textContent = diasRestantes + (diasRestantes === 1 ? ' dia' : ' dias');
    } else {
      testeSection.hidden = true;
    }

    // Uso de IA
    document.getElementById('ia-total').textContent = formatTokens(current.tokensConsumidos);

    // Pagamentos
    document.getElementById('assndet-historico-link').href = 'historico-pagamentos.html?assinanteId=' + current.id;
    var pagamentos = current.pagamentos.slice().sort(function (a, b) { return b.data < a.data ? -1 : 1; });
    var ultimo = pagamentos.filter(function (p) { return p.status === 'pago'; })[0];
    var proximo = pagamentos.filter(function (p) { return p.status === 'pendente'; })[0] || (current.dataVencimento ? { data: current.dataVencimento } : null);
    document.getElementById('pag-ultimo').textContent = ultimo ? formatDateBR(ultimo.data) + ' · ' + formatBRL(ultimo.valor) : '—';
    document.getElementById('pag-proximo').textContent = proximo ? formatDateBR(proximo.data) : '—';
    document.getElementById('pag-valor').textContent = plano ? formatBRL(current.formaContratacao === 'anual' ? plano.valorAnual : plano.valorMensal) : '—';
    var statusUltimo = ultimo ? { status: 'success', label: 'Pago' } : (pagamentos[0] ? PAGAMENTO_BADGE[pagamentos[0].status] : null);
    document.getElementById('pag-status').innerHTML = statusUltimo ? '<span class="badge" data-status="' + statusUltimo.status + '"><span class="badgeDot"></span>' + statusUltimo.label + '</span>' : '—';

    var pagTbody = document.getElementById('pag-tbody');
    pagTbody.innerHTML = pagamentos.map(function (p) {
      var badge = PAGAMENTO_BADGE[p.status];
      return (
        '<tr class="tr">' +
          '<td class="td">' + formatDateBR(p.data) + '</td>' +
          '<td class="td">' + p.descricao + '</td>' +
          '<td class="td">' + formatBRL(p.valor) + '</td>' +
          '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '</tr>'
      );
    }).join('') || '<tr class="tr"><td class="td" colspan="4">Nenhum pagamento registrado.</td></tr>';

    // Cupom e afiliado
    var cupomSection = document.getElementById('assndet-cupom-section');
    if (current.cupom) {
      cupomSection.hidden = false;
      document.getElementById('cup-codigo').textContent = current.cupom.codigo;
      document.getElementById('cup-afiliado').textContent = current.cupom.afiliado;
      document.getElementById('cup-data').textContent = formatDateBR(current.cupom.dataUso);
    } else {
      cupomSection.hidden = true;
    }

    // Histórico
    var timeline = document.getElementById('assndet-timeline');
    var eventosOrdenados = current.historico.slice().sort(function (a, b) { return b.data < a.data ? -1 : 1; });
    timeline.innerHTML = eventosOrdenados.map(function (evento) {
      return (
        '<li class="assndet-timeline-item">' +
          '<span class="assndet-timeline-icon"><i data-lucide="' + (HISTORICO_ICONS[evento.evento] || 'circle') + '" width="16" height="16"></i></span>' +
          '<div class="assndet-timeline-body">' +
            '<div class="assndet-timeline-label">' + (HISTORICO_LABELS[evento.evento] || evento.evento) + '</div>' +
            '<div class="assndet-timeline-meta">' + evento.detalhe + '</div>' +
            '<div class="assndet-timeline-responsavel">' + formatDateTimeBR(evento.data) + ' · ' + evento.responsavel + '</div>' +
          '</div>' +
        '</li>'
      );
    }).join('');

    // Ações administrativas — visibilidade condicional
    document.getElementById('assndet-bloquear-btn').hidden = current.acesso === 'bloqueado';
    document.getElementById('assndet-liberar-btn').hidden = current.acesso === 'ativo';

    // Link de pagamento gerado (persiste no próprio assinante — sobrevive a qualquer
    // outro `render()`, ex. depois de conceder dias gratuitos, até a página ser recarregada).
    var linkBox = document.getElementById('assndet-link-box');
    if (current.linkPagamentoAtivo) {
      linkBox.hidden = false;
      document.getElementById('assndet-link-url').textContent = current.linkPagamentoAtivo.link;
      document.getElementById('assndet-link-expiracao').textContent = 'Expira em ' + formatDateTimeBR(current.linkPagamentoAtivo.expiraEm);
    } else {
      linkBox.hidden = true;
    }

    if (window.lucide) lucide.createIcons();
  }

  // ---------- Dropdown genérico (mesmo padrão do resto do admin) ----------
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

  function lockBodyScroll() { document.body.style.overflow = 'hidden'; }
  function unlockBodyScroll() { document.body.style.overflow = ''; }

  // ---------- Modal: Alterar plano ----------
  var planoOverlay = document.getElementById('assndet-plano-dialog-overlay');
  var planoDropdownEl = document.getElementById('assndet-plano-dropdown');
  var planoDropdown = initDropdown(planoDropdownEl);

  function openPlanoDialog() {
    var menu = planoDropdownEl.querySelector('[data-dropdown-menu]');
    menu.innerHTML = window.NiveloAdminPlanos.list().map(function (p) {
      return '<div class="option' + (p.id === current.planoId ? ' selected' : '') + '" data-value="' + p.id + '">' + p.nome + '</div>';
    }).join('');
    var atual = window.NiveloAdminPlanos.findById(current.planoId);
    planoDropdown.reset(current.planoId, atual ? atual.nome : '');
    planoOverlay.hidden = false;
    lockBodyScroll();
  }
  function closePlanoDialog() { planoOverlay.hidden = true; unlockBodyScroll(); }

  document.getElementById('assndet-plano-dialog-close').addEventListener('click', closePlanoDialog);
  document.getElementById('assndet-plano-dialog-cancel').addEventListener('click', closePlanoDialog);
  planoOverlay.addEventListener('click', function (e) { if (e.target === planoOverlay) closePlanoDialog(); });
  document.getElementById('assndet-plano-dialog-save').addEventListener('click', function () {
    var novoPlanoId = planoDropdownEl.dataset.value;
    if (!novoPlanoId || novoPlanoId === current.planoId) { closePlanoDialog(); return; }
    window.NiveloAssinantes.alterarPlano(current.id, novoPlanoId);
    closePlanoDialog();
    render();
    showSuccessToast('Plano alterado com sucesso.', 'O plano de "' + current.nome + '" foi atualizado.');
  });

  // ---------- Modal: Bloquear / Liberar ----------
  var toggleAcessoOverlay = document.getElementById('assndet-acesso-dialog-overlay');
  var toggleAcessoTitle = document.getElementById('assndet-acesso-dialog-title');
  var toggleAcessoMessage = document.getElementById('assndet-acesso-dialog-message');
  var toggleAcessoConfirmBtn = document.getElementById('assndet-acesso-dialog-confirm');
  var motivoField = document.getElementById('assndet-motivo-field');
  var motivoInput = document.getElementById('assndet-motivo-input');
  var pendingAcessoAction = null;

  function openAcessoDialog(action) {
    pendingAcessoAction = action;
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
  function closeAcessoDialog() { toggleAcessoOverlay.hidden = true; unlockBodyScroll(); pendingAcessoAction = null; }

  document.getElementById('assndet-bloquear-btn').addEventListener('click', function () { openAcessoDialog('bloquear'); });
  document.getElementById('assndet-liberar-btn').addEventListener('click', function () { openAcessoDialog('liberar'); });
  document.getElementById('assndet-acesso-dialog-close').addEventListener('click', closeAcessoDialog);
  document.getElementById('assndet-acesso-dialog-cancel').addEventListener('click', closeAcessoDialog);
  toggleAcessoOverlay.addEventListener('click', function (e) { if (e.target === toggleAcessoOverlay) closeAcessoDialog(); });
  toggleAcessoConfirmBtn.addEventListener('click', function () {
    var action = pendingAcessoAction;
    var motivo = motivoInput.value.trim();
    closeAcessoDialog();
    if (action === 'bloquear') {
      window.NiveloAssinantes.bloquear(current.id, null, motivo || null);
      render();
      showSuccessToast('Cliente bloqueado com sucesso.', '"' + current.nome + '" está com o acesso bloqueado.');
    } else if (action === 'liberar') {
      window.NiveloAssinantes.liberar(current.id);
      render();
      showSuccessToast('Cliente liberado com sucesso.', '"' + current.nome + '" está com o acesso liberado.');
    }
  });

  // ---------- Popover "Gerenciar assinatura" (Alterar plano/Conceder dias/Gerar link) ----------
  var manageMenuRoot = document.getElementById('assndet-manage-menu');
  var manageBtn = document.getElementById('assndet-manage-btn');
  var manageMenu = manageMenuRoot.querySelector('[data-dropdown-menu]');

  function positionManageMenu() {
    var rect = manageBtn.getBoundingClientRect();
    manageMenu.style.position = 'fixed';
    manageMenu.style.top = (rect.bottom + 4) + 'px';
    manageMenu.style.left = 'auto';
    manageMenu.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
    manageMenu.style.width = 'auto';
  }
  function closeManageMenu() {
    manageMenuRoot.classList.remove('open');
    window.removeEventListener('scroll', closeManageMenu, true);
    window.removeEventListener('resize', closeManageMenu);
    document.removeEventListener('click', outsideManageMenuHandler);
  }
  function outsideManageMenuHandler(event) {
    if (!manageMenuRoot.contains(event.target)) closeManageMenu();
  }
  function openManageMenu() {
    positionManageMenu();
    manageMenuRoot.classList.add('open');
    window.addEventListener('scroll', closeManageMenu, true);
    window.addEventListener('resize', closeManageMenu);
    window.setTimeout(function () { document.addEventListener('click', outsideManageMenuHandler); }, 0);
  }
  manageBtn.addEventListener('click', function () {
    manageMenuRoot.classList.contains('open') ? closeManageMenu() : openManageMenu();
  });
  manageMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    closeManageMenu();
    if (optionEl.dataset.value === 'plano') openPlanoDialog();
    else if (optionEl.dataset.value === 'dias') openDiasDialog();
    else if (optionEl.dataset.value === 'link') openLinkDialog();
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeManageMenu(); });

  // ---------- Modal: Conceder dias gratuitos ----------
  var diasOverlay = document.getElementById('assndet-dias-dialog-overlay');
  var diasInput = document.getElementById('assndet-dias-input');
  var diasField = document.getElementById('assndet-dias-field');

  function openDiasDialog() {
    diasInput.value = '';
    diasField.classList.remove('error');
    diasOverlay.hidden = false;
    lockBodyScroll();
    diasInput.focus();
  }
  function closeDiasDialog() { diasOverlay.hidden = true; unlockBodyScroll(); }

  document.getElementById('assndet-dias-dialog-close').addEventListener('click', closeDiasDialog);
  document.getElementById('assndet-dias-dialog-cancel').addEventListener('click', closeDiasDialog);
  diasOverlay.addEventListener('click', function (e) { if (e.target === diasOverlay) closeDiasDialog(); });
  document.getElementById('assndet-dias-dialog-save').addEventListener('click', function () {
    var dias = Number(diasInput.value);
    if (!dias || dias <= 0) { diasField.classList.add('error'); return; }
    window.NiveloAssinantes.concederDiasGratuitos(current.id, dias);
    closeDiasDialog();
    render();
    showSuccessToast('Dias gratuitos concedidos com sucesso.', dias + ' dia(s) adicionado(s) para "' + current.nome + '".');
  });

  // ---------- Modal: Gerar link de pagamento (upgrade) ----------
  var linkOverlay = document.getElementById('assndet-link-dialog-overlay');
  var linkPlanoDropdownEl = document.getElementById('assndet-link-plano-dropdown');
  var linkPlanoDropdown = initDropdown(linkPlanoDropdownEl);
  var linkRecap = document.getElementById('assndet-link-recap');
  var linkValorFinalInput = document.getElementById('assndet-link-valor-final-input');
  var linkAjustadoNote = document.getElementById('assndet-link-ajustado-note');
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
    currentProrateamento = window.NiveloAssinantes.calcularProrateamentoUpgrade(current.id, novoPlanoId);
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

  function openLinkDialog() {
    var menu = linkPlanoDropdownEl.querySelector('[data-dropdown-menu]');
    // Em período de teste, nunca houve assinatura paga ativa — nenhum plano precisa ser
    // excluído da seleção (item explícito: não limitar a escolha com base no plano atual).
    menu.innerHTML = window.NiveloAdminPlanos.list()
      .filter(function (p) { return current.situacao === 'teste' || p.id !== current.planoId; })
      .map(function (p) { return '<div class="option" data-value="' + p.id + '">' + p.nome + '</div>'; })
      .join('');
    linkPlanoDropdown.reset('', 'Selecione o novo plano anual');
    linkRecap.hidden = true;
    currentProrateamento = null;
    linkOverlay.hidden = false;
    lockBodyScroll();
  }
  function closeLinkDialog() { linkOverlay.hidden = true; unlockBodyScroll(); }

  document.getElementById('assndet-link-dialog-close').addEventListener('click', closeLinkDialog);
  document.getElementById('assndet-link-dialog-cancel').addEventListener('click', closeLinkDialog);
  linkOverlay.addEventListener('click', function (e) { if (e.target === linkOverlay) closeLinkDialog(); });
  // ---------- Copiar para a área de transferência — mesma técnica em ambos
  // os pontos que copiam o link (ao gerar e pelo ícone do card "Assinatura"). ----------
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

  document.getElementById('assndet-link-dialog-gerar').addEventListener('click', function () {
    if (!currentProrateamento) return;
    var valorFinal = Number(linkValorFinalInput.dataset.centavos || '0') / 100;
    var ajustado = valorSugerido !== null && valorFinal !== valorSugerido;
    var resultado = window.NiveloAssinantes.gerarLinkPagamento(current.id, currentProrateamento.planoNovo.id, valorFinal, ajustado);
    closeLinkDialog();
    render();
    copyToClipboard(resultado.link);
    showSuccessToast('Link de pagamento copiado com sucesso.', resultado.link);
  });

  // ---------- Ícone de copiar dentro do card "Assinatura" ----------
  var linkCopyBtn = document.getElementById('assndet-link-copy-btn');
  linkCopyBtn.addEventListener('click', function () {
    if (!current || !current.linkPagamentoAtivo) return;
    copyToClipboard(current.linkPagamentoAtivo.link);
    showSuccessToast('Link de pagamento copiado com sucesso.', null);
  });

  // Tooltip padrão do ícone ("Copiar link") — mesma técnica `position:fixed` via
  // `getBoundingClientRect()` já usada nos ícones de ação das tabelas do admin.
  (function () {
    var tip = linkCopyBtn.querySelector('.tip');
    if (!tip) return;
    document.body.appendChild(tip);
    function positionTip() {
      var rect = linkCopyBtn.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      tip.style.position = 'fixed';
      tip.style.left = centerX + 'px';
      tip.style.transform = 'translateX(-50%)';
      tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
      tip.style.top = 'auto';
      tip.style.opacity = '1';
    }
    function hideTip() { tip.style.opacity = '0'; }
    linkCopyBtn.addEventListener('mouseover', positionTip);
    linkCopyBtn.addEventListener('mouseout', hideTip);
    linkCopyBtn.addEventListener('focus', positionTip);
    linkCopyBtn.addEventListener('blur', hideTip);
  })();

  // Esc fecha o modal aberto no momento (mesmo padrão já usado nos demais modais do admin).
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!planoOverlay.hidden) closePlanoDialog();
    else if (!toggleAcessoOverlay.hidden) closeAcessoDialog();
    else if (!diasOverlay.hidden) closeDiasDialog();
    else if (!linkOverlay.hidden) closeLinkDialog();
  });

  render();
})();
