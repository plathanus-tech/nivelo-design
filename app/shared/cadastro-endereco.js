(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('address-form');
  var submitBtn = document.getElementById('address-submit');

  var REQUIRED_FIELDS = [
    { fieldId: 'cep-field', inputId: 'address-cep', message: 'Informe o CEP.' },
    { fieldId: 'street-field', inputId: 'address-street', message: 'Informe a rua.' },
    { fieldId: 'number-field', inputId: 'address-number', message: 'Informe o número.' },
    { fieldId: 'district-field', inputId: 'address-district', message: 'Informe o bairro.' },
    { fieldId: 'city-field', inputId: 'address-city', message: 'Informe a cidade.' },
    { fieldId: 'state-field', inputId: 'address-state', message: 'Informe o estado.' }
  ].map(function (item) {
    return {
      field: document.getElementById(item.fieldId),
      input: document.getElementById(item.inputId),
      message: item.message
    };
  });

  function setFieldError(field, input, hasError) {
    field.classList.toggle('error', hasError);
    input.setAttribute('aria-invalid', String(hasError));
  }

  // ---------- Máscara de CEP ----------
  var cepInput = document.getElementById('address-cep');
  function formatCEP(value) {
    var digits = value.replace(/\D/g, '').slice(0, 8);
    var out = digits.slice(0, 5);
    if (digits.length > 5) out += '-' + digits.slice(5, 8);
    return out;
  }

  // ---------- Estado (UF): sempre maiúsculo ----------
  var stateInput = document.getElementById('address-state');
  stateInput.addEventListener('input', function () {
    stateInput.value = stateInput.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  });

  // ---------- Preenchimento automático via CEP (ViaCEP) ----------
  // Consulta pública, sem autenticação. Preenche só os campos que a API
  // devolveu (nem todo CEP tem logradouro/bairro, ex: CEPs gerais de
  // cidade) e só quando ainda vazios, pra nunca sobrescrever algo que o
  // usuário já tenha digitado/corrigido manualmente. Todos os campos
  // continuam editáveis depois do preenchimento.
  var streetInput = document.getElementById('address-street');
  var districtInput = document.getElementById('address-district');
  var cityInput = document.getElementById('address-city');
  var streetField = document.getElementById('street-field');
  var districtField = document.getElementById('district-field');
  var cityField = document.getElementById('city-field');
  var stateField = document.getElementById('state-field');

  function fillIfEmpty(input, field, value) {
    if (!value || input.value.trim()) return;
    input.value = value;
    setFieldError(field, input, false);
  }

  function lookupCEP(digits) {
    fetch('https://viacep.com.br/ws/' + digits + '/json/')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || data.erro) return;
        fillIfEmpty(streetInput, streetField, data.logradouro);
        fillIfEmpty(districtInput, districtField, data.bairro);
        fillIfEmpty(cityInput, cityField, data.localidade);
        fillIfEmpty(stateInput, stateField, data.uf);
      })
      .catch(function () {
        // Falha na consulta (offline, CEP inexistente etc.): os campos
        // seguem vazios/editáveis pra preenchimento manual, sem travar o fluxo.
      });
  }

  cepInput.addEventListener('input', function () {
    cepInput.value = formatCEP(cepInput.value);
    var digits = cepInput.value.replace(/\D/g, '');
    if (digits.length === 8) lookupCEP(digits);
  });

  REQUIRED_FIELDS.forEach(function (item) {
    item.input.addEventListener('input', function () {
      if (item.field.classList.contains('error') && item.input.value.trim()) {
        setFieldError(item.field, item.input, false);
      }
    });
  });

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var hasError = false;
    REQUIRED_FIELDS.forEach(function (item) {
      var invalid = !item.input.value.trim();
      setFieldError(item.field, item.input, invalid);
      if (invalid) hasError = true;
    });

    if (hasError) return;

    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;

    window.setTimeout(function () {
      try {
        sessionStorage.setItem('nivelo.signup.city', document.getElementById('address-city').value.trim());
        sessionStorage.setItem('nivelo.signup.state', document.getElementById('address-state').value.trim());
      } catch (e) {}
      window.location.href = 'cadastro-planos.html';
    }, 500);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | required
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'required') {
    REQUIRED_FIELDS.forEach(function (item) {
      setFieldError(item.field, item.input, true);
    });
  }
})();
