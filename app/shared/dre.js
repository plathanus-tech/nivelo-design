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
    var n = Number(valor || 0);
    var sinal = n < 0 ? '-' : '';
    return sinal + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatInt(valor) {
    return Number(Math.round(valor || 0)).toLocaleString('pt-BR');
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) { return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, ''); }

  // ---------- Classificação da DRE ----------
  // Estrutura validada numa consultoria de UX explícita sobre adequação ao contexto de
  // produtor rural pequeno/médio (2026-08-05) — a proposta original (inspirada num DRE de
  // e-commerce/varejo) foi adaptada pra usar só o que o sistema realmente modela:
  // `categorias-financeiras-data.js`'s `classificacaoDre` (5 valores fixos: deducoes/
  // despesas-operacionais/outras/tributos/taxas-tarifas, ver round 38), sem fabricar
  // linhas fixas (ICMS/IR/IPI/ISS/INSS/CSLL/PIS/COFINS, CMV, FGTS, Comissões, Notas
  // fiscais/Ticket médio) que este sistema não tem dado pra sustentar. `deducoes` e
  // `tributos` são verificados ANTES do `grupo` pra ter prioridade sobre o restante:
  // - `deducoes` → **Devoluções** (dentro de Deduções da Receita).
  // - `tributos` → **Impostos** (também dentro de Deduções da Receita, NÃO em Despesas
  //   Operacionais como antes — decisão desta rodada: imposto sobre a produção/venda
  //   rural (ex.: Funrural) costuma ser retido na fonte pelo comprador, reduzindo a
  //   receita bruta na prática, mais parecido com ICMS-sobre-vendas do que com uma
  //   despesa operacional do dia a dia).
  // - `grupo==='receita'` (não-dedução) → Receitas Operacionais.
  // - nome de insumo direto de produção (fertilizante/combustível/semente/adubo/
  //   defensivo) → Custos (equivalente rural ao "CMV" de varejo).
  // - `taxas-tarifas` → Despesas Financeiras (tarifa/juro bancário é financeiro, mantido
  //   aqui mesmo com o pedido de mover pra Despesas Operacionais — ver validação).
  // - `outras` → Outras Despesas (agora reposicionada FORA de Despesas Operacionais,
  //   junto de Outras Receitas, como resultado não-operacional — ver `renderTable`).
  // - o restante (`despesas-operacionais`) → Despesas Operacionais.
  var CUSTOS_KEYWORDS_RE = /fertilizante|combust[íi]vel|semente|adubo|defensivo|insumo/i;
  function classifyDreBucket(categoria) {
    if (categoria.classificacaoDre === 'deducoes') return 'deducoes-devolucoes';
    if (categoria.classificacaoDre === 'tributos') return 'deducoes-impostos';
    if (categoria.grupo === 'receita') return 'receitas-operacionais';
    if (CUSTOS_KEYWORDS_RE.test(categoria.descricao)) return 'custos';
    if (categoria.classificacaoDre === 'taxas-tarifas') return 'despesas-financeiras';
    if (categoria.classificacaoDre === 'outras') return 'outras-despesas';
    return 'despesas-operacionais';
  }

  var BUCKET_ORDER = ['receitas-operacionais', 'outras-receitas', 'deducoes-devolucoes', 'deducoes-impostos', 'custos', 'despesas-operacionais', 'outras-despesas', 'despesas-financeiras'];
  var BUCKET_LABEL = {
    'receitas-operacionais': 'Receitas Operacionais',
    'outras-receitas': 'Outras Receitas',
    'deducoes-devolucoes': 'Devoluções',
    'deducoes-impostos': 'Impostos',
    'custos': 'Custos',
    'despesas-operacionais': 'Despesas Operacionais',
    'outras-despesas': 'Outras Despesas',
    'despesas-financeiras': 'Despesas Financeiras'
  };

  // ---------- Toast (validação de filtros) ----------
  var toastRegion = document.getElementById('toast-region');
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert warning dre-toast';
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

  // ---------- Dropdown genérico (Agrupamento) ----------
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

  // ---------- Combobox (Categoria) — mesma técnica de Balancete/LCDPR ----------
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
      getLabel: function () { return displayValue || allLabel; }
    };
  }

  // ---------- Radio "Tipo de período" ----------
  var mesAnoField = document.getElementById('mes-ano-field');
  var intervaloFields = document.getElementById('intervalo-fields');
  var dataInicialInput = document.getElementById('dre-data-inicial');
  var dataFinalInput = document.getElementById('dre-data-final');

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
    triggerId: 'dre-mes-ano-trigger',
    valueId: 'dre-mes-ano-value',
    popoverId: 'dre-mes-ano-popover',
    placeholder: 'Selecionar competência'
  });
  mesAnoPicker.setValue('2026-07');

  var dataInicialPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-inicial-field',
    triggerId: 'dre-data-inicial-trigger',
    valueId: 'dre-data-inicial-value',
    hiddenInputId: 'dre-data-inicial',
    popoverId: 'dre-data-inicial-popover',
    placeholder: 'Selecionar data'
  });
  var dataFinalPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-final-field',
    triggerId: 'dre-data-final-trigger',
    valueId: 'dre-data-final-value',
    hiddenInputId: 'dre-data-final',
    popoverId: 'dre-data-final-popover',
    placeholder: 'Selecionar data'
  });
  dataInicialPicker.setValue('2026-07-01');
  dataFinalPicker.setValue(TODAY);

  // ---------- Filtros: Categoria/Agrupamento ----------
  var categoriaItems = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).map(function (c) { return { value: c.codigo, label: c.descricao }; });
  var categoriaSelect = initCombobox(document.getElementById('categoria-field'), 'Todas as categorias', categoriaItems);

  var agrupamentoDropdown = initDropdown(document.getElementById('agrupamento-field'));

  var AGRUPAMENTO_LABEL = { dia: 'Diário', semana: 'Semanal', mes: 'Mensal' };

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
    if (escolha !== 'automatico') return escolha;
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

    var categoriaCodigo = categoriaSelect.getValue();
    var agrupamentoEscolha = document.getElementById('agrupamento-field').dataset.value || 'automatico';
    var agrupamento = chooseAgrupamento(start, end, agrupamentoEscolha);
    var columns = buildColumns(start, end, agrupamento);

    function zeros() { return columns.map(function () { return 0; }); }

    var buckets = {};
    BUCKET_ORDER.forEach(function (b) { buckets[b] = { categorias: [], valores: {} }; });

    var categoriasAtivas = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo && c.consideraDre; });
    categoriasAtivas.forEach(function (c) {
      var bucket = classifyDreBucket(c);
      buckets[bucket].categorias.push(c);
      buckets[bucket].valores[c.codigo] = zeros();
    });

    window.NiveloCaixa.list().forEach(function (l) {
      if (l.data < start || l.data > end) return;
      if (categoriaCodigo && l.categoriaCodigo !== categoriaCodigo) return;
      var idx = columnIndexFor(l.data, columns, agrupamento);
      if (idx === -1) return;
      var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(l.categoriaCodigo);
      if (!categoria || !categoria.consideraDre) return;
      var bucket = classifyDreBucket(categoria);
      if (buckets[bucket].valores[categoria.codigo]) buckets[bucket].valores[categoria.codigo][idx] += l.valor;
    });

    function sumBucket(bucket) {
      var arr = zeros();
      buckets[bucket].categorias.forEach(function (c) { buckets[bucket].valores[c.codigo].forEach(function (v, i) { arr[i] += v; }); });
      return arr;
    }
    var totals = {};
    BUCKET_ORDER.forEach(function (b) { totals[b] = sumBucket(b); });

    function sumArr(arr) { return arr.reduce(function (a, b) { return a + b; }, 0); }
    function combine(fn) { return columns.map(function (_, i) { return fn(i); }); }

    // Camadas em cascata (Receita Bruta → Receita Líquida → Lucro Bruto → Resultado
    // Operacional → Resultado Não Operacional → Resultado Financeiro → Resultado do
    // Exercício), ver conversa de UX 2026-08-05: cada subtotal alimenta o próximo, nunca
    // recalculado do zero. Outras Receitas/Outras Despesas saíram de dentro de "Receitas"/
    // "Despesas Operacionais" e viram um bloco não-operacional PÓS Resultado Operacional
    // (mais correto contabilmente — são itens atípicos, não o core da operação).
    var totalReceitaBruta = totals['receitas-operacionais'];
    var totalDevolucoes = totals['deducoes-devolucoes'];
    var totalImpostos = totals['deducoes-impostos'];
    var totalDeducoes = combine(function (i) { return totalDevolucoes[i] + totalImpostos[i]; });
    var totalReceitaLiquida = combine(function (i) { return totalReceitaBruta[i] - totalDeducoes[i]; });
    var totalCustos = totals.custos;
    var totalLucroBruto = combine(function (i) { return totalReceitaLiquida[i] - totalCustos[i]; });
    var totalDespesasOperacionais = totals['despesas-operacionais'];
    var totalResultadoOperacional = combine(function (i) { return totalLucroBruto[i] - totalDespesasOperacionais[i]; });
    var totalOutrasReceitas = totals['outras-receitas'];
    var totalOutrasDespesas = totals['outras-despesas'];
    var totalDespesasFinanceiras = totals['despesas-financeiras'];
    var totalResultadoFinanceiro = combine(function (i) { return -totalDespesasFinanceiras[i]; });
    var totalResultadoExercicio = combine(function (i) {
      return totalResultadoOperacional[i] + totalOutrasReceitas[i] - totalOutrasDespesas[i] + totalResultadoFinanceiro[i];
    });

    var hasDevolucoes = totalDevolucoes.some(function (v) { return v !== 0; });
    var hasImpostos = totalImpostos.some(function (v) { return v !== 0; });
    var hasDeducoes = hasDevolucoes || hasImpostos;

    var grandReceita = sumArr(totalReceitaBruta);
    var grandResultado = sumArr(totalResultadoExercicio);
    // Derivado (não somado bucket a bucket): garante por construção que Receita Bruta −
    // Total de Despesas = Resultado do Período nos 3 KPIs, mesmo com Outras Receitas
    // (uma ADIÇÃO, não uma dedução) entrando na cascata depois do Resultado Operacional.
    var grandDespesas = grandReceita - grandResultado;
    var margem = grandReceita !== 0 ? (grandResultado / grandReceita * 100) : null;

    currentReport = {
      start: start, end: end, agrupamento: agrupamento, agrupamentoEscolha: agrupamentoEscolha,
      columns: columns,
      buckets: buckets, totals: totals,
      totalReceitaBruta: totalReceitaBruta, totalDeducoes: totalDeducoes, totalReceitaLiquida: totalReceitaLiquida,
      totalCustos: totalCustos, totalLucroBruto: totalLucroBruto,
      totalDespesasOperacionais: totalDespesasOperacionais, totalResultadoOperacional: totalResultadoOperacional,
      totalOutrasReceitas: totalOutrasReceitas, totalOutrasDespesas: totalOutrasDespesas,
      totalDespesasFinanceiras: totalDespesasFinanceiras, totalResultadoFinanceiro: totalResultadoFinanceiro,
      resultado: totalResultadoExercicio, hasDeducoes: hasDeducoes,
      grandReceita: grandReceita, grandDespesas: grandDespesas, grandResultado: grandResultado, margem: margem,
      categoriaLabel: categoriaCodigo ? categoriaSelect.getLabel() : 'Todas as categorias'
    };

    renderReport(currentReport);
    setFiltrosExpanded(false);
  }

  // ---------- Render: cabeçalho/resumo + KPIs ----------
  function renderReport(report) {
    document.getElementById('dre-resultado').hidden = false;

    var periodoLabel = formatDataPt(report.start) + ' a ' + formatDataPt(report.end);
    var visualizacaoLabel = AGRUPAMENTO_LABEL[report.agrupamento] + (report.agrupamentoEscolha === 'automatico' ? ' (Automático)' : '');

    document.getElementById('dre-resumo-filtros').textContent =
      'Período: ' + periodoLabel + ' · Categoria: ' + report.categoriaLabel + ' · Agrupamento: ' + visualizacaoLabel;

    document.getElementById('dre-kpi-receita').textContent = formatMoeda(report.grandReceita);
    document.getElementById('dre-kpi-despesas').textContent = formatMoeda(report.grandDespesas);

    var resultadoEl = document.getElementById('dre-kpi-resultado');
    resultadoEl.textContent = formatMoeda(report.grandResultado);
    resultadoEl.classList.toggle('dre-value-positive', report.grandResultado >= 0);
    resultadoEl.classList.toggle('dre-value-negative', report.grandResultado < 0);

    var margemEl = document.getElementById('dre-kpi-margem');
    if (report.margem === null) {
      margemEl.textContent = '—';
      margemEl.classList.remove('dre-value-positive', 'dre-value-negative');
    } else {
      margemEl.textContent = report.margem.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      margemEl.classList.toggle('dre-value-positive', report.margem >= 0);
      margemEl.classList.toggle('dre-value-negative', report.margem < 0);
    }

    renderChart(report);
    renderTable(report);
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Eixo X — rótulos compartilhados entre DRE/Balancete (mesma lógica, cada
  // arquivo com sua própria cópia por convenção do projeto: telas de relatório não
  // compartilham JS entre si). No agrupamento por dia, mostra "01 Mmm" só no 1º dia de
  // cada mês representado (evita repetir o mês em toda coluna) + o dia isolado a cada 5
  // dias (05/10/15/20/25/30); nos demais agrupamentos (semana/mês), mantém a amostragem
  // por `labelStep` já usada (no máximo ~12 rótulos visíveis). ----------
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

  // ---------- Gráfico de barras (SVG puro) — barra ÚNICA divergente
  // (Resultado por coluna): sobe em verde quando positiva, desce em
  // vermelho quando negativa, a partir de uma linha de base calculada
  // pela proporção entre o maior valor positivo e o maior valor negativo
  // do período (nunca fixa em y=baseline como um gráfico só-positivo).
  // Sem eixo Y numérico de propósito (ver rules.md/CLAUDE.md): as 3
  // gridlines horizontais anteriores nunca tinham valor algum (só
  // decorativas), então não ajudavam a interpretar a grandeza — removidas
  // em favor da linha de zero (única referência horizontal, com significado
  // real) + tooltip rico no hover (valor exato), mesma filosofia "Stripe/
  // Linear/Vercel" já documentada no gráfico do Balancete. ----
  function renderChart(report) {
    var svg = document.getElementById('dre-chart-svg');
    var axis = document.getElementById('dre-chart-axis');
    var n = report.columns.length;
    var chartW = 100, chartH = 40;
    var maxPos = report.resultado.reduce(function (m, v) { return Math.max(m, v); }, 0);
    var maxNeg = report.resultado.reduce(function (m, v) { return Math.max(m, -v); }, 0);
    var scale = Math.max(1, maxPos + maxNeg);
    var groupW = chartW / n;
    var groupPad = groupW * 0.22;
    var barW = groupW - groupPad * 2;
    var top = 1, bottom = chartH - 1;
    var usableH = bottom - top;
    var baseline = top + usableH * (Math.max(0, maxPos) / scale);

    var gridlines = '';
    for (var g = 1; g < n; g++) {
      var gx = g * groupW;
      gridlines += '<line x1="' + gx + '" y1="0" x2="' + gx + '" y2="' + chartH + '" stroke="var(--color-border-subtle)" stroke-width="0.15" stroke-opacity="0.5"></line>';
    }

    var bars = '';
    var hitareas = '';
    for (var i = 0; i < n; i++) {
      var val = report.resultado[i];
      var isPos = val >= 0;
      var barH = Math.max((Math.abs(val) / scale) * usableH, 0.3);
      var x = i * groupW + groupPad;
      var y = isPos ? baseline - barH : baseline;
      var color = isPos ? 'var(--color-status-success-fg)' : 'var(--color-status-error-fg)';
      var dirClass = isPos ? 'dre-chart-bar-pos' : 'dre-chart-bar-neg';
      bars += '<rect class="dre-chart-bar ' + dirClass + '" data-idx="' + i + '" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" fill="' + color + '" rx="0.5"></rect>';
      hitareas += '<rect class="dre-chart-hit" data-idx="' + i + '" x="' + (i * groupW) + '" y="0" width="' + groupW + '" height="' + chartH + '" fill="transparent" pointer-events="all"></rect>';
    }

    svg.setAttribute('viewBox', '0 0 ' + chartW + ' ' + chartH);
    svg.innerHTML =
      gridlines +
      '<line class="dre-chart-zero-line" x1="0" y1="' + baseline + '" x2="' + chartW + '" y2="' + baseline + '" stroke-width="0.35"></line>' +
      bars + hitareas;

    axis.innerHTML = buildAxisLabelsHTML(report, 'dre-chart-axis-label');
  }

  // ---------- Tooltip do gráfico ----------
  var chartTooltip = document.createElement('div');
  chartTooltip.className = 'dre-chart-tooltip';
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
    var resultado = currentReport.resultado[idx];
    var headerPrefix = currentReport.agrupamento === 'dia' ? 'Data' : 'Período';
    var headerLabel = currentReport.agrupamento === 'dia' ? formatDataPt(col.key) : col.label;
    chartTooltip.innerHTML =
      '<div class="dre-chart-tooltip-header">' + headerPrefix + ': ' + headerLabel + '</div>' +
      '<div class="dre-chart-tooltip-row"><span class="dre-chart-tooltip-label">Resultado</span><span class="dre-chart-tooltip-value ' + (resultado >= 0 ? 'dre-value-positive' : 'dre-value-negative') + '">' + formatMoeda(resultado) + '</span></div>';
    chartTooltip.hidden = false;
    positionChartTooltip(clientX, clientY);
  }
  function hideChartTooltip() { chartTooltip.hidden = true; }

  // ---------- Cross-highlight gráfico ↔ tabela ----------
  // Cada barra do gráfico representa exatamente uma coluna da tabela (mesmo array
  // `columns`) — hover numa barra ilumina a coluna inteira na tabela (cabeçalho +
  // todas as linhas), e hover no cabeçalho de uma coluna ilumina a barra correspondente
  // no gráfico. Transforma o gráfico de "resumo decorativo" em índice de navegação da
  // tabela densa (ver conversa de UX 2026-08-05, ponto 3b).
  function clearActiveColumn() {
    Array.prototype.slice.call(document.querySelectorAll('.dre-col-active')).forEach(function (el) { el.classList.remove('dre-col-active'); });
    Array.prototype.slice.call(document.querySelectorAll('.dre-chart-bar.is-active')).forEach(function (el) { el.classList.remove('is-active'); });
    Array.prototype.slice.call(document.querySelectorAll('.dre-chart-axis-label.is-active')).forEach(function (el) { el.classList.remove('is-active'); });
  }
  function setActiveColumn(idx) {
    clearActiveColumn();
    Array.prototype.slice.call(document.querySelectorAll('#dre-header-row, #dre-tbody tr')).forEach(function (row) {
      var cell = row.children[idx + 1];
      if (cell) cell.classList.add('dre-col-active');
    });
    var bar = document.querySelector('.dre-chart-bar[data-idx="' + idx + '"]');
    if (bar) bar.classList.add('is-active');
    var axisLabels = document.querySelectorAll('.dre-chart-axis-label');
    if (axisLabels[idx]) axisLabels[idx].classList.add('is-active');
  }

  var headerRowEl = document.getElementById('dre-header-row');
  headerRowEl.addEventListener('mouseover', function (e) {
    var th = e.target.closest('th[data-col-index]');
    if (th) setActiveColumn(Number(th.dataset.colIndex));
  });
  headerRowEl.addEventListener('mouseout', function (e) {
    var th = e.target.closest('th[data-col-index]');
    if (th) clearActiveColumn();
  });

  var chartSvgEl = document.getElementById('dre-chart-svg');
  chartSvgEl.addEventListener('mousemove', function (e) {
    var hit = e.target.closest('.dre-chart-hit');
    if (!hit) { hideChartTooltip(); clearActiveColumn(); return; }
    var idx = Number(hit.dataset.idx);
    showChartTooltip(e.clientX, e.clientY, idx);
    setActiveColumn(idx);
  });
  chartSvgEl.addEventListener('mouseleave', function () { hideChartTooltip(); clearActiveColumn(); });

  // ---------- Tabela hierárquica (grupos expansíveis) ----------
  var collapsedGroups = {};

  function toggleGroup(groupId) {
    collapsedGroups[groupId] = !collapsedGroups[groupId];
    applyRowVisibility();
  }

  function applyRowVisibility() {
    Array.prototype.slice.call(document.querySelectorAll('#dre-tbody [data-parent-group]')).forEach(function (row) {
      var hidden = false;
      var parents = row.dataset.parentGroup.split(',');
      parents.forEach(function (p) { if (collapsedGroups[p]) hidden = true; });
      row.classList.toggle('dre-row-collapsed', hidden);
    });
    Array.prototype.slice.call(document.querySelectorAll('.dre-group-toggle[data-group-id]')).forEach(function (btn) {
      btn.classList.toggle('is-collapsed', !!collapsedGroups[btn.dataset.groupId]);
    });
  }

  function groupRowHTML(opts) {
    // opts: { level, label, values, groupId, parentGroup, toggles, indent }
    var cells = opts.values.map(function (v) { return '<td class="td">' + (v === null || v === undefined ? '' : formatInt(v)) + '</td>'; }).join('');
    var toggleBtn = opts.toggles
      ? '<button type="button" class="dre-group-toggle" data-group-id="' + opts.groupId + '" aria-label="Expandir/recolher"><i data-lucide="chevron-down" width="14" height="14"></i></button>'
      : '<span class="dre-group-toggle"></span>';
    return (
      '<tr class="tr dre-row-level-' + opts.level + '"' + (opts.parentGroup ? ' data-parent-group="' + opts.parentGroup + '"' : '') + '>' +
        '<td class="td"><span class="dre-row-label' + (opts.indent ? ' dre-row-indent-' + opts.indent : '') + '">' + toggleBtn + opts.label + '</span></td>' +
        cells +
      '</tr>'
    );
  }

  function categoriaRowHTML(label, values, parentGroup, isEven) {
    var cells = values.map(function (v) { return '<td class="td">' + formatInt(v) + '</td>'; }).join('');
    return (
      '<tr class="tr dre-row-level-2' + (isEven ? ' dre-row-zebra' : '') + '" data-parent-group="' + parentGroup + '">' +
        '<td class="td"><span class="dre-row-label dre-row-indent-2">' + label + '</span></td>' +
        cells +
      '</tr>'
    );
  }

  // Camada em cascata (ver conversa de UX 2026-08-05, estrutura validada e adaptada pro
  // contexto de produtor rural): Receita Bruta → (-) Deduções da Receita [Devoluções +
  // Impostos, só quando há valor] → Receita Líquida → (-) Custos → Lucro Bruto →
  // (-) Despesas Operacionais → Resultado Operacional → (+) Outras Receitas/(-) Outras
  // Despesas [não-operacional, sempre visível] → (+/-) Resultado Financeiro →
  // (=) Resultado do Exercício. Cada subtotal tem peso visual crescente
  // (`dre-row-subtotal` → `dre-row-subtotal-strong` → `dre-row-resultado-final`),
  // formando uma "espinha dorsal" escaneável mesmo com a tabela cheia de categorias.
  function renderTable(report) {
    var headerRow = document.getElementById('dre-header-row');
    headerRow.innerHTML = '<th class="th">Grupo/Categoria</th>' + report.columns.map(function (c, i) { return '<th class="th" data-col-index="' + i + '">' + c.label + '</th>'; }).join('');

    var html = '';

    // Receita Bruta (só um bucket agora — Outras Receitas saiu daqui, ver Resultado Não
    // Operacional abaixo) > categorias > Total da Receita Bruta
    var receitaData = report.buckets['receitas-operacionais'];
    html += groupRowHTML({ level: 0, label: 'Receita Bruta', values: report.totalReceitaBruta, groupId: 'receitas', toggles: receitaData.categorias.length > 0 });
    receitaData.categorias.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, receitaData.valores[c.codigo], 'receitas', i % 2 === 1);
    });
    html += groupRowHTML({ level: 1, label: 'Total da Receita Bruta', values: report.totalReceitaBruta, groupId: 'total-receita-bruta', toggles: false, indent: 1 }).replace('dre-row-level-1', 'dre-row-subtotal');

    // (-) Deduções da Receita > (Devoluções / Impostos) > categorias > Receita Líquida —
    // só aparece quando há valor em pelo menos uma coluna (mantém a tabela enxuta pra
    // quem não usa Devoluções nem Impostos — "Impostos sobre a produção" já tem dado real
    // no seed, então esta seção normalmente aparece).
    if (report.hasDeducoes) {
      html += groupRowHTML({ level: 0, label: '(-) Deduções da Receita', values: report.totalDeducoes, groupId: 'deducoes', toggles: true });
      ['deducoes-devolucoes', 'deducoes-impostos'].forEach(function (bucket) {
        var bucketData = report.buckets[bucket];
        var hasCategorias = bucketData.categorias.length > 0;
        html += groupRowHTML({ level: 1, label: BUCKET_LABEL[bucket], values: report.totals[bucket], groupId: bucket, parentGroup: 'deducoes', toggles: hasCategorias, indent: 1 });
        bucketData.categorias.forEach(function (c, i) {
          html += categoriaRowHTML(c.descricao, bucketData.valores[c.codigo], 'deducoes,' + bucket, i % 2 === 1);
        });
      });
      html += groupRowHTML({ level: 1, label: 'Receita Líquida', values: report.totalReceitaLiquida, groupId: 'receita-liquida', toggles: false, indent: 1 }).replace('dre-row-level-1', 'dre-row-subtotal');
    }

    // (-) Custos > categorias > Lucro Bruto
    var custosData = report.buckets.custos;
    html += groupRowHTML({ level: 0, label: '(-) Custos', values: report.totalCustos, groupId: 'custos', toggles: custosData.categorias.length > 0 });
    custosData.categorias.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, custosData.valores[c.codigo], 'custos', i % 2 === 1);
    });
    html += groupRowHTML({ level: 1, label: 'Lucro Bruto', values: report.totalLucroBruto, groupId: 'lucro-bruto', toggles: false, indent: 1 }).replace('dre-row-level-1', 'dre-row-subtotal');

    // (-) Despesas Operacionais (só o bucket "despesas-operacionais" agora — Outras
    // Despesas saiu daqui) > categorias > Resultado Operacional
    var despOpData = report.buckets['despesas-operacionais'];
    html += groupRowHTML({ level: 0, label: '(-) Despesas Operacionais', values: report.totalDespesasOperacionais, groupId: 'despesas-operacionais', toggles: despOpData.categorias.length > 0 });
    despOpData.categorias.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, despOpData.valores[c.codigo], 'despesas-operacionais', i % 2 === 1);
    });
    html += groupRowHTML({ level: 1, label: 'Resultado Operacional', values: report.totalResultadoOperacional, groupId: 'resultado-operacional', toggles: false, indent: 1 }).replace('dre-row-level-1', 'dre-row-subtotal-strong');

    // (+) Outras Receitas / (-) Outras Despesas — resultado NÃO operacional, reposicionado
    // pra depois do Resultado Operacional (mais correto contabilmente: são itens atípicos,
    // não o core da operação). Sempre visíveis (diferente de Deduções), mesmo padrão que
    // Custos/Despesas Operacionais já usam.
    var outrasReceitasData = report.buckets['outras-receitas'];
    html += groupRowHTML({ level: 0, label: '(+) Outras Receitas', values: report.totalOutrasReceitas, groupId: 'outras-receitas', toggles: outrasReceitasData.categorias.length > 0 });
    outrasReceitasData.categorias.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, outrasReceitasData.valores[c.codigo], 'outras-receitas', i % 2 === 1);
    });
    var outrasDespesasData = report.buckets['outras-despesas'];
    html += groupRowHTML({ level: 0, label: '(-) Outras Despesas', values: report.totalOutrasDespesas, groupId: 'outras-despesas', toggles: outrasDespesasData.categorias.length > 0 });
    outrasDespesasData.categorias.forEach(function (c, i) {
      html += categoriaRowHTML(c.descricao, outrasDespesasData.valores[c.codigo], 'outras-despesas', i % 2 === 1);
    });

    // (+/-) Resultado Financeiro > categorias (valores negados — é resultado, não despesa bruta)
    var finData = report.buckets['despesas-financeiras'];
    html += groupRowHTML({ level: 0, label: '(+/-) Resultado Financeiro', values: report.totalResultadoFinanceiro, groupId: 'despesas-financeiras', toggles: finData.categorias.length > 0 });
    finData.categorias.forEach(function (c, i) {
      var valoresNegados = finData.valores[c.codigo].map(function (v) { return -v; });
      html += categoriaRowHTML(c.descricao, valoresNegados, 'despesas-financeiras', i % 2 === 1);
    });

    // (=) Resultado do Exercício — destaque visual superior a qualquer outra linha, sempre visível.
    var resultadoClass = 'dre-row-resultado-final' + (report.grandResultado < 0 ? ' dre-row-negativo' : '');
    html += groupRowHTML({ level: 1, label: '(=) Resultado do Exercício', values: report.resultado, groupId: 'resultado-final', toggles: false, indent: 1 }).replace('dre-row-level-1', resultadoClass);

    document.getElementById('dre-tbody').innerHTML = html;
    applyRowVisibility();
    updateScrollFade();
  }

  document.getElementById('dre-tbody').addEventListener('click', function (e) {
    var btn = e.target.closest('.dre-group-toggle[data-group-id]');
    if (!btn) return;
    toggleGroup(btn.dataset.groupId);
  });

  // ---------- Rolagem horizontal da tabela (mesma técnica de Balancete/LCDPR) ----------
  var tableWrapEl = document.getElementById('dre-tablewrap');
  var tableScrollShell = document.querySelector('.dre-table-scroll-shell');
  var scrollTopEl = document.getElementById('dre-table-scroll-top');
  var scrollTopSpacer = document.getElementById('dre-table-scroll-top-spacer');

  function updateScrollFade() {
    if (!tableWrapEl || !tableScrollShell) return;
    var hasMoreRight = tableWrapEl.scrollWidth - tableWrapEl.clientWidth - tableWrapEl.scrollLeft > 2;
    tableScrollShell.classList.toggle('dre-has-hscroll', hasMoreRight);
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
      tableWrapEl.classList.add('dre-dragging');
    });
    tableWrapEl.addEventListener('pointermove', function (e) {
      if (!dragActive) return;
      tableWrapEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag() { dragActive = false; tableWrapEl.classList.remove('dre-dragging'); }
    tableWrapEl.addEventListener('pointerup', stopDrag);
    tableWrapEl.addEventListener('pointercancel', stopDrag);
    tableWrapEl.addEventListener('pointerleave', stopDrag);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de novo no clique) ----------
  var filtrosHeader = document.getElementById('dre-filtros-header');
  var filtrosToggle = document.getElementById('dre-filtros-toggle');
  var filtrosContent = document.getElementById('dre-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  // ---------- Gráfico: card colapsável, preferência persistida (ver conversa de UX
  // 2026-08-05, ponto 3a) — nasce expandido na primeira geração; o estado de recolhido/
  // expandido do usuário sobrevive a novas gerações e a um reload, via `localStorage`
  // (mesmo raciocínio já usado pra `nivelo.shell.sidebarCollapsed`). ----------
  var CHART_COLLAPSE_KEY = 'nivelo.dre.chartCollapsed';
  var chartHeader = document.getElementById('dre-chart-header');
  var chartToggle = document.getElementById('dre-chart-toggle');
  var chartBody = document.getElementById('dre-chart-body');

  function setChartExpanded(expanded) {
    chartBody.hidden = !expanded;
    chartToggle.setAttribute('aria-expanded', String(expanded));
    chartToggle.setAttribute('aria-label', expanded ? 'Recolher gráfico' : 'Expandir gráfico');
    try { window.localStorage.setItem(CHART_COLLAPSE_KEY, expanded ? 'false' : 'true'); } catch (e) { /* localStorage indisponível */ }
  }
  var chartCollapsedPref = false;
  try { chartCollapsedPref = window.localStorage.getItem(CHART_COLLAPSE_KEY) === 'true'; } catch (e) { /* localStorage indisponível */ }
  setChartExpanded(!chartCollapsedPref);
  chartHeader.addEventListener('click', function () {
    setChartExpanded(chartBody.hidden);
  });

  document.getElementById('dre-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Exportações (fora de escopo real neste protótipo estático — mesmo
  // padrão de flash-disable já usado em Balancete e em ações sem fluxo real ainda). ----
  Array.prototype.slice.call(document.querySelectorAll('[data-export]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.disabled = true;
      window.setTimeout(function () { btn.disabled = false; }, 300);
    });
  });
})();
