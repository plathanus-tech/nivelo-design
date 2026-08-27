// RELATÓRIO DE SAFRA (Financeiro > Relatórios > Relatório de Safra). Compara,
// para UMA safra selecionada por vez, "Plantado" (talhão.cultura/talhao.safra,
// window.NiveloFazendas — retrato ESTÁTICO do que está plantado agora nos
// talhões) com "Colhido" (anotações tipo 'colheita', window.NiveloCaderno —
// registro REAL de colheitas, cada uma já com sua própria cultura/safra).
// Tela 100% read-only sobre os 2 módulos: nunca escreve em fazendas-data.js
// nem em caderno-data.js, só lê e agrega em memória a cada troca de filtro.
//
// Diferente da versão anterior (1 card por safra, todas empilhadas), esta
// versão tem um filtro de Safra (window.NiveloSafras.list(), default a mais
// recente) e reage na hora à troca de safra: sem passo de "Gerar relatório",
// sem reload — trocar o Dropdown já recalcula e re-renderiza tabela+resumo.
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function parseSafraYear(safraLabel) {
    var year = parseInt(String(safraLabel).split('/')[0], 10);
    return isNaN(year) ? 0 : year;
  }

  function formatHa(valor) {
    // Milhar com ponto, sem decimais forçados (área de talhão é sempre um
    // número "redondo" no mock) — mesma técnica de separador pt-BR já usada
    // em outras telas (ex. formatMilhar de nova-fazenda.js), sem depender
    // de um arquivo compartilhado (telas de relatório não compartilham JS
    // entre si, convenção já documentada em várias outras telas do sistema).
    var num = Number(valor) || 0;
    var fixed = num % 1 === 0 ? num.toFixed(0) : String(num).replace('.', ',');
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ha';
  }

  function formatQuantidade(valor, unidade) {
    var num = Number(valor) || 0;
    var fixed = num % 1 === 0 ? num.toFixed(0) : String(num).replace('.', ',');
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ' + unidade;
  }

  // ── Agregação: Plantado (talhões cujo talhao.safra bate com a safra
  //    selecionada), somando areaHa por cultura. Talhão com cultura===null é
  //    ignorado (nada meaningfully plantado ainda ali). ────────────────────
  function aggregatePlantado(safraLabel) {
    var porCultura = {}; // cultura -> soma de areaHa
    var fazendas = window.NiveloFazendas ? window.NiveloFazendas.list() : [];
    fazendas.forEach(function (fazenda) {
      (fazenda.talhoes || []).forEach(function (talhao) {
        if (!talhao.cultura || talhao.safra !== safraLabel) return;
        porCultura[talhao.cultura] = (porCultura[talhao.cultura] || 0) + (Number(talhao.areaHa) || 0);
      });
    });
    return porCultura;
  }

  // ── Agregação: Colhido (anotações tipo 'colheita' cuja .safra bate com a
  //    safra selecionada), somando quantidade por cultura+unidade — nunca
  //    soma across unidades diferentes da mesma cultura (ex. Soja em Saca
  //    nunca entra na mesma linha que Soja em Kg, ainda que hoje o mock use
  //    1 unidade por cultura de forma consistente). ─────────────────────────
  function aggregateColhido(safraLabel) {
    var porCulturaUnidade = {}; // "cultura|unidade" -> soma de quantidade
    var anotacoes = window.NiveloCaderno ? window.NiveloCaderno.list() : [];
    anotacoes.forEach(function (anotacao) {
      if (anotacao.tipo !== 'colheita' || anotacao.safra !== safraLabel) return;
      var key = anotacao.cultura + '|' + anotacao.unidade;
      if (!porCulturaUnidade[key]) {
        porCulturaUnidade[key] = { cultura: anotacao.cultura, unidade: anotacao.unidade, quantidade: 0 };
      }
      porCulturaUnidade[key].quantidade += Number(anotacao.quantidade) || 0;
    });
    return porCulturaUnidade;
  }

  // ── Monta as linhas da tabela: 1 linha por cultura distinta encontrada em
  //    QUALQUER um dos 2 lados (Plantado ou Colhido) pra essa safra. Cultura
  //    presente só de um lado mostra "—" do outro (mesma convenção de
  //    placeholder de valor ausente já usada em LCDPR/DRE/Entradas e
  //    Saídas — nunca uma mensagem própria por célula). ───────────────────
  function buildRows(safraLabel) {
    var plantado = aggregatePlantado(safraLabel);
    var colhido = aggregateColhido(safraLabel);

    var culturas = {};
    Object.keys(plantado).forEach(function (c) { culturas[c] = true; });
    Object.keys(colhido).forEach(function (key) { culturas[colhido[key].cultura] = true; });

    return Object.keys(culturas).sort().map(function (cultura) {
      var colhidoItem = null;
      Object.keys(colhido).forEach(function (key) {
        if (colhido[key].cultura === cultura) colhidoItem = colhido[key];
      });
      return {
        cultura: cultura,
        areaHa: plantado.hasOwnProperty(cultura) ? plantado[cultura] : null,
        colhidoQuantidade: colhidoItem ? colhidoItem.quantidade : null,
        colhidoUnidade: colhidoItem ? colhidoItem.unidade : null
      };
    });
  }

  // ── Dropdown genérico (mesmo padrão de Produtos/Cadastro/Estoque/
  //    Categorias financeiras) ──────────────────────────────────────────
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
    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    }
    function onScroll(e) { if (menu.contains(e.target)) return; close(); }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', close);
    }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (root.__onChange) root.__onChange(optionEl.dataset.value);
    }

    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (e) { var o = e.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    return {
      onChange: function (fn) { root.__onChange = fn; },
      selectValue: function (value) {
        var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
        if (optionEl) selectOption(optionEl);
      }
    };
  }

  // ── Filtro de Safra: populado a partir de window.NiveloSafras.list(),
  //    ordenado do ano mais antigo pro mais recente (mesma ordem já usada
  //    antes pros cards). Default = safra mais recente. ────────────────────
  var safraDropdownRoot = document.getElementById('relsafra-safra-dropdown');
  var safraMenu = safraDropdownRoot.querySelector('[data-dropdown-menu]');
  var safraDropdown = initDropdown(safraDropdownRoot);

  var safras = (window.NiveloSafras ? window.NiveloSafras.list() : []).slice();
  safras.sort(function (a, b) { return parseSafraYear(a) - parseSafraYear(b); });

  safraMenu.innerHTML = safras.map(function (safraLabel) {
    return '<div class="option" data-value="' + safraLabel + '">Safra ' + safraLabel + '</div>';
  }).join('');

  var safraAtual = safras.length ? safras[safras.length - 1] : null;

  var tbodyEl = document.getElementById('relsafra-tbody');
  var tableWrapEl = document.querySelector('.relsafra-table-card .tableWrap');
  var emptyEl = document.getElementById('relsafra-empty');
  var safraLabelEl = document.getElementById('relsafra-table-safra-label');
  var totalPlantadoEl = document.getElementById('relsafra-total-plantado');
  var totalColhidoEl = document.getElementById('relsafra-total-colhido');
  var totalColhidoCaptionEl = document.getElementById('relsafra-total-colhido-caption');

  var currentRows = [];

  function render() {
    if (!safraAtual) {
      tbodyEl.innerHTML = '';
      tableWrapEl.hidden = true;
      emptyEl.hidden = false;
      safraLabelEl.textContent = '';
      totalPlantadoEl.textContent = '—';
      totalColhidoEl.textContent = '—';
      totalColhidoCaptionEl.textContent = '';
      return;
    }

    safraLabelEl.textContent = safraAtual;
    currentRows = buildRows(safraAtual);

    // Resumo: Total plantado é uma soma direta (ha é sempre a mesma unidade).
    // Total colhido NÃO pode ser uma soma direta — culturas diferentes podem
    // usar unidades incompatíveis entre si (ex. Soja em Saca, Café em Kg).
    // Mesmo padrão já usado no card "Estoque de Uso" de Estoque (round 19):
    // quando a soma não é meaningful entre unidades diferentes, o indicador
    // principal vira uma CONTAGEM (quantas culturas têm colheita registrada)
    // e a legenda secundária detalha a soma por unidade (nunca uma soma
    // inválida misturando unidades).
    var totalPlantado = currentRows.reduce(function (sum, row) { return sum + (row.areaHa || 0); }, 0);
    totalPlantadoEl.textContent = formatHa(totalPlantado);

    var porUnidade = {}; // unidade -> soma de quantidade
    var countColhido = 0;
    currentRows.forEach(function (row) {
      if (row.colhidoQuantidade === null) return;
      countColhido++;
      porUnidade[row.colhidoUnidade] = (porUnidade[row.colhidoUnidade] || 0) + row.colhidoQuantidade;
    });
    var unidades = Object.keys(porUnidade);
    if (!countColhido) {
      totalColhidoEl.textContent = '—';
      totalColhidoCaptionEl.textContent = 'Nenhuma colheita registrada nesta safra.';
    } else if (unidades.length === 1) {
      // Só 1 unidade envolvida: soma direta é válida, mostrada como valor
      // principal (a contagem de culturas fica só na legenda).
      totalColhidoEl.textContent = formatQuantidade(porUnidade[unidades[0]], unidades[0]);
      totalColhidoCaptionEl.textContent = countColhido + (countColhido === 1 ? ' cultura colhida' : ' culturas colhidas');
    } else {
      // Unidades incompatíveis: valor principal vira a contagem de culturas
      // colhidas, legenda detalha a soma por unidade (nunca uma soma única
      // inválida entre sacas/kg/litros).
      totalColhidoEl.textContent = countColhido + (countColhido === 1 ? ' cultura colhida' : ' culturas colhidas');
      totalColhidoCaptionEl.textContent = unidades.map(function (u) {
        return formatQuantidade(porUnidade[u], u);
      }).join(' · ');
    }

    if (!currentRows.length) {
      tbodyEl.innerHTML = '';
      tableWrapEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    tableWrapEl.hidden = false;
    emptyEl.hidden = true;

    tbodyEl.innerHTML = currentRows.map(function (row) {
      return (
        '<tr class="tr">' +
          '<td class="td">' + row.cultura + '</td>' +
          '<td class="td">' + (row.areaHa !== null ? formatHa(row.areaHa) : '—') + '</td>' +
          '<td class="td">' + (row.colhidoQuantidade !== null ? formatQuantidade(row.colhidoQuantidade, row.colhidoUnidade) : '—') + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  safraDropdown.onChange(function (value) {
    safraAtual = value;
    render();
  });

  if (safraAtual) safraDropdown.selectValue(safraAtual);
  render();

  // ── Exportar para Excel: SheetJS (window.XLSX), mesma técnica real já
  //    usada em LCDPR (aoa_to_sheet + XLSX.writeFile) — não um flash-disable. ─
  document.getElementById('relsafra-export-btn').addEventListener('click', function () {
    if (!window.XLSX) return;
    if (!safraAtual) return;

    var rows = [['Relatório de Safra ' + safraAtual], [], ['Produto', 'Plantado (ha)', 'Colhido']];
    currentRows.forEach(function (row) {
      rows.push([
        row.cultura,
        row.areaHa !== null ? row.areaHa : '',
        row.colhidoQuantidade !== null ? (row.colhidoQuantidade + ' ' + row.colhidoUnidade) : ''
      ]);
    });

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 20 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Safra');
    // '/' não é válido em nome de arquivo (ex. "2026/27") — trocado por hífen.
    XLSX.writeFile(wb, 'Relatorio-Safra-' + safraAtual.replace('/', '-') + '.xlsx');
  });

  if (window.lucide) lucide.createIcons();
})();
