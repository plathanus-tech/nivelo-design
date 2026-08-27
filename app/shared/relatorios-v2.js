(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // V2 fecha em 5 relatórios: Balancete/LCDPR/DRE ganharam versões V2 com filtros
  // revisados; Entradas e Saídas foi removido desta versão (continua disponível
  // na V1, ver relatorios.html); Compras e Safra são relatórios novos, só na V2.
  var REAL_DESTINATIONS = {
    'balancete-v2': 'balancete-v2.html',
    'lcdpr-v2': 'lcdpr-v2.html',
    'dre-v2': 'dre-v2.html',
    'relatorio-compras': 'relatorio-compras.html',
    'relatorio-safra': 'relatorio-safra.html'
  };

  function flashDisabled(card) {
    card.disabled = true;
    window.setTimeout(function () { card.disabled = false; }, 300);
  }

  document.getElementById('rel-grid').addEventListener('click', function (event) {
    var card = event.target.closest('.rel-card');
    if (!card) return;
    var destino = REAL_DESTINATIONS[card.dataset.report];
    if (destino) {
      window.location.href = destino;
      return;
    }
    flashDisabled(card);
  });
})();
