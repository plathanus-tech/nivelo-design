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

  // ---------- Campo do número (direto na tela, sempre editável) ----------
  var numeroInput = document.getElementById('mnw-numero');
  var numeroField = document.getElementById('mnw-numero-field');
  var numeroErrorTextEl = document.getElementById('mnw-numero-error-text');
  var numeroHelperEl = document.getElementById('mnw-numero-helper');
  var statusBadge = document.getElementById('mnw-status-badge');
  var statusBadgeTextEl = document.getElementById('mnw-status-badge-text');
  var connectBtn = document.getElementById('mnw-connect-btn');
  var disconnectBtn = document.getElementById('mnw-disconnect-btn');

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

  // Reflete o estado atual (conectado/desconectado) no campo, na tag de
  // status e nos 2 botões de ação — chamado no load e depois de cada
  // conexão/desconexão.
  function render() {
    var conectado = window.NiveloWhatsappNumeros.isConnected();
    if (conectado) {
      var numeroFormatado = window.NiveloWhatsappNumeros.formatNumero(window.NiveloWhatsappNumeros.getNumero());
      numeroInput.value = numeroFormatado;
      statusBadge.hidden = false;
      statusBadgeTextEl.textContent = numeroFormatado + ' conectado';
      numeroHelperEl.hidden = true;
      connectBtn.textContent = 'Atualizar número';
      disconnectBtn.hidden = false;
    } else {
      numeroInput.value = '+55 ';
      statusBadge.hidden = true;
      numeroHelperEl.hidden = false;
      connectBtn.textContent = 'Conectar';
      disconnectBtn.hidden = true;
    }
  }

  function validateNumero() {
    var numero = numeroInput.value.trim();
    if (!numero || numero === '+55') {
      setNumeroError('Informe o número de WhatsApp.');
      return false;
    }
    if (!isValidWhatsapp(numero)) {
      setNumeroError('Informe um número de WhatsApp válido.');
      return false;
    }
    clearNumeroError();
    return true;
  }

  // ---------- Modal: Conectar / Atualizar número ----------
  var connectOverlay = document.getElementById('mnw-connect-dialog-overlay');
  var connectTitle = document.getElementById('mnw-connect-dialog-title');
  var connectText = document.getElementById('mnw-connect-dialog-text');
  var connectNumeroEl = document.getElementById('mnw-connect-dialog-numero');
  var connectConfirmBtn = document.getElementById('mnw-connect-dialog-confirm');

  function openConnectDialog() {
    var jaConectado = window.NiveloWhatsappNumeros.isConnected();
    var numeroFormatado = window.NiveloWhatsappNumeros.formatNumero(numeroInput.value.trim());
    connectNumeroEl.textContent = numeroFormatado;
    if (jaConectado) {
      connectTitle.textContent = 'Atualizar número de WhatsApp';
      connectText.textContent = 'Este número vai substituir o atual conectado ao Assistente de IA. O número anterior deixará de poder conversar com o Assistente:';
      connectConfirmBtn.textContent = 'Atualizar número';
    } else {
      connectTitle.textContent = 'Conectar número de WhatsApp';
      connectText.textContent = 'Você está prestes a conectar este número para conversar com o Assistente de IA:';
      connectConfirmBtn.textContent = 'Conectar';
    }
    connectOverlay.hidden = false;
  }
  function closeConnectDialog() {
    connectOverlay.hidden = true;
  }

  connectBtn.addEventListener('click', function () {
    if (!validateNumero()) return;
    openConnectDialog();
  });

  connectConfirmBtn.addEventListener('click', function () {
    var jaConectado = window.NiveloWhatsappNumeros.isConnected();
    var registro = window.NiveloWhatsappNumeros.connect(numeroInput.value.trim());
    simulateWelcomeMessage(registro);
    closeConnectDialog();
    render();
    showSuccessToast(
      jaConectado ? 'Número de WhatsApp atualizado com sucesso.' : 'Número de WhatsApp conectado com sucesso.',
      'O número já pode conversar com o Assistente de IA.'
    );
  });

  document.getElementById('mnw-connect-dialog-close').addEventListener('click', closeConnectDialog);
  document.getElementById('mnw-connect-dialog-cancel').addEventListener('click', closeConnectDialog);
  connectOverlay.addEventListener('click', function (event) { if (event.target === connectOverlay) closeConnectDialog(); });

  // Nota de escopo: em produção, o backend dispararia aqui a mensagem de
  // boas-vindas via integração real do WhatsApp, uma única vez, no
  // instante em que o número é conectado com sucesso. Este protótipo não
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

  // ---------- Modal: Desconectar número ----------
  var disconnectOverlay = document.getElementById('mnw-disconnect-dialog-overlay');
  var disconnectText = document.getElementById('mnw-disconnect-dialog-text');
  var disconnectConfirmBtn = document.getElementById('mnw-disconnect-dialog-confirm');

  function openDisconnectDialog() {
    var numeroFormatado = window.NiveloWhatsappNumeros.formatNumero(window.NiveloWhatsappNumeros.getNumero());
    disconnectText.textContent = 'Ao desconectar, o número ' + numeroFormatado + ' não poderá mais ser utilizado para conversar com o Assistente de IA até que um novo número seja conectado.';
    disconnectOverlay.hidden = false;
  }
  function closeDisconnectDialog() {
    disconnectOverlay.hidden = true;
  }

  disconnectBtn.addEventListener('click', openDisconnectDialog);
  document.getElementById('mnw-disconnect-dialog-close').addEventListener('click', closeDisconnectDialog);
  document.getElementById('mnw-disconnect-dialog-cancel').addEventListener('click', closeDisconnectDialog);
  disconnectOverlay.addEventListener('click', function (event) { if (event.target === disconnectOverlay) closeDisconnectDialog(); });

  disconnectConfirmBtn.addEventListener('click', function () {
    window.NiveloWhatsappNumeros.disconnect();
    closeDisconnectDialog();
    clearNumeroError();
    render();
    showSuccessToast('Número de WhatsApp desconectado.', 'Esse número não pode mais conversar com o Assistente de IA até que um novo número seja conectado.');
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!connectOverlay.hidden) closeConnectDialog();
    if (!disconnectOverlay.hidden) closeDisconnectDialog();
  });

  render();
})();
