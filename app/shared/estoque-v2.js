(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  function formatInt(n) {
    return Math.round(n).toLocaleString('pt-BR');
  }
  function formatNum(n) {
    return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  function formatCurrency(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return String(text).normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
  }

  // ---------- Conversão dinâmica de unidade (ver estoque-vendas-v2-data.js) ----------
  // Só mostra a linha de conversão quando a unidade base é DIFERENTE da
  // unidade do produto (ex.: SC->KG) — nunca hardcoded "sc"/"kg" em nenhum
  // texto (ver CLAUDE.md, regra explícita desta rodada).
  function getConversao(sigla) {
    var u = window.NiveloUnidadesMedida.findBySigla(sigla);
    if (!u) return null;
    if (u.unidadeBaseSigla === sigla && u.correspondeA === 1) return null;
    return u;
  }

  // ---------- Dados: Vendas (V2, módulo próprio) ----------
  var VENDAS = window.NiveloEstoqueVendasV2.list();

  // ---------- Dados: Compras (Estoque de Uso) — agora módulo V2 próprio
  // (estoque-uso-v2-data.js), mesmo tratamento já dado a Vendas/Comprometido
  // nesta tela: saldo por depósito, custo médio, histórico rico. O V1
  // (`estoque-compras-data.js`/`window.NiveloEstoqueCompras`) ficou órfão,
  // mesmo princípio já usado em `bancos-data.js`. ----------
  var COMPRAS = window.NiveloEstoqueUsoV2.list();
  var COMPROMETIDO = window.NiveloEstoqueComprometidoV2.list();

  function resolveProdutoInfo(record) {
    var fallback = (window.NiveloProdutos && window.NiveloProdutos.findByNome(record.produto)) || {};
    return { sku: record.sku || fallback.sku || '', unidade: record.unidade || fallback.unidade || '' };
  }

  // Resolve a SIGLA (ex. "SC") a partir do nome livre gravado no registro
  // (ex. "Saca") — Comprometido guarda o nome, não a sigla, mas o padrão
  // visual "quantidade + unidade" (igual Estoque de Vendas) precisa da
  // sigla curta. Fallback pro próprio nome se não achar no catálogo.
  function siglaFromUnidadeNome(nome) {
    if (!nome) return '';
    var match = window.NiveloUnidadesMedida.list().filter(function (u) {
      return u.nome.toLowerCase() === String(nome).toLowerCase();
    })[0];
    return match ? match.sigla : nome;
  }

  // ---------- Resumo ----------
  function renderSummary() {
    var totalVendas = VENDAS.reduce(function (sum, item) { return sum + item.quantidade; }, 0);
    document.getElementById('summary-vendas-value').textContent = formatInt(totalVendas) + ' un.';
    document.getElementById('summary-vendas-caption').textContent =
      VENDAS.length + (VENDAS.length === 1 ? ' produto' : ' produtos');

    document.getElementById('summary-compras-value').textContent =
      COMPRAS.length + (COMPRAS.length === 1 ? ' produto' : ' produtos');
    document.getElementById('summary-compras-caption').textContent =
      COMPRAS.length + (COMPRAS.length === 1 ? ' tipo de produto' : ' tipos de produtos');

    var totalPendente = COMPROMETIDO.reduce(function (sum, item) { return sum + item.pendente; }, 0);
    var countPendentes = COMPROMETIDO.filter(function (item) { return item.situacao === 'pendente'; }).length;
    document.getElementById('summary-comprometido-value').textContent = formatInt(totalPendente) + ' sacas';
    document.getElementById('summary-comprometido-caption').textContent =
      countPendentes + (countPendentes === 1 ? ' compromisso pendente' : ' compromissos pendentes');
  }

  var SITUACAO_BADGE = {
    pendente: { status: 'warning', label: 'Em aberto' },
    quitado: { status: 'success', label: 'Concluído' }
  };

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
  // Estoque Comprometido: "Ver histórico" abre a linha do tempo das entregas
  // do compromisso (não o Ver detalhes genérico usado por Vendas/Compras).
  var VER_HISTORICO = { action: 'ver-historico', icon: 'eye', label: 'Ver histórico' };

  // ---------- Aba 1: Estoque de Vendas — tabela (desktop) + cards (mobile) ----------
  var vendasGridEl = document.getElementById('vendas-grid');
  var vendasTbodyEl = document.getElementById('vendas-tbody');

  // Ações da tabela: mesmo padrão de ícone+Tooltip já usado em toda tabela do
  // sistema (Compras/Comprometido, Cadastro, Produtos etc.) — nunca um botão
  // primário + "mais" aqui (esse padrão simplificado fica só na tela de Ver
  // detalhes, ver detalhe-estoque-v2.js).
  function buildVendaRowHTML(produto) {
    var conversao = getConversao(produto.unidadeMedidaSigla);
    var conversaoLine = '';
    if (conversao) {
      var convertido = produto.quantidade * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-row-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    var valorEstimado = produto.quantidade * produto.precoAtual;
    return (
      '<tr class="tr estoquev2-vendas-row" data-codigo="' + produto.codigo + '">' +
        '<td class="td">' + produto.produto + '</td>' +
        '<td class="td">' +
          '<div class="estoquev2-row-qty">' + formatNum(produto.quantidade) + ' <span class="estoquev2-row-qty-unit">' + produto.unidadeMedidaSigla.toLowerCase() + '</span></div>' +
          conversaoLine +
        '</td>' +
        '<td class="td">' + formatCurrency(produto.precoAtual) + '/' + produto.unidadeMedidaSigla.toLowerCase() + '</td>' +
        '<td class="td">' + formatCurrency(valorEstimado) + '</td>' +
        '<td class="td tdActions">' + buildActionsHTML([
          VER_DETALHES,
          { action: 'registrar-entrada', icon: 'plus-circle', label: 'Registrar entrada' },
          { action: 'atualizar-preco', icon: 'tag', label: 'Atualizar preço' },
          { action: 'ajustar-estoque', icon: 'sliders-horizontal', label: 'Ajustar estoque' }
        ]) + '</td>' +
      '</tr>'
    );
  }

  function buildVendaCardHTML(produto) {
    var conversao = getConversao(produto.unidadeMedidaSigla);
    var conversaoLine = '';
    if (conversao) {
      var convertido = produto.quantidade * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-card-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    var valorEstimado = produto.quantidade * produto.precoAtual;
    return (
      '<div class="card estoquev2-vendas-card" data-codigo="' + produto.codigo + '">' +
        '<div class="estoquev2-card-header">' +
          '<h3 class="estoquev2-card-title text-subtitle-s">' + produto.produto + '</h3>' +
          buildActionsHTML([
            VER_DETALHES,
            { action: 'registrar-entrada', icon: 'plus-circle', label: 'Registrar entrada' },
            { action: 'atualizar-preco', icon: 'tag', label: 'Atualizar preço' },
            { action: 'ajustar-estoque', icon: 'sliders-horizontal', label: 'Ajustar estoque' }
          ]) +
        '</div>' +
        '<div class="estoquev2-card-qty-block">' +
          '<div class="estoquev2-card-qty">' + formatNum(produto.quantidade) + ' <span class="estoquev2-card-qty-unit">' + produto.unidadeMedidaSigla.toLowerCase() + '</span></div>' +
          conversaoLine +
        '</div>' +
        '<dl class="estoquev2-card-fields">' +
          '<div><dt class="text-10-regular">Preço atual</dt><dd class="text-12-regular">' + formatCurrency(produto.precoAtual) + '/' + produto.unidadeMedidaSigla.toLowerCase() + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor estimado</dt><dd class="text-12-regular">' + formatCurrency(valorEstimado) + '</dd></div>' +
        '</dl>' +
      '</div>'
    );
  }

  function renderVendasGrid() {
    var query = normalize(searchInput.value.trim());
    var filtered = VENDAS.filter(function (item) {
      return !query || normalize(item.produto).indexOf(query) !== -1;
    });
    vendasGridEl.innerHTML = filtered.map(buildVendaCardHTML).join('');
    vendasTbodyEl.innerHTML = filtered.map(buildVendaRowHTML).join('');
    if (window.lucide) lucide.createIcons();

    var panel = document.getElementById('panel-vendas');
    var hasItems = filtered.length > 0;
    panel.querySelector('.estoquev2-vendas-grid').hidden = !hasItems;
    panel.querySelector('.tableWrap').hidden = !hasItems;
    panel.querySelector('[data-empty]').hidden = hasItems;
  }

  function findVendaCard(codigo) {
    return VENDAS.filter(function (v) { return v.codigo === codigo; })[0];
  }

  // ---------- Aba 2: Estoque de Uso (V2) — mesmo padrão visual "quantidade +
  // unidade" já usado em Vendas (`.estoquev2-row-qty`/`-qty-unit`/
  // `-conversao`), com 2 colunas novas (Custo médio/Valor em estoque) e 4
  // ações (Registrar entrada/Registrar consumo/Ver detalhes/Ajustar
  // estoque) — mesmo conjunto de ações de Vendas. ----------
  function buildComprasRowHTML(item) {
    var conversao = getConversao(item.unidadeMedidaSigla);
    var unitLower = item.unidadeMedidaSigla.toLowerCase();
    var conversaoLine = '';
    if (conversao) {
      var convertido = item.quantidade * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-row-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    var valorEmEstoque = item.quantidade * item.custoMedio;
    return '<tr class="tr">' +
      '<td class="td">' + item.produto + '</td>' +
      '<td class="td">' + unitLower + '</td>' +
      '<td class="td">' +
        '<div class="estoquev2-row-qty">' + formatNum(item.quantidade) + ' <span class="estoquev2-row-qty-unit">' + unitLower + '</span></div>' +
        conversaoLine +
      '</td>' +
      '<td class="td">' + formatCurrency(item.custoMedio) + '/' + unitLower + '</td>' +
      '<td class="td">' + formatCurrency(valorEmEstoque) + '</td>' +
      '<td class="td tdActions">' + buildActionsHTML([
        { action: 'registrar-entrada-uso', icon: 'plus-circle', label: 'Registrar entrada' },
        { action: 'registrar-consumo', icon: 'minus-circle', label: 'Registrar consumo' },
        VER_DETALHES,
        { action: 'ajustar-estoque-uso', icon: 'sliders-horizontal', label: 'Ajustar estoque' }
      ]) + '</td>' +
      '</tr>';
  }

  function buildComprasCardHTML(row) {
    var item = row.__record;
    var conversao = getConversao(item.unidadeMedidaSigla);
    var unitLower = item.unidadeMedidaSigla.toLowerCase();
    var conversaoLine = '';
    if (conversao) {
      var convertido = item.quantidade * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-card-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    var valorEmEstoque = item.quantidade * item.custoMedio;
    return (
      '<div class="card estoque-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="estoque-mobile-card-header">' +
          '<div class="estoque-mobile-card-name text-subtitle-s">' + item.produto + '</div>' +
        '</div>' +
        '<div class="estoquev2-card-qty-block">' +
          '<div class="estoquev2-card-qty">' + formatNum(item.quantidade) + ' <span class="estoquev2-card-qty-unit">' + unitLower + '</span></div>' +
          conversaoLine +
        '</div>' +
        '<dl class="estoque-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Custo médio</dt><dd class="text-12-regular">' + formatCurrency(item.custoMedio) + '/' + unitLower + '</dd></div>' +
          '<div><dt class="text-10-regular">Valor em estoque</dt><dd class="text-12-regular">' + formatCurrency(valorEmEstoque) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions estoque-mobile-card-actions">' + buildActionsHTML([
          { action: 'registrar-entrada-uso', icon: 'plus-circle', label: 'Registrar entrada' },
          { action: 'registrar-consumo', icon: 'minus-circle', label: 'Registrar consumo' },
          VER_DETALHES,
          { action: 'ajustar-estoque-uso', icon: 'sliders-horizontal', label: 'Ajustar estoque' }
        ]) + '</div>' +
      '</div>'
    );
  }

  function renderCompras() {
    var tbody = document.getElementById('compras-tbody');
    tbody.innerHTML = COMPRAS.map(buildComprasRowHTML).join('');
    attachRecords(tbody, COMPRAS, 'compras');
    if (window.lucide) lucide.createIcons();
  }

  // Mesmo padrão visual "quantidade + unidade" já usado no Estoque de
  // Vendas (`.estoquev2-row-qty`/`.estoquev2-row-qty-unit`/`.estoquev2-row-
  // conversao`) — a linha de conversão (ex. "30.000 kg") só aparece sob o
  // valor Comprometido, pra não repetir a mesma conversão 3 vezes na linha.
  function buildComprometidoRowHTML(item) {
    var sigla = siglaFromUnidadeNome(item.unidade);
    var unitLower = sigla.toLowerCase();
    var conversao = getConversao(sigla);
    var conversaoLine = '';
    if (conversao) {
      var convertido = item.comprometida * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-row-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    var badge = SITUACAO_BADGE[item.situacao];
    return '<tr class="tr">' +
      '<td class="td">' + item.produto + '</td>' +
      '<td class="td">' + item.cliente + '</td>' +
      '<td class="td">' +
        '<div class="estoquev2-row-qty">' + formatInt(item.comprometida) + ' <span class="estoquev2-row-qty-unit">' + unitLower + '</span></div>' +
        conversaoLine +
      '</td>' +
      '<td class="td">' + formatInt(item.entregue) + ' <span class="estoquev2-row-qty-unit">' + unitLower + '</span></td>' +
      '<td class="td">' + formatInt(item.pendente) + ' <span class="estoquev2-row-qty-unit">' + unitLower + '</span></td>' +
      '<td class="td"><span class="badge" data-status="' + badge.status + '"><span class="badgeDot"></span>' + badge.label + '</span></td>' +
      '<td class="td tdActions">' + buildActionsHTML([
        VER_HISTORICO,
        // Mesmo ícone já usado em "Registrar consumo" (Estoque de Uso) —
        // reforça a mesma linguagem visual entre as duas ações de baixa.
        { action: 'registrar-entrega', icon: 'minus-circle', label: 'Registrar entrega' }
      ]) + '</td>' +
      '</tr>';
  }

  function renderComprometido() {
    var tbody = document.getElementById('comprometido-tbody');
    tbody.innerHTML = COMPROMETIDO.map(buildComprometidoRowHTML).join('');
    attachRecords(tbody, COMPROMETIDO, 'comprometido');
    if (window.lucide) lucide.createIcons();
  }

  function attachRecords(tbody, records, panelKey) {
    var rows = tbody.querySelectorAll('.tr');
    Array.prototype.forEach.call(rows, function (row, i) {
      row.__record = records[i];
      row.id = panelKey + '-row-' + i;
    });
  }

  function cellText(cell) { return cell.textContent.trim(); }

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

  // Mesmo padrão estrutural dos cards de Vendas/Compras: nome+badge no
  // cabeçalho, bloco de quantidade em destaque (`.estoquev2-card-qty`/
  // `-qty-unit`, 28px, aqui a quantidade Comprometida) logo abaixo, depois
  // os campos secundários em `dl`, ações por último — antes este card só
  // tinha uma `dl` plana sem nenhum valor em destaque, lendo diferente dos
  // outros 2 (reaproveitar o innerHTML da célula da tabela não bastava: ela
  // usa as classes `.estoquev2-row-qty*`, que não têm o tamanho de fonte
  // maior do card — por isso a quantidade é remontada aqui a partir do
  // registro, com as classes `.estoquev2-card-qty*` certas).
  function buildComprometidoCardHTML(row) {
    var item = row.__record;
    var cells = row.children;
    var statusHTML = cells[5].innerHTML;
    var actionsHTML = cells[6].querySelector('.cellActions').innerHTML;
    var sigla = siglaFromUnidadeNome(item.unidade);
    var unitLower = sigla.toLowerCase();
    var conversao = getConversao(sigla);
    var conversaoLine = '';
    if (conversao) {
      var convertido = item.comprometida * conversao.correspondeA;
      conversaoLine = '<div class="estoquev2-card-conversao text-body-xs">' + formatNum(convertido) + ' ' + conversao.unidadeBaseSigla.toLowerCase() + '</div>';
    }
    return (
      '<div class="card estoque-mobile-card" data-row-id="' + row.id + '">' +
        '<div class="estoque-mobile-card-header">' +
          '<div class="estoque-mobile-card-name text-subtitle-s">' + cellText(cells[0]) + '</div>' +
          statusHTML +
        '</div>' +
        '<div class="estoquev2-card-qty-block">' +
          '<div class="estoquev2-card-qty">' + formatInt(item.comprometida) + ' <span class="estoquev2-card-qty-unit">' + unitLower + '</span></div>' +
          conversaoLine +
        '</div>' +
        '<dl class="estoque-mobile-card-fields">' +
          '<div><dt class="text-10-regular">Cliente</dt><dd class="text-12-regular">' + cellText(cells[1]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Entregue</dt><dd class="text-12-regular">' + cellText(cells[3]) + '</dd></div>' +
          '<div><dt class="text-10-regular">Pendente</dt><dd class="text-12-regular">' + cellText(cells[4]) + '</dd></div>' +
        '</dl>' +
        '<div class="cellActions estoque-mobile-card-actions">' + actionsHTML + '</div>' +
      '</div>'
    );
  }

  var cardsContainers = {
    compras: document.getElementById('compras-cards'),
    comprometido: document.getElementById('comprometido-cards')
  };
  var CARD_BUILDERS = {
    compras: buildComprasCardHTML,
    comprometido: buildComprometidoCardHTML
  };

  function renderMobileCards(panelKey) {
    var tbody = document.getElementById(panelKey + '-tbody');
    var rows = Array.prototype.filter.call(tbody.querySelectorAll('.tr'), function (row) { return !row.hidden; });
    cardsContainers[panelKey].innerHTML = rows.map(CARD_BUILDERS[panelKey]).join('');
    // Compras monta as ações via buildActionsHTML() direto (não copia de uma
    // <td> já renderizada, como Comprometido faz) — os <i data-lucide> ficam
    // sem o SVG do Lucide sem essa chamada, ficando invisíveis no mobile.
    if (window.lucide) lucide.createIcons();
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

    filtrosFieldEl.hidden = target !== 'comprometido';
    if (target !== 'comprometido') closeFiltrosPopover();
    applyVisibility(target);
  });

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

  var searchInput = document.getElementById('estoque-search-input');
  var comprometidoFilters = { situacao: 'todas', cliente: 'todos' };

  function applyVisibility(panelKey) {
    if (panelKey === 'vendas') {
      renderVendasGrid();
      return;
    }
    var tbody = document.getElementById(panelKey + '-tbody');
    var query = normalize(searchInput.value.trim());
    var visibleCount = 0;

    Array.prototype.forEach.call(tbody.querySelectorAll('.tr'), function (row) {
      var record = row.__record;
      var matchesSearch = !query || normalize(record.produto).indexOf(query) !== -1;
      var matchesFilters = true;
      if (panelKey === 'comprometido') {
        if (comprometidoFilters.situacao !== 'todas' && record.situacao !== comprometidoFilters.situacao) matchesFilters = false;
        if (comprometidoFilters.cliente !== 'todos' && record.cliente !== comprometidoFilters.cliente) matchesFilters = false;
        // Registros Concluídos ficam ocultos por padrão — só aparecem quando
        // o usuário seleciona "Concluído" explicitamente no filtro de
        // Status (pedido explícito), nunca dentro de "Todas".
        if (record.situacao === 'quitado' && comprometidoFilters.situacao !== 'quitado') matchesFilters = false;
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

  var clientes = COMPROMETIDO.map(function (item) { return item.cliente; })
    .filter(function (value, index, arr) { return arr.indexOf(value) === index; });
  document.getElementById('filtro-cliente-menu').innerHTML =
    '<div class="option selected" data-value="todos">Todos</div>' +
    clientes.map(function (c) { return '<div class="option" data-value="' + c + '">' + c + '</div>'; }).join('');

  var situacaoDropdown = initDropdown(document.getElementById('filtro-situacao-field'));
  var clienteDropdown = initDropdown(document.getElementById('filtro-cliente-field'));

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
    comprometidoFilters.cliente = document.getElementById('filtro-cliente-field').dataset.value || 'todos';
    closeFiltrosPopover();
    applyVisibility('comprometido');
  });

  document.getElementById('estoque-filtros-limpar').addEventListener('click', function () {
    situacaoDropdown.reset('todas', 'Todas');
    clienteDropdown.reset('todos', 'Todos');
    comprometidoFilters.situacao = 'todas';
    comprometidoFilters.cliente = 'todos';
    applyVisibility('comprometido');
  });

  // ---------- Exportar Excel ----------
  var EXPORT_CONFIG = {
    vendas: { filename: 'estoque-de-vendas', headers: ['Produto', 'Unidade', 'Quantidade', 'Preço atual', 'Valor estimado'], cols: ['produto', function (r) { return r.unidadeMedidaSigla; }, function (r) { return formatNum(r.quantidade); }, function (r) { return formatCurrency(r.precoAtual); }, function (r) { return formatCurrency(r.quantidade * r.precoAtual); }] },
    compras: {
      filename: 'estoque-de-uso',
      headers: ['Produto', 'Quantidade', 'Unidade', 'Custo médio', 'Valor em estoque'],
      cols: ['produto', function (r) { return formatNum(r.quantidade); }, function (r) { return r.unidadeMedidaSigla; }, function (r) { return formatCurrency(r.custoMedio); }, function (r) { return formatCurrency(r.quantidade * r.custoMedio); }]
    },
    comprometido: {
      filename: 'estoque-comprometido',
      headers: ['Produto', 'Cliente', 'Comprometido', 'Entregue', 'Pendente', 'Status'],
      cols: ['produto', 'cliente', 'comprometida', 'entregue', 'pendente', function (r) { return SITUACAO_BADGE[r.situacao].label; }]
    }
  };

  function exportActiveTab() {
    var key = getActivePanelKey();
    var config = EXPORT_CONFIG[key];
    var lines = [config.headers.join(';')];

    if (key === 'vendas') {
      var query = normalize(searchInput.value.trim());
      VENDAS.filter(function (item) { return !query || normalize(item.produto).indexOf(query) !== -1; }).forEach(function (record) {
        var values = config.cols.map(function (col) {
          var value = typeof col === 'function' ? col(record) : record[col];
          return typeof value === 'number' ? formatInt(value) : value;
        });
        lines.push(values.join(';'));
      });
    } else {
      var tbody = document.getElementById(key + '-tbody');
      var visibleRows = Array.prototype.filter.call(tbody.querySelectorAll('.tr'), function (row) { return !row.hidden; });
      visibleRows.forEach(function (row) {
        var record = row.__record;
        var values = config.cols.map(function (col) {
          var value = typeof col === 'function' ? col(record) : record[col];
          return typeof value === 'number' ? formatInt(value) : value;
        });
        lines.push(values.join(';'));
      });
    }

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

  // ---------- Toast de sucesso ----------
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

  // ---------- Modal: Registrar consumo (Estoque de Uso, V2) ----------
  // Extensão desta rodada: Fazenda/Talhão (dependente, mesma técnica exata
  // de "Origem da entrada" em registrar-entrada-estoque-v2.js) + Custo
  // (readonly, custoMedio × quantidade digitada, recalculado ao vivo).
  var consumoOverlay = document.getElementById('consumo-dialog-overlay');
  var consumoState = { record: null, onConfirm: null };
  var consumoRecapTitle = document.getElementById('consumo-recap-title');
  var consumoRecapSku = document.getElementById('consumo-recap-sku');
  var consumoRecapUnidade = document.getElementById('consumo-recap-unidade');
  var consumoRecapDisponivel = document.getElementById('consumo-recap-disponivel');
  var consumoQuantidadeField = document.getElementById('consumo-quantidade-field');
  var consumoQuantidadeInput = document.getElementById('consumo-quantidade-input');
  var consumoDataInput = document.getElementById('consumo-data-input');
  var consumoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'consumo-data-field', triggerId: 'consumo-data-trigger', valueId: 'consumo-data-value',
    hiddenInputId: 'consumo-data-input', popoverId: 'consumo-data-popover', placeholder: 'Selecionar data'
  });
  var consumoFazendaField = document.getElementById('consumo-fazenda-field');
  var consumoFazendaMenu = document.getElementById('consumo-fazenda-menu');
  var consumoTalhaoField = document.getElementById('consumo-talhao-field');
  var consumoTalhaoMenu = document.getElementById('consumo-talhao-menu');
  var consumoCustoInput = document.getElementById('consumo-custo-input');
  var consumoObservacaoInput = document.getElementById('consumo-observacao-input');
  var consumoConfirmBtn = document.getElementById('consumo-confirm');

  var CONSUMO_FAZENDAS = (window.NiveloFazendas && window.NiveloFazendas.list()) || [];
  consumoFazendaMenu.innerHTML = CONSUMO_FAZENDAS.map(function (f) {
    return '<div class="option" data-value="' + f.id + '">' + f.nome + '</div>';
  }).join('');

  function findConsumoFazenda(id) {
    return CONSUMO_FAZENDAS.filter(function (f) { return f.id === id; })[0] || null;
  }
  var consumoTalhaoTrigger = consumoTalhaoField.querySelector('[data-dropdown-trigger]');
  function populateConsumoTalhoes(fazenda) {
    var talhoes = fazenda ? fazenda.talhoes : [];
    consumoTalhaoMenu.innerHTML = talhoes.map(function (t) {
      return '<div class="option" data-value="' + t.id + '">' + t.nome + '</div>';
    }).join('');
    consumoTalhaoTrigger.disabled = !fazenda;
    consumoTalhaoField.dataset.value = '';
    consumoTalhaoField.querySelector('[data-dropdown-value]').textContent = fazenda ? 'Selecione o talhão' : 'Selecione a fazenda primeiro';
  }
  var consumoTalhaoDropdown = initDropdown(consumoTalhaoField, function () {
    consumoTalhaoField.classList.remove('error');
  });
  var consumoFazendaDropdown = initDropdown(consumoFazendaField, function (fazendaId) {
    consumoFazendaField.classList.remove('error');
    populateConsumoTalhoes(findConsumoFazenda(fazendaId));
  });

  function updateConsumoCusto() {
    var record = consumoState.record;
    var quantidade = Number(consumoQuantidadeInput.value) || 0;
    consumoCustoInput.value = record ? formatCurrency(record.custoMedio * quantidade) : 'R$ 0,00';
  }
  consumoQuantidadeInput.addEventListener('input', updateConsumoCusto);

  function openRegistrarConsumoModal(record, onConfirm) {
    consumoState.record = record;
    consumoState.onConfirm = onConfirm;
    consumoRecapTitle.textContent = 'Estoque de Uso · ' + record.produto;
    consumoRecapSku.textContent = record.sku || '—';
    consumoRecapUnidade.textContent = record.unidadeMedidaSigla || '—';
    consumoRecapDisponivel.textContent = formatInt(record.quantidade) + ' ' + record.unidadeMedidaSigla.toLowerCase();
    consumoQuantidadeInput.value = '';
    consumoDataPicker.setValue(todayISO());
    consumoFazendaDropdown.reset('', 'Selecione a fazenda');
    consumoFazendaField.classList.remove('error');
    populateConsumoTalhoes(null);
    consumoTalhaoField.classList.remove('error');
    updateConsumoCusto();
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

    var fazendaInvalid = !consumoFazendaField.dataset.value;
    consumoFazendaField.classList.toggle('error', fazendaInvalid);
    var talhaoInvalid = !consumoTalhaoField.dataset.value;
    consumoTalhaoField.classList.toggle('error', talhaoInvalid);

    if (quantidadeInvalid || fazendaInvalid || talhaoInvalid) return;

    var fazenda = findConsumoFazenda(consumoFazendaField.dataset.value);
    var talhao = fazenda.talhoes.filter(function (t) { return t.id === consumoTalhaoField.dataset.value; })[0];

    window.NiveloEstoqueUsoV2.registrarConsumo(record.codigo, {
      quantidade: quantidade,
      data: data,
      fazendaId: fazenda.id,
      fazendaNome: fazenda.nome,
      talhaoId: talhao.id,
      talhaoNome: talhao.nome,
      observacao: observacao
    });

    closeModal(consumoOverlay);
    if (consumoState.onConfirm) consumoState.onConfirm();
    showSuccessToast('Consumo registrado com sucesso', formatInt(quantidade) + ' ' + record.unidadeMedidaSigla.toLowerCase() + ' de ' + record.produto + ' baixados do estoque de uso (' + fazenda.nome + ' · ' + talhao.nome + ').');
  });

  // Registrar entrega (Estoque Comprometido) deixou de ser modal — abre uma
  // tela própria (`registrar-entrega-estoque-v2.html`, mesmo padrão de
  // "Registrar entrada" na aba Vendas), ver `runVendaAction`-like navegação
  // no handler de clique abaixo.

  // ---------- Modal: Atualizar preço (V2, Estoque de Vendas) ----------
  var precoOverlay = document.getElementById('preco-dialog-overlay');
  var precoState = { produto: null };
  var precoProdutoNome = document.getElementById('preco-produto-nome');
  var precoAtualLabel = document.getElementById('preco-atual-label');
  var precoAtualInput = document.getElementById('preco-atual-input');
  var precoNovoLabel = document.getElementById('preco-novo-label');
  var precoNovoField = document.getElementById('preco-novo-field');
  var precoNovoInput = document.getElementById('preco-novo-input');
  var precoBaseField = document.getElementById('preco-base-field');
  var precoBaseLabel = document.getElementById('preco-base-label');
  var precoBaseInput = document.getElementById('preco-base-input');
  var precoDataInput = document.getElementById('preco-data-input');
  var precoDataPicker = window.NiveloDatePicker.initDay({
    rootId: 'preco-data-field', triggerId: 'preco-data-trigger', valueId: 'preco-data-value',
    hiddenInputId: 'preco-data-input', popoverId: 'preco-data-popover', placeholder: 'Selecionar data'
  });
  var precoConfirmBtn = document.getElementById('preco-confirm');
  var precoNovoCentavos = 0;
  function formatCentavosBRL(centavos) {
    return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  precoNovoInput.addEventListener('input', function () {
    var digits = precoNovoInput.value.replace(/\D/g, '');
    precoNovoCentavos = digits ? Number(digits) : 0;
    precoNovoInput.value = precoNovoCentavos ? formatCentavosBRL(precoNovoCentavos) : '';
    updatePrecoBasePreview();
  });

  function updatePrecoBasePreview() {
    var produto = precoState.produto;
    if (!produto) return;
    var conversao = getConversao(produto.unidadeMedidaSigla);
    precoBaseField.hidden = !conversao;
    if (conversao) {
      precoBaseLabel.textContent = 'Preço por ' + conversao.unidadeBaseSigla.toLowerCase();
      var novoPreco = precoNovoCentavos / 100;
      var porBase = conversao.correspondeA ? novoPreco / conversao.correspondeA : 0;
      precoBaseInput.value = novoPreco ? formatCurrency(porBase) : '';
    }
  }

  function openAtualizarPrecoModal(produto) {
    precoState.produto = produto;
    precoProdutoNome.textContent = produto.produto;
    precoAtualLabel.textContent = 'Preço atual por ' + produto.unidadeMedidaSigla.toLowerCase();
    precoAtualInput.value = formatCurrency(produto.precoAtual);
    precoNovoLabel.textContent = 'Novo preço por ' + produto.unidadeMedidaSigla.toLowerCase();
    precoNovoInput.value = '';
    precoNovoCentavos = 0;
    precoDataPicker.setValue(todayISO());
    precoNovoField.classList.remove('error');
    updatePrecoBasePreview();
    openModal(precoOverlay);
    precoNovoInput.focus();
  }
  wireModalDismiss(precoOverlay, 'preco-dialog-close', 'preco-cancel');
  precoConfirmBtn.addEventListener('click', function () {
    var produto = precoState.produto;
    if (!produto) return;
    var novoPreco = precoNovoCentavos / 100;
    var invalid = !(novoPreco > 0);
    precoNovoField.classList.toggle('error', invalid);
    if (invalid) return;

    window.NiveloEstoqueVendasV2.atualizarPreco(produto.codigo, novoPreco, precoDataInput.value);
    closeModal(precoOverlay);
    renderVendasGrid();
    showSuccessToast('Preço atualizado com sucesso', 'Novo preço de ' + produto.produto + ': ' + formatCurrency(novoPreco) + '/' + produto.unidadeMedidaSigla.toLowerCase() + '.');
  });

  // ---------- Modal: Ajustar estoque (V2, Estoque de Vendas) ----------
  var ajusteOverlay = document.getElementById('ajuste-dialog-overlay');
  // `modulo`: qual API module de dados chamar ao confirmar (window.
  // NiveloEstoqueVendasV2 ou window.NiveloEstoqueUsoV2) — generalização do
  // modal (antes hardcoded pra Vendas) pra ser reaproveitado também por
  // Estoque de Uso, mesmo modal/markup/lógica pros dois, só trocando qual
  // API é chamada e qual re-render acontece depois.
  var ajusteState = { produto: null, modulo: null, onAfterAjuste: null };
  var ajusteProdutoNome = document.getElementById('ajuste-produto-nome');
  var ajusteDepositoField = document.getElementById('ajuste-deposito-field');
  var ajusteDepositoMenu = document.getElementById('ajuste-deposito-menu');
  var ajusteSaldoSistemaInput = document.getElementById('ajuste-saldo-sistema-input');
  var ajusteSaldoConferidoField = document.getElementById('ajuste-saldo-conferido-field');
  var ajusteSaldoConferidoInput = document.getElementById('ajuste-saldo-conferido-input');
  var ajusteDiferencaInput = document.getElementById('ajuste-diferenca-input');
  var ajusteObservacaoInput = document.getElementById('ajuste-observacao-input');
  var ajusteConfirmBtn = document.getElementById('ajuste-confirm');

  function currentAjusteDeposito() {
    var produto = ajusteState.produto;
    if (!produto) return null;
    var nome = ajusteDepositoField.dataset.value;
    return produto.depositos.filter(function (d) { return d.deposito === nome; })[0] || null;
  }

  function updateAjusteSaldoSistema() {
    var deposito = currentAjusteDeposito();
    ajusteSaldoSistemaInput.value = deposito ? formatNum(deposito.quantidade) : '0';
    updateAjusteDiferenca();
  }

  function updateAjusteDiferenca() {
    var deposito = currentAjusteDeposito();
    var saldoSistema = deposito ? deposito.quantidade : 0;
    var saldoConferido = Number(ajusteSaldoConferidoInput.value);
    if (ajusteSaldoConferidoInput.value === '' || isNaN(saldoConferido)) {
      ajusteDiferencaInput.value = '';
      return;
    }
    var diferenca = saldoConferido - saldoSistema;
    ajusteDiferencaInput.value = (diferenca > 0 ? '+' : '') + formatNum(diferenca);
  }

  var ajusteDepositoDropdown = initDropdown(ajusteDepositoField, function () {
    updateAjusteSaldoSistema();
  });

  ajusteSaldoConferidoInput.addEventListener('input', updateAjusteDiferenca);

  function openAjustarEstoqueModal(produto, modulo, onAfterAjuste) {
    ajusteState.produto = produto;
    ajusteState.modulo = modulo || window.NiveloEstoqueVendasV2;
    ajusteState.onAfterAjuste = onAfterAjuste || null;
    ajusteProdutoNome.textContent = produto.produto;
    ajusteDepositoMenu.innerHTML = produto.depositos.map(function (d) {
      return '<div class="option" data-value="' + d.deposito + '">' + d.deposito + '</div>';
    }).join('');
    var first = produto.depositos[0];
    if (first) {
      var optionEl = ajusteDepositoMenu.querySelector('.option[data-value="' + first.deposito + '"]');
      if (optionEl) ajusteDepositoDropdown.selectOption(optionEl);
    }
    ajusteSaldoConferidoInput.value = '';
    ajusteDiferencaInput.value = '';
    ajusteObservacaoInput.value = '';
    ajusteSaldoConferidoField.classList.remove('error');
    updateAjusteSaldoSistema();
    openModal(ajusteOverlay);
    ajusteSaldoConferidoInput.focus();
  }
  wireModalDismiss(ajusteOverlay, 'ajuste-dialog-close', 'ajuste-cancel');
  ajusteConfirmBtn.addEventListener('click', function () {
    var produto = ajusteState.produto;
    if (!produto) return;
    var deposito = ajusteDepositoField.dataset.value;
    var invalid = ajusteSaldoConferidoInput.value === '' || isNaN(Number(ajusteSaldoConferidoInput.value)) || Number(ajusteSaldoConferidoInput.value) < 0;
    ajusteSaldoConferidoField.classList.toggle('error', invalid);
    if (invalid) return;

    var saldoConferido = Number(ajusteSaldoConferidoInput.value);
    var observacao = ajusteObservacaoInput.value.trim() || null;
    var modulo = ajusteState.modulo || window.NiveloEstoqueVendasV2;
    modulo.ajustarEstoque(produto.codigo, deposito, saldoConferido, observacao);
    closeModal(ajusteOverlay);
    if (ajusteState.onAfterAjuste) ajusteState.onAfterAjuste();
    else renderVendasGrid();
    showSuccessToast('Estoque ajustado com sucesso', 'Saldo de ' + deposito + ' (' + produto.produto + ') atualizado para ' + formatNum(saldoConferido) + ' ' + produto.unidadeMedidaSigla.toLowerCase() + '.');
  });

  // ---------- Ações ----------
  document.getElementById('new-estoque-btn').addEventListener('click', function () {
    window.location.href = 'novo-estoque.html';
  });

  function flashDisabled(btn) {
    btn.disabled = true;
    window.setTimeout(function () { btn.disabled = false; }, 300);
  }

  // Ações do produto (Ver detalhes/Registrar entrada/Atualizar preço/
  // Ajustar estoque) — mesmo ícone+Tooltip padrão em qualquer tabela do
  // sistema, tanto nos cards do mobile quanto na tabela do desktop.
  function runVendaAction(action, produto) {
    if (action === 'ver-detalhes') {
      try {
        sessionStorage.setItem('nivelo.estoquev2.detalhe', JSON.stringify({ tipo: 'vendas', codigo: produto.codigo }));
      } catch (e) {}
      window.location.href = 'detalhe-estoque-v2.html#codigo=' + produto.codigo;
      return;
    }
    if (action === 'registrar-entrada') {
      window.location.href = 'registrar-entrada-estoque-v2.html?codigo=' + produto.codigo;
      return;
    }
    if (action === 'atualizar-preco') {
      openAtualizarPrecoModal(produto);
      return;
    }
    if (action === 'ajustar-estoque') {
      openAjustarEstoqueModal(produto);
      return;
    }
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest('.actionBtn[data-action]');
    if (!btn) return;
    var row = btn.closest('.tr');
    if (!row) {
      var cardEl = btn.closest('.estoque-mobile-card');
      if (cardEl) row = document.getElementById(cardEl.dataset.rowId);
    }
    var vendaEl = btn.closest('.estoquev2-vendas-card, .estoquev2-vendas-row');
    var action = btn.dataset.action;

    if (vendaEl) {
      var produto = findVendaCard(vendaEl.dataset.codigo);
      if (!produto) return;
      runVendaAction(action, produto);
      return;
    }

    var record = row && row.__record;
    var panelSection = row && row.closest('[data-panel]');
    var panelKey = panelSection && panelSection.dataset.panel;

    // Ver detalhes: Compras (Estoque de Uso) agora tem tela V2 própria
    // (`detalhe-estoque-uso-v2.html`), diferente de Comprometido (que
    // continua indo pro V1 `detalhe-estoque.html` — fora do escopo desta
    // rodada, ver CLAUDE.md).
    if (action === 'ver-detalhes' && record && panelKey === 'compras') {
      window.location.href = 'detalhe-estoque-uso-v2.html#codigo=' + record.codigo;
      return;
    }
    if (action === 'ver-detalhes' && record) {
      try {
        sessionStorage.setItem('nivelo.estoque.detalhe', JSON.stringify({ tipo: panelKey, record: record }));
      } catch (e) {}
      window.location.href = 'detalhe-estoque.html#codigo=' + record.codigo;
      return;
    }
    if (action === 'registrar-entrada-uso' && record) {
      window.location.href = 'registrar-entrada-estoque-uso-v2.html?codigo=' + record.codigo;
      return;
    }
    if (action === 'ajustar-estoque-uso' && record) {
      openAjustarEstoqueModal(record, window.NiveloEstoqueUsoV2, function () { refreshComprasView(); });
      return;
    }
    if (action === 'registrar-consumo' && record) {
      openRegistrarConsumoModal(record, function () {
        refreshComprasView();
        renderSummary();
      });
      return;
    }
    if (action === 'registrar-entrega' && record) {
      window.location.href = 'registrar-entrega-estoque-v2.html?codigo=' + record.codigo;
      return;
    }
    if (action === 'ver-historico' && record) {
      window.location.href = 'historico-entrega-estoque-v2.html?codigo=' + record.codigo;
      return;
    }
    flashDisabled(btn);
  });

  // Re-render completo da aba Compras (Estoque de Uso) preservando busca em
  // andamento — usado depois de qualquer mutação (consumo/ajuste) feita
  // nesta mesma tela, já que os valores agregados (quantidade/custo médio/
  // valor em estoque) mudam.
  function refreshComprasView() {
    renderCompras();
    if (getActivePanelKey() === 'compras') applyVisibility('compras');
  }

  // ---------- Toasts de handoff (Novo registo de estoque / Registrar entrada V2) ----------
  try {
    var novoLancamentoMessage = sessionStorage.getItem('nivelo.novoestoque.success');
    if (novoLancamentoMessage) {
      sessionStorage.removeItem('nivelo.novoestoque.success');
      showSuccessToast('Registo de estoque salvo com sucesso', novoLancamentoMessage);
    }
  } catch (e) {}

  try {
    var entradaMessage = sessionStorage.getItem('nivelo.estoquev2.entrada.success');
    if (entradaMessage) {
      sessionStorage.removeItem('nivelo.estoquev2.entrada.success');
      showSuccessToast('Entrada registrada com sucesso', entradaMessage);
    }
  } catch (e) {}

  try {
    var entregaMessage = sessionStorage.getItem('nivelo.estoquev2.entrega.success');
    if (entregaMessage) {
      sessionStorage.removeItem('nivelo.estoquev2.entrega.success');
      showSuccessToast('Entrega registrada com sucesso', entregaMessage);
    }
  } catch (e) {}

  var tabMatch = location.hash.match(/tab=(vendas|compras|comprometido)/);
  if (tabMatch) {
    var initialTabBtn = tablist.querySelector('.tab[data-tab="' + tabMatch[1] + '"]');
    if (initialTabBtn) initialTabBtn.click();
  }

  // ---------- Init ----------
  renderVendasGrid();
  renderCompras();
  renderComprometido();
  renderSummary();
  initSortableTable(document.getElementById('panel-compras'));
  initSortableTable(document.getElementById('panel-comprometido'));
  applyVisibility(getActivePanelKey());
})();
