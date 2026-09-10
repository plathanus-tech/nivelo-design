/*
 * Catálogo de planos de assinatura — visão do BACKOFFICE (admin). Superfície separada de
 * `app/shared/planos-data.js` (visão do cliente, Minha Conta/checkout), por convenção do
 * projeto (cada área tem seu próprio `shared/`, sem import cruzado) — mesmos 3 planos/nomes,
 * mantidos em sincronia manualmente.
 * Aqui só existem valores/status EDITÁVEIS pelo administrador (nunca criação/exclusão de
 * plano, regra de negócio explícita) — sem `precoAnualTotal`/`tier`/`destaque`, que são
 * conceitos só do lado do cliente.
 *
 * Preço por FAIXA DE HECTARES (2026-09-10): o valor de cada plano passou a depender também da
 * quantidade de hectares da propriedade — não existe mais um único "valor mensal"/"valor
 * anual" fixo por plano. Cada plano guarda `faixas`, um objeto com uma entrada por faixa
 * (mesmos 4 ids/labels já usados em `assinantes-data.js`, `FAIXA_HECTARES_LABELS`), cada uma
 * com só os 2 valores realmente digitados pelo administrador:
 *   - `anualMensal`: valor mensal-equivalente exibido pro cliente no plano anual.
 *   - `mensal`: valor da cobrança mensal avulsa (só existe quando `plano.cobrancaMensal` é
 *     `true` — o Fiscal não tem esse campo, é sempre só anual).
 * `anualTotal` (= anualMensal × 12) e `economia` (= mensal×12 − anualTotal) NUNCA são digitados
 * à parte: são sempre recalculados a partir desses 2 valores (`recalcularFaixa`), pra nunca
 * ficarem inconsistentes entre si — única fonte de verdade dos preços deste sistema.
 * `valorMensal`/`valorAnual` (no nível do plano, não da faixa) continuam existindo só por
 * COMPATIBILIDADE com outras telas que ainda não são "cientes" de faixa de hectares
 * (`assinantes.js`/`assinante-detalhe.js`: dropdowns de troca de plano e prorateamento de
 * upgrade; `historico-pagamentos.js`: só usa nome; `pagamentos-data.js`: só usa nome) — nunca
 * editados diretamente, sempre espelham a faixa "Até 100 hectares" (`sincronizarCompat`).
 */
