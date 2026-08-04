/* ══════════════════════════════════════════════════════════
   window.NiveloEmitente — dados fixos da empresa/produtor emissor das notas
   fiscais (CNPJ/CPF + Endereço), usados na seção "Emitente" de Nova Nota
   Fiscal. Mesma convenção IIFE de produtos-data.js/cadastros-data.js.

   Este protótipo não tem uma tela de "Minha conta"/onboarding de empresa
   ainda (é um stub na Sidebar, `data-nav="config-minha-conta"`, sem
   destino) — por isso não existe um cadastro real de onde puxar esses
   dados hoje. `getEmitente()` retorna um registro fixo simulando o que
   viria desse cadastro quando existir; a seção "Emitente" do formulário só
   exibe (nunca edita) esses campos, exatamente como pedido ("não solicitar
   que o usuário redigite manualmente informações que já estão disponíveis
   no cadastro"). */
(function () {
  'use strict';

  var EMITENTE = {
    razaoSocial: 'Fazenda Nivelo Agropecuária Ltda',
    documento: '12.345.678/0001-90',
    endereco: 'Rodovia BR-262, Km 45, s/n · Zona Rural · Uberlândia/MG · CEP 38400-000'
  };

  function getEmitente() {
    return EMITENTE;
  }

  window.NiveloEmitente = {
    getEmitente: getEmitente
  };
})();
