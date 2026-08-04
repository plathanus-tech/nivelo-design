/* ══════════════════════════════════════════════════════════
   IMPORTAR CERTIFICADO — formulário de importação (fluxo 1) + edição, dentro
   de Configuração > Fiscal > Certificado Digital.

   Fluxo em 2 cliques no botão principal (nenhum passo de wizard/rota nova,
   só um estado local): o 1º clique valida Nome/Arquivo/Senha, "extrai" os
   dados do certificado (mock determinístico via hash do nome+arquivo — não
   há parsing real de .pfx/.p12 num protótipo estático) e revela a seção
   "Dados extraídos automaticamente"; o botão vira "Salvar Certificado" e o
   2º clique persiste de verdade. Em modo de edição (`?codigo=`) os dados já
   existem, então a seção some direto e o botão já nasce como "Salvar
   Certificado" — Arquivo/Senha não são reexigidos (editar um certificado
   fiscal não deveria envolver reenviar o arquivo; pra trocar o certificado
   em si, o fluxo esperado é importar um novo e excluir o antigo). */
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var EMITENTE = window.NiveloEmitente.getEmitente();

  // Demonstração: `?codigo=CERT-001#state=comdados` (variante de edição no
  // prototype-nav) precisa popular a lista antes de buscar o código, já que
  // ela nasce vazia por padrão — ver certificado-digital-data.js.
  if (/state=comdados/.test(location.hash)) {
    window.NiveloCertificadoDigital.seedExemplo();
  }

  var params = new URLSearchParams(location.search);
  var editCodigo = params.get('codigo');
  var isEditMode = !!editCodigo;

  var form = document.getElementById('impcert-form');
  var pageTitle = document.getElementById('impcert-page-title');
  var codigoInput = document.getElementById('ic-codigo');
  var nomeField = document.getElementById('nome-field');
  var nomeInput = document.getElementById('ic-nome');
  var arquivoField = document.getElementById('arquivo-field');
  var uploadEl = document.querySelector('.impcert-upload');
  var fileInput = document.getElementById('ic-arquivo-input');
  var selectBtn = document.getElementById('arquivo-select-btn');
  var filenameEl = document.getElementById('arquivo-filename');
  var senhaField = document.getElementById('senha-field');
  var senhaInput = document.getElementById('ic-senha');
  var observacoesInput = document.getElementById('ic-observacoes');
  var serieDuplicadaError = document.getElementById('serie-duplicada-error');
  var extraidosSection = document.getElementById('extraidos-section');
  var expiradoBanner = document.getElementById('expirado-banner');
  var submitBtn = document.getElementById('impcert-submit');

  // ---------- Mostrar/ocultar senha (mesma técnica de page-login.css) ----------
  var toggleSenhaBtn = document.getElementById('toggle-senha');
  function setSenhaVisible(visible) {
    senhaInput.type = visible ? 'text' : 'password';
    toggleSenhaBtn.setAttribute('aria-pressed', String(visible));
    toggleSenhaBtn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
    toggleSenhaBtn.innerHTML = '<i data-lucide="' + (visible ? 'eye-off' : 'eye') + '" width="18" height="18"></i>';
    if (window.lucide) lucide.createIcons();
  }
  toggleSenhaBtn.addEventListener('click', function () {
    setSenhaVisible(senhaInput.type === 'password');
  });

  // ---------- Upload do arquivo ----------
  selectBtn.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (file) {
      filenameEl.textContent = file.name;
      filenameEl.classList.add('has-file');
      arquivoField.classList.remove('error');
      uploadEl.classList.remove('error');
    } else {
      filenameEl.textContent = 'Nenhum arquivo selecionado';
      filenameEl.classList.remove('has-file');
    }
  });

  // ---------- Extração mock (determinística por hash do nome+arquivo) ----------
  function hashString(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }
  function toISODate(date) { return date.toISOString().slice(0, 10); }
  function formatData(iso) {
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  var EMISSORES = ['AC SERASA RFB v5', 'AC Certisign RFB G7', 'AC Soluti Múltipla', 'AC VALID RFB v5', 'AC Safeweb RFB v5'];

  function extrairDados(nome, arquivoNome) {
    var seed = hashString(nome + '|' + arquivoNome);
    var tipo = (seed % 5 === 0) ? 'A3' : 'A1';
    var emissor = EMISSORES[seed % EMISSORES.length];
    var diasRestantes = (seed % 400) - 60;
    var dataValidade = addDays(new Date(), diasRestantes);
    var dataInicio = addDays(dataValidade, tipo === 'A3' ? -1095 : -365);
    var numeroSerie = (seed.toString(16).toUpperCase() + hashString(arquivoNome + '|' + nome).toString(16).toUpperCase()).slice(0, 16).padEnd(16, '0');
    return {
      tipo: tipo,
      titular: EMITENTE.razaoSocial,
      documento: EMITENTE.documento,
      emissor: emissor,
      numeroSerie: numeroSerie,
      dataInicio: toISODate(dataInicio),
      dataValidade: toISODate(dataValidade)
    };
  }
  function computeStatusFromValidade(dataValidadeISO) {
    var diasRestantes = Math.round((new Date(dataValidadeISO + 'T00:00:00') - new Date()) / 86400000);
    if (diasRestantes < 0) return 'expirado';
    if (diasRestantes <= 30) return 'proximo-vencimento';
    return 'ativo';
  }
  var STATUS_BADGE = {
    'ativo': { status: 'success', label: 'Ativo' },
    'proximo-vencimento': { status: 'warning', label: 'Próximo do vencimento' },
    'expirado': { status: 'error', label: 'Expirado' },
    'revogado': { status: 'indigo', label: 'Revogado' }
  };

  var extracted = null;

  function populateExtractedSection(dados) {
    document.getElementById('ext-tipo').value = dados.tipo;
    document.getElementById('ext-titular').value = dados.titular;
    document.getElementById('ext-documento').value = dados.documento;
    document.getElementById('ext-emissor').value = dados.emissor;
    document.getElementById('ext-serie').value = dados.numeroSerie;
    document.getElementById('ext-inicio').value = formatData(dados.dataInicio);
    document.getElementById('ext-fim').value = formatData(dados.dataValidade);
    var diasRestantes = Math.round((new Date(dados.dataValidade + 'T00:00:00') - new Date()) / 86400000);
    document.getElementById('ext-dias').value = diasRestantes >= 0 ? (diasRestantes + ' dias') : ('vencido há ' + Math.abs(diasRestantes) + ' dias');
    var status = dados.status || computeStatusFromValidade(dados.dataValidade);
    var badge = STATUS_BADGE[status] || STATUS_BADGE.ativo;
    document.getElementById('ext-status').innerHTML = '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';
    expiradoBanner.hidden = status !== 'expirado';
    if (window.lucide) lucide.createIcons();
  }

  function revealExtractedSection() {
    extraidosSection.hidden = false;
  }

  // ---------- Validação ----------
  function setFieldError(fieldEl, hasError) {
    fieldEl.classList.toggle('error', hasError);
  }

  function validateBaseFields() {
    var valid = true;
    setFieldError(nomeField, !nomeInput.value.trim());
    if (!nomeInput.value.trim()) valid = false;

    if (!isEditMode) {
      var file = fileInput.files[0];
      var arquivoValido = !!(file && /\.(pfx|p12)$/i.test(file.name));
      arquivoField.classList.toggle('error', !arquivoValido);
      uploadEl.classList.toggle('error', !arquivoValido);
      if (!arquivoValido) valid = false;

      var senhaValida = !!senhaInput.value;
      setFieldError(senhaField, !senhaValida);
      if (!senhaValida) valid = false;
    }

    return valid;
  }

  // ---------- Modo edição: prefill ----------
  var certificadoExistente = null;
  if (isEditMode) {
    certificadoExistente = window.NiveloCertificadoDigital.findByCodigo(editCodigo);
  }

  if (certificadoExistente) {
    pageTitle.textContent = 'Editar Certificado';
    document.title = 'Editar Certificado — Nivelo';
    codigoInput.value = certificadoExistente.codigo;
    nomeInput.value = certificadoExistente.nome;
    observacoesInput.value = certificadoExistente.observacoes || '';
    filenameEl.textContent = certificadoExistente.arquivoNome || 'Certificado já importado';
    filenameEl.classList.add('has-file');
    selectBtn.disabled = true;
    senhaInput.disabled = true;
    senhaField.querySelector('.label').innerHTML = 'Senha do Certificado <span class="impcert-optional-tag">(não é possível alterar por aqui)</span>';
    document.getElementById('senha-error').textContent = '';

    extracted = {
      tipo: certificadoExistente.tipo,
      titular: certificadoExistente.titular,
      documento: certificadoExistente.documento,
      emissor: certificadoExistente.emissor,
      numeroSerie: certificadoExistente.numeroSerie,
      dataInicio: certificadoExistente.dataInicio,
      dataValidade: certificadoExistente.dataValidade,
      status: certificadoExistente.status
    };
    populateExtractedSection(extracted);
    revealExtractedSection();
    submitBtn.textContent = 'Salvar Certificado';
  } else if (isEditMode) {
    // Código inexistente: sem o que editar, volta pra listagem.
    window.location.href = 'certificado-digital.html';
  } else {
    codigoInput.value = window.NiveloCertificadoDigital.nextCodigo();
  }

  // ---------- Submit (2 etapas: extrair → salvar) ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!extracted) {
      if (!validateBaseFields()) return;

      var arquivoNome = fileInput.files[0].name;
      var dados = extrairDados(nomeInput.value.trim(), arquivoNome);
      dados.status = computeStatusFromValidade(dados.dataValidade);

      var duplicado = window.NiveloCertificadoDigital.findByNumeroSerie(dados.numeroSerie);
      if (duplicado) {
        serieDuplicadaError.hidden = false;
        return;
      }
      serieDuplicadaError.hidden = true;

      extracted = dados;
      extracted.arquivoNome = arquivoNome;
      populateExtractedSection(extracted);
      revealExtractedSection();
      submitBtn.textContent = 'Salvar Certificado';
      extraidosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (!validateBaseFields()) return;

    var payload = {
      nome: nomeInput.value.trim(),
      tipo: extracted.tipo,
      titular: extracted.titular,
      documento: extracted.documento,
      numeroSerie: extracted.numeroSerie,
      emissor: extracted.emissor,
      dataInicio: extracted.dataInicio,
      dataValidade: extracted.dataValidade,
      arquivoNome: certificadoExistente ? certificadoExistente.arquivoNome : extracted.arquivoNome,
      origem: certificadoExistente ? certificadoExistente.origem : 'importado',
      status: certificadoExistente && certificadoExistente.status === 'revogado' ? 'revogado' : extracted.status,
      observacoes: observacoesInput.value.trim(),
      dataAlteracao: toISODate(new Date()),
      usuarioAlteracao: 'Miguel Silva'
    };

    var successMessage;
    if (certificadoExistente) {
      window.NiveloCertificadoDigital.update(certificadoExistente.codigo, payload);
      successMessage = 'Certificado editado com sucesso.';
    } else {
      payload.dataCadastro = toISODate(new Date());
      payload.usuarioCadastro = 'Miguel Silva';
      window.NiveloCertificadoDigital.add(payload);
      successMessage = 'Certificado importado com sucesso.';
    }

    try { sessionStorage.setItem('nivelo.certificadodigital.success', successMessage); } catch (e) {}
    window.location.href = 'certificado-digital.html';
  });
})();
