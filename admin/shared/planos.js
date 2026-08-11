(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var tbody = document.getElementById('pln-tbody');
  var cardsContainer = document.getElementById('pln-cards');
  var toastRegion = document.getElementById('toast-region');

  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatValorMensal(valor) {
    return formatCentavosBRL(Math.round(valor * 100));
  }

  function formatDataBR(isoDate) {
    var parts = isoDate.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success pln-toast';
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
    dismissBtn.addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  // ---------- Ações (Editar + Ativar/Desativar), mesmo ícone+tooltip padrão já usado em
  // Usuários (ver `admin/shared/usuarios.js`) — Ativar/Desativar sempre exige confirmação
  // antes de aplicar (ver openToggleAtivoDialog). ----------
  function buildActionsHTML(plano) {
    var toggle = plano.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" data-id="' + plano.id + '" aria-label="Editar plano">' +
          '<i data-lucide="pencil" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Editar</span>' +
        '</button>' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" data-id="' + plano.id + '" aria-label="' + toggle.label + ' plano">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(plano) {
    var statusBadge = plano.ativo ? { status: 'success', label: 'Ativo' } : { status: 'warning', label: 'Inativo' };
    return (
      '<tr class="tr" id="pln-row-' + plano.id + '" data-id="' + plano.id + '">' +
        '<td class="td">' + plano.nome + '</td>' +
        '<td class="td pln-descricao-cell" title="' + plano.descricao + '">' + plano.descricao + '</td>' +
        '<td class="td">' + formatValorMensal(plano.valorMensal) + '</td>' +
        '<td class="td">' + formatValorMensal(plano.valorAnual) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td">' + plano.assinantesAtivos + '</td>' +
        '<td class="td">' + formatDataBR(plano.ultimaAlteracao) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(plano) + '</td>' +
      '</tr>'
    );
  }

  function buildCardHTML(plano) {
    var statusBadge = plano.ativo ? { status: 'success', label: 'Ativo' } : { status: 'warning', label: 'Inativo' };
    return (
      '<div class="card pln-mobile-card" data-row-id="pln-row-' + plano.id + '">' +
        '<div class="pln-mobile-card-header">' +
          '<div class="pln-mobile-card-name text-subtitle-s">' + plano.nome + '</div>' +
          '<span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span>' +
        '</div>' +
        '<div class="pln-mobile-card-desc text-body-xs">' + plano.descricao + '</div>' +
        '<dl class="pln-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Valor mensal</dt><dd class="text-12-regular">' + formatValorMensal(plano.valorMensal) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor anual</dt><dd class="text-12-regular">' + formatValorMensal(plano.valorAnual) + '</dd></div>' +
          '<div><dt class="text-10-regular">Assinantes ativos</dt><dd class="text-12-regular">' + plano.assinantesAtivos + '</dd></div>' +
          '<div><dt class="text-10-regular">Última alteração</dt><dd class="text-12-regular">' + formatDataBR(plano.ultimaAlteracao) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions pln-mobile-card-actions">' + buildActionsHTML(plano) + '</div>' +
      '</div>'
    );
  }

  function renderAll() {
    var planos = window.NiveloAdminPlanos.list();
    tbody.innerHTML = planos.map(buildRowHTML).join('');
    cardsContainer.innerHTML = planos.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Tooltip padrão dos ícones de ação — mesma técnica de `usuarios.js`
  // (position:fixed calculado do rect do alvo). ----------
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

  function toggleAtivo(id) {
    var plano = window.NiveloAdminPlanos.toggleAtivo(id);
    if (!plano) return;
    renderAll();
    showSuccessToast(
      plano.ativo ? 'Plano ativado com sucesso.' : 'Plano desativado com sucesso.',
      '"' + plano.nome + '" agora está ' + (plano.ativo ? 'ativo' : 'inativo') + (plano.ativo ? ', disponível para novas assinaturas.' : ', não pode mais ser contratado por novos clientes.')
    );
  }

  // ---------- Ativar/Desativar: modal de confirmação antes da alteração, mesmo padrão
  // exato já usado em Usuários/Categorias de receitas e despesas/Talhões: Desativar é
  // destrutivo, Ativar é primário. ----------
  var toggleOverlay = document.getElementById('pln-toggle-dialog-overlay');
  var toggleTitle = document.getElementById('pln-toggle-dialog-title');
  var toggleMessage = document.getElementById('pln-toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('pln-toggle-dialog-confirm');
  var pendingToggleId = null;

  function openToggleAtivoDialog(id) {
    var plano = window.NiveloAdminPlanos.findById(id);
    if (!plano) return;
    pendingToggleId = id;
    if (plano.ativo) {
      toggleTitle.textContent = 'Desativar plano';
      toggleMessage.textContent = 'Tem certeza que deseja desativar o plano "' + plano.nome + '"? Ele deixará de estar disponível para novas contratações.';
      toggleConfirmBtn.className = 'btn destructive sm';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar plano';
      toggleMessage.textContent = 'Tem certeza que deseja ativar o plano "' + plano.nome + '"?';
      toggleConfirmBtn.className = 'btn primary sm';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
    lockBodyScroll();
  }

  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleId = null;
    unlockBodyScroll();
  }

  document.getElementById('pln-toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('pln-toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var id = pendingToggleId;
    closeToggleAtivoDialog();
    if (id) toggleAtivo(id);
  });
  toggleOverlay.addEventListener('click', function (event) { if (event.target === toggleOverlay) closeToggleAtivoDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog(); });

  document.addEventListener('click', function (event) {
    var editBtn = event.target.closest('[data-action="editar"]');
    if (editBtn) { openEditDialog(editBtn.dataset.id); return; }
    var toggleBtn = event.target.closest('[data-action="ativar"], [data-action="desativar"]');
    if (toggleBtn) { openToggleAtivoDialog(toggleBtn.dataset.id); return; }
  });

  // ---------- Modal: Editar plano ----------
  var editOverlay = document.getElementById('pln-edit-dialog-overlay');
  var editForm = document.getElementById('pln-edit-form');
  var nomeField = document.getElementById('pln-edit-nome');
  var descricaoInput = document.getElementById('pln-edit-descricao');
  var valorInput = document.getElementById('pln-edit-valor');
  var valorAnualField = document.getElementById('pln-edit-valor-anual');
  var beneficiosInput = document.getElementById('pln-edit-beneficios');
  var statusField = document.getElementById('pln-edit-status-field');
  var currentPlanoId = null;
  var originalValorMensal = null;
  var originalValorAnual = null;

  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
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
    function setValue(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    return { setValue: setValue };
  }

  var statusDropdown = initDropdown(statusField);

  // Valor mensal e Valor anual são campos independentes, cada um com sua própria máscara de
  // moeda — editar um não recalcula o outro (a fórmula de desconto de `planos-data.js` só
  // sugere o valor anual inicial de cada plano, não trava os dois campos juntos na edição).
  function attachCurrencyMask(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      var centavos = digits ? Number(digits) : 0;
      input.value = centavos ? formatCentavosBRL(centavos) : '';
      input.dataset.centavos = String(centavos);
    });
  }
  attachCurrencyMask(valorInput);
  attachCurrencyMask(valorAnualField);

  // ---------- Bloqueio de scroll da página enquanto um modal está aberto — a rolagem
  // acontece só dentro do `.body` do Dialog (já tem `overflow-y:auto` no componente).
  // Contador pra suportar o caso de 2 modais abertos ao mesmo tempo (confirmação de preço
  // abre por cima do modal de Editar, sem fechá-lo primeiro). ----------
  var scrollLockCount = 0;
  function lockBodyScroll() {
    if (scrollLockCount === 0) document.body.style.overflow = 'hidden';
    scrollLockCount++;
  }
  function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) document.body.style.overflow = '';
  }

  function openEditDialog(id) {
    var plano = window.NiveloAdminPlanos.findById(id);
    if (!plano) return;
    currentPlanoId = id;
    originalValorMensal = plano.valorMensal;
    originalValorAnual = plano.valorAnual;

    nomeField.value = plano.nome;
    descricaoInput.value = plano.descricao;
    var centavos = Math.round(plano.valorMensal * 100);
    valorInput.value = formatCentavosBRL(centavos);
    valorInput.dataset.centavos = String(centavos);
    var centavosAnual = Math.round(plano.valorAnual * 100);
    valorAnualField.value = formatCentavosBRL(centavosAnual);
    valorAnualField.dataset.centavos = String(centavosAnual);
    beneficiosInput.value = plano.beneficios.join('\n');
    statusDropdown.setValue(plano.ativo ? 'ativo' : 'inativo', plano.ativo ? 'Ativo' : 'Inativo');

    editOverlay.hidden = false;
    lockBodyScroll();
  }

  function closeEditDialog() {
    editOverlay.hidden = true;
    currentPlanoId = null;
    unlockBodyScroll();
  }

  document.getElementById('pln-edit-dialog-close').addEventListener('click', closeEditDialog);
  document.getElementById('pln-edit-dialog-cancel').addEventListener('click', closeEditDialog);
  editOverlay.addEventListener('click', function (event) { if (event.target === editOverlay) closeEditDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !editOverlay.hidden) closeEditDialog(); });

  function applyEdit() {
    var novoValorMensal = Number(valorInput.dataset.centavos || '0') / 100;
    var novoValorAnual = Number(valorAnualField.dataset.centavos || '0') / 100;
    var beneficios = beneficiosInput.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var plano = window.NiveloAdminPlanos.update(currentPlanoId, {
      descricao: descricaoInput.value.trim(),
      valorMensal: novoValorMensal,
      valorAnual: novoValorAnual,
      beneficios: beneficios,
      ativo: statusField.dataset.value === 'ativo'
    });
    closeEditDialog();
    renderAll();
    showSuccessToast('Plano atualizado com sucesso.', '"' + plano.nome + '" foi atualizado.');
  }

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var novoValorMensal = Number(valorInput.dataset.centavos || '0') / 100;
    var novoValorAnual = Number(valorAnualField.dataset.centavos || '0') / 100;
    if (novoValorMensal !== originalValorMensal || novoValorAnual !== originalValorAnual) {
      openPriceConfirmDialog();
      return;
    }
    applyEdit();
  });

  // ---------- Confirmação de alteração de preço ----------
  var priceOverlay = document.getElementById('pln-price-dialog-overlay');

  function openPriceConfirmDialog() {
    priceOverlay.hidden = false;
    lockBodyScroll();
  }
  function closePriceConfirmDialog() {
    priceOverlay.hidden = true;
    unlockBodyScroll();
  }
  document.getElementById('pln-price-dialog-close').addEventListener('click', closePriceConfirmDialog);
  document.getElementById('pln-price-dialog-cancel').addEventListener('click', closePriceConfirmDialog);
  document.getElementById('pln-price-dialog-confirm').addEventListener('click', function () {
    closePriceConfirmDialog();
    applyEdit();
  });
  priceOverlay.addEventListener('click', function (event) { if (event.target === priceOverlay) closePriceConfirmDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !priceOverlay.hidden) closePriceConfirmDialog(); });

  renderAll();
})();
