(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Estado de demonstração: #tab=dados|plano|pagamento & #state=<cenario> ----------
  var tabMatch = location.hash.match(/tab=([a-z]+)/);
  var stateMatch = location.hash.match(/state=([a-z-]+)/);
  var initialTab = tabMatch ? tabMatch[1] : 'dados';
  var cenario = stateMatch ? stateMatch[1] : 'ativo';

  var STATUS_LABEL = {
    teste: 'Período de teste',
    ativo: 'Ativo',
    'aguardando-pagamento': 'Aguardando pagamento',
    cancelado: 'Cancelado'
  };
  var STATUS_BADGE = {
    teste: 'info',
    ativo: 'success',
    'aguardando-pagamento': 'warning',
    cancelado: 'error'
  };

  function formatBRDate(iso) {
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  function formatBRL(value) {
    return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ---------- Toast de sucesso (mesmo padrão Feedback-como-toast do resto do app) ----------
  var toastRegion = document.createElement('div');
  toastRegion.className = 'mc-toast-region';
  document.body.appendChild(toastRegion);
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success mc-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div><div class="message">' + message + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    toast.querySelector('.dismiss').addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  // ══════════════════════════════════════════════════════════
  // ABAS
  // ══════════════════════════════════════════════════════════
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('#mc-tablist .tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.mc-panel'));

  function setTab(tabName) {
    tabButtons.forEach(function (btn) {
      var active = btn.dataset.tab === tabName;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    panels.forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== tabName;
    });
  }
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setTab(btn.dataset.tab); });
  });
  setTab(initialTab);

  // ══════════════════════════════════════════════════════════
  // ABA DADOS
  // ══════════════════════════════════════════════════════════
  (function () {
    var conta = window.NiveloMinhaConta.getConta();
    var dadosInputs = ['mc-nome', 'mc-documento', 'mc-email', 'mc-telefone', 'mc-cep', 'mc-rua', 'mc-numero', 'mc-complemento', 'mc-bairro', 'mc-cidade', 'mc-nascimento'];

    function fillFields(data) {
      document.getElementById('mc-nome').value = data.nome;
      document.getElementById('mc-documento').value = data.documento;
      document.getElementById('mc-email').value = data.email;
      document.getElementById('mc-telefone').value = data.telefone;
      document.getElementById('mc-cep').value = data.cep;
      document.getElementById('mc-rua').value = data.rua;
      document.getElementById('mc-numero').value = data.numero;
      document.getElementById('mc-complemento').value = data.complemento;
      document.getElementById('mc-bairro').value = data.bairro;
      document.getElementById('mc-cidade').value = data.cidade;
      document.getElementById('mc-nascimento').value = data.dataNascimento;
    }
    fillFields(conta);

    // ---------- Dropdown genérico (mesma técnica já usada em nova-ideia.js/etc.) ----------
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
      function onWindowScroll(event) { if (!menu.contains(event.target)) close(); }
      function close() {
        root.classList.remove('open');
        window.removeEventListener('scroll', onWindowScroll, true);
        window.removeEventListener('resize', close);
      }
      function open() {
        root.classList.add('open');
        positionMenu();
        window.addEventListener('scroll', onWindowScroll, true);
        window.addEventListener('resize', close);
      }
      function selectOption(optionEl, silent) {
        var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
        existing.forEach(function (o) { o.classList.remove('selected'); });
        optionEl.classList.add('selected');
        valueEl.textContent = optionEl.textContent;
        valueEl.classList.remove('placeholder');
        root.dataset.value = optionEl.dataset.value;
        close();
        if (onChange && !silent) onChange(optionEl.dataset.value);
      }
      trigger.addEventListener('click', function () {
        if (trigger.disabled) return;
        root.classList.contains('open') ? close() : open();
      });
      menu.addEventListener('click', function (event) {
        var optionEl = event.target.closest('.option');
        if (optionEl) selectOption(optionEl);
      });
      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) close();
      });
      return {
        setValue: function (value, silent) {
          var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
          if (optionEl) selectOption(optionEl, silent !== false ? true : false);
        }
      };
    }

    var estadoField = document.getElementById('mc-estado-field');
    var estadoPicker = initDropdown(estadoField);
    if (conta.estado) estadoPicker.setValue(conta.estado);

    // ---------- CEP: máscara + autofill via ViaCEP (mesma técnica de cadastro-endereco.js) ----------
    var cepInput = document.getElementById('mc-cep');
    var ruaInput = document.getElementById('mc-rua');
    var bairroInput = document.getElementById('mc-bairro');
    var cidadeInput = document.getElementById('mc-cidade');

    function formatCEP(value) {
      var digits = value.replace(/\D/g, '').slice(0, 8);
      var out = digits.slice(0, 5);
      if (digits.length > 5) out += '-' + digits.slice(5, 8);
      return out;
    }
    function fillIfEmpty(input, value) {
      if (!value || input.value.trim()) return;
      input.value = value;
    }
    function lookupCEP(digits) {
      fetch('https://viacep.com.br/ws/' + digits + '/json/')
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data || data.erro) return;
          fillIfEmpty(ruaInput, data.logradouro);
          fillIfEmpty(bairroInput, data.bairro);
          fillIfEmpty(cidadeInput, data.localidade);
          if (data.uf && !estadoField.dataset.value) estadoPicker.setValue(data.uf);
        })
        .catch(function () {});
    }
    cepInput.addEventListener('input', function () {
      cepInput.value = formatCEP(cepInput.value);
      var digits = cepInput.value.replace(/\D/g, '');
      if (digits.length === 8) lookupCEP(digits);
    });

    // ---------- Modo leitura ⇄ edição (padrão de tela de detalhes) ----------
    var editBtn = document.getElementById('mc-dados-edit-btn');
    var cancelBtn = document.getElementById('mc-dados-cancel');
    var editActions = document.getElementById('mc-dados-edit-actions');
    var estadoTrigger = estadoField.querySelector('[data-dropdown-trigger]');

    function setEditMode(isEditing) {
      dadosInputs.forEach(function (id) { document.getElementById(id).disabled = !isEditing; });
      estadoTrigger.disabled = !isEditing;
      editBtn.hidden = isEditing;
      editActions.hidden = !isEditing;
    }
    setEditMode(false);

    editBtn.addEventListener('click', function () { setEditMode(true); });
    cancelBtn.addEventListener('click', function () {
      var atual = window.NiveloMinhaConta.getConta();
      fillFields(atual);
      if (atual.estado) estadoPicker.setValue(atual.estado);
      setEditMode(false);
    });

    // ---------- Salvar ----------
    document.getElementById('mc-dados-form').addEventListener('submit', function (event) {
      event.preventDefault();
      window.NiveloMinhaConta.update({
        nome: document.getElementById('mc-nome').value,
        documento: document.getElementById('mc-documento').value,
        email: document.getElementById('mc-email').value,
        telefone: document.getElementById('mc-telefone').value,
        cep: cepInput.value,
        rua: ruaInput.value,
        numero: document.getElementById('mc-numero').value,
        complemento: document.getElementById('mc-complemento').value,
        bairro: bairroInput.value,
        cidade: cidadeInput.value,
        estado: estadoField.dataset.value || '',
        dataNascimento: document.getElementById('mc-nascimento').value
      });
      setEditMode(false);
      showToast('Dados atualizados', 'Suas informações cadastrais foram salvas com sucesso.');
    });
  })();

  // ══════════════════════════════════════════════════════════
  // ABA PLANO
  // ══════════════════════════════════════════════════════════
  var assinatura = window.NiveloAssinatura.getAssinatura(cenario);

  (function () {
    document.getElementById('mc-plan-name').textContent = assinatura.plano.nome;
    var statusEl = document.getElementById('mc-plan-status');
    statusEl.textContent = STATUS_LABEL[assinatura.status];
    statusEl.setAttribute('data-status', STATUS_BADGE[assinatura.status]);
    document.getElementById('mc-plan-modalidade').textContent = assinatura.modalidade === 'anual' ? 'Licença anual' : assinatura.modalidade === 'mensal' ? 'Licença mensal' : 'Período de teste';
    document.getElementById('mc-plan-inicio').textContent = formatBRDate(assinatura.dataInicio);
    document.getElementById('mc-plan-vencimento').textContent = formatBRDate(assinatura.dataVencimento);

    if (assinatura.status === 'teste') {
      var trialCard = document.getElementById('mc-trial-card');
      trialCard.hidden = false;
      document.getElementById('mc-trial-message').textContent =
        'Você está utilizando o plano ' + assinatura.plano.nome + ' gratuitamente até ' + formatBRDate(assinatura.dataVencimento) + '.';
    }

    // ---------- Escolher outro plano: modal com acordeão (mesma linguagem do checkout) ----------
    // Regra: numa licença ANUAL vigente, só upgrade é permitido a qualquer momento — planos
    // igual/inferior ao atual (downgrade) só aparecem quando a renovação está próxima
    // (<=30 dias) ou já vencida. Mensal/teste/aguardando/cancelado não têm essa restrição.
    function isPlanoElegivel(plano) {
      if (plano.id === assinatura.planoId) return false;
      if (assinatura.status !== 'ativo' || assinatura.modalidade !== 'anual') return true;
      var isUpgrade = window.NiveloPlanos.isUpgrade(assinatura.planoId, plano.id);
      if (isUpgrade) return true;
      return assinatura.diasParaVencer <= 30;
    }

    var planModalOverlay = document.getElementById('mc-plan-modal-overlay');
    var modalAccordionEl = document.getElementById('mc-modal-plan-accordion');
    var modalHintEl = document.getElementById('mc-plan-modal-hint');

    function buildModalAccordion() {
      var planos = window.NiveloPlanos.list().filter(isPlanoElegivel);
      modalAccordionEl.innerHTML = planos.map(function (plano) {
        return (
          '<article class="mc-modal-plan-item" data-plano-id="' + plano.id + '">' +
            '<button type="button" class="mc-modal-plan-header" aria-expanded="false">' +
              '<span class="mc-modal-plan-info">' +
                '<span class="mc-modal-plan-name">' + plano.nome + '</span>' +
                '<span class="mc-modal-plan-tagline">' + plano.tagline + '</span>' +
              '</span>' +
              '<span class="mc-modal-plan-from">a partir de ' + formatBRL(plano.precoMensal) + '/mês</span>' +
              '<i data-lucide="chevron-down" class="mc-modal-plan-chevron" width="18" height="18"></i>' +
            '</button>' +
            '<div class="mc-modal-plan-body" hidden>' +
              '<div class="mc-modal-plan-modality" role="radiogroup" aria-label="Forma de contratação">' +
                '<label class="mc-modal-modality-option" data-modalidade="mensal">' +
                  '<input type="radio" class="input" name="mc-modalidade-' + plano.id + '" value="mensal" />' +
                  '<span class="circle"><span class="dot"></span></span>' +
                  '<span class="mc-modal-modality-info"><strong>Mensal</strong><span>' + formatBRL(plano.precoMensal) + '/mês</span></span>' +
                '</label>' +
                '<label class="mc-modal-modality-option" data-modalidade="anual">' +
                  '<input type="radio" class="input" name="mc-modalidade-' + plano.id + '" value="anual" />' +
                  '<span class="circle"><span class="dot"></span></span>' +
                  '<span class="mc-modal-modality-info"><strong>Anual <span class="mc-modal-modality-save">Economize 20%</span></strong><span>' + formatBRL(plano.precoAnualMensal) + '/mês</span></span>' +
                '</label>' +
              '</div>' +
              '<div class="cp-step-actions"><button type="button" class="btn primary mc-modal-plan-continue" disabled>Continuar</button></div>' +
            '</div>' +
          '</article>'
        );
      }).join('');
      if (!planos.length) {
        // Mensagem curta: a explicação completa (por que só upgrade/quando libera downgrade)
        // já está no hint fixo do topo do modal — não repetir aqui.
        modalAccordionEl.innerHTML = '<p class="text-body-s mc-modal-plan-empty">Nenhum plano disponível para troca no momento.</p>';
      }
      if (window.lucide) lucide.createIcons();
    }

    var isAnualAtivo = assinatura.modalidade === 'anual' && assinatura.status === 'ativo';

    function openPlanModal() {
      modalHintEl.hidden = !isAnualAtivo;
      if (isAnualAtivo) modalHintEl.textContent = 'Como sua licença é anual, neste momento você só pode mudar para um plano superior. A mudança para um plano inferior ficará disponível na renovação da licença.';
      buildModalAccordion();
      planModalOverlay.hidden = false;
    }
    function closePlanModal() { planModalOverlay.hidden = true; }

    // Período de teste: "Contratar agora" pula direto pro checkout (contratação nova),
    // sem passar pelo modal de troca (que é só pra quem já é assinante).
    var chooseBtn = document.getElementById('mc-choose-plan-btn');
    if (assinatura.status === 'teste') {
      chooseBtn.textContent = 'Contratar agora';
      chooseBtn.addEventListener('click', function () { window.location.href = 'comprar-plano.html'; });
    } else {
      chooseBtn.addEventListener('click', openPlanModal);
    }
    document.getElementById('mc-plan-modal-close').addEventListener('click', closePlanModal);
    document.getElementById('mc-plan-modal-cancel').addEventListener('click', closePlanModal);
    planModalOverlay.addEventListener('click', function (event) {
      if (event.target === planModalOverlay) closePlanModal();
    });

    var escolhaModalidade = null;
    modalAccordionEl.addEventListener('click', function (event) {
      var header = event.target.closest('.mc-modal-plan-header');
      var modalityLabel = event.target.closest('.mc-modal-modality-option');
      var continueBtn = event.target.closest('.mc-modal-plan-continue');

      if (header) {
        var item = header.closest('.mc-modal-plan-item');
        var isOpen = item.classList.contains('is-open');
        Array.prototype.slice.call(modalAccordionEl.querySelectorAll('.mc-modal-plan-item')).forEach(function (i) {
          i.classList.remove('is-open');
          i.querySelector('.mc-modal-plan-header').setAttribute('aria-expanded', 'false');
          i.querySelector('.mc-modal-plan-body').hidden = true;
        });
        if (!isOpen) {
          item.classList.add('is-open');
          header.setAttribute('aria-expanded', 'true');
          item.querySelector('.mc-modal-plan-body').hidden = false;
        }
        return;
      }

      if (modalityLabel) {
        var plano = modalityLabel.closest('.mc-modal-plan-item');
        var radio = modalityLabel.querySelector('input[type="radio"]');
        radio.checked = true;
        Array.prototype.slice.call(plano.querySelectorAll('.mc-modal-modality-option')).forEach(function (opt) {
          opt.classList.toggle('checked', opt === modalityLabel);
        });
        plano.querySelector('.mc-modal-plan-continue').disabled = false;
        return;
      }

      if (continueBtn) {
        var planoItem = continueBtn.closest('.mc-modal-plan-item');
        var selectedRadio = planoItem.querySelector('input[type="radio"]:checked');
        if (!selectedRadio) return;
        escolhaModalidade = selectedRadio.value;
        closePlanModal();
        // Licença mensal: não precisa falar com o Comercial — segue direto pro pagamento,
        // a cobrança continua normal e o novo plano só passa a valer no próximo ciclo.
        if (assinatura.modalidade === 'mensal') {
          openMensalChangeModal(planoItem.dataset.planoId, escolhaModalidade);
        } else {
          openUpgradeModal(planoItem.dataset.planoId);
        }
      }
    });

    // ---------- Modal: troca de plano de licença ANUAL sempre passa pelo Comercial
    // (proração do período restante não é calculável automaticamente neste protótipo) ----------
    var upgradeOverlay = document.getElementById('mc-upgrade-overlay');
    function openUpgradeModal(planoId) {
      var plano = window.NiveloPlanos.findById(planoId);
      document.getElementById('mc-upgrade-plan-line').textContent =
        'Você selecionou o plano ' + plano.nome + ' (' + (escolhaModalidade === 'anual' ? 'licença anual' : 'licença mensal') + ').';
      upgradeOverlay.hidden = false;
    }
    function closeUpgradeModal() { upgradeOverlay.hidden = true; }
    document.getElementById('mc-upgrade-close').addEventListener('click', closeUpgradeModal);
    document.getElementById('mc-upgrade-cancel').addEventListener('click', closeUpgradeModal);
    upgradeOverlay.addEventListener('click', function (event) {
      if (event.target === upgradeOverlay) closeUpgradeModal();
    });

    // ---------- Modal: troca de plano de licença MENSAL segue direto pro checkout ----------
    var mensalOverlay = document.getElementById('mc-mensal-change-overlay');
    function openMensalChangeModal(planoId, modalidade) {
      var plano = window.NiveloPlanos.findById(planoId);
      document.getElementById('mc-mensal-change-plan-line').textContent =
        'Você selecionou o plano ' + plano.nome + ' (' + (modalidade === 'anual' ? 'licença anual' : 'licença mensal') + ').';
      document.getElementById('mc-mensal-change-message').textContent =
        'A cobrança continua normalmente. O novo plano passa a valer a partir de ' + formatBRDate(assinatura.dataVencimento) + ', quando o ciclo atual terminar.';
      document.getElementById('mc-mensal-change-continue').href =
        'comprar-plano.html?motivo=trocaplano&plano=' + planoId + '&modalidade=' + modalidade + '&vigencia=' + assinatura.dataVencimento;
      mensalOverlay.hidden = false;
    }
    function closeMensalModal() { mensalOverlay.hidden = true; }
    document.getElementById('mc-mensal-change-close').addEventListener('click', closeMensalModal);
    document.getElementById('mc-mensal-change-cancel').addEventListener('click', closeMensalModal);
    mensalOverlay.addEventListener('click', function (event) {
      if (event.target === mensalOverlay) closeMensalModal();
    });
  })();

  // ══════════════════════════════════════════════════════════
  // ABA PAGAMENTO
  // ══════════════════════════════════════════════════════════
  (function () {
    document.getElementById('mc-pay-modalidade').textContent = assinatura.modalidade === 'anual' ? 'Licença anual' : assinatura.modalidade === 'mensal' ? 'Licença mensal' : 'Período de teste';
    var statusEl = document.getElementById('mc-pay-status');
    statusEl.textContent = STATUS_LABEL[assinatura.status];
    statusEl.setAttribute('data-status', STATUS_BADGE[assinatura.status]);

    var nextLabelEl = document.getElementById('mc-pay-next-label');
    var nextValueEl = document.getElementById('mc-pay-next-value');
    if (assinatura.modalidade === 'mensal') {
      nextLabelEl.textContent = 'Próxima cobrança';
    } else {
      nextLabelEl.textContent = 'Vencimento';
    }
    nextValueEl.textContent = formatBRDate(assinatura.dataVencimento);

    // Aviso de renovação próxima (até 30 dias, licença anual, ainda não vencida)
    if (assinatura.modalidade === 'anual' && !assinatura.vencida && assinatura.diasParaVencer <= 30 && assinatura.diasParaVencer >= 0 && assinatura.status !== 'cancelado') {
      var warn = document.getElementById('mc-renewal-warning');
      warn.hidden = false;
      document.getElementById('mc-renewal-warning-text').textContent =
        assinatura.diasParaVencer === 0
          ? 'Sua licença vence hoje.'
          : 'Sua licença vence em ' + assinatura.diasParaVencer + (assinatura.diasParaVencer === 1 ? ' dia' : ' dias') + '.';
    }

    // Licença vencida
    if (assinatura.vencida) {
      document.getElementById('mc-expired-warning').hidden = false;
      document.getElementById('mc-buy-again-btn').hidden = false;
    } else if (assinatura.modalidade === 'anual' && assinatura.status !== 'cancelado') {
      document.getElementById('mc-renew-btn').hidden = false;
    }

    if (assinatura.modalidade === 'mensal') {
      if (assinatura.renovacaoAutomatica) {
        document.getElementById('mc-cancel-renewal-btn').hidden = false;
      } else {
        var note = document.getElementById('mc-cancel-note');
        note.hidden = false;
        note.textContent = 'Renovação automática cancelada. O acesso permanecerá disponível até ' + formatBRDate(assinatura.dataVencimento) + '.';
      }
    }

    document.getElementById('mc-renew-btn').addEventListener('click', function () {
      window.location.href = 'comprar-plano.html?motivo=renovacao';
    });
    document.getElementById('mc-buy-again-btn').addEventListener('click', function () {
      window.location.href = 'comprar-plano.html?motivo=vencido';
    });

    // ---------- Cancelar renovação (modal de confirmação) ----------
    var cancelOverlay = document.getElementById('mc-cancel-overlay');
    document.getElementById('mc-cancel-renewal-btn').addEventListener('click', function () {
      document.getElementById('mc-cancel-until').textContent = formatBRDate(assinatura.dataVencimento);
      cancelOverlay.hidden = false;
    });
    function closeCancelModal() { cancelOverlay.hidden = true; }
    document.getElementById('mc-cancel-close').addEventListener('click', closeCancelModal);
    document.getElementById('mc-cancel-back').addEventListener('click', closeCancelModal);
    cancelOverlay.addEventListener('click', function (event) {
      if (event.target === cancelOverlay) closeCancelModal();
    });
    document.getElementById('mc-cancel-confirm').addEventListener('click', function () {
      closeCancelModal();
      document.getElementById('mc-cancel-renewal-btn').hidden = true;
      var note = document.getElementById('mc-cancel-note');
      note.hidden = false;
      note.textContent = 'Renovação automática cancelada. O acesso permanecerá disponível até ' + formatBRDate(assinatura.dataVencimento) + '.';
      showToast('Renovação cancelada', 'Sua assinatura não será mais renovada automaticamente.');
    });

    // ---------- Histórico de compras ----------
    var historyBody = document.getElementById('mc-history-body');
    var historyEmpty = document.getElementById('mc-history-empty');
    var historyCardTable = document.querySelector('#mc-history-card .tableWrap');
    if (!assinatura.historico.length) {
      historyCardTable.hidden = true;
      historyEmpty.hidden = false;
    } else {
      historyBody.innerHTML = assinatura.historico.slice().reverse().map(function (item) {
        return (
          '<tr class="tr">' +
            '<td class="td">' + formatBRDate(item.data) + '</td>' +
            '<td class="td">' + item.plano + '</td>' +
            '<td class="td">' + item.tipo + '</td>' +
            '<td class="td">' + formatBRL(item.valor) + '</td>' +
            '<td class="td"><span class="badge" data-status="success">' + item.status + '</span></td>' +
          '</tr>'
        );
      }).join('');
    }
  })();

  // ══════════════════════════════════════════════════════════
  // ABA SEGURANÇA
  // ══════════════════════════════════════════════════════════
  (function () {
    document.getElementById('mc-security-last-change').textContent = formatBRDate(window.NiveloMinhaConta.getConta().senhaUltimaAlteracao);

    var overlay = document.getElementById('mc-password-overlay');
    var form = document.getElementById('mc-password-form');
    var currentField = document.getElementById('mc-current-password-field');
    var currentInput = document.getElementById('mc-current-password');
    var newField = document.getElementById('mc-new-password-field');
    var newInput = document.getElementById('mc-new-password');
    var confirmField = document.getElementById('mc-confirm-password-field');
    var confirmInput = document.getElementById('mc-confirm-password');
    var criteriaItems = Array.prototype.slice.call(document.querySelectorAll('#mc-pwd-criteria .pwd-criteria-item'));
    var submitBtn = document.getElementById('mc-password-submit');

    var RULES = {
      length: function (v) { return v.length >= 8; },
      upper: function (v) { return /[A-Z]/.test(v); },
      lower: function (v) { return /[a-z]/.test(v); },
      number: function (v) { return /[0-9]/.test(v); },
      special: function (v) { return /[^A-Za-z0-9]/.test(v); }
    };

    function checkCriteria(value) {
      var allMet = true;
      criteriaItems.forEach(function (item) {
        var met = RULES[item.dataset.rule](value);
        item.classList.toggle('met', met);
        if (!met) allMet = false;
      });
      return allMet;
    }

    function passwordsMatch() { return newInput.value.length > 0 && newInput.value === confirmInput.value; }

    function updateSubmitState() {
      var criteriaOk = checkCriteria(newInput.value);
      var matchOk = passwordsMatch();
      submitBtn.disabled = !(criteriaOk && matchOk && currentInput.value.length > 0);
      return { criteriaOk: criteriaOk, matchOk: matchOk };
    }

    // ---------- Mostrar/ocultar senha (mesmo comportamento de página/Login) ----------
    function wireToggle(buttonId, input) {
      var btn = document.getElementById(buttonId);
      btn.addEventListener('click', function () {
        var visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        btn.setAttribute('aria-pressed', String(visible));
        btn.setAttribute('aria-label', visible ? 'Ocultar senha' : 'Mostrar senha');
        btn.innerHTML = '<i data-lucide="' + (visible ? 'eye-off' : 'eye') + '" width="18" height="18"></i>';
        if (window.lucide) lucide.createIcons();
      });
    }
    wireToggle('mc-toggle-current-password', currentInput);
    wireToggle('mc-toggle-new-password', newInput);
    wireToggle('mc-toggle-confirm-password', confirmInput);

    function resetPasswordVisibility() {
      [
        [currentInput, 'mc-toggle-current-password'],
        [newInput, 'mc-toggle-new-password'],
        [confirmInput, 'mc-toggle-confirm-password']
      ].forEach(function (pair) {
        pair[0].type = 'password';
        var btn = document.getElementById(pair[1]);
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Mostrar senha');
        btn.innerHTML = '<i data-lucide="eye" width="18" height="18"></i>';
      });
      if (window.lucide) lucide.createIcons();
    }

    function resetModal() {
      form.reset();
      checkCriteria('');
      currentField.classList.remove('error');
      newField.classList.remove('error');
      confirmField.classList.remove('error');
      submitBtn.disabled = true;
      resetPasswordVisibility();
    }

    function openModal() { resetModal(); overlay.hidden = false; }
    function closeModal() { overlay.hidden = true; }

    document.getElementById('mc-change-password-btn').addEventListener('click', openModal);
    document.getElementById('mc-password-close').addEventListener('click', closeModal);
    document.getElementById('mc-password-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (event) { if (event.target === overlay) closeModal(); });

    currentInput.addEventListener('input', function () {
      currentField.classList.remove('error');
      updateSubmitState();
    });
    newInput.addEventListener('input', function () {
      newField.classList.remove('error');
      var state = updateSubmitState();
      if (confirmInput.value) confirmField.classList.toggle('error', !state.matchOk);
    });
    confirmInput.addEventListener('input', function () {
      var state = updateSubmitState();
      confirmField.classList.toggle('error', confirmInput.value.length > 0 && !state.matchOk);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var conta = window.NiveloMinhaConta.getConta();

      if (!currentInput.value) {
        currentField.classList.add('error');
        return;
      }
      if (currentInput.value !== conta.senhaAtualMock) {
        currentField.classList.add('error');
        return;
      }
      if (!newInput.value) {
        newField.classList.add('error');
        return;
      }
      var state = updateSubmitState();
      if (!state.matchOk) {
        confirmField.classList.add('error');
        return;
      }
      if (!state.criteriaOk) return;

      window.NiveloMinhaConta.update({ senhaAtualMock: newInput.value, senhaUltimaAlteracao: window.NiveloAssinatura.TODAY });
      document.getElementById('mc-security-last-change').textContent = formatBRDate(window.NiveloAssinatura.TODAY);
      closeModal();
      showToast('Senha alterada', 'Sua senha de acesso foi atualizada com sucesso.');
    });
  })();

  if (window.lucide) lucide.createIcons();
})();
