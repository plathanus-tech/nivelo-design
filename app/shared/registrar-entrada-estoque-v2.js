(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatNum(n) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function formatCurrency(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  // ---------- Resolve o produto pelo ?codigo= (query string — mesma
  // convenção já usada em `?sku=`/`?numero=` deste sistema, ver CLAUDE.md) ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var produto = codigo ? window.NiveloEstoqueVendasV2.findByCodigo(codigo) : null;

  if (!produto) {
    document.getElementById('entrada-not-found').hidden = false;
    document.getElementById('entrada-form').hidden = true;
    return;
  }

  document.getElementById('entrada-produto-titulo').textContent = produto.produto;
  document.getElementById('entrada-produto-input').value = produto.produto;
  document.getElementById('entrada-quantidade-unit').textContent = produto.unidadeMedidaSigla.toLowerCase();

  // ---------- Dropdown genérico (mesmo padrão já usado em estoque.js/novo-estoque.js) ----------
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
      if (trigger.disabled) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }
    function selectOption(optionEl) {
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
    }
    function reset(placeholder) {
      root.dataset.value = '';
      valueEl.textContent = placeholder;
      valueEl.classList.add('placeholder');
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
    }
    trigger.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
    menu.addEventListener('click', function (event) { var o = event.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    return { selectOption: selectOption, reset: reset, trigger: trigger };
  }

  // ---------- Data ----------
  var entradaDataInput = document.getElementById('entrada-data-input');
  var entradaDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'entrada-data-field', triggerId: 'entrada-data-trigger', valueId: 'entrada-data-value',
    hiddenInputId: 'entrada-data-input', popoverId: 'entrada-data-popover', placeholder: 'Selecionar data'
  });
  entradaDataPicker.setValue(todayISO());

  // ---------- Depósito/Local: só pré-cadastrados e ATIVOS (`d.ativo`), sem
  // cadastro rápido inline (V2, ver rules.md). Sem nenhum depósito ativo, o
  // Dropdown fica vazio (sem opção selecionável) e um helper text orienta o
  // usuário a cadastrar um em Configurações. ----------
  var depositoField = document.getElementById('entrada-deposito-field');
  var depositoMenu = document.getElementById('entrada-deposito-menu');
  var depositoTrigger = depositoField.querySelector('[data-dropdown-trigger]');
  var depositoEmptyHelper = document.getElementById('entrada-deposito-empty-helper');
  function renderDepositoOptions() {
    var ativos = window.NiveloLocais.list().filter(function (local) { return local.ativo; });
    depositoMenu.innerHTML = ativos.map(function (local) {
      return '<div class="option" data-value="' + local.nome + '">' + local.nome + '</div>';
    }).join('');
    if (depositoEmptyHelper) depositoEmptyHelper.hidden = ativos.length > 0;
    if (depositoTrigger) depositoTrigger.disabled = ativos.length === 0;
  }
  renderDepositoOptions();
  var depositoDropdown = initDropdown(depositoField, function () {
    depositoField.classList.remove('error');
  });

  // ---------- Quantidade + preview de conversão (dinâmico por unidade) ----------
  var conversao = getConversao(produto.unidadeMedidaSigla);
  var quantidadeField = document.getElementById('entrada-quantidade-field');
  var quantidadeInput = document.getElementById('entrada-quantidade-input');
  var qtyPesoLine = document.getElementById('entrada-qty-peso-line');
  var qtyTotalLine = document.getElementById('entrada-qty-total-line');

  function updateQtyPreview() {
    var quantidade = Number(quantidadeInput.value) || 0;
    if (!conversao) {
      qtyPesoLine.hidden = true;
      qtyTotalLine.hidden = true;
      return;
    }
    qtyPesoLine.hidden = false;
    // Label dinâmico: usa o nome real da unidade do produto no catálogo
    // (ex. "Peso da saca: 60 kg") — nunca hardcoded.
    var unidadeCatalogo = window.NiveloUnidadesMedida.findBySigla(produto.unidadeMedidaSigla);
    var nomeUnidade = unidadeCatalogo ? unidadeCatalogo.nome.toLowerCase() : produto.unidadeMedidaSigla.toLowerCase();
    qtyPesoLine.textContent = 'Peso da ' + nomeUnidade + ': ' + formatNum(conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
    qtyTotalLine.hidden = false;
    qtyTotalLine.textContent = 'Total: ' + formatNum(quantidade * conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
  }
  quantidadeInput.addEventListener('input', function () {
    quantidadeField.classList.remove('error');
    updateQtyPreview();
    if (currentOrigem() === 'compra') updateValorTotal();
  });
  updateQtyPreview();

  // ---------- Origem da entrada: cards de seleção (mesma técnica de
  // Tipo de anotação em nova-anotacao.js — radio nativo + classe .is-selected
  // no <label> pai) ----------
  var origemInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="origem-entrada"]'));
  var origemProducaoBlock = document.getElementById('origem-producao-block');
  var origemCompraBlock = document.getElementById('origem-compra-block');

  function currentOrigem() {
    var checked = origemInputs.filter(function (i) { return i.checked; })[0];
    return checked ? checked.value : 'producao';
  }

  function updateOrigemBlocks() {
    var origem = currentOrigem();
    origemInputs.forEach(function (input) {
      input.closest('.entradav2-origem-card').classList.toggle('is-selected', input.checked);
    });
    var isProducao = origem === 'producao';
    origemProducaoBlock.hidden = !isProducao;
    origemCompraBlock.hidden = isProducao;
    if (isProducao) {
      document.getElementById('entrada-fornecedor-field').classList.remove('error');
    } else {
      document.getElementById('entrada-fazenda-field').classList.remove('error');
      document.getElementById('entrada-talhao-field').classList.remove('error');
    }
  }
  origemInputs.forEach(function (input) { input.addEventListener('change', updateOrigemBlocks); });
  updateOrigemBlocks();

  // ---------- Fazenda / Talhão (dependente) ----------
  var fazendaField = document.getElementById('entrada-fazenda-field');
  var fazendaMenu = document.getElementById('entrada-fazenda-menu');
  var talhaoField = document.getElementById('entrada-talhao-field');
  var talhaoMenu = document.getElementById('entrada-talhao-menu');

  var fazendas = window.NiveloFazendas.list();
  fazendaMenu.innerHTML = fazendas.map(function (f) {
    return '<div class="option" data-value="' + f.id + '">' + f.nome + '</div>';
  }).join('');

  function findFazenda(id) {
    return fazendas.filter(function (f) { return f.id === id; })[0] || null;
  }

  function populateTalhoes(fazenda) {
    var talhoes = fazenda ? fazenda.talhoes : [];
    talhaoMenu.innerHTML = talhoes.map(function (t) {
      return '<div class="option" data-value="' + t.id + '">' + t.nome + '</div>';
    }).join('');
    talhaoDropdown.trigger.disabled = !fazenda;
    talhaoDropdown.reset(fazenda ? 'Selecione o talhão' : 'Selecione a fazenda primeiro');
  }

  var talhaoDropdown = initDropdown(talhaoField, function () {
    talhaoField.classList.remove('error');
  });
  var fazendaDropdown = initDropdown(fazendaField, function (fazendaId) {
    fazendaField.classList.remove('error');
    populateTalhoes(findFazenda(fazendaId));
  });
  populateTalhoes(null);

  // ---------- Safra (+ "adicionar nova safra" inline) ----------
  var safraField = document.getElementById('entrada-safra-field');
  var safraMenu = document.getElementById('entrada-safra-menu');
  function renderSafraOptions() {
    safraMenu.innerHTML = window.NiveloSafras.list().map(function (s) {
      return '<div class="option" data-value="' + s + '">' + s + '</div>';
    }).join('');
  }
  renderSafraOptions();
  var safraDropdown = initDropdown(safraField);

  // ---------- Fornecedor ----------
  var fornecedorField = document.getElementById('entrada-fornecedor-field');
  var fornecedorMenu = document.getElementById('entrada-fornecedor-menu');
  window.NiveloCadastros.findByTipo('fornecedor').forEach(function (c) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = c.nome;
    optionEl.textContent = c.nome;
    fornecedorMenu.appendChild(optionEl);
  });
  var fornecedorDropdown = initDropdown(fornecedorField, function () {
    fornecedorField.classList.remove('error');
  });

  // ---------- Documento (dropzone mockada, mesmo padrão visual do XML de
  // novo-estoque.js — sem parsing real) ----------
  var arquivoInput = document.getElementById('entrada-arquivo-input');
  var arquivoNomeEl = document.getElementById('entrada-arquivo-nome');
  arquivoInput.addEventListener('change', function () {
    var file = arquivoInput.files && arquivoInput.files[0];
    arquivoNomeEl.textContent = file ? file.name : 'Anexar nota/documento (opcional)';
  });

  // ---------- Preço de compra (máscara R$) + Valor total ----------
  var unidadeCatalogoInfo = window.NiveloUnidadesMedida.findBySigla(produto.unidadeMedidaSigla);
  document.getElementById('entrada-preco-compra-label').textContent =
    'Preço de compra por ' + ((unidadeCatalogoInfo && unidadeCatalogoInfo.nome.toLowerCase()) || produto.unidadeMedidaSigla.toLowerCase());

  var precoCompraCentavos = 0;
  var precoCompraInput = document.getElementById('entrada-preco-compra-input');
  var valorTotalInput = document.getElementById('entrada-valor-total-input');
  function formatCentavosBRL(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  precoCompraInput.addEventListener('input', function () {
    var digits = precoCompraInput.value.replace(/\D/g, '');
    precoCompraCentavos = digits ? Number(digits) : 0;
    precoCompraInput.value = precoCompraCentavos ? formatCentavosBRL(precoCompraCentavos) : '';
    updateValorTotal();
  });
  function updateValorTotal() {
    var quantidade = Number(quantidadeInput.value) || 0;
    var preco = precoCompraCentavos / 100;
    valorTotalInput.value = formatCurrency(quantidade * preco);
  }

  // ---------- Submit ----------
  document.getElementById('entrada-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var isValid = true;

    var quantidade = Number(quantidadeInput.value);
    var quantidadeInvalid = !(quantidade > 0);
    quantidadeField.classList.toggle('error', quantidadeInvalid);
    if (quantidadeInvalid) isValid = false;

    var depositoInvalid = !depositoField.dataset.value;
    depositoField.classList.toggle('error', depositoInvalid);
    if (depositoInvalid) isValid = false;

    var origem = currentOrigem();
    var origemTexto, destinoTexto, documento;

    if (origem === 'producao') {
      var fazendaInvalid = !fazendaField.dataset.value;
      fazendaField.classList.toggle('error', fazendaInvalid);
      if (fazendaInvalid) isValid = false;

      var talhaoInvalid = !talhaoField.dataset.value;
      talhaoField.classList.toggle('error', talhaoInvalid);
      if (talhaoInvalid) isValid = false;

      if (!fazendaInvalid && !talhaoInvalid) {
        var fazendaSel = findFazenda(fazendaField.dataset.value);
        var talhaoSel = fazendaSel.talhoes.filter(function (t) { return t.id === talhaoField.dataset.value; })[0];
        origemTexto = 'Colheita — ' + (talhaoSel ? talhaoSel.nome : '') + ' (' + fazendaSel.nome + ')' + (safraField.dataset.value ? ' · Safra ' + safraField.dataset.value : '');
      }
      destinoTexto = depositoField.dataset.value;
      documento = null;
    } else {
      var fornecedorInvalid = !fornecedorField.dataset.value;
      fornecedorField.classList.toggle('error', fornecedorInvalid);
      if (fornecedorInvalid) isValid = false;

      origemTexto = 'Compra de terceiro — ' + (fornecedorField.dataset.value || '');
      destinoTexto = depositoField.dataset.value;
      var file = arquivoInput.files && arquivoInput.files[0];
      var docNome = document.getElementById('entrada-documento-input').value.trim();
      documento = (file || docNome) ? { nome: docNome || file.name, url: 'about:blank' } : null;
    }

    if (!isValid) {
      var firstError = document.querySelector('.wrapper.error, .entradav2-origem-block .wrapper.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    window.NiveloEstoqueVendasV2.registrarEntrada(produto.codigo, {
      data: entradaDataInput.value || todayISO(),
      deposito: depositoField.dataset.value,
      quantidade: quantidade,
      origem: origemTexto,
      destino: destinoTexto,
      documento: documento
    });

    var mensagem = formatNum(quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + ' de ' + produto.produto + ' adicionados ao estoque de vendas.';
    try {
      sessionStorage.setItem('nivelo.estoquev2.entrada.success', mensagem);
    } catch (e) {}
    window.location.href = 'estoque-v2.html#tab=vendas';
  });
})();
