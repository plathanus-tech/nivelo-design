/*
 * Módulo central de Vídeos (Backoffice > Vídeos). Cópia própria do admin de
 * `app/shared/videos-data.js` (cada superfície tem seu `shared/` — nunca referenciar o
 * arquivo do cliente daqui), estendida com os campos e ações exclusivos do administrador:
 * `descricao` (opcional), `status` (ativo/inativo — só vídeos ativos aparecem pro cliente) e
 * `update`/`remove`/`toggleAtivo`. Vídeos NUNCA são armazenados/hospedados pelo sistema — só o
 * vínculo com o YouTube (URL + metadados extraídos automaticamente) é persistido. Mesma
 * convenção IIFE em memória dos demais módulos deste protótipo (sem localStorage/backend real).
 */
(function () {
  'use strict';

  var CATEGORIAS = [
    'Primeiros passos',
    'Notas Fiscais',
    'Financeiro',
    'Estoque',
    'Caderno de Campo',
    'Assistente IA'
  ];

  var VIDEOS = [
    {
      id: 'VID-001',
      titulo: 'Como emitir sua primeira nota fiscal',
      categoria: 'Notas Fiscais',
      videoId: 'nivelo0001',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-07-20T10:00:00.000Z'
    },
    {
      id: 'VID-002',
      titulo: 'Configurando o Certificado Digital',
      categoria: 'Notas Fiscais',
      videoId: 'nivelo0002',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'inativo',
      publicadoEm: '2026-07-18T10:00:00.000Z'
    },
    {
      id: 'VID-003',
      titulo: 'Controlando seu estoque de grãos',
      categoria: 'Estoque',
      videoId: 'nivelo0003',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-07-15T10:00:00.000Z'
    },
    {
      id: 'VID-004',
      titulo: 'Registrando lançamentos no Caixa',
      categoria: 'Financeiro',
      videoId: 'nivelo0004',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-07-10T10:00:00.000Z'
    },
    {
      id: 'VID-005',
      titulo: 'Usando o Caderno de Campo',
      categoria: 'Caderno de Campo',
      videoId: 'nivelo0005',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-07-05T10:00:00.000Z'
    },
    {
      id: 'VID-006',
      titulo: 'Primeiros passos no sistema Nivelo',
      categoria: 'Primeiros passos',
      videoId: 'nivelo0006',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-06-28T10:00:00.000Z'
    },
    {
      id: 'VID-007',
      titulo: 'Conversando com o Assistente de IA',
      categoria: 'Assistente IA',
      videoId: 'nivelo0007',
      canal: 'Nivelo',
      thumbnail: null,
      descricao: '',
      status: 'ativo',
      publicadoEm: '2026-06-20T10:00:00.000Z'
    }
  ];

  var nextSeq = VIDEOS.length + 1;

  function nextId() {
    var id = 'VID-' + String(nextSeq).padStart(3, '0');
    nextSeq += 1;
    return id;
  }

  function categorias() {
    return CATEGORIAS.slice();
  }

  function list() {
    return VIDEOS.slice().sort(function (a, b) {
      return new Date(b.publicadoEm) - new Date(a.publicadoEm);
    });
  }

  function findById(id) {
    for (var i = 0; i < VIDEOS.length; i++) {
      if (VIDEOS[i].id === id) return VIDEOS[i];
    }
    return null;
  }

  function findByVideoId(videoId) {
    for (var i = 0; i < VIDEOS.length; i++) {
      if (VIDEOS[i].videoId === videoId) return VIDEOS[i];
    }
    return null;
  }

  var YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{6,}$/;

  /** Extrai o ID do vídeo de qualquer formato válido de URL do YouTube. Retorna null se inválido. */
  function extractVideoId(url) {
    if (!url) return null;
    var parsed;
    try {
      parsed = new URL(String(url).trim());
    } catch (e) {
      return null;
    }
    var host = parsed.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (host === 'youtu.be') {
      var shortId = parsed.pathname.slice(1).split('/')[0];
      return YOUTUBE_ID_RE.test(shortId) ? shortId : null;
    }

    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        var v = parsed.searchParams.get('v');
        return v && YOUTUBE_ID_RE.test(v) ? v : null;
      }
      var shortsMatch = parsed.pathname.match(/^\/(shorts|embed)\/([^/]+)/);
      if (shortsMatch && YOUTUBE_ID_RE.test(shortsMatch[2])) return shortsMatch[2];
    }

    return null;
  }

  function isValidYoutubeUrl(url) {
    return !!extractVideoId(url);
  }

  /** Padrão público de thumbnail do YouTube — não requer chave de API. */
  function buildThumbnailUrl(videoId) {
    return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
  }

  /**
   * Busca título/thumbnail via o endpoint público de oEmbed do YouTube (sem chave de API).
   * Rejeita quando a URL não é do YouTube ou o vídeo não pôde ser validado — quem chama deve
   * impedir o cadastro e exibir a mensagem de erro nesse caso.
   */
  function fetchMetadata(url) {
    var videoId = extractVideoId(url);
    if (!videoId) {
      return Promise.reject(new Error('Informe um link válido do YouTube.'));
    }
    var oembedUrl = 'https://www.youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json';
    return fetch(oembedUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('not-ok');
        return res.json();
      })
      .then(function (data) {
        return {
          videoId: videoId,
          titulo: data.title,
          canal: data.author_name || '',
          thumbnail: buildThumbnailUrl(videoId)
        };
      })
      .catch(function () {
        throw new Error('Não foi possível validar este vídeo. Verifique o link e tente novamente.');
      });
  }

  /**
   * Cadastra um vídeo novo: valida o link, busca metadados, bloqueia duplicidade de vídeo.
   * `opts.titulo` sobrescreve o título vindo do YouTube (edição manual pelo administrador);
   * `opts.descricao`/`opts.status` são exclusivos do admin (cliente nunca vê/define isso).
   */
  function add(url, categoria, opts) {
    opts = opts || {};
    return fetchMetadata(url).then(function (meta) {
      if (findByVideoId(meta.videoId)) {
        throw new Error('Este vídeo já está cadastrado.');
      }
      var novo = {
        id: nextId(),
        titulo: opts.titulo || meta.titulo,
        categoria: categoria,
        videoId: meta.videoId,
        canal: meta.canal,
        thumbnail: meta.thumbnail,
        descricao: opts.descricao || '',
        status: opts.status === 'inativo' ? 'inativo' : 'ativo',
        publicadoEm: new Date().toISOString()
      };
      VIDEOS.unshift(novo);
      return novo;
    });
  }

  /**
   * Atualiza um vídeo existente. `patch.url` é opcional — só quando informado (e diferente do
   * link atual) o vídeo é revalidado/re-identificado no YouTube; os demais campos (título,
   * categoria, descrição, status) são sempre editáveis livremente pelo administrador.
   */
  function update(id, patch) {
    var video = findById(id);
    if (!video) return Promise.reject(new Error('Vídeo não encontrado.'));
    patch = patch || {};

    function applyRest(metaOverride) {
      if (metaOverride) {
        video.videoId = metaOverride.videoId;
        video.thumbnail = metaOverride.thumbnail;
        video.canal = metaOverride.canal;
      }
      if (patch.titulo != null) video.titulo = patch.titulo;
      if (patch.categoria != null) video.categoria = patch.categoria;
      if (patch.descricao != null) video.descricao = patch.descricao;
      if (patch.status === 'ativo' || patch.status === 'inativo') video.status = patch.status;
      return video;
    }

    if (patch.url && extractVideoId(patch.url) !== video.videoId) {
      return fetchMetadata(patch.url).then(function (meta) {
        var existing = findByVideoId(meta.videoId);
        if (existing && existing.id !== id) {
          throw new Error('Este vídeo já está cadastrado.');
        }
        return applyRest(meta);
      });
    }
    return Promise.resolve(applyRest(null));
  }

  function remove(id) {
    var index = VIDEOS.findIndex(function (v) { return v.id === id; });
    if (index === -1) return false;
    VIDEOS.splice(index, 1);
    return true;
  }

  function toggleAtivo(id) {
    var video = findById(id);
    if (!video) return null;
    video.status = video.status === 'ativo' ? 'inativo' : 'ativo';
    return video;
  }

  function urlFor(video) {
    return 'https://www.youtube.com/watch?v=' + video.videoId;
  }

  window.NiveloAdminVideos = {
    categorias: categorias,
    list: list,
    findById: findById,
    findByVideoId: findByVideoId,
    isValidYoutubeUrl: isValidYoutubeUrl,
    extractVideoId: extractVideoId,
    buildThumbnailUrl: buildThumbnailUrl,
    fetchMetadata: fetchMetadata,
    add: add,
    update: update,
    remove: remove,
    toggleAtivo: toggleAtivo,
    urlFor: urlFor
  };
})();
