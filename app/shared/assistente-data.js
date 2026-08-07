/* ══════════════════════════════════════════════════════════
   window.NiveloAssistente — histórico de conversas do Assistente de IA
   (Assistente IA > Histórico). Mesma convenção IIFE dos demais módulos
   de dados do protótipo (array em memória, sem persistência entre reloads —
   mesmo princípio documentado em manifestos-data.js/produtos-data.js).

   Toda conversa acontece via WhatsApp (o sistema não inicia/recebe
   conversas direto) — por isso não há mais um campo de origem por
   conversa.

   Cada conversa: {
     id, titulo, criadaEm (ISO),
     mensagens: [{ id, autor: 'usuario' | 'assistente', tipo: 'texto' | 'audio',
                   conteudo (texto) | duracaoSeg (audio), horario (ISO) }]
   } */
(function () {
  'use strict';

  function iso(diasAtras, horas, minutos) {
    var d = new Date();
    d.setDate(d.getDate() - diasAtras);
    d.setHours(horas, minutos, 0, 0);
    return d.toISOString();
  }

  var CONVERSAS = [
    {
      id: 'conv-seed-1',
      titulo: 'Solicitação de Nota Fiscal',
      criadaEm: iso(0, 9, 12),
      mensagens: [
        { id: 'm1', autor: 'usuario', tipo: 'texto', conteudo: 'Preciso emitir uma nota fiscal de venda de soja', horario: iso(0, 9, 12) },
        { id: 'm2', autor: 'assistente', tipo: 'texto', conteudo: 'Posso te ajudar com isso! Para emitir a nota fiscal, acesse Vendas > Notas fiscais > Nova Nota Fiscal, ou me diga o destinatário e a quantidade que eu te oriento no preenchimento.', horario: iso(0, 9, 13) },
        { id: 'm3', autor: 'usuario', tipo: 'texto', conteudo: 'É pra Cooperativa Central, 500 sacas', horario: iso(0, 9, 14) },
        { id: 'm4', autor: 'assistente', tipo: 'texto', conteudo: 'Anotado. Você pode preencher esses dados na tela de Nova Nota Fiscal — destinatário "Cooperativa Central" e quantidade "500 sacas". Precisa de mais alguma coisa?', horario: iso(0, 9, 15) }
      ]
    },
    {
      id: 'conv-seed-2',
      titulo: 'Registro de colheita — Talhão 02',
      criadaEm: iso(1, 14, 30),
      mensagens: [
        { id: 'm5', autor: 'usuario', tipo: 'texto', conteudo: 'Registrar colheita de 320 sacas de soja no talhão 02 de hoje', horario: iso(1, 14, 30) },
        { id: 'm6', autor: 'assistente', tipo: 'texto', conteudo: 'Certo! Posso registrar isso no Caderno de Campo: Talhão 02, colheita de soja, 320 sacas, data de hoje. Confirma o registro?', horario: iso(1, 14, 31) },
        { id: 'm7', autor: 'usuario', tipo: 'texto', conteudo: 'Confirmo', horario: iso(1, 14, 32) },
        { id: 'm8', autor: 'assistente', tipo: 'texto', conteudo: 'Registrado no Caderno de Campo com sucesso. Você pode conferir em Caderno de Campo > Fazenda São João > Talhão 02.', horario: iso(1, 14, 32) }
      ]
    },
    {
      id: 'conv-seed-3',
      titulo: 'Despesa com adubo',
      criadaEm: iso(3, 8, 5),
      mensagens: [
        { id: 'm9', autor: 'usuario', tipo: 'audio', duracaoSeg: 8, horario: iso(3, 8, 5) },
        { id: 'm10', autor: 'assistente', tipo: 'texto', conteudo: 'Recebi sua mensagem de voz! No momento ainda não consigo transcrever áudios automaticamente — poderia repetir sua solicitação por texto? Posso ajudar com notas fiscais ou registros no Caderno de Campo.', horario: iso(3, 8, 6) }
      ]
    },
    {
      id: 'conv-seed-4',
      titulo: 'Venda de café — Talhão 05',
      criadaEm: iso(5, 11, 0),
      mensagens: [
        { id: 'm11', autor: 'usuario', tipo: 'texto', conteudo: 'Quero anotar uma venda de café do talhão 05, 40 sacas', horario: iso(5, 11, 0) },
        { id: 'm12', autor: 'assistente', tipo: 'texto', conteudo: 'Anotado no Caderno de Campo: venda de café, Talhão 05, 40 sacas. Deseja que eu já registre com a data de hoje?', horario: iso(5, 11, 1) },
        { id: 'm13', autor: 'usuario', tipo: 'texto', conteudo: 'Sim, pode ser', horario: iso(5, 11, 2) },
        { id: 'm14', autor: 'assistente', tipo: 'texto', conteudo: 'Pronto, registrado com sucesso no Caderno de Campo.', horario: iso(5, 11, 2) }
      ]
    },
    {
      id: 'conv-seed-5',
      titulo: 'Dúvida sobre previsão do tempo',
      criadaEm: iso(7, 16, 40),
      mensagens: [
        { id: 'm15', autor: 'usuario', tipo: 'texto', conteudo: 'Vai chover essa semana?', horario: iso(7, 16, 40) },
        { id: 'm16', autor: 'assistente', tipo: 'texto', conteudo: 'No momento, posso ajudar apenas com solicitações de notas fiscais e registros no Caderno de Campo. Poderia reformular seu pedido dentro desses temas?', horario: iso(7, 16, 40) }
      ]
    },
    {
      id: 'conv-seed-6',
      titulo: 'Nota fiscal — devolução',
      criadaEm: iso(9, 10, 15),
      mensagens: [
        { id: 'm17', autor: 'usuario', tipo: 'texto', conteudo: 'Como emito uma nota de devolução?', horario: iso(9, 10, 15) },
        { id: 'm18', autor: 'assistente', tipo: 'texto', conteudo: 'Para devoluções, use Vendas > Notas fiscais > Nova Nota Fiscal e selecione a Natureza da Operação "Devolução de venda". Precisa de ajuda com mais algum dado?', horario: iso(9, 10, 16) }
      ]
    }
  ];

  function list() {
    return CONVERSAS.slice().sort(function (a, b) {
      var ultimaA = a.mensagens.length ? a.mensagens[a.mensagens.length - 1].horario : a.criadaEm;
      var ultimaB = b.mensagens.length ? b.mensagens[b.mensagens.length - 1].horario : b.criadaEm;
      return new Date(ultimaB) - new Date(ultimaA);
    });
  }

  function findById(id) {
    return CONVERSAS.filter(function (c) { return c.id === id; })[0] || null;
  }

  window.NiveloAssistente = {
    list: list,
    findById: findById
  };
})();
