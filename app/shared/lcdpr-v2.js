(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  // LCDPR V2 — fork deliberado de lcdpr.js (V1, preservado intacto). Diferenças reais:
  // sem RadioButton "Tipo de período" (só Ano-calendário, via NiveloDatePicker.initYear()),
  // sem filtro de Conta/Categoria (relatório sempre agrega TODOS os lançamentos do ano) e um
  // novo card de Resumo mensal do exercício (12 meses fixos, quantidade de despesas + valor
  // total das receitas) posicionado acima da tabela principal. A tabela principal em si voltou
  // a ser a mesma lista cronológica lançamento a lançamento da V1 (Data/Documento Fiscal +
  // Documento/Histórico/Natureza/Entradas/Saídas/Saldo).

  var MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // ---------- Helpers de data/moeda ----------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function formatDataPt(iso) {
    var p = (iso || '').split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : (iso || '—');
  }
  function formatMoeda(valor) {
    var n = Number(valor || 0);
    var sinal = n < 0 ? '-' : '';
    return sinal + 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function formatDataHoraPt(date) {
    var d = pad2(date.getDate()), m = pad2(date.getMonth() + 1), y = date.getFullYear();
    var hh = pad2(date.getHours()), mm = pad2(date.getMinutes());
    return d + '/' + m + '/' + y + ' ' + hh + ':' + mm;
  }
  // "Documento" não tem um campo próprio em NiveloCaixa — heurística de prototipagem
  // (mesma técnica já usada na V1) infere um tipo plausível de documento fiscal/
  // financeiro a partir dos dados já existentes do lançamento, só pra ilustrar a
  // coluna "Documento Fiscal / Documento" (NF-e/DARF/Recibo/TED).
  function inferDocumentoFiscal(l) {
    if (l.categoriaCodigo === 'CAT-006') return 'DARF';
    if (l.pessoaDocumento) return 'NF-e';
    if (l.banco && l.banco.indexOf('Dinheiro') !== -1) return 'Recibo';
    return 'TED';
  }

  // Banco (coluna nova) — mesma técnica já usada em caixa-v2.js's aba "Contas
  // financeiras": resolve a Conta Bancária REAL vinculada à Conta Financeira do
  // lançamento (window.NiveloContasBancarias) e, a partir dela, o nome do banco
  // real (catálogo Febraban, window.NiveloBancosCatalogo) — nunca o nome da
  // própria Conta Financeira. Lançamentos sem Conta Bancária vinculada (ex.
  // "Caixa Geral", dinheiro em espécie) mostram "—", nunca um banco inventado.
  function findContaBancariaByFinanceira(codigoFinanceira) {
    if (!window.NiveloContasBancarias || codigoFinanceira == null) return null;
    var lista = window.NiveloContasBancarias.list().filter(function (c) {
      return c.contaFinanceiraCodigo === codigoFinanceira;
    });
    return lista[0] || null;
  }
  function resolveBancoNome(l) {
    var bancaria = findContaBancariaByFinanceira(l.contaFinanceiraCodigo);
    if (!bancaria) return '—';
    var banco = window.NiveloBancosCatalogo ? window.NiveloBancosCatalogo.findByCodigo(bancaria.bancoCodigo) : null;
    return banco ? banco.nome : '—';
  }

  // ---------- Toast (validação de filtros) ----------
  var toastRegion = document.getElementById('toast-region');
  function showToast(title, message) {
    var toast = document.createElement('div');
    toast.className = 'alert warning lcdpr-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="icon"><i data-lucide="triangle-alert" width="18" height="18"></i></span>' +
      '<div class="body"><div class="title">' + title + '</div><div class="message">' + message + '</div></div>' +
      '<button type="button" class="dismiss" aria-label="Fechar aviso"><i data-lucide="x" width="16" height="16"></i></button>';
    toastRegion.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    var dismissBtn = toast.querySelector('.dismiss');
    var hideTimer = window.setTimeout(function () { toast.remove(); }, 4000);
    dismissBtn.addEventListener('click', function () { window.clearTimeout(hideTimer); toast.remove(); });
  }

  // ---------- Tooltip padrão dos ícones de ação (mesma técnica do resto do sistema) ----------
  function getActionTip(btn) {
    if (btn.__tip) return btn.__tip;
    var tip = btn.querySelector('.tip');
    if (tip) { document.body.appendChild(tip); btn.__tip = tip; }
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
  function hideActionTooltip(btn) { var tip = btn.__tip; if (tip) tip.style.opacity = '0'; }
  document.addEventListener('mouseover', function (e) { var b = e.target.closest('.actionBtn[data-export]'); if (b) positionActionTooltip(b); });
  document.addEventListener('mouseout', function (e) { var b = e.target.closest('.actionBtn[data-export]'); if (b) hideActionTooltip(b); });

  // ---------- Filtro: Ano-calendário via NiveloDatePicker.initYear() ----------
  // Regra de negócio real: o Ano-calendário só pode ser um exercício PASSADO, nunca o ano
  // corrente do sistema (não faz sentido gerar o LCDPR de um exercício ainda em curso) NEM um
  // ano anterior ao início do uso do sistema pela empresa/produtor. Este protótipo não modela
  // ainda a data de criação/onboarding da conta (auditoria já registrada em outras telas —
  // ver DRE V2/Balancete V2) — "for development": em produção, `minYear` deve vir da data de
  // criação da conta/empresa no sistema (`contaCriadaEm.getFullYear()` ou equivalente), não de
  // uma constante fixa. Aqui, hardcoded pra fins de protótipo: assume-se que a empresa começou
  // a usar o sistema em 2023, então os anos selecionáveis vão de 2023 até o ano anterior ao
  // corrente. Mesma constante/padrão já usado em dre-v2.js (`ANO_CORRENTE_SISTEMA`).
  // Nota pra desenvolvimento: a lista de anos deve ser dinâmica, derivada da data de
  // início de uso do sistema pela empresa (`contaCriadaEm.getFullYear()` ou equivalente,
  // ainda não modelado neste protótipo) até o ano anterior ao corrente — nunca o ano
  // atual/futuro, que ainda não tem exercício encerrado. Anos fora desse intervalo não
  // devem ser retornados pelo filtro (removidos da lista, não só desabilitados). Aqui,
  // hardcoded pra fins de protótipo com alguns anos fictícios já utilizados no sistema.
  var ANO_CORRENTE_SISTEMA = 2026;
  var ANO_INICIO_USO_SISTEMA = 2023;
  var ANOS_DISPONIVEIS = [];
  for (var anoDisponivel = ANO_INICIO_USO_SISTEMA; anoDisponivel < ANO_CORRENTE_SISTEMA; anoDisponivel++) {
    ANOS_DISPONIVEIS.push(anoDisponivel);
  }
  var DEFAULT_ANO = ANO_CORRENTE_SISTEMA - 1;
  // Sem `clearId`: o campo nunca fica vazio de propósito (trocar de ano é sempre uma nova
  // seleção direta no próprio campo, nunca uma limpeza seguida de re-seleção) — conforme
  // pedido explícito de não ter ação de "limpar" com X neste filtro.
  var anoPicker = window.NiveloDatePicker.initYear({
    rootId: 'ano-field',
    triggerId: 'ano-trigger',
    valueId: 'ano-value',
    popoverId: 'ano-popover',
    placeholder: 'Selecionar ano',
    allowedYears: ANOS_DISPONIVEIS,
    initialValue: DEFAULT_ANO
  });

  // ---------- Geração do relatório ----------
  function gerarRelatorio() {
    var ano = anoPicker.getValue();
    if (!ano) { showToast('Informe o ano', 'Selecione o ano-calendário do exercício.'); return; }

    var start = ano + '-01-01';
    var end = ano + '-12-31';
    var periodoLabel = 'Ano-calendário ' + ano;

    // Sem filtro de Conta/Categoria na V2 — todo NiveloCaixa.list() do ano entra,
    // equivalente a "Todas as contas"/"Todas as categorias" sempre selecionadas na V1.
    var lancamentos = window.NiveloCaixa.list()
      .filter(function (l) { return l.data >= start && l.data <= end; })
      .slice()
      .sort(function (a, b) { return a.data < b.data ? -1 : a.data > b.data ? 1 : 0; });

    var totalReceitas = 0, totalDespesas = 0, saldoCorrente = 0;
    var linhas = lancamentos.map(function (l) {
      var categoria = window.NiveloCategoriasFinanceiras ? window.NiveloCategoriasFinanceiras.findByCodigo(l.categoriaCodigo) : null;
      var entrada = l.tipo === 'entrada' ? l.valor : 0;
      var saida = l.tipo === 'saida' ? l.valor : 0;
      totalReceitas += entrada;
      totalDespesas += saida;
      saldoCorrente += entrada - saida;
      return {
        data: l.data,
        banco: resolveBancoNome(l),
        documento: l.codigo,
        documentoTipo: inferDocumentoFiscal(l),
        historico: l.historico,
        categoria: categoria ? categoria.descricao : '—',
        entrada: entrada,
        saida: saida,
        saldo: saldoCorrente
      };
    });

    // Resumo mensal do exercício — sempre os 12 meses (Jan-Dez), independente de haver
    // lançamento ou não naquele mês. Despesas/Receitas são somas monetárias (R$) das
    // saídas/entradas daquele mês.
    var resumoMensal = [];
    for (var m = 0; m < 12; m++) {
      resumoMensal.push({ mes: MESES[m], totalDespesas: 0, totalReceitas: 0 });
    }
    lancamentos.forEach(function (l) {
      var mIndex = Number((l.data || '').slice(5, 7)) - 1;
      if (mIndex < 0 || mIndex > 11) return;
      if (l.tipo === 'saida') resumoMensal[mIndex].totalDespesas += l.valor;
      else if (l.tipo === 'entrada') resumoMensal[mIndex].totalReceitas += l.valor;
    });

    var conta = window.NiveloMinhaConta.getConta();

    window.__lcdprV2Report = {
      periodoLabel: periodoLabel,
      linhas: linhas,
      resumoMensal: resumoMensal,
      totalReceitas: totalReceitas,
      totalDespesas: totalDespesas,
      resultado: totalReceitas - totalDespesas,
      saldoFinal: saldoCorrente,
      dadosGerais: {
        produtor: conta.nome,
        cpf: conta.documento,
        exercicio: String(ano),
        periodo: periodoLabel,
        emissao: formatDataHoraPt(new Date())
      }
    };

    renderReport(window.__lcdprV2Report);
    setFiltrosExpanded(false);
  }

  // ---------- Render: cabeçalho/resumo + KPIs + resumo mensal + tabela ----------
  function renderReport(report) {
    document.getElementById('lcdpr-resultado').hidden = false;

    var g = report.dadosGerais;
    document.getElementById('lcdpr-info-produtor').textContent = g.produtor;
    document.getElementById('lcdpr-info-cpf').textContent = g.cpf;
    document.getElementById('lcdpr-info-exercicio').textContent = g.exercicio;
    document.getElementById('lcdpr-info-periodo').textContent = g.periodo;
    document.getElementById('lcdpr-info-emissao').textContent = g.emissao;

    document.getElementById('lcdpr-emission-note').textContent =
      'Relatório emitido em: ' + g.emissao + ' • Filtros aplicados: Exercício ' + g.exercicio;

    document.getElementById('lcdpr-kpi-receitas').textContent = formatMoeda(report.totalReceitas);
    document.getElementById('lcdpr-kpi-despesas').textContent = formatMoeda(report.totalDespesas);
    var resultadoEl = document.getElementById('lcdpr-kpi-resultado');
    resultadoEl.textContent = formatMoeda(report.resultado);
    resultadoEl.classList.toggle('lcdpr-value-positive', report.resultado >= 0);
    resultadoEl.classList.toggle('lcdpr-value-negative', report.resultado < 0);

    renderMonthlySummary(report);
    renderTable(report);
    if (window.lucide) lucide.createIcons();
  }

  function renderMonthlySummary(report) {
    var grid = document.getElementById('lcdpr-monthly-grid');
    grid.innerHTML = report.resumoMensal.map(function (row) {
      return (
        '<div class="lcdpr-monthly-card">' +
          '<span class="lcdpr-monthly-card-mes text-14-bold">' + row.mes + '</span>' +
          '<span class="lcdpr-monthly-card-row"><span class="lcdpr-monthly-card-label">Despesas</span><span class="lcdpr-monthly-card-value lcdpr-value-negative">' + formatMoeda(row.totalDespesas) + '</span></span>' +
          '<span class="lcdpr-monthly-card-row"><span class="lcdpr-monthly-card-label">Receitas</span><span class="lcdpr-monthly-card-value lcdpr-value-positive">' + formatMoeda(row.totalReceitas) + '</span></span>' +
        '</div>'
      );
    }).join('');
  }

  function renderTable(report) {
    var tbody = document.getElementById('lcdpr-tbody');
    var tfoot = document.getElementById('lcdpr-tfoot');
    var tableCard = document.querySelector('.lcdpr-table-card .tableWrap');
    var emptyEl = document.getElementById('lcdpr-empty');

    if (!report.linhas.length) {
      tbody.innerHTML = '';
      tfoot.innerHTML = '';
      tableCard.closest('.lcdpr-table-scroll-shell').hidden = true;
      emptyEl.hidden = false;
      return;
    }
    tableCard.closest('.lcdpr-table-scroll-shell').hidden = false;
    emptyEl.hidden = true;

    tbody.innerHTML = report.linhas.map(function (l) {
      return (
        '<tr class="tr">' +
          '<td class="td">' + formatDataPt(l.data) + '</td>' +
          '<td class="td">' + l.banco + '</td>' +
          '<td class="td"><span class="lcdpr-doc-tipo">' + l.documentoTipo + '</span><span class="lcdpr-doc-ref">' + l.documento + '</span></td>' +
          '<td class="td">' + l.historico + '</td>' +
          '<td class="td">' + l.categoria + '</td>' +
          '<td class="td">' + (l.entrada ? formatMoeda(l.entrada) : '') + '</td>' +
          '<td class="td">' + (l.saida ? formatMoeda(l.saida) : '') + '</td>' +
          '<td class="td">' + formatMoeda(l.saldo) + '</td>' +
        '</tr>'
      );
    }).join('');

    tfoot.innerHTML =
      '<tr class="tr lcdpr-foot-row">' +
        '<td class="td lcdpr-td-label" colspan="5">Total</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.totalReceitas) + '</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.totalDespesas) + '</td>' +
        '<td class="td lcdpr-foot-value">' + formatMoeda(report.saldoFinal) + '</td>' +
      '</tr>' +
      '<tr class="tr lcdpr-foot-row lcdpr-foot-resultado">' +
        '<td class="td lcdpr-td-label" colspan="5">Resultado do período</td>' +
        '<td class="td lcdpr-foot-value" colspan="3">' + formatMoeda(report.resultado) + '</td>' +
      '</tr>';

    updateScrollFade();
  }

  // ---------- Rolagem horizontal da tabela (mesma técnica de Balancete/LCDPR V1) ----------
  var tableWrapEl = document.getElementById('lcdpr-tablewrap');
  var tableScrollShell = document.querySelector('.lcdpr-table-scroll-shell');
  var scrollTopEl = document.getElementById('lcdpr-table-scroll-top');
  var scrollTopSpacer = document.getElementById('lcdpr-table-scroll-top-spacer');

  function updateScrollFade() {
    if (!tableWrapEl || !tableScrollShell) return;
    var hasMoreRight = tableWrapEl.scrollWidth - tableWrapEl.clientWidth - tableWrapEl.scrollLeft > 2;
    tableScrollShell.classList.toggle('lcdpr-has-hscroll', hasMoreRight);
    if (scrollTopSpacer) scrollTopSpacer.style.width = tableWrapEl.scrollWidth + 'px';
  }

  if (tableWrapEl) {
    var syncingScroll = false;
    tableWrapEl.addEventListener('scroll', function () {
      updateScrollFade();
      if (scrollTopEl && !syncingScroll) {
        syncingScroll = true;
        scrollTopEl.scrollLeft = tableWrapEl.scrollLeft;
        syncingScroll = false;
      }
    });
    if (scrollTopEl) {
      scrollTopEl.addEventListener('scroll', function () {
        if (syncingScroll) return;
        syncingScroll = true;
        tableWrapEl.scrollLeft = scrollTopEl.scrollLeft;
        syncingScroll = false;
      });
    }
    window.addEventListener('resize', updateScrollFade);

    var dragActive = false;
    var dragStartX = 0;
    var dragStartScroll = 0;
    tableWrapEl.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      dragActive = true;
      dragStartX = e.clientX;
      dragStartScroll = tableWrapEl.scrollLeft;
      tableWrapEl.classList.add('lcdpr-dragging');
    });
    tableWrapEl.addEventListener('pointermove', function (e) {
      if (!dragActive) return;
      tableWrapEl.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    function stopDrag() { dragActive = false; tableWrapEl.classList.remove('lcdpr-dragging'); }
    tableWrapEl.addEventListener('pointerup', stopDrag);
    tableWrapEl.addEventListener('pointercancel', stopDrag);
    tableWrapEl.addEventListener('pointerleave', stopDrag);
  }

  // ---------- Filtros: accordion (recolhe sozinho após gerar, expande de novo no clique) ----------
  var filtrosHeader = document.getElementById('lcdpr-filtros-header');
  var filtrosToggle = document.getElementById('lcdpr-filtros-toggle');
  var filtrosContent = document.getElementById('lcdpr-filtros-content');

  function setFiltrosExpanded(expanded) {
    filtrosContent.hidden = !expanded;
    filtrosToggle.setAttribute('aria-expanded', String(expanded));
    filtrosToggle.setAttribute('aria-label', expanded ? 'Recolher filtros' : 'Expandir filtros');
  }
  filtrosHeader.addEventListener('click', function () {
    setFiltrosExpanded(filtrosContent.hidden);
  });

  document.getElementById('lcdpr-gerar-btn').addEventListener('click', gerarRelatorio);

  // ---------- Exportações reais: PDF (jsPDF) e Excel (SheetJS), ambos via CDN ----------
  function exportarPdf(report) {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { showToast('Não foi possível exportar', 'A biblioteca de PDF não carregou. Tente novamente.'); return; }
    var g = report.dadosGerais;
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
    var marginX = 40, pageBottom = 780, y = 50;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Livro caixa', marginX, y);
    doc.setFont(undefined, 'normal');
    y += 22;

    doc.setFontSize(9);
    [
      'Produtor Rural: ' + g.produtor,
      'CPF: ' + g.cpf,
      'Exercício: ' + g.exercicio,
      'Período consultado: ' + g.periodo,
      'Data e hora da emissão: ' + g.emissao
    ].forEach(function (line) { doc.text(line, marginX, y); y += 13; });
    y += 8;

    doc.setFont(undefined, 'bold');
    doc.text('Total de receitas: ' + formatMoeda(report.totalReceitas), marginX, y); y += 13;
    doc.text('Total de despesas: ' + formatMoeda(report.totalDespesas), marginX, y); y += 13;
    doc.text('Resultado do período: ' + formatMoeda(report.resultado), marginX, y); y += 20;
    doc.setFont(undefined, 'normal');

    var colX = { data: marginX, banco: marginX + 50, doc: marginX + 115, hist: marginX + 195, nat: marginX + 330, ent: marginX + 400, sai: marginX + 460, sal: marginX + 515 };

    function drawHeader() {
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text('Data', colX.data, y);
      doc.text('Banco', colX.banco, y);
      doc.text('Documento', colX.doc, y);
      doc.text('Histórico', colX.hist, y);
      doc.text('Natureza', colX.nat, y);
      doc.text('Entradas', colX.ent, y);
      doc.text('Saídas', colX.sai, y);
      doc.text('Saldo', colX.sal, y);
      doc.setFont(undefined, 'normal');
      y += 8;
      doc.setLineWidth(0.5);
      doc.line(marginX, y, 555, y);
      y += 12;
    }
    drawHeader();

    report.linhas.forEach(function (l) {
      if (y > pageBottom) { doc.addPage(); y = 50; drawHeader(); }
      doc.text(formatDataPt(l.data), colX.data, y);
      doc.text(String(l.banco).slice(0, 14), colX.banco, y);
      doc.text(l.documentoTipo + ' ' + l.documento, colX.doc, y);
      doc.text(String(l.historico).slice(0, 22), colX.hist, y);
      doc.text(String(l.categoria).slice(0, 14), colX.nat, y);
      if (l.entrada) doc.text(formatMoeda(l.entrada), colX.ent, y);
      if (l.saida) doc.text(formatMoeda(l.saida), colX.sai, y);
      doc.text(formatMoeda(l.saldo), colX.sal, y);
      y += 14;
    });

    if (y > pageBottom - 20) { doc.addPage(); y = 50; }
    y += 6;
    doc.setLineWidth(0.5);
    doc.line(marginX, y, 555, y);
    y += 14;
    doc.setFont(undefined, 'bold');
    doc.text('Total', colX.data, y);
    doc.text(formatMoeda(report.totalReceitas), colX.ent, y);
    doc.text(formatMoeda(report.totalDespesas), colX.sai, y);
    doc.text(formatMoeda(report.saldoFinal), colX.sal, y);
    y += 16;
    doc.text('Resultado do período', colX.data, y);
    doc.text(formatMoeda(report.resultado), colX.sal, y);

    doc.save('LCDPR-V2-' + g.exercicio + '.pdf');
  }

  function exportarExcel(report) {
    if (!window.XLSX) { showToast('Não foi possível exportar', 'A biblioteca de planilhas não carregou. Tente novamente.'); return; }
    var g = report.dadosGerais;
    var rows = [
      ['Livro caixa - V2'],
      ['Produtor Rural', g.produtor],
      ['CPF', g.cpf],
      ['Exercício', g.exercicio],
      ['Período consultado', g.periodo],
      ['Data e hora da emissão', g.emissao],
      [],
      ['Total de receitas', report.totalReceitas],
      ['Total de despesas', report.totalDespesas],
      ['Resultado do período', report.resultado],
      [],
      ['Resumo mensal do exercício'],
      ['Mês', 'Despesas', 'Receitas']
    ];
    report.resumoMensal.forEach(function (row) {
      rows.push([row.mes, row.totalDespesas, row.totalReceitas]);
    });
    rows.push([]);
    rows.push(['Data', 'Banco', 'Documento Fiscal / Documento', 'Histórico', 'Natureza', 'Entradas', 'Saídas', 'Saldo']);
    report.linhas.forEach(function (l) {
      rows.push([
        formatDataPt(l.data),
        l.banco,
        l.documentoTipo + ' ' + l.documento,
        l.historico,
        l.categoria,
        l.entrada || '',
        l.saida || '',
        l.saldo
      ]);
    });
    rows.push(['Total', '', '', '', '', report.totalReceitas, report.totalDespesas, report.saldoFinal]);
    rows.push(['Resultado do período', '', '', '', '', '', '', report.resultado]);

    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LCDPR');
    XLSX.writeFile(wb, 'LCDPR-V2-' + g.exercicio + '.xlsx');
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-export]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var report = window.__lcdprV2Report;
      if (!report) return;
      var tipo = btn.dataset.export;
      if (tipo === 'pdf') exportarPdf(report);
      else if (tipo === 'excel') exportarExcel(report);
      else if (tipo === 'imprimir') window.print();
    });
  });
})();
