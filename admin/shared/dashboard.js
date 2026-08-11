/*
 * Dashboard (Backoffice > Dashboard) — primeira tela do sidebar. Só leitura/navegação: nenhum
 * dado é criado ou alterado aqui, só agregações calculadas em cima de `window.NiveloAssinantes`,
 * `window.NiveloPagamentos` e `window.NiveloCupons` (mesmas fontes de verdade já usadas em
 * Assinantes/Histórico de Pagamentos/Cupons e Afiliados — nenhum dado fictício).
 * Gráficos: mesma técnica de SVG puro já usada em `cupom-detalhe.js` (não existe lib de chart
 * no projeto).
 */
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var A = window.NiveloAssinantes;
  var P = window.NiveloPagamentos;
  var C = window.NiveloCupons;
  var TODAY = A.TODAY;

  function formatBRL(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }

  var MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  function mesLabel(chaveAnoMes) {
    var partes = chaveAnoMes.split('-');
    return MONTH_LABELS[Number(partes[1]) - 1] + '/' + partes[0].slice(2);
  }
  function nomeMesAtual() {
    return MONTH_LABELS[Number(TODAY.slice(5, 7)) - 1] + ' de ' + TODAY.slice(0, 4);
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  var assinantes = A.list();
  var pagamentos = P.list();
  var mesAtual = TODAY.slice(0, 7);
  var inicioMesAtual = mesAtual + '-01';

  // ---------- 1. Visão geral ----------
  var novosClientes = assinantes.filter(function (a) {
    return a.dataCadastro && a.dataCadastro.slice(0, 7) === mesAtual;
  }).length;

  function diasDesdeUltimoAcesso(a) {
    if (!a.ultimoAcesso) return null;
    return Math.abs(A.diffDias(TODAY, a.ultimoAcesso.slice(0, 10)));
  }

  var clientesRecentes = assinantes.filter(function (a) {
    var dias = diasDesdeUltimoAcesso(a);
    return dias !== null && dias <= 14;
  }).length;

  var semAcessoRecente = assinantes.filter(function (a) {
    var dias = diasDesdeUltimoAcesso(a);
    return dias === null || dias > 14;
  }).length;

  var emTeste = assinantes.filter(function (a) { return a.situacao === 'teste'; }).length;

  setText('dash-kpi-novos', novosClientes);
  setText('dash-kpi-recentes', clientesRecentes);
  setText('dash-kpi-sem-acesso', semAcessoRecente);
  setText('dash-kpi-teste', emTeste);

  // ---------- 2. Requer atenção ----------
  var FAIXA_META = {
    ate: { status: 'error' },
    meio: { status: 'orange' },
    longe: { status: 'warning' }
  };

  function buildFaixaListHTML(faixas) {
    return faixas.map(function (faixa) {
      var meta = FAIXA_META[faixa.nivel];
      return (
        '<li class="dash-faixa-row">' +
          '<span class="badge" data-status="' + meta.status + '"><span class="badgeDot"></span>' + faixa.label + '</span>' +
          '<span class="dash-faixa-count">' + faixa.count + (faixa.count === 1 ? ' cliente' : ' clientes') + '</span>' +
          '<a class="btn secondaryGray sm" href="' + faixa.href + '">Ver clientes</a>' +
        '</li>'
      );
    }).join('');
  }

  var assinantesAnuais = assinantes.filter(function (a) { return a.formaContratacao === 'anual' && a.dataVencimento; });
  function diasParaVencimento(a) { return A.diffDias(a.dataVencimento, TODAY); }

  var renovacao7 = assinantesAnuais.filter(function (a) { var d = diasParaVencimento(a); return d >= 0 && d <= 7; }).length;
  var renovacao15 = assinantesAnuais.filter(function (a) { var d = diasParaVencimento(a); return d >= 8 && d <= 15; }).length;
  var renovacao30 = assinantesAnuais.filter(function (a) { var d = diasParaVencimento(a); return d >= 16 && d <= 30; }).length;

  document.getElementById('dash-renovacao-list').innerHTML = buildFaixaListHTML([
    { nivel: 'ate', label: 'Até 7 dias', count: renovacao7, href: 'assinantes.html?vencimento=until7' },
    { nivel: 'meio', label: '8 a 15 dias', count: renovacao15, href: 'assinantes.html?vencimento=8to15' },
    { nivel: 'longe', label: '16 a 30 dias', count: renovacao30, href: 'assinantes.html?vencimento=16to30' }
  ]);

  var assinantesTeste = assinantes.filter(function (a) { return a.situacao === 'teste' && a.trial; });
  var teste3 = assinantesTeste.filter(function (a) { var d = A.diasRestantesTeste(a); return d >= 0 && d <= 3; }).length;
  var teste7 = assinantesTeste.filter(function (a) { var d = A.diasRestantesTeste(a); return d >= 4 && d <= 7; }).length;
  var teste14 = assinantesTeste.filter(function (a) { var d = A.diasRestantesTeste(a); return d >= 8 && d <= 14; }).length;

  document.getElementById('dash-teste-list').innerHTML = buildFaixaListHTML([
    { nivel: 'ate', label: 'Até 3 dias', count: teste3, href: 'assinantes.html?teste=until3' },
    { nivel: 'meio', label: '4 a 7 dias', count: teste7, href: 'assinantes.html?teste=4to7' },
    { nivel: 'longe', label: '8 a 14 dias', count: teste14, href: 'assinantes.html?teste=8to14' }
  ]);

  if (window.lucide) lucide.createIcons();

  // ---------- 3. Acesso dos clientes ----------
  setText('dash-acesso-recentes', clientesRecentes);
  setText('dash-acesso-antigos', semAcessoRecente);
  setText('dash-risco-count', semAcessoRecente);

  (function renderAcessoChart() {
    var container = document.getElementById('dash-acesso-chart');
    var total = clientesRecentes + semAcessoRecente;
    if (total === 0) {
      container.innerHTML = '<p class="dash-chart-empty text-body-s">Sem dados de acesso para exibir.</p>';
      return;
    }
    var recentePct = Math.round((clientesRecentes / total) * 100);
    var antigoPct = 100 - recentePct;
    container.innerHTML =
      '<div class="dash-acesso-bar">' +
        '<span class="dash-acesso-bar-segment is-recente" style="width:' + recentePct + '%"></span>' +
        '<span class="dash-acesso-bar-segment is-antigo" style="width:' + antigoPct + '%"></span>' +
      '</div>' +
      '<div class="dash-acesso-bar-legend text-body-xs">' +
        '<span><span class="dash-acesso-dot is-recente"></span>Clientes recentes · ' + recentePct + '%</span>' +
        '<span><span class="dash-acesso-dot is-antigo"></span>Sem acesso recente · ' + antigoPct + '%</span>' +
      '</div>';
  })();

  // ---------- 4. Financeiro (mês atual) ----------
  setText('dash-financeiro-periodo', 'Período: ' + nomeMesAtual());

  var pagamentosMes = pagamentos.filter(function (p) { return p.data.slice(0, 7) === mesAtual; });
  var totalRecebido = pagamentosMes
    .filter(function (p) { return p.status === 'pago'; })
    .reduce(function (soma, p) { return soma + p.valorFinal; }, 0);
  var realizados = pagamentosMes.filter(function (p) { return p.status === 'pago'; }).length;
  var pendentes = pagamentos.filter(function (p) { return p.status === 'pendente'; }).length;
  var atraso = pagamentos.filter(function (p) { return p.status === 'atraso'; }).length;

  setText('dash-kpi-total-recebido', formatBRL(totalRecebido));
  setText('dash-kpi-realizados', String(realizados));
  setText('dash-kpi-pendentes', String(pendentes));
  setText('dash-kpi-atraso', String(atraso));

  (function renderFinanceiroChart() {
    var container = document.getElementById('dash-financeiro-chart');
    var porMes = {};
    pagamentos.filter(function (p) { return p.status === 'pago'; }).forEach(function (p) {
      var chave = p.data.slice(0, 7);
      porMes[chave] = (porMes[chave] || 0) + p.valorFinal;
    });
    var chaves = Object.keys(porMes).sort().slice(-6);
    if (chaves.length === 0) {
      container.innerHTML = '<p class="dash-chart-empty text-body-s">Sem pagamentos recebidos para exibir no gráfico.</p>';
      return;
    }
    var valores = chaves.map(function (chave) { return porMes[chave]; });
    var maxValor = Math.max.apply(null, valores);
    var width = Math.max(360, chaves.length * 90);
    var height = 200;
    var barAreaHeight = 140;
    var barWidth = Math.min(48, (width / chaves.length) * 0.5);

    var bars = chaves.map(function (chave, index) {
      var valor = porMes[chave];
      var barHeight = maxValor > 0 ? Math.max(2, (valor / maxValor) * barAreaHeight) : 2;
      var slotWidth = width / chaves.length;
      var x = index * slotWidth + (slotWidth - barWidth) / 2;
      var y = barAreaHeight - barHeight + 20;
      return (
        '<rect class="dash-chart-bar" x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" rx="3"></rect>' +
        '<text class="dash-chart-value" x="' + (x + barWidth / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + formatBRL(valor) + '</text>' +
        '<text class="dash-chart-label" x="' + (x + barWidth / 2) + '" y="' + (barAreaHeight + 36) + '" text-anchor="middle">' + mesLabel(chave) + '</text>'
      );
    }).join('');

    container.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMinYMin meet">' + bars + '</svg>';
  })();

  // ---------- 5. Cupons e Afiliados ----------
  setText('dash-cupons-periodo', 'Utilizações e desconto no período: ' + nomeMesAtual());
  setText('dash-kpi-cupons-ativos', String(C.cuponsAtivosCount()));
  setText('dash-kpi-afiliados-ativos', String(C.afiliadosAtivosCount()));
  setText('dash-kpi-utilizacoes', String(C.utilizacoesNoPeriodo(inicioMesAtual, TODAY)));
  setText('dash-kpi-desconto', formatBRL(C.descontoNoPeriodo(inicioMesAtual, TODAY)));

  (function renderRankingCupons() {
    var ranking = C.list()
      .map(function (cupom) { return { codigo: cupom.codigo, nome: cupom.nome, count: cupom.utilizacoes.length }; })
      .filter(function (item) { return item.count > 0; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 5);
    if (ranking.length === 0) return;

    document.getElementById('dash-ranking-card').hidden = false;
    document.getElementById('dash-ranking-list').innerHTML = ranking.map(function (item) {
      return (
        '<li class="dash-ranking-row">' +
          '<span class="dash-ranking-codigo">' + item.codigo + '</span>' +
          '<span class="dash-ranking-nome text-body-xs">' + item.nome + '</span>' +
          '<span class="dash-ranking-count">' + item.count + (item.count === 1 ? ' utilização' : ' utilizações') + '</span>' +
        '</li>'
      );
    }).join('');
  })();
})();
