(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var gridEl = document.getElementById('caderno-grid');
  var emptyGlobalEl = document.getElementById('caderno-empty-global');

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

  // Fazendas criadas pelo wizard não coletam Cidade/Estado — mesmo guard já
  // usado em fazendas.js/fazenda-detalhe-cadastro.js.
  function formatLocation(fazenda) {
    if (fazenda.cidade && fazenda.estado) return fazenda.cidade + ', ' + fazenda.estado;
    return fazenda.cidade || fazenda.estado || '';
  }

  // ---------- Agregação de Produtividade/Despesa (unit-aware) ----------
  // Nunca soma quantidades de unidades diferentes entre si (mesmo princípio
  // já usado em Estoque > Compras) — agrupa por unidade, mostra a maior
  // como destaque e o restante como linhas secundárias.
  function buildKpis(registros, areaHa) {
    var porUnidade = {};
    var custoTotal = 0;

    registros.forEach(function (r) {
      if (r.tipo === 'colheita') {
        porUnidade[r.unidade] = (porUnidade[r.unidade] || 0) + r.quantidade;
      }
      if (r.tipo === 'despesa-manual') custoTotal += (r.valor || 0);
      if (r.tipo === 'aplicacao-insumo') custoTotal += (r.custoCalculado || 0);
    });

    var unidades = Object.keys(porUnidade).sort(function (a, b) { return porUnidade[b] - porUnidade[a]; });

    return {
      unidades: unidades,
      porUnidade: porUnidade,
      custoTotal: custoTotal,
      custoMedioHa: areaHa > 0 ? custoTotal / areaHa : 0
    };
  }

  function buildProdutividadeHTML(kpis, areaHa) {
    if (!kpis.unidades.length) {
      return '<span class="caderno-kpi-value">—</span>';
    }
    var principal = kpis.unidades[0];
    var html = '<span class="caderno-kpi-value">' + formatNumero(kpis.porUnidade[principal]) + ' ' + principal + '</span>';
    kpis.unidades.slice(1).forEach(function (u) {
      html += '<span class="caderno-kpi-value is-secondary-line">+ ' + formatNumero(kpis.porUnidade[u]) + ' ' + u + '</span>';
    });
    return html;
  }

  function buildProdutividadeMediaHTML(kpis, areaHa) {
    if (!kpis.unidades.length || !(areaHa > 0)) return '<span class="caderno-kpi-value">—</span>';
    var principal = kpis.unidades[0];
    var media = kpis.porUnidade[principal] / areaHa;
    return '<span class="caderno-kpi-value">' + formatNumero(media) + ' ' + principal + '/ha</span>';
  }

  function buildCardHTML(fazenda) {
    var location = formatLocation(fazenda);
    var registros = window.NiveloCadernoV2.listByFazenda(fazenda.id);
    var kpis = buildKpis(registros, fazenda.areaHa);
    var ultima = registros.length ? registros.slice().sort(function (a, b) { return b.dataHora.localeCompare(a.dataHora); })[0] : null;

    return (
      '<div class="card caderno-fazenda-card" data-fazenda-id="' + fazenda.id + '" data-action="ver-caderno" tabindex="0" role="button" aria-label="Ver caderno de ' + fazenda.nome + '">' +
        '<div class="cardHeader">' +
          '<h2 class="title">' + fazenda.nome + '</h2>' +
        '</div>' +
        '<div class="caderno-fazenda-card-body">' +
          (location ? '<div class="caderno-fazenda-card-location text-body-s"><i data-lucide="map-pin" width="16" height="16"></i>' + location + '</div>' : '') +
          '<dl class="caderno-fazenda-card-stats text-body-s">' +
            '<div><dt class="text-12-regular">Área total</dt><dd>' + fazenda.areaHa + ' ha</dd></div>' +
            '<div><dt class="text-12-regular">Talhões</dt><dd>' + fazenda.talhoes.length + ' talhões</dd></div>' +
          '</dl>' +
          '<div class="caderno-fazenda-card-kpis">' +
            '<div class="caderno-kpi"><span class="caderno-kpi-label">Colheita</span>' + buildProdutividadeHTML(kpis) + '</div>' +
            '<div class="caderno-kpi"><span class="caderno-kpi-label">Produtividade média</span>' + buildProdutividadeMediaHTML(kpis, fazenda.areaHa) + '</div>' +
            '<div class="caderno-kpi"><span class="caderno-kpi-label">Despesa acumulada</span><span class="caderno-kpi-value">' + formatBRL(kpis.custoTotal) + '</span></div>' +
            '<div class="caderno-kpi"><span class="caderno-kpi-label">Despesa média/ha</span><span class="caderno-kpi-value">' + formatBRL(kpis.custoMedioHa) + '</span></div>' +
          '</div>' +
          '<span class="caderno-fazenda-card-updated text-body-xs">' +
            (ultima ? 'Última anotação: ' + formatDataHora(ultima.dataHora) : 'Nenhuma anotação registrada ainda') +
          '</span>' +
        '</div>' +
        '<div class="caderno-fazenda-card-footer">' +
          '<button type="button" class="caderno-fazenda-card-link text-body-s" data-action="ver-caderno">Ver caderno <i data-lucide="arrow-right" width="16" height="16"></i></button>' +
        '</div>' +
      '</div>'
    );
  }

  function render() {
    var fazendas = window.NiveloFazendas.list();
    var isEmptyDemo = /state=empty/.test(location.hash);
    var showEmpty = isEmptyDemo || fazendas.length === 0;

    gridEl.hidden = showEmpty;
    emptyGlobalEl.hidden = !showEmpty;

    if (showEmpty) return;

    gridEl.innerHTML = fazendas.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // Clique no card / "Ver caderno" navega pra Detalhe da fazenda V2.
  gridEl.addEventListener('click', function (event) {
    var target = event.target.closest('[data-action="ver-caderno"]');
    if (!target) return;
    var card = target.closest('[data-fazenda-id]');
    if (!card) return;
    window.location.href = 'fazenda-detalhe-caderno-v2.html#id=' + card.dataset.fazendaId;
  });

  document.getElementById('caderno-empty-global-btn').addEventListener('click', function () {
    window.location.href = 'nova-fazenda.html';
  });

  // Toast de sucesso (mesmo padrão Feedback-como-toast).
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success caderno-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';

    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacaov2.success');
  if (novaAnotacaoMessage) {
    sessionStorage.removeItem('nivelo.novaanotacaov2.success');
    showSuccessToast(novaAnotacaoMessage);
  }

  render();
})();
