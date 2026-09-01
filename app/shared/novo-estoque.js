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

    // Usado só pelo dropdown dependente de Talhão (Origem da entrada,
    // Vendas) — mesma técnica de `reset()` já usada em
    // registrar-entrada-estoque-v2.js pro mesmo par Fazenda→Talhão.
    function reset(placeholder) {
      root.dataset.value = '';
      valueEl.textContent = placeholder;
      valueEl.classList.add('placeholder');
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
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

    return { selectOption: selectOption, reset: reset, root: root, trigger: trigger };
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

  // ---------- Tipo de estoque (Estoque de Vendas / Estoque de Uso) ----------
  // Dirige quais campos aparecem na seção "Produto" e se o card "Origem da
  // entrada" é exibido — ver rules.md pra tabela completa de campo × tipo.
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  var fornecedorField = document.getElementById('fornecedor-field');
  var notaDocumentoField = document.getElementById('nota-documento-field');
  var precoAtualField = document.getElementById('preco-atual-field');
  var origemEntradaSection = document.getElementById('origem-entrada-section');
  var dataLancamentoField = document.getElementById('data-lancamento-field');
  var dataLancamentoInput = document.getElementById('ne-data-lancamento');
  var destinatarioField = document.getElementById('destinatario-field');
  var destinatarioInput = document.getElementById('ne-destinatario');
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

  // ---------- Data prevista de entrega (só Estoque Comprometido): mesmo
  // padrão oficial de calendário do sistema (dia único), opcional — nunca
  // recebe um `setValue()` inicial, fica em "Selecionar data" até o usuário
  // escolher. ----------
  var dataEntregaPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-entrega-field',
    triggerId: 'data-entrega-trigger',
    valueId: 'data-entrega-value',
    hiddenInputId: 'ne-data-entrega',
    popoverId: 'data-entrega-popover',
    placeholder: 'Selecionar data'
  });

  var depositoField = document.getElementById('deposito-field');
  var formaEntradaField = document.getElementById('forma-entrada-field');
  var formaEntradaRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="forma-entrada"]'));
  var valorUnitarioField = document.getElementById('valor-unitario-field');
  var produtoXmlBlock = document.getElementById('produto-xml-block');
  var produtoManualBlock = document.getElementById('produto-manual-block');

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

  // ---------- Preço atual (Estoque de Vendas): mesma técnica de máscara,
  // semântica diferente (preço de mercado/gerencial, não custo pago).
  //
  // Nota para desenvolvimento: "Valor pago" (Estoque de Uso, campo
  // `#ne-valor-unitario` acima) representa o preço efetivamente PAGO nesta
  // entrada — alimenta, numa rodada futura, o histórico de custo/cálculo de
  // custo médio do produto. "Preço atual" (Estoque de Vendas, campo abaixo)
  // representa o preço ATUAL/de mercado do produto — mesma lógica gerencial
  // já usada na precificação real de Vendas. Os dois usam a mesma máscara de
  // moeda, mas são conceitualmente distintos; nenhum dos dois é enviado a
  // nenhum módulo real nesta rodada (formulário continua só cosmético). ----------
  var precoAtualInput = document.getElementById('ne-preco-atual');
  var precoAtualCentavos = 0;
  precoAtualInput.addEventListener('input', function () {
    var digits = precoAtualInput.value.replace(/\D/g, '');
    precoAtualCentavos = digits ? Number(digits) : 0;
    precoAtualInput.value = precoAtualCentavos ? formatCentavosBRL(precoAtualCentavos) : '';
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

  // ---------- Tipo de estoque: cartões de seleção (radio nativo), só 2
  // opções (vendas/compras — Estoque Comprometido foi removido desta
  // rodada). Mesma técnica de `.is-selected`+RadioButton já usada em
  // "Origem da entrada" (registrar-entrada-estoque-v2.js) e "Forma de
  // entrada" logo abaixo. Valor interno "compras" preservado (não virou
  // "uso") só pra não quebrar o contrato de hash `estoque.html#tab=compras`
  // já lido por estoque.js — a mudança é só de rótulo visível
  // ("Estoque de uso"). ----------
  var tipoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-estoque"]'));

  function currentTipo() {
    var checked = tipoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'vendas';
  }

  function syncTipoChecked() {
    tipoRadios.forEach(function (radio) {
      var cardEl = radio.closest('.novo-estoque-tipo-card');
      if (cardEl) cardEl.classList.toggle('is-selected', radio.checked);
    });
  }

  function applyTipo(tipo) {
    var isComprometido = tipo === 'comprometido';
    fornecedorField.hidden = tipo !== 'compras';
    valorUnitarioField.hidden = tipo !== 'compras';
    notaDocumentoField.hidden = tipo !== 'compras';
    precoAtualField.hidden = tipo !== 'vendas';
    origemEntradaSection.hidden = tipo !== 'vendas';
    destinatarioField.hidden = !isComprometido;
    dataEntregaField.hidden = !isComprometido;
    if (!isComprometido) destinatarioField.classList.remove('error');
    // `unidadeMedidaField` é declarado mais abaixo neste arquivo (seção
    // Produto) — a 1ª chamada de `applyTipo('vendas')` acontece ANTES dessa
    // declaração (hoisting: a var existe, mas ainda `undefined`), por isso o
    // guard `typeof` aqui, em vez de assumir que já está pronto.
    if (typeof unidadeMedidaField !== 'undefined' && unidadeMedidaField) {
      unidadeMedidaField.hidden = isComprometido;
    }
  }

  tipoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncTipoChecked();
      applyTipo(currentTipo());
    });
  });
  syncTipoChecked();

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
  // (window.NiveloLocais), restrito aos depósitos pré-cadastrados e ATIVOS
  // (`d.ativo`) — sem cadastro rápido inline nesta tela (override explícito
  // do usuário sobre a decisão da rodada anterior, que tinha mantido o
  // quick-create aqui por classificar esta tela como "V1-equivalente"; agora
  // esta tela segue a mesma regra das telas V2, ver `depositos.html`). Sem
  // nenhum depósito ativo, o Dropdown fica sem opções selecionáveis (nem um
  // placeholder desabilitado que pareça uma opção válida) e um helper text
  // orienta o usuário a cadastrar um em Configurações. ----------
  var depositoMenu = document.getElementById('deposito-menu');
  var depositoTrigger = depositoField.querySelector('[data-dropdown-trigger]');
  var depositoEmptyHelper = document.getElementById('deposito-empty-helper');

  function renderLocalOptions() {
    var ativos = window.NiveloLocais.list().filter(function (local) { return local.ativo; });
    depositoMenu.innerHTML = ativos.map(function (local) {
      return '<div class="option" data-value="' + local.nome + '">' + local.nome + '</div>';
    }).join('');
    depositoEmptyHelper.hidden = ativos.length > 0;
    depositoTrigger.disabled = ativos.length === 0;
  }
  renderLocalOptions();

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

  // ---------- Unidade de medida do lançamento (Vendas/Uso): no máximo 2
  // opções — a sigla própria do produto (`produto.unidadeMedida`) +, quando
  // existir conversão registrada (`getConversao()`), a unidade base
  // correspondente. Nunca uma 3ª opção, nunca texto livre. Se o produto não
  // tem `unidadeMedida` (legado/quick-create anterior a este fix, ou
  // Calcário/Fungicida — só existem em estoque-uso-v2-data.js), resolve a
  // sigla a partir do nome legado `unidade` (mesma técnica de
  // `siglaFromUnidadeNome()` já usada em estoque-v2.js). ----------
  var LEGACY_UNIDADE_SIGLA = { Saca: 'SC', Kg: 'KG', Litro: 'LT', Unidade: 'UN' };

  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  function resolveSiglaForProduct(product) {
    if (!product) return null;
    if (product.unidadeMedida) return product.unidadeMedida;
    return LEGACY_UNIDADE_SIGLA[product.unidade] || null;
  }

  var unidadeMedidaField = document.getElementById('unidade-medida-field');
  var unidadeMedidaTrigger = unidadeMedidaField.querySelector('[data-dropdown-trigger]');
  var unidadeMedidaValueEl = unidadeMedidaField.querySelector('[data-dropdown-value]');
  var unidadeMedidaMenu = document.getElementById('unidade-medida-menu');
  var unidadeMedidaDropdown = initDropdown(unidadeMedidaField);

  function updateUnidadeMedidaOptions() {
    var sigla = resolveSiglaForProduct(selectedProduct);
    if (!sigla) {
      unidadeMedidaTrigger.disabled = true;
      unidadeMedidaMenu.innerHTML = '';
      unidadeMedidaField.dataset.value = '';
      unidadeMedidaValueEl.textContent = 'Selecione um produto';
      unidadeMedidaValueEl.classList.add('placeholder');
      return;
    }
    var propria = window.NiveloUnidadesMedida.findBySigla(sigla);
    var options = [{ sigla: sigla, nome: propria ? propria.nome : sigla }];
    var conversao = getConversao(sigla);
    if (conversao) {
      var base = window.NiveloUnidadesMedida.findBySigla(conversao.unidadeBaseSigla);
      options.push({ sigla: conversao.unidadeBaseSigla, nome: base ? base.nome : conversao.unidadeBaseSigla });
    }
    unidadeMedidaMenu.innerHTML = options.map(function (o) {
      return '<div class="option" data-value="' + o.sigla + '">' + o.nome + ' (' + o.sigla + ')</div>';
    }).join('');
    unidadeMedidaTrigger.disabled = false;
    unidadeMedidaDropdown.selectOption(unidadeMedidaMenu.querySelector('.option'));
  }
  updateUnidadeMedidaOptions();

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
    updateUnidadeMedidaOptions();
  }

  function clearSelectedProduct() {
    selectedProduct = null;
    unidadeInput.value = '';
    codigoReferenciaInput.value = '';
    updateUnidadeMedidaOptions();
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

    // Fix desta rodada: além da unidade legada (nome livre), grava também a
    // sigla V2 (`unidadeMedida`) correspondente, mapeada a partir da mesma
    // opção escolhida aqui — sem isso, um produto recém-criado por este
    // painel nunca teria opções no novo Dropdown de Unidade de medida do
    // lançamento (fica só com `.unidade`, sem `.unidadeMedida`).
    var product = window.NiveloProdutos.add({
      nome: nome,
      unidade: unidade,
      unidadeMedida: LEGACY_UNIDADE_SIGLA[unidade] || '',
      sku: novoProdutoSkuInput.value.trim()
    });
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

  // ---------- Quantidade: erro some ao digitar um valor válido ----------
  var quantidadeField = document.getElementById('quantidade-field');
  var quantidadeInput = document.getElementById('ne-quantidade');
  quantidadeInput.addEventListener('input', function () {
    if (quantidadeField.classList.contains('error') && Number(quantidadeInput.value) > 0) {
      quantidadeField.classList.remove('error');
    }
  });

  // ---------- Destinatário (só Estoque Comprometido): erro some ao digitar ----------
  destinatarioInput.addEventListener('input', function () {
    if (destinatarioField.classList.contains('error') && destinatarioInput.value.trim()) {
      destinatarioField.classList.remove('error');
    }
  });

  // ---------- Origem da entrada (só Estoque de Vendas) — estrutura/
  // comportamento copiados verbatim de registrar-entrada-estoque-v2.js
  // (cartões Produção própria/Colheita × Compra de terceiro, Fazenda→Talhão
  // dependente, Safra, Fornecedor+dropzone+Preço de compra+Valor total).
  // Cosmético/validado como o resto do formulário: nunca chama
  // NiveloEstoqueVendasV2 (mesmo contrato de "sem persistência real" já
  // documentado no topo do arquivo). ----------
  var origemInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="ne-origem-entrada"]'));
  var origemProducaoBlock = document.getElementById('ne-origem-producao-block');
  var origemCompraBlock = document.getElementById('ne-origem-compra-block');
  var origemFazendaField = document.getElementById('ne-origem-fazenda-field');
  var origemFazendaMenu = document.getElementById('ne-origem-fazenda-menu');
  var origemTalhaoField = document.getElementById('ne-origem-talhao-field');
  var origemTalhaoMenu = document.getElementById('ne-origem-talhao-menu');
  var origemSafraField = document.getElementById('ne-origem-safra-field');
  var origemSafraMenu = document.getElementById('ne-origem-safra-menu');
  var origemFornecedorField = document.getElementById('ne-origem-fornecedor-field');
  var origemFornecedorMenu = document.getElementById('ne-origem-fornecedor-menu');
  var origemArquivoInput = document.getElementById('ne-origem-arquivo-input');
  var origemArquivoNomeEl = document.getElementById('ne-origem-arquivo-nome');
  var origemPrecoCompraInput = document.getElementById('ne-origem-preco-compra-input');
  var origemValorTotalInput = document.getElementById('ne-origem-valor-total-input');
  var origemPrecoCompraCentavos = 0;

  function currentOrigemEntrada() {
    var checked = origemInputs.filter(function (i) { return i.checked; })[0];
    return checked ? checked.value : 'producao';
  }

  function updateOrigemBlocks() {
    var origem = currentOrigemEntrada();
    origemInputs.forEach(function (input) {
      input.closest('.entradav2-origem-card').classList.toggle('is-selected', input.checked);
    });
    var isProducao = origem === 'producao';
    origemProducaoBlock.hidden = !isProducao;
    origemCompraBlock.hidden = isProducao;
    if (isProducao) {
      origemFornecedorField.classList.remove('error');
    } else {
      origemFazendaField.classList.remove('error');
      origemTalhaoField.classList.remove('error');
    }
  }
  origemInputs.forEach(function (input) { input.addEventListener('change', updateOrigemBlocks); });
  updateOrigemBlocks();

  origemFazendaMenu.innerHTML = window.NiveloFazendas.list().map(function (f) {
    return '<div class="option" data-value="' + f.id + '">' + f.nome + '</div>';
  }).join('');

  function findOrigemFazenda(id) {
    return window.NiveloFazendas.list().filter(function (f) { return f.id === id; })[0] || null;
  }

  function populateOrigemTalhoes(fazenda) {
    var talhoes = fazenda ? fazenda.talhoes : [];
    origemTalhaoMenu.innerHTML = talhoes.map(function (t) {
      return '<div class="option" data-value="' + t.id + '">' + t.nome + '</div>';
    }).join('');
    origemTalhaoDropdown.trigger.disabled = !fazenda;
    origemTalhaoDropdown.reset(fazenda ? 'Selecione o talhão' : 'Selecione a fazenda primeiro');
  }

  var origemTalhaoDropdown = initDropdown(origemTalhaoField, function () {
    origemTalhaoField.classList.remove('error');
  });
  var origemFazendaDropdown = initDropdown(origemFazendaField, function (fazendaId) {
    origemFazendaField.classList.remove('error');
    populateOrigemTalhoes(findOrigemFazenda(fazendaId));
  });
  populateOrigemTalhoes(null);

  origemSafraMenu.innerHTML = window.NiveloSafras.list().map(function (s) {
    return '<div class="option" data-value="' + s + '">' + s + '</div>';
  }).join('');
  initDropdown(origemSafraField);

  window.NiveloCadastros.findByTipo('fornecedor').forEach(function (c) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = c.nome;
    optionEl.textContent = c.nome;
    origemFornecedorMenu.appendChild(optionEl);
  });
  initDropdown(origemFornecedorField, function () {
    origemFornecedorField.classList.remove('error');
  });

  origemArquivoInput.addEventListener('change', function () {
    var file = origemArquivoInput.files && origemArquivoInput.files[0];
    origemArquivoNomeEl.textContent = file ? file.name : 'Anexar nota/documento (opcional)';
  });

  function updateOrigemValorTotal() {
    var quantidade = Number(quantidadeInput.value) || 0;
    var preco = origemPrecoCompraCentavos / 100;
    origemValorTotalInput.value = formatCentavosBRL(Math.round(quantidade * preco * 100));
  }
  origemPrecoCompraInput.addEventListener('input', function () {
    var digits = origemPrecoCompraInput.value.replace(/\D/g, '');
    origemPrecoCompraCentavos = digits ? Number(digits) : 0;
    origemPrecoCompraInput.value = origemPrecoCompraCentavos ? formatCentavosBRL(origemPrecoCompraCentavos) : '';
    updateOrigemValorTotal();
  });
  quantidadeInput.addEventListener('input', updateOrigemValorTotal);

  // ---------- Validação + envio ----------
  var form = document.getElementById('novo-estoque-form');

  function runValidation() {
    var tipo = currentTipo();
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

    var destinatarioInvalid = false;
    if (tipo === 'comprometido') {
      destinatarioInvalid = !destinatarioInput.value.trim();
      destinatarioField.classList.toggle('error', destinatarioInvalid);
    }

    var origemInvalid = false;
    if (tipo === 'vendas') {
      var origem = currentOrigemEntrada();
      if (origem === 'producao') {
        var fazendaInvalid = !origemFazendaField.dataset.value;
        origemFazendaField.classList.toggle('error', fazendaInvalid);
        var talhaoInvalid = !origemTalhaoField.dataset.value;
        origemTalhaoField.classList.toggle('error', talhaoInvalid);
        origemInvalid = fazendaInvalid || talhaoInvalid;
      } else {
        var fornecedorInvalid = !origemFornecedorField.dataset.value;
        origemFornecedorField.classList.toggle('error', fornecedorInvalid);
        origemInvalid = fornecedorInvalid;
      }
    }

    return !produtoInvalid && !quantidadeInvalid && !destinatarioInvalid && !origemInvalid;
  }

  var TIPO_TOAST = {
    vendas: 'Entrada registrada no Estoque de Vendas.',
    compras: 'Entrada registrada no Estoque de Uso.',
    comprometido: 'Compromisso registrado no Estoque Comprometido.'
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error, .novo-estoque-xml-block.error, .entradav2-origem-block .wrapper.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var tipo = currentTipo();
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
    var compraRadio = document.querySelector('input[name="tipo-estoque"][value="compras"]');
    if (compraRadio) { compraRadio.checked = true; syncTipoChecked(); applyTipo('compras'); }
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
    var contapagarRadio = document.querySelector('input[name="tipo-estoque"][value="compras"]');
    if (contapagarRadio) { contapagarRadio.checked = true; syncTipoChecked(); applyTipo('compras'); }
    var produtoDemo = window.NiveloProdutos.list()[0];
    if (produtoDemo) selectProduct(produtoDemo);
    quantidadeInput.value = '10';
    valorUnitarioInput.value = '5000';
    valorUnitarioInput.dispatchEvent(new Event('input', { bubbles: true }));
    fornecedorInput.value = 'Insumos Agrícolas Vale Ltda';
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }
})();
