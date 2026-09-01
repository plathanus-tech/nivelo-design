(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Campos ----------
  var grupoField = document.getElementById('grupo-field');
  var grupoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="grupo"]'));
  var nomeField = document.getElementById('nome-field');
  var nomeInput = document.getElementById('ncatprod-nome');
  var nomeErrorText = document.getElementById('nome-error');

  // RadioButton.module.css só desenha a bolinha marcada via classe
  // `.checked` no `<label class="option">` (não usa o `:checked` nativo do
  // input) — sem sincronizar essa classe em JS, o clique muda o
  // `input.checked` mas a UI nunca reflete (mesmo bug já documentado
  // dezenas de vezes neste projeto, ex. Estoque round 24/Natureza da
  // Operação round 52).
  function syncRadioChecked() {
    grupoRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function getGrupo() {
    var checked = grupoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'venda';
  }

  function setGrupo(value) {
    var radio = grupoRadios.filter(function (r) { return r.value === value; })[0];
    if (radio) radio.checked = true;
    syncRadioChecked();
  }

  grupoRadios.forEach(function (radio) {
    radio.addEventListener('change', syncRadioChecked);
  });
  syncRadioChecked();

  // ---------- Pré-seleção do Grupo a partir da aba de origem (?grupo=venda|uso) ----------
  var params = new URLSearchParams(location.search);
  var grupoParam = params.get('grupo');
  if (grupoParam === 'venda' || grupoParam === 'uso') {
    setGrupo(grupoParam);
  }

  // ---------- Erro some ao corrigir ----------
  nomeInput.addEventListener('input', function () {
    if (nomeField.classList.contains('error')) {
      nomeField.classList.remove('error');
      nomeErrorText.innerHTML =
        '<i data-lucide="circle-x" width="14" height="14" class="msgIcon"></i>' +
        'Informe o nome da categoria.';
      if (window.lucide) lucide.createIcons();
    }
  });

  // ---------- Validação + envio ----------
  var form = document.getElementById('ncatprod-form');

  function showNomeError(message) {
    nomeErrorText.innerHTML =
      '<i data-lucide="circle-x" width="14" height="14" class="msgIcon"></i>' + message;
    if (window.lucide) lucide.createIcons();
    nomeField.classList.add('error');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var nome = nomeInput.value.trim();
    var grupo = getGrupo();

    if (!nome) {
      showNomeError('Informe o nome da categoria.');
      nomeInput.focus();
      return;
    }

    // Validação de duplicidade: mesmo nome dentro do MESMO grupo é
    // bloqueado; o mesmo nome em grupos diferentes é permitido (pedido
    // explícito).
    if (window.NiveloCategoriasProdutos.isNomeDuplicado(nome, grupo)) {
      showNomeError('Já existe uma categoria com este nome.');
      nomeInput.focus();
      return;
    }

    window.NiveloCategoriasProdutos.add({ nome: nome, grupo: grupo });
    try {
      sessionStorage.setItem('nivelo.novacategoriaproduto.success', 'Categoria cadastrada com sucesso.');
    } catch (e) {}

    window.location.href = 'categorias-produtos.html';
  });
})();
