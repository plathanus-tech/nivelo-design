(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema, cópia
  // verbatim de nova-conta-pagar.js/novo-lancamento-caixa.js). ----------
  function initDropdown(root, onChange) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');
    var placeholderText = valueEl.textContent;

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
      if (root.classList.contains('is-readonly') || trigger.disabled) return;
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

    function clear() {
      root.dataset.value = '';
      valueEl.textContent = placeholderText;
      valueEl.classList.add('placeholder');
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
    }

    function setEnabled(enabled, disabledPlaceholderText) {
      trigger.disabled = !enabled;
      clear();
      if (!enabled && disabledPlaceholderText) valueEl.textContent = disabledPlaceholderText;
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

    return { selectOption: selectOption, selectValue: selectValue, clear: clear, setEnabled: setEnabled, root: root };
  }

  // ---------- Máscara de moeda (mesma técnica de formatCentavosBRL já
  // usada em Estoque/Caixa/Nova Conta a Pagar). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }
  function bindMoneyInput(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      input.dataset.cents = digitsToCents(digits);
      input.value = formatCentavosBRL(digitsToCents(digits));
      recalcularValores();
    });
  }
  function moneyCents(input) { return Number(input.dataset.cents || 0); }

  // ---------- Unidades (mesma tabela legado já usada em novo-produto.js
  // — nunca amarrada aos labels; se o vocabulário mudar lá, só este mapa
  // precisa mudar aqui). ----------
  var UNIDADE_LABELS = { CX: 'Caixa', UN: 'Unidade', KG: 'Kg', LT: 'Litro', PT: 'Pacote', FR: 'Fardo', SC: 'Saco' };

  // ================= Campos =================
  var form = document.getElementById('npv-form');
  var pageTitleEl = document.getElementById('npv-page-title');
  var pageSubtitleEl = document.getElementById('npv-page-subtitle');

  // Operação
  var naturezaField = document.getElementById('natureza-field');
  var naturezaMenu = document.getElementById('natureza-menu');
  var clienteField = document.getElementById('cliente-field');
  var clienteMenu = document.getElementById('cliente-menu');
  var clienteInfo = document.getElementById('npv-cliente-info');

  var dataPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-field', triggerId: 'data-trigger', valueId: 'data-value',
    hiddenInputId: 'npv-data', popoverId: 'data-popover', placeholder: 'Selecionar data'
  });
  dataPicker.setValue(new Date().toISOString().slice(0, 10));

  window.NiveloNaturezasOperacao.list().filter(function (n) { return n.tipo === 'saida' && n.ativo; }).forEach(function (natureza) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = natureza.codigo;
    optionEl.textContent = natureza.descricao;
    naturezaMenu.appendChild(optionEl);
  });
  var naturezaDropdown = initDropdown(naturezaField);

  var CLIENTES = window.NiveloCadastros.findByTipo('cliente');
  CLIENTES.forEach(function (cliente) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = cliente.codigo;
    optionEl.textContent = cliente.nome + ' — ' + cliente.documento;
    clienteMenu.appendChild(optionEl);
  });
  function findClienteByCodigo(codigo) {
    return CLIENTES.filter(function (c) { return c.codigo === codigo; })[0] || null;
  }
  var clienteDropdown = initDropdown(clienteField, function (codigo) {
    var cliente = findClienteByCodigo(codigo);
    if (!cliente) { clienteInfo.hidden = true; return; }
    document.getElementById('npv-cliente-documento').textContent = cliente.documento || '—';
    document.getElementById('npv-cliente-ie').textContent = cliente.inscricaoEstadual || '—';
    document.getElementById('npv-cliente-telefone').textContent = cliente.telefone || '—';
    document.getElementById('npv-cliente-endereco').textContent = cliente.endereco || cliente.cidade || '—';
    clienteInfo.hidden = false;
  });

  // ---------- Modalidade de venda ----------
  var modalidadeRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="modalidade"]'));
  function syncRadioChecked(radios) {
    radios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }
  syncRadioChecked(modalidadeRadios);
  function getModalidade() {
    var checked = modalidadeRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'estoque';
  }

  var produtoCardTitle = document.getElementById('npv-produto-card-title');
  var depositoField = document.getElementById('deposito-field');
  var depositoMenu = document.getElementById('deposito-menu');
  var saldoInput = document.getElementById('npv-saldo');

  var depositoDropdown = initDropdown(depositoField, function () { atualizarSaldo(); });
  var depositoTrigger = depositoField.querySelector('[data-dropdown-trigger]');
  var depositoValueEl = depositoField.querySelector('[data-dropdown-value]');

  // ---------- Depósito: opções vêm do catálogo compartilhado
  // (window.NiveloLocais, o MESMO já usado por "Depósito" em Novo registo
  // de estoque) + item fixo "+ Adicionar novo depósito", que abre o mesmo
  // fluxo de modal já usado lá — reaproveitado, não recriado. ----------
  function renderDepositoOptions() {
    var html = window.NiveloLocais.list().map(function (local) {
      return '<div class="option" data-value="' + local.nome + '">' + local.nome + '</div>';
    }).join('');
    html += '<div class="npv-deposito-create-option" data-add-deposito>' +
      '<i data-lucide="plus" width="14" height="14"></i> Adicionar novo depósito</div>';
    depositoMenu.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
  renderDepositoOptions();

  var novoDepositoOverlay = document.getElementById('npv-novo-deposito-overlay');
  var novoDepositoNomeInput = document.getElementById('npv-novo-deposito-nome');
  var novoDepositoNomeField = document.getElementById('npv-novo-deposito-nome-field');

  function openNovoDepositoDialog() {
    depositoField.classList.remove('open');
    novoDepositoNomeInput.value = '';
    novoDepositoNomeField.classList.remove('error');
    novoDepositoOverlay.hidden = false;
    novoDepositoNomeInput.focus();
  }
  function closeNovoDepositoDialog() { novoDepositoOverlay.hidden = true; }

  depositoMenu.addEventListener('click', function (event) {
    if (event.target.closest('[data-add-deposito]')) openNovoDepositoDialog();
  });
  document.getElementById('npv-novo-deposito-close').addEventListener('click', closeNovoDepositoDialog);
  document.getElementById('npv-novo-deposito-cancel').addEventListener('click', closeNovoDepositoDialog);
  novoDepositoOverlay.addEventListener('click', function (event) { if (event.target === novoDepositoOverlay) closeNovoDepositoDialog(); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !novoDepositoOverlay.hidden) closeNovoDepositoDialog(); });
  document.getElementById('npv-novo-deposito-add').addEventListener('click', function () {
    var nome = novoDepositoNomeInput.value.trim();
    novoDepositoNomeField.classList.toggle('error', !nome);
    if (!nome) return;

    window.NiveloLocais.add(nome);
    renderDepositoOptions();
    var addedOption = depositoMenu.querySelector('.option[data-value="' + nome + '"]');
    if (addedOption) addedOption.classList.add('selected');
    depositoValueEl.textContent = nome;
    depositoValueEl.classList.remove('placeholder');
    depositoField.dataset.value = nome;
    depositoField.classList.remove('error');
    closeNovoDepositoDialog();
    atualizarSaldo();
  });

  function refreshDepositoEnabled() {
    var podeEscolher = getModalidade() === 'estoque' && !!produtoField.dataset.value;
    depositoDropdown.setEnabled(podeEscolher, produtoField.dataset.value ? undefined : 'Selecione o produto primeiro');
  }

  function refreshModalidadeVisibility() {
    var isEstoque = getModalidade() === 'estoque';
    produtoCardTitle.textContent = isEstoque ? 'Produto e estoque' : 'Produto';
    pageSubtitleEl.textContent = isEstoque ? 'Venda com estoque disponível' : 'Venda para entrega futura, alimenta o Estoque Comprometido';
    depositoField.hidden = !isEstoque;
    document.getElementById('saldo-field').hidden = !isEstoque;
    refreshDepositoEnabled();
    if (!isEstoque) { saldoInput.value = '—'; }
    depositoField.classList.remove('error');
  }
  modalidadeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () { syncRadioChecked(modalidadeRadios); refreshModalidadeVisibility(); });
  });

  // ---------- Produto ----------
  var produtoField = document.getElementById('produto-field');
  var produtoMenu = document.getElementById('produto-menu');
  var unidadeField = document.getElementById('unidade-field');
  var unidadeMenu = document.getElementById('unidade-menu');
  var pesoInput = document.getElementById('npv-peso');

  var PRODUTOS_ATIVOS = window.NiveloProdutos.list().filter(function (p) { return p.status === 'ativo'; });
  PRODUTOS_ATIVOS.forEach(function (produto) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = produto.sku;
    optionEl.textContent = produto.nome;
    produtoMenu.appendChild(optionEl);
  });
  Object.keys(UNIDADE_LABELS).forEach(function (codigo) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = codigo;
    optionEl.textContent = UNIDADE_LABELS[codigo];
    unidadeMenu.appendChild(optionEl);
  });
  var unidadeDropdown = initDropdown(unidadeField, function () { recalcularValores(); });

  function findProdutoBySku(sku) {
    return PRODUTOS_ATIVOS.filter(function (p) { return p.sku === sku; })[0] || null;
  }

  var produtoDropdown = initDropdown(produtoField, function (sku) {
    var produto = findProdutoBySku(sku);
    saldoInput.value = '—';
    refreshDepositoEnabled();
    if (!produto) { pesoInput.value = '—'; recalcularValores(); return; }
    if (produto.unidadeMedida && unidadeMenu.querySelector('.option[data-value="' + produto.unidadeMedida + '"]')) {
      unidadeDropdown.selectValue(produto.unidadeMedida);
    }
    pesoInput.value = produto.pesoLiquido != null ? produto.pesoLiquido.toLocaleString('pt-BR') + ' kg' : '—';
    recalcularValores();
  });

  function atualizarSaldo() {
    var sku = produtoField.dataset.value;
    var depositoNome = depositoField.dataset.value;
    if (!sku || !depositoNome) { saldoInput.value = '—'; return; }
    var produto = findProdutoBySku(sku);
    var saldo = window.NiveloEstoqueSaldos.getSaldo(sku, depositoNome);
    saldoInput.value = saldo != null ? saldo.toLocaleString('pt-BR') + ' ' + (produto ? produto.unidade : '') : '—';
  }

  // ---------- Quantidade e Valor ----------
  var quantidadeInput = document.getElementById('npv-quantidade');
  var precoInput = document.getElementById('npv-preco');
  var descontoInput = document.getElementById('npv-desconto');
  var totalKgInput = document.getElementById('npv-total-kg');
  var valorBrutoInput = document.getElementById('npv-valor-bruto');
  var valorLiquidoInput = document.getElementById('npv-valor-liquido');
  var valorTotalPrazoInput = document.getElementById('npv-valor-total');

  bindMoneyInput(precoInput);
  bindMoneyInput(descontoInput);
  quantidadeInput.addEventListener('input', function () {
    quantidadeInput.value = quantidadeInput.value.replace(/[^\d.,]/g, '');
    recalcularValores();
  });

  function parseQuantidade() {
    var raw = quantidadeInput.value.replace(',', '.');
    var value = parseFloat(raw);
    return isNaN(value) ? 0 : value;
  }

  function recalcularValores() {
    var quantidade = parseQuantidade();
    var produto = findProdutoBySku(produtoField.dataset.value);
    var pesoPorUnidade = produto ? produto.pesoLiquido : null;
    var totalKg = pesoPorUnidade != null ? quantidade * pesoPorUnidade : null;
    totalKgInput.value = totalKg != null ? totalKg.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' kg' : '—';

    var precoCents = moneyCents(precoInput);
    var valorBrutoCents = Math.round(quantidade * precoCents);
    valorBrutoInput.value = formatCentavosBRL(valorBrutoCents);

    var descontoCents = moneyCents(descontoInput);
    var valorLiquidoCents = Math.max(0, valorBrutoCents - descontoCents);
    valorLiquidoInput.value = formatCentavosBRL(valorLiquidoCents);
    valorTotalPrazoInput.value = formatCentavosBRL(valorLiquidoCents);

    // Recalcular o valor total NÃO reconstrói as parcelas (perderia edição
    // manual do usuário) — só reavalia a validação da soma contra o novo
    // total, mesmo princípio de "sugestão inicial, soma sempre validada".
    if (getCondicaoPagamento() === 'prazo') updateParcelasValidation();
  }

  // ---------- Condição de pagamento ----------
  var condicaoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="condicao-pagamento"]'));
  syncRadioChecked(condicaoRadios);
  function getCondicaoPagamento() {
    var checked = condicaoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'avista';
  }

  var pagamentoAvistaBlock = document.getElementById('pagamento-avista-block');
  var pagamentoPrazoBlock = document.getElementById('pagamento-prazo-block');
  var parcelasList = document.getElementById('npv-parcelas-list');

  function refreshCondicaoVisibility() {
    var isAvista = getCondicaoPagamento() === 'avista';
    pagamentoAvistaBlock.hidden = !isAvista;
    pagamentoPrazoBlock.hidden = isAvista;
    parcelasList.hidden = isAvista;
    if (isAvista) { parcelasList.innerHTML = ''; document.getElementById('npv-parcelas-summary').hidden = true; }
    else renderParcelas();
  }
  condicaoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () { syncRadioChecked(condicaoRadios); refreshCondicaoVisibility(); });
  });

  var formaRecebimentoField = document.getElementById('forma-recebimento-field');
  var formaRecebimentoMenu = document.getElementById('forma-recebimento-menu');
  window.NiveloFormasCondicaoVenda.formasRecebimento().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaRecebimentoMenu.appendChild(optionEl);
  });
  var formaRecebimentoDropdown = initDropdown(formaRecebimentoField);

  var contaEntradaField = document.getElementById('conta-entrada-field');
  var contaEntradaMenu = document.getElementById('conta-entrada-menu');
  window.NiveloContasBancarias.list().forEach(function (conta) {
    var banco = window.NiveloBancosCatalogo.findByCodigo(conta.bancoCodigo);
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = conta.codigo;
    // Nome do banco + conta, sourced dos dados já cadastrados em Conta
    // bancária (nunca um campo novo) — "Banco do Brasil — Conta 12345-6".
    optionEl.textContent = (banco ? banco.nome : conta.descricao) + ' — Conta ' + conta.conta;
    contaEntradaMenu.appendChild(optionEl);
  });
  var contaEntradaDropdown = initDropdown(contaEntradaField);

  var dataRecebimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-recebimento-field', triggerId: 'data-recebimento-trigger', valueId: 'data-recebimento-value',
    hiddenInputId: 'npv-data-recebimento', popoverId: 'data-recebimento-popover', placeholder: 'Selecionar data'
  });
  dataRecebimentoPicker.setValue(new Date().toISOString().slice(0, 10));

  var formaCobrancaField = document.getElementById('forma-cobranca-field');
  var formaCobrancaMenu = document.getElementById('forma-cobranca-menu');
  window.NiveloFormasCondicaoVenda.formasCobranca().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    formaCobrancaMenu.appendChild(optionEl);
  });
  var formaCobrancaDropdown = initDropdown(formaCobrancaField);

  var numeroParcelasInput = document.getElementById('npv-numero-parcelas');
  numeroParcelasInput.addEventListener('input', function () {
    numeroParcelasInput.value = numeroParcelasInput.value.replace(/\D/g, '');
    renderParcelas();
  });

  function addMonthsISO(iso, months) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1 + months, parts[2]);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  var parcelaPickers = [];
  var parcelasSummary = document.getElementById('npv-parcelas-summary');
  var parcelasAlertText = document.getElementById('npv-parcelas-alert-text');

  function valorTotalPedidoCents() {
    var cents = moneyCents(precoInput) ? Math.round(parseQuantidade() * moneyCents(precoInput)) - moneyCents(descontoInput) : 0;
    return Math.max(0, cents);
  }

  // Card de cada parcela reaproveita o mesmo padrão visual já usado no
  // cadastro de veículos da transportadora (Novo Cadastro): card cinza
  // claro, cabeçalho com o título, campos abaixo. Valor nasce com uma
  // sugestão de divisão igual do total (resto na última parcela, mesmo
  // algoritmo já usado em Contas a Pagar/Receber), mas é editável — a
  // soma final é validada, não a divisão sugerida em si.
  function renderParcelas() {
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    parcelasList.hidden = getCondicaoPagamento() !== 'prazo' || n < 1;
    if (parcelasList.hidden) { parcelasList.innerHTML = ''; parcelaPickers = []; updateParcelasValidation(); return; }

    var totalCents = valorTotalPedidoCents();
    var baseCents = Math.floor(totalCents / n);
    var resto = totalCents - baseCents * n;
    var dataBase = document.getElementById('npv-data').value || new Date().toISOString().slice(0, 10);

    var html = '';
    for (var i = 1; i <= n; i++) {
      var valorParcelaCents = baseCents + (i === n ? resto : 0);
      html +=
        '<div class="card npv-parcela-card" data-index="' + i + '">' +
          '<div class="npv-parcela-header"><h3 class="npv-parcela-title text-subtitle-s">Parcela ' + i + '/' + n + '</h3></div>' +
          '<div class="npv-parcela-grid">' +
            '<div class="dpRoot" id="parcela-venc-field-' + i + '">' +
              '<label class="dpLabel" for="parcela-venc-trigger-' + i + '">Vencimento</label>' +
              '<button type="button" class="dpTrigger" id="parcela-venc-trigger-' + i + '">' +
                '<span class="dpTriggerIcon"><i data-lucide="calendar" width="16" height="16"></i></span>' +
                '<span class="dpPlaceholder" id="parcela-venc-value-' + i + '">Selecionar data</span>' +
              '</button>' +
              '<input type="hidden" id="parcela-venc-input-' + i + '" />' +
              '<div class="dpPopover" id="parcela-venc-popover-' + i + '" hidden>' +
                '<div class="dpCalendarHeader">' +
                  '<button type="button" class="dpNavBtn" data-dp-prev aria-label="Mês anterior"><i data-lucide="chevron-left" width="16" height="16"></i></button>' +
                  '<span class="dpCalendarLabel text-body-s" data-dp-label></span>' +
                  '<button type="button" class="dpNavBtn" data-dp-next aria-label="Próximo mês"><i data-lucide="chevron-right" width="16" height="16"></i></button>' +
                '</div>' +
                '<div class="dpWeekdays"><span class="text-10-medium">D</span><span class="text-10-medium">S</span><span class="text-10-medium">T</span><span class="text-10-medium">Q</span><span class="text-10-medium">Q</span><span class="text-10-medium">S</span><span class="text-10-medium">S</span></div>' +
                '<div class="dpGrid" data-dp-grid></div>' +
              '</div>' +
            '</div>' +
            '<div class="wrapper" id="parcela-valor-field-' + i + '">' +
              '<span class="label">Valor</span>' +
              '<div class="inputWrap">' +
                '<input class="input" type="text" inputmode="decimal" id="parcela-valor-input-' + i + '" value="' + formatCentavosBRL(valorParcelaCents) + '" data-cents="' + valorParcelaCents + '" />' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
    parcelasList.innerHTML = html;
    if (window.lucide) lucide.createIcons();

    parcelaPickers = [];
    for (var j = 1; j <= n; j++) {
      (function (index) {
        var picker = window.NiveloDatePicker.initDay({
          rootId: 'parcela-venc-field-' + index, triggerId: 'parcela-venc-trigger-' + index, valueId: 'parcela-venc-value-' + index,
          hiddenInputId: 'parcela-venc-input-' + index, popoverId: 'parcela-venc-popover-' + index, placeholder: 'Selecionar data'
        });
        picker.setValue(addMonthsISO(dataBase, index));
        parcelaPickers.push(picker);

        var valorInput = document.getElementById('parcela-valor-input-' + index);
        valorInput.addEventListener('input', function () {
          var digits = valorInput.value.replace(/\D/g, '');
          valorInput.dataset.cents = digitsToCents(digits);
          valorInput.value = formatCentavosBRL(digitsToCents(digits));
          updateParcelasValidation();
        });
      })(j);
    }
    updateParcelasValidation();
  }

  // Valida a soma das parcelas contra o Valor total do pedido — nunca a
  // mesma mensagem genérica pros dois sentidos (faltando × sobrando), com
  // a diferença em R$ sempre explícita, conforme pedido.
  function parcelasSomaCents() {
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    var soma = 0;
    for (var i = 1; i <= n; i++) {
      var input = document.getElementById('parcela-valor-input-' + i);
      soma += input ? Number(input.dataset.cents || 0) : 0;
    }
    return soma;
  }

  function parcelasSaoValidas() {
    if (getCondicaoPagamento() !== 'prazo') return true;
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    if (n < 1) return true;
    return parcelasSomaCents() === valorTotalPedidoCents();
  }

  function updateParcelasValidation() {
    if (getCondicaoPagamento() !== 'prazo' || parcelasList.hidden) {
      parcelasSummary.hidden = true;
      return;
    }
    var diffCents = parcelasSomaCents() - valorTotalPedidoCents();
    if (diffCents === 0) {
      parcelasSummary.hidden = true;
      return;
    }
    var diffTexto = formatCentavosBRL(Math.abs(diffCents));
    parcelasAlertText.textContent = diffCents < 0
      ? 'Os valores das parcelas estão abaixo do total do pedido em ' + diffTexto + '. Ajuste os valores para que a soma corresponda ao valor total.'
      : 'Os valores das parcelas excedem o total do pedido em ' + diffTexto + '. Ajuste os valores para que a soma corresponda ao valor total.';
    parcelasSummary.hidden = false;
  }

  function coletarParcelas() {
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    var parcelas = [];
    for (var i = 1; i <= n; i++) {
      var vencimentoInput = document.getElementById('parcela-venc-input-' + i);
      var valorInput = document.getElementById('parcela-valor-input-' + i);
      parcelas.push({
        numero: i + '/' + n,
        total: n,
        vencimento: vencimentoInput ? vencimentoInput.value : '',
        valor: (valorInput ? Number(valorInput.dataset.cents || 0) : 0) / 100
      });
    }
    return parcelas;
  }

  // ---------- Transporte ----------
  var transportadoraField = document.getElementById('transportadora-field');
  var transportadoraMenu = document.getElementById('transportadora-menu');
  var veiculoField = document.getElementById('veiculo-field');
  var veiculoMenu = document.getElementById('veiculo-menu');

  var TRANSPORTADORAS = window.NiveloCadastros.findByTipo('transportadora');
  TRANSPORTADORAS.forEach(function (t) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = t.codigo;
    optionEl.textContent = t.nome;
    transportadoraMenu.appendChild(optionEl);
  });
  var veiculoDropdown = initDropdown(veiculoField);
  var transportadoraDropdown = initDropdown(transportadoraField, function (codigo) {
    veiculoDropdown.clear();
    veiculoMenu.innerHTML = '';
    var veiculos = window.NiveloVeiculosTransportadora.listByTransportadora(codigo);
    veiculos.forEach(function (v) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = v.placa;
      optionEl.textContent = v.placa + ' — ' + v.modelo;
      veiculoMenu.appendChild(optionEl);
    });
    veiculoDropdown.setEnabled(veiculos.length > 0, veiculos.length ? undefined : 'Nenhum veículo cadastrado');
  });

  // ---------- Erros somem ao corrigir ----------
  quantidadeInput.addEventListener('input', function () {
    if (quantidadeField().classList.contains('error') && parseQuantidade() > 0) quantidadeField().classList.remove('error');
  });
  function quantidadeField() { return document.getElementById('quantidade-field'); }
  precoInput.addEventListener('input', function () {
    var precoField = document.getElementById('preco-field');
    if (precoField.classList.contains('error') && moneyCents(precoInput) > 0) precoField.classList.remove('error');
  });
  numeroParcelasInput.addEventListener('input', function () {
    var field = document.getElementById('numero-parcelas-field');
    if (field.classList.contains('error') && Number(numeroParcelasInput.value) > 0) field.classList.remove('error');
  });
  function clearDropdownErrorOnValue(field) {
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  [naturezaField, clienteField, produtoField, depositoField, unidadeField, formaRecebimentoField, contaEntradaField, formaCobrancaField].forEach(clearDropdownErrorOnValue);

  // ---------- Validação + envio ----------
  function runValidation() {
    var invalidAny = false;
    function markError(field, invalid) {
      field.classList.toggle('error', invalid);
      invalidAny = invalidAny || invalid;
    }

    markError(naturezaField, !naturezaField.dataset.value);
    markError(clienteField, !clienteField.dataset.value);
    markError(produtoField, !produtoField.dataset.value);
    if (getModalidade() === 'estoque') markError(depositoField, !depositoField.dataset.value);
    markError(quantidadeField(), !(parseQuantidade() > 0));
    markError(unidadeField, !unidadeField.dataset.value);
    markError(document.getElementById('preco-field'), !(moneyCents(precoInput) > 0));

    if (getCondicaoPagamento() === 'avista') {
      markError(formaRecebimentoField, !formaRecebimentoField.dataset.value);
      markError(contaEntradaField, !contaEntradaField.dataset.value);
    } else {
      markError(formaCobrancaField, !formaCobrancaField.dataset.value);
      markError(document.getElementById('numero-parcelas-field'), !(Number(numeroParcelasInput.value) > 0));
      // A soma das parcelas precisa bater com o Valor total do pedido —
      // validado também aqui (não só ao editar um campo de parcela), pra
      // cobrir o caso do usuário nunca ter tocado nas parcelas.
      updateParcelasValidation();
      if (!parcelasSaoValidas()) invalidAny = true;
    }

    return !invalidAny;
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

    var cliente = findClienteByCodigo(clienteField.dataset.value);
    var natureza = window.NiveloNaturezasOperacao.findByCodigo(naturezaField.dataset.value);
    var produto = findProdutoBySku(produtoField.dataset.value);
    var forma = getCondicaoPagamento() === 'avista' ? window.NiveloFormasCondicaoVenda.findRecebimentoByCodigo(formaRecebimentoField.dataset.value) : null;
    var cobranca = getCondicaoPagamento() === 'prazo' ? window.NiveloFormasCondicaoVenda.findCobrancaByCodigo(formaCobrancaField.dataset.value) : null;
    var contaEntrada = getCondicaoPagamento() === 'avista' ? window.NiveloContasBancarias.list().filter(function (c) { return c.codigo === Number(contaEntradaField.dataset.value); })[0] : null;
    var transportadora = transportadoraField.dataset.value ? TRANSPORTADORAS.filter(function (t) { return t.codigo === transportadoraField.dataset.value; })[0] : null;

    var quantidade = parseQuantidade();
    var precoCents = moneyCents(precoInput);
    var descontoCents = moneyCents(descontoInput);
    var valorBrutoCents = Math.round(quantidade * precoCents);
    var valorLiquidoCents = Math.max(0, valorBrutoCents - descontoCents);
    var totalKg = produto && produto.pesoLiquido != null ? quantidade * produto.pesoLiquido : null;

    var payload = {
      data: document.getElementById('npv-data').value,
      naturezaOperacaoCodigo: natureza ? natureza.codigo : null,
      naturezaOperacaoDescricao: natureza ? natureza.descricao : '',
      clienteCodigo: cliente ? cliente.codigo : null,
      clienteNome: cliente ? cliente.nome : '',
      clienteDocumento: cliente ? cliente.documento : '',
      clienteIe: cliente ? (cliente.inscricaoEstadual || '') : '',
      clienteTelefone: cliente ? (cliente.telefone || '') : '',
      clienteEndereco: cliente ? (cliente.endereco || cliente.cidade || '') : '',
      modalidade: getModalidade(),
      produtoSku: produto ? produto.sku : produtoField.dataset.value,
      produtoNome: produto ? produto.nome : '',
      produtoUnidadeLegado: produto ? produto.unidade : '',
      unidadeCodigo: unidadeField.dataset.value,
      depositoNome: depositoField.dataset.value || null,
      quantidade: quantidade,
      pesoPorUnidade: produto ? produto.pesoLiquido : null,
      totalKg: totalKg,
      precoUnitario: precoCents / 100,
      valorBruto: valorBrutoCents / 100,
      desconto: descontoCents / 100,
      valorLiquido: valorLiquidoCents / 100,
      condicaoPagamento: getCondicaoPagamento(),
      formaRecebimentoCodigo: forma ? forma.codigo : null,
      formaRecebimentoNome: forma ? forma.nome : null,
      contaEntradaCodigo: contaEntrada ? contaEntrada.codigo : null,
      contaEntradaNome: contaEntrada ? contaEntrada.descricao : null,
      dataRecebimento: getCondicaoPagamento() === 'avista' ? document.getElementById('npv-data-recebimento').value : null,
      formaCobrancaCodigo: cobranca ? cobranca.codigo : null,
      formaCobrancaNome: cobranca ? cobranca.nome : null,
      numeroParcelas: getCondicaoPagamento() === 'prazo' ? Number(numeroParcelasInput.value) : null,
      parcelas: getCondicaoPagamento() === 'prazo' ? coletarParcelas() : [],
      transportadoraCodigo: transportadora ? transportadora.codigo : null,
      transportadoraNome: transportadora ? transportadora.nome : null,
      veiculoPlaca: veiculoField.dataset.value || null,
      motorista: document.getElementById('npv-motorista').value.trim(),
      observacao: document.getElementById('npv-observacao').value.trim()
    };

    try {
      var pedido = window.NiveloPedidosVenda.add(payload);
      sessionStorage.setItem('nivelo.novopedidodevenda.success', 'Pedido de venda ' + pedido.numero + ' salvo com sucesso.');
    } catch (e) {}

    window.location.href = 'pedidos-de-venda.html';
  });

  refreshModalidadeVisibility();
  refreshCondicaoVisibility();
})();
