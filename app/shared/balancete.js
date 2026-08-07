(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TODAY = '2026-07-31';
  var MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  // ---------- Helpers de data ----------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function isoFromDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(iso) { var p = iso.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function addDaysISO(iso, days) { var d = parseISO(iso); d.setDate(d.getDate() + days); return isoFromDate(d); }
  function diffDays(isoA, isoB) { return Math.round((parseISO(isoA).getTime() - parseISO(isoB).getTime()) / 86400000); }
  function lastDayOfMonthISO(yyyyMm) {
    var p = yyyyMm.split('-').map(Number);
    var d = new Date(p[0], p[1], 0);
    return isoFromDate(d);
  }
  function formatDataPt(iso) {
    var p = (iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : (iso || '—');
  }
  function formatMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatInt(valor) {
    return Number(Math.round(valor || 0)).toLocaleString('pt-BR');
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) { return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, ''); }

  // ---------- Toast ----------
  var toastRegion = document.getElementById('toast-region');
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success bal-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div><div class="message">' + message + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 4000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica do resto do sistema) ----------
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
  }
  function hideActionTooltip(btn) { var tip = btn.__tip; if (tip) tip.style.opacity = '0'; }
  document.addEventListener('mouseover', function (e) { var b = e.target.closest('.actionBtn[data-export]'); if (b) positionActionTooltip(b); });
  document.addEventListener('mouseout', function (e) { var b = e.target.closest('.actionBtn[data-export]'); if (b) hideActionTooltip(b); });

  // ---------- Dropdown genérico (seleção única) ----------
  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = Math.min(240, window.innerHeight - rect.bottom - margin) + 'px';
    }
    function close() { root.classList.remove('open'); window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', close); }
    function onScroll(e) { if (menu.contains(e.target)) return; close(); }
    function open() { root.classList.add('open'); positionMenu(); window.addEventListener('scroll', onScroll, true); window.addEventListener('resize', close); }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
    }
    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (e) { var o = e.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { root: root };
  }

  // ---------- Combobox (Conta/Categoria) — dropdown pesquisável no padrão
  // Radix/shadcn: aparência de Select (chevron+trigger em `.input`, mesma
  // altura/raio/padding/foco de qualquer outro campo do sistema), digitação
  // dentro do próprio campo filtra a lista, navegação por teclado (↑↓ Enter
  // Esc) além de mouse, animação de abertura/fechamento e "selected"/
  // "is-active" (destaque do teclado) com a mesma aparência nos 2 campos —
  // as duas telas chamam a MESMA função, então identidade visual e
  // comportamento são garantidos por construção, não por CSS duplicado.
  // Opção fixa "Todos(as) X" sempre no topo da lista. ----------
  var COMBOBOX_CLOSE_MS = 140;

  function initCombobox(root, allLabel, items) {
    var input = root.querySelector('[data-combobox-input]');
    var menu = root.querySelector('[data-combobox-menu]');
    var value = '';
    var displayValue = ''; // '' = "Todos(as) X", mostrado via placeholder
    var visibleOptions = [];
    var highlightedIndex = -1;
    var closeTimer = null;

    function buildOptions(query) {
      var normalizedQuery = normalize(query);
      var matches = items.filter(function (it) { return normalize(it.label).indexOf(normalizedQuery) !== -1; });
      var noResults = !!query && !matches.length;
      var opts = [{ value: '', label: allLabel }];
      if (!noResults) opts = opts.concat(matches);
      return { opts: opts, noResults: noResults };
    }

    function renderOptions(query) {
      var built = buildOptions(query);
      visibleOptions = built.opts;
      if (highlightedIndex >= visibleOptions.length) highlightedIndex = visibleOptions.length - 1;
      var html = visibleOptions.map(function (opt, i) {
        var classes = 'option';
        if (opt.value === value) classes += ' selected';
        if (i === highlightedIndex) classes += ' is-active';
        return '<div class="' + classes + '" role="option" aria-selected="' + (opt.value === value) + '" data-index="' + i + '" data-value="' + opt.value + '" data-label="' + opt.label + '">' + opt.label + '</div>';
      }).join('');
      if (built.noResults) html += '<div class="option-empty">Nenhum resultado encontrado.</div>';
      menu.innerHTML = html;
    }

    function positionMenu() {
      var rect = input.getBoundingClientRect();
      var margin = 8;
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = Math.min(240, window.innerHeight - rect.bottom - margin) + 'px';
    }
    function isOpen() { return !menu.hidden; }
    function close() {
      menu.classList.remove('is-open');
      root.classList.remove('open');
      input.setAttribute('aria-expanded', 'false');
      input.value = displayValue;
      highlightedIndex = -1;
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', positionMenu);
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(function () { menu.hidden = true; }, COMBOBOX_CLOSE_MS);
    }
    function onScroll(e) { if (menu.contains(e.target)) return; close(); }
    function open() {
      if (isOpen()) return;
      window.clearTimeout(closeTimer);
      renderOptions(input.value === displayValue ? '' : input.value);
      highlightedIndex = visibleOptions.reduce(function (found, opt, i) { return opt.value === value ? i : found; }, -1);
      menu.hidden = false;
      positionMenu();
      root.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      window.requestAnimationFrame(function () { menu.classList.add('is-open'); });
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', positionMenu);
    }
    function highlight(nextIndex) {
      if (!visibleOptions.length) return;
      var count = visibleOptions.length;
      highlightedIndex = ((nextIndex % count) + count) % count;
      Array.prototype.forEach.call(menu.querySelectorAll('.option'), function (el) {
        el.classList.toggle('is-active', Number(el.dataset.index) === highlightedIndex);
      });
      var activeEl = menu.querySelector('.option[data-index="' + highlightedIndex + '"]');
      if (activeEl && activeEl.scrollIntoView) activeEl.scrollIntoView({ block: 'nearest' });
    }
    function selectIndex(i) {
      var opt = visibleOptions[i];
      if (!opt) return;
      value = opt.value;
      displayValue = opt.value === '' ? '' : opt.label;
      input.value = displayValue;
      close();
      input.blur();
    }

    input.addEventListener('focus', open);
    input.addEventListener('click', open);
    input.addEventListener('input', function () {
      highlightedIndex = -1;
      renderOptions(input.value);
      if (!isOpen()) open(); else positionMenu();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen()) open(); else highlight(highlightedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen()) open(); else highlight(highlightedIndex - 1);
      } else if (e.key === 'Enter') {
        if (isOpen()) { e.preventDefault(); selectIndex(highlightedIndex >= 0 ? highlightedIndex : 0); }
      } else if (e.key === 'Escape') {
        if (isOpen()) { e.preventDefault(); close(); }
      }
    });
    menu.addEventListener('mousemove', function (e) {
      var o = e.target.closest('.option');
      if (!o) return;
      var i = Number(o.dataset.index);
      if (i !== highlightedIndex) highlight(i);
    });
    menu.addEventListener('click', function (e) { var o = e.target.closest('.option'); if (o) selectIndex(Number(o.dataset.index)); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target) && isOpen()) close(); });

    return {
      getValue: function () { return value; },
      getLabel: function () { return displayValue || allLabel; }
    };
  }

  // ---------- Radio "Tipo de período" ----------
  var mesAnoField = document.getElementById('mes-ano-field');
  var intervaloFields = document.getElementById('intervalo-fields');
  var mesAnoInput = document.getElementById('bal-mes-ano');
  var dataInicialInput = document.getElementById('bal-data-inicial');
  var dataFinalInput = document.getElementById('bal-data-final');

  function syncRadioChecked() {
    Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-periodo"]')).forEach(function (radio) {
      radio.closest('.option').classList.toggle('checked', radio.checked);
    });
  }
  function syncTipoPeriodo() {
    var tipo = document.querySelector('input[name="tipo-periodo"]:checked').value;
    mesAnoField.hidden = tipo !== 'mes';
    intervaloFields.hidden = tipo !== 'intervalo';
    syncRadioChecked();
  }
  Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-periodo"]')).forEach(function (radio) {
    radio.addEventListener('change', syncTipoPeriodo);
  });
  syncTipoPeriodo();

  // ---------- Mês/Ano, Data inicial/final: padrões oficiais de calendário
  // do sistema (mês e dia único), ver app/shared/date-picker.js. ----------
  var mesAnoPicker = window.NiveloDatePicker.initMonth({
    rootId: 'mes-ano-field',
    triggerId: 'bal-mes-ano-trigger',
    valueId: 'bal-mes-ano-value',
    popoverId: 'bal-mes-ano-popover',
    placeholder: 'Selecionar competência'
  });
  mesAnoPicker.setValue('2026-07');

  var dataInicialPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-inicial-field',
    triggerId: 'bal-data-inicial-trigger',
    valueId: 'bal-data-inicial-value',
    hiddenInputId: 'bal-data-inicial',
    popoverId: 'bal-data-inicial-popover',
    placeholder: 'Selecionar data'
  });
  var dataFinalPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-final-field',
    triggerId: 'bal-data-final-trigger',
    valueId: 'bal-data-final-value',
    hiddenInputId: 'bal-data-final',
    popoverId: 'bal-data-final-popover',
    placeholder: 'Selecionar data'
  });
  dataInicialPicker.setValue('2026-07-01');
  dataFinalPicker.setValue(TODAY);

  // ---------- Filtros: Conta/Categoria/Agrupamento ----------
  var contaItems = window.NiveloContasFinanceiras.list().map(function (c) { return { value: String(c.codigo), label: c.nome }; });
  var contaSelect = initCombobox(document.getElementById('conta-field'), 'Todas as contas', contaItems);

  var categoriaItems = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).map(function (c) { return { value: c.codigo, label: c.descricao }; });
  var categoriaSelect = initCombobox(document.getElementById('categoria-field'), 'Todas as categorias', categoriaItems);

  var agrupamentoDropdown = initDropdown(document.getElementById('agrupamento-field'));

  var AGRUPAMENTO_LABEL = { dia: 'Por dia', semana: 'Por semana', mes: 'Por mês' };

  // ---------- Montagem das colunas (período) ----------
  function buildColumns(start, end, agrupamento) {
    var columns = [];
    if (agrupamento === 'dia') {
      var cursor = start;
      while (cursor <= end) {
        columns.push({ key: cursor, label: cursor.slice(8, 10) });
        cursor = addDaysISO(cursor, 1);
      }
    } else if (agrupamento === 'semana') {
      var cursor2 = start;
      var index = 1;
      while (cursor2 <= end) {
        columns.push({ key: cursor2, label: 'Semana ' + index });
        cursor2 = addDaysISO(cursor2, 7);
        index++;
      }
    } else {
      var startParts = start.split('-').map(Number);
      var endParts = end.split('-').map(Number);
      var year = startParts[0], month = startParts[1];
      while (year < endParts[0] || (year === endParts[0] && month <= endParts[1])) {
        columns.push({ key: year + '-' + pad2(month), label: MONTH_ABBR[month - 1] });
        month++;
        if (month > 12) { month = 1; year++; }
      }
    }
    return columns;
  }

  function columnIndexFor(dataIso, columns, agrupamento) {
    if (agrupamento === 'dia') {
      for (var i = 0; i < columns.length; i++) { if (columns[i].key === dataIso) return i; }
      return -1;
    }
    if (agrupamento === 'semana') {
      var offset = diffDays(dataIso, columns[0].key);
      var idx = Math.floor(offset / 7);
      return (idx >= 0 && idx < columns.length) ? idx : -1;
    }
    var key = dataIso.slice(0, 7);
    for (var j = 0; j < columns.length; j++) { if (columns[j].key === key) return j; }
    return -1;
  }

  function chooseAgrupamento(start, end, escolha) {
    if (escolha !== 'automatica') return escolha;
    var days = diffDays(end, start) + 1;
    if (days <= 31) return 'dia';
    if (days <= 180) return 'semana';
    return 'mes';
  }

  // ---------- Geração do relatório ----------
  var currentReport = null;

  function gerarRelatorio() {
    var tipoPeriodo = document.querySelector('input[name="tipo-periodo"]:checked').value;
    var start, end;
    if (tipoPeriodo === 'mes') {
      var mesAno = mesAnoPicker.getValue();
      if (!mesAno) { showToast('Informe o período', 'Selecione o mês/ano para gerar o relatório.'); return; }
      start = mesAno + '-01';
      end = lastDayOfMonthISO(mesAno);
    } else {
      start = dataInicialInput.value;
      end = dataFinalInput.value;
      if (!start || !end || start > end) { showToast('Informe o período', 'Selecione uma data inicial e final válidas.'); return; }
    }

    var contaCodigo = contaSelect.getValue();
    var categoriaCodigo = categoriaSelect.getValue();
    var agrupamentoEscolha = document.getElementById('agrupamento-field').dataset.value || 'automatica';
    var agrupamento = chooseAgrupamento(start, end, agrupamentoEscolha);
    var columns = buildColumns(start, end, agrupamento);

    var categoriasReceita = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo && c.grupo === 'receita'; });
    var categoriasDespesa = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo && c.grupo === 'despesa'; });

    function zeros() { return columns.map(function () { return 0; }); }
    var valoresReceita = {}; categoriasReceita.forEach(function (c) { valoresReceita[c.codigo] = zeros(); });
    var valoresDespesa = {}; categoriasDespesa.forEach(function (c) { valoresDespesa[c.codigo] = zeros(); });

    window.NiveloCaixa.list().forEach(function (l) {
      if (l.data < start || l.data > end) return;
      if (contaCodigo && String(l.contaFinanceiraCodigo) !== contaCodigo) return;
      if (categoriaCodigo && l.categoriaCodigo !== categoriaCodigo) return;
      var idx = columnIndexFor(l.data, columns, agrupamento);
      if (idx === -1) return;
      var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(l.categoriaCodigo);
      if (!categoria) return;
      if (categoria.grupo === 'receita' && valoresReceita[categoria.codigo]) {
        valoresReceita[categoria.codigo][idx] += l.valor;
      } else if (categoria.grupo === 'despesa' && valoresDespesa[categoria.codigo]) {
        valoresDespesa[categoria.codigo][idx] += l.valor;
      }
    });

    var totalEntradas = zeros();
    categoriasReceita.forEach(function (c) { valoresReceita[c.codigo].forEach(function (v, i) { totalEntradas[i] += v; }); });
    var totalSaidas = zeros();
    categoriasDespesa.forEach(function (c) { valoresDespesa[c.codigo].forEach(function (v, i) { totalSaidas[i] += v; }); });
    var saldo = columns.map(function (_, i) { return totalEntradas[i] - totalSaidas[i]; });

    var grandEntradas = totalEntradas.reduce(function (a, b) { return a + b; }, 0);
    var grandSaidas = totalSaidas.reduce(function (a, b) { return a + b; }, 0);

    currentReport = {
      start: start, end: end, agrupamento: agrupamento, agrupamentoEscolha: agrupamentoEscolha,
      columns: columns,
      categoriasReceita: categoriasReceita, valoresReceita: valoresReceita,
      categoriasDespesa: categoriasDespesa, valoresDespesa: valoresDespesa,
      totalEntradas: totalEntradas, totalSaidas: totalSaidas, saldo: saldo,
      grandEntradas: grandEntradas, grandSaidas: grandSaidas, grandSaldo: grandEntradas - grandSaidas,
      contaLabel: contaCodigo ? contaSelect.getLabel() : 'Todas as contas',
      categoriaLabel: categoriaCodigo ? categoriaSelect.getLabel() : 'Todas as categorias'
    };

    renderReport(currentReport);
    setFiltrosExpanded(false);
  }

  // ---------- Render: cabeçalho/resumo + KPIs ----------
  function renderReport(report) {
    document.getElementById('bal-resultado').hidden = false;

    var periodoLabel = report.agrupamentoEscolha === 'mes' && report.start.slice(8, 10) === '01'
      ? formatDataPt(report.start) + ' a ' + formatDataPt(report.end)
      : formatDataPt(report.start) + ' a ' + formatDataPt(report.end);
    var visualizacaoLabel = AGRUPAMENTO_LABEL[report.agrupamento] + (report.agrupamentoEscolha === 'automatica' ? ' (Automática)' : '');

    document.getElementById('bal-resumo-filtros').textContent =
      'Período: ' + periodoLabel + ' · Conta: ' + report.contaLabel + ' · Categoria: ' + report.categoriaLabel + ' · Visualização: ' + visualizacaoLabel;

    document.getElementById('bal-kpi-entradas').textContent = formatMoeda(report.grandEntradas);
    document.getElementById('bal-kpi-saidas').textContent = formatMoeda(report.grandSaidas);
    var saldoEl = document.getElementById('bal-kpi-saldo');
    saldoEl.textContent = formatMoeda(report.grandSaldo);
    saldoEl.classList.toggle('bal-value-positive', report.grandSaldo >= 0);
    saldoEl.classList.toggle('bal-value-negative', report.grandSaldo < 0);

    renderChart(report);
    renderTable(report);
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Eixo X — mesma lógica de rótulos do gráfico do DRE (ver `dre.js`'s
  // `buildAxisLabelsHTML`, cópia própria aqui por convenção do projeto: telas de relatório
  // não compartilham JS entre si). No agrupamento por dia, "01 Mmm" só no 1º dia de cada mês
  // representado + o dia isolado a cada 5 dias; nos demais agrupamentos, amostragem por
  // `labelStep` (no máximo ~12 rótulos). ----------
  function buildAxisLabelsHTML(report, labelClass) {
    var n = report.columns.length;
    if (report.agrupamento === 'dia') {
      // O mês ("01 Jul") só cabe em telas largas — abaixo de 768px a coluna de cada dia fica
      // estreita demais pro texto completo (`.dre/bal-chart-axis-month` escondido via media
      // query, ver page-dre.css/page-balancete.css), sobrando só o número do dia ("01").
      return report.columns.map(function (c) {
        var day = Number(c.key.slice(8, 10));
        var month = Number(c.key.slice(5, 7));
        var inner = '';
        if (day === 1) {
          inner = '<span class="' + labelClass + '-day">01</span><span class="' + labelClass + '-month">&nbsp;' + MONTH_ABBR[month - 1] + '</span>';
        } else if (day % 5 === 0) {
          inner = '<span class="' + labelClass + '-day">' + c.key.slice(8, 10) + '</span>';
        }
        return '<span class="' + labelClass + ' text-10-medium">' + inner + '</span>';
      }).join('');
    }
    var labelStep = n > 12 ? Math.ceil(n / 12) : 1;
    return report.columns.map(function (c, j) {
      var text = j % labelStep === 0 ? c.label : '';
      return '<span class="' + labelClass + ' text-10-medium">' + text + '</span>';
    }).join('');
  }

  // ---------- Gráfico de barras (SVG puro) — Entradas x Saídas lado a lado
  // por dia/período, visual limpo (Stripe/Linear/Vercel): sem faixas de
  // fundo (removidas por completo, competiam visualmente com as barras).
  // Sem eixo Y numérico de propósito (mesma decisão do gráfico do DRE): as
  // 3 gridlines horizontais antigas nunca tinham valor associado (só
  // decorativas) — removidas em favor da linha de zero (única referência
  // horizontal com significado real) + tooltip rico por dia no hover
  // (valor exato de Entradas/Saídas/Saldo). Linhas verticais entre cada
  // dia seguem como grid discreto de separação, mesma densidade do DRE. ---
  function renderChart(report) {
    var svg = document.getElementById('bal-chart-svg');
    var axis = document.getElementById('bal-chart-axis');
    var n = report.columns.length;
    var chartW = 100, chartH = 40;
    var maxValue = Math.max(1, report.totalEntradas.concat(report.totalSaidas).reduce(function (m, v) { return Math.max(m, v); }, 0));
    var groupW = chartW / n;
    var groupPad = groupW * 0.14;
    var innerW = groupW - groupPad * 2;
    var barGap = innerW * 0.1;
    var barW = (innerW - barGap) / 2;
    var baseline = chartH - 1;
    var usableH = baseline - 2;

    var gridlines = '';
    for (var g = 1; g < n; g++) {
      var gx = g * groupW;
      gridlines += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + baseline + '" stroke="var(--color-border-subtle)" stroke-width="0.15" stroke-opacity="0.5"></line>';
    }

    var bars = '';
    var hitareas = '';
    for (var i = 0; i < n; i++) {
      var groupX = i * groupW + groupPad;
      var hEntrada = (report.totalEntradas[i] / maxValue) * usableH;
      var hSaida = (report.totalSaidas[i] / maxValue) * usableH;
      var xEntrada = groupX;
      var xSaida = groupX + barW + barGap;
      bars +=
        '<rect class="bal-chart-bar" data-idx="' + i + '" x="' + xEntrada + '" y="' + (baseline - hEntrada) + '" width="' + barW + '" height="' + Math.max(hEntrada, 0.3) + '" fill="var(--color-status-success-fg)" rx="0.5"></rect>' +
        '<rect class="bal-chart-bar" data-idx="' + i + '" x="' + xSaida + '" y="' + (baseline - hSaida) + '" width="' + barW + '" height="' + Math.max(hSaida, 0.3) + '" fill="var(--color-status-error-fg)" rx="0.5"></rect>';
      hitareas += '<rect class="bal-chart-hit" data-idx="' + i + '" x="' + (i * groupW) + '" y="0" width="' + groupW + '" height="' + baseline + '" fill="transparent" pointer-events="all"></rect>';
    }

    svg.setAttribute('viewBox', '0 0 ' + chartW + ' ' + chartH);
    svg.innerHTML =
      gridlines +
      '<line class="bal-chart-zero-line" x1="0" y1="' + baseline + '" x2="' + chartW + '" y2="' + baseline + '" stroke-width="0.35"></line>' +
      bars + hitareas;

    axis.innerHTML = buildAxisLabelsHTML(report, 'bal-chart-axis-label');
  }

  // ---------- Tooltip do gráfico — um único tooltip por dia/período
  // (hover em qualquer ponto da coluna, não por barra individual), com
  // Data, Entradas, Saídas e Saldo do dia. Visual "moderno" (fundo escuro,
  // sombra suave), criado uma vez e reaproveitado a cada hover. ----------
  var chartTooltip = document.createElement('div');
  chartTooltip.className = 'bal-chart-tooltip';
  chartTooltip.setAttribute('role', 'tooltip');
  chartTooltip.hidden = true;
  document.body.appendChild(chartTooltip);

  function positionChartTooltip(clientX, clientY) {
    var rect = chartTooltip.getBoundingClientRect();
    var margin = 14;
    var left = clientX + margin;
    var top = clientY - rect.height - margin;
    if (left + rect.width > window.innerWidth - 8) left = clientX - rect.width - margin;
    if (left < 8) left = 8;
    if (top < 8) top = clientY + margin;
    chartTooltip.style.left = left + 'px';
    chartTooltip.style.top = top + 'px';
  }

  function showChartTooltip(clientX, clientY, idx) {
    if (!currentReport) return;
    var col = currentReport.columns[idx];
    var entradas = currentReport.totalEntradas[idx];
    var saidas = currentReport.totalSaidas[idx];
    var saldo = entradas - saidas;
    var headerPrefix = currentReport.agrupamento === 'dia' ? 'Data' : 'Período';
    var headerLabel = currentReport.agrupamento === 'dia' ? formatDataPt(col.key) : col.label;
    chartTooltip.innerHTML =
      '<div class="bal-chart-tooltip-header">' + headerPrefix + ': ' + headerLabel + '</div>' +
      '<div class="bal-chart-tooltip-row"><span class="bal-chart-legend-dot bal-chart-legend-dot-entrada"></span><span class="bal-chart-tooltip-label">Entradas</span><span class="bal-chart-tooltip-value">' + formatMoeda(entradas) + '</span></div>' +
      '<div class="bal-chart-tooltip-row"><span class="bal-chart-legend-dot bal-chart-legend-dot-saida"></span><span class="bal-chart-tooltip-label">Saídas</span><span class="bal-chart-tooltip-value">' + formatMoeda(saidas) + '</span></div>' +
      '<div class="bal-chart-tooltip-row bal-chart-tooltip-saldo"><span class="bal-chart-tooltip-label">Saldo do dia</span><span class="bal-chart-tooltip-value ' + (saldo >= 0 ? 'bal-value-positive' : 'bal-value-negative') + '">' + formatMoeda(saldo) + '</span></div>';
    chartTooltip.hidden = false;
    positionChartTooltip(clientX, clientY);
  }
  function hideChartTooltip() { chartTooltip.hidden = true; }

  // Hover: ilumina (expande) as 2 barras do dia/período — Entrada e Saída juntas, já que o
  // tooltip também é por dia, não por barra individual (ver `showChartTooltip`).
  function clearActiveBars() {
    Array.prototype.slice.call(document.querySelectorAll('.bal-chart-bar.is-active')).forEach(function (el) { el.classList.remove('is-active'); });
  }
  function setActiveBars(idx) {
    clearActiveBars();
    Array.prototype.slice.call(document.querySelectorAll('.bal-chart-bar[data-idx="' + idx + '"]')).forEach(function (el) { el.classList.add('is-active'); });
  }

  var chartSvgEl = document.getElementById('bal-chart-svg');
  chartSvgEl.addEventListener('mousemove', function (e) {
    var hit = e.target.closest('.bal-chart-hit');
    if (!hit) { hideChartTooltip(); clearActiveBars(); return; }
    var idx = Number(hit.dataset.idx);
    showChartTooltip(e.clientX, e.clientY, idx);
    setActiveBars(idx);
  });
  chartSvgEl.addEventListener('mouseleave', function () { hideChartTooltip(); clearActiveBars(); });

  // ---------- Tabela matricial (grupos expansíveis) ----------
  var collapsedGroups = {};

  function toggleGroup(groupId) {
    collapsedGroups[groupId] = !collapsedGroups[groupId];
    applyRowVisibility();
  }

  function applyRowVisibility() {
    Array.prototype.slice.call(document.querySelectorAll('#bal-tbody [data-parent-group]')).forEach(function (row) {
      var hidden = false;
      var parents = row.dataset.parentGroup.split(',');
      parents.forEach(function (p) { if (collapsedGroups[p]) hidden = true; });
      row.classList.toggle('bal-row-collapsed', hidden);
    });
    Array.prototype.slice.call(document.querySelectorAll('.bal-group-toggle')).forEach(function (btn) {
      btn.classList.toggle('is-collapsed', !!collapsedGroups[btn.dataset.groupId]);
    });
  }

  function groupRowHTML(opts) {
    // opts: { level, label, values, groupId, parentGroup, toggles, indent }
    var cells = opts.values.map(function (v) { return '<td class="td">' + formatInt(v) + '</td>'; }).join('');
    var toggleBtn = opts.toggles
      ? '<button type="button" class="bal-group-toggle" data-group-id="' + opts.groupId + '" aria-label="Expandir/recolher"><i data-lucide="chevron-down" width="14" height="14"></i></button>'
      : '<span class="bal-group-toggle"></span>';
    return (
      '<tr class="tr bal-row-level-' + opts.level + '"' + (opts.parentGroup ? ' data-parent-group="' + opts.parentGroup + '"' : '') + '>' +
        '<td class="td"><span class="bal-row-label' + (opts.indent ? ' bal-row-indent-' + opts.indent : '') + '">' + toggleBtn + opts.label + '</span></td>' +
        cells +
      '</tr>'
    );
  }

  function categoriaRowHTML(label, values, parentGroup, isEven) {
    var cells = values.map(function (v) { return '<td class="td">' + formatInt(v) + '</td>'; }).join('');
    return (
      '<tr class="tr bal-row-level-2' + (isEven ? ' bal-row-zebra' : '') + '" data-parent-group="' + parentGroup + '">' +
        '<td class="td"><span class="bal-row-label bal-row-indent-2">' + label + '</span></td>' +
        cells +
      '</tr>'
    );
  }

  function renderTable(report) {
    var headerRow = document.getElementById('bal-header-row');
    headerRow.innerHTML = '<th class="th">Categoria</th>' + report.columns.map(function (c) { return '<th class="th">' + c.label + '</th>'; }).join('');

    var html = '';

    // Entradas > Receitas > categorias
    html += groupRowHTML({ level: 0, label: 'Entradas', values: report.totalEntradas, groupId: 'entradas', toggles: true });
    html += groupRowHTML({ level: 1, label: 'Receitas', values: report.totalEntradas, groupId: 'receitas', parentGroup: 'entradas', toggles: true, indent: 1 });
    report.categoriasReceita.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, report.valoresReceita[c.codigo], 'entradas,receitas', i % 2 === 1);
    });

    // Saídas > Despesas > categorias
    html += groupRowHTML({ level: 0, label: 'Saídas', values: report.totalSaidas, groupId: 'saidas', toggles: true });
    html += groupRowHTML({ level: 1, label: 'Despesas', values: report.totalSaidas, groupId: 'despesas', parentGroup: 'saidas', toggles: true, indent: 1 });
    report.categoriasDespesa.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, report.valoresDespesa[c.codigo], 'saidas,despesas', i % 2 === 1);
    });

    // Resultado — nunca recolhível.
    html += groupRowHTML({ level: 0, label: 'Resultado', values: report.columns.map(function () { return null; }), groupId: 'resultado', toggles: false })
      .replace(/<td class="td">0<\/td>/g, '<td class="td"></td>');
    html += groupRowHTML({ level: 1, label: 'Total de entradas', values: report.totalEntradas, groupId: 'resultado-entradas', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-resultado');
    html += groupRowHTML({ level: 1, label: 'Total de saídas', values: report.totalSaidas, groupId: 'resultado-saidas', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-resultado');
    html += groupRowHTML({ level: 1, label: 'Saldo do período', values: report.saldo, groupId: 'saldo', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-saldo');

    document.getElementById('bal-tbody').innerHTML = html;
    applyRowVisibility();
    updateScrollFade();
  }

  document.getElementById('bal-tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('.bal-group-toggle[data-group-id]');
    if (!btn) return;
    toggleGroup(btn.dataset.groupId);
  });

  // ---------- Rolagem horizontal da tabela: indicativo visual (fade à
  // direita, cobrindo cabeçalho+corpo) + scrollbar espelhada ACIMA da
  // tabela no mobile (mesmo scrollWidth, sincronizada via scroll dos dois
  // lados) + arrastar diretamente sobre a tabela pra rolar (mouse; toque
  // já rola nativamente via overflow-x). ----------
  var tableWrapEl = document.getElementById('bal-tablewrap');
  var tableScrollShell = document.querySelector('.bal-table-scroll-shell');
  var scrollTopEl = document.getElementById('bal-table-scroll-top');
  var scrollTopSpacer = document.getElementById('bal-table-scroll-top-spacer');

  function updateScrollFade() {
    if (!tableWrapEl || !tableScrollShell) return;
    var hasMoreRight = tableWrapEl.scrollWidth - tableWrapEl.clientWidth - tableWrapEl.scrollLeft > 2;
    tableScrollShell.classList.toggle('bal-has-hscroll', hasMoreRight);
    if (scrollTopSpacer) scrollTopSpacer.style.width = tableWrapEl.scrollWidth + 'px';
  }

  if (tableWrapEl) {
    var syncingScroll = false;
    tableWrapEl.addEventListener('scroll', function () {
      updateScrollFade();
      if (scrollTopEl && !syncingScroll) {
        syncingScroll = true;
        scrollTopEl.scrollLeft = tableWrapEl.scrollLeft;
        syncingScroll = false;
      }
    });
    if (scrollTopEl) {
      scrollTopEl.addEventListener('scroll', function () {
        if (syncingScroll) return;
        syncingScroll = true;
        tableWrapEl.scrollLeft = scrollTopEl.scrollLeft;
        syncingScroll = false;
      });
    }
    window.addEventListener('resize', updateScrollFade);

    var dragActive = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    tableWrapEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // toque já rola nativamente
      dragActive = true;
      dragStartX = e.clientX;
      dragStartScroll = tableWrapEl.scrollLeft;
      tableWrapEl.classList.add('bal-dragging');
    });
    tableWrapEl.addEventListener('pointermove', function (e) {
      if (!dragActive) return;
      tableWrapEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag() { dragActive = false; tableWrapEl.classList.remove('bal-dragging'); }
    tableWrapEl.addEventListener('pointerup', stopDrag);
    tableWrapEl.addEventListener('pointercancel', stopDrag);
    tableWrapEl.addEventListener('pointerleave', stopDrag);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de
  // novo no clique) ----------
  var filtrosHeader = document.getElementById('bal-filtros-header');
  var filtrosToggle = document.getElementById('bal-filtros-toggle');
  var filtrosContent = document.getElementById('bal-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('bal-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Exportações (fora de escopo real neste protótipo estático —
  // mesmo padrão de flash-disable já usado em ações sem fluxo real ainda). ----------
  Array.prototype.slice.call(document.querySelectorAll('[data-export]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.disabled = true;
      window.setTimeout(function () { btn.disabled = false; }, 300);
    });
  });
})();
