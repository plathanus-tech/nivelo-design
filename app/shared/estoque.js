(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatInt(n) {
    return n.toLocaleString('pt-BR');
  }

  // ---------- Dados mockados (3 conceitos independentes, ver rules.md) ----------
  // `codigo` (estável)/`sku`/`quantidadeInicial`/`historico`: retrofit desta
  // rodada (ver rules.md, "Estoque — ações e histórico") — `quantidadeInicial`
  // nunca é sobrescrita (só a `quantidade` viva diminui via Registrar saída/
  // consumo); `historico` começa com 1 entrada seed representando o registro
  // original, e só recebe novas entradas por `.push` (nunca reescrita).
  var VENDAS = [
    { codigo: 'VND-001', produto: 'Soja', sku: 'PRD-001', unidade: 'Saca', quantidadeInicial: 500, quantidade: 500, historico: [{ tipo: 'estoque-inicial', quantidade: 500, data: '2026-06-02', observacao: null }] },
    { codigo: 'VND-002', produto: 'Milho', sku: 'PRD-002', unidade: 'Saca', quantidadeInicial: 300, quantidade: 300, historico: [{ tipo: 'estoque-inicial', quantidade: 300, data: '2026-06-10', observacao: null }] },
    { codigo: 'VND-003', produto: 'Trigo', sku: 'PRD-003', unidade: 'Saca', quantidadeInicial: 200, quantidade: 200, historico: [{ tipo: 'estoque-inicial', quantidade: 200, data: '2026-06-18', observacao: null }] },
    { codigo: 'VND-004', produto: 'Sorgo', sku: 'PRD-004', unidade: 'Saca', quantidadeInicial: 150, quantidade: 150, historico: [{ tipo: 'estoque-inicial', quantidade: 150, data: '2026-07-01', observacao: null }] },
    { codigo: 'VND-005', produto: 'Feijão', sku: 'PRD-005', unidade: 'Saca', quantidadeInicial: 100, quantidade: 100, historico: [{ tipo: 'estoque-inicial', quantidade: 100, data: '2026-07-10', observacao: null }] }
  ];

  // `tipoEntrada`: 'manual'|'xml' — Semente carrega um exemplo real de entrada
  // por XML (ver Novo registo de estoque) pra a variante correspondente da
  // página de detalhes ter conteúdo de verdade pra mostrar. `fornecedor`/
  // `valorUnitario`/`deposito`: opcionais, `null` quando não informados
  // (nunca um traço "—" direto no dado, isso é só apresentação).
  //
  // O array em si (seed + mutações de quantidade/histórico) vive agora em
  // `estoque-compras-data.js` (`window.NiveloEstoqueCompras`), carregado
  // antes deste script — extraído pra lá pra virar a fonte única compartilhada
  // com o Relatório de Compras (`relatorio-compras.html`), que precisa ler os
  // mesmos dados sem depender de nenhum elemento de DOM desta tela. Os
  // objetos retornados por `.list()` são os MESMOS objetos do módulo (só o
  // array é copiado, não os registros), então toda mutação feita aqui em
  // `record.quantidade`/`record.historico` (Registrar consumo etc.) já reflete
  // de volta em `window.NiveloEstoqueCompras.list()` normalmente.
  var COMPRAS = window.NiveloEstoqueCompras.list();

  // `abatida` nunca é editada diretamente pelo usuário (ver rules.md,
  // "Estoque Comprometido") — é sempre o resultado acumulado de movimentações
  // de abatimento registradas, aqui só o estado final pra fins de mock.
  // `destinatario` (era "Cooperativa"): o compromisso futuro nem sempre é com
  // uma cooperativa, pode ser qualquer comprador/empresa/entidade. `unidade`
  // é um gap retrofitado nesta rodada (faltava antes); `comprometida` NUNCA
  // muda depois de criado — só `abatida`/`pendente`/`situacao` recalculam a
  // cada "Registrar abatimento".
  var COMPROMETIDO = [
    { codigo: 'CMT-001', produto: 'Soja', sku: 'PRD-001', unidade: 'Saca', destinatario: 'Cooperativa Alfa', comprometida: 500, abatida: 300, historico: [{ tipo: 'compromisso-inicial', quantidade: 500, data: '2026-06-12', observacao: null }] },
    { codigo: 'CMT-002', produto: 'Milho', sku: 'PRD-002', unidade: 'Saca', destinatario: 'Cooperativa Beta', comprometida: 1000, abatida: 1000, historico: [{ tipo: 'compromisso-inicial', quantidade: 1000, data: '2026-06-15', observacao: null }] }
  ].map(function (item) {
    item.pendente = Math.max(0, item.comprometida - item.abatida);
    item.situacao = item.pendente <= 0 ? 'quitado' : 'pendente';
    return item;
  });

  // Fallback: os registros acima já carregam `sku`/`unidade` literalmente,
  // então isso raramente é chamado — existe só como rede de segurança caso um
  // registro futuro (ex. um dia vindo de fora) não tenha essa informação.
  function resolveProdutoInfo(record) {
    var fallback = (window.NiveloProdutos && window.NiveloProdutos.findByNome(record.produto)) || {};
    return { sku: record.sku || fallback.sku || '', unidade: record.unidade || fallback.unidade || '' };
  }

  // ---------- Resumo (ver rules.md: 3 indicadores independentes, nunca somados) ----------
  // Os 3 cards mostram só um indicador principal + uma informação secundária
  // (sem listar produtos individualmente — isso fica nas tabelas das abas),
  // mesmo padrão estrutural dos cards de KPI do Dashboard.
  function renderSummary() {
    var totalVendas = VENDAS.reduce(function (sum, item) { return sum + item.quantidade; }, 0);
    document.getElementById('summary-vendas-value').textContent = formatInt(totalVendas) + ' sacas';
    document.getElementById('summary-vendas-caption').textContent =
      VENDAS.length + (VENDAS.length === 1 ? ' produto' : ' produtos');

    // Compras: unidades incompatíveis entre si (sc/kg/L) — nunca somadas num
    // único número. Indicador principal vira contagem de produtos; a
    // informação secundária reforça a contagem de tipos de unidade, nunca uma
    // quantidade consolidada inválida.
    document.getElementById('summary-compras-value').textContent =
      COMPRAS.length + (COMPRAS.length === 1 ? ' produto' : ' produtos');
    document.getElementById('summary-compras-caption').textContent =
      COMPRAS.length + (COMPRAS.length === 1 ? ' tipo de produto' : ' tipos de produtos');

    // Valor principal = total pendente (sempre o indicador mais acionável);
    // legenda secundária = CONTAGEM de compromissos cuja Situação ainda é
    // Pendente (nunca o total de linhas — um compromisso já Quitado não é
    // mais "pendente", não deveria inflar essa contagem).
    var totalPendente = COMPROMETIDO.reduce(function (sum, item) { return sum + item.pendente; }, 0);
    var countPendentes = COMPROMETIDO.filter(function (item) { return item.situacao === 'pendente'; }).length;
    document.getElementById('summary-comprometido-value').textContent = formatInt(totalPendente) + ' sacas';
    document.getElementById('summary-comprometido-caption').textContent =
      countPendentes + (countPendentes === 1 ? ' compromisso pendente' : ' compromissos pendentes');
  }

  // ---------- Tabelas ----------
  var SITUACAO_BADGE = {
    pendente: { status: 'warning', label: 'Pendente' },
    quitado: { status: 'success', label: 'Quitado' }
  };

  // Ações em ícone + Tooltip padrão (mesmo `.actionBtn`/`.tip` do Table, ver
  // Cadastro) — nunca botão textual. `actions` é uma lista de
  // {action, icon, label}; "Ver detalhes" é comum às 3 tabelas, a 2ª ação
  // muda de nome/ícone conforme o conceito de cada estoque (ver rules.md).
  function buildActionsHTML(actions) {
    return '<div class="cellActions">' +
      actions.map(function (a) {
        return '<button type="button" class="actionBtn" data-action="' + a.action + '" aria-label="' + a.label + '">' +
          '<i data-lucide="' + a.icon + '" width="16" height="16"></i>' +
          '<span class="tip text-body-xs top"><span class="arrow"></span>' + a.label + '</span>' +
          '</button>';
      }).join('') +
      '</div>';
  }

  var VER_DETALHES = { action: 'ver-detalhes', icon: 'eye', label: 'Ver detalhes' };

  function renderVendas() {
    var tbody = document.getElementById('vendas-tbody');
    tbody.innerHTML = VENDAS.map(function (item) {
      return '<tr class="tr">' +
        '<td class="td">' + item.produto + '</td>' +
        '<td class="td">' + item.unidade + '</td>' +
        '<td class="td">' + formatInt(item.quantidade) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML([
          VER_DETALHES,
          { action: 'registrar-saida', icon: 'minus-circle', label: 'Registrar saída' }
        ]) + '</td>' +
        '</tr>';
    }).join('');
    attachRecords(tbody, VENDAS, 'vendas');
    if (window.lucide) lucide.createIcons();
  }

  function renderCompras() {
    var tbody = document.getElementById('compras-tbody');
    tbody.innerHTML = COMPRAS.map(function (item) {
      return '<tr class="tr">' +
        '<td class="td">' + item.produto + '</td>' +
        '<td class="td">' + item.unidade + '</td>' +
        '<td class="td">' + formatInt(item.quantidade) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML([
          VER_DETALHES,
          { action: 'registrar-consumo', icon: 'minus-circle', label: 'Registrar consumo' }
        ]) + '</td>' +
        '</tr>';
    }).join('');
    attachRecords(tbody, COMPRAS, 'compras');
    if (window.lucide) lucide.createIcons();
  }

  function renderComprometido() {
    var tbody = document.getElementById('comprometido-tbody');
    tbody.innerHTML = COMPROMETIDO.map(function (item) {
      var badge = SITUACAO_BADGE[item.situacao];
      return '<tr class="tr">' +
        '<td class="td">' + item.produto + '</td>' +
        '<td class="td">' + item.destinatario + '</td>' +
        '<td class="td">' + formatInt(item.comprometida) + '</td>' +
        '<td class="td">' + formatInt(item.abatida) + '</td>' +
        '<td class="td">' + formatInt(item.pendente) + '</td>' +
        '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
        '<td class="td tdActions">' + buildActionsHTML([
          VER_DETALHES,
          { action: 'registrar-abatimento', icon: 'minus-circle', label: 'Registrar abatimento' }
        ]) + '</td>' +
        '</tr>';
    }).join('');
    attachRecords(tbody, COMPROMETIDO, 'comprometido');
    if (window.lucide) lucide.createIcons();
  }

  // Guarda o registro original em cada `<tr>` (propriedade direta no nó, não
  // `data-*`) pra a ordenação comparar valores tipados (número vs texto) sem
  // precisar re-parsear o texto já formatado da célula. `id` estável (não
  // existe um código único como em Cadastro) serve só pra ligar o Card
  // mobile de volta na linha real (ver `data-row-id` abaixo).
  function attachRecords(tbody, records, panelKey) {
    var rows = tbody.querySelectorAll('.tr');
    Array.prototype.forEach.call(rows, function (row, i) {
      row.__record = records[i];
      row.id = panelKey + '-row-' + i;
    });
  }

  // ---------- Mobile: cada linha vira um Card (mesmo padrão de Cadastro,
  // ver rules.md/page-cadastros.css) — gerado a partir das células REAIS já
  // renderizadas na `<tr>` (texto já formatado, badge/ações reaproveitados
  // via `innerHTML`), nunca uma segunda fonte de dados. ----------
  function cellText(cell) { return cell.textContent.trim(); }

  // Vendas e Compras têm exatamente as mesmas 4 colunas (Produto/Unidade/
  // Quantidade/Ações) — um único builder serve as 2 tabelas.
  function buildQuantidadeCardHTML(row) {
    var cells = row.children;
    var actionsHTML = cells[3].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card estoque-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="estoque-mobile-card-header">' +
          '<div class="estoque-mobile-card-name text-subtitle-s">' + cellText(cells[0]) + '</div>' +
        '</div>' +
        '<dl class="estoque-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Unidade</dt><dd class="text-12-regular">' + cellText(cells[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Quantidade</dt><dd class="text-12-regular">' + cellText(cells[2]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions estoque-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  function buildComprometidoCardHTML(row) {
    var cells = row.children;
    var statusHTML = cells[5].innerHTML;
    var actionsHTML = cells[6].querySelector('.cellActions').innerHTML;
    return (
      '<div class="card estoque-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="estoque-mobile-card-header">' +
          '<div class="estoque-mobile-card-name text-subtitle-s">' + cellText(cells[0]) + '</div>' +
          statusHTML +
        '</div>' +
        '<dl class="estoque-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Destinatário</dt><dd class="text-12-regular">' + cellText(cells[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Qtd. comprometida</dt><dd class="text-12-regular">' + cellText(cells[2]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Qtd. abatida</dt><dd class="text-12-regular">' + cellText(cells[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Qtd. pendente</dt><dd class="text-12-regular">' + cellText(cells[4]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions estoque-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  var cardsContainers = {
    vendas: document.getElementById('vendas-cards'),
    compras: document.getElementById('compras-cards'),
    comprometido: document.getElementById('comprometido-cards')
  };
  var CARD_BUILDERS = {
    vendas: buildQuantidadeCardHTML,
    compras: buildQuantidadeCardHTML,
    comprometido: buildComprometidoCardHTML
  };

  // Espelha só as linhas VISÍVEIS (`!row.hidden`) do tbody real, na ordem
  // atual (já refletindo ordenação/busca/filtros) — chamado de dentro de
  // `applyVisibility()`, nunca junto do render inicial da tabela sozinho.
  function renderMobileCards(panelKey) {
    var tbody = document.getElementById(panelKey + '-tbody');
    var rows = Array.prototype.filter.call(tbody.querySelectorAll('.tr'), function (row) { return !row.hidden; });
    cardsContainers[panelKey].innerHTML = rows.map(CARD_BUILDERS[panelKey]).join('');
  }

  // ---------- Abas ----------
  var tablist = document.getElementById('estoque-tablist');
  var panels = {
    vendas: document.getElementById('panel-vendas'),
    compras: document.getElementById('panel-compras'),
    comprometido: document.getElementById('panel-comprometido')
  };
  var filtrosFieldEl = document.getElementById('estoque-filtros-field');

  function getActivePanelKey() {
    return Object.keys(panels).filter(function (k) { return !panels[k].hidden; })[0];
  }

  tablist.addEventListener('click', function (event) {
    var tabBtn = event.target.closest('.tab');
    if (!tabBtn) return;
    var target = tabBtn.dataset.tab;

    Array.prototype.forEach.call(tablist.querySelectorAll('.tab'), function (btn) {
      var isActive = btn === tabBtn;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    Object.keys(panels).forEach(function (key) {
      panels[key].hidden = key !== target;
    });

    // "Filtros" (Situação/Destinatário) só existe na aba Estoque Comprometido
    // (ver rules.md) — escondido nas outras 2 abas.
    filtrosFieldEl.hidden = target !== 'comprometido';
    if (target !== 'comprometido') closeFiltrosPopover();
    applyVisibility(target);
  });

  // ---------- Ordenação (mesmo padrão de Cadastro: clique no `th.sortable`
  // alterna asc/desc, reordena as `<tr>` de verdade via `tbody.appendChild`) ----------
  function initSortableTable(cardEl) {
    var tbody = cardEl.querySelector('tbody');
    var headerRow = cardEl.querySelector('.headerRow');
    var state = { key: null, dir: 'asc' };

    headerRow.addEventListener('click', function (event) {
      var th = event.target.closest('.th.sortable');
      if (!th) return;
      var key = th.dataset.sortKey;
      state.dir = (state.key === key && state.dir === 'asc') ? 'desc' : 'asc';
      state.key = key;

      // O ícone vira `<svg>` depois do primeiro `lucide.createIcons()` (o
      // Lucide substitui o `<i data-lucide>` original) — por isso o ícone é
      // sempre RECRIADO via innerHTML a cada clique, nunca só reatribuído
      // via `setAttribute` num `<i>` que já não existe mais (mesmo padrão
      // de cadastros.js).
      Array.prototype.forEach.call(headerRow.querySelectorAll('.th.sortable'), function (otherTh) {
        var active = otherTh === th;
        otherTh.setAttribute('aria-sort', active ? (state.dir === 'asc' ? 'ascending' : 'descending') : 'none');
        var iconName = active ? (state.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down';
        otherTh.querySelector('[data-sort-icon]').innerHTML = '<i data-lucide="' + iconName + '" width="12" height="12"></i>';
      });
      if (window.lucide) lucide.createIcons();

      var rows = Array.prototype.slice.call(tbody.querySelectorAll('.tr'));
      rows.sort(function (a, b) {
        var va = a.__record[key];
        var vb = b.__record[key];
        var cmp = typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'pt-BR');
        return state.dir === 'asc' ? cmp : -cmp;
      });
      rows.forEach(function (row) { tbody.appendChild(row); });
    });
  }

  // ---------- Tooltip padrão do ícone de ação (Registrar abatimento) ----------
  // Mesma técnica de `position:fixed` + reparent pra `document.body` já usada
  // em cadastros.js — necessária aqui pelo mesmo motivo: as linhas zebradas
  // aplicam `filter:brightness()`, que vira "containing block" de um
  // `position:fixed` (ver app/CLAUDE.md, round 16).
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

  // ---------- Busca (mesma lógica de normalização de Cadastro: ignora
  // acento/caixa) — filtra por Produto, compartilhada pelas 3 abas. ----------
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return String(text).normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
  }

  var searchInput = document.getElementById('estoque-search-input');

  // Estado dos filtros de Estoque Comprometido (só essa aba tem filtros,
  // ver rules.md) — aplicado/limpo através do popover "Filtros".
  var comprometidoFilters = { situacao: 'todas', destinatario: 'todos' };

  function applyVisibility(panelKey) {
    var tbody = document.getElementById(panelKey + '-tbody');
    var query = normalize(searchInput.value.trim());
    var visibleCount = 0;

    Array.prototype.forEach.call(tbody.querySelectorAll('.tr'), function (row) {
      var record = row.__record;
      var matchesSearch = !query || normalize(record.produto).indexOf(query) !== -1;
      var matchesFilters = true;
      if (panelKey === 'comprometido') {
        if (comprometidoFilters.situacao !== 'todas' && record.situacao !== comprometidoFilters.situacao) matchesFilters = false;
        if (comprometidoFilters.destinatario !== 'todos' && record.destinatario !== comprometidoFilters.destinatario) matchesFilters = false;
      }
      var visible = matchesSearch && matchesFilters;
      row.hidden = !visible;
      if (visible) visibleCount++;
    });

    var card = panels[panelKey];
    card.querySelector('.tableWrap').hidden = visibleCount === 0;
    card.querySelector('[data-empty]').hidden = visibleCount > 0;
    renderMobileCards(panelKey);
  }

  searchInput.addEventListener('input', function () {
    applyVisibility(getActivePanelKey());
  });

  // ---------- Dropdown genérico (mesmo padrão de Cadastro/Dashboard: menu em
  // `position:fixed` calculado via JS, escapa do `overflow:hidden` de
  // qualquer `.card` ancestral) — reaproveitado aqui pros 2 campos do
  // popover "Filtros". ----------
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

    function reset(value, label) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl); else { valueEl.textContent = label; root.dataset.value = value; }
    }

    return { selectOption: selectOption, reset: reset };
  }

  // Opções de Destinatário geradas a partir dos valores reais do mock (não
  // hardcoded) — qualquer novo destinatário que aparecer nos dados já vira
  // uma opção de filtro automaticamente.
  var destinatarios = COMPROMETIDO.map(function (item) { return item.destinatario; })
    .filter(function (value, index, arr) { return arr.indexOf(value) === index; });
  document.getElementById('filtro-destinatario-menu').innerHTML =
    '<div class="option selected" data-value="todos">Todos</div>' +
    destinatarios.map(function (d) { return '<div class="option" data-value="' + d + '">' + d + '</div>'; }).join('');

  var situacaoDropdown = initDropdown(document.getElementById('filtro-situacao-field'));
  var destinatarioDropdown = initDropdown(document.getElementById('filtro-destinatario-field'));

  // ---------- Popover "Filtros" (Situação + Destinatário), só Estoque
  // Comprometido — mesma composição de Popover (`position:fixed` via JS,
  // fecha ao clicar fora/Esc) já usada em "Data de cadastro" (Cadastro). ----------
  var filtrosPopoverEl = document.getElementById('estoque-filtros-popover');
  var filtrosTriggerRoot = document.getElementById('estoque-filtros-trigger-root');
  var filtrosTriggerBtn = document.getElementById('estoque-filtros-trigger');

  function positionFiltrosPopover(anchorRect) {
    var margin = 16;
    var width = Math.min(320, window.innerWidth - margin * 2);
    filtrosPopoverEl.style.width = width + 'px';
    var left = anchorRect.left;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - margin - width;
    if (left < margin) left = margin;
    filtrosPopoverEl.style.left = left + 'px';
    filtrosPopoverEl.style.top = (anchorRect.bottom + 8) + 'px';
  }

  function outsideFiltrosClickHandler(event) {
    var path = event.composedPath ? event.composedPath() : [event.target];
    if (path.indexOf(filtrosPopoverEl) === -1 && path.indexOf(filtrosTriggerRoot) === -1) closeFiltrosPopover();
  }

  function openFiltrosPopover() {
    filtrosPopoverEl.hidden = false;
    positionFiltrosPopover(filtrosTriggerRoot.getBoundingClientRect());
    window.setTimeout(function () { document.addEventListener('click', outsideFiltrosClickHandler); }, 0);
  }

  function closeFiltrosPopover() {
    filtrosPopoverEl.hidden = true;
    document.removeEventListener('click', outsideFiltrosClickHandler);
  }

  filtrosTriggerBtn.addEventListener('click', function () {
    if (filtrosPopoverEl.hidden) openFiltrosPopover(); else closeFiltrosPopover();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !filtrosPopoverEl.hidden) closeFiltrosPopover();
  });

  document.getElementById('estoque-filtros-aplicar').addEventListener('click', function () {
    comprometidoFilters.situacao = document.getElementById('filtro-situacao-field').dataset.value || 'todas';
    comprometidoFilters.destinatario = document.getElementById('filtro-destinatario-field').dataset.value || 'todos';
    closeFiltrosPopover();
    applyVisibility('comprometido');
  });

  document.getElementById('estoque-filtros-limpar').addEventListener('click', function () {
    situacaoDropdown.reset('todas', 'Todas');
    destinatarioDropdown.reset('todos', 'Todos');
    comprometidoFilters.situacao = 'todas';
    comprometidoFilters.destinatario = 'todos';
    applyVisibility('comprometido');
  });

  // ---------- Exportar Excel (CSV com BOM, abre corretamente no Excel com
  // acentuação) — respeita a aba ativa e as linhas visíveis no momento
  // (busca/filtros já aplicados), não o dataset inteiro. ----------
  var EXPORT_CONFIG = {
    vendas: { filename: 'estoque-de-vendas', headers: ['Produto', 'Unidade', 'Quantidade'], cols: ['produto', 'unidade', 'quantidade'] },
    compras: { filename: 'estoque-de-compras', headers: ['Produto', 'Unidade', 'Quantidade'], cols: ['produto', 'unidade', 'quantidade'] },
    comprometido: {
      filename: 'estoque-comprometido',
      headers: ['Produto', 'Destinatário', 'Qtd. comprometida', 'Qtd. abatida', 'Qtd. pendente', 'Situação'],
      cols: ['produto', 'destinatario', 'comprometida', 'abatida', 'pendente', function (r) { return SITUACAO_BADGE[r.situacao].label; }]
    }
  };

  function exportActiveTab() {
    var key = getActivePanelKey();
    var config = EXPORT_CONFIG[key];
    var tbody = document.getElementById(key + '-tbody');
    var visibleRows = Array.prototype.filter.call(tbody.querySelectorAll('.tr'), function (row) { return !row.hidden; });

    var lines = [config.headers.join(';')];
    visibleRows.forEach(function (row) {
      var record = row.__record;
      var values = config.cols.map(function (col) {
        var value = typeof col === 'function' ? col(record) : record[col];
        return typeof value === 'number' ? formatInt(value) : value;
      });
      lines.push(values.join(';'));
    });

    var BOM = String.fromCharCode(0xFEFF);
    var csv = BOM + lines.join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = config.filename + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  document.getElementById('estoque-export-btn').addEventListener('click', exportActiveTab);

  // ---------- Toast de sucesso (Feedback reaproveitado como Toast, ver
  // rules.md) — agora recebe título + mensagem (antes só mensagem, com um
  // título fixo "Registo de estoque salvo"), pra servir tanto o retorno de
  // Novo registo de estoque quanto os 3 modais de ação abaixo. ----------
  var toastRegion = document.getElementById('toast-region');

  function showSuccessToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert success estoque-toast';
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

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatCurrency(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function openModal(overlay) { overlay.hidden = false; }
  function closeModal(overlay) { overlay.hidden = true; }

  function wireModalDismiss(overlay, closeBtnId, cancelBtnId) {
    document.getElementById(closeBtnId).addEventListener('click', function () { closeModal(overlay); });
    document.getElementById(cancelBtnId).addEventListener('click', function () { closeModal(overlay); });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal(overlay);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !overlay.hidden) closeModal(overlay);
    });
  }

  // ---------- Modal: Registrar saída (Estoque de Vendas) ----------
  var saidaOverlay = document.getElementById('saida-dialog-overlay');
  var saidaState = { record: null, onConfirm: null };
  var saidaRecapTitle = document.getElementById('saida-recap-title');
  var saidaRecapSku = document.getElementById('saida-recap-sku');
  var saidaRecapUnidade = document.getElementById('saida-recap-unidade');
  var saidaRecapDisponivel = document.getElementById('saida-recap-disponivel');
  var saidaQuantidadeField = document.getElementById('saida-quantidade-field');
  var saidaQuantidadeInput = document.getElementById('saida-quantidade-input');
  var saidaPrecoField = document.getElementById('saida-preco-field');
  var saidaPrecoInput = document.getElementById('saida-preco-input');
  var saidaDestinatarioField = document.getElementById('saida-destinatario-field');
  var saidaDestinatarioInput = document.getElementById('saida-destinatario-input');
  var saidaDataInput = document.getElementById('saida-data-input');
  // ---------- Data da saída: padrão oficial de calendário do sistema (dia
  // único), ver app/shared/date-picker.js. ----------
  var saidaDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'saida-data-field',
    triggerId: 'saida-data-trigger',
    valueId: 'saida-data-value',
    hiddenInputId: 'saida-data-input',
    popoverId: 'saida-data-popover',
    placeholder: 'Selecionar data'
  });

  // ---------- Preço de venda: máscara de moeda (R$), mesma técnica de
  // "Valor unitário" em novo-estoque.js — estado sempre em centavos, cada
  // tecla reconstrói o valor formatado a partir só dos dígitos digitados. ----------
  var saidaPrecoCentavos = 0;
  function formatCentavosBRL(centavos) {
    return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  saidaPrecoInput.addEventListener('input', function () {
    var digits = saidaPrecoInput.value.replace(/\D/g, '');
    saidaPrecoCentavos = digits ? Number(digits) : 0;
    saidaPrecoInput.value = saidaPrecoCentavos ? formatCentavosBRL(saidaPrecoCentavos) : '';
  });

  // ---------- Destinatário/Cliente: combobox (busca em Cadastro de Pessoas
  // e Empresas, sem filtro de tipo — destinatário nem sempre é só "Cliente")
  // — mesma técnica de Input de busca + menu próprio já usada pro combobox
  // de Produto em novo-estoque.js. ----------
  var saidaDestinatarioMenu = document.getElementById('saida-destinatario-menu');

  function positionSaidaDestinatarioMenu() {
    var rect = saidaDestinatarioInput.getBoundingClientRect();
    var margin = 8;
    saidaDestinatarioMenu.style.left = rect.left + 'px';
    saidaDestinatarioMenu.style.width = rect.width + 'px';
    saidaDestinatarioMenu.style.top = (rect.bottom + 4) + 'px';
    saidaDestinatarioMenu.style.maxHeight = Math.min(240, window.innerHeight - rect.bottom - margin) + 'px';
  }

  function renderSaidaDestinatarioMenu(query) {
    var normalizedQuery = normalize(query);
    var matches = window.NiveloCadastros.list().filter(function (c) {
      return normalize(c.nome).indexOf(normalizedQuery) !== -1;
    });
    var html = matches.map(function (c) {
      return '<div class="option" data-nome="' + c.nome + '">' + c.nome + ' <span class="text-12-regular">(' + c.cidade + ')</span></div>';
    }).join('');
    if (!html) html = '<div class="option-empty">Nenhum cadastro encontrado.</div>';
    saidaDestinatarioMenu.innerHTML = html;
  }

  function openSaidaDestinatarioMenu() {
    renderSaidaDestinatarioMenu(saidaDestinatarioInput.value);
    saidaDestinatarioMenu.hidden = false;
    positionSaidaDestinatarioMenu();
    window.addEventListener('scroll', positionSaidaDestinatarioMenu, true);
    window.addEventListener('resize', positionSaidaDestinatarioMenu);
  }

  function closeSaidaDestinatarioMenu() {
    saidaDestinatarioMenu.hidden = true;
    window.removeEventListener('scroll', positionSaidaDestinatarioMenu, true);
    window.removeEventListener('resize', positionSaidaDestinatarioMenu);
  }

  saidaDestinatarioInput.addEventListener('focus', openSaidaDestinatarioMenu);
  saidaDestinatarioInput.addEventListener('input', openSaidaDestinatarioMenu);

  saidaDestinatarioMenu.addEventListener('click', function (event) {
    var optionEl = event.target.closest('.option');
    if (!optionEl) return;
    saidaDestinatarioInput.value = optionEl.dataset.nome;
    saidaDestinatarioField.classList.remove('error');
    closeSaidaDestinatarioMenu();
    if (getSaidaNf() === 'sim') updateSaidaNfRecap();
  });

  document.addEventListener('click', function (event) {
    if (!document.getElementById('saida-destinatario-combobox').contains(event.target)) closeSaidaDestinatarioMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeSaidaDestinatarioMenu();
  });
  var saidaNfRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="saida-nf"]'));
  var saidaNfBlock = document.getElementById('saida-nf-block');
  var saidaNfProduto = document.getElementById('saida-nf-produto');
  var saidaNfDestinatario = document.getElementById('saida-nf-destinatario');
  var saidaNfQuantidade = document.getElementById('saida-nf-quantidade');
  var saidaNfValorTotal = document.getElementById('saida-nf-valor-total');
  var saidaNfNaturezaField = document.getElementById('saida-nf-natureza-field');
  initDropdown(saidaNfNaturezaField);
  var saidaConfirmBtn = document.getElementById('saida-confirm');

  function getSaidaNf() {
    var checked = saidaNfRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'nao';
  }

  function updateSaidaNfRecap() {
    var quantidade = Number(saidaQuantidadeInput.value) || 0;
    var preco = saidaPrecoCentavos / 100;
    saidaNfProduto.textContent = saidaState.record ? saidaState.record.produto : '—';
    saidaNfDestinatario.textContent = saidaDestinatarioInput.value.trim() || '—';
    saidaNfQuantidade.textContent = quantidade ? (formatInt(quantidade) + ' ' + (saidaState.record ? saidaState.record.unidade : '')) : '—';
    saidaNfValorTotal.textContent = formatCurrency(quantidade * preco);
  }

  // RadioButton.module.css pinta o círculo preenchido via `.checked` no
  // <label class="option"> pai (não `:checked` do input nativo) — mesmo
  // ajuste já feito pro radio "Forma de entrada" de novo-estoque.js.
  function syncGerarNotaFiscalChecked() {
    saidaNfRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }

  function applySaidaNf() {
    var isSim = getSaidaNf() === 'sim';
    syncGerarNotaFiscalChecked();
    saidaNfBlock.hidden = !isSim;
    saidaConfirmBtn.textContent = isSim ? 'Registrar saída e gerar Nota Fiscal' : 'Registrar saída';
    if (isSim) updateSaidaNfRecap();
  }

  saidaNfRadios.forEach(function (radio) {
    radio.addEventListener('change', applySaidaNf);
  });
  [saidaQuantidadeInput, saidaPrecoInput, saidaDestinatarioInput].forEach(function (input) {
    input.addEventListener('input', function () {
      if (getSaidaNf() === 'sim') updateSaidaNfRecap();
    });
  });

  function openRegistrarSaidaModal(record, onConfirm) {
    saidaState.record = record;
    saidaState.onConfirm = onConfirm;
    var info = resolveProdutoInfo(record);
    saidaRecapTitle.textContent = 'Estoque de Vendas · ' + record.produto;
    saidaRecapSku.textContent = info.sku || '—';
    saidaRecapUnidade.textContent = info.unidade || '—';
    saidaRecapDisponivel.textContent = formatInt(record.quantidade) + ' ' + info.unidade;
    saidaQuantidadeInput.value = '';
    saidaPrecoInput.value = '';
    saidaPrecoCentavos = 0;
    saidaDestinatarioInput.value = '';
    saidaDataPicker.setValue(todayISO());
    saidaQuantidadeField.classList.remove('error');
    saidaPrecoField.classList.remove('error');
    saidaDestinatarioField.classList.remove('error');
    saidaNfRadios.forEach(function (r) { r.checked = r.value === 'nao'; });
    applySaidaNf();
    openModal(saidaOverlay);
    saidaQuantidadeInput.focus();
  }

  wireModalDismiss(saidaOverlay, 'saida-dialog-close', 'saida-cancel');

  saidaConfirmBtn.addEventListener('click', function () {
    var record = saidaState.record;
    if (!record) return;
    var quantidade = Number(saidaQuantidadeInput.value);
    var preco = saidaPrecoCentavos / 100;
    var destinatario = saidaDestinatarioInput.value.trim();
    var data = saidaDataInput.value;

    var quantidadeInvalid = !(quantidade > 0 && quantidade <= record.quantidade);
    saidaQuantidadeField.classList.toggle('error', quantidadeInvalid);
    var precoInvalid = saidaPrecoCentavos <= 0;
    saidaPrecoField.classList.toggle('error', precoInvalid);
    var destinatarioInvalid = !destinatario;
    saidaDestinatarioField.classList.toggle('error', destinatarioInvalid);
    if (quantidadeInvalid || precoInvalid || destinatarioInvalid) return;

    var notaFiscal = getSaidaNf() === 'sim';
    var naturezaOperacao = notaFiscal ? (saidaNfNaturezaField.dataset.value || null) : null;

    record.quantidade -= quantidade;
    record.historico.push({ tipo: 'saida', quantidade: quantidade, precoVenda: preco, destinatario: destinatario, data: data, notaFiscal: notaFiscal, naturezaOperacao: naturezaOperacao });

    closeModal(saidaOverlay);
    var mensagemBase = formatInt(quantidade) + ' ' + record.unidade + ' de ' + record.produto + ' registrados' + (notaFiscal ? ', Nota Fiscal gerada.' : '.');
    abrirCriarContaReceberModal({
      clienteNome: destinatario,
      valor: quantidade * preco,
      historico: 'Venda de ' + record.produto + ' (' + formatInt(quantidade) + ' ' + record.unidade + ')',
      dataEmissao: data,
      onFinish: function (contaCriada) {
        if (saidaState.onConfirm) saidaState.onConfirm();
        showSuccessToast('Saída registrada com sucesso', mensagemBase + (contaCriada ? ' Conta a receber criada.' : ''));
      }
    });
  });

  // ---------- Modal: Criar conta a receber? (pós Registrar saída) —
  // mesmo raciocínio exato de "Criar conta a pagar?" em novo-estoque.js
  // (pergunta contextual DEPOIS da saída já confirmada, nunca um campo
  // dentro do próprio modal de saída). Cliente/Valor/Histórico já vêm
  // resolvidos da saída; só faltam Meio de Recebimento/Vencimento/
  // Categoria, coletados aqui. ----------
  var criarContaReceberOverlay = document.getElementById('criar-conta-receber-overlay');
  var crMeioField = document.getElementById('cr-meio-field');
  var crVencimentoField = document.getElementById('cr-vencimento-field');
  var crVencimentoInput = document.getElementById('cr-vencimento');
  var crCategoriaField = document.getElementById('cr-categoria-field');
  // ---------- Vencimento (modal Criar conta a receber?): padrão oficial de
  // calendário do sistema (dia único), ver app/shared/date-picker.js. ----------
  var crVencimentoPicker = window.NiveloDatePicker.initDay({
    rootId: 'cr-vencimento-field',
    triggerId: 'cr-vencimento-trigger',
    valueId: 'cr-vencimento-value',
    hiddenInputId: 'cr-vencimento',
    popoverId: 'cr-vencimento-popover',
    placeholder: 'Selecionar data',
    onChange: function () {
      if (crVencimentoField.classList.contains('error') && crVencimentoInput.value) crVencimentoField.classList.remove('error');
    }
  });
  var criarContaReceberState = { payload: null, onFinish: null };

  var crMeioMenu = document.getElementById('cr-meio-menu');
  window.NiveloFormasRecebimento.list().forEach(function (forma) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = forma.codigo;
    optionEl.textContent = forma.nome;
    crMeioMenu.appendChild(optionEl);
  });
  var crMeioDropdown = initDropdown(crMeioField);

  var crCategoriaMenu = document.getElementById('cr-categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.ativo && c.grupo === 'receita'; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    crCategoriaMenu.appendChild(optionEl);
  });
  var crCategoriaDropdown = initDropdown(crCategoriaField);

  function validateContaReceberModal() {
    var crMeioInvalid = !crMeioField.dataset.value;
    crMeioField.classList.toggle('error', crMeioInvalid);
    var crVencimentoInvalid = !crVencimentoInput.value;
    crVencimentoField.classList.toggle('error', crVencimentoInvalid);
    var crCategoriaInvalid = !crCategoriaField.dataset.value;
    crCategoriaField.classList.toggle('error', crCategoriaInvalid);
    return !crMeioInvalid && !crVencimentoInvalid && !crCategoriaInvalid;
  }

  function closeContaReceberModal() {
    closeModal(criarContaReceberOverlay);
  }

  function abrirCriarContaReceberModal(payload) {
    criarContaReceberState.payload = payload;
    criarContaReceberState.onFinish = payload.onFinish;
    crMeioField.dataset.value = '';
    crMeioField.querySelector('[data-dropdown-value]').textContent = 'Selecione o meio de recebimento';
    crMeioField.querySelector('[data-dropdown-value]').classList.add('placeholder');
    crMeioField.classList.remove('error');
    crVencimentoPicker.setValue(null);
    crVencimentoField.classList.remove('error');
    crCategoriaField.dataset.value = '';
    crCategoriaField.querySelector('[data-dropdown-value]').textContent = 'Selecione a categoria';
    crCategoriaField.querySelector('[data-dropdown-value]').classList.add('placeholder');
    crCategoriaField.classList.remove('error');
    openModal(criarContaReceberOverlay);
  }

  function finalizarContaReceber(criarConta) {
    var payload = criarContaReceberState.payload;
    var onFinish = criarContaReceberState.onFinish;
    closeContaReceberModal();
    if (!payload) return;
    if (criarConta) {
      window.NiveloContasReceber.add({
        clienteNome: payload.clienteNome,
        formaRecebimentoCodigo: crMeioField.dataset.value,
        formaRecebimentoNome: crMeioField.querySelector('[data-dropdown-value]').textContent,
        vencimento: crVencimentoInput.value,
        dataEmissao: payload.dataEmissao,
        valor: payload.valor,
        historico: payload.historico,
        categoriaCodigo: crCategoriaField.dataset.value,
        ocorrencia: 'unica'
      });
    }
    if (onFinish) onFinish(criarConta);
  }

  document.getElementById('criar-conta-receber-confirm').addEventListener('click', function () {
    if (!validateContaReceberModal()) return;
    finalizarContaReceber(true);
  });
  document.getElementById('criar-conta-receber-skip').addEventListener('click', function () { finalizarContaReceber(false); });
  document.getElementById('criar-conta-receber-skip-x').addEventListener('click', function () { finalizarContaReceber(false); });

  // ---------- Modal: Registrar consumo (Estoque de Uso) ----------
  var consumoOverlay = document.getElementById('consumo-dialog-overlay');
  var consumoState = { record: null, onConfirm: null };
  var consumoRecapTitle = document.getElementById('consumo-recap-title');
  var consumoRecapSku = document.getElementById('consumo-recap-sku');
  var consumoRecapUnidade = document.getElementById('consumo-recap-unidade');
  var consumoRecapDisponivel = document.getElementById('consumo-recap-disponivel');
  var consumoQuantidadeField = document.getElementById('consumo-quantidade-field');
  var consumoQuantidadeInput = document.getElementById('consumo-quantidade-input');
  var consumoDataInput = document.getElementById('consumo-data-input');
  // ---------- Data do consumo: padrão oficial de calendário do sistema (dia
  // único), ver app/shared/date-picker.js. ----------
  var consumoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'consumo-data-field',
    triggerId: 'consumo-data-trigger',
    valueId: 'consumo-data-value',
    hiddenInputId: 'consumo-data-input',
    popoverId: 'consumo-data-popover',
    placeholder: 'Selecionar data'
  });
  var consumoObservacaoInput = document.getElementById('consumo-observacao-input');
  var consumoConfirmBtn = document.getElementById('consumo-confirm');

  function openRegistrarConsumoModal(record, onConfirm) {
    consumoState.record = record;
    consumoState.onConfirm = onConfirm;
    var info = resolveProdutoInfo(record);
    consumoRecapTitle.textContent = 'Estoque de Uso · ' + record.produto;
    consumoRecapSku.textContent = info.sku || '—';
    consumoRecapUnidade.textContent = info.unidade || '—';
    consumoRecapDisponivel.textContent = formatInt(record.quantidade) + ' ' + info.unidade;
    consumoQuantidadeInput.value = '';
    consumoDataPicker.setValue(todayISO());
    consumoObservacaoInput.value = '';
    consumoQuantidadeField.classList.remove('error');
    openModal(consumoOverlay);
    consumoQuantidadeInput.focus();
  }

  wireModalDismiss(consumoOverlay, 'consumo-dialog-close', 'consumo-cancel');

  consumoConfirmBtn.addEventListener('click', function () {
    var record = consumoState.record;
    if (!record) return;
    var quantidade = Number(consumoQuantidadeInput.value);
    var data = consumoDataInput.value;
    var observacao = consumoObservacaoInput.value.trim() || null;

    var quantidadeInvalid = !(quantidade > 0 && quantidade <= record.quantidade);
    consumoQuantidadeField.classList.toggle('error', quantidadeInvalid);
    if (quantidadeInvalid) return;

    record.quantidade -= quantidade;
    record.historico.push({ tipo: 'consumo', quantidade: quantidade, data: data, observacao: observacao });

    closeModal(consumoOverlay);
    if (consumoState.onConfirm) consumoState.onConfirm();
    showSuccessToast('Consumo registrado com sucesso', formatInt(quantidade) + ' ' + record.unidade + ' de ' + record.produto + ' baixados do estoque de compras.');
  });

  // ---------- Modal: Registrar abatimento (Estoque Comprometido) ----------
  var abatimentoOverlay = document.getElementById('abatimento-dialog-overlay');
  var abatimentoState = { record: null, onConfirm: null };
  var abatimentoRecapTitle = document.getElementById('abatimento-recap-title');
  var abatimentoRecapSku = document.getElementById('abatimento-recap-sku');
  var abatimentoRecapUnidade = document.getElementById('abatimento-recap-unidade');
  var abatimentoRecapComprometida = document.getElementById('abatimento-recap-comprometida');
  var abatimentoRecapAbatida = document.getElementById('abatimento-recap-abatida');
  var abatimentoRecapSaldo = document.getElementById('abatimento-recap-saldo');
  var abatimentoQuantidadeField = document.getElementById('abatimento-quantidade-field');
  var abatimentoQuantidadeInput = document.getElementById('abatimento-quantidade-input');
  var abatimentoDataInput = document.getElementById('abatimento-data-input');
  // ---------- Data do abatimento: padrão oficial de calendário do sistema
  // (dia único), ver app/shared/date-picker.js. ----------
  var abatimentoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'abatimento-data-field',
    triggerId: 'abatimento-data-trigger',
    valueId: 'abatimento-data-value',
    hiddenInputId: 'abatimento-data-input',
    popoverId: 'abatimento-data-popover',
    placeholder: 'Selecionar data'
  });
  var abatimentoObservacaoInput = document.getElementById('abatimento-observacao-input');
  var abatimentoConfirmBtn = document.getElementById('abatimento-confirm');

  function openRegistrarAbatimentoModal(record, onConfirm) {
    abatimentoState.record = record;
    abatimentoState.onConfirm = onConfirm;
    var info = resolveProdutoInfo(record);
    abatimentoRecapTitle.textContent = 'Estoque Comprometido · ' + record.produto;
    abatimentoRecapSku.textContent = info.sku || '—';
    abatimentoRecapUnidade.textContent = info.unidade || '—';
    abatimentoRecapComprometida.textContent = formatInt(record.comprometida) + ' ' + info.unidade;
    abatimentoRecapAbatida.textContent = formatInt(record.abatida) + ' ' + info.unidade;
    abatimentoRecapSaldo.textContent = formatInt(record.pendente) + ' ' + info.unidade;
    abatimentoQuantidadeInput.value = '';
    abatimentoDataPicker.setValue(todayISO());
    abatimentoObservacaoInput.value = '';
    abatimentoQuantidadeField.classList.remove('error');
    openModal(abatimentoOverlay);
    abatimentoQuantidadeInput.focus();
  }

  wireModalDismiss(abatimentoOverlay, 'abatimento-dialog-close', 'abatimento-cancel');

  abatimentoConfirmBtn.addEventListener('click', function () {
    var record = abatimentoState.record;
    if (!record) return;
    var quantidade = Number(abatimentoQuantidadeInput.value);
    var data = abatimentoDataInput.value;
    var observacao = abatimentoObservacaoInput.value.trim() || null;

    var quantidadeInvalid = !(quantidade > 0 && quantidade <= record.pendente);
    abatimentoQuantidadeField.classList.toggle('error', quantidadeInvalid);
    if (quantidadeInvalid) return;

    record.abatida += quantidade;
    record.pendente = Math.max(0, record.comprometida - record.abatida);
    record.situacao = record.pendente <= 0 ? 'quitado' : 'pendente';
    record.historico.push({ tipo: 'abatimento', quantidade: quantidade, data: data, observacao: observacao });

    closeModal(abatimentoOverlay);
    if (abatimentoState.onConfirm) abatimentoState.onConfirm();
    showSuccessToast('Abatimento registrado com sucesso', formatInt(quantidade) + ' ' + record.unidade + ' abatidos do compromisso de ' + record.produto + '.');
  });

  // ---------- Re-render de uma única linha após uma ação (evita reconstruir
  // o tbody inteiro, o que perderia ordenação/busca em andamento) ----------
  function updateVendasRowCells(row) {
    row.children[2].textContent = formatInt(row.__record.quantidade);
  }
  function updateComprasRowCells(row) {
    row.children[2].textContent = formatInt(row.__record.quantidade);
  }
  function updateComprometidoRowCells(row) {
    var record = row.__record;
    var badge = SITUACAO_BADGE[record.situacao];
    row.children[3].textContent = formatInt(record.abatida);
    row.children[4].textContent = formatInt(record.pendente);
    row.children[5].innerHTML = '<span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span>';
  }

  // ---------- Ações de linha: Ver detalhes navega de verdade (handoff via
  // sessionStorage, ver detalhe-estoque.js); os 3 "Registrar X" abrem seus
  // modais reais. Nenhuma ação de linha usa mais o flash-disable — mantido
  // só como rede de segurança pra qualquer `data-action` não mapeado. ----------
  function flashDisabled(btn) {
    btn.disabled = true;
    window.setTimeout(function () { btn.disabled = false; }, 300);
  }

  document.getElementById('new-estoque-btn').addEventListener('click', function () {
    window.location.href = 'novo-estoque.html';
  });

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    // Botões de ação também existem dentro dos Cards mobile (réplica das
    // ações da linha real, ver buildQuantidadeCardHTML/buildComprometidoCardHTML)
    // — nesse caso não há `.tr` ancestral, só o `data-row-id` que aponta de
    // volta pra linha real (continua no DOM, só escondida via CSS no mobile).
    var row = btn.closest('.tr');
    if (!row) {
      var cardEl = btn.closest('.estoque-mobile-card');
      if (cardEl) row = document.getElementById(cardEl.dataset.rowId);
    }
    var record = row && row.__record;
    var action = btn.dataset.action;
    var panelSection = row && row.closest('[data-panel]');
    var panelKey = panelSection && panelSection.dataset.panel;

    if (action === 'ver-detalhes' && record) {
      try {
        sessionStorage.setItem('nivelo.estoque.detalhe', JSON.stringify({ tipo: panelKey, record: record }));
      } catch (e) {}
      window.location.href = 'detalhe-estoque.html#codigo=' + record.codigo;
      return;
    }
    if (action === 'registrar-saida' && record) {
      openRegistrarSaidaModal(record, function () {
        updateVendasRowCells(row);
        renderMobileCards('vendas');
        renderSummary();
      });
      return;
    }
    if (action === 'registrar-consumo' && record) {
      openRegistrarConsumoModal(record, function () {
        updateComprasRowCells(row);
        renderMobileCards('compras');
        renderSummary();
      });
      return;
    }
    if (action === 'registrar-abatimento' && record) {
      openRegistrarAbatimentoModal(record, function () {
        updateComprometidoRowCells(row);
        renderMobileCards('comprometido');
        renderSummary();
      });
      return;
    }
    flashDisabled(btn);
  });

  try {
    var novoLancamentoMessage = sessionStorage.getItem('nivelo.novoestoque.success');
    if (novoLancamentoMessage) {
      sessionStorage.removeItem('nivelo.novoestoque.success');
      showSuccessToast('Registo de estoque salvo com sucesso', novoLancamentoMessage);
    }
  } catch (e) {}

  // ---------- Aba inicial via hash (`estoque.html#tab=comprometido`) ----------
  // Novo Lançamento volta pra cá já apontando pra aba do tipo de estoque
  // recém-lançado (mesma convenção de estado via hash do resto do sistema,
  // nunca query string, ver rules.md).
  var tabMatch = location.hash.match(/tab=(vendas|compras|comprometido)/);
  if (tabMatch) {
    var initialTabBtn = tablist.querySelector('.tab[data-tab="' + tabMatch[1] + '"]');
    if (initialTabBtn) initialTabBtn.click();
  }

  // ---------- Estado de demonstração (#state=contareceber) — abre o
  // modal "Criar conta a receber?" direto, simulando uma Registrar saída
  // já preenchida e confirmada (mesmo mecanismo `#state=` já usado em
  // novo-estoque.js pros estados de XML). Só pro prototype-nav, nunca
  // alcançado pela navegação normal do usuário. ----------
  if (/state=contareceber/.test(location.hash)) {
    var demoRecord = VENDAS[0];
    if (demoRecord) {
      // Sem onConfirm de verdade: a tabela ainda não foi renderizada neste
      // ponto (Init roda depois) — os `render*()` do Init, mais abaixo, já
      // vão refletir a quantidade reduzida por conta da mutação real do
      // registro feita pelo clique em "Registrar saída" a seguir.
      openRegistrarSaidaModal(demoRecord, function () {});
      saidaQuantidadeInput.value = Math.min(10, demoRecord.quantidade);
      saidaPrecoInput.value = '';
      saidaPrecoCentavos = 12000;
      saidaPrecoInput.value = formatCentavosBRL(saidaPrecoCentavos);
      saidaDestinatarioInput.value = 'Cerealista Bom Grão S.A.';
      saidaConfirmBtn.click();
    }
  }

  // ---------- Init ----------
  renderVendas();
  renderCompras();
  renderComprometido();
  renderSummary();
  initSortableTable(document.getElementById('panel-vendas'));
  initSortableTable(document.getElementById('panel-compras'));
  initSortableTable(document.getElementById('panel-comprometido'));
  applyVisibility(getActivePanelKey());
})();
