// Catálogo central de Usuários do painel administrativo (`window.NiveloUsuarios`), mesma
// convenção IIFE já usada em todo o produto (ex. app/shared/fazendas-data.js). Perfil é um enum
// fechado de 2 valores (administrador/suporte, pedido explícito) — nenhum outro perfil inventado.
window.NiveloUsuarios = (function () {
  'use strict';

  var USUARIOS = [
    { id: 1, nome: 'Miguel Fernando da Silva', email: 'miguel.silva@nivelo.com.br', perfil: 'administrador', ativo: true },
    { id: 2, nome: 'Ana Paula Rodrigues', email: 'ana.rodrigues@nivelo.com.br', perfil: 'administrador', ativo: true },
    { id: 3, nome: 'Bruno Cesar Martins', email: 'bruno.martins@nivelo.com.br', perfil: 'suporte', ativo: true },
    { id: 4, nome: 'Carla Menezes Souza', email: 'carla.souza@nivelo.com.br', perfil: 'suporte', ativo: true },
    { id: 5, nome: 'Diego Almeida Ferreira', email: 'diego.ferreira@nivelo.com.br', perfil: 'suporte', ativo: false },
    { id: 6, nome: 'Fernanda Lima Barros', email: 'fernanda.barros@nivelo.com.br', perfil: 'administrador', ativo: false },
    { id: 7, nome: 'Gustavo Pereira Nunes', email: 'gustavo.nunes@nivelo.com.br', perfil: 'suporte', ativo: true }
  ];

  function list() {
    return USUARIOS;
  }

  function findById(id) {
    return USUARIOS.filter(function (u) { return u.id === Number(id); })[0] || null;
  }

  function nextId() {
    return USUARIOS.reduce(function (acc, u) { return Math.max(acc, u.id); }, 0) + 1;
  }

  function isEmailDuplicado(email) {
    var normalized = (email || '').trim().toLowerCase();
    return USUARIOS.some(function (u) { return u.email.toLowerCase() === normalized; });
  }

  function add(payload) {
    var usuario = {
      id: nextId(),
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil,
      ativo: true
    };
    USUARIOS.push(usuario);
    return usuario;
  }

  function toggleAtivo(id) {
    var usuario = findById(id);
    if (!usuario) return null;
    usuario.ativo = !usuario.ativo;
    return usuario;
  }

  return {
    list: list,
    findById: findById,
    nextId: nextId,
    isEmailDuplicado: isEmailDuplicado,
    add: add,
    toggleAtivo: toggleAtivo
  };
})();
