(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema). ----------
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

    return { selectOption: selectOption, selectValue: selectValue, root: root };
  }

  // ---------- Máscara de moeda (mesma técnica de formatCentavosBRL já usada
  // em Estoque/Caixa/Nova Conta a Pagar V1). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var valorInput = document.getElementById('ncp-valor');
  var valorField = document.getElementById('valor-field');
  valorInput.addEventListener('input', function () {
    var digits = valorInput.value.replace(/\D/g, '');
    valorInput.dataset.cents = digitsToCents(digits);
    valorInput.value = formatCentavosBRL(digitsToCents(digits));
    if (valorField.classList.contains('error') && Number(valorInput.dataset.cents) > 0) valorField.classList.remove('error');
    syncParcelamentoValorTotal();
  });

  // ---------- Campos ----------
  var fornecedorField = document.getElementById('fornecedor-field');
  var emissaoField = document.getElementById('emissao-field');
  var emissaoInput = document.getElementById('ncp-emissao');
  var vencimentoField = document.getElementById('vencimento-field');
  var vencimentoInput = document.getElementById('ncp-vencimento');
  var categoriaField = document.getElementById('categoria-field');
  var documentoInput = document.getElementById('ncp-documento');
  var descricaoField = document.getElementById('descricao-field');
  var descricaoInput = document.getElementById('ncp-descricao');

  // Fornecedor: só cadastros do tipo "fornecedor" (Cadastro de Pessoas e
  // Empresas), mesma fonte já usada na V1.
  var fornecedorMenu = document.getElementById('fornecedor-menu');
  window.NiveloCadastros.findByTipo('fornecedor').forEach(function (fornecedor) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = fornecedor.codigo;
    optionEl.textContent = fornecedor.nome + ' — ' + fornecedor.documento;
    fornecedorMenu.appendChild(optionEl);
  });
  var fornecedorDropdown = initDropdown(fornecedorField);

  function findFornecedorByCodigo(codigo) {
    return window.NiveloCadastros.findByTipo('fornecedor').filter(function (f) { return f.codigo === codigo; })[0] || null;
  }

  // ---------- Categoria: dropdown dinâmico a partir do catálogo central +
  // item fixo "+ Nova categoria" (mesma técnica exata já usada na V1). ----------
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

  // ---------- Datas: Data de emissão nasce preenchida com hoje (editável),
  // Data de vencimento sempre em branco (obrigatória). Padrão oficial de
  // calendário do sistema (dia único), ver app/shared/date-picker.js. ----------
  var emissaoPicker = window.NiveloDatePicker.initDay({
    rootId: 'emissao-field', triggerId: 'emissao-trigger', valueId: 'emissao-value',
    hiddenInputId: 'ncp-emissao', popoverId: 'emissao-popover', placeholder: 'Selecionar data',
    onChange: function () {
      if (emissaoField.classList.contains('error') && emissaoInput.value) emissaoField.classList.remove('error');
    }
  });
  emissaoPicker.setValue(new Date().toISOString().slice(0, 10));

  var vencimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'vencimento-field', triggerId: 'vencimento-trigger', valueId: 'vencimento-value',
    hiddenInputId: 'ncp-vencimento', popoverId: 'vencimento-popover', placeholder: 'Selecionar data',
    onChange: function () {
      if (vencimentoField.classList.contains('error') && vencimentoInput.value) vencimentoField.classList.remove('error');
      renderParcelas();
    }
  });

  // ---------- Erros somem ao corrigir ----------
  descricaoInput.addEventListener('input', function () {
    if (descricaoField.classList.contains('error') && descricaoInput.value.trim()) descricaoField.classList.remove('error');
  });
  function clearDropdownErrorOnValue(field) {
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  clearDropdownErrorOnValue(fornecedorField);
  clearDropdownErrorOnValue(categoriaField);

  // ---------- Condição de pagamento: À vista / Parcelado ----------
  var condicaoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="condicao-pagamento"]'));
  function syncRadioChecked(radios) {
    radios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }
  syncRadioChecked(condicaoRadios);
  function getCondicaoPagamento() {
    var checked = condicaoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'avista';
  }

  var parcelamentoCard = document.getElementById('parcelamento-card');
  function refreshCondicaoVisibility() {
    var isParcelado = getCondicaoPagamento() === 'parcelado';
    parcelamentoCard.hidden = !isParcelado;
    if (!isParcelado) {
      numeroParcelasInput.value = '';
      document.getElementById('numero-parcelas-field').classList.remove('error');
      parcelasList.innerHTML = '';
    } else {
      renderParcelas();
    }
  }
  condicaoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () { syncRadioChecked(condicaoRadios); refreshCondicaoVisibility(); });
  });

  // ---------- Parcelamento: Número de parcelas → cards de parcela
  // (Vencimento + Valor), mesmo padrão exato já usado em Pedidos de Venda >
  // Condição de pagamento > A prazo. ----------
  var numeroParcelasInput = document.getElementById('ncp2-numero-parcelas');
  var numeroParcelasField = document.getElementById('numero-parcelas-field');
  var parcelamentoValorTotalInput = document.getElementById('ncp2-parcelamento-valor-total');
  var parcelamentoSomaInput = document.getElementById('ncp2-parcelamento-soma');
  var parcelasList = document.getElementById('ncp2-parcelas-list');
  var parcelasSummary = document.getElementById('ncp2-parcelas-summary');
  var parcelasAlertText = document.getElementById('ncp2-parcelas-alert-text');
  var parcelaPickers = [];

  function valorTotalCents() { return Number(valorInput.dataset.cents || 0); }

  function syncParcelamentoValorTotal() {
    parcelamentoValorTotalInput.value = formatCentavosBRL(valorTotalCents());
    updateParcelasValidation();
  }

  function addMonthsISO(iso, months) {
    var parts = iso.split('-').map(Number);
    var date = new Date(parts[0], parts[1] - 1 + months, parts[2]);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  numeroParcelasInput.addEventListener('input', function () {
    numeroParcelasInput.value = numeroParcelasInput.value.replace(/\D/g, '');
    if (numeroParcelasField.classList.contains('error') && Number(numeroParcelasInput.value) > 1) numeroParcelasField.classList.remove('error');
    renderParcelas();
  });

  function renderParcelas() {
    if (getCondicaoPagamento() !== 'parcelado') { parcelasList.innerHTML = ''; parcelaPickers = []; updateParcelasValidation(); return; }
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    if (n < 1) { parcelasList.innerHTML = ''; parcelaPickers = []; updateParcelasValidation(); return; }

    var totalCents = valorTotalCents();
    var baseCents = Math.floor(totalCents / n);
    var resto = totalCents - baseCents * n;
    var vencimentoBase = vencimentoInput.value || new Date().toISOString().slice(0, 10);

    var html = '';
    for (var i = 1; i <= n; i++) {
      var valorParcelaCents = baseCents + (i === n ? resto : 0);
      html +=
        '<div class="card ncp2-parcela-card" data-index="' + i + '">' +
          '<div class="ncp2-parcela-header"><h3 class="ncp2-parcela-title text-subtitle-s">Parcela ' + i + '/' + n + '</h3></div>' +
          '<div class="ncp2-parcela-grid">' +
            '<div class="dpRoot" id="ncp2-parcela-venc-field-' + i + '">' +
              '<label class="dpLabel" for="ncp2-parcela-venc-trigger-' + i + '">Vencimento</label>' +
              '<button type="button" class="dpTrigger" id="ncp2-parcela-venc-trigger-' + i + '">' +
                '<span class="dpTriggerIcon"><i data-lucide="calendar" width="16" height="16"></i></span>' +
                '<span class="dpPlaceholder" id="ncp2-parcela-venc-value-' + i + '">Selecionar data</span>' +
              '</button>' +
              '<input type="hidden" id="ncp2-parcela-venc-input-' + i + '" />' +
              '<div class="dpPopover" id="ncp2-parcela-venc-popover-' + i + '" hidden>' +
                '<div class="dpCalendarHeader">' +
                  '<button type="button" class="dpNavBtn" data-dp-prev aria-label="Mês anterior"><i data-lucide="chevron-left" width="16" height="16"></i></button>' +
                  '<span class="dpCalendarLabel text-body-s" data-dp-label></span>' +
                  '<button type="button" class="dpNavBtn" data-dp-next aria-label="Próximo mês"><i data-lucide="chevron-right" width="16" height="16"></i></button>' +
                '</div>' +
                '<div class="dpWeekdays"><span class="text-10-medium">D</span><span class="text-10-medium">S</span><span class="text-10-medium">T</span><span class="text-10-medium">Q</span><span class="text-10-medium">Q</span><span class="text-10-medium">S</span><span class="text-10-medium">S</span></div>' +
                '<div class="dpGrid" data-dp-grid></div>' +
              '</div>' +
            '</div>' +
            '<div class="wrapper" id="ncp2-parcela-valor-field-' + i + '">' +
              '<span class="label">Valor</span>' +
              '<div class="inputWrap">' +
                '<input class="input" type="text" inputmode="decimal" id="ncp2-parcela-valor-input-' + i + '" value="' + formatCentavosBRL(valorParcelaCents) + '" data-cents="' + valorParcelaCents + '" />' +
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
          rootId: 'ncp2-parcela-venc-field-' + index, triggerId: 'ncp2-parcela-venc-trigger-' + index, valueId: 'ncp2-parcela-venc-value-' + index,
          hiddenInputId: 'ncp2-parcela-venc-input-' + index, popoverId: 'ncp2-parcela-venc-popover-' + index, placeholder: 'Selecionar data'
        });
        picker.setValue(addMonthsISO(vencimentoBase, index - 1));
        parcelaPickers.push(picker);

        var parcelaValorInput = document.getElementById('ncp2-parcela-valor-input-' + index);
        parcelaValorInput.addEventListener('input', function () {
          var digits = parcelaValorInput.value.replace(/\D/g, '');
          parcelaValorInput.dataset.cents = digitsToCents(digits);
          parcelaValorInput.value = formatCentavosBRL(digitsToCents(digits));
          updateParcelasValidation();
        });
      })(j);
    }
    updateParcelasValidation();
  }

  function parcelasSomaCents() {
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    var soma = 0;
    for (var i = 1; i <= n; i++) {
      var input = document.getElementById('ncp2-parcela-valor-input-' + i);
      soma += input ? Number(input.dataset.cents || 0) : 0;
    }
    return soma;
  }

  function parcelasSaoValidas() {
    if (getCondicaoPagamento() !== 'parcelado') return true;
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    if (n < 2) return false;
    return parcelasSomaCents() === valorTotalCents();
  }

  // A soma sempre É exibida (não só quando diverge) — pedido explícito
  // ("O sistema deve permitir verificar visualmente se a soma das parcelas
  // corresponde ao valor total"), diferente de Pedidos de Venda (onde o
  // resumo só aparece quando diverge). Cor muda conforme bate ou não.
  function updateParcelasValidation() {
    parcelamentoSomaInput.value = formatCentavosBRL(parcelasSomaCents());
    if (getCondicaoPagamento() !== 'parcelado' || !parcelasList.children.length) {
      parcelasSummary.hidden = true;
      return;
    }
    var diffCents = parcelasSomaCents() - valorTotalCents();
    if (diffCents === 0) {
      parcelasSummary.hidden = true;
      return;
    }
    var diffTexto = formatCentavosBRL(Math.abs(diffCents));
    parcelasAlertText.textContent = diffCents < 0
      ? 'A soma das parcelas está abaixo do Valor total em ' + diffTexto + '. Ajuste os valores para que a soma corresponda ao valor total.'
      : 'A soma das parcelas excede o Valor total em ' + diffTexto + '. Ajuste os valores para que a soma corresponda ao valor total.';
    parcelasSummary.hidden = false;
  }

  function coletarParcelas() {
    var n = Math.max(0, Number(numeroParcelasInput.value || 0));
    var parcelas = [];
    for (var i = 1; i <= n; i++) {
      var vencimentoInputEl = document.getElementById('ncp2-parcela-venc-input-' + i);
      var valorInputEl = document.getElementById('ncp2-parcela-valor-input-' + i);
      parcelas.push({
        vencimento: vencimentoInputEl ? vencimentoInputEl.value : '',
        valor: (valorInputEl ? Number(valorInputEl.dataset.cents || 0) : 0) / 100
      });
    }
    return parcelas;
  }

  // ---------- Validação + envio ----------
  var pageTitleEl = document.getElementById('ncp-page-title');
  var submitBtn = document.getElementById('ncp-submit');
  var form = document.getElementById('ncp-form');

  function runValidation() {
    var fornecedorInvalid = !fornecedorField.dataset.value;
    fornecedorField.classList.toggle('error', fornecedorInvalid);

    var emissaoInvalid = !emissaoInput.value;
    emissaoField.classList.toggle('error', emissaoInvalid);

    var vencimentoInvalid = !vencimentoInput.value;
    vencimentoField.classList.toggle('error', vencimentoInvalid);

    var categoriaInvalid = !categoriaField.dataset.value || categoriaField.dataset.value === '__nova__';
    categoriaField.classList.toggle('error', categoriaInvalid);

    var valorInvalid = !(Number(valorInput.dataset.cents) > 0);
    valorField.classList.toggle('error', valorInvalid);

    var descricaoInvalid = !descricaoInput.value.trim();
    descricaoField.classList.toggle('error', descricaoInvalid);

    var isParcelado = getCondicaoPagamento() === 'parcelado';
    var numeroParcelasInvalid = isParcelado && !(Number(numeroParcelasInput.value) > 1);
    numeroParcelasField.classList.toggle('error', numeroParcelasInvalid);

    // Soma das parcelas precisa bater com o Valor total ANTES de permitir
    // salvar — pedido explícito, regra central do parcelamento na V2.
    var somaInvalid = isParcelado && !numeroParcelasInvalid && !parcelasSaoValidas();
    if (somaInvalid) updateParcelasValidation();

    return !fornecedorInvalid && !emissaoInvalid && !vencimentoInvalid && !categoriaInvalid &&
      !valorInvalid && !descricaoInvalid && !numeroParcelasInvalid && !somaInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error, .card .error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    var fornecedor = findFornecedorByCodigo(fornecedorField.dataset.value);
    var isParcelado = getCondicaoPagamento() === 'parcelado';

    var payload = {
      fornecedorCodigo: fornecedor ? fornecedor.codigo : null,
      fornecedorNome: fornecedor ? fornecedor.nome : null,
      fornecedorDocumento: fornecedor ? fornecedor.documento : null,
      dataEmissao: emissaoInput.value,
      vencimento: vencimentoInput.value,
      categoriaCodigo: categoriaField.dataset.value,
      documento: documentoInput.value.trim(),
      descricao: descricaoInput.value.trim(),
      valor: Number(valorInput.dataset.cents || 0) / 100,
      condicaoPagamento: isParcelado ? 'parcelado' : 'avista',
      parcelas: isParcelado ? coletarParcelas() : null
    };

    try {
      var criados = window.NiveloContasPagarV2.add(payload);
      var mensagem = criados.length > 1
        ? criados.length + ' títulos gerados com sucesso.'
        : 'Conta a pagar salva com sucesso.';
      sessionStorage.setItem('nivelo.novacontapagarv2.success', mensagem);
    } catch (e) {}

    window.location.href = 'contas-a-pagar-v2.html';
  });
})();
