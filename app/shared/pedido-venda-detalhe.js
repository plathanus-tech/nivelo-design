(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatBRL(value) {
    return 'R$ ' + Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function setText(id, value) {
    document.getElementById(id).textContent = value == null || value === '' ? '—' : value;
  }

  var TIPO_LABEL = { 'venda': 'Venda', 'venda-futura': 'Venda futura', 'remessa': 'Remessa' };
  var MODALIDADE_LABEL = { estoque: 'Estoque disponível', futura: 'Venda futura/Antecipada' };
  var STATUS_BADGE = {
    'pendente-nfe': { status: 'warning', label: 'Pendente de NF-e' },
    'nfe-emitida': { status: 'success', label: 'NF-e emitida' },
    'aguardando-entrega': { status: 'info', label: 'Aguardando entrega' },
    'cancelado': { status: 'error', label: 'Cancelado' }
  };
  var INTEGRACAO_LABEL = { concluido: 'Concluído', pendente: 'Pendente', 'nao-aplica': 'Não se aplica' };

  var currentPedido = null;

  function renderDetalhe(pedido) {
    document.title = 'Pedido de venda ' + pedido.numero + ' — Nivelo';
    document.getElementById('detalhe-titulo').textContent = 'Pedido de venda ' + pedido.numero;

    var badge = STATUS_BADGE[pedido.status] || STATUS_BADGE['pendente-nfe'];
    var badgeEl = document.getElementById('detalhe-status-badge');
    badgeEl.dataset.status = badge.status;
    badgeEl.innerHTML = '<span class="badgeDot"></span>' + badge.label;

    setText('di-numero', pedido.numero);
    setText('di-data', formatDate(pedido.data));
    setText('di-natureza', pedido.naturezaOperacaoDescricao);
    // Remessa não tem "Modalidade de venda" (não é venda) — a linha some
    // por completo em vez de mostrar o valor cru 'remessa'.
    var isRemessa = pedido.tipo === 'remessa';
    document.getElementById('di-modalidade-field').hidden = isRemessa;
    if (!isRemessa) setText('di-modalidade', MODALIDADE_LABEL[pedido.modalidade] || pedido.modalidade);

    document.getElementById('di-cliente-section-title').textContent = isRemessa ? 'Destinatário' : 'Cliente';
    setText('di-cliente-nome', pedido.clienteNome);
    setText('di-cliente-documento', pedido.clienteDocumento);
    setText('di-cliente-ie', pedido.clienteIe);
    setText('di-cliente-telefone', pedido.clienteTelefone);
    setText('di-cliente-endereco', pedido.clienteEndereco);

    setText('di-produto', pedido.produtoNome);
    document.getElementById('di-deposito-field').hidden = pedido.modalidade !== 'estoque';
    setText('di-deposito', pedido.depositoNome);
    setText('di-quantidade', pedido.quantidade + ' ' + (pedido.produtoUnidadeLegado || ''));
    setText('di-total-kg', pedido.totalKg != null ? pedido.totalKg.toLocaleString('pt-BR') + ' kg' : '—');
    setText('di-preco-unitario', formatBRL(pedido.precoUnitario));
    setText('di-valor-bruto', formatBRL(pedido.valorBruto));
    setText('di-desconto', formatBRL(pedido.desconto));
    setText('di-valor-liquido', formatBRL(pedido.valorLiquido));

    // Remessa não tem condição de pagamento (não é venda) — a seção inteira
    // some, em vez de mostrar o bloco "A prazo" por engano (era o fallback
    // de `condicaoPagamento` indefinido antes deste guard).
    document.getElementById('di-condicao-pagamento-section').hidden = isRemessa;
    var isAvista = pedido.condicaoPagamento === 'avista';
    if (!isRemessa) {
      document.getElementById('di-pagamento-avista-fields').hidden = !isAvista;
      document.getElementById('di-pagamento-prazo-fields').hidden = isAvista;
      if (isAvista) {
        setText('di-forma-recebimento', pedido.formaRecebimentoNome);
        setText('di-conta-entrada', pedido.contaEntradaNome);
        setText('di-data-recebimento', formatDate(pedido.dataRecebimento));
      } else {
        setText('di-forma-cobranca', pedido.formaCobrancaNome);
        setText('di-numero-parcelas', pedido.numeroParcelas);
        setText('di-valor-total-parcelas', formatBRL(pedido.valorLiquido));
      }
    }

    var parcelasWrap = document.getElementById('di-parcelas-wrap');
    parcelasWrap.hidden = isRemessa || isAvista || !pedido.parcelas || !pedido.parcelas.length;
    if (!parcelasWrap.hidden) {
      document.getElementById('di-parcelas-tbody').innerHTML = pedido.parcelas.map(function (parcela) {
        return '<tr class="tr"><td class="td">Parcela ' + parcela.numero + '</td><td class="td">' + formatDate(parcela.vencimento) + '</td><td class="td">' + formatBRL(parcela.valor) + '</td></tr>';
      }).join('');
    }

    var temTransporte = !!(pedido.transportadoraNome || pedido.veiculoPlaca || pedido.motorista);
    document.getElementById('di-transporte-section').hidden = !temTransporte;
    if (temTransporte) {
      setText('di-transportadora', pedido.transportadoraNome);
      setText('di-veiculo', pedido.veiculoPlaca);
      setText('di-motorista', pedido.motorista);
    }

    document.getElementById('di-observacao-section').hidden = !pedido.observacao;
    if (pedido.observacao) setText('di-observacao', pedido.observacao);

    var integracoes = window.NiveloPedidosVenda.integracoesDoPedido(pedido);
    setText('di-integracao-estoque', INTEGRACAO_LABEL[integracoes.estoque]);
    setText('di-integracao-financeiro', INTEGRACAO_LABEL[integracoes.financeiro]);
    setText('di-integracao-nfe', pedido.numeroNotaFiscal ? INTEGRACAO_LABEL[integracoes.nfe] + ' (' + pedido.numeroNotaFiscal + ')' : INTEGRACAO_LABEL[integracoes.nfe]);

    var emitirBtn = document.getElementById('acao-emitir-nfe-btn');
    emitirBtn.hidden = pedido.status === 'cancelado' || integracoes.nfe === 'concluido';
    document.getElementById('acao-cancelar-btn').hidden = pedido.status === 'cancelado';

    if (window.lucide) lucide.createIcons();
  }

  function boot() {
    var match = /numero=([^&]+)/.exec(location.hash);
    var numero = match ? decodeURIComponent(match[1]) : null;
    currentPedido = numero ? window.NiveloPedidosVenda.findByNumero(numero) : null;

    if (!currentPedido) {
      document.getElementById('detalhe-not-found').hidden = false;
      document.getElementById('detalhe-content').hidden = true;
      return;
    }
    document.getElementById('detalhe-not-found').hidden = true;
    document.getElementById('detalhe-content').hidden = false;
    renderDetalhe(currentPedido);
  }

  document.getElementById('acao-cancelar-btn').addEventListener('click', function () {
    if (!currentPedido) return;
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar o pedido "' + currentPedido.numero + '"? Esta ação não pode ser desfeita.';
    cancelarOverlay.hidden = false;
  });

  document.getElementById('acao-emitir-nfe-btn').addEventListener('click', function () {
    if (!currentPedido) return;
    if (window.NiveloCertificadoDigital && !window.NiveloCertificadoDigital.hasCertificado()) {
      openCertificadoDialog();
    } else {
      openEmitirNfeModal(currentPedido);
    }
  });

  // ---------- Modal: Emitir nota fiscal (réplica de pedidos-de-venda.js —
  // a derivação dos dados fiscais e a emissão em si vivem em
  // pedidos-venda-data.js, únicas; só a UI do modal é duplicada aqui). ----------
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

  // ---------- Bloqueio: Certificado Digital não cadastrado ----------
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

  // ---------- Modal: Cancelar pedido (réplica de pedidos-de-venda.js) ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  function closeCancelarModal() { cancelarOverlay.hidden = true; }
  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-cancel').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) { if (event.target === cancelarOverlay) closeCancelarModal(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal(); });
  document.getElementById('cancelar-dialog-confirm').addEventListener('click', function () {
    if (!currentPedido) return;
    var pedido = window.NiveloPedidosVenda.cancelar(currentPedido.numero);
    closeCancelarModal();
    if (pedido) renderDetalhe(pedido);
  });

  boot();
})();
