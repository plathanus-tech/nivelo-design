/* ══════════════════════════════════════════════════════════
   window.NiveloUnidadesMedida — catálogo central de unidades de medida
   (Configuração > Unidade de medida). Mesma convenção IIFE de
   categorias-financeiras-data.js/produtos-data.js — módulo próprio,
   consumido por unidades-medida.html (listagem), nova-unidade-medida.html
   (cadastro/edição) e, a partir desta rodada, também por novo-produto.js
   (campo "Unidade de Medida" do cadastro de produto passa a ler daqui, em
   vez do vocabulário fixo CX/UN/KG/LT/PT/FR/SC que estava hardcoded na
   própria tela — ver comentário em novo-produto.js).

   Cada unidade: {
     sigla,                  // 'KG' — chave única, sempre maiúscula (ex.: SC, CX, FD, GL)
     nome,                   // nome livre (ex.: "Saca", "Caixa") — é o que aparece na
                              // coluna "Descrição" da listagem (nomenclatura da própria
                              // tela: o campo se chama "Nome" no formulário, mas é exibido
                              // sob o cabeçalho "Descrição" na tabela)
     descricaoComplementar,  // opcional, texto livre complementar (ex.: "Caixa com 50
                              // unidades") — não aparece como coluna própria da tabela
     correspondeA,           // número — quantas unidades base 1 desta unidade representa
     unidadeBaseSigla,       // sigla de uma unidade "sistema" (KG/LT/UN) usada como
                              // referência de conversão
     ativo,                  // boolean — nunca é excluída de verdade, só ativada/
                              // desativada (mesmo padrão de Categorias/Talhões)
     sistema                 // boolean — true só para KG/LT/UN (unidades base do
                              // sistema): não podem ser excluídas, editadas nem
                              // desativadas — Ações mostra só "Padrão do sistema"
   }

   Unidade de conceito importante (ver observação de UX do pedido original):
   o termo técnico "fator de conversão" nunca aparece na interface — a ideia
   é sempre apresentada como a frase "1 unidade corresponde a X <unidade
   base>", pra não presumir que a conversão é sempre pra KG e pra caber
   qualquer tipo de produto/unidade. */
(function () {
  'use strict';

  var UNIDADES = [
    { sigla: 'KG', nome: 'Quilograma', descricaoComplementar: '', correspondeA: 1, unidadeBaseSigla: 'KG', ativo: true, sistema: true },
    { sigla: 'LT', nome: 'Litro', descricaoComplementar: '', correspondeA: 1, unidadeBaseSigla: 'LT', ativo: true, sistema: true },
    { sigla: 'UN', nome: 'Unidade', descricaoComplementar: '', correspondeA: 1, unidadeBaseSigla: 'UN', ativo: true, sistema: true },
    // Unidades customizadas de exemplo (seed, não fazem parte do pedido de
    // "unidades padrão do sistema" — são só dados de demonstração, editáveis/
    // desativáveis normalmente, mesmo espírito dos exemplos do pedido original
    // "Caixa com 50 unidades"/"Saca de 60 kg").
    { sigla: 'SC', nome: 'Saca', descricaoComplementar: 'Saca de 60 kg', correspondeA: 60, unidadeBaseSigla: 'KG', ativo: true, sistema: false },
    { sigla: 'CX', nome: 'Caixa', descricaoComplementar: 'Caixa com 50 unidades', correspondeA: 50, unidadeBaseSigla: 'UN', ativo: true, sistema: false }
  ];

  function list() {
    return UNIDADES;
  }

  function findBySigla(sigla) {
    var norm = (sigla || '').trim().toUpperCase();
    return UNIDADES.filter(function (u) { return u.sigla === norm; })[0] || null;
  }

  // Unidades disponíveis pro dropdown "Unidade base" — só as unidades
  // "sistema" (KG/LT/UN) servem de referência de conversão pra outras
  // unidades, nunca uma unidade customizada (Saca não pode ser base de
  // Caixa, por exemplo — evitaria uma cadeia de conversão indireta que este
  // protótipo não resolve).
  function listBase() {
    return UNIDADES.filter(function (u) { return u.sistema; });
  }

  function isSiglaDuplicada(sigla, ignoreSigla) {
    var norm = (sigla || '').trim().toUpperCase();
    if (!norm) return false;
    return UNIDADES.some(function (u) { return u.sigla === norm && u.sigla !== ignoreSigla; });
  }

  function add(payload) {
    var unidade = {
      sigla: (payload.sigla || '').trim().toUpperCase(),
      nome: (payload.nome || '').trim(),
      descricaoComplementar: (payload.descricaoComplementar || '').trim(),
      correspondeA: Number(payload.correspondeA),
      unidadeBaseSigla: payload.unidadeBaseSigla,
      ativo: payload.ativo !== false,
      sistema: false
    };
    UNIDADES.push(unidade);
    return unidade;
  }

  function update(sigla, payload) {
    var unidade = findBySigla(sigla);
    if (!unidade || unidade.sistema) return null;
    unidade.nome = (payload.nome || '').trim();
    unidade.descricaoComplementar = (payload.descricaoComplementar || '').trim();
    unidade.correspondeA = Number(payload.correspondeA);
    unidade.unidadeBaseSigla = payload.unidadeBaseSigla;
    unidade.ativo = !!payload.ativo;
    return unidade;
  }

  // Ativar/Desativar: nunca exclui de verdade (mesma regra de Categorias/
  // Talhões) — bloqueado pra unidades "sistema" (KG/LT/UN nunca podem ficar
  // inativas, já que outras unidades dependem delas como referência).
  function toggleAtivo(sigla) {
    var unidade = findBySigla(sigla);
    if (!unidade || unidade.sistema) return null;
    unidade.ativo = !unidade.ativo;
    return unidade;
  }

  window.NiveloUnidadesMedida = {
    list: list,
    findBySigla: findBySigla,
    listBase: listBase,
    isSiglaDuplicada: isSiglaDuplicada,
    add: add,
    update: update,
    toggleAtivo: toggleAtivo
  };
})();
