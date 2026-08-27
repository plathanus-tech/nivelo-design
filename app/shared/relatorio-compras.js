(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TODAY = '2026-07-31';

  // ---------- Helpers ----------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function isoFromDate(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function lastDayOfMonthISO(yyyyMm) {
    var p = yyyyMm.split('-').map(Number);
    var d = new Date(p[0], p[1], 0);
    return isoFromDate(d);
  }

  function formatInt(n) {
    return Number(n || 0).toLocaleString('pt-BR');
  }

  function formatCurrency(n) {
    return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  // ---------- Toast (validação de filtros) ----------
  function showToast(title, message) {
    // Sem region de toast dedicada nesta tela ainda (única validação hoje é
    // "informe um período válido") — reaproveita o mesmo alerta inline do
    // topo dos filtros pra manter a mensagem visível até o usuário corrigir.
    window.alert(title + '. ' + message);
  }

  // ---------- Radio "Tipo de período" (mesmo padrão de Balancete/DRE) ----------
  var mesAnoField = document.getElementById('mes-ano-field');
  var intervaloFields = document.getElementById('intervalo-fields');
  var dataInicialInput = document.getElementById('rc-data-inicial');
  var dataFinalInput = document.getElementById('rc-data-final');

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

  // ---------- Mês/Ano, Data inicial/final: padrões oficiais de calendário do
  // sistema (mês e dia único), ver app/shared/date-picker.js. ----------
  var mesAnoPicker = window.NiveloDatePicker.initMonth({
    rootId: 'mes-ano-field',
    triggerId: 'rc-mes-ano-trigger',
    valueId: 'rc-mes-ano-value',
    popoverId: 'rc-mes-ano-popover',
    placeholder: 'Selecionar competência'
  });
  mesAnoPicker.setValue('2026-07');

  var dataInicialPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-inicial-field',
    triggerId: 'rc-data-inicial-trigger',
    valueId: 'rc-data-inicial-value',
    hiddenInputId: 'rc-data-inicial',
    popoverId: 'rc-data-inicial-popover',
    placeholder: 'Selecionar data'
  });
  var dataFinalPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-final-field',
    triggerId: 'rc-data-final-trigger',
    valueId: 'rc-data-final-value',
    hiddenInputId: 'rc-data-final',
    popoverId: 'rc-data-final-popover',
    placeholder: 'Selecionar data'
  });
  dataInicialPicker.setValue('2026-01-01');
  dataFinalPicker.setValue(TODAY);

  // ---------- Dropdown "Categoria" — mesmo initDropdown() simples já usado
  // em outras telas de relatório (ex.: "Agrupamento" em Balancete/DRE). As
  // opções são geradas em runtime a partir das categorias REALMENTE
  // presentes entre as compras (nunca o catálogo inteiro). ----------
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

  var categoriaField = document.getElementById('categoria-field');
  var categoriaMenu = document.getElementById('rc-categoria-menu');

  function getCategoriaValue() { return categoriaField.dataset.value || 'todas'; }

  function populateCategoriaMenu() {
    var seen = {};
    var categoriasPresentes = [];
    window.NiveloEstoqueCompras.list().forEach(function (c) {
      if (!c.categoriaCodigo || seen[c.categoriaCodigo]) return;
      seen[c.categoriaCodigo] = true;
      var categoria = window.NiveloCategoriasFinanceiras.findByCodigo(c.categoriaCodigo);
      if (categoria) categoriasPresentes.push(categoria);
    });
    categoriaMenu.innerHTML = '<div class="option selected" data-value="todas">Todas</div>' +
      categoriasPresentes.map(function (c) {
        return '<div class="option" data-value="' + c.codigo + '">' + c.descricao + '</div>';
      }).join('');
  }
  populateCategoriaMenu();
  categoriaField.dataset.value = 'todas';
  initDropdown(categoriaField);

  // ---------- Agrupamento por produto (mesma lógica original desta tela) ----------
  // `window.NiveloEstoqueCompras.list()` retorna 1 entrada por evento de
  // compra (cada "lote"/restock é uma linha própria, nunca um acumulado) —
  // agrupar por `produto` (nome) é o que reconstitui o histórico de um
  // mesmo produto ao longo de várias compras/meses.
  function groupByProduto(compras) {
    var groups = {};
    var order = [];
    compras.forEach(function (item) {
      if (!groups[item.produto]) {
        groups[item.produto] = [];
        order.push(item.produto);
      }
      groups[item.produto].push(item);
    });
    return order.map(function (nome) {
      var eventos = groups[nome].slice().sort(function (a, b) {
        return a.dataEntrada < b.dataEntrada ? -1 : (a.dataEntrada > b.dataEntrada ? 1 : 0);
      });
      return { produto: nome, unidade: eventos[0].unidade, eventos: eventos };
    });
  }

  // ---------- Indicador de variação de preço ----------
  // Considera só os eventos com `valorUnitario` informado (o campo é
  // opcional/nullable no dado de origem, ver estoque-compras-data.js) — com
  // menos de 2 valores conhecidos não há "evolução" possível de mostrar.
  function computeTrend(eventos) {
    var withPrice = eventos.filter(function (e) { return e.valorUnitario != null; });
    if (withPrice.length < 2) return null;
    var first = withPrice[0].valorUnitario;
    var last = withPrice[withPrice.length - 1].valorUnitario;
    if (!first) return null;
    var pct = ((last - first) / first) * 100;
    return { pct: pct, subiu: pct > 0 };
  }

  function trendInlineHTML(trend) {
    if (!trend) return '<span class="rc-trend-inline rc-trend-empty">—</span>';
    var sign = trend.pct > 0 ? '+' : (trend.pct < 0 ? '' : '');
    var pctLabel = sign + trend.pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
    var cls = trend.pct === 0 ? '' : (trend.subiu ? 'rc-trend-up' : 'rc-trend-down');
    var icon = trend.pct === 0 ? 'minus' : (trend.subiu ? 'trending-up' : 'trending-down');
    return '<span class="rc-trend-inline ' + cls + '">' +
      '<i data-lucide="' + icon + '" width="12" height="12"></i>' + pctLabel +
      '</span>';
  }

  // ---------- Identificador estável (sem acento/espaço) pra agrupamento de
  // linhas na tabela hierárquica (`data-parent-group`). ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function slugifyId(s) {
    return String(s)
      .normalize('NFD').replace(DIACRITICS_RE, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '');
  }

  // ---------- Tabela hierárquica (accordion só no nível de bucket) — mesmo
  // padrão de `data-parent-group`/`collapsedGroups`/toggle de chevron já usado
  // em dre.js/dre-v2.js. Copiado verbatim por convenção do projeto (telas de
  // relatório não compartilham JS entre si), adaptado pras 3 colunas fixas
  // (Data/Quantidade/Preço/Fornecedor/Depósito) desta tela em vez das colunas
  // variáveis por período da DRE. ----------
  var collapsedGroups = {};

  function toggleGroup(groupId) {
    collapsedGroups[groupId] = !collapsedGroups[groupId];
    applyRowVisibility();
  }

  function applyRowVisibility() {
    Array.prototype.slice.call(document.querySelectorAll('#rc-tbody [data-parent-group]')).forEach(function (row) {
      var hidden = false;
      row.dataset.parentGroup.split(',').forEach(function (p) { if (collapsedGroups[p]) hidden = true; });
      row.classList.toggle('rc-row-collapsed', hidden);
    });
    Array.prototype.slice.call(document.querySelectorAll('.rc-group-toggle[data-group-id]')).forEach(function (btn) {
      btn.classList.toggle('is-collapsed', !!collapsedGroups[btn.dataset.groupId]);
    });
  }

  // Linha de produto (nível 0) — a ÚNICA linha com toggle de expandir/
  // recolher desta tabela: o agrupamento é exclusivamente por produto, nunca
  // por categoria/classificação DRE ("Custos" etc.) — como este relatório é
  // de compras, toda compra já É um custo por definição, então uma camada
  // superior de "Custos" seria redundante (pedido explícito). Total comprado
  // + variação de preço viram uma 2ª linha compacta dentro da mesma célula
  // de Produto, já que não há colunas extras pra eles.
  function productRowHTML(group, groupId) {
    var totalComprado = group.eventos.reduce(function (sum, e) { return sum + (e.quantidadeInicial || 0); }, 0);
    var trend = computeTrend(group.eventos);
    var toggleBtn = '<button type="button" class="rc-group-toggle" data-group-id="' + groupId + '" aria-label="Expandir/recolher"><i data-lucide="chevron-down" width="14" height="14"></i></button>';
    return (
      '<tr class="tr rc-row-level-0">' +
        '<td class="td">' +
          '<span class="rc-row-label">' + toggleBtn + group.produto + '</span>' +
          '<span class="rc-row-sublabel text-body-xs">' +
            'Total comprado: ' + formatInt(totalComprado) + ' ' + group.unidade + ' · Variação: ' + trendInlineHTML(trend) +
          '</span>' +
        '</td>' +
        '<td class="td"></td><td class="td"></td><td class="td"></td><td class="td"></td><td class="td"></td>' +
      '</tr>'
    );
  }

  // Linha de compra individual (nível 1, folha do produto) — coluna Produto
  // vazia (já implícita pela linha de produto acima), zebra própria, some
  // por completo quando o produto pai está recolhido.
  function purchaseRowHTML(e, groupId, isEven) {
    return (
      '<tr class="tr rc-row-level-1' + (isEven ? ' rc-row-zebra' : '') + '" data-parent-group="' + groupId + '">' +
        '<td class="td"></td>' +
        '<td class="td">' + formatDate(e.dataEntrada) + '</td>' +
        '<td class="td">' + formatInt(e.quantidadeInicial) + ' ' + e.unidade + '</td>' +
        '<td class="td">' + (e.valorUnitario != null ? formatCurrency(e.valorUnitario) : '—') + '</td>' +
        '<td class="td">' + (e.fornecedor || '—') + '</td>' +
        '<td class="td">' + (e.deposito || '—') + '</td>' +
      '</tr>'
    );
  }

  // ---------- Montagem das linhas do `#rc-tbody`: sempre agrupado por
  // produto, com ou sem filtro de categoria específico aplicado — a
  // categoria só decide QUAIS compras entram (via `getFilteredCompras()`),
  // nunca a estrutura de agrupamento da tabela. ----------
  function buildTableRowsHTML(compras) {
    var html = '';
    groupByProduto(compras).forEach(function (group) {
      var groupId = slugifyId(group.produto);
      html += productRowHTML(group, groupId);
      group.eventos.forEach(function (e, i) {
        html += purchaseRowHTML(e, groupId, i % 2 === 1);
      });
    });
    return html;
  }

  // ---------- Wrapper da tabela — mesmo padrão `.card` > `.tableWrap` >
  // `table.table` (thead com `.headerRow`, zebra escopada por ID) já usado em
  // todo relatório V2 do sistema (ver `lcdpr-v2.html`). ----------
  function buildResultTableHTML() {
    return (
      '<div class="card rc-table-card">' +
        '<div class="cardHeader">' +
          '<h2 class="title">Histórico de compras</h2>' +
        '</div>' +
        '<div class="tableWrap">' +
          '<table class="table">' +
            '<thead>' +
              '<tr class="headerRow">' +
                '<th class="th">Produto</th>' +
                '<th class="th">Data da compra</th>' +
                '<th class="th">Quantidade</th>' +
                '<th class="th">Preço unitário</th>' +
                '<th class="th">Fornecedor</th>' +
                '<th class="th">Depósito</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody id="rc-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>'
    );
  }

  // ---------- Geração do relatório ----------
  function getFilteredCompras() {
    var tipoPeriodo = document.querySelector('input[name="tipo-periodo"]:checked').value;
    var start, end;
    if (tipoPeriodo === 'mes') {
      var mesAno = mesAnoPicker.getValue();
      if (!mesAno) { showToast('Informe o período', 'Selecione o mês/ano para gerar o relatório.'); return null; }
      start = mesAno + '-01';
      end = lastDayOfMonthISO(mesAno);
    } else {
      start = dataInicialInput.value;
      end = dataFinalInput.value;
      if (!start || !end || start > end) { showToast('Informe o período', 'Selecione uma data inicial e final válidas.'); return null; }
    }

    var categoriaValue = getCategoriaValue();
    var compras = window.NiveloEstoqueCompras.list().filter(function (c) {
      return c.dataEntrada >= start && c.dataEntrada <= end;
    });
    if (categoriaValue !== 'todas') {
      compras = compras.filter(function (c) { return c.categoriaCodigo === categoriaValue; });
    }
    return compras;
  }

  function render() {
    var compras = getFilteredCompras();
    if (compras === null) return; // filtro inválido, toast já mostrado

    var resultado = document.getElementById('rc-resultado');
    var empty = document.getElementById('rc-empty');
    var container = document.getElementById('rc-results-container');

    resultado.hidden = false;

    if (compras.length === 0) {
      empty.hidden = false;
      container.innerHTML = '';
      return;
    }
    empty.hidden = true;

    container.innerHTML = buildResultTableHTML();
    document.getElementById('rc-tbody').innerHTML = buildTableRowsHTML(compras);
    collapsedGroups = {};
    applyRowVisibility();
    if (window.lucide) lucide.createIcons();
  }

  function gerarRelatorio() {
    render();
    setFiltrosExpanded(false);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de
  // novo no clique) ----------
  var filtrosHeader = document.getElementById('rc-filtros-header');
  var filtrosToggle = document.getElementById('rc-filtros-toggle');
  var filtrosContent = document.getElementById('rc-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('rc-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Accordion da tabela (nível de bucket) — delegado no container
  // do resultado, que nunca é recriado (só seu innerHTML é substituído a cada
  // `render()`), mesmo padrão de delegação já usado em dre.js/dre-v2.js. ----------
  document.getElementById('rc-results-container').addEventListener('click', function (e) {
    var btn = e.target.closest('.rc-group-toggle[data-group-id]');
    if (!btn) return;
    toggleGroup(btn.dataset.groupId);
  });

  if (window.lucide) lucide.createIcons();
})();
