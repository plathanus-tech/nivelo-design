(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_BADGE = {
    emitido: { status: 'success', label: 'Emitido' },
    cancelado: { status: 'error', label: 'Cancelado' }
  };

  function formatData(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  var params = new URLSearchParams(location.hash.replace('#', '?'));
  var numero = params.get('numero');
  var manifesto = numero ? window.NiveloManifestos.findByNumero(numero) : null;

  var contentEl = document.getElementById('manidet-content');
  var notFoundEl = document.getElementById('manidet-not-found');

  if (!manifesto) {
    contentEl.hidden = true;
    notFoundEl.hidden = false;
    return;
  }

  document.title = 'Manifesto ' + manifesto.numero + ' — Nivelo';
  document.getElementById('manidet-titulo').textContent = 'Manifesto ' + manifesto.numero;

  var badge = STATUS_BADGE[manifesto.status] || STATUS_BADGE.emitido;
  document.getElementById('manidet-status').innerHTML =
    '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';

  var editarBtn = document.getElementById('manidet-editar-btn');
  var cancelarBtn = document.getElementById('manidet-cancelar-btn');
  if (manifesto.status === 'cancelado') {
    editarBtn.hidden = true;
    cancelarBtn.hidden = true;
  } else {
    editarBtn.addEventListener('click', function () {
      window.location.href = 'novo-manifesto.html?numero=' + encodeURIComponent(manifesto.numero) + '&modo=corrigir';
    });
  }

  // ---------- Dados gerais ----------
  var placasPreenchidas = manifesto.placas.filter(function (p) { return p; });
  document.getElementById('manidet-gerais-grid').innerHTML =
    '<div><dt>Número</dt><dd>' + manifesto.numero + '</dd></div>' +
    '<div><dt>Data de emissão</dt><dd>' + formatData(manifesto.dataEmissao) + '</dd></div>' +
    '<div class="manidet-span-2"><dt>Placas</dt><dd>' + placasPreenchidas.join(', ') + '</dd></div>';

  // ---------- Emitente ----------
  var emitente = window.NiveloEmitente.getEmitente();
  document.getElementById('manidet-emitente-grid').innerHTML =
    '<div><dt>Razão social</dt><dd>' + emitente.razaoSocial + '</dd></div>' +
    '<div><dt>CNPJ/CPF</dt><dd>' + emitente.documento + '</dd></div>' +
    '<div class="manidet-span-2"><dt>Endereço</dt><dd>' + emitente.endereco + '</dd></div>';

  // ---------- Motorista ----------
  var end = manifesto.motorista.endereco;
  var enderecoCompleto = end.logradouro + ', ' + end.numero + (end.complemento ? ' - ' + end.complemento : '') +
    ' · ' + end.bairro + ' · ' + end.cidade + '/' + end.estado + ' · CEP ' + end.cep;
  document.getElementById('manidet-motorista-grid').innerHTML =
    '<div><dt>Nome</dt><dd>' + manifesto.motorista.nome + '</dd></div>' +
    '<div><dt>CPF/CNPJ</dt><dd>' + manifesto.motorista.documento + '</dd></div>' +
    '<div class="manidet-span-2"><dt>Endereço</dt><dd>' + enderecoCompleto + '</dd></div>';

  // ---------- Origem e destino ----------
  document.getElementById('manidet-trajeto-grid').innerHTML =
    '<div><dt>Origem</dt><dd>' + manifesto.origem.cidade + '/' + manifesto.origem.estado + '</dd></div>' +
    '<div><dt>Destino</dt><dd>' + manifesto.destino.cidade + '/' + manifesto.destino.estado + '</dd></div>';

  // ---------- Documentos fiscais ----------
  document.getElementById('manidet-documentos-list').innerHTML = manifesto.documentos.map(function (doc) {
    return (
      '<li class="manidet-documento-item">' +
        '<span class="manidet-documento-chave text-body-s">' + doc.chaveNF + '</span>' +
        '<span class="manidet-documento-trajeto">' + doc.origem + ' → ' + doc.destino + '</span>' +
      '</li>'
    );
  }).join('');

  // ---------- Seguro (opcional) ----------
  var seguroSection = document.getElementById('manidet-seguro-section');
  if (manifesto.seguro) {
    seguroSection.hidden = false;
    document.getElementById('manidet-seguro-grid').innerHTML =
      '<div><dt>Seguradora</dt><dd>' + manifesto.seguro.seguradora + '</dd></div>' +
      '<div><dt>CNPJ</dt><dd>' + manifesto.seguro.cnpj + '</dd></div>' +
      '<div><dt>Apólice</dt><dd>' + manifesto.seguro.apolice + '</dd></div>' +
      '<div><dt>Averbação</dt><dd>' + manifesto.seguro.averbacao + '</dd></div>';
  }

  // ---------- Pagamento do frete ----------
  document.getElementById('manidet-pagamento-grid').innerHTML =
    '<div><dt>Documento</dt><dd>' + manifesto.pagamento.documento + '</dd></div>' +
    '<div><dt>Dados bancários / PIX</dt><dd>' + manifesto.pagamento.dadosBancariosPix + '</dd></div>';

  if (window.lucide) lucide.createIcons();

  // ---------- Cancelar manifesto (mesmo Dialog/fluxo de manifestos.html) ----------
  var cancelarOverlay = document.getElementById('cancelar-dialog-overlay');
  function closeCancelarModal() { cancelarOverlay.hidden = true; }
  function openCancelarModal() {
    document.getElementById('cancelar-dialog-message').textContent =
      'Tem certeza que deseja cancelar o manifesto "' + manifesto.numero + '"?';
    cancelarOverlay.hidden = false;
  }
  document.getElementById('cancelar-dialog-close').addEventListener('click', closeCancelarModal);
  document.getElementById('cancelar-dialog-cancel').addEventListener('click', closeCancelarModal);
  cancelarOverlay.addEventListener('click', function (event) {
    if (event.target === cancelarOverlay) closeCancelarModal();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !cancelarOverlay.hidden) closeCancelarModal();
  });
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', openCancelarModal);
  }
  document.getElementById('cancelar-dialog-confirm').addEventListener('click', function () {
    window.NiveloManifestos.cancelar(manifesto.numero);
    closeCancelarModal();
    try { sessionStorage.setItem('nivelo.novomanifesto.success', 'Manifesto cancelado com sucesso'); } catch (e) {}
    window.location.href = 'manifestos.html';
  });
})();
