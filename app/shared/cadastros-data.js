// Catálogo compartilhado de Cadastro de Pessoas e Empresas — cópia paralela
// deliberada dos mesmos registros fictícios já usados em `cadastros.html`
// (que continua 100% baseada em DOM, intocada; nenhum dos dois lê do outro).
// Mesmo raciocínio já usado em `detalhe-estoque.js` pra dados-seed
// duplicados: cada tela mantém sua própria cópia do CONTEÚDO, sem módulo de
// estado compartilhado de verdade entre páginas. `tipo` é sempre um array
// (um cadastro pode ser Cliente + Fornecedor, por exemplo). Registros com
// `status: "excluido"` (soft delete) ficam fora de `list()`/`findByTipo()`
// — um cadastro excluído não deve aparecer como opção pra um registro novo.
// `inscricaoEstadual`/`telefone`/`endereco` (aditivos, round Pedidos de
// Venda): nenhum consumidor existente lia esses campos, então só alguns
// registros seed foram preenchidos (os prováveis de aparecer numa
// demonstração) — os demais ficam `undefined`, e quem consome trata isso
// como "—", nunca quebra.
window.NiveloCadastros = (function () {
  'use strict';

  var CADASTROS = [
    { nome: "Maria Aparecida Souza", codigo: "C-1001", tipo: ["cliente"], status: "ativo", documento: "123.456.789-00", cidade: "Ribeirão Preto/SP", inscricaoEstadual: "Isento", telefone: "(16) 99811-2233", endereco: "Rua das Palmeiras, 245 - Ribeirão Preto/SP" },
    { nome: "Insumos Agrícolas Vale Ltda", codigo: "F-2001", tipo: ["fornecedor"], status: "ativo", documento: "12.345.678/0001-90", cidade: "Sertãozinho/SP" },
    { nome: "Cerealista Bom Grão S.A.", codigo: "CF-3001", tipo: ["cliente","fornecedor"], status: "ativo", documento: "98.765.432/0001-10", cidade: "Barretos/SP", inscricaoEstadual: "123.456.789.110", telefone: "(17) 3322-4455", endereco: "Av. dos Cereais, 800 - Barretos/SP" },
    { nome: "TransRural Logística Ltda", codigo: "T-4001", tipo: ["transportadora"], status: "ativo", documento: "11.222.333/0001-44", cidade: "Franca/SP" },
    { nome: "João Batista Oliveira", codigo: "C-1002", tipo: ["cliente"], status: "inativo", documento: "234.567.890-11", cidade: "Orlândia/SP" },
    { nome: "Defensivos & Cia Comércio Ltda", codigo: "F-2002", tipo: ["fornecedor"], status: "excluido", documento: "22.333.444/0001-55", cidade: "Sertãozinho/SP" },
    { nome: "Grãos Express Transportes Ltda", codigo: "CT-5001", tipo: ["cliente","transportadora"], status: "ativo", documento: "33.444.555/0001-66", cidade: "Bebedouro/SP" },
    { nome: "Log Fértil Distribuição Ltda", codigo: "FT-6001", tipo: ["fornecedor","transportadora"], status: "ativo", documento: "44.555.666/0001-77", cidade: "Pradópolis/SP" },
    { nome: "Agropecuária Central Ltda", codigo: "CFT-7001", tipo: ["cliente","fornecedor","transportadora"], status: "ativo", documento: "55.666.777/0001-88", cidade: "Ribeirão Preto/SP", inscricaoEstadual: "223.445.667.100", telefone: "(16) 3255-1188", endereco: "Av. Central, 1200 - Ribeirão Preto/SP" },
    { nome: "Antônio Carlos Pereira", codigo: "F-2003", tipo: ["fornecedor"], status: "ativo", documento: "345.678.901-22", cidade: "Guariba/SP" },
    { nome: "Sebastião Ramos da Silva", codigo: "C-1003", tipo: ["cliente"], status: "excluido", documento: "456.789.012-33", cidade: "Monte Alto/SP" },
    { nome: "Rota do Campo Transportes Ltda", codigo: "T-4002", tipo: ["transportadora"], status: "inativo", documento: "66.777.888/0001-99", cidade: "Taquaritinga/SP" },
    { nome: "Antônio Carlos Ribeiro", codigo: "C-1010", tipo: ["cliente"], status: "ativo", documento: "234.567.891-02", cidade: "Jaboticabal/SP" },
    { nome: "Sebastião Donizete Martins", codigo: "C-1011", tipo: ["cliente"], status: "ativo", documento: "345.678.912-03", cidade: "Batatais/SP" },
    { nome: "Agropecuária Santa Fé Ltda", codigo: "F-2010", tipo: ["fornecedor"], status: "ativo", documento: "12.345.679/0001-01", cidade: "Cravinhos/SP" },
    { nome: "Insumos Cravinhos Comercial Ltda", codigo: "F-2011", tipo: ["fornecedor"], status: "ativo", documento: "23.456.780/0001-12", cidade: "São Joaquim da Barra/SP" },
    { nome: "Transportes Rápido Cerrado Ltda", codigo: "T-4010", tipo: ["transportadora"], status: "ativo", documento: "34.567.891/0001-23", cidade: "Colômbia/SP" },
    { nome: "Cerealista Pontal Ltda", codigo: "CF-3010", tipo: ["cliente","fornecedor"], status: "ativo", documento: "45.678.912/0001-34", cidade: "Pontal/SP" },
    { nome: "Fazenda Transportes Pitangueiras Ltda", codigo: "CT-5010", tipo: ["cliente","transportadora"], status: "ativo", documento: "56.789.123/0001-45", cidade: "Pitangueiras/SP" },
    { nome: "Distribuidora Viradouro Ltda", codigo: "FT-6010", tipo: ["fornecedor","transportadora"], status: "ativo", documento: "67.891.234/0001-56", cidade: "Viradouro/SP" },
    { nome: "Grupo Nuporanga Agro Ltda", codigo: "CFT-7010", tipo: ["cliente","fornecedor","transportadora"], status: "ativo", documento: "78.912.345/0001-67", cidade: "Nuporanga/SP" },
    { nome: "Joaquina Pereira Lima", codigo: "C-1012", tipo: ["cliente"], status: "ativo", documento: "456.789.123-04", cidade: "Jardinópolis/SP" },
    { nome: "Roberto Aparecido Silveira", codigo: "C-1013", tipo: ["cliente"], status: "ativo", documento: "567.891.234-05", cidade: "Serrana/SP" },
    { nome: "Sementes Dumont Ltda", codigo: "F-2012", tipo: ["fornecedor"], status: "ativo", documento: "89.123.456/0001-78", cidade: "Dumont/SP" },
    { nome: "Adubos Cajuru S.A.", codigo: "F-2013", tipo: ["fornecedor"], status: "ativo", documento: "91.234.567/0001-89", cidade: "Cajuru/SP" },
    { nome: "Transportadora Altinópolis Ltda", codigo: "T-4011", tipo: ["transportadora"], status: "ativo", documento: "10.234.568/0001-90", cidade: "Altinópolis/SP" },
    { nome: "Marcos Vinícius Andrade", codigo: "C-1014", tipo: ["cliente"], status: "ativo", documento: "678.912.345-06", cidade: "Brodowski/SP" },
    { nome: "Fazenda Boa Esperança Agropecuária Ltda", codigo: "C-1015", tipo: ["cliente"], status: "ativo", documento: "21.345.679/0001-01", cidade: "Guariba/SP" },
    { nome: "José Carlos Fontoura", codigo: "F-2014", tipo: ["fornecedor"], status: "ativo", documento: "789.123.456-07", cidade: "Monte Alto/SP" },
    { nome: "Comercial Taquaritinga de Grãos Ltda", codigo: "CF-3011", tipo: ["cliente","fornecedor"], status: "ativo", documento: "32.456.780/0001-12", cidade: "Taquaritinga/SP" },
    { nome: "Antônia Ferreira Campos", codigo: "C-1016", tipo: ["cliente"], status: "inativo", documento: "890.123.456-08", cidade: "Bebedouro/SP" },
    { nome: "Máquinas Orlândia Ltda", codigo: "F-2015", tipo: ["fornecedor"], status: "inativo", documento: "43.567.891/0001-23", cidade: "Orlândia/SP" },
    { nome: "Wellington Souza Prado", codigo: "C-1017", tipo: ["cliente"], status: "ativo", documento: "901.234.567-09", cidade: "Franca/SP" },
    { nome: "Laticínios Pradópolis Ltda", codigo: "C-1018", tipo: ["cliente"], status: "ativo", documento: "54.678.912/0001-34", cidade: "Pradópolis/SP" },
    { nome: "Transportes Sertãozinho Ltda", codigo: "T-4012", tipo: ["transportadora"], status: "excluido", documento: "65.789.123/0001-45", cidade: "Sertãozinho/SP" },
    { nome: "Cristiane Aparecida Nunes", codigo: "C-1019", tipo: ["cliente"], status: "ativo", documento: "112.233.445-10", cidade: "Barretos/SP" },
    { nome: "Rações Ribeirão Ltda", codigo: "F-2016", tipo: ["fornecedor"], status: "ativo", documento: "76.891.234/0001-56", cidade: "Ribeirão Preto/SP" }
  ];

  // ---------- Persistência entre páginas (sessionStorage) ----------
  // Mesmo raciocínio/técnica de `fazendas-data.js`: cadastros criados a
  // partir do atalho "+ Cadastrar novo fornecedor" (Nova Conta a Pagar →
  // Novo Cadastro) precisam sobreviver à navegação real entre as duas
  // páginas — sem isso, o fornecedor recém-criado nunca apareceria na lista
  // de opções ao voltar. Guarda só os cadastros CRIADOS na sessão (não
  // duplica o seed).
  var SESSION_KEY = 'nivelo.cadastros.criados';

  (function loadPersisted() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      JSON.parse(raw).forEach(function (c) { CADASTROS.push(c); });
    } catch (e) {}
  })();

  function persist(record) {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      var criados = raw ? JSON.parse(raw) : [];
      criados.push(record);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(criados));
    } catch (e) {}
  }

  function list() {
    return CADASTROS.filter(function (c) { return c.status !== 'excluido'; });
  }

  function findByTipo(tipo) {
    return list().filter(function (c) { return c.tipo.indexOf(tipo) !== -1; });
  }

  function findByCodigo(codigo) {
    return CADASTROS.filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  // Prefixo de código: uma letra por tipo presente, sempre na ordem
  // Cliente/Fornecedor/Transportadora (mesma ordem já usada nos códigos
  // combinados do seed, ex. "CF-3001"/"CFT-7001") + maior número já usado
  // por QUALQUER cadastro com esse mesmo prefixo, +1.
  var PREFIX_LETTER = { cliente: 'C', fornecedor: 'F', transportadora: 'T' };
  function prefixFromTipos(tipos) {
    return ['cliente', 'fornecedor', 'transportadora']
      .filter(function (t) { return tipos.indexOf(t) !== -1; })
      .map(function (t) { return PREFIX_LETTER[t]; })
      .join('');
  }
  function nextCodigo(tipos) {
    var prefix = prefixFromTipos(tipos);
    var max = 0;
    CADASTROS.forEach(function (c) {
      var match = new RegExp('^' + prefix + '-(\\d+)$').exec(c.codigo);
      if (match) max = Math.max(max, Number(match[1]));
    });
    return prefix + '-' + (max + 1);
  }

  // Novo cadastro (atalho "+ Cadastrar novo fornecedor" em Nova Conta a
  // Pagar, ou qualquer outro fluxo futuro de criação) — código auto-gerado,
  // nunca informado pelo usuário; `status` sempre nasce "ativo".
  function add(payload) {
    var record = {
      nome: payload.nome,
      codigo: nextCodigo(payload.tipo),
      tipo: payload.tipo,
      status: 'ativo',
      documento: payload.documento || '',
      cidade: payload.cidade || ''
    };
    CADASTROS.push(record);
    persist(record);
    return record;
  }

  return { list: list, findByTipo: findByTipo, findByCodigo: findByCodigo, add: add };
})();
