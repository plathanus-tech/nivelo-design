/*
 * Dados cadastrais do titular da conta (Minha Conta > Dados). Módulo próprio, separado de
 * emitente-data.js (stub mais antigo, só 3 campos read-only, ainda consumido por Nova Nota
 * Fiscal/Novo Manifesto) — os dois coexistem por design, não há import cruzado entre eles.
 * Sem localStorage/backend: alterações via update() vivem só na sessão de JS da própria página.
 */
(function () {
  'use strict';

  var CONTA = {
    nome: 'Miguel Fernando da Silva',
    documento: '123.456.789-00',
    email: 'miguel.silva@fazendasaojoao.com.br',
    telefone: '+55 (34) 99876-5432',
    cep: '38400-000',
    rua: 'Rodovia BR-262, Km 45',
    numero: 's/n',
    complemento: 'Zona Rural',
    bairro: 'Zona Rural',
    cidade: 'Uberlândia',
    estado: 'MG',
    dataNascimento: '1985-04-12',
    // Só pra validar o fluxo de troca de senha neste protótipo sem backend (compara com o campo
    // "Senha atual" do modal de Segurança) — nunca exibida em nenhuma tela.
    senhaAtualMock: 'Senha@123',
    senhaUltimaAlteracao: '2026-05-12'
  };

  function getConta() {
    return Object.assign({}, CONTA);
  }

  function update(patch) {
    Object.assign(CONTA, patch);
    return getConta();
  }

  window.NiveloMinhaConta = {
    getConta: getConta,
    update: update
  };
})();
