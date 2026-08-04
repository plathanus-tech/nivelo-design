(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  var form = document.getElementById('plans-form');
  var plansGroup = document.getElementById('plans-group');
  var planCards = Array.prototype.slice.call(document.querySelectorAll('.cadastro-plan-card'));
  var planRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="plan"]'));
  var termsField = document.getElementById('terms-field');
  var termsCheckbox = document.getElementById('plans-terms');
  var termsWrapper = termsCheckbox.closest('.cadastro-terms');
  var submitBtn = document.getElementById('plans-submit');

  // ---------- Seleção de plano (mesmo padrão de estado do RadioButton) ----------
  function selectPlan(value) {
    planCards.forEach(function (card) {
      card.classList.toggle('checked', card.dataset.plan === value);
    });
    plansGroup.classList.remove('error');
  }

  planRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (radio.checked) selectPlan(radio.value);
    });
  });

  function getSelectedPlan() {
    var checked = planRadios.filter(function (radio) { return radio.checked; });
    return checked.length ? checked[0].value : null;
  }

  // Nome exibido do plano (mesmo texto de `.cadastro-plan-name`) — persistido
  // pro Dashboard mostrar exatamente esse nome na badge de teste gratuito,
  // sem o usuário precisar escolher o plano de novo lá.
  var PLAN_LABELS = {
    fiscal: 'Fiscal',
    'fiscal-whatsapp': 'Fiscal + WhatsApp',
    'gestao-completa': 'Gestão Completa',
    'gestao-completa-whatsapp': 'Gestão Completa + WhatsApp'
  };

  // ---------- Checkbox de termos ----------
  termsCheckbox.addEventListener('change', function () {
    termsWrapper.classList.toggle('checked', termsCheckbox.checked);
    if (termsCheckbox.checked) termsField.classList.remove('error');
  });

  // ---------- Modal de Termos/Política (mesmo conteúdo do Step 1) ----------
  var TERMS_CONTENT = {
    terms: {
      title: 'Termos de Uso',
      body:
        '<h3 class="text-subtitle-m">1. Aceitação dos termos</h3>' +
        '<p>Ao criar uma conta na Nivelo, você concorda em utilizar a plataforma de acordo com estes termos, respeitando a legislação vigente e os direitos de outros usuários.</p>' +
        '<h3 class="text-subtitle-m">2. Uso da plataforma</h3>' +
        '<p>A Nivelo oferece ferramentas de gestão financeira, estoque, safra e comercialização para produtores rurais. O uso indevido da plataforma pode resultar na suspensão da conta.</p>' +
        '<h3 class="text-subtitle-m">3. Responsabilidades</h3>' +
        '<p>Você é responsável pela veracidade das informações cadastradas e pela guarda de suas credenciais de acesso.</p>' +
        '<p><em>Conteúdo de exemplo para fins de protótipo.</em></p>'
    },
    privacy: {
      title: 'Política de Privacidade',
      body:
        '<h3 class="text-subtitle-m">1. Coleta de dados</h3>' +
        '<p>Coletamos os dados informados no cadastro (nome, CPF, telefone, endereço) para viabilizar o funcionamento da plataforma e a comunicação com o produtor.</p>' +
        '<h3 class="text-subtitle-m">2. Uso dos dados</h3>' +
        '<p>Seus dados são utilizados exclusivamente para prestação do serviço, emissão de documentos fiscais e comunicação sobre sua conta, nunca compartilhados com terceiros sem consentimento.</p>' +
        '<h3 class="text-subtitle-m">3. Segurança</h3>' +
        '<p>Adotamos medidas técnicas e organizacionais para proteger seus dados de acessos não autorizados, em conformidade com a LGPD.</p>' +
        '<p><em>Conteúdo de exemplo para fins de protótipo.</em></p>'
    }
  };

  var dialogOverlay = document.getElementById('terms-dialog-overlay');
  var dialogTitle = document.getElementById('terms-dialog-title');
  var dialogBody = document.getElementById('terms-dialog-body');

  function openDialog(key) {
    var content = TERMS_CONTENT[key];
    dialogTitle.textContent = content.title;
    dialogBody.innerHTML = content.body;
    dialogOverlay.hidden = false;
  }

  function closeDialog() {
    dialogOverlay.hidden = true;
  }

  document.getElementById('open-terms-link').addEventListener('click', function () { openDialog('terms'); });
  document.getElementById('open-privacy-link').addEventListener('click', function () { openDialog('privacy'); });
  document.getElementById('terms-dialog-close').addEventListener('click', closeDialog);
  document.getElementById('terms-dialog-ok').addEventListener('click', closeDialog);
  dialogOverlay.addEventListener('click', function (event) {
    if (event.target === dialogOverlay) closeDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !dialogOverlay.hidden) closeDialog();
  });

  // ---------- Submit ----------
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var hasError = false;

    if (!getSelectedPlan()) {
      plansGroup.classList.add('error');
      hasError = true;
    }
    if (!termsCheckbox.checked) {
      termsField.classList.add('error');
      hasError = true;
    }

    if (hasError) return;

    form.setAttribute('data-state', 'loading');
    submitBtn.disabled = true;

    window.setTimeout(function () {
      try {
        sessionStorage.setItem('nivelo.signup.success', '1');
        sessionStorage.setItem('nivelo.signup.plan', PLAN_LABELS[getSelectedPlan()] || '');
      } catch (e) {}
      window.location.href = 'dashboard.html#state=signupsuccess';
    }, 700);
  });

  // ---------- Estados de demonstração via #state= ----------
  // idle (padrão) | planrequired | termsrequired
  var stateMatch = location.hash.match(/state=([a-z]+)/);
  var state = stateMatch ? stateMatch[1] : 'idle';

  if (state === 'planrequired') {
    plansGroup.classList.add('error');
  }

  if (state === 'termsrequired') {
    selectPlan('gestao-completa-whatsapp');
    planRadios.forEach(function (radio) { radio.checked = radio.value === 'gestao-completa-whatsapp'; });
    termsField.classList.add('error');
  }
})();
