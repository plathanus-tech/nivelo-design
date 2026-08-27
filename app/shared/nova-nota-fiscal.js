(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // ---------- Dropdown genérico (mesmo padrão de novo-produto.js/
  // nova-categoria-financeira.js: wrapper/trigger/menu/option, menu em
  // `position:fixed` calculado via JS pra escapar do `overflow:hidden` de
  // `.card`). ----------
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
      if (root.classList.contains('is-readonly')) return;
      root.classList.add('open');
      positionMenu();
      window.addEventListener('scroll', close, true);
      window.addEventListener('resize', close);
    }

    function selectOption(optionEl) {
      var existing = Array.prototype.slice.call(menu.querySelectorAll('.option'));
      existing.forEach(function (o) { o.classList.remove('selected'); });
      optionEl.classList.add('selected');
      valueEl.textContent = optionEl.textContent;
      valueEl.classList.remove('placeholder');
      root.dataset.value = optionEl.dataset.value;
      root.classList.remove('error');
      close();
      if (onChange) onChange(optionEl.dataset.value, optionEl.textContent);
    }

    function selectValue(value) {
      var optionEl = menu.querySelector('.option[data-value="' + value + '"]');
      if (optionEl) selectOption(optionEl);
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

    function setReadonly(readonly) {
      root.classList.toggle('is-readonly', readonly);
      trigger.disabled = readonly;
    }

    return { selectOption: selectOption, selectValue: selectValue, setReadonly: setReadonly, root: root };
  }

  // ---------- Máscara de moeda (mesma técnica de `formatCentavosBRL` já
  // usada em Estoque) — estado sempre em centavos (inteiro). ----------
  function formatCentavosBRL(cents) {
    var value = (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return 'R$ ' + value;
  }
  function digitsToCents(digits) {
    return digits ? parseInt(digits, 10) : 0;
  }
  function attachCurrencyMask(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      input.dataset.cents = digitsToCents(digits);
      input.value = formatCentavosBRL(digitsToCents(digits));
    });
  }
  function setCurrencyValue(input, cents) {
    input.dataset.cents = cents || 0;
    input.value = formatCentavosBRL(cents || 0);
  }

  // ---------- Tipo de nota fiscal: Saída (fluxo completo, emite) x Entrada
  // (upload do XML recebido do fornecedor, só salva). ----------
  var tipoRadios = Array.prototype.slice.call(document.querySelectorAll('input[name="tipo-nota"]'));
  var saidaFormSection = document.getElementById('nnf-saida-form');
  var entradaFormSection = document.getElementById('nnf-entrada-form');
  var actionsEl = document.getElementById('nnf-actions');
  var submitBtn = document.getElementById('nnf-submit');
  // Setada mais abaixo, junto da resolução de `?numero=&modo=` — declarada
  // cedo porque `updateSubmitLabel()` já é chamado antes disso (troca de
  // Tipo de nota fiscal também dispara antes de qualquer navegação).
  var isEditingCorrecao = false;

  function getTipoNota() {
    var checked = tipoRadios.filter(function (r) { return r.checked; })[0];
    return checked ? checked.value : 'saida';
  }
  function syncTipoRadioChecked() {
    tipoRadios.forEach(function (radio) {
      var optionEl = radio.closest('.option');
      if (optionEl) optionEl.classList.toggle('checked', radio.checked);
    });
  }
  // Rótulo do botão principal: saída emite (ou corrige, em modo=corrigir);
  // entrada só salva a nota importada via XML, nunca emite (a emissão é
  // responsabilidade de quem originou a nota, do lado do fornecedor).
  function updateSubmitLabel() {
    if (isEditingCorrecao) {
      submitBtn.textContent = 'Corrigir nota fiscal';
    } else if (getTipoNota() === 'entrada') {
      submitBtn.textContent = 'Salvar nota fiscal';
    } else {
      submitBtn.textContent = 'Emitir nota fiscal';
    }
  }
  function refreshTipoNotaVisibility() {
    var isSaida = getTipoNota() === 'saida';
    saidaFormSection.hidden = !isSaida;
    entradaFormSection.hidden = isSaida;
    updateSubmitLabel();
  }
  tipoRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      syncTipoRadioChecked();
      refreshTipoNotaVisibility();
    });
  });
  syncTipoRadioChecked();

  // ---------- Emitente: só exibição, sempre preenchido do "cadastro" (ver
  // emitente-data.js) — nunca editável, nunca redigitado pelo usuário. ----------
  var emitente = window.NiveloEmitente.getEmitente();
  document.getElementById('nnf-emitente-documento').value = emitente.documento;
  document.getElementById('nnf-emitente-endereco').value = emitente.endereco;

  // ---------- Destinatário: só clientes (Cadastro de Pessoas e Empresas,
  // tipo "cliente") — CNPJ/CPF e UF vêm do cadastro selecionado. ----------
  var destinatarioField = document.getElementById('destinatario-field');
  var destinatarioMenu = document.getElementById('destinatario-menu');
  var destinatarioDocumentoInput = document.getElementById('nnf-destinatario-documento');
  var destinatarioUfInput = document.getElementById('nnf-destinatario-uf');

  window.NiveloCadastros.findByTipo('cliente').forEach(function (cliente) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = cliente.codigo;
    optionEl.textContent = cliente.nome + ' — ' + cliente.documento;
    destinatarioMenu.appendChild(optionEl);
  });

  function ufFromCidade(cidade) {
    var parts = (cidade || '').split('/');
    return parts.length === 2 ? parts[1] : '';
  }

  var destinatarioDropdown = initDropdown(destinatarioField, function (codigo) {
    var cliente = window.NiveloCadastros.findByTipo('cliente').filter(function (c) { return c.codigo === codigo; })[0];
    if (!cliente) return;
    destinatarioDocumentoInput.value = cliente.documento;
    destinatarioUfInput.value = ufFromCidade(cliente.cidade);
  });

  // ---------- Categoria: só categorias de RECEITA e ativas (Categorias de
  // receitas e despesas). ----------
  var categoriaMenu = document.getElementById('categoria-menu');
  window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.grupo === 'receita' && c.ativo; }).forEach(function (categoria) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = categoria.codigo;
    optionEl.textContent = categoria.descricao;
    categoriaMenu.appendChild(optionEl);
  });
  var categoriaDropdown = initDropdown(document.getElementById('categoria-field'));

  // ---------- Transporte: só cadastros de Pessoas e Empresas com o
  // tipo/função Transportadora (nenhum cadastro novo é criado por aqui). ----------
  var transporteMenu = document.getElementById('transporte-menu');
  var transporteNenhumaOption = document.createElement('div');
  transporteNenhumaOption.className = 'option selected';
  transporteNenhumaOption.dataset.value = '';
  transporteNenhumaOption.textContent = 'Nenhuma transportadora selecionada';
  transporteMenu.appendChild(transporteNenhumaOption);
  window.NiveloCadastros.findByTipo('transportadora').forEach(function (transportadora) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = transportadora.codigo;
    optionEl.textContent = transportadora.nome;
    transporteMenu.appendChild(optionEl);
  });
  var transporteDropdown = initDropdown(document.getElementById('transporte-field'));

  // ---------- Natureza da operação: Tipo de operação → CFOP (ver
  // natureza-operacao-data.js — RF402 ainda não é uma tela real neste
  // protótipo). ----------
  var tipoOperacaoMenu = document.getElementById('tipo-operacao-menu');
  window.NiveloNaturezaOperacao.list().forEach(function (natureza) {
    var optionEl = document.createElement('div');
    optionEl.className = 'option';
    optionEl.dataset.value = natureza.tipoOperacao;
    optionEl.textContent = natureza.label;
    tipoOperacaoMenu.appendChild(optionEl);
  });
  var cfopField = document.getElementById('cfop-field');
  var cfopInput = document.getElementById('nnf-cfop');
  var tipoOperacaoDropdown = initDropdown(document.getElementById('tipo-operacao-field'), function (tipoOperacao) {
    var natureza = window.NiveloNaturezaOperacao.findByTipoOperacao(tipoOperacao);
    cfopField.hidden = !natureza;
    cfopInput.value = natureza ? natureza.cfop : '';
  });

  var meioPagamentoDropdown = initDropdown(document.getElementById('meio-pagamento-field'));

  // ---------- Itens da nota: lista dinâmica em memória (mesmo padrão de
  // "veículos" em novo-cadastro.js) — Produto/SKU/Unidade vêm do catálogo
  // central de Produtos; Preço é digitado por item (não existe preço de
  // catálogo hoje). Recalcula o total sempre que a lista muda. ----------
  var itemsContainer = document.getElementById('nnf-items');
  var itemsErrorEl = document.getElementById('itens-error');
  var totalValueEl = document.getElementById('nnf-total-value');
  var items = [];
  var itemIdSeq = 0;

  var PRODUTOS_ATIVOS = window.NiveloProdutos.list().filter(function (p) { return p.status === 'ativo'; });

  function addItem(prefill) {
    itemIdSeq += 1;
    items.push({
      id: itemIdSeq,
      sku: prefill && prefill.sku || '',
      produtoNome: prefill && prefill.produtoNome || '',
      unidade: prefill && prefill.unidade || '',
      quantidade: prefill && prefill.quantidade != null ? prefill.quantidade : '',
      precoCents: prefill && prefill.preco != null ? Math.round(prefill.preco * 100) : 0
    });
    renderItems();
  }

  function removeItem(id) {
    items = items.filter(function (item) { return item.id !== id; });
    renderItems();
  }

  function findItem(id) {
    return items.filter(function (item) { return item.id === id; })[0];
  }

  function itemRowHTML(item, position) {
    return (
      '<div class="nnf-item-row" data-item-id="' + item.id + '">' +
        '<div class="nnf-item-row-header">' +
          '<span class="nnf-item-row-title text-body-s">Item ' + position + '</span>' +
          (items.length > 1
            ? '<button type="button" class="actionBtn" data-remove-item aria-label="Remover item"><i data-lucide="trash-2" width="16" height="16"></i></button>'
            : '') +
        '</div>' +
        '<div class="nnf-item-grid">' +
          '<div class="wrapper nnf-dropdown nnf-item-produto" id="item-produto-field-' + item.id + '">' +
            '<span class="label">Produto/SKU</span>' +
            '<button type="button" class="trigger" data-dropdown-trigger>' +
              '<span class="placeholder" data-dropdown-value>' + (item.produtoNome ? item.produtoNome + ' (' + item.sku + ')' : 'Selecione o produto') + '</span>' +
              '<span class="chevron"><i data-lucide="chevron-down" width="16" height="16"></i></span>' +
            '</button>' +
            '<div class="menu" data-dropdown-menu>' +
              PRODUTOS_ATIVOS.map(function (p) { return '<div class="option' + (p.sku === item.sku ? ' selected' : '') + '" data-value="' + p.sku + '">' + p.nome + ' (' + p.sku + ')</div>'; }).join('') +
            '</div>' +
          '</div>' +
          '<div class="wrapper" id="item-unidade-field-' + item.id + '">' +
            '<label class="label">Unidade</label>' +
            '<div class="inputWrap"><input class="input" type="text" data-item-unidade value="' + item.unidade + '" disabled readonly placeholder="—" /></div>' +
          '</div>' +
          '<div class="wrapper" id="item-quantidade-field-' + item.id + '">' +
            '<label class="label">Quantidade</label>' +
            '<div class="inputWrap"><input class="input" type="number" inputmode="decimal" min="0" step="0.01" data-item-quantidade value="' + item.quantidade + '" /></div>' +
          '</div>' +
          '<div class="wrapper" id="item-preco-field-' + item.id + '">' +
            '<label class="label">Preço</label>' +
            '<div class="inputWrap"><input class="input" type="text" inputmode="numeric" data-item-preco /></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function computeTotal() {
    var totalCents = items.reduce(function (acc, item) {
      var quantidade = parseFloat(item.quantidade) || 0;
      return acc + Math.round(quantidade * item.precoCents);
    }, 0);
    totalValueEl.textContent = formatCentavosBRL(totalCents);
    return totalCents;
  }

  function renderItems() {
    itemsContainer.innerHTML = items.map(function (item, index) { return itemRowHTML(item, index + 1); }).join('');
    if (window.lucide) lucide.createIcons();

    items.forEach(function (item) {
      var row = itemsContainer.querySelector('[data-item-id="' + item.id + '"]');
      var produtoField = row.querySelector('.nnf-item-produto');
      var unidadeInput = row.querySelector('[data-item-unidade]');
      var quantidadeInput = row.querySelector('[data-item-quantidade]');
      var precoInput = row.querySelector('[data-item-preco]');

      initDropdown(produtoField, function (sku) {
        var produto = PRODUTOS_ATIVOS.filter(function (p) { return p.sku === sku; })[0];
        if (!produto) return;
        item.sku = produto.sku;
        item.produtoNome = produto.nome;
        item.unidade = produto.unidade;
        unidadeInput.value = produto.unidade;
        computeTotal();
      });

      quantidadeInput.addEventListener('input', function () {
        item.quantidade = quantidadeInput.value;
        computeTotal();
      });

      attachCurrencyMask(precoInput);
      setCurrencyValue(precoInput, item.precoCents);
      precoInput.addEventListener('input', function () {
        item.precoCents = digitsToCents(precoInput.value.replace(/\D/g, ''));
        computeTotal();
      });

      var removeBtn = row.querySelector('[data-remove-item]');
      if (removeBtn) removeBtn.addEventListener('click', function () { removeItem(item.id); });
    });

    computeTotal();
  }

  document.getElementById('nnf-add-item-btn').addEventListener('click', function () { addItem(); });
  addItem();

  // ---------- Entrada: upload do arquivo XML (sem parsing real neste
  // protótipo — só registra o nome do arquivo enviado, mesmo princípio do
  // restante do sistema sem backend de verdade). ----------
  var entradaXmlBlock = document.getElementById('nnf-entrada-xml-block');
  var entradaXmlInput = document.getElementById('nnf-entrada-xml-input');
  var entradaXmlFileName = document.getElementById('nnf-entrada-xml-file-name');
  entradaXmlInput.addEventListener('change', function () {
    var file = entradaXmlInput.files[0];
    entradaXmlFileName.textContent = file ? file.name : 'Selecionar arquivo XML';
    if (file) entradaXmlBlock.classList.remove('error');
  });

  // ---------- Erros somem ao corrigir ----------
  function clearDropdownErrorOnValue(fieldId) {
    var field = document.getElementById(fieldId);
    var observer = new MutationObserver(function () {
      if (field.dataset.value) field.classList.remove('error');
    });
    observer.observe(field, { attributes: true, attributeFilter: ['data-value'] });
  }
  clearDropdownErrorOnValue('destinatario-field');
  clearDropdownErrorOnValue('meio-pagamento-field');
  clearDropdownErrorOnValue('categoria-field');
  clearDropdownErrorOnValue('tipo-operacao-field');

  // ---------- Modo: criação (padrão) / visualização (?modo=ver) / correção
  // (?modo=corrigir) — só se aplica a notas de SAÍDA (única com fluxo de
  // criação/correção nesta etapa). ----------
  var params = new URLSearchParams(location.search);
  var numero = params.get('numero');
  var modo = params.get('modo');
  var editingNota = numero ? window.NiveloNotasFiscais.findByNumero(numero) : null;

  // ---------- Origem (V1 x V2): esta tela é compartilhada pelas duas versões da
  // Central de Notas Fiscais ("Ver detalhes"/"Corrigir nota" apontam pra cá dos
  // dois lugares) — sem isso, "Voltar" sempre levava pra notas-fiscais.html (V1),
  // mesmo quando o usuário tinha chegado aqui a partir da V2. `?origem=v2` é
  // setado por notas-fiscais-v2.js; ausência do parâmetro (V1, prototype-nav
  // direto, fluxo de prefill via Cadastro) mantém o destino padrão de sempre. ----------
  var origem = params.get('origem');
  var backHref = origem === 'v2' ? 'notas-fiscais-v2.html' : 'notas-fiscais.html';
  var backTopLink = document.getElementById('nnf-back-top');
  var cancelLink = document.getElementById('nnf-cancel');
  if (backTopLink) backTopLink.href = backHref;
  if (cancelLink) cancelLink.href = backHref;

  var rejectionAlert = document.getElementById('nnf-rejection-alert');
  var rejectionMessage = document.getElementById('nnf-rejection-message');
  var tipoCard = document.getElementById('nnf-tipo-card');

  function fillForm(nota) {
    destinatarioDropdown.selectValue(
      (window.NiveloCadastros.findByTipo('cliente').filter(function (c) { return c.documento === nota.clienteDocumento; })[0] || {}).codigo
    );
    if (!destinatarioField.dataset.value) {
      destinatarioDocumentoInput.value = nota.clienteDocumento;
      destinatarioUfInput.value = nota.uf;
    }

    items = [];
    itemIdSeq = 0;
    nota.itens.forEach(function (item) { addItem(item); });

    meioPagamentoDropdown.selectValue(nota.meioPagamento);
    categoriaDropdown.selectValue(nota.categoriaCodigo);
    if (nota.transportadoraNome) {
      var transportadora = window.NiveloCadastros.findByTipo('transportadora').filter(function (t) { return t.nome === nota.transportadoraNome; })[0];
      if (transportadora) transporteDropdown.selectValue(transportadora.codigo);
    }
    tipoOperacaoDropdown.selectValue(nota.tipoOperacao);
    document.getElementById('nnf-observacao').value = nota.observacao || '';
  }

  // ---------- Visualização (`modo=ver`): EXCLUSIVAMENTE consulta, mesmo
  // padrão de detalhe-estoque.html — dados como texto (dl/dt/dd), nunca
  // campos de formulário desabilitados. "Corrigir nota fiscal" só existe
  // como ação de linha na Central de Notas Fiscais (notas-fiscais.js), que
  // já leva direto pra `modo=corrigir`; esta tela nunca mostra ações. ----------
  var STATUS_BADGE_VIEW = {
    pendente: { status: 'warning', label: 'Pendente' },
    emitida: { status: 'success', label: 'Emitida' },
    cancelada: { status: 'error', label: 'Cancelada' },
    rejeitada: { status: 'error', label: 'Rejeitada' }
  };
  function formatMoeda(valor) {
    return 'R$ ' + Number(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDataPt(iso) {
    var parts = (iso || '').split('-');
    return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : (iso || '—');
  }

  var viewContent = document.getElementById('nnf-view-content');
  var statusBadge = document.getElementById('nnf-status-badge');

  function renderViewContent(nota) {
    var badge = STATUS_BADGE_VIEW[nota.status] || STATUS_BADGE_VIEW.pendente;
    statusBadge.hidden = false;
    statusBadge.dataset.status = badge.status;
    statusBadge.innerHTML = '<span class="badgeDot"></span>' + badge.label;

    document.getElementById('nv-emitente-documento').textContent = emitente.documento;
    document.getElementById('nv-emitente-endereco').textContent = emitente.endereco;

    var isSaida = nota.tipo === 'saida';
    document.getElementById('nv-destinatario-title').textContent = isSaida ? 'Destinatário' : 'Remetente';
    document.getElementById('nv-pessoa-label').textContent = isSaida ? 'Cliente / Transportadora' : 'Fornecedor';
    document.getElementById('nv-pessoa-nome').textContent = (isSaida ? nota.clienteNome : nota.fornecedorNome) || '—';
    document.getElementById('nv-pessoa-documento').textContent = (isSaida ? nota.clienteDocumento : nota.fornecedorDocumento) || '—';
    document.getElementById('nv-pessoa-uf').textContent = nota.uf || '—';

    document.getElementById('nv-itens-tbody').innerHTML = (nota.itens || []).map(function (item) {
      return '<tr class="tr">' +
        '<td class="td">' + item.produtoNome + '</td>' +
        '<td class="td">' + item.sku + '</td>' +
        '<td class="td">' + item.unidade + '</td>' +
        '<td class="td">' + item.quantidade + '</td>' +
        '<td class="td">' + formatMoeda(item.preco) + '</td>' +
      '</tr>';
    }).join('');
    document.getElementById('nv-valor-total').textContent = formatMoeda(nota.valor);

    var meioPagamentoOption = document.querySelector('#meio-pagamento-field .option[data-value="' + nota.meioPagamento + '"]');
    document.getElementById('nv-meio-pagamento').textContent = meioPagamentoOption ? meioPagamentoOption.textContent : '—';
    var categoria = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.codigo === nota.categoriaCodigo; })[0];
    document.getElementById('nv-categoria').textContent = categoria ? categoria.descricao : '—';
    document.getElementById('nv-transporte').textContent = nota.transportadoraNome || 'Nenhuma transportadora';

    var natureza = window.NiveloNaturezaOperacao.findByTipoOperacao(nota.tipoOperacao);
    document.getElementById('nv-tipo-operacao').textContent = natureza ? natureza.label : '—';
    document.getElementById('nv-cfop').textContent = nota.cfop || '—';

    document.getElementById('nv-observacao').textContent = nota.observacao || '—';
  }

  // ---------- Prefill vindo da ação "Cadastrar nota fiscal" (Cadastro de
  // Pessoas e Empresas) — sessionStorage de uso único (mesmo padrão de
  // toast/rascunho já usado em outras telas), consumido e removido no
  // primeiro load. Só se aplica à CRIAÇÃO (sem `?numero=`, nunca em
  // visualização/correção de uma nota já existente). ----------
  if (!editingNota) {
    try {
      var prefillRaw = sessionStorage.getItem('nivelo.novanotafiscal.prefill');
      if (prefillRaw) {
        sessionStorage.removeItem('nivelo.novanotafiscal.prefill');
        var prefill = JSON.parse(prefillRaw);
        var origemPessoa = window.NiveloCadastros.findByCodigo ? window.NiveloCadastros.findByCodigo(prefill.codigo) : null;
        if (!origemPessoa) origemPessoa = window.NiveloCadastros.list().filter(function (p) { return p.codigo === prefill.codigo; })[0];
        if (origemPessoa) {
          var tiposOrigem = origemPessoa.tipo || [];
          // Regra 2: só quando a pessoa é EXCLUSIVAMENTE Fornecedor a tela força
          // Nota de Entrada — qualquer outra combinação (incl. Cliente+Fornecedor)
          // mantém o comportamento atual (usuário escolhe o tipo).
          var somenteFornecedor = tiposOrigem.length === 1 && tiposOrigem[0] === 'fornecedor';
          if (somenteFornecedor) {
            var entradaRadio = tipoRadios.filter(function (r) { return r.value === 'entrada'; })[0];
            if (entradaRadio) { entradaRadio.checked = true; syncTipoRadioChecked(); }
          } else if (tiposOrigem.indexOf('cliente') !== -1) {
            // Regra 1: nota de saída → Cliente/Transportadora pré-preenchido com o
            // participante de origem (o dropdown Destinatário só lista quem tem o
            // papel "cliente" — mesma fonte/comportamento de sempre, ver acima).
            destinatarioDropdown.selectValue(origemPessoa.codigo);
          }
        }
      }
    } catch (e) { /* sessionStorage indisponível */ }
  }

  // ---------- Prefill vindo de "Emitir nota fiscal" (Pedidos de Venda) —
  // mesmo mecanismo single-use de sessionStorage do prefill de Cadastro
  // acima, chave própria (payload mais rico: cliente/item/transporte/
  // observação já resolvidos no Pedido). Campos que a NF-e exige e o
  // Pedido não tem (ex. meio de pagamento fiscal, categoria, natureza da
  // operação com CFOP) ficam pendentes, sem valor — o usuário completa
  // antes de emitir, como pedido explicitamente. `origemPedidoNumero`
  // guardado pra, no sucesso da emissão, avisar `NiveloPedidosVenda` (ver
  // handler de submit, guardado atrás de `if (window.NiveloPedidosVenda)`
  // como qualquer integração opcional deste arquivo). ----------
  var origemPedidoNumero = null;
  if (!editingNota) {
    try {
      var pedidoPrefillRaw = sessionStorage.getItem('nivelo.novapedidodevenda.nfe-prefill');
      if (pedidoPrefillRaw) {
        sessionStorage.removeItem('nivelo.novapedidodevenda.nfe-prefill');
        var pedidoPrefill = JSON.parse(pedidoPrefillRaw);
        origemPedidoNumero = pedidoPrefill.origemPedido || null;
        if (pedidoPrefill.clienteCodigo) destinatarioDropdown.selectValue(pedidoPrefill.clienteCodigo);
        if (pedidoPrefill.item) {
          items = [];
          addItem(pedidoPrefill.item);
        }
        if (pedidoPrefill.observacao) document.getElementById('nnf-observacao').value = pedidoPrefill.observacao;
        if (pedidoPrefill.transportadoraCodigo) transporteDropdown.selectValue(pedidoPrefill.transportadoraCodigo);
      }
    } catch (e) { /* sessionStorage indisponível */ }
  }

  if (editingNota && (modo === 'ver' || modo === 'corrigir')) {
    tipoCard.hidden = true;
    isEditingCorrecao = modo === 'corrigir';

    if (editingNota.status === 'rejeitada') {
      rejectionAlert.hidden = false;
      rejectionMessage.textContent = editingNota.motivoRejeicao || '';
    }

    if (modo === 'ver') {
      document.getElementById('nnf-page-title').textContent = 'Detalhes da nota fiscal ' + editingNota.numero;
      document.title = 'Nota fiscal ' + editingNota.numero + ' — Nivelo';
      document.getElementById('nnf-form').hidden = true;
      renderViewContent(editingNota);
      viewContent.hidden = false;
    } else {
      document.getElementById('nnf-page-title').textContent = 'Corrigir nota fiscal ' + editingNota.numero;
      document.title = 'Corrigir nota fiscal — Nivelo';
      fillForm(editingNota);
      refreshTipoNotaVisibility();
    }
  } else {
    refreshTipoNotaVisibility();
  }

  // ---------- Bloqueio: Certificado Digital ----------
  var certificadoOverlay = document.getElementById('certificado-dialog-overlay');
  function openCertificadoDialog() { certificadoOverlay.hidden = false; }
  function closeCertificadoDialog() { certificadoOverlay.hidden = true; }
  document.getElementById('certificado-dialog-close').addEventListener('click', closeCertificadoDialog);
  document.getElementById('certificado-dialog-fechar').addEventListener('click', closeCertificadoDialog);
  certificadoOverlay.addEventListener('click', function (event) {
    if (event.target === certificadoOverlay) closeCertificadoDialog();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !certificadoOverlay.hidden) closeCertificadoDialog();
  });
  // A tela de Certificado Digital agora existe de verdade (Configuração >
  // Fiscal > Certificado Digital) — o botão navega pra lá.
  document.getElementById('certificado-dialog-ir').addEventListener('click', function () {
    window.location.href = 'certificado-digital.html';
  });

  // Demonstração: `#state=comcertificado` simula um Certificado Digital já
  // cadastrado, pra mostrar o caminho de sucesso da emissão sem depender de
  // uma tela real de cadastro (ainda não construída).
  if (/state=comcertificado/.test(location.hash)) {
    window.NiveloCertificadoDigital.setCertificado(true);
  }

  // ---------- Validação + envio ----------
  var form = document.getElementById('nnf-form');

  function runValidation() {
    var destinatarioInvalid = !destinatarioField.dataset.value;
    destinatarioField.classList.toggle('error', destinatarioInvalid);

    var itensInvalid = items.length === 0 || items.some(function (item) {
      return !item.sku || !(parseFloat(item.quantidade) > 0) || !(item.precoCents > 0);
    });
    itemsErrorEl.style.display = itensInvalid ? 'flex' : 'none';

    var meioPagamentoInvalid = !meioPagamentoDropdown.root.dataset.value;
    meioPagamentoDropdown.root.classList.toggle('error', meioPagamentoInvalid);

    var categoriaInvalid = !categoriaDropdown.root.dataset.value;
    categoriaDropdown.root.classList.toggle('error', categoriaInvalid);

    var tipoOperacaoInvalid = !tipoOperacaoDropdown.root.dataset.value;
    tipoOperacaoDropdown.root.classList.toggle('error', tipoOperacaoInvalid);

    return !destinatarioInvalid && !itensInvalid && !meioPagamentoInvalid && !categoriaInvalid && !tipoOperacaoInvalid;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Entrada: só salva a nota a partir do XML enviado, nunca emite (fluxo
    // independente do de saída, sem Certificado Digital nem os demais
    // campos do formulário de saída). ----------
    if (getTipoNota() === 'entrada') {
      var hasXmlFile = entradaXmlInput.files && entradaXmlInput.files.length > 0;
      entradaXmlBlock.classList.toggle('error', !hasXmlFile);
      if (!hasXmlFile) return;

      try {
        window.NiveloNotasFiscais.addEntrada({ arquivoNome: entradaXmlInput.files[0].name });
        sessionStorage.setItem('nivelo.novanotafiscal.success', 'Nota fiscal salva com sucesso.');
      } catch (e) {}
      window.location.href = backHref;
      return;
    }

    if (!runValidation()) {
      var firstInvalid = form.querySelector('.wrapper.error, .nnf-item-produto.error');
      if (firstInvalid) {
        var focusable = firstInvalid.querySelector('input, button');
        if (focusable) focusable.focus();
      }
      return;
    }

    if (!window.NiveloCertificadoDigital.hasCertificado()) {
      openCertificadoDialog();
      return;
    }

    var cliente = window.NiveloCadastros.findByTipo('cliente').filter(function (c) { return c.codigo === destinatarioField.dataset.value; })[0];
    var transportadora = transporteDropdown.root.dataset.value
      ? window.NiveloCadastros.findByTipo('transportadora').filter(function (t) { return t.codigo === transporteDropdown.root.dataset.value; })[0]
      : null;
    var natureza = window.NiveloNaturezaOperacao.findByTipoOperacao(tipoOperacaoDropdown.root.dataset.value);
    var totalCents = computeTotal();

    var payload = {
      dataEmissao: new Date().toISOString().slice(0, 10),
      clienteNome: cliente.nome,
      clienteDocumento: cliente.documento,
      uf: ufFromCidade(cliente.cidade),
      valor: totalCents / 100,
      itens: items.map(function (item) {
        return { produtoNome: item.produtoNome, sku: item.sku, unidade: item.unidade, quantidade: parseFloat(item.quantidade), preco: item.precoCents / 100 };
      }),
      meioPagamento: meioPagamentoDropdown.root.dataset.value,
      categoriaCodigo: categoriaDropdown.root.dataset.value,
      transportadoraNome: transportadora ? transportadora.nome : null,
      observacao: document.getElementById('nnf-observacao').value.trim(),
      tipoOperacao: natureza.tipoOperacao,
      cfop: natureza.cfop
    };

    var message;
    try {
      if (editingNota && modo === 'corrigir') {
        window.NiveloNotasFiscais.updateAfterCorrecao(editingNota.numero, payload);
        message = 'Nota fiscal corrigida e reenviada com sucesso.';
      } else {
        var notaCriada = window.NiveloNotasFiscais.add(payload);
        message = 'Nota fiscal emitida com sucesso.';
        // Integração V2 (pedido explícito): tudo que for gerado a partir de
        // uma Nota Fiscal de saída deve ser enviado automaticamente para
        // Contas a Receber. Só a V2 recebe essa integração (a V1 continua
        // intacta, sem nenhum vínculo automático) — se o módulo V2 não
        // estiver carregado por algum motivo, a emissão da nota não é
        // afetada de forma alguma.
        if (window.NiveloContasReceberV2) {
          window.NiveloContasReceberV2.addFromNotaFiscal(notaCriada);
        }
        // Emissão a partir de "Emitir nota fiscal" (Pedidos de Venda) — avisa
        // o pedido de origem que a integração NF-e foi concluída, guardado
        // atrás de `if (window.NiveloPedidosVenda)` como as demais
        // integrações opcionais deste arquivo (nunca quebra a emissão se o
        // módulo não estiver carregado).
        if (origemPedidoNumero && window.NiveloPedidosVenda) {
          window.NiveloPedidosVenda.marcarNfeEmitida(origemPedidoNumero, notaCriada.numero);
        }
      }
      sessionStorage.setItem('nivelo.novanotafiscal.success', message);
    } catch (e) {}

    window.location.href = backHref;
  });
})();
