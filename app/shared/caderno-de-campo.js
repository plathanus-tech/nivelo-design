(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var gridEl = document.getElementById('caderno-grid');
  var emptyGlobalEl = document.getElementById('caderno-empty-global');

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function formatDataHora(iso) {
    var d = new Date(iso);
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' às ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function formatBRL(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Fazendas criadas pelo wizard (nova-fazenda.js) não coletam Cidade/Estado —
  // mesmo guard já usado em fazendas.js/fazenda-detalhe-cadastro.js.
  function formatLocation(fazenda) {
    if (fazenda.cidade && fazenda.estado) return fazenda.cidade + ', ' + fazenda.estado;
    return fazenda.cidade || fazenda.estado || '';
  }

  // ---------- Resumo do Caderno por fazenda ----------
  // Puramente informativo (ver app/CLAUDE.md): nunca somamos colheitas em uma
  // única quantidade (unidades incompatíveis entre talhões, mesmo princípio
  // já usado em Estoque — Compras nunca soma Saca+Kg+Litro), por isso
  // colheitas é sempre uma CONTAGEM de registros, nunca um total.
  function buildResumo(anotacoes) {
    var resumo = { despesas: 0, vendas: 0, colheitas: 0, total: anotacoes.length, ultima: null };
    anotacoes.forEach(function (a) {
      if (a.tipo === 'despesa') resumo.despesas += a.valor;
      if (a.tipo === 'venda') resumo.vendas += a.valor;
      if (a.tipo === 'colheita') resumo.colheitas += 1;
      if (!resumo.ultima || a.dataHora > resumo.ultima) resumo.ultima = a.dataHora;
    });
    return resumo;
  }

  function buildCardHTML(fazenda) {
    var location = formatLocation(fazenda);
    var anotacoes = window.NiveloCaderno.listByFazenda(fazenda.id);
    var resumo = buildResumo(anotacoes);

    return (
      '<div class="card caderno-fazenda-card" data-fazenda-id="' + fazenda.id + '" data-action="ver-caderno" tabindex="0" role="button" aria-label="Ver caderno de ' + fazenda.nome + '">' +
        '<div class="cardHeader">' +
          '<h2 class="title">' + fazenda.nome + '</h2>' +
        '</div>' +
        '<div class="caderno-fazenda-card-body">' +
          (location ? '<div class="caderno-fazenda-card-location text-body-s"><i data-lucide="map-pin" width="16" height="16"></i>' + location + '</div>' : '') +
          '<dl class="caderno-fazenda-card-stats text-body-s">' +
            '<div><dt class="text-12-regular">Talhões</dt><dd>' + fazenda.talhoes.length + ' talhões</dd></div>' +
            '<div><dt class="text-12-regular">Anotações</dt><dd>' + resumo.total + (resumo.total === 1 ? ' registrada' : ' registradas') + '</dd></div>' +
          '</dl>' +
          '<span class="caderno-fazenda-card-updated text-body-xs">' +
            (resumo.ultima ? 'Última anotação: ' + formatDataHora(resumo.ultima) : 'Nenhuma anotação registrada ainda') +
          '</span>' +
          '<div class="caderno-fazenda-card-summary">' +
            '<span class="caderno-fazenda-card-summary-title text-12-regular">Registros no caderno</span>' +
            '<div class="caderno-fazenda-card-summary-row">' +
              '<span class="caderno-fazenda-card-summary-item text-body-xs"><i data-lucide="arrow-up-circle" width="14" height="14"></i>Despesas: ' + formatBRL(resumo.despesas) + '</span>' +
              '<span class="caderno-fazenda-card-summary-item text-body-xs"><i data-lucide="arrow-down-circle" width="14" height="14"></i>Vendas: ' + formatBRL(resumo.vendas) + '</span>' +
              '<span class="caderno-fazenda-card-summary-item text-body-xs"><i data-lucide="wheat" width="14" height="14"></i>Colheitas: ' + resumo.colheitas + ' registro' + (resumo.colheitas === 1 ? '' : 's') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="caderno-fazenda-card-footer">' +
          '<button type="button" class="caderno-fazenda-card-link text-body-s" data-action="ver-caderno">Ver caderno <i data-lucide="arrow-right" width="16" height="16"></i></button>' +
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

  // ---------- Clique no card / "Ver caderno" navega pra Detalhe da fazenda
  // OPERACIONAL (fazenda-detalhe.html — Jornada Caderno de Campo), não pra
  // fazenda-detalhe-cadastro.html (Jornada Fazendas). ----------
  gridEl.addEventListener('click', function (event) {
    var target = event.target.closest('[data-action="ver-caderno"]');
    if (!target) return;
    var card = target.closest('[data-fazenda-id]');
    if (!card) return;
    window.location.href = 'fazenda-detalhe.html#id=' + card.dataset.fazendaId;
  });

  document.getElementById('nova-anotacao-btn').addEventListener('click', function () {
    window.location.href = 'nova-anotacao.html';
  });

  document.getElementById('caderno-empty-global-btn').addEventListener('click', function () {
    window.location.href = 'nova-fazenda.html';
  });

  // ---------- Toast de sucesso (mesmo padrão Feedback-como-toast de
  // fazendas.js/cadastros.js). Consumido só uma vez — a flag em
  // sessionStorage é escrita por nova-anotacao.js ao concluir o registro. ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success caderno-toast';
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

  var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacao.success');
  if (novaAnotacaoMessage) {
    sessionStorage.removeItem('nivelo.novaanotacao.success');
    showSuccessToast(novaAnotacaoMessage);
  }

  render();
})();
