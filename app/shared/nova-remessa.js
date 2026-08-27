(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesma técnica de novo-pedido-venda.js/
  // nova-conta-pagar.js — cópia verbatim, sem módulo compartilhado no
  // projeto pra isso). ----------
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

  // ---------- Máscara de moeda (mesma técnica já usada em Estoque/Caixa/
  // Novo Pedido de Venda). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }
  function bindMoneyInput(input, onInput) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      input.dataset.cents = digitsToCents(digits);
      input.value = formatCentavosBRL(digitsToCents(digits));
      if (onInput) onInput();
    });
  }
  function moneyCents(input) { return Number(input.dataset.cents || 0); }

  // ---------- Unidades — mesma tabela/vocabulário já usado em
  // novo-pedido-venda.js (não amarrada aos labels: se o vocabulário mudar
  // lá, só este mapa precisa mudar aqui). Nota de desenvolvimento (item 11
  // do pedido): a unidade mostrada após "Peso"/"Total"/"Valor fiscal por"
  // depende do que foi configurado no CADASTRO DO PRODUTO
  // (`produto.unidadeMedida` = unidade de armazenamento, ex. Saco/Caixa;
  // `produto.unidadeVolume` = unidade de medida/peso, ex. Kg/Litro) — nunca
  // hardcodar "saca"/"kg" nesta tela. Se o vocabulário de unidades crescer
  // no futuro (ex. Tonelada), basta adicionar aqui, nenhuma outra mudança é
  // necessária pros labels dinâmicos abaixo. ----------
  var UNIDADE_LABELS = { CX: 'Caixa', UN: 'Unidade', KG: 'Kg', LT: 'Litro', PT: 'Pacote', FR: 'Fardo', SC: 'Saco' };

  function unidadeArmazenamentoLabel(produto) {
    if (!produto || !produto.unidadeMedida || !UNIDADE_LABELS[produto.unidadeMedida]) return 'unidade';
    return UNIDADE_LABELS[produto.unidadeMedida].toLowerCase();
  }
  function unidadeMedidaLabel(produto) {
    if (!produto || !produto.unidadeVolume || !UNIDADE_LABELS[produto.unidadeVolume]) return 'kg';
    return UNIDADE_LABELS[produto.unidadeVolume].toLowerCase();
  }

  // ================= Campos =================
  var form = document.getElementById('nr-form');

  // ---------- Operação ----------
  var naturezaField = document.getElementById('natureza-field');
  var naturezaMenu = document.getElementById('natureza-menu');
  var destinatarioField = document.getElementById('destinatario-field');
  var destinatarioMenu = document.getElementById('destinatario-menu');
  var destinatarioInfo = document.getElementById('nr-destinatario-info');

  var dataPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-field', triggerId: 'data-trigger', valueId: 'data-value',
    hiddenInputId: 'nr-data', popoverId: 'data-popover', placeholder: 'Selecionar data'
  });
  dataPicker.setValue(new Date().toISOString().slice(0, 10));

  // Natureza da operação: MESMA origem de dados do formulário de Pedido de
  // Venda (`window.NiveloNaturezasOperacao`, tipo 'saida') — nunca uma
  // lista duplicada aqui.
  window.NiveloNaturezasOperacao.list().filter(function (n) { return n.tipo === 'saida' && n.ativo; }).forEach(function (natureza) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = natureza.codigo;
    optionEl.textContent = natureza.descricao;
    naturezaMenu.appendChild(optionEl);
  });
  var naturezaDropdown = initDropdown(naturezaField);

  // Destinatário: mesmo catálogo de Clientes já usado pelo campo "Cliente"
  // de Pedido de Venda (`window.NiveloCadastros.findByTipo('cliente')`) —
  // aqui o destinatário é o silo/cooperativa/armazém que recebe a
  // produção, mas continua sendo um Cliente cadastrado no sistema.
  var CLIENTES = window.NiveloCadastros.findByTipo('cliente');
  CLIENTES.forEach(function (cliente) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = cliente.codigo;
    optionEl.textContent = cliente.nome + ' — ' + cliente.documento;
    destinatarioMenu.appendChild(optionEl);
  });
  function findClienteByCodigo(codigo) {
    return CLIENTES.filter(function (c) { return c.codigo === codigo; })[0] || null;
  }
  var destinatarioDropdown = initDropdown(destinatarioField, function (codigo) {
    var cliente = findClienteByCodigo(codigo);
    if (!cliente) { destinatarioInfo.hidden = true; return; }
    document.getElementById('nr-destinatario-documento').textContent = cliente.documento || '—';
    document.getElementById('nr-destinatario-ie').textContent = cliente.inscricaoEstadual || '—';
    document.getElementById('nr-destinatario-telefone').textContent = cliente.telefone || '—';
    document.getElementById('nr-destinatario-endereco').textContent = cliente.endereco || cliente.cidade || '—';
    destinatarioInfo.hidden = false;
  });

  // ---------- Produto e Quantidade ----------
  var produtoField = document.getElementById('produto-field');
  var produtoMenu = document.getElementById('produto-menu');
  var unidadeField = document.getElementById('unidade-field');
  var unidadeMenu = document.getElementById('unidade-menu');
  var pesoInput = document.getElementById('nr-peso');
  var pesoLabel = document.getElementById('nr-peso-label');
  var totalInput = document.getElementById('nr-total');
  var totalLabel = document.getElementById('nr-total-label');

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

  // Rótulos dinâmicos de Peso/Total/Valor fiscal por unidade — sempre
  // derivados do produto selecionado (nunca "saca"/"kg" fixos, ver nota de
  // desenvolvimento acima do mapa UNIDADE_LABELS).
  function atualizarRotulosUnidade() {
    var produto = findProdutoBySku(produtoField.dataset.value);
    pesoLabel.textContent = 'Peso por ' + unidadeArmazenamentoLabel(produto);
    totalLabel.textContent = 'Total (' + (produto && produto.unidadeVolume ? produto.unidadeVolume : 'KG') + ')';
    document.getElementById('nr-valor-fiscal-unitario-label').textContent = 'Valor fiscal por ' + unidadeArmazenamentoLabel(produto);
  }

  var produtoDropdown = initDropdown(produtoField, function (sku) {
    var produto = findProdutoBySku(sku);
    if (produto && produto.unidadeMedida && unidadeMenu.querySelector('.option[data-value="' + produto.unidadeMedida + '"]')) {
      unidadeDropdown.selectValue(produto.unidadeMedida);
    }
    atualizarRotulosUnidade();
    recalcularValores();
  });

  // ---------- Quantidade / Peso / Total / Valor fiscal ----------
  var quantidadeInput = document.getElementById('nr-quantidade');
  var valorFiscalUnitarioInput = document.getElementById('nr-valor-fiscal-unitario');
  var valorFiscalTotalInput = document.getElementById('nr-valor-fiscal-total');

  quantidadeInput.addEventListener('input', function () {
    quantidadeInput.value = quantidadeInput.value.replace(/[^\d.,]/g, '');
    recalcularValores();
  });
  bindMoneyInput(valorFiscalUnitarioInput, recalcularValores);

  function parseQuantidade() {
    var raw = quantidadeInput.value.replace(',', '.');
    var value = parseFloat(raw);
    return isNaN(value) ? 0 : value;
  }

  // Total = Quantidade × peso da unidade de armazenamento (produto.
  // pesoLiquido) — ver nota de desenvolvimento acima do mapa
  // UNIDADE_LABELS: a unidade exibida ao lado do valor é sempre a do
  // cadastro do produto, nunca fixa.
  function recalcularValores() {
    var quantidade = parseQuantidade();
    var produto = findProdutoBySku(produtoField.dataset.value);
    var pesoPorUnidade = produto ? produto.pesoLiquido : null;

    pesoInput.value = pesoPorUnidade != null ? pesoPorUnidade.toLocaleString('pt-BR') + ' ' + unidadeMedidaLabel(produto) : '—';

    var total = pesoPorUnidade != null ? quantidade * pesoPorUnidade : null;
    totalInput.value = total != null ? total.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' ' + unidadeMedidaLabel(produto) : '—';

    // Valor fiscal total = Quantidade × Valor fiscal por unidade (nunca
    // digitado manualmente pelo usuário).
    var valorFiscalUnitarioCents = moneyCents(valorFiscalUnitarioInput);
    var valorFiscalTotalCents = Math.round(quantidade * valorFiscalUnitarioCents);
    valorFiscalTotalInput.value = formatCentavosBRL(valorFiscalTotalCents);
  }
  atualizarRotulosUnidade();

  // ---------- Transporte (opcional, mesmo padrão de Novo Pedido de
  // Venda) ----------
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
    // Ao trocar a transportadora, o veículo previamente selecionado é
    // limpo e a lista passa a mostrar só os veículos vinculados à nova
    // transportadora (nunca veículos de outra transportadora).
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
  function clearDropdownErrorOnValue(field) {
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  [produtoField, unidadeField].forEach(clearDropdownErrorOnValue);

  // ---------- Validação + envio ----------
  // Só Produto/Quantidade/Unidade são obrigatórios (mesmo escopo do pedido
  // do usuário: "Produto *" é o único campo marcado como obrigatório no
  // texto — Quantidade/Unidade são exigidos por serem indispensáveis pra
  // interpretar a remessa, mesmo padrão de exigência mínima já usado em
  // Novo Pedido de Venda). Natureza da operação/Destinatário/Valor fiscal/
  // Transporte continuam opcionais nesta etapa — a ausência de dado fiscal
  // já é tratada, sem bloquear o salvamento da remessa, pelo próprio fluxo
  // de "Emitir nota fiscal" (ver `dadosNfeFaltantes()` em
  // pedidos-venda-data.js), que pede revisão manual quando faltar algo.
  function runValidation() {
    var invalidAny = false;
    function markError(field, invalid) {
      field.classList.toggle('error', invalid);
      invalidAny = invalidAny || invalid;
    }
    markError(produtoField, !produtoField.dataset.value);
    markError(quantidadeField(), !(parseQuantidade() > 0));
    markError(unidadeField, !unidadeField.dataset.value);
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

    var destinatario = findClienteByCodigo(destinatarioField.dataset.value);
    var natureza = window.NiveloNaturezasOperacao.findByCodigo(naturezaField.dataset.value);
    var produto = findProdutoBySku(produtoField.dataset.value);
    var transportadora = transportadoraField.dataset.value ? TRANSPORTADORAS.filter(function (t) { return t.codigo === transportadoraField.dataset.value; })[0] : null;

    var quantidade = parseQuantidade();
    var pesoPorUnidade = produto ? produto.pesoLiquido : null;
    var total = pesoPorUnidade != null ? quantidade * pesoPorUnidade : null;
    var valorFiscalUnitarioCents = moneyCents(valorFiscalUnitarioInput);
    var valorFiscalTotalCents = Math.round(quantidade * valorFiscalUnitarioCents);

    var payload = {
      data: document.getElementById('nr-data').value,
      naturezaOperacaoCodigo: natureza ? natureza.codigo : null,
      naturezaOperacaoDescricao: natureza ? natureza.descricao : '',
      clienteCodigo: destinatario ? destinatario.codigo : null,
      clienteNome: destinatario ? destinatario.nome : '',
      clienteDocumento: destinatario ? destinatario.documento : '',
      clienteIe: destinatario ? (destinatario.inscricaoEstadual || '') : '',
      clienteTelefone: destinatario ? (destinatario.telefone || '') : '',
      clienteEndereco: destinatario ? (destinatario.endereco || destinatario.cidade || '') : '',
      produtoSku: produto ? produto.sku : produtoField.dataset.value,
      produtoNome: produto ? produto.nome : '',
      produtoUnidadeLegado: produto ? produto.unidade : '',
      unidadeCodigo: unidadeField.dataset.value,
      quantidade: quantidade,
      pesoPorUnidade: pesoPorUnidade,
      totalKg: total,
      valorFiscalUnitario: valorFiscalUnitarioCents / 100,
      valorFiscalTotal: valorFiscalTotalCents / 100,
      transportadoraCodigo: transportadora ? transportadora.codigo : null,
      transportadoraNome: transportadora ? transportadora.nome : null,
      veiculoPlaca: veiculoField.dataset.value || null,
      motorista: document.getElementById('nr-motorista').value.trim(),
      observacao: document.getElementById('nr-observacao').value.trim()
    };

    try {
      var remessa = window.NiveloPedidosVenda.addRemessa(payload);
      sessionStorage.setItem('nivelo.novopedidodevenda.success', 'Remessa ' + remessa.numero + ' salva com sucesso.');
    } catch (e) {}

    window.location.href = 'pedidos-de-venda.html';
  });
})();
