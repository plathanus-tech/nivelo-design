/* ══════════════════════════════════════════════════════════
   window.NiveloPedidosVenda — catálogo central de Pedidos de Venda
   (Vendas > Pedidos de venda). Mesma convenção IIFE dos demais módulos de
   dados do projeto (ver `contas-pagar-data.js`/`fazendas-data.js`), com
   persistência em `sessionStorage` (`nivelo.pedidosvenda.sessao`) — mesmo
   princípio de `fazendas-data.js`: sobrevive à navegação entre as telas
   desta jornada na mesma aba, mas não a uma sessão nova.

   Cada pedido: {
     numero,                 // 'PV-0001' — auto-gerado, sequencial
     data,                   // 'AAAA-MM-DD' — data do pedido (usuário pode alterar)
     naturezaOperacaoCodigo, naturezaOperacaoDescricao, // NiveloNaturezasOperacao
     clienteCodigo, clienteNome, clienteDocumento, clienteIe, clienteTelefone, clienteEndereco,
     modalidade,             // 'estoque' | 'futura'
     produtoSku, produtoNome, produtoUnidadeLegado, unidadeCodigo,
     depositoNome,           // só modalidade==='estoque'
     quantidade, pesoPorUnidade, totalKg, precoUnitario, valorBruto, desconto, valorLiquido,
     condicaoPagamento,      // 'avista' | 'prazo'
     formaRecebimentoCodigo, formaRecebimentoNome, contaEntradaCodigo, contaEntradaNome, dataRecebimento,
     formaCobrancaCodigo, formaCobrancaNome, numeroParcelas, parcelas, // [{numero, total, vencimento, valor}]
     transportadoraCodigo, transportadoraNome, veiculoPlaca, motorista,
     observacao,
     tipo,                   // 'venda' | 'venda-futura' | 'remessa' (derivado da modalidade; 'remessa' reservado pro fluxo futuro de Nova Remessa)
     status,                 // 'pendente-nfe' | 'nfe-emitida' | 'aguardando-entrega' | 'cancelado'
     numeroNotaFiscal,
     criadoEm
   }

   Regras de integração (ver coluna "Integrações" da listagem) — modeladas
   como um mapa de FUNÇÕES por integração (nunca uma condição hardcoded
   espalhada pela tela), pra que uma regra futura (ex. Remessa também gerar
   Financeiro) só precise mudar aqui, num lugar só:
   - Estoque: aplicável só quando `modalidade==='estoque'` (venda futura
     alimenta Estoque Comprometido, não uma baixa de estoque real — ver
     nota de desenvolvimento em `novo-pedido-venda.js`). Quando aplicável,
     concluído automaticamente na criação (baixa simulada).
   - Financeiro: sempre aplicável (todo pedido tem uma condição de
     pagamento). Concluído automaticamente na criação — à vista gera um
     lançamento em Caixa (`NiveloCaixa`), a prazo gera as contas a receber
     por parcela (`NiveloContasReceber`), ambos guardados atrás de
     `if (window.NiveloX)` (nunca quebra a criação do pedido se o módulo
     financeiro não estiver carregado).
   - NF-e: sempre aplicável, mas NUNCA automática — só vira "concluído"
     através da ação explícita "Emitir nota fiscal" (ver
     `marcarNfeEmitida()`), nunca no momento da criação do pedido.
   ══════════════════════════════════════════════════════════ */
