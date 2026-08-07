/*
 * Catálogo de planos comerciais do Nivelo — usado por Minha Conta (aba Plano) e pelo fluxo de
 * compra (comprar-plano.html). Mesmos 4 planos e valores mensais já usados na landing page
 * (landing/screens/index-v3.html, seção #planos) — mantidos em sincronia manualmente (não há
 * import cruzado entre landing/ e app/, ver app/CLAUDE.md "Escopo").
 * Desconto anual: 20% sobre 12x o valor mensal (mesma regra da landing).
 */
(function () {
  'use strict';

  var DESCONTO_ANUAL = 0.2;

  function anualTotal(precoMensal) {
    return Math.round(precoMensal * 12 * (1 - DESCONTO_ANUAL) * 100) / 100;
  }

  var PLANOS = [
    {
      id: 'fiscal',
      tier: 0,
      nome: 'Fiscal',
      tagline: 'Ideal para quem precisa emitir notas fiscais e organizar sua operação fiscal.',
      precoMensal: 29.9,
      recursos: [
        'Emissão de Nota Fiscal',
        'Cadastro de clientes e transportadoras',
        'Cadastro de produtos',
        'Configurações de emissão de nota'
      ]
    },
    {
      id: 'fiscal-whatsapp',
      tier: 1,
      nome: 'Fiscal + WhatsApp',
      tagline: 'Emita notas fiscais em segundos, direto pelo WhatsApp.',
      precoMensal: 99,
      recursos: [
        'Tudo do Fiscal, mais:',
        'Emissão de Nota Fiscal pelo WhatsApp'
      ]
    },
    {
      id: 'gestao-completa',
      tier: 2,
      nome: 'Gestão Completa',
      tagline: 'Estoque, financeiro e relatórios em um só lugar.',
      precoMensal: 169,
      recursos: [
        'Tudo do Fiscal, mais:',
        'Estoque de compras',
        'Depósitos futuros',
        'Financeiro',
        'Relatórios',
        'Cadastro Rural'
      ]
    },
    {
      id: 'gestao-completa-whatsapp',
      tier: 3,
      nome: 'Gestão Completa + WhatsApp',
      tagline: 'Toda a gestão da fazenda, com o WhatsApp como atalho.',
      precoMensal: 199,
      destaque: true,
      recursos: [
        'Tudo da Gestão Completa, mais:',
        'Emissão de Nota Fiscal pelo WhatsApp',
        'Anotações no Caderno de Campo via WhatsApp'
      ]
    }
  ];

  PLANOS.forEach(function (p) {
    p.precoAnualTotal = anualTotal(p.precoMensal);
    p.precoAnualMensal = Math.round((p.precoAnualTotal / 12) * 100) / 100;
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

  /** true quando o plano/modalidade de destino representa um upgrade real sobre o atual. */
  function isUpgrade(planoAtualId, planoNovoId) {
    var atual = findById(planoAtualId);
    var novo = findById(planoNovoId);
    if (!atual || !novo) return false;
    return novo.tier > atual.tier;
  }

  function precoPorModalidade(plano, modalidade) {
    return modalidade === 'anual' ? plano.precoAnualTotal : plano.precoMensal;
  }

  window.NiveloPlanos = {
    DESCONTO_ANUAL: DESCONTO_ANUAL,
    list: list,
    findById: findById,
    isUpgrade: isUpgrade,
    precoPorModalidade: precoPorModalidade
  };
})();
