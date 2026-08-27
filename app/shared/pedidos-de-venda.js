(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // manifestos.js/contas-bancarias.js/cadastros.js) — reaproveitada
  // também pelos 3 indicadores de integração (E/C/NF), que usam o mesmo
  // markup `.tip`. ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) {
      document.body.appendChild(tip);
      btn.__tip = tip;
    }
    return tip;
  }

  function positionActionTooltip(btn) {
    var tip = getActionTip(btn);
    if (!tip) return;
    var rect = btn.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    tip.style.position = 'fixed';
    tip.style.left = centerX + 'px';
    tip.style.transform = 'translateX(-50%)';
    tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    tip.style.top = 'auto';
    tip.style.opacity = '1';

    var margin = 8;
    var tipRect = tip.getBoundingClientRect();
    if (tipRect.left < margin) {
      tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
    } else if (tipRect.right > window.innerWidth - margin) {
      tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
    }
  }

  function hideActionTooltip(btn) {
    var tip = btn.__tip;
    if (tip) tip.style.opacity = '0';
  }

  document.addEventListener('mouseover', function (event) {
    var btn = event.target.closest('.actionBtn[data-action], .pv-integracao-dot');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('mouseout', function (event) {
    var btn = event.target.closest('.actionBtn[data-action], .pv-integracao-dot');
    if (btn) hideActionTooltip(btn);
  });
  document.addEventListener('focusin', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action], .pv-integracao-dot');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('focusout', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action], .pv-integracao-dot');
    if (btn) hideActionTooltip(btn);
  });

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success pv-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      '<div class="message">' + message + '</div>' +
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

  var successMessage = '';
  try {
    successMessage = sessionStorage.getItem('nivelo.novopedidodevenda.success') || '';
    if (successMessage) sessionStorage.removeItem('nivelo.novopedidodevenda.success');
  } catch (e) {}
  if (successMessage) showSuccessToast(successMessage, 'O pedido já está disponível na listagem.');

  // ---------- Normalização (busca ignora acento/maiúsculas) ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '');
  }
  function formatBRL(value) {
    return 'R$ ' + Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  var TIPO_BADGE = {
    'venda': { status: 'info', label: 'Venda' },
    'venda-futura': { status: 'warning', label: 'Venda futura' },
    'remessa': { status: 'indigo', label: 'Remessa' }
  };
  var STATUS_BADGE = {
    'pendente-nfe': { status: 'warning', label: 'Pendente de NF-e' },
    'nfe-emitida': { status: 'success', label: 'NF-e emitida' },
    'aguardando-entrega': { status: 'info', label: 'Aguardando entrega' },
    'cancelado': { status: 'error', label: 'Cancelado' }
  };
  // ---------- Integrações: cada indicador tem 3 estados, cada estado com
  // ícone/rótulo/tooltip próprios. Igual às regras de aplicabilidade em
  // pedidos-venda-data.js, um mapa único aqui — nada de `if` espalhado
  // pela tela. ----------
  var INTEGRACAO_META = {
    estoque: { letra: 'E', label: 'Estoque' },
    financeiro: { letra: 'C', label: 'Contas / Financeiro' },
    nfe: { letra: 'NF', label: 'Nota fiscal' }
  };
  var INTEGRACAO_ESTADO_TIP = {
    concluido: function (label) { return label + ': integração concluída.'; },
    pendente: function (label) { return label + ': aplicável a este pedido, ainda não realizada.'; },
    'nao-aplica': function (label) { return label + ': não se aplica a este tipo de operação.'; }
  };
  // Remessa tem tooltips próprios pros estados "não se aplica" de
  // Estoque/Financeiro (pedido explícito do usuário) — nunca a mensagem
  // genérica acima pra esses 2 casos. NF-e continua com o comportamento
  // padrão (pendente/concluído), sem entrada aqui.
  var REMESSA_NAO_APLICA_TIP = {
    estoque: 'Estoque não é alterado nesta etapa. A entrada será registrada após a confirmação da quantidade recebida pelo destinatário.',
    financeiro: 'Remessa não gera Conta a Receber.'
  };

  function buildIntegracoesHTML(pedido) {
    var integracoes = window.NiveloPedidosVenda.integracoesDoPedido(pedido);
    var html = '<div class="pv-integracoes">';
    ['estoque', 'financeiro', 'nfe'].forEach(function (key) {
      var meta = INTEGRACAO_META[key];
      var estado = integracoes[key];
      var tip = (pedido.tipo === 'remessa' && estado === 'nao-aplica' && REMESSA_NAO_APLICA_TIP[key])
        ? REMESSA_NAO_APLICA_TIP[key]
        : INTEGRACAO_ESTADO_TIP[estado](meta.label);
      html += '<span class="pv-integracao-dot" data-estado="' + estado + '" tabindex="0">' + meta.letra +
        '<span class="tip text-body-xs top"><span class="arrow"></span>' + tip + '</span></span>';
    });
    html += '</div>';
    return html;
  }

  function buildActionsHTML(pedido) {
    var actions =
      '<button type="button" class="actionBtn" data-action="ver" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>';
    if (pedido.status !== 'cancelado') {
      var integracoes = window.NiveloPedidosVenda.integracoesDoPedido(pedido);
      if (integracoes.nfe !== 'concluido') {
        actions +=
          '<button type="button" class="actionBtn" data-action="emitir-nfe" aria-label="Emitir nota fiscal"><i data-lucide="file-text" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Emitir nota fiscal</span></button>';
      }
      actions +=
        '<button type="button" class="actionBtn actionDanger" data-action="cancelar" aria-label="Cancelar pedido"><i data-lucide="ban" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Cancelar pedido</span></button>';
    }
    return '<div class="cellActions">' + actions + '</div>';
  }

  function condicaoTexto(pedido) {
    // Remessa não tem condição de pagamento (não é venda) — nunca cai no
    // fallback "A prazo" abaixo, que seria enganoso aqui.
    if (pedido.tipo === 'remessa') return '—';
    if (pedido.condicaoPagamento === 'avista') return pedido.formaRecebimentoNome || '—';
    var parcelas = pedido.numeroParcelas || (pedido.parcelas ? pedido.parcelas.length : 0);
    return (pedido.formaCobrancaNome || 'A prazo') + (parcelas > 1 ? ' (' + parcelas + 'x)' : '');
  }

  var tbody = document.getElementById('pv-tbody');

  function buildRowHTML(pedido) {
    var tipoBadge = TIPO_BADGE[pedido.tipo] || TIPO_BADGE.venda;
    var statusBadge = pedido.status === 'cancelado' ? STATUS_BADGE.cancelado : STATUS_BADGE[pedido.status];
    var searchText = normalize(pedido.numero + ' ' + pedido.clienteNome + ' ' + pedido.produtoNome);
    return (
      '<tr class="tr" id="pv-row-' + pedido.numero + '" data-numero="' + pedido.numero + '" data-search="' + searchText + '" data-data="' + pedido.data + '" data-valor="' + pedido.valorLiquido + '">' +
        '<td class="td">' + formatDate(pedido.data) + '</td>' +
        '<td class="td">' + pedido.clienteNome + '</td>' +
        '<td class="td"><span class="badge" data-status="' + tipoBadge.status + '">' + tipoBadge.label + '</span></td>' +
        '<td class="td">' + pedido.produtoNome + '</td>' +
        '<td class="td">' + pedido.quantidade + ' ' + (pedido.produtoUnidadeLegado || '') + '</td>' +
        '<td class="td">' + formatBRL(pedido.valorLiquido) + '</td>' +
        '<td class="td">' + condicaoTexto(pedido) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + statusBadge.status + '">' + statusBadge.label + '</span></td>' +
        '<td class="td">' + buildIntegracoesHTML(pedido) + '</td>' +
        '<td class="td">' + buildActionsHTML(pedido) + '</td>' +
      '</tr>'
    );
  }

  // `#state=empty` força a listagem vazia pra demonstração no
  // prototype-nav, mesmo padrão já usado em Manifesto/Fazendas.
  var isEmptyDemo = /state=empty/.test(location.hash);

  function renderInitialRows() {
    if (isEmptyDemo) {
      tbody.innerHTML = '';
      return;
    }
    var rows = window.NiveloPedidosVenda.list().slice().sort(function (a, b) { return b.data.localeCompare(a.data) || b.numero.localeCompare(a.numero); });
    tbody.innerHTML = rows.map(buildRowHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Estado (busca + paginação) ----------
  var emptyState = document.getElementById('pv-empty-state');
  var emptyGlobal = document.getElementById('pv-empty-global');
  var searchInput = document.getElementById('pv-search-input');
  var PAGE_SIZE = 10;
  var state = { search: '', page: 1 };

  function rowMatches(row) {
    if (!state.search) return true;
    return normalize(row.dataset.search).indexOf(normalize(state.search)) !== -1;
  }

  var paginationEl = document.getElementById('pv-pagination');
  var paginationInfoEl = document.getElementById('pv-pagination-info');
  var paginationPagesEl = document.getElementById('pv-pagination-pages');
  var paginationPrevBtn = paginationEl.querySelector('[data-page-prev]');
  var paginationNextBtn = paginationEl.querySelector('[data-page-next]');

  function applyFilters() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.forEach(function (row) { row.classList.toggle('is-filtered-out', !rowMatches(row)); });
    applyPagination();
  }

  function applyPagination() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    var matching = rows.filter(function (row) { return !row.classList.contains('is-filtered-out'); });
    var totalRows = rows.length;
    emptyState.hidden = matching.length > 0 || totalRows === 0;
    emptyGlobal.hidden = totalRows > 0;

    var totalPages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;

    matching.forEach(function (row, index) { row.hidden = index < start || index >= end; });
    rows.forEach(function (row) { if (row.classList.contains('is-filtered-out')) row.hidden = true; });

    renderPaginationControls(matching.length, totalPages);
    renderCards();
  }

  function renderPaginationControls(totalCount, totalPages) {
    paginationEl.hidden = totalCount === 0;
    var rangeStart = totalCount === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1;
    var rangeEnd = Math.min(state.page * PAGE_SIZE, totalCount);
    paginationInfoEl.textContent = totalCount === 0
      ? 'Nenhum pedido encontrado.'
      : 'Mostrando ' + rangeStart + ' a ' + rangeEnd + ' de ' + totalCount + ' pedidos';

    var pagesHTML = '';
    for (var p = 1; p <= totalPages; p++) {
      pagesHTML += '<button type="button" class="pv-pagination-page' + (p === state.page ? ' is-active' : '') +
        '" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
    }
    paginationPagesEl.innerHTML = pagesHTML;

    paginationPrevBtn.disabled = state.page <= 1;
    paginationNextBtn.disabled = state.page >= totalPages;
  }

  paginationPrevBtn.addEventListener('click', function () {
    if (state.page <= 1) return;
    state.page -= 1;
    applyPagination();
  });
  paginationNextBtn.addEventListener('click', function () {
    state.page += 1;
    applyPagination();
  });
  paginationPagesEl.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-page]');
    if (!btn) return;
    state.page = Number(btn.dataset.page);
    applyPagination();
  });

  searchInput.addEventListener('input', function () {
    state.search = searchInput.value;
    state.page = 1;
    applyFilters();
  });

  // ---------- Ordenação ----------
  var SORTABLE_COLUMNS = {
    data: { cellIndex: 0, type: 'text', attr: 'data' },
    cliente: { cellIndex: 1, type: 'text' },
    valor: { cellIndex: 5, type: 'number', attr: 'valor' },
    status: { cellIndex: 7, type: 'text' }
  };
  var sortState = { key: 'data', dir: 'desc' };
  var headerRow = document.getElementById('pv-header-row');

  function sortRows() {
    var config = SORTABLE_COLUMNS[sortState.key];
    var dir = sortState.dir === 'asc' ? 1 : -1;
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
    rows.sort(function (a, b) {
      var va, vb;
      if (config.type === 'number') {
        va = Number(a.dataset[config.attr] || 0);
        vb = Number(b.dataset[config.attr] || 0);
        return (va - vb) * dir;
      }
      va = normalize(config.attr ? a.dataset[config.attr] : a.children[config.cellIndex].textContent);
      vb = normalize(config.attr ? b.dataset[config.attr] : b.children[config.cellIndex].textContent);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  function updateSortIcons() {
    Array.prototype.slice.call(headerRow.querySelectorAll('.th.sortable')).forEach(function (th) {
      var key = th.dataset.sortKey;
      var active = sortState.key === key;
      th.setAttribute('aria-sort', active ? (sortState.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      var iconName = active ? (sortState.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
      th.querySelector('[data-sort-icon]').innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
    });
    if (window.lucide) lucide.createIcons();
  }

  headerRow.addEventListener('click', function (event) {
    var th = event.target.closest('.th.sortable');
    if (!th) return;
    var key = th.dataset.sortKey;
    if (sortState.key === key) {
      sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
      sortState.key = key;
      sortState.dir = 'asc';
    }
    updateSortIcons();
    sortRows();
    applyFilters();
  });

  // ---------- "Novo documento" — popover-menu ancorado no botão (mesma
  // técnica de certificado-digital.js: `.menu`/`.option` do Dropdown,
  // `position:fixed` calculado via JS, não é o `initDropdown()` de campo
  // de formulário). "Nova remessa" ainda não tem fluxo próprio — por
  // enquanto só um aviso, estruturado pra virar navegação real quando o
  // fluxo de Remessa for construído. ----------
  var newDocWrapper = document.getElementById('new-doc-menu');
  var newDocBtn = document.getElementById('new-doc-btn');
  var newDocMenu = newDocWrapper.querySelector('[data-dropdown-menu]');

  function positionNewDocMenu() {
    var rect = newDocBtn.getBoundingClientRect();
    newDocMenu.style.position = 'fixed';
    newDocMenu.style.top = (rect.bottom + 4) + 'px';
    newDocMenu.style.left = 'auto';
    newDocMenu.style.right = (window.innerWidth - rect.right) + 'px';
    newDocMenu.style.width = 'auto';
    newDocMenu.style.minWidth = rect.width + 'px';
  }
  function closeNewDocMenu() {
    newDocWrapper.classList.remove('open');
    newDocBtn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', closeNewDocMenu, true);
    window.removeEventListener('resize', closeNewDocMenu);
  }
  function openNewDocMenu() {
    newDocWrapper.classList.add('open');
    newDocBtn.setAttribute('aria-expanded', 'true');
    positionNewDocMenu();
    window.addEventListener('scroll', closeNewDocMenu, true);
    window.addEventListener('resize', closeNewDocMenu);
  }
  newDocBtn.addEventListener('click', function () {
    newDocWrapper.classList.contains('open') ? closeNewDocMenu() : openNewDocMenu();
  });
  document.addEventListener('click', function (event) {
    if (!newDocWrapper.contains(event.target)) closeNewDocMenu();
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeNewDocMenu(); });
  newDocMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    closeNewDocMenu();
    if (optionEl.dataset.value === 'pedido') {
      window.location.href = 'novo-pedido-venda.html';
    } else if (optionEl.dataset.value === 'remessa') {
      window.location.href = 'nova-remessa.html';
    }
  });

  var emptyGlobalBtn = document.getElementById('pv-empty-global-btn');
  if (emptyGlobalBtn) {
    emptyGlobalBtn.addEventListener('click', function () { window.location.href = 'novo-pedido-venda.html'; });
  }

  // ---------- Modal: Cancelar pedido ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  var cancelarState = { numero: null };

  function openCancelarModal(pedido) {
    cancelarState.numero = pedido.numero;
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar o pedido "' + pedido.numero + '"? Esta ação não pode ser desfeita.';
    cancelarOverlay.hidden = false;
  }
  function closeCancelarModal() { cancelarOverlay.hidden = true; cancelarState.numero = null; }

  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-cancel').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) { if (event.target === cancelarOverlay) closeCancelarModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal(); });

  document.getElementById('cancelar-dialog-confirm').addEventListener('click', function () {
    var numero = cancelarState.numero;
    var pedido = window.NiveloPedidosVenda.cancelar(numero);
    if (!pedido) return;
    closeCancelarModal();
    replaceRow(pedido);
    showSuccessToast('Pedido cancelado com sucesso', '"' + numero + '" foi marcado como cancelado.');
  });

  function replaceRow(pedido) {
    var row = document.getElementById('pv-row-' + pedido.numero);
    if (row) {
      var template = document.createElement('template');
      template.innerHTML = buildRowHTML(pedido).trim();
      row.replaceWith(template.content.firstChild);
    }
    applyFilters();
    if (window.lucide) lucide.createIcons();
  }

  // ---------- Ações da linha (delegado em `document`, cobre tabela E cards) ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var rowId = btn.closest('[data-row-id]') ? btn.closest('[data-row-id]').dataset.rowId : null;
    var row = rowId ? document.getElementById(rowId) : btn.closest('.tr');
    if (!row) return;
    var numero = row.dataset.numero;
    var pedido = window.NiveloPedidosVenda.findByNumero(numero);
    if (!pedido) return;

    var action = btn.dataset.action;
    if (action === 'ver') {
      window.location.href = 'pedido-venda-detalhe.html#numero=' + encodeURIComponent(numero);
    } else if (action === 'cancelar') {
      openCancelarModal(pedido);
    } else if (action === 'emitir-nfe') {
      // Emissão nunca é automática — clicar aqui é a única forma de
      // iniciar o fluxo de NF-e a partir do pedido (ação explícita). Antes
      // de emitir de verdade, um modal de confirmação com um resumo
      // compacto do pedido é mostrado (ver openEmitirNfeModal) — nunca
      // emite direto no clique do ícone.
      if (window.NiveloCertificadoDigital && !window.NiveloCertificadoDigital.hasCertificado()) {
        openCertificadoDialog();
      } else {
        openEmitirNfeModal(pedido);
      }
    }
  });

  // ---------- Modal: Emitir nota fiscal (confirmação + resumo, ver
  // pedidos-venda-data.js's `dadosNfeFaltantes()`/`emitirNfe()` — a
  // derivação dos dados fiscais e a emissão em si vivem lá, únicas, pra
  // não duplicar regra entre esta listagem e pedido-venda-detalhe.js;
  // só a UI do modal é replicada nas 2 telas). ----------
  var emitirNfeOverlay = document.getElementById('emitir-nfe-dialog-overlay');
  var emitirNfeFaltandoEl = document.getElementById('emitir-nfe-faltando');
  var emitirNfeFaltandoListaEl = document.getElementById('emitir-nfe-faltando-lista');
  var emitirNfeConfirmBtn = document.getElementById('emitir-nfe-dialog-confirm');
  var emitirNfeState = { pedido: null, faltando: [] };

  function irParaRevisaoNfe(pedido) {
    try {
      sessionStorage.setItem('nivelo.novapedidodevenda.nfe-prefill', JSON.stringify({
        origemPedido: pedido.numero,
        clienteCodigo: pedido.clienteCodigo,
        transportadoraCodigo: pedido.transportadoraCodigo,
        observacao: pedido.observacao,
        item: {
          sku: pedido.produtoSku,
          produtoNome: pedido.produtoNome,
          unidade: pedido.produtoUnidadeLegado,
          quantidade: pedido.quantidade,
          preco: pedido.precoUnitario
        }
      }));
    } catch (e) {}
    window.location.href = 'nova-nota-fiscal.html';
  }

  function openEmitirNfeModal(pedido) {
    emitirNfeState.pedido = pedido;
    document.getElementById('emitir-nfe-cliente').textContent = pedido.clienteNome || '—';
    document.getElementById('emitir-nfe-produto').textContent = pedido.produtoNome || '—';
    document.getElementById('emitir-nfe-quantidade').textContent = pedido.quantidade + ' ' + (pedido.produtoUnidadeLegado || '');
    document.getElementById('emitir-nfe-valor').textContent = formatBRL(pedido.valorLiquido);
    document.getElementById('emitir-nfe-natureza').textContent = pedido.naturezaOperacaoDescricao || '—';

    var faltando = window.NiveloPedidosVenda.dadosNfeFaltantes(pedido);
    emitirNfeState.faltando = faltando;
    emitirNfeFaltandoEl.hidden = faltando.length === 0;
    if (faltando.length) {
      emitirNfeFaltandoListaEl.textContent = faltando.join(', ') + '.';
      emitirNfeConfirmBtn.textContent = 'Revisar dados';
    } else {
      emitirNfeConfirmBtn.textContent = 'Emitir nota fiscal';
    }
    emitirNfeOverlay.hidden = false;
  }
  function closeEmitirNfeModal() { emitirNfeOverlay.hidden = true; emitirNfeState.pedido = null; }

  document.getElementById('emitir-nfe-dialog-close').addEventListener('click', closeEmitirNfeModal);
  document.getElementById('emitir-nfe-dialog-cancel').addEventListener('click', closeEmitirNfeModal);
  emitirNfeOverlay.addEventListener('click', function (event) { if (event.target === emitirNfeOverlay) closeEmitirNfeModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !emitirNfeOverlay.hidden) closeEmitirNfeModal(); });

  emitirNfeConfirmBtn.addEventListener('click', function () {
    var pedido = emitirNfeState.pedido;
    if (!pedido) return;
    if (emitirNfeState.faltando.length) {
      closeEmitirNfeModal();
      irParaRevisaoNfe(pedido);
      return;
    }
    var notaCriada = window.NiveloPedidosVenda.emitirNfe(pedido);
    closeEmitirNfeModal();
    try {
      if (notaCriada) sessionStorage.setItem('nivelo.novanotafiscal.success', 'Nota fiscal ' + notaCriada.numero + ' emitida com sucesso a partir do pedido ' + pedido.numero + '.');
    } catch (e) {}
    window.location.href = 'notas-fiscais.html';
  });

  // ---------- Bloqueio: Certificado Digital não cadastrado (réplica do
  // mesmo diálogo/comportamento já usado em Nova Nota Fiscal). ----------
  var certificadoOverlay = document.getElementById('certificado-dialog-overlay');
  function openCertificadoDialog() { certificadoOverlay.hidden = false; }
  function closeCertificadoDialog() { certificadoOverlay.hidden = true; }
  document.getElementById('certificado-dialog-close').addEventListener('click', closeCertificadoDialog);
  document.getElementById('certificado-dialog-fechar').addEventListener('click', closeCertificadoDialog);
  certificadoOverlay.addEventListener('click', function (event) { if (event.target === certificadoOverlay) closeCertificadoDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !certificadoOverlay.hidden) closeCertificadoDialog(); });
  document.getElementById('certificado-dialog-ir').addEventListener('click', function () {
    window.location.href = 'certificado-digital.html';
  });

  // ---------- Cards (Mobile) ----------
  var cardsContainer = document.getElementById('pv-cards');
  function cellText(cell) { return cell.textContent.replace(/\s+/g, ' ').trim(); }

  function buildCardHTML(row) {
    return (
      '<div class="card pv-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="pv-mobile-card-header">' +
          '<span class="pv-mobile-card-numero text-subtitle-s">' + cellText(row.children[1]) + '</span>' +
          '<span>' + row.children[2].innerHTML + '</span>' +
        '</div>' +
        '<dl class="pv-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Data</dt><dd class="text-12-regular">' + cellText(row.children[0]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Produto</dt><dd class="text-12-regular">' + cellText(row.children[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Quantidade</dt><dd class="text-12-regular">' + cellText(row.children[4]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor</dt><dd class="text-12-regular">' + cellText(row.children[5]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Condição</dt><dd class="text-12-regular">' + cellText(row.children[6]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Status</dt><dd class="text-12-regular">' + row.children[7].innerHTML + '</dd></div>' +
        '</dl>' +
        '<div class="pv-mobile-card-integracoes">' + row.children[8].innerHTML + '</div>' +
        '<div class="pv-mobile-card-actions">' + row.children[9].innerHTML + '</div>' +
      '</div>'
    );
  }

  function renderCards() {
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr')).filter(function (row) { return !row.hidden; });
    cardsContainer.innerHTML = rows.map(buildCardHTML).join('');
    if (window.lucide) lucide.createIcons();
  }

  renderInitialRows();
  sortRows();
  updateSortIcons();
  applyFilters();

  // ---------- Estados de demonstração do fluxo "Emitir nota fiscal" (só
  // pro prototype-nav, nunca alcançados pela navegação normal do usuário)
  // — mesmo mecanismo `#state=` já usado em Estoque/Novo Registo pros
  // modais "Criar conta a pagar/receber?". Reaproveita o MESMO caminho de
  // clique real (`openCertificadoDialog`/`openEmitirNfeModal`), só forçando
  // o estado do Certificado Digital antes de abrir. ----------
  var demoPedidoNfe = window.NiveloPedidosVenda.list().filter(function (p) {
    return p.status !== 'cancelado' && window.NiveloPedidosVenda.integracoesDoPedido(p).nfe !== 'concluido';
  })[0];
  if (/state=emitirnfe-semcertificado/.test(location.hash)) {
    if (window.NiveloCertificadoDigital) window.NiveloCertificadoDigital.setCertificado(false);
    if (demoPedidoNfe) openCertificadoDialog();
  } else if (/state=emitirnfe-comcertificado/.test(location.hash)) {
    if (window.NiveloCertificadoDigital) window.NiveloCertificadoDigital.setCertificado(true);
    if (demoPedidoNfe) openEmitirNfeModal(demoPedidoNfe);
  }
})();
