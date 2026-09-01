/* ══════════════════════════════════════════════════════════
   window.NiveloEstoqueComprometidoV2 — módulo próprio pro conceito
   "Estoque Comprometido" da aba de Estoque (V2), extraído de dentro de
   `estoque-v2.js` (onde vivia como um array local, "mantido como V1")
   pra virar um catálogo compartilhado de verdade — precisava disso porque
   agora existe uma tela satélite própria (`registrar-entrega-estoque-v2.
   html`) que resolve o registro pelo `?codigo=` e precisa ler/mutar o
   MESMO dado que a listagem usa, mesma convenção já usada por
   `estoque-vendas-v2-data.js`.

   Vocabulário atualizado nesta rodada (pedido explícito): `destinatario` →
   `cliente`, `abatida` → `entregue`, "Registrar abatimento" → "Registrar
   entrega" — os nomes de campo já nascem com a nomenclatura nova, não é
   só rótulo de UI.

   Cada item: {
     codigo, produto, sku, unidade (nome, ex. "Saca"), cliente,
     comprometida, entregue, pendente (derivado), situacao (derivado:
     'pendente'|'quitado'), depositos (array {deposito, quantidade} — saldo
     físico disponível por depósito, só pra alimentar "Saldo disponível no
     depósito" na tela de Registrar entrega, não somado/validado contra
     `comprometida`), historico (array, só cresce via `.push`).
   } */
(function () {
  'use strict';

  function recalc(item) {
    item.pendente = Math.max(0, item.comprometida - item.entregue);
    item.situacao = item.pendente <= 0 ? 'quitado' : 'pendente';
    return item;
  }

  var COMPROMETIDO = [
    {
      codigo: 'CMT-001',
      produto: 'Soja',
      sku: 'PRD-001',
      unidade: 'Saca',
      cliente: 'Cooperativa Alfa',
      comprometida: 500,
      entregue: 300,
      depositos: [
        { deposito: 'Armazém Sede', quantidade: 620 },
        { deposito: 'Depósito Fazenda São João', quantidade: 180 }
      ],
      // 3 entregas fictícias (soma 300, batendo com `entregue`) só pra
      // demonstrar visualmente o histórico de entregas (espaçamento/
      // hierarquia do componente) — pedido explícito, dados sem
      // significado de negócio além disso.
      historico: [
        { tipo: 'compromisso-inicial', quantidade: 500, data: '2026-06-12', observacao: null },
        { tipo: 'entrega', quantidade: 120, data: '2026-06-20', deposito: 'Armazém Sede', documento: { numero: '35.219.884' }, observacao: null },
        { tipo: 'entrega', quantidade: 100, data: '2026-07-05', deposito: 'Depósito Fazenda São João', documento: null, observacao: null },
        { tipo: 'entrega', quantidade: 80, data: '2026-07-22', deposito: 'Armazém Sede', documento: { numero: '35.220.410' }, observacao: 'Entrega parcial conforme contrato' }
      ]
    },
    {
      codigo: 'CMT-002',
      produto: 'Milho',
      sku: 'PRD-002',
      unidade: 'Saca',
      cliente: 'Cooperativa Beta',
      comprometida: 1000,
      entregue: 1000,
      depositos: [
        { deposito: 'Armazém Sede', quantidade: 500 }
      ],
      historico: [
        { tipo: 'compromisso-inicial', quantidade: 1000, data: '2026-06-15', observacao: null },
        { tipo: 'entrega', quantidade: 600, data: '2026-06-25', deposito: 'Armazém Sede', documento: { numero: '35.219.912' }, observacao: null },
        { tipo: 'entrega', quantidade: 400, data: '2026-07-10', deposito: 'Armazém Sede', documento: null, observacao: 'Entrega final, compromisso quitado' }
      ]
    }
  ].map(recalc);

  function list() {
    return COMPROMETIDO;
  }

  function findByCodigo(codigo) {
    return COMPROMETIDO.filter(function (i) { return i.codigo === codigo; })[0] || null;
  }

  function registrarEntrega(codigo, entrega) {
    var item = findByCodigo(codigo);
    if (!item) return null;
    item.entregue += entrega.quantidade;
    recalc(item);
    item.historico.push({
      tipo: 'entrega',
      quantidade: entrega.quantidade,
      data: entrega.data,
      deposito: entrega.deposito || null,
      documento: entrega.documento || null,
      observacao: entrega.observacao || null
    });
    return item;
  }

  window.NiveloEstoqueComprometidoV2 = {
    list: list,
    findByCodigo: findByCodigo,
    registrarEntrega: registrarEntrega
  };
})();
