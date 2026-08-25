(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_TALHAO = {
    'em-producao': { status: 'success', label: 'Em produção' },
    'disponivel': { status: 'info', label: 'Disponível' },
    'em-pousio': { status: 'warning', label: 'Em pouso' }
  };

  var TIPO_ANOTACAO = {
    despesa: { icon: 'arrow-up-circle', label: 'Despesa' },
    venda: { icon: 'arrow-down-circle', label: 'Venda' },
    colheita: { icon: 'wheat', label: 'Colheita' },
    anotacao: { icon: 'file-text', label: 'Anotação' }
  };

  var currentFazenda = null;
  var currentTalhao = null;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDataHora(iso) {
    var d = new Date(iso);
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' às ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function formatBRL(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ---------- Dropdown genérico (mesmo padrão de fazenda-detalhe-cadastro.js/
  // novo-estoque.js: menu em `position:fixed` calculado via JS, escapa do
  // `overflow` do `.body` do Dialog). ----------
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

    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
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
      if (event.key === 'Escape') close();
    });

    return { selectOption: selectOption };
  }

  // ---------- Render ----------
  function renderHeader() {
    var badge = STATUS_TALHAO[currentTalhao.status];
    document.getElementById('talhao-detalhe-nome').textContent = currentTalhao.nome;
    document.getElementById('talhao-detalhe-fazenda-nome').textContent = currentFazenda.nome;
    var statusEl = document.getElementById('talhao-detalhe-status');
    statusEl.dataset.status = badge.status;
    statusEl.innerHTML = '<span class="badgeDot"></span>' + badge.label;
    document.title = currentTalhao.nome + ' — ' + currentFazenda.nome + ' — Nivelo';

    document.getElementById('talhao-detalhe-back-label').textContent = currentFazenda.nome;
    document.getElementById('talhao-detalhe-back').href = 'fazenda-detalhe.html#id=' + currentFazenda.id;
    if (window.lucide) lucide.createIcons();
  }

  function renderResumo() {
    document.getElementById('resumo-area').textContent = currentTalhao.areaHa + ' ha';
    document.getElementById('resumo-cultura').textContent = currentTalhao.cultura || 'Sem cultura';
    document.getElementById('resumo-safra').textContent = currentTalhao.safra || '—';

    var anotacoes = window.NiveloCaderno.listByTalhao(currentFazenda.id, currentTalhao.id);
    var despesas = 0, vendas = 0, colheitas = 0;
    anotacoes.forEach(function (a) {
      if (a.tipo === 'despesa') despesas += a.valor;
      if (a.tipo === 'venda') vendas += a.valor;
      if (a.tipo === 'colheita') colheitas += 1;
    });
    document.getElementById('resumo-despesas').textContent = formatBRL(despesas);
    document.getElementById('resumo-vendas').textContent = formatBRL(vendas);
    document.getElementById('resumo-colheitas').textContent = colheitas + (colheitas === 1 ? ' registro' : ' registros');

    return anotacoes;
  }

  // "Kg" é invariável (nunca "kgs"); "Saca"/"Litro" pluralizam normalmente.
  function formatUnidade(quantidade, unidade) {
    if (unidade === 'Kg') return 'kg';
    var singular = unidade.toLowerCase();
    return quantidade === 1 ? singular : singular + 's';
  }

  // Linha 1: Tipo + valor/quantidade lado a lado (era a observação que
  // ficava ao lado do Tipo, e o valor num bloco separado à direita da linha
  // inteira — pedido explícito de inverter os dois). Linha 2: observação
  // (própria, só quando existir). Linha 3: data/hora.
  function buildAnotacaoRowHTML(a) {
    var tipo = TIPO_ANOTACAO[a.tipo];
    var valorText = a.tipo === 'colheita' ? a.quantidade + ' ' + formatUnidade(a.quantidade, a.unidade)
      : a.tipo === 'anotacao' ? ''
      : formatBRL(a.valor);
    return (
      '<div class="anotacao-row">' +
        '<span class="anotacao-row-icon" data-tipo="' + a.tipo + '"><i data-lucide="' + tipo.icon + '" width="18" height="18"></i></span>' +
        '<div class="anotacao-row-body">' +
          '<div class="anotacao-row-top">' +
            '<strong class="anotacao-row-tipo text-body-s">' + tipo.label + '</strong>' +
            (valorText ? '<span class="anotacao-row-value text-body-s">' + valorText + '</span>' : '') +
          '</div>' +
          (a.observacao ? '<div class="anotacao-row-observacao text-body-s">' + a.observacao + '</div>' : '') +
          '<div class="anotacao-row-meta text-body-xs">' + formatDataHora(a.dataHora) + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderAnotacoes(anotacoes) {
    var ordenadas = anotacoes.slice().sort(function (a, b) { return b.dataHora.localeCompare(a.dataHora); });
    var listEl = document.getElementById('anotacoes-list');
    var emptyEl = document.getElementById('anotacoes-empty');
    var showEmpty = ordenadas.length === 0;

    listEl.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      listEl.innerHTML = ordenadas.map(buildAnotacaoRowHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  function renderAll() {
    renderHeader();
    renderAnotacoes(renderResumo());
  }

  // ---------- Ações do cabeçalho ----------
  document.getElementById('nova-anotacao-talhao-btn').addEventListener('click', function () {
    window.location.href = 'nova-anotacao.html?fazenda=' + encodeURIComponent(currentFazenda.id) + '&talhao=' + encodeURIComponent(currentTalhao.id);
  });

  // ---------- Modal: Alterar status do talhão ----------
  var statusOverlay = document.getElementById('status-dialog-overlay');
  var statusField = document.getElementById('status-field');
  var statusDropdown = initDropdown(statusField);

  document.getElementById('alterar-status-btn').addEventListener('click', function () {
    var optionEl = statusField.querySelector('.option[data-value="' + currentTalhao.status + '"]');
    if (optionEl) statusDropdown.selectOption(optionEl);
    statusOverlay.hidden = false;
  });

  function closeStatusDialog() { statusOverlay.hidden = true; }
  document.getElementById('status-dialog-close').addEventListener('click', closeStatusDialog);
  document.getElementById('status-dialog-cancel').addEventListener('click', closeStatusDialog);
  statusOverlay.addEventListener('click', function (event) {
    if (event.target === statusOverlay) closeStatusDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !statusOverlay.hidden) closeStatusDialog();
  });

  document.getElementById('status-dialog-confirm').addEventListener('click', function () {
    var novoStatus = statusField.dataset.value;
    if (!novoStatus) { closeStatusDialog(); return; }
    currentTalhao.status = novoStatus;
    closeStatusDialog();
    renderHeader();
    showSuccessToast('Status do talhão atualizado com sucesso.');
  });

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success talhao-detalhe-toast';
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

  // ---------- Boot: resolve fazenda + talhão pelo hash `#fazenda=&talhao=` ----------
  function boot() {
    var fazendaMatch = location.hash.match(/fazenda=([\w-]+)/);
    var talhaoMatch = location.hash.match(/talhao=([\w-]+)/);
    var fazendaId = fazendaMatch ? fazendaMatch[1] : null;
    var talhaoId = talhaoMatch ? talhaoMatch[1] : null;

    var fazenda = fazendaId ? window.NiveloFazendas.findById(fazendaId) : null;
    var talhao = fazenda && talhaoId ? fazenda.talhoes.filter(function (t) { return t.id === talhaoId; })[0] : null;

    if (!fazenda || !talhao) {
      document.getElementById('talhao-detalhe-not-found').hidden = false;
      document.getElementById('talhao-detalhe-content').hidden = true;
      return;
    }

    currentFazenda = fazenda;
    currentTalhao = talhao;
    document.getElementById('talhao-detalhe-not-found').hidden = true;
    document.getElementById('talhao-detalhe-content').hidden = false;
    renderAll();

    var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacao.success');
    if (novaAnotacaoMessage) {
      sessionStorage.removeItem('nivelo.novaanotacao.success');
      showSuccessToast(novaAnotacaoMessage);
    }
  }

  boot();
})();
