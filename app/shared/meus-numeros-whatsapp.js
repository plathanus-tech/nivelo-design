(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Toast de sucesso (mesmo padrão Feedback-como-toast de todo
  // o sistema) ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success mnw-toast';
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

  // ---------- Ícone do WhatsApp reaproveitado (mesmo SVG inline já usado
  // no item "Suporte" da Sidebar — exceção documentada à regra "sem SVG
  // inline", ver app/CLAUDE.md) ----------
  var WHATSAPP_ICON_SVG =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  // ---------- Renderização da lista a partir do catálogo central
  // (window.NiveloWhatsappNumeros) ----------
  var listEl = document.getElementById('mnw-list');
  var emptyEl = document.getElementById('mnw-empty');

  function buildItemHTML(registro) {
    return (
      '<li class="mnw-item" id="mnw-item-' + registro.id + '" data-id="' + registro.id + '">' +
        '<span class="mnw-item-icon">' + WHATSAPP_ICON_SVG + '</span>' +
        '<span class="mnw-item-numero text-body-m">WhatsApp ' + window.NiveloWhatsappNumeros.formatNumero(registro.numero) + '</span>' +
        '<button type="button" class="actionBtn mnw-item-remove" data-action="remover" aria-label="Remover número">' +
          '<i data-lucide="trash-2" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Remover</span>' +
        '</button>' +
      '</li>'
    );
  }

  function render() {
    var registros = window.NiveloWhatsappNumeros.list();
    listEl.innerHTML = registros.map(buildItemHTML).join('');
    emptyEl.hidden = registros.length > 0;
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica
  // position:fixed via JS + reparent pra document.body, já usada em todo
  // o sistema) ----------
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

  // ---------- Máscara: '+55 (DDD) NNNNN-NNNN' — mesmo raciocínio de
  // formatPhone() (cadastro.js/novo-cadastro.js), com o DDI 55 fixo na
  // frente (WhatsApp sempre com código do país). ----------
  function maskWhatsapp(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.indexOf('55') === 0 && digits.length > 11) digits = digits.slice(2);
    digits = digits.slice(0, 11);
    var out = '+55';
    if (digits.length > 0) out += ' (' + digits.slice(0, 2);
    if (digits.length >= 2) out += ') ' + digits.slice(2, digits.length > 10 ? 7 : 6);
    if (digits.length > 6) out += '-' + digits.slice(digits.length > 10 ? 7 : 6, 11);
    return out;
  }

  function isValidWhatsapp(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.indexOf('55') === 0) digits = digits.slice(2);
    return digits.length === 10 || digits.length === 11;
  }

  // ---------- Modal: Adicionar número de WhatsApp ----------
  var formOverlay = document.getElementById('mnw-form-dialog-overlay');
  var form = document.getElementById('mnw-form');
  var numeroInput = document.getElementById('mnw-numero');
  var numeroField = document.getElementById('mnw-numero-field');
  var numeroErrorTextEl = document.getElementById('mnw-numero-error-text');

  function setNumeroError(message) {
    numeroErrorTextEl.textContent = message;
    numeroField.classList.add('error');
  }
  function clearNumeroError() {
    numeroField.classList.remove('error');
  }

  numeroInput.addEventListener('input', function (event) {
    var cursorWasAtEnd = event.target.selectionStart === event.target.value.length;
    numeroInput.value = maskWhatsapp(numeroInput.value);
    if (cursorWasAtEnd) numeroInput.setSelectionRange(numeroInput.value.length, numeroInput.value.length);
    if (numeroField.classList.contains('error')) clearNumeroError();
  });

  function openFormDialog() {
    clearNumeroError();
    numeroInput.value = '+55 ';
    formOverlay.hidden = false;
    numeroInput.focus();
  }
  function closeFormDialog() {
    formOverlay.hidden = true;
  }

  function validateForm() {
    var numero = numeroInput.value.trim();
    if (!numero || numero === '+55') {
      setNumeroError('Informe o número de WhatsApp.');
      return false;
    }
    if (!isValidWhatsapp(numero)) {
      setNumeroError('Informe um número de WhatsApp válido.');
      return false;
    }
    if (window.NiveloWhatsappNumeros.isNumeroDuplicado(numero)) {
      setNumeroError('Este número já está cadastrado.');
      return false;
    }
    clearNumeroError();
    return true;
  }

  // Nota de escopo: em produção, o backend dispararia aqui a mensagem de
  // boas-vindas via integração real do WhatsApp, uma única vez, no
  // instante em que o número é vinculado com sucesso. Este protótipo não
  // tem backend/API — simulado apenas via log, sem nenhuma chamada real.
  function simulateWelcomeMessage(registro) {
    var mensagem =
      'Olá! 👋 Eu sou o assistente da Nivelo.\n' +
      'Agora você pode usar este WhatsApp para facilitar sua rotina no campo.\n' +
      '📄 Posso ajudar você a solicitar notas fiscais.\n' +
      '📝 Registrar informações no Caderno de Campo.\n' +
      'É só me mandar uma mensagem contando o que você precisa. Estou aqui para ajudar!';
    if (window.console && window.console.info) {
      window.console.info('[Assistente IA] Mensagem de boas-vindas enviada (simulado) para ' + window.NiveloWhatsappNumeros.formatNumero(registro.numero) + ':\n' + mensagem);
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    var registro = window.NiveloWhatsappNumeros.add({ numero: numeroInput.value.trim() });
    simulateWelcomeMessage(registro);

    closeFormDialog();
    render();
    showSuccessToast('Número de WhatsApp adicionado com sucesso.', 'O número já pode conversar com o Assistente de IA.');
  });

  document.getElementById('mnw-form-dialog-close').addEventListener('click', closeFormDialog);
  document.getElementById('mnw-form-dialog-cancel').addEventListener('click', closeFormDialog);
  formOverlay.addEventListener('click', function (event) { if (event.target === formOverlay) closeFormDialog(); });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!formOverlay.hidden) closeFormDialog();
    if (!removerOverlay.hidden) closeRemoverDialog();
  });

  document.getElementById('new-numero-btn').addEventListener('click', openFormDialog);
  var emptyBtn = document.getElementById('mnw-empty-btn');
  if (emptyBtn) emptyBtn.addEventListener('click', openFormDialog);

  // ---------- Modal: Remover número de WhatsApp ----------
  var removerOverlay = document.getElementById('mnw-remover-dialog-overlay');
  var removerState = { id: null };
  var removerConfirmBtn = document.getElementById('mnw-remover-dialog-confirm');

  function openRemoverDialog(id) {
    removerState.id = id;
    removerOverlay.hidden = false;
  }
  function closeRemoverDialog() {
    removerOverlay.hidden = true;
    removerState.id = null;
  }

  document.getElementById('mnw-remover-dialog-close').addEventListener('click', closeRemoverDialog);
  document.getElementById('mnw-remover-dialog-cancel').addEventListener('click', closeRemoverDialog);
  removerOverlay.addEventListener('click', function (event) { if (event.target === removerOverlay) closeRemoverDialog(); });

  removerConfirmBtn.addEventListener('click', function () {
    var id = removerState.id;
    window.NiveloWhatsappNumeros.remove(id);
    closeRemoverDialog();
    render();
    showSuccessToast('Número removido com sucesso.', 'Este número não pode mais conversar com o Assistente de IA.');
  });

  // ---------- Ações da lista (delegado em `document`) ----------
  listEl.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var item = btn.closest('.mnw-item');
    if (!item) return;
    var id = item.dataset.id;
    if (btn.dataset.action === 'remover') openRemoverDialog(id);
  });

  render();
})();
