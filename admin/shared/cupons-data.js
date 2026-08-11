/*
 * Gestão de Cupons e Afiliados (Backoffice > Cupons e afiliados). Catálogo central de cupons —
 * de afiliado (rastreiam clientes indicados por uma pessoa/parceiro) e promocionais (campanhas
 * próprias) — com as respectivas utilizações. Consome `window.NiveloAssinantes` só pra exibir
 * nome/e-mail do cliente que utilizou (`assinanteId`), nunca duplica esse dado aqui.
 * Mesma convenção IIFE em memória (sem localStorage) já usada em `assinantes-data.js`/
 * `pagamentos-data.js` — nenhuma alteração sobrevive a um reload da página.
 */
window.NiveloCupons = (function () {
  'use strict';

  var TODAY = '2026-08-10';

  var TIPO_LABELS = { afiliado: 'Afiliado', promocional: 'Promocional' };

  function addDias(iso, dias) {
    var d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  var CUPONS = [
    {
      codigo: 'NIVELO20',
      tipo: 'afiliado',
      nome: 'Consultoria AgroMax',
      percentualDesconto: 20,
      dataInicio: '2025-06-01',
      dataFim: '2026-12-31',
      dataCriacao: '2025-06-01',
      ativo: true,
      afiliado: {
        nomeCompleto: 'Cláudia Menezes Ribeiro',
        email: 'claudia@agromaxconsultoria.com.br',
        telefone: '+55 (49) 99877-1122',
        documento: '312.445.980-20',
        comissao: {
          banco: 'Itaú Unibanco',
          agencia: '1234',
          conta: '56789-0',
          tipoConta: 'corrente',
          chavePix: 'claudia@agromaxconsultoria.com.br',
          observacoes: 'Comissão de 5% sobre o valor da venda, repasse mensal.'
        }
      },
      utilizacoes: [
        { assinanteId: 1, data: '2026-01-14', valorCompra: 2388.00, percentualAplicado: 20, valorDesconto: 477.60 }
      ]
    },
    {
      codigo: 'NIVELO10',
      tipo: 'afiliado',
      nome: 'Comercial Nivelo',
      percentualDesconto: 10,
      dataInicio: '2026-01-01',
      dataFim: '2026-12-31',
      dataCriacao: '2026-01-01',
      ativo: true,
      afiliado: {
        nomeCompleto: 'Rodrigo Almeida Costa',
        email: 'rodrigo.costa@nivelo.com.br',
        telefone: '+55 (11) 98211-4477',
        documento: '289.114.660-55',
        comissao: null
      },
      utilizacoes: [
        { assinanteId: 6, data: '2026-08-04', valorCompra: 300.00, percentualAplicado: 10, valorDesconto: 30.00 }
      ]
    },
    {
      codigo: 'PARCEIROVERDE15',
      tipo: 'afiliado',
      nome: 'Parceiro Verde Consultoria',
      percentualDesconto: 15,
      dataInicio: '2025-09-01',
      dataFim: '2026-09-01',
      dataCriacao: '2025-09-01',
      ativo: true,
      afiliado: {
        nomeCompleto: 'Fábio Nogueira Teixeira',
        email: 'fabio@parceiroverde.com.br',
        telefone: '+55 (67) 99344-5588',
        documento: '18.220.994/0001-07',
        comissao: {
          banco: 'Nubank',
          agencia: '0001',
          conta: '99887-6',
          tipoConta: 'corrente',
          chavePix: '18.220.994/0001-07',
          observacoes: ''
        }
      },
      utilizacoes: []
    },
    {
      codigo: 'AGROFEST25',
      tipo: 'afiliado',
      nome: 'AgroFest Feiras & Eventos',
      percentualDesconto: 25,
      dataInicio: '2026-03-01',
      dataFim: '2026-09-30',
      dataCriacao: '2026-02-20',
      ativo: true,
      afiliado: {
        nomeCompleto: 'Patrícia Souza Lima',
        email: 'patricia@agrofesteventos.com.br',
        telefone: '+55 (44) 99655-3300',
        documento: '27.845.112/0001-90',
        comissao: {
          banco: '',
          agencia: '',
          conta: '',
          tipoConta: '',
          chavePix: 'patricia@agrofesteventos.com.br',
          observacoes: 'Pagamento só via PIX, sem dados bancários informados.'
        }
      },
      utilizacoes: [
        { assinanteId: 3, data: '2026-03-18', valorCompra: 99.00, percentualAplicado: 25, valorDesconto: 24.75 },
        { assinanteId: 4, data: '2026-04-02', valorCompra: 169.00, percentualAplicado: 25, valorDesconto: 42.25 }
      ]
    },
    {
      codigo: 'NIVELO5',
      tipo: 'promocional',
      nome: 'Cupom de Boas-vindas',
      percentualDesconto: 5,
      dataInicio: '2026-01-01',
      dataFim: '2026-12-31',
      dataCriacao: '2026-01-01',
      ativo: true,
      afiliado: null,
      utilizacoes: [
        { assinanteId: 2, data: '2026-08-05', valorCompra: 29.90, percentualAplicado: 5, valorDesconto: 1.50 },
        { assinanteId: 5, data: '2026-04-10', valorCompra: 29.90, percentualAplicado: 5, valorDesconto: 1.50 },
        { assinanteId: 4, data: '2026-06-20', valorCompra: 169.00, percentualAplicado: 5, valorDesconto: 8.45 },
        { assinanteId: 3, data: '2026-07-02', valorCompra: 99.00, percentualAplicado: 5, valorDesconto: 4.95 }
      ]
    },
    {
      codigo: 'BLACKNIVELO30',
      tipo: 'promocional',
      nome: 'Black Nivelo',
      percentualDesconto: 30,
      dataInicio: '2025-11-20',
      dataFim: '2025-11-30',
      dataCriacao: '2025-11-10',
      ativo: false,
      afiliado: null,
      utilizacoes: [
        { assinanteId: 3, data: '2025-11-22', valorCompra: 99.00, percentualAplicado: 30, valorDesconto: 29.70 },
        { assinanteId: 4, data: '2025-11-25', valorCompra: 169.00, percentualAplicado: 30, valorDesconto: 50.70 },
        { assinanteId: 6, data: '2025-11-27', valorCompra: 950.40, percentualAplicado: 30, valorDesconto: 285.12 }
      ]
    },
    {
      codigo: 'VERAO15',
      tipo: 'promocional',
      nome: 'Campanha de Verão',
      percentualDesconto: 15,
      dataInicio: '2026-01-01',
      dataFim: '2026-02-28',
      dataCriacao: '2025-12-20',
      ativo: false,
      afiliado: null,
      utilizacoes: [
        { assinanteId: 5, data: '2026-01-15', valorCompra: 29.90, percentualAplicado: 15, valorDesconto: 4.49 },
        { assinanteId: 1, data: '2026-02-02', valorCompra: 1910.40, percentualAplicado: 15, valorDesconto: 286.56 }
      ]
    },
    {
      codigo: 'DIAAGRO10',
      tipo: 'promocional',
      nome: 'Dia do Produtor Rural',
      percentualDesconto: 10,
      dataInicio: '2026-07-01',
      dataFim: '2026-07-31',
      dataCriacao: '2026-06-15',
      ativo: false,
      afiliado: null,
      utilizacoes: [
        { assinanteId: 4, data: '2026-07-10', valorCompra: 169.00, percentualAplicado: 10, valorDesconto: 16.90 }
      ]
    }
  ];

  function list() {
    return CUPONS.slice();
  }

  function findByCodigo(codigo) {
    var upper = (codigo || '').toUpperCase();
    for (var i = 0; i < CUPONS.length; i++) {
      if (CUPONS[i].codigo === upper) return CUPONS[i];
    }
    return null;
  }

  function isCodigoDuplicado(codigo, excludeCodigo) {
    var upper = (codigo || '').toUpperCase();
    return CUPONS.some(function (c) { return c.codigo === upper && c.codigo !== (excludeCodigo || '').toUpperCase(); });
  }

  function add(cupom) {
    var novo = {
      codigo: cupom.codigo.toUpperCase(),
      tipo: cupom.tipo,
      nome: cupom.nome,
      percentualDesconto: cupom.percentualDesconto,
      dataInicio: cupom.dataInicio,
      dataFim: cupom.dataFim,
      dataCriacao: TODAY,
      ativo: true,
      afiliado: cupom.tipo === 'afiliado' ? cupom.afiliado : null,
      utilizacoes: []
    };
    CUPONS.push(novo);
    return novo;
  }

  function update(codigoOriginal, patch) {
    var cupom = findByCodigo(codigoOriginal);
    if (!cupom) return null;
    if (typeof patch.nome === 'string') cupom.nome = patch.nome;
    if (typeof patch.percentualDesconto === 'number') cupom.percentualDesconto = patch.percentualDesconto;
    if (typeof patch.dataInicio === 'string') cupom.dataInicio = patch.dataInicio;
    if (typeof patch.dataFim === 'string') cupom.dataFim = patch.dataFim;
    if (cupom.tipo === 'afiliado' && patch.afiliado) cupom.afiliado = patch.afiliado;
    return cupom;
  }

  function toggleAtivo(codigo) {
    var cupom = findByCodigo(codigo);
    if (!cupom) return null;
    cupom.ativo = !cupom.ativo;
    return cupom;
  }

  /* Regra principal do sistema: um mesmo cliente não pode utilizar o mesmo cupom mais de uma
     vez. Usada tanto por uma futura tela de checkout quanto pra auditoria administrativa. */
  function podeUtilizar(codigo, assinanteId) {
    var cupom = findByCodigo(codigo);
    if (!cupom) return false;
    var num = Number(assinanteId);
    return !cupom.utilizacoes.some(function (u) { return u.assinanteId === num; });
  }

  function registrarUtilizacao(codigo, assinanteId, valorCompra, dataUso) {
    var cupom = findByCodigo(codigo);
    if (!cupom || !podeUtilizar(codigo, assinanteId)) return null;
    var valorDesconto = Math.round(valorCompra * (cupom.percentualDesconto / 100) * 100) / 100;
    var utilizacao = {
      assinanteId: Number(assinanteId),
      data: dataUso || TODAY,
      valorCompra: valorCompra,
      percentualAplicado: cupom.percentualDesconto,
      valorDesconto: valorDesconto
    };
    cupom.utilizacoes.push(utilizacao);
    return utilizacao;
  }

  // ---------- Métricas por cupom ----------
  function clientesUnicos(cupom) {
    var ids = {};
    cupom.utilizacoes.forEach(function (u) { ids[u.assinanteId] = true; });
    return Object.keys(ids).length;
  }
  function valorTotalVendido(cupom) {
    return cupom.utilizacoes.reduce(function (sum, u) { return sum + u.valorCompra; }, 0);
  }
  function totalDescontoConcedido(cupom) {
    return cupom.utilizacoes.reduce(function (sum, u) { return sum + u.valorDesconto; }, 0);
  }

  // ---------- Métricas gerais (topo da listagem) ----------
  function cuponsAtivosCount() {
    return CUPONS.filter(function (c) { return c.ativo; }).length;
  }
  function afiliadosAtivosCount() {
    return CUPONS.filter(function (c) { return c.tipo === 'afiliado' && c.ativo; }).length;
  }
  function todasUtilizacoes() {
    var all = [];
    CUPONS.forEach(function (c) {
      c.utilizacoes.forEach(function (u) { all.push({ cupom: c, utilizacao: u }); });
    });
    return all;
  }
  function inPeriodo(dataISO, start, end) {
    if (start && dataISO < start) return false;
    if (end && dataISO > end) return false;
    return true;
  }
  function clientesUnicosNoPeriodo(start, end) {
    var ids = {};
    todasUtilizacoes().forEach(function (item) {
      if (inPeriodo(item.utilizacao.data, start, end)) ids[item.utilizacao.assinanteId] = true;
    });
    return Object.keys(ids).length;
  }
  function utilizacoesNoPeriodo(start, end) {
    return todasUtilizacoes().filter(function (item) { return inPeriodo(item.utilizacao.data, start, end); }).length;
  }
  function descontoNoPeriodo(start, end) {
    return todasUtilizacoes()
      .filter(function (item) { return inPeriodo(item.utilizacao.data, start, end); })
      .reduce(function (sum, item) { return sum + item.utilizacao.valorDesconto; }, 0);
  }

  function assinante(utilizacao) {
    return window.NiveloAssinantes ? window.NiveloAssinantes.findById(utilizacao.assinanteId) : null;
  }

  return {
    TODAY: TODAY,
    TIPO_LABELS: TIPO_LABELS,
    list: list,
    findByCodigo: findByCodigo,
    isCodigoDuplicado: isCodigoDuplicado,
    add: add,
    update: update,
    toggleAtivo: toggleAtivo,
    podeUtilizar: podeUtilizar,
    registrarUtilizacao: registrarUtilizacao,
    clientesUnicos: clientesUnicos,
    valorTotalVendido: valorTotalVendido,
    totalDescontoConcedido: totalDescontoConcedido,
    cuponsAtivosCount: cuponsAtivosCount,
    afiliadosAtivosCount: afiliadosAtivosCount,
    clientesUnicosNoPeriodo: clientesUnicosNoPeriodo,
    utilizacoesNoPeriodo: utilizacoesNoPeriodo,
    descontoNoPeriodo: descontoNoPeriodo,
    assinante: assinante,
    addDias: addDias
  };
})();
