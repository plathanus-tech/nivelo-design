(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Emitente: só exibição, sempre preenchido do "cadastro"
  // (emitente-data.js) — nunca editável, mesmo padrão de Nova Nota Fiscal. ----------
  var emitente = window.NiveloEmitente.getEmitente();
  document.getElementById('nm-emitente-razao').value = emitente.razaoSocial;
  document.getElementById('nm-emitente-documento').value = emitente.documento;
  document.getElementById('nm-emitente-endereco').value = emitente.endereco;

  // ---------- Helpers de erro (mesmo padrão `.wrapper.error` de todo o
  // sistema) ----------
  function setFieldError(fieldEl, hasError) {
    fieldEl.classList.toggle('error', hasError);
  }
  function clearErrorOnInput(inputEl, fieldEl) {
    inputEl.addEventListener('input', function () {
      if (fieldEl.classList.contains('error') && inputEl.value.trim()) {
        setFieldError(fieldEl, false);
      }
    });
  }

  // ---------- Máscaras ----------
  function formatUpperAlnum(value, maxLength) {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, maxLength);
  }
  function formatUF(value) {
    return value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  }
  function formatCPF(digits) {
    var out = digits.slice(0, 3);
    if (digits.length > 3) out += '.' + digits.slice(3, 6);
    if (digits.length > 6) out += '.' + digits.slice(6, 9);
    if (digits.length > 9) out += '-' + digits.slice(9, 11);
    return out;
  }
  function formatCNPJ(digits) {
    var out = digits.slice(0, 2);
    if (digits.length > 2) out += '.' + digits.slice(2, 5);
    if (digits.length > 5) out += '.' + digits.slice(5, 8);
    if (digits.length > 8) out += '/' + digits.slice(8, 12);
    if (digits.length > 12) out += '-' + digits.slice(12, 14);
    return out;
  }
  // Documento único, sem seletor de tipo: formata como CPF enquanto tiver
  // até 11 dígitos, vira CNPJ automaticamente a partir do 12º dígito
  // (mesmo raciocínio de formatCPF/formatCNPJ de novo-cadastro.js, só que
  // sem um Dropdown de tipo pra decidir — aqui o próprio tamanho decide).
  function formatCpfCnpjAuto(value) {
    var digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.length > 11 ? formatCNPJ(digits) : formatCPF(digits);
  }
  function attachCpfCnpjMask(inputEl) {
    inputEl.addEventListener('input', function () {
      inputEl.value = formatCpfCnpjAuto(inputEl.value);
    });
  }
  function formatCEP(value) {
    var digits = value.replace(/\D/g, '').slice(0, 8);
    var out = digits.slice(0, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 8);
    return out;
  }

  // ---------- Placas: maiúsculas, alfanumérico, só Placa 1 obrigatória ----------
  var placa1Field = document.getElementById('nm-placa1-field');
  var placa1Input = document.getElementById('nm-placa1');
  var placa2Input = document.getElementById('nm-placa2');
  var placa3Input = document.getElementById('nm-placa3');
  [placa1Input, placa2Input, placa3Input].forEach(function (input) {
    input.addEventListener('input', function () { input.value = formatUpperAlnum(input.value, 7); });
  });
  clearErrorOnInput(placa1Input, placa1Field);

  // ---------- Motorista ----------
  var motoristaNomeField = document.getElementById('nm-motorista-nome-field');
  var motoristaNomeInput = document.getElementById('nm-motorista-nome');
  clearErrorOnInput(motoristaNomeInput, motoristaNomeField);

  var motoristaDocumentoField = document.getElementById('nm-motorista-documento-field');
  var motoristaDocumentoInput = document.getElementById('nm-motorista-documento');
  attachCpfCnpjMask(motoristaDocumentoInput);
  clearErrorOnInput(motoristaDocumentoInput, motoristaDocumentoField);

  // ---------- Endereço do motorista: CEP + ViaCEP (mesma lógica exata já
  // usada em cadastro-endereco.js/nova-fazenda.js). ----------
  var motCepField = document.getElementById('nm-mot-cep-field');
  var motCepInput = document.getElementById('nm-mot-cep');
  var motLogradouroField = document.getElementById('nm-mot-logradouro-field');
  var motLogradouroInput = document.getElementById('nm-mot-logradouro');
  var motNumeroField = document.getElementById('nm-mot-numero-field');
  var motNumeroInput = document.getElementById('nm-mot-numero');
  var motComplementoInput = document.getElementById('nm-mot-complemento');
  var motBairroField = document.getElementById('nm-mot-bairro-field');
  var motBairroInput = document.getElementById('nm-mot-bairro');
  var motCidadeField = document.getElementById('nm-mot-cidade-field');
  var motCidadeInput = document.getElementById('nm-mot-cidade');
  var motEstadoField = document.getElementById('nm-mot-estado-field');
  var motEstadoInput = document.getElementById('nm-mot-estado');

  [
    [motCepInput, motCepField], [motLogradouroInput, motLogradouroField], [motNumeroInput, motNumeroField],
    [motBairroInput, motBairroField], [motCidadeInput, motCidadeField], [motEstadoInput, motEstadoField]
  ].forEach(function (pair) { clearErrorOnInput(pair[0], pair[1]); });

  motEstadoInput.addEventListener('input', function () { motEstadoInput.value = formatUF(motEstadoInput.value); });

  function fillIfEmpty(input, field, value) {
    if (!value || input.value.trim()) return;
    input.value = value;
    setFieldError(field, false);
  }
  function lookupCEP(digits) {
    fetch('https://viacep.com.br/ws/' + digits + '/json/')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.erro) return;
        fillIfEmpty(motLogradouroInput, motLogradouroField, data.logradouro);
        fillIfEmpty(motBairroInput, motBairroField, data.bairro);
        fillIfEmpty(motCidadeInput, motCidadeField, data.localidade);
        fillIfEmpty(motEstadoInput, motEstadoField, data.uf);
      })
      .catch(function () {
        // Falha na consulta (offline, CEP inexistente etc.): campos seguem
        // vazios/editáveis pra preenchimento manual, sem travar o fluxo.
      });
  }
  motCepInput.addEventListener('input', function () {
    motCepInput.value = formatCEP(motCepInput.value);
    var digits = motCepInput.value.replace(/\D/g, '');
    if (digits.length === 8) lookupCEP(digits);
  });

  // ---------- Origem / Destino ----------
  var origemCidadeField = document.getElementById('nm-origem-cidade-field');
  var origemCidadeInput = document.getElementById('nm-origem-cidade');
  var origemEstadoField = document.getElementById('nm-origem-estado-field');
  var origemEstadoInput = document.getElementById('nm-origem-estado');
  var destinoCidadeField = document.getElementById('nm-destino-cidade-field');
  var destinoCidadeInput = document.getElementById('nm-destino-cidade');
  var destinoEstadoField = document.getElementById('nm-destino-estado-field');
  var destinoEstadoInput = document.getElementById('nm-destino-estado');

  [
    [origemCidadeInput, origemCidadeField], [origemEstadoInput, origemEstadoField],
    [destinoCidadeInput, destinoCidadeField], [destinoEstadoInput, destinoEstadoField]
  ].forEach(function (pair) { clearErrorOnInput(pair[0], pair[1]); });
  origemEstadoInput.addEventListener('input', function () { origemEstadoInput.value = formatUF(origemEstadoInput.value); });
  destinoEstadoInput.addEventListener('input', function () { destinoEstadoInput.value = formatUF(destinoEstadoInput.value); });

  // ---------- Documentos da Carga (repeater) — mesmo raciocínio exato do
  // repeater de Itens em nova-nota-fiscal.js: array em memória +
  // re-render, título "Documento N" + remover (só quando há mais de 1). ----------
  var documentos = [];
  var documentoIdSeq = 0;
  var documentosListEl = document.getElementById('nm-documentos-list');
  var documentosErrorEl = document.getElementById('nm-documentos-error');

  function documentoRowHTML(doc, position) {
    var removeBtn = documentos.length > 1
      ? '<button type="button" class="actionBtn actionDanger nm-documento-remove" data-remove-documento="' + doc.id + '" aria-label="Remover documento"><i data-lucide="trash-2" width="16" height="16"></i></button>'
      : '';
    return (
      '<div class="nm-documento" data-documento-id="' + doc.id + '">' +
        '<div class="nm-documento-header">' +
          '<h3 class="nm-documento-title text-subtitle-s">Documento ' + position + '</h3>' +
          removeBtn +
        '</div>' +
        '<div class="nm-grid">' +
          '<div class="wrapper nm-span-2" id="nm-doc-chave-field-' + doc.id + '">' +
            '<label class="label" for="nm-doc-chave-' + doc.id + '">Chave da Nota Fiscal</label>' +
            '<div class="inputWrap"><input class="input" type="text" inputmode="numeric" maxlength="44" id="nm-doc-chave-' + doc.id + '" data-doc-field="chave" value="' + (doc.chave || '') + '" placeholder="Chave de acesso da NF-e (44 dígitos)" /></div>' +
          '</div>' +
          '<div class="wrapper" id="nm-doc-origem-field-' + doc.id + '">' +
            '<label class="label" for="nm-doc-origem-' + doc.id + '">Origem</label>' +
            '<div class="inputWrap"><input class="input" type="text" id="nm-doc-origem-' + doc.id + '" data-doc-field="origem" value="' + (doc.origem || '') + '" placeholder="Cidade/UF" /></div>' +
          '</div>' +
          '<div class="wrapper" id="nm-doc-destino-field-' + doc.id + '">' +
            '<label class="label" for="nm-doc-destino-' + doc.id + '">Destino</label>' +
            '<div class="inputWrap"><input class="input" type="text" id="nm-doc-destino-' + doc.id + '" data-doc-field="destino" value="' + (doc.destino || '') + '" placeholder="Cidade/UF" /></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function readDocumentosFromDOM() {
    documentos.forEach(function (doc) {
      var root = documentosListEl.querySelector('[data-documento-id="' + doc.id + '"]');
      if (!root) return;
      doc.chave = root.querySelector('[data-doc-field="chave"]').value.trim();
      doc.origem = root.querySelector('[data-doc-field="origem"]').value.trim();
      doc.destino = root.querySelector('[data-doc-field="destino"]').value.trim();
    });
  }

  function renderDocumentos() {
    documentosListEl.innerHTML = documentos.map(function (doc, index) { return documentoRowHTML(doc, index + 1); }).join('');
    if (window.lucide) lucide.createIcons();
  }

  function addDocumento(prefill) {
    readDocumentosFromDOM();
    documentoIdSeq += 1;
    documentos.push({ id: documentoIdSeq, chave: (prefill && prefill.chave) || '', origem: (prefill && prefill.origem) || '', destino: (prefill && prefill.destino) || '' });
    renderDocumentos();
  }

  function removeDocumento(id) {
    readDocumentosFromDOM();
    documentos = documentos.filter(function (doc) { return doc.id !== id; });
    renderDocumentos();
  }

  documentosListEl.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-remove-documento]');
    if (!btn) return;
    removeDocumento(Number(btn.dataset.removeDocumento));
  });
  documentosListEl.addEventListener('input', function () {
    if (documentosErrorEl.classList.contains('error')) documentosErrorEl.classList.remove('error');
  });

  document.getElementById('nm-add-documento-btn').addEventListener('click', function () { addDocumento(); });

  // ---------- Seguro da Carga (opcional — nenhuma validação) ----------
  var seguroCnpjInput = document.getElementById('nm-seguro-cnpj');
  seguroCnpjInput.addEventListener('input', function () { seguroCnpjInput.value = formatCNPJ(seguroCnpjInput.value.replace(/\D/g, '').slice(0, 14)); });

  // ---------- Pagamento do Frete ----------
  var pagamentoDocumentoField = document.getElementById('nm-pagamento-documento-field');
  var pagamentoDocumentoInput = document.getElementById('nm-pagamento-documento');
  attachCpfCnpjMask(pagamentoDocumentoInput);
  clearErrorOnInput(pagamentoDocumentoInput, pagamentoDocumentoField);

  var pagamentoDadosField = document.getElementById('nm-pagamento-dados-field');
  var pagamentoDadosInput = document.getElementById('nm-pagamento-dados');
  clearErrorOnInput(pagamentoDadosInput, pagamentoDadosField);

  // ---------- Validação ----------
  function runValidation() {
    readDocumentosFromDOM();

    var placa1Invalid = !placa1Input.value.trim();
    setFieldError(placa1Field, placa1Invalid);

    var motoristaNomeInvalid = !motoristaNomeInput.value.trim();
    setFieldError(motoristaNomeField, motoristaNomeInvalid);
    var motoristaDocumentoInvalid = !motoristaDocumentoInput.value.trim();
    setFieldError(motoristaDocumentoField, motoristaDocumentoInvalid);

    var motCepInvalid = !motCepInput.value.trim();
    setFieldError(motCepField, motCepInvalid);
    var motLogradouroInvalid = !motLogradouroInput.value.trim();
    setFieldError(motLogradouroField, motLogradouroInvalid);
    var motNumeroInvalid = !motNumeroInput.value.trim();
    setFieldError(motNumeroField, motNumeroInvalid);
    var motBairroInvalid = !motBairroInput.value.trim();
    setFieldError(motBairroField, motBairroInvalid);
    var motCidadeInvalid = !motCidadeInput.value.trim();
    setFieldError(motCidadeField, motCidadeInvalid);
    var motEstadoInvalid = motEstadoInput.value.trim().length !== 2;
    setFieldError(motEstadoField, motEstadoInvalid);

    var origemCidadeInvalid = !origemCidadeInput.value.trim();
    setFieldError(origemCidadeField, origemCidadeInvalid);
    var origemEstadoInvalid = origemEstadoInput.value.trim().length !== 2;
    setFieldError(origemEstadoField, origemEstadoInvalid);
    var destinoCidadeInvalid = !destinoCidadeInput.value.trim();
    setFieldError(destinoCidadeField, destinoCidadeInvalid);
    var destinoEstadoInvalid = destinoEstadoInput.value.trim().length !== 2;
    setFieldError(destinoEstadoField, destinoEstadoInvalid);

    var documentosInvalid = documentos.length === 0 || documentos.some(function (doc) {
      return !doc.chave.trim() || !doc.origem.trim() || !doc.destino.trim();
    });
    documentosErrorEl.classList.toggle('error', documentosInvalid);

    var pagamentoDocumentoInvalid = !pagamentoDocumentoInput.value.trim();
    setFieldError(pagamentoDocumentoField, pagamentoDocumentoInvalid);
    var pagamentoDadosInvalid = !pagamentoDadosInput.value.trim();
    setFieldError(pagamentoDadosField, pagamentoDadosInvalid);

    return !(placa1Invalid || motoristaNomeInvalid || motoristaDocumentoInvalid ||
      motCepInvalid || motLogradouroInvalid || motNumeroInvalid || motBairroInvalid || motCidadeInvalid || motEstadoInvalid ||
      origemCidadeInvalid || origemEstadoInvalid || destinoCidadeInvalid || destinoEstadoInvalid ||
      documentosInvalid || pagamentoDocumentoInvalid || pagamentoDadosInvalid);
  }

  function buildPayload() {
    readDocumentosFromDOM();
    var seguroPreenchido = document.getElementById('nm-seguro-seguradora').value.trim() ||
      seguroCnpjInput.value.trim() || document.getElementById('nm-seguro-apolice').value.trim() || document.getElementById('nm-seguro-averbacao').value.trim();
    return {
      dataEmissao: todayISO(),
      placas: [placa1Input.value.trim(), placa2Input.value.trim(), placa3Input.value.trim()],
      motorista: {
        nome: motoristaNomeInput.value.trim(),
        documento: motoristaDocumentoInput.value.trim(),
        endereco: {
          cep: motCepInput.value.trim(), logradouro: motLogradouroInput.value.trim(), numero: motNumeroInput.value.trim(),
          complemento: motComplementoInput.value.trim(), bairro: motBairroInput.value.trim(), cidade: motCidadeInput.value.trim(), estado: motEstadoInput.value.trim()
        }
      },
      origem: { cidade: origemCidadeInput.value.trim(), estado: origemEstadoInput.value.trim() },
      destino: { cidade: destinoCidadeInput.value.trim(), estado: destinoEstadoInput.value.trim() },
      documentos: documentos.map(function (doc) { return { chaveNF: doc.chave.trim(), origem: doc.origem.trim(), destino: doc.destino.trim() }; }),
      seguro: seguroPreenchido ? {
        seguradora: document.getElementById('nm-seguro-seguradora').value.trim(),
        cnpj: seguroCnpjInput.value.trim(),
        apolice: document.getElementById('nm-seguro-apolice').value.trim(),
        averbacao: document.getElementById('nm-seguro-averbacao').value.trim()
      } : null,
      pagamento: { documento: pagamentoDocumentoInput.value.trim(), dadosBancariosPix: pagamentoDadosInput.value.trim() }
    };
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------- Modo: criação (padrão) / edição (?modo=corrigir) /
  // visualização (?modo=ver) — mesmo padrão de `?numero=&modo=` já usado
  // em Nova Nota Fiscal/Nova Conta a Pagar. ----------
  var params = new URLSearchParams(location.search);
  var numeroParam = params.get('numero');
  var modo = params.get('modo');
  var editingManifesto = numeroParam ? window.NiveloManifestos.findByNumero(numeroParam) : null;

  var pageTitleEl = document.getElementById('nm-page-title');
  var submitBtn = document.getElementById('nm-submit');
  var salvarBtn = document.getElementById('nm-salvar');
  var cancelLink = document.getElementById('nm-cancel');
  var addDocumentoBtn = document.getElementById('nm-add-documento-btn');
  var form = document.getElementById('nm-form');

  var ALL_INPUTS = [
    placa1Input, placa2Input, placa3Input, motoristaNomeInput, motoristaDocumentoInput,
    motCepInput, motLogradouroInput, motNumeroInput, motComplementoInput, motBairroInput, motCidadeInput, motEstadoInput,
    origemCidadeInput, origemEstadoInput, destinoCidadeInput, destinoEstadoInput,
    document.getElementById('nm-seguro-seguradora'), seguroCnpjInput, document.getElementById('nm-seguro-apolice'), document.getElementById('nm-seguro-averbacao'),
    pagamentoDocumentoInput, pagamentoDadosInput
  ];

  if (editingManifesto) {
    placa1Input.value = editingManifesto.placas[0] || '';
    placa2Input.value = editingManifesto.placas[1] || '';
    placa3Input.value = editingManifesto.placas[2] || '';
    motoristaNomeInput.value = editingManifesto.motorista.nome;
    motoristaDocumentoInput.value = editingManifesto.motorista.documento;
    motCepInput.value = editingManifesto.motorista.endereco.cep;
    motLogradouroInput.value = editingManifesto.motorista.endereco.logradouro;
    motNumeroInput.value = editingManifesto.motorista.endereco.numero;
    motComplementoInput.value = editingManifesto.motorista.endereco.complemento || '';
    motBairroInput.value = editingManifesto.motorista.endereco.bairro;
    motCidadeInput.value = editingManifesto.motorista.endereco.cidade;
    motEstadoInput.value = editingManifesto.motorista.endereco.estado;
    origemCidadeInput.value = editingManifesto.origem.cidade;
    origemEstadoInput.value = editingManifesto.origem.estado;
    destinoCidadeInput.value = editingManifesto.destino.cidade;
    destinoEstadoInput.value = editingManifesto.destino.estado;
    editingManifesto.documentos.forEach(function (doc) { addDocumento({ chave: doc.chaveNF, origem: doc.origem, destino: doc.destino }); });
    if (editingManifesto.seguro) {
      document.getElementById('nm-seguro-seguradora').value = editingManifesto.seguro.seguradora || '';
      seguroCnpjInput.value = editingManifesto.seguro.cnpj || '';
      document.getElementById('nm-seguro-apolice').value = editingManifesto.seguro.apolice || '';
      document.getElementById('nm-seguro-averbacao').value = editingManifesto.seguro.averbacao || '';
    }
    pagamentoDocumentoInput.value = editingManifesto.pagamento.documento;
    pagamentoDadosInput.value = editingManifesto.pagamento.dadosBancariosPix;

    if (modo === 'ver') {
      pageTitleEl.textContent = 'Visualizar Manifesto';
      document.title = 'Visualizar Manifesto — Nivelo';
      ALL_INPUTS.forEach(function (el) { el.disabled = true; });
      addDocumentoBtn.hidden = true;
      submitBtn.hidden = true;
      salvarBtn.hidden = true;
      cancelLink.textContent = 'Voltar';
    } else if (modo === 'corrigir') {
      pageTitleEl.textContent = 'Editar Manifesto';
      document.title = 'Editar Manifesto — Nivelo';
      submitBtn.textContent = 'Salvar alterações';
      salvarBtn.hidden = true;
    }
  } else {
    addDocumento();
  }

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error, #nm-documentos-error.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button') || firstInvalid;
        if (focusable.focus) focusable.focus();
      }
      return;
    }

    var payload = buildPayload();
    var successMessage;
    if (editingManifesto) {
      window.NiveloManifestos.update(editingManifesto.numero, payload);
      successMessage = 'Manifesto editado com sucesso.';
    } else {
      window.NiveloManifestos.add(payload);
      successMessage = 'Manifesto cadastrado com sucesso.';
    }

    try { sessionStorage.setItem('nivelo.novomanifesto.success', successMessage); } catch (e) {}
    window.location.href = 'manifestos.html';
  });
})();
