/*
 * Histórico de Pagamentos (Backoffice > Assinantes > Histórico) — extrato financeiro geral do
 * sistema, cobrindo os pagamentos/movimentações de TODOS os clientes. Fonte única de verdade:
 * a tela de detalhe do assinante (`assinante-detalhe.html`, seção "Pagamentos") linka pra esta
 * mesma base via "Ver histórico completo", em vez de manter um segundo catálogo de pagamentos.
 * Consome `window.NiveloAssinantes` (cliente/e-mail) e `window.NiveloAdminPlanos` (nome do
 * plano) — nunca duplica esses dados aqui, só guarda `assinanteId`/`planoId`.
 * Mesma convenção IIFE em memória (sem localStorage) já usada em `assinantes-data.js`.
 */
window.NiveloPagamentos = (function () {
  'use strict';

  var TODAY = '2026-08-10';

  // Enum fechado — só os status efetivamente previstos no sistema (pedido explícito).
  var STATUS_LABELS = {
    pago: 'Pago',
    pendente: 'Pendente',
    atraso: 'Em atraso',
    falhou: 'Falhou',
    cancelado: 'Cancelado'
  };
  var STATUS_BADGE = {
    pago: 'success',
    pendente: 'info',
    atraso: 'warning',
    falhou: 'error',
    cancelado: 'error'
  };
  var TIPO_LABELS = {
    assinatura: 'Assinatura',
    renovacao: 'Renovação',
    upgrade: 'Upgrade de plano'
  };

  var PAGAMENTOS = [
    {
      id: 'PAG-0001', assinanteId: 1, data: '2026-01-14', tipoCobranca: 'assinatura', planoId: 'gestao-completa-whatsapp',
      valorOriginal: 2388.00, cupomCodigo: 'NIVELO20', afiliado: 'Consultoria AgroMax', valorDesconto: 477.60, valorFinal: 1910.40,
      status: 'pago', formaPagamento: 'Cartão de crédito', transacaoId: 'TXN-88201', dataPagamento: '2026-01-14', dataVencimento: null, notaFiscalNumero: 'NF-000101'
    },
    {
      id: 'PAG-0002', assinanteId: 3, data: '2026-06-02', tipoCobranca: 'assinatura', planoId: 'fiscal-whatsapp',
      valorOriginal: 99.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 99.00,
      status: 'pago', formaPagamento: 'Boleto', transacaoId: 'TXN-88202', dataPagamento: '2026-06-03', dataVencimento: '2026-06-02', notaFiscalNumero: 'NF-000102'
    },
    {
      id: 'PAG-0003', assinanteId: 3, data: '2026-07-02', tipoCobranca: 'renovacao', planoId: 'fiscal-whatsapp',
      valorOriginal: 99.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 99.00,
      status: 'pago', formaPagamento: 'Boleto', transacaoId: 'TXN-88203', dataPagamento: '2026-07-02', dataVencimento: '2026-07-02', notaFiscalNumero: 'NF-000103'
    },
    {
      id: 'PAG-0004', assinanteId: 4, data: '2026-06-20', tipoCobranca: 'renovacao', planoId: 'gestao-completa',
      valorOriginal: 169.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 169.00,
      status: 'pago', formaPagamento: 'PIX', transacaoId: 'TXN-88204', dataPagamento: '2026-06-20', dataVencimento: '2026-06-20', notaFiscalNumero: 'NF-000104'
    },
    {
      id: 'PAG-0005', assinanteId: 4, data: '2026-07-20', tipoCobranca: 'renovacao', planoId: 'gestao-completa',
      valorOriginal: 169.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 169.00,
      status: 'atraso', formaPagamento: null, transacaoId: null, dataPagamento: null, dataVencimento: '2026-07-20', notaFiscalNumero: null
    },
    {
      id: 'PAG-0006', assinanteId: 5, data: '2026-04-10', tipoCobranca: 'assinatura', planoId: 'fiscal',
      valorOriginal: 29.90, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 29.90,
      status: 'pago', formaPagamento: 'Boleto', transacaoId: 'TXN-88206', dataPagamento: '2026-04-10', dataVencimento: '2026-04-10', notaFiscalNumero: 'NF-000106'
    },
    {
      id: 'PAG-0007', assinanteId: 5, data: '2026-05-10', tipoCobranca: 'renovacao', planoId: 'fiscal',
      valorOriginal: 29.90, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 29.90,
      status: 'cancelado', formaPagamento: null, transacaoId: null, dataPagamento: null, dataVencimento: '2026-05-10', notaFiscalNumero: null
    },
    {
      id: 'PAG-0008', assinanteId: 6, data: '2026-01-20', tipoCobranca: 'assinatura', planoId: 'fiscal-whatsapp',
      valorOriginal: 950.40, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 950.40,
      status: 'pago', formaPagamento: 'Cartão de crédito', transacaoId: 'TXN-88208', dataPagamento: '2026-01-20', dataVencimento: null, notaFiscalNumero: 'NF-000108'
    },
    {
      id: 'PAG-0009', assinanteId: 3, data: '2026-08-02', tipoCobranca: 'renovacao', planoId: 'fiscal-whatsapp',
      valorOriginal: 99.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 99.00,
      status: 'pendente', formaPagamento: null, transacaoId: null, dataPagamento: null, dataVencimento: '2026-08-02', notaFiscalNumero: null
    },
    {
      id: 'PAG-0010', assinanteId: 6, data: '2026-08-04', tipoCobranca: 'upgrade', planoId: 'gestao-completa',
      valorOriginal: 300.00, cupomCodigo: 'NIVELO10', afiliado: 'Comercial Nivelo', valorDesconto: 30.00, valorFinal: 270.00,
      status: 'pago', formaPagamento: 'Cartão de crédito', transacaoId: 'TXN-88210', dataPagamento: '2026-08-04', dataVencimento: null, notaFiscalNumero: 'NF-000110'
    },
    {
      id: 'PAG-0011', assinanteId: 4, data: '2026-08-08', tipoCobranca: 'renovacao', planoId: 'gestao-completa',
      valorOriginal: 169.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 169.00,
      status: 'falhou', formaPagamento: 'Cartão de crédito', transacaoId: 'TXN-88211', dataPagamento: null, dataVencimento: '2026-08-08', notaFiscalNumero: null
    },
    {
      id: 'PAG-0012', assinanteId: 3, data: '2026-08-10', tipoCobranca: 'renovacao', planoId: 'fiscal-whatsapp',
      valorOriginal: 99.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 99.00,
      status: 'pago', formaPagamento: 'Boleto', transacaoId: 'TXN-88212', dataPagamento: '2026-08-10', dataVencimento: '2026-08-10', notaFiscalNumero: 'NF-000112'
    },
    {
      id: 'PAG-0013', assinanteId: 1, data: '2026-08-09', tipoCobranca: 'upgrade', planoId: 'gestao-completa-whatsapp',
      valorOriginal: 450.00, cupomCodigo: null, afiliado: null, valorDesconto: 0, valorFinal: 450.00,
      status: 'pendente', formaPagamento: null, transacaoId: null, dataPagamento: null, dataVencimento: '2026-08-16', notaFiscalNumero: null
    }
  ];

  function list() {
    return PAGAMENTOS.slice();
  }

  function findById(id) {
    for (var i = 0; i < PAGAMENTOS.length; i++) {
      if (PAGAMENTOS[i].id === id) return PAGAMENTOS[i];
    }
    return null;
  }

  function listByAssinante(assinanteId) {
    var num = Number(assinanteId);
    return PAGAMENTOS.filter(function (p) { return p.assinanteId === num; })
      .sort(function (a, b) { return a.data < b.data ? 1 : -1; });
  }

  function assinante(pagamento) {
    return window.NiveloAssinantes ? window.NiveloAssinantes.findById(pagamento.assinanteId) : null;
  }

  function plano(pagamento) {
    return window.NiveloAdminPlanos ? window.NiveloAdminPlanos.findById(pagamento.planoId) : null;
  }

  return {
    TODAY: TODAY,
    STATUS_LABELS: STATUS_LABELS,
    STATUS_BADGE: STATUS_BADGE,
    TIPO_LABELS: TIPO_LABELS,
    list: list,
    findById: findById,
    listByAssinante: listByAssinante,
    assinante: assinante,
    plano: plano
  };
})();
