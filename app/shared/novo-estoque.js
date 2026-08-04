(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de novo-cadastro.js/
  // estoque.js: wrapper/trigger/menu/option/open, menu em `position:fixed`
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
      if (trigger.disabled) return;
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
      close();
      if (onChange) onChange(optionEl.dataset.value, optionEl.textContent);
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

    return { selectOption: selectOption, root: root };
  }

  // ---------- Catálogo de Produto (centralizado, ver produtos-data.js) ----------
  // Antes era um array local só desta tela — centralizado nesta rodada em
  // `window.NiveloProdutos` (ver rules.md, "Estoque — ações e histórico"):
  // Produto sempre vem dessa única fonte agora, usada também por estoque.js/
  // detalhe-estoque.js. Cadastro rápido (ver mais abaixo) chama
  // `NiveloProdutos.add(...)`, que adiciona em memória (perdido ao recarregar
  // — aceitável nesta etapa, sem persistência real).

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return String(text).normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
  }

  // ---------- Tipo de estoque (Vendas/Compras/Comprometido) ----------
  // Dirige quais campos aparecem nas seções "Produto" e "Detalhes do
  // lançamento" — ver rules.md pra tabela completa de campo × tipo.
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  var quantidadeLabel = document.getElementById('quantidade-label');
  var fornecedorField = document.getElementById('fornecedor-field');
  var destinatarioField = document.getElementById('destinatario-field');
  var dataLancamentoField = document.getElementById('data-lancamento-field');
  var dataLancamentoInput = document.getElementById('ne-data-lancamento');
  var dataEntregaField = document.getElementById('data-entrega-field');

  // ---------- Data do registo: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var dataLancamentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-lancamento-field',
    triggerId: 'data-lancamento-trigger',
    valueId: 'data-lancamento-value',
    hiddenInputId: 'ne-data-lancamento',
    popoverId: 'data-lancamento-popover',
    placeholder: 'Selecionar data'
  });
  dataLancamentoPicker.setValue(todayISO());

  var codigoInput = document.getElementById('ne-codigo');
  var depositoField = document.getElementById('deposito-field');
  var formaEntradaField = document.getElementById('forma-entrada-field');
  var formaEntradaRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="forma-entrada"]'));
  var valorUnitarioField = document.getElementById('valor-unitario-field');
  var produtoXmlBlock = document.getElementById('produto-xml-block');
  var produtoManualBlock = document.getElementById('produto-manual-block');

  var CODIGO_PREFIX = { vendas: 'VND', compras: 'CMP', comprometido: 'CMT' };

  // Preview cosmético (não persiste, mesmo escopo do resto do formulário) —
  // só pra dar uma noção visual de que o Código é gerado automaticamente.
  function generateCodigoPreview(tipo) {
    codigoInput.value = (CODIGO_PREFIX[tipo] || 'EST') + '-XXXX';
  }

  // ---------- Valor unitário: máscara de moeda (R$) ----------
  // Estado sempre em centavos (inteiro) — nunca uma string parseada solta.
  // Cada tecla reconstrói o valor formatado a partir só dos dígitos
  // digitados, padrão comum de máscara monetária (sempre "entra pela
  // direita", os 2 últimos dígitos são sempre os centavos).
  var valorUnitarioInput = document.getElementById('ne-valor-unitario');
  var valorUnitarioCentavos = 0;

  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getValorUnitarioCentavos() {
    return valorUnitarioCentavos;
  }

  valorUnitarioInput.addEventListener('input', function () {
    var digits = valorUnitarioInput.value.replace(/\D/g, '');
    valorUnitarioCentavos = digits ? Number(digits) : 0;
    valorUnitarioInput.value = valorUnitarioCentavos ? formatCentavosBRL(valorUnitarioCentavos) : '';
  });

  // ---------- Fornecedor: combobox (busca em Cadastro de Pessoas e
  // Empresas, filtrado por tipo Fornecedor) — mesma técnica já usada pro
  // combobox de Produto (Input de busca + menu próprio), sem cadastro
  // rápido inline (fora de escopo aqui). ----------
  var fornecedorInput = document.getElementById('ne-fornecedor');
  var fornecedorMenu = document.getElementById('fornecedor-menu');

  function positionFornecedorMenu() {
    var rect = fornecedorInput.getBoundingClientRect();
    var margin = 8;
    fornecedorMenu.style.left = rect.left + 'px';
    fornecedorMenu.style.width = rect.width + 'px';
    fornecedorMenu.style.top = (rect.bottom + 4) + 'px';
    fornecedorMenu.style.maxHeight = Math.min(240, window.innerHeight - rect.bottom - margin) + 'px';
  }

  function renderFornecedorMenu(query) {
    var normalizedQuery = normalize(query);
    var matches = window.NiveloCadastros.findByTipo('fornecedor').filter(function (c) {
      return normalize(c.nome).indexOf(normalizedQuery) !== -1;
    });
    var html = matches.map(function (c) {
      return '<div class="option" data-nome="' + c.nome + '">' + c.nome + ' <span class="text-12-regular">(' + c.cidade + ')</span></div>';
    }).join('');
    if (!html) html = '<div class="option-empty">Nenhum fornecedor encontrado.</div>';
    fornecedorMenu.innerHTML = html;
  }

  function openFornecedorMenu() {
    renderFornecedorMenu(fornecedorInput.value);
    fornecedorMenu.hidden = false;
    positionFornecedorMenu();
    window.addEventListener('scroll', positionFornecedorMenu, true);
    window.addEventListener('resize', positionFornecedorMenu);
  }

  function closeFornecedorMenu() {
    fornecedorMenu.hidden = true;
    window.removeEventListener('scroll', positionFornecedorMenu, true);
    window.removeEventListener('resize', positionFornecedorMenu);
  }

  fornecedorInput.addEventListener('focus', openFornecedorMenu);
  fornecedorInput.addEventListener('input', openFornecedorMenu);

  fornecedorMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    fornecedorInput.value = optionEl.dataset.nome;
    closeFornecedorMenu();
  });

  document.addEventListener('click', function (event) {
    if (!document.getElementById('fornecedor-combobox').contains(event.target)) closeFornecedorMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeFornecedorMenu();
  });

  function getFormaEntrada() {
    var checked = formaEntradaRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'manual';
  }

  // Forma de entrada = XML esconde o combobox de Produto (o produto vem da
  // conferência mockada do arquivo importado, não de uma seleção manual) —
  // Manual sempre mostra o bloco manual, disponível pra qualquer tipo de
  // estoque.
  function refreshFormaEntradaVisibility() {
    var isXml = getFormaEntrada() === 'xml';
    produtoXmlBlock.hidden = !isXml;
    produtoManualBlock.hidden = isXml;
  }

  // RadioButton.module.css pinta o círculo preenchido via `.checked` no
  // <label class="option"> pai (não `:checked` do input nativo) — sem essa
  // classe o círculo nunca preenche, dando a impressão de que o clique não
  // funciona (a seleção real já funcionava, só o feedback visual faltava).
  function syncFormaEntradaChecked() {
    formaEntradaRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function applyTipo(tipo) {
    quantidadeLabel.textContent = tipo === 'comprometido' ? 'Quantidade comprometida' : 'Quantidade';
    fornecedorField.hidden = tipo !== 'compras';
    valorUnitarioField.hidden = tipo !== 'compras';
    destinatarioField.hidden = tipo !== 'comprometido';
    dataLancamentoField.hidden = tipo === 'comprometido';
    dataEntregaField.hidden = tipo !== 'comprometido';
    if (destinatarioField.hidden) destinatarioField.classList.remove('error');
    generateCodigoPreview(tipo);
  }

  var tipoDropdown = initDropdown(document.getElementById('tipo-estoque-field'), function (value) {
    applyTipo(value);
  });
  initDropdown(depositoField);

  // ---------- Sugestão de Conta a Pagar (só Estoque de Uso) — nunca
  // automática: em vez de um checkbox sempre visível dentro do formulário,
  // a decisão é perguntada num modal DEPOIS de salvar o registro (ver
  // #criar-conta-pagar-overlay), quando a compra já foi confirmada e a
  // pergunta fica contextual em vez de mais um campo pra preencher antes.
  // Os 3 campos que faltam pra montar uma conta válida (Forma de Pagamento/
  // Vencimento/Categoria) vivem dentro do próprio modal — Fornecedor, Valor
  // e Data de emissão já existem no formulário principal. ----------
  var criarContaPagarOverlay = document.getElementById('criar-conta-pagar-overlay');
  var cpFormaField = document.getElementById('cp-forma-field');
  var cpVencimentoField = document.getElementById('cp-vencimento-field');
  var cpVencimentoInput = document.getElementById('cp-vencimento');
  var cpCategoriaField = document.getElementById('cp-categoria-field');

  // ---------- Vencimento (modal Criar conta a pagar?): padrão oficial de
  // calendário do sistema (dia único), ver app/shared/date-picker.js. ----------
  var cpVencimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'cp-vencimento-field',
    triggerId: 'cp-vencimento-trigger',
    valueId: 'cp-vencimento-value',
    hiddenInputId: 'cp-vencimento',
    popoverId: 'cp-vencimento-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (cpVencimentoField.classList.contains('error') && cpVencimentoInput.value) cpVencimentoField.classList.remove('error');
    }
  });

  var cpFormaMenu = document.getElementById('cp-forma-menu');
  window.NiveloFormasPagamento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    cpFormaMenu.appendChild(optionEl);
  });
  var cpFormaDropdown = initDropdown(cpFormaField);

  var cpCategoriaMenu = document.getElementById('cp-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    cpCategoriaMenu.appendChild(optionEl);
  });
  var cpCategoriaDropdown = initDropdown(cpCategoriaField);

  function validateContaPagarModal() {
    var cpFormaInvalid = !cpFormaField.dataset.value;
    cpFormaField.classList.toggle('error', cpFormaInvalid);
    var cpVencimentoInvalid = !cpVencimentoInput.value;
    cpVencimentoField.classList.toggle('error', cpVencimentoInvalid);
    var cpCategoriaInvalid = !cpCategoriaField.dataset.value;
    cpCategoriaField.classList.toggle('error', cpCategoriaInvalid);
    return !cpFormaInvalid && !cpVencimentoInvalid && !cpCategoriaInvalid;
  }

  function redirectAfterSave(tipo, message) {
    try {
      sessionStorage.setItem('nivelo.novoestoque.success', message);
    } catch (e) {}
    window.location.href = 'estoque.html#tab=' + tipo;
  }

  function closeContaPagarModal() {
    criarContaPagarOverlay.hidden = true;
  }

  // ---------- Local de estoque: opções vêm do catálogo compartilhado
  // (window.NiveloLocais, persistido em localStorage) + item fixo "+
  // Adicionar novo local", que abre um Dialog pequeno pra criar um local
  // novo, disponível em qualquer Novo registro futuro. ----------
  var depositoMenu = document.getElementById('deposito-menu');
  var depositoTrigger = depositoField.querySelector('[data-dropdown-trigger]');
  var depositoValueEl = depositoField.querySelector('[data-dropdown-value]');

  function renderLocalOptions() {
    var html = window.NiveloLocais.list().map(function (nome) {
      return '<div class="option" data-value="' + nome + '">' + nome + '</div>';
    }).join('');
    html += '<div class="novo-estoque-local-option-create" data-add-local>' +
      '<i data-lucide="plus" width="14" height="14"></i> Adicionar novo local</div>';
    depositoMenu.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
  renderLocalOptions();

  var novoLocalOverlay = document.getElementById('novo-local-overlay');
  var novoLocalNomeInput = document.getElementById('novo-local-nome');
  var novoLocalNomeField = document.getElementById('novo-local-nome-field');

  function openNovoLocalDialog() {
    depositoField.classList.remove('open');
    novoLocalNomeInput.value = '';
    novoLocalNomeField.classList.remove('error');
    novoLocalOverlay.hidden = false;
    novoLocalNomeInput.focus();
  }
  function closeNovoLocalDialog() {
    novoLocalOverlay.hidden = true;
  }

  depositoMenu.addEventListener('click', function (event) {
    if (event.target.closest('[data-add-local]')) openNovoLocalDialog();
  });
  document.getElementById('novo-local-close').addEventListener('click', closeNovoLocalDialog);
  document.getElementById('novo-local-cancel').addEventListener('click', closeNovoLocalDialog);
  document.getElementById('novo-local-add').addEventListener('click', function () {
    var nome = novoLocalNomeInput.value.trim();
    novoLocalNomeField.classList.toggle('error', !nome);
    if (!nome) return;

    window.NiveloLocais.add(nome);
    renderLocalOptions();
    var addedOption = depositoMenu.querySelector('.option[data-value="' + nome + '"]');
    if (addedOption) addedOption.classList.add('selected');
    depositoValueEl.textContent = nome;
    depositoValueEl.classList.remove('placeholder');
    depositoField.dataset.value = nome;
    closeNovoLocalDialog();
  });

  formaEntradaRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncFormaEntradaChecked();
      refreshFormaEntradaVisibility();
    });
  });
  syncFormaEntradaChecked();

  applyTipo('vendas');
  refreshFormaEntradaVisibility();

  // ---------- Produto: combobox (busca existentes + cadastro rápido) ----------
  var produtoField = document.getElementById('produto-field');
  var produtoInput = document.getElementById('ne-produto-input');
  var produtoMenu = document.getElementById('produto-menu');
  var unidadeInput = document.getElementById('ne-unidade');
  var codigoReferenciaInput = document.getElementById('ne-codigo-referencia');
  var quickCreatePanel = document.getElementById('produto-quick-create');
  var selectedProduct = null;

  function positionProdutoMenu() {
    var rect = produtoInput.getBoundingClientRect();
    var margin = 8;
    produtoMenu.style.left = rect.left + 'px';
    produtoMenu.style.width = rect.width + 'px';
    produtoMenu.style.top = (rect.bottom + 4) + 'px';
    produtoMenu.style.maxHeight = Math.min(240, window.innerHeight - rect.bottom - margin) + 'px';
  }

  function selectProduct(product) {
    selectedProduct = product;
    produtoInput.value = product.nome;
    unidadeInput.value = product.unidade;
    codigoReferenciaInput.value = product.sku || '';
    produtoField.classList.remove('error');
    closeProdutoMenu();
  }

  function clearSelectedProduct() {
    selectedProduct = null;
    unidadeInput.value = '';
    codigoReferenciaInput.value = '';
  }

  function renderProdutoMenu(query) {
    var normalizedQuery = normalize(query);
    var matches = window.NiveloProdutos.list().filter(function (p) { return normalize(p.nome).indexOf(normalizedQuery) !== -1; });

    var html = matches.map(function (p) {
      return '<div class="option" data-nome="' + p.nome + '">' + p.nome + ' <span class="text-12-regular">(' + p.unidade + ')</span></div>';
    }).join('');

    var hasExactMatch = matches.some(function (p) { return normalize(p.nome) === normalizedQuery; });
    if (query.trim() && !hasExactMatch) {
      html += '<div class="option-create" data-create>' +
        '<i data-lucide="plus" width="14" height="14"></i>' +
        'Cadastrar novo produto: “' + query.trim() + '”' +
        '</div>';
    }
    if (!html) {
      html = '<div class="option-empty">Nenhum produto encontrado.</div>';
    }

    produtoMenu.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  function openProdutoMenu() {
    renderProdutoMenu(produtoInput.value);
    produtoMenu.hidden = false;
    positionProdutoMenu();
    window.addEventListener('scroll', positionProdutoMenu, true);
    window.addEventListener('resize', positionProdutoMenu);
  }

  function closeProdutoMenu() {
    produtoMenu.hidden = true;
    window.removeEventListener('scroll', positionProdutoMenu, true);
    window.removeEventListener('resize', positionProdutoMenu);
  }

  produtoInput.addEventListener('focus', openProdutoMenu);
  produtoInput.addEventListener('input', function () {
    clearSelectedProduct();
    openProdutoMenu();
  });

  produtoMenu.addEventListener('click', function (event) {
    var createEl = event.target.closest('[data-create]');
    if (createEl) {
      openQuickCreate(produtoInput.value.trim());
      return;
    }
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    var product = window.NiveloProdutos.list().filter(function (p) { return p.nome === optionEl.dataset.nome; })[0];
    if (product) selectProduct(product);
  });

  document.addEventListener('click', function (event) {
    if (!produtoField.contains(event.target)) closeProdutoMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeProdutoMenu();
  });

  // ---------- Cadastro rápido de produto ----------
  // Campos mínimos (ver rules.md): Nome, Código de referência (opcional,
  // auto-gerado se vazio) e Unidade de medida — nada de NCM/CEST/ICMS/
  // dimensões/peso, esse escopo fica pra um futuro módulo completo de Produto.
  var novoProdutoNomeInput = document.getElementById('np-nome');
  var novoProdutoSkuInput = document.getElementById('np-sku');
  var novoProdutoUnidadeField = document.getElementById('novo-produto-unidade-field');
  var novoProdutoErrorEl = document.getElementById('novo-produto-error');
  var novoProdutoUnidadeDropdown = initDropdown(novoProdutoUnidadeField);

  function openQuickCreate(prefillNome) {
    closeProdutoMenu();
    novoProdutoNomeInput.value = prefillNome || '';
    novoProdutoSkuInput.value = '';
    quickCreatePanel.hidden = false;
    quickCreatePanel.classList.remove('error');
    novoProdutoErrorEl.parentElement.classList.remove('error');
    novoProdutoNomeInput.focus();
  }

  function closeQuickCreate() {
    quickCreatePanel.hidden = true;
  }

  document.getElementById('produto-quick-create-cancel').addEventListener('click', closeQuickCreate);

  document.getElementById('produto-quick-create-add').addEventListener('click', function () {
    var nome = novoProdutoNomeInput.value.trim();
    var unidade = novoProdutoUnidadeField.dataset.value;
    var invalid = !nome || !unidade;
    quickCreatePanel.classList.toggle('error', invalid);
    if (invalid) return;

    var product = window.NiveloProdutos.add({ nome: nome, unidade: unidade, sku: novoProdutoSkuInput.value.trim() });
    selectProduct(product);
    closeQuickCreate();
  });

  // ---------- Compras: Importação de XML (mockada, sem parsing real —
  // protótipo estático não processa o conteúdo do arquivo de verdade) ----------
  var xmlFileInput = document.getElementById('xml-file-input');
  var xmlFileNameEl = document.getElementById('xml-file-name');
  var xmlFileStatusEl = document.getElementById('xml-file-status');
  var xmlReviewSection = document.getElementById('xml-review-section');
  var xmlReviewTbody = document.getElementById('xml-review-tbody');
  var xmlReviewRows = [];
  var XML_MAX_SIZE_BYTES = 5 * 1024 * 1024;
  var xmlProcessTimer = null;

  function setXmlStatus(kind, text) {
    // kind: '' (esconde) | 'loading' | 'error'
    xmlFileStatusEl.hidden = !kind;
    xmlFileStatusEl.className = 'novo-estoque-xml-status' + (kind ? ' is-' + kind : '');
    xmlFileStatusEl.innerHTML = kind === 'loading'
      ? '<i data-lucide="loader-2" width="14" height="14" class="novo-estoque-xml-status-spin"></i> ' + text
      : (kind === 'error' ? '<i data-lucide="circle-x" width="14" height="14"></i> ' + text : '');
    if (kind && window.lucide) lucide.createIcons();
  }

  function renderXmlReviewRows() {
    xmlReviewTbody.innerHTML = xmlReviewRows.map(function (row, index) {
      return '<tr class="tr">' +
        '<td class="td">' + row.produto + '</td>' +
        '<td class="td">' + row.quantidade + '</td>' +
        '<td class="td">' + row.unidade + '</td>' +
        '<td class="td tdActions"><button type="button" class="actionBtn" data-remove-index="' + index + '" aria-label="Remover produto"><i data-lucide="trash-2" width="16" height="16"></i></button></td>' +
        '</tr>';
    }).join('');
    if (window.lucide) lucide.createIcons();
  }

  function processXmlFile(file) {
    // Conferência mockada — sempre os 3 primeiros produtos do catálogo
    // central, só pra demonstrar o fluxo de "conferir antes de confirmar".
    // Processamento automático, sem botão: dispara sozinho ao selecionar
    // o arquivo (ver listener de `change` abaixo).
    setXmlStatus('loading', 'Processando ' + file.name + '...');
    xmlReviewSection.hidden = true;
    clearTimeout(xmlProcessTimer);
    xmlProcessTimer = setTimeout(function () {
      var sample = window.NiveloProdutos.list().slice(0, 3);
      xmlReviewRows = sample.map(function (p) {
        return { produto: p.nome, quantidade: 100, unidade: p.unidade };
      });
      renderXmlReviewRows();
      xmlReviewSection.hidden = false;
      produtoXmlBlock.classList.remove('error');
      setXmlStatus('', '');
    }, 700);
  }

  xmlFileInput.addEventListener('change', function () {
    var file = xmlFileInput.files[0];
    clearTimeout(xmlProcessTimer);
    xmlReviewSection.hidden = true;
    xmlReviewRows = [];
    produtoXmlBlock.classList.remove('error');

    if (!file) {
      xmlFileNameEl.textContent = 'Selecionar arquivo XML';
      setXmlStatus('', '');
      return;
    }

    xmlFileNameEl.textContent = file.name;

    if (file.size > XML_MAX_SIZE_BYTES) {
      setXmlStatus('error', 'Arquivo muito pesado (máximo 5 MB).');
      return;
    }

    processXmlFile(file);
  });

  xmlReviewTbody.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-remove-index]');
    if (!btn) return;
    xmlReviewRows.splice(Number(btn.dataset.removeIndex), 1);
    renderXmlReviewRows();
  });

  // ---------- Data prevista de entrega: padrão oficial de calendário do
  // sistema (dia único), ver app/shared/date-picker.js. ----------
  window.NiveloDatePicker.initDay({
    rootId: 'data-entrega-field',
    triggerId: 'data-entrega-trigger',
    valueId: 'data-entrega-value',
    hiddenInputId: 'ne-data-entrega',
    popoverId: 'data-entrega-popover',
    placeholder: 'Selecionar data'
  });

  // ---------- Quantidade: erro some ao digitar um valor válido ----------
  var quantidadeField = document.getElementById('quantidade-field');
  var quantidadeInput = document.getElementById('ne-quantidade');
  quantidadeInput.addEventListener('input', function () {
    if (quantidadeField.classList.contains('error') && Number(quantidadeInput.value) > 0) {
      quantidadeField.classList.remove('error');
    }
  });

  // ---------- Destinatário: erro some ao preencher ----------
  var destinatarioInput = document.getElementById('ne-destinatario');
  destinatarioInput.addEventListener('input', function () {
    if (destinatarioField.classList.contains('error') && destinatarioInput.value.trim()) {
      destinatarioField.classList.remove('error');
    }
  });

  // ---------- Validação + envio ----------
  var form = document.getElementById('novo-estoque-form');

  function runValidation() {
    var tipo = document.getElementById('tipo-estoque-field').dataset.value || 'vendas';
    var isXml = getFormaEntrada() === 'xml';

    if (isXml) {
      var xmlInvalid = xmlReviewRows.length === 0;
      produtoXmlBlock.classList.toggle('error', xmlInvalid);
      return !xmlInvalid;
    }
    produtoXmlBlock.classList.remove('error');

    var produtoInvalid = !selectedProduct;
    produtoField.classList.toggle('error', produtoInvalid);

    var quantidadeInvalid = !(Number(quantidadeInput.value) > 0);
    quantidadeField.classList.toggle('error', quantidadeInvalid);

    var destinatarioInvalid = tipo === 'comprometido' && !destinatarioInput.value.trim();
    destinatarioField.classList.toggle('error', destinatarioInvalid);

    return !produtoInvalid && !quantidadeInvalid && !destinatarioInvalid;
  }

  var TIPO_TOAST = {
    vendas: 'Entrada registrada no Estoque de Vendas.',
    compras: 'Entrada registrada no Estoque de Uso.',
    comprometido: 'Compromisso registrado no Estoque Comprometido.'
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error, .novo-estoque-xml-block.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var tipo = document.getElementById('tipo-estoque-field').dataset.value || 'vendas';
    var isXml = getFormaEntrada() === 'xml';
    var message = isXml
      ? (xmlReviewRows.length + (xmlReviewRows.length === 1 ? ' produto importado com sucesso.' : ' produtos importados com sucesso.'))
      : (TIPO_TOAST[tipo] || TIPO_TOAST.vendas);

    // Sugestão de Conta a Pagar: só existe pra Estoque de Uso (Manual, não
    // XML) — em vez de decidir isso ANTES de salvar (checkbox dentro do
    // formulário), a pergunta abre num modal DEPOIS que o registro já foi
    // confirmado, contextual à compra que o usuário acabou de concluir. "Sem
    // backend neste protótipo" continua valendo: a linha em si nunca é
    // injetada na tabela mockada (ver rules.md).
    if (tipo === 'compras' && !isXml) {
      criarContaPagarOverlay.hidden = false;
      var confirmHandler = function () {
        if (!validateContaPagarModal()) return;
        var formaCodigo = cpFormaField.dataset.value;
        var formaNome = cpFormaField.querySelector('[data-dropdown-value]').textContent;
        var categoriaCodigo = cpCategoriaField.dataset.value;
        var quantidadeLancada = Number(quantidadeInput.value);
        var valorTotal = Math.round((valorUnitarioCentavos / 100) * quantidadeLancada * 100) / 100;
        var fornecedorNome = fornecedorInput.value.trim();

        window.NiveloContasPagar.add({
          fornecedorCodigo: null,
          fornecedorNome: fornecedorNome || 'Fornecedor não informado',
          fornecedorDocumento: null,
          formaPagamentoCodigo: formaCodigo,
          formaPagamentoNome: formaNome,
          vencimento: cpVencimentoInput.value,
          dataEmissao: dataLancamentoInput.value,
          valor: valorTotal,
          numeroDocumento: null,
          historico: 'Compra de ' + selectedProduct.nome + ' (' + quantidadeLancada + ' ' + selectedProduct.unidade + ')',
          categoriaCodigo: categoriaCodigo,
          competencia: null,
          ocorrencia: 'unica',
          diaVencimento: null
        });
        cleanup();
        redirectAfterSave(tipo, message + ' Conta a pagar criada.');
      };
      var skipHandler = function () {
        cleanup();
        redirectAfterSave(tipo, message);
      };
      function cleanup() {
        closeContaPagarModal();
        criarContaPagarConfirmBtn.removeEventListener('click', confirmHandler);
        criarContaPagarSkipBtn.removeEventListener('click', skipHandler);
        criarContaPagarSkipXBtn.removeEventListener('click', skipHandler);
      }
      criarContaPagarConfirmBtn.addEventListener('click', confirmHandler);
      criarContaPagarSkipBtn.addEventListener('click', skipHandler);
      criarContaPagarSkipXBtn.addEventListener('click', skipHandler);
      return;
    }

    // Sem backend neste protótipo: "salvar" volta pra listagem já mostrando
    // o toast de sucesso correspondente e com a aba do tipo lançado já
    // selecionada (mesmo mecanismo de flag em `sessionStorage` já usado em
    // novo-cadastro.js) — este formulário só cria o lançamento inicial, não
    // injeta a linha na tabela mockada (ver rules.md, "não misturar Novo
    // Lançamento com Movimentações futuras").
    redirectAfterSave(tipo, message);
  });

  var criarContaPagarConfirmBtn = document.getElementById('criar-conta-pagar-confirm');
  var criarContaPagarSkipBtn = document.getElementById('criar-conta-pagar-skip');
  var criarContaPagarSkipXBtn = document.getElementById('criar-conta-pagar-skip-x');

  // ---------- Estados de demonstração (#state=) — XML: carregando/erro/
  // muito pesado, pré-renderizados sem precisar selecionar um arquivo de
  // verdade (mesmo mecanismo `#state=` já usado em novo-cadastro.js). ----------
  var xmlStateMatch = location.hash.match(/state=([a-z-]+)/);
  var xmlDemoState = xmlStateMatch ? xmlStateMatch[1] : null;
  if (xmlDemoState === 'xml-carregando' || xmlDemoState === 'xml-erro' || xmlDemoState === 'xml-pesado') {
    var xmlRadio = document.querySelector('input[name="forma-entrada"][value="xml"]');
    xmlRadio.checked = true;
    var compraOption = document.querySelector('#tipo-estoque-field .option[data-value="compras"]');
    if (compraOption) tipoDropdown.selectOption(compraOption);
    syncFormaEntradaChecked();
    refreshFormaEntradaVisibility();
    xmlFileNameEl.textContent = 'nota-fiscal-eletronica.xml';
    if (xmlDemoState === 'xml-carregando') setXmlStatus('loading', 'Processando nota-fiscal-eletronica.xml...');
    if (xmlDemoState === 'xml-erro') setXmlStatus('error', 'Não foi possível processar o arquivo. Tente novamente.');
    if (xmlDemoState === 'xml-pesado') setXmlStatus('error', 'Arquivo muito pesado (máximo 5 MB).');
  }

  // ---------- Estado de demonstração (#state=contapagar) — preenche um
  // Compras/Manual válido e envia de verdade (mesmo `form.dispatchEvent`),
  // só pra abrir o modal "Criar conta a pagar?" direto no load, sem
  // precisar digitar nada. Só pro prototype-nav, nunca alcançado pela
  // navegação normal do usuário. ----------
  if (xmlDemoState === 'contapagar') {
    var contapagarOption = document.querySelector('#tipo-estoque-field .option[data-value="compras"]');
    if (contapagarOption) tipoDropdown.selectOption(contapagarOption);
    var produtoDemo = window.NiveloProdutos.list()[0];
    if (produtoDemo) selectProduct(produtoDemo);
    quantidadeInput.value = '10';
    valorUnitarioInput.value = '5000';
    valorUnitarioInput.dispatchEvent(new Event('input', { bubbles: true }));
    fornecedorInput.value = 'Insumos Agrícolas Vale Ltda';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
})();
