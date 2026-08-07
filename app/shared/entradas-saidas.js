(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TODAY = '2026-07-31';

  // ---------- Helpers de data ----------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function isoFromDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function parseISO(iso) { var p = iso.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
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
    var n = Number(valor || 0);
    var sinal = n < 0 ? '-' : '';
    return sinal + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatInt(valor) {
    return Number(Math.round(valor || 0)).toLocaleString('pt-BR');
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) { return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, ''); }

  // ---------- Toast (validação de filtros) ----------
  var toastRegion = document.createElement('div');
  toastRegion.className = 'es-toast-region';
  toastRegion.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastRegion);
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert warning es-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="triangle-alert" width="18" height="18"></i></span>' +
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

  // ---------- Dropdown genérico (Agrupar por) ----------
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
    var onChange = null;
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
    }
    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (e) { var o = e.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return {
      root: root,
      getValue: function () { return root.dataset.value; },
      onChange: function (fn) { onChange = fn; }
    };
  }

  // ---------- Combobox (Categoria/Cliente) — mesma técnica de Balancete/DRE/LCDPR ----------
  var COMBOBOX_CLOSE_MS = 140;

  function initCombobox(root, allLabel, items) {
    var input = root.querySelector('[data-combobox-input]');
    var menu = root.querySelector('[data-combobox-menu]');
    var value = '';
    var displayValue = '';
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
      getLabel: function () { return displayValue || allLabel; },
      reset: function () { value = ''; displayValue = ''; input.value = ''; }
    };
  }

  // ---------- Radio "Tipo de período" ----------
  var mesAnoField = document.getElementById('mes-ano-field');
  var intervaloFields = document.getElementById('intervalo-fields');
  var dataInicialInput = document.getElementById('es-data-inicial');
  var dataFinalInput = document.getElementById('es-data-final');

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

  // ---------- Mês/Ano, Data inicial/final: padrões oficiais de calendário do sistema ----------
  var mesAnoPicker = window.NiveloDatePicker.initMonth({
    rootId: 'mes-ano-field',
    triggerId: 'es-mes-ano-trigger',
    valueId: 'es-mes-ano-value',
    popoverId: 'es-mes-ano-popover',
    placeholder: 'Selecionar competência'
  });
  mesAnoPicker.setValue('2026-07');

  var dataInicialPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-inicial-field',
    triggerId: 'es-data-inicial-trigger',
    valueId: 'es-data-inicial-value',
    hiddenInputId: 'es-data-inicial',
    popoverId: 'es-data-inicial-popover',
    placeholder: 'Selecionar data'
  });
  var dataFinalPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-final-field',
    triggerId: 'es-data-final-trigger',
    valueId: 'es-data-final-value',
    hiddenInputId: 'es-data-final',
    popoverId: 'es-data-final-popover',
    placeholder: 'Selecionar data'
  });
  dataInicialPicker.setValue('2026-07-01');
  dataFinalPicker.setValue(TODAY);

  // ---------- Filtro dinâmico: Categoria (padrão) ou Cliente, conforme "Agrupar por" ----------
  // "Cliente" aqui é a contraparte do lançamento (`pessoaNome`/`pessoaDocumento` de
  // NiveloCaixa) — o mesmo vocabulário livre já usado no combobox "Cliente ou Fornecedor"
  // de Novo Lançamento de Caixa (round 43), não restrito a cadastros com `tipo` inclui
  // "cliente" em NiveloCadastros: boa parte das despesas do mock tem uma contraparte
  // FORNECEDORA (ex. "Insumos Agrícolas Vale Ltda"), e a proposta desta tela é mostrar
  // "de onde vêm as receitas e pra onde vão as despesas" olhando por contraparte — restringir
  // a lista só a quem tem `tipo:['cliente']` deixaria a maioria das despesas sem grupo
  // nenhum pra selecionar. Lançamentos sem nenhuma contraparte (tarifas, impostos,
  // combustível avulso, etc.) caem no grupo "Sem cliente identificado" na tabela/donuts,
  // mas não entram como opção selecionável do filtro (não há "quem" escolher).
  function pessoaKey(l) { return l.pessoaDocumento || l.pessoaNome || null; }

  function collectPessoaItems() {
    var seen = {};
    var items = [];
    window.NiveloCaixa.list().forEach(function (l) {
      if (!l.pessoaNome) return;
      var key = pessoaKey(l);
      if (seen[key]) return;
      seen[key] = true;
      items.push({ value: key, label: l.pessoaNome });
    });
    items.sort(function (a, b) { return a.label.localeCompare(b.label, 'pt-BR'); });
    return items;
  }

  var categoriaItems = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).map(function (c) { return { value: c.codigo, label: c.descricao }; });
  var categoriaSelect = initCombobox(document.getElementById('categoria-field'), 'Todas as categorias', categoriaItems);
  var clienteSelect = initCombobox(document.getElementById('cliente-field'), 'Todos os clientes', collectPessoaItems());

  var categoriaFieldEl = document.getElementById('categoria-field');
  var clienteFieldEl = document.getElementById('cliente-field');
  var agruparPorDropdown = initDropdown(document.getElementById('agrupar-por-field'));

  function syncFiltroDinamico() {
    var agruparPor = agruparPorDropdown.getValue() || 'categoria';
    categoriaFieldEl.hidden = agruparPor !== 'categoria';
    clienteFieldEl.hidden = agruparPor !== 'cliente';
  }
  agruparPorDropdown.onChange(syncFiltroDinamico);
  syncFiltroDinamico();

  // ---------- Classificação por grupo (Categoria ou Cliente) ----------
  var GROUP_LABEL = { categoria: 'Categoria', cliente: 'Cliente' };

  function groupInfoFor(l, agruparPor) {
    if (agruparPor === 'cliente') {
      var key = pessoaKey(l) || '__sem-cliente__';
      var label = l.pessoaNome || 'Sem cliente identificado';
      return { key: key, label: label };
    }
    var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(l.categoriaCodigo);
    return { key: l.categoriaCodigo || '__sem-categoria__', label: categoria ? categoria.descricao : 'Sem categoria' };
  }

  // Paleta qualitativa dos donuts — 8 cores distintas dos tokens já existentes (sem
  // inventar hex novo), cicla se houver mais grupos que cores. A mesma categoria/cliente
  // usa SEMPRE a mesma cor nos 2 donuts (mapa construído 1x a partir da ordem das linhas
  // da tabela, reutilizado por `renderDonut` nos dois gráficos) — reforça a leitura visual
  // de que é a mesma entidade em Entradas e em Saídas.
  var DONUT_PALETTE = [
    'var(--color-brand-500)', 'var(--color-green-500)', 'var(--color-orange-500)',
    'var(--color-indigo-500)', 'var(--color-pink-500)', 'var(--color-yellow-500)',
    'var(--color-red-500)', 'var(--color-blue-500)'
  ];

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

    var agruparPor = agruparPorDropdown.getValue() || 'categoria';
    var filtroValor = agruparPor === 'cliente' ? clienteSelect.getValue() : categoriaSelect.getValue();
    var filtroLabel = filtroValor ? (agruparPor === 'cliente' ? clienteSelect.getLabel() : categoriaSelect.getLabel()) : (agruparPor === 'cliente' ? 'Todos os clientes' : 'Todas as categorias');

    var lancamentos = window.NiveloCaixa.list().filter(function (l) {
      if (l.data < start || l.data > end) return false;
      if (filtroValor) {
        var key = agruparPor === 'cliente' ? (pessoaKey(l) || '__sem-cliente__') : (l.categoriaCodigo || '__sem-categoria__');
        if (key !== filtroValor) return false;
      }
      return true;
    });

    var groups = {};
    lancamentos.forEach(function (l) {
      var info = groupInfoFor(l, agruparPor);
      if (!groups[info.key]) groups[info.key] = { label: info.label, entrada: 0, saida: 0 };
      if (l.tipo === 'entrada') groups[info.key].entrada += l.valor;
      else groups[info.key].saida += l.valor;
    });

    var rows = Object.keys(groups).map(function (key) {
      var g = groups[key];
      return { key: key, label: g.label, entrada: g.entrada, saida: g.saida, saldo: g.entrada - g.saida };
    });
    rows.sort(function (a, b) { return b.saldo - a.saldo; });

    var colorMap = {};
    rows.forEach(function (r, i) { colorMap[r.key] = DONUT_PALETTE[i % DONUT_PALETTE.length]; });

    var totalEntradas = rows.reduce(function (s, r) { return s + r.entrada; }, 0);
    var totalSaidas = rows.reduce(function (s, r) { return s + r.saida; }, 0);

    var entradaDist = rows.filter(function (r) { return r.entrada > 0; }).map(function (r) { return { key: r.key, label: r.label, value: r.entrada }; }).sort(function (a, b) { return b.value - a.value; });
    var saidaDist = rows.filter(function (r) { return r.saida > 0; }).map(function (r) { return { key: r.key, label: r.label, value: r.saida }; }).sort(function (a, b) { return b.value - a.value; });

    currentReport = {
      start: start, end: end, agruparPor: agruparPor, filtroValor: filtroValor, filtroLabel: filtroLabel,
      rows: rows, colorMap: colorMap,
      totalEntradas: totalEntradas, totalSaidas: totalSaidas, saldoPeriodo: totalEntradas - totalSaidas,
      qtdMovimentacoes: lancamentos.length,
      entradaDist: entradaDist, saidaDist: saidaDist
    };

    renderReport(currentReport);
    setFiltrosExpanded(false);
  }

  // ---------- Render ----------
  function renderReport(report) {
    document.getElementById('es-resultado').hidden = false;

    var periodoLabel = formatDataPt(report.start) + ' a ' + formatDataPt(report.end);
    document.getElementById('es-resumo-filtros').textContent =
      'Período: ' + periodoLabel + ' · Agrupamento: ' + GROUP_LABEL[report.agruparPor] + ' · ' + GROUP_LABEL[report.agruparPor] + ': ' + report.filtroLabel;

    var emptyCard = document.getElementById('es-empty-card');
    var content = document.getElementById('es-resultado-content');
    if (report.qtdMovimentacoes === 0) {
      emptyCard.hidden = false;
      content.hidden = true;
      if (window.lucide) lucide.createIcons();
      return;
    }
    emptyCard.hidden = true;
    content.hidden = false;

    document.getElementById('es-kpi-entradas').textContent = formatMoeda(report.totalEntradas);
    document.getElementById('es-kpi-saidas').textContent = formatMoeda(report.totalSaidas);
    var saldoEl = document.getElementById('es-kpi-saldo');
    saldoEl.textContent = formatMoeda(report.saldoPeriodo);
    saldoEl.classList.toggle('es-value-positive', report.saldoPeriodo >= 0);
    saldoEl.classList.toggle('es-value-negative', report.saldoPeriodo < 0);
    document.getElementById('es-kpi-qtd').textContent = formatInt(report.qtdMovimentacoes);

    // Donuts só fazem sentido representando uma distribuição — somem por completo quando o
    // usuário já filtrou uma categoria/cliente específico (pedido explícito).
    var donutsRow = document.getElementById('es-donuts-row');
    if (report.filtroValor) {
      donutsRow.hidden = true;
    } else {
      donutsRow.hidden = false;
      renderDonut('es-donut-entradas', report.entradaDist, report.colorMap);
      renderDonut('es-donut-saidas', report.saidaDist, report.colorMap);
    }

    renderTable(report);
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Donut (SVG puro, sem lib) — técnica de círculos empilhados via
  // `stroke-dasharray`/`stroke-dashoffset`: cada fatia é um `<circle>` de mesmo raio, com um
  // trecho tracejado do tamanho da própria fração + deslocamento acumulado das fatias
  // anteriores. O `<svg>` inteiro gira -90° via CSS pra a 1ª fatia nascer no topo (12h),
  // igual à convenção universal de gráfico de pizza/donut. ----------
  function buildDonutSVG(items, colorMap) {
    var r = 38, cx = 50, cy = 50, strokeWidth = 16;
    var circumference = 2 * Math.PI * r;
    var total = items.reduce(function (s, it) { return s + it.value; }, 0);
    var cumulative = 0;
    var html = '';
    items.forEach(function (it) {
      var frac = total > 0 ? it.value / total : 0;
      var length = frac * circumference;
      var pct = frac * 100;
      html +=
        '<circle class="es-donut-slice" data-label="' + it.label + '" data-value="' + it.value + '" data-percent="' + pct + '" ' +
        'cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" ' +
        'stroke="' + colorMap[it.key] + '" stroke-width="' + strokeWidth + '" ' +
        'stroke-dasharray="' + length + ' ' + (circumference - length) + '" stroke-dashoffset="' + (-cumulative) + '"></circle>';
      cumulative += length;
    });
    return html;
  }

  // ---------- Tooltip dos donuts — mesmo padrão visual/de comportamento do tooltip dos
  // gráficos de barra (DRE/Balancete): fundo escuro, `position:fixed`, criado 1x e
  // reaproveitado, reposicionado perto do cursor a cada hover. Um único elemento
  // compartilhado pelos 2 donuts (Entradas/Saídas), evento delegado nos `<svg>` (que
  // persistem entre renders — só o `innerHTML` das fatias muda). ----------
  var donutTooltip = document.createElement('div');
  donutTooltip.className = 'es-donut-tooltip';
  donutTooltip.setAttribute('role', 'tooltip');
  donutTooltip.hidden = true;
  document.body.appendChild(donutTooltip);

  function positionDonutTooltip(clientX, clientY) {
    var rect = donutTooltip.getBoundingClientRect();
    var margin = 14;
    var left = clientX + margin;
    var top = clientY - rect.height - margin;
    if (left + rect.width > window.innerWidth - 8) left = clientX - rect.width - margin;
    if (left < 8) left = 8;
    if (top < 8) top = clientY + margin;
    donutTooltip.style.left = left + 'px';
    donutTooltip.style.top = top + 'px';
  }
  function showDonutTooltip(clientX, clientY, slice) {
    var pct = Number(slice.dataset.percent);
    donutTooltip.innerHTML =
      '<div class="es-donut-tooltip-header">' + slice.dataset.label + '</div>' +
      '<div class="es-donut-tooltip-row"><span class="es-donut-tooltip-label">Valor</span><span class="es-donut-tooltip-value">' + formatMoeda(Number(slice.dataset.value)) + '</span></div>' +
      '<div class="es-donut-tooltip-row"><span class="es-donut-tooltip-label">Participação</span><span class="es-donut-tooltip-value">' + pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%</span></div>';
    donutTooltip.hidden = false;
    positionDonutTooltip(clientX, clientY);
  }
  function hideDonutTooltip() { donutTooltip.hidden = true; }

  ['es-donut-entradas-svg', 'es-donut-saidas-svg'].forEach(function (id) {
    var svgEl = document.getElementById(id);
    svgEl.addEventListener('mousemove', function (e) {
      var slice = e.target.closest('.es-donut-slice');
      if (!slice) { hideDonutTooltip(); return; }
      showDonutTooltip(e.clientX, e.clientY, slice);
    });
    svgEl.addEventListener('mouseleave', hideDonutTooltip);
  });

  function buildDonutLegendHTML(items, colorMap, total) {
    return items.map(function (it) {
      var pct = total > 0 ? (it.value / total * 100) : 0;
      return (
        '<li class="es-donut-legend-item">' +
          '<span class="es-donut-legend-dot" style="background:' + colorMap[it.key] + '"></span>' +
          '<span class="es-donut-legend-label">' + it.label + '</span>' +
          '<span class="es-donut-legend-stats">' +
            '<span class="es-donut-legend-percent text-body-s">' + pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%</span>' +
            '<span class="es-donut-legend-value">' + formatMoeda(it.value) + '</span>' +
          '</span>' +
        '</li>'
      );
    }).join('');
  }

  function renderDonut(prefix, items, colorMap) {
    var body = document.getElementById(prefix + '-body');
    var empty = document.getElementById(prefix + '-empty');
    if (!items.length) {
      body.hidden = true;
      empty.hidden = false;
      return;
    }
    body.hidden = false;
    empty.hidden = true;
    var total = items.reduce(function (s, it) { return s + it.value; }, 0);
    document.getElementById(prefix + '-svg').innerHTML = buildDonutSVG(items, colorMap);
    document.getElementById(prefix + '-legend').innerHTML = buildDonutLegendHTML(items, colorMap, total);
    document.getElementById(prefix + '-center-value').textContent = formatMoeda(total);
  }

  // ---------- Tabela — lista simples (não hierárquica, diferente de Balancete/DRE), 1ª
  // coluna (Categoria ou Cliente) sticky à esquerda, ordenada do maior pro menor saldo. ----
  function rowHTML(r) {
    var saldoClass = r.saldo >= 0 ? 'es-row-saldo-positivo' : 'es-row-saldo-negativo';
    return (
      '<tr class="tr ' + saldoClass + '">' +
        '<td class="td">' + r.label + '</td>' +
        '<td class="td">' + formatInt(r.entrada) + '</td>' +
        '<td class="td">' + formatInt(r.saida) + '</td>' +
        '<td class="td es-cell-saldo">' + formatInt(r.saldo) + '</td>' +
      '</tr>'
    );
  }

  function groupHeaderHTML(label) {
    return '<tr class="tr es-row-group-header"><td class="td" colspan="4">' + label + '</td></tr>';
  }

  // Tabela ordenada do maior pro menor saldo (`report.rows`, já vem assim de
  // `gerarRelatorio()`) — aqui só reagrupada visualmente em 2 blocos (Entradas/Saídas,
  // pedido explícito), sem alterar a ordenação dentro de cada bloco. Uma linha entra em
  // "Entradas" quando `entrada > 0` (prioridade), senão em "Saídas" quando `saida > 0` — na
  // prática cada grupo/categoria do dataset é sempre puramente um ou outro, mas a regra
  // cobre com segurança o caso raro de uma mesma categoria/cliente ter os dois tipos de
  // lançamento no período (a linha some só do bloco de Saídas, os valores de Entrada/Saída/
  // Saldo continuam intactos na única linha onde ela aparece).
  function renderTable(report) {
    var isCliente = report.agruparPor === 'cliente';
    document.getElementById('es-th-grupo').textContent = isCliente ? 'Cliente' : 'Categoria';
    document.getElementById('es-table-title').textContent = 'Entradas e saídas por ' + (isCliente ? 'cliente' : 'categoria');

    var entradaRows = report.rows.filter(function (r) { return r.entrada > 0; });
    var saidaRows = report.rows.filter(function (r) { return r.entrada <= 0 && r.saida > 0; });

    var bodyHtml = '';
    if (entradaRows.length) bodyHtml += groupHeaderHTML('Entradas') + entradaRows.map(rowHTML).join('');
    if (saidaRows.length) bodyHtml += groupHeaderHTML('Saídas') + saidaRows.map(rowHTML).join('');
    document.getElementById('es-tbody').innerHTML = bodyHtml;

    var saldoNegativo = report.saldoPeriodo < 0;
    document.getElementById('es-tfoot').innerHTML =
      '<tr class="tr es-foot-saldo' + (saldoNegativo ? ' es-row-negativo' : '') + '">' +
        '<td class="td es-foot-label">Total</td>' +
        '<td class="td">' + formatInt(report.totalEntradas) + '</td>' +
        '<td class="td">' + formatInt(report.totalSaidas) + '</td>' +
        '<td class="td">' + formatInt(report.saldoPeriodo) + '</td>' +
      '</tr>';

    updateScrollFade();
  }

  // ---------- Rolagem horizontal da tabela (mesma técnica de Balancete/LCDPR/DRE) ----------
  var tableWrapEl = document.getElementById('es-tablewrap');
  var tableScrollShell = document.querySelector('.es-table-scroll-shell');
  var scrollTopEl = document.getElementById('es-table-scroll-top');
  var scrollTopSpacer = document.getElementById('es-table-scroll-top-spacer');

  function updateScrollFade() {
    if (!tableWrapEl || !tableScrollShell) return;
    var hasMoreRight = tableWrapEl.scrollWidth - tableWrapEl.clientWidth - tableWrapEl.scrollLeft > 2;
    tableScrollShell.classList.toggle('es-has-hscroll', hasMoreRight);
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
      if (e.pointerType === 'touch') return;
      dragActive = true;
      dragStartX = e.clientX;
      dragStartScroll = tableWrapEl.scrollLeft;
      tableWrapEl.classList.add('es-dragging');
    });
    tableWrapEl.addEventListener('pointermove', function (e) {
      if (!dragActive) return;
      tableWrapEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag() { dragActive = false; tableWrapEl.classList.remove('es-dragging'); }
    tableWrapEl.addEventListener('pointerup', stopDrag);
    tableWrapEl.addEventListener('pointercancel', stopDrag);
    tableWrapEl.addEventListener('pointerleave', stopDrag);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de novo no clique) ----------
  var filtrosHeader = document.getElementById('es-filtros-header');
  var filtrosToggle = document.getElementById('es-filtros-toggle');
  var filtrosContent = document.getElementById('es-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('es-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Exportações (fora de escopo real neste protótipo estático — mesmo padrão de
  // flash-disable já usado em Balancete/DRE). ----
  Array.prototype.slice.call(document.querySelectorAll('[data-export]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.disabled = true;
      window.setTimeout(function () { btn.disabled = false; }, 300);
    });
  });
})();
