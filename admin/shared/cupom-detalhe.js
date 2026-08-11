(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var TIPO_LABELS = window.NiveloCupons.TIPO_LABELS;
  var TIPO_BADGE = { afiliado: 'indigo', promocional: 'info' };

  function formatDateBR(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatBRL(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }

  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var current = codigo ? window.NiveloCupons.findByCodigo(codigo) : null;

  var notFoundEl = document.getElementById('cupdet-not-found');
  var contentEl = document.getElementById('cupdet-content');
  var editarBtn = document.getElementById('cupdet-editar-btn');

  if (!current) {
    notFoundEl.hidden = false;
    contentEl.hidden = true;
    editarBtn.hidden = true;
    return;
  }

  notFoundEl.hidden = true;
  contentEl.hidden = false;
  editarBtn.href = 'novo-cupom.html?codigo=' + current.codigo;

  document.getElementById('cupdet-titulo').textContent = current.nome;
  document.getElementById('cupdet-tipo-badge').outerHTML =
    '<span class="badge" id="cupdet-tipo-badge" data-status="' + TIPO_BADGE[current.tipo] + '"><span class="badgeDot"></span>' + TIPO_LABELS[current.tipo] + '</span>';
  document.getElementById('cupdet-status-badge').outerHTML =
    '<span class="badge" id="cupdet-status-badge" data-status="' + (current.ativo ? 'success' : 'warning') + '"><span class="badgeDot"></span>' + (current.ativo ? 'Ativo' : 'Inativo') + '</span>';

  document.getElementById('cupdet-codigo').textContent = current.codigo;
  document.getElementById('cupdet-percentual').textContent = current.percentualDesconto + '%';
  document.getElementById('cupdet-criacao').textContent = formatDateBR(current.dataCriacao);
  document.getElementById('cupdet-validade').textContent = formatDateBR(current.dataInicio) + ' até ' + formatDateBR(current.dataFim);

  var afiliadoFieldsEl = document.getElementById('cupdet-afiliado-fields');
  var comissaoSectionEl = document.getElementById('cupdet-comissao-section');

  if (current.tipo === 'afiliado' && current.afiliado) {
    afiliadoFieldsEl.hidden = false;
    document.getElementById('cupdet-afiliado-email').textContent = current.afiliado.email || '—';
    document.getElementById('cupdet-afiliado-telefone').textContent = current.afiliado.telefone || '—';
    document.getElementById('cupdet-afiliado-documento').textContent = current.afiliado.documento || '—';

    if (current.afiliado.comissao) {
      comissaoSectionEl.hidden = false;
      var comissao = current.afiliado.comissao;
      document.getElementById('cupdet-com-banco').textContent = comissao.banco || '—';
      document.getElementById('cupdet-com-agencia').textContent = comissao.agencia || '—';
      document.getElementById('cupdet-com-conta').textContent = comissao.conta || '—';
      document.getElementById('cupdet-com-tipoconta').textContent = comissao.tipoConta === 'corrente' ? 'Conta corrente' : (comissao.tipoConta === 'poupanca' ? 'Conta poupança' : '—');
      document.getElementById('cupdet-com-pix').textContent = comissao.chavePix || '—';
      var obsEl = document.getElementById('cupdet-com-observacoes');
      if (comissao.observacoes) { obsEl.hidden = false; obsEl.textContent = comissao.observacoes; } else { obsEl.hidden = true; }
    } else {
      comissaoSectionEl.hidden = true;
    }
  } else {
    afiliadoFieldsEl.hidden = true;
    comissaoSectionEl.hidden = true;
  }

  // ---------- Métricas ----------
  var utilizacoes = current.utilizacoes.slice().sort(function (a, b) { return a.data < b.data ? 1 : -1; });
  document.getElementById('cupdet-metric-utilizacoes').textContent = String(utilizacoes.length);
  document.getElementById('cupdet-metric-vendido').textContent = formatBRL(window.NiveloCupons.valorTotalVendido(current));
  document.getElementById('cupdet-metric-desconto').textContent = formatBRL(window.NiveloCupons.totalDescontoConcedido(current));

  // ---------- Gráfico: utilização por mês ----------
  var MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  var chartContainer = document.getElementById('cupdet-chart');

  function renderChart() {
    if (!utilizacoes.length) {
      chartContainer.innerHTML = '<p class="cupdet-chart-empty text-body-s">Sem utilizações registradas para exibir no gráfico.</p>';
      return;
    }
    var counts = {};
    utilizacoes.forEach(function (u) {
      var key = u.data.slice(0, 7);
      counts[key] = (counts[key] || 0) + 1;
    });
    var keys = Object.keys(counts).sort();
    var maxCount = Math.max.apply(null, keys.map(function (k) { return counts[k]; }));
    var width = Math.max(360, keys.length * 70);
    var height = 200;
    var barAreaHeight = 140;
    var barWidth = Math.min(48, (width / keys.length) * 0.5);

    var bars = keys.map(function (key, index) {
      var count = counts[key];
      var barHeight = (count / maxCount) * barAreaHeight;
      var slotWidth = width / keys.length;
      var x = index * slotWidth + (slotWidth - barWidth) / 2;
      var y = barAreaHeight - barHeight + 20;
      var parts = key.split('-');
      var label = MONTH_LABELS[Number(parts[1]) - 1] + '/' + parts[0].slice(2);
      return (
        '<rect class="cupdet-chart-bar" x="' + x + '" y="' + y + '" width="' + barWidth + '" height="' + barHeight + '" rx="3"></rect>' +
        '<text class="cupdet-chart-value" x="' + (x + barWidth / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + count + '</text>' +
        '<text class="cupdet-chart-label" x="' + (x + barWidth / 2) + '" y="' + (barAreaHeight + 36) + '" text-anchor="middle">' + label + '</text>'
      );
    }).join('');

    chartContainer.innerHTML = '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMinYMin meet">' + bars + '</svg>';
  }
  renderChart();

  // ---------- Histórico de utilização ----------
  var historyTbody = document.getElementById('cupdet-history-tbody');
  var historyEmptyEl = document.getElementById('cupdet-history-empty');

  function buildHistoryRowHTML(u) {
    var assinante = window.NiveloCupons.assinante(u);
    return (
      '<tr class="tr">' +
        '<td class="td">' + (assinante ? assinante.nome : '—') + '</td>' +
        '<td class="td">' + formatDateBR(u.data) + '</td>' +
        '<td class="td">' + formatBRL(u.valorCompra) + '</td>' +
        '<td class="td">' + u.percentualAplicado + '%</td>' +
        '<td class="td">' + formatBRL(u.valorDesconto) + '</td>' +
      '</tr>'
    );
  }

  if (utilizacoes.length) {
    historyTbody.innerHTML = utilizacoes.map(buildHistoryRowHTML).join('');
    historyEmptyEl.hidden = true;
  } else {
    historyTbody.innerHTML = '';
    historyEmptyEl.hidden = false;
  }

  // ---------- Exportar CSV ----------
  document.getElementById('cupdet-export-btn').addEventListener('click', function () {
    var headers = ['Cliente', 'Data de utilização', 'Valor da compra', 'Percentual aplicado', 'Valor do desconto'];
    var lines = [headers.join(';')];
    utilizacoes.forEach(function (u) {
      var assinante = window.NiveloCupons.assinante(u);
      lines.push([
        assinante ? assinante.nome : '—',
        formatDateBR(u.data),
        formatBRL(u.valorCompra),
        u.percentualAplicado + '%',
        formatBRL(u.valorDesconto)
      ].join(';'));
    });
    var BOM = String.fromCharCode(0xFEFF);
    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'historico-cupom-' + current.codigo + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
})();
