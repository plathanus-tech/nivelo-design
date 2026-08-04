(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var CURRENT_USER = 'Você';

  var notFoundEl = document.getElementById('ideia-not-found');
  var contentEl = document.getElementById('ideia-content');
  var voteBtn = document.getElementById('vote-btn');
  var voteCountEl = document.getElementById('vote-count');
  var categoriaEl = document.getElementById('ideia-categoria');
  var tituloEl = document.getElementById('ideia-titulo');
  var autorEl = document.getElementById('ideia-autor');
  var dataEl = document.getElementById('ideia-data');
  var descricaoEl = document.getElementById('ideia-descricao');
  var comentariosTituloEl = document.getElementById('comentarios-titulo');
  var comentariosEmptyEl = document.getElementById('comentarios-empty');
  var commentListEl = document.getElementById('comment-list');
  var commentForm = document.getElementById('comment-form');
  var commentInput = document.getElementById('comment-input');

  var MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function formatDateShort(iso) {
    var parts = iso.split('-');
    return Number(parts[2]) + ' ' + MESES[Number(parts[1]) - 1];
  }

  var CATEGORIA_COR = {
    financeiro: 'success',
    estoque: 'orange',
    'caderno-de-campo': 'info',
    relatorios: 'violet',
    'assistente-ia': 'indigo',
    outros: 'pink'
  };

  // Mesmo mapeamento categoria→ícone de canal-ideias.js (reaproveita os
  // ícones já usados pros módulos correspondentes na Sidebar/Header — ver
  // comentário completo lá).
  var CATEGORIA_ICONE = {
    financeiro: 'wallet',
    estoque: 'package',
    'caderno-de-campo': 'book-open',
    relatorios: 'bar-chart-3',
    'assistente-ia': 'bot',
    outros: 'leaf'
  };

  // Réplica em JS puro de `pickAvatarColor()`/`getInitials()` do componente
  // React `Avatar` — mesma nota já em canal-ideias.js: tela estática, não
  // roda o `.tsx` de verdade.
  var AVATAR_COLORS = ['brand', 'green', 'orange', 'violet', 'pink', 'indigo'];
  function pickAvatarColor(seed) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
  }
  function getInitials(name) {
    var parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function buildCommentHTML(comentario) {
    return (
      '<div class="ideia-comment">' +
        '<span class="avatar initials sm" data-color="' + pickAvatarColor(comentario.autor) + '" role="img" aria-label="' + comentario.autor + '">' + getInitials(comentario.autor) + '</span>' +
        '<div class="ideia-comment-body">' +
          '<div class="ideia-comment-header">' +
            '<span class="ideia-comment-author text-body-s">' + comentario.autor + '</span>' +
            '<span class="ideia-comment-date text-body-xs">' + formatDateShort(comentario.dataCriacao) + '</span>' +
          '</div>' +
          '<p class="ideia-comment-text text-body-s">' + comentario.texto + '</p>' +
        '</div>' +
      '</div>'
    );
  }

  function renderComments(idea) {
    comentariosTituloEl.textContent = idea.comentarios.length + (idea.comentarios.length === 1 ? ' comentário' : ' comentários');
    var hasComments = idea.comentarios.length > 0;
    commentListEl.hidden = !hasComments;
    comentariosEmptyEl.hidden = hasComments;
    if (hasComments) {
      commentListEl.innerHTML = idea.comentarios.map(buildCommentHTML).join('');
      if (window.lucide) lucide.createIcons();
    }
  }

  function renderVote(idea) {
    voteCountEl.textContent = idea.votos;
    voteBtn.classList.toggle('voted', !!idea.votadoPorMim);
    voteBtn.setAttribute('aria-pressed', !!idea.votadoPorMim);
    voteBtn.setAttribute('aria-label', idea.votadoPorMim ? 'Remover voto desta ideia' : 'Votar nesta ideia');
  }

  var codigo = new URLSearchParams(location.search).get('codigo');
  var idea = codigo ? window.NiveloIdeias.findByCodigo(codigo) : null;

  if (!idea) {
    notFoundEl.hidden = false;
    contentEl.hidden = true;
    return;
  }

  notFoundEl.hidden = true;
  contentEl.hidden = false;

  categoriaEl.innerHTML = '<i data-lucide="' + (CATEGORIA_ICONE[idea.categoria] || 'circle') + '" width="12" height="12"></i>' + window.NiveloIdeias.categoriaLabel(idea.categoria);
  categoriaEl.dataset.status = CATEGORIA_COR[idea.categoria] || 'info';
  tituloEl.textContent = idea.titulo;
  autorEl.textContent = idea.autor;
  dataEl.textContent = formatDateShort(idea.dataCriacao);
  descricaoEl.textContent = idea.descricao;
  document.title = idea.titulo + ' — Nivelo';

  renderVote(idea);
  renderComments(idea);
  // `renderComments()` só chama `lucide.createIcons()` quando há
  // comentários — o ícone da categoria (`categoriaEl.innerHTML`, acima)
  // precisa de uma chamada própria pra cobrir o caso de zero comentários.
  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip do botão de voto ("Votar na ideia") — mesma técnica
  // já usada em canal-ideias.js/cadastros.js. ----------
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
  voteBtn.addEventListener('mouseover', function () { positionVoteTooltip(voteBtn); });
  voteBtn.addEventListener('mouseout', function () { hideVoteTooltip(voteBtn); });
  voteBtn.addEventListener('focus', function () { positionVoteTooltip(voteBtn); });
  voteBtn.addEventListener('blur', function () { hideVoteTooltip(voteBtn); });

  voteBtn.addEventListener('click', function () {
    var updated = window.NiveloIdeias.toggleVoto(idea.codigo);
    renderVote(updated);
  });

  commentForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var texto = commentInput.value.trim();
    if (!texto) return;
    window.NiveloIdeias.addComentario(idea.codigo, { autor: CURRENT_USER, texto: texto });
    commentInput.value = '';
    renderComments(idea);
  });

  // ---------- Toast de sucesso (mesmo padrão Feedback-como-toast do resto
  // do sistema) — usado quando o usuário chega aqui direto de "Nova ideia"
  // recém-publicada (ver nova-ideia.js). ----------
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
