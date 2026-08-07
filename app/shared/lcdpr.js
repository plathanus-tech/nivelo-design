(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TODAY = '2026-07-31';

  // ---------- Helpers de data/moeda ----------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDataPt(iso) {
    var p = (iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : (iso || '—');
  }
  function formatMoeda(valor) {
    var n = Number(valor || 0);
    var sinal = n < 0 ? '-' : '';
    return sinal + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDataHoraPt(date) {
    var d = pad2(date.getDate()), m = pad2(date.getMonth() + 1), y = date.getFullYear();
    var hh = pad2(date.getHours()), mm = pad2(date.getMinutes());
    return d + '/' + m + '/' + y + ' ' + hh + ':' + mm;
  }
  // "Documento" não tem um campo próprio em NiveloCaixa — heurística de prototipagem
  // (mesmo espírito do round 76: `codigo` como referência) infere um tipo plausível de
  // documento fiscal/financeiro a partir dos dados já existentes do lançamento, só pra
  // ilustrar a coluna "Documento Fiscal / Documento" pedida (NF-e/DARF/Recibo/TED).
  function inferDocumentoFiscal(l) {
    if (l.categoriaCodigo === 'CAT-006') return 'DARF';
    if (l.pessoaDocumento) return 'NF-e';
    if (l.banco && l.banco.indexOf('Dinheiro') !== -1) return 'Recibo';
    return 'TED';
  }
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) { return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, ''); }

  // ---------- Toast (validação de filtros) ----------
  var toastRegion = document.getElementById('toast-region');
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert warning lcdpr-toast';
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

  // ---------- Dropdown genérico (Ano) ----------
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

  // ---------- Combobox (Conta/Categoria) — mesma técnica de Balancete ----------
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
  var anoField = document.getElementById('ano-field');
  var intervaloFields = document.getElementById('intervalo-fields');
  var dataInicialInput = document.getElementById('lcdpr-data-inicial');
  var dataFinalInput = document.getElementById('lcdpr-data-final');

  function syncRadioChecked() {
    Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-periodo"]')).forEach(function (radio) {
      radio.closest('.option').classList.toggle('checked', radio.checked);
    });
  }
  function syncTipoPeriodo() {
    var tipo = document.querySelector('input[name="tipo-periodo"]:checked').value;
    anoField.hidden = tipo !== 'ano';
    intervaloFields.hidden = tipo !== 'intervalo';
    syncRadioChecked();
  }
  Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-periodo"]')).forEach(function (radio) {
    radio.addEventListener('change', syncTipoPeriodo);
  });
  syncTipoPeriodo();

  var anoDropdown = initDropdown(anoField);

  var dataInicialPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-inicial-field',
    triggerId: 'lcdpr-data-inicial-trigger',
    valueId: 'lcdpr-data-inicial-value',
    hiddenInputId: 'lcdpr-data-inicial',
    popoverId: 'lcdpr-data-inicial-popover',
    placeholder: 'Selecionar data'
  });
  var dataFinalPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-final-field',
    triggerId: 'lcdpr-data-final-trigger',
    valueId: 'lcdpr-data-final-value',
    hiddenInputId: 'lcdpr-data-final',
    popoverId: 'lcdpr-data-final-popover',
    placeholder: 'Selecionar data'
  });
  dataInicialPicker.setValue('2026-07-01');
  dataFinalPicker.setValue(TODAY);

  // ---------- Filtros: Conta/Categoria ----------
  var contaItems = window.NiveloContasFinanceiras.list().map(function (c) { return { value: String(c.codigo), label: c.nome }; });
  var contaSelect = initCombobox(document.getElementById('conta-field'), 'Todas as contas', contaItems);

  var categoriaItems = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).map(function (c) { return { value: c.codigo, label: c.descricao }; });
  var categoriaSelect = initCombobox(document.getElementById('categoria-field'), 'Todas as categorias', categoriaItems);

  // ---------- Geração do relatório ----------
  function gerarRelatorio() {
    var tipoPeriodo = document.querySelector('input[name="tipo-periodo"]:checked').value;
    var start, end, periodoLabel;
    if (tipoPeriodo === 'ano') {
      var ano = anoField.dataset.value || '2026';
      start = ano + '-01-01';
      end = ano + '-12-31';
      periodoLabel = 'Ano-calendário ' + ano;
    } else {
      start = dataInicialInput.value;
      end = dataFinalInput.value;
      if (!start || !end || start > end) { showToast('Informe o período', 'Selecione uma data inicial e final válidas.'); return; }
      periodoLabel = formatDataPt(start) + ' a ' + formatDataPt(end);
    }

    var contaCodigo = contaSelect.getValue();
    var categoriaCodigo = categoriaSelect.getValue();

    var lancamentos = window.NiveloCaixa.list()
      .filter(function (l) { return l.data >= start && l.data <= end; })
      .filter(function (l) { return !contaCodigo || String(l.contaFinanceiraCodigo) === contaCodigo; })
      .filter(function (l) { return !categoriaCodigo || l.categoriaCodigo === categoriaCodigo; })
      .slice()
      .sort(function (a, b) { return a.data < b.data ? -1 : a.data > b.data ? 1 : 0; });

    var totalReceitas = 0, totalDespesas = 0, saldoCorrente = 0;
    var linhas = lancamentos.map(function (l) {
      var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(l.categoriaCodigo);
      var entrada = l.tipo === 'entrada' ? l.valor : 0;
      var saida = l.tipo === 'saida' ? l.valor : 0;
      totalReceitas += entrada;
      totalDespesas += saida;
      saldoCorrente += entrada - saida;
      return {
        data: l.data,
        documento: l.codigo,
        documentoTipo: inferDocumentoFiscal(l),
        historico: l.historico,
        categoria: categoria ? categoria.descricao : '—',
        entrada: entrada,
        saida: saida,
        saldo: saldoCorrente
      };
    });

    // "Exercício": ano-calendário mostra o ano escolhido; intervalo personalizado
    // mostra o(s) ano(s) coberto(s) pelo período (só 1 quando não cruza virada de ano).
    var anoInicio = start.slice(0, 4), anoFim = end.slice(0, 4);
    var exercicio = tipoPeriodo === 'ano' ? (anoField.dataset.value || '2026') : (anoInicio === anoFim ? anoInicio : anoInicio + '/' + anoFim);
    var filtroPeriodoLabel = tipoPeriodo === 'ano' ? ('Exercício ' + exercicio) : ('Período: ' + periodoLabel);

    var conta = window.NiveloMinhaConta.getConta();

    window.__lcdprReport = {
      periodoLabel: periodoLabel,
      contaLabel: contaCodigo ? contaSelect.getLabel() : 'Todas as contas',
      categoriaLabel: categoriaCodigo ? categoriaSelect.getLabel() : 'Todas as categorias',
      linhas: linhas,
      totalReceitas: totalReceitas,
      totalDespesas: totalDespesas,
      resultado: totalReceitas - totalDespesas,
      saldoFinal: saldoCorrente,
      dadosGerais: {
        produtor: conta.nome,
        cpf: conta.documento,
        exercicio: exercicio,
        periodo: periodoLabel,
        filtroPeriodoLabel: filtroPeriodoLabel,
        emissao: formatDataHoraPt(new Date())
      }
    };

    renderReport(window.__lcdprReport);
    setFiltrosExpanded(false);
  }

  // ---------- Render: cabeçalho/resumo + KPIs + tabela ----------
  function renderReport(report) {
    document.getElementById('lcdpr-resultado').hidden = false;

    var g = report.dadosGerais;
    document.getElementById('lcdpr-info-produtor').textContent = g.produtor;
    document.getElementById('lcdpr-info-cpf').textContent = g.cpf;
    document.getElementById('lcdpr-info-exercicio').textContent = g.exercicio;
    document.getElementById('lcdpr-info-periodo').textContent = g.periodo;
    document.getElementById('lcdpr-info-emissao').textContent = g.emissao;

    document.getElementById('lcdpr-emission-note').textContent =
      'Relatório emitido em: ' + g.emissao + ' • Filtros aplicados: ' + g.filtroPeriodoLabel +
      ' • Conta: ' + report.contaLabel + ' • Categoria: ' + report.categoriaLabel;

    document.getElementById('lcdpr-kpi-receitas').textContent = formatMoeda(report.totalReceitas);
    document.getElementById('lcdpr-kpi-despesas').textContent = formatMoeda(report.totalDespesas);
    var resultadoEl = document.getElementById('lcdpr-kpi-resultado');
    resultadoEl.textContent = formatMoeda(report.resultado);
    resultadoEl.classList.toggle('lcdpr-value-positive', report.resultado >= 0);
    resultadoEl.classList.toggle('lcdpr-value-negative', report.resultado < 0);

    renderTable(report);
    if (window.lucide) lucide.createIcons();
  }

  function renderTable(report) {
    var tbody = document.getElementById('lcdpr-tbody');
    var tfoot = document.getElementById('lcdpr-tfoot');
    var tableCard = document.querySelector('.lcdpr-table-card .tableWrap');
    var emptyEl = document.getElementById('lcdpr-empty');

    if (!report.linhas.length) {
      tbody.innerHTML = '';
      tfoot.innerHTML = '';
      tableCard.closest('.lcdpr-table-scroll-shell').hidden = true;
      emptyEl.hidden = false;
      return;
    }
    tableCard.closest('.lcdpr-table-scroll-shell').hidden = false;
    emptyEl.hidden = true;

    tbody.innerHTML = report.linhas.map(function (l) {
      return (
        '<tr class="tr">' +
          '<td class="td">' + formatDataPt(l.data) + '</td>' +
          '<td class="td"><span class="lcdpr-doc-tipo">' + l.documentoTipo + '</span><span class="lcdpr-doc-ref">' + l.documento + '</span></td>' +
          '<td class="td">' + l.historico + '</td>' +
          '<td class="td">' + l.categoria + '</td>' +
          '<td class="td">' + (l.entrada ? formatMoeda(l.entrada) : '') + '</td>' +
          '<td class="td">' + (l.saida ? formatMoeda(l.saida) : '') + '</td>' +
          '<td class="td">' + formatMoeda(l.saldo) + '</td>' +
        '</tr>'
      );
    }).join('');

    tfoot.innerHTML =
      '<tr class="tr lcdpr-foot-row">' +
        '<td class="td lcdpr-td-label" colspan="4">Total</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.totalReceitas) + '</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.totalDespesas) + '</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.saldoFinal) + '</td>' +
      '</tr>' +
      '<tr class="tr lcdpr-foot-row lcdpr-foot-resultado">' +
        '<td class="td lcdpr-td-label" colspan="4">Resultado do período</td>' +
        '<td class="td lcdpr-foot-value" colspan="3">' + formatMoeda(report.resultado) + '</td>' +
      '</tr>';

    updateScrollFade();
  }

  // ---------- Rolagem horizontal da tabela (mesma técnica de Balancete) ----------
  var tableWrapEl = document.getElementById('lcdpr-tablewrap');
  var tableScrollShell = document.querySelector('.lcdpr-table-scroll-shell');
  var scrollTopEl = document.getElementById('lcdpr-table-scroll-top');
  var scrollTopSpacer = document.getElementById('lcdpr-table-scroll-top-spacer');

  function updateScrollFade() {
    if (!tableWrapEl || !tableScrollShell) return;
    var hasMoreRight = tableWrapEl.scrollWidth - tableWrapEl.clientWidth - tableWrapEl.scrollLeft > 2;
    tableScrollShell.classList.toggle('lcdpr-has-hscroll', hasMoreRight);
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
      tableWrapEl.classList.add('lcdpr-dragging');
    });
    tableWrapEl.addEventListener('pointermove', function (e) {
      if (!dragActive) return;
      tableWrapEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag() { dragActive = false; tableWrapEl.classList.remove('lcdpr-dragging'); }
    tableWrapEl.addEventListener('pointerup', stopDrag);
    tableWrapEl.addEventListener('pointercancel', stopDrag);
    tableWrapEl.addEventListener('pointerleave', stopDrag);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de novo no clique) ----------
  var filtrosHeader = document.getElementById('lcdpr-filtros-header');
  var filtrosToggle = document.getElementById('lcdpr-filtros-toggle');
  var filtrosContent = document.getElementById('lcdpr-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('lcdpr-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Exportações reais: PDF (jsPDF) e Excel (SheetJS), ambos via CDN ----------
  function exportarPdf(report) {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { showToast('Não foi possível exportar', 'A biblioteca de PDF não carregou. Tente novamente.'); return; }
    var g = report.dadosGerais;
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
    var marginX = 40, pageBottom = 780, y = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Livro Caixa Digital do Produtor Rural (LCDPR)', marginX, y);
    doc.setFont(undefined, 'normal');
    y += 22;

    doc.setFontSize(9);
    [
      'Produtor Rural: ' + g.produtor,
      'CPF: ' + g.cpf,
      'Exercício: ' + g.exercicio,
      'Período consultado: ' + g.periodo,
      'Data e hora da emissão: ' + g.emissao
    ].forEach(function (line) { doc.text(line, marginX, y); y += 13; });
    y += 8;

    doc.setFont(undefined, 'bold');
    doc.text('Total de receitas: ' + formatMoeda(report.totalReceitas), marginX, y); y += 13;
    doc.text('Total de despesas: ' + formatMoeda(report.totalDespesas), marginX, y); y += 13;
    doc.text('Resultado do período: ' + formatMoeda(report.resultado), marginX, y); y += 20;
    doc.setFont(undefined, 'normal');

    var colX = { data: marginX, doc: marginX + 55, hist: marginX + 150, nat: marginX + 300, ent: marginX + 380, sai: marginX + 445, sal: marginX + 505 };

    function drawHeader() {
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Data', colX.data, y);
      doc.text('Documento', colX.doc, y);
      doc.text('Histórico', colX.hist, y);
      doc.text('Natureza', colX.nat, y);
      doc.text('Entradas', colX.ent, y);
      doc.text('Saídas', colX.sai, y);
      doc.text('Saldo', colX.sal, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      doc.setLineWidth(0.5);
      doc.line(marginX, y, 555, y);
      y += 12;
    }
    drawHeader();

    report.linhas.forEach(function (l) {
      if (y > pageBottom) { doc.addPage(); y = 50; drawHeader(); }
      doc.text(formatDataPt(l.data), colX.data, y);
      doc.text(l.documentoTipo + ' ' + l.documento, colX.doc, y);
      doc.text(String(l.historico).slice(0, 26), colX.hist, y);
      doc.text(String(l.categoria).slice(0, 16), colX.nat, y);
      if (l.entrada) doc.text(formatMoeda(l.entrada), colX.ent, y);
      if (l.saida) doc.text(formatMoeda(l.saida), colX.sai, y);
      doc.text(formatMoeda(l.saldo), colX.sal, y);
      y += 14;
    });

    if (y > pageBottom - 20) { doc.addPage(); y = 50; }
    y += 6;
    doc.setLineWidth(0.5);
    doc.line(marginX, y, 555, y);
    y += 14;
    doc.setFont(undefined, 'bold');
    doc.text('Total', colX.data, y);
    doc.text(formatMoeda(report.totalReceitas), colX.ent, y);
    doc.text(formatMoeda(report.totalDespesas), colX.sai, y);
    doc.text(formatMoeda(report.saldoFinal), colX.sal, y);
    y += 16;
    doc.text('Resultado do período', colX.data, y);
    doc.text(formatMoeda(report.resultado), colX.sal, y);

    doc.save('LCDPR-' + g.exercicio.replace('/', '-') + '.pdf');
  }

  function exportarExcel(report) {
    if (!window.XLSX) { showToast('Não foi possível exportar', 'A biblioteca de planilhas não carregou. Tente novamente.'); return; }
    var g = report.dadosGerais;
    var rows = [
      ['Livro Caixa Digital do Produtor Rural (LCDPR)'],
      ['Produtor Rural', g.produtor],
      ['CPF', g.cpf],
      ['Exercício', g.exercicio],
      ['Período consultado', g.periodo],
      ['Data e hora da emissão', g.emissao],
      [],
      ['Total de receitas', report.totalReceitas],
      ['Total de despesas', report.totalDespesas],
      ['Resultado do período', report.resultado],
      [],
      ['Data', 'Documento Fiscal / Documento', 'Histórico', 'Natureza', 'Entradas', 'Saídas', 'Saldo']
    ];
    report.linhas.forEach(function (l) {
      rows.push([
        formatDataPt(l.data),
        l.documentoTipo + ' ' + l.documento,
        l.historico,
        l.categoria,
        l.entrada || '',
        l.saida || '',
        l.saldo
      ]);
    });
    rows.push(['Total', '', '', '', report.totalReceitas, report.totalDespesas, report.saldoFinal]);
    rows.push(['Resultado do período', '', '', '', '', '', report.resultado]);

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 32 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LCDPR');
    XLSX.writeFile(wb, 'LCDPR-' + g.exercicio.replace('/', '-') + '.xlsx');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-export]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var report = window.__lcdprReport;
      if (!report) return;
      var tipo = btn.dataset.export;
      if (tipo === 'pdf') exportarPdf(report);
      else if (tipo === 'excel') exportarExcel(report);
      else if (tipo === 'imprimir') window.print();
    });
  });
})();
