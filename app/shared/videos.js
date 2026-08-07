(function () {
  'use strict';

  var gridEl = document.getElementById('videos-grid');
  var emptyEl = document.getElementById('videos-empty');

  // Mesmo padrão de cor+ícone por categoria já usado no Canal de Ideias
  // (CATEGORIA_COR/CATEGORIA_ICONE em canal-ideias.js): ícone sempre
  // reaproveitado do mesmo módulo em outra parte do sistema (Sidebar/Header).
  var CATEGORIA_COR = {
    'Primeiros passos': 'info',
    'Notas Fiscais': 'indigo',
    'Financeiro': 'success',
    'Estoque': 'orange',
    'Caderno de Campo': 'violet',
    'Assistente IA': 'pink'
  };
  var CATEGORIA_ICONE = {
    'Primeiros passos': 'flag',
    'Notas Fiscais': 'receipt',
    'Financeiro': 'wallet',
    'Estoque': 'package',
    'Caderno de Campo': 'book-open',
    'Assistente IA': 'bot'
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildThumbHTML(video) {
    if (video.thumbnail) {
      return '<img src="' + escapeHtml(video.thumbnail) + '" alt="" loading="lazy" />';
    }
    return '<div class="videos-thumb-placeholder"><i data-lucide="play-circle" width="32" height="32"></i></div>';
  }

  function buildCardHTML(video) {
    var url = window.NiveloVideos.urlFor(video);
    var cor = CATEGORIA_COR[video.categoria] || 'info';
    var icone = CATEGORIA_ICONE[video.categoria] || 'circle';
    return (
      '<article class="card videos-card" data-video-id="' + escapeHtml(video.id) + '" data-url="' + escapeHtml(url) + '" role="link" tabindex="0" aria-label="Assistir ' + escapeHtml(video.titulo) + ' no YouTube (abre em nova aba)">' +
        '<div class="videos-card-thumb">' +
          buildThumbHTML(video) +
          '<span class="videos-card-play-overlay"><i data-lucide="play" width="20" height="20"></i></span>' +
        '</div>' +
        '<div class="videos-card-body">' +
          '<span class="badge videos-card-category" data-status="' + cor + '"><i data-lucide="' + icone + '" width="12" height="12"></i>' + escapeHtml(video.categoria) + '</span>' +
          '<h2 class="videos-card-title text-subtitle-m">' + escapeHtml(video.titulo) + '</h2>' +
          '<div class="videos-card-footer">' +
            '<span class="videos-card-yt-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>' +
            '<span class="videos-card-cta text-body-s">Assistir no YouTube <i data-lucide="external-link" width="14" height="14"></i></span>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function openVideo(card) {
    var url = card.getAttribute('data-url');
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  function render() {
    var videos = window.NiveloVideos.list();

    if (!videos.length) {
      gridEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }

    gridEl.hidden = false;
    emptyEl.hidden = true;
    gridEl.innerHTML = videos.map(buildCardHTML).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  gridEl.addEventListener('click', function (event) {
    var card = event.target.closest('.videos-card');
    if (card) openVideo(card);
  });

  gridEl.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var card = event.target.closest('.videos-card');
    if (!card) return;
    event.preventDefault();
    openVideo(card);
  });

  render();
})();
