(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Contexto de origem (só ajusta o texto do banner, nunca o comportamento) ----------
  var params = new URLSearchParams(location.search);
  var motivo = params.get('motivo');
  var bannerEl = document.getElementById('cp-context-banner');
  if (motivo === 'renovacao') {
    bannerEl.hidden = false;
    bannerEl.textContent = 'Você está renovando sua licença.';
  } else if (motivo === 'vencido') {
    bannerEl.hidden = false;
    bannerEl.textContent = 'Seu plano expirou. Escolha um plano para continuar usando o Nivelo.';
  }

  // Troca de plano de assinante mensal ativo (Minha Conta > Plano): pula direto pro
  // pagamento, sem passar pelo Comercial — cobrança segue normal, só o plano muda na
  // próxima cobrança. `pularParaPagamento` é consumido só no fim do arquivo, depois que
  // setupStep2()/goToStep() já têm todas as dependências (`var`s) resolvidas.
  var qsPlano = params.get('plano');
  var qsModalidade = params.get('modalidade');
  var qsVigencia = params.get('vigencia');
  var pularParaPagamento = motivo === 'trocaplano' && !!qsPlano && !!qsModalidade;

  function formatBRL(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatBRDate(iso) {
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function addMonthsISO(iso, months) {
    var d = new Date(iso + 'T00:00:00');
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }

  if (pularParaPagamento && qsVigencia) {
    bannerEl.hidden = false;
    bannerEl.textContent = 'Você está trocando de plano. A cobrança continua normalmente e o novo plano passa a valer a partir de ' + formatBRDate(qsVigencia) + '.';
  }

  // ---------- Estado do pedido ----------
  var pedido = {
    planoId: pularParaPagamento ? qsPlano : null,
    modalidade: pularParaPagamento ? qsModalidade : null,
    metodo: 'cartao',
    parcelas: 1,
    cupom: null // { codigo, percentual }
  };

  var CUPONS_VALIDOS = { NIVELO10: 0.1, NIVELO20: 0.2 };

  // ══════════════════════════════════════════════════════════
  // NAVEGAÇÃO ENTRE ETAPAS
  // ══════════════════════════════════════════════════════════
  var stepPanels = Array.prototype.slice.call(document.querySelectorAll('.cp-step-panel'));
  var stepItems = Array.prototype.slice.call(document.querySelectorAll('.cp-step[data-step]'));

  var stepsIndicator = document.getElementById('cp-steps');
  function goToStep(n) {
    stepPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.stepPanel !== String(n);
    });
    stepsIndicator.hidden = n === 'confirmacao';
    stepItems.forEach(function (item) {
      var stepN = Number(item.dataset.step);
      item.classList.toggle('is-current', stepN === n);
      item.classList.toggle('is-complete', stepN < Number(n));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-back-to]')).forEach(function (btn) {
    btn.addEventListener('click', function () { goToStep(Number(btn.dataset.backTo)); });
  });

  // ══════════════════════════════════════════════════════════
  // ETAPA 1 — ESCOLHA DO PLANO (acordeão: plano + modalidade no mesmo passo)
  // ══════════════════════════════════════════════════════════
  var accordionEl = document.getElementById('cp-plan-accordion');

  function buildPlanAccordion() {
    var planos = window.NiveloPlanos.list();
    accordionEl.innerHTML = planos.map(function (plano) {
      return (
        '<article class="cp-plan-item" data-plano-id="' + plano.id + '">' +
          '<button type="button" class="cp-plan-item-header" aria-expanded="false">' +
            '<span class="cp-plan-item-info">' +
              '<span class="cp-plan-item-name">' + plano.nome + (plano.destaque ? '<span class="cp-plan-item-badge">Recomendado</span>' : '') + '</span>' +
              '<span class="cp-plan-item-tagline">' + plano.tagline + '</span>' +
            '</span>' +
            '<span class="cp-plan-item-from">a partir de ' + formatBRL(plano.precoMensal) + '/mês</span>' +
            '<i data-lucide="chevron-down" class="cp-plan-item-chevron" width="18" height="18"></i>' +
          '</button>' +
          '<div class="cp-plan-item-body" hidden>' +
            '<ul class="cp-plan-item-features">' +
              plano.recursos.map(function (r) { return '<li><i data-lucide="check" width="14" height="14"></i>' + r + '</li>'; }).join('') +
            '</ul>' +
            '<div class="cp-plan-modality-options" role="radiogroup" aria-label="Forma de contratação">' +
              '<label class="cp-plan-modality-option" data-modalidade="mensal">' +
                '<input type="radio" class="input" name="modalidade-' + plano.id + '" value="mensal" />' +
                '<span class="circle"><span class="dot"></span></span>' +
                '<span class="cp-plan-modality-info">' +
                  '<strong>Mensal</strong>' +
                  '<span class="cp-plan-modality-price">' + formatBRL(plano.precoMensal) + '/mês</span>' +
                '</span>' +
              '</label>' +
              '<label class="cp-plan-modality-option" data-modalidade="anual">' +
                '<input type="radio" class="input" name="modalidade-' + plano.id + '" value="anual" />' +
                '<span class="circle"><span class="dot"></span></span>' +
                '<span class="cp-plan-modality-info">' +
                  '<strong>Anual <span class="cp-plan-modality-save">Economize 20%</span></strong>' +
                  '<span class="cp-plan-modality-price">' + formatBRL(plano.precoAnualMensal) + '/mês <small>cobrado anualmente ' + formatBRL(plano.precoAnualTotal) + '</small></span>' +
                '</span>' +
              '</label>' +
            '</div>' +
            '<div class="cp-step-actions">' +
              '<button type="button" class="btn primary cp-plan-item-continue" disabled>Continuar</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
    if (window.lucide) lucide.createIcons();
  }
  buildPlanAccordion();

  accordionEl.addEventListener('click', function (event) {
    var header = event.target.closest('.cp-plan-item-header');
    var continueBtn = event.target.closest('.cp-plan-item-continue');
    var modalityLabel = event.target.closest('.cp-plan-modality-option');

    if (header) {
      var item = header.closest('.cp-plan-item');
      var isOpen = item.classList.contains('is-open');
      Array.prototype.slice.call(accordionEl.querySelectorAll('.cp-plan-item')).forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.cp-plan-item-header').setAttribute('aria-expanded', 'false');
        i.querySelector('.cp-plan-item-body').hidden = true;
      });
      if (!isOpen) {
        item.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
        item.querySelector('.cp-plan-item-body').hidden = false;
      }
      return;
    }

    if (modalityLabel) {
      var plano = modalityLabel.closest('.cp-plan-item');
      var radio = modalityLabel.querySelector('input[type="radio"]');
      radio.checked = true;
      Array.prototype.slice.call(plano.querySelectorAll('.cp-plan-modality-option')).forEach(function (opt) {
        opt.classList.toggle('checked', opt === modalityLabel);
      });
      plano.querySelector('.cp-plan-item-continue').disabled = false;
      return;
    }

    if (continueBtn) {
      var planoItem = continueBtn.closest('.cp-plan-item');
      var selectedRadio = planoItem.querySelector('input[type="radio"]:checked');
      if (!selectedRadio) return;
      pedido.planoId = planoItem.dataset.planoId;
      pedido.modalidade = selectedRadio.value;
      setupStep2();
      goToStep(2);
    }
  });

  // ══════════════════════════════════════════════════════════
  // ETAPA 2 — PAGAMENTO
  // ══════════════════════════════════════════════════════════
  var methodChoice = document.getElementById('cp-method-choice');
  var cardFields = document.getElementById('cp-card-fields');
  var pixPanel = document.getElementById('cp-pix-panel');
  var parcelasField = document.getElementById('cp-parcelas-field');
  var recorrenciaNote = document.getElementById('cp-recorrencia-note');
  var submitBtn = document.getElementById('cp-submit-btn');
  var pixCheckBtn = document.getElementById('cp-pix-check-btn');
  var paymentError = document.getElementById('cp-payment-error');

  function precoBase() {
    var plano = window.NiveloPlanos.findById(pedido.planoId);
    return pedido.modalidade === 'anual' ? plano.precoAnualTotal : plano.precoMensal;
  }
  function precoComDesconto() {
    var base = precoBase();
    if (!pedido.cupom) return base;
    return Math.round(base * (1 - pedido.cupom.percentual) * 100) / 100;
  }

  function setupStep2() {
    paymentError.hidden = true;
    pixPanel.hidden = true;
    var isAnual = pedido.modalidade === 'anual';
    methodChoice.hidden = !isAnual;
    pedido.metodo = 'cartao';
    Array.prototype.slice.call(document.querySelectorAll('input[name="cp-metodo"]')).forEach(function (r) {
      r.checked = r.value === 'cartao';
      r.closest('.cp-method-option').classList.toggle('checked', r.checked);
    });
    cardFields.hidden = false;
    parcelasField.hidden = !isAnual;
    recorrenciaNote.hidden = isAnual;
    submitBtn.hidden = false;
    pixCheckBtn.hidden = true;
    submitBtn.textContent = 'Confirmar pagamento';
    if (isAnual) buildParcelasMenu();
    renderSummary();
  }

  // Parcelamento 1x-12x, sem juros — mesma decisão documentada em memória/CLAUDE.md
  function buildParcelasMenu() {
    var menu = document.getElementById('cp-parcelas-menu');
    var total = precoComDesconto();
    var options = [];
    for (var n = 1; n <= 12; n++) {
      var parcela = Math.round((total / n) * 100) / 100;
      options.push('<div class="option" data-value="' + n + '">' + n + 'x de ' + formatBRL(parcela) + (n === 1 ? ' à vista' : ' sem juros') + '</div>');
    }
    menu.innerHTML = options.join('');
    initParcelasDropdown();
  }

  var parcelasDropdownInit = false;
  function initParcelasDropdown() {
    var root = parcelasField;
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      pedido.parcelas = Number(optionEl.dataset.value);
      root.classList.remove('open');
      renderSummary();
    }
    // Seleciona 1x por padrão a cada rebuild do menu.
    var first = menu.querySelector('.option[data-value="1"]');
    if (first) {
      first.classList.add('selected');
      valueEl.textContent = first.textContent;
      valueEl.classList.remove('placeholder');
      pedido.parcelas = 1;
    }
    if (parcelasDropdownInit) return;
    parcelasDropdownInit = true;
    trigger.addEventListener('click', function () { root.classList.toggle('open'); });
    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (optionEl) selectOption(optionEl);
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) root.classList.remove('open');
    });
  }

  // Checkbox "Salvar este cartão" — Checkbox.module.css pinta o estado marcado via
  // classe `.checked` no `<label>`, nunca via `:checked` do input nativo.
  var saveCardCheckbox = document.getElementById('cp-save-card');
  if (saveCardCheckbox) {
    saveCardCheckbox.addEventListener('change', function () {
      saveCardCheckbox.closest('.cp-save-card-checkbox').classList.toggle('checked', saveCardCheckbox.checked);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('input[name="cp-metodo"]')).forEach(function (radio) {
    radio.addEventListener('change', function () {
      pedido.metodo = radio.value;
      Array.prototype.slice.call(document.querySelectorAll('input[name="cp-metodo"]')).forEach(function (r) {
        r.closest('.cp-method-option').classList.toggle('checked', r.checked);
      });
      var isPix = radio.value === 'pix';
      cardFields.hidden = isPix;
      pixPanel.hidden = !isPix;
      submitBtn.hidden = isPix;
      pixCheckBtn.hidden = !isPix;
      if (isPix) buildPixPanel();
      renderSummary();
    });
  });

  // ---------- PIX: QR ilustrativo (SVG determinístico) + código copia-e-cola fictício ----------
  function buildFakeQR() {
    var size = 21;
    var seed = 42;
    function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var cell = 200 / size;
    var rects = '';
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var inFinder =
          (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
        var on = inFinder ? isFinderOn(x, y, size) : rand() > 0.55;
        if (on) rects += '<rect x="' + (x * cell) + '" y="' + (y * cell) + '" width="' + cell + '" height="' + cell + '" />';
      }
    }
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="#0A0A0A">' + rects + '</svg>';
  }
  function isFinderOn(x, y, size) {
    var fx = x < 7 ? x : x - (size - 7);
    var fy = y < 7 ? y : y;
    if (x >= size - 7 && y < 7) fx = x - (size - 7);
    var edge = fx === 0 || fx === 6 || fy === 0 || fy === 6;
    var core = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4;
    return edge || core;
  }
  function buildPixCode() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var out = '00020126580014BR.GOV.BCB.PIX';
    for (var i = 0; i < 40; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
  var pixChecked = false;
  function buildPixPanel() {
    document.getElementById('cp-pix-qr').innerHTML = buildFakeQR();
    document.getElementById('cp-pix-code').value = buildPixCode();
    document.getElementById('cp-pix-status-badge').textContent = 'Aguardando pagamento';
    document.getElementById('cp-pix-status-badge').setAttribute('data-status', 'warning');
    pixChecked = false;
  }
  document.getElementById('cp-pix-copy-btn').addEventListener('click', function () {
    var input = document.getElementById('cp-pix-code');
    input.select();
    navigator.clipboard && navigator.clipboard.writeText(input.value).catch(function () {});
    var btn = document.getElementById('cp-pix-copy-btn');
    var original = btn.textContent;
    btn.textContent = 'Copiado!';
    window.setTimeout(function () { btn.textContent = original; }, 1500);
  });
  // Mock de verificação: 1º clique "ainda não identificamos", 2º clique confirma —
  // simula o atraso real de compensação de um pagamento PIX sem precisar de backend.
  document.getElementById('cp-pix-check-btn').addEventListener('click', function () {
    var badge = document.getElementById('cp-pix-status-badge');
    if (!pixChecked) {
      pixChecked = true;
      badge.textContent = 'Ainda não identificamos o pagamento';
      badge.setAttribute('data-status', 'warning');
      return;
    }
    badge.textContent = 'Pagamento aprovado';
    badge.setAttribute('data-status', 'success');
    window.setTimeout(function () { finalizarCompra(); }, 500);
  });

  // ---------- Máscaras de cartão ----------
  var cardNumberInput = document.getElementById('cp-card-number');
  cardNumberInput.addEventListener('input', function () {
    var digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
    cardNumberInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  var expiryInput = document.getElementById('cp-card-expiry');
  expiryInput.addEventListener('input', function () {
    var digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
    expiryInput.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  });
  var cvvInput = document.getElementById('cp-card-cvv');
  cvvInput.addEventListener('input', function () { cvvInput.value = cvvInput.value.replace(/\D/g, '').slice(0, 4); });

  // ---------- Cupom de desconto ----------
  var couponFeedback = document.getElementById('cp-coupon-feedback');
  document.getElementById('cp-coupon-apply').addEventListener('click', function () {
    var codigo = document.getElementById('cp-coupon-input').value.trim().toUpperCase();
    if (!codigo) return;
    var percentual = CUPONS_VALIDOS[codigo];
    couponFeedback.hidden = false;
    if (percentual) {
      pedido.cupom = { codigo: codigo, percentual: percentual };
      couponFeedback.className = 'cp-coupon-feedback text-body-s is-success';
      couponFeedback.textContent = 'Cupom "' + codigo + '" aplicado: ' + (percentual * 100) + '% de desconto.';
    } else {
      pedido.cupom = null;
      couponFeedback.className = 'cp-coupon-feedback text-body-s is-error';
      couponFeedback.textContent = 'Cupom inválido.';
    }
    if (pedido.modalidade === 'anual' && pedido.metodo === 'cartao') buildParcelasMenu();
    renderSummary();
  });

  // ---------- Resumo da compra (sempre reflete o estado atual do pedido) ----------
  function renderSummary() {
    if (!pedido.planoId) return;
    var plano = window.NiveloPlanos.findById(pedido.planoId);
    document.getElementById('cp-summary-plano').textContent = plano.nome;
    document.getElementById('cp-summary-modalidade').textContent = pedido.modalidade === 'anual' ? 'Licença anual' : 'Licença mensal';

    var base = precoBase();
    var total = precoComDesconto();
    document.getElementById('cp-summary-valor').textContent = formatBRL(base);

    var descontoRow = document.getElementById('cp-summary-desconto-row');
    if (pedido.cupom) {
      descontoRow.hidden = false;
      document.getElementById('cp-summary-desconto').textContent = '-' + formatBRL(base - total);
    } else {
      descontoRow.hidden = true;
    }

    var parcelamentoRow = document.getElementById('cp-summary-parcelamento-row');
    if (pedido.metodo === 'cartao' && pedido.modalidade === 'anual' && pedido.parcelas > 1) {
      parcelamentoRow.hidden = false;
      document.getElementById('cp-summary-parcelamento').textContent = pedido.parcelas + 'x de ' + formatBRL(Math.round((total / pedido.parcelas) * 100) / 100);
    } else {
      parcelamentoRow.hidden = true;
    }

    document.getElementById('cp-summary-total').textContent = formatBRL(total);
  }

  // ---------- Submissão do pagamento (cartão) ----------
  var loadingOverlay = document.getElementById('cp-loading-overlay');

  submitBtn.addEventListener('click', function () {
    if (pedido.metodo === 'pix') return; // PIX segue pelo botão "Verificar pagamento"
    paymentError.hidden = true;
    var numeroDigits = cardNumberInput.value.replace(/\D/g, '');
    if (!numeroDigits || !document.getElementById('cp-card-name').value.trim() || expiryInput.value.length < 5 || cvvInput.value.length < 3) {
      paymentError.hidden = false;
      document.querySelector('#cp-payment-error .message').textContent = 'Preencha todos os campos do cartão para continuar.';
      return;
    }
    loadingOverlay.hidden = false;
    window.setTimeout(function () {
      loadingOverlay.hidden = true;
      // Cartão de teste que simula recusa (mesmo espírito do código OTP fixo do login) —
      // qualquer outro número aprova, já que este protótipo não tem gateway real.
      if (numeroDigits.slice(-4) === '0002') {
        paymentError.hidden = false;
        document.querySelector('#cp-payment-error .message').textContent = 'Verifique os dados do cartão ou tente outro cartão.';
        return;
      }
      finalizarCompra();
    }, 1300);
  });

  // ══════════════════════════════════════════════════════════
  // CONFIRMAÇÃO
  // ══════════════════════════════════════════════════════════
  function finalizarCompra() {
    var plano = window.NiveloPlanos.findById(pedido.planoId);
    document.getElementById('cp-conf-plano').textContent = plano.nome;
    document.getElementById('cp-conf-tipo').textContent = pedido.modalidade === 'anual' ? 'Licença anual' : 'Licença mensal';

    var hoje = window.NiveloAssinatura.TODAY;
    var proxima = pedido.modalidade === 'anual' ? addMonthsISO(hoje, 12) : addMonthsISO(hoje, 1);
    document.getElementById('cp-conf-next-label').textContent = pedido.modalidade === 'anual' ? 'Próximo vencimento' : 'Próxima renovação';
    document.getElementById('cp-conf-next-value').textContent = formatBRDate(proxima);

    goToStep('confirmacao');
    if (window.lucide) lucide.createIcons();
  }

  // Troca de plano de assinante mensal (ver topo do arquivo): pula a Etapa 1, já chega
  // direto na Etapa 2 com o plano/modalidade escolhidos em Minha Conta.
  if (pularParaPagamento) {
    setupStep2();
    goToStep(2);
  }

})();
