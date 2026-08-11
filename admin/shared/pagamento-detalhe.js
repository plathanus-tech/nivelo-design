(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_LABELS = window.NiveloPagamentos.STATUS_LABELS;
  var STATUS_BADGE = window.NiveloPagamentos.STATUS_BADGE;
  var TIPO_LABELS = window.NiveloPagamentos.TIPO_LABELS;

  function formatDateBR(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatBRL(valor) {
    return 'R$ ' + Number(valor || 0).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+,)/g, '$1.');
  }

  var toastRegion = document.getElementById('toast-region');
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert info hpdet-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="info" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div>' + (message ? '<div class="message">' + message + '</div>' : '') + '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  var hashMatch = location.hash.match(/id=([\w-]+)/);
  var pagamentoId = hashMatch ? hashMatch[1] : null;

  var notFoundEl = document.getElementById('hpdet-not-found');
  var contentEl = document.getElementById('hpdet-content');
  var perfilBtn = document.getElementById('hpdet-perfil-btn');

  function render() {
    var pagamento = pagamentoId ? window.NiveloPagamentos.findById(pagamentoId) : null;
    if (!pagamento) {
      notFoundEl.hidden = false;
      contentEl.hidden = true;
      perfilBtn.hidden = true;
      return;
    }
    notFoundEl.hidden = true;
    contentEl.hidden = false;

    var assinante = window.NiveloPagamentos.assinante(pagamento);
    var plano = window.NiveloPagamentos.plano(pagamento);
    var badge = STATUS_BADGE[pagamento.status];

    document.getElementById('hpdet-titulo').textContent = pagamento.id;
    var badgeHTML = '<span class="badge" data-status="' + badge + '"><span class="badgeDot"></span>' + STATUS_LABELS[pagamento.status] + '</span>';
    document.getElementById('hpdet-status-badge').outerHTML = '<span class="badge" id="hpdet-status-badge" data-status="' + badge + '"><span class="badgeDot"></span>' + STATUS_LABELS[pagamento.status] + '</span>';

    document.getElementById('hpdet-cliente').textContent = assinante ? assinante.nome : '—';
    document.getElementById('hpdet-email').textContent = assinante ? assinante.email : '—';
    document.getElementById('hpdet-plano').textContent = plano ? plano.nome : '—';
    document.getElementById('hpdet-tipo').textContent = TIPO_LABELS[pagamento.tipoCobranca] || '—';
    document.getElementById('hpdet-data').textContent = formatDateBR(pagamento.data);
    document.getElementById('hpdet-data-pagamento').textContent = formatDateBR(pagamento.dataPagamento);
    document.getElementById('hpdet-vencimento').textContent = formatDateBR(pagamento.dataVencimento);
    document.getElementById('hpdet-forma').textContent = pagamento.formaPagamento || '—';
    document.getElementById('hpdet-transacao').textContent = pagamento.transacaoId || '—';

    document.getElementById('hpdet-valor-original').textContent = formatBRL(pagamento.valorOriginal);
    document.getElementById('hpdet-cupom').textContent = pagamento.cupomCodigo || '—';
    document.getElementById('hpdet-desconto').textContent = pagamento.valorDesconto > 0 ? formatBRL(pagamento.valorDesconto) : '—';
    document.getElementById('hpdet-afiliado').textContent = pagamento.afiliado || '—';
    document.getElementById('hpdet-valor-final').textContent = formatBRL(pagamento.valorFinal);
    document.getElementById('hpdet-status-inline').innerHTML = badgeHTML;

    var nfSection = document.getElementById('hpdet-nf-section');
    if (pagamento.notaFiscalNumero) {
      nfSection.hidden = false;
      document.getElementById('hpdet-nf-numero').textContent = pagamento.notaFiscalNumero;
    } else {
      nfSection.hidden = true;
    }

    perfilBtn.hidden = !assinante;
    if (assinante) {
      perfilBtn.onclick = function () { window.location.href = 'assinante-detalhe.html#id=' + assinante.id; };
    }
  }

  var nfBtn = document.getElementById('hpdet-nf-btn');
  nfBtn.addEventListener('click', function () {
    showToast('Visualização de nota fiscal não disponível', 'Este recurso ainda não está implementado neste protótipo.');
  });

  render();
})();
