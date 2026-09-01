// Catálogo central do Canal de Ideias (`window.NiveloIdeias`), mesma convenção IIFE de
// fazendas-data.js/produtos-data.js/cadastros-data.js. Espaço colaborativo entre usuários —
// por instrução explícita do pedido original, SEM status de análise/aprovação/backlog/
// priorização: uma ideia só tem votos e comentários, nunca um campo "situação".
//
// `votos` no seed já representa o total ANTES do usuário atual votar — o toggle de voto
// (`toggleVoto`) sempre soma/subtrai 1 em cima desse valor base, nunca acumula além disso.
// `votadoPorMim`/comentários extras/ideias novas não sobrevivem a uma sessão nova (sem
// `localStorage`, mesma limitação de todo o protótipo) mas sobrevivem à navegação ENTRE as 3
// telas desta jornada dentro da mesma aba, via sessionStorage — mesmo padrão de
// `fazendas-data.js` (`persist()`/`persistEdit()`).
window.NiveloIdeias = (function () {
  'use strict';

  // Ordem segue a mesma ordem da Sidebar (seção "Geral" + "Gestão"): Dashboard
  // → Assistente IA → Caderno de campo → Cadastros → Estoque → Financeiro
  // (com Relatórios logo depois, já que é um subitem de Financeiro na
  // Sidebar) → Vendas → Configurações — "Outros" sempre por último, por ser
  // o catch-all.
  var CATEGORIAS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'assistente-ia', label: 'Assistente de IA' },
    { id: 'caderno-de-campo', label: 'Caderno de campo' },
    { id: 'cadastro', label: 'Cadastro' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'relatorios', label: 'Relatórios' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'configuracao', label: 'Configuração' },
    { id: 'outros', label: 'Outros' }
  ];

  var IDEIAS = [
    {
      codigo: 'ID-0001',
      titulo: 'Filtro por safra no Caderno de Campo',
      descricao: 'Hoje o histórico de anotações mistura todas as safras juntas. Seria muito útil filtrar as anotações de um talhão por safra ao revisar o que foi feito em anos anteriores, principalmente pra comparar produtividade entre uma safra e outra.',
      categoria: 'caderno-de-campo',
      autor: 'Roberto Almeida',
      dataCriacao: '2026-07-18',
      votos: 342,
      comentarios: [
        { id: 'c1', autor: 'Fernanda Lima', texto: 'Também sinto falta disso, principalmente pra comparar Soja de um ano pro outro no mesmo talhão.', dataCriacao: '2026-07-19' },
        { id: 'c2', autor: 'João Pedro Costa', texto: 'Concordo. Hoje eu anoto a safra no próprio texto da anotação só pra lembrar depois.', dataCriacao: '2026-07-20' }
      ]
    },
    {
      codigo: 'ID-0002',
      titulo: 'Exportar contas a pagar em PDF, não só Excel',
      descricao: 'O botão de exportação de Estoque já existe em CSV/Excel, mas em Contas a Pagar preciso mandar o relatório pro meu contador em PDF formatado pra ele conseguir imprimir e assinar. Hoje preciso converter manualmente.',
      categoria: 'financeiro',
      autor: 'Maria Oliveira',
      dataCriacao: '2026-07-22',
      votos: 289,
      comentarios: [
        { id: 'c3', autor: 'Carlos Eduardo', texto: 'Isso ajudaria muito na hora de fechar o mês com o contador.', dataCriacao: '2026-07-23' }
      ]
    },
    {
      codigo: 'ID-0003',
      titulo: 'Assistente de IA sugerir a categoria financeira automaticamente',
      descricao: 'Ao lançar uma nova conta no Caixa, seria ótimo se o Assistente de IA sugerisse a Categoria com base no histórico digitado, parecido com o que já acontece com o Produto no Estoque.',
      categoria: 'assistente-ia',
      autor: 'Diego Santos',
      dataCriacao: '2026-07-25',
      votos: 201,
      comentarios: []
    },
    {
      codigo: 'ID-0004',
      titulo: 'Relatório de produtividade por talhão',
      descricao: 'Um relatório simples que cruze a área de cada talhão com a colheita registrada no Caderno de Campo, mostrando sacas por hectare. Hoje preciso fazer essa conta na mão fora do sistema.',
      categoria: 'relatorios',
      autor: 'Fernanda Lima',
      dataCriacao: '2026-07-15',
      votos: 176,
      comentarios: [
        { id: 'c4', autor: 'Roberto Almeida', texto: 'Ótima ideia, principalmente comparando talhões da mesma cultura.', dataCriacao: '2026-07-16' },
        { id: 'c5', autor: 'Ana Beatriz', texto: 'Isso mudaria completamente como eu decido onde plantar no ano seguinte.', dataCriacao: '2026-07-17' },
        { id: 'c6', autor: 'Maria Oliveira', texto: 'Apoio. Poderia até virar um card novo no Dashboard.', dataCriacao: '2026-07-18' }
      ]
    },
    {
      codigo: 'ID-0005',
      titulo: 'Alerta quando o estoque comprometido passar do estoque disponível',
      descricao: 'Já aconteceu de eu comprometer mais sacas do que realmente tinha em estoque sem perceber. Um aviso simples ao registrar o compromisso ajudaria a evitar esse tipo de erro.',
      categoria: 'estoque',
      autor: 'Carlos Eduardo',
      dataCriacao: '2026-07-28',
      votos: 154,
      comentarios: [
        { id: 'c7', autor: 'Diego Santos', texto: 'Já passei por isso também, seria uma boa.', dataCriacao: '2026-07-29' }
      ]
    },
    {
      codigo: 'ID-0006',
      titulo: 'Anexar foto na anotação do Caderno de Campo',
      descricao: 'Poder anexar uma foto do talhão (praga, solo, planta) junto da anotação de campo ajudaria muito a documentar o histórico de cada área com mais detalhe.',
      categoria: 'caderno-de-campo',
      autor: 'João Pedro Costa',
      dataCriacao: '2026-07-30',
      votos: 98,
      comentarios: []
    },
    {
      codigo: 'ID-0007',
      titulo: 'Buscar fornecedor por CNPJ direto no cadastro rápido',
      descricao: 'Quando cadastro um fornecedor novo direto da tela de Nova Conta a Pagar, seria útil digitar só o CNPJ e o sistema preencher Nome/Cidade automaticamente, como já acontece com o CEP no endereço.',
      categoria: 'financeiro',
      autor: 'Ana Beatriz',
      dataCriacao: '2026-08-01',
      votos: 61,
      comentarios: []
    },
    {
      codigo: 'ID-0008',
      titulo: 'Tema mais compacto para quem usa o sistema no celular o dia inteiro',
      descricao: 'No campo eu uso o Nivelo quase só pelo celular. Uma opção de densidade mais compacta (menos espaço em branco entre os campos) ajudaria a ver mais informação sem rolar tanto.',
      categoria: 'outros',
      autor: 'Roberto Almeida',
      dataCriacao: '2026-08-02',
      votos: 23,
      comentarios: []
    }
  ];

  // ── Persistência de sessão (sessionStorage, não localStorage — mesma
  // limitação de todo o protótipo: sobrevive à navegação entre páginas da
  // mesma aba, nunca a uma sessão nova). ──────────────────────────────────
  var VOTES_KEY = 'nivelo.ideias.votos';
  var COMMENTS_KEY = 'nivelo.ideias.comentarios';
  var CREATED_KEY = 'nivelo.ideias.criadas';

  (function loadCreated() {
    try {
      var raw = sessionStorage.getItem(CREATED_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(function (idea) { IDEIAS.push(idea); });
    } catch (e) {}
  })();

  (function loadVotes() {
    try {
      var raw = sessionStorage.getItem(VOTES_KEY);
      if (!raw) return;
      var votadas = JSON.parse(raw);
      Object.keys(votadas).forEach(function (codigo) {
        var idea = findByCodigo(codigo);
        if (idea && votadas[codigo]) {
          idea.votos += 1;
          idea.votadoPorMim = true;
        }
      });
    } catch (e) {}
  })();

  (function loadComments() {
    try {
      var raw = sessionStorage.getItem(COMMENTS_KEY);
      if (!raw) return;
      var extras = JSON.parse(raw);
      Object.keys(extras).forEach(function (codigo) {
        var idea = findByCodigo(codigo);
        if (idea) idea.comentarios = idea.comentarios.concat(extras[codigo]);
      });
    } catch (e) {}
  })();

  function persistVotes(votadas) {
    try { sessionStorage.setItem(VOTES_KEY, JSON.stringify(votadas)); } catch (e) {}
  }

  function readVotes() {
    try {
      var raw = sessionStorage.getItem(VOTES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function persistComment(codigo, comentario) {
    try {
      var raw = sessionStorage.getItem(COMMENTS_KEY);
      var extras = raw ? JSON.parse(raw) : {};
      extras[codigo] = (extras[codigo] || []).concat([comentario]);
      sessionStorage.setItem(COMMENTS_KEY, JSON.stringify(extras));
    } catch (e) {}
  }

  function persistCreated(idea) {
    try {
      var raw = sessionStorage.getItem(CREATED_KEY);
      var criadas = raw ? JSON.parse(raw) : [];
      criadas.push(idea);
      sessionStorage.setItem(CREATED_KEY, JSON.stringify(criadas));
    } catch (e) {}
  }

  function categorias() {
    return CATEGORIAS;
  }

  function categoriaLabel(id) {
    var cat = CATEGORIAS.filter(function (c) { return c.id === id; })[0];
    return cat ? cat.label : id;
  }

  function list() {
    return IDEIAS;
  }

  function findByCodigo(codigo) {
    return IDEIAS.filter(function (i) { return i.codigo === codigo; })[0] || null;
  }

  function nextCodigo() {
    var max = IDEIAS.reduce(function (acc, i) {
      var n = parseInt(i.codigo.replace('ID-', ''), 10);
      return isNaN(n) ? acc : Math.max(acc, n);
    }, 0);
    var padded = String(max + 1);
    while (padded.length < 4) padded = '0' + padded;
    return 'ID-' + padded;
  }

  // Alterna o voto do usuário atual — sempre relativo ao valor SEED (que já
  // exclui o próprio voto do usuário), nunca acumula além de +1/-1. Ideias
  // criadas nesta mesma sessão (via `add()`) já nascem com `votos: 0`, então
  // votar nelas simplesmente vira `1`.
  function toggleVoto(codigo) {
    var idea = findByCodigo(codigo);
    if (!idea) return null;
    var votadas = readVotes();
    if (idea.votadoPorMim) {
      idea.votos -= 1;
      idea.votadoPorMim = false;
      delete votadas[codigo];
    } else {
      idea.votos += 1;
      idea.votadoPorMim = true;
      votadas[codigo] = true;
    }
    persistVotes(votadas);
    return idea;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addComentario(codigo, payload) {
    var idea = findByCodigo(codigo);
    if (!idea) return null;
    var comentario = {
      id: 'c-' + Date.now(),
      autor: payload.autor,
      texto: payload.texto,
      dataCriacao: todayISO()
    };
    idea.comentarios.push(comentario);
    persistComment(codigo, comentario);
    return comentario;
  }

  // Usado pelo fluxo de "Nova ideia" (nova-ideia.html/js). Toda ideia nova
  // nasce sem voto do próprio autor (mesmo princípio de fóruns/comunidades
  // reais — o autor não vota na própria ideia automaticamente) e sem
  // comentários.
  function add(payload) {
    var novaIdeia = {
      codigo: nextCodigo(),
      titulo: payload.titulo,
      descricao: payload.descricao,
      categoria: payload.categoria,
      autor: payload.autor,
      dataCriacao: todayISO(),
      votos: 0,
      comentarios: []
    };
    IDEIAS.push(novaIdeia);
    persistCreated(novaIdeia);
    return novaIdeia;
  }

  return {
    categorias: categorias,
    categoriaLabel: categoriaLabel,
    list: list,
    findByCodigo: findByCodigo,
    toggleVoto: toggleVoto,
    addComentario: addComentario,
    add: add
  };
})();
