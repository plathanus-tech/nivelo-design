/* ══════════════════════════════════════════════════════════
   window.NiveloCertificadoDigital — Configuração > Fiscal > Certificado
   Digital. Antes era só um stub booleano (`hasCertificado`/`setCertificado`)
   consumido pelo bloqueio de emissão de Nova Nota Fiscal; agora que a tela
   real existe, este módulo ganhou o cadastro completo, mantendo as duas
   funções antigas (assinatura intacta) — `hasCertificado()` passou a
   refletir se existe pelo menos 1 certificado com status "ativo" na lista
   real, mas o override manual via `setCertificado(true)` (usado pela
   variante de demonstração `nova-nota-fiscal.html#state=comcertificado`,
   que não passa por um cadastro de verdade) continua funcionando.

   Convenções seguidas (mesmas do resto do protótipo):
   - Lista de certificados: em memória (mesmo padrão de naturezas-operacao-
     data.js) — não sobrevive a um reload da página.
   - Configuração do Parceiro + histórico de acesso: `localStorage` (catálogo
     compartilhado entre sessões, mesma convenção de categorias-financeiras-
     data.js/safras-data.js), já que é uma configuração de conta, não um
     registro de sessão. */
(function () {
  'use strict';

  var CODIGO_PREFIX = 'CERT';
  var FLAG_KEY = 'nivelo.certificadoDigital.cadastrado';
  var PARCEIRO_KEY = 'nivelo.certificadoDigital.parceiro';
  var HISTORICO_KEY = 'nivelo.certificadoDigital.historicoAcesso';

  var EMITENTE = (window.NiveloEmitente && window.NiveloEmitente.getEmitente()) || {
    razaoSocial: 'Fazenda Nivelo Agropecuária Ltda',
    documento: '12.345.678/0001-90'
  };

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }
  function toISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  var hoje = new Date();

  // Lista começa VAZIA por padrão — mesmo raciocínio já documentado no stub
  // original ("por padrão nenhum certificado está cadastrado, cenário real
  // mais provável pra uma conta nova"), e sobretudo pra não quebrar a
  // demonstração já existente de bloqueio de emissão em Nova Nota Fiscal:
  // `nova-nota-fiscal.html` (sem hash) depende de `hasCertificado()` ser
  // `false` por padrão, com `#state=comcertificado` sendo a variante que
  // simula o caminho de sucesso. Se a lista já nascesse com um certificado
  // "ativo", esse bloqueio nunca apareceria mais no estado padrão. Os
  // exemplos abaixo só entram via `seedExemplo()`, chamado explicitamente
  // por `certificado-digital.js` na variante de demonstração
  // `certificado-digital.html#state=comdados`. */
  var CERTIFICADOS = [];

  function seedExemplo() {
    if (CERTIFICADOS.length) return;
    CERTIFICADOS.push(
      {
        codigo: 'CERT-001',
        nome: 'Certificado A1 — Fazenda Nivelo',
        tipo: 'A1',
        titular: EMITENTE.razaoSocial,
        documento: EMITENTE.documento,
        numeroSerie: '5F3A9C1D2E4B7061',
        emissor: 'AC SERASA RFB v5',
        dataInicio: toISODate(addDays(hoje, -300)),
        dataValidade: toISODate(addDays(hoje, 65)),
        arquivoNome: 'certificado-fazenda-nivelo.pfx',
        origem: 'importado',
        status: 'ativo',
        observacoes: '',
        dataCadastro: toISODate(addDays(hoje, -300)),
        usuarioCadastro: 'Miguel Silva',
        dataAlteracao: toISODate(addDays(hoje, -300)),
        usuarioAlteracao: 'Miguel Silva'
      },
      {
        codigo: 'CERT-002',
        nome: 'Certificado A1 — vencido (backup)',
        tipo: 'A1',
        titular: EMITENTE.razaoSocial,
        documento: EMITENTE.documento,
        numeroSerie: '1A2B3C4D5E6F7081',
        emissor: 'AC Certisign RFB G7',
        dataInicio: toISODate(addDays(hoje, -420)),
        dataValidade: toISODate(addDays(hoje, -55)),
        arquivoNome: 'certificado-backup-2024.pfx',
        origem: 'importado',
        status: 'expirado',
        observacoes: 'Certificado antigo mantido só para histórico, não usar em novas emissões.',
        dataCadastro: toISODate(addDays(hoje, -420)),
        usuarioCadastro: 'Miguel Silva',
        dataAlteracao: toISODate(addDays(hoje, -420)),
        usuarioAlteracao: 'Miguel Silva'
      }
    );
  }

  // Status é recalculado a partir de `dataValidade` toda vez que a lista é
  // lida (nunca para "revogado", que é uma ação manual permanente, não
  // derivada de data) — evita a lista ficar com um status "ativo" congelado
  // enquanto o tempo passa dentro da mesma sessão do protótipo.
  var DIAS_ALERTA_VENCIMENTO = 30;
  function computeStatus(certificado) {
    if (certificado.status === 'revogado') return 'revogado';
    var diasRestantes = Math.round((new Date(certificado.dataValidade + 'T00:00:00') - hoje) / 86400000);
    if (diasRestantes < 0) return 'expirado';
    if (diasRestantes <= DIAS_ALERTA_VENCIMENTO) return 'proximo-vencimento';
    return 'ativo';
  }
  function refreshStatuses() {
    CERTIFICADOS.forEach(function (c) { c.status = computeStatus(c); });
  }

  function list() {
    refreshStatuses();
    return CERTIFICADOS;
  }

  function findByCodigo(codigo) {
    refreshStatuses();
    return CERTIFICADOS.filter(function (c) { return c.codigo === codigo; })[0] || null;
  }

  function findByNumeroSerie(numeroSerie) {
    return CERTIFICADOS.filter(function (c) { return c.numeroSerie === numeroSerie; })[0] || null;
  }

  function nextCodigo() {
    var max = 0;
    CERTIFICADOS.forEach(function (c) {
      var num = parseInt(c.codigo.replace(CODIGO_PREFIX + '-', ''), 10);
      if (num > max) max = num;
    });
    return CODIGO_PREFIX + '-' + String(max + 1).padStart(3, '0');
  }

  function syncFlagFromList() {
    refreshStatuses();
    var algumAtivo = CERTIFICADOS.some(function (c) { return c.status === 'ativo'; });
    if (algumAtivo) setCertificado(true);
  }

  function add(certificado) {
    var novo = Object.assign({}, certificado, { codigo: nextCodigo() });
    CERTIFICADOS.push(novo);
    syncFlagFromList();
    return novo;
  }

  function update(codigo, patch) {
    var certificado = findByCodigo(codigo);
    if (!certificado) return null;
    Object.assign(certificado, patch, { codigo: certificado.codigo });
    syncFlagFromList();
    return certificado;
  }

  function remove(codigo) {
    var index = CERTIFICADOS.findIndex(function (c) { return c.codigo === codigo; });
    if (index === -1) return false;
    CERTIFICADOS.splice(index, 1);
    return true;
  }

  function revogar(codigo) {
    return update(codigo, { status: 'revogado' });
  }

  // ---------- Flag simples (compatibilidade com nova-nota-fiscal.js) ----------
  function hasCertificado() {
    refreshStatuses();
    if (CERTIFICADOS.some(function (c) { return c.status === 'ativo'; })) return true;
    try {
      return sessionStorage.getItem(FLAG_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setCertificado(cadastrado) {
    try {
      sessionStorage.setItem(FLAG_KEY, cadastrado ? '1' : '0');
    } catch (e) {}
  }

  // ---------- Parceiro de Certificado Digital ----------
  // Configuração administrativa (fora da experiência do cliente — não há
  // mais tela em `app/` pra editar isto, ver certificado-digital.html/
  // importar-certificado.html). `DEFAULT_PARCEIRO` simula o que viria de um
  // futuro painel admin, mesmo raciocínio de `emitente-data.js`.
  // `localStorage` continua sendo o mecanismo de override (`setParceiro`
  // permanece disponível como API, pra quando essa tela admin existir).
  var DEFAULT_PARCEIRO = {
    nome: 'Serasa Experian',
    url: 'https://www.serasaexperian.com.br/emitir-certificado',
    abrirNovaAba: true,
    observacoes: ''
  };

  function getParceiro() {
    try {
      var raw = localStorage.getItem(PARCEIRO_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PARCEIRO;
    } catch (e) {
      return DEFAULT_PARCEIRO;
    }
  }

  function setParceiro(parceiro) {
    try {
      localStorage.setItem(PARCEIRO_KEY, JSON.stringify(parceiro));
    } catch (e) {}
    return parceiro;
  }

  // ---------- Histórico de acesso ao parceiro ----------
  function registrarAcessoParceiro(usuario) {
    var historico = [];
    try {
      var raw = localStorage.getItem(HISTORICO_KEY);
      historico = raw ? JSON.parse(raw) : [];
    } catch (e) {}
    historico.push({ usuario: usuario, dataHora: new Date().toISOString() });
    try { localStorage.setItem(HISTORICO_KEY, JSON.stringify(historico)); } catch (e) {}
  }

  window.NiveloCertificadoDigital = {
    list: list,
    seedExemplo: seedExemplo,
    findByCodigo: findByCodigo,
    findByNumeroSerie: findByNumeroSerie,
    nextCodigo: nextCodigo,
    add: add,
    update: update,
    remove: remove,
    revogar: revogar,
    hasCertificado: hasCertificado,
    setCertificado: setCertificado,
    getParceiro: getParceiro,
    setParceiro: setParceiro,
    registrarAcessoParceiro: registrarAcessoParceiro
  };
})();
