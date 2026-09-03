(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Só 2 status (decisão explícita — "Em pouso" foi removido do vocabulário
  // do Caderno de Campo, nenhum talhão do seed usa mais esse valor).
  var STATUS_TALHAO = {
    'em-producao': { status: 'success', label: 'Em produção' },
    'disponivel': { status: 'info', label: 'Disponível' }
  };

  var currentFazenda = null;

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDataHora(iso) {
    var d = new Date(iso);
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' · ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function formatBRL(valor) {
    return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatNumero(valor) {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  }

  // ---------- Tooltip de ação (mesmo padrão de fazenda-detalhe-cadastro.js/
  // produtos.js: `.actionBtn`+`.tip`, reparentado pra `document.body` no
  // 1º hover pra escapar de qualquer `filter`/zebra ancestral). ----------
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

  // ---------- Render: cabeçalho ----------
  function renderHeader(fazenda) {
    document.getElementById('fazenda-detalhe-nome').textContent = fazenda.nome;
    document.getElementById('fazenda-detalhe-localizacao').textContent = (fazenda.cidade && fazenda.estado) ? (fazenda.cidade + ', ' + fazenda.estado) : (fazenda.cidade || fazenda.estado || '—');
    document.title = fazenda.nome + ' — Nivelo';
  }

  function culturasAtuais(fazenda) {
    var culturas = [];
    fazenda.talhoes.forEach(function (t) {
      if (t.cultura && culturas.indexOf(t.cultura) === -1) culturas.push(t.cultura);
    });
    return culturas.length ? culturas.join(', ') : 'Sem cultura';
  }

  // ---------- KPIs (Custo acumulado / Produção registrada / Produtividade
  // média / Custo médio por hectare / Anotações registradas) ----------
  // Custo acumulado soma tanto Despesa manual quanto o custo calculado de
  // Aplicação de insumo — decisão documentada em app/CLAUDE.md: os dois
  // representam gasto real da fazenda, mesmo a Aplicação de insumo não
  // sendo literalmente um "registro de Despesa".
  function buildKpis(registros) {
    var custoAcumulado = 0;
    var anotacoes = 0;
    var porUnidade = {};

    registros.forEach(function (r) {
      if (r.tipo === 'despesa-manual') custoAcumulado += (r.valor || 0);
      if (r.tipo === 'aplicacao-insumo') custoAcumulado += (r.custoCalculado || 0);
      if (r.tipo === 'anotacao') anotacoes += 1;
      if (r.tipo === 'colheita') porUnidade[r.unidade] = (porUnidade[r.unidade] || 0) + r.quantidade;
    });

    var unidades = Object.keys(porUnidade).sort(function (a, b) { return porUnidade[b] - porUnidade[a]; });

    return { custoAcumulado: custoAcumulado, anotacoes: anotacoes, unidades: unidades, porUnidade: porUnidade };
  }

  function renderResumo(fazenda, registros) {
    document.getElementById('resumo-area').textContent = fazenda.areaHa + ' ha';
    document.getElementById('resumo-talhoes').textContent = fazenda.talhoes.length;
    document.getElementById('resumo-cultura').textContent = culturasAtuais(fazenda);

    var kpis = buildKpis(registros);
    document.getElementById('resumo-custo-acumulado').textContent = formatBRL(kpis.custoAcumulado);
    document.getElementById('resumo-custo-medio-ha').textContent = fazenda.areaHa > 0 ? formatBRL(kpis.custoAcumulado / fazenda.areaHa) : '—';
    document.getElementById('resumo-anotacoes').textContent = kpis.anotacoes + (kpis.anotacoes === 1 ? ' registro' : ' registros');

    var producaoEl = document.getElementById('resumo-producao');
    var mediaEl = document.getElementById('resumo-produtividade-media');
    if (!kpis.unidades.length) {
      producaoEl.innerHTML = '<span class="fazenda-resumo-value">—</span>';
      mediaEl.innerHTML = '<span class="fazenda-resumo-value">—</span>';
    } else {
      var principal = kpis.unidades[0];
      var producaoHTML = '<span class="fazenda-resumo-value">' + formatNumero(kpis.porUnidade[principal]) + ' ' + principal + '</span>';
      kpis.unidades.slice(1).forEach(function (u) {
        producaoHTML += '<span class="fazenda-resumo-value is-secondary-line">+ ' + formatNumero(kpis.porUnidade[u]) + ' ' + u + '</span>';
      });
      producaoEl.innerHTML = producaoHTML;
      mediaEl.innerHTML = fazenda.areaHa > 0
        ? '<span class="fazenda-resumo-value">' + formatNumero(kpis.porUnidade[principal] / fazenda.areaHa) + ' ' + principal + '/ha</span>'
        : '<span class="fazenda-resumo-value">—</span>';
    }
  }

  // ---------- Talhões (tabela + cards) ----------
  // Ação de safra alterna entre "Iniciar safra" (talhão Disponível, sem
  // cultura ativa) e "Encerrar safra" (talhão Em produção) — nunca as duas
  // ao mesmo tempo, já que só existem esses 2 status.
  function buildSafraActionHTML(t, fazendaId) {
    if (t.status === 'disponivel') {
      return '<button type="button" class="actionBtn" data-action="iniciar-safra" data-fazenda="' + fazendaId + '" data-talhao="' + t.id + '" aria-label="Iniciar safra"><i data-lucide="flag" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Iniciar safra</span></button>';
    }
    return '<button type="button" class="actionBtn" data-action="encerrar-safra" data-fazenda="' + fazendaId + '" data-talhao="' + t.id + '" aria-label="Encerrar safra"><i data-lucide="flag-off" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Encerrar safra</span></button>';
  }

  function buildAcoesHTML(t, fazendaId) {
    return (
      '<div class="cellActions">' +
        '<button type="button" class="actionBtn" data-action="ver-detalhes" data-fazenda="' + fazendaId + '" data-talhao="' + t.id + '" aria-label="Ver detalhes"><i data-lucide="eye" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Ver detalhes</span></button>' +
        '<button type="button" class="actionBtn" data-action="nova-anotacao" data-fazenda="' + fazendaId + '" data-talhao="' + t.id + '" aria-label="Nova anotação"><i data-lucide="plus" width="16" height="16"></i><span class="tip text-body-xs top"><span class="arrow"></span>Nova anotação</span></button>' +
        buildSafraActionHTML(t, fazendaId) +
      '</div>'
    );
  }

  function ultimaAnotacaoHTML(fazendaId, talhaoId) {
    var registro = window.NiveloCadernoV2.lastRecordByTalhao(fazendaId, talhaoId);
    if (!registro) return '<span class="talhao-ultima-anotacao-sem text-body-s">Sem registros</span>';
    return '<span class="text-body-s">' + formatDataHora(registro.dataHora) + '</span>';
  }

  function buildRowHTML(t, fazendaId) {
    var badge = STATUS_TALHAO[t.status] || STATUS_TALHAO.disponivel;
    return (
      '<tr class="tr">' +
        '<td class="td">' + t.nome + '</td>' +
        '<td class="td">' + (t.cultura || '—') + '</td>' +
        '<td class="td">' + (t.safra || '—') + '</td>' +
        '<td class="td">' + ultimaAnotacaoHTML(fazendaId, t.id) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td">' + buildAcoesHTML(t, fazendaId) + '</td>' +
      '</tr>'
    );
  }

  function buildCardHTML(t, fazendaId) {
    var badge = STATUS_TALHAO[t.status] || STATUS_TALHAO.disponivel;
    return (
      '<div class="card talhao-mobile-card">' +
        '<div class="talhao-mobile-card-header">' +
          '<strong class="talhao-mobile-card-name text-body-s">' + t.nome + '</strong>' +
          '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>' +
        '</div>' +
        '<dl class="talhao-mobile-card-fields text-body-s">' +
          '<div><dt>Cultura atual</dt><dd>' + (t.cultura || '—') + '</dd></div>' +
          '<div><dt>Safra atual</dt><dd>' + (t.safra || '—') + '</dd></div>' +
          '<div><dt>Última anotação</dt><dd>' + (window.NiveloCadernoV2.lastRecordByTalhao(fazendaId, t.id) ? formatDataHora(window.NiveloCadernoV2.lastRecordByTalhao(fazendaId, t.id).dataHora) : '—') + '</dd></div>' +
        '</dl>' +
        '<div class="talhao-mobile-card-actions">' + buildAcoesHTML(t, fazendaId) + '</div>' +
      '</div>'
    );
  }

  function renderTalhoes(fazenda) {
    var isEmptyDemo = /state=empty/.test(location.hash);
    var talhoes = isEmptyDemo ? [] : fazenda.talhoes;
    var tbody = document.getElementById('talhoes-tbody');
    var mobileList = document.getElementById('talhoes-mobile-list');
    var tableWrap = document.getElementById('talhoes-table-wrap');
    var emptyEl = document.getElementById('talhoes-empty');
    var showEmpty = talhoes.length === 0;

    tableWrap.hidden = showEmpty;
    mobileList.hidden = showEmpty;
    emptyEl.hidden = !showEmpty;

    if (!showEmpty) {
      tbody.innerHTML = talhoes.map(function (t) { return buildRowHTML(t, fazenda.id); }).join('');
      mobileList.innerHTML = talhoes.map(function (t) { return buildCardHTML(t, fazenda.id); }).join('');
    }
    if (window.lucide) lucide.createIcons();
  }

  function renderAll() {
    var registros = window.NiveloCadernoV2.listByFazenda(currentFazenda.id);
    renderHeader(currentFazenda);
    renderResumo(currentFazenda, registros);
    renderTalhoes(currentFazenda);
  }

  // ---------- Modal: Encerrar safra ----------
  var encerrarOverlay = document.getElementById('encerrar-safra-overlay');
  var encerrarTarget = null;

  function openEncerrarSafraDialog(fazendaId, talhaoId) {
    encerrarTarget = { fazendaId: fazendaId, talhaoId: talhaoId };
    encerrarOverlay.hidden = false;
  }
  function closeEncerrarSafraDialog() {
    encerrarOverlay.hidden = true;
    encerrarTarget = null;
  }
  document.getElementById('encerrar-safra-close').addEventListener('click', closeEncerrarSafraDialog);
  document.getElementById('encerrar-safra-cancel').addEventListener('click', closeEncerrarSafraDialog);
  encerrarOverlay.addEventListener('click', function (event) {
    if (event.target === encerrarOverlay) closeEncerrarSafraDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !encerrarOverlay.hidden) closeEncerrarSafraDialog();
  });

  document.getElementById('encerrar-safra-confirm').addEventListener('click', function () {
    if (!encerrarTarget) return;
    // Mutação real (limpa cultura/safra + fecha o registro em
    // historicoSafras) centralizada em fazendas-data.js, compartilhada com
    // talhao-detalhe-v2.js — ver `encerrarSafraTalhao`.
    window.NiveloFazendas.encerrarSafraTalhao(encerrarTarget.fazendaId, encerrarTarget.talhaoId);
    closeEncerrarSafraDialog();
    renderAll();
    showSuccessToast('Safra encerrada com sucesso.');
  });

  // ---------- Modal: Iniciar safra (só quando o talhão está Disponível) ----------
  // Dropdown genérico mínimo, mesmo padrão de novo-cadastro.js/nova-anotacao.js
  // (position:fixed via JS, escapa de overflow do Dialog).
  function initDropdown(root) {
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var valueEl = root.querySelector('[data-dropdown-value]');
    var menu = root.querySelector('[data-dropdown-menu]');
    function positionMenu() {
      var rect = trigger.getBoundingClientRect();
      menu.style.position = 'fixed';
      menu.style.left = rect.left + 'px';
      menu.style.width = rect.width + 'px';
      menu.style.top = (rect.bottom + 4) + 'px';
      menu.style.maxHeight = '200px';
      menu.style.overflowY = 'auto';
    }
    function close() { root.classList.remove('open'); }
    function open() { root.classList.add('open'); positionMenu(); }
    trigger.addEventListener('click', function () {
      if (root.classList.contains('open')) close(); else open();
    });
    menu.addEventListener('click', function (event) {
      var optionEl = event.target.closest('.option');
      if (!optionEl) return;
      Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      close();
    });
    document.addEventListener('click', function (event) { if (!root.contains(event.target)) close(); });
    return {
      getValue: function () { return root.dataset.value || ''; },
      reset: function (placeholderText) {
        delete root.dataset.value;
        valueEl.textContent = placeholderText;
        valueEl.classList.add('placeholder');
        Array.prototype.slice.call(menu.querySelectorAll('.option')).forEach(function (o) { o.classList.remove('selected'); });
      }
    };
  }

  var iniciarOverlay = document.getElementById('iniciar-safra-overlay');
  var iniciarTarget = null;
  var iniciarCulturaField = document.getElementById('iniciar-safra-cultura-field');
  var iniciarSafraField = document.getElementById('iniciar-safra-safra-field');
  var iniciarCulturaDropdown = initDropdown(iniciarCulturaField);
  var iniciarSafraDropdown = initDropdown(iniciarSafraField);

  // Mesmo catálogo de Grãos já usado em Colheita (nova-anotacao-v2.js) —
  // cultura atual do talhão é sempre um produto de venda de categoria Grãos.
  var PRODUTOS_GRAOS = (window.NiveloProdutos ? window.NiveloProdutos.list() : []).filter(function (p) {
    return p.categoria === 'Grãos' && p.status === 'ativo';
  });
  iniciarCulturaField.querySelector('[data-dropdown-menu]').innerHTML = PRODUTOS_GRAOS.map(function (p) {
    return '<div class="option" data-value="' + p.nome + '">' + p.nome + '</div>';
  }).join('');
  iniciarSafraField.querySelector('[data-dropdown-menu]').innerHTML = (window.NiveloSafras ? window.NiveloSafras.list() : []).map(function (s) {
    return '<div class="option" data-value="' + s + '">' + s + '</div>';
  }).join('');

  function openIniciarSafraDialog(fazendaId, talhaoId) {
    iniciarTarget = { fazendaId: fazendaId, talhaoId: talhaoId };
    iniciarCulturaField.classList.remove('error');
    iniciarSafraField.classList.remove('error');
    iniciarCulturaDropdown.reset('Selecione a cultura');
    iniciarSafraDropdown.reset('Selecione a safra');
    iniciarOverlay.hidden = false;
  }
  function closeIniciarSafraDialog() {
    iniciarOverlay.hidden = true;
    iniciarTarget = null;
  }
  document.getElementById('iniciar-safra-close').addEventListener('click', closeIniciarSafraDialog);
  document.getElementById('iniciar-safra-cancel').addEventListener('click', closeIniciarSafraDialog);
  iniciarOverlay.addEventListener('click', function (event) {
    if (event.target === iniciarOverlay) closeIniciarSafraDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !iniciarOverlay.hidden) closeIniciarSafraDialog();
  });
  document.getElementById('iniciar-safra-confirm').addEventListener('click', function () {
    if (!iniciarTarget) return;
    var cultura = iniciarCulturaDropdown.getValue();
    var safra = iniciarSafraDropdown.getValue();
    var valid = true;
    if (!cultura) { iniciarCulturaField.classList.add('error'); valid = false; }
    if (!safra) { iniciarSafraField.classList.add('error'); valid = false; }
    if (!valid) return;
    window.NiveloFazendas.iniciarSafraTalhao(iniciarTarget.fazendaId, iniciarTarget.talhaoId, cultura, safra);
    closeIniciarSafraDialog();
    renderAll();
    showSuccessToast('Safra iniciada com sucesso.');
  });

  // ---------- Ações da tabela/cards (delegadas) ----------
  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var fazendaId = btn.dataset.fazenda;
    var talhaoId = btn.dataset.talhao;
    var action = btn.dataset.action;

    if (action === 'nova-anotacao') {
      window.location.href = 'nova-anotacao-v2.html?fazenda=' + encodeURIComponent(fazendaId) + '&talhao=' + encodeURIComponent(talhaoId);
    } else if (action === 'encerrar-safra') {
      openEncerrarSafraDialog(fazendaId, talhaoId);
    } else if (action === 'iniciar-safra') {
      openIniciarSafraDialog(fazendaId, talhaoId);
    } else if (action === 'ver-detalhes') {
      window.location.href = 'talhao-detalhe-v2.html#fazenda=' + fazendaId + '&talhao=' + talhaoId;
    }
  });

  // ---------- Toast de sucesso ----------
  var toastRegion = document.getElementById('toast-region');
  function showSuccessToast(title) {
    var toast = document.createElement('div');
    toast.className = 'alert success fazenda-detalhe-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="circle-check" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 6000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  // ---------- Boot ----------
  function boot() {
    var match = location.hash.match(/id=([\w-]+)/);
    var id = match ? match[1] : null;
    var fazenda = id ? window.NiveloFazendas.findById(id) : null;

    if (!fazenda) {
      document.getElementById('fazenda-detalhe-not-found').hidden = false;
      document.getElementById('fazenda-detalhe-content').hidden = true;
      return;
    }

    currentFazenda = fazenda;
    document.getElementById('fazenda-detalhe-not-found').hidden = true;
    document.getElementById('fazenda-detalhe-content').hidden = false;
    renderAll();

    var novaAnotacaoMessage = sessionStorage.getItem('nivelo.novaanotacaov2.success');
    if (novaAnotacaoMessage) {
      sessionStorage.removeItem('nivelo.novaanotacaov2.success');
      showSuccessToast(novaAnotacaoMessage);
    }
  }

  boot();
})();
