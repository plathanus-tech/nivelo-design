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

  // Segundo indicador do Resumo: dinâmico conforme a unidade BASE do produto
  // (nunca hardcoded "Peso total" — ver rules.md).
  var INDICADOR_LABEL_POR_BASE = {
    KG: 'Peso total',
    LT: 'Volume total',
    UN: 'Total'
  };

  var HISTORICO_ICONS = {
    entrada: 'arrow-down-circle',
    saida: 'arrow-up-circle',
    transferencia: 'shuffle',
    ajuste: 'sliders-horizontal'
  };
  var HISTORICO_LABELS = {
    entrada: 'Entrada',
    saida: 'Saída',
    transferencia: 'Transferência',
    ajuste: 'Ajuste de estoque'
  };

  var currentProduto = null;

  function renderResumo() {
    var produto = currentProduto;
    document.getElementById('rd-saldo-total').textContent = formatNum(produto.quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase();

    var conversao = getConversao(produto.unidadeMedidaSigla);
    var indicadorItem = document.getElementById('rd-indicador-2-item');
    indicadorItem.hidden = !conversao;
    if (conversao) {
      document.getElementById('rd-indicador-2-label').textContent = INDICADOR_LABEL_POR_BASE[conversao.unidadeBaseSigla] || 'Total na unidade base';
      var convertido = produto.quantidade * conversao.correspondeA;
      document.getElementById('rd-indicador-2-value').textContent = formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
    }

    document.getElementById('rd-preco-atual').textContent = formatCurrency(produto.precoAtual) + '/' + produto.unidadeMedidaSigla.toLowerCase();
    document.getElementById('rd-valor-estimado').textContent = formatCurrency(produto.quantidade * produto.precoAtual);
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

  function renderHistorico() {
    var produto = currentProduto;
    var timeline = document.getElementById('historico-timeline');
    var entries = produto.historico.slice().reverse();
    timeline.innerHTML = entries.map(function (entry) {
      var metaParts = [];
      if (entry.origem) metaParts.push('Origem: ' + entry.origem);
      if (entry.destino && entry.destino !== entry.deposito) metaParts.push('Destino: ' + entry.destino);
      if (entry.deposito) metaParts.push('Depósito: ' + entry.deposito);

      var extraParts = [];
      if (entry.documento) {
        extraParts.push('<button type="button" class="detalhev2-doc-link" data-doc-url="' + entry.documento.url + '"><i data-lucide="file-text" width="12" height="12"></i>' + entry.documento.nome + '</button>');
      }
      if (entry.tipo === 'ajuste' && entry.observacao) {
        extraParts.push('<span class="detalhev2-obs-note">' + entry.observacao + '</span>');
      }

      var quantidadeLabel = (entry.quantidade > 0 && entry.tipo === 'ajuste' ? '+' : '') + formatNum(entry.quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase();

      return '<li class="detalhe-estoque-timeline-item">' +
        '<span class="detalhe-estoque-timeline-icon"><i data-lucide="' + (HISTORICO_ICONS[entry.tipo] || 'circle') + '" width="16" height="16"></i></span>' +
        '<div class="detalhe-estoque-timeline-body">' +
          '<div class="detalhe-estoque-timeline-label">' + (HISTORICO_LABELS[entry.tipo] || entry.tipo) + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">' + formatDate(entry.data) + ' · ' + quantidadeLabel + (metaParts.length ? ' · ' + metaParts.join(' · ') : '') + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">Saldo após: ' + formatNum(entry.saldoApos) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + '</div>' +
          (extraParts.length ? '<div class="detalhe-estoque-timeline-extra">' + extraParts.join(' · ') + '</div>' : '') +
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
    trigger.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
    menu.addEventListener('click', function (event) { var o = event.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    return { selectOption: selectOption };
  }

  // ---------- Modal: Atualizar preço ----------
  var precoOverlay = document.getElementById('preco-dialog-overlay');
  var precoProdutoNome = document.getElementById('preco-produto-nome');
  var precoAtualLabel = document.getElementById('preco-atual-label');
  var precoAtualInput = document.getElementById('preco-atual-input');
  var precoNovoLabel = document.getElementById('preco-novo-label');
  var precoNovoField = document.getElementById('preco-novo-field');
  var precoNovoInput = document.getElementById('preco-novo-input');
  var precoBaseField = document.getElementById('preco-base-field');
  var precoBaseLabel = document.getElementById('preco-base-label');
  var precoBaseInput = document.getElementById('preco-base-input');
  var precoDataInput = document.getElementById('preco-data-input');
  var precoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'preco-data-field', triggerId: 'preco-data-trigger', valueId: 'preco-data-value',
    hiddenInputId: 'preco-data-input', popoverId: 'preco-data-popover', placeholder: 'Selecionar data'
  });
  var precoConfirmBtn = document.getElementById('preco-confirm');
  var precoNovoCentavos = 0;
  function formatCentavosBRL(centavos) { return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  precoNovoInput.addEventListener('input', function () {
    var digits = precoNovoInput.value.replace(/\D/g, '');
    precoNovoCentavos = digits ? Number(digits) : 0;
    precoNovoInput.value = precoNovoCentavos ? formatCentavosBRL(precoNovoCentavos) : '';
    updatePrecoBasePreview();
  });
  function updatePrecoBasePreview() {
    var conversao = getConversao(currentProduto.unidadeMedidaSigla);
    precoBaseField.hidden = !conversao;
    if (conversao) {
      precoBaseLabel.textContent = 'Preço por ' + conversao.unidadeBaseSigla.toLowerCase();
      var novoPreco = precoNovoCentavos / 100;
      var porBase = conversao.correspondeA ? novoPreco / conversao.correspondeA : 0;
      precoBaseInput.value = novoPreco ? formatCurrency(porBase) : '';
    }
  }
  function openAtualizarPrecoModal() {
    var produto = currentProduto;
    precoProdutoNome.textContent = produto.produto;
    precoAtualLabel.textContent = 'Preço atual por ' + produto.unidadeMedidaSigla.toLowerCase();
    precoAtualInput.value = formatCurrency(produto.precoAtual);
    precoNovoLabel.textContent = 'Novo preço por ' + produto.unidadeMedidaSigla.toLowerCase();
    precoNovoInput.value = '';
    precoNovoCentavos = 0;
    precoDataPicker.setValue(todayISO());
    precoNovoField.classList.remove('error');
    updatePrecoBasePreview();
    openModal(precoOverlay);
    precoNovoInput.focus();
  }
  wireModalDismiss(precoOverlay, 'preco-dialog-close', 'preco-cancel');
  precoConfirmBtn.addEventListener('click', function () {
    var novoPreco = precoNovoCentavos / 100;
    var invalid = !(novoPreco > 0);
    precoNovoField.classList.toggle('error', invalid);
    if (invalid) return;
    window.NiveloEstoqueVendasV2.atualizarPreco(currentProduto.codigo, novoPreco, precoDataInput.value);
    closeModal(precoOverlay);
    refreshAll();
    showSuccessToast('Preço atualizado com sucesso', 'Novo preço de ' + currentProduto.produto + ': ' + formatCurrency(novoPreco) + '/' + currentProduto.unidadeMedidaSigla.toLowerCase() + '.');
  });

  // ---------- Modal: Ajustar estoque ----------
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

  function openAjustarEstoqueModal(depositoPreset) {
    var produto = currentProduto;
    ajusteProdutoNome.textContent = produto.produto;
    ajusteDepositoMenu.innerHTML = produto.depositos.map(function (d) {
      return '<div class="option" data-value="' + d.deposito + '">' + d.deposito + '</div>';
    }).join('');
    var alvo = depositoPreset || (produto.depositos[0] && produto.depositos[0].deposito);
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
    window.NiveloEstoqueVendasV2.ajustarEstoque(currentProduto.codigo, deposito, saldoConferido, observacao);
    closeModal(ajusteOverlay);
    refreshAll();
    showSuccessToast('Estoque ajustado com sucesso', 'Saldo de ' + deposito + ' (' + currentProduto.produto + ') atualizado para ' + formatNum(saldoConferido) + ' ' + currentProduto.unidadeMedidaSigla.toLowerCase() + '.');
  });

  // ---------- Ações do cabeçalho ----------
  // "Registrar entrada" é a ação principal (botão primário); Atualizar
  // preço/Ajustar estoque ficam dentro do popover "mais" — só nesta tela
  // (Ver detalhes), diferente da listagem, que expõe as 4 ações em ícone.
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
  maisBtnEl.addEventListener('click', function () {
    if (maisPopoverEl.hidden) openMaisPopover(); else closeMaisPopover();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !maisPopoverEl.hidden) closeMaisPopover();
  });

  document.getElementById('acao-atualizar-preco-btn').addEventListener('click', function () {
    closeMaisPopover();
    openAtualizarPrecoModal();
  });
  document.getElementById('acao-ajustar-estoque-btn').addEventListener('click', function () {
    closeMaisPopover();
    openAjustarEstoqueModal(null);
  });
  document.getElementById('acao-registrar-entrada-btn').addEventListener('click', function () {
    window.location.href = 'registrar-entrada-estoque-v2.html?codigo=' + currentProduto.codigo;
  });

  // ---------- Documento (mock): abre em nova aba ----------
  document.addEventListener('click', function (event) {
    var docBtn = event.target.closest('.detalhev2-doc-link');
    if (docBtn) window.open(docBtn.dataset.docUrl || 'about:blank', '_blank');
  });

  // ---------- Boot ----------
  function boot() {
    var match = location.hash.match(/codigo=([\w-]+)/);
    var codigo = match ? match[1] : null;
    var produto = codigo ? window.NiveloEstoqueVendasV2.findByCodigo(codigo) : null;

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
