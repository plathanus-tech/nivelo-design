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

  // ---------- Select pesquisável (Conta/Categoria) — padrão novo, não
  // existe em nenhuma outra tela: trigger fechado + menu com campo de
  // busca no topo + opção fixa "Todos(as) X" sempre visível. ----------
  function initSearchSelect(root, allLabel, items) {
    var trigger = root.querySelector('[data-searchselect-trigger]');
    var valueEl = root.querySelector('[data-searchselect-value]');
    var menu = root.querySelector('[data-searchselect-menu]');
    var input = root.querySelector('[data-searchselect-input]');
    var optionsEl = root.querySelector('[data-searchselect-options]');
    var value = '';

    function renderOptions(query) {
      var normalizedQuery = normalize(query);
      var html = '<div class="option' + (value === '' ? ' selected' : '') + '" data-value="">' + allLabel + '</div>';
      var matches = items.filter(function (it) { return normalize(it.label).indexOf(normalizedQuery) !== -1; });
      if (query && !matches.length) {
        html += '<div class="option-empty">Nenhum resultado encontrado.</div>';
      } else {
        html += matches.map(function (it) {
          return '<div class="option' + (value === it.value ? ' selected' : '') + '" data-value="' + it.value + '">' + it.label + '</div>';
        }).join('');
      }
      optionsEl.innerHTML = html;
    }

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      optionsEl.style.maxHeight = Math.min(200, window.innerHeight - rect.bottom - margin - 48) + 'px';
    }
    function close() { menu.hidden = true; window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', close); document.removeEventListener('click', outsideClick); }
    function onScroll(e) { if (menu.contains(e.target)) return; close(); }
    function outsideClick(e) { if (!root.contains(e.target)) close(); }
    function open() {
      input.value = '';
      renderOptions('');
      menu.hidden = false;
      positionMenu();
      input.focus();
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', close);
      window.setTimeout(function () { document.addEventListener('click', outsideClick); }, 0);
    }

    trigger.addEventListener('click', function () { menu.hidden ? open() : close(); });
    input.addEventListener('input', function () { renderOptions(input.value); });
    optionsEl.addEventListener('click', function (e) {
      var o = e.target.closest('.option');
      if (!o) return;
      value = o.dataset.value;
      valueEl.textContent = value === '' ? allLabel : o.textContent;
      close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) close(); });

    return {
      getValue: function () { return value; },
      getLabel: function () { return valueEl.textContent; }
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
  var contaSelect = initSearchSelect(document.getElementById('conta-field'), 'Todas as contas', contaItems);

  var categoriaItems = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).map(function (c) { return { value: c.codigo, label: c.descricao }; });
  var categoriaSelect = initSearchSelect(document.getElementById('categoria-field'), 'Todas as categorias', categoriaItems);

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
    collapseFiltros();
    showToast('Relatório gerado com sucesso', 'O Balancete foi atualizado conforme os filtros aplicados.');
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

  // ---------- Gráfico de barras (SVG puro) ----------
  function renderChart(report) {
    var svg = document.getElementById('bal-chart-svg');
    var n = report.columns.length;
    var chartW = 100, chartH = 40;
    var maxValue = Math.max(1, report.totalEntradas.concat(report.totalSaidas).reduce(function (m, v) { return Math.max(m, v); }, 0));
    var groupW = chartW / n;
    var barW = groupW / 3;
    var baseline = chartH - 6;
    var usableH = baseline - 2;

    var bars = '';
    for (var i = 0; i < n; i++) {
      var groupX = i * groupW;
      var hEntrada = (report.totalEntradas[i] / maxValue) * usableH;
      var hSaida = (report.totalSaidas[i] / maxValue) * usableH;
      bars +=
        '<rect x="' + (groupX + groupW * 0.15) + '" y="' + (baseline - hEntrada) + '" width="' + barW + '" height="' + hEntrada + '" fill="var(--color-status-success-fg)" rx="0.6"></rect>' +
        '<rect x="' + (groupX + groupW * 0.15 + barW + 1) + '" y="' + (baseline - hSaida) + '" width="' + barW + '" height="' + hSaida + '" fill="var(--color-status-error-fg)" rx="0.6"></rect>';
    }

    var labelStep = n > 12 ? Math.ceil(n / 12) : 1;
    var labels = '';
    for (var j = 0; j < n; j += labelStep) {
      var x = j * groupW + groupW / 2;
      labels += '<text x="' + x + '" y="' + chartH + '" font-size="2.6" text-anchor="middle" fill="var(--color-text-tertiary)">' + report.columns[j].label + '</text>';
    }

    svg.setAttribute('viewBox', '0 0 ' + chartW + ' ' + chartH);
    svg.innerHTML =
      '<line x1="0" y1="' + baseline + '" x2="' + chartW + '" y2="' + baseline + '" stroke="var(--color-border-subtle)" stroke-width="0.3"></line>' +
      bars + labels;
  }

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

  function categoriaRowHTML(label, values, parentGroup) {
    var cells = values.map(function (v) { return '<td class="td">' + formatInt(v) + '</td>'; }).join('');
    return (
      '<tr class="tr bal-row-level-2" data-parent-group="' + parentGroup + '">' +
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
    report.categoriasReceita.forEach(function (c) {
      html += categoriaRowHTML(c.descricao, report.valoresReceita[c.codigo], 'entradas,receitas');
    });

    // Saídas > Despesas > categorias
    html += groupRowHTML({ level: 0, label: 'Saídas', values: report.totalSaidas, groupId: 'saidas', toggles: true });
    html += groupRowHTML({ level: 1, label: 'Despesas', values: report.totalSaidas, groupId: 'despesas', parentGroup: 'saidas', toggles: true, indent: 1 });
    report.categoriasDespesa.forEach(function (c) {
      html += categoriaRowHTML(c.descricao, report.valoresDespesa[c.codigo], 'saidas,despesas');
    });

    // Resultado — nunca recolhível.
    html += groupRowHTML({ level: 0, label: 'Resultado', values: report.columns.map(function () { return null; }), groupId: 'resultado', toggles: false })
      .replace(/<td class="td">0<\/td>/g, '<td class="td"></td>');
    html += groupRowHTML({ level: 1, label: 'Total de entradas', values: report.totalEntradas, groupId: 'resultado-entradas', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-resultado');
    html += groupRowHTML({ level: 1, label: 'Total de saídas', values: report.totalSaidas, groupId: 'resultado-saidas', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-resultado');
    html += groupRowHTML({ level: 1, label: 'Saldo do período', values: report.saldo, groupId: 'saldo', toggles: false, indent: 1 }).replace('bal-row-level-1', 'bal-row-saldo');

    document.getElementById('bal-tbody').innerHTML = html;
    applyRowVisibility();
  }

  document.getElementById('bal-tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('.bal-group-toggle[data-group-id]');
    if (!btn) return;
    toggleGroup(btn.dataset.groupId);
  });

  // ---------- Recolher/exibir filtros ----------
  var filtrosCard = document.getElementById('bal-filtros-card');
  var exibirFiltrosBtn = document.getElementById('bal-exibir-filtros-btn');

  function collapseFiltros() {
    filtrosCard.hidden = true;
    exibirFiltrosBtn.hidden = false;
  }
  exibirFiltrosBtn.addEventListener('click', function () {
    filtrosCard.hidden = false;
    exibirFiltrosBtn.hidden = true;
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
