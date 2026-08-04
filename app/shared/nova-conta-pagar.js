(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Toast de sucesso (mesma composição exata de contas-a-pagar.js,
  // reaproveitando `.ctp-toast-region`/`.ctp-toast` de page-contas-a-pagar.css,
  // carregado nesta tela pro atalho "+ Cadastrar novo fornecedor"). ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success ctp-toast';
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

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema: wrapper/
  // trigger/menu/option, menu em `position:fixed` calculado via JS pra
  // escapar do `overflow:hidden` de `.card`, com flip pra cima quando falta
  // espaço abaixo — mesma técnica de novo-lancamento-caixa.js). ----------
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
    // `window.addEventListener('scroll', ..., true)` existe pra fechar o menu
    // quando a PÁGINA rola (senão ele ficaria com a posição `fixed`
    // desatualizada) — mas eventos de scroll não borbulham e a fase de
    // captura entrega ao listener do `window` TAMBÉM o scroll interno do
    // próprio `.menu` (que tem `overflow-y:auto`, ver Dropdown.module.css),
    // já que a captura sempre começa no `window` independente do alvo. Sem
    // este guard, rolar a lista pela barra de rolagem (ou roda do mouse)
    // fechava o dropdown sozinho. Ignora qualquer scroll que se origine de
    // dentro do próprio menu.
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

  // ---------- Máscara de moeda (mesma técnica de formatCentavosBRL já usada
  // em Estoque/Caixa) — estado sempre em centavos (inteiro). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var valorInput = document.getElementById('ncp-valor');
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
  var codigoInput = document.getElementById('ncp-codigo');
  var formaField = document.getElementById('forma-field');
  var fornecedorField = document.getElementById('fornecedor-field');
  var vencimentoField = document.getElementById('vencimento-field');
  var vencimentoInput = document.getElementById('ncp-vencimento');
  var valorField = document.getElementById('valor-field');
  var emissaoField = document.getElementById('emissao-field');
  var emissaoInput = document.getElementById('ncp-emissao');
  var documentoInput = document.getElementById('ncp-documento');
  var historicoField = document.getElementById('historico-field');
  var historicoInput = document.getElementById('ncp-historico');
  var categoriaField = document.getElementById('categoria-field');
  var ocorrenciaField = document.getElementById('ocorrencia-field');
  var parcelasField = document.getElementById('parcelas-field');
  var parcelasInput = document.getElementById('ncp-parcelas');
  var diaVencimentoInput = document.getElementById('ncp-dia-vencimento');

  // Forma de Pagamento: populada a partir de formas-pagamento-data.js.
  var formaMenu = document.getElementById('forma-menu');
  window.NiveloFormasPagamento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaMenu.appendChild(optionEl);
  });
  var formaDropdown = initDropdown(formaField);

  // Fornecedor: só cadastros do tipo "fornecedor" (Cadastro de Pessoas e
  // Empresas) — diferente de Caixa, que combina Cliente+Fornecedor num
  // combobox só, Contas a Pagar é sempre uma obrigação com um fornecedor.
  // Item fixo "+ Cadastrar novo fornecedor" no fim do menu: mesma técnica de
  // "+ Nova categoria" abaixo, mas com uma diferença importante — em vez de
  // um Dialog mínimo, o atalho aqui navega pra Novo Cadastro de Pessoas e
  // Empresas de verdade (Tipo=Fornecedor pré-selecionado, ver
  // novo-cadastro.js), já que um fornecedor tem campos demais (documento,
  // endereço...) pra caber num modal só. O formulário atual é salvo como
  // rascunho em sessionStorage antes de navegar, pra não perder o que já
  // tinha sido preenchido — ver `voltarComFornecedorCriado()`.
  var fornecedorMenu = document.getElementById('fornecedor-menu');
  function renderFornecedorOptions() {
    fornecedorMenu.innerHTML = '';
    window.NiveloCadastros.findByTipo('fornecedor').forEach(function (fornecedor) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = fornecedor.codigo;
      optionEl.textContent = fornecedor.nome + ' — ' + fornecedor.documento;
      fornecedorMenu.appendChild(optionEl);
    });
    var novoOption = document.createElement('div');
    novoOption.className = 'option ncp-dropdown-action-option';
    novoOption.dataset.value = '__novo__';
    novoOption.innerHTML = '<i data-lucide="plus" width="14" height="14"></i> Cadastrar novo fornecedor';
    fornecedorMenu.appendChild(novoOption);
    if (window.lucide) lucide.createIcons();
  }
  renderFornecedorOptions();
  var fornecedorDropdown = initDropdown(fornecedorField, function (value) {
    if (value === '__novo__') goToNovoFornecedor();
  });

  function findFornecedorByCodigo(codigo) {
    return window.NiveloCadastros.findByTipo('fornecedor').filter(function (f) { return f.codigo === codigo; })[0] || null;
  }

  // ---------- Rascunho do formulário (sessionStorage, uso único) — salvo só
  // no momento de ir pro atalho de cadastro de fornecedor, restaurado no
  // boot desta mesma tela quando o usuário volta de lá (criando ou não).
  // Mesmo princípio de handoff single-use já usado em toda a jornada
  // (toasts de sucesso, editcadastro.data etc.), aplicado aqui a um objeto
  // maior (o formulário inteiro) em vez de uma flag/id só. ----------
  var DRAFT_KEY = 'nivelo.novacontapagar.rascunho';
  var FORNECEDOR_CRIADO_KEY = 'nivelo.novacontapagar.fornecedor-criado';

  function buildDraft() {
    return {
      formaCodigo: formaField.dataset.value || null,
      vencimento: vencimentoInput.value || '',
      valorCents: Number(valorInput.dataset.cents || 0),
      emissao: emissaoInput.value || '',
      numeroDocumento: documentoInput.value || '',
      historico: historicoInput.value || '',
      categoriaCodigo: categoriaField.dataset.value || null,
      competencia: competenciaPicker.getValue(),
      ocorrencia: ocorrenciaField.dataset.value || null,
      numeroParcelas: parcelasInput.value || '',
      diaVencimento: diaVencimentoInput.value || ''
    };
  }

  function goToNovoFornecedor() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraft())); } catch (e) {}
    window.location.href = 'novo-cadastro.html?tipo=fornecedor&return=nova-conta-pagar';
  }

  // ---------- Categoria: dropdown dinâmico a partir do catálogo central
  // (sem duplicar dado nenhum) + item fixo "+ Nova categoria", que abre um
  // Dialog mínimo reutilizando `NiveloCategoriasFinanceiras.add()` — mesma
  // técnica já usada pra "+ Adicionar nova safra" em nova-anotacao.js. A
  // categoria nova entra direto no mesmo catálogo consumido por Caixa/Nova
  // Nota Fiscal, nunca uma cópia local. ----------
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
    novaOption.className = 'option ncp-dropdown-action-option';
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
    // Se o usuário fechou sem criar, o dropdown fica com "__nova__"
    // selecionado por engano — volta pro placeholder.
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
      grupo: 'despesa',
      consideraDre: false,
      classificacaoDre: null,
      consideraLcdpr: false,
      competenciaPadrao: 'sem-competencia'
    });
    renderCategoriaOptions();
    categoriaDropdown.selectValue(categoria.codigo);
    novaCategoriaOverlay.hidden = true;
  });

  // ---------- Ocorrência: Nº de Parcelas só aparece quando "Parcelada". ----------
  var ocorrenciaDropdown = initDropdown(ocorrenciaField, function (value) {
    parcelasField.hidden = value !== 'parcelada';
    if (value !== 'parcelada') {
      parcelasInput.value = '';
      parcelasField.classList.remove('error');
    }
  });

  // ---------- Vencimento/Data de Emissão: padrão oficial de calendário do
  // sistema (dia único), ver app/shared/date-picker.js. ----------
  var vencimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'vencimento-field',
    triggerId: 'vencimento-trigger',
    valueId: 'vencimento-value',
    hiddenInputId: 'ncp-vencimento',
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
    hiddenInputId: 'ncp-emissao',
    popoverId: 'emissao-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (emissaoField.classList.contains('error') && emissaoInput.value) emissaoField.classList.remove('error');
    }
  });

  // ---------- Competência: padrão oficial de calendário do sistema
  // (mês/ano), ver app/shared/date-picker.js. ----------
  var competenciaPicker = window.NiveloDatePicker.initMonth({
    rootId: 'competencia-field',
    triggerId: 'competencia-trigger',
    valueId: 'competencia-value',
    clearId: 'competencia-clear',
    popoverId: 'competencia-popover',
    placeholder: 'Selecionar competência'
  });

  function getCompetenciaValue() {
    return competenciaPicker.getValue();
  }

  // Código: preview cosmético — o valor real (`CTP-NNNN`) só é gerado de
  // verdade dentro de `NiveloContasPagar.add()` ao salvar.
  codigoInput.value = 'Automático';

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
  clearDropdownErrorOnValue(fornecedorField);
  clearDropdownErrorOnValue(categoriaField);
  clearDropdownErrorOnValue(ocorrenciaField);

  // ---------- Modo: criação (padrão) / visualização (?modo=ver) / edição
  // (?modo=editar) — mesmo padrão de `?numero=&modo=` já usado em Nova Nota
  // Fiscal. ----------
  var params = new URLSearchParams(location.search);
  var codigoParam = params.get('codigo');
  var modo = params.get('modo');
  var editingConta = codigoParam ? window.NiveloContasPagar.findByCodigo(codigoParam) : null;

  var pageTitleEl = document.getElementById('ncp-page-title');
  var submitBtn = document.getElementById('ncp-submit');
  var cancelLink = document.getElementById('ncp-cancel');
  var cancelarContaBtn = document.getElementById('ncp-cancelar-conta-btn');
  var form = document.getElementById('ncp-form');

  if (editingConta) {
    formaDropdown.selectValue(editingConta.formaPagamentoCodigo);
    if (editingConta.fornecedorCodigo) fornecedorDropdown.selectValue(editingConta.fornecedorCodigo);
    vencimentoPicker.setValue(editingConta.vencimento);
    setValorCents(Math.round(editingConta.valor * 100));
    emissaoPicker.setValue(editingConta.dataEmissao);
    documentoInput.value = editingConta.numeroDocumento || '';
    historicoInput.value = editingConta.historico;
    categoriaDropdown.selectValue(editingConta.categoriaCodigo);
    if (editingConta.competencia) competenciaPicker.setValue(editingConta.competencia);
    ocorrenciaDropdown.selectValue(editingConta.ocorrencia);
    if (editingConta.numeroParcelas) parcelasInput.value = editingConta.numeroParcelas;
    if (editingConta.diaVencimento) diaVencimentoInput.value = editingConta.diaVencimento;

    if (modo === 'ver') {
      pageTitleEl.textContent = 'Visualizar Conta a Pagar';
      formaDropdown.setReadonly(true);
      fornecedorDropdown.setReadonly(true);
      categoriaDropdown.setReadonly(true);
      ocorrenciaDropdown.setReadonly(true);
      competenciaPicker.setReadonly(true);
      vencimentoPicker.setReadonly(true);
      emissaoPicker.setReadonly(true);
      [valorInput, documentoInput, historicoInput, parcelasInput, diaVencimentoInput].forEach(function (el) { el.disabled = true; });
      submitBtn.hidden = true;
      cancelLink.textContent = 'Voltar';
    } else if (modo === 'editar') {
      pageTitleEl.textContent = 'Editar Conta a Pagar';
      submitBtn.textContent = 'Salvar alterações';
      if (editingConta.status !== 'paga' && editingConta.status !== 'cancelada') {
        cancelarContaBtn.hidden = false;
      }
    }
  } else {
    // ---------- Volta do atalho "+ Cadastrar novo fornecedor" ----------
    // Restaura o rascunho salvo em `goToNovoFornecedor()` (se houver — o
    // usuário pode ter chegado aqui de qualquer outra forma, aí não há
    // nada pra restaurar) e, se um fornecedor foi de fato criado
    // (`FORNECEDOR_CRIADO_KEY`), seleciona ele automaticamente. As duas
    // chaves são de uso único — removidas depois de lidas, mesmo padrão já
    // usado em todo o resto do protótipo.
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
        if (draft.competencia) competenciaPicker.setValue(draft.competencia);
        if (draft.ocorrencia) ocorrenciaDropdown.selectValue(draft.ocorrencia);
        if (draft.numeroParcelas) parcelasInput.value = draft.numeroParcelas;
        if (draft.diaVencimento) diaVencimentoInput.value = draft.diaVencimento;
      } catch (e) {}
    }

    var fornecedorCriadoCodigo = null;
    try { fornecedorCriadoCodigo = sessionStorage.getItem(FORNECEDOR_CRIADO_KEY); sessionStorage.removeItem(FORNECEDOR_CRIADO_KEY); } catch (e) {}
    if (fornecedorCriadoCodigo) {
      renderFornecedorOptions();
      fornecedorDropdown.selectValue(fornecedorCriadoCodigo);
      var fornecedorCriado = findFornecedorByCodigo(fornecedorCriadoCodigo);
      if (fornecedorCriado) {
        showSuccessToast('Fornecedor cadastrado com sucesso', fornecedorCriado.nome + ' já está selecionado nesta conta.');
      }
    }
  }

  // ---------- Modal: Cancelar conta (regra de negócio — contas canceladas
  // não recebem mais pagamentos) ----------
  var cancelarContaOverlay = document.getElementById('cancelar-conta-overlay');
  cancelarContaBtn.addEventListener('click', function () { cancelarContaOverlay.hidden = false; });
  document.getElementById('cancelar-conta-close').addEventListener('click', function () { cancelarContaOverlay.hidden = true; });
  document.getElementById('cancelar-conta-voltar').addEventListener('click', function () { cancelarContaOverlay.hidden = true; });
  cancelarContaOverlay.addEventListener('click', function (event) { if (event.target === cancelarContaOverlay) cancelarContaOverlay.hidden = true; });
  document.getElementById('cancelar-conta-confirmar').addEventListener('click', function () {
    window.NiveloContasPagar.cancelar(editingConta.codigo);
    try { sessionStorage.setItem('nivelo.novacontapagar.success', 'Conta a pagar cancelada com sucesso.'); } catch (e) {}
    window.location.href = 'contas-a-pagar.html';
  });

  // ---------- Validação + envio ----------
  function runValidation() {
    var formaInvalid = !formaField.dataset.value;
    formaField.classList.toggle('error', formaInvalid);

    var fornecedorInvalid = !fornecedorField.dataset.value;
    fornecedorField.classList.toggle('error', fornecedorInvalid);

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

    return !formaInvalid && !fornecedorInvalid && !vencimentoInvalid && !valorInvalid && !emissaoInvalid &&
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

    var fornecedor = findFornecedorByCodigo(fornecedorField.dataset.value);
    var forma = window.NiveloFormasPagamento.findByCodigo(formaField.dataset.value);

    var payload = {
      fornecedorCodigo: fornecedor ? fornecedor.codigo : null,
      fornecedorNome: fornecedor ? fornecedor.nome : null,
      fornecedorDocumento: fornecedor ? fornecedor.documento : null,
      formaPagamentoCodigo: forma ? forma.codigo : formaField.dataset.value,
      formaPagamentoNome: forma ? forma.nome : '',
      vencimento: vencimentoInput.value,
      dataEmissao: emissaoInput.value,
      valor: Number(valorInput.dataset.cents || 0) / 100,
      numeroDocumento: documentoInput.value.trim(),
      historico: historicoInput.value.trim(),
      categoriaCodigo: categoriaField.dataset.value,
      competencia: competenciaPicker.getValue(),
      ocorrencia: ocorrenciaField.dataset.value,
      numeroParcelas: ocorrenciaField.dataset.value === 'parcelada' ? Number(parcelasInput.value) : null,
      diaVencimento: diaVencimentoInput.value ? Number(diaVencimentoInput.value) : null
    };

    try {
      if (editingConta) {
        window.NiveloContasPagar.update(editingConta.codigo, payload);
        sessionStorage.setItem('nivelo.novacontapagar.success', 'Conta a pagar atualizada com sucesso.');
      } else {
        var criados = window.NiveloContasPagar.add(payload);
        var mensagem = criados.length > 1
          ? criados.length + ' parcelas geradas com sucesso.'
          : 'Conta a pagar salva com sucesso.';
        sessionStorage.setItem('nivelo.novacontapagar.success', mensagem);
      }
    } catch (e) {}

    window.location.href = 'contas-a-pagar.html';
  });
})();
