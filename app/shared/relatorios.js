(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Os 4 relatórios já têm fluxo real (ver balancete.html/.js, lcdpr.html/.js, dre.html/.js
  // e entradas-saidas.html/.js) — navegam de verdade, sem flash-disable.
  var REAL_DESTINATIONS = { balancete: 'balancete.html', lcdpr: 'lcdpr.html', dre: 'dre.html', 'entradas-saidas': 'entradas-saidas.html' };

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
