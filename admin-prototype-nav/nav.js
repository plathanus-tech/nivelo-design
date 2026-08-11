(function () {
  'use strict';

  var DEVICE_PRESETS = {
    desktop: { width: 1440, height: 900 },
    mobile: { width: 390, height: 844 }
  };

  // Chave própria (não compartilha com prototype-nav/ do cliente) — os dois
  // são ferramentas SEPARADAS, cada uma com seu próprio estado de sidebar/
  // árvore expandida. `DEV_NOTES_KEY` continua compartilhada de propósito:
  // é uma flag de produto (liga/desliga notas de desenvolvimento em
  // qualquer tela que a leia), não um estado deste navegador em si.
  var STORAGE_KEY = 'nivelo.protoNavAdmin.state.v1';
  var DEV_NOTES_KEY = 'nivelo.devNotes.enabled';

  var config = (window.PROTO_NAV_CONFIG && window.PROTO_NAV_CONFIG.journeys) || [];

  var state = loadState();

  var els = {
    root: document.querySelector('.pn-root'),
    tree: document.getElementById('pn-tree'),
    searchInput: document.getElementById('pn-search-input'),
    deviceSwitch: document.getElementById('pn-device-switch'),
    mainFrame: document.getElementById('pn-main-frame'),
    frameWrap: document.getElementById('pn-frame-wrap'),
    currentLabel: document.getElementById('pn-current-label'),
    openRaw: document.getElementById('pn-open-raw'),
    hoverPreview: document.getElementById('pn-hover-preview'),
    hoverPreviewInner: document.getElementById('pn-hover-preview-inner'),
    sidebarToggle: document.getElementById('pn-sidebar-toggle'),
    devNotesToggle: document.getElementById('pn-dev-notes-toggle')
  };

  var thumbObserver = null;
  var hoverHideTimer = null;
  var allEntries = flattenAll();
  var matchIndex = buildMatchIndex();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { device: 'desktop', screenId: null, expanded: {}, sidebarCollapsed: false };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function collectEntries(screens, journey, flow, list) {
    (screens || []).forEach(function (item) {
      if (item.type === 'flow') {
        collectEntries(item.screens, journey, item, list);
        return;
      }
      list.push({ ref: item, journey: journey, flow: flow, screen: item, isVariant: false, id: item.id });
      (item.variants || []).forEach(function (variant) {
        list.push({ ref: variant, journey: journey, flow: flow, screen: item, isVariant: true, id: variant.id });
      });
    });
  }

  function flattenAll() {
    var list = [];
    config.forEach(function (journey) {
      collectEntries(journey.screens, journey, null, list);
    });
    return list;
  }

  function findEntry(id) {
    for (var i = 0; i < allEntries.length; i++) {
      if (allEntries[i].id === id) return allEntries[i];
    }
    return null;
  }

  function getSrc(ref, device) {
    if (device === 'mobile' && ref.mobile) return ref.mobile;
    return ref.desktop;
  }

  function resolveUrlParts(url) {
    if (!url) return null;
    try {
      var u = new URL(url, document.baseURI);
      return { pathname: u.pathname, search: u.search, hash: u.hash };
    } catch (e) {
      return null;
    }
  }

  function buildMatchIndex() {
    var index = [];
    allEntries.forEach(function (entry) {
      [getSrc(entry.ref, 'desktop'), getSrc(entry.ref, 'mobile')].forEach(function (url) {
        var parts = resolveUrlParts(url);
        if (parts) index.push({ entry: entry, pathname: parts.pathname, search: parts.search, hash: parts.hash });
      });
    });
    return index;
  }

  function findMatchingEntry(pathname, search, hash) {
    var exact = matchIndex.filter(function (m) {
      return m.pathname === pathname && m.search === search && m.hash === hash;
    });
    if (exact.length) return exact[0].entry;

    var samePathAndSearch = matchIndex.filter(function (m) {
      return m.pathname === pathname && m.search === search;
    });
    if (samePathAndSearch.length) {
      var noHash = samePathAndSearch.filter(function (m) { return m.hash === ''; })[0];
      return (noHash || samePathAndSearch[0]).entry;
    }

    var samePath = matchIndex.filter(function (m) { return m.pathname === pathname; });
    if (samePath.length) {
      var plain = samePath.filter(function (m) { return m.hash === '' && m.search === ''; })[0];
      return (plain || samePath[0]).entry;
    }

    return null;
  }

  function journeyKey(journey) {
    return 'j:' + journey.id;
  }

  function screenKey(journey, flow, screen) {
    return 's:' + journey.id + ':' + (flow ? flow.id + ':' : '') + screen.id;
  }

  function flowKey(journey, flow) {
    return 'f:' + journey.id + ':' + flow.id;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Build tree DOM ----------

  function buildTree() {
    els.tree.innerHTML = '';
    config.forEach(function (journey) {
      els.tree.appendChild(buildJourneyGroup(journey));
    });
    if (window.lucide) lucide.createIcons();
  }

  function buildJourneyGroup(journey) {
    var wrap = document.createElement('div');
    wrap.className = 'pn-journey';
    wrap.dataset.journeyId = journey.id;

    var header = document.createElement('button');
    header.type = 'button';
    header.className = 'pn-journey-header';
    header.innerHTML =
      '<i class="pn-chevron" data-lucide="chevron-right" width="14" height="14"></i>' +
      '<i data-lucide="route" width="14" height="14"></i>' +
      '<span>' + escapeHtml(journey.label) + '</span>';
    header.addEventListener('click', function () {
      var key = journeyKey(journey);
      var next = !(state.expanded[key] !== false);
      state.expanded[key] = next;
      saveState();
      wrap.classList.toggle('is-expanded', next);
    });
    wrap.appendChild(header);

    var body = document.createElement('div');
    body.className = 'pn-journey-body';
    journey.screens.forEach(function (item) {
      if (item.type === 'flow') {
        body.appendChild(buildFlowGroup(journey, item));
      } else {
        body.appendChild(buildScreenRow(journey, null, item));
      }
    });
    wrap.appendChild(body);

    if (state.expanded[journeyKey(journey)] !== false) wrap.classList.add('is-expanded');
    return wrap;
  }

  function buildFlowGroup(journey, flow) {
    var wrap = document.createElement('div');
    wrap.className = 'pn-flow';
    wrap.dataset.flowId = flow.id;

    var header = document.createElement('button');
    header.type = 'button';
    header.className = 'pn-flow-header';
    header.innerHTML =
      '<i class="pn-chevron" data-lucide="chevron-right" width="14" height="14"></i>' +
      '<i data-lucide="git-branch" width="13" height="13"></i>' +
      '<span>' + escapeHtml(flow.label) + '</span>';
    header.addEventListener('click', function () {
      var key = flowKey(journey, flow);
      var next = !(state.expanded[key] !== false);
      state.expanded[key] = next;
      saveState();
      wrap.classList.toggle('is-expanded', next);
    });
    wrap.appendChild(header);

    var body = document.createElement('div');
    body.className = 'pn-flow-body';
    flow.screens.forEach(function (screen) {
      body.appendChild(buildScreenRow(journey, flow, screen));
    });
    wrap.appendChild(body);

    if (state.expanded[flowKey(journey, flow)] !== false) wrap.classList.add('is-expanded');
    return wrap;
  }

  function buildScreenRow(journey, flow, screen) {
    var hasVariants = screen.variants && screen.variants.length > 0;

    var wrap = document.createElement('div');
    wrap.className = 'pn-screen';
    wrap.dataset.screenId = screen.id;

    var row = document.createElement('div');
    row.className = 'pn-item';
    row.dataset.id = screen.id;
    row.addEventListener('click', function () {
      selectScreen(screen.id);
    });

    row.appendChild(buildThumb(screen, false));

    var label = document.createElement('button');
    label.type = 'button';
    label.className = 'pn-item-label';
    label.textContent = screen.label;
    row.appendChild(label);

    if (hasVariants) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'pn-variant-toggle';
      toggle.innerHTML = '<i class="pn-chevron" data-lucide="chevron-right" width="14" height="14"></i>';
      toggle.setAttribute('aria-label', 'Expandir variantes de ' + screen.label);
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var key = screenKey(journey, flow, screen);
        var next = !(state.expanded[key] === true);
        state.expanded[key] = next;
        saveState();
        wrap.classList.toggle('is-expanded', next);
      });
      row.appendChild(toggle);
    }

    wrap.appendChild(row);

    if (hasVariants) {
      var variantsWrap = document.createElement('div');
      variantsWrap.className = 'pn-variants';
      screen.variants.forEach(function (variant) {
        variantsWrap.appendChild(buildVariantRow(variant));
      });
      wrap.appendChild(variantsWrap);
      if (state.expanded[screenKey(journey, flow, screen)] === true) wrap.classList.add('is-expanded');
    }

    return wrap;
  }

  function buildVariantRow(variant) {
    var row = document.createElement('div');
    row.className = 'pn-item pn-item--variant';
    row.dataset.id = variant.id;
    row.addEventListener('click', function () {
      selectScreen(variant.id);
    });

    row.appendChild(buildThumb(variant, true));

    var label = document.createElement('button');
    label.type = 'button';
    label.className = 'pn-item-label';
    label.textContent = variant.label;
    row.appendChild(label);

    return row;
  }

  // ---------- Thumbnails (live scaled iframe) ----------

  function buildThumb(ref, isVariant) {
    var box = document.createElement('div');
    box.className = 'pn-thumb' + (isVariant ? ' pn-thumb--sm' : '');
    box.dataset.refId = ref.id;
    box.addEventListener('mouseenter', function () {
      showHoverPreview(ref, box);
    });
    box.addEventListener('mouseleave', hideHoverPreviewSoon);
    getThumbObserver().observe(box);
    return box;
  }

  function getThumbObserver() {
    if (thumbObserver) return thumbObserver;
    thumbObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            mountThumbFrame(entry.target);
            thumbObserver.unobserve(entry.target);
          }
        });
      },
      { root: els.tree, rootMargin: '200px' }
    );
    return thumbObserver;
  }

  function mountThumbFrame(box) {
    var entry = findEntry(box.dataset.refId);
    if (!entry) return;
    var src = getSrc(entry.ref, state.device);
    var preset = DEVICE_PRESETS[state.device];
    var boxSize = box.classList.contains('pn-thumb--sm') ? 44 : 56;
    var scale = Math.min(boxSize / preset.width, boxSize / preset.height);
    var offsetX = (boxSize - preset.width * scale) / 2;
    var offsetY = (boxSize - preset.height * scale) / 2;

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.width = preset.width + 'px';
    iframe.style.height = preset.height + 'px';
    iframe.style.left = offsetX + 'px';
    iframe.style.top = offsetY + 'px';
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.addEventListener('load', function () {
      pauseMedia(iframe);
    });
    box.innerHTML = '';
    box.appendChild(iframe);
  }

  function pauseMedia(iframe) {
    try {
      var doc = iframe.contentDocument;
      if (!doc) return;
      var videos = doc.querySelectorAll('video');
      for (var i = 0; i < videos.length; i++) {
        videos[i].pause();
        videos[i].removeAttribute('autoplay');
      }
    } catch (e) {
      /* cross-origin: ignore silently */
    }
  }

  function refreshAllThumbs() {
    var boxes = els.tree.querySelectorAll('.pn-thumb');
    boxes.forEach(function (box) {
      box.innerHTML = '';
      if (thumbObserver) thumbObserver.unobserve(box);
      getThumbObserver().observe(box);
    });
  }

  // ---------- Hover preview ----------

  function showHoverPreview(ref, box) {
    clearTimeout(hoverHideTimer);
    var src = getSrc(ref, state.device);
    var preset = DEVICE_PRESETS[state.device];
    var previewWidth = 260;
    var scale = previewWidth / preset.width;
    var scaledHeight = preset.height * scale;
    var maxHeight = 380;
    var clippedHeight = Math.min(scaledHeight, maxHeight);

    els.hoverPreviewInner.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.style.width = preset.width + 'px';
    iframe.style.height = preset.height + 'px';
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.addEventListener('load', function () {
      pauseMedia(iframe);
    });

    els.hoverPreviewInner.style.width = previewWidth + 'px';
    els.hoverPreviewInner.style.height = clippedHeight + 'px';
    els.hoverPreviewInner.appendChild(iframe);

    var rect = box.getBoundingClientRect();
    var top = Math.min(rect.top, window.innerHeight - clippedHeight - 16);
    top = Math.max(8, top);
    els.hoverPreview.style.top = top + 'px';
    els.hoverPreview.style.left = rect.right + 12 + 'px';
    els.hoverPreview.classList.add('is-visible');
  }

  function hideHoverPreviewSoon() {
    hoverHideTimer = setTimeout(function () {
      els.hoverPreview.classList.remove('is-visible');
      els.hoverPreviewInner.innerHTML = '';
    }, 80);
  }

  // ---------- Selection / main viewport ----------

  function selectScreen(id) {
    var entry = findEntry(id);
    if (!entry) return;

    var src = getSrc(entry.ref, state.device);
    var currentAttr = els.mainFrame.getAttribute('src') || '';
    var currentPath = currentAttr.split('#')[0];
    var nextPath = src.split('#')[0];

    if (currentAttr && currentPath === nextPath) {
      els.mainFrame.src = 'about:blank';
      window.requestAnimationFrame(function () {
        els.mainFrame.src = src;
      });
    } else {
      els.mainFrame.src = src;
    }

    applySelection(entry);
  }

  function applySelection(entry) {
    state.screenId = entry.id;
    saveState();

    els.openRaw.href = getSrc(entry.ref, state.device);
    els.currentLabel.textContent =
      entry.journey.label + ' / ' +
      (entry.flow ? entry.flow.label + ' / ' : '') +
      entry.screen.label + (entry.isVariant ? ' / ' + entry.ref.label : '');

    highlightActive(entry.id);
    try {
      history.replaceState(null, '', '#' + entry.id);
    } catch (e) {}
  }

  // Lê a URL via `postMessage` (enviada pela própria tela, `nav-sync.js`),
  // nunca acessando `iframe.contentWindow.location` direto — mesmo motivo
  // documentado em prototype-nav/nav.js (bloqueado em file://).
  function onNavSyncMessage(event) {
    var data = event.data;
    if (!data || data.source !== 'nivelo-proto-nav' || !data.href) return;

    var parts = resolveUrlParts(data.href);
    if (!parts) return;

    var matched = findMatchingEntry(parts.pathname, parts.search, parts.hash);
    if (matched && matched.id !== state.screenId) {
      applySelection(matched);
    }
  }

  window.addEventListener('message', onNavSyncMessage);

  function highlightActive(id) {
    var items = els.tree.querySelectorAll('.pn-item');
    items.forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.id === id);
    });

    var entry = findEntry(id);
    if (!entry) return;

    var journeyWrap = els.tree.querySelector('.pn-journey[data-journey-id="' + entry.journey.id + '"]');
    if (journeyWrap) journeyWrap.classList.add('is-expanded');

    if (entry.flow) {
      var flowWrap = els.tree.querySelector('.pn-flow[data-flow-id="' + entry.flow.id + '"]');
      if (flowWrap) flowWrap.classList.add('is-expanded');
    }

    if (entry.isVariant) {
      var screenWrap = els.tree.querySelector('.pn-screen[data-screen-id="' + entry.screen.id + '"]');
      if (screenWrap) screenWrap.classList.add('is-expanded');
    }
  }

  // ---------- Device switch ----------

  function setDevice(device) {
    if (device === state.device) return;
    state.device = device;
    saveState();

    els.deviceSwitch.querySelectorAll('.pn-device-btn').forEach(function (btn) {
      var isActive = btn.dataset.device === device;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
    els.frameWrap.dataset.device = device;

    refreshAllThumbs();

    // Bug real corrigido: comparar contra `els.mainFrame.getAttribute('src')` (o atributo
    // AO VIVO do DOM) é frágil — durante uma navegação em andamento esse atributo passa por
    // 'about:blank' por um frame (ver `selectScreen()`, truque about:blank+rAF pra forçar
    // reload da mesma URL). Se o usuário trocar de dispositivo bem nesse instante, a
    // comparação lia 'about:blank' e disparava um reload desnecessário — às vezes visto como
    // "saiu da página atual". Comparar as URLs de desktop/mobile da PRÓPRIA entrada (nunca o
    // DOM) elimina a corrida por completo: só recarrega quando a tela realmente tem uma URL
    // diferente por dispositivo (nenhuma tem hoje, ver `nav.config.js`).
    if (state.screenId) {
      var entry = findEntry(state.screenId);
      if (entry) {
        var desktopSrc = getSrc(entry.ref, 'desktop');
        var mobileSrc = getSrc(entry.ref, 'mobile');
        if (desktopSrc !== mobileSrc) selectScreen(state.screenId);
      }
    }
  }

  els.deviceSwitch.addEventListener('click', function (e) {
    var btn = e.target.closest('.pn-device-btn');
    if (btn) setDevice(btn.dataset.device);
  });

  // ---------- Notas para desenvolvimento (liga/desliga) ----------

  function getDevNotesEnabled() {
    try { return localStorage.getItem(DEV_NOTES_KEY) === '1'; } catch (e) { return false; }
  }

  function setDevNotesEnabled(enabled) {
    try { localStorage.setItem(DEV_NOTES_KEY, enabled ? '1' : '0'); } catch (e) {}
    els.devNotesToggle.classList.toggle('is-active', enabled);
    els.devNotesToggle.setAttribute('aria-pressed', String(enabled));
    els.devNotesToggle.querySelector('.pn-dev-notes-state').textContent = enabled ? 'On' : 'Off';
  }

  els.devNotesToggle.addEventListener('click', function () {
    setDevNotesEnabled(!getDevNotesEnabled());
  });

  setDevNotesEnabled(getDevNotesEnabled());

  // ---------- Search ----------

  els.searchInput.addEventListener('input', function () {
    var q = els.searchInput.value.trim().toLowerCase();

    els.tree.querySelectorAll('.pn-journey').forEach(function (journeyWrap) {
      var journeyMatches = false;

      journeyWrap.querySelectorAll('.pn-screen').forEach(function (screenWrap) {
        var screenLabelEl = screenWrap.querySelector('.pn-item-label');
        var screenLabel = screenLabelEl ? screenLabelEl.textContent.toLowerCase() : '';
        var screenMatch = !q || screenLabel.indexOf(q) !== -1;
        var anyVariantMatch = false;

        screenWrap.querySelectorAll('.pn-item--variant').forEach(function (variantRow) {
          var variantLabel = variantRow.querySelector('.pn-item-label').textContent.toLowerCase();
          var match = !q || variantLabel.indexOf(q) !== -1;
          variantRow.style.display = match ? '' : 'none';
          if (match && q) anyVariantMatch = true;
        });

        var show = !q || screenMatch || anyVariantMatch;
        screenWrap.style.display = show ? '' : 'none';
        if (show) journeyMatches = true;
        if (q && anyVariantMatch && !screenMatch) screenWrap.classList.add('is-expanded');
      });

      journeyWrap.querySelectorAll('.pn-flow').forEach(function (flowWrap) {
        var anyScreenVisible = false;
        flowWrap.querySelectorAll('.pn-screen').forEach(function (screenWrap) {
          if (screenWrap.style.display !== 'none') anyScreenVisible = true;
        });
        flowWrap.style.display = !q || anyScreenVisible ? '' : 'none';
        if (q && anyScreenVisible) flowWrap.classList.add('is-expanded');
      });

      journeyWrap.style.display = journeyMatches ? '' : 'none';
      if (q && journeyMatches) journeyWrap.classList.add('is-expanded');
    });
  });

  // ---------- Sidebar collapse ----------

  function setSidebarCollapsed(collapsed) {
    state.sidebarCollapsed = collapsed;
    saveState();
    els.root.classList.toggle('is-sidebar-collapsed', collapsed);
    els.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
    els.sidebarToggle.setAttribute('aria-label', collapsed ? 'Expandir sidebar' : 'Recolher sidebar');
    els.sidebarToggle.innerHTML =
      '<i data-lucide="' + (collapsed ? 'chevron-right' : 'chevron-left') + '" width="14" height="14"></i>';
    if (window.lucide) lucide.createIcons();
  }

  els.sidebarToggle.addEventListener('click', function () {
    setSidebarCollapsed(!state.sidebarCollapsed);
  });

  // ---------- Init ----------

  function init() {
    buildTree();

    els.frameWrap.dataset.device = state.device;
    els.deviceSwitch.querySelectorAll('.pn-device-btn').forEach(function (btn) {
      var isActive = btn.dataset.device === state.device;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    setSidebarCollapsed(state.sidebarCollapsed === true);

    var initialId = (location.hash || '').replace('#', '') || state.screenId;
    if (!initialId || !findEntry(initialId)) {
      initialId = allEntries.length ? allEntries[0].id : null;
    }
    if (initialId) selectScreen(initialId);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
