(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // Comprometido (Estoque V2) ainda não tem uma tela de detalhe própria —
  // "Ver detalhes" continua indo pra este V1 (`estoque-v2.js`, decisão
  // documentada em app/CLAUDE.md), navegando com `#codigo=X&from=v2`. Sem
  // isso, "Voltar"/"Voltar para Estoque" sempre apontavam pra `estoque.html`
  // (V1) mesmo vindo do V2 — bug real corrigido nesta rodada.
  var vindoDoV2 = /from=v2/.test(location.hash);
  var ESTOQUE_LISTAGEM_URL = vindoDoV2 ? 'estoque-v2.html' : 'estoque.html';
  Array.prototype.slice.call(document.querySelectorAll('a[href="estoque.html"]')).forEach(function (a) {
    a.href = ESTOQUE_LISTAGEM_URL;
  });

  function formatInt(n) {
    return n.toLocaleString('pt-BR');
  }

  function formatCurrency(n) {
    return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    if (!iso) return '—';
    var parts = iso.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------- Dados-seed (cópia literal do mesmo retrofit de estoque.js —
  // sem módulo de estado entre páginas nesta rodada, ver rules.md/CLAUDE.md:
  // cada tela mantém sua própria cópia, mas o CONTEÚDO seed precisa ficar
  // idêntico entre as duas pra não haver divergência visível de "estado
  // padrão"). Usada só como fallback quando a página é aberta direto/
  // recarregada, sem o handoff via sessionStorage feito pelo clique em
  // "Ver detalhes" (ver boot() mais abaixo). ----------
  var SEED_VENDAS = [
    { codigo: 'VND-001', produto: 'Soja', sku: 'PRD-001', unidade: 'Saca', quantidadeInicial: 500, quantidade: 500, historico: [{ tipo: 'estoque-inicial', quantidade: 500, data: '2026-06-02', observacao: null }] },
    { codigo: 'VND-002', produto: 'Milho', sku: 'PRD-002', unidade: 'Saca', quantidadeInicial: 300, quantidade: 300, historico: [{ tipo: 'estoque-inicial', quantidade: 300, data: '2026-06-10', observacao: null }] },
    { codigo: 'VND-003', produto: 'Trigo', sku: 'PRD-003', unidade: 'Saca', quantidadeInicial: 200, quantidade: 200, historico: [{ tipo: 'estoque-inicial', quantidade: 200, data: '2026-06-18', observacao: null }] },
    { codigo: 'VND-004', produto: 'Sorgo', sku: 'PRD-004', unidade: 'Saca', quantidadeInicial: 150, quantidade: 150, historico: [{ tipo: 'estoque-inicial', quantidade: 150, data: '2026-07-01', observacao: null }] },
    { codigo: 'VND-005', produto: 'Feijão', sku: 'PRD-005', unidade: 'Saca', quantidadeInicial: 100, quantidade: 100, historico: [{ tipo: 'estoque-inicial', quantidade: 100, data: '2026-07-10', observacao: null }] }
  ];

  var SEED_COMPRAS = [
    { codigo: 'CMP-001', produto: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidadeInicial: 200, quantidade: 200, tipoEntrada: 'manual', fornecedor: 'Agropecuária Bom Plantio', valorUnitario: 85, deposito: 'Depósito Central', dataEntrada: '2026-06-05', historico: [{ tipo: 'entrada', quantidade: 200, data: '2026-06-05', observacao: null }] },
    { codigo: 'CMP-002', produto: 'Semente', sku: 'PRD-007', unidade: 'Kg', quantidadeInicial: 500, quantidade: 500, tipoEntrada: 'xml', fornecedor: 'Sementes Vale Verde', valorUnitario: 12.5, deposito: 'Depósito Norte', dataEntrada: '2026-06-20', historico: [{ tipo: 'entrada', quantidade: 500, data: '2026-06-20', observacao: null }] },
    { codigo: 'CMP-003', produto: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidadeInicial: 100, quantidade: 100, tipoEntrada: 'manual', fornecedor: null, valorUnitario: null, deposito: null, dataEntrada: '2026-07-08', historico: [{ tipo: 'entrada', quantidade: 100, data: '2026-07-08', observacao: null }] }
  ];

  var SEED_COMPROMETIDO = [
    { codigo: 'CMT-001', produto: 'Soja', sku: 'PRD-001', unidade: 'Saca', destinatario: 'Cooperativa Alfa', comprometida: 500, abatida: 300, historico: [{ tipo: 'compromisso-inicial', quantidade: 500, data: '2026-06-12', observacao: null }] },
    { codigo: 'CMT-002', produto: 'Milho', sku: 'PRD-002', unidade: 'Saca', destinatario: 'Cooperativa Beta', comprometida: 1000, abatida: 1000, historico: [{ tipo: 'compromisso-inicial', quantidade: 1000, data: '2026-06-15', observacao: null }] }
  ].map(function (item) {
    item.pendente = Math.max(0, item.comprometida - item.abatida);
    item.situacao = item.pendente <= 0 ? 'quitado' : 'pendente';
    return item;
  });

  function findSeedByCodigo(codigo) {
    var all = SEED_VENDAS.map(function (r) { return { tipo: 'vendas', record: r }; })
      .concat(SEED_COMPRAS.map(function (r) { return { tipo: 'compras', record: r }; }))
      .concat(SEED_COMPROMETIDO.map(function (r) { return { tipo: 'comprometido', record: r }; }));
    return all.filter(function (x) { return x.record.codigo === codigo; })[0];
  }

  function resolveProdutoInfo(record) {
    var fallback = (window.NiveloProdutos && window.NiveloProdutos.findByNome(record.produto)) || {};
    return { sku: record.sku || fallback.sku || '', unidade: record.unidade || fallback.unidade || '' };
  }

  var SITUACAO_BADGE = {
    pendente: { status: 'warning', label: 'Pendente' },
    quitado: { status: 'success', label: 'Quitado' }
  };

  var TIPO_LABEL = {
    vendas: 'Estoque de Vendas',
    compras: 'Estoque de Uso',
    comprometido: 'Estoque Comprometido'
  };

  var HISTORICO_LABELS = {
    'estoque-inicial': 'Estoque inicial',
    'entrada': 'Entrada',
    'compromisso-inicial': 'Compromisso inicial',
    'consumo': 'Consumo',
    'saida': 'Saída',
    'abatimento': 'Abatimento'
  };
  var HISTORICO_ICONS = {
    'estoque-inicial': 'box',
    'entrada': 'box',
    'compromisso-inicial': 'handshake',
    'consumo': 'minus-circle',
    'saida': 'minus-circle',
    'abatimento': 'minus-circle'
  };

  // ---------- Estado atual (registro resolvido no boot, mutado em memória
  // só nesta página — mesma decisão de sem-persistência-cross-page já
  // aplicada em estoque.js) ----------
  var currentTipo = null;
  var currentRecord = null;

  // ---------- Render: Informações principais ----------
  function renderPrincipais() {
    var info = resolveProdutoInfo(currentRecord);
    document.getElementById('di-codigo').textContent = currentRecord.codigo;
    document.getElementById('di-tipo').textContent = TIPO_LABEL[currentTipo];
    document.getElementById('di-produto').textContent = currentRecord.produto;
    document.getElementById('di-sku').textContent = info.sku || '—';
    document.getElementById('di-unidade').textContent = info.unidade || '—';
    document.getElementById('di-deposito').textContent = currentRecord.deposito || 'Não informado';

    var inicial = currentTipo === 'comprometido' ? currentRecord.comprometida : currentRecord.quantidadeInicial;
    var atual = currentTipo === 'comprometido' ? currentRecord.pendente : currentRecord.quantidade;
    document.getElementById('di-quantidade-inicial').textContent = formatInt(inicial) + ' ' + info.unidade;
    document.getElementById('di-quantidade-atual-label').textContent = currentTipo === 'comprometido' ? 'Saldo comprometido' : 'Quantidade atual/disponível';
    document.getElementById('di-quantidade-atual').textContent = formatInt(atual) + ' ' + info.unidade;
  }

  // ---------- Render: Informações específicas (por tipo) ----------
  function renderEspecificas() {
    document.getElementById('especificas-compras').hidden = currentTipo !== 'compras';
    document.getElementById('especificas-vendas').hidden = currentTipo !== 'vendas';
    document.getElementById('especificas-comprometido').hidden = currentTipo !== 'comprometido';

    if (currentTipo === 'compras') {
      document.getElementById('di-tipo-entrada').textContent = currentRecord.tipoEntrada === 'xml' ? 'Importação de XML' : 'Manual';
      document.getElementById('di-fornecedor').textContent = currentRecord.fornecedor || 'Não informado';
      document.getElementById('di-valor-unitario').textContent = currentRecord.valorUnitario != null ? formatCurrency(currentRecord.valorUnitario) : 'Não informado';
      document.getElementById('di-data-entrada').textContent = formatDate(currentRecord.dataEntrada);
      var xmlFieldEl = document.getElementById('di-xml-field');
      xmlFieldEl.hidden = currentRecord.tipoEntrada !== 'xml';
      if (currentRecord.tipoEntrada === 'xml') {
        document.getElementById('di-xml').textContent = currentRecord.codigo + '-importacao.xml';
      }
    } else if (currentTipo === 'vendas') {
      document.getElementById('di-vendas-inicial').textContent = formatInt(currentRecord.quantidadeInicial) + ' ' + currentRecord.unidade;
      document.getElementById('di-vendas-disponivel').textContent = formatInt(currentRecord.quantidade) + ' ' + currentRecord.unidade;
      document.getElementById('di-vendas-retirada').textContent = formatInt(currentRecord.quantidadeInicial - currentRecord.quantidade) + ' ' + currentRecord.unidade;
    } else if (currentTipo === 'comprometido') {
      document.getElementById('di-comprometida').textContent = formatInt(currentRecord.comprometida) + ' ' + currentRecord.unidade;
      document.getElementById('di-abatida').textContent = formatInt(currentRecord.abatida) + ' ' + currentRecord.unidade;
      document.getElementById('di-saldo-comprometido').textContent = formatInt(currentRecord.pendente) + ' ' + currentRecord.unidade;
      document.getElementById('di-destinatario').textContent = currentRecord.destinatario;
    }
  }

  // ---------- Render: badge de Status no cabeçalho ----------
  function renderStatusBadge() {
    var badge = currentTipo === 'comprometido'
      ? SITUACAO_BADGE[currentRecord.situacao]
      : (currentRecord.quantidade > 0 ? { status: 'success', label: 'Disponível' } : { status: 'warning', label: 'Esgotado' });
    var el = document.getElementById('detalhe-status-badge');
    el.setAttribute('data-status', badge.status);
    el.innerHTML = '<span class="badgeDot"></span>' + badge.label;
  }

  // ---------- Render: Histórico de movimentações (timeline) ----------
  function renderHistorico() {
    var timeline = document.getElementById('historico-timeline');
    timeline.innerHTML = currentRecord.historico.map(function (entry) {
      var extraParts = [];
      if (entry.tipo === 'saida') {
        extraParts.push('Preço de venda: ' + formatCurrency(entry.precoVenda));
        extraParts.push('Destinatário: ' + entry.destinatario);
        if (entry.notaFiscal) {
          extraParts.push('<span class="detalhe-estoque-nf-note"><i data-lucide="receipt" width="12" height="12"></i>Vinculado à Nota Fiscal</span>');
        }
      }
      if (entry.observacao) extraParts.push(entry.observacao);
      return '<li class="detalhe-estoque-timeline-item">' +
        '<span class="detalhe-estoque-timeline-icon"><i data-lucide="' + HISTORICO_ICONS[entry.tipo] + '" width="16" height="16"></i></span>' +
        '<div class="detalhe-estoque-timeline-body">' +
          '<div class="detalhe-estoque-timeline-label">' + HISTORICO_LABELS[entry.tipo] + '</div>' +
          '<div class="detalhe-estoque-timeline-meta">' + formatInt(entry.quantidade) + ' ' + currentRecord.unidade + ' · ' + formatDate(entry.data) + '</div>' +
          (extraParts.length ? '<div class="detalhe-estoque-timeline-extra">' + extraParts.join(' · ') + '</div>' : '') +
        '</div>' +
        '</li>';
    }).join('');
    if (window.lucide) lucide.createIcons();

    var saldoLabel = currentTipo === 'comprometido' ? 'Saldo comprometido' : (currentTipo === 'vendas' ? 'Saldo disponível' : 'Saldo atual');
    var saldoValue = currentTipo === 'comprometido' ? currentRecord.pendente : currentRecord.quantidade;
    document.getElementById('saldo-final-line').textContent = saldoLabel + ': ' + formatInt(saldoValue) + ' ' + currentRecord.unidade;
  }

  function refreshAll() {
    renderPrincipais();
    renderEspecificas();
    renderStatusBadge();
    renderHistorico();
  }

  // ---------- Ação contextual (Registrar saída/consumo/abatimento — mesmos
  // modais da listagem, ver rules.md item 7: nunca um fluxo diferente pra
  // mesma operação). ----------
  var ACAO_CONFIG = {
    vendas: { label: 'Registrar saída' },
    compras: { label: 'Registrar consumo' },
    comprometido: { label: 'Registrar abatimento' }
  };

  function renderAcaoContextual() {
    var btn = document.getElementById('acao-contextual-btn');
    var config = ACAO_CONFIG[currentTipo];
    document.getElementById('acao-contextual-label').textContent = config.label;
    btn.hidden = false;
    btn.onclick = function () {
      if (currentTipo === 'vendas') openRegistrarSaidaModal(currentRecord, refreshAll);
      else if (currentTipo === 'compras') openRegistrarConsumoModal(currentRecord, refreshAll);
      else if (currentTipo === 'comprometido') openRegistrarAbatimentoModal(currentRecord, refreshAll);
    };
  }

  // ==================================================================
  // Modais de ação — réplica idêntica (markup + lógica) de estoque.js.
  // Sem módulo compartilhado entre páginas nesta rodada (decisão já
  // validada): cada página mantém sua própria cópia, operando sobre o seu
  // próprio `currentRecord` em memória.
  // ==================================================================

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

  // ---------- Toast de sucesso (mesmo padrão de estoque.js) ----------
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

  // ---------- Modal: Registrar saída ----------
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

  // ---------- Preço de venda: máscara de moeda (R$) — mesma técnica de
  // "Valor unitário" em novo-estoque.js/estoque.js. ----------
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
  // e Empresas) — cópia exata de `estoque.js`, mesmo modal/comportamento
  // reutilizado independente de onde "Registrar saída" é acionado. ----------
  // Normalização de busca (ignora acento/caixa) — mesma técnica de estoque.js.
  var DIACRITICS_RE = new RegExp(String.fromCharCode(91) + String.fromCharCode(92) + 'u0300-' + String.fromCharCode(92) + 'u036f' + String.fromCharCode(93), 'g');
  function normalize(text) {
    return String(text).normalize('NFD').replace(DIACRITICS_RE, '').toLowerCase();
  }

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
  // ajuste já feito em estoque.js/novo-estoque.js.
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
  saidaNfRadios.forEach(function (radio) { radio.addEventListener('change', applySaidaNf); });
  [saidaQuantidadeInput, saidaPrecoInput, saidaDestinatarioInput].forEach(function (input) {
    input.addEventListener('input', function () { if (getSaidaNf() === 'sim') updateSaidaNfRecap(); });
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
    if (saidaState.onConfirm) saidaState.onConfirm();
    showSuccessToast('Saída registrada com sucesso', formatInt(quantidade) + ' ' + record.unidade + ' de ' + record.produto + ' registrados' + (notaFiscal ? ', Nota Fiscal gerada.' : '.'));
  });

  // ---------- Modal: Registrar consumo ----------
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

  // ---------- Modal: Registrar abatimento ----------
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

  // ---------- Boot: resolve o registro pelo `codigo` do hash — primeiro
  // tenta o handoff via sessionStorage (dado mais recente, gravado por
  // estoque.js no clique de "Ver detalhes"), depois cai pro fallback local
  // de dados-seed (acesso direto/reload — sem garantia de refletir
  // operações feitas na listagem, decisão já validada). ----------
  function boot() {
    var match = location.hash.match(/codigo=([\w-]+)/);
    var codigo = match ? match[1] : null;
    var resolved = null;

    if (codigo) {
      try {
        var raw = sessionStorage.getItem('nivelo.estoque.detalhe');
        if (raw) {
          var payload = JSON.parse(raw);
          if (payload && payload.record && payload.record.codigo === codigo) {
            resolved = { tipo: payload.tipo, record: payload.record };
          }
          sessionStorage.removeItem('nivelo.estoque.detalhe');
        }
      } catch (e) {}
    }

    if (!resolved && codigo) resolved = findSeedByCodigo(codigo);

    if (!resolved) {
      document.getElementById('detalhe-not-found').hidden = false;
      document.getElementById('detalhe-content').hidden = true;
      return;
    }

    currentTipo = resolved.tipo;
    currentRecord = resolved.record;
    document.getElementById('detalhe-not-found').hidden = true;
    document.getElementById('detalhe-content').hidden = false;
    document.getElementById('detalhe-titulo').textContent = currentRecord.produto + ' · ' + currentRecord.codigo;
    renderAcaoContextual();
    refreshAll();
  }

  boot();
})();
