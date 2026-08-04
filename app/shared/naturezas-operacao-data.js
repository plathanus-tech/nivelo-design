/* ══════════════════════════════════════════════════════════
   window.NiveloNaturezasOperacao — cadastro real de Natureza de Operação
   (Configuração > Fiscal > Natureza da Operação). Mesma convenção IIFE dos
   demais módulos de dados do protótipo (categorias-financeiras-data.js,
   fazendas-data.js): array em memória, `list/findByCodigo/nextCodigo/add/
   update/toggleAtivo`.

   Não confundir com `natureza-operacao-data.js` (singular, já existente):
   aquele é um stub simples `{tipoOperacao, label, cfop}` consumido só pelo
   Dropdown "Natureza da operação" de Nova Nota Fiscal — mantido intacto,
   fora do escopo deste pedido (que é a TELA de configuração em si, não o
   consumidor). Os dois módulos coexistem por ora; unificá-los é trabalho
   futuro fora deste pedido. */
(function () {
  'use strict';

  var CODIGO_PREFIX = 'NOP';

  function tributacaoVazia() {
    return {
      simplesNacional: { csosn: '', cfop: '', icmsDifal: false, observacao: '', informacaoFisco: '' },
      ipi: { codigo: 'nao-destacar', aliquota: '', codigoEnquadramento: '', observacao: '', informacaoFisco: '' },
      issqn: { cst: '', aliquota: '', base: '', descontarIss: false, observacao: '', informacaoFisco: '' },
      pis: { cst: '', aliquota: '', base: '', observacao: '', informacaoFisco: '' },
      cofins: { cst: '', aliquota: '', base: '', observacao: '', informacaoFisco: '' }
    };
  }

  var NATUREZAS = [
    {
      codigo: 'NOP-001',
      tipo: 'saida',
      descricao: 'Venda de mercadoria dentro do estado',
      finalizada: true,
      padrao: true,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: true,
      tributacao: Object.assign(tributacaoVazia(), {
        simplesNacional: { csosn: '101', cfop: '5102', icmsDifal: false, observacao: '', informacaoFisco: '' }
      })
    },
    {
      codigo: 'NOP-002',
      tipo: 'saida',
      descricao: 'Venda de mercadoria para fora do estado',
      finalizada: true,
      padrao: false,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: true,
      tributacao: Object.assign(tributacaoVazia(), {
        simplesNacional: { csosn: '101', cfop: '6102', icmsDifal: true, observacao: '', informacaoFisco: '' }
      })
    },
    {
      codigo: 'NOP-003',
      tipo: 'saida',
      descricao: 'Remessa',
      finalizada: true,
      padrao: false,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: 'Uso em remessas para conserto, demonstração ou industrialização.',
      ativo: true,
      tributacao: Object.assign(tributacaoVazia(), {
        simplesNacional: { csosn: '400', cfop: '5905', icmsDifal: false, observacao: '', informacaoFisco: '' }
      })
    },
    {
      codigo: 'NOP-004',
      tipo: 'saida',
      descricao: 'Venda cancelada',
      finalizada: false,
      padrao: false,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: false,
      tributacao: tributacaoVazia()
    },
    {
      codigo: 'NOP-005',
      tipo: 'entrada',
      descricao: 'Devolução de venda',
      finalizada: true,
      padrao: true,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: true,
      tributacao: Object.assign(tributacaoVazia(), {
        simplesNacional: { csosn: '202', cfop: '1202', icmsDifal: false, observacao: '', informacaoFisco: '' }
      })
    },
    {
      codigo: 'NOP-006',
      tipo: 'entrada',
      descricao: 'Compra para uso e consumo',
      finalizada: true,
      padrao: false,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: true,
      tributacao: Object.assign(tributacaoVazia(), {
        simplesNacional: { csosn: '101', cfop: '1556', icmsDifal: false, observacao: '', informacaoFisco: '' }
      })
    },
    {
      codigo: 'NOP-007',
      tipo: 'entrada',
      descricao: 'Retorno de remessa',
      finalizada: true,
      padrao: false,
      serie: '1',
      codigoRegimeTributario: '1',
      consumidorFinal: false,
      observacao: '',
      ativo: false,
      tributacao: tributacaoVazia()
    }
  ];

  function list() {
    return NATUREZAS;
  }

  function findByCodigo(codigo) {
    return NATUREZAS.filter(function (n) { return n.codigo === codigo; })[0] || null;
  }

  function nextCodigo() {
    var max = 0;
    NATUREZAS.forEach(function (n) {
      var num = parseInt(n.codigo.replace(CODIGO_PREFIX + '-', ''), 10);
      if (num > max) max = num;
    });
    var next = max + 1;
    return CODIGO_PREFIX + '-' + String(next).padStart(3, '0');
  }

  function add(natureza) {
    var novo = Object.assign({}, natureza, { codigo: nextCodigo(), ativo: true });
    NATUREZAS.push(novo);
    return novo;
  }

  function update(codigo, patch) {
    var natureza = findByCodigo(codigo);
    if (!natureza) return null;
    Object.assign(natureza, patch, { codigo: natureza.codigo });
    return natureza;
  }

  function toggleAtivo(codigo) {
    var natureza = findByCodigo(codigo);
    if (!natureza) return null;
    natureza.ativo = !natureza.ativo;
    return natureza;
  }

  window.NiveloNaturezasOperacao = {
    list: list,
    findByCodigo: findByCodigo,
    nextCodigo: nextCodigo,
    add: add,
    update: update,
    toggleAtivo: toggleAtivo
  };
})();
