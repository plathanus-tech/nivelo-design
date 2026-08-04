(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // `ativo` (boolean) é um campo diferente de `status` (em-producao/
  // disponivel/em-pousio, usado só pela tela operacional) — ver comentário
  // em fazendas-data.js. Esta tela só lê/escreve `ativo`.
  var ATIVO_STATUS = {
    true: { status: 'success', label: 'Ativo' },
    false: { status: 'warning', label: 'Inativo' }
  };

  var currentFazenda = null;
  var editingTalhaoId = null; // null = criando um talhão novo

  function flashDisable(el) {
    el.disabled = true;
    window.setTimeout(function () { el.disabled = false; }, 300);
  }

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica de
  // produtos.js/cadastros.js/estoque.js: position:fixed via JS, reparentado
  // pra document.body no primeiro hover). Precisa do Tooltip.module.css
  // carregado no <head> pra `.tip` ter `opacity:0`/`position:absolute` por
  // padrão — sem ele o texto do tooltip fica sempre visível. ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) {
      document.body.appendChild(tip);
      btn.__tip = tip;
    }
    return tip;
  }

  function positionActionTooltip(btn) {
    var tip = getActionTip(btn);
    if (!tip) return;
    var rect = btn.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    tip.style.position = 'fixed';
    tip.style.left = centerX + 'px';
    tip.style.transform = 'translateX(-50%)';
    tip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    tip.style.top = 'auto';
    tip.style.opacity = '1';

    var margin = 8;
    var tipRect = tip.getBoundingClientRect();
    if (tipRect.left < margin) {
      tip.style.left = (centerX + (margin - tipRect.left)) + 'px';
    } else if (tipRect.right > window.innerWidth - margin) {
      tip.style.left = (centerX - (tipRect.right - (window.innerWidth - margin))) + 'px';
    }
  }

  function hideActionTooltip(btn) {
    var tip = btn.__tip;
    if (tip) tip.style.opacity = '0';
  }

  document.addEventListener('mouseover', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('mouseout', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (btn) hideActionTooltip(btn);
  });
  document.addEventListener('focusin', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action]');
    if (btn) positionActionTooltip(btn);
  });
  document.addEventListener('focusout', function (event) {
    var btn = event.target.closest && event.target.closest('.actionBtn[data-action]');
    if (btn) hideActionTooltip(btn);
  });

  function fieldOrDash(value) {
    return value || value === 0 ? value : '—';
  }

  // ---------- Render: Cabeçalho ----------
  // Fazendas criadas pelo wizard (nova-fazenda.js) não coletam Cidade/Estado
  // (fora do escopo pedido pro fluxo) — o guard evita mostrar ", " quebrado.
  function formatLocation(fazenda) {
    if (fazenda.cidade && fazenda.estado) return fazenda.cidade + ', ' + fazenda.estado;
    return fazenda.cidade || fazenda.estado || '—';
  }

  function renderHeader(fazenda) {
    document.getElementById('fazenda-cadastro-nome').textContent = fazenda.nome;
    document.getElementById('fazenda-cadastro-localizacao').textContent = formatLocation(fazenda);
    document.title = fazenda.nome + ' — Nivelo';
  }

  // ---------- Render: Identificação da fazenda + Localização (consulta) ----------
  function renderDados(fazenda) {
    document.getElementById('dado-codigo').textContent = fieldOrDash(fazenda.codigo);
    document.getElementById('dado-nome').textContent = fieldOrDash(fazenda.nome);
    document.getElementById('dado-proprietario').textContent = fieldOrDash(fazenda.proprietario);
    document.getElementById('dado-cnpj').textContent = fieldOrDash(fazenda.cnpj);
    document.getElementById('dado-ie').textContent = fieldOrDash(fazenda.inscricaoEstadual);
    document.getElementById('dado-matricula').textContent = fieldOrDash(fazenda.matricula);
    document.getElementById('dado-area-total').textContent = fazenda.areaHa + ' ha';
    document.getElementById('dado-area-agricultura').textContent = fieldOrDash(fazenda.areaAgricultura) + (fazenda.areaAgricultura != null ? ' ha' : '');

    document.getElementById('dado-endereco').textContent = fieldOrDash(fazenda.enderecoCompleto);
    document.getElementById('dado-latitude').textContent = fieldOrDash(fazenda.latitude);
    document.getElementById('dado-longitude').textContent = fieldOrDash(fazenda.longitude);

    var arrendamentoGroup = document.getElementById('dados-arrendamento-group');
    if (fazenda.arrendamento) {
      arrendamentoGroup.hidden = false;
      document.getElementById('dado-arrendatario').textContent = fieldOrDash(fazenda.arrendamento.arrendatario);
      document.getElementById('dado-arrendamento-area').textContent = fazenda.arrendamento.areaHa + ' ha';
      document.getElementById('dado-arrendamento-vigencia').textContent = fieldOrDash(fazenda.arrendamento.vigencia);
    } else {
      arrendamentoGroup.hidden = true;
    }
  }

  // ---------- Render: Talhões (tabela desktop + cards mobile) ----------
  // 2 ações por linha (mesmo padrão de Estoque — Ver detalhes + ação
  // contextual): Editar (sempre) + Ativar/Desativar (conforme `t.ativo`).
  // Visualizar e Excluir continuam fora — dados principais já ficam
  // visíveis direto na tabela, e o talhão nunca é removido de verdade.
  function buildActionsHTML(t) {
    var toggle = t.ativo
      ? { action: 'desativar', icon: 'ban', label: 'Desativar' }
      : { action: 'ativar', icon: 'check-circle', label: 'Ativar' };
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="editar" aria-label="Editar"><i data-lucide="pencil" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Editar</span></button>' +
        '<button type="button" class="actionBtn" data-action="' + toggle.action + '" aria-label="' + toggle.label + '">' +
          '<i data-lucide="' + toggle.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + toggle.label + '</span>' +
        '</button>' +
      '</div>'
    );
  }

  function buildRowHTML(t) {
    var badge = ATIVO_STATUS[t.ativo];
    return (
      '<tr class="tr" data-talhao-id="' + t.id + '">' +
        '<td class="td">' + fieldOrDash(t.codigo) + '</td>' +
        '<td class="td">' + t.nome + '</td>' +
        '<td class="td">' + t.areaHa + ' ha</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML(t) + '</td>' +
      '</tr>'
    );
  }

  function buildCardHTML(t) {
    var badge = ATIVO_STATUS[t.ativo];
    return (
      '<div class="card talhao-cadastro-card" data-talhao-id="' + t.id + '">' +
        '<div class="talhao-cadastro-card-header">' +
          '<span class="talhao-cadastro-card-name text-subtitle-s">' + t.nome + '</span>' +
          '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
        '</div>' +
        '<dl class="talhao-cadastro-card-fields text-body-s">' +
          '<div><dt class="text-10-regular">Código</dt><dd class="text-12-regular">' + fieldOrDash(t.codigo) + '</dd></div>' +
          '<div><dt class="text-10-regular">Área (ha)</dt><dd class="text-12-regular">' + t.areaHa + ' ha</dd></div>' +
        '</dl>' +
        '<div class="talhao-cadastro-card-actions">' + buildActionsHTML(t) + '</div>' +
      '</div>'
    );
  }

  // `#state=empty` (mesma convenção de demo já usada em fazendas.js/
  // fazenda-detalhe.js) força a seção de Talhões a renderizar vazia.
  function renderTalhoes(fazenda) {
    var isEmptyDemo = /state=empty/.test(location.hash);
    var talhoes = isEmptyDemo ? [] : fazenda.talhoes;
    var tableWrapEl = document.getElementById('talhoes-cadastro-table-wrap');
    var mobileListEl = document.getElementById('talhoes-cadastro-mobile-list');
    var emptyEl = document.getElementById('talhoes-cadastro-empty');
    var showEmpty = talhoes.length === 0;

    tableWrapEl.hidden = showEmpty;
    mobileListEl.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      document.getElementById('talhoes-cadastro-tbody').innerHTML = talhoes.map(buildRowHTML).join('');
      mobileListEl.innerHTML = talhoes.map(buildCardHTML).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  function findTalhao(id) {
    return currentFazenda.talhoes.filter(function (t) { return t.id === id; })[0] || null;
  }

  // Código gerado automaticamente pelo sistema — nunca preenchido pelo
  // usuário (nem em Novo, nem em Editar). Sequencial por fazenda, mesmo
  // formato zero-padded ('001', '002'...) já usado nos talhões seed.
  function nextCodigo(fazenda) {
    var max = fazenda.talhoes.reduce(function (acc, t) {
      var n = parseInt(t.codigo, 10);
      return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 3) padded = '0' + padded;
    return padded;
  }

  // ---------- Ativar/Desativar: ação real (não flash-disable) — altera
  // `t.ativo` em memória e re-renderiza, sem excluir o registro. Só roda
  // depois de confirmada no modal (ver `openToggleAtivoDialog` abaixo). ----------
  function toggleAtivo(id) {
    var t = findTalhao(id);
    if (!t) return;
    t.ativo = !t.ativo;
    renderTalhoes(currentFazenda);
    showSuccessToast(
      t.ativo ? 'Talhão ativado com sucesso.' : 'Talhão desativado com sucesso.',
      '"' + t.nome + '" agora está ' + (t.ativo ? 'ativo' : 'inativo') + '.'
    );
  }

  // ---------- Modal de confirmação: Ativar/Desativar talhão ----------
  // Desativar segue o padrão visual destrutivo (mesmo do modal "Excluir
  // cadastro"); Ativar usa o botão primário padrão do sistema.
  var toggleOverlay = document.getElementById('talhao-toggle-dialog-overlay');
  var toggleTitle = document.getElementById('talhao-toggle-dialog-title');
  var toggleMessage = document.getElementById('talhao-toggle-dialog-message');
  var toggleConfirmBtn = document.getElementById('talhao-toggle-dialog-confirm');
  var pendingToggleId = null;

  function openToggleAtivoDialog(id) {
    var t = findTalhao(id);
    if (!t) return;
    pendingToggleId = id;
    if (t.ativo) {
      toggleTitle.textContent = 'Desativar talhão';
      toggleMessage.textContent = 'Tem certeza que deseja desativar o talhão "' + t.nome + '"?';
      toggleConfirmBtn.className = 'btn destructive';
      toggleConfirmBtn.textContent = 'Desativar';
    } else {
      toggleTitle.textContent = 'Ativar talhão';
      toggleMessage.textContent = 'Tem certeza que deseja ativar o talhão "' + t.nome + '"?';
      toggleConfirmBtn.className = 'btn primary';
      toggleConfirmBtn.textContent = 'Ativar';
    }
    toggleOverlay.hidden = false;
  }

  function closeToggleAtivoDialog() {
    toggleOverlay.hidden = true;
    pendingToggleId = null;
  }

  document.getElementById('talhao-toggle-dialog-close').addEventListener('click', closeToggleAtivoDialog);
  document.getElementById('talhao-toggle-dialog-cancel').addEventListener('click', closeToggleAtivoDialog);
  toggleConfirmBtn.addEventListener('click', function () {
    var id = pendingToggleId;
    closeToggleAtivoDialog();
    if (id) toggleAtivo(id);
  });
  toggleOverlay.addEventListener('click', function (event) {
    if (event.target === toggleOverlay) closeToggleAtivoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !toggleOverlay.hidden) closeToggleAtivoDialog();
  });

  // ---------- Toast de sucesso ----------
  // Mesmo padrão de cadastros.js (Feedback reaproveitado como Toast).
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success fazenda-cadastro-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body">' +
      '<div class="title">' + title + '</div>' +
      '<div class="message">' + message + '</div>' +
      '</div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';

    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () {
      window.clearTimeout(hideTimer);
      toast.remove();
    });
  }

  // ---------- Modal Novo/Editar talhão ----------
  // Um único Dialog reaproveitado pros dois casos (ver comentário no HTML).
  var talhaoOverlay = document.getElementById('talhao-dialog-overlay');
  var talhaoTitle = document.getElementById('talhao-dialog-title');
  var talhaoConfirmBtn = document.getElementById('talhao-dialog-confirm');
  var talhaoCodigoField = document.getElementById('talhao-codigo-field');
  var talhaoCodigoInput = document.getElementById('talhao-codigo-input');
  var talhaoNomeInput = document.getElementById('talhao-nome-input');
  var talhaoNomeError = document.getElementById('talhao-nome-error');
  var talhaoAreaInput = document.getElementById('talhao-area-input');
  var talhaoAreaError = document.getElementById('talhao-area-error');
  var talhaoStatusField = document.getElementById('talhao-status-field');

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
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existingOptions = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existingOptions.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      root.dataset.value = optionEl.dataset.value;
      close();
      if (onChange) onChange(optionEl.dataset.value);
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

    return { selectOption: selectOption };
  }

  var talhaoStatusDropdown = initDropdown(talhaoStatusField);

  function setTalhaoStatusValue(ativo) {
    var optionEl = talhaoStatusField.querySelector('.option[data-value="' + (ativo ? 'ativo' : 'inativo') + '"]');
    if (optionEl) talhaoStatusDropdown.selectOption(optionEl);
  }

  function openTalhaoDialog(talhao) {
    editingTalhaoId = talhao ? talhao.id : null;
    talhaoTitle.textContent = talhao ? 'Editar talhão' : 'Novo talhão';
    talhaoConfirmBtn.textContent = talhao ? 'Salvar alterações' : 'Salvar';
    // Código só aparece editando — é gerado automaticamente, nunca pedido
    // ao usuário na criação (ver `nextCodigo`).
    talhaoCodigoField.hidden = !talhao;
    talhaoCodigoInput.value = talhao ? talhao.codigo : '';
    talhaoNomeInput.value = talhao ? talhao.nome : '';
    talhaoAreaInput.value = talhao ? talhao.areaHa : '';
    setTalhaoStatusValue(talhao ? talhao.ativo : true);
    talhaoNomeError.hidden = true;
    talhaoAreaError.hidden = true;
    talhaoOverlay.hidden = false;
    talhaoNomeInput.focus();
  }

  function closeTalhaoDialog() {
    talhaoOverlay.hidden = true;
  }

  function confirmTalhaoDialog() {
    var nome = talhaoNomeInput.value.trim();
    var area = parseFloat(talhaoAreaInput.value);
    var isValid = true;

    if (!nome) {
      talhaoNomeError.hidden = false;
      isValid = false;
    } else {
      talhaoNomeError.hidden = true;
    }
    if (!area || area <= 0) {
      talhaoAreaError.hidden = false;
      isValid = false;
    } else {
      talhaoAreaError.hidden = true;
    }
    if (!isValid) return;

    var ativo = talhaoStatusField.dataset.value === 'ativo';
    var isEditing = !!editingTalhaoId;

    if (isEditing) {
      var existing = findTalhao(editingTalhaoId);
      existing.nome = nome;
      existing.areaHa = area;
      existing.ativo = ativo;
    } else {
      currentFazenda.talhoes.push({
        id: 't-' + Date.now(),
        codigo: nextCodigo(currentFazenda),
        nome: nome,
        areaHa: area,
        cultura: null,
        safra: null,
        status: 'disponivel',
        ativo: ativo
      });
    }

    closeTalhaoDialog();
    renderTalhoes(currentFazenda);
    showSuccessToast(
      isEditing ? 'Talhão atualizado com sucesso.' : 'Talhão cadastrado com sucesso.',
      isEditing ? 'As alterações em "' + nome + '" já foram salvas.' : 'O talhão "' + nome + '" já está disponível na tabela.'
    );
  }

  document.getElementById('novo-talhao-cadastro-btn').addEventListener('click', function () { openTalhaoDialog(null); });
  document.getElementById('talhoes-cadastro-empty-btn').addEventListener('click', function () { openTalhaoDialog(null); });
  document.getElementById('talhao-dialog-close').addEventListener('click', closeTalhaoDialog);
  document.getElementById('talhao-dialog-cancel').addEventListener('click', closeTalhaoDialog);
  document.getElementById('talhao-dialog-confirm').addEventListener('click', confirmTalhaoDialog);
  talhaoOverlay.addEventListener('click', function (event) {
    if (event.target === talhaoOverlay) closeTalhaoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !talhaoOverlay.hidden) closeTalhaoDialog();
  });

  // ---------- "Editar fazenda" — reaproveita o formulário de Nova fazenda
  // em modo edição (?id=), mesma experiência já usada em Produtos/Cadastro
  // de pessoas e empresas (form pré-preenchido, "Salvar alterações"). ----------
  document.getElementById('editar-fazenda-cadastro-btn').addEventListener('click', function () {
    if (!currentFazenda) return;
    window.location.href = 'nova-fazenda.html?id=' + encodeURIComponent(currentFazenda.id);
  });

  // ---------- Ações da linha/card: Editar abre o modal de edição,
  // Ativar/Desativar altera o status direto (mesmo padrão de 2 ícones de
  // Estoque — nenhuma outra área da linha/card é clicável). ----------
  function handleTalhaoActionClick(event, containerSelector) {
    var actionBtn = event.target.closest('.actionBtn[data-action]');
    if (!actionBtn) return;
    var container = event.target.closest(containerSelector);
    if (!container) return;
    var id = container.dataset.talhaoId;
    if (actionBtn.dataset.action === 'editar') {
      openTalhaoDialog(findTalhao(id));
    } else {
      openToggleAtivoDialog(id);
    }
  }
  document.getElementById('talhoes-cadastro-tbody').addEventListener('click', function (event) {
    handleTalhaoActionClick(event, '.tr[data-talhao-id]');
  });
  document.getElementById('talhoes-cadastro-mobile-list').addEventListener('click', function (event) {
    handleTalhaoActionClick(event, '.talhao-cadastro-card[data-talhao-id]');
  });

  // ---------- Boot: resolve a fazenda pelo `id` do hash ----------
  function boot() {
    var match = location.hash.match(/id=([\w-]+)/);
    var id = match ? match[1] : null;
    var fazenda = id ? window.NiveloFazendas.findById(id) : null;

    if (!fazenda) {
      document.getElementById('fazenda-cadastro-not-found').hidden = false;
      document.getElementById('fazenda-cadastro-content').hidden = true;
      return;
    }

    currentFazenda = fazenda;
    document.getElementById('fazenda-cadastro-not-found').hidden = true;
    document.getElementById('fazenda-cadastro-content').hidden = false;

    renderHeader(fazenda);
    renderDados(fazenda);
    renderTalhoes(fazenda);

    // Toast de sucesso ao voltar de "Editar fazenda" (nova-fazenda.html?id=),
    // mesmo padrão sessionStorage-flag já usado em Produtos/Cadastro.
    var editSuccess = null;
    try {
      editSuccess = sessionStorage.getItem('nivelo.fazendaeditada.success');
      if (editSuccess) sessionStorage.removeItem('nivelo.fazendaeditada.success');
    } catch (e) {}
    if (editSuccess) {
      showSuccessToast(editSuccess, 'As alterações já estão disponíveis nesta página.');
    }
  }

  boot();
})();