(function () {
  'use strict';

  var TODAY = '2026-08-10';

  // Mesmos ids/labels de `assinantes-data.js` (`FAIXA_HECTARES_LABELS`) — arquivo próprio
  // (sem import cruzado, convenção do projeto), só a mesma convenção de nomes.
  var FAIXA_IDS = ['ate-100', '101-200', '201-300', 'acima-300'];
  var FAIXA_LABELS = {
    'ate-100': 'Até 100 hectares',
    '101-200': '101 a 200 hectares',
    '201-300': '201 a 300 hectares',
    'acima-300': 'Acima de 300 hectares'
  };

  function round2(valor) {
    return Math.round(valor * 100) / 100;
  }

  /* Único lugar onde `anualTotal`/`economia` são calculados — nunca gravados por fora disso,
     pra nunca divergirem dos 2 valores-fonte (`anualMensal`/`mensal`). */
  function recalcularFaixa(faixa) {
    faixa.anualTotal = round2(faixa.anualMensal * 12);
    if (typeof faixa.mensal === 'number') {
      faixa.economia = round2(faixa.mensal * 12 - faixa.anualTotal);
    } else {
      delete faixa.economia;
    }
    return faixa;
  }

  /* `valorMensal`/`valorAnual` do plano (não da faixa) espelham sempre a faixa "Até 100
     hectares" — mantidos só pra não quebrar telas que ainda consomem um preço único por
     plano (ver comentário no topo do arquivo). */
  function sincronizarCompat(plano) {
    var base = plano.faixas['ate-100'];
    plano.valorAnual = base.anualTotal;
    plano.valorMensal = (typeof base.mensal === 'number') ? base.mensal : base.anualMensal;
  }

  var PLANOS = [
    {
      id: 'fiscal',
      nome: 'Fiscal',
      descricao: 'Ideal para quem precisa emitir notas fiscais e organizar sua operação fiscal.',
      // Regra de negócio explícita: o Fiscal nunca tem opção de cobrança mensal, só anual.
      cobrancaMensal: false,
      faixas: {
        'ate-100': { anualMensal: 14.90 },
        '101-200': { anualMensal: 21.90 },
        '201-300': { anualMensal: 31.90 },
        'acima-300': { anualMensal: 46.90 }
      },
      beneficios: [
        'Emissão de Nota Fiscal',
        'Cadastro de clientes e transportadoras',
        'Cadastro de produtos',
        'Configurações de emissão de nota'
      ],
      ativo: true,
      assinantesAtivos: 342,
      ultimaAlteracao: '2026-06-02'
    },
    {
      id: 'gestao-completa',
      nome: 'Gestão Completa',
      descricao: 'Estoque, financeiro e relatórios em um só lugar.',
      cobrancaMensal: true,
      faixas: {
        'ate-100': { anualMensal: 109.90, mensal: 149.90 },
        '101-200': { anualMensal: 159.90, mensal: 209.90 },
        '201-300': { anualMensal: 219.90, mensal: 289.90 },
        'acima-300': { anualMensal: 299.90, mensal: 399.90 }
      },
      beneficios: [
        'Tudo do Fiscal, mais:',
        'Estoque de compras',
        'Depósitos futuros',
        'Financeiro',
        'Relatórios',
        'Cadastro Rural'
      ],
      ativo: true,
      assinantesAtivos: 96,
      ultimaAlteracao: '2026-05-20'
    },
    {
      id: 'gestao-completa-whatsapp',
      nome: 'Gestão Completa + WhatsApp',
      descricao: 'Toda a gestão da fazenda, com o WhatsApp como atalho.',
      cobrancaMensal: true,
      faixas: {
        'ate-100': { anualMensal: 159.90, mensal: 209.90 },
        '101-200': { anualMensal: 219.90, mensal: 289.90 },
        '201-300': { anualMensal: 289.90, mensal: 379.90 },
        'acima-300': { anualMensal: 379.90, mensal: 499.90 }
      },
      beneficios: [
        'Tudo da Gestão Completa, mais:',
        'Emissão de Nota Fiscal pelo WhatsApp',
        'Anotações no Caderno de Campo via WhatsApp'
      ],
      ativo: true,
      assinantesAtivos: 1,
      ultimaAlteracao: '2026-09-10'
    }
  ];

  PLANOS.forEach(function (plano) {
    FAIXA_IDS.forEach(function (faixaId) { recalcularFaixa(plano.faixas[faixaId]); });
    sincronizarCompat(plano);
  });

  function list() {
    return PLANOS.slice();
  }

  function findById(id) {
    for (var i = 0; i < PLANOS.length; i++) {
      if (PLANOS[i].id === id) return PLANOS[i];
    }
    return null;
  }

  /* Objeto "público" de preços de 1 faixa (nunca a faixa interna crua) — sempre com os 4
     campos possíveis, `mensal`/`economia` vindo `null` pro Fiscal (não têm cobrança mensal). */
  function faixaPrecos(plano, faixaId) {
    var faixa = plano.faixas[faixaId];
    if (!faixa) return null;
    return {
      id: faixaId,
      label: FAIXA_LABELS[faixaId],
      anualMensal: faixa.anualMensal,
      anualTotal: faixa.anualTotal,
      mensal: (typeof faixa.mensal === 'number') ? faixa.mensal : null,
      economia: (typeof faixa.economia === 'number') ? faixa.economia : null
    };
  }

  /* As 4 faixas de 1 plano, na ordem certa — usado pela tela de edição de preços. */
  function listFaixas(planoId) {
    var plano = findById(planoId);
    if (!plano) return [];
    return FAIXA_IDS.map(function (faixaId) { return faixaPrecos(plano, faixaId); });
  }

  /* Menor/maior valor mensal-equivalente entre as 4 faixas — nunca guardado, só derivado na
     hora de montar o resumo da listagem principal (coluna "Faixa de preços"). */
  function faixaRange(plano) {
    var valores = FAIXA_IDS.map(function (faixaId) { return plano.faixas[faixaId].anualMensal; });
    return { min: Math.min.apply(null, valores), max: Math.max.apply(null, valores) };
  }

  /* Só descrição/benefícios/status são editáveis por aqui — nome nunca muda, e valor
     mensal/anual do plano deixaram de ser campos diretos (ver `updateFaixa` abaixo, a nova
     fonte de verdade dos preços, por faixa de hectares). */
  function update(id, patch) {
    var plano = findById(id);
    if (!plano) return null;
    if (typeof patch.descricao === 'string') plano.descricao = patch.descricao;
    if (Array.isArray(patch.beneficios)) plano.beneficios = patch.beneficios;
    if (typeof patch.ativo === 'boolean') plano.ativo = patch.ativo;
    plano.ultimaAlteracao = TODAY;
    return plano;
  }

  function toggleAtivo(id) {
    var plano = findById(id);
    if (!plano) return null;
    plano.ativo = !plano.ativo;
    plano.ultimaAlteracao = TODAY;
    return plano;
  }

  /* Único ponto de escrita de preços do sistema. `patch.anualMensal` sempre aceito;
     `patch.mensal` só é aplicado se o plano tiver `cobrancaMensal` (Fiscal nunca grava esse
     campo, mesmo se for enviado). `anualTotal`/`economia` são sempre recalculados aqui dentro
     — nunca aceitos como parte do patch, pra não existir um jeito de gravá-los inconsistentes
     com `anualMensal`/`mensal`. */
  function updateFaixa(planoId, faixaId, patch) {
    var plano = findById(planoId);
    if (!plano || !plano.faixas[faixaId]) return null;
    var faixa = plano.faixas[faixaId];
    if (typeof patch.anualMensal === 'number') faixa.anualMensal = patch.anualMensal;
    if (plano.cobrancaMensal && typeof patch.mensal === 'number') faixa.mensal = patch.mensal;
    recalcularFaixa(faixa);
    sincronizarCompat(plano);
    plano.ultimaAlteracao = TODAY;
    return faixaPrecos(plano, faixaId);
  }

  window.NiveloAdminPlanos = {
    TODAY: TODAY,
    FAIXA_IDS: FAIXA_IDS,
    FAIXA_LABELS: FAIXA_LABELS,
    list: list,
    findById: findById,
    update: update,
    toggleAtivo: toggleAtivo,
    listFaixas: listFaixas,
    faixaRange: faixaRange,
    updateFaixa: updateFaixa
  };
})();