window.NiveloPedidosVenda = (function () {
  'use strict';

  var SESSION_KEY = 'nivelo.pedidosvenda.sessao';

  var SEED = [
    {
      numero: 'PV-0001', data: '2026-08-20', naturezaOperacaoCodigo: null, naturezaOperacaoDescricao: 'Venda de produção do estabelecimento',
      clienteCodigo: null, clienteNome: 'Cerealista Bom Grão S.A.', clienteDocumento: '98.765.432/0001-10', clienteIe: '123.456.789.110', clienteTelefone: '(49) 3251-4477', clienteEndereco: 'Rua das Cerealistas, 500 - Tijucas/SC',
      modalidade: 'estoque', produtoSku: 'PRD-001', produtoNome: 'Soja', produtoUnidadeLegado: 'Saca', unidadeCodigo: 'SC', depositoNome: 'Armazém da Fazenda',
      quantidade: 300, pesoPorUnidade: 60, totalKg: 18000, precoUnitario: 130, valorBruto: 39000, desconto: 0, valorLiquido: 39000,
      condicaoPagamento: 'avista', formaRecebimentoCodigo: 'PIX', formaRecebimentoNome: 'Pix', contaEntradaCodigo: null, contaEntradaNome: 'Banco do Brasil - Conta Corrente', dataRecebimento: '2026-08-20',
      formaCobrancaCodigo: null, formaCobrancaNome: null, numeroParcelas: null, parcelas: [],
      transportadoraCodigo: null, transportadoraNome: null, veiculoPlaca: null, motorista: null,
      observacao: '', tipo: 'venda', status: 'nfe-emitida', numeroNotaFiscal: 'NF-1001', criadoEm: '2026-08-20T09:00:00',
      integracaoEstoqueConcluida: true, integracaoFinanceiroConcluida: true
    },
    {
      numero: 'PV-0002', data: '2026-08-24', naturezaOperacaoCodigo: null, naturezaOperacaoDescricao: 'Venda de produção do estabelecimento',
      clienteCodigo: null, clienteNome: 'Agropecuária Central Ltda', clienteDocumento: '55.666.777/0001-88', clienteIe: '223.445.667.100', clienteTelefone: '(49) 3255-1188', clienteEndereco: 'Av. Central, 1200 - Tijucas/SC',
      modalidade: 'estoque', produtoSku: 'PRD-003', produtoNome: 'Trigo', produtoUnidadeLegado: 'Saca', unidadeCodigo: 'SC', depositoNome: 'Fazenda São João',
      quantidade: 150, pesoPorUnidade: 60, totalKg: 9000, precoUnitario: 98, valorBruto: 14700, desconto: 200, valorLiquido: 14500,
      condicaoPagamento: 'prazo', formaRecebimentoCodigo: null, formaRecebimentoNome: null, contaEntradaCodigo: null, contaEntradaNome: null, dataRecebimento: null,
      formaCobrancaCodigo: 'BOLETO', formaCobrancaNome: 'Boleto', numeroParcelas: 2,
      parcelas: [
        { numero: '1/2', total: 2, vencimento: '2026-09-10', valor: 7250 },
        { numero: '2/2', total: 2, vencimento: '2026-10-10', valor: 7250 }
      ],
      transportadoraCodigo: null, transportadoraNome: 'Transportes Rio Verde Ltda', veiculoPlaca: 'ABC-1D23', motorista: 'José Carlos Menezes',
      observacao: '', tipo: 'venda', status: 'pendente-nfe', numeroNotaFiscal: null, criadoEm: '2026-08-24T10:30:00',
      integracaoEstoqueConcluida: true, integracaoFinanceiroConcluida: true
    },
    {
      numero: 'PV-0003', data: '2026-08-26', naturezaOperacaoCodigo: null, naturezaOperacaoDescricao: 'Venda para entrega futura',
      clienteCodigo: null, clienteNome: 'Maria Aparecida Souza', clienteDocumento: '123.456.789-00', clienteIe: 'Isento', clienteTelefone: '(49) 99911-2233', clienteEndereco: 'Linha São Pedro, s/n - Tijucas/SC',
      modalidade: 'futura', produtoSku: 'PRD-002', produtoNome: 'Milho', produtoUnidadeLegado: 'Saca', unidadeCodigo: 'SC', depositoNome: null,
      quantidade: 500, pesoPorUnidade: 60, totalKg: 30000, precoUnitario: 72, valorBruto: 36000, desconto: 0, valorLiquido: 36000,
      condicaoPagamento: 'avista', formaRecebimentoCodigo: 'DINHEIRO', formaRecebimentoNome: 'Dinheiro', contaEntradaCodigo: null, contaEntradaNome: 'Dinheiro em caixa', dataRecebimento: '2026-08-26',
      formaCobrancaCodigo: null, formaCobrancaNome: null, numeroParcelas: null, parcelas: [],
      transportadoraCodigo: null, transportadoraNome: null, veiculoPlaca: null, motorista: null,
      observacao: 'Colheita prevista para dezembro/2026.', tipo: 'venda-futura', status: 'pendente-nfe', numeroNotaFiscal: null, criadoEm: '2026-08-26T14:15:00',
      integracaoEstoqueConcluida: false, integracaoFinanceiroConcluida: true
    },
    // PV-0004: exemplo fictício de REMESSA vinculada a um pedido de venda já
    // existente (PV-0002) — `pedidoOrigemNumero` é o único campo novo aqui,
    // lido só pela listagem (buildRowHTML) pra mostrar a legenda "Vinculado
    // ao Pedido PV-000X" sob a coluna Cliente/Destinatário, mesma técnica já
    // usada pra "Parcela N/M" em Contas a Pagar/Receber (caption sob a
    // coluna de texto principal, não uma coluna nova). Mesmo cliente/produto/
    // quantidade do pedido de origem (a remessa entrega o que foi vendido
    // lá), shape idêntico ao de `addRemessa()`.
    {
      numero: 'PV-0004', data: '2026-08-28', naturezaOperacaoCodigo: null, naturezaOperacaoDescricao: 'Remessa para depósito/armazém',
      clienteCodigo: null, clienteNome: 'Agropecuária Central Ltda', clienteDocumento: '55.666.777/0001-88', clienteIe: '223.445.667.100', clienteTelefone: '(49) 3255-1188', clienteEndereco: 'Av. Central, 1200 - Tijucas/SC',
      modalidade: 'remessa', produtoSku: 'PRD-003', produtoNome: 'Trigo', produtoUnidadeLegado: 'Saca', unidadeCodigo: 'SC', depositoNome: null,
      quantidade: 150, pesoPorUnidade: 60, totalKg: 9000, precoUnitario: 98, valorBruto: 14700, desconto: 0, valorLiquido: 14700,
      condicaoPagamento: null, formaRecebimentoCodigo: null, formaRecebimentoNome: null, contaEntradaCodigo: null, contaEntradaNome: null, dataRecebimento: null,
      formaCobrancaCodigo: null, formaCobrancaNome: null, numeroParcelas: null, parcelas: [],
      transportadoraCodigo: null, transportadoraNome: 'Transportes Rio Verde Ltda', veiculoPlaca: 'ABC-1D23', motorista: 'José Carlos Menezes',
      observacao: '', tipo: 'remessa', status: 'pendente-nfe', numeroNotaFiscal: null, criadoEm: '2026-08-28T11:00:00',
      integracaoEstoqueConcluida: false, integracaoFinanceiroConcluida: false,
      pedidoOrigemNumero: 'PV-0002'
    }
  ];

  function readSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function writeSession() {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(PEDIDOS)); } catch (e) {}
  }

  var PEDIDOS = readSession() || SEED.slice();

  function list() {
    return PEDIDOS;
  }

  function findByNumero(numero) {
    return PEDIDOS.filter(function (p) { return p.numero === numero; })[0] || null;
  }

  function nextNumero() {
    var max = 0;
    PEDIDOS.forEach(function (p) {
      var match = /PV-(\d+)/.exec(p.numero);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var padded = String(max + 1);
    while (padded.length < 4) padded = '0' + padded;
    return 'PV-' + padded;
  }

  // ---------- Regras de aplicabilidade das integrações, extensíveis: cada
  // entrada é uma função (pedido) => boolean, nunca uma condição solta
  // dentro da tela de listagem. ----------
  var INTEGRACAO_APLICAVEL = {
    estoque: function (pedido) { return pedido.modalidade === 'estoque'; },
    // Remessa nunca gera Conta a Receber (não é uma venda) — ver `addRemessa()`
    // mais abaixo e a nota de desenvolvimento no topo deste arquivo.
    financeiro: function (pedido) { return pedido.tipo !== 'remessa'; },
    nfe: function () { return true; }
  };

  function integracoesDoPedido(pedido) {
    return {
      estoque: !INTEGRACAO_APLICAVEL.estoque(pedido) ? 'nao-aplica' : (pedido.integracaoEstoqueConcluida ? 'concluido' : 'pendente'),
      financeiro: !INTEGRACAO_APLICAVEL.financeiro(pedido) ? 'nao-aplica' : (pedido.integracaoFinanceiroConcluida ? 'concluido' : 'pendente'),
      nfe: !INTEGRACAO_APLICAVEL.nfe(pedido) ? 'nao-aplica' : (pedido.status === 'nfe-emitida' || pedido.status === 'aguardando-entrega' ? 'concluido' : 'pendente')
    };
  }

  // ---------- Integração Financeiro (best-effort, nunca bloqueia a criação
  // do pedido — cada chamada guardada atrás de `if (window.NiveloX)` e
  // envolta em try/catch, mesmo princípio já usado em nova-nota-fiscal.js
  // pra `NiveloContasReceberV2`). ----------
  function lancarFinanceiro(pedido) {
    try {
      if (pedido.condicaoPagamento === 'avista') {
        if (!window.NiveloCaixa) return false;
        window.NiveloCaixa.add({
          data: pedido.dataRecebimento || pedido.data,
          historico: 'Recebimento do Pedido de Venda ' + pedido.numero + ' (' + pedido.produtoNome + ')',
          pessoaNome: pedido.clienteNome || null,
          pessoaDocumento: pedido.clienteDocumento || null,
          categoriaCodigo: primeiraCategoriaReceita(),
          contaFinanceiraCodigo: primeiraContaFinanceira(),
          tipo: 'entrada',
          valor: pedido.valorLiquido,
          banco: pedido.contaEntradaNome || pedido.formaRecebimentoNome || 'Dinheiro em caixa',
          competencia: (pedido.dataRecebimento || pedido.data).slice(0, 7)
        });
        return true;
      }
      if (pedido.condicaoPagamento === 'prazo') {
        if (!window.NiveloContasReceber || !pedido.parcelas || !pedido.parcelas.length) return false;
        pedido.parcelas.forEach(function (parcela) {
          window.NiveloContasReceber.add({
            clienteCodigo: pedido.clienteCodigo || null,
            clienteNome: pedido.clienteNome,
            clienteDocumento: pedido.clienteDocumento,
            formaRecebimentoCodigo: pedido.formaCobrancaCodigo,
            vencimento: parcela.vencimento,
            dataEmissao: pedido.data,
            valor: parcela.valor,
            numeroDocumento: pedido.numero,
            historico: 'Pedido de Venda ' + pedido.numero + ' - parcela ' + parcela.numero + ' (' + pedido.produtoNome + ')',
            categoriaCodigo: primeiraCategoriaReceita(),
            ocorrencia: 'unica',
            numeroParcelas: null,
            diaVencimento: null
          });
        });
        return true;
      }
    } catch (e) { /* integração best-effort, nunca bloqueia o pedido */ }
    return false;
  }

  function primeiraCategoriaReceita() {
    try {
      var categorias = window.NiveloCategoriasFinanceiras.list().filter(function (c) { return c.grupo === 'receita' && c.ativo; });
      return categorias.length ? categorias[0].codigo : null;
    } catch (e) { return null; }
  }
  function primeiraContaFinanceira() {
    try {
      var contas = window.NiveloContasFinanceiras.list();
      return contas.length ? contas[0].codigo : null;
    } catch (e) { return null; }
  }

  function add(payload) {
    var pedido = {
      numero: nextNumero(),
      data: payload.data,
      naturezaOperacaoCodigo: payload.naturezaOperacaoCodigo || null,
      naturezaOperacaoDescricao: payload.naturezaOperacaoDescricao || '',
      clienteCodigo: payload.clienteCodigo || null,
      clienteNome: payload.clienteNome,
      clienteDocumento: payload.clienteDocumento || '',
      clienteIe: payload.clienteIe || '',
      clienteTelefone: payload.clienteTelefone || '',
      clienteEndereco: payload.clienteEndereco || '',
      modalidade: payload.modalidade,
      produtoSku: payload.produtoSku,
      produtoNome: payload.produtoNome,
      produtoUnidadeLegado: payload.produtoUnidadeLegado || '',
      unidadeCodigo: payload.unidadeCodigo || '',
      depositoNome: payload.modalidade === 'estoque' ? (payload.depositoNome || null) : null,
      quantidade: payload.quantidade,
      pesoPorUnidade: payload.pesoPorUnidade,
      totalKg: payload.totalKg,
      precoUnitario: payload.precoUnitario,
      valorBruto: payload.valorBruto,
      desconto: payload.desconto || 0,
      valorLiquido: payload.valorLiquido,
      condicaoPagamento: payload.condicaoPagamento,
      formaRecebimentoCodigo: payload.formaRecebimentoCodigo || null,
      formaRecebimentoNome: payload.formaRecebimentoNome || null,
      contaEntradaCodigo: payload.contaEntradaCodigo || null,
      contaEntradaNome: payload.contaEntradaNome || null,
      dataRecebimento: payload.dataRecebimento || null,
      formaCobrancaCodigo: payload.formaCobrancaCodigo || null,
      formaCobrancaNome: payload.formaCobrancaNome || null,
      numeroParcelas: payload.numeroParcelas || null,
      parcelas: payload.parcelas || [],
      transportadoraCodigo: payload.transportadoraCodigo || null,
      transportadoraNome: payload.transportadoraNome || null,
      veiculoPlaca: payload.veiculoPlaca || null,
      motorista: payload.motorista || null,
      observacao: payload.observacao || '',
      tipo: payload.modalidade === 'futura' ? 'venda-futura' : 'venda',
      status: 'pendente-nfe',
      numeroNotaFiscal: null,
      criadoEm: new Date().toISOString(),
      integracaoEstoqueConcluida: false,
      integracaoFinanceiroConcluida: false
    };

    // Estoque: baixa simulada automática quando aplicável (modalidade
    // 'estoque') — este protótipo não tem uma baixa real cruzando com
    // estoque.js (módulo sem estado exposto no `window`, ver nota de
    // desenvolvimento em novo-pedido-venda.js), então "concluído" aqui é o
    // reflexo de que a operação de baixa É aplicável e o pedido assume que
    // ela ocorreu no momento da venda.
    if (INTEGRACAO_APLICAVEL.estoque(pedido)) pedido.integracaoEstoqueConcluida = true;

    pedido.integracaoFinanceiroConcluida = lancarFinanceiro(pedido);

    PEDIDOS.push(pedido);
    writeSession();
    return pedido;
  }

  // ---------- Nova Remessa (Vendas > Pedidos de venda > Novo documento >
  // Nova remessa) — envio de produção pra silo/cooperativa/armazém, nunca
  // tratada como Pedido de Venda pra fins financeiros/estoque:
  //   - Financeiro: nunca gera Conta a Receber (ver `INTEGRACAO_APLICAVEL.
  //     financeiro` acima, que já resolve `nao-aplica` pra `tipo:'remessa'`)
  //     — `lancarFinanceiro()` nunca é chamado aqui.
  //   - Estoque: não é alterado no envio — `modalidade:'remessa'` (nunca
  //     'estoque') já faz `INTEGRACAO_APLICAVEL.estoque` resolver pra
  //     `nao-aplica` de graça, sem precisar de um caso especial. O fluxo
  //     futuro (silo informa a quantidade líquida recebida → sistema
  //     registra a entrada no Estoque) NÃO é implementado aqui — a estrutura
  //     só é mantida pronta pra isso (mesmos campos de produto/quantidade/
  //     unidade de um pedido normal).
  // Reaproveita os MESMOS nomes de campo de um pedido de venda (precoUnitario/
  // valorBruto/valorLiquido guardam o valor FISCAL unitário/total da remessa,
  // não um preço de venda) — evita duplicar schema, e mantém `emitirNfe()`/
  // `dadosNfeFaltantes()` funcionando sem nenhuma mudança (a ausência de
  // condição de pagamento numa remessa já força, corretamente, o caminho de
  // revisão manual em Nova Nota Fiscal ao invés de emissão automática).
  function addRemessa(payload) {
    var pedido = {
      numero: nextNumero(),
      data: payload.data,
      naturezaOperacaoCodigo: payload.naturezaOperacaoCodigo || null,
      naturezaOperacaoDescricao: payload.naturezaOperacaoDescricao || '',
      clienteCodigo: payload.clienteCodigo || null,
      clienteNome: payload.clienteNome,
      clienteDocumento: payload.clienteDocumento || '',
      clienteIe: payload.clienteIe || '',
      clienteTelefone: payload.clienteTelefone || '',
      clienteEndereco: payload.clienteEndereco || '',
      modalidade: 'remessa',
      produtoSku: payload.produtoSku,
      produtoNome: payload.produtoNome,
      produtoUnidadeLegado: payload.produtoUnidadeLegado || '',
      unidadeCodigo: payload.unidadeCodigo || '',
      depositoNome: null,
      quantidade: payload.quantidade,
      pesoPorUnidade: payload.pesoPorUnidade != null ? payload.pesoPorUnidade : null,
      totalKg: payload.totalKg != null ? payload.totalKg : null,
      precoUnitario: payload.valorFiscalUnitario || 0,
      valorBruto: payload.valorFiscalTotal || 0,
      desconto: 0,
      valorLiquido: payload.valorFiscalTotal || 0,
      condicaoPagamento: null,
      formaRecebimentoCodigo: null, formaRecebimentoNome: null,
      contaEntradaCodigo: null, contaEntradaNome: null, dataRecebimento: null,
      formaCobrancaCodigo: null, formaCobrancaNome: null, numeroParcelas: null, parcelas: [],
      transportadoraCodigo: payload.transportadoraCodigo || null,
      transportadoraNome: payload.transportadoraNome || null,
      veiculoPlaca: payload.veiculoPlaca || null,
      motorista: payload.motorista || null,
      observacao: payload.observacao || '',
      tipo: 'remessa',
      status: 'pendente-nfe',
      numeroNotaFiscal: null,
      criadoEm: new Date().toISOString(),
      integracaoEstoqueConcluida: false,
      integracaoFinanceiroConcluida: false
    };
    PEDIDOS.push(pedido);
    writeSession();
    return pedido;
  }

  function cancelar(numero) {
    var pedido = findByNumero(numero);
    if (!pedido) return null;
    pedido.status = 'cancelado';
    writeSession();
    return pedido;
  }

  function marcarNfeEmitida(numero, numeroNotaFiscal) {
    var pedido = findByNumero(numero);
    if (!pedido) return null;
    pedido.numeroNotaFiscal = numeroNotaFiscal;
    pedido.status = pedido.transportadoraNome ? 'aguardando-entrega' : 'nfe-emitida';
    writeSession();
    return pedido;
  }

  // ---------- Emissão direta de NF-e a partir do pedido (modal "Emitir
  // nota fiscal?" de pedidos-de-venda.js/pedido-venda-detalhe.js) — deriva
  // os dados que a NF-e exige a partir do que o pedido JÁ TEM, nunca pede
  // de novo pro usuário. Nenhuma regra fiscal nova é inventada aqui: são
  // conversões 1:1 entre vocabulários já existentes no sistema (ex. "Pix"
  // do Pedido vira "pix" da NF-e) ou heurísticas já usadas em qualquer
  // nota fiscal real (CFOP interno × interestadual, pela UF do
  // destinatário × emitente). Só quando um dado genuinamente não existe
  // (ex. UF do cliente indeterminável a partir do endereço em texto livre)
  // é que a emissão vira exceção — ver `dadosNfeFaltantes()`, consumida
  // pelas telas pra decidir entre emitir direto ou mandar o usuário revisar
  // em Nova Nota Fiscal (único lugar com um formulário fiscal completo). */
  var MEIO_PAGAMENTO_MAP = {
    PIX: 'pix', DINHEIRO: 'dinheiro', TRANSFERENCIA: 'transferencia',
    BOLETO: 'boleto', PIX_FUTURO: 'pix', TRANSFERENCIA_FUTURA: 'transferencia', A_RECEBER: 'a-prazo'
  };

  function resolverMeioPagamento(pedido) {
    var codigo = pedido.condicaoPagamento === 'avista' ? pedido.formaRecebimentoCodigo : pedido.formaCobrancaCodigo;
    return MEIO_PAGAMENTO_MAP[codigo] || null;
  }

  function extrairUf(texto) {
    var match = /\/\s*([A-Z]{2})\b/.exec(texto || '');
    return match ? match[1] : null;
  }

  // CFOP interno (mesmo estado) × interestadual — mesma distinção que
  // determina esse CFOP numa nota fiscal real, não uma regra inventada
  // pra este protótipo.
  function resolverNaturezaNfe(pedido) {
    var ufCliente = extrairUf(pedido.clienteEndereco);
    if (!ufCliente) return null;
    var ufEmitente = null;
    try { ufEmitente = extrairUf(window.NiveloEmitente.getEmitente().endereco); } catch (e) {}
    if (!ufEmitente) return null;
    var tipoOperacao = ufCliente === ufEmitente ? 'venda-dentro-estado' : 'venda-fora-estado';
    var natureza = null;
    try { natureza = window.NiveloNaturezaOperacao.findByTipoOperacao(tipoOperacao); } catch (e) { natureza = null; }
    return natureza ? { tipoOperacao: natureza.tipoOperacao, cfop: natureza.cfop, uf: ufCliente } : null;
  }

  // Lista (vazia = pronto pra emitir) do que falta pro pedido ter todos os
  // dados obrigatórios de uma NF-e de saída — mesmos campos exigidos pelo
  // formulário de Nova Nota Fiscal (`nova-nota-fiscal.js`'s `runValidation`).
  // Certificado Digital NÃO entra aqui (é um pré-requisito de conta, não um
  // dado do pedido) — checado à parte, com seu próprio diálogo já existente.
  function dadosNfeFaltantes(pedido) {
    var faltando = [];
    if (!pedido.clienteNome || !pedido.clienteDocumento) faltando.push('Dados do cliente/destinatário');
    if (!pedido.produtoSku || !(pedido.quantidade > 0) || !(pedido.precoUnitario > 0)) faltando.push('Produto, quantidade ou preço');
    if (!resolverMeioPagamento(pedido)) faltando.push('Meio de pagamento');
    if (!primeiraCategoriaReceita()) faltando.push('Categoria financeira de receita cadastrada');
    if (!resolverNaturezaNfe(pedido)) faltando.push('Natureza da operação (UF do cliente)');
    return faltando;
  }

  function montarPayloadNfe(pedido) {
    var natureza = resolverNaturezaNfe(pedido);
    return {
      dataEmissao: new Date().toISOString().slice(0, 10),
      clienteNome: pedido.clienteNome,
      clienteDocumento: pedido.clienteDocumento,
      uf: natureza ? natureza.uf : '',
      valor: pedido.valorLiquido,
      itens: [{ produtoNome: pedido.produtoNome, sku: pedido.produtoSku, unidade: pedido.produtoUnidadeLegado, quantidade: pedido.quantidade, preco: pedido.precoUnitario }],
      meioPagamento: resolverMeioPagamento(pedido),
      categoriaCodigo: primeiraCategoriaReceita(),
      transportadoraNome: pedido.transportadoraNome || null,
      observacao: pedido.observacao || '',
      tipoOperacao: natureza ? natureza.tipoOperacao : null,
      cfop: natureza ? natureza.cfop : null,
      origem: pedido.tipo === 'remessa' ? 'remessa' : 'venda'
    };
  }

  // Emite de verdade (chama `NiveloNotasFiscais.add()`), vincula ao pedido
  // (`marcarNfeEmitida`) e replica a mesma integração best-effort com
  // Contas a Receber V2 que o formulário de Nova Nota Fiscal já faz.
  // Assume que `dadosNfeFaltantes(pedido)` já voltou vazio E que o
  // Certificado Digital já foi checado pela tela chamadora.
  function emitirNfe(pedido) {
    if (!window.NiveloNotasFiscais) return null;
    var payload = montarPayloadNfe(pedido);
    var notaCriada = window.NiveloNotasFiscais.add(payload);
    if (window.NiveloContasReceberV2) {
      try { window.NiveloContasReceberV2.addFromNotaFiscal(notaCriada); } catch (e) {}
    }
    marcarNfeEmitida(pedido.numero, notaCriada.numero);
    return notaCriada;
  }

  return {
    list: list,
    findByNumero: findByNumero,
    nextNumero: nextNumero,
    add: add,
    addRemessa: addRemessa,
    cancelar: cancelar,
    marcarNfeEmitida: marcarNfeEmitida,
    integracoesDoPedido: integracoesDoPedido,
    dadosNfeFaltantes: dadosNfeFaltantes,
    emitirNfe: emitirNfe
  };
})();
