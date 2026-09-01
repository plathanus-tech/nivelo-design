(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatInt(n) {
    return Math.round(n).toLocaleString('pt-BR');
  }
  function formatNum(n) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  // Mesmo helper de estoque-v2.js/registrar-entrega-estoque-v2.js (Comprometido
  // guarda o NOME da unidade, ex. "Saca" — precisa da sigla curta pra "sc"/"kg"
  // e pra achar a conversão no catálogo).
  function siglaFromUnidadeNome(nome) {
    if (!nome) return '';
    var match = window.NiveloUnidadesMedida.list().filter(function (u) {
      return u.nome.toLowerCase() === String(nome).toLowerCase();
    })[0];
    return match ? match.sigla : nome;
  }
  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  var SITUACAO_BADGE = {
    pendente: { status: 'warning', label: 'Em aberto' },
    quitado: { status: 'success', label: 'Concluído' }
  };

  // ---------- Resolve o compromisso pelo ?codigo= ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var record = codigo ? window.NiveloEstoqueComprometidoV2.findByCodigo(codigo) : null;

  if (!record) {
    document.getElementById('historico-not-found').hidden = false;
    document.getElementById('historico-content').hidden = true;
    document.getElementById('historico-registrar-entrega-btn').hidden = true;
    return;
  }

  var sigla = siglaFromUnidadeNome(record.unidade);
  var unitLower = sigla.toLowerCase();
  var conversao = getConversao(sigla);

  document.getElementById('historico-produto-titulo').textContent = record.produto;
  document.getElementById('historico-cliente-subtitulo').textContent = record.cliente;
  document.getElementById('historico-registrar-entrega-btn').setAttribute('href', 'registrar-entrega-estoque-v2.html?codigo=' + record.codigo);

  // Status: só texto colorido (sem badge/fundo), mesmo tamanho dos demais
  // valores de KPI (`.entregav2-kpi-value`) — a cor vem de `data-status`
  // (ver page-historico-entrega-estoque-v2.css), reaproveitando as mesmas
  // 2 cores semânticas do badge que era usado antes.
  function renderKpis() {
    document.getElementById('kpi-acordada').textContent = formatInt(record.comprometida) + ' ' + unitLower;
    document.getElementById('kpi-entregue').textContent = formatInt(record.entregue) + ' ' + unitLower;
    document.getElementById('kpi-saldo').textContent = formatInt(record.pendente) + ' ' + unitLower;
    var badge = SITUACAO_BADGE[record.situacao];
    var statusEl = document.getElementById('kpi-status');
    statusEl.setAttribute('data-status', badge.status);
    statusEl.textContent = badge.label;
  }

  // Só as entregas de verdade (nunca o "compromisso-inicial") — o histórico
  // desta tela é especificamente sobre as entregas, ver pedido explícito.
  function renderHistorico() {
    var entregas = record.historico.filter(function (entry) { return entry.tipo === 'entrega'; }).slice().reverse();
    var timeline = document.getElementById('historico-timeline');
    var emptyEl = document.getElementById('historico-empty');

    if (!entregas.length) {
      timeline.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    timeline.innerHTML = entregas.map(function (entry) {
      var pesoLine = '';
      if (conversao) {
        var pesoTotal = entry.quantidade * conversao.correspondeA;
        pesoLine = 'Peso: ' + formatNum(pesoTotal) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
      }
      var documentoLine = entry.documento && entry.documento.numero
        ? 'NF-e nº ' + entry.documento.numero
        : 'Sem NF-e vinculada';

      var metaParts = [formatInt(entry.quantidade) + ' ' + unitLower];
      if (pesoLine) metaParts.push(pesoLine);
      if (entry.deposito) metaParts.push('Depósito de saída: ' + entry.deposito);

      return '<li class="detalhe-estoque-timeline-item">' +
        '<span class="detalhe-estoque-timeline-icon"><i data-lucide="package-check" width="16" height="16"></i></span>' +
        '<div class="detalhe-estoque-timeline-body">' +
          '<div class="detalhe-estoque-timeline-label">Entrega · ' + formatDate(entry.data) + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">' + metaParts.join(' · ') + '</div>' +
          '<div class="detalhe-estoque-timeline-extra">' + documentoLine + (entry.observacao ? ' · ' + entry.observacao : '') + '</div>' +
        '</div>' +
        '</li>';
    }).join('');
    if (window.lucide) lucide.createIcons();
  }

  document.getElementById('historico-not-found').hidden = true;
  document.getElementById('historico-content').hidden = false;
  renderKpis();
  renderHistorico();
})();
