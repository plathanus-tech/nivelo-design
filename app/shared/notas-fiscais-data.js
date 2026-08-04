/* ══════════════════════════════════════════════════════════
   window.NiveloNotasFiscais — catálogo central das notas fiscais (saída e
   entrada), consumido por notas-fiscais.html (Central de Notas Fiscais) e
   nova-nota-fiscal.html (criação/correção/visualização). Mesma convenção
   IIFE de produtos-data.js/categorias-financeiras-data.js.

   Cada nota: {
     numero,             // 'NF-1001' — auto-gerado, sequencial por tipo (saída/entrada
                          // têm sequências independentes, como numeração fiscal real)
     tipo,               // 'saida' | 'entrada'
     dataEmissao,        // 'AAAA-MM-DD'
     clienteNome,        // só quando tipo='saida' (destinatário)
     clienteDocumento,
     fornecedorNome,     // só quando tipo='entrada' (remetente)
     fornecedorDocumento,
     uf,
     valor,              // total calculado a partir dos itens no momento da emissão
     status,             // 'pendente' | 'emitida' | 'cancelada' | 'rejeitada'
     motivoRejeicao,     // string explicando a rejeição/erro — só quando status='rejeitada'
     itens,              // [{ produtoNome, sku, unidade, quantidade, preco }]
     meioPagamento,
     categoriaCodigo,    // código de uma categoria de receita (categorias-financeiras-data.js)
     transportadoraNome, // opcional
     observacao,         // opcional
     tipoOperacao,       // código de natureza-operacao-data.js
     cfop                // derivado do tipoOperacao no momento da emissão
   }

   Notas de entrada: este protótipo não tem um fluxo manual de criação pra
   elas (decisão explícita do pedido — a entrada real virá de uma
   integração via API no futuro). Por isso `add()`/correção só se aplicam a
   notas de saída; as notas de entrada existem aqui só como dado seed,
   simulando o que a integração já teria trazido. */
