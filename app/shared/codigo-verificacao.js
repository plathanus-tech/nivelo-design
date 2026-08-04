(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var VALID_CODE = '111111';
  var MAX_ATTEMPTS = 5;
  var COUNTDOWN_SECONDS = 300;

  var form = document.getElementById('otp-form');
  var otpGroup = document.getElementById('otp-group');
  var otpInputs = Array.prototype.slice.call(document.querySelectorAll('.otp-digit'));
  var otpErrorText = document.querySelector('.otp-error-text');
  var countdownWrap = document.getElementById('otp-countdown');
  var countdownTimeEl = document.getElementById('otp-countdown-time');
  var resendBtn = document.getElementById('otp-resend-btn');
  var submitBtn = document.getElementById('otp-submit');
  var phoneEl = document.getElementById('otp-phone');

  var neutralBanner = document.getElementById('otp-neutral-banner');
  var expiredBanner = document.getElementById('otp-expired-banner');
  var toomanyBanner = document.getElementById('otp-toomany-banner');
  var commErrorBanner = document.getElementById('otp-comm-error-banner');

  var attempts = 0;
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
  try { storedPhone = sessionStorage.getItem('nivelo.recovery.phone'); } catch (e) {}
  phoneEl.textContent = maskPhone(storedPhone);

  // ---------- Banners ----------
  function hideAllBanners() {
    neutralBanner.hidden = true;
    expiredBanner.hidden = true;
    toomanyBanner.hidden = true;
    commErrorBanner.hidden = true;
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

  // Botão "Validar código" só fica clicável com os 6 dígitos preenchidos.
  // Exceção: nos estados "expirado"/"muitas tentativas" o mesmo botão vira a
  // ação de reenvio (ver CSS `.login-submit-label-retry`), então precisa
  // continuar habilitado mesmo com o OTP vazio/desabilitado.
  function updateSubmitState() {
    var currentState = form.getAttribute('data-state');
    if (currentState === 'expired' || currentState === 'toomany') {
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
        window.location.href = 'criar-nova-senha.html';
      }, 500);
      return;
    }

    attempts += 1;
    if (attempts >= MAX_ATTEMPTS) {
      goToTooMany();
      return;
    }

    setOtpError(true, 'Código incorreto. Verifique e tente novamente.');
    clearOtp();
    otpInputs[0].focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (form.getAttribute('data-state') === 'expired' || form.getAttribute('data-state') === 'toomany') {
      resetFlow();
      return;
    }
    validateCode();
  });

  // ---------- Expirado / muitas tentativas ----------
  function goToExpired() {
    hideAllBanners();
    expiredBanner.hidden = false;
    setOtpDisabled(true);
    setOtpError(false);
    form.setAttribute('data-state', 'expired');
    updateSubmitState();
  }

  function goToTooMany() {
    stopTimer();
    hideAllBanners();
    toomanyBanner.hidden = false;
    setOtpDisabled(true);
    setOtpError(false);
    form.setAttribute('data-state', 'toomany');
    updateSubmitState();
  }

  // ---------- Reenviar / reiniciar fluxo ----------
  function resetFlow() {
    attempts = 0;
    hideAllBanners();
    setOtpDisabled(false);
    clearOtp();
    form.setAttribute('data-state', 'idle');
    updateSubmitState();
    startTimer();
    otpInputs[0].focus();
  }

  // Retorno momentâneo: confirma visualmente que o reenvio aconteceu (o
  // resto da tela já reinicia sozinha — contador, OTP limpo — mas isso
  // sozinho é fácil de não notar; o texto do próprio link muda por um
  // instante pra deixar claro que a ação teve efeito).
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
  // idle (padrão) | incorrect | expired | toomany | commerror
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

  if (state === 'toomany') {
    attempts = MAX_ATTEMPTS;
    goToTooMany();
  }

  if (state === 'commerror') {
    hideAllBanners();
    commErrorBanner.hidden = false;
  }

  // Cobre o carregamento inicial (idle, 0 dígitos → disabled) e a variante
  // "incorrect" (6 dígitos já preenchidos → habilitado); "expired"/"toomany"
  // já chamam updateSubmitState() dentro de goToExpired()/goToTooMany().
  updateSubmitState();

  // Resposta neutra de segurança: mesma informação que antes ficava na tela
  // de Recuperar Senha, agora exibida aqui, temporariamente, assim que esta
  // tela abre (comportamento padrão de entrada, não um estado à parte com
  // botões/campos diferentes — por isso não é uma variante de #state=).
  if (state === 'idle') {
    neutralBanner.hidden = false;
    window.setTimeout(function () {
      neutralBanner.hidden = true;
    }, 4000);
  }
})();
