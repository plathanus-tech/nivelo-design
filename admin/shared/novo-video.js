(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

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

  var params = new URLSearchParams(location.search);
  var idEdicao = params.get('id');
  var current = idEdicao ? window.NiveloAdminVideos.findById(idEdicao) : null;
  var isEdicao = !!idEdicao;

  if (isEdicao && !current) {
    document.getElementById('nv-layout').hidden = true;
    document.getElementById('nv-not-found').hidden = false;
    return;
  }

  // ---------- Dropdown genérico (seleção única), position:fixed via JS ----------
  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');

    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      var margin = 8;
      var preferredMaxHeight = 240;
      var spaceBelow = window.innerHeight - rect.bottom - margin;
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = Math.min(preferredMaxHeight, spaceBelow) + 'px';
    }
    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', onWindowScroll, true);
      window.removeEventListener('resize', close);
    }
    function onWindowScroll(event) {
      if (menu.contains(event.target)) return;
      close();
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onWindowScroll, true);
      window.addEventListener('resize', close);
    }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (root.id === 'nv-categoria-dropdown') { setError('nv-categoria-dropdown', false); updatePreview(); }
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
      if (event.key === 'Escape') close();
    });
    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    return { reset: reset };
  }

  // ---------- Popula o Dropdown de Categoria a partir do catálogo central ----------
  var categoriaMenu = document.getElementById('nv-categoria-menu');
  window.NiveloAdminVideos.categorias().forEach(function (categoria) {
    var option = document.createElement('div');
    option.className = 'option';
    option.dataset.value = categoria;
    option.textContent = categoria;
    categoriaMenu.appendChild(option);
  });

  var categoriaDropdown = initDropdown(document.getElementById('nv-categoria-dropdown'));
  var statusDropdown = initDropdown(document.getElementById('nv-status-dropdown'));

  // ---------- Campos ----------
  var linkInput = document.getElementById('nv-link-input');
  var linkStatusEl = document.getElementById('nv-link-status');
  var tituloInput = document.getElementById('nv-titulo-input');
  var previewSlot = document.getElementById('nv-preview-slot');

  function setError(fieldId, hasError) {
    document.getElementById(fieldId).classList.toggle('error', hasError);
  }

  // ---------- Prévia do card — exatamente o mesmo card que o cliente vê ----------
  var fetchedMeta = null; // { videoId, titulo, canal, thumbnail }
  var tituloEditedManually = false;

  function buildThumbHTML(thumbnail) {
    if (thumbnail) return '<img src="' + escapeHtml(thumbnail) + '" alt="" loading="lazy" />';
    return '<div class="videos-thumb-placeholder"><i data-lucide="play-circle" width="32" height="32"></i></div>';
  }

  function updatePreview() {
    if (!fetchedMeta) {
      previewSlot.innerHTML =
        '<div class="nv-preview-placeholder">' +
          '<i data-lucide="video" width="28" height="28"></i>' +
          '<p class="text-body-xs">A prévia aparecerá aqui após informar um link válido do YouTube.</p>' +
        '</div>';
      if (window.lucide) lucide.createIcons();
      return;
    }
    var categoria = document.getElementById('nv-categoria-dropdown').dataset.value || '';
    var titulo = tituloInput.value.trim() || 'Título do vídeo';
    var cor = CATEGORIA_COR[categoria] || 'info';
    var icone = CATEGORIA_ICONE[categoria] || 'circle';
    previewSlot.innerHTML =
      '<article class="card videos-card">' +
        '<div class="videos-card-thumb">' + buildThumbHTML(fetchedMeta.thumbnail) + '</div>' +
        '<div class="videos-card-body">' +
          (categoria ? '<span class="badge videos-card-category" data-status="' + cor + '"><i data-lucide="' + icone + '" width="12" height="12"></i>' + escapeHtml(categoria) + '</span>' : '') +
          '<h2 class="videos-card-title text-subtitle-m">' + escapeHtml(titulo) + '</h2>' +
          '<div class="videos-card-footer">' +
            '<span class="videos-card-yt-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></span>' +
            '<span class="videos-card-cta text-body-s">Assistir no YouTube <i data-lucide="external-link" width="14" height="14"></i></span>' +
          '</div>' +
        '</div>' +
      '</article>';
    if (window.lucide) lucide.createIcons();
  }

  function setLinkStatus(mode, text) {
    linkStatusEl.className = 'nv-link-status' + (mode ? ' is-' + mode : '');
    linkStatusEl.hidden = !text;
    linkStatusEl.innerHTML = text
      ? '<span class="nv-link-status-icon"><i data-lucide="' + (mode === 'loading' ? 'loader-2' : 'check-circle') + '" width="14" height="14"></i></span>' + escapeHtml(text)
      : '';
    if (window.lucide) lucide.createIcons();
  }

  var fetchDebounceTimer = null;
  function scheduleValidateAndFetch() {
    window.clearTimeout(fetchDebounceTimer);
    fetchDebounceTimer = window.setTimeout(validateAndFetch, 500);
  }

  function validateAndFetch() {
    var url = linkInput.value.trim();
    setError('nv-link-field', false);

    if (!url) {
      fetchedMeta = null;
      setLinkStatus(null, '');
      updatePreview();
      return;
    }

    var videoId = window.NiveloAdminVideos.extractVideoId(url);
    if (!videoId) {
      fetchedMeta = null;
      document.getElementById('nv-link-error-text').textContent = 'Informe um link válido do YouTube.';
      setError('nv-link-field', true);
      setLinkStatus(null, '');
      updatePreview();
      return;
    }

    if (fetchedMeta && fetchedMeta.videoId === videoId) return;

    setLinkStatus('loading', 'Identificando vídeo...');
    window.NiveloAdminVideos.fetchMetadata(url).then(function (meta) {
      fetchedMeta = meta;
      setLinkStatus('success', 'Vídeo identificado' + (meta.canal ? ' — ' + meta.canal : '') + '.');
      if (!tituloEditedManually) tituloInput.value = meta.titulo;
      updatePreview();
    }).catch(function (err) {
      fetchedMeta = null;
      document.getElementById('nv-link-error-text').textContent = err.message;
      setError('nv-link-field', true);
      setLinkStatus(null, '');
      updatePreview();
    });
  }

  linkInput.addEventListener('input', function () {
    setLinkStatus(null, '');
    scheduleValidateAndFetch();
  });
  linkInput.addEventListener('blur', function () {
    window.clearTimeout(fetchDebounceTimer);
    validateAndFetch();
  });

  tituloInput.addEventListener('input', function () {
    tituloEditedManually = true;
    setError('nv-titulo-field', false);
    updatePreview();
  });

  // ---------- Preenchimento em modo edição ----------
  if (isEdicao) {
    document.getElementById('nv-titulo-pagina').textContent = 'Editar vídeo';
    document.title = 'Editar Vídeo — Painel Administrativo — Nivelo';
    document.getElementById('nv-submit-btn').textContent = 'Salvar alterações';

    linkInput.value = window.NiveloAdminVideos.urlFor(current);
    tituloInput.value = current.titulo;
    categoriaDropdown.reset(current.categoria, current.categoria);
    statusDropdown.reset(current.status, current.status === 'ativo' ? 'Ativo' : 'Inativo');

    fetchedMeta = { videoId: current.videoId, titulo: current.titulo, canal: current.canal, thumbnail: current.thumbnail };
    setLinkStatus('success', 'Vídeo identificado' + (current.canal ? ' — ' + current.canal : '') + '.');
    updatePreview();
  } else {
    updatePreview();
  }

  // ---------- Toast (grava antes de redirecionar pra videos.html) ----------
  function goToListWithToast(title, message) {
    try {
      sessionStorage.setItem('nivelo.novovideo.success', JSON.stringify({ title: title, message: message }));
    } catch (e) {}
    window.location.href = 'videos.html';
  }

  // ---------- Validação + submit ----------
  var form = document.getElementById('nv-form');
  var submitBtn = document.getElementById('nv-submit-btn');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var valid = true;
    var url = linkInput.value.trim();

    if (!url || !fetchedMeta || window.NiveloAdminVideos.extractVideoId(url) !== fetchedMeta.videoId) {
      document.getElementById('nv-link-error-text').textContent = url ? 'Aguarde a identificação do vídeo antes de publicar.' : 'Informe um link válido do YouTube.';
      setError('nv-link-field', true);
      valid = false;
    }

    var titulo = tituloInput.value.trim();
    setError('nv-titulo-field', !titulo);
    if (!titulo) valid = false;

    var categoria = document.getElementById('nv-categoria-dropdown').dataset.value || '';
    setError('nv-categoria-dropdown', !categoria);
    if (!categoria) valid = false;

    if (!valid) return;

    var status = document.getElementById('nv-status-dropdown').dataset.value || 'ativo';

    submitBtn.disabled = true;

    if (isEdicao) {
      window.NiveloAdminVideos.update(current.id, {
        url: url,
        titulo: titulo,
        categoria: categoria,
        status: status
      }).then(function () {
        goToListWithToast('Vídeo atualizado com sucesso', titulo + '.');
      }).catch(function (err) {
        submitBtn.disabled = false;
        document.getElementById('nv-link-error-text').textContent = err.message;
        setError('nv-link-field', true);
      });
    } else {
      window.NiveloAdminVideos.add(url, categoria, { titulo: titulo, status: status }).then(function () {
        goToListWithToast('Vídeo cadastrado com sucesso', titulo + '.');
      }).catch(function (err) {
        submitBtn.disabled = false;
        document.getElementById('nv-link-error-text').textContent = err.message;
        setError('nv-link-field', true);
      });
    }
  });
})();
