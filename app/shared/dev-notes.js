/* ══════════════════════════════════════════════════════════
   NOTAS PARA DESENVOLVIMENTO — visibilidade liga/desliga
   Anotações (`.dev-note`, ver `page-cadastro.css`) destinadas só ao time
   de desenvolvimento, nunca ao produto final. Este script só decide se
   elas aparecem: lê uma flag compartilhada no localStorage (mesma origem
   de `prototype-nav`, que tem o controle liga/desliga) e aplica a classe
   `dev-notes-on` no <html>. Nenhuma tela do fluxo tem esse controle
   visível nela mesma de propósito: o protótipo precisa ficar limpo pra
   demonstração ao cliente por padrão (flag começa desligada), e o
   controle vive só no navegador de protótipo (ferramenta de dev).
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'nivelo.devNotes.enabled';

  function apply() {
    var enabled = false;
    try { enabled = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
    document.documentElement.classList.toggle('dev-notes-on', enabled);
  }

  apply();

  // Sincroniza em tempo real se a flag for alterada em outra aba/iframe
  // (ex.: o toggle do prototype-nav enquanto esta tela já está aberta).
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) apply();
  });
})();
