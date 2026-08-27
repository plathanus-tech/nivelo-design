(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de novo-estoque.js/
  // cadastros.js: wrapper/trigger/menu/option, menu em `position:fixed`
  // calculado via JS pra escapar do `overflow:hidden` de `.card`). ----------
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
  var codigoInput = document.getElementById('np-codigo');
  var codigoReferenciaField = document.getElementById('codigo-referencia-field');
  var codigoReferenciaInput = document.getElementById('np-codigo-referencia');
  var nomeField = document.getElementById('nome-field');
  var nomeInput = document.getElementById('np-nome');
  var origemIcmsField = document.getElementById('origem-icms-field');
  var unidadeMedidaField = document.getElementById('unidade-medida-field');
  var cestInput = document.getElementById('np-cest');
  var ncmInput = document.getElementById('np-ncm');
  var alturaInput = document.getElementById('np-altura');
  var larguraInput = document.getElementById('np-largura');
  var comprimentoInput = document.getElementById('np-comprimento');
  var pesoLiquidoInput = document.getElementById('np-peso-liquido');
  var pesoBrutoInput = document.getElementById('np-peso-bruto');
  var unidadeResultadoEl = document.getElementById('np-unidade-resultado');
  var controlaEstoqueField = document.getElementById('controla-estoque-field');
  var controlaEstoqueRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="controla-estoque"]'));
  var qtdMinimaField = document.getElementById('qtd-minima-field');
  var qtdMinimaInput = document.getElementById('np-qtd-minima');
  var qtdMaximaField = document.getElementById('qtd-maxima-field');
  var qtdMaximaInput = document.getElementById('np-qtd-maxima');
  var statusField = document.getElementById('status-field');

  var origemIcmsDropdown = initDropdown(origemIcmsField);
  var statusDropdown = initDropdown(statusField);

  // ---------- Unidade de Medida: opções vêm do catálogo central
  // (Configuração > Unidade de medida, `window.NiveloUnidadesMedida`) em vez
  // do vocabulário fixo que ficava hardcoded nesta tela — a unidade
  // cadastrada lá já carrega sua própria conversão ("1 unidade corresponde
  // a X <unidade base>"), então "Unidade de Volume"/"Fator de Conversão"
  // deixaram de existir aqui como campos próprios (ver
  // `updateUnidadeResultado()` abaixo, que só reflete o que já está
  // cadastrado, nunca pede pro usuário informar de novo). ----------
  var unidadeMedidaDropdown = initDropdown(unidadeMedidaField, function (sigla) {
    updateUnidadeResultado(sigla);
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

  // ---------- Categoria do Produto: opções vêm do catálogo compartilhado
  // (window.NiveloCategorias, persistido em localStorage) + item fixo "+
  // Adicionar nova categoria", que abre um Dialog pequeno pra criar uma
  // categoria nova, disponível em qualquer cadastro futuro — mesmo padrão
  // já usado pro Local de estoque em novo-estoque.js. ----------
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

  // ---------- Controla Estoque: mostra/esconde Quantidade mínima/máxima
  // (mesma técnica de `refreshFormaEntradaVisibility()`/`syncFormaEntradaChecked()`
  // já usada em novo-estoque.js). ----------
  function getControlaEstoque() {
    var checked = controlaEstoqueRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'sim';
  }

  function syncControlaEstoqueChecked() {
    controlaEstoqueRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function refreshControlaEstoqueVisibility() {
    var controla = getControlaEstoque() === 'sim';
    qtdMinimaField.hidden = !controla;
    qtdMaximaField.hidden = !controla;
    if (!controla) {
      qtdMinimaField.classList.remove('error');
      qtdMaximaField.classList.remove('error');
    }
  }

  controlaEstoqueRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncControlaEstoqueChecked();
      refreshControlaEstoqueVisibility();
    });
  });
  syncControlaEstoqueChecked();
  refreshControlaEstoqueVisibility();

  // ---------- Erros somem ao corrigir ----------
  function clearErrorOnInput(field, input, isValid) {
    input.addEventListener('input', function () {
      if (field.classList.contains('error') && isValid(input.value)) {
        field.classList.remove('error');
      }
    });
  }
  clearErrorOnInput(codigoReferenciaField, codigoReferenciaInput, function (v) { return v.trim() !== ''; });
  clearErrorOnInput(nomeField, nomeInput, function (v) { return v.trim() !== ''; });
  qtdMinimaInput.addEventListener('input', function () { qtdMinimaField.classList.remove('error'); });
  qtdMaximaInput.addEventListener('input', function () { qtdMaximaField.classList.remove('error'); });

  // ---------- Modo edição (?sku=PRD-001) vs. criação ----------
  var params = new URLSearchParams(location.search);
  var editSku = params.get('sku');
  var editingProduct = editSku ? window.NiveloProdutos.findBySku(editSku) : null;

  function fillForm(product) {
    codigoInput.value = product.sku;
    codigoReferenciaInput.value = product.codigoReferencia || '';
    nomeInput.value = product.nome;
    if (product.categoria) selectCategoria(product.categoria);
    if (product.origemIcms) origemIcmsDropdown.selectValue(product.origemIcms);
    if (product.unidadeMedida) {
      unidadeMedidaDropdown.selectValue(product.unidadeMedida);
      updateUnidadeResultado(product.unidadeMedida);
    }
    cestInput.value = product.cest || '';
    ncmInput.value = product.ncm || '';
    alturaInput.value = product.altura != null ? product.altura : '';
    larguraInput.value = product.largura != null ? product.largura : '';
    comprimentoInput.value = product.comprimento != null ? product.comprimento : '';
    pesoLiquidoInput.value = product.pesoLiquido != null ? product.pesoLiquido : '';
    pesoBrutoInput.value = product.pesoBruto != null ? product.pesoBruto : '';
    var controlaRadio = document.querySelector('input[name="controla-estoque"][value="' + (product.controlaEstoque ? 'sim' : 'nao') + '"]');
    if (controlaRadio) controlaRadio.checked = true;
    syncControlaEstoqueChecked();
    refreshControlaEstoqueVisibility();
    qtdMinimaInput.value = product.qtdMinima != null ? product.qtdMinima : '';
    qtdMaximaInput.value = product.qtdMaxima != null ? product.qtdMaxima : '';

    statusDropdown.selectValue(product.status || 'ativo');
  }

  if (editingProduct) {
    document.getElementById('novo-produto-page-title').textContent = 'Editar produto';
    document.title = 'Editar produto — Nivelo';
    document.getElementById('novo-produto-submit').textContent = 'Salvar alterações';
    fillForm(editingProduct);
  } else {
    // Preview cosmético de "Código" — o valor real (`PRD-NNN`) só é gerado
    // de verdade dentro de `NiveloProdutos.add()` ao salvar, mesmo escopo
    // do resto do formulário (mesma convenção de novo-estoque.js).
    codigoInput.value = 'PRD-XXX';
  }

  // ---------- Validação + envio ----------
  var form = document.getElementById('novo-produto-form');

  function runValidation() {
    var codigoReferenciaInvalid = !codigoReferenciaInput.value.trim();
    codigoReferenciaField.classList.toggle('error', codigoReferenciaInvalid);

    var nomeInvalid = !nomeInput.value.trim();
    nomeField.classList.toggle('error', nomeInvalid);

    var categoriaInvalid = !categoriaField.dataset.value;
    categoriaField.classList.toggle('error', categoriaInvalid);

    var origemIcmsInvalid = !origemIcmsField.dataset.value;
    origemIcmsField.classList.toggle('error', origemIcmsInvalid);

    var unidadeMedidaInvalid = !unidadeMedidaField.dataset.value;
    unidadeMedidaField.classList.toggle('error', unidadeMedidaInvalid);

    var controla = getControlaEstoque() === 'sim';
    var qtdMinimaInvalid = false;
    var qtdMaximaInvalid = false;
    if (controla) {
      qtdMinimaInvalid = qtdMinimaInput.value === '' || Number(qtdMinimaInput.value) < 0;
      var minValue = Number(qtdMinimaInput.value);
      var maxValue = Number(qtdMaximaInput.value);
      qtdMaximaInvalid = qtdMaximaInput.value === '' || (!qtdMinimaInvalid && maxValue < minValue);
      qtdMinimaField.classList.toggle('error', qtdMinimaInvalid);
      qtdMaximaField.classList.toggle('error', qtdMaximaInvalid);
    }

    return !codigoReferenciaInvalid && !nomeInvalid && !categoriaInvalid && !origemIcmsInvalid && !unidadeMedidaInvalid &&
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

    var controla = getControlaEstoque() === 'sim';
    // A unidade escolhida já carrega sua própria conversão (cadastrada em
    // Configuração > Unidade de medida) — `unidadeVolume`/`fatorConversao`
    // continuam preenchidos no registro do produto (mesmos 2 campos que
    // Nova Remessa/Novo Pedido de Venda já leem hoje), só que derivados
    // automaticamente em vez de pedidos de novo pro usuário aqui.
    var unidadeRegistro = window.NiveloUnidadesMedida.findBySigla(unidadeMedidaField.dataset.value);
    var payload = {
      nome: nomeInput.value.trim(),
      codigoReferencia: codigoReferenciaInput.value.trim(),
      categoria: categoriaField.dataset.value,
      origemIcms: origemIcmsField.dataset.value,
      unidadeMedida: unidadeMedidaField.dataset.value,
      unidade: editingProduct ? editingProduct.unidade : (unidadeRegistro ? unidadeRegistro.nome : unidadeMedidaField.dataset.value),
      cest: cestInput.value.trim(),
      ncm: ncmInput.value.trim(),
      altura: alturaInput.value !== '' ? Number(alturaInput.value) : null,
      largura: larguraInput.value !== '' ? Number(larguraInput.value) : null,
      comprimento: comprimentoInput.value !== '' ? Number(comprimentoInput.value) : null,
      pesoLiquido: pesoLiquidoInput.value !== '' ? Number(pesoLiquidoInput.value) : null,
      pesoBruto: pesoBrutoInput.value !== '' ? Number(pesoBrutoInput.value) : null,
      unidadeVolume: unidadeRegistro ? unidadeRegistro.unidadeBaseSigla : '',
      fatorConversao: unidadeRegistro ? unidadeRegistro.correspondeA : 1,
      controlaEstoque: controla,
      qtdMinima: controla ? Number(qtdMinimaInput.value) : null,
      qtdMaxima: controla ? Number(qtdMaximaInput.value) : null,
      status: statusField.dataset.value || 'ativo'
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

    window.location.href = 'produtos.html';
  });
})();
