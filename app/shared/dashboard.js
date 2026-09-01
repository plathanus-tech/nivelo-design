(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success dashboard-toast';
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

  // ---------- Estado de demonstração via #state=success|signupsuccess ----------
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : null;

  var cameFromReset = false;
  try {
    cameFromReset = sessionStorage.getItem('nivelo.recovery.success') === '1';
    if (cameFromReset) sessionStorage.removeItem('nivelo.recovery.success');
  } catch (e) {}

  var cameFromSignup = false;
  try {
    cameFromSignup = sessionStorage.getItem('nivelo.signup.success') === '1';
    if (cameFromSignup) sessionStorage.removeItem('nivelo.signup.success');
  } catch (e) {}

  if (state === 'signupsuccess' || cameFromSignup) {
    showSuccessToast('Conta criada com sucesso!', 'Bem-vindo(a) à Nivelo. Sua conta já está pronta para uso.');
  } else if (state === 'success' || cameFromReset) {
    showSuccessToast('Senha alterada com sucesso!', 'Sua nova senha foi salva. Agora você já pode acessar sua conta normalmente.');
  }

  // ---------- Período de teste (indicador persistente + bloqueio ao expirar) ----------
  // Sem backend neste protótipo: dias restantes é um valor fixo de
  // demonstração, escolhido pelo `#state=`. 3 variantes, acessíveis
  // diretamente pelo prototype-nav: `trialwarning` (2 dias, tag amarela),
  // `trialexpired` (0 dias, modal de bloqueio) — qualquer outro estado
  // mostra o padrão (5 dias, tag azul).
  var TRIAL_TOTAL_DAYS = 7;
  var trialDaysRemaining = 5;
  if (state === 'trialexpired') trialDaysRemaining = 0;
  else if (state === 'trialwarning') trialDaysRemaining = 2;

  // Nome do plano: o mesmo texto escolhido na Etapa 3 de Criar conta
  // (`cadastro-planos.js`, `PLAN_LABELS`), lido de sessionStorage — nunca
  // escolhido de novo aqui. Sem esse handoff (ex.: variantes de demonstração
  // acessadas direto pelo prototype-nav), cai num plano padrão fixo.
  var trialPlanTextEl = document.getElementById('dash-trial-plan-text');
  if (trialPlanTextEl) {
    var signupPlan = null;
    try { signupPlan = sessionStorage.getItem('nivelo.signup.plan'); } catch (e) {}
    trialPlanTextEl.textContent = signupPlan || 'Gestão Completa';
  }

  var trialBadgeEl = document.getElementById('dash-trial-badge');
  var trialDaysTextEl = document.getElementById('dash-trial-days-text');
  if (trialDaysTextEl) {
    trialDaysTextEl.textContent = trialDaysRemaining > 0
      ? (trialDaysRemaining === 1 ? '1 dia restante' : trialDaysRemaining + ' dias restantes')
      : 'Expirado';
  }
  // Abaixo de 3 dias restantes a tag muda de azul (padrão, `data-status="info"`
  // já no HTML) pra amarela, reforçando a proximidade do fim do teste — não
  // se aplica no dia 0 (aí o modal de bloqueio já cobre a tela inteira).
  // Reaproveita o componente `.badge` real do Table (mesmo usado no Status do
  // Cadastro), não uma cor própria — `data-status="warning"` já existe em
  // `Table.module.css`.
  if (trialBadgeEl && trialDaysRemaining > 0 && trialDaysRemaining < 3) {
    trialBadgeEl.setAttribute('data-status', 'warning');
  }

  var appShellEl = document.getElementById('app-shell');
  var trialBlockOverlay = document.getElementById('trial-block-overlay');
  if (trialDaysRemaining <= 0 && trialBlockOverlay) {
    trialBlockOverlay.hidden = false;
    // O conteúdo do Dashboard continua visível ao fundo, só com blur — reforça
    // visualmente o bloqueio sem esconder a tela por completo. `#app-shell` (não
    // o `<body>`) porque o próprio overlay é irmão dele, fora do elemento
    // borrado, então nunca borra a si mesmo.
    if (appShellEl) appShellEl.classList.add('is-trial-blocked');
  }

  // "Falar com administrador": sem destino real ainda (não é fluxo de
  // pagamento) — só um retorno visual mínimo, mesmo padrão já usado noutros
  // botões sem destino definido neste app.
  function flashDisabled(btn) {
    btn.disabled = true;
    window.setTimeout(function () { btn.disabled = false; }, 300);
  }
  var trialContactBtn = document.getElementById('trial-block-contact');
  if (trialContactBtn) trialContactBtn.addEventListener('click', function () { flashDisabled(trialContactBtn); });

  // "Realizar pagamento" (modal de bloqueio) e "Contratar agora" (topbar)
  // abrem o mesmo fluxo de compra (comprar-plano.html) — mesma tela
  // independente da origem, conforme especificado.
  var trialPayBtn = document.getElementById('trial-block-pay');
  if (trialPayBtn) trialPayBtn.addEventListener('click', function () { window.location.href = 'comprar-plano.html'; });

  var trialUpgradeBtn = document.getElementById('dash-trial-upgrade-btn');
  if (trialUpgradeBtn) trialUpgradeBtn.addEventListener('click', function () { window.location.href = 'comprar-plano.html'; });

  // ---------- Aviso de renovação próxima / plano expirado (demonstração) ----------
  // `#state=renewalwarning`: licença anual vencendo em breve (banner, não bloqueia).
  // `#state=planoexpirado`: plano pago já vencido (bloqueio real, mesmo padrão do
  // bloqueio de trial acima, mas pra quem já foi assinante).
  if (state === 'renewalwarning') {
    var renewalBanner = document.getElementById('dash-renewal-banner');
    if (renewalBanner) {
      renewalBanner.hidden = false;
      document.getElementById('dash-renewal-banner-text').textContent =
        'Sua licença anual vence em 12 dias. Renove agora para não perder o acesso.';
    }
  }

  if (state === 'planoexpirado') {
    var planExpiredOverlay = document.getElementById('plan-expired-overlay');
    if (planExpiredOverlay) {
      planExpiredOverlay.hidden = false;
      if (appShellEl) appShellEl.classList.add('is-trial-blocked');
    }
  }
  var planExpiredBuyBtn = document.getElementById('plan-expired-buy');
  if (planExpiredBuyBtn) planExpiredBuyBtn.addEventListener('click', function () { window.location.href = 'comprar-plano.html?motivo=vencido'; });

  // ---------- Valores monetários zerados (fazenda sem movimentação) ----------
  // Reaproveitado tanto pelo `#state=empty` (conta nova, nenhuma fazenda com
  // dado nenhum) quanto por uma fazenda específica sem dados dentro do
  // filtro multifarm (ver abaixo) — em vez de deixar o campo em branco/
  // escondido, mostra um valor zerado de verdade nos 4 campos abaixo (os
  // outros cards, Safra/Contas, continuam com sua própria ilustração de
  // vazio via `data-content`/`data-empty`, ver page-dashboard.css).
  // `estoque-headline-value` não é mais monetário desde que o card "Estoque
  // de grãos" foi promovido da versão alternativa (round 2026-08-03: total
  // de sacas, não "Valor estimado") — zera com "0 sc", os outros 3 com
  // "R$ 0,00".
  var CURRENCY_ZERO = 'R$ 0,00';
  var ZERO_FIELD_VALUES = {
    'estoque-headline-value': '0 sc',
    'saldo-headline-value': CURRENCY_ZERO
  };
  var currencyOriginals = {};
  Object.keys(ZERO_FIELD_VALUES).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) currencyOriginals[id] = el.textContent;
  });
  function setCurrencyZero(isZero) {
    Object.keys(ZERO_FIELD_VALUES).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = isZero ? ZERO_FIELD_VALUES[id] : currencyOriginals[id];
    });
  }

  // ---------- Estado de demonstração: fazenda recém-cadastrada, sem dados ----------
  // Alterna Safra/Contas a pagar/Contas a receber pro estado vazio (ilustração
  // + mensagem), simulando uma conta nova. Estoque/Saldo mostram "R$ 0,00" em
  // vez de sumir (ver `setCurrencyZero` acima). O Clima fica de fora (não é
  // "cadastro", é um dado externo que sempre existe).
  if (state === 'empty') {
    document.body.classList.add('is-demo-empty');
    setCurrencyZero(true);
  }

  // ---------- Contas a pagar/receber: 3º período futuro, mês/ano dinâmico ----------
  // Antes um rótulo genérico ("Seguinte"), agora o mês/ano real seguinte ao
  // "Próximo mês" (hoje+2 meses), calculado em runtime — não é um registro de
  // negócio simulado (como o resto dos dados fictícios deste protótipo), é só
  // um rótulo de exibição relativo à data real do dispositivo, então usar a
  // data real aqui é a exceção documentada (mesmo raciocínio já usado pra
  // timestamps de conteúdo gerado pelo usuário em Canal de Ideias/Nova Conversa).
  var MES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  function labelMesSeguinte() {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 2);
    return MES_ABREV[d.getMonth()] + '/' + d.getFullYear();
  }
  var periodo3Label = labelMesSeguinte();
  ['pagar-periodo3-label', 'receber-periodo3-label'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = periodo3Label;
  });

  // ---------- Estoque de grãos: barra de comprometido por cultura (card
  // promovido da versão alternativa de teste, round 2026-08-03) — largura
  // calculada via JS a partir de `data-comprometido`/`data-total` no HTML,
  // nunca um `style="width:"` hardcoded no markup (mesma técnica já usada
  // em todo o resto do protótipo pra qualquer medida calculada em runtime). ----------
  Array.prototype.slice.call(document.querySelectorAll('.dash-comprometido-bar')).forEach(function (bar) {
    var comprometido = Number(bar.dataset.comprometido || 0);
    var total = Number(bar.dataset.total || 0);
    var pct = total > 0 ? Math.min(100, Math.round((comprometido / total) * 100)) : 0;
    bar.querySelector('.dash-comprometido-bar-fill').style.width = pct + '%';
  });
})();
