(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatInt(n) {
    return Math.round(n).toLocaleString('pt-BR');
  }
  function formatNum(n) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // Mesmo helper de estoque-v2.js (Comprometido guarda o NOME da unidade,
  // ex. "Saca" — precisa da sigla curta pra "sc"/"kg" e pra achar a
  // conversão no catálogo).
  function siglaFromUnidadeNome(nome) {
    if (!nome) return '';
    var match = window.NiveloUnidadesMedida.list().filter(function (u) {
      return u.nome.toLowerCase() === String(nome).toLowerCase();
    })[0];
    return match ? match.sigla : nome;
  }
  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  var SITUACAO_BADGE = {
    pendente: { status: 'warning', label: 'Em aberto' },
    quitado: { status: 'success', label: 'Concluído' }
  };

  // ---------- Resolve o compromisso pelo ?codigo= ----------
  var params = new URLSearchParams(location.search);
  var codigo = params.get('codigo');
  var record = codigo ? window.NiveloEstoqueComprometidoV2.findByCodigo(codigo) : null;

  if (!record) {
    document.getElementById('entrega-not-found').hidden = false;
    document.getElementById('entrega-content').hidden = true;
    return;
  }

  var sigla = siglaFromUnidadeNome(record.unidade);
  var unitLower = sigla.toLowerCase();
  var conversao = getConversao(sigla);

  document.getElementById('entrega-produto-titulo').textContent = record.produto;
  document.getElementById('entrega-cliente-subtitulo').textContent = record.cliente;
  document.getElementById('entrega-cliente-input').value = record.cliente;
  document.getElementById('entrega-produto-input').value = record.produto;

  // ---------- Totais no topo ----------
  function renderKpis() {
    document.getElementById('kpi-acordada').textContent = formatInt(record.comprometida) + ' ' + unitLower;
    document.getElementById('kpi-entregue').textContent = formatInt(record.entregue) + ' ' + unitLower;
    document.getElementById('kpi-saldo').textContent = formatInt(record.pendente) + ' ' + unitLower;
    var badge = SITUACAO_BADGE[record.situacao];
    var statusEl = document.getElementById('kpi-status');
    statusEl.dataset.status = badge.status;
    document.getElementById('kpi-status-label').textContent = badge.label;
  }
  renderKpis();

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema) ----------
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

  // ---------- Data de entrega: hoje por padrão, editável ----------
  var entregaDataInput = document.getElementById('entrega-data-input');
  var entregaDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'entrega-data-field', triggerId: 'entrega-data-trigger', valueId: 'entrega-data-value',
    hiddenInputId: 'entrega-data-input', popoverId: 'entrega-data-popover', placeholder: 'Selecionar data'
  });
  entregaDataPicker.setValue(todayISO());

  // ---------- Unidade: dropdown com a unidade do compromisso já
  // selecionada (a quantidade desta entrega é sempre lançada nesta
  // unidade) ----------
  var unidadeField = document.getElementById('entrega-unidade-field');
  var unidadeMenu = document.getElementById('entrega-unidade-menu');
  unidadeMenu.innerHTML = '<div class="option selected" data-value="' + sigla + '">' + sigla + '</div>';
  var unidadeDropdown = initDropdown(unidadeField);
  unidadeDropdown.selectOption(unidadeMenu.querySelector('.option'));

  // ---------- Peso da saca / Total em KG (automático, a partir do
  // catálogo de Unidades de medida) ----------
  var quantidadeField = document.getElementById('entrega-quantidade-field');
  var quantidadeInput = document.getElementById('entrega-quantidade-input');
  var pesoSacaLabel = document.getElementById('entrega-peso-saca-label');
  var pesoSacaInput = document.getElementById('entrega-peso-saca-input');
  var totalKgInput = document.getElementById('entrega-total-kg-input');

  if (conversao) {
    var unidadeCatalogo = window.NiveloUnidadesMedida.findBySigla(sigla);
    var nomeUnidade = unidadeCatalogo ? unidadeCatalogo.nome.toLowerCase() : unitLower;
    pesoSacaLabel.textContent = 'Peso da ' + nomeUnidade;
    pesoSacaInput.value = formatNum(conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
  } else {
    document.getElementById('entrega-peso-saca-field').hidden = true;
    document.getElementById('entrega-total-kg-field').hidden = true;
  }

  function updateTotalKg() {
    if (!conversao) return;
    var quantidade = Number(quantidadeInput.value) || 0;
    totalKgInput.value = formatNum(quantidade * conversao.correspondeA) + ' ' + conversao.unidadeBaseSigla.toLowerCase();
  }

  // ---------- Depósito de saída + Saldo disponível no depósito ----------
  var depositoField = document.getElementById('entrega-deposito-field');
  var depositoMenu = document.getElementById('entrega-deposito-menu');
  var saldoDepositoInput = document.getElementById('entrega-saldo-deposito-input');

  depositoMenu.innerHTML = record.depositos.map(function (d) {
    return '<div class="option" data-value="' + d.deposito + '">' + d.deposito + '</div>';
  }).join('');

  function updateSaldoDeposito() {
    var nome = depositoField.dataset.value;
    var deposito = record.depositos.filter(function (d) { return d.deposito === nome; })[0];
    saldoDepositoInput.value = deposito ? formatNum(deposito.quantidade) + ' ' + unitLower : '';
  }

  var depositoDropdown = initDropdown(depositoField, function () {
    depositoField.classList.remove('error');
    updateSaldoDeposito();
  });

  // ---------- Resultado da entrega (atualizado a cada tecla) ----------
  var resultadoAntesEl = document.getElementById('resultado-antes');
  var resultadoAgoraEl = document.getElementById('resultado-agora');
  var resultadoRestanteEl = document.getElementById('resultado-restante');

  function updateResultado() {
    var quantidade = Number(quantidadeInput.value) || 0;
    resultadoAntesEl.textContent = formatInt(record.pendente) + ' ' + unitLower;
    resultadoAgoraEl.textContent = formatInt(quantidade) + ' ' + unitLower;
    resultadoRestanteEl.textContent = formatInt(Math.max(0, record.pendente - quantidade)) + ' ' + unitLower;
  }
  updateResultado();

  quantidadeInput.addEventListener('input', function () {
    quantidadeField.classList.remove('error');
    updateTotalKg();
    updateResultado();
  });

  // ---------- Documento / NF-e: campo aberto (nunca mais radio Gerar
  // agora/depois) — o número, quando informado, é exibido depois no
  // histórico de entregas do compromisso. ----------
  var documentoInput = document.getElementById('entrega-documento-input');

  // ---------- Submit ----------
  document.getElementById('entrega-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var isValid = true;

    var quantidade = Number(quantidadeInput.value);
    var quantidadeInvalid = !(quantidade > 0 && quantidade <= record.pendente);
    quantidadeField.classList.toggle('error', quantidadeInvalid);
    if (quantidadeInvalid) isValid = false;

    var depositoInvalid = !depositoField.dataset.value;
    depositoField.classList.toggle('error', depositoInvalid);
    if (depositoInvalid) isValid = false;

    if (!isValid) {
      var firstError = document.querySelector('.wrapper.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var numeroNfe = documentoInput.value.trim() || null;
    var observacao = document.getElementById('entrega-observacao-input').value.trim() || null;

    window.NiveloEstoqueComprometidoV2.registrarEntrega(record.codigo, {
      quantidade: quantidade,
      data: entregaDataInput.value || todayISO(),
      deposito: depositoField.dataset.value,
      documento: numeroNfe ? { numero: numeroNfe } : null,
      observacao: observacao
    });

    var mensagem = formatInt(quantidade) + ' ' + unitLower + ' de ' + record.produto + ' entregues a ' + record.cliente + '.';
    try {
      sessionStorage.setItem('nivelo.estoquev2.entrega.success', mensagem);
    } catch (e) {}
    window.location.href = 'estoque-v2.html#tab=comprometido';
  });
})();
