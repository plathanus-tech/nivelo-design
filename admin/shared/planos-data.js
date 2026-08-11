/*
 * Catálogo de planos de assinatura — visão do BACKOFFICE (admin). Superfície separada de
 * `app/shared/planos-data.js` (visão do cliente, Minha Conta/checkout), por convenção do
 * projeto (cada área tem seu próprio `shared/`, sem import cruzado) — mesmos 4 planos/nomes/
 * valores mensais, mantidos em sincronia manualmente.
 * Aqui só existem valores/status EDITÁVEIS pelo administrador (nunca criação/exclusão de
 * plano, regra de negócio explícita) — sem `precoAnualTotal`/`tier`/`destaque`, que são
 * conceitos só do lado do cliente.
 */
(function () {
  'use strict';

  var TODAY = '2026-08-10';

  // Mesma regra de negócio já usada em `app/shared/planos-data.js` (Minha Conta/checkout do
  // cliente): valor anual = 12x o valor mensal com 20% de desconto, nunca uma conta nova.
  var DESCONTO_ANUAL = 0.2;

  function calcularValorAnual(valorMensal) {
    return Math.round(valorMensal * 12 * (1 - DESCONTO_ANUAL) * 100) / 100;
  }

  var PLANOS = [
    {
      id: 'fiscal',
      nome: 'Fiscal',
      descricao: 'Ideal para quem precisa emitir notas fiscais e organizar sua operação fiscal.',
      valorMensal: 29.9,
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
      id: 'fiscal-whatsapp',
      nome: 'Fiscal + WhatsApp',
      descricao: 'Emita notas fiscais em segundos, direto pelo WhatsApp.',
      valorMensal: 99,
      beneficios: [
        'Tudo do Fiscal, mais:',
        'Emissão de Nota Fiscal pelo WhatsApp'
      ],
      ativo: true,
      assinantesAtivos: 187,
      ultimaAlteracao: '2026-07-15'
    },
    {
      id: 'gestao-completa',
      nome: 'Gestão Completa',
      descricao: 'Estoque, financeiro e relatórios em um só lugar.',
      valorMensal: 169,
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
      valorMensal: 199,
      beneficios: [
        'Tudo da Gestão Completa, mais:',
        'Emissão de Nota Fiscal pelo WhatsApp',
        'Anotações no Caderno de Campo via WhatsApp'
      ],
      ativo: false,
      assinantesAtivos: 0,
      ultimaAlteracao: '2026-04-11'
    }
  ];

  PLANOS.forEach(function (p) {
    p.valorAnual = calcularValorAnual(p.valorMensal);
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

  /* Só descrição/valores/benefícios/status são editáveis — nome nunca muda por aqui.
     Valor mensal e Valor anual são campos independentes (cada um editável no modal, sem
     derivar um do outro em tempo de edição — a fórmula de desconto só é usada pra sugerir o
     valor anual inicial de cada plano, ver `calcularValorAnual` acima). */
  function update(id, patch) {
    var plano = findById(id);
    if (!plano) return null;
    if (typeof patch.descricao === 'string') plano.descricao = patch.descricao;
    if (typeof patch.valorMensal === 'number') plano.valorMensal = patch.valorMensal;
    if (typeof patch.valorAnual === 'number') plano.valorAnual = patch.valorAnual;
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

  window.NiveloAdminPlanos = {
    TODAY: TODAY,
    DESCONTO_ANUAL: DESCONTO_ANUAL,
    list: list,
    findById: findById,
    update: update,
    toggleAtivo: toggleAtivo
  };
})();
