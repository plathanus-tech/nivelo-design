/*
 * Mock da assinatura do usuário logado — consumido por Minha Conta (abas Plano/Pagamento) e
 * pelo Dashboard (avisos de renovação/vencimento). Sem backend real neste protótipo: cada
 * cenário é um mock fixo, selecionável via `#state=` (mesma convenção de todo o resto do
 * sistema, ex. contas-pagar-data.js). Data de referência fixa (nunca `new Date()` real).
 */
(function () {
  'use strict';

  var TODAY = '2026-07-31';

  function diffDias(deISO, ateISO) {
    var de = new Date(deISO + 'T00:00:00');
    var ate = new Date(ateISO + 'T00:00:00');
    return Math.round((ate - de) / 86400000);
  }

  // Cada cenário representa um estado real de assinatura que a tela precisa saber exibir.
  // `renovacaoAutomatica` só se aplica a `modalidade:'mensal'` (Anual não tem "renovação
  // automática" no sentido de cobrança recorrente — renova por um novo período inteiro).
  var CENARIOS = {
    ativo: {
      planoId: 'gestao-completa-whatsapp',
      status: 'ativo',
      modalidade: 'anual',
      dataInicio: '2026-02-15',
      dataVencimento: '2027-02-15',
      renovacaoAutomatica: true,
      historico: [
        { data: '2026-02-15', plano: 'Gestão Completa + WhatsApp', tipo: 'Anual', valor: 1910.4, status: 'Pago' }
      ]
    },
    teste: {
      planoId: 'gestao-completa-whatsapp',
      status: 'teste',
      modalidade: null,
      dataInicio: '2026-07-26',
      dataVencimento: '2026-08-02',
      renovacaoAutomatica: false,
      historico: []
    },
    mensal: {
      planoId: 'fiscal-whatsapp',
      status: 'ativo',
      modalidade: 'mensal',
      dataInicio: '2026-05-05',
      dataVencimento: '2026-08-05',
      renovacaoAutomatica: true,
      historico: [
        { data: '2026-05-05', plano: 'Fiscal + WhatsApp', tipo: 'Mensal', valor: 99, status: 'Pago' },
        { data: '2026-06-05', plano: 'Fiscal + WhatsApp', tipo: 'Mensal', valor: 99, status: 'Pago' },
        { data: '2026-07-05', plano: 'Fiscal + WhatsApp', tipo: 'Mensal', valor: 99, status: 'Pago' }
      ]
    },
    'mensal-cancelada': {
      planoId: 'fiscal-whatsapp',
      status: 'ativo',
      modalidade: 'mensal',
      dataInicio: '2026-05-05',
      dataVencimento: '2026-08-05',
      renovacaoAutomatica: false,
      historico: [
        { data: '2026-06-05', plano: 'Fiscal + WhatsApp', tipo: 'Mensal', valor: 99, status: 'Pago' },
        { data: '2026-07-05', plano: 'Fiscal + WhatsApp', tipo: 'Mensal', valor: 99, status: 'Pago' }
      ]
    },
    aguardando: {
      planoId: 'gestao-completa',
      status: 'aguardando-pagamento',
      modalidade: 'anual',
      dataInicio: '2025-08-01',
      dataVencimento: '2026-08-01',
      renovacaoAutomatica: true,
      historico: [
        { data: '2025-08-01', plano: 'Gestão Completa', tipo: 'Anual', valor: 1622.4, status: 'Pago' }
      ]
    },
    cancelado: {
      planoId: 'fiscal',
      status: 'cancelado',
      modalidade: 'mensal',
      dataInicio: '2026-04-01',
      dataVencimento: '2026-07-01',
      renovacaoAutomatica: false,
      historico: [
        { data: '2026-04-01', plano: 'Fiscal', tipo: 'Mensal', valor: 29.9, status: 'Pago' },
        { data: '2026-05-01', plano: 'Fiscal', tipo: 'Mensal', valor: 29.9, status: 'Pago' },
        { data: '2026-06-01', plano: 'Fiscal', tipo: 'Mensal', valor: 29.9, status: 'Pago' }
      ]
    },
    renovacaoproxima: {
      planoId: 'gestao-completa-whatsapp',
      status: 'ativo',
      modalidade: 'anual',
      dataInicio: '2025-08-10',
      dataVencimento: '2026-08-15',
      renovacaoAutomatica: true,
      historico: [
        { data: '2025-08-10', plano: 'Gestão Completa + WhatsApp', tipo: 'Anual', valor: 1910.4, status: 'Pago' }
      ]
    },
    vencido: {
      planoId: 'gestao-completa',
      status: 'ativo',
      modalidade: 'anual',
      dataInicio: '2025-07-01',
      dataVencimento: '2026-07-20',
      renovacaoAutomatica: true,
      historico: [
        { data: '2025-07-01', plano: 'Gestão Completa', tipo: 'Anual', valor: 1622.4, status: 'Pago' }
      ]
    }
  };

  /** Monta a assinatura de um cenário (default 'ativo') já com plano resolvido e campos derivados. */
  function getAssinatura(cenario) {
    var base = CENARIOS[cenario] || CENARIOS.ativo;
    // Cópia rasa + histórico próprio (nunca mutar o mock original entre chamadas).
    var assinatura = Object.assign({}, base, { historico: base.historico.slice() });
    assinatura.plano = window.NiveloPlanos.findById(assinatura.planoId);
    assinatura.diasParaVencer = diffDias(TODAY, assinatura.dataVencimento);
    assinatura.vencida = assinatura.status !== 'teste' && assinatura.status !== 'cancelado' && assinatura.diasParaVencer < 0;
    assinatura.diasRestantesTeste = assinatura.status === 'teste' ? Math.max(diffDias(TODAY, assinatura.dataVencimento), 0) : null;
    return assinatura;
  }

  window.NiveloAssinatura = {
    TODAY: TODAY,
    getAssinatura: getAssinatura,
    diffDias: diffDias
  };
})();
