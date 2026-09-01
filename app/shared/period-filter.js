/* ══════════════════════════════════════════════════════════════════════
   NiveloPeriodFilter — implementação única e compartilhada do filtro de
   Período usado em toda tabela/relatório do sistema (Notas Fiscais, Caixa,
   Contas a Pagar, Contas a Receber, Balancete, DRE, LCDPR, Entradas e
   Saídas). Antes desta rodada existiam 2 padrões divergentes (calendário de
   intervalo feito à mão nas 4 listagens; RadioButton Mês/Intervalo +
   NiveloDatePicker nos 4 relatórios) — este módulo substitui os dois por um
   único seletor de MODO:

     Sem filtro | Últimos 30 dias | Dia | Mês | Intervalo

   Ao escolher um modo, só os campos necessários daquele modo aparecem
   (nenhum campo pra "Sem filtro"/"Últimos 30 dias", 1 calendário de dia
   pra "Dia", uma grade de 12 meses pra "Mês", 2 datas + calendário pra
   "Intervalo" — mesma UX de sempre). O widget constrói seu próprio
   trigger (dentro do elemento `mount` informado) e seu próprio popover
   (anexado a `document.body`, `position:fixed`, mesma técnica já usada em
   todo popover deste sistema) — a tela que consome só precisa de um
   container vazio no HTML (`<div class="wrapper" id="..."></div>`) e uma
   chamada a `NiveloPeriodFilter.init({...})`.

   Uso:
     var periodFilter = window.NiveloPeriodFilter.init({
       mount: document.getElementById('periodo-mount'),
       today: '2026-07-31',                 // TODAY fixo da tela (opcional)
       onApply: function (result) { ... }   // chamado a cada "Aplicar"
     });
     periodFilter.getResult(); // { mode, start, end, label }

   `result.start`/`result.end` são strings ISO 'AAAA-MM-DD' (inclusive nos
   dois extremos) prontas pra comparação por string (`row.dataset.data >=
   start && row.dataset.data <= end`) — ou `null` quando `mode === 'none'`
   (sem filtro, nenhuma restrição deve ser aplicada).
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DEFAULT_TODAY = '2026-07-31'; // mesma data de referência fixa já usada em Contas a Pagar/Receber

  var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  var MODES = [
    { value: 'none', label: 'Sem filtro' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: 'dia', label: 'Dia' },
    { value: 'mes', label: 'Mês' },
    { value: 'intervalo', label: 'Intervalo' }
  ];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

  function toISO(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
  function parseISO(iso) {
    var parts = iso.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  function formatBR(iso) {
    var d = parseISO(iso);
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function addDaysISO(iso, days) {
    var d = parseISO(iso);
    d.setDate(d.getDate() + days);
    return toISO(d);
  }
  function lastDayOfMonthISO(year, month) {
    return year + '-' + pad2(month + 1) + '-' + pad2(new Date(year, month + 1, 0).getDate());
  }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

  function positionPopover(trigger, popover, maxWidth) {
    var margin = 16;
    var width = Math.min(maxWidth || 320, window.innerWidth - margin * 2);
    var rect = trigger.getBoundingClientRect();
    var left = rect.left;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    popover.style.position = 'fixed';
    popover.style.left = left + 'px';
    popover.style.width = width + 'px';
    var spaceBelow = window.innerHeight - rect.bottom - margin;
    if (spaceBelow < 360 && rect.top > spaceBelow) {
      popover.style.top = 'auto';
      popover.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
      popover.style.maxHeight = (rect.top - margin) + 'px';
    } else {
      popover.style.bottom = 'auto';
      popover.style.top = (rect.bottom + 4) + 'px';
      popover.style.maxHeight = spaceBelow + 'px';
    }
  }

  function init(opts) {
    opts = opts || {};
    var mount = opts.mount;
    var today = opts.today || DEFAULT_TODAY;
    var onApply = opts.onApply || function () {};
    var fieldLabel = opts.label || 'Período';
    // Rótulo do modo "Sem filtro" — customizável por instância (ex.:
    // Pedidos de Venda pede "Sem filtro de período", explícito, pra deixar
    // claro que o controle se refere ao período). Nunca muta o array
    // `MODES` do módulo (compartilhado por todas as telas que usam este
    // componente) — usa uma cópia local só desta instância.
    var noneLabel = opts.noneLabel || 'Sem filtro';
    var modes = MODES.map(function (m) { return m.value === 'none' ? { value: 'none', label: noneLabel } : m; });

    // ---------- Trigger (dentro do `mount`) ----------
    mount.classList.add('wrapper', 'pf-field');
    mount.innerHTML =
      '<span class="label">' + fieldLabel + '</span>' +
      '<button type="button" class="trigger" data-pf-trigger>' +
      '<span class="placeholder" data-pf-value>' + noneLabel + '</span>' +
      '<span class="chevron"><i data-lucide="chevron-down" width="16" height="16"></i></span>' +
      '</button>';
    if (window.lucide) lucide.createIcons();

    var trigger = mount.querySelector('[data-pf-trigger]');
    var valueEl = mount.querySelector('[data-pf-value]');

    // ---------- Popover (fora do fluxo, anexado ao body) ----------
    var popover = document.createElement('div');
    popover.className = 'pf-popover';
    popover.hidden = true;
    popover.innerHTML =
      '<div class="pf-mode-list" role="radiogroup" aria-label="Tipo de filtro de período">' +
      modes.map(function (m) {
        return '<button type="button" class="pf-mode-option" data-pf-mode="' + m.value + '">' + m.label + '</button>';
      }).join('') +
      '</div>' +
      '<div class="pf-mode-detail" data-pf-detail hidden></div>' +
      '<div class="pf-actions">' +
      '<button type="button" class="btn secondary sm" data-pf-cancel>Cancelar</button>' +
      '<button type="button" class="btn primary sm" data-pf-apply>Aplicar</button>' +
      '</div>';
    document.body.appendChild(popover);

    var modeListEl = popover.querySelector('.pf-mode-list');
    var detailEl = popover.querySelector('[data-pf-detail]');
    var applyBtn = popover.querySelector('[data-pf-apply]');
    var cancelBtn = popover.querySelector('[data-pf-cancel]');

    var applied = { mode: 'none', start: null, end: null, label: noneLabel };
    var draft = { mode: 'none', date: null, year: today ? parseISO(today).getFullYear() : new Date().getFullYear(), month: 0, start: null, end: null };

    // ---------- Calendário de dia — dropdown clássico, flutuante, fora do
    // card do filtro (anexado a `document.body`, `position:fixed`, mesma
    // técnica do `popover` principal e do `dpPopover` do NiveloDatePicker) —
    // nunca expande inline dentro do card. Um único elemento compartilhado
    // pelos modos "Dia" e "Intervalo" (Data inicial/Data final), já que só
    // um campo pode estar com o calendário aberto por vez. ----------
    var dateCalendarPopover = document.createElement('div');
    dateCalendarPopover.className = 'pf-date-calendar-popover';
    dateCalendarPopover.hidden = true;
    document.body.appendChild(dateCalendarPopover);

    var dateCalendarState = null; // { triggerEl, viewYear, viewMonth, current, onPick }

    function closeDateCalendar() {
      dateCalendarPopover.hidden = true;
      dateCalendarState = null;
      document.removeEventListener('click', dateCalendarOutsideClick);
    }
    function dateCalendarOutsideClick(event) {
      var path = event.composedPath ? event.composedPath() : [event.target];
      if (!dateCalendarState) return;
      if (path.indexOf(dateCalendarPopover) === -1 && path.indexOf(dateCalendarState.triggerEl) === -1) closeDateCalendar();
    }

    function renderDateCalendarPopover() {
      var s = dateCalendarState;
      var firstWeekday = new Date(s.viewYear, s.viewMonth, 1).getDay();
      var daysInMonth = new Date(s.viewYear, s.viewMonth + 1, 0).getDate();
      var html = '<div class="pf-calendar-header">' +
        '<button type="button" class="actionBtn" data-pf-cal-prev aria-label="Mês anterior"><i data-lucide="chevron-left" width="16" height="16"></i></button>' +
        '<span class="pf-calendar-label">' + capitalize(MONTH_NAMES[s.viewMonth]) + ' de ' + s.viewYear + '</span>' +
        '<button type="button" class="actionBtn" data-pf-cal-next aria-label="Próximo mês"><i data-lucide="chevron-right" width="16" height="16"></i></button>' +
        '</div>' +
        '<div class="pf-calendar-weekdays"><span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span></div>' +
        '<div class="pf-calendar-grid" data-pf-cal-grid>';
      for (var e = 0; e < firstWeekday; e++) html += '<span class="pf-calendar-day-empty"></span>';
      for (var day = 1; day <= daysInMonth; day++) {
        var iso = s.viewYear + '-' + pad2(s.viewMonth + 1) + '-' + pad2(day);
        var classes = ['pf-calendar-day'];
        if (s.current === iso) classes.push('is-selected');
        html += '<button type="button" class="' + classes.join(' ') + '" data-date="' + iso + '">' + day + '</button>';
      }
      html += '</div>';
      dateCalendarPopover.innerHTML = html;
      if (window.lucide) lucide.createIcons();

      dateCalendarPopover.querySelector('[data-pf-cal-prev]').addEventListener('click', function () {
        s.viewMonth--; if (s.viewMonth < 0) { s.viewMonth = 11; s.viewYear--; } renderDateCalendarPopover();
      });
      dateCalendarPopover.querySelector('[data-pf-cal-next]').addEventListener('click', function () {
        s.viewMonth++; if (s.viewMonth > 11) { s.viewMonth = 0; s.viewYear++; } renderDateCalendarPopover();
      });
      dateCalendarPopover.querySelector('[data-pf-cal-grid]').addEventListener('click', function (event) {
        var btn = event.target.closest('.pf-calendar-day');
        if (!btn) return;
        var onPick = s.onPick;
        closeDateCalendar();
        onPick(btn.dataset.date);
      });
    }

    function openDateCalendar(triggerEl, currentIso, onPick) {
      var isSameTrigger = dateCalendarState && dateCalendarState.triggerEl === triggerEl;
      closeDateCalendar();
      if (isSameTrigger) return; // clicar de novo no mesmo campo só fecha (toggle)
      var base = currentIso ? parseISO(currentIso) : parseISO(today);
      dateCalendarState = { triggerEl: triggerEl, viewYear: base.getFullYear(), viewMonth: base.getMonth(), current: currentIso, onPick: onPick };
      renderDateCalendarPopover();
      dateCalendarPopover.hidden = false;
      positionPopover(triggerEl, dateCalendarPopover, 240);
      window.setTimeout(function () { document.addEventListener('click', dateCalendarOutsideClick); }, 0);
    }

    // ---------- Modo "dia": campo-gatilho único; o calendário abre como
    // dropdown flutuante (ver `openDateCalendar` acima), nunca inline. ----------
    function renderDayCalendar() {
      function build() {
        var label = draft.date ? formatBR(draft.date) : 'Selecionar data';
        var html = '<div class="pf-date-fields">' +
          '<div class="wrapper pf-date-field">' +
          '<button type="button" class="trigger" data-pf-day-trigger>' +
          '<span class="pf-date-field-icon"><i data-lucide="calendar" width="16" height="16"></i></span>' +
          '<span class="pf-date-field-value' + (draft.date ? '' : ' is-placeholder') + '">' + label + '</span>' +
          '</button>' +
          '</div>' +
          '</div>';
        detailEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();

        var trigger = detailEl.querySelector('[data-pf-day-trigger]');
        trigger.addEventListener('click', function () {
          openDateCalendar(trigger, draft.date, function (iso) {
            draft.date = iso;
            build();
          });
        });
      }
      build();
    }

    // ---------- Modo "mes": grade de 12 meses ----------
    function renderMonthGrid() {
      function build() {
        var html = '<div class="pf-calendar-header">' +
          '<button type="button" class="actionBtn" data-pf-year-prev aria-label="Ano anterior"><i data-lucide="chevron-left" width="16" height="16"></i></button>' +
          '<span class="pf-calendar-label">' + draft.year + '</span>' +
          '<button type="button" class="actionBtn" data-pf-year-next aria-label="Próximo ano"><i data-lucide="chevron-right" width="16" height="16"></i></button>' +
          '</div>' +
          '<div class="pf-month-grid" data-pf-month-grid>';
        for (var m = 0; m < 12; m++) {
          var isSelected = draft.month === m;
          html += '<button type="button" class="pf-month-cell' + (isSelected ? ' is-selected' : '') + '" data-month="' + m + '">' + MONTH_ABBR[m] + '</button>';
        }
        html += '</div>';
        detailEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();

        detailEl.querySelector('[data-pf-year-prev]').addEventListener('click', function () { draft.year--; build(); });
        detailEl.querySelector('[data-pf-year-next]').addEventListener('click', function () { draft.year++; build(); });
        detailEl.querySelector('[data-pf-month-grid]').addEventListener('click', function (event) {
          var btn = event.target.closest('.pf-month-cell');
          if (!btn) return;
          draft.month = Number(btn.dataset.month);
          build();
        });
      }
      build();
    }

    // ---------- Modo "intervalo": Data inicial / Data final, cada uma com seu
    // próprio campo-gatilho; o calendário abre como dropdown flutuante fora
    // do card do filtro (ver `openDateCalendar` acima), nunca inline. ----------
    function renderIntervalPicker() {
      function build() {
        var startLabel = draft.start ? formatBR(draft.start) : 'Selecionar data';
        var endLabel = draft.end ? formatBR(draft.end) : 'Selecionar data';
        var html = '<div class="pf-date-fields">' +
          '<div class="wrapper pf-date-field">' +
          '<span class="label">Data inicial</span>' +
          '<button type="button" class="trigger" data-pf-field="start">' +
          '<span class="pf-date-field-icon"><i data-lucide="calendar" width="16" height="16"></i></span>' +
          '<span class="pf-date-field-value' + (draft.start ? '' : ' is-placeholder') + '">' + startLabel + '</span>' +
          '</button>' +
          '</div>' +
          '<div class="wrapper pf-date-field">' +
          '<span class="label">Data final</span>' +
          '<button type="button" class="trigger" data-pf-field="end">' +
          '<span class="pf-date-field-icon"><i data-lucide="calendar" width="16" height="16"></i></span>' +
          '<span class="pf-date-field-value' + (draft.end ? '' : ' is-placeholder') + '">' + endLabel + '</span>' +
          '</button>' +
          '</div>' +
          '</div>';
        detailEl.innerHTML = html;
        if (window.lucide) lucide.createIcons();

        var startTrigger = detailEl.querySelector('[data-pf-field="start"]');
        var endTrigger = detailEl.querySelector('[data-pf-field="end"]');

        startTrigger.addEventListener('click', function () {
          openDateCalendar(startTrigger, draft.start, function (iso) {
            draft.start = iso;
            if (draft.end && draft.end < draft.start) draft.end = null;
            build();
          });
        });
        endTrigger.addEventListener('click', function () {
          openDateCalendar(endTrigger, draft.end || draft.start, function (iso) {
            if (draft.start && iso < draft.start) {
              draft.end = draft.start;
              draft.start = iso;
            } else {
              draft.end = iso;
            }
            build();
          });
        });
      }

      build();
    }

    function renderDetail() {
      if (draft.mode === 'dia') {
        detailEl.hidden = false;
        renderDayCalendar();
      } else if (draft.mode === 'mes') {
        detailEl.hidden = false;
        renderMonthGrid();
      } else if (draft.mode === 'intervalo') {
        detailEl.hidden = false;
        renderIntervalPicker();
      } else {
        detailEl.hidden = true;
        detailEl.innerHTML = '';
      }
    }

    function selectMode(mode) {
      closeDateCalendar();
      draft.mode = mode;
      Array.prototype.slice.call(modeListEl.querySelectorAll('.pf-mode-option')).forEach(function (btn) {
        btn.classList.toggle('is-selected', btn.dataset.pfMode === mode);
      });
      renderDetail();
    }

    modeListEl.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-pf-mode]');
      if (!btn) return;
      selectMode(btn.dataset.pfMode);
      // Bug real corrigido: `maxHeight`/`top`/`bottom` do popover são
      // calculados uma única vez em `open()`, pro conteúdo do modo ATIVO
      // naquele momento ("Sem filtro", sem nenhum detalhe visível — o mais
      // baixo de todos). Trocar pra um modo com detalhe mais alto (ex.
      // "Mês", que soma cabeçalho de ano + grade de 12 meses) sem
      // recalcular deixava o `maxHeight` antigo valendo — como o popover é
      // `overflow:hidden`, o conteúdo novo (mais alto) estourava esse
      // limite e cortava o padding inferior + o rodapé Cancelar/Aplicar
      // inteiro, sem nenhum indício visual de que havia mais conteúdo.
      // Reposicionar de novo aqui recalcula `maxHeight` pro tamanho real do
      // modo recém-selecionado, sempre que o popover já estiver aberto.
      if (!popover.hidden) positionPopover(trigger, popover);
    });

    // ---------- Abrir/fechar popover ----------
    function close() {
      closeDateCalendar();
      popover.hidden = true;
      document.removeEventListener('click', outsideClick);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    }
    function outsideClick(event) {
      var path = event.composedPath ? event.composedPath() : [event.target];
      if (path.indexOf(dateCalendarPopover) !== -1) return; // clique dentro do calendário flutuante nunca fecha o popover de trás
      if (path.indexOf(popover) === -1 && path.indexOf(mount) === -1) close();
    }
    function open() {
      // Reinicia o rascunho a partir do valor já aplicado, sempre que abre.
      draft.mode = applied.mode;
      draft.date = applied.mode === 'dia' ? applied.start : null;
      draft.start = applied.mode === 'intervalo' ? applied.start : null;
      draft.end = applied.mode === 'intervalo' ? applied.end : null;
      if (applied.mode === 'mes' && applied.start) {
        var d = parseISO(applied.start);
        draft.year = d.getFullYear();
        draft.month = d.getMonth();
      } else if (!draft.year) {
        draft.year = parseISO(today).getFullYear();
        draft.month = parseISO(today).getMonth();
      }
      selectMode(draft.mode);
      popover.hidden = false;
      positionPopover(trigger, popover);
      window.setTimeout(function () {
        document.addEventListener('click', outsideClick);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
      }, 0);
    }

    trigger.addEventListener('click', function () {
      if (popover.hidden) open(); else close();
    });
    cancelBtn.addEventListener('click', close);
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!dateCalendarPopover.hidden) { closeDateCalendar(); return; }
      if (!popover.hidden) close();
    });

    // ---------- Aplicar ----------
    function computeResult() {
      if (draft.mode === 'none') {
        return { mode: 'none', start: null, end: null, label: noneLabel };
      }
      if (draft.mode === '30d') {
        var end30 = today;
        var start30 = addDaysISO(today, -29);
        return { mode: '30d', start: start30, end: end30, label: 'Últimos 30 dias' };
      }
      if (draft.mode === 'dia') {
        if (!draft.date) return null;
        return { mode: 'dia', start: draft.date, end: draft.date, label: formatBR(draft.date) };
      }
      if (draft.mode === 'mes') {
        var startMes = draft.year + '-' + pad2(draft.month + 1) + '-01';
        var endMes = lastDayOfMonthISO(draft.year, draft.month);
        return { mode: 'mes', start: startMes, end: endMes, label: capitalize(MONTH_NAMES[draft.month]) + ' de ' + draft.year };
      }
      if (draft.mode === 'intervalo') {
        if (!draft.start || !draft.end) return null;
        return { mode: 'intervalo', start: draft.start, end: draft.end, label: formatBR(draft.start) + ' até ' + formatBR(draft.end) };
      }
      return null;
    }

    applyBtn.addEventListener('click', function () {
      var result = computeResult();
      if (!result) return; // exige os campos do modo antes de aplicar
      applied = result;
      valueEl.textContent = applied.label;
      valueEl.classList.toggle('placeholder', applied.mode === 'none');
      close();
      onApply(applied);
    });

    // Aplica o valor inicial já formatado no trigger.
    valueEl.textContent = applied.label;
    valueEl.classList.add('placeholder');

    function reset() {
      applied = { mode: 'none', start: null, end: null, label: noneLabel };
      valueEl.textContent = applied.label;
      valueEl.classList.add('placeholder');
    }

    return {
      getResult: function () { return applied; },
      reset: reset
    };
  }

  window.NiveloPeriodFilter = { init: init, DEFAULT_TODAY: DEFAULT_TODAY };
})();
