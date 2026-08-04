(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var feedEl = document.getElementById('ideias-feed');
  var emptyEl = document.getElementById('ideias-empty');
  var chipRowEl = document.getElementById('ideias-chip-row');
  var chipPrevBtn = document.getElementById('ideias-chip-prev');
  var chipNextBtn = document.getElementById('ideias-chip-next');
  var searchInput = document.getElementById('ideias-search-input');

  var state = { busca: '', categoria: 'todas', ordenar: 'votos' };
  // `#state=empty` força o estado "nenhuma ideia encontrada" pro
  // prototype-nav, sem precisar simular uma busca sem resultado através do
  // próprio campo visível (o usuário não deve ver um valor de busca falso).
  var isEmptyDemo = /state=empty/.test(location.hash);

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function formatDateShort(iso) {
    var parts = iso.split('-');
    return Number(parts[2]) + ' ' + MESES[Number(parts[1]) - 1];
  }

  // Mapeamento categoria → cor do `.badge` real (Table.module.css, 8
  // variantes prontas) — nunca uma cor solta. `outros` cai no `pink`, única
  // sobrando das 6 categorias sem usar `error` (vermelho lê como "problema",
  // não faz sentido pra nenhuma categoria de ideia).
  var CATEGORIA_COR = {
    financeiro: 'success',
    estoque: 'orange',
    'caderno-de-campo': 'info',
    relatorios: 'violet',
    'assistente-ia': 'indigo',
    outros: 'pink'
  };

  // Ícone por categoria — sempre reaproveitando o MESMO ícone já usado pro
  // módulo correspondente em outra parte do sistema (Sidebar/Header), nunca
  // um símbolo novo: `wallet` é Financeiro na Sidebar, `package` é Estoque,
  // `book-open` é o botão "Caderno de campo" do Header, `bar-chart-3` é
  // "Relatórios" dentro do submenu Financeiro, `bot` é Assistente IA. Nenhum
  // desses transmite status/prioridade (não são setas, estrelas, flags).
  // `outros`/`todas` não têm módulo correspondente — `leaf`/`layout-grid`
  // escolhidos só pelo tom suave e neutro pedido.
  var CATEGORIA_ICONE = {
    financeiro: 'wallet',
    estoque: 'package',
    'caderno-de-campo': 'book-open',
    relatorios: 'bar-chart-3',
    'assistente-ia': 'bot',
    outros: 'leaf'
  };
  var TODAS_ICONE = 'layout-grid';

  function excerpt(text, max) {
    if (text.length <= max) return text;
    return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  function buildChips() {
    var categorias = window.NiveloIdeias.categorias();
    var items = [{ id: 'todas', label: 'Todas' }].concat(categorias);
    chipRowEl.innerHTML = items.map(function (c) {
      var selected = state.categoria === c.id;
      var icone = c.id === 'todas' ? TODAS_ICONE : (CATEGORIA_ICONE[c.id] || 'circle');
      return '<button type="button" class="chip' + (selected ? ' selected' : '') + '" data-categoria="' + c.id + '" aria-pressed="' + selected + '"><i data-lucide="' + icone + '" width="14" height="14"></i>' + c.label + '</button>';
    }).join('');
    if (window.lucide) lucide.createIcons();
    updateChipNav();
  }

  // ---------- Setas de navegação da fileira de categorias — só aparecem
  // quando há conteúdo fora da área visível (`scrollWidth > clientWidth`),
  // nunca fixas. Cada clique rola ~2-3 chips (72% da largura visível,
  // aproximação razoável sem depender da largura exata de cada chip). ----
  function updateChipNav() {
    var hasOverflow = chipRowEl.scrollWidth > chipRowEl.clientWidth + 1;
    var atStart = chipRowEl.scrollLeft <= 0;
    var atEnd = chipRowEl.scrollLeft + chipRowEl.clientWidth >= chipRowEl.scrollWidth - 1;
    chipPrevBtn.hidden = !hasOverflow || atStart;
    chipNextBtn.hidden = !hasOverflow || atEnd;
  }

  function scrollChips(direction) {
    chipRowEl.scrollBy({ left: direction * chipRowEl.clientWidth * 0.72, behavior: 'smooth' });
  }

  chipPrevBtn.addEventListener('click', function () { scrollChips(-1); });
  chipNextBtn.addEventListener('click', function () { scrollChips(1); });
  chipRowEl.addEventListener('scroll', updateChipNav);
  window.addEventListener('resize', updateChipNav);

  // ---------- Arrastar com o mouse (desktop) — o touch já rola de graça
  // via `overflow-x:auto` nativo do navegador, sem JS nenhum. ----------
  (function enableDragScroll() {
    var isDown = false;
    var startX = 0;
    var startScroll = 0;
    chipRowEl.addEventListener('mousedown', function (event) {
      isDown = true;
      chipRowEl.classList.add('is-dragging');
      startX = event.pageX;
      startScroll = chipRowEl.scrollLeft;
    });
    window.addEventListener('mouseup', function () {
      if (!isDown) return;
      isDown = false;
      chipRowEl.classList.remove('is-dragging');
    });
    window.addEventListener('mousemove', function (event) {
      if (!isDown) return;
      event.preventDefault();
      chipRowEl.scrollLeft = startScroll - (event.pageX - startX);
    });
  })();

  function buildCardHTML(idea) {
    var categoriaLabel = window.NiveloIdeias.categoriaLabel(idea.categoria);
    var cor = CATEGORIA_COR[idea.categoria] || 'info';
    var icone = CATEGORIA_ICONE[idea.categoria] || 'circle';
    return (
      '<article class="idea-card" data-codigo="' + idea.codigo + '" tabindex="0" role="link" aria-label="Abrir ideia: ' + idea.titulo + '">' +
        '<button type="button" class="voteButton sm idea-card-vote' + (idea.votadoPorMim ? ' voted' : '') + '" data-action="votar" aria-pressed="' + !!idea.votadoPorMim + '" aria-label="' + (idea.votadoPorMim ? 'Remover voto desta ideia' : 'Votar nesta ideia') + '">' +
          '<i data-lucide="thumbs-up" width="16" height="16"></i>' +
          '<span class="count">' + idea.votos + '</span>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>Votar na ideia</span>' +
        '</button>' +
        '<div class="idea-card-body">' +
          '<span class="badge" data-status="' + cor + '"><i data-lucide="' + icone + '" width="12" height="12"></i>' + categoriaLabel + '</span>' +
          '<h2 class="idea-card-title text-subtitle-m">' + idea.titulo + '</h2>' +
          '<p class="idea-card-excerpt text-body-s">' + excerpt(idea.descricao, 140) + '</p>' +
          '<div class="idea-card-meta">' +
            '<span class="idea-card-author text-body-xs">' + idea.autor + '</span>' +
            '<span class="idea-card-dot" aria-hidden="true">·</span>' +
            '<span class="idea-card-date text-body-xs">' + formatDateShort(idea.dataCriacao) + '</span>' +
            '<span class="idea-card-dot" aria-hidden="true">·</span>' +
            '<span class="idea-card-comments text-body-xs"><i data-lucide="message-circle" width="14" height="14"></i>' + idea.comentarios.length + '</span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function matchesFilters(idea) {
    if (isEmptyDemo) return false;
    if (state.categoria !== 'todas' && idea.categoria !== state.categoria) return false;
    if (!state.busca) return true;
    var haystack = (idea.titulo + ' ' + idea.descricao).toLowerCase();
    return haystack.indexOf(state.busca.toLowerCase()) !== -1;
  }

  function render() {
    var ideias = window.NiveloIdeias.list().filter(matchesFilters);

    ideias.sort(function (a, b) {
      if (state.ordenar === 'recentes') return b.dataCriacao.localeCompare(a.dataCriacao);
      return b.votos - a.votos;
    });

    var hasResults = ideias.length > 0;
    feedEl.hidden = !hasResults;
    emptyEl.hidden = hasResults;

    if (hasResults) {
      feedEl.innerHTML = ideias.map(buildCardHTML).join('');
      if (window.lucide) lucide.createIcons();
    }
  }

  buildChips();
  render();

  // ---------- Categoria (chips) ----------
  chipRowEl.addEventListener('click', function (event) {
    var chip = event.target.closest('[data-categoria]');
    if (!chip) return;
    state.categoria = chip.dataset.categoria;
    buildChips();
    render();
  });

  // ---------- Busca ----------
  searchInput.addEventListener('input', function () {
    state.busca = searchInput.value.trim();
    render();
  });

  // ---------- Ordenar por (Dropdown genérico, mesmo padrão já usado em
  // Produtos/Estoque/Cadastro — position:fixed via JS, fecha ao rolar a
  // PÁGINA mas ignora o próprio scroll interno do menu). ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 200;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      var spaceAbove = rect.top - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      if (spaceBelow < 120 && spaceAbove > spaceBelow) {
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
      var existingOptions = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existingOptions.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
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

  initDropdown(document.getElementById('dropdown-ordenar'), function (value) {
    state.ordenar = value;
    render();
  });

  // ---------- Tooltip do botão de voto ("Votar na ideia") — mesma técnica
  // já usada nos ícones de ação de Cadastro/Estoque (`.tip` reparentado pra
  // `document.body` no primeiro hover, posicionado via `position:fixed`
  // calculado por `getBoundingClientRect()`, delegado em `document` porque
  // os cards são recriados a cada `render()`). ----------
  function getVoteTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) {
      document.body.appendChild(tip);
      btn.__tip = tip;
    }
    return tip;
  }

  function positionVoteTooltip(btn) {
    var tip = getVoteTip(btn);
    if (!tip) return;
    var rect = btn.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    tip.style.position = 'fixed';
    tip.style.left = centerX + 'px';
    tip.style.transform = 'translateX(-50%)';
    tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    tip.style.top = 'auto';
    tip.style.opacity = '1';
  }

  function hideVoteTooltip(btn) {
    if (btn.__tip) btn.__tip.style.opacity = '0';
  }

  document.addEventListener('mouseover', function (event) {
    var btn = event.target.closest('[data-action="votar"]');
    if (btn) positionVoteTooltip(btn);
  });
  document.addEventListener('mouseout', function (event) {
    var btn = event.target.closest('[data-action="votar"]');
    if (btn) hideVoteTooltip(btn);
  });
  document.addEventListener('focusin', function (event) {
    var btn = event.target.closest && event.target.closest('[data-action="votar"]');
    if (btn) positionVoteTooltip(btn);
  });
  document.addEventListener('focusout', function (event) {
    var btn = event.target.closest && event.target.closest('[data-action="votar"]');
    if (btn) hideVoteTooltip(btn);
  });

  // ---------- Voto + navegação (card inteiro clicável, exceto o próprio
  // botão de voto — checado ANTES de qualquer navegação). ----------
  feedEl.addEventListener('click', function (event) {
    var voteBtn = event.target.closest('[data-action="votar"]');
    if (voteBtn) {
      var card = voteBtn.closest('[data-codigo]');
      window.NiveloIdeias.toggleVoto(card.dataset.codigo);
      render();
      return;
    }
    var card = event.target.closest('[data-codigo]');
    if (card) window.location.href = 'ideia-detalhe.html?codigo=' + card.dataset.codigo;
  });

  feedEl.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var card = event.target.closest('.idea-card');
    if (!card || event.target.closest('[data-action="votar"]')) return;
    event.preventDefault();
    window.location.href = 'ideia-detalhe.html?codigo=' + card.dataset.codigo;
  });

  document.getElementById('nova-ideia-btn').addEventListener('click', function () {
    window.location.href = 'nova-ideia.html';
  });

  // ---------- Toast de sucesso (mesmo padrão Feedback-como-toast já usado
  // em Fazendas/Cadastro/Estoque) — consumido só uma vez, escrito por
  // nova-ideia.js ao publicar. ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ideias-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      (message ? '<div class="message">' + message + '</div>' : '') +
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

  var novaIdeiaMessage = sessionStorage.getItem('nivelo.novaideia.success');
  if (novaIdeiaMessage) {
    sessionStorage.removeItem('nivelo.novaideia.success');
    showSuccessToast('Ideia publicada com sucesso', novaIdeiaMessage);
  }
})();
