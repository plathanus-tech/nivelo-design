// ---------- window.NiveloEstoqueCompras ----------
// Fonte única e compartilhada do array COMPRAS (antes vivia só dentro do IIFE
// de `estoque.js`, sem export nenhum) — extraído pra este arquivo próprio pra
// que uma tela nova (Relatório de Compras) possa ler os mesmos dados sem
// nenhum risco de rodar o código de DOM/eventos de `estoque.js` (que assume
// os elementos da tela de Estoque de Uso existirem). `estoque.js` também
// carrega este arquivo e lê a partir de `window.NiveloEstoqueCompras.list()`
// em vez de manter o array localmente — mesma fonte, sem duplicação de dado.
//
// Shape de cada entrada (idêntico ao já documentado em `estoque.js`):
// { codigo, produto, sku, unidade, quantidadeInicial, quantidade,
//   tipoEntrada:'manual'|'xml', fornecedor (nullable), valorUnitario
//   (nullable, reais), deposito (nullable), dataEntrada (ISO), historico:[...] }
//
// Seed expandido (round de Relatório de Compras): os 3 registros originais
// (CMP-001/002/003) foram mantidos INTACTOS (nenhum campo removido/alterado)
// e ganharam companhia de novas compras do MESMO produto em meses diferentes
// (Adubo/Semente/Defensivo), além de 2 produtos novos (Calcário/Fungicida)
// com histórico próprio de compras — o objetivo é ter pelo menos 3 produtos
// com 2+ eventos de compra, o suficiente pra demonstrar variação de preço ao
// longo do tempo por produto no relatório novo. `historico` de cada entrada
// nova segue o mesmo padrão seed já usado nas 3 originais (1 entrada
// `'entrada'` representando o registro inicial da compra).
//
// `categoriaCodigo` (round de filtros do Relatório de Compras, campo NOVO e
// ADITIVO — nenhum consumidor existente de COMPRAS lê/depende dele, e nenhum
// campo já documentado acima foi tocado): referencia um código real de
// `window.NiveloCategoriasFinanceiras.list()`. O catálogo hoje só tem UMA
// categoria de despesa que descreve compra de insumo agrícola de verdade
// (`CAT-003`, "Compra de fertilizantes") — as demais despesas cadastradas
// (Combustível/Energia elétrica/Impostos sobre a produção/Taxas bancárias)
// não descrevem uma COMPRA de produto de estoque, então não fazem sentido
// aqui. Por isso todo produto (Adubo/Semente/Defensivo/Calcário/Fungicida)
// foi classificado em `CAT-003` — decisão deliberada dado o catálogo
// existente, não um valor inventado (instrução explícita: nunca criar um
// código de categoria novo só pra esta tela).
(function () {
  'use strict';

  var COMPRAS = [
    { codigo: 'CMP-001', produto: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidadeInicial: 200, quantidade: 200, tipoEntrada: 'manual', fornecedor: 'Agropecuária Bom Plantio', valorUnitario: 85, deposito: 'Depósito Central', dataEntrada: '2026-06-05', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 200, data: '2026-06-05', observacao: null }] },
    { codigo: 'CMP-002', produto: 'Semente', sku: 'PRD-007', unidade: 'Kg', quantidadeInicial: 500, quantidade: 500, tipoEntrada: 'xml', fornecedor: 'Sementes Vale Verde', valorUnitario: 12.5, deposito: 'Depósito Norte', dataEntrada: '2026-06-20', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 500, data: '2026-06-20', observacao: null }] },
    { codigo: 'CMP-003', produto: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidadeInicial: 100, quantidade: 100, tipoEntrada: 'manual', fornecedor: null, valorUnitario: null, deposito: null, dataEntrada: '2026-07-08', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 100, data: '2026-07-08', observacao: null }] },

    // Adubo: mais 2 compras, meses diferentes (Jan/Mar), preço variando.
    { codigo: 'CMP-004', produto: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidadeInicial: 150, quantidade: 150, tipoEntrada: 'manual', fornecedor: 'Agropecuária Bom Plantio', valorUnitario: 78, deposito: 'Depósito Central', dataEntrada: '2026-01-12', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 150, data: '2026-01-12', observacao: null }] },
    { codigo: 'CMP-005', produto: 'Adubo', sku: 'PRD-006', unidade: 'Saca', quantidadeInicial: 180, quantidade: 180, tipoEntrada: 'manual', fornecedor: 'Agropecuária Bom Plantio', valorUnitario: 92, deposito: 'Depósito Central', dataEntrada: '2026-03-18', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 180, data: '2026-03-18', observacao: null }] },

    // Semente: mais 2 compras (Fev/Abr).
    { codigo: 'CMP-006', produto: 'Semente', sku: 'PRD-007', unidade: 'Kg', quantidadeInicial: 400, quantidade: 400, tipoEntrada: 'manual', fornecedor: 'Sementes Vale Verde', valorUnitario: 11, deposito: 'Depósito Norte', dataEntrada: '2026-02-05', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 400, data: '2026-02-05', observacao: null }] },
    { codigo: 'CMP-007', produto: 'Semente', sku: 'PRD-007', unidade: 'Kg', quantidadeInicial: 350, quantidade: 350, tipoEntrada: 'manual', fornecedor: 'Sementes Vale Verde', valorUnitario: 13.2, deposito: 'Depósito Norte', dataEntrada: '2026-04-22', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 350, data: '2026-04-22', observacao: null }] },

    // Defensivo: mais 2 compras (Jan/Mai) — a compra original (CMP-003) não
    // tem `valorUnitario` (nunca foi informado), mantido como está.
    { codigo: 'CMP-008', produto: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidadeInicial: 80, quantidade: 80, tipoEntrada: 'manual', fornecedor: 'Defensivos Rurais Ltda', valorUnitario: 45, deposito: 'Depósito Central', dataEntrada: '2026-01-25', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 80, data: '2026-01-25', observacao: null }] },
    { codigo: 'CMP-009', produto: 'Defensivo', sku: 'PRD-008', unidade: 'Litro', quantidadeInicial: 90, quantidade: 90, tipoEntrada: 'manual', fornecedor: 'Defensivos Rurais Ltda', valorUnitario: 42, deposito: 'Depósito Central', dataEntrada: '2026-05-10', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 90, data: '2026-05-10', observacao: null }] },

    // Calcário: produto novo, 3 compras (Jan/Abr/Jul).
    { codigo: 'CMP-010', produto: 'Calcário', sku: 'PRD-011', unidade: 'Saca', quantidadeInicial: 300, quantidade: 300, tipoEntrada: 'manual', fornecedor: 'Calcários do Sul', valorUnitario: 60, deposito: 'Depósito Central', dataEntrada: '2026-01-08', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 300, data: '2026-01-08', observacao: null }] },
    { codigo: 'CMP-011', produto: 'Calcário', sku: 'PRD-011', unidade: 'Saca', quantidadeInicial: 250, quantidade: 250, tipoEntrada: 'manual', fornecedor: 'Calcários do Sul', valorUnitario: 65, deposito: 'Depósito Central', dataEntrada: '2026-04-14', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 250, data: '2026-04-14', observacao: null }] },
    { codigo: 'CMP-012', produto: 'Calcário', sku: 'PRD-011', unidade: 'Saca', quantidadeInicial: 280, quantidade: 280, tipoEntrada: 'manual', fornecedor: 'Calcários do Sul', valorUnitario: 58, deposito: 'Depósito Central', dataEntrada: '2026-07-01', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 280, data: '2026-07-01', observacao: null }] },

    // Fungicida: produto novo, 2 compras (Fev/Jun).
    { codigo: 'CMP-013', produto: 'Fungicida', sku: 'PRD-012', unidade: 'Litro', quantidadeInicial: 60, quantidade: 60, tipoEntrada: 'manual', fornecedor: 'Defensivos Rurais Ltda', valorUnitario: 38, deposito: 'Depósito Norte', dataEntrada: '2026-02-20', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 60, data: '2026-02-20', observacao: null }] },
    { codigo: 'CMP-014', produto: 'Fungicida', sku: 'PRD-012', unidade: 'Litro', quantidadeInicial: 55, quantidade: 55, tipoEntrada: 'manual', fornecedor: 'Defensivos Rurais Ltda', valorUnitario: 41.5, deposito: 'Depósito Norte', dataEntrada: '2026-06-10', categoriaCodigo: 'CAT-003', historico: [{ tipo: 'entrada', quantidade: 55, data: '2026-06-10', observacao: null }] }
  ];

  window.NiveloEstoqueCompras = {
    list: function () {
      return COMPRAS.slice();
    }
  };
})();
