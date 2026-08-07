/* ══════════════════════════════════════════════════════════
   window.NiveloCaixa — catálogo central dos lançamentos de Caixa
   (Financeiro > Caixa). Mesma convenção IIFE de notas-fiscais-data.js/
   categorias-financeiras-data.js — módulo próprio, consumido por
   caixa.html (listagem) e novo-lancamento-caixa.html (criação).

   Cada lançamento: {
     codigo,          // 'LC-0001' — auto-gerado, sequencial, nunca editável
     data,            // 'AAAA-MM-DD'
     historico,       // texto livre (ex.: "Venda de soja - safra 2025/26")
     pessoaNome,      // Cliente ou Fornecedor selecionado — opcional (nem todo
                      // lançamento tem uma contraparte, ex. taxas bancárias)
     pessoaDocumento, // opcional, só quando pessoaNome existe
     categoriaCodigo, // código de uma categoria (categorias-financeiras-data.js),
                      // de qualquer grupo (receita ou despesa)
     contaFinanceiraCodigo, // INT, FK -> window.NiveloContasFinanceiras
                      // (Configuração > Conta Financeira) — vínculo
                      // obrigatório de todo lançamento (pedido explícito),
                      // usado na geração do DRE. Campo aditivo (2026-08-04):
                      // os 14 lançamentos seed foram retrofitados com um
                      // código plausível conforme o `banco` de cada um.
     tipo,            // 'entrada' | 'saida' — "Saldo" não é mais um tipo de
                      // lançamento (era um valor digitado manualmente); o
                      // saldo agora é sempre CALCULADO a partir das
                      // entradas/saídas, nunca lançado à mão (ver resumo em
                      // caixa.js)
     valor,           // number, sempre positivo (o sinal é dado pelo `tipo`,
                      // nunca pelo valor em si)
     banco,           // nome da conta (bancos-data.js)
     competencia      // 'AAAA-MM' — opcional
   }

   Sem persistência entre páginas (mesma decisão já documentada em todo o
   protótipo, ver app/CLAUDE.md) — um lançamento criado em
   novo-lancamento-caixa.js só existe durante a sessão de JS daquela página. */
