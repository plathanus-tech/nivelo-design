/* ══════════════════════════════════════════════════════════
   window.NiveloManifestos — catálogo central dos Manifestos de Transporte
   (Fiscal > Manifesto), consumido por manifestos.html (listagem) e
   novo-manifesto.html (criação/edição/visualização). Mesma convenção IIFE
   de notas-fiscais-data.js.

   Cada manifesto: {
     numero,           // 'MAN-0001' — auto-gerado, sequencial
     dataEmissao,      // 'AAAA-MM-DD'
     status,           // 'emitido' | 'cancelado'
     placas,           // [placa1, placa2, placa3] — só placa1 é obrigatória,
                        // placa2/placa3 ficam '' quando não informadas
     motorista: {
       nome,
       documento,      // CPF ou CNPJ, formatado
       endereco: { cep, logradouro, numero, complemento, bairro, cidade, estado }
     },
     origem: { cidade, estado },
     destino: { cidade, estado },
     documentos,       // [{ chaveNF, origem, destino }] — 1 ou mais
     seguro,           // { seguradora, cnpj, apolice, averbacao } | null —
                        // único grupo opcional (pedido explícito); null quando
                        // o usuário não preencheu nenhum dado de seguro
     pagamento: { documento, dadosBancariosPix }
   }

   Emitente NÃO é armazenado no registro — é sempre exibido a partir de
   window.NiveloEmitente (fixo, mesma decisão já usada em Nova Nota Fiscal),
   nunca redigitado nem persistido por manifesto.

   Sem persistência entre páginas (mesma decisão de todo o protótipo) — um
   manifesto criado/editado só existe durante a sessão de JS daquela
   página; ao voltar pra listagem, o script recarrega os dados seed do
   zero. */
(function () {
  'use strict';

  var MANIFESTOS = [
    {
      numero: 'MAN-0001', dataEmissao: '2026-07-20', status: 'emitido',
      placas: ['ABC1D23', 'XYZ9E88', ''],
      motorista: {
        nome: 'José Carlos Fontoura', documento: '789.123.456-07',
        endereco: { cep: '38400-000', logradouro: 'Rua das Palmeiras', numero: '120', complemento: '', bairro: 'Centro', cidade: 'Uberlândia', estado: 'MG' }
      },
      origem: { cidade: 'Uberlândia', estado: 'MG' },
      destino: { cidade: 'Ribeirão Preto', estado: 'SP' },
      documentos: [
        { chaveNF: '31260712345678000190550010000010011234567890', origem: 'Uberlândia/MG', destino: 'Ribeirão Preto/SP' }
      ],
      seguro: { seguradora: 'Porto Seguro Cargas S.A.', cnpj: '61.198.164/0001-60', apolice: 'AP-885210', averbacao: 'AV-004471' },
      pagamento: { documento: '12.345.678/0001-90', dadosBancariosPix: 'PIX: transporte@fazendanivelo.com.br' }
    },
    {
      numero: 'MAN-0002', dataEmissao: '2026-07-25', status: 'emitido',
      placas: ['JKL4M56', '', ''],
      motorista: {
        nome: 'Wellington Souza Prado', documento: '901.234.567-09',
        endereco: { cep: '14401-000', logradouro: 'Avenida Brasil', numero: '540', complemento: 'Galpão 3', bairro: 'Ipiranga', cidade: 'Franca', estado: 'SP' }
      },
      origem: { cidade: 'Franca', estado: 'SP' },
      destino: { cidade: 'Uberaba', estado: 'MG' },
      documentos: [
        { chaveNF: '35260798765432000110550020000020021234567891', origem: 'Franca/SP', destino: 'Uberaba/MG' }
      ],
      seguro: null,
      pagamento: { documento: '901.234.567-09', dadosBancariosPix: 'Banco do Brasil, Ag. 1234-5, CC 67890-1' }
    },
    {
      numero: 'MAN-0003', dataEmissao: '2026-06-30', status: 'cancelado',
      placas: ['NOP7Q89', 'RST2U34', 'VWX5Y67'],
      motorista: {
        nome: 'Antônio Carlos Pereira', documento: '345.678.901-22',
        endereco: { cep: '38180-000', logradouro: 'Rua Sete de Setembro', numero: '85', complemento: '', bairro: 'Vila Nova', cidade: 'Araxá', estado: 'MG' }
      },
      origem: { cidade: 'Araxá', estado: 'MG' },
      destino: { cidade: 'Uberlândia', estado: 'MG' },
      documentos: [
        { chaveNF: '31260655544433000122550030000030031234567892', origem: 'Araxá/MG', destino: 'Uberlândia/MG' },
        { chaveNF: '31260655544433000122550030000030041234567893', origem: 'Araxá/MG', destino: 'Uberlândia/MG' }
      ],
      seguro: { seguradora: 'Tokio Marine Seguradora S.A.', cnpj: '33.164.021/0001-00', apolice: 'AP-119983', averbacao: 'AV-002210' },
      pagamento: { documento: '12.345.678/0001-90', dadosBancariosPix: 'PIX: transporte@fazendanivelo.com.br' }
    }
  ];

  var seq = 3;

  function list() {
    return MANIFESTOS;
  }

  function findByNumero(numero) {
    return MANIFESTOS.filter(function (m) { return m.numero === numero; })[0] || null;
  }

  function nextNumero() {
    seq += 1;
    var padded = String(seq);
    while (padded.length < 4) padded = '0' + padded;
    return 'MAN-' + padded;
  }

  function add(payload) {
    var manifesto = {
      numero: nextNumero(),
      dataEmissao: payload.dataEmissao,
      status: 'emitido',
      placas: payload.placas,
      motorista: payload.motorista,
      origem: payload.origem,
      destino: payload.destino,
      documentos: payload.documentos,
      seguro: payload.seguro || null,
      pagamento: payload.pagamento
    };
    MANIFESTOS.push(manifesto);
    return manifesto;
  }

  // Edição: reaproveita o mesmo número (é o mesmo manifesto sendo
  // corrigido, não um novo) — mesmo raciocínio de updateAfterCorrecao()
  // em notas-fiscais-data.js.
  function update(numero, payload) {
    var manifesto = findByNumero(numero);
    if (!manifesto) return null;
    manifesto.dataEmissao = payload.dataEmissao;
    manifesto.placas = payload.placas;
    manifesto.motorista = payload.motorista;
    manifesto.origem = payload.origem;
    manifesto.destino = payload.destino;
    manifesto.documentos = payload.documentos;
    manifesto.seguro = payload.seguro || null;
    manifesto.pagamento = payload.pagamento;
    return manifesto;
  }

  function cancelar(numero) {
    var manifesto = findByNumero(numero);
    if (!manifesto) return null;
    manifesto.status = 'cancelado';
    return manifesto;
  }

  window.NiveloManifestos = {
    list: list,
    findByNumero: findByNumero,
    nextNumero: nextNumero,
    add: add,
    update: update,
    cancelar: cancelar
  };
})();
