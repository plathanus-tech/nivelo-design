(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // naturezas-operacao.js/categorias-financeiras.js/produtos.js). ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) { document.body.appendChild(tip); btn.__tip = tip; }
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
    toast.className = 'alert success certdigital-toast';
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

  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.certificadodigital.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.certificadodigital.success');
  } catch (e) {}
  if (successMessage) showSuccessToast(successMessage);

  // Demonstração: `#state=comdados` popula a lista com 2 certificados de
  // exemplo (1 ativo, 1 expirado) — por padrão a lista nasce vazia, ver
  // comentário em certificado-digital-data.js sobre não quebrar o bloqueio
  // de emissão (padrão, sem hash) de Nova Nota Fiscal.
  if (/state=comdados/.test(location.hash)) {
    window.NiveloCertificadoDigital.seedExemplo();
  }

  // ---------- Formatação ----------
  function formatData(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  var STATUS_BADGE = {
    'ativo': { status: 'success', label: 'Ativo' },
    'proximo-vencimento': { status: 'warning', label: 'Próximo do vencimento' },
    'expirado': { status: 'error', label: 'Expirado' },
    'revogado': { status: 'indigo', label: 'Revogado' }
  };
  var ORIGEM_LABEL = { importado: 'Importado', parceiro: 'Emitido com parceiro' };

  // ---------- Tabela ----------
  var tbody = document.getElementById('cert-tbody');
  var emptyState = document.getElementById('cert-empty-state');
  var cardsContainer = document.getElementById('cert-cards');

  function buildActionsHTML(certificado) {
    var actions =
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="visualizar" aria-label="Visualizar"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Visualizar</span></button>' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn" data-action="excluir" aria-label="Excluir"><i data-lucide="trash-2" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Excluir</span></button>' +
      '</div>';
    return actions;
  }

  function buildRowHTML(certificado) {
    var badge = STATUS_BADGE[certificado.status] || STATUS_BADGE.ativo;
    return (
      '<tr class="tr" id="cert-row-' + certificado.codigo + '" data-codigo="' + certificado.codigo + '">' +
        '<td class="td">' + certificado.nome + '</td>' +
        '<td class="td">' + certificado.tipo + '</td>' +
        '<td class="td">' + certificado.titular + '</td>' +
        '<td class="td">' + certificado.documento + '</td>' +
        '<td class="td">' + formatData(certificado.dataValidade) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td">' + (ORIGEM_LABEL[certificado.origem] || certificado.origem) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML(certificado) + '</td>' +
      '</tr>'
    );
  }

  function cellText(cell) { return cell.textContent.trim(); }
  function buildCardHTML(row) {
    var actionsHTML = row.children[7].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card certdigital-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="certdigital-mobile-card-header">' +
          '<div class="certdigital-mobile-card-name text-subtitle-s">' + cellText(row.children[0]) + '</div>' +
          row.children[5].innerHTML +
        '</div>' +
        '<dl class="certdigital-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Tipo</dt><dd class="text-12-regular">' + cellText(row.children[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Origem</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Titular</dt><dd class="text-12-regular">' + cellText(row.children[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">CPF/CNPJ</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Validade</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions certdigital-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  function render() {
    var certificados = window.NiveloCertificadoDigital.list();
    tbody.innerHTML = certificados.map(buildRowHTML).join('');
    emptyState.hidden = certificados.length > 0;
    if (window.lucide) lucide.createIcons();
    renderCards();
  }

  // ---------- Ações da tabela ----------
  function openEditScreen(codigo) {
    window.location.href = 'importar-certificado.html?codigo=' + encodeURIComponent(codigo);
  }
  // "Visualizar" navega pra uma tela própria (mesmo padrão de "Ver
  // detalhes" já usado em Estoque/Talhão — nunca um Dialog modal).
  function openDetalheScreen(codigo) {
    window.location.href = 'certificado-detalhe.html#codigo=' + encodeURIComponent(codigo);
  }

  // ---------- Excluir ----------
  var excluirOverlay = document.getElementById('excluir-dialog-overlay');
  var excluirMessage = document.getElementById('excluir-dialog-message');
  var pendingExcluirCodigo = null;
  function openExcluirDialog(codigo) {
    var certificado = window.NiveloCertificadoDigital.findByCodigo(codigo);
    if (!certificado) return;
    pendingExcluirCodigo = codigo;
    excluirMessage.textContent = 'Tem certeza que deseja excluir "' + certificado.nome + '"? Esta ação não pode ser desfeita.';
    excluirOverlay.hidden = false;
  }
  function closeExcluirDialog() { excluirOverlay.hidden = true; pendingExcluirCodigo = null; }
  document.getElementById('excluir-dialog-close').addEventListener('click', closeExcluirDialog);
  document.getElementById('excluir-dialog-cancelar').addEventListener('click', closeExcluirDialog);
  document.getElementById('excluir-dialog-confirmar').addEventListener('click', function () {
    var codigo = pendingExcluirCodigo;
    if (!codigo) return;
    var certificado = window.NiveloCertificadoDigital.findByCodigo(codigo);
    window.NiveloCertificadoDigital.remove(codigo);
    closeExcluirDialog();
    render();
    showSuccessToast('Certificado excluído com sucesso.', certificado ? ('"' + certificado.nome + '" foi removido da lista.') : '');
  });
  excluirOverlay.addEventListener('click', function (event) {
    if (event.target === excluirOverlay) closeExcluirDialog();
  });

  function handleRowAction(action, codigo) {
    if (action === 'visualizar') openDetalheScreen(codigo);
    else if (action === 'editar') openEditScreen(codigo);
    else if (action === 'excluir') openExcluirDialog(codigo);
  }
  tbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    handleRowAction(btn.dataset.action, btn.closest('.tr').dataset.codigo);
  });
  cardsContainer.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var cardEl = btn.closest('[data-row-id]');
    var row = document.getElementById(cardEl.dataset.rowId);
    handleRowAction(btn.dataset.action, row.dataset.codigo);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!excluirOverlay.hidden) closeExcluirDialog();
  });

  // ---------- Emitir novo certificado (via parceiro) ----------
  // Sem modal/config própria — parceiro é config administrativa
  // (`DEFAULT_PARCEIRO` em certificado-digital-data.js), nunca exposta ao
  // cliente. Abre a URL direto e grava o acesso.
  function emitirComParceiro() {
    var parceiro = window.NiveloCertificadoDigital.getParceiro();
    if (!parceiro || !parceiro.url) return;
    window.open(parceiro.url, parceiro.abrirNovaAba === false ? '_self' : '_blank', 'noopener');
    window.NiveloCertificadoDigital.registrarAcessoParceiro('Miguel Silva');
  }

  // ---------- Menu "+ Novo Certificado" (reaproveita .menu/.option de
  // Dropdown.module.css, ancorado no botão primário). ----------
  var newCertWrapper = document.getElementById('new-cert-menu');
  var newCertBtn = document.getElementById('new-cert-btn');
  var newCertMenu = newCertWrapper.querySelector('[data-dropdown-menu]');

  function positionNewCertMenu() {
    var rect = newCertBtn.getBoundingClientRect();
    newCertMenu.style.position = 'fixed';
    newCertMenu.style.top = (rect.bottom + 4) + 'px';
    newCertMenu.style.left = 'auto';
    newCertMenu.style.right = (window.innerWidth - rect.right) + 'px';
    newCertMenu.style.width = 'auto';
  }
  function closeNewCertMenu() {
    newCertWrapper.classList.remove('open');
    newCertBtn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', closeNewCertMenu, true);
    window.removeEventListener('resize', closeNewCertMenu);
  }
  function openNewCertMenu() {
    newCertWrapper.classList.add('open');
    newCertBtn.setAttribute('aria-expanded', 'true');
    positionNewCertMenu();
    window.addEventListener('scroll', closeNewCertMenu, true);
    window.addEventListener('resize', closeNewCertMenu);
  }
  newCertBtn.addEventListener('click', function () {
    if (newCertWrapper.classList.contains('open')) closeNewCertMenu(); else openNewCertMenu();
  });
  document.addEventListener('click', function (event) {
    if (!newCertWrapper.contains(event.target)) closeNewCertMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeNewCertMenu();
  });
  newCertMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    closeNewCertMenu();
    if (optionEl.dataset.value === 'importar') {
      window.location.href = 'importar-certificado.html';
    } else if (optionEl.dataset.value === 'emitir') {
      emitirComParceiro();
    }
  });

  // ---------- Estado vazio: 2 opções (Importar / Emitir) ----------
  document.getElementById('empty-importar-btn').addEventListener('click', function () {
    window.location.href = 'importar-certificado.html';
  });
  document.getElementById('empty-emitir-btn').addEventListener('click', emitirComParceiro);

  render();
})();
