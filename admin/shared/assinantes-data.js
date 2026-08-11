/*
 * Catálogo de Assinantes do BACKOFFICE (admin) — clientes que possuem ou já possuíram uma
 * assinatura. Consome `window.NiveloAdminPlanos` (planos-data.js) como fonte de plano/preço —
 * nunca duplica nome/valor de plano aqui, só guarda o `planoId`.
 * Mesma convenção IIFE em memória (sem localStorage) já usada em `planos-data.js`/
 * `usuarios-data.js` — nenhuma alteração sobrevive a um reload da página.
 */
window.NiveloAssinantes = (function () {
  'use strict';

  var TODAY = '2026-08-10';

  // Situação: enum fechado, só os 4 valores efetivamente definidos no sistema (pedido explícito).
  var SITUACAO_LABELS = { teste: 'Em teste', assinante: 'Assinante', suspenso: 'Suspenso', cancelado: 'Cancelado' };
  var ACESSO_LABELS = { ativo: 'Ativo', bloqueado: 'Bloqueado' };

  function addDias(iso, dias) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  function addMeses(iso, meses) {
    var d = new Date(iso + 'T00:00:00');
    var dia = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + meses);
    var ultimoDiaMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(dia, ultimoDiaMes));
    return d.toISOString().slice(0, 10);
  }

  function diffDias(isoA, isoB) {
    var a = new Date(isoA + 'T00:00:00');
    var b = new Date(isoB + 'T00:00:00');
    return Math.round((a - b) / 86400000);
  }

  var ASSINANTES = [
    {
      id: 1,
      nome: 'Roberto Carlos Andrade',
      email: 'roberto.andrade@fazendaandrade.com.br',
      telefone: '+55 (49) 99911-2233',
      planoId: 'gestao-completa-whatsapp',
      formaContratacao: 'anual',
      situacao: 'assinante',
      acesso: 'ativo',
      dataCadastro: '2025-01-14',
      dataInicioAssinatura: '2026-01-14',
      dataVencimento: '2027-01-14',
      trial: null,
      tokensConsumidos: 18420,
      ultimoAcesso: '2026-08-09T18:42:00',
      cupom: { codigo: 'NIVELO20', afiliado: 'Consultoria AgroMax', dataUso: '2026-01-14' },
      pagamentos: [
        { data: '2026-01-14', valor: 1910.40, status: 'pago', descricao: 'Renovação anual — Gestão Completa + WhatsApp' }
      ],
      historico: [
        { data: '2026-01-14T09:00:00', evento: 'assinatura-criada', detalhe: 'Assinatura anual criada via checkout.', responsavel: 'Sistema' },
        { data: '2026-01-14T09:01:00', evento: 'pagamento-realizado', detalhe: 'Pagamento de R$ 1.910,40 confirmado.', responsavel: 'Sistema' }
      ]
    },
    {
      id: 2,
      nome: 'Fernanda Beatriz Lopes',
      email: 'fernanda.lopes@gmail.com',
      telefone: '+55 (11) 98877-4455',
      planoId: 'fiscal',
      formaContratacao: 'mensal',
      situacao: 'teste',
      acesso: 'ativo',
      dataCadastro: '2026-08-05',
      dataInicioAssinatura: null,
      dataVencimento: null,
      trial: { dataInicio: '2026-08-05', diasPadrao: 7, diasManuais: 0, dataFim: '2026-08-12' },
      tokensConsumidos: 640,
      ultimoAcesso: '2026-08-10T08:15:00',
      cupom: null,
      pagamentos: [],
      historico: [
        { data: '2026-08-05T10:20:00', evento: 'assinatura-criada', detalhe: 'Período de teste gratuito iniciado (7 dias).', responsavel: 'Sistema' }
      ]
    },
    {
      id: 3,
      nome: 'Marcelo Henrique Duarte',
      email: 'marcelo.duarte@duartegrupo.com.br',
      telefone: '+55 (67) 99922-6611',
      planoId: 'fiscal-whatsapp',
      formaContratacao: 'mensal',
      situacao: 'assinante',
      acesso: 'bloqueado',
      dataCadastro: '2025-11-02',
      dataInicioAssinatura: '2025-11-02',
      dataVencimento: '2026-09-02',
      trial: null,
      tokensConsumidos: 5310,
      ultimoAcesso: '2026-07-28T14:05:00',
      cupom: null,
      pagamentos: [
        { data: '2026-07-02', valor: 99.00, status: 'pago', descricao: 'Mensalidade — Fiscal + WhatsApp' },
        { data: '2026-06-02', valor: 99.00, status: 'pago', descricao: 'Mensalidade — Fiscal + WhatsApp' }
      ],
      historico: [
        { data: '2025-11-02T09:00:00', evento: 'assinatura-criada', detalhe: 'Assinatura mensal criada via checkout.', responsavel: 'Sistema' },
        { data: '2026-08-01T16:40:00', evento: 'cliente-bloqueado', detalhe: 'Acesso bloqueado manualmente a pedido do time de Suporte.', responsavel: 'Ana Paula Rodrigues' }
      ]
    },
    {
      id: 4,
      nome: 'Juliana Prado Camargo',
      email: 'juliana.camargo@camargoagro.com.br',
      telefone: '+55 (16) 98833-1199',
      planoId: 'gestao-completa',
      formaContratacao: 'mensal',
      situacao: 'suspenso',
      acesso: 'bloqueado',
      dataCadastro: '2025-09-20',
      dataInicioAssinatura: '2025-09-20',
      dataVencimento: '2026-07-20',
      trial: null,
      tokensConsumidos: 12040,
      ultimoAcesso: '2026-07-18T11:30:00',
      cupom: null,
      pagamentos: [
        { data: '2026-06-20', valor: 169.00, status: 'pago', descricao: 'Mensalidade — Gestão Completa' },
        { data: '2026-07-20', valor: 169.00, status: 'pendente', descricao: 'Mensalidade — Gestão Completa' }
      ],
      historico: [
        { data: '2025-09-20T09:00:00', evento: 'assinatura-criada', detalhe: 'Assinatura mensal criada via checkout.', responsavel: 'Sistema' },
        { data: '2026-07-25T03:00:00', evento: 'pagamento-pendente', detalhe: 'Cobrança de R$ 169,00 não identificada.', responsavel: 'Sistema' },
        { data: '2026-07-28T03:00:00', evento: 'assinatura-suspensa', detalhe: 'Assinatura suspensa automaticamente por inadimplência.', responsavel: 'Sistema' }
      ]
    },
    {
      id: 5,
      nome: 'Cerealista Bom Grão S.A.',
      email: 'financeiro@bomgrao.com.br',
      telefone: '+55 (44) 3255-8800',
      planoId: 'fiscal',
      formaContratacao: 'mensal',
      situacao: 'cancelado',
      acesso: 'bloqueado',
      dataCadastro: '2025-03-10',
      dataInicioAssinatura: '2025-03-10',
      dataVencimento: '2026-05-10',
      trial: null,
      tokensConsumidos: 2870,
      ultimoAcesso: '2026-05-09T09:00:00',
      cupom: null,
      pagamentos: [
        { data: '2026-04-10', valor: 29.90, status: 'pago', descricao: 'Mensalidade — Fiscal' }
      ],
      historico: [
        { data: '2025-03-10T09:00:00', evento: 'assinatura-criada', detalhe: 'Assinatura mensal criada via checkout.', responsavel: 'Sistema' },
        { data: '2026-05-10T15:20:00', evento: 'assinatura-cancelada', detalhe: 'Cliente cancelou a assinatura pelo autoatendimento.', responsavel: 'Cliente' }
      ]
    },
    {
      id: 6,
      nome: 'Diego Almeida Ferreira',
      email: 'diego.ferreira@ferreiraagropecuaria.com.br',
      telefone: '+55 (62) 99944-7722',
      planoId: 'fiscal-whatsapp',
      formaContratacao: 'anual',
      situacao: 'assinante',
      acesso: 'ativo',
      dataCadastro: '2026-01-20',
      dataInicioAssinatura: '2026-01-20',
      dataVencimento: '2027-01-20',
      trial: null,
      tokensConsumidos: 9150,
      ultimoAcesso: '2026-08-10T07:55:00',
      cupom: null,
      pagamentos: [
        { data: '2026-01-20', valor: 950.40, status: 'pago', descricao: 'Assinatura anual — Fiscal + WhatsApp' }
      ],
      historico: [
        { data: '2026-01-20T09:00:00', evento: 'assinatura-criada', detalhe: 'Assinatura anual criada via checkout.', responsavel: 'Sistema' }
      ]
    }
  ];

  function list() {
    return ASSINANTES.slice();
  }

  function findById(id) {
    var num = Number(id);
    for (var i = 0; i < ASSINANTES.length; i++) {
      if (ASSINANTES[i].id === num) return ASSINANTES[i];
    }
    return null;
  }

  function plano(assinante) {
    return window.NiveloAdminPlanos ? window.NiveloAdminPlanos.findById(assinante.planoId) : null;
  }

  function diasRestantesTeste(assinante) {
    if (!assinante.trial) return null;
    var restantes = diffDias(assinante.trial.dataFim, TODAY);
    return Math.max(0, restantes);
  }

  function registrarEvento(assinante, evento, detalhe, responsavel) {
    assinante.historico.push({ data: TODAY + 'T' + new Date().toISOString().slice(11, 19), evento: evento, detalhe: detalhe, responsavel: responsavel || 'Administrador' });
  }

  /* Motivo é opcional (pedido explícito) — quando informado, fica salvo junto ao próprio
     registro do bloqueio no histórico da assinatura; quando não, o bloqueio ocorre normalmente
     sem nenhuma menção a motivo. */
  function bloquear(id, responsavel, motivo) {
    var a = findById(id);
    if (!a || a.acesso === 'bloqueado') return a;
    a.acesso = 'bloqueado';
    var detalhe = 'Acesso bloqueado manualmente pelo administrador.';
    if (motivo) detalhe += ' Motivo: ' + motivo;
    registrarEvento(a, 'cliente-bloqueado', detalhe, responsavel);
    return a;
  }

  function liberar(id, responsavel) {
    var a = findById(id);
    if (!a || a.acesso === 'ativo') return a;
    a.acesso = 'ativo';
    registrarEvento(a, 'cliente-liberado', 'Acesso liberado manualmente pelo administrador.', responsavel);
    return a;
  }

  function alterarPlano(id, novoPlanoId, responsavel) {
    var a = findById(id);
    if (!a) return null;
    var planoAntigo = plano(a);
    a.planoId = novoPlanoId;
    var planoNovo = plano(a);
    registrarEvento(
      a,
      'plano-alterado',
      'Plano alterado de "' + (planoAntigo ? planoAntigo.nome : '—') + '" para "' + (planoNovo ? planoNovo.nome : '—') + '".',
      responsavel
    );
    return a;
  }

  /* Concede dias gratuitos individuais — nunca altera a quantidade padrão do sistema (regra
     explícita). Se o cliente está em teste, soma em `trial.diasManuais` e empurra `dataFim`;
     se já é assinante pago, empurra `dataVencimento` direto (operação comercial). */
  function concederDiasGratuitos(id, dias, responsavel) {
    var a = findById(id);
    if (!a || !dias || dias <= 0) return a;
    if (a.trial) {
      a.trial.diasManuais += dias;
      a.trial.dataFim = addDias(a.trial.dataFim, dias);
    } else {
      a.dataVencimento = addDias(a.dataVencimento, dias);
    }
    registrarEvento(a, 'dias-gratuitos-concedidos', dias + ' dia(s) gratuito(s) concedido(s) individualmente.', responsavel);
    return a;
  }

  /* Upgrade por link de pagamento: NÃO reinicia o período anual — a data de renovação
     original permanece a mesma, só o valor cobrado é proporcional ao período restante.
     Cliente em período de TESTE nunca teve uma assinatura paga ativa pra prorratear —
     nesse caso o link é sempre pelo valor cheio do plano escolhido (é uma contratação nova,
     não um upgrade), sem período restante/próxima renovação (regra de negócio, não um valor
     "não disponível" por falta de dado). `isTrial:true` sinaliza esse caso pra UI mostrar
     "N/A" em vez de tentar calcular (a causa raiz do bug de NaN reportado era exatamente essa:
     `diffDias(a.dataVencimento, TODAY)` com `dataVencimento=null` durante o teste). */
  function calcularProrateamentoUpgrade(id, novoPlanoId) {
    var a = findById(id);
    if (!a || !window.NiveloAdminPlanos) return null;
    var planoAtual = plano(a);
    var planoNovo = window.NiveloAdminPlanos.findById(novoPlanoId);
    if (!planoNovo) return null;

    if (a.situacao === 'teste' || !a.dataVencimento) {
      return {
        planoAtual: planoAtual,
        planoNovo: planoNovo,
        isTrial: true,
        diasRestantes: null,
        mesesRestantes: null,
        valorProporcional: planoNovo.valorAnual,
        proximaRenovacao: null
      };
    }
    if (!planoAtual) return null;

    var diasRestantesTotal = Math.max(0, diffDias(a.dataVencimento, TODAY));
    var mesesRestantes = Math.max(0, Math.round((diasRestantesTotal / 365) * 12 * 10) / 10);
    var diferencaAnual = planoNovo.valorAnual - planoAtual.valorAnual;
    var valorProporcional = Math.max(0, Math.round((diferencaAnual / 12) * mesesRestantes * 100) / 100);

    return {
      planoAtual: planoAtual,
      planoNovo: planoNovo,
      isTrial: false,
      diasRestantes: diasRestantesTotal,
      mesesRestantes: mesesRestantes,
      valorProporcional: valorProporcional,
      proximaRenovacao: a.dataVencimento
    };
  }

  function gerarLinkPagamento(id, novoPlanoId, valorFinal, ajustadoManualmente, responsavel) {
    var a = findById(id);
    if (!a) return null;
    var planoNovo = window.NiveloAdminPlanos ? window.NiveloAdminPlanos.findById(novoPlanoId) : null;
    var link = 'https://pagamento.nivelo.com.br/link/' + a.id + '-' + Date.now().toString(36);
    // Hora real do clique combinada com a data de referência fixa do protótipo (mesma
    // convenção já usada em `registrarEvento`) — o link expira 24h após a geração.
    var horaAtual = new Date().toISOString().slice(11, 19);
    var geradoEm = TODAY + 'T' + horaAtual;
    var expiraEm = addDias(TODAY, 1) + 'T' + horaAtual;
    var linkPagamentoAtivo = { link: link, planoNovo: planoNovo, valorFinal: valorFinal, geradoEm: geradoEm, expiraEm: expiraEm };
    a.linkPagamentoAtivo = linkPagamentoAtivo;
    registrarEvento(
      a,
      'upgrade-realizado',
      'Link de pagamento gerado para upgrade para "' + (planoNovo ? planoNovo.nome : '—') + '", valor final R$ ' +
        valorFinal.toFixed(2).replace('.', ',') + (ajustadoManualmente ? ' (ajustado manualmente)' : '') + '.',
      responsavel
    );
    return linkPagamentoAtivo;
  }

  return {
    TODAY: TODAY,
    SITUACAO_LABELS: SITUACAO_LABELS,
    ACESSO_LABELS: ACESSO_LABELS,
    list: list,
    findById: findById,
    plano: plano,
    diasRestantesTeste: diasRestantesTeste,
    bloquear: bloquear,
    liberar: liberar,
    alterarPlano: alterarPlano,
    concederDiasGratuitos: concederDiasGratuitos,
    calcularProrateamentoUpgrade: calcularProrateamentoUpgrade,
    gerarLinkPagamento: gerarLinkPagamento,
    addDias: addDias,
    addMeses: addMeses,
    diffDias: diffDias
  };
})();
