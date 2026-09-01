/*
 * Módulo central de Vídeos (Configuração > Vídeos, item "Vídeos" da Sidebar).
 * Vídeos NUNCA são armazenados no sistema — só o vínculo com o YouTube (URL + metadados
 * extraídos automaticamente) é persistido. Mesma convenção IIFE em memória dos demais módulos
 * de dados deste protótipo (sem localStorage/backend real).
 */
(function () {
  'use strict';

  // Ordem segue a mesma ordem da Sidebar (mesmo critério já aplicado às
  // categorias do Canal de Ideias) — "Notas Fiscais" na posição de "Vendas e
  // fiscal"; "Primeiros passos"/"Outros" não têm item correspondente na
  // Sidebar, ficam por último (mesmo raciocínio do catch-all "Outros" do
  // Canal de Ideias). Conjunto de categorias alinhado ao Canal de Ideias
  // (Dashboard/Relatórios/Outros adicionados por paridade entre as duas
  // telas), mais as 2 categorias específicas de Vídeos (Notas Fiscais/
  // Primeiros passos) que não existem lá.
  var CATEGORIAS = [
    'Dashboard',
    'Assistente IA',
    'Caderno de Campo',
    'Estoque',
    'Financeiro',
    'Relatórios',
    'Notas Fiscais',
    'Primeiros passos',
    'Outros'
  ];

  var VIDEOS = [
    {
      id: 'VID-001',
      titulo: 'Como emitir sua primeira nota fiscal',
      categoria: 'Notas Fiscais',
      videoId: 'nivelo0001',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-07-20T10:00:00.000Z'
    },
    {
      id: 'VID-002',
      titulo: 'Configurando o Certificado Digital',
      categoria: 'Notas Fiscais',
      videoId: 'nivelo0002',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-07-18T10:00:00.000Z'
    },
    {
      id: 'VID-003',
      titulo: 'Controlando seu estoque de grãos',
      categoria: 'Estoque',
      videoId: 'nivelo0003',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-07-15T10:00:00.000Z'
    },
    {
      id: 'VID-004',
      titulo: 'Registrando lançamentos no Caixa',
      categoria: 'Financeiro',
      videoId: 'nivelo0004',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-07-10T10:00:00.000Z'
    },
    {
      id: 'VID-005',
      titulo: 'Usando o Caderno de Campo',
      categoria: 'Caderno de Campo',
      videoId: 'nivelo0005',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-07-05T10:00:00.000Z'
    },
    {
      id: 'VID-006',
      titulo: 'Primeiros passos no sistema Nivelo',
      categoria: 'Primeiros passos',
      videoId: 'nivelo0006',
      canal: 'Nivelo',
      thumbnail: null,
      publicadoEm: '2026-06-28T10:00:00.000Z'
    },
    {
      id: 'VID-007',
      titulo: 'Conversando com o Assistente de IA',
      categoria: 'Assistente IA',
      videoId: 'nivelo0007',
      canal: 'Nivelo',
      thumbnail: null,
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
   * impedir o cadastro e exibir a mensagem de erro nesse caso (regra de negócio do pedido).
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

  /** Cadastra um vídeo novo: valida o link, busca metadados, bloqueia duplicidade de vídeo. */
  function add(url, categoria) {
    return fetchMetadata(url).then(function (meta) {
      if (findByVideoId(meta.videoId)) {
        throw new Error('Este vídeo já está cadastrado.');
      }
      var novo = {
        id: nextId(),
        titulo: meta.titulo,
        categoria: categoria,
        videoId: meta.videoId,
        canal: meta.canal,
        thumbnail: meta.thumbnail,
        publicadoEm: new Date().toISOString()
      };
      VIDEOS.unshift(novo);
      return novo;
    });
  }

  function urlFor(video) {
    return 'https://www.youtube.com/watch?v=' + video.videoId;
  }

  window.NiveloVideos = {
    categorias: categorias,
    list: list,
    findByVideoId: findByVideoId,
    isValidYoutubeUrl: isValidYoutubeUrl,
    extractVideoId: extractVideoId,
    buildThumbnailUrl: buildThumbnailUrl,
    fetchMetadata: fetchMetadata,
    add: add,
    urlFor: urlFor
  };
})();
