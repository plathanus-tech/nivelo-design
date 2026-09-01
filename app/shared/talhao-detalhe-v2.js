(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_TALHAO = {
    'em-producao': { status: 'success', label: 'Em produção' },
    'disponivel': { status: 'info', label: 'Disponível' },
    'em-pousio': { status: 'warning', label: 'Em pouso' }
  };

  var TIPO_REGISTRO = {
    'anotacao': { icon: 'file-text', label: 'Anotação' },
    'aplicacao-insumo': { icon: 'flask-conical', label: 'Aplicação de insumo' },
    'despesa-manual': { icon: 'arrow-up-circle', label: 'Despesa manual' },
    'colheita': { icon: 'wheat', label: 'Colheita' }
  };

  var currentFazenda = null;
  var currentTalhao = null;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDataHora(iso) {
    var d = new Date(iso);
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' às ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function formatBRL(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatNumero(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }
  // Área em hectare no mesmo estilo pt-BR (vírgula decimal) dos demais
  // números desta tela (formatNumero acima) — talhões do seed têm área
  // inteira, mas a formatação já cobre frações (ex. "42,5 ha") sem
  // hardcodar 0 casas decimais.
  function formatAreaHa(valor) {
    return formatNumero(valor) + ' ha';
  }

  // ---------- Histórico de Safras: cálculo de Período (meses+dias) ----------
  // Data de referência fixa do protótipo (mesma convenção de TODAY já usada
  // em contas-pagar-data.js/dre.js/etc, reexportada por fazendas-data.js)
  // pra calcular o Período da safra ainda "Em produção" (dataFim = hoje).
  var TODAY = (window.NiveloFazendas && window.NiveloFazendas.TODAY) || '2026-07-31';

  function parseISODate(iso) {
    var parts = iso.split('-');
    return { y: parseInt(parts[0], 10), m: parseInt(parts[1], 10), d: parseInt(parts[2], 10) };
  }
  // Diferença em meses+dias entre duas datas ISO, formatada "Xm Yd" (mesmo
  // espírito abreviado do resto do sistema, sem travessão). Usada tanto pra
  // safras encerradas (dataInicio -> dataFim) quanto pra safra em produção
  // (dataInicio -> TODAY).
  function formatPeriodo(dataInicioISO, dataFimISO) {
    if (!dataInicioISO || !dataFimISO) return '—';
    var start = parseISODate(dataInicioISO);
    var end = parseISODate(dataFimISO);
    var months = (end.y - start.y) * 12 + (end.m - start.m);
    var days = end.d - start.d;
    if (days < 0) {
      months -= 1;
      var prevMonth = end.m - 1, prevYear = end.y;
      if (prevMonth === 0) { prevMonth = 12; prevYear -= 1; }
      days += new Date(prevYear, prevMonth, 0).getDate();
    }
    if (months < 0) months = 0;
    return months + 'm ' + days + 'd';
  }

  // Combina o histórico encerrado (talhao.historicoSafras) com a safra
  // corrente (talhao.cultura/safra/safraInicio) numa lista única, mais
  // recente primeiro. A safra corrente NÃO é duplicada em historicoSafras
  // (fonte única de verdade continua sendo os campos flat do talhão,
  // ver decisão documentada em app/CLAUDE.md) — é sintetizada aqui na hora
  // de renderizar, como o último registro "Em produção".
  function buildHistoricoSafras(talhao) {
    var linhas = (talhao.historicoSafras || []).map(function (h) {
      return { safra: h.safra, cultura: h.cultura, dataInicio: h.dataInicio, dataFim: h.dataFim, status: 'Encerrada' };
    });
    if (talhao.cultura) {
      linhas.push({
        safra: talhao.safra,
        cultura: talhao.cultura,
        dataInicio: talhao.safraInicio,
        dataFim: TODAY,
        status: 'Em produção'
      });
    }
    // Mais recente primeiro: pela dataInicio (fallback dataFim quando não
    // houver, caso de dado legado sem safraInicio).
    return linhas.sort(function (a, b) {
      var da = a.dataInicio || a.dataFim || '';
      var db = b.dataInicio || b.dataFim || '';
      return db.localeCompare(da);
    });
  }

  function renderHeader() {
    var badge = STATUS_TALHAO[currentTalhao.status] || STATUS_TALHAO.disponivel;
    document.getElementById('talhao-detalhe-nome').textContent = currentTalhao.nome;
    var statusEl = document.getElementById('talhao-detalhe-status');
    statusEl.dataset.status = badge.status;
    statusEl.innerHTML = '<span class="badgeDot"></span>' + badge.label;
    document.title = currentTalhao.nome + ' — ' + currentFazenda.nome + ' — Nivelo';

    document.getElementById('talhao-detalhe-back-label').textContent = currentFazenda.nome;
    document.getElementById('talhao-detalhe-back').href = 'fazenda-detalhe-caderno-v2.html#id=' + currentFazenda.id;
    if (window.lucide) lucide.createIcons();
  }

  // Card "Informações do talhão" (acima dos KPIs) — Fazenda/Hectares/Cultura
  // atual/Safra atual. Única fonte dessas 4 informações agora (não duplicam
  // mais no antigo subtítulo do cabeçalho nem nos cards de KPI).
  function renderInfoCard() {
    document.getElementById('talhao-info-fazenda').textContent = currentFazenda.nome;
    document.getElementById('talhao-info-area').textContent = formatAreaHa(currentTalhao.areaHa);
    document.getElementById('talhao-info-cultura').textContent = currentTalhao.cultura || 'Sem cultura';
    document.getElementById('talhao-info-safra').textContent = currentTalhao.safra || '—';
  }

  function renderResumo() {
    var registros = window.NiveloCadernoV2.listByTalhao(currentFazenda.id, currentTalhao.id);
    var custo = 0, anotacoes = 0, porUnidade = {};
    registros.forEach(function (r) {
      if (r.tipo === 'despesa-manual') custo += (r.valor || 0);
      if (r.tipo === 'aplicacao-insumo') custo += (r.custoCalculado || 0);
      if (r.tipo === 'anotacao') anotacoes += 1;
      if (r.tipo === 'colheita') porUnidade[r.unidade] = (porUnidade[r.unidade] || 0) + r.quantidade;
    });
    document.getElementById('resumo-custo').textContent = formatBRL(custo);
    document.getElementById('resumo-anotacoes').textContent = anotacoes + (anotacoes === 1 ? ' registro' : ' registros');

    var unidades = Object.keys(porUnidade).sort(function (a, b) { return porUnidade[b] - porUnidade[a]; });
    var producaoEl = document.getElementById('resumo-producao');
    if (!unidades.length) {
      producaoEl.innerHTML = '<span class="talhao-resumo-value">—</span>';
    } else {
      var html = '<span class="talhao-resumo-value">' + formatNumero(porUnidade[unidades[0]]) + ' ' + unidades[0] + '</span>';
      unidades.slice(1).forEach(function (u) {
        html += '<span class="talhao-resumo-value is-secondary-line">+ ' + formatNumero(porUnidade[u]) + ' ' + u + '</span>';
      });
      producaoEl.innerHTML = html;
    }

    // ---------- Produtividade / Custo por hectare / Custo por unidade ----------
    // Unit-aware igual ao restante do V2 (Dashboard, Tela 1, Tela 2 do
    // Caderno de Campo): nunca soma unidades diferentes, sempre usa a
    // unidade PRINCIPAL (maior volume) desta lista, nunca um "sc" fixo.
    var principal = unidades[0];
    var totalPrincipal = principal ? porUnidade[principal] : 0;
    var areaHa = currentTalhao.areaHa || 0;

    var produtividadeEl = document.getElementById('resumo-produtividade');
    if (!principal || areaHa <= 0) {
      produtividadeEl.innerHTML = '<span class="talhao-resumo-value">—</span>';
    } else {
      produtividadeEl.innerHTML = '<span class="talhao-resumo-value">' + formatNumero(totalPrincipal / areaHa) + ' ' + principal + '/ha</span>';
    }

    document.getElementById('resumo-custo-ha').textContent = areaHa > 0 ? formatBRL(custo / areaHa) : '—';

    // Label dinâmico ("Custo / sc" / "Custo / kg" / "Custo / L" conforme a
    // unidade real do produto colhido) — mesmo princípio de sigla dinâmica
    // já estabelecido em nova-anotacao-v2.js (UNIDADE_SIGLA), sem "sc"
    // hardcoded fora deste único ponto. Sem produção registrada, cai no
    // rótulo padrão "sc" (unidade mais comum do catálogo de Grãos), valor "—".
    var unidadeCustoLabel = principal || 'sc';
    document.getElementById('resumo-custo-un-label').textContent = 'Custo / ' + unidadeCustoLabel;
    document.getElementById('resumo-custo-un').textContent = (principal && totalPrincipal > 0)
      ? formatBRL(custo / totalPrincipal) + '/' + principal
      : '—';

    return registros;
  }

  function buildValorText(r) {
    if (r.tipo === 'colheita') return formatNumero(r.quantidade) + ' ' + r.unidade;
    if (r.tipo === 'despesa-manual') return formatBRL(r.valor || 0);
    if (r.tipo === 'aplicacao-insumo') return formatBRL(r.custoCalculado || 0);
    return '';
  }

  function buildSubtitleText(r) {
    if (r.tipo === 'anotacao') return r.descricao || '';
    if (r.tipo === 'despesa-manual') {
      var categoria = r.categoriaCodigo && window.NiveloCategoriasFinanceiras
        ? (window.NiveloCategoriasFinanceiras.findByCodigo(r.categoriaCodigo) || {}).descricao
        : null;
      return (categoria || '') + (r.observacao ? ' · ' + r.observacao : '');
    }
    if (r.tipo === 'aplicacao-insumo') return (r.produtoNome || '') + (r.depositoNome ? ' · ' + r.depositoNome : '');
    if (r.tipo === 'colheita') return r.produtoNome || '';
    return '';
  }

  function buildAnotacaoRowHTML(r) {
    var tipo = TIPO_REGISTRO[r.tipo] || TIPO_REGISTRO.anotacao;
    var valorText = buildValorText(r);
    var subtitle = buildSubtitleText(r);
    return (
      '<div class="anotacao-row">' +
        '<span class="anotacao-row-icon" data-tipo="' + r.tipo + '"><i data-lucide="' + tipo.icon + '" width="18" height="18"></i></span>' +
        '<div class="anotacao-row-body">' +
          '<div class="anotacao-row-top">' +
            '<strong class="anotacao-row-tipo text-body-s">' + tipo.label + '</strong>' +
            (valorText ? '<span class="anotacao-row-value text-body-s">' + valorText + '</span>' : '') +
          '</div>' +
          (subtitle ? '<div class="anotacao-row-observacao text-body-s">' + subtitle + '</div>' : '') +
          (r.tipo === 'anotacao' && r.descricao ? '<div class="anotacao-row-observacao text-body-s">' + r.descricao + '</div>' : '') +
          '<div class="anotacao-row-meta text-body-xs">' + formatDataHora(r.dataHora) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderAnotacoes(registros) {
    var ordenadas = registros.slice().sort(function (a, b) { return b.dataHora.localeCompare(a.dataHora); });
    var listEl = document.getElementById('anotacoes-list');
    var emptyEl = document.getElementById('anotacoes-empty');
    var showEmpty = ordenadas.length === 0;

    listEl.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      listEl.innerHTML = ordenadas.map(buildAnotacaoRowHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  var STATUS_SAFRA_BADGE = {
    'Em produção': 'success',
    'Encerrada': 'info'
  };

  function buildHistoricoRowHTML(h) {
    var status = STATUS_SAFRA_BADGE[h.status] || 'info';
    return (
      '<tr class="tr">' +
        '<td class="td">' + (h.safra || '—') + '</td>' +
        '<td class="td">' + (h.cultura || '—') + '</td>' +
        '<td class="td">' + formatPeriodo(h.dataInicio, h.dataFim) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + status + '"><span class="badgeDot"></span>' + h.status + '</span></td>' +
      '</tr>'
    );
  }

  function buildHistoricoCardHTML(h) {
    var status = STATUS_SAFRA_BADGE[h.status] || 'info';
    return (
      '<div class="card historico-safra-mobile-card">' +
        '<div class="historico-safra-mobile-card-header">' +
          '<strong class="historico-safra-mobile-card-name text-body-s">' + (h.safra || '—') + '</strong>' +
          '<span class="badge" data-status="' + status + '"><span class="badgeDot"></span>' + h.status + '</span>' +
        '</div>' +
        '<dl class="historico-safra-mobile-card-fields text-body-s">' +
          '<div><dt>Cultura</dt><dd>' + (h.cultura || '—') + '</dd></div>' +
          '<div><dt>Período</dt><dd>' + formatPeriodo(h.dataInicio, h.dataFim) + '</dd></div>' +
        '</dl>' +
      '</div>'
    );
  }

  function renderHistoricoSafras() {
    var linhas = buildHistoricoSafras(currentTalhao);
    var tbody = document.getElementById('historico-safras-tbody');
    var mobileList = document.getElementById('historico-safras-mobile-list');
    var tableWrap = document.getElementById('historico-safras-table-wrap');
    var emptyEl = document.getElementById('historico-safras-empty');
    var showEmpty = linhas.length === 0;

    tableWrap.hidden = showEmpty;
    mobileList.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      tbody.innerHTML = linhas.map(buildHistoricoRowHTML).join('');
      mobileList.innerHTML = linhas.map(buildHistoricoCardHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  function renderAll() {
    renderHeader();
    renderInfoCard();
    renderAnotacoes(renderResumo());
    renderHistoricoSafras();
  }

  document.getElementById('nova-anotacao-talhao-btn').addEventListener('click', function () {
    window.location.href = 'nova-anotacao-v2.html?fazenda=' + encodeURIComponent(currentFazenda.id) + '&talhao=' + encodeURIComponent(currentTalhao.id);
  });

  // ---------- Modal: Encerrar safra ----------
  var encerrarOverlay = document.getElementById('encerrar-safra-overlay');
  document.getElementById('encerrar-safra-btn').addEventListener('click', function () { encerrarOverlay.hidden = false; });
  function closeEncerrarSafraDialog() { encerrarOverlay.hidden = true; }
  document.getElementById('encerrar-safra-close').addEventListener('click', closeEncerrarSafraDialog);
  document.getElementById('encerrar-safra-cancel').addEventListener('click', closeEncerrarSafraDialog);
  encerrarOverlay.addEventListener('click', function (event) {
    if (event.target === encerrarOverlay) closeEncerrarSafraDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !encerrarOverlay.hidden) closeEncerrarSafraDialog();
  });
  document.getElementById('encerrar-safra-confirm').addEventListener('click', function () {
    // Mutação real (limpa cultura/safra + fecha o registro em
    // historicoSafras) centralizada em fazendas-data.js, compartilhada com
    // fazenda-detalhe-caderno-v2.js — ver `encerrarSafraTalhao`.
    window.NiveloFazendas.encerrarSafraTalhao(currentFazenda.id, currentTalhao.id);
    closeEncerrarSafraDialog();
    renderAll();
    showSuccessToast('Safra encerrada com sucesso.');
  });

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success talhao-detalhe-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  // ---------- Boot ----------
  function boot() {
    var fazendaMatch = location.hash.match(/fazenda=([\w-]+)/);
    var talhaoMatch = location.hash.match(/talhao=([\w-]+)/);
    var fazendaId = fazendaMatch ? fazendaMatch[1] : null;
    var talhaoId = talhaoMatch ? talhaoMatch[1] : null;

    var fazenda = fazendaId ? window.NiveloFazendas.findById(fazendaId) : null;
    var talhao = fazenda && talhaoId ? fazenda.talhoes.filter(function (t) { return t.id === talhaoId; })[0] : null;

    if (!fazenda || !talhao) {
      document.getElementById('talhao-detalhe-not-found').hidden = false;
      document.getElementById('talhao-detalhe-content').hidden = true;
      return;
    }

    currentFazenda = fazenda;
    currentTalhao = talhao;
    document.getElementById('talhao-detalhe-not-found').hidden = true;
    document.getElementById('talhao-detalhe-content').hidden = false;
    renderAll();

    var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacaov2.success');
    if (novaAnotacaoMessage) {
      sessionStorage.removeItem('nivelo.novaanotacaov2.success');
      showSuccessToast(novaAnotacaoMessage);
    }
  }

  boot();
})();
