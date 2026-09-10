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

  // ---------- Ações (Editar + Preços + Ativar/Desativar), mesmo ícone+tooltip padrão já usado
  // em Usuários (ver `admin/shared/usuarios.js`) — Ativar/Desativar sempre exige confirmação
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
        '<button type="button" class="actionBtn" data-action="precos" data-id="' + plano.id + '" aria-label="Editar preços por hectare">' +
          '<i data-lucide="dollar-sign" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Preços</span>' +
        '</button>' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" data-id="' + plano.id + '" aria-label="' + toggle.label + ' plano">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  // Faixa de preços (coluna resumida da tabela): menor/maior valor mensal-equivalente entre
  // as 4 faixas, nunca os 12+ valores individuais — o detalhe completo mora só no modal de
  // "Preços" (ver openFaixasDialog), pra listagem principal não ficar poluída.
  function buildFaixaPrecoHTML(plano) {
    var range = window.NiveloAdminPlanos.faixaRange(plano);
    return (
      '<span class="pln-preco-range">' + formatValorMensal(range.min) + ' a ' + formatValorMensal(range.max) + '</span>' +
      '<span class="pln-preco-note">/mês, conforme hectares</span>'
    );
  }

  function buildRowHTML(plano) {
    var statusBadge = plano.ativo ? { status: 'success', label: 'Ativo' } : { status: 'warning', label: 'Inativo' };
    return (
      '<tr class="tr" id="pln-row-' + plano.id + '" data-id="' + plano.id + '">' +
        '<td class="td">' + plano.nome + '</td>' +
        '<td class="td pln-descricao-cell" title="' + plano.descricao + '">' + plano.descricao + '</td>' +
        '<td class="td">' + buildFaixaPrecoHTML(plano) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span></td>' +
        '<td class="td">' + plano.assinantesAtivos + '</td>' +
        '<td class="td">' + formatDataBR(plano.ultimaAlteracao) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(plano) + '</td>' +
      '</tr>'
    );
  }

  function buildCardHTML(plano) {
    var statusBadge = plano.ativo ? { status: 'success', label: 'Ativo' } : { status: 'warning', label: 'Inativo' };
    var range = window.NiveloAdminPlanos.faixaRange(plano);
    return (
      '<div class="card pln-mobile-card" data-row-id="pln-row-' + plano.id + '">' +
        '<div class="pln-mobile-card-header">' +
          '<div class="pln-mobile-card-name text-subtitle-s">' + plano.nome + '</div>' +
          '<span class="badge" data-status="' + statusBadge.status + '"><span class="badgeDot"></span>' + statusBadge.label + '</span>' +
        '</div>' +
        '<div class="pln-mobile-card-desc text-body-xs">' + plano.descricao + '</div>' +
        '<dl class="pln-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Faixa de preços</dt><dd class="text-12-regular">' + formatValorMensal(range.min) + ' a ' + formatValorMensal(range.max) + '/mês</dd></div>' +
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
    var precosBtn = event.target.closest('[data-action="precos"]');
    if (precosBtn) { openFaixasDialog(precosBtn.dataset.id); return; }
    var toggleBtn = event.target.closest('[data-action="ativar"], [data-action="desativar"]');
    if (toggleBtn) { openToggleAtivoDialog(toggleBtn.dataset.id); return; }
  });

  // ---------- Bloqueio de scroll da página enquanto um modal está aberto — a rolagem
  // acontece só dentro do `.body` do Dialog (já tem `overflow-y:auto` no componente).
  // Contador pra suportar o caso de 2 modais abertos ao mesmo tempo (confirmação de preço
  // abre por cima do modal de Preços, sem fechá-lo primeiro). ----------
  var scrollLockCount = 0;
  function lockBodyScroll() {
    if (scrollLockCount === 0) document.body.style.overflow = 'hidden';
    scrollLockCount++;
  }
  function unlockBodyScroll() {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) document.body.style.overflow = '';
  }

  // ---------- Modal: Editar plano (descrição/benefícios/status — preço não mora mais aqui,
  // ver modal de Preços abaixo) ----------
  var editOverlay = document.getElementById('pln-edit-dialog-overlay');
  var editForm = document.getElementById('pln-edit-form');
  var nomeField = document.getElementById('pln-edit-nome');
  var descricaoInput = document.getElementById('pln-edit-descricao');
  var beneficiosInput = document.getElementById('pln-edit-beneficios');
  var statusField = document.getElementById('pln-edit-status-field');
  var currentPlanoId = null;

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

  function openEditDialog(id) {
    var plano = window.NiveloAdminPlanos.findById(id);
    if (!plano) return;
    currentPlanoId = id;

    nomeField.value = plano.nome;
    descricaoInput.value = plano.descricao;
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

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var beneficios = beneficiosInput.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    var plano = window.NiveloAdminPlanos.update(currentPlanoId, {
      descricao: descricaoInput.value.trim(),
      beneficios: beneficios,
      ativo: statusField.dataset.value === 'ativo'
    });
    closeEditDialog();
    renderAll();
    showSuccessToast('Plano atualizado com sucesso.', '"' + plano.nome + '" foi atualizado.');
  });

  // ---------- Modal: Preços por faixa de hectares ----------
  // Corpo montado dinamicamente porque os campos variam conforme o plano tenha ou não
  // cobrança mensal (`plano.cobrancaMensal` — só o Fiscal não tem). Cada faixa mostra os 2
  // únicos valores editáveis (Valor mensal equivalente do anual + Valor da cobrança mensal,
  // quando existir) com os valores derivados (Total cobrado anualmente/Economia anual) ao
  // lado, sempre como texto somente-leitura recalculado ao vivo — nunca um campo editável
  // separado, pra nunca divergir do que está em `planos-data.js` (mesma fonte de verdade).
  var faixasOverlay = document.getElementById('pln-faixas-dialog-overlay');
  var faixasTitle = document.getElementById('pln-faixas-dialog-title');
  var faixasForm = document.getElementById('pln-faixas-form');
  var faixasList = document.getElementById('pln-faixas-list');
  var faixasPlanoId = null;
  var faixasOriginalSnapshot = null;

  function centavosFromValor(valor) { return Math.round(valor * 100); }

  function buildFaixaFieldHTML(faixaId, faixaLabel, faixaPrecos, cobrancaMensal) {
    var anualCentavos = centavosFromValor(faixaPrecos.anualMensal);
    var html =
      '<div class="pln-faixa-block" data-faixa="' + faixaId + '">' +
        '<h3 class="pln-faixa-title text-subtitle-s">' + faixaLabel + '</h3>' +
        '<div class="pln-faixa-col pln-faixa-col--anual">' +
          '<span class="pln-faixa-col-label">' + (cobrancaMensal ? 'Anual' : 'Somente anual') + '</span>' +
          '<div class="wrapper">' +
            '<label class="label">Valor mensal equivalente</label>' +
            '<div class="inputWrap">' +
              '<input class="input pln-faixa-input" type="text" inputmode="numeric" data-field="anualMensal" value="' + formatCentavosBRL(anualCentavos) + '" data-centavos="' + anualCentavos + '" />' +
            '</div>' +
          '</div>' +
          '<p class="pln-faixa-computed">Cobrado anualmente: <strong data-computed="anualTotal">' + formatValorMensal(faixaPrecos.anualTotal) + '</strong></p>' +
          (cobrancaMensal ? '<p class="pln-faixa-computed pln-faixa-economia">Economia anual: <strong data-computed="economia">' + formatValorMensal(faixaPrecos.economia) + '</strong></p>' : '') +
        '</div>';
    if (cobrancaMensal) {
      var mensalCentavos = centavosFromValor(faixaPrecos.mensal);
      html +=
        '<div class="pln-faixa-col pln-faixa-col--mensal">' +
          '<span class="pln-faixa-col-label">Mensal</span>' +
          '<div class="wrapper">' +
            '<label class="label">Valor mensal</label>' +
            '<div class="inputWrap">' +
              '<input class="input pln-faixa-input" type="text" inputmode="numeric" data-field="mensal" value="' + formatCentavosBRL(mensalCentavos) + '" data-centavos="' + mensalCentavos + '" />' +
            '</div>' +
          '</div>' +
          '<p class="pln-faixa-computed pln-faixa-mensal-note">Cobrança mensal, sem desconto.</p>' +
        '</div>';
    }
    html += '</div>';
    return html;
  }

  // Recalcula (ao vivo, sem tocar em `planos-data.js`) os textos derivados de 1 faixa a
  // partir dos 2 inputs — mesma fórmula de `recalcularFaixa`, só pra preview instantâneo
  // enquanto o admin digita; a gravação de verdade só acontece no Salvar (`updateFaixa`).
  function recalcularBlocoNaTela(blockEl, cobrancaMensal) {
    var anualInput = blockEl.querySelector('[data-field="anualMensal"]');
    var anualMensal = Number(anualInput.dataset.centavos || '0') / 100;
    var anualTotal = Math.round(anualMensal * 12 * 100) / 100;
    blockEl.querySelector('[data-computed="anualTotal"]').textContent = formatValorMensal(anualTotal);
    if (cobrancaMensal) {
      var mensalInput = blockEl.querySelector('[data-field="mensal"]');
      var mensal = Number(mensalInput.dataset.centavos || '0') / 100;
      var economia = Math.round((mensal * 12 - anualTotal) * 100) / 100;
      blockEl.querySelector('[data-computed="economia"]').textContent = formatValorMensal(economia);
    }
  }

  function attachCurrencyMask(input, onInput) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      var centavos = digits ? Number(digits) : 0;
      input.value = centavos ? formatCentavosBRL(centavos) : '';
      input.dataset.centavos = String(centavos);
      if (onInput) onInput();
    });
  }

  function openFaixasDialog(id) {
    var plano = window.NiveloAdminPlanos.findById(id);
    if (!plano) return;
    faixasPlanoId = id;
    faixasTitle.textContent = 'Preços por faixa de hectares — ' + plano.nome;

    var faixas = window.NiveloAdminPlanos.listFaixas(id);
    faixasList.innerHTML = faixas.map(function (faixa) {
      return buildFaixaFieldHTML(faixa.id, faixa.label, faixa, plano.cobrancaMensal);
    }).join('');

    // Snapshot pra decidir, no Salvar, se algum valor realmente mudou (só então pede
    // confirmação — mesmo critério que o modal de Editar plano já usava pro preço antigo).
    faixasOriginalSnapshot = faixas.map(function (faixa) {
      return { id: faixa.id, anualMensal: faixa.anualMensal, mensal: faixa.mensal };
    });

    var blocks = Array.prototype.slice.call(faixasList.querySelectorAll('.pln-faixa-block'));
    blocks.forEach(function (blockEl) {
      var recalc = function () { recalcularBlocoNaTela(blockEl, plano.cobrancaMensal); };
      attachCurrencyMask(blockEl.querySelector('[data-field="anualMensal"]'), recalc);
      var mensalInput = blockEl.querySelector('[data-field="mensal"]');
      if (mensalInput) attachCurrencyMask(mensalInput, recalc);
    });

    faixasOverlay.hidden = false;
    lockBodyScroll();
  }

  function closeFaixasDialog() {
    faixasOverlay.hidden = true;
    faixasPlanoId = null;
    faixasOriginalSnapshot = null;
    unlockBodyScroll();
  }

  document.getElementById('pln-faixas-dialog-close').addEventListener('click', closeFaixasDialog);
  document.getElementById('pln-faixas-dialog-cancel').addEventListener('click', closeFaixasDialog);
  faixasOverlay.addEventListener('click', function (event) { if (event.target === faixasOverlay) closeFaixasDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !faixasOverlay.hidden) closeFaixasDialog(); });

  function coletarFaixasDoFormulario() {
    var blocks = Array.prototype.slice.call(faixasList.querySelectorAll('.pln-faixa-block'));
    return blocks.map(function (blockEl) {
      var anualInput = blockEl.querySelector('[data-field="anualMensal"]');
      var mensalInput = blockEl.querySelector('[data-field="mensal"]');
      return {
        id: blockEl.dataset.faixa,
        anualMensal: Number(anualInput.dataset.centavos || '0') / 100,
        mensal: mensalInput ? Number(mensalInput.dataset.centavos || '0') / 100 : null
      };
    });
  }

  function houveMudancaDePreco(novasFaixas) {
    for (var i = 0; i < novasFaixas.length; i++) {
      var original = faixasOriginalSnapshot[i];
      var nova = novasFaixas[i];
      if (nova.anualMensal !== original.anualMensal) return true;
      if (original.mensal !== null && nova.mensal !== original.mensal) return true;
    }
    return false;
  }

  function applyFaixas() {
    var novasFaixas = coletarFaixasDoFormulario();
    novasFaixas.forEach(function (faixa) {
      window.NiveloAdminPlanos.updateFaixa(faixasPlanoId, faixa.id, { anualMensal: faixa.anualMensal, mensal: faixa.mensal });
    });
    var plano = window.NiveloAdminPlanos.findById(faixasPlanoId);
    closeFaixasDialog();
    renderAll();
    showSuccessToast('Preços atualizados com sucesso.', 'As faixas de hectares de "' + plano.nome + '" foram atualizadas.');
  }

  faixasForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var novasFaixas = coletarFaixasDoFormulario();
    if (houveMudancaDePreco(novasFaixas)) {
      openPriceConfirmDialog(applyFaixas);
      return;
    }
    applyFaixas();
  });

  // ---------- Confirmação de alteração de preço — reaproveitada pelo modal de Preços (o
  // modal de Editar plano não mexe mais em valor). `onConfirm` é a ação a aplicar depois da
  // confirmação, guardada só enquanto o modal estiver aberto. ----------
  var priceOverlay = document.getElementById('pln-price-dialog-overlay');
  var pendingPriceConfirm = null;

  function openPriceConfirmDialog(onConfirm) {
    pendingPriceConfirm = onConfirm;
    priceOverlay.hidden = false;
    lockBodyScroll();
  }
  function closePriceConfirmDialog() {
    priceOverlay.hidden = true;
    pendingPriceConfirm = null;
    unlockBodyScroll();
  }
  document.getElementById('pln-price-dialog-close').addEventListener('click', closePriceConfirmDialog);
  document.getElementById('pln-price-dialog-cancel').addEventListener('click', closePriceConfirmDialog);
  document.getElementById('pln-price-dialog-confirm').addEventListener('click', function () {
    var onConfirm = pendingPriceConfirm;
    closePriceConfirmDialog();
    if (onConfirm) onConfirm();
  });
  priceOverlay.addEventListener('click', function (event) { if (event.target === priceOverlay) closePriceConfirmDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !priceOverlay.hidden) closePriceConfirmDialog(); });

  renderAll();
})();
