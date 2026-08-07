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

  // ---------- Feedback de carregamento ao trocar filtros (Fazenda/Período) ----------
  // Sem backend neste protótipo: não há dado real pra buscar, então o
  // "carregamento" é só visual (dim breve nos cards + spinner discreto),
  // rápido o bastante pra dar a sensação de atualização sem parecer lento.
  var dashboardGridEl = document.getElementById('dashboard-grid');
  var refreshIndicatorEl = document.getElementById('dashboard-refresh-indicator');
  var refreshTimer = null;
  function flashLoading() {
    if (!dashboardGridEl) return;
    dashboardGridEl.classList.add('is-refreshing');
    if (refreshIndicatorEl) refreshIndicatorEl.classList.add('is-visible');
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(function () {
      dashboardGridEl.classList.remove('is-refreshing');
      if (refreshIndicatorEl) refreshIndicatorEl.classList.remove('is-visible');
    }, 450);
  }

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
    'saldo-headline-value': CURRENCY_ZERO,
    'pagar-meta-value': CURRENCY_ZERO,
    'receber-meta-value': CURRENCY_ZERO
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

  // ---------- Filtro de Fazenda: só aparece com mais de uma fazenda ----------
  // Lista fictícia (sem backend neste protótipo). Por padrão o usuário tem só
  // UMA fazenda, então o filtro fica escondido e ela é usada automaticamente
  // — `#state=multifarm` simula um usuário com várias, pra demonstrar o
  // filtro aparecendo (regra é dinâmica pela quantidade, nunca fixa).
  // "Boa Esperança" tem `hasData:false`: representa uma fazenda recém-
  // cadastrada, ainda sem nenhuma movimentação/valor lançado.
  var FARMS = state === 'multifarm'
    ? [
        { id: 'sao-joao', label: 'Fazenda São João', hasData: true },
        { id: 'santa-rita', label: 'Fazenda Santa Rita', hasData: true },
        { id: 'boa-esperanca', label: 'Fazenda Boa Esperança', hasData: false }
      ]
    : [
        { id: 'sao-joao', label: 'Fazenda São João', hasData: true }
      ];

  // ---------- Dropdown genérico (Fazenda / Período) ----------
  // Reaproveita a estrutura real do componente `Dropdown` do Storybook
  // (wrapper/trigger/menu/option/open), reimplementada em JS puro — mesmo
  // padrão já usado pro Input/Checkbox/RadioButton no resto do protótipo.
  // `opts.interceptValue` + `opts.onIntercept`: pra opções que não devem
  // selecionar sozinhas ao clicar (ex.: "Período personalizado" abre um
  // Popover em vez de virar o valor selecionado na hora — só vira seleção
  // de verdade se/quando o Popover for aplicado, via `selectOption()`
  // chamado de fora).
  function initDropdown(root, onChange, opts) {
    opts = opts || {};
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    // Menu em `position:fixed` calculado via JS (mesmo padrão duplicado em
    // novo-cadastro.js/cadastros.js) — escapa do `overflow:hidden` de
    // qualquer `.card` ancestral e nunca deixa a caixa sair da tela, ver
    // rules.md.
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

    function selectOption(optionEl, labelOverride) {
      var existingOptions = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existingOptions.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      var label = labelOverride || optionEl.textContent;
      valueEl.textContent = label;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value, label);
    }

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (!optionEl) return;
      if (opts.interceptValue && optionEl.dataset.value === opts.interceptValue) {
        close();
        opts.onIntercept(optionEl);
        return;
      }
      selectOption(optionEl);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    return { selectOption: selectOption, root: root };
  }

  // ---------- Filtro de Fazenda ----------
  var farmFilterEl = document.getElementById('filter-fazenda');
  var farmDropdownEl = document.getElementById('dropdown-fazenda');
  var dashboardFiltersEl = document.getElementById('dashboard-filters');
  if (FARMS.length > 1) {
    farmFilterEl.hidden = false;
    // Com Fazenda + Período visíveis juntos, os dois ficam lado a lado
    // (grid de 2 colunas, ver page-dashboard.css) em vez do fluxo padrão de
    // 1 filtro só ocupando a largura toda.
    if (dashboardFiltersEl) dashboardFiltersEl.classList.add('has-farm');
    var farmMenu = farmDropdownEl.querySelector('[data-dropdown-menu]');
    farmMenu.innerHTML = FARMS.map(function (farm) {
      return '<div class="option" data-value="' + farm.id + '">' + farm.label + '</div>';
    }).join('');
    var farmInitializing = true;
    var farmDropdown = initDropdown(farmDropdownEl, function (value) {
      // Sem backend neste protótipo: trocar a fazenda recarregaria os dados
      // reais do Dashboard via API, filtrados pela fazenda selecionada — aqui
      // só simulamos o caso da fazenda sem nenhum dado ainda (`hasData:false`).
      var farm = FARMS.filter(function (f) { return f.id === value; })[0];
      setCurrencyZero(!!(farm && farm.hasData === false));
      if (!farmInitializing) flashLoading();
    });
    farmDropdown.selectOption(farmMenu.querySelector('.option'));
    farmInitializing = false;
  }
  // Com uma única fazenda, `filter-fazenda` continua `hidden` (padrão do
  // HTML) e o sistema considera essa única fazenda automaticamente — nada
  // mais a fazer aqui.

  // ---------- Filtro de Período ----------
  var PERIOD_LABELS = {
    '3m': 'Últimos 3 meses',
    '6m': 'Últimos 6 meses',
    '12m': 'Últimos 12 meses',
    'safra': 'Safra atual',
    'custom': 'Período personalizado'
  };

  var periodDropdownEl = document.getElementById('dropdown-periodo');
  var periodTextEls = Array.prototype.slice.call(document.querySelectorAll('[data-period-text]'));

  function applyPeriod(value, label) {
    var text = label || PERIOD_LABELS[value] || PERIOD_LABELS['6m'];
    periodTextEls.forEach(function (el) { el.textContent = text; });
    // Sem backend neste protótipo: os valores (R$) dos cards não são
    // recalculados de verdade — em produção, trocar o período dispara uma
    // nova consulta e os números acima são atualizados a partir dela.
    flashLoading();
  }

  var periodDropdown = initDropdown(periodDropdownEl, applyPeriod, {
    interceptValue: 'custom',
    onIntercept: function () { openPeriodPopover(); }
  });

  // ---------- Popover de "Período personalizado" (Data inicial/final + calendário) ----------
  // Fica fora do fluxo normal (position:fixed calculado via JS), pra nunca
  // empurrar/alterar o cabeçalho ou o restante do layout — mesma técnica já
  // usada pro Popover/tooltip da Sidebar retraída.
  var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  var periodPopoverEl = document.getElementById('period-popover');
  var periodFilterEl = document.getElementById('filter-periodo');
  var startInput = document.getElementById('period-start-input');
  var endInput = document.getElementById('period-end-input');
  var calLabel = periodPopoverEl.querySelector('[data-cal-label]');
  var calGrid = periodPopoverEl.querySelector('[data-cal-grid]');
  var customOptionEl = periodDropdownEl.querySelector('.option[data-value="custom"]');

  var draft = { start: null, end: null, viewYear: 0, viewMonth: 0 };
  var appliedRange = null; // { start: Date, end: Date } depois do primeiro "Aplicar"

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDatePt(date) {
    return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear();
  }

  function toInputValue(date) {
    if (!date) return '';
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function parseInputValue(value) {
    if (!value) return null;
    var parts = value.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

  function renderCalendar() {
    calLabel.textContent = capitalize(MONTH_NAMES[draft.viewMonth]) + ' de ' + draft.viewYear;
    calGrid.innerHTML = '';

    var firstWeekday = new Date(draft.viewYear, draft.viewMonth, 1).getDay();
    var daysInMonth = new Date(draft.viewYear, draft.viewMonth + 1, 0).getDate();

    var html = '';
    for (var e = 0; e < firstWeekday; e++) {
      html += '<span class="dash-calendar-day-empty"></span>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(draft.viewYear, draft.viewMonth, day);
      var classes = ['dash-calendar-day', 'text-12-regular'];
      if (draft.start && sameDay(date, draft.start)) classes.push('is-start');
      if (draft.end && sameDay(date, draft.end)) classes.push('is-end');
      if (draft.start && draft.end && date > draft.start && date < draft.end) classes.push('is-in-range');
      html += '<button type="button" class="' + classes.join(' ') + '" data-date="' + toInputValue(date) + '">' + day + '</button>';
    }
    calGrid.innerHTML = html;
  }

  function pickDate(date) {
    if (!draft.start || (draft.start && draft.end)) {
      draft.start = date;
      draft.end = null;
    } else if (date < draft.start) {
      draft.end = draft.start;
      draft.start = date;
    } else {
      draft.end = date;
    }
    startInput.value = toInputValue(draft.start);
    endInput.value = toInputValue(draft.end);
    renderCalendar();
  }

  calGrid.addEventListener('click', function (event) {
    var btn = event.target.closest('.dash-calendar-day');
    if (!btn) return;
    pickDate(parseInputValue(btn.dataset.date));
  });

  periodPopoverEl.querySelector('[data-cal-prev]').addEventListener('click', function () {
    draft.viewMonth--;
    if (draft.viewMonth < 0) { draft.viewMonth = 11; draft.viewYear--; }
    renderCalendar();
  });

  periodPopoverEl.querySelector('[data-cal-next]').addEventListener('click', function () {
    draft.viewMonth++;
    if (draft.viewMonth > 11) { draft.viewMonth = 0; draft.viewYear++; }
    renderCalendar();
  });

  startInput.addEventListener('change', function () {
    var date = parseInputValue(startInput.value);
    if (!date) return;
    draft.start = date;
    if (draft.end && draft.end < draft.start) draft.end = null;
    draft.viewYear = date.getFullYear();
    draft.viewMonth = date.getMonth();
    renderCalendar();
  });

  endInput.addEventListener('change', function () {
    var date = parseInputValue(endInput.value);
    if (!date) return;
    if (draft.start && date < draft.start) {
      draft.end = draft.start;
      draft.start = date;
      startInput.value = toInputValue(draft.start);
    } else {
      draft.end = date;
    }
    renderCalendar();
  });

  function positionPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(320, window.innerWidth - margin * 2);
    periodPopoverEl.style.width = width + 'px';
    var left = anchorRect.left;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    periodPopoverEl.style.left = left + 'px';
    periodPopoverEl.style.top = (anchorRect.bottom + 8) + 'px';
  }

  function outsideClickHandler(event) {
    // `event.composedPath()` em vez de `.contains(event.target)`: clicar num
    // dia do calendário chama `renderCalendar()` (substitui
    // `calGrid.innerHTML`) ainda durante a fase de bubble do MESMO clique —
    // isso desconecta o botão clicado do documento antes do evento chegar
    // aqui, e um `event.target` desconectado nunca é "contido" por nada,
    // fazendo esse handler fechar o Popover por engano a cada data
    // selecionada. `composedPath()` guarda o caminho de propagação de
    // quando o evento foi disparado, então continua correto mesmo depois
    // do DOM mudar no meio do caminho.
    var path = event.composedPath ? event.composedPath() : [event.target];
    if (path.indexOf(periodPopoverEl) === -1) closePeriodPopover();
  }

  function openPeriodPopover() {
    var base = appliedRange ? appliedRange.start : new Date();
    draft.start = appliedRange ? appliedRange.start : null;
    draft.end = appliedRange ? appliedRange.end : null;
    draft.viewYear = base.getFullYear();
    draft.viewMonth = base.getMonth();
    startInput.value = toInputValue(draft.start);
    endInput.value = toInputValue(draft.end);
    renderCalendar();

    periodPopoverEl.hidden = false;
    positionPopover(periodFilterEl.getBoundingClientRect());

    // Só passa a escutar clique-fora DEPOIS deste clique de abertura
    // terminar de se propagar — senão o próprio clique que abre o Popover
    // (na opção "Período personalizado", fora do Popover) já fecharia ele
    // de novo no mesmo evento.
    window.setTimeout(function () {
      document.addEventListener('click', outsideClickHandler);
    }, 0);
  }

  function closePeriodPopover() {
    periodPopoverEl.hidden = true;
    document.removeEventListener('click', outsideClickHandler);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !periodPopoverEl.hidden) closePeriodPopover();
  });

  periodPopoverEl.querySelector('[data-period-cancel]').addEventListener('click', function () {
    // Fecha sem aplicar — o filtro continua com o valor anterior (ex.:
    // "Últimos 6 meses"), nunca muda pra "Período personalizado" sem as
    // duas datas confirmadas.
    closePeriodPopover();
  });

  periodPopoverEl.querySelector('[data-period-apply]').addEventListener('click', function () {
    if (!draft.start || !draft.end) return; // exige as duas datas antes de aplicar
    appliedRange = { start: draft.start, end: draft.end };
    var label = formatDatePt(appliedRange.start) + ' – ' + formatDatePt(appliedRange.end);
    periodDropdown.selectOption(customOptionEl, label);
    closePeriodPopover();
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
