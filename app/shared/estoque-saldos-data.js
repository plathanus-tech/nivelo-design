/* ══════════════════════════════════════════════════════════
   window.NiveloEstoqueSaldos — saldo disponível por Produto + Depósito.

   O módulo de Estoque (`estoque.js`) não expõe nenhum estado em `window`
   (dado vive só dentro do próprio arquivo, ver histórico do projeto) e as
   linhas de Vendas nem sequer têm quebra por depósito — não há hoje uma
   fonte real de "saldo por produto+depósito" pra ler. Pedido de Venda
   precisa desse número (campo "Saldo disponível" da seção Produto e
   estoque), então este módulo é um lookup próprio, deliberadamente
   isolado (mesmo raciocínio já usado pra `estoqueAtual` em
   `produtos-data.js`), cruzando `window.NiveloProdutos` (produtos com
   `controlaEstoque`) com `window.NiveloLocais` (catálogo real de
   depósitos usado em "Novo registro de estoque").

   Combinações sem saldo seed caem num fallback determinístico (hash do
   par sku+depósito), nunca aleatório de verdade — a mesma combinação
   sempre retorna o mesmo saldo dentro da sessão. ══════════════════════ */
window.NiveloEstoqueSaldos = (function () {
  'use strict';

  // Seed pros pares mais prováveis de aparecer numa demonstração — o
  // fallback hash cobre qualquer combinação fora desta lista.
  var SEED = {
    'PRD-001|Armazém da Fazenda': 620,
    'PRD-001|Fazenda São João': 430,
    'PRD-002|Fazenda São João': 380,
    'PRD-002|Armazém da Fazenda': 260,
    'PRD-003|Fazenda São João': 180,
    'PRD-004|Fazenda Boa Vista': 90,
    'PRD-006|Galpão 1': 340
  };

  function hashSaldo(key) {
    var hash = 0;
    for (var i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return hash % 450;
  }

  function getSaldo(produtoSku, depositoNome) {
    if (!produtoSku || !depositoNome) return null;
    var key = produtoSku + '|' + depositoNome;
    if (Object.prototype.hasOwnProperty.call(SEED, key)) return SEED[key];
    return hashSaldo(key);
  }

  return { getSaldo: getSaldo };
})();
