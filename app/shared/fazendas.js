(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var gridEl = document.getElementById('fazendas-grid');
  var emptyGlobalEl = document.getElementById('fazendas-empty-global');

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDatePt(isoDate) {
    var parts = isoDate.split('-');
    return pad2(Number(parts[2])) + '/' + pad2(Number(parts[1])) + '/' + parts[0];
  }

  // Fazendas criadas pelo wizard de cadastro (nova-fazenda.js) não coletam
  // Cidade/Estado (campo fora do escopo pedido pro fluxo) — sem esse guard,
  // o card mostraria uma localização quebrada ", ".
  function formatLocation(fazenda) {
    if (fazenda.cidade && fazenda.estado) return fazenda.cidade + ', ' + fazenda.estado;
    return fazenda.cidade || fazenda.estado || '';
  }

  function buildCardHTML(fazenda) {
    var location = formatLocation(fazenda);
    return (
      '<div class="card fazenda-card" data-fazenda-id="' + fazenda.id + '" data-action="ver-fazenda" tabindex="0" role="button" aria-label="Ver ' + fazenda.nome + '">' +
        '<div class="cardHeader">' +
          '<h2 class="title">' + fazenda.nome + '</h2>' +
        '</div>' +
        '<div class="fazenda-card-body">' +
          (location ? '<div class="fazenda-card-location text-body-s"><i data-lucide="map-pin" width="16" height="16"></i>' + location + '</div>' : '') +
          '<dl class="fazenda-card-stats text-body-s">' +
            '<div><dt class="text-12-regular">Área total</dt><dd>' + fazenda.areaHa + ' ha</dd></div>' +
            '<div><dt class="text-12-regular">Talhões</dt><dd>' + fazenda.talhoes.length + ' talhões</dd></div>' +
          '</dl>' +
          '<span class="fazenda-card-updated text-body-xs">Última atualização: ' + formatDatePt(fazenda.atualizadoEm) + '</span>' +
        '</div>' +
        '<div class="fazenda-card-footer">' +
          '<button type="button" class="fazenda-card-link text-body-s" data-action="ver-fazenda">Ver fazenda <i data-lucide="arrow-right" width="16" height="16"></i></button>' +
        '</div>' +
      '</div>'
    );
  }

  function render() {
    var fazendas = window.NiveloFazendas.list();
    var isEmptyDemo = /state=empty/.test(location.hash);
    var showEmpty = isEmptyDemo || fazendas.length === 0;

    gridEl.hidden = showEmpty;
    emptyGlobalEl.hidden = !showEmpty;

    if (showEmpty) return;

    gridEl.innerHTML = fazendas.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- "Ver fazenda"/clique no card navega pra Detalhe da fazenda
  // CADASTRAL (fazenda-detalhe-cadastro.html — ficha de consulta + gestão de
  // talhões, Jornada Fazendas). Existe uma segunda tela de "Detalhe da
  // fazenda", a OPERACIONAL (fazenda-detalhe.html), mas essa pertence à
  // Jornada Caderno de Campo e não é alcançada por este clique — ver
  // app/CLAUDE.md. "+ Nova fazenda"/"+ Cadastrar primeira fazenda" navegam
  // pra nova-fazenda.html (wizard de cadastro, 2026-07-29) — antes disso
  // eram flash-disable, sem tela pronta. ----------
  gridEl.addEventListener('click', function (event) {
    var target = event.target.closest('[data-action="ver-fazenda"]');
    if (!target) return;
    var card = target.closest('[data-fazenda-id]');
    if (!card) return;
    window.location.href = 'fazenda-detalhe-cadastro.html#id=' + card.dataset.fazendaId;
  });

  document.getElementById('new-fazenda-btn').addEventListener('click', function () {
    window.location.href = 'nova-fazenda.html';
  });

  document.getElementById('fazendas-empty-global-btn').addEventListener('click', function () {
    window.location.href = 'nova-fazenda.html';
  });

  // ---------- Toast de sucesso (mesmo padrão de fazenda-detalhe-cadastro.js/
  // cadastros.js: Feedback reaproveitado como toast). Consumido só uma vez —
  // a flag em sessionStorage é escrita por nova-fazenda.js ao concluir o
  // cadastro. ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success fazendas-toast';
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

  var novaFazendaMessage = sessionStorage.getItem('nivelo.novafazenda.success');
  if (novaFazendaMessage) {
    sessionStorage.removeItem('nivelo.novafazenda.success');
    showSuccessToast(novaFazendaMessage);
  }

  // `#state=created` mostra o mesmo toast direto, sem precisar concluir o
  // cadastro de verdade — variante de demonstração pro prototype-nav (mesma
  // convenção de `#state=` já usada em outras telas do sistema).
  if (/state=created/.test(location.hash)) {
    showSuccessToast('Fazenda cadastrada com sucesso');
  }

  render();
})();
