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

  // ---------- Resolve o produto pelo ?codigo= (mesma convenção já usada em
  // registrar-entrada-estoque-v2.js) ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var produto = codigo ? window.NiveloEstoqueUsoV2.findByCodigo(codigo) : null;

  if (!produto) {
    document.getElementById('entrada-not-found').hidden = false;
    document.getElementById('entrada-form').hidden = true;
    return;
  }

  document.getElementById('entrada-produto-titulo').textContent = produto.produto;
  document.getElementById('entrada-produto-input').value = produto.produto;
  document.getElementById('entrada-quantidade-unit').textContent = produto.unidadeMedidaSigla.toLowerCase();

  // ---------- Dropdown genérico (mesmo padrão já usado em estoque.js/
  // registrar-entrada-estoque-v2.js) ----------
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
    trigger.addEventListener('click', function () { if (root.classList.contains('open')) close(); else open(); });
    menu.addEventListener('click', function (event) { var o = event.target.closest('.option'); if (o) selectOption(o); });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
    return { selectOption: selectOption, trigger: trigger };
  }

  // ---------- Data ----------
  var entradaDataInput = document.getElementById('entrada-data-input');
  var entradaDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'entrada-data-field', triggerId: 'entrada-data-trigger', valueId: 'entrada-data-value',
    hiddenInputId: 'entrada-data-input', popoverId: 'entrada-data-popover', placeholder: 'Selecionar data'
  });
  entradaDataPicker.setValue(todayISO());

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

  // ---------- Depósito/Local: só pré-cadastrados e ATIVOS (`d.ativo`), sem
  // cadastro rápido inline (V2, ver rules.md). Sem nenhum depósito ativo, o
  // Dropdown fica vazio (sem opção selecionável) e um helper text orienta o
  // usuário a cadastrar um em Configurações. ----------
  var depositoField = document.getElementById('entrada-deposito-field');
  var depositoMenu = document.getElementById('entrada-deposito-menu');
  var depositoTrigger = depositoField.querySelector('[data-dropdown-trigger]');
  var depositoEmptyHelper = document.getElementById('entrada-deposito-empty-helper');
  var depositosAtivos = window.NiveloLocais.list().filter(function (local) { return local.ativo; });
  depositoMenu.innerHTML = depositosAtivos.map(function (local) {
    return '<div class="option" data-value="' + local.nome + '">' + local.nome + '</div>';
  }).join('');
  if (depositoEmptyHelper) depositoEmptyHelper.hidden = depositosAtivos.length > 0;
  if (depositoTrigger) depositoTrigger.disabled = depositosAtivos.length === 0;
  var depositoDropdown = initDropdown(depositoField, function () {
    depositoField.classList.remove('error');
  });

  // ---------- Quantidade + preview de conversão ----------
  var conversao = getConversao(produto.unidadeMedidaSigla);
  var quantidadeField = document.getElementById('entrada-quantidade-field');
  var quantidadeInput = document.getElementById('entrada-quantidade-input');
  var qtyPesoLine = document.getElementById('entrada-qty-peso-line');

  function updateQtyPreview() {
    if (!conversao) {
      qtyPesoLine.hidden = true;
      return;
    }
    var quantidade = Number(quantidadeInput.value) || 0;
    qtyPesoLine.hidden = false;
    qtyPesoLine.textContent = 'Total: ' + formatNum(quantidade * conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
  }
  quantidadeInput.addEventListener('input', function () {
    quantidadeField.classList.remove('error');
    updateQtyPreview();
    updateValorTotal();
  });
  updateQtyPreview();

  // ---------- Preço unitário (máscara R$) + Valor total ----------
  document.getElementById('entrada-preco-label').textContent = 'Preço unitário por ' + produto.unidadeMedidaSigla.toLowerCase();

  var precoField = document.getElementById('entrada-preco-field');
  var precoInput = document.getElementById('entrada-preco-input');
  var valorTotalInput = document.getElementById('entrada-valor-total-input');
  var precoCentavos = 0;
  function formatCentavosBRL(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  precoInput.addEventListener('input', function () {
    precoField.classList.remove('error');
    var digits = precoInput.value.replace(/\D/g, '');
    precoCentavos = digits ? Number(digits) : 0;
    precoInput.value = precoCentavos ? formatCentavosBRL(precoCentavos) : '';
    updateValorTotal();
  });
  function updateValorTotal() {
    var quantidade = Number(quantidadeInput.value) || 0;
    var preco = precoCentavos / 100;
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

    var precoUnitario = precoCentavos / 100;
    var precoInvalid = !(precoUnitario > 0);
    precoField.classList.toggle('error', precoInvalid);
    if (precoInvalid) isValid = false;

    var fornecedorInvalid = !fornecedorField.dataset.value;
    fornecedorField.classList.toggle('error', fornecedorInvalid);
    if (fornecedorInvalid) isValid = false;

    var depositoInvalid = !depositoField.dataset.value;
    depositoField.classList.toggle('error', depositoInvalid);
    if (depositoInvalid) isValid = false;

    if (!isValid) {
      var firstError = document.querySelector('.wrapper.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var documento = document.getElementById('entrada-documento-input').value.trim() || null;

    window.NiveloEstoqueUsoV2.registrarEntrada(produto.codigo, {
      data: entradaDataInput.value || todayISO(),
      deposito: depositoField.dataset.value,
      fornecedor: fornecedorField.dataset.value,
      quantidade: quantidade,
      precoUnitario: precoUnitario,
      documento: documento
    });

    var mensagem = formatNum(quantidade) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + ' de ' + produto.produto + ' adicionados ao estoque de uso.';
    try {
      sessionStorage.setItem('nivelo.estoquev2.entrada.success', mensagem);
    } catch (e) {}
    window.location.href = 'estoque-v2.html#tab=compras';
  });
})();
