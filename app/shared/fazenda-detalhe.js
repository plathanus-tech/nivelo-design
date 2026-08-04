(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_TALHAO = {
    'em-producao': { status: 'success', label: 'Em produção' },
    'disponivel': { status: 'info', label: 'Disponível' },
    'em-pousio': { status: 'warning', label: 'Em pouso' }
  };

  var currentFazendaId = null;

  function buildTalhaoRowHTML(t) {
    var badge = STATUS_TALHAO[t.status];
    var metaText = t.areaHa + ' ha · ' + (t.cultura ? t.cultura + ' · Safra ' + t.safra : 'Sem cultura cadastrada');
    return (
      '<button type="button" class="talhao-row" data-talhao-id="' + t.id + '">' +
        '<span class="talhao-row-icon"><i data-lucide="layout-grid" width="18" height="18"></i></span>' +
        '<div class="talhao-row-body">' +
          '<div class="talhao-row-name text-body-s">' + t.nome + '</div>' +
          '<div class="talhao-row-meta text-body-xs">' + metaText + '</div>' +
        '</div>' +
        '<span class="badge talhao-row-status" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
        '<i data-lucide="chevron-right" width="18" height="18" class="talhao-row-chevron"></i>' +
      '</button>'
    );
  }

  // ---------- Render ----------
  function renderHeader(fazenda) {
    document.getElementById('fazenda-detalhe-nome').textContent = fazenda.nome;
    document.getElementById('fazenda-detalhe-localizacao').textContent = fazenda.cidade + ', ' + fazenda.estado;
    document.title = fazenda.nome + ' — Nivelo';
  }

  // "Cultura atual" mostra TODAS as culturas plantadas nos talhões da
  // fazenda (não só `fazenda.culturaAtual`, que reflete uma única cultura
  // "principal") — pedido explícito, já que uma fazenda normalmente tem
  // vários talhões com culturas diferentes ao mesmo tempo.
  function culturasAtuais(fazenda) {
    var culturas = [];
    fazenda.talhoes.forEach(function (t) {
      if (t.cultura && culturas.indexOf(t.cultura) === -1) culturas.push(t.cultura);
    });
    return culturas.length ? culturas.join(', ') : 'Sem cultura';
  }

  function renderResumo(fazenda) {
    document.getElementById('resumo-area').textContent = fazenda.areaHa + ' ha';
    document.getElementById('resumo-talhoes').textContent = fazenda.talhoes.length;
    document.getElementById('resumo-cultura').textContent = culturasAtuais(fazenda);
    document.getElementById('resumo-safra').textContent = fazenda.safraAtual || '—';
  }

  // `#state=empty` (demo do prototype-nav) força a seção de Talhões a
  // renderizar vazia, mesmo padrão já usado em fazendas.js/dashboard.js.
  function renderTalhoes(fazenda) {
    var isEmptyDemo = /state=empty/.test(location.hash);
    var talhoes = isEmptyDemo ? [] : fazenda.talhoes;
    var listEl = document.getElementById('talhoes-list');
    var emptyEl = document.getElementById('talhoes-empty');
    var showEmpty = talhoes.length === 0;

    listEl.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      listEl.innerHTML = talhoes.map(buildTalhaoRowHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  // ---------- "Nova anotação" (cabeçalho): abre o fluxo padrão com a
  // fazenda já pré-selecionada. ----------
  document.getElementById('nova-anotacao-fazenda-btn').addEventListener('click', function () {
    if (!currentFazendaId) return;
    window.location.href = 'nova-anotacao.html?fazenda=' + encodeURIComponent(currentFazendaId);
  });

  // ---------- "+ Cadastrar primeiro talhão" — cadastro/detalhe de talhão
  // continua fora do escopo desta tela (fica em Fazendas > Detalhe de
  // Fazenda, a tela CADASTRAL). ----------
  document.getElementById('talhoes-empty-btn').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    window.setTimeout(function () { btn.disabled = false; }, 300);
  });

  // ---------- Clique num talhão navega pro Detalhe do talhão ----------
  document.getElementById('talhoes-list').addEventListener('click', function (event) {
    var row = event.target.closest('.talhao-row');
    if (!row || !currentFazendaId) return;
    window.location.href = 'talhao-detalhe.html#fazenda=' + currentFazendaId + '&talhao=' + row.dataset.talhaoId;
  });

  // ---------- Toast de sucesso (nova anotação salva em nova-anotacao.js) —
  // mesmo padrão Feedback-como-toast já usado em fazendas.js/cadastros.js. ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success fazenda-detalhe-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
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

  // ---------- Boot: resolve a fazenda pelo `id` do hash ----------
  function boot() {
    var match = location.hash.match(/id=([\w-]+)/);
    var id = match ? match[1] : null;
    var fazenda = id ? window.NiveloFazendas.findById(id) : null;

    if (!fazenda) {
      document.getElementById('fazenda-detalhe-not-found').hidden = false;
      document.getElementById('fazenda-detalhe-content').hidden = true;
      return;
    }

    currentFazendaId = fazenda.id;
    document.getElementById('fazenda-detalhe-not-found').hidden = true;
    document.getElementById('fazenda-detalhe-content').hidden = false;
    renderHeader(fazenda);
    renderResumo(fazenda);
    renderTalhoes(fazenda);

    var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacao.success');
    if (novaAnotacaoMessage) {
      sessionStorage.removeItem('nivelo.novaanotacao.success');
      showSuccessToast(novaAnotacaoMessage);
    }
  }

  boot();
})();
