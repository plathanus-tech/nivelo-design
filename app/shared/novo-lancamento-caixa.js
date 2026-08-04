(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema: wrapper/
  // trigger/menu/option, menu em `position:fixed` calculado via JS pra
  // escapar do `overflow:hidden` de `.card`). ----------
  function initDropdown(root) {
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
  // em Estoque/Nova Nota Fiscal) — estado sempre em centavos (inteiro). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) { return digits ? parseInt(digits, 10) : 0; }

  var valorInput = document.getElementById('nlc-valor');
  valorInput.addEventListener('input', function () {
    var digits = valorInput.value.replace(/\D/g, '');
    valorInput.dataset.cents = digitsToCents(digits);
    valorInput.value = formatCentavosBRL(digitsToCents(digits));
  });

  // ---------- Campos ----------
  var codigoInput = document.getElementById('nlc-codigo');
  var bancoField = document.getElementById('banco-field');
  var tipoField = document.getElementById('tipo-field');
  var dataField = document.getElementById('data-field');
  var dataInput = document.getElementById('nlc-data');
  var valorField = document.getElementById('valor-field');
  var historicoField = document.getElementById('historico-field');
  var historicoInput = document.getElementById('nlc-historico');
  var categoriaField = document.getElementById('categoria-field');
  var contaFinanceiraField = document.getElementById('conta-financeira-field');
  var pessoaField = document.getElementById('pessoa-field');

  // Banco: populado a partir do catálogo REAL de Contas Bancárias
  // (window.NiveloContasBancarias, Configuração > Conta bancária) — antes
  // era um stub fixo (bancos-data.js) simulando essa tela, que agora existe
  // de verdade. Valor guardado continua sendo um texto descritivo ("001 -
  // Banco do Brasil · Conta Corrente Safra"), mesmo contrato de antes, só a
  // fonte dos dados mudou.
  var bancoMenu = document.getElementById('banco-menu');
  window.NiveloContasBancarias.list().forEach(function (conta) {
    var label = window.NiveloContasBancarias.bancoNome(conta) + ' · ' + conta.descricao;
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = label;
    optionEl.textContent = label;
    bancoMenu.appendChild(optionEl);
  });
  var bancoDropdown = initDropdown(bancoField);

  var tipoDropdown = initDropdown(tipoField);

  // Categoria: só categorias ATIVAS, de qualquer grupo (receita ou despesa)
  // — diferente de Nova Nota Fiscal, que filtra só receita: Caixa registra
  // entradas E saídas, então precisa das duas.
  var categoriaMenu = document.getElementById('categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    categoriaMenu.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(categoriaField);

  // Conta Financeira (Configuração > Conta Financeira): vínculo obrigatório
  // de todo lançamento, usado na geração do DRE (pedido explícito). Fonte
  // real, não um catálogo inventado.
  var contaFinanceiraMenu = document.getElementById('conta-financeira-menu');
  window.NiveloContasFinanceiras.list().forEach(function (contaFinanceira) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = contaFinanceira.codigo;
    optionEl.textContent = contaFinanceira.nome;
    contaFinanceiraMenu.appendChild(optionEl);
  });
  var contaFinanceiraDropdown = initDropdown(contaFinanceiraField);

  // Cliente ou Fornecedor: combina os dois tipos do Cadastro de Pessoas e
  // Empresas (um mesmo cadastro pode ser cliente E fornecedor ao mesmo
  // tempo — dedup por código pra não listar duas vezes).
  var pessoaMenu = document.getElementById('pessoa-menu');
  var pessoaNenhumaOption = document.createElement('div');
  pessoaNenhumaOption.className = 'option selected';
  pessoaNenhumaOption.dataset.value = '';
  pessoaNenhumaOption.textContent = 'Nenhum selecionado';
  pessoaMenu.appendChild(pessoaNenhumaOption);
  var pessoasVistas = {};
  window.NiveloCadastros.findByTipo('cliente').concat(window.NiveloCadastros.findByTipo('fornecedor')).forEach(function (pessoa) {
    if (pessoasVistas[pessoa.codigo]) return;
    pessoasVistas[pessoa.codigo] = true;
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = pessoa.codigo;
    optionEl.textContent = pessoa.nome + ' — ' + pessoa.documento;
    pessoaMenu.appendChild(optionEl);
  });
  var pessoaDropdown = initDropdown(pessoaField);

  function findPessoaByCodigo(codigo) {
    return window.NiveloCadastros.findByTipo('cliente').concat(window.NiveloCadastros.findByTipo('fornecedor')).filter(function (p) { return p.codigo === codigo; })[0] || null;
  }

  // ---------- Competência: padrão oficial de calendário do sistema
  // (mês/ano), ver app/shared/date-picker.js. Guarda o valor como 'AAAA-MM',
  // mesmo formato que o antigo <input type="month"> produzia — nenhuma
  // mudança necessária no restante do payload. ----------
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

  // Código: preview cosmético — o valor real (`LC-NNNN`) só é gerado de
  // verdade dentro de `NiveloCaixa.add()` ao salvar (mesma convenção de
  // Nova Categoria/Novo Produto).
  codigoInput.value = 'Automático';

  // ---------- Data: padrão oficial de calendário do sistema (dia único),
  // ver app/shared/date-picker.js. ----------
  var dataPicker = window.NiveloDatePicker.initDay({
    rootId: 'data-field',
    triggerId: 'data-trigger',
    valueId: 'data-value',
    hiddenInputId: 'nlc-data',
    popoverId: 'data-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (dataField.classList.contains('error') && dataInput.value) dataField.classList.remove('error');
    }
  });

  // ---------- Erros somem ao corrigir ----------
  historicoInput.addEventListener('input', function () {
    if (historicoField.classList.contains('error') && historicoInput.value.trim()) {
      historicoField.classList.remove('error');
    }
  });
  valorInput.addEventListener('input', function () {
    if (valorField.classList.contains('error') && Number(valorInput.dataset.cents) > 0) valorField.classList.remove('error');
  });
  function clearDropdownErrorOnValue(field) {
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  clearDropdownErrorOnValue(bancoField);
  clearDropdownErrorOnValue(tipoField);
  clearDropdownErrorOnValue(categoriaField);
  clearDropdownErrorOnValue(contaFinanceiraField);

  // ---------- Validação + envio ----------
  var form = document.getElementById('nlc-form');

  function runValidation() {
    var bancoInvalid = !bancoField.dataset.value;
    bancoField.classList.toggle('error', bancoInvalid);

    var tipoInvalid = !tipoField.dataset.value;
    tipoField.classList.toggle('error', tipoInvalid);

    var dataInvalid = !dataInput.value;
    dataField.classList.toggle('error', dataInvalid);

    var valorInvalid = !(Number(valorInput.dataset.cents) > 0);
    valorField.classList.toggle('error', valorInvalid);

    var historicoInvalid = !historicoInput.value.trim();
    historicoField.classList.toggle('error', historicoInvalid);

    var categoriaInvalid = !categoriaField.dataset.value;
    categoriaField.classList.toggle('error', categoriaInvalid);

    var contaFinanceiraInvalid = !contaFinanceiraField.dataset.value;
    contaFinanceiraField.classList.toggle('error', contaFinanceiraInvalid);

    return !bancoInvalid && !tipoInvalid && !dataInvalid && !valorInvalid && !historicoInvalid && !categoriaInvalid && !contaFinanceiraInvalid;
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

    var pessoa = pessoaField.dataset.value ? findPessoaByCodigo(pessoaField.dataset.value) : null;

    var payload = {
      data: dataInput.value,
      historico: historicoInput.value.trim(),
      pessoaNome: pessoa ? pessoa.nome : null,
      pessoaDocumento: pessoa ? pessoa.documento : null,
      categoriaCodigo: categoriaField.dataset.value,
      contaFinanceiraCodigo: Number(contaFinanceiraField.dataset.value),
      tipo: tipoField.dataset.value,
      valor: Number(valorInput.dataset.cents || 0) / 100,
      banco: bancoField.dataset.value,
      competencia: getCompetenciaValue()
    };

    try {
      window.NiveloCaixa.add(payload);
      sessionStorage.setItem('nivelo.novolancamento.success', 'Lançamento salvo com sucesso.');
    } catch (e) {}

    window.location.href = 'caixa.html';
  });
})();
