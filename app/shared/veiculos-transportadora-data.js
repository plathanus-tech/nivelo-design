/* ══════════════════════════════════════════════════════════
   window.NiveloVeiculosTransportadora — veículos vinculados a cada
   transportadora, pro campo "Veículo / Placa" de Pedido de Venda (só
   mostra os veículos da transportadora selecionada).

   `window.NiveloCadastros` (Cadastro de Pessoas e Empresas) não modela
   frota — o repeater de "Veículos/Placas" em `novo-cadastro.js` existe só
   dentro do FORMULÁRIO daquele cadastro, nunca persistido no registro em
   si (confirmado lendo `cadastros-data.js`: nenhum campo `veiculos`).
   Como o Pedido de Venda precisa filtrar veículos por transportadora de
   verdade, este é um catálogo próprio e isolado (mesmo raciocínio já
   usado pra `estoqueAtual` em `produtos-data.js`/saldo em
   `estoque-saldos-data.js`), chaveado pelo `codigo` real de
   `cadastros-data.js`. Combinações fora do seed caem num fallback
   determinístico (1 veículo plausível, nunca vazio), pra qualquer
   transportadora cadastrada futuramente já ter algo pra mostrar aqui.
   ══════════════════════════════════════════════════════════ */
window.NiveloVeiculosTransportadora = (function () {
  'use strict';

  var SEED = {
    'T-4001': [{ placa: 'RBT-1A23', modelo: 'Volvo FH 540' }, { placa: 'RBT-4B56', modelo: 'Scania R450' }],
    'CT-5001': [{ placa: 'GEX-7C89', modelo: 'Mercedes-Benz Actros' }],
    'FT-6001': [{ placa: 'LFD-2D34', modelo: 'Volkswagen Constellation' }],
    'CFT-7001': [{ placa: 'ABC-1D23', modelo: 'Scania R450' }, { placa: 'ABC-5E67', modelo: 'Volvo FH 460' }],
    'T-4010': [{ placa: 'TRC-3F45', modelo: 'DAF XF' }],
    'CT-5010': [{ placa: 'FTP-8G12', modelo: 'Mercedes-Benz Actros' }],
    'FT-6010': [{ placa: 'DVL-6H78', modelo: 'Volvo FH 540' }],
    'CFT-7010': [{ placa: 'GNA-9I01', modelo: 'Scania R450' }],
    'T-4011': [{ placa: 'TAL-4J56', modelo: 'Iveco Way' }]
  };

  var MODELOS_FALLBACK = ['Volvo FH 460', 'Scania R450', 'Mercedes-Benz Actros', 'DAF XF', 'Iveco Way'];

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h;
  }

  function fallbackVeiculos(codigo) {
    var h = hash(codigo);
    var placaLetras = String.fromCharCode(65 + (h % 26)) + String.fromCharCode(65 + ((h >> 5) % 26)) + String.fromCharCode(65 + ((h >> 10) % 26));
    var placaNumeros = String((h % 9000) + 1000);
    return [{ placa: placaLetras + '-' + placaNumeros.slice(0, 1) + placaNumeros.slice(1), modelo: MODELOS_FALLBACK[h % MODELOS_FALLBACK.length] }];
  }

  function listByTransportadora(codigo) {
    if (!codigo) return [];
    return SEED[codigo] || fallbackVeiculos(codigo);
  }

  return { listByTransportadora: listByTransportadora };
})();
