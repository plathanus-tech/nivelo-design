/* ══════════════════════════════════════════════════════════
   VALIDAR TELEFONE — parte do Step 1 do fluxo de Criar Conta
   Reaproveita exatamente o mesmo padrão de OTP já usado no fluxo de
   recuperação de senha (`codigo-verificacao.js`): 6 dígitos, avanço
   automático, colar, contagem regressiva, reenvio, botão desabilitado
   até completar os 6 dígitos, sem fundo vermelho no estado de erro.
   Diferenças de propósito: sem o banner de "resposta neutra de
   segurança" (não se aplica aqui, não estamos revelando/negando conta
   existente) e sem os estados de "muitas tentativas"/"erro de
   comunicação" (não pedidos para este fluxo).
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var VALID_CODE = '111111';
  var COUNTDOWN_SECONDS = 300;

  var form = document.getElementById('signup-otp-form');
  var otpGroup = document.getElementById('signup-otp-group');
  var otpInputs = Array.prototype.slice.call(document.querySelectorAll('.otp-digit'));
  var otpErrorText = document.querySelector('.otp-error-text');
  var countdownWrap = document.getElementById('signup-otp-countdown');
  var countdownTimeEl = document.getElementById('signup-otp-countdown-time');
  var resendBtn = document.getElementById('signup-otp-resend-btn');
  var submitBtn = document.getElementById('signup-otp-submit');
  var phoneEl = document.getElementById('signup-otp-phone');
  var expiredBanner = document.getElementById('signup-otp-expired-banner');

  var secondsLeft = COUNTDOWN_SECONDS;
  var timerId = null;

  // ---------- Telefone mascarado ----------
  function maskPhone(raw) {
    var digits = (raw || '').replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) digits = '11987654321';
    var ddd = digits.slice(0, 2);
    var rest = digits.slice(2);
    var last4 = rest.slice(-4);
    var maskedLen = rest.length - 4;
    var masked = new Array(maskedLen + 1).join('•');
    return '(' + ddd + ') ' + masked + '-' + last4;
  }

  var storedPhone = null;
  try { storedPhone = sessionStorage.getItem('nivelo.signup.phone'); } catch (e) {}
  phoneEl.textContent = maskPhone(storedPhone);

  function hideAllBanners() {
    expiredBanner.hidden = true;
  }

  function setOtpError(hasError, message) {
    otpGroup.classList.toggle('error', hasError);
    if (message) otpErrorText.textContent = message;
    otpInputs.forEach(function (input) {
      input.setAttribute('aria-invalid', String(hasError));
    });
  }

  // ---------- Contagem regressiva ----------
  function formatTime(total) {
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function tick() {
    secondsLeft -= 1;
    countdownTimeEl.textContent = formatTime(Math.max(secondsLeft, 0));
    countdownWrap.classList.toggle('is-ending', secondsLeft <= 30 && secondsLeft > 0);
    if (secondsLeft <= 0) {
      stopTimer();
      goToExpired();
    }
  }

  function startTimer() {
    stopTimer();
    secondsLeft = COUNTDOWN_SECONDS;
    countdownTimeEl.textContent = formatTime(secondsLeft);
    countdownWrap.classList.remove('is-ending');
    timerId = window.setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  // ---------- OTP: digitação, avanço automático, colar ----------
  function getCode() {
    return otpInputs.map(function (i) { return i.value; }).join('');
  }

  function clearOtp() {
    otpInputs.forEach(function (i) { i.value = ''; });
    setOtpError(false);
    updateSubmitState();
  }

  function setOtpDisabled(disabled) {
    otpInputs.forEach(function (i) { i.disabled = disabled; });
  }

  // Botão só fica clicável com os 6 dígitos preenchidos, exceto no estado
  // "expirado" onde o mesmo botão vira a ação de reenvio.
  function updateSubmitState() {
    var currentState = form.getAttribute('data-state');
    if (currentState === 'expired') {
      submitBtn.disabled = false;
      return;
    }
    submitBtn.disabled = getCode().length !== 6;
  }

  otpInputs.forEach(function (input, index) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      if (otpGroup.classList.contains('error')) setOtpError(false);
      updateSubmitState();
      if (getCode().length === 6) validateCode();
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener('paste', function (event) {
      var pasted = (event.clipboardData || window.clipboardData).getData('text');
      var digits = pasted.replace(/\D/g, '').slice(0, 6);
      if (!digits) return;
      event.preventDefault();
      digits.split('').forEach(function (digit, i) {
        if (otpInputs[i]) otpInputs[i].value = digit;
      });
      var nextIndex = Math.min(digits.length, otpInputs.length - 1);
      otpInputs[nextIndex].focus();
      updateSubmitState();
      if (getCode().length === 6) validateCode();
    });
  });

  // ---------- Validação ----------
  function validateCode() {
    var code = getCode();

    if (code.length < 6) {
      setOtpError(true, 'Digite os 6 números do código.');
      return;
    }

    if (code === VALID_CODE) {
      stopTimer();
      form.setAttribute('data-state', 'loading');
      submitBtn.disabled = true;
      setOtpDisabled(true);
      window.setTimeout(function () {
        window.location.href = 'cadastro-endereco.html';
      }, 500);
      return;
    }

    setOtpError(true, 'Código incorreto. Verifique e tente novamente.');
    clearOtp();
    otpInputs[0].focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (form.getAttribute('data-state') === 'expired') {
      resetFlow();
      return;
    }
    validateCode();
  });

  // ---------- Expirado ----------
  function goToExpired() {
    hideAllBanners();
    expiredBanner.hidden = false;
    setOtpDisabled(true);
    setOtpError(false);
    form.setAttribute('data-state', 'expired');
    updateSubmitState();
  }

  // ---------- Reenviar / reiniciar fluxo ----------
  function resetFlow() {
    hideAllBanners();
    setOtpDisabled(false);
    clearOtp();
    form.setAttribute('data-state', 'idle');
    updateSubmitState();
    startTimer();
    otpInputs[0].focus();
  }

  var resendOriginalText = resendBtn.textContent;
  function flashResendConfirmation() {
    resendBtn.disabled = true;
    resendBtn.textContent = 'Código reenviado!';
    resendBtn.classList.add('is-confirmed');
    window.setTimeout(function () {
      resendBtn.disabled = false;
      resendBtn.textContent = resendOriginalText;
      resendBtn.classList.remove('is-confirmed');
    }, 1800);
  }

  resendBtn.addEventListener('click', function () {
    resetFlow();
    flashResendConfirmation();
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | incorrect | expired
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  startTimer();

  if (state === 'incorrect') {
    otpInputs.forEach(function (i) { i.value = '9'; });
    setOtpError(true, 'Código incorreto. Verifique e tente novamente.');
  }

  if (state === 'expired') {
    stopTimer();
    secondsLeft = 0;
    countdownTimeEl.textContent = '00:00';
    goToExpired();
  }

  updateSubmitState();
})();
