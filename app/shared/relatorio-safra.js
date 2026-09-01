// RESULTADO DE SAFRA (Financeiro > Relatórios > Resultado de Safra). Reformulação
// completa do antigo "Relatório de Safra" (comparação Plantado×Colhido por
// PRODUTO, com só um filtro de Safra) — agora centrado em FAZENDA, com CUSTO,
// alimentado pelo Caderno de Campo V2 (window.NiveloCadernoV2) em vez do V1.
//
// Fontes read-only: `fazendas-data.js` (window.NiveloFazendas — área dos
// talhões) e `caderno-v2-data.js` (window.NiveloCadernoV2 — registros de
// Anotação/Aplicação de insumo/Despesa manual/Colheita, cada um já com sua
// própria fazendaId/talhaoId/cultura/safra). Tela 100% read-only sobre os 2
// módulos, nunca escreve em nenhum dos dois — só lê e agrega em memória a
// cada troca de filtro, sem passo de "Gerar relatório" e sem reload.
//
// Mesma lógica de agregação já validada em fazenda-detalhe-caderno-v2.js/
// talhao-detalhe-v2.js (Custo acumulado, Produção registrada, Produtividade
// média, Custo médio por hectare/unidade) — copiada e adaptada aqui pra
// agregar por FAZENDA (somando todos os talhões dela) em vez de por talhão
// individual (convenção do projeto: telas de relatório replicam o CÁLCULO
// entre si, mas não compartilham arquivo JS).
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var CULTURA_TODAS = '__todas__';

  function parseSafraYear(safraLabel) {
    var year = parseInt(String(safraLabel).split('/')[0], 10);
    return isNaN(year) ? 0 : year;
  }

  function formatHa(valor) {
    var num = Number(valor) || 0;
    var fixed = num % 1 === 0 ? num.toFixed(0) : String(num).replace('.', ',');
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ha';
  }

  function formatQuantidade(valor, unidade) {
    var num = Number(valor) || 0;
    var fixed = num % 1 === 0 ? num.toFixed(0) : String(num.toFixed(1)).replace('.', ',');
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ' + unidade;
  }

  function formatBRL(valor) {
    return 'R$ ' + (Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatBRLPorUnidade(valor, unidade) {
    return formatBRL(valor) + '/' + unidade;
  }

  function formatDecimal(valor, casas) {
    return (Number(valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  }

  // ── Culturas realmente presentes nos dados de uma Safra (talhões com
  //    cultura ativa NESSA safra + registros do Caderno com essa safra) —
  //    mesmo espírito do dropdown dependente Fazenda→Talhão já usado no
  //    Caderno de Campo: recalculado a cada troca de Safra. ────────────────
  function culturasNaSafra(safraLabel) {
    var set = {};
    (window.NiveloFazendas ? window.NiveloFazendas.list() : []).forEach(function (fazenda) {
      (fazenda.talhoes || []).forEach(function (talhao) {
        if (talhao.safra === safraLabel && talhao.cultura) set[talhao.cultura] = true;
      });
    });
    (window.NiveloCadernoV2 ? window.NiveloCadernoV2.list() : []).forEach(function (registro) {
      if (registro.safra === safraLabel && registro.cultura) set[registro.cultura] = true;
    });
    return Object.keys(set).sort();
  }

  // ── Área de uma fazenda que bate com Safra+Cultura: soma dos talhões cuja
  //    `talhao.safra` bate com a safra filtrada e (Cultura==="Todas" OU
  //    talhao.cultura bate) — talhão sem cultura (null) nunca conta. ───────
  function areaFazenda(fazenda, safraLabel, cultura) {
    var total = 0;
    (fazenda.talhoes || []).forEach(function (talhao) {
      if (talhao.safra !== safraLabel || !talhao.cultura) return;
      if (cultura !== CULTURA_TODAS && talhao.cultura !== cultura) return;
      total += Number(talhao.areaHa) || 0;
    });
    return total;
  }

  // ── Registros do Caderno de uma fazenda que batem com Safra+Cultura. ────
  function registrosFazenda(fazendaId, safraLabel, cultura) {
    return (window.NiveloCadernoV2 ? window.NiveloCadernoV2.listByFazenda(fazendaId) : []).filter(function (registro) {
      if (registro.safra !== safraLabel) return false;
      if (cultura !== CULTURA_TODAS && registro.cultura !== cultura) return false;
      return true;
    });
  }

  // ── Custo total: soma de `custoCalculado` (Aplicação de insumo) +
  //    `valor` (Despesa manual) — os dois representam gasto real da
  //    operação, mesma decisão já documentada em
  //    fazenda-detalhe-caderno-v2.js. ────────────────────────────────────
  function custoTotal(registros) {
    var total = 0;
    registros.forEach(function (r) {
      if (r.tipo === 'despesa-manual') total += Number(r.valor) || 0;
      if (r.tipo === 'aplicacao-insumo') total += Number(r.custoCalculado) || 0;
    });
    return total;
  }

  // ── Produção: soma de `quantidade` de Colheita, agrupada por unidade
  //    (nunca soma sacas com litros/kg como se fossem a mesma coisa) —
  //    mesmo algoritmo já usado no card "Produção registrada"/"Colheita" de
  //    caderno-de-campo-v2.js/fazenda-detalhe-caderno-v2.js. ──────────────
  function producaoPorUnidade(registros) {
    var porUnidade = {};
    registros.forEach(function (r) {
      if (r.tipo !== 'colheita') return;
      porUnidade[r.unidade] = (porUnidade[r.unidade] || 0) + (Number(r.quantidade) || 0);
    });
    return porUnidade;
  }

  // ── Unidade dominante: a de maior volume — usada sempre que um valor
  //    (Custo médio/Safra, Produtividade, Custo/Saca) precisa dividir por
  //    "a Produção", mas há mais de uma unidade envolvida. Documentado no
  //    pedido/CLAUDE.md: dividir pela unidade de maior volume evita somar
  //    unidades incompatíveis numa única divisão inválida. ──────────────
  function unidadesOrdenadas(porUnidade) {
    return Object.keys(porUnidade).sort(function (a, b) { return porUnidade[b] - porUnidade[a]; });
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
    function selectOption(optionEl, silent) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (!silent && root.__onChange) root.__onChange(optionEl.dataset.value);
    }

    trigger.addEventListener('click', function () { root.classList.contains('open') ? close() : open(); });
    menu.addEventListener('click', function (e) { var o = e.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    return {
      onChange: function (fn) { root.__onChange = fn; },
      // `silent`: usado ao repopular o menu programaticamente (ex. opções
      // de Cultura recalculadas a cada troca de Safra) — reaplicar o
      // valor selecionado NUNCA deve disparar onChange de novo, senão
      // rebuildCulturaOptions() (chamada de dentro de render()) entraria
      // em loop infinito (render → rebuildCulturaOptions → selectValue →
      // onChange → render → ...).
      selectValue: function (value, silent) {
        var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
        if (optionEl) selectOption(optionEl, silent);
      }
    };
  }

  // ---------- Tooltip de ação ("Ver talhões", mesmo padrão .actionBtn+.tip
  // já usado em fazenda-detalhe-caderno-v2.js/produtos.js) ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) {
      document.body.appendChild(tip);
      btn.__tip = tip;
    }
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
  function hideActionTooltip(btn) {
    var tip = btn.__tip;
    if (tip) tip.style.opacity = '0';
  }
  document.addEventListener('mouseover', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('mouseout', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) hideActionTooltip(btn);
  });
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action="ver-talhoes"]');
    if (!btn) return;
    window.location.href = 'fazenda-detalhe-caderno-v2.html#id=' + encodeURIComponent(btn.dataset.fazenda);
  });

  // ── Filtro de Safra ──────────────────────────────────────────────────
  var safraDropdownRoot = document.getElementById('relsafra-safra-dropdown');
  var safraMenu = safraDropdownRoot.querySelector('[data-dropdown-menu]');
  var safraDropdown = initDropdown(safraDropdownRoot);

  var safras = (window.NiveloSafras ? window.NiveloSafras.list() : []).slice();
  safras.sort(function (a, b) { return parseSafraYear(a) - parseSafraYear(b); });

  safraMenu.innerHTML = safras.map(function (safraLabel) {
    return '<div class="option" data-value="' + safraLabel + '">Safra ' + safraLabel + '</div>';
  }).join('');

  var safraAtual = safras.length ? safras[safras.length - 1] : null;

  // ── Filtro de Cultura (dependente de Safra) ─────────────────────────
  var culturaDropdownRoot = document.getElementById('relsafra-cultura-dropdown');
  var culturaMenu = culturaDropdownRoot.querySelector('[data-dropdown-menu]');
  var culturaDropdown = initDropdown(culturaDropdownRoot);
  var culturaAtual = CULTURA_TODAS;

  function rebuildCulturaOptions() {
    var opcoes = safraAtual ? culturasNaSafra(safraAtual) : [];
    var html = '<div class="option" data-value="' + CULTURA_TODAS + '">Todas</div>';
    html += opcoes.map(function (c) { return '<div class="option" data-value="' + c + '">' + c + '</div>'; }).join('');
    culturaMenu.innerHTML = html;
    // Se a cultura selecionada não existe mais nesta safra, volta pra "Todas".
    if (culturaAtual !== CULTURA_TODAS && opcoes.indexOf(culturaAtual) === -1) {
      culturaAtual = CULTURA_TODAS;
    }
    culturaDropdown.selectValue(culturaAtual, true);
  }

  var tbodyEl = document.getElementById('relsafra-tbody');
  var mobileListEl = document.getElementById('relsafra-mobile-list');
  var tableWrapEl = document.getElementById('relsafra-table-wrap');
  var emptyEl = document.getElementById('relsafra-empty');
  var safraLabelEl = document.getElementById('relsafra-table-safra-label');
  var resultadoEl = document.getElementById('relsafra-resultado');
  var resumoFiltrosEl = document.getElementById('relsafra-resumo-filtros');

  var kpiAreaEl = document.getElementById('relsafra-kpi-area');
  var kpiCustoEl = document.getElementById('relsafra-kpi-custo');
  var kpiProducaoEl = document.getElementById('relsafra-kpi-producao');
  var kpiProducaoBodyEl = document.getElementById('relsafra-kpi-producao-body');
  var kpiCustoMedioEl = document.getElementById('relsafra-kpi-custo-medio');

  var currentRows = [];

  // ── Constrói 1 linha por fazenda com pelo menos 1 registro batendo com
  //    o filtro atual. Fazendas sem nenhum registro na safra/cultura
  //    filtrada não aparecem. ───────────────────────────────────────────
  function buildRows(safraLabel, cultura) {
    var fazendas = window.NiveloFazendas ? window.NiveloFazendas.list() : [];
    var rows = [];

    fazendas.forEach(function (fazenda) {
      var registros = registrosFazenda(fazenda.id, safraLabel, cultura);
      if (!registros.length) return;

      var area = areaFazenda(fazenda, safraLabel, cultura);
      var custo = custoTotal(registros);
      var porUnidade = producaoPorUnidade(registros);
      var unidades = unidadesOrdenadas(porUnidade);
      var unidadePrincipal = unidades.length ? unidades[0] : null;
      var producaoValor = unidadePrincipal ? porUnidade[unidadePrincipal] : 0;

      rows.push({
        fazendaId: fazenda.id,
        fazendaNome: fazenda.nome,
        area: area,
        custo: custo,
        porUnidade: porUnidade,
        unidades: unidades,
        unidadePrincipal: unidadePrincipal,
        producaoValor: producaoValor,
        produtividade: (area > 0 && unidadePrincipal) ? (producaoValor / area) : null,
        custoHa: area > 0 ? (custo / area) : null,
        // "Custo / Saca": apesar do nome literal da coluna (nem toda cultura
        // colhe em sacas — ex. cana-de-açúcar é em kg), o valor é sempre
        // Custo total ÷ Produção NA UNIDADE REAL daquela fazenda, rotulado
        // com a sigla real (ex. "R$ 48,20/kg"). Só o CABEÇALHO da coluna
        // usa literalmente "Custo / Saca" (nome pedido explicitamente).
        custoPorUnidade: (producaoValor > 0 && unidadePrincipal) ? (custo / producaoValor) : null
      });
    });

    rows.sort(function (a, b) { return a.fazendaNome.localeCompare(b.fazendaNome); });
    return rows;
  }

  function renderKpis(safraLabel, cultura, rows) {
    if (!safraLabel) {
      kpiAreaEl.textContent = '—';
      kpiCustoEl.textContent = '—';
      kpiProducaoEl.textContent = '—';
      kpiCustoMedioEl.textContent = '—';
      kpiProducaoBodyEl.querySelectorAll('.relsafra-kpi-secondary-line').forEach(function (el) { el.remove(); });
      return;
    }

    // Área total: soma da área de TODAS as fazendas (mesma base de
    // `areaFazenda`, só que agregada pra safra inteira, não por fazenda).
    var areaTotal = 0;
    var custoTotalGeral = 0;
    var porUnidadeGeral = {};
    rows.forEach(function (row) {
      areaTotal += row.area;
      custoTotalGeral += row.custo;
      Object.keys(row.porUnidade).forEach(function (u) {
        porUnidadeGeral[u] = (porUnidadeGeral[u] || 0) + row.porUnidade[u];
      });
    });

    kpiAreaEl.textContent = formatHa(areaTotal);
    kpiCustoEl.textContent = formatBRL(custoTotalGeral);

    var unidadesGeral = unidadesOrdenadas(porUnidadeGeral);
    kpiProducaoBodyEl.querySelectorAll('.relsafra-kpi-secondary-line').forEach(function (el) { el.remove(); });
    if (!unidadesGeral.length) {
      kpiProducaoEl.textContent = '—';
      kpiCustoMedioEl.textContent = '—';
    } else {
      var principal = unidadesGeral[0];
      kpiProducaoEl.textContent = formatQuantidade(porUnidadeGeral[principal], principal);
      unidadesGeral.slice(1).forEach(function (u) {
        var line = document.createElement('span');
        line.className = 'relsafra-summary-caption relsafra-kpi-secondary-line';
        line.textContent = '+ ' + formatQuantidade(porUnidadeGeral[u], u);
        kpiProducaoBodyEl.appendChild(line);
      });

      // Custo médio / Safra: Custo total ÷ Produção total — só válido de
      // forma direta quando Produção tem uma única unidade dominante.
      // Quando há mais de uma unidade, usa-se a de MAIOR volume (mesma
      // decisão já documentada em outros relatórios do sistema pra evitar
      // dividir por uma soma inválida entre unidades incompatíveis) — o
      // rótulo do valor sempre cita a unidade usada, pra deixar explícito.
      kpiCustoMedioEl.textContent = porUnidadeGeral[principal] > 0
        ? formatBRLPorUnidade(custoTotalGeral / porUnidadeGeral[principal], principal)
        : '—';
    }
  }

  function buildRowHTML(row) {
    return (
      '<tr class="tr">' +
        '<td class="td">' + row.fazendaNome + '</td>' +
        '<td class="td">' + formatHa(row.area) + '</td>' +
        '<td class="td">' + formatBRL(row.custo) + '</td>' +
        '<td class="td">' + (row.unidadePrincipal ? formatQuantidade(row.producaoValor, row.unidadePrincipal) : '—') + '</td>' +
        '<td class="td">' + (row.produtividade !== null ? (formatDecimal(row.produtividade, 1) + ' ' + row.unidadePrincipal + '/ha') : '—') + '</td>' +
        '<td class="td">' + (row.custoHa !== null ? formatBRL(row.custoHa) : '—') + '</td>' +
        '<td class="td">' + (row.custoPorUnidade !== null ? formatBRLPorUnidade(row.custoPorUnidade, row.unidadePrincipal) : '—') + '</td>' +
        '<td class="td">' + buildAcoesHTML(row.fazendaId) + '</td>' +
      '</tr>'
    );
  }

  function buildAcoesHTML(fazendaId) {
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="ver-talhoes" data-fazenda="' + fazendaId + '" aria-label="Ver talhões">' +
          '<i data-lucide="layout-grid" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Ver talhões</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildCardHTML(row) {
    return (
      '<div class="card relsafra-mobile-card">' +
        '<div class="relsafra-mobile-card-header">' +
          '<strong class="relsafra-mobile-card-name text-body-s">' + row.fazendaNome + '</strong>' +
          buildAcoesHTML(row.fazendaId) +
        '</div>' +
        '<dl class="relsafra-mobile-card-fields text-body-s">' +
          '<div><dt>Área</dt><dd>' + formatHa(row.area) + '</dd></div>' +
          '<div><dt>Custo total</dt><dd>' + formatBRL(row.custo) + '</dd></div>' +
          '<div><dt>Produção</dt><dd>' + (row.unidadePrincipal ? formatQuantidade(row.producaoValor, row.unidadePrincipal) : '—') + '</dd></div>' +
          '<div><dt>Produtividade</dt><dd>' + (row.produtividade !== null ? (formatDecimal(row.produtividade, 1) + ' ' + row.unidadePrincipal + '/ha') : '—') + '</dd></div>' +
          '<div><dt>Custo / Ha</dt><dd>' + (row.custoHa !== null ? formatBRL(row.custoHa) : '—') + '</dd></div>' +
          '<div><dt>Custo / Saca</dt><dd>' + (row.custoPorUnidade !== null ? formatBRLPorUnidade(row.custoPorUnidade, row.unidadePrincipal) : '—') + '</dd></div>' +
        '</dl>' +
      '</div>'
    );
  }

  // ── "Gerar relatório": só (re)calcula e mostra o resultado ao clicar,
  //    respeitando o estado dos filtros (Safra/Cultura) selecionados no
  //    momento do clique — mesmo padrão de interação de Balancete/LCDPR/DRE
  //    (nenhum recálculo automático ao só trocar o valor de um filtro). ────
  function gerarRelatorio() {
    resultadoEl.hidden = false;

    if (!safraAtual) {
      tbodyEl.innerHTML = '';
      mobileListEl.innerHTML = '';
      tableWrapEl.hidden = true;
      mobileListEl.hidden = true;
      emptyEl.hidden = false;
      safraLabelEl.textContent = '';
      resumoFiltrosEl.textContent = 'Selecione uma safra para gerar o relatório.';
      renderKpis(null, null, []);
      setFiltrosExpanded(false);
      return;
    }

    safraLabelEl.textContent = safraAtual;
    var culturaLabel = culturaAtual === CULTURA_TODAS ? 'Todas' : culturaAtual;
    resumoFiltrosEl.textContent = 'Safra: ' + safraAtual + ' · Cultura: ' + culturaLabel;

    currentRows = buildRows(safraAtual, culturaAtual);
    renderKpis(safraAtual, culturaAtual, currentRows);

    if (!currentRows.length) {
      tbodyEl.innerHTML = '';
      mobileListEl.innerHTML = '';
      tableWrapEl.hidden = true;
      mobileListEl.hidden = true;
      emptyEl.hidden = false;
    } else {
      tableWrapEl.hidden = false;
      mobileListEl.hidden = false;
      emptyEl.hidden = true;

      tbodyEl.innerHTML = currentRows.map(buildRowHTML).join('');
      mobileListEl.innerHTML = currentRows.map(buildCardHTML).join('');
      if (window.lucide) lucide.createIcons();
    }

    setFiltrosExpanded(false);
  }

  safraDropdown.onChange(function (value) {
    safraAtual = value;
    culturaAtual = CULTURA_TODAS;
    rebuildCulturaOptions();
  });
  culturaDropdown.onChange(function (value) {
    culturaAtual = value;
  });

  if (safraAtual) safraDropdown.selectValue(safraAtual, true);
  rebuildCulturaOptions();

  // ── Filtros: accordion (recolhe sozinho após gerar, expande de novo no
  //    clique) — mesmo padrão exato de Balancete/LCDPR/DRE. ────────────────
  var filtrosHeader = document.getElementById('relsafra-filtros-header');
  var filtrosToggle = document.getElementById('relsafra-filtros-toggle');
  var filtrosContent = document.getElementById('relsafra-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('relsafra-gerar-btn').addEventListener('click', gerarRelatorio);

  // ── Exportar para Excel: SheetJS (window.XLSX), mesma técnica já usada
  //    em LCDPR/na versão anterior desta tela — não um flash-disable. ─────
  document.getElementById('relsafra-export-btn').addEventListener('click', function () {
    if (!window.XLSX) return;
    if (!safraAtual) return;

    var culturaLabel = culturaAtual === CULTURA_TODAS ? 'Todas' : culturaAtual;
    var rows = [
      ['Resultado de Safra ' + safraAtual],
      ['Cultura: ' + culturaLabel],
      [],
      ['Fazenda', 'Área (ha)', 'Custo total', 'Produção', 'Produtividade', 'Custo / Ha', 'Custo / Saca']
    ];
    currentRows.forEach(function (row) {
      rows.push([
        row.fazendaNome,
        row.area,
        row.custo,
        row.unidadePrincipal ? (row.producaoValor + ' ' + row.unidadePrincipal) : '',
        row.produtividade !== null ? (row.produtividade.toFixed(1) + ' ' + row.unidadePrincipal + '/ha') : '',
        row.custoHa !== null ? row.custoHa : '',
        row.custoPorUnidade !== null ? (row.custoPorUnidade.toFixed(2) + '/' + row.unidadePrincipal) : ''
      ]);
    });

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultado de Safra');
    // '/' não é válido em nome de arquivo (ex. "2026/27") — trocado por hífen.
    XLSX.writeFile(wb, 'Resultado-de-Safra-' + safraAtual.replace('/', '-') + '.xlsx');
  });

  if (window.lucide) lucide.createIcons();
})();
