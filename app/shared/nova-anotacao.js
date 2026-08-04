(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de novo-estoque.js/
  // novo-cadastro.js: wrapper/trigger/menu/option/open, menu em
  // `position:fixed` calculado via JS pra escapar do `overflow:hidden` de
  // `.card`). ----------
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

    return { selectOption: selectOption, root: root, trigger: trigger, menu: menu };
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  // ---------- Data e hora: automática, só leitura ----------
  var dataHoraInput = document.getElementById('na-data-hora');
  var agora = new Date();
  var dataHoraISO = agora.getFullYear() + '-' + pad2(agora.getMonth() + 1) + '-' + pad2(agora.getDate()) +
    'T' + pad2(agora.getHours()) + ':' + pad2(agora.getMinutes()) + ':' + pad2(agora.getSeconds());
  dataHoraInput.value = pad2(agora.getDate()) + '/' + pad2(agora.getMonth() + 1) + '/' + agora.getFullYear() +
    ' às ' + pad2(agora.getHours()) + ':' + pad2(agora.getMinutes());

  // ---------- Fazenda / Talhão (dependente) ----------
  var fazendaField = document.getElementById('fazenda-field');
  var fazendaMenu = document.getElementById('fazenda-menu');
  var talhaoField = document.getElementById('talhao-field');
  var talhaoMenu = document.getElementById('talhao-menu');

  var fazendas = window.NiveloFazendas.list();
  fazendaMenu.innerHTML = fazendas.map(function (f) {
    return '<div class="option" data-value="' + f.id + '">' + f.nome + '</div>';
  }).join('');

  function findFazenda(id) {
    return fazendas.filter(function (f) { return f.id === id; })[0] || null;
  }

  function populateTalhoes(fazenda) {
    var talhoes = fazenda ? fazenda.talhoes : [];
    talhaoMenu.innerHTML = talhoes.map(function (t) {
      return '<div class="option" data-value="' + t.id + '">' + t.nome + '</div>';
    }).join('');
    talhaoDropdown.trigger.disabled = !fazenda;
    talhaoField.dataset.value = '';
    talhaoField.querySelector('[data-dropdown-value]').textContent = 'Selecione o talhão';
    talhaoField.querySelector('[data-dropdown-value]').classList.add('placeholder');
    talhaoField.classList.remove('error');
    resetCultura();
  }

  var talhaoDropdown = initDropdown(talhaoField, function (talhaoId) {
    talhaoField.classList.remove('error');
    var fazenda = findFazenda(fazendaField.dataset.value);
    var talhao = fazenda ? fazenda.talhoes.filter(function (t) { return t.id === talhaoId; })[0] : null;
    applyCulturaDefault(fazenda, talhao);
  });

  var fazendaDropdown = initDropdown(fazendaField, function (fazendaId) {
    fazendaField.classList.remove('error');
    populateTalhoes(findFazenda(fazendaId));
  });

  // ---------- Cultura: opções vêm do catálogo de Produtos (categoria
  // "Grãos", só ativos) — ver produtos-data.js. Fica desabilitada até um
  // Talhão ser escolhido, porque o valor padrão depende de qual talhão. ----------
  var culturaField = document.getElementById('cultura-field');
  var culturaMenu = document.getElementById('cultura-menu');
  var culturaDropdown = initDropdown(culturaField, function () {
    culturaField.classList.remove('error');
  });

  var CULTURAS = window.NiveloProdutos.list()
    .filter(function (p) { return p.categoria === 'Grãos' && p.status === 'ativo'; })
    .map(function (p) { return p.nome; });

  culturaMenu.innerHTML = CULTURAS.map(function (nome) {
    return '<div class="option" data-value="' + nome + '">' + nome + '</div>';
  }).join('');

  function resetCultura() {
    culturaDropdown.trigger.disabled = true;
    culturaField.dataset.value = '';
    culturaField.querySelector('[data-dropdown-value]').textContent = 'Selecione o talhão primeiro';
    culturaField.querySelector('[data-dropdown-value]').classList.add('placeholder');
    culturaField.classList.remove('error');
  }

  // Pré-seleciona a cultura da anotação mais recente daquele talhão; se o
  // talhão ainda não tem nenhuma anotação, cai pro `talhao.cultura` estático
  // (fazendas-data.js) — pedido explícito: "assumir automaticamente a
  // última cultura utilizada para aquele talhão". O usuário continua livre
  // pra trocar antes de salvar.
  function applyCulturaDefault(fazenda, talhao) {
    // Sempre reseta antes de aplicar o novo default — sem isso, trocar de
    // talhão sem limpar deixava a cultura do talhão ANTERIOR selecionada
    // quando o novo talhão não tinha nenhum default próprio.
    culturaDropdown.trigger.disabled = false;
    culturaField.dataset.value = '';
    culturaField.querySelector('[data-dropdown-value]').textContent = 'Selecione a cultura';
    culturaField.querySelector('[data-dropdown-value]').classList.add('placeholder');
    Array.prototype.slice.call(culturaMenu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });

    if (!fazenda || !talhao) return;
    var ultima = window.NiveloCaderno.findUltimaCultura(fazenda.id, talhao.id) || talhao.cultura;
    if (!ultima) return;
    var optionEl = culturaMenu.querySelector('.option[data-value="' + ultima + '"]');
    if (optionEl) culturaDropdown.selectOption(optionEl);
  }

  // Só agora (Fazenda/Talhão/Cultura já montados) inicializa o estado vazio
  // de Talhão/Cultura — `populateTalhoes` chama `resetCultura`, que precisa
  // de `culturaDropdown` já existir.
  populateTalhoes(null);

  // ---------- Safra: opções vêm do catálogo compartilhado
  // (window.NiveloSafras, persistido em localStorage) + item fixo "+
  // Adicionar nova safra", mesmo padrão de "Adicionar nova categoria" em
  // novo-produto.js. ----------
  var safraField = document.getElementById('safra-field');
  var safraMenu = document.getElementById('safra-menu');
  var safraTrigger = safraField.querySelector('[data-dropdown-trigger]');
  var safraValueEl = safraField.querySelector('[data-dropdown-value]');

  function renderSafraOptions() {
    var html = window.NiveloSafras.list().map(function (nome) {
      return '<div class="option" data-value="' + nome + '">' + nome + '</div>';
    }).join('');
    html += '<div class="nova-anotacao-safra-option-create" data-add-safra>' +
      '<i data-lucide="plus" width="14" height="14"></i> Adicionar nova safra</div>';
    safraMenu.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
  renderSafraOptions();

  function selectSafra(nome) {
    var existing = Array.prototype.slice.call(safraMenu.querySelectorAll('.option'));
    existing.forEach(function (o) { o.classList.remove('selected'); });
    var optionEl = safraMenu.querySelector('.option[data-value="' + nome + '"]');
    if (optionEl) optionEl.classList.add('selected');
    safraValueEl.textContent = nome;
    safraValueEl.classList.remove('placeholder');
    safraField.dataset.value = nome;
    safraField.classList.remove('error');
  }

  var novaSafraOverlay = document.getElementById('nova-safra-overlay');
  var novaSafraNomeInput = document.getElementById('nova-safra-nome');
  var novaSafraNomeField = document.getElementById('nova-safra-nome-field');

  function openNovaSafraDialog() {
    safraField.classList.remove('open');
    novaSafraNomeInput.value = '';
    novaSafraNomeField.classList.remove('error');
    novaSafraOverlay.hidden = false;
    novaSafraNomeInput.focus();
  }
  function closeNovaSafraDialog() {
    novaSafraOverlay.hidden = true;
  }

  safraTrigger.addEventListener('click', function () {
    safraField.classList.toggle('open');
  });
  safraMenu.addEventListener('click', function (event) {
    if (event.target.closest('[data-add-safra]')) {
      openNovaSafraDialog();
      return;
    }
    var optionEl = event.target.closest('.option');
    if (optionEl) {
      selectSafra(optionEl.dataset.value);
      safraField.classList.remove('open');
    }
  });
  document.addEventListener('click', function (event) {
    if (!safraField.contains(event.target)) safraField.classList.remove('open');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') safraField.classList.remove('open');
  });

  document.getElementById('nova-safra-close').addEventListener('click', closeNovaSafraDialog);
  document.getElementById('nova-safra-cancel').addEventListener('click', closeNovaSafraDialog);
  document.getElementById('nova-safra-add').addEventListener('click', function () {
    var nome = novaSafraNomeInput.value.trim();
    novaSafraNomeField.classList.toggle('error', !nome);
    if (!nome) return;

    window.NiveloSafras.add(nome);
    renderSafraOptions();
    selectSafra(nome);
    closeNovaSafraDialog();
  });

  // ---------- Tipo de anotação: cards selecionáveis (Despesa/Venda/Colheita) ----------
  var tipoInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-anotacao"]'));
  var valorField = document.getElementById('valor-field');
  var quantidadeField = document.getElementById('quantidade-field');
  var unidadeField = document.getElementById('unidade-field');
  var unidadeDropdown = initDropdown(unidadeField, function () {
    unidadeField.classList.remove('error');
  });

  function currentTipo() {
    var checked = tipoInputs.filter(function (i) { return i.checked; })[0];
    return checked ? checked.value : 'despesa';
  }

  function updateTipoFields() {
    var tipo = currentTipo();
    tipoInputs.forEach(function (input) {
      input.closest('.nova-anotacao-tipo-card').classList.toggle('is-selected', input.checked);
    });
    var isColheita = tipo === 'colheita';
    valorField.hidden = isColheita;
    quantidadeField.hidden = !isColheita;
    unidadeField.hidden = !isColheita;
  }

  tipoInputs.forEach(function (input) {
    input.addEventListener('change', updateTipoFields);
  });
  updateTipoFields();

  // ---------- Valor: máscara de moeda (R$), mesma técnica de novo-estoque.js ----------
  var valorInput = document.getElementById('na-valor');
  var valorCentavos = 0;

  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  valorInput.addEventListener('input', function () {
    var digits = valorInput.value.replace(/\D/g, '');
    valorCentavos = digits ? Number(digits) : 0;
    valorInput.value = valorCentavos ? formatCentavosBRL(valorCentavos) : '';
    if (valorCentavos > 0) valorField.classList.remove('error');
  });

  var quantidadeInput = document.getElementById('na-quantidade');
  quantidadeInput.addEventListener('input', function () {
    if (Number(quantidadeInput.value) > 0) quantidadeField.classList.remove('error');
  });

  // ---------- Pré-seleção via query string (?fazenda=&talhao=) — vindo do
  // botão "Nova Anotação" da fazenda ou do talhão. Só pré-seleciona, os
  // campos continuam editáveis (o usuário pode trocar antes de salvar). ----------
  var params = new URLSearchParams(location.search);
  var presetFazendaId = params.get('fazenda');
  var presetTalhaoId = params.get('talhao');

  if (presetFazendaId && findFazenda(presetFazendaId)) {
    var fazendaOption = fazendaMenu.querySelector('.option[data-value="' + presetFazendaId + '"]');
    if (fazendaOption) fazendaDropdown.selectOption(fazendaOption);
    if (presetTalhaoId) {
      var talhaoOption = talhaoMenu.querySelector('.option[data-value="' + presetTalhaoId + '"]');
      if (talhaoOption) talhaoDropdown.selectOption(talhaoOption);
    }
  }

  // `?tipo=` (opcional, só pra variantes de demonstração no prototype-nav)
  // pré-seleciona o card de Tipo de anotação — mesma convenção de outros
  // params de pré-preenchimento desta tela, nunca obrigatório.
  var presetTipo = params.get('tipo');
  if (presetTipo) {
    var tipoInputPreset = tipoInputs.filter(function (i) { return i.value === presetTipo; })[0];
    if (tipoInputPreset) {
      tipoInputPreset.checked = true;
      updateTipoFields();
    }
  }

  // ---------- Origem: pra onde "Cancelar"/"Voltar" e o redirecionamento
  // pós-salvar apontam. Prioriza o talhão (contexto mais específico), depois
  // a fazenda, senão volta pro Caderno de Campo. ----------
  function origemUrl() {
    if (presetTalhaoId && presetFazendaId) return 'talhao-detalhe.html#fazenda=' + presetFazendaId + '&talhao=' + presetTalhaoId;
    if (presetFazendaId) return 'fazenda-detalhe.html#id=' + presetFazendaId;
    return 'caderno-de-campo.html';
  }

  document.getElementById('nova-anotacao-back').href = origemUrl();
  document.getElementById('nova-anotacao-cancel').href = origemUrl();

  // ---------- Submit ----------
  document.getElementById('nova-anotacao-form').addEventListener('submit', function (event) {
    event.preventDefault();

    var isValid = true;
    var tipo = currentTipo();

    // `.errorText` só aparece quando o `.wrapper` ganha `.error` via JS
    // (mesmo padrão de novo-estoque.js/novo-cadastro.js — nunca `.hidden`
    // direto no span, ver page-nova-anotacao.css).
    var fazendaInvalid = !fazendaField.dataset.value;
    fazendaField.classList.toggle('error', fazendaInvalid);
    if (fazendaInvalid) isValid = false;

    var talhaoInvalid = !talhaoField.dataset.value;
    talhaoField.classList.toggle('error', talhaoInvalid);
    if (talhaoInvalid) isValid = false;

    var culturaInvalid = !culturaField.dataset.value;
    culturaField.classList.toggle('error', culturaInvalid);
    if (culturaInvalid) isValid = false;

    var safraInvalid = !safraField.dataset.value;
    safraField.classList.toggle('error', safraInvalid);
    if (safraInvalid) isValid = false;

    if (tipo === 'colheita') {
      var quantidadeInvalid = !(Number(quantidadeInput.value) > 0);
      quantidadeField.classList.toggle('error', quantidadeInvalid);
      if (quantidadeInvalid) isValid = false;

      var unidadeInvalid = !unidadeField.dataset.value;
      unidadeField.classList.toggle('error', unidadeInvalid);
      if (unidadeInvalid) isValid = false;

      valorField.classList.remove('error');
    } else {
      var valorInvalid = !(valorCentavos > 0);
      valorField.classList.toggle('error', valorInvalid);
      if (valorInvalid) isValid = false;

      quantidadeField.classList.remove('error');
      unidadeField.classList.remove('error');
    }

    if (!isValid) return;

    var anotacao = {
      fazendaId: fazendaField.dataset.value,
      talhaoId: talhaoField.dataset.value,
      tipo: tipo,
      observacao: document.getElementById('na-observacao').value.trim(),
      cultura: culturaField.dataset.value,
      safra: safraField.dataset.value,
      dataHora: dataHoraISO
    };

    if (tipo === 'colheita') {
      anotacao.quantidade = Number(quantidadeInput.value);
      anotacao.unidade = unidadeField.dataset.value;
    } else {
      anotacao.valor = valorCentavos / 100;
    }

    window.NiveloCaderno.add(anotacao);
    sessionStorage.setItem('nivelo.novaanotacao.success', 'Anotação registrada com sucesso.');
    window.location.href = origemUrl();
  });
})();