(function () {
  'use strict';

  var NOTAS = [
    { numero: 'NF-1001', tipo: 'saida', dataEmissao: '2026-07-10', clienteNome: 'Cerealista Bom Grão S.A.', clienteDocumento: '98.765.432/0001-10', uf: 'SP', valor: 74400, status: 'emitida', motivoRejeicao: null,
      itens: [{ produtoNome: 'Soja', sku: 'PRD-001', unidade: 'Saca', quantidade: 1240, preco: 60 }],
      meioPagamento: 'boleto', categoriaCodigo: 'CAT-001', transportadoraNome: 'TransRural Logística Ltda', observacao: '', tipoOperacao: 'venda-dentro-estado', cfop: '5102' },
    { numero: 'NF-1002', tipo: 'saida', dataEmissao: '2026-07-15', clienteNome: 'Maria Aparecida Souza', clienteDocumento: '123.456.789-00', uf: 'SP', valor: 12600, status: 'emitida', motivoRejeicao: null,
      itens: [{ produtoNome: 'Milho', sku: 'PRD-002', unidade: 'Saca', quantidade: 420, preco: 30 }],
      meioPagamento: 'pix', categoriaCodigo: 'CAT-002', transportadoraNome: null, observacao: '', tipoOperacao: 'venda-dentro-estado', cfop: '5102' },
    { numero: 'NF-1003', tipo: 'saida', dataEmissao: '2026-07-22', clienteNome: 'Agropecuária Central Ltda', clienteDocumento: '55.666.777/0001-88', uf: 'MG', valor: 5400, status: 'pendente', motivoRejeicao: null,
      itens: [{ produtoNome: 'Trigo', sku: 'PRD-003', unidade: 'Saca', quantidade: 90, preco: 60 }],
      meioPagamento: 'transferencia', categoriaCodigo: 'CAT-001', transportadoraNome: 'Grãos Express Transportes Ltda', observacao: 'Aguardando confirmação da SEFAZ.', tipoOperacao: 'venda-fora-estado', cfop: '6102' },
    { numero: 'NF-1004', tipo: 'saida', dataEmissao: '2026-07-24', clienteNome: 'Fazenda Boa Esperança Agropecuária Ltda', clienteDocumento: '21.345.679/0001-01', uf: 'SP', valor: 8900, status: 'rejeitada',
      motivoRejeicao: 'CNPJ do destinatário divergente do cadastrado na Receita Federal.',
      itens: [{ produtoNome: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidade: 178, preco: 50 }],
      meioPagamento: 'boleto', categoriaCodigo: 'CAT-002', transportadoraNome: null, observacao: '', tipoOperacao: 'venda-dentro-estado', cfop: '5102' },
    { numero: 'NF-1005', tipo: 'saida', dataEmissao: '2026-06-28', clienteNome: 'Wellington Souza Prado', clienteDocumento: '901.234.567-09', uf: 'SP', valor: 3200, status: 'cancelada', motivoRejeicao: null,
      itens: [{ produtoNome: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidade: 40, preco: 80 }],
      meioPagamento: 'cartao-credito', categoriaCodigo: 'CAT-001', transportadoraNome: null, observacao: 'Cancelada a pedido do cliente.', tipoOperacao: 'venda-dentro-estado', cfop: '5102' },
    { numero: 'NF-1006', tipo: 'saida', dataEmissao: '2026-07-27', clienteNome: 'Joaquina Pereira Lima', clienteDocumento: '456.789.123-04', uf: 'SP', valor: 6600, status: 'rejeitada',
      motivoRejeicao: 'Falha de comunicação com a SEFAZ no momento da transmissão. Tente emitir novamente.',
      itens: [{ produtoNome: 'Sorgo', sku: 'PRD-004', unidade: 'Saca', quantidade: 110, preco: 60 }],
      meioPagamento: 'dinheiro', categoriaCodigo: 'CAT-002', transportadoraNome: 'Transportadora Altinópolis Ltda', observacao: '', tipoOperacao: 'remessa', cfop: '5905' }
  ];

  var seqSaida = 1006;
  var seqEntrada = 2003;

  var NOTAS_ENTRADA_SEED = [
    { numero: 'NF-2001', tipo: 'entrada', dataEmissao: '2026-07-12', fornecedorNome: 'Insumos Agrícolas Vale Ltda', fornecedorDocumento: '12.345.678/0001-90', uf: 'SP', valor: 15800, status: 'emitida', motivoRejeicao: null,
      itens: [{ produtoNome: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidade: 316, preco: 50 }],
      meioPagamento: 'boleto', categoriaCodigo: null, transportadoraNome: null, observacao: 'Recebida via integração.', tipoOperacao: 'venda-dentro-estado', cfop: '1102' },
    { numero: 'NF-2002', tipo: 'entrada', dataEmissao: '2026-07-20', fornecedorNome: 'Sementes Dumont Ltda', fornecedorDocumento: '89.123.456/0001-78', uf: 'SP', valor: 9400, status: 'pendente', motivoRejeicao: null,
      itens: [{ produtoNome: 'Semente', sku: 'PRD-007', unidade: 'Kg', quantidade: 940, preco: 10 }],
      meioPagamento: 'transferencia', categoriaCodigo: null, transportadoraNome: null, observacao: 'Recebida via integração.', tipoOperacao: 'venda-dentro-estado', cfop: '1102' },
    { numero: 'NF-2003', tipo: 'entrada', dataEmissao: '2026-06-15', fornecedorNome: 'Defensivos & Cia Comércio Ltda', fornecedorDocumento: '22.333.444/0001-55', uf: 'SP', valor: 2200, status: 'cancelada', motivoRejeicao: null,
      itens: [{ produtoNome: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidade: 27.5, preco: 80 }],
      meioPagamento: 'boleto', categoriaCodigo: null, transportadoraNome: null, observacao: 'Recebida via integração.', tipoOperacao: 'venda-dentro-estado', cfop: '1102' }
  ];

  Array.prototype.push.apply(NOTAS, NOTAS_ENTRADA_SEED);

  function list(tipo) {
    return NOTAS.filter(function (n) { return n.tipo === tipo; });
  }

  function findByNumero(numero) {
    return NOTAS.filter(function (n) { return n.numero === numero; })[0] || null;
  }

  function nextNumero(tipo) {
    if (tipo === 'entrada') {
      seqEntrada += 1;
      return 'NF-' + seqEntrada;
    }
    seqSaida += 1;
    return 'NF-' + seqSaida;
  }

  // Cria uma nota de saída já emitida (a validação de Certificado Digital e
  // dos campos obrigatórios acontece no formulário, antes de chamar isto —
  // ver nova-nota-fiscal.js).
  function add(payload) {
    var nota = {
      numero: nextNumero('saida'),
      tipo: 'saida',
      dataEmissao: payload.dataEmissao,
      clienteNome: payload.clienteNome,
      clienteDocumento: payload.clienteDocumento,
      uf: payload.uf,
      valor: payload.valor,
      status: 'emitida',
      motivoRejeicao: null,
      itens: payload.itens,
      meioPagamento: payload.meioPagamento,
      categoriaCodigo: payload.categoriaCodigo,
      transportadoraNome: payload.transportadoraNome || null,
      observacao: payload.observacao || '',
      tipoOperacao: payload.tipoOperacao,
      cfop: payload.cfop
    };
    NOTAS.push(nota);
    return nota;
  }

  // Corrigir nota: reaproveita o mesmo número (é a mesma nota fiscal sendo
  // reenviada, não uma nova) — só notas 'rejeitada' chegam aqui (ver
  // regra de negócio em notas-fiscais.js/nova-nota-fiscal.js).
  function updateAfterCorrecao(numero, payload) {
    var nota = findByNumero(numero);
    if (!nota) return null;
    nota.clienteNome = payload.clienteNome;
    nota.clienteDocumento = payload.clienteDocumento;
    nota.uf = payload.uf;
    nota.valor = payload.valor;
    nota.itens = payload.itens;
    nota.meioPagamento = payload.meioPagamento;
    nota.categoriaCodigo = payload.categoriaCodigo;
    nota.transportadoraNome = payload.transportadoraNome || null;
    nota.observacao = payload.observacao || '';
    nota.tipoOperacao = payload.tipoOperacao;
    nota.cfop = payload.cfop;
    nota.status = 'emitida';
    nota.motivoRejeicao = null;
    return nota;
  }

  // Cria uma nota de entrada a partir do upload de um arquivo XML (sem
  // parsing real neste protótipo — só registra o nome do arquivo). Fica
  // 'pendente' até a futura integração via API processar os dados de
  // verdade (fornecedor/itens/valor ainda não são conhecidos aqui).
  function addEntrada(payload) {
    var nota = {
      numero: nextNumero('entrada'),
      tipo: 'entrada',
      dataEmissao: new Date().toISOString().slice(0, 10),
      fornecedorNome: 'Fornecedor a confirmar',
      fornecedorDocumento: '',
      uf: '',
      valor: 0,
      status: 'pendente',
      motivoRejeicao: null,
      itens: [],
      meioPagamento: null,
      categoriaCodigo: null,
      transportadoraNome: null,
      observacao: 'Nota importada via arquivo XML (' + payload.arquivoNome + '). Aguardando processamento.',
      tipoOperacao: null,
      cfop: null
    };
    NOTAS.push(nota);
    return nota;
  }

  window.NiveloNotasFiscais = {
    list: list,
    findByNumero: findByNumero,
    nextNumero: nextNumero,
    add: add,
    addEntrada: addEntrada,
    updateAfterCorrecao: updateAfterCorrecao
  };
})();