(function () {
  'use strict';

  // Valores de julho/2026 desenhados de propósito (2026-08-06) pra render um gráfico "Evolução
  // do resultado" (DRE/Balancete) visualmente equilibrado — dias com resultado baixo, médio e
  // alto, positivos e negativos, sem um único lançamento dominando quase toda a altura do
  // gráfico. Antes, uma única venda de soja (R$ 74.400) era ~5x maior que qualquer outro
  // lançamento do mês, deixando as demais barras praticamente invisíveis; agora o maior
  // lançamento (R$ 24.000) fica próximo dos demais lançamentos grandes (R$ 21.000/R$ 18.200/
  // R$ 17.000), e cada dia tem só 1 lançamento (entrada OU saída), gerando barras que sobem/
  // descem de verdade em vez de se cancelarem no mesmo dia.
  var LANCAMENTOS = [
    { codigo: 'LC-0001', data: '2026-06-30', historico: 'Manutenção de maquinário agrícola', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 2800, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-06' },
    { codigo: 'LC-0002', data: '2026-07-01', historico: 'Venda de trigo', pessoaNome: 'Agropecuária Central Ltda', pessoaDocumento: '55.666.777/0001-88', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 5400, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0003', data: '2026-07-02', historico: 'Compra de calcário agrícola', pessoaNome: 'Insumos Agrícolas Vale Ltda', pessoaDocumento: '12.345.678/0001-90', categoriaCodigo: 'CAT-003', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 1800, banco: 'Sicredi - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0004', data: '2026-07-03', historico: 'Venda de soja - safra 2025/26 (1ª remessa)', pessoaNome: 'Cerealista Bom Grão S.A.', pessoaDocumento: '98.765.432/0001-10', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 18200, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0005', data: '2026-07-05', historico: 'Compra de fertilizantes NPK', pessoaNome: 'Insumos Agrícolas Vale Ltda', pessoaDocumento: '12.345.678/0001-90', categoriaCodigo: 'CAT-003', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 15800, banco: 'Sicredi - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0006', data: '2026-07-06', historico: 'Venda de milho', pessoaNome: 'Maria Aparecida Souza', pessoaDocumento: '123.456.789-00', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 8300, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0007', data: '2026-07-08', historico: 'Abastecimento de tratores', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 1, tipo: 'saida', valor: 3200, banco: 'Dinheiro em caixa', competencia: '2026-07' },
    { codigo: 'LC-0008', data: '2026-07-09', historico: 'Venda de milho avulsa', pessoaNome: 'Wellington Souza Prado', pessoaDocumento: '901.234.567-09', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 3, tipo: 'entrada', valor: 4600, banco: 'Caixa Econômica Federal - Poupança', competencia: '2026-07' },
    { codigo: 'LC-0009', data: '2026-07-10', historico: 'Venda de milho', pessoaNome: 'Maria Aparecida Souza', pessoaDocumento: '123.456.789-00', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 12600, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0010', data: '2026-07-11', historico: 'Combustível para pulverizador', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 1, tipo: 'saida', valor: 2100, banco: 'Dinheiro em caixa', competencia: '2026-07' },
    { codigo: 'LC-0011', data: '2026-07-12', historico: 'Conta de energia elétrica da sede', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-005', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 1450, banco: 'Sicredi - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0012', data: '2026-07-13', historico: 'Venda de trigo avulsa', pessoaNome: 'Agropecuária Central Ltda', pessoaDocumento: '55.666.777/0001-88', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 9800, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0013', data: '2026-07-15', historico: 'Compra de sementes certificadas', pessoaNome: 'Sementes Dumont Ltda', pessoaDocumento: '89.123.456/0001-78', categoriaCodigo: 'CAT-003', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 9400, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0014', data: '2026-07-16', historico: 'Venda de soja avulsa', pessoaNome: 'Joaquina Pereira Lima', pessoaDocumento: '456.789.123-04', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 3, tipo: 'entrada', valor: 21000, banco: 'Caixa Econômica Federal - Poupança', competencia: '2026-07' },
    { codigo: 'LC-0015', data: '2026-07-18', historico: 'Tarifa de manutenção de conta', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-007', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 89, banco: 'Sicredi - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0016', data: '2026-07-19', historico: 'Combustível para caminhão', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 1, tipo: 'saida', valor: 3400, banco: 'Dinheiro em caixa', competencia: '2026-07' },
    { codigo: 'LC-0017', data: '2026-07-20', historico: 'Venda de soja avulsa', pessoaNome: 'Joaquina Pereira Lima', pessoaDocumento: '456.789.123-04', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 3, tipo: 'entrada', valor: 6600, banco: 'Caixa Econômica Federal - Poupança', competencia: '2026-07' },
    { codigo: 'LC-0018', data: '2026-07-21', historico: 'Venda de gado de descarte', pessoaNome: 'Wellington Souza Prado', pessoaDocumento: '901.234.567-09', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 17000, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0019', data: '2026-07-22', historico: 'Compra de adubo orgânico', pessoaNome: 'Adubos Cajuru S.A.', pessoaDocumento: '91.234.567/0001-89', categoriaCodigo: 'CAT-003', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 5400, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0020', data: '2026-07-25', historico: 'Impostos sobre a produção agrícola', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-006', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 2100, banco: 'Sicredi - Conta Corrente', competencia: '2026-06' },
    { codigo: 'LC-0021', data: '2026-07-26', historico: 'Venda de milho', pessoaNome: 'Maria Aparecida Souza', pessoaDocumento: '123.456.789-00', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 10200, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0022', data: '2026-07-27', historico: 'Venda de gado de descarte', pessoaNome: 'Wellington Souza Prado', pessoaDocumento: '901.234.567-09', categoriaCodigo: 'CAT-002', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 3200, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0023', data: '2026-07-28', historico: 'Tarifa de manutenção de conta', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-007', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 120, banco: 'Sicredi - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0024', data: '2026-07-29', historico: 'Combustível para colheitadeira', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 1, tipo: 'saida', valor: 4800, banco: 'Dinheiro em caixa', competencia: '2026-07' },
    { codigo: 'LC-0025', data: '2026-07-30', historico: 'Venda de soja - safra 2025/26 (2ª remessa)', pessoaNome: 'Cerealista Bom Grão S.A.', pessoaDocumento: '98.765.432/0001-10', categoriaCodigo: 'CAT-001', contaFinanceiraCodigo: 2, tipo: 'entrada', valor: 24000, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' },
    { codigo: 'LC-0026', data: '2026-07-31', historico: 'Manutenção de maquinário agrícola', pessoaNome: null, pessoaDocumento: null, categoriaCodigo: 'CAT-004', contaFinanceiraCodigo: 2, tipo: 'saida', valor: 6500, banco: 'Banco do Brasil - Conta Corrente', competencia: '2026-07' }
  ];

  function list() {
    return LANCAMENTOS;
  }

  function findByCodigo(codigo) {
    return LANCAMENTOS.filter(function (l) { return l.codigo === codigo; })[0] || null;
  }

  // Maior sufixo numérico existente + 1, zero-pad até 4 dígitos — mesmo
  // algoritmo já usado em categorias-financeiras-data.js/fazendas-data.js.
  function nextCodigo() {
    var max = 0;
    LANCAMENTOS.forEach(function (l) {
      var match = /LC-(\d+)/.exec(l.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    var next = max + 1;
    var padded = String(next);
    while (padded.length < 4) padded = '0' + padded;
    return 'LC-' + padded;
  }

  function add(payload) {
    var lancamento = {
      codigo: nextCodigo(),
      data: payload.data,
      historico: payload.historico,
      pessoaNome: payload.pessoaNome || null,
      pessoaDocumento: payload.pessoaDocumento || null,
      categoriaCodigo: payload.categoriaCodigo || null,
      contaFinanceiraCodigo: payload.contaFinanceiraCodigo || null,
      tipo: payload.tipo,
      valor: payload.valor,
      banco: payload.banco,
      competencia: payload.competencia || null
    };
    LANCAMENTOS.push(lancamento);
    return lancamento;
  }

  window.NiveloCaixa = {
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add
  };
})();
