(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico ----------
  // Mesmo padrão de novo-produto.js/novo-estoque.js, ACRESCIDO do fix
  // documentado em CLAUDE.md (contas-a-pagar.js/nova-conta-pagar.js): o
  // listener de scroll da fase de CAPTURA usado pra fechar o menu quando a
  // PÁGINA rola também recebe o scroll INTERNO do próprio `.menu`
  // (`overflow-y:auto`) — sem o guard abaixo, o dropdown "Origem conforme
  // ICMS" (a lista mais longa desta tela) fechava sozinho ao tentar rolar
  // as opções. `if (menu.contains(event.target)) return;` isola o scroll
  // interno do scroll da página.
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

    function scrollClose(event) {
      if (event.target instanceof Node && menu.contains(event.target)) return;
      close();
    }

    function close() {
      root.classList.remove('open');
      window.removeEventListener('scroll', scrollClose, true);
      window.removeEventListener('resize', close);
    }
    function open() {
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', scrollClose, true);
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

    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });

    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (!optionEl) return;
      selectOption(optionEl);
    });

    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    return { selectOption: selectOption, selectValue: selectValue, root: root };
  }

  // ---------- Campos ----------
  var nomeField = document.getElementById('nome-field');
  var nomeInput = document.getElementById('np-nome');
  var origemIcmsField = document.getElementById('origem-icms-field');
  var unidadeMedidaField = document.getElementById('unidade-medida-field');
  var cestInput = document.getElementById('np-cest');
  var ncmInput = document.getElementById('np-ncm');
  var gtinInput = document.getElementById('np-gtin');
  var unidadeResultadoEl = document.getElementById('np-unidade-resultado');
  var qtdMinimaField = document.getElementById('qtd-minima-field');
  var qtdMinimaInput = document.getElementById('np-qtd-minima');
  var qtdMaximaField = document.getElementById('qtd-maxima-field');
  var qtdMaximaInput = document.getElementById('np-qtd-maxima');

  var origemIcmsDropdown = initDropdown(origemIcmsField);

  // ---------- Tipo de produto: dirige as 2 seções condicionais ----------
  var tipoProdutoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-produto"]'));
  var dadosFiscaisSection = document.getElementById('dados-fiscais-section');
  var entradaInicialSection = document.getElementById('entrada-inicial-section');

  function getTipoProduto() {
    var checked = tipoProdutoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'venda';
  }

  function syncTipoProdutoChecked() {
    tipoProdutoRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function refreshTipoProdutoVisibility() {
    var isVenda = getTipoProduto() === 'venda';
    dadosFiscaisSection.hidden = !isVenda;
    entradaInicialSection.hidden = isVenda;
    if (isVenda) {
      origemIcmsField.classList.remove('error');
    }
  }

  tipoProdutoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncTipoProdutoChecked();
      refreshTipoProdutoVisibility();
    });
  });
  syncTipoProdutoChecked();
  refreshTipoProdutoVisibility();

  // ---------- Unidade de Medida ----------
  var unidadeMedidaDropdown = initDropdown(unidadeMedidaField, function (sigla) {
    updateUnidadeResultado(sigla);
    updateEntradaUnidade(sigla);
  });
  unidadeMedidaField.querySelector('[data-dropdown-menu]').innerHTML =
    window.NiveloUnidadesMedida.list().filter(function (u) { return u.ativo; }).map(function (u) {
      return '<div class="option" data-value="' + u.sigla + '">' + u.sigla + ' · ' + u.nome + '</div>';
    }).join('');

  function updateUnidadeResultado(sigla) {
    var unidade = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!unidade) {
      unidadeResultadoEl.hidden = true;
      return;
    }
    var quantidadeText = unidade.correspondeA.toString().replace('.', ',');
    unidadeResultadoEl.textContent = '1 ' + unidade.sigla + ' = ' + quantidadeText + ' ' + unidade.unidadeBaseSigla;
    unidadeResultadoEl.hidden = false;
  }

  // ---------- Categoria do Produto ----------
  var categoriaField = document.getElementById('categoria-field');
  var categoriaMenu = document.getElementById('categoria-menu');
  var categoriaTrigger = categoriaField.querySelector('[data-dropdown-trigger]');
  var categoriaValueEl = categoriaField.querySelector('[data-dropdown-value]');

  function renderCategoriaOptions() {
    var html = window.NiveloCategorias.list().map(function (nome) {
      return '<div class="option" data-value="' + nome + '">' + nome + '</div>';
    }).join('');
    html += '<div class="novo-produto-categoria-option-create" data-add-categoria>' +
      '<i data-lucide="plus" width="14" height="14"></i> Adicionar nova categoria</div>';
    categoriaMenu.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
  renderCategoriaOptions();

  function selectCategoria(nome) {
    var existing = Array.prototype.slice.call(categoriaMenu.querySelectorAll('.option'));
    existing.forEach(function (o) { o.classList.remove('selected'); });
    var optionEl = categoriaMenu.querySelector('.option[data-value="' + nome + '"]');
    if (optionEl) optionEl.classList.add('selected');
    categoriaValueEl.textContent = nome;
    categoriaValueEl.classList.remove('placeholder');
    categoriaField.dataset.value = nome;
    categoriaField.classList.remove('error');
  }

  var novaCategoriaOverlay = document.getElementById('nova-categoria-overlay');
  var novaCategoriaNomeInput = document.getElementById('nova-categoria-nome');
  var novaCategoriaNomeField = document.getElementById('nova-categoria-nome-field');

  function openNovaCategoriaDialog() {
    categoriaField.classList.remove('open');
    novaCategoriaNomeInput.value = '';
    novaCategoriaNomeField.classList.remove('error');
    novaCategoriaOverlay.hidden = false;
    novaCategoriaNomeInput.focus();
  }
  function closeNovaCategoriaDialog() {
    novaCategoriaOverlay.hidden = true;
  }

  categoriaTrigger.addEventListener('click', function () {
    categoriaField.classList.toggle('open');
  });
  categoriaMenu.addEventListener('click', function (event) {
    if (event.target.closest('[data-add-categoria]')) {
      openNovaCategoriaDialog();
      return;
    }
    var optionEl = event.target.closest('.option');
    if (optionEl) {
      selectCategoria(optionEl.dataset.value);
      categoriaField.classList.remove('open');
    }
  });
  document.addEventListener('click', function (event) {
    if (!categoriaField.contains(event.target)) categoriaField.classList.remove('open');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') categoriaField.classList.remove('open');
  });

  document.getElementById('nova-categoria-close').addEventListener('click', closeNovaCategoriaDialog);
  document.getElementById('nova-categoria-cancel').addEventListener('click', closeNovaCategoriaDialog);
  document.getElementById('nova-categoria-add').addEventListener('click', function () {
    var nome = novaCategoriaNomeInput.value.trim();
    novaCategoriaNomeField.classList.toggle('error', !nome);
    if (!nome) return;

    window.NiveloCategorias.add(nome);
    renderCategoriaOptions();
    selectCategoria(nome);
    closeNovaCategoriaDialog();
  });

  // ---------- Entrada Inicial no Estoque (só Produto de uso, opcional) ----------
  // Nota pra desenvolvimento: se preenchida ao salvar, esta seção deveria
  // registrar uma entrada real em Estoque > "Estoque de uso" e vincular
  // fornecedor/preço/documento pra alimentar "Histórico de custos dos
  // insumos" (ver relatorio-compras.html/"Histórico de custos dos
  // insumos"). `estoque.js`/`estoque-compras-data.js` não modelam ainda um
  // conceito de "Estoque de uso" com entradas por produto — implementar
  // essa integração de verdade exigiria uma mudança de escopo maior (nova
  // estrutura de dados compartilhada entre Produtos e Estoque). Por isso,
  // nesta rodada, o submit só GRAVA os campos preenchidos no próprio
  // registro do produto (ver payload no submit abaixo) — é um mock
  // claramente escopado, documentado, sem side-effect arriscado em Estoque.
  var entradaDataInput = document.getElementById('entrada-data-hidden');
  var entradaQuantidadeInput = document.getElementById('np-entrada-quantidade');
  var entradaUnidadeInput = document.getElementById('np-entrada-unidade');
  var entradaDepositoField = document.getElementById('entrada-deposito-field');
  var entradaFornecedorField = document.getElementById('entrada-fornecedor-field');
  var entradaPrecoInput = document.getElementById('np-entrada-preco');
  var entradaValorTotalInput = document.getElementById('np-entrada-valor-total');
  var entradaDocumentoInput = document.getElementById('entrada-documento-input');
  var entradaDocumentoNameEl = document.getElementById('entrada-documento-name');

  function updateEntradaUnidade(sigla) {
    entradaUnidadeInput.value = sigla || '';
  }

  var entradaDatePicker = window.NiveloDatePicker.initDay({
    rootId: 'entrada-data-field',
    triggerId: 'entrada-data-trigger',
    valueId: 'entrada-data-value',
    hiddenInputId: 'entrada-data-hidden',
    popoverId: 'entrada-data-popover',
    placeholder: 'Selecionar data',
    formatValue: function (date) {
      var pad2 = function (n) { return n < 10 ? '0' + n : String(n); };
      return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear();
    }
  });
  entradaDatePicker.setValue(new Date().getFullYear() + '-' +
    String(new Date().getMonth() + 1).padStart(2, '0') + '-' +
    String(new Date().getDate()).padStart(2, '0'));

  // Só pré-cadastrados e ATIVOS (`d.ativo`), sem cadastro rápido inline (V2,
  // ver rules.md). Sem nenhum depósito ativo, o Dropdown fica vazio (sem
  // opção selecionável) e um helper text orienta o usuário a cadastrar um em
  // Configurações.
  var entradaDepositoMenu = document.getElementById('entrada-deposito-menu');
  var entradaDepositoTrigger = entradaDepositoField.querySelector('[data-dropdown-trigger]');
  var entradaDepositoEmptyHelper = document.getElementById('entrada-deposito-empty-helper');
  var entradaDepositosAtivos = (window.NiveloLocais ? window.NiveloLocais.list() : []).filter(function (local) { return local.ativo; });
  entradaDepositosAtivos.forEach(function (local) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = local.nome || local;
    optionEl.textContent = local.nome || local;
    entradaDepositoMenu.appendChild(optionEl);
  });
  if (entradaDepositoEmptyHelper) entradaDepositoEmptyHelper.hidden = entradaDepositosAtivos.length > 0;
  if (entradaDepositoTrigger) entradaDepositoTrigger.disabled = entradaDepositosAtivos.length === 0;
  initDropdown(entradaDepositoField);

  var entradaFornecedorMenu = document.getElementById('entrada-fornecedor-menu');
  (window.NiveloCadastros ? window.NiveloCadastros.findByTipo('fornecedor') : []).forEach(function (cadastro) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = cadastro.codigo || cadastro.nome;
    optionEl.textContent = cadastro.nome;
    entradaFornecedorMenu.appendChild(optionEl);
  });
  initDropdown(entradaFornecedorField);

  var entradaPrecoCentavos = 0;
  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function recalcularValorTotal() {
    var quantidade = Number(entradaQuantidadeInput.value) || 0;
    var total = quantidade * (entradaPrecoCentavos / 100);
    entradaValorTotalInput.value = total ? formatCentavosBRL(Math.round(total * 100)) : '';
  }
  entradaPrecoInput.addEventListener('input', function () {
    var digits = entradaPrecoInput.value.replace(/\D/g, '');
    entradaPrecoCentavos = digits ? Number(digits) : 0;
    entradaPrecoInput.value = entradaPrecoCentavos ? formatCentavosBRL(entradaPrecoCentavos) : '';
    recalcularValorTotal();
  });
  entradaQuantidadeInput.addEventListener('input', recalcularValorTotal);

  entradaDocumentoInput.addEventListener('change', function () {
    var file = entradaDocumentoInput.files && entradaDocumentoInput.files[0];
    entradaDocumentoNameEl.textContent = file ? file.name : 'Selecionar arquivo (XML ou PDF)';
  });

  // ---------- Erros somem ao corrigir ----------
  function clearErrorOnInput(field, input, isValid) {
    input.addEventListener('input', function () {
      if (field.classList.contains('error') && isValid(input.value)) {
        field.classList.remove('error');
      }
    });
  }
  clearErrorOnInput(nomeField, nomeInput, function (v) { return v.trim() !== ''; });
  qtdMinimaInput.addEventListener('input', function () { qtdMinimaField.classList.remove('error'); });
  qtdMaximaInput.addEventListener('input', function () { qtdMaximaField.classList.remove('error'); });

  // ---------- Modo edição (?sku=PRD-001) vs. criação ----------
  var params = new URLSearchParams(location.search);
  var editSku = params.get('sku');
  var editingProduct = editSku ? window.NiveloProdutos.findBySku(editSku) : null;

  function fillForm(product) {
    nomeInput.value = product.nome;
    if (product.categoria) selectCategoria(product.categoria);
    if (product.unidadeMedida) {
      unidadeMedidaDropdown.selectValue(product.unidadeMedida);
      updateUnidadeResultado(product.unidadeMedida);
      updateEntradaUnidade(product.unidadeMedida);
    }
    var tipo = product.tipoProduto === 'uso' ? 'uso' : 'venda';
    var tipoRadio = document.querySelector('input[name="tipo-produto"][value="' + tipo + '"]');
    if (tipoRadio) tipoRadio.checked = true;
    syncTipoProdutoChecked();
    refreshTipoProdutoVisibility();

    if (product.origemIcms) origemIcmsDropdown.selectValue(product.origemIcms);
    cestInput.value = product.cest || '';
    ncmInput.value = product.ncm || '';
    gtinInput.value = product.gtin || '';

    qtdMinimaInput.value = product.qtdMinima != null ? product.qtdMinima : '';
    qtdMaximaInput.value = product.qtdMaxima != null ? product.qtdMaxima : '';
  }

  if (editingProduct) {
    document.getElementById('novo-produto-page-title').textContent = 'Editar produto';
    document.title = 'Editar produto — Nivelo';
    document.getElementById('novo-produto-submit').textContent = 'Salvar alterações';
    fillForm(editingProduct);
  }

  // ---------- Validação + envio ----------
  var form = document.getElementById('novo-produto-form');

  function runValidation() {
    var nomeInvalid = !nomeInput.value.trim();
    nomeField.classList.toggle('error', nomeInvalid);

    var categoriaInvalid = !categoriaField.dataset.value;
    categoriaField.classList.toggle('error', categoriaInvalid);

    var unidadeMedidaInvalid = !unidadeMedidaField.dataset.value;
    unidadeMedidaField.classList.toggle('error', unidadeMedidaInvalid);

    var isVenda = getTipoProduto() === 'venda';
    var origemIcmsInvalid = isVenda && !origemIcmsField.dataset.value;
    origemIcmsField.classList.toggle('error', origemIcmsInvalid);

    var minValue = qtdMinimaInput.value !== '' ? Number(qtdMinimaInput.value) : null;
    var maxValue = qtdMaximaInput.value !== '' ? Number(qtdMaximaInput.value) : null;
    var qtdMinimaInvalid = minValue != null && minValue < 0;
    var qtdMaximaInvalid = maxValue != null && (maxValue < 0 || (minValue != null && maxValue < minValue));
    qtdMinimaField.classList.toggle('error', qtdMinimaInvalid);
    qtdMaximaField.classList.toggle('error', qtdMaximaInvalid);

    return !nomeInvalid && !categoriaInvalid && !unidadeMedidaInvalid && !origemIcmsInvalid &&
      !qtdMinimaInvalid && !qtdMaximaInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var tipoProduto = getTipoProduto();
    var unidadeRegistro = window.NiveloUnidadesMedida.findBySigla(unidadeMedidaField.dataset.value);
    var qtdMinima = qtdMinimaInput.value !== '' ? Number(qtdMinimaInput.value) : null;
    var qtdMaxima = qtdMaximaInput.value !== '' ? Number(qtdMaximaInput.value) : null;

    var payload = {
      nome: nomeInput.value.trim(),
      categoria: categoriaField.dataset.value,
      tipoProduto: tipoProduto,
      unidadeMedida: unidadeMedidaField.dataset.value,
      unidade: editingProduct ? editingProduct.unidade : (unidadeRegistro ? unidadeRegistro.nome : unidadeMedidaField.dataset.value),
      unidadeVolume: unidadeRegistro ? unidadeRegistro.unidadeBaseSigla : '',
      fatorConversao: unidadeRegistro ? unidadeRegistro.correspondeA : 1,
      // Dados Fiscais só se aplicam a "Produto de venda" — zerados quando o
      // Tipo é "uso" (mesma seção não aparece no formulário).
      ncm: tipoProduto === 'venda' ? ncmInput.value.trim() : (editingProduct ? editingProduct.ncm : ''),
      origemIcms: tipoProduto === 'venda' ? origemIcmsField.dataset.value : (editingProduct ? editingProduct.origemIcms : ''),
      cest: tipoProduto === 'venda' ? cestInput.value.trim() : (editingProduct ? editingProduct.cest : ''),
      gtin: tipoProduto === 'venda' ? gtinInput.value.trim() : (editingProduct ? editingProduct.gtin : ''),
      // Campos de Dimensões/Peso/Conversão avulsa não têm mais UI no V2 —
      // preservados só se já existiam (edição), nunca reescritos a partir
      // de um campo que não existe mais neste formulário.
      altura: editingProduct ? editingProduct.altura : null,
      largura: editingProduct ? editingProduct.largura : null,
      comprimento: editingProduct ? editingProduct.comprimento : null,
      pesoLiquido: editingProduct ? editingProduct.pesoLiquido : null,
      pesoBruto: editingProduct ? editingProduct.pesoBruto : null,
      controlaEstoque: true,
      qtdMinima: qtdMinima,
      qtdMaxima: qtdMaxima,
      status: editingProduct ? editingProduct.status : 'ativo',
      ativo: editingProduct ? editingProduct.ativo : true
    };

    var message;
    try {
      if (editingProduct) {
        window.NiveloProdutos.update(editingProduct.sku, payload);
        message = 'Produto editado com sucesso.';
      } else {
        window.NiveloProdutos.add(payload);
        message = 'Produto cadastrado com sucesso.';
      }
      sessionStorage.setItem('nivelo.novoproduto.success', message);
    } catch (e) {}

    window.location.href = 'produtos-v2.html';
  });
})();
