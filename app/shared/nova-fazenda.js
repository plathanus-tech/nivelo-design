(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Status do talhão NESTA tela: só Ativo/Inativo — mesmo vocabulário/campo
  // booleano (`ativo`) já usado por fazenda-detalhe-cadastro.js, não um
  // enum de status próprio (pedido explícito de manter as 2 opções).
  var ATIVO_STATUS = {
    true: { status: 'success', label: 'Ativo' },
    false: { status: 'warning', label: 'Inativo' }
  };

  // Estado do wizard inteiro, em memória — nada é persistido em
  // sessionStorage entre etapas (não há reload de página nesta tela: as 3
  // seções alternam via `hidden`, controladas por `goToStep`).
  var wizardState = { talhoes: [] };
  var editingTalhaoIndex = null; // null = adicionando um talhão novo
  var pendingRemoveIndex = null;

  // ---------- Modo edição (?id=<fazenda>) vs. criação ----------
  // Mesma convenção de `novo-produto.html?sku=`/`novo-cadastro.html#state=edit`:
  // abre o mesmo formulário, pré-preenchido, "mesma experiência utilizada
  // nos demais cadastros" (pedido explícito do usuário). A Etapa 3
  // (Talhões) NUNCA aparece em modo edição — talhões já têm gestão própria
  // e completa em fazenda-detalhe-cadastro.html; reenviar `wizardState.
  // talhoes` aqui perderia campos que só aquela tela conhece (cultura/
  // safra/status operacional), então o patch enviado a `update()` nunca
  // inclui a chave `talhoes`.
  var editParams = new URLSearchParams(location.search);
  var editId = editParams.get('id');
  var editingFazenda = editId ? window.NiveloFazendas.findById(editId) : null;

  function flashDisable(el) {
    el.disabled = true;
    window.setTimeout(function () { el.disabled = false; }, 300);
  }

  // ---------- Dropdown genérico (mesmo padrão de fazenda-detalhe-cadastro.js/
  // novo-produto.js: wrapper/trigger/menu/option, menu em `position:fixed`). ----------
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

    function selectValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
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

    return { selectOption: selectOption, selectValue: selectValue };
  }

  // ══════════════════ ETAPA 1 — Dados da fazenda ══════════════════

  var codigoInput = document.getElementById('nf-codigo');
  var nomeField = document.getElementById('nf-nome-field');
  var nomeInput = document.getElementById('nf-nome');
  var nomeError = document.getElementById('nf-nome-error');
  var proprietarioField = document.getElementById('nf-proprietario-field');
  var proprietarioInput = document.getElementById('nf-proprietario');
  var cnpjField = document.getElementById('nf-cnpj-field');
  var cnpjInput = document.getElementById('nf-cnpj');
  var ieField = document.getElementById('nf-ie-field');
  var ieInput = document.getElementById('nf-ie');
  var matriculaField = document.getElementById('nf-matricula-field');
  var matriculaInput = document.getElementById('nf-matricula');

  // Preview cosmético — o código real (zero-padded, sequencial) só é gerado
  // de verdade dentro de `NiveloFazendas.add()` ao salvar (mesma convenção
  // de novo-produto.js: o campo aqui só mostra um placeholder plausível).
  // Em modo edição, mostra o código real (já existe, nunca muda).
  codigoInput.value = editingFazenda
    ? editingFazenda.codigo
    : '0' + String(window.NiveloFazendas.list().length + 1).padStart(3, '0');

  if (editingFazenda) {
    nomeInput.value = editingFazenda.nome || '';
    proprietarioInput.value = editingFazenda.proprietario || '';
    cnpjInput.value = editingFazenda.cnpj || '';
    ieInput.value = editingFazenda.inscricaoEstadual || '';
    matriculaInput.value = editingFazenda.matricula || '';
  }

  // Documento único (CNPJ ou CPF): máscara auto-detectada por tamanho, mesma
  // técnica já usada em login.js/cadastro.js — formata como CPF enquanto
  // tiver até 11 dígitos, vira CNPJ automaticamente a partir do 12º dígito,
  // sem nenhum seletor de tipo. Validação real com dígito verificador dos
  // dois documentos (não só contagem de dígitos).
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
  function formatCpfCnpjAuto(value) {
    var digits = value.replace(/\D/g, '').slice(0, 14);
    return digits.length > 11 ? formatCNPJ(digits) : formatCPF(digits);
  }

  function isValidCPF(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    function checkDigit(base) {
      var sum = 0;
      for (var i = 0; i < base.length; i++) {
        sum += parseInt(base.charAt(i), 10) * (base.length + 1 - i);
      }
      var rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    }

    var d1 = checkDigit(digits.slice(0, 9));
    var d2 = checkDigit(digits.slice(0, 9) + d1);
    return digits.slice(9, 11) === String(d1) + String(d2);
  }

  function isValidCNPJ(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digits)) return false;

    function checkDigit(base, weights) {
      var sum = 0;
      for (var i = 0; i < base.length; i++) {
        sum += parseInt(base.charAt(i), 10) * weights[i];
      }
      var rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    }

    var w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var base = digits.slice(0, 12);
    var d1 = checkDigit(base, w1);
    var d2 = checkDigit(base + d1, w2);
    return digits.slice(12, 14) === String(d1) + String(d2);
  }

  function isValidCpfCnpj(value) {
    var digits = value.replace(/\D/g, '');
    if (!digits) return false;
    return digits.length > 11 ? isValidCNPJ(value) : isValidCPF(value);
  }

  cnpjInput.addEventListener('input', function () {
    cnpjInput.value = formatCpfCnpjAuto(cnpjInput.value);
    if (cnpjField.classList.contains('error') && isValidCpfCnpj(cnpjInput.value)) {
      cnpjField.classList.remove('error');
    }
  });

  // Erros somem ao corrigir (mesmo padrão de novo-produto.js).
  function clearErrorOnInput(field, input, isValid) {
    input.addEventListener('input', function () {
      if (field.classList.contains('error') && isValid(input.value)) {
        field.classList.remove('error');
      }
    });
  }
  clearErrorOnInput(nomeField, nomeInput, function (v) { return v.trim() !== ''; });
  clearErrorOnInput(proprietarioField, proprietarioInput, function (v) { return v.trim() !== ''; });
  clearErrorOnInput(ieField, ieInput, function (v) { return v.trim() !== ''; });
  clearErrorOnInput(matriculaField, matriculaInput, function (v) { return v.trim() !== ''; });

  function validateStep1() {
    var nomeInvalid = !nomeInput.value.trim();
    nomeField.classList.toggle('error', nomeInvalid);
    var proprietarioInvalid = !proprietarioInput.value.trim();
    proprietarioField.classList.toggle('error', proprietarioInvalid);
    var cnpjInvalid = !isValidCpfCnpj(cnpjInput.value);
    cnpjField.classList.toggle('error', cnpjInvalid);
    var ieInvalid = !ieInput.value.trim();
    ieField.classList.toggle('error', ieInvalid);
    var matriculaInvalid = !matriculaInput.value.trim();
    matriculaField.classList.toggle('error', matriculaInvalid);

    var firstInvalidInput = nomeInvalid ? nomeInput : proprietarioInvalid ? proprietarioInput : cnpjInvalid ? cnpjInput : ieInvalid ? ieInput : matriculaInvalid ? matriculaInput : null;
    if (firstInvalidInput) firstInvalidInput.focus();
    return !nomeInvalid && !proprietarioInvalid && !cnpjInvalid && !ieInvalid && !matriculaInvalid;
  }

  // ══════════════════ ETAPA 2 — Localização e áreas ══════════════════

  var cepField = document.getElementById('nf-cep-field');
  var cepInput = document.getElementById('nf-cep');
  var ruaField = document.getElementById('nf-rua-field');
  var ruaInput = document.getElementById('nf-rua');
  var numeroField = document.getElementById('nf-numero-field');
  var numeroInput = document.getElementById('nf-numero');
  var complementoInput = document.getElementById('nf-complemento');
  var bairroField = document.getElementById('nf-bairro-field');
  var bairroInput = document.getElementById('nf-bairro');
  var cidadeField = document.getElementById('nf-cidade-field');
  var cidadeInput = document.getElementById('nf-cidade');
  var estadoField = document.getElementById('nf-estado-field');
  var estadoInput = document.getElementById('nf-estado');
  var latitudeInput = document.getElementById('nf-latitude');
  var longitudeInput = document.getElementById('nf-longitude');
  var areaTotalField = document.getElementById('nf-area-total-field');
  var areaTotalInput = document.getElementById('nf-area-total');
  var areaAgriculturaField = document.getElementById('nf-area-agricultura-field');
  var areaAgriculturaInput = document.getElementById('nf-area-agricultura');
  var arrendatarioInput = document.getElementById('nf-arrendatario');

  // Prefill da Etapa 2 em modo edição — Cidade/Estado já são campos
  // discretos no registro (ver fazendas-data.js), mas CEP/Rua/Número/
  // Complemento/Bairro só existem compostos dentro de `enderecoCompleto`
  // (string única) e ficam em branco aqui de propósito: preenchê-los é
  // opcional, e só recompomos/sobrescrevemos o endereço completo no submit
  // se o usuário realmente informar Rua (ver `submitEdit()`), preservando o
  // endereço original de fazendas seed/criadas que nunca tiveram esses
  // campos separados.
  if (editingFazenda) {
    cidadeInput.value = editingFazenda.cidade || '';
    estadoInput.value = editingFazenda.estado || '';
    latitudeInput.value = editingFazenda.latitude != null ? editingFazenda.latitude : '';
    longitudeInput.value = editingFazenda.longitude != null ? editingFazenda.longitude : '';
    if (editingFazenda.areaHa != null) areaTotalInput.value = formatMilhar(String(editingFazenda.areaHa));
    if (editingFazenda.areaAgricultura != null) areaAgriculturaInput.value = formatMilhar(String(editingFazenda.areaAgricultura));
    if (editingFazenda.arrendamento && editingFazenda.arrendamento.arrendatario) {
      arrendatarioInput.value = editingFazenda.arrendamento.arrendatario;
    }
  }

  var ENDERECO_REQUIRED_FIELDS = [
    { field: cepField, input: cepInput },
    { field: ruaField, input: ruaInput },
    { field: numeroField, input: numeroInput },
    { field: bairroField, input: bairroInput },
    { field: cidadeField, input: cidadeInput },
    { field: estadoField, input: estadoInput }
  ];

  // Subconjunto usado só pra detectar "o usuário começou a editar o
  // endereço" em modo edição — deliberadamente SEM Cidade/Estado, que já
  // vêm pré-preenchidos do registro existente (ver prefill acima) e por
  // isso não servem de sinal de intenção de alterar o endereço.
  var ENDERECO_DETALHE_FIELDS = [
    { field: cepField, input: cepInput },
    { field: ruaField, input: ruaInput },
    { field: numeroField, input: numeroInput },
    { field: bairroField, input: bairroInput }
  ];
  ENDERECO_REQUIRED_FIELDS.forEach(function (item) {
    clearErrorOnInput(item.field, item.input, function (v) { return v.trim() !== ''; });
  });
  clearErrorOnInput(areaTotalField, areaTotalInput, function (v) { return v !== ''; });

  // ---------- Máscara de CEP + Estado maiúsculo + ViaCEP (mesma lógica de
  // cadastro-endereco.js — "mesmos campos e padrão utilizados no cadastro
  // de conta", pedido explícito do usuário). ----------
  function formatCEP(value) {
    var digits = value.replace(/\D/g, '').slice(0, 8);
    var out = digits.slice(0, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 8);
    return out;
  }

  estadoInput.addEventListener('input', function () {
    estadoInput.value = estadoInput.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  });

  function fillIfEmpty(input, field, value) {
    if (!value || input.value.trim()) return;
    input.value = value;
    field.classList.remove('error');
  }

  function lookupCEP(digits) {
    fetch('https://viacep.com.br/ws/' + digits + '/json/')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.erro) return;
        fillIfEmpty(ruaInput, ruaField, data.logradouro);
        fillIfEmpty(bairroInput, bairroField, data.bairro);
        fillIfEmpty(cidadeInput, cidadeField, data.localidade);
        fillIfEmpty(estadoInput, estadoField, data.uf);
      })
      .catch(function () {
        // Falha na consulta (offline, CEP inexistente etc.): campos seguem
        // vazios/editáveis pra preenchimento manual, sem travar o fluxo.
      });
  }

  cepInput.addEventListener('input', function () {
    cepInput.value = formatCEP(cepInput.value);
    var digits = cepInput.value.replace(/\D/g, '');
    if (digits.length === 8) lookupCEP(digits);
  });

  // ---------- Área total/agricultura: máscara de número (milhar com ponto,
  // ex.: "10000" -> "10.000") + validação Área de agricultura < Área total. ----------
  function formatMilhar(value) {
    var digits = value.replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('pt-BR');
  }
  function parseMilhar(value) {
    var digits = value.replace(/\D/g, '');
    return digits ? Number(digits) : null;
  }

  function revalidateAreaComparison() {
    var total = parseMilhar(areaTotalInput.value);
    var agricultura = parseMilhar(areaAgriculturaInput.value);
    var invalid = agricultura != null && total != null && agricultura >= total;
    areaAgriculturaField.classList.toggle('error', invalid);
    return invalid;
  }

  areaTotalInput.addEventListener('input', function () {
    areaTotalInput.value = formatMilhar(areaTotalInput.value);
    revalidateAreaComparison();
  });
  areaAgriculturaInput.addEventListener('input', function () {
    areaAgriculturaInput.value = formatMilhar(areaAgriculturaInput.value);
    revalidateAreaComparison();
  });

  // Em modo edição, o endereço fica opcional (o usuário pode não querer
  // alterá-lo) — só passa a ser exigido campo a campo se ele começar a
  // preencher qualquer um desses campos (evita salvar um endereço truncado
  // com só a Rua, por exemplo). Na criação, continua sempre obrigatório.
  function validateStep2() {
    var hasError = false;
    var addressTouched = !editingFazenda || ENDERECO_DETALHE_FIELDS.some(function (item) {
      return item.input.value.trim() !== '';
    });
    ENDERECO_REQUIRED_FIELDS.forEach(function (item) {
      var invalid = addressTouched && !item.input.value.trim();
      item.field.classList.toggle('error', invalid);
      if (invalid) hasError = true;
    });
    var areaTotalInvalid = areaTotalInput.value === '';
    areaTotalField.classList.toggle('error', areaTotalInvalid);
    if (areaTotalInvalid) hasError = true;

    if (revalidateAreaComparison()) hasError = true;

    if (hasError) {
      var firstInvalid = document.querySelector('[data-step-panel="2"] .wrapper.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input');
        if (focusable) focusable.focus();
      }
    }
    return !hasError;
  }

  // Monta o endereço completo (string única) a partir dos campos separados —
  // mesmo formato usado pelas fazendas seed ("Rua, Número - Complemento,
  // Bairro, Cidade - UF, CEP 00000-000").
  function composeEnderecoCompleto() {
    var complemento = complementoInput.value.trim();
    return ruaInput.value.trim() + ', ' + numeroInput.value.trim() +
      (complemento ? ' - ' + complemento : '') + ', ' +
      bairroInput.value.trim() + ', ' + cidadeInput.value.trim() + ' - ' + estadoInput.value.trim() +
      ', CEP ' + cepInput.value.trim();
  }

  // ══════════════════ Modo edição: formulário único, sem stepper ══════════════════
  // Pedido explícito do usuário: em edição, nada de wizard em etapas — todos
  // os campos (Etapa 1 + Etapa 2) num formulário só, mesma experiência dos
  // demais cadastros (`novo-produto.html`/`novo-cadastro.html`, um card só
  // com subseções). Etapa 3 (Talhões) continua fora da edição — ver
  // comentário no topo do arquivo (talhões têm gestão própria em
  // fazenda-detalhe-cadastro.html).
  var step1Panel = document.querySelector('[data-step-panel="1"]');
  var step2Panel = document.querySelector('[data-step-panel="2"]');
  var editBackHref;

  if (editingFazenda) {
    document.getElementById('nova-fazenda-page-title').textContent = 'Editar fazenda';
    document.title = 'Editar fazenda — Nivelo';
    editBackHref = 'fazenda-detalhe-cadastro.html#id=' + editingFazenda.id;
    document.getElementById('nova-fazenda-back-link').href = editBackHref;
    document.getElementById('nova-fazenda-cancel-1').href = editBackHref;

    // Sem stepper (a navegação por etapas some inteira).
    document.getElementById('nova-fazenda-steps').hidden = true;

    // As 2 seções ficam sempre visíveis juntas, lendo como um card único
    // (borda entre elas removida via CSS, ver page-nova-fazenda.css).
    step1Panel.hidden = false;
    step2Panel.hidden = false;
    step1Panel.classList.add('nova-fazenda-step-merge-top');
    step2Panel.classList.add('nova-fazenda-step-merge-bottom');

    // Ações da Etapa 1 somem — só a ação final (Cancelar + Salvar
    // alterações), no rodapé da Etapa 2, permanece.
    step1Panel.querySelector('.nova-fazenda-actions').hidden = true;

    // "Voltar" (Etapa 2) vira "Cancelar" (navega de volta ao Detalhe, sem
    // validar nada) — não existe mais uma Etapa 1 pra onde voltar.
    var back2Btn = document.getElementById('nova-fazenda-back-2');
    back2Btn.textContent = 'Cancelar';
    back2Btn.addEventListener('click', function () { window.location.href = editBackHref; });

    document.getElementById('nova-fazenda-continue-2').textContent = 'Salvar alterações';
  }

  // ══════════════════ Navegação entre etapas (sem reload, só modo criação) ══════════════════

  var stepPanels = Array.prototype.slice.call(document.querySelectorAll('[data-step-panel]'));
  var stepItems = Array.prototype.slice.call(document.querySelectorAll('#nova-fazenda-steps .cadastro-step'));

  function goToStep(n) {
    if (editingFazenda) return; // formulário único, sem troca de etapa
    stepPanels.forEach(function (panel) {
      panel.hidden = Number(panel.dataset.stepPanel) !== n;
    });
    stepItems.forEach(function (item) {
      var stepN = Number(item.dataset.step);
      item.classList.toggle('is-current', stepN === n);
      item.classList.toggle('is-complete', stepN < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.getElementById('nova-fazenda-continue-1').addEventListener('click', function () {
    if (!validateStep1()) return;
    goToStep(2);
  });
  if (!editingFazenda) {
    document.getElementById('nova-fazenda-back-2').addEventListener('click', function () { goToStep(1); });
  }
  document.getElementById('nova-fazenda-continue-2').addEventListener('click', function () {
    // Em edição é um formulário único: os campos da Etapa 1 (Nome/
    // Proprietário/CNPJ/IE/Matrícula) estão visíveis junto dos da Etapa 2,
    // então "Salvar alterações" precisa validar os dois grupos. Em criação,
    // a Etapa 1 já foi validada ao clicar "Continuar" pra chegar aqui.
    if (editingFazenda) {
      var step1Valid = validateStep1();
      var step2Valid = validateStep2();
      if (!step1Valid || !step2Valid) return;
      saveEdit();
      return;
    }
    if (!validateStep2()) return;
    goToStep(3);
  });
  document.getElementById('nova-fazenda-back-3').addEventListener('click', function () { goToStep(2); });

  // ══════════════════ ETAPA 3 — Talhões (lista em memória) ══════════════════

  var talhoesListEl = document.getElementById('nova-fazenda-talhoes-list');
  var talhoesEmptyEl = document.getElementById('nova-fazenda-talhoes-empty');

  function buildTalhaoItemHTML(t, index) {
    var badge = ATIVO_STATUS[t.ativo];
    return (
      '<div class="nova-fazenda-talhao-item" data-index="' + index + '">' +
        '<div class="nova-fazenda-talhao-info">' +
          '<span class="nova-fazenda-talhao-name text-body-s">' + t.nome + '</span>' +
          '<span class="nova-fazenda-talhao-meta text-body-xs">' + t.areaHa + ' ha · ' +
            '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="nova-fazenda-talhao-actions">' +
          '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar talhão"><i data-lucide="pencil" width="16" height="16"></i></button>' +
          '<button type="button" class="actionBtn" data-action="remover" aria-label="Remover talhão"><i data-lucide="trash-2" width="16" height="16"></i></button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderTalhoes() {
    var showEmpty = wizardState.talhoes.length === 0;
    talhoesListEl.hidden = showEmpty;
    talhoesEmptyEl.hidden = !showEmpty;
    if (!showEmpty) {
      talhoesListEl.innerHTML = wizardState.talhoes.map(buildTalhaoItemHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  // Código gerado automaticamente pelo sistema — mesmo algoritmo zero-padded
  // (3 dígitos) já usado em fazenda-detalhe-cadastro.js, aqui lendo do array
  // local em vez de `fazenda.talhoes` (a fazenda ainda não existe).
  function nextTalhaoCodigo() {
    var max = wizardState.talhoes.reduce(function (acc, t) {
      var n = parseInt(t.codigo, 10);
      return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    var padded = String(max + 1);
    while (padded.length < 3) padded = '0' + padded;
    return padded;
  }

  // ---------- Modal Adicionar/Editar talhão ----------
  var talhaoOverlay = document.getElementById('talhao-dialog-overlay');
  var talhaoTitle = document.getElementById('talhao-dialog-title');
  var talhaoConfirmBtn = document.getElementById('talhao-dialog-confirm');
  var talhaoCodigoField = document.getElementById('talhao-codigo-field');
  var talhaoCodigoInput = document.getElementById('talhao-codigo-input');
  var talhaoNomeInput = document.getElementById('talhao-nome-input');
  var talhaoNomeError = document.getElementById('talhao-nome-error');
  var talhaoAreaInput = document.getElementById('talhao-area-input');
  var talhaoAreaError = document.getElementById('talhao-area-error');
  var talhaoStatusField = document.getElementById('talhao-status-field');
  var talhaoStatusDropdown = initDropdown(talhaoStatusField);

  // ---------- Área (ha): máscara numérica progressiva (milhar com ponto,
  // decimal com vírgula) — mesma técnica de formatCentavosBRL (Estoque),
  // sem o prefixo "R$" por não ser um valor monetário. ----------
  var talhaoAreaCentesimos = 0;
  function formatAreaBRL(centesimos) {
    return (centesimos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  talhaoAreaInput.addEventListener('input', function () {
    var digits = talhaoAreaInput.value.replace(/\D/g, '');
    talhaoAreaCentesimos = digits ? Number(digits) : 0;
    talhaoAreaInput.value = talhaoAreaCentesimos ? formatAreaBRL(talhaoAreaCentesimos) : '';
  });

  function setTalhaoStatusValue(ativo) {
    talhaoStatusDropdown.selectValue(ativo ? 'ativo' : 'inativo');
  }

  function openTalhaoDialog(index) {
    var talhao = index != null ? wizardState.talhoes[index] : null;
    editingTalhaoIndex = index;
    talhaoTitle.textContent = talhao ? 'Editar talhão' : 'Adicionar talhão';
    talhaoConfirmBtn.textContent = talhao ? 'Salvar alterações' : 'Salvar';
    talhaoCodigoField.hidden = !talhao;
    talhaoCodigoInput.value = talhao ? talhao.codigo : '';
    talhaoNomeInput.value = talhao ? talhao.nome : '';
    talhaoAreaCentesimos = talhao ? Math.round(talhao.areaHa * 100) : 0;
    talhaoAreaInput.value = talhaoAreaCentesimos ? formatAreaBRL(talhaoAreaCentesimos) : '';
    setTalhaoStatusValue(talhao ? talhao.ativo : true);
    talhaoNomeError.hidden = true;
    talhaoAreaError.hidden = true;
    talhaoOverlay.hidden = false;
    talhaoNomeInput.focus();
  }

  function closeTalhaoDialog() {
    talhaoOverlay.hidden = true;
  }

  function confirmTalhaoDialog() {
    var nome = talhaoNomeInput.value.trim();
    var area = talhaoAreaCentesimos / 100;
    var isValid = true;

    if (!nome) {
      talhaoNomeError.hidden = false;
      isValid = false;
    } else {
      talhaoNomeError.hidden = true;
    }
    if (!area || area <= 0) {
      talhaoAreaError.hidden = false;
      isValid = false;
    } else {
      talhaoAreaError.hidden = true;
    }
    if (!isValid) return;

    var ativo = talhaoStatusField.dataset.value === 'ativo';
    if (editingTalhaoIndex != null) {
      var existing = wizardState.talhoes[editingTalhaoIndex];
      existing.nome = nome;
      existing.areaHa = area;
      existing.ativo = ativo;
    } else {
      wizardState.talhoes.push({ codigo: nextTalhaoCodigo(), nome: nome, areaHa: area, ativo: ativo });
    }

    closeTalhaoDialog();
    renderTalhoes();
  }

  document.getElementById('nova-fazenda-add-talhao-btn').addEventListener('click', function () { openTalhaoDialog(null); });
  document.getElementById('talhao-dialog-close').addEventListener('click', closeTalhaoDialog);
  document.getElementById('talhao-dialog-cancel').addEventListener('click', closeTalhaoDialog);
  document.getElementById('talhao-dialog-confirm').addEventListener('click', confirmTalhaoDialog);
  talhaoOverlay.addEventListener('click', function (event) {
    if (event.target === talhaoOverlay) closeTalhaoDialog();
  });

  // ---------- Modal de confirmação: Remover talhão ----------
  var removeOverlay = document.getElementById('talhao-remove-dialog-overlay');
  var removeMessage = document.getElementById('talhao-remove-dialog-message');

  function openRemoveDialog(index) {
    var talhao = wizardState.talhoes[index];
    if (!talhao) return;
    pendingRemoveIndex = index;
    removeMessage.textContent = 'Tem certeza que deseja remover o talhão "' + talhao.nome + '"?';
    removeOverlay.hidden = false;
  }
  function closeRemoveDialog() {
    removeOverlay.hidden = true;
    pendingRemoveIndex = null;
  }
  document.getElementById('talhao-remove-dialog-close').addEventListener('click', closeRemoveDialog);
  document.getElementById('talhao-remove-dialog-cancel').addEventListener('click', closeRemoveDialog);
  document.getElementById('talhao-remove-dialog-confirm').addEventListener('click', function () {
    var index = pendingRemoveIndex;
    closeRemoveDialog();
    if (index != null) {
      wizardState.talhoes.splice(index, 1);
      renderTalhoes();
    }
  });
  removeOverlay.addEventListener('click', function (event) {
    if (event.target === removeOverlay) closeRemoveDialog();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (!talhaoOverlay.hidden) closeTalhaoDialog();
    if (!removeOverlay.hidden) closeRemoveDialog();
  });

  talhoesListEl.addEventListener('click', function (event) {
    var actionBtn = event.target.closest('.actionBtn[data-action]');
    if (!actionBtn) return;
    var item = event.target.closest('.nova-fazenda-talhao-item');
    if (!item) return;
    var index = Number(item.dataset.index);
    if (actionBtn.dataset.action === 'editar') openTalhaoDialog(index);
    else openRemoveDialog(index);
  });

  renderTalhoes();

  // ══════════════════ Salvar edição ("Salvar alterações") ══════════════════
  // Nunca inclui `talhoes` no patch (ver comentário no topo do arquivo) —
  // `NiveloFazendas.update()` só sobrescreve as chaves presentes aqui,
  // preservando os talhões já cadastrados intactos.
  function saveEdit() {
    var arrendatario = arrendatarioInput.value.trim();
    var addressTouched = ENDERECO_DETALHE_FIELDS.some(function (item) {
      return item.input.value.trim() !== '';
    });

    var patch = {
      nome: nomeInput.value.trim(),
      proprietario: proprietarioInput.value.trim() || null,
      cnpj: cnpjInput.value.trim() || null,
      inscricaoEstadual: ieInput.value.trim() || null,
      matricula: matriculaInput.value.trim() || null,
      latitude: latitudeInput.value !== '' ? latitudeInput.value : null,
      longitude: longitudeInput.value !== '' ? longitudeInput.value : null,
      areaHa: parseMilhar(areaTotalInput.value) || 0,
      areaAgricultura: parseMilhar(areaAgriculturaInput.value),
      arrendamento: arrendatario ? { arrendatario: arrendatario, areaHa: null, vigencia: null } : null
    };

    // Só recompõe/sobrescreve o endereço se o usuário de fato preencheu os
    // campos (ver `validateStep2()`) — senão preserva o endereço original,
    // que pode ter vindo só como string composta (fazendas seed) sem os
    // campos separados existirem pra reconstituir com segurança.
    if (addressTouched) {
      patch.enderecoCompleto = composeEnderecoCompleto();
      patch.cidade = cidadeInput.value.trim();
      patch.estado = estadoInput.value.trim();
    }

    try {
      window.NiveloFazendas.update(editingFazenda.id, patch);
      sessionStorage.setItem('nivelo.fazendaeditada.success', 'Fazenda atualizada com sucesso');
    } catch (e) { return; }

    window.location.href = 'fazenda-detalhe-cadastro.html#id=' + editingFazenda.id;
  }

  // ══════════════════ Submit final ("Cadastrar fazenda") ══════════════════

  var form = document.getElementById('nova-fazenda-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (editingFazenda) return; // salvo via `saveEdit()`, nunca chega até aqui (Etapa 3 escondida)

    // Cada etapa já foi validada ao avançar via "Continuar" — revalida como
    // salvaguarda (ex.: usuário voltou e apagou um campo obrigatório).
    if (!validateStep1()) {
      goToStep(1);
      return;
    }
    if (!validateStep2()) {
      goToStep(2);
      return;
    }

    var arrendatario = arrendatarioInput.value.trim();
    var farm = {
      nome: nomeInput.value.trim(),
      proprietario: proprietarioInput.value.trim() || null,
      cnpj: cnpjInput.value.trim() || null,
      inscricaoEstadual: ieInput.value.trim() || null,
      matricula: matriculaInput.value.trim() || null,
      enderecoCompleto: composeEnderecoCompleto(),
      latitude: latitudeInput.value !== '' ? latitudeInput.value : null,
      longitude: longitudeInput.value !== '' ? longitudeInput.value : null,
      areaHa: parseMilhar(areaTotalInput.value) || 0,
      areaAgricultura: parseMilhar(areaAgriculturaInput.value),
      arrendamento: arrendatario ? { arrendatario: arrendatario, areaHa: null, vigencia: null } : null,
      cidade: cidadeInput.value.trim(),
      estado: estadoInput.value.trim(),
      atualizadoEm: '2026-07-29',
      talhoes: wizardState.talhoes.map(function (t, i) {
        return { id: 't' + (i + 1), codigo: t.codigo, nome: t.nome, areaHa: t.areaHa, cultura: null, safra: null, status: 'disponivel', ativo: t.ativo };
      })
    };

    try {
      window.NiveloFazendas.add(farm);
      sessionStorage.setItem('nivelo.novafazenda.success', 'Fazenda cadastrada com sucesso');
    } catch (e) { return; }

    // Redireciona pra listagem (não pro Detalhe) — a fazenda recém-criada já
    // aparece lá (ver persistência em fazendas-data.js) e o toast é exibido
    // por fazendas.js. Pedido explícito do usuário: não mostrar a tela de
    // "Fazenda não encontrada" depois de um cadastro bem-sucedido.
    window.location.href = 'fazendas.html';
  });

  // ══════════════════ Estados de demonstração (#step=N&state=X) ══════════════════
  // Primeira tela do sistema com múltiplas etapas — sem isso só dava pra
  // alcançar cada etapa/estado navegando o fluxo inteiro desde o início.
  // `step=` (novo) escolhe a etapa; `state=` (mesma convenção de `#state=`
  // já usada no resto do sistema) escolhe o estado dentro dela. Roda uma
  // única vez, no load — não fica ouvindo mudanças de hash depois.
  (function applyDemoState() {
    var stepMatch = location.hash.match(/step=(\d)/);
    var stateMatch = location.hash.match(/state=([a-z]+)/);
    var step = stepMatch ? Number(stepMatch[1]) : 1;
    var state = stateMatch ? stateMatch[1] : null;

    if (step === 1 && state === 'required') {
      validateStep1();
    }
    if (step === 2 && state === 'required') {
      validateStep2();
    }
    if (step === 2 && state === 'areainvalida') {
      areaTotalInput.value = formatMilhar('100');
      areaAgriculturaInput.value = formatMilhar('150');
      revalidateAreaComparison();
    }
    if (step === 3 && state === 'comtalhoes') {
      wizardState.talhoes = [
        { codigo: '001', nome: 'Talhão 01', areaHa: 25, ativo: true },
        { codigo: '002', nome: 'Talhão 02', areaHa: 18, ativo: true },
        { codigo: '003', nome: 'Talhão 03', areaHa: 12, ativo: false }
      ];
      renderTalhoes();
    }

    goToStep(step);

    // Abre o modal de talhão já com os erros de "Nome"/"Área" visíveis
    // (mesmo padrão de demonstrar um Dialog em estado de erro já usado em
    // outras telas do sistema).
    if (step === 3 && state === 'talhaomodal') {
      openTalhaoDialog(null);
      confirmTalhaoDialog();
    }
  })();
})();
