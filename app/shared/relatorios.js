(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Balancete já tem fluxo real (ver balancete.html/.js) — navega de
  // verdade. LCDPR/DRE/Entradas e saídas continuam sem tela própria: mesmo
  // feedback visual breve (flash-disable) já usado em outras telas pra
  // ações sem destino real pronto ainda (ver estoque.js/fazendas.js).
  function flashDisabled(card) {
    card.disabled = true;
    window.setTimeout(function () { card.disabled = false; }, 300);
  }

  document.getElementById('rel-grid').addEventListener('click', function (event) {
    var card = event.target.closest('.rel-card');
    if (!card) return;
    if (card.dataset.report === 'balancete') {
      window.location.href = 'balancete.html';
      return;
    }
    flashDisabled(card);
  });
})();
