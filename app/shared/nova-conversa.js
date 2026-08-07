(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var HISTORY_PAGE_SIZE = 5;

  var titleEl = document.getElementById('nc-title');
  var messagesEl = document.getElementById('nc-messages');
  var historyList = document.getElementById('nc-history-list');
  var loadMoreBtn = document.getElementById('nc-loadmore-btn');

  var currentConversaId = null;
  var historyVisibleCount = HISTORY_PAGE_SIZE;

  function formatHora(iso) {
    var d = new Date(iso);
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }
  function formatData(iso) {
    var d = new Date(iso);
    var dia = String(d.getDate()).padStart(2, '0');
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    return dia + '/' + mes + '/' + d.getFullYear();
  }
  function formatDuracao(seg) {
    var m = Math.floor(seg / 60);
    var s = seg % 60;
    return m + ':' + String(s).padStart(2, '0');
  }
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ---------- Player de áudio (mock — sem arquivo real, só a barra
  // animando pela duração registrada). ----------
  var audioPlayingId = null;
  function stopAudio(playerEl) {
    var fill = playerEl.querySelector('.nc-audio-progress-fill');
    var btn = playerEl.querySelector('.nc-audio-toggle');
    fill.style.transitionDuration = '0s';
    fill.style.width = '0%';
    btn.innerHTML = '<i data-lucide="play" width="14" height="14"></i>';
    if (window.lucide) lucide.createIcons();
  }
  function toggleAudio(playerEl) {
    var id = playerEl.dataset.audioId;
    var duracao = Number(playerEl.dataset.duracao);
    var fill = playerEl.querySelector('.nc-audio-progress-fill');
    var btn = playerEl.querySelector('.nc-audio-toggle');

    if (audioPlayingId === id) {
      stopAudio(playerEl);
      audioPlayingId = null;
      return;
    }
    if (audioPlayingId) {
      var prevEl = messagesEl.querySelector('[data-audio-id="' + audioPlayingId + '"]');
      if (prevEl) stopAudio(prevEl);
    }
    audioPlayingId = id;
    fill.style.transitionDuration = '0s';
    fill.style.width = '0%';
    // Força reflow antes de iniciar a transição, senão o navegador funde os
    // dois estados (0% → 100%) num único frame sem animar.
    // eslint-disable-next-line no-unused-expressions
    fill.offsetWidth;
    fill.style.transitionDuration = duracao + 's';
    fill.style.width = '100%';
    btn.innerHTML = '<i data-lucide="pause" width="14" height="14"></i>';
    if (window.lucide) lucide.createIcons();
    window.setTimeout(function () {
      if (audioPlayingId === id) {
        stopAudio(playerEl);
        audioPlayingId = null;
      }
    }, duracao * 1000);
  }
  messagesEl.addEventListener('click', function (event) {
    var btn = event.target.closest('.nc-audio-toggle');
    if (!btn) return;
    toggleAudio(btn.closest('.nc-audio-player'));
  });

  // ---------- Render de mensagens ----------
  function buildMensagemHTML(mensagem) {
    var conteudoHTML;
    if (mensagem.tipo === 'audio') {
      conteudoHTML =
        '<div class="nc-audio-player" data-audio-id="' + mensagem.id + '" data-duracao="' + mensagem.duracaoSeg + '">' +
          '<button type="button" class="nc-audio-toggle" aria-label="Reproduzir"><i data-lucide="play" width="14" height="14"></i></button>' +
          '<div class="nc-audio-progress"><div class="nc-audio-progress-fill"></div></div>' +
          '<span class="nc-audio-duration">' + formatDuracao(mensagem.duracaoSeg) + '</span>' +
        '</div>';
    } else {
      conteudoHTML = '<div class="nc-bubble-content">' + mensagem.conteudo + '</div>';
    }
    return (
      '<div class="nc-message nc-message-' + mensagem.autor + '">' +
        '<div class="nc-bubble">' +
          conteudoHTML +
          '<span class="nc-bubble-time">' + formatHora(mensagem.horario) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function renderConversaAtual() {
    var conversa = currentConversaId ? window.NiveloAssistente.findById(currentConversaId) : null;

    if (!conversa) {
      titleEl.textContent = 'Selecione uma conversa';
      messagesEl.innerHTML =
        '<div class="nc-empty" id="nc-empty">' +
          '<i data-lucide="message-square" width="32" height="32"></i>' +
          '<p class="text-body-s">Selecione uma conversa no histórico para visualizar as mensagens.</p>' +
        '</div>';
      if (window.lucide) lucide.createIcons();
      return;
    }

    titleEl.textContent = conversa.titulo;
    messagesEl.innerHTML = conversa.mensagens.map(buildMensagemHTML).join('');
    if (window.lucide) lucide.createIcons();
    scrollToBottom();
  }

  // ---------- Histórico ----------
  // Todas as conversas acontecem via WhatsApp agora — sem indicação de
  // origem por conversa (o sistema não inicia/recebe conversas direto).
  function renderHistory() {
    var todas = window.NiveloAssistente.list();
    var visiveis = todas.slice(0, historyVisibleCount);
    historyList.innerHTML = visiveis.map(function (conversa) {
      var ultima = conversa.mensagens.length ? conversa.mensagens[conversa.mensagens.length - 1] : null;
      var dataRef = ultima ? ultima.horario : conversa.criadaEm;
      var ativa = conversa.id === currentConversaId;
      return (
        '<button type="button" class="nc-history-item' + (ativa ? ' is-active' : '') + '" data-id="' + conversa.id + '">' +
          '<span class="nc-history-item-title text-body-s">' + conversa.titulo + '</span>' +
          '<span class="nc-history-item-meta text-10-regular">' + formatData(dataRef) + '</span>' +
        '</button>'
      );
    }).join('');
    loadMoreBtn.hidden = todas.length <= historyVisibleCount;
  }

  historyList.addEventListener('click', function (event) {
    var item = event.target.closest('.nc-history-item');
    if (!item) return;
    currentConversaId = item.dataset.id;
    renderConversaAtual();
    renderHistory();
  });

  loadMoreBtn.addEventListener('click', function () {
    historyVisibleCount += HISTORY_PAGE_SIZE;
    renderHistory();
  });

  renderConversaAtual();
  renderHistory();
})();
