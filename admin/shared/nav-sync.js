/* ─────────────────────────────────────────────────────────
 * Avisa o Navegador de Protótipo (prototype-nav) qual tela/variante está
 * sendo exibida agora, via postMessage — nunca lendo `location` do outro
 * lado direto (que é bloqueado pelo navegador quando o protótipo é aberto
 * via file://, cada arquivo local conta como uma origem isolada). Só tem
 * efeito quando a página está dentro de um iframe; fora disso (aberta
 * direto) não faz nada. Cópia idêntica de app/shared/nav-sync.js.
 * ───────────────────────────────────────────────────── */
(function () {
  'use strict';

  function post() {
    if (window.parent === window) return;
    try {
      window.parent.postMessage({ source: 'nivelo-proto-nav', href: location.href }, '*');
    } catch (e) {}
  }

  post();
  window.addEventListener('hashchange', post);
  window.addEventListener('load', post);
})();
