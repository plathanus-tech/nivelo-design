(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var params = new URLSearchParams(location.search);
  var editNomeOriginal = params.get('nome');
  var isEdit = !!editNomeOriginal;

  if (isEdit) {
    document.getElementById('ndep-page-title').textContent = 'Editar depósito';
    document.getElementById('ndep-page-subtitle').textContent = 'Atualize os dados deste depósito ou local de estoque.';
    document.title = 'Editar depósito — Nivelo';
  }

  // ---------- Dropdown genérico (mesmo padrão do resto do sistema,
  // position:fixed via JS pra escapar de qualquer overflow:hidden). ----------
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

    function setValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
    }

    return { selectOption: selectOption, setValue: setValue };
  }

  var tipoField = document.getElementById('tipo-field');
  var tipoDropdown = initDropdown(tipoField);

  var usoField = document.getElementById('uso-field');
  var usoDropdown = initDropdown(usoField);

  var statusField = document.getElementById('status-field');
  var statusDropdown = initDropdown(statusField);

  // ---------- Fazenda vinculada: populada a partir do catálogo real
  // (window.NiveloFazendas). Opcional — um depósito de terceiro/cooperativa
  // não tem necessariamente uma fazenda própria vinculada. Primeira opção
  // "Nenhuma" permite limpar/deixar sem vínculo. ----------
  var fazendaField = document.getElementById('fazenda-field');
  var fazendaMenu = document.getElementById('fazenda-menu');
  (function populateFazendas() {
    var nenhumaEl = document.createElement('div');
    nenhumaEl.className = 'option';
    nenhumaEl.dataset.value = '';
    nenhumaEl.textContent = 'Nenhuma';
    fazendaMenu.appendChild(nenhumaEl);
    (window.NiveloFazendas ? window.NiveloFazendas.list() : []).forEach(function (fazenda) {
      var optionEl = document.createElement('div');
      optionEl.className = 'option';
      optionEl.dataset.value = fazenda.id;
      optionEl.textContent = fazenda.nome;
      fazendaMenu.appendChild(optionEl);
    });
  })();
  var fazendaDropdown = initDropdown(fazendaField);

  // ---------- Modo edição: pré-preenche todos os campos a partir do nome
  // original (chave de busca, não muda mesmo que o Nome seja editado). Se o
  // depósito não for encontrado, redireciona de volta pra listagem (mesmo
  // padrão de fallback simples já usado em fluxos de edição sem um estado
  // "não encontrado" dedicado). ----------
  var nomeInput = document.getElementById('ndep-nome');
  if (isEdit) {
    var local = window.NiveloLocais.findByNome(editNomeOriginal);
    if (!local) {
      window.location.href = 'depositos.html';
      return;
    }
    nomeInput.value = local.nome;
    tipoDropdown.setValue(local.tipo);
    usoDropdown.setValue(local.uso);
    statusDropdown.setValue(local.ativo ? 'ativo' : 'inativo');
    if (local.fazendaId) fazendaDropdown.setValue(local.fazendaId);
    else fazendaDropdown.setValue('');
  } else {
    // Status padrão Ativo só ao CRIAR — editar mostra o status real do
    // registro (setValue acima), nunca reseta pra Ativo.
    statusDropdown.setValue('ativo');
  }

  // ---------- Validação ----------
  var nomeField = document.getElementById('nome-field');

  function validate() {
    var nomeInvalid = !nomeInput.value.trim();
    nomeField.classList.toggle('error', nomeInvalid);

    var tipoInvalid = !tipoField.dataset.value;
    tipoField.classList.toggle('error', tipoInvalid);

    var usoInvalid = !usoField.dataset.value;
    usoField.classList.toggle('error', usoInvalid);

    var statusInvalid = !statusField.dataset.value;
    statusField.classList.toggle('error', statusInvalid);

    return !nomeInvalid && !tipoInvalid && !usoInvalid && !statusInvalid;
  }

  // ---------- Submit ----------
  var form = document.getElementById('ndep-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;

    var payload = {
      nome: nomeInput.value.trim(),
      tipo: tipoField.dataset.value,
      fazendaId: fazendaField.dataset.value || null,
      uso: usoField.dataset.value,
      ativo: statusField.dataset.value === 'ativo'
    };

    var successMessage;
    var result;
    if (isEdit) {
      result = window.NiveloLocais.update(editNomeOriginal, payload);
      successMessage = 'Depósito atualizado com sucesso.';
    } else {
      result = window.NiveloLocais.addCompleto(payload);
      successMessage = 'Depósito cadastrado com sucesso.';
    }

    if (!result) {
      // Nome duplicado (colidindo com outro depósito já cadastrado).
      nomeField.classList.add('error');
      var nomeErrorEl = document.getElementById('nome-error');
      nomeErrorEl.innerHTML = '<i data-lucide="circle-x" width="14" height="14" class="msgIcon"></i> Já existe um depósito com esse nome.';
      if (window.lucide) lucide.createIcons();
      return;
    }

    try { sessionStorage.setItem('nivelo.novodeposito.success', successMessage); } catch (e) {}
    window.location.href = 'depositos.html';
  });
})();
