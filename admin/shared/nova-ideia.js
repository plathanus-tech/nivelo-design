// Cópia de app/shared/nova-ideia.js (mesma estrutura/comportamento) — só o
// autor e a chave de sessionStorage são próprios do admin.
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var CURRENT_USER = 'Administrador';

  var form = document.getElementById('nova-ideia-form');
  var tituloField = document.getElementById('titulo-field');
  var tituloInput = document.getElementById('ni-titulo');
  var categoriaField = document.getElementById('categoria-field');
  var descricaoField = document.getElementById('descricao-field');
  var descricaoInput = document.getElementById('ni-descricao');

  // ---------- Dropdown genérico (mesmo padrão de novo-produto.js/
  // novo-estoque.js: wrapper/trigger/menu/option, menu em `position:fixed`
  // calculado via JS pra escapar do `overflow:hidden` de `.card`, fecha ao
  // rolar a página mas ignora o próprio scroll interno do menu). ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 160 && spaceAbove > spaceBelow) {
        menu.style.top = 'auto';
        menu.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceAbove) + 'px';
      } else {
        menu.style.bottom = 'auto';
        menu.style.top = (rect.bottom + 4) + 'px';
        menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
      }
    }

    function onWindowScroll(event) {
      if (menu.contains(event.target)) return;
      close();
    }

    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', onWindowScroll, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onWindowScroll, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      root.classList.remove('error');
      close();
      if (onChange) onChange(optionEl.dataset.value);
    }

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (optionEl) selectOption(optionEl);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root.classList.contains('open')) close();
    });
  }

  initDropdown(categoriaField);

  tituloInput.addEventListener('input', function () { tituloField.classList.remove('error'); });
  descricaoInput.addEventListener('input', function () { descricaoField.classList.remove('error'); });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var titulo = tituloInput.value.trim();
    var categoria = categoriaField.dataset.value;
    var descricao = descricaoInput.value.trim();

    var valid = true;
    if (!titulo) { tituloField.classList.add('error'); valid = false; }
    if (!categoria) { categoriaField.classList.add('error'); valid = false; }
    if (descricao.length < 10) { descricaoField.classList.add('error'); valid = false; }
    if (!valid) return;

    var novaIdeia = window.NiveloIdeias.add({
      titulo: titulo,
      categoria: categoria,
      descricao: descricao,
      autor: CURRENT_USER
    });

    try {
      sessionStorage.setItem('nivelo.admin.novaideia.success', 'A ideia já está visível pra toda a comunidade.');
    } catch (e) {}

    window.location.href = 'ideia-detalhe.html?codigo=' + novaIdeia.codigo;
  });
})();
