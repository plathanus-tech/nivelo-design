(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Toast de sucesso (mesma composição de contas-a-receber.js). ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ctr-toast';
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

  // ---------- Dropdown genérico (mesmo padrão exato de nova-conta-pagar.js). ----------
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
      window.removeEventListener('scroll', onWindowScroll, true);
      window.removeEventListener('resize', close);
    }
    function onWindowScroll(event) {
      if (menu.contains(event.target)) return;
      close();
    }
    function open() {
      if (root.classList.contains('is-readonly')) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', onWindowScroll, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      root.classList.remove('error');
      close();
      if (onChange) onChange(optionEl.dataset.value, optionEl.textContent);
    }

    function selectValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
    }

    function setReadonly(readonly) {
      root.classList.toggle('is-readonly', readonly);
      trigger.disabled = readonly;
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

    return { selectOption: selectOption, selectValue: selectValue, setReadonly: setReadonly, root: root };
  }

  // ---------- Máscara de moeda ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var valorInput = document.getElementById('ncr-valor');
  valorInput.addEventListener('input', function () {
    var digits = valorInput.value.replace(/\D/g, '');
    valorInput.dataset.cents = digitsToCents(digits);
    valorInput.value = formatCentavosBRL(digitsToCents(digits));
  });
  function setValorCents(cents) {
    valorInput.dataset.cents = cents;
    valorInput.value = formatCentavosBRL(cents);
  }

  // ---------- Campos ----------
  var codigoInput = document.getElementById('ncr-codigo');
  var formaField = document.getElementById('forma-field');
  var clienteField = document.getElementById('cliente-field');
  var vencimentoField = document.getElementById('vencimento-field');
  var vencimentoInput = document.getElementById('ncr-vencimento');
  var valorField = document.getElementById('valor-field');
  var emissaoField = document.getElementById('emissao-field');
  var emissaoInput = document.getElementById('ncr-emissao');
  var documentoInput = document.getElementById('ncr-documento');
  var historicoField = document.getElementById('historico-field');
  var historicoInput = document.getElementById('ncr-historico');
  var categoriaField = document.getElementById('categoria-field');
  var ocorrenciaField = document.getElementById('ocorrencia-field');
  var parcelasField = document.getElementById('parcelas-field');
  var parcelasInput = document.getElementById('ncr-parcelas');
  var diaVencimentoField = document.getElementById('dia-vencimento-field');
  var diaVencimentoInput = document.getElementById('ncr-dia-vencimento');

  // Forma de Recebimento: populada a partir de formas-recebimento-data.js.
  var formaMenu = document.getElementById('forma-menu');
  window.NiveloFormasRecebimento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaMenu.appendChild(optionEl);
  });
  var formaDropdown = initDropdown(formaField);

  // Cliente: só cadastros do tipo "cliente" — mesma técnica exata do
  // Fornecedor de Nova Conta a Pagar, incl. o atalho "+ Cadastrar novo
  // cliente" (navega pra Novo Cadastro com Tipo=Cliente pré-selecionado).
  var clienteMenu = document.getElementById('cliente-menu');
  function renderClienteOptions() {
    clienteMenu.innerHTML = '';
    window.NiveloCadastros.findByTipo('cliente').forEach(function (cliente) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = cliente.codigo;
      optionEl.textContent = cliente.nome + ' — ' + cliente.documento;
      clienteMenu.appendChild(optionEl);
    });
    var novoOption = document.createElement('div');
    novoOption.className = 'option ncr-dropdown-action-option';
    novoOption.dataset.value = '__novo__';
    novoOption.innerHTML = '<i data-lucide="plus" width="14" height="14"></i> Cadastrar novo cliente';
    clienteMenu.appendChild(novoOption);
    if (window.lucide) lucide.createIcons();
  }
  renderClienteOptions();
  var clienteDropdown = initDropdown(clienteField, function (value) {
    if (value === '__novo__') goToNovoCliente();
  });

  function findClienteByCodigo(codigo) {
    return window.NiveloCadastros.findByTipo('cliente').filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  // ---------- Rascunho do formulário (sessionStorage, uso único) — mesmo
  // princípio de handoff single-use já usado em Nova Conta a Pagar. ----------
  var DRAFT_KEY = 'nivelo.novacontareceberv2.rascunho';
  var CLIENTE_CRIADO_KEY = 'nivelo.novacontareceberv2.cliente-criado';

  function buildDraft() {
    return {
      formaCodigo: formaField.dataset.value || null,
      vencimento: vencimentoInput.value || '',
      valorCents: Number(valorInput.dataset.cents || 0),
      emissao: emissaoInput.value || '',
      numeroDocumento: documentoInput.value || '',
      historico: historicoInput.value || '',
      categoriaCodigo: categoriaField.dataset.value || null,
      ocorrencia: ocorrenciaField.dataset.value || null,
      numeroParcelas: parcelasInput.value || '',
      diaVencimento: diaVencimentoInput.value || ''
    };
  }

  function goToNovoCliente() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraft())); } catch (e) {}
    window.location.href = 'novo-cadastro.html?tipo=cliente&return=nova-conta-receber-v2';
  }

  // ---------- Categoria: dropdown dinâmico + item fixo "+ Nova categoria"
  // (mesma técnica exata de Nova Conta a Pagar). ----------
  var categoriaMenu = document.getElementById('categoria-menu');
  function renderCategoriaOptions() {
    categoriaMenu.innerHTML = '';
    window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = categoria.codigo;
      optionEl.textContent = categoria.descricao;
      categoriaMenu.appendChild(optionEl);
    });
    var novaOption = document.createElement('div');
    novaOption.className = 'option ncr-dropdown-action-option';
    novaOption.dataset.value = '__nova__';
    novaOption.innerHTML = '<i data-lucide="plus" width="14" height="14"></i> Nova categoria';
    categoriaMenu.appendChild(novaOption);
    if (window.lucide) lucide.createIcons();
  }
  renderCategoriaOptions();
  var categoriaDropdown = initDropdown(categoriaField, function (value) {
    if (value === '__nova__') openNovaCategoriaModal();
  });

  var novaCategoriaOverlay = document.getElementById('nova-categoria-overlay');
  var novaCategoriaDescricaoField = document.getElementById('nova-categoria-descricao-field');
  var novaCategoriaDescricaoInput = document.getElementById('nova-categoria-descricao-input');

  function openNovaCategoriaModal() {
    novaCategoriaDescricaoInput.value = '';
    novaCategoriaDescricaoField.classList.remove('error');
    novaCategoriaOverlay.hidden = false;
    novaCategoriaDescricaoInput.focus();
  }
  function closeNovaCategoriaModal() {
    novaCategoriaOverlay.hidden = true;
    if (categoriaField.dataset.value === '__nova__') {
      categoriaField.dataset.value = '';
      categoriaField.querySelector('[data-dropdown-value]').textContent = 'Selecione a categoria';
    }
  }
  document.getElementById('nova-categoria-close').addEventListener('click', closeNovaCategoriaModal);
  document.getElementById('nova-categoria-cancel').addEventListener('click', closeNovaCategoriaModal);
  novaCategoriaOverlay.addEventListener('click', function (event) { if (event.target === novaCategoriaOverlay) closeNovaCategoriaModal(); });

  document.getElementById('nova-categoria-confirm').addEventListener('click', function () {
    var descricao = novaCategoriaDescricaoInput.value.trim();
    var invalid = !descricao;
    novaCategoriaDescricaoField.classList.toggle('error', invalid);
    if (invalid) return;

    var categoria = window.NiveloCategoriasFinanceiras.add({
      descricao: descricao,
      grupo: 'receita',
      consideraDre: false,
      classificacaoDre: null,
      consideraLcdpr: false,
      competenciaPadrao: 'sem-competencia'
    });
    renderCategoriaOptions();
    categoriaDropdown.selectValue(categoria.codigo);
    novaCategoriaOverlay.hidden = true;
  });

  // ---------- Ocorrência: Nº de Parcelas só aparece quando "Parcelada";
  // Dia do Vencimento só aparece quando != "Única" (pedido explícito). ----------
  var ocorrenciaDropdown = initDropdown(ocorrenciaField, function (value) {
    parcelasField.hidden = value !== 'parcelada';
    if (value !== 'parcelada') {
      parcelasInput.value = '';
      parcelasField.classList.remove('error');
    }
    diaVencimentoField.hidden = !value || value === 'unica';
    if (diaVencimentoField.hidden) diaVencimentoInput.value = '';
  });

  // Código: preview cosmético.
  codigoInput.value = 'Automático';

  // ---------- Vencimento/Data de Emissão: padrão oficial de calendário do
  // sistema (dia único), ver app/shared/date-picker.js. ----------
  var vencimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'vencimento-field',
    triggerId: 'vencimento-trigger',
    valueId: 'vencimento-value',
    hiddenInputId: 'ncr-vencimento',
    popoverId: 'vencimento-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (vencimentoField.classList.contains('error') && vencimentoInput.value) vencimentoField.classList.remove('error');
    }
  });
  var emissaoPicker = window.NiveloDatePicker.initDay({
    rootId: 'emissao-field',
    triggerId: 'emissao-trigger',
    valueId: 'emissao-value',
    hiddenInputId: 'ncr-emissao',
    popoverId: 'emissao-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (emissaoField.classList.contains('error') && emissaoInput.value) emissaoField.classList.remove('error');
    }
  });

  // ---------- Erros somem ao corrigir ----------
  historicoInput.addEventListener('input', function () {
    if (historicoField.classList.contains('error') && historicoInput.value.trim()) {
      historicoField.classList.remove('error');
    }
  });
  valorInput.addEventListener('input', function () {
    if (valorField.classList.contains('error') && Number(valorInput.dataset.cents) > 0) valorField.classList.remove('error');
  });
  parcelasInput.addEventListener('input', function () {
    if (parcelasField.classList.contains('error') && Number(parcelasInput.value) > 1) parcelasField.classList.remove('error');
  });
  function clearDropdownErrorOnValue(field) {
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  clearDropdownErrorOnValue(formaField);
  clearDropdownErrorOnValue(clienteField);
  clearDropdownErrorOnValue(categoriaField);
  clearDropdownErrorOnValue(ocorrenciaField);

  // ---------- Modo: criação (padrão) / visualização (?modo=ver) / edição
  // (?modo=editar). ----------
  var params = new URLSearchParams(location.search);
  var codigoParam = params.get('codigo');
  var modo = params.get('modo');
  var editingConta = codigoParam ? window.NiveloContasReceberV2.findByCodigo(codigoParam) : null;

  var pageTitleEl = document.getElementById('ncr-page-title');
  var submitBtn = document.getElementById('ncr-submit');
  var cancelLink = document.getElementById('ncr-cancel');
  var cancelarContaBtn = document.getElementById('ncr-cancelar-conta-btn');
  var form = document.getElementById('ncr-form');

  if (editingConta) {
    formaDropdown.selectValue(editingConta.formaRecebimentoCodigo);
    if (editingConta.clienteCodigo) clienteDropdown.selectValue(editingConta.clienteCodigo);
    vencimentoPicker.setValue(editingConta.vencimento);
    setValorCents(Math.round(editingConta.valor * 100));
    emissaoPicker.setValue(editingConta.dataEmissao);
    documentoInput.value = editingConta.numeroDocumento || '';
    historicoInput.value = editingConta.historico;
    categoriaDropdown.selectValue(editingConta.categoriaCodigo);
    ocorrenciaDropdown.selectValue(editingConta.ocorrencia);
    if (editingConta.numeroParcelas) parcelasInput.value = editingConta.numeroParcelas;
    if (editingConta.diaVencimento) diaVencimentoInput.value = editingConta.diaVencimento;

    if (modo === 'ver') {
      pageTitleEl.textContent = 'Visualizar Conta a Receber';
      formaDropdown.setReadonly(true);
      clienteDropdown.setReadonly(true);
      categoriaDropdown.setReadonly(true);
      ocorrenciaDropdown.setReadonly(true);
      vencimentoPicker.setReadonly(true);
      emissaoPicker.setReadonly(true);
      [valorInput, documentoInput, historicoInput, parcelasInput, diaVencimentoInput].forEach(function (el) { el.disabled = true; });
      submitBtn.hidden = true;
      cancelLink.textContent = 'Voltar';
    } else if (modo === 'editar') {
      pageTitleEl.textContent = 'Editar Conta a Receber';
      submitBtn.textContent = 'Salvar alterações';
      if (editingConta.status !== 'recebida' && editingConta.status !== 'cancelada') {
        cancelarContaBtn.hidden = false;
      }
    }
  } else {
    // ---------- Volta do atalho "+ Cadastrar novo cliente" ----------
    var draftRaw = null;
    try { draftRaw = sessionStorage.getItem(DRAFT_KEY); sessionStorage.removeItem(DRAFT_KEY); } catch (e) {}
    if (draftRaw) {
      try {
        var draft = JSON.parse(draftRaw);
        if (draft.formaCodigo) formaDropdown.selectValue(draft.formaCodigo);
        if (draft.vencimento) vencimentoPicker.setValue(draft.vencimento);
        if (draft.valorCents) setValorCents(draft.valorCents);
        if (draft.emissao) emissaoPicker.setValue(draft.emissao);
        if (draft.numeroDocumento) documentoInput.value = draft.numeroDocumento;
        if (draft.historico) historicoInput.value = draft.historico;
        if (draft.categoriaCodigo) categoriaDropdown.selectValue(draft.categoriaCodigo);
        if (draft.ocorrencia) ocorrenciaDropdown.selectValue(draft.ocorrencia);
        if (draft.numeroParcelas) parcelasInput.value = draft.numeroParcelas;
        if (draft.diaVencimento) diaVencimentoInput.value = draft.diaVencimento;
      } catch (e) {}
    }

    var clienteCriadoCodigo = null;
    try { clienteCriadoCodigo = sessionStorage.getItem(CLIENTE_CRIADO_KEY); sessionStorage.removeItem(CLIENTE_CRIADO_KEY); } catch (e) {}
    if (clienteCriadoCodigo) {
      renderClienteOptions();
      clienteDropdown.selectValue(clienteCriadoCodigo);
      var clienteCriado = findClienteByCodigo(clienteCriadoCodigo);
      if (clienteCriado) {
        showSuccessToast('Cliente cadastrado com sucesso', clienteCriado.nome + ' já está selecionado nesta conta.');
      }
    }
  }

  // ---------- Modal: Cancelar conta ----------
  var cancelarContaOverlay = document.getElementById('cancelar-conta-overlay');
  cancelarContaBtn.addEventListener('click', function () { cancelarContaOverlay.hidden = false; });
  document.getElementById('cancelar-conta-close').addEventListener('click', function () { cancelarContaOverlay.hidden = true; });
  document.getElementById('cancelar-conta-voltar').addEventListener('click', function () { cancelarContaOverlay.hidden = true; });
  cancelarContaOverlay.addEventListener('click', function (event) { if (event.target === cancelarContaOverlay) cancelarContaOverlay.hidden = true; });
  document.getElementById('cancelar-conta-confirmar').addEventListener('click', function () {
    window.NiveloContasReceberV2.cancelar(editingConta.codigo);
    try { sessionStorage.setItem('nivelo.novacontareceberv2.success', 'Conta a receber cancelada com sucesso.'); } catch (e) {}
    window.location.href = 'contas-a-receber-v2.html';
  });

  // ---------- Validação + envio ----------
  function runValidation() {
    var formaInvalid = !formaField.dataset.value;
    formaField.classList.toggle('error', formaInvalid);

    var clienteInvalid = !clienteField.dataset.value;
    clienteField.classList.toggle('error', clienteInvalid);

    var vencimentoInvalid = !vencimentoInput.value;
    vencimentoField.classList.toggle('error', vencimentoInvalid);

    var valorInvalid = !(Number(valorInput.dataset.cents) > 0);
    valorField.classList.toggle('error', valorInvalid);

    var emissaoInvalid = !emissaoInput.value;
    emissaoField.classList.toggle('error', emissaoInvalid);

    var historicoInvalid = !historicoInput.value.trim();
    historicoField.classList.toggle('error', historicoInvalid);

    var categoriaInvalid = !categoriaField.dataset.value || categoriaField.dataset.value === '__nova__';
    categoriaField.classList.toggle('error', categoriaInvalid);

    var ocorrenciaInvalid = !ocorrenciaField.dataset.value;
    ocorrenciaField.classList.toggle('error', ocorrenciaInvalid);

    var parcelasInvalid = ocorrenciaField.dataset.value === 'parcelada' && !(Number(parcelasInput.value) > 1);
    parcelasField.classList.toggle('error', parcelasInvalid);

    return !formaInvalid && !clienteInvalid && !vencimentoInvalid && !valorInvalid && !emissaoInvalid &&
      !historicoInvalid && !categoriaInvalid && !ocorrenciaInvalid && !parcelasInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (submitBtn.hidden) return;

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var cliente = findClienteByCodigo(clienteField.dataset.value);
    var forma = window.NiveloFormasRecebimento.findByCodigo(formaField.dataset.value);

    var payload = {
      clienteCodigo: cliente ? cliente.codigo : null,
      clienteNome: cliente ? cliente.nome : null,
      clienteDocumento: cliente ? cliente.documento : null,
      formaRecebimentoCodigo: forma ? forma.codigo : formaField.dataset.value,
      formaRecebimentoNome: forma ? forma.nome : '',
      vencimento: vencimentoInput.value,
      dataEmissao: emissaoInput.value,
      valor: Number(valorInput.dataset.cents || 0) / 100,
      numeroDocumento: documentoInput.value.trim(),
      historico: historicoInput.value.trim(),
      categoriaCodigo: categoriaField.dataset.value,
      ocorrencia: ocorrenciaField.dataset.value,
      numeroParcelas: ocorrenciaField.dataset.value === 'parcelada' ? Number(parcelasInput.value) : null,
      diaVencimento: diaVencimentoInput.value ? Number(diaVencimentoInput.value) : null
    };

    try {
      if (editingConta) {
        window.NiveloContasReceberV2.update(editingConta.codigo, payload);
        sessionStorage.setItem('nivelo.novacontareceberv2.success', 'Conta a receber atualizada com sucesso.');
      } else {
        var criados = window.NiveloContasReceberV2.add(payload);
        var mensagem = criados.length > 1
          ? criados.length + ' lançamentos gerados com sucesso.'
          : 'Conta a receber salva com sucesso.';
        sessionStorage.setItem('nivelo.novacontareceberv2.success', mensagem);
      }
    } catch (e) {}

    window.location.href = 'contas-a-receber-v2.html';
  });
})();
