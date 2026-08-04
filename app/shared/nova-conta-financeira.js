(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var params = new URLSearchParams(location.search);
  var editCodigo = params.get('codigo');
  var isEdit = !!editCodigo;

  if (isEdit) {
    document.getElementById('ncf-page-title').textContent = 'Editar Conta Financeira';
    document.title = 'Editar Conta Financeira — Nivelo';
  }

  // ---------- Código: readonly, gerado automaticamente. Em modo criação já
  // mostra o próximo código real (preview cosmético — o valor definitivo só
  // é atribuído de verdade dentro de add()). Em modo edição, permite
  // editar só o Nome (pedido explícito), o Código nunca muda. ----------
  var codigoInput = document.getElementById('ncf-codigo');
  var nomeInput = document.getElementById('ncf-nome');
  var nomeField = document.getElementById('nome-field');
  var nomeErrorTextEl = document.getElementById('nome-error-text');

  if (isEdit) {
    var contaFinanceira = window.NiveloContasFinanceiras.findByCodigo(editCodigo);
    if (contaFinanceira) {
      codigoInput.value = contaFinanceira.codigo;
      nomeInput.value = contaFinanceira.nome;
    }
  } else {
    codigoInput.value = window.NiveloContasFinanceiras.nextCodigo();
  }

  // ---------- Validação: obrigatório + duplicidade (ignora maiúsculas/
  // minúsculas e espaços extras, ver isNomeDuplicado()) — mensagens
  // amigáveis, cada motivo com o próprio texto de erro. ----------
  function setNomeError(message) {
    nomeErrorTextEl.textContent = message;
    nomeField.classList.add('error');
  }
  function clearNomeError() {
    nomeField.classList.remove('error');
  }

  function validate() {
    var nome = nomeInput.value.trim();
    if (!nome) {
      setNomeError('Informe o nome da conta financeira.');
      return false;
    }
    if (window.NiveloContasFinanceiras.isNomeDuplicado(nome, isEdit ? editCodigo : null)) {
      setNomeError('Já existe uma conta financeira com este nome.');
      return false;
    }
    clearNomeError();
    return true;
  }

  nomeInput.addEventListener('input', function () {
    if (nomeField.classList.contains('error')) clearNomeError();
  });

  // ---------- Submit ----------
  var form = document.getElementById('ncf-form');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validate()) return;

    var payload = { nome: nomeInput.value.trim() };
    var successMessage;
    if (isEdit) {
      window.NiveloContasFinanceiras.update(editCodigo, payload);
      successMessage = 'Conta financeira editada com sucesso.';
    } else {
      window.NiveloContasFinanceiras.add(payload);
      successMessage = 'Conta financeira cadastrada com sucesso.';
    }

    try { sessionStorage.setItem('nivelo.novacontafinanceira.success', successMessage); } catch (e) {}
    window.location.href = 'contas-financeiras.html';
  });
})();
