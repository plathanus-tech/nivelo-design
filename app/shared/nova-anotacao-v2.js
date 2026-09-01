(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Sigla de unidade dinâmica por produto — nunca hardcoded "sc"/"kg" fora
  // deste mapa único (mesmo princípio já usado no card "Produção / Colheita"
  // do Dashboard: a unidade sempre deriva do produto escolhido).
  var UNIDADE_SIGLA = { 'Saca': 'sc', 'Kg': 'kg', 'Litro': 'L', 'Unidade': 'un' };
  function siglaUnidade(nomeUnidade) {
    return UNIDADE_SIGLA[nomeUnidade] || (nomeUnidade || '').toLowerCase();
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  // ---------- Dropdown genérico (mesmo padrão de nova-anotacao.js/
  // novo-estoque.js) ----------
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
      if (optionEl) selectOption(optionEl);
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
    return { selectOption: selectOption, root: root, trigger: trigger, menu: menu };
  }

  // ---------- Combobox de Produto (Aplicação de insumo) — input de texto +
  // menu filtrado, mesmo espírito do combobox de Produto já usado em
  // novo-estoque.js/nova-conta-pagar.js (busca com o menu em `position:fixed`). ----------
  function initProductCombobox(rootId, inputId, menuId, produtos, onSelect) {
    var root = document.getElementById(rootId);
    var input = document.getElementById(inputId);
    var menu = document.getElementById(menuId);
    var selected = null;

    function renderMenu(filterText) {
      var normalized = (filterText || '').trim().toLowerCase();
      var filtrados = produtos.filter(function (p) { return p.nome.toLowerCase().indexOf(normalized) !== -1; });
      if (!filtrados.length) {
        menu.innerHTML = '<div class="option-empty text-body-s">Nenhum produto encontrado.</div>';
      } else {
        menu.innerHTML = filtrados.map(function (p) {
          return '<div class="option" data-sku="' + p.sku + '">' + p.nome + '</div>';
        }).join('');
      }
    }

    function positionMenu() {
      var rect = input.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = '240px';
      menu.style.overflowY = 'auto';
    }

    function open() {
      renderMenu(input.value);
      positionMenu();
      root.classList.add('open');
    }
    function close() { root.classList.remove('open'); }

    input.addEventListener('focus', open);
    input.addEventListener('input', function () {
      selected = null;
      open();
    });
    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option[data-sku]');
      if (!optionEl) return;
      var produto = produtos.filter(function (p) { return p.sku === optionEl.dataset.sku; })[0];
      if (!produto) return;
      selected = produto;
      input.value = produto.nome;
      close();
      if (onSelect) onSelect(produto);
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    window.addEventListener('scroll', function () { if (root.classList.contains('open')) positionMenu(); }, true);
    window.addEventListener('resize', function () { if (root.classList.contains('open')) positionMenu(); });

    return {
      getSelected: function () { return selected; },
      clear: function () { selected = null; input.value = ''; }
    };
  }

  // ---------- Contexto: Fazenda/Talhão/Cultura/Safra vindos SEMPRE de
  // ?fazenda=&talhao= — não existe seleção nesta tela, nem entrada
  // farm-only. ----------
  var params = new URLSearchParams(location.search);
  var fazendaId = params.get('fazenda');
  var talhaoId = params.get('talhao');

  var fazenda = fazendaId ? window.NiveloFazendas.findById(fazendaId) : null;
  var talhao = fazenda && talhaoId ? fazenda.talhoes.filter(function (t) { return t.id === talhaoId; })[0] : null;

  if (!fazenda || !talhao) {
    document.getElementById('nova-anotacao-sem-talhao').hidden = false;
    document.getElementById('nova-anotacao-form').hidden = true;
    return;
  }

  document.getElementById('na-fazenda').value = fazenda.nome;
  document.getElementById('na-talhao').value = talhao.nome;
  document.getElementById('na-cultura').value = talhao.cultura || 'Sem cultura';
  document.getElementById('na-safra').value = talhao.safra || '—';

  var origemUrl = 'talhao-detalhe-v2.html#fazenda=' + fazendaId + '&talhao=' + talhaoId;
  document.getElementById('nova-anotacao-back').href = origemUrl;
  document.getElementById('nova-anotacao-cancel').href = origemUrl;

  // ---------- Data e hora: automática ----------
  var agora = new Date();
  var dataHoraISO = agora.getFullYear() + '-' + pad2(agora.getMonth() + 1) + '-' + pad2(agora.getDate()) +
    'T' + pad2(agora.getHours()) + ':' + pad2(agora.getMinutes()) + ':' + pad2(agora.getSeconds());
  document.getElementById('na-data-hora').value = pad2(agora.getDate()) + '/' + pad2(agora.getMonth() + 1) + '/' + agora.getFullYear() +
    ' às ' + pad2(agora.getHours()) + ':' + pad2(agora.getMinutes());

  // ---------- Tipo de registro ----------
  var tipoInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-registro"]'));
  var secaoAnotacao = document.getElementById('secao-anotacao');
  var secaoInsumo = document.getElementById('secao-insumo');
  var secaoDespesa = document.getElementById('secao-despesa');
  var secaoColheita = document.getElementById('secao-colheita');

  function currentTipo() {
    var checked = tipoInputs.filter(function (i) { return i.checked; })[0];
    return checked ? checked.value : 'anotacao';
  }

  function clearErrors() {
    Array.prototype.slice.call(document.querySelectorAll('.wrapper.error')).forEach(function (w) { w.classList.remove('error'); });
  }

  function updateTipoFields() {
    var tipo = currentTipo();
    tipoInputs.forEach(function (input) {
      input.closest('.nova-anotacao-tipo-card').classList.toggle('is-selected', input.checked);
    });
    secaoAnotacao.hidden = tipo !== 'anotacao';
    secaoInsumo.hidden = tipo !== 'aplicacao-insumo';
    secaoDespesa.hidden = tipo !== 'despesa-manual';
    secaoColheita.hidden = tipo !== 'colheita';
    clearErrors();
  }
  tipoInputs.forEach(function (input) { input.addEventListener('change', updateTipoFields); });
  updateTipoFields();

  // ---------- Aplicação de insumo: Produto (combobox) + Quantidade +
  // Unidade (auto) + Depósito (dropdown) + Custo calculado (auto) ----------
  var produtoInsumoField = document.getElementById('produto-insumo-field');
  var unidadeInsumoInput = document.getElementById('na-unidade-insumo');
  var custoCalculadoInput = document.getElementById('na-custo-calculado');
  var quantidadeInsumoInput = document.getElementById('na-quantidade-insumo');

  function formatBRL(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function recalcularCustoInsumo() {
    var produto = produtoInsumoCombobox.getSelected();
    var quantidade = Number(quantidadeInsumoInput.value) || 0;
    if (!produto || !quantidade) {
      custoCalculadoInput.value = '';
      return;
    }
    var custoMedio = window.NiveloCadernoV2.getCustoMedioBySku(produto.sku);
    custoCalculadoInput.value = formatBRL(custoMedio * quantidade);
  }

  var produtoInsumoCombobox = initProductCombobox('produto-insumo-field', 'na-produto-insumo', 'produto-insumo-menu',
    window.NiveloProdutos.list(),
    function (produto) {
      produtoInsumoField.classList.remove('error');
      unidadeInsumoInput.value = siglaUnidade(produto.unidade);
      recalcularCustoInsumo();
    }
  );
  quantidadeInsumoInput.addEventListener('input', function () {
    if (Number(quantidadeInsumoInput.value) > 0) document.getElementById('quantidade-insumo-field').classList.remove('error');
    recalcularCustoInsumo();
  });

  // ---------- Depósito (Configurações > Depósitos, só ativos) ----------
  var depositoField = document.getElementById('deposito-field');
  var depositoMenu = document.getElementById('deposito-menu');
  var depositosAtivos = window.NiveloLocais.list().filter(function (l) { return l.ativo !== false; });
  depositoMenu.innerHTML = depositosAtivos.map(function (l) {
    return '<div class="option" data-value="' + l.nome + '">' + l.nome + '</div>';
  }).join('');
  var depositoDropdown = initDropdown(depositoField, function () {
    depositoField.classList.remove('error');
  });

  // ---------- Despesa manual: Categoria + Valor (máscara) ----------
  var categoriaDespesaField = document.getElementById('categoria-despesa-field');
  var categoriaDespesaDropdown = initDropdown(categoriaDespesaField, function () {
    categoriaDespesaField.classList.remove('error');
  });

  var valorDespesaField = document.getElementById('valor-despesa-field');
  var valorDespesaInput = document.getElementById('na-valor-despesa');
  var valorDespesaCentavos = 0;
  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  valorDespesaInput.addEventListener('input', function () {
    var digits = valorDespesaInput.value.replace(/\D/g, '');
    valorDespesaCentavos = digits ? Number(digits) : 0;
    valorDespesaInput.value = valorDespesaCentavos ? formatCentavosBRL(valorDespesaCentavos) : '';
    if (valorDespesaCentavos > 0) valorDespesaField.classList.remove('error');
  });

  // ---------- Colheita: Produto (dropdown, categoria Grãos) + Quantidade +
  // Unidade (auto) ----------
  var produtoColheitaField = document.getElementById('produto-colheita-field');
  var produtoColheitaMenu = document.getElementById('produto-colheita-menu');
  var unidadeColheitaInput = document.getElementById('na-unidade-colheita');
  var quantidadeColheitaInput = document.getElementById('na-quantidade-colheita');

  var PRODUTOS_GRAOS = window.NiveloProdutos.list().filter(function (p) { return p.categoria === 'Grãos' && p.status === 'ativo'; });
  produtoColheitaMenu.innerHTML = PRODUTOS_GRAOS.map(function (p) {
    return '<div class="option" data-value="' + p.sku + '">' + p.nome + '</div>';
  }).join('');
  var produtoColheitaDropdown = initDropdown(produtoColheitaField, function (sku) {
    produtoColheitaField.classList.remove('error');
    var produto = PRODUTOS_GRAOS.filter(function (p) { return p.sku === sku; })[0];
    unidadeColheitaInput.value = produto ? siglaUnidade(produto.unidade) : '';
  });
  quantidadeColheitaInput.addEventListener('input', function () {
    if (Number(quantidadeColheitaInput.value) > 0) document.getElementById('quantidade-colheita-field').classList.remove('error');
  });

  // Pré-seleciona a cultura atual do talhão, se ela existir no catálogo de
  // Grãos — só uma conveniência, o usuário pode trocar livremente.
  if (talhao.cultura) {
    var culturaOption = produtoColheitaMenu.querySelector('.option[data-value]');
    var matching = PRODUTOS_GRAOS.filter(function (p) { return p.nome === talhao.cultura; })[0];
    if (matching) {
      var optionEl = produtoColheitaMenu.querySelector('.option[data-value="' + matching.sku + '"]');
      if (optionEl) produtoColheitaDropdown.selectOption(optionEl);
    }
  }

  var tituloInput = document.getElementById('na-titulo');
  var tituloField = document.getElementById('titulo-field');
  tituloInput.addEventListener('input', function () {
    if (tituloInput.value.trim()) tituloField.classList.remove('error');
  });
  var descricaoInput = document.getElementById('na-descricao');
  var descricaoField = document.getElementById('descricao-field');
  descricaoInput.addEventListener('input', function () {
    if (descricaoInput.value.trim()) descricaoField.classList.remove('error');
  });

  // ---------- Submit ----------
  document.getElementById('nova-anotacao-form').addEventListener('submit', function (event) {
    event.preventDefault();

    var isValid = true;
    var tipo = currentTipo();

    function markInvalid(fieldEl, condition) {
      fieldEl.classList.toggle('error', condition);
      if (condition) isValid = false;
    }

    if (tipo === 'anotacao') {
      markInvalid(tituloField, !tituloInput.value.trim());
      markInvalid(descricaoField, !descricaoInput.value.trim());
    } else if (tipo === 'aplicacao-insumo') {
      markInvalid(produtoInsumoField, !produtoInsumoCombobox.getSelected());
      markInvalid(document.getElementById('quantidade-insumo-field'), !(Number(quantidadeInsumoInput.value) > 0));
      markInvalid(depositoField, !depositoField.dataset.value);
    } else if (tipo === 'despesa-manual') {
      markInvalid(categoriaDespesaField, !categoriaDespesaField.dataset.value);
      markInvalid(valorDespesaField, !(valorDespesaCentavos > 0));
    } else if (tipo === 'colheita') {
      markInvalid(produtoColheitaField, !produtoColheitaField.dataset.value);
      markInvalid(document.getElementById('quantidade-colheita-field'), !(Number(quantidadeColheitaInput.value) > 0));
    }

    if (!isValid) return;

    var registro = {
      fazendaId: fazendaId,
      talhaoId: talhaoId,
      tipo: tipo,
      cultura: talhao.cultura || null,
      safra: talhao.safra || null,
      dataHora: dataHoraISO
    };

    if (tipo === 'anotacao') {
      registro.titulo = tituloInput.value.trim();
      registro.descricao = descricaoInput.value.trim();
    } else if (tipo === 'aplicacao-insumo') {
      var produto = produtoInsumoCombobox.getSelected();
      var quantidade = Number(quantidadeInsumoInput.value);
      registro.produtoSku = produto.sku;
      registro.produtoNome = produto.nome;
      registro.quantidade = quantidade;
      registro.unidade = siglaUnidade(produto.unidade);
      registro.depositoNome = depositoField.dataset.value;
      registro.custoCalculado = window.NiveloCadernoV2.getCustoMedioBySku(produto.sku) * quantidade;
    } else if (tipo === 'despesa-manual') {
      registro.categoria = categoriaDespesaField.dataset.value;
      registro.valor = valorDespesaCentavos / 100;
      registro.observacao = document.getElementById('na-observacao-despesa').value.trim();
    } else if (tipo === 'colheita') {
      var produtoColheita = PRODUTOS_GRAOS.filter(function (p) { return p.sku === produtoColheitaField.dataset.value; })[0];
      registro.produtoSku = produtoColheita.sku;
      registro.produtoNome = produtoColheita.nome;
      registro.quantidade = Number(quantidadeColheitaInput.value);
      registro.unidade = siglaUnidade(produtoColheita.unidade);
    }

    window.NiveloCadernoV2.add(registro);
    sessionStorage.setItem('nivelo.novaanotacaov2.success', 'Registro salvo com sucesso.');
    window.location.href = origemUrl;
  });
})();
