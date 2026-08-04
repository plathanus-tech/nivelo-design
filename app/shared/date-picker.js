/* ══════════════════════════════════════════════════════════════════════
   NiveloDatePicker — implementação única, compartilhada, dos 2 padrões
   oficiais de calendário do sistema (ver Storybook-Nivelo/src/components/
   DatePicker/DatePicker.module.css pras classes `dp*`):

   - initDay(opts)   — dia único, grade de 7 dias, navegação mês a mês.
     Padrão pra qualquer campo que precise escolher uma DATA (ex.: "Data
     prevista de entrega" em Novo registo de estoque, "Atualizado a partir
     de" em Produtos).
   - initMonth(opts) — mês/ano, grade de 12 meses, navegação por ANO.
     Padrão pra qualquer campo que só precise escolher um MÊS (ex.:
     "Competência" em Caixa/Contas a Pagar/Contas a Receber).

   Antes desta rodada cada tela reimplementava sua própria cópia (mesmo
   algoritmo, nomes de classe/função diferentes por arquivo) — ver
   app/CLAUDE.md pro histórico. Esta é a ÚNICA implementação a partir de
   agora; nenhuma tela deve copiar o código, só chamar uma das 2 funções.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

  function positionPopover(trigger, popover) {
    var margin = 16;
    var width = Math.min(240, window.innerWidth - margin * 2);
    var rect = trigger.getBoundingClientRect();
    var left = rect.left;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    popover.style.position = 'fixed';
    popover.style.left = left + 'px';
    popover.style.width = width + 'px';
    popover.style.top = (rect.bottom + 4) + 'px';
  }

  // ---------- Modo "day" (dia único) ----------
  function initDay(opts) {
    var root = document.getElementById(opts.rootId);
    var trigger = document.getElementById(opts.triggerId);
    var valueEl = document.getElementById(opts.valueId);
    var hiddenInput = opts.hiddenInputId ? document.getElementById(opts.hiddenInputId) : null;
    var clearBtn = opts.clearId ? document.getElementById(opts.clearId) : null;
    var popover = document.getElementById(opts.popoverId);
    var labelEl = popover.querySelector('[data-dp-label]');
    var gridEl = popover.querySelector('[data-dp-grid]');
    var placeholder = opts.placeholder || 'Selecionar data';
    var formatValue = opts.formatValue || function (date) {
      return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear();
    };

    var selected = null;
    var viewYear = 0, viewMonth = 0;

    function toInputValue(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
    function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

    function renderCalendar() {
      labelEl.textContent = capitalize(MONTH_NAMES[viewMonth]) + ' de ' + viewYear;
      var firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      var html = '';
      for (var e = 0; e < firstWeekday; e++) html += '<span class="dpDayEmpty"></span>';
      for (var day = 1; day <= daysInMonth; day++) {
        var date = new Date(viewYear, viewMonth, day);
        var classes = ['dpDay', 'text-12-regular'];
        if (selected && sameDay(date, selected)) classes.push('dpDaySelected');
        html += '<button type="button" class="' + classes.join(' ') + '" data-date="' + toInputValue(date) + '">' + day + '</button>';
      }
      gridEl.innerHTML = html;
    }

    function close() {
      popover.hidden = true;
      document.removeEventListener('click', outsideClick);
    }
    function outsideClick(event) {
      var path = event.composedPath ? event.composedPath() : [event.target];
      if (path.indexOf(root) === -1) close();
    }
    function open() {
      if (root.classList.contains('is-readonly')) return;
      var base = selected || new Date();
      viewYear = base.getFullYear();
      viewMonth = base.getMonth();
      renderCalendar();
      popover.hidden = false;
      positionPopover(trigger, popover);
      window.setTimeout(function () { document.addEventListener('click', outsideClick); }, 0);
    }

    function applySelected(date) {
      selected = date;
      valueEl.textContent = formatValue(date);
      valueEl.classList.remove('dpPlaceholder');
      if (hiddenInput) hiddenInput.value = toInputValue(date);
      if (clearBtn) clearBtn.hidden = false;
    }
    function applyCleared() {
      selected = null;
      valueEl.textContent = placeholder;
      valueEl.classList.add('dpPlaceholder');
      if (hiddenInput) hiddenInput.value = '';
      if (clearBtn) clearBtn.hidden = true;
    }

    trigger.addEventListener('click', function () {
      if (popover.hidden) open(); else close();
    });

    gridEl.addEventListener('click', function (event) {
      var btn = event.target.closest('.dpDay');
      if (!btn) return;
      var parts = btn.dataset.date.split('-');
      applySelected(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
      close();
      if (opts.onChange) opts.onChange(toInputValue(selected));
    });

    popover.querySelector('[data-dp-prev]').addEventListener('click', function () {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    popover.querySelector('[data-dp-next]').addEventListener('click', function () {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        applyCleared();
        if (opts.onChange) opts.onChange(null);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !popover.hidden) close();
    });

    return {
      getValue: function () { return selected ? toInputValue(selected) : null; },
      setValue: function (iso) {
        if (!iso) { applyCleared(); return; }
        var parts = iso.split('-');
        applySelected(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
      },
      setReadonly: function (readonly) {
        root.classList.toggle('is-readonly', readonly);
        trigger.disabled = readonly;
        if (clearBtn) clearBtn.disabled = readonly;
      }
    };
  }

  // ---------- Modo "month" (Competência) ----------
  function initMonth(opts) {
    var root = document.getElementById(opts.rootId);
    var trigger = document.getElementById(opts.triggerId);
    var valueEl = document.getElementById(opts.valueId);
    var clearBtn = opts.clearId ? document.getElementById(opts.clearId) : null;
    var popover = document.getElementById(opts.popoverId);
    var yearLabel = popover.querySelector('[data-competencia-year-label]');
    var grid = popover.querySelector('[data-competencia-grid]');
    var placeholder = opts.placeholder || 'Selecionar competência';

    var value = null; // { year, month } (month 0-11) ou null
    var viewYear = new Date().getFullYear();

    function renderGrid() {
      yearLabel.textContent = String(viewYear);
      var html = '';
      for (var m = 0; m < 12; m++) {
        var isSelected = value && value.year === viewYear && value.month === m;
        html += '<button type="button" class="dpMonth' + (isSelected ? ' dpMonthSelected' : '') + '" data-month="' + m + '">' + MONTH_ABBR[m] + '</button>';
      }
      grid.innerHTML = html;
    }

    function close() {
      popover.hidden = true;
      document.removeEventListener('click', outsideClick);
    }
    function outsideClick(event) {
      var path = event.composedPath ? event.composedPath() : [event.target];
      if (path.indexOf(root) === -1) close();
    }
    function open() {
      if (root.classList.contains('is-readonly')) return;
      viewYear = value ? value.year : new Date().getFullYear();
      renderGrid();
      popover.hidden = false;
      positionPopover(trigger, popover);
      window.setTimeout(function () { document.addEventListener('click', outsideClick); }, 0);
    }

    function applySelected(year, month) {
      value = { year: year, month: month };
      valueEl.textContent = capitalize(MONTH_NAMES[month]) + ' de ' + year;
      valueEl.classList.remove('dpPlaceholder');
      if (clearBtn) clearBtn.hidden = false;
    }
    function applyCleared() {
      value = null;
      valueEl.textContent = placeholder;
      valueEl.classList.add('dpPlaceholder');
      if (clearBtn) clearBtn.hidden = true;
    }

    trigger.addEventListener('click', function () {
      if (popover.hidden) open(); else close();
    });

    grid.addEventListener('click', function (event) {
      var btn = event.target.closest('.dpMonth');
      if (!btn) return;
      applySelected(viewYear, Number(btn.dataset.month));
      close();
      if (opts.onChange) opts.onChange(getAaaaMm());
    });

    popover.querySelector('[data-competencia-prev-year]').addEventListener('click', function () {
      viewYear--;
      renderGrid();
    });
    popover.querySelector('[data-competencia-next-year]').addEventListener('click', function () {
      viewYear++;
      renderGrid();
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        applyCleared();
        if (opts.onChange) opts.onChange(null);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !popover.hidden) close();
    });

    function getAaaaMm() {
      if (!value) return null;
      return value.year + '-' + pad2(value.month + 1);
    }

    return {
      getValue: getAaaaMm,
      setValue: function (aaaaMm) {
        if (!aaaaMm) { applyCleared(); return; }
        var parts = aaaaMm.split('-');
        applySelected(Number(parts[0]), Number(parts[1]) - 1);
      },
      setReadonly: function (readonly) {
        root.classList.toggle('is-readonly', readonly);
        trigger.disabled = readonly;
        if (clearBtn) clearBtn.disabled = readonly;
      }
    };
  }

  window.NiveloDatePicker = { initDay: initDay, initMonth: initMonth };
})();
