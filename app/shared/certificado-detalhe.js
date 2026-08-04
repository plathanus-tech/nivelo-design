(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var STATUS_BADGE = {
    'ativo': { status: 'success', label: 'Ativo' },
    'proximo-vencimento': { status: 'warning', label: 'Próximo do vencimento' },
    'expirado': { status: 'error', label: 'Expirado' },
    'revogado': { status: 'indigo', label: 'Revogado' }
  };
  var ORIGEM_LABEL = { importado: 'Importado', parceiro: 'Emitido com parceiro' };

  function formatData(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  if (/state=comdados/.test(location.hash)) {
    window.NiveloCertificadoDigital.seedExemplo();
  }

  var hashMatch = location.hash.match(/codigo=([^&]+)/);
  var codigo = hashMatch ? decodeURIComponent(hashMatch[1]) : null;
  var certificado = codigo ? window.NiveloCertificadoDigital.findByCodigo(codigo) : null;

  var contentEl = document.getElementById('certdet-content');
  var notFoundEl = document.getElementById('certdet-not-found');

  if (!certificado) {
    contentEl.hidden = true;
    notFoundEl.hidden = false;
    return;
  }

  document.title = certificado.nome + ' — Nivelo';
  document.getElementById('certdet-titulo').textContent = certificado.nome;

  var badge = STATUS_BADGE[certificado.status] || STATUS_BADGE.ativo;
  document.getElementById('certdet-status').innerHTML =
    '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';

  var diasRestantes = Math.round((new Date(certificado.dataValidade + 'T00:00:00') - new Date()) / 86400000);
  var diasLabel = diasRestantes >= 0 ? (diasRestantes + ' dias') : ('vencido há ' + Math.abs(diasRestantes) + ' dias');

  document.getElementById('certdet-grid').innerHTML =
    '<div><dt>Código</dt><dd>' + certificado.codigo + '</dd></div>' +
    '<div><dt>Tipo</dt><dd>' + certificado.tipo + '</dd></div>' +
    '<div><dt>Titular</dt><dd>' + certificado.titular + '</dd></div>' +
    '<div><dt>CPF/CNPJ</dt><dd>' + certificado.documento + '</dd></div>' +
    '<div><dt>Emissor</dt><dd>' + certificado.emissor + '</dd></div>' +
    '<div><dt>Número de série</dt><dd>' + certificado.numeroSerie + '</dd></div>' +
    '<div><dt>Data inicial</dt><dd>' + formatData(certificado.dataInicio) + '</dd></div>' +
    '<div><dt>Data final</dt><dd>' + formatData(certificado.dataValidade) + '</dd></div>' +
    '<div><dt>Dias restantes</dt><dd>' + diasLabel + '</dd></div>' +
    '<div><dt>Origem</dt><dd>' + (ORIGEM_LABEL[certificado.origem] || certificado.origem) + '</dd></div>' +
    '<div class="certdigital-view-span-2"><dt>Arquivo</dt><dd>' + (certificado.arquivoNome || '—') + '</dd></div>' +
    (certificado.observacoes ? '<div class="certdigital-view-span-2"><dt>Observações</dt><dd>' + certificado.observacoes + '</dd></div>' : '');

  if (window.lucide) lucide.createIcons();

  document.getElementById('certdet-editar-btn').addEventListener('click', function () {
    window.location.href = 'importar-certificado.html?codigo=' + encodeURIComponent(certificado.codigo);
  });
})();
