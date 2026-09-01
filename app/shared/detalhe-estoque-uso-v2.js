(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatNum(n) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function formatCurrency(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  var currentProduto = null;

  function renderResumo() {
    var produto = currentProduto;
    document.getElementById('rd-saldo-total').textContent = formatNum(produto.quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase();
    document.getElementById('rd-custo-medio').textContent = formatCurrency(produto.custoMedio) + '/' + produto.unidadeMedidaSigla.toLowerCase();
    document.getElementById('rd-valor-estoque').textContent = formatCurrency(produto.quantidade * produto.custoMedio);
    document.getElementById('rd-ultima-compra').textContent = formatDate(produto.ultimaCompra);
  }

  function renderDepositos() {
    var produto = currentProduto;
    var conversao = getConversao(produto.unidadeMedidaSigla);
    var grid = document.getElementById('rd-depositos-grid');
    grid.innerHTML = produto.depositos.map(function (d) {
      var conversaoLine = conversao
        ? '<div class="detalhev2-deposito-conversao text-body-xs">' + formatNum(d.quantidade * conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>'
        : '';
      return (
        '<div class="detalhev2-deposito-item">' +
          '<div class="detalhev2-deposito-nome text-subtitle-s">' + d.deposito + '</div>' +
          '<div class="detalhev2-deposito-qty">' + formatNum(d.quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + '</div>' +
          conversaoLine +
        '</div>'
      );
    }).join('');
  }

  // ---------- Histórico ----------
  // ENTRADA: Fornecedor/Origem = fornecedor; Depósito = depósito; Destino/
  // Talhão não se aplica (omitido). CONSUMO: Fornecedor/Origem = "—";
  // Depósito não se aplica (este fluxo não tem depósito de saída, ver
  // CLAUDE.md); Destino/Talhão = "Fazenda X · Talhão Y".
  var HISTORICO_ICONS = { entrada: 'arrow-down-circle', consumo: 'arrow-up-circle', ajuste: 'sliders-horizontal' };
  var HISTORICO_LABELS = { entrada: 'Entrada', consumo: 'Consumo', ajuste: 'Ajuste de estoque' };

  function renderHistorico() {
    var produto = currentProduto;
    var timeline = document.getElementById('historico-timeline');
    var entries = produto.historico.slice().reverse();
    timeline.innerHTML = entries.map(function (entry) {
      var unitLower = produto.unidadeMedidaSigla.toLowerCase();
      var metaParts = [];

      if (entry.tipo === 'entrada') {
        metaParts.push('Fornecedor/Origem: ' + (entry.fornecedor || '—'));
        metaParts.push('Depósito: ' + (entry.deposito || '—'));
      } else if (entry.tipo === 'consumo') {
        metaParts.push('Fornecedor/Origem: —');
        var destino = entry.fazendaNome
          ? entry.fazendaNome + (entry.talhaoNome ? ' · ' + entry.talhaoNome : '')
          : '—';
        metaParts.push('Destino/Talhão: ' + destino);
      } else if (entry.tipo === 'ajuste') {
        metaParts.push('Depósito: ' + (entry.deposito || '—'));
      }

      var extraParts = [];
      if (entry.tipo === 'entrada' && entry.precoUnitario != null) {
        extraParts.push('Custo: ' + formatCurrency(entry.precoUnitario) + '/' + unitLower + ' (total ' + formatCurrency(entry.valorTotal) + ')');
      }
      if (entry.tipo === 'consumo' && entry.custo != null) {
        extraParts.push('Custo: ' + formatCurrency(entry.custo));
      }
      if (entry.tipo === 'entrada' && entry.documento) {
        extraParts.push('Documento/NF-e: ' + entry.documento);
      }
      if (entry.observacao) {
        extraParts.push('<span class="detalhev2-obs-note">' + entry.observacao + '</span>');
      }

      var quantidadeLabel = (entry.quantidade > 0 && entry.tipo === 'ajuste' ? '+' : '') + formatNum(entry.quantidade) + ' ' + unitLower;

      return '<li class="detalhe-estoque-timeline-item">' +
        '<span class="detalhe-estoque-timeline-icon"><i data-lucide="' + (HISTORICO_ICONS[entry.tipo] || 'circle') + '" width="16" height="16"></i></span>' +
        '<div class="detalhe-estoque-timeline-body">' +
          '<div class="detalhe-estoque-timeline-label">' + (HISTORICO_LABELS[entry.tipo] || entry.tipo) + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">' + formatDate(entry.data) + ' · ' + quantidadeLabel + ' · ' + metaParts.join(' · ') + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">Saldo após: ' + formatNum(entry.saldoApos) + ' ' + unitLower + '</div>' +
          (extraParts.length ? '<div class="detalhe-estoque-timeline-extra usov2-destino-note">' + extraParts.join(' · ') + '</div>' : '') +
        '</div>' +
        '</li>';
    }).join('');
    if (window.lucide) lucide.createIcons();
  }

  function refreshAll() {
    renderResumo();
    renderDepositos();
    renderHistorico();
  }

  // ---------- Toast ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success estoque-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div><div class="message">' + message + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  function openModal(overlay) { overlay.hidden = false; }
  function closeModal(overlay) { overlay.hidden = true; }
  function wireModalDismiss(overlay, closeBtnId, cancelBtnId) {
    document.getElementById(closeBtnId).addEventListener('click', function () { closeModal(overlay); });
    document.getElementById(cancelBtnId).addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (event) { if (event.target === overlay) closeModal(overlay); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !overlay.hidden) closeModal(overlay); });
  }

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
      if (trigger.disabled) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
    }
    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }
    trigger.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
    menu.addEventListener('click', function (event) { var o = event.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    return { selectOption: selectOption, reset: reset, trigger: trigger };
  }

  // ---------- Modal: Registrar consumo (réplica de estoque-v2.js) ----------
  var consumoOverlay = document.getElementById('consumo-dialog-overlay');
  var consumoRecapTitle = document.getElementById('consumo-recap-title');
  var consumoRecapSku = document.getElementById('consumo-recap-sku');
  var consumoRecapUnidade = document.getElementById('consumo-recap-unidade');
  var consumoRecapDisponivel = document.getElementById('consumo-recap-disponivel');
  var consumoQuantidadeField = document.getElementById('consumo-quantidade-field');
  var consumoQuantidadeInput = document.getElementById('consumo-quantidade-input');
  var consumoDataInput = document.getElementById('consumo-data-input');
  var consumoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'consumo-data-field', triggerId: 'consumo-data-trigger', valueId: 'consumo-data-value',
    hiddenInputId: 'consumo-data-input', popoverId: 'consumo-data-popover', placeholder: 'Selecionar data'
  });
  var consumoFazendaField = document.getElementById('consumo-fazenda-field');
  var consumoFazendaMenu = document.getElementById('consumo-fazenda-menu');
  var consumoTalhaoField = document.getElementById('consumo-talhao-field');
  var consumoTalhaoMenu = document.getElementById('consumo-talhao-menu');
  var consumoTalhaoTrigger = consumoTalhaoField.querySelector('[data-dropdown-trigger]');
  var consumoCustoInput = document.getElementById('consumo-custo-input');
  var consumoObservacaoInput = document.getElementById('consumo-observacao-input');
  var consumoConfirmBtn = document.getElementById('consumo-confirm');

  var CONSUMO_FAZENDAS = (window.NiveloFazendas && window.NiveloFazendas.list()) || [];
  consumoFazendaMenu.innerHTML = CONSUMO_FAZENDAS.map(function (f) {
    return '<div class="option" data-value="' + f.id + '">' + f.nome + '</div>';
  }).join('');
  function findConsumoFazenda(id) {
    return CONSUMO_FAZENDAS.filter(function (f) { return f.id === id; })[0] || null;
  }
  function populateConsumoTalhoes(fazenda) {
    var talhoes = fazenda ? fazenda.talhoes : [];
    consumoTalhaoMenu.innerHTML = talhoes.map(function (t) {
      return '<div class="option" data-value="' + t.id + '">' + t.nome + '</div>';
    }).join('');
    consumoTalhaoTrigger.disabled = !fazenda;
    consumoTalhaoField.dataset.value = '';
    consumoTalhaoField.querySelector('[data-dropdown-value]').textContent = fazenda ? 'Selecione o talhão' : 'Selecione a fazenda primeiro';
  }
  var consumoTalhaoDropdown = initDropdown(consumoTalhaoField, function () { consumoTalhaoField.classList.remove('error'); });
  var consumoFazendaDropdown = initDropdown(consumoFazendaField, function (fazendaId) {
    consumoFazendaField.classList.remove('error');
    populateConsumoTalhoes(findConsumoFazenda(fazendaId));
  });

  function updateConsumoCusto() {
    var quantidade = Number(consumoQuantidadeInput.value) || 0;
    consumoCustoInput.value = currentProduto ? formatCurrency(currentProduto.custoMedio * quantidade) : 'R$ 0,00';
  }
  consumoQuantidadeInput.addEventListener('input', updateConsumoCusto);

  function openRegistrarConsumoModal() {
    var produto = currentProduto;
    consumoRecapTitle.textContent = 'Estoque de Uso · ' + produto.produto;
    consumoRecapSku.textContent = produto.sku || '—';
    consumoRecapUnidade.textContent = produto.unidadeMedidaSigla || '—';
    consumoRecapDisponivel.textContent = formatNum(produto.quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase();
    consumoQuantidadeInput.value = '';
    consumoDataPicker.setValue(todayISO());
    consumoFazendaDropdown.reset('', 'Selecione a fazenda');
    consumoFazendaField.classList.remove('error');
    populateConsumoTalhoes(null);
    consumoTalhaoField.classList.remove('error');
    updateConsumoCusto();
    consumoObservacaoInput.value = '';
    consumoQuantidadeField.classList.remove('error');
    openModal(consumoOverlay);
    consumoQuantidadeInput.focus();
  }
  wireModalDismiss(consumoOverlay, 'consumo-dialog-close', 'consumo-cancel');
  consumoConfirmBtn.addEventListener('click', function () {
    var produto = currentProduto;
    var quantidade = Number(consumoQuantidadeInput.value);
    var data = consumoDataInput.value;
    var observacao = consumoObservacaoInput.value.trim() || null;

    var quantidadeInvalid = !(quantidade > 0 && quantidade <= produto.quantidade);
    consumoQuantidadeField.classList.toggle('error', quantidadeInvalid);
    var fazendaInvalid = !consumoFazendaField.dataset.value;
    consumoFazendaField.classList.toggle('error', fazendaInvalid);
    var talhaoInvalid = !consumoTalhaoField.dataset.value;
    consumoTalhaoField.classList.toggle('error', talhaoInvalid);
    if (quantidadeInvalid || fazendaInvalid || talhaoInvalid) return;

    var fazenda = findConsumoFazenda(consumoFazendaField.dataset.value);
    var talhao = fazenda.talhoes.filter(function (t) { return t.id === consumoTalhaoField.dataset.value; })[0];

    window.NiveloEstoqueUsoV2.registrarConsumo(produto.codigo, {
      quantidade: quantidade, data: data,
      fazendaId: fazenda.id, fazendaNome: fazenda.nome,
      talhaoId: talhao.id, talhaoNome: talhao.nome,
      observacao: observacao
    });

    closeModal(consumoOverlay);
    refreshAll();
    showSuccessToast('Consumo registrado com sucesso', formatNum(quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + ' de ' + produto.produto + ' baixados do estoque de uso (' + fazenda.nome + ' · ' + talhao.nome + ').');
  });

  // ---------- Modal: Ajustar estoque (réplica de estoque-v2.js) ----------
  var ajusteOverlay = document.getElementById('ajuste-dialog-overlay');
  var ajusteProdutoNome = document.getElementById('ajuste-produto-nome');
  var ajusteDepositoField = document.getElementById('ajuste-deposito-field');
  var ajusteDepositoMenu = document.getElementById('ajuste-deposito-menu');
  var ajusteSaldoSistemaInput = document.getElementById('ajuste-saldo-sistema-input');
  var ajusteSaldoConferidoField = document.getElementById('ajuste-saldo-conferido-field');
  var ajusteSaldoConferidoInput = document.getElementById('ajuste-saldo-conferido-input');
  var ajusteDiferencaInput = document.getElementById('ajuste-diferenca-input');
  var ajusteObservacaoInput = document.getElementById('ajuste-observacao-input');
  var ajusteConfirmBtn = document.getElementById('ajuste-confirm');

  function currentAjusteDeposito() {
    var nome = ajusteDepositoField.dataset.value;
    return currentProduto.depositos.filter(function (d) { return d.deposito === nome; })[0] || null;
  }
  function updateAjusteSaldoSistema() {
    var deposito = currentAjusteDeposito();
    ajusteSaldoSistemaInput.value = deposito ? formatNum(deposito.quantidade) : '0';
    updateAjusteDiferenca();
  }
  function updateAjusteDiferenca() {
    var deposito = currentAjusteDeposito();
    var saldoSistema = deposito ? deposito.quantidade : 0;
    if (ajusteSaldoConferidoInput.value === '' || isNaN(Number(ajusteSaldoConferidoInput.value))) {
      ajusteDiferencaInput.value = '';
      return;
    }
    var diferenca = Number(ajusteSaldoConferidoInput.value) - saldoSistema;
    ajusteDiferencaInput.value = (diferenca > 0 ? '+' : '') + formatNum(diferenca);
  }
  var ajusteDepositoDropdown = initDropdown(ajusteDepositoField, function () { updateAjusteSaldoSistema(); });
  ajusteSaldoConferidoInput.addEventListener('input', updateAjusteDiferenca);

  function openAjustarEstoqueModal() {
    var produto = currentProduto;
    ajusteProdutoNome.textContent = produto.produto;
    ajusteDepositoMenu.innerHTML = produto.depositos.map(function (d) {
      return '<div class="option" data-value="' + d.deposito + '">' + d.deposito + '</div>';
    }).join('');
    var alvo = produto.depositos[0] && produto.depositos[0].deposito;
    if (alvo) {
      var optionEl = ajusteDepositoMenu.querySelector('.option[data-value="' + alvo + '"]');
      if (optionEl) ajusteDepositoDropdown.selectOption(optionEl);
    }
    ajusteSaldoConferidoInput.value = '';
    ajusteDiferencaInput.value = '';
    ajusteObservacaoInput.value = '';
    ajusteSaldoConferidoField.classList.remove('error');
    updateAjusteSaldoSistema();
    openModal(ajusteOverlay);
    ajusteSaldoConferidoInput.focus();
  }
  wireModalDismiss(ajusteOverlay, 'ajuste-dialog-close', 'ajuste-cancel');
  ajusteConfirmBtn.addEventListener('click', function () {
    var deposito = ajusteDepositoField.dataset.value;
    var invalid = ajusteSaldoConferidoInput.value === '' || isNaN(Number(ajusteSaldoConferidoInput.value)) || Number(ajusteSaldoConferidoInput.value) < 0;
    ajusteSaldoConferidoField.classList.toggle('error', invalid);
    if (invalid) return;
    var saldoConferido = Number(ajusteSaldoConferidoInput.value);
    var observacao = ajusteObservacaoInput.value.trim() || null;
    window.NiveloEstoqueUsoV2.ajustarEstoque(currentProduto.codigo, deposito, saldoConferido, observacao);
    closeModal(ajusteOverlay);
    refreshAll();
    showSuccessToast('Estoque ajustado com sucesso', 'Saldo de ' + deposito + ' (' + currentProduto.produto + ') atualizado para ' + formatNum(saldoConferido) + ' ' + currentProduto.unidadeMedidaSigla.toLowerCase() + '.');
  });

  // ---------- Ações do cabeçalho ----------
  var maisPopoverEl = document.getElementById('detalhe-actions-popover');
  var maisBtnEl = document.getElementById('acao-mais-btn');
  function outsideMaisPopoverHandler(event) {
    if (maisPopoverEl.contains(event.target) || event.target === maisBtnEl || maisBtnEl.contains(event.target)) return;
    closeMaisPopover();
  }
  function openMaisPopover() {
    var rect = maisBtnEl.getBoundingClientRect();
    maisPopoverEl.style.top = (rect.bottom + 4) + 'px';
    maisPopoverEl.style.right = (window.innerWidth - rect.right) + 'px';
    maisPopoverEl.style.left = 'auto';
    maisPopoverEl.hidden = false;
    window.setTimeout(function () { document.addEventListener('click', outsideMaisPopoverHandler); }, 0);
  }
  function closeMaisPopover() {
    maisPopoverEl.hidden = true;
    document.removeEventListener('click', outsideMaisPopoverHandler);
  }
  maisBtnEl.addEventListener('click', function () { if (maisPopoverEl.hidden) openMaisPopover(); else closeMaisPopover(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !maisPopoverEl.hidden) closeMaisPopover(); });

  document.getElementById('acao-ajustar-estoque-btn').addEventListener('click', function () {
    closeMaisPopover();
    openAjustarEstoqueModal();
  });
  document.getElementById('acao-registrar-entrada-btn').addEventListener('click', function () {
    window.location.href = 'registrar-entrada-estoque-uso-v2.html?codigo=' + currentProduto.codigo;
  });
  document.getElementById('acao-registrar-consumo-btn').addEventListener('click', function () {
    closeMaisPopover();
    openRegistrarConsumoModal();
  });

  // ---------- Boot ----------
  function boot() {
    var match = location.hash.match(/codigo=([\w-]+)/);
    var codigo = match ? match[1] : null;
    var produto = codigo ? window.NiveloEstoqueUsoV2.findByCodigo(codigo) : null;

    if (!produto) {
      document.getElementById('detalhe-not-found').hidden = false;
      document.getElementById('detalhe-content').hidden = true;
      document.querySelector('.detalhev2-header-actions').hidden = true;
      return;
    }

    currentProduto = produto;
    document.getElementById('detalhe-not-found').hidden = true;
    document.getElementById('detalhe-content').hidden = false;
    document.getElementById('detalhe-titulo').textContent = produto.produto;
    refreshAll();
  }

  boot();
})();
