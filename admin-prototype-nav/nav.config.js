/*
 * Configuração do Navegador de Protótipo — PAINEL ADMINISTRATIVO.
 * Ferramenta separada de `prototype-nav/` (essa cobre só `app/`/`landing/`,
 * o produto do cliente) — o admin tem seu próprio link/navegador, acessado
 * independentemente, mesmo mecanismo (jornada → tela → variantes) e mesmo
 * `nav.js`/`nav.css` (cópia idêntica, só a chave de `localStorage` do estado
 * da árvore é própria — ver nav.js).
 * Caminhos são relativos a esta pasta (admin-prototype-nav/), por isso toda
 * tela referencia `../admin/screens/...`.
 */
window.PROTO_NAV_CONFIG = {
  journeys: [
    {
      id: 'admin-login',
      label: 'Jornada · Login (admin)',
      screens: [
        {
          id: 'admin-login',
          label: 'Login',
          desktop: '../admin/screens/login.html',
          variants: [
            { id: 'admin-login-invalid', label: 'Campos inválidos', desktop: '../admin/screens/login.html#state=invalid' },
            { id: 'admin-login-loading', label: 'Loading', desktop: '../admin/screens/login.html#state=loading' },
            { id: 'admin-login-error', label: 'Erro de autenticação', desktop: '../admin/screens/login.html#state=error' },
            { id: 'admin-login-passwordchanged', label: 'Senha atualizada com sucesso', desktop: '../admin/screens/login.html#state=passwordchanged' }
          ]
        },
        {
          id: 'admin-recuperar-senha-flow',
          label: 'Recuperar senha',
          type: 'flow',
          screens: [
            {
              id: 'admin-recuperar-senha',
              label: 'Recuperar senha',
              desktop: '../admin/screens/recuperar-senha.html',
              variants: [
                { id: 'admin-recuperar-senha-required', label: 'Campo obrigatório', desktop: '../admin/screens/recuperar-senha.html#state=required' },
                { id: 'admin-recuperar-senha-invalid', label: 'E-mail inválido', desktop: '../admin/screens/recuperar-senha.html#state=invalid' },
                { id: 'admin-recuperar-senha-senderror', label: 'Erro ao enviar código', desktop: '../admin/screens/recuperar-senha.html#state=senderror' }
              ]
            },
            {
              id: 'admin-codigo-verificacao',
              label: 'Código de verificação',
              desktop: '../admin/screens/codigo-verificacao.html',
              variants: [
                { id: 'admin-codigo-verificacao-incorrect', label: 'Código incorreto', desktop: '../admin/screens/codigo-verificacao.html#state=incorrect' },
                { id: 'admin-codigo-verificacao-expired', label: 'Código expirado', desktop: '../admin/screens/codigo-verificacao.html#state=expired' },
                { id: 'admin-codigo-verificacao-toomany', label: 'Muitas tentativas', desktop: '../admin/screens/codigo-verificacao.html#state=toomany' },
                { id: 'admin-codigo-verificacao-commerror', label: 'Erro de comunicação', desktop: '../admin/screens/codigo-verificacao.html#state=commerror' }
              ]
            },
            {
              id: 'admin-criar-nova-senha',
              label: 'Criar nova senha',
              desktop: '../admin/screens/criar-nova-senha.html',
              variants: [
                { id: 'admin-criar-nova-senha-required', label: 'Campos obrigatórios', desktop: '../admin/screens/criar-nova-senha.html#state=required' },
                { id: 'admin-criar-nova-senha-criteriaunmet', label: 'Critérios não atendidos', desktop: '../admin/screens/criar-nova-senha.html#state=criteriaunmet' },
                { id: 'admin-criar-nova-senha-mismatch', label: 'Senhas diferentes', desktop: '../admin/screens/criar-nova-senha.html#state=mismatch' },
                { id: 'admin-criar-nova-senha-sameasold', label: 'Senha igual à anterior', desktop: '../admin/screens/criar-nova-senha.html#state=sameasold' },
                { id: 'admin-criar-nova-senha-saveerror', label: 'Erro ao salvar', desktop: '../admin/screens/criar-nova-senha.html#state=saveerror' },
                { id: 'admin-criar-nova-senha-success', label: 'Sucesso', desktop: '../admin/screens/login.html#state=passwordchanged' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'admin-dashboard-journey',
      label: 'Jornada · Dashboard',
      screens: [
        {
          id: 'admin-dashboard',
          label: 'Dashboard',
          desktop: '../admin/screens/dashboard.html'
        }
      ]
    },
    {
      id: 'admin-usuarios-journey',
      label: 'Jornada · Usuários',
      screens: [
        {
          id: 'admin-usuarios',
          label: 'Usuários',
          desktop: '../admin/screens/usuarios.html'
        }
      ]
    },
    {
      id: 'admin-assinantes',
      label: 'Jornada · Assinantes',
      screens: [
        {
          id: 'admin-assinantes-planos-epico',
          label: 'Épico · Planos',
          type: 'flow',
          screens: [
            {
              id: 'admin-planos',
              label: 'Planos',
              desktop: '../admin/screens/planos.html'
            }
          ]
        },
        {
          id: 'admin-assinantes-lista-epico',
          label: 'Épico · Assinantes',
          type: 'flow',
          screens: [
            {
              id: 'admin-assinantes-lista',
              label: 'Assinantes',
              desktop: '../admin/screens/assinantes.html'
            },
            {
              id: 'admin-assinante-detalhe',
              label: 'Detalhe do assinante',
              desktop: '../admin/screens/assinante-detalhe.html#id=1',
              variants: [
                { id: 'admin-assinante-detalhe-teste', label: 'Em período de teste', desktop: '../admin/screens/assinante-detalhe.html#id=2' },
                { id: 'admin-assinante-detalhe-bloqueado', label: 'Bloqueado manualmente', desktop: '../admin/screens/assinante-detalhe.html#id=3' },
                { id: 'admin-assinante-detalhe-suspenso', label: 'Suspenso por inadimplência', desktop: '../admin/screens/assinante-detalhe.html#id=4' },
                { id: 'admin-assinante-detalhe-cancelado', label: 'Assinatura cancelada', desktop: '../admin/screens/assinante-detalhe.html#id=5' },
                { id: 'admin-assinante-detalhe-naoencontrado', label: 'Assinante não encontrado', desktop: '../admin/screens/assinante-detalhe.html#id=999' }
              ]
            }
          ]
        },
        {
          id: 'admin-historico-pagamentos-epico',
          label: 'Épico · Histórico de Pagamentos',
          type: 'flow',
          screens: [
            {
              id: 'admin-historico-pagamentos',
              label: 'Histórico de Pagamentos',
              desktop: '../admin/screens/historico-pagamentos.html',
              variants: [
                { id: 'admin-historico-pagamentos-filtrado', label: 'Filtrado por assinante', desktop: '../admin/screens/historico-pagamentos.html?assinanteId=1' }
              ]
            },
            {
              id: 'admin-pagamento-detalhe',
              label: 'Detalhe do pagamento',
              desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-0001',
              variants: [
                { id: 'admin-pagamento-detalhe-pendente', label: 'Pendente', desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-0009' },
                { id: 'admin-pagamento-detalhe-atraso', label: 'Em atraso', desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-0005' },
                { id: 'admin-pagamento-detalhe-falhou', label: 'Falhou', desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-0011' },
                { id: 'admin-pagamento-detalhe-cancelado', label: 'Cancelado', desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-0007' },
                { id: 'admin-pagamento-detalhe-naoencontrado', label: 'Não encontrado', desktop: '../admin/screens/pagamento-detalhe.html#id=PAG-9999' }
              ]
            }
          ]
        },
        {
          id: 'admin-cupons-epico',
          label: 'Épico · Cupons e Afiliados',
          type: 'flow',
          screens: [
            {
              id: 'admin-cupons',
              label: 'Cupons e Afiliados',
              desktop: '../admin/screens/cupons.html'
            },
            {
              id: 'admin-novo-cupom',
              label: 'Novo cupom',
              desktop: '../admin/screens/novo-cupom.html',
              variants: [
                { id: 'admin-novo-cupom-editar-afiliado', label: 'Editar cupom de afiliado', desktop: '../admin/screens/novo-cupom.html?codigo=NIVELO20' },
                { id: 'admin-novo-cupom-editar-promocional', label: 'Editar cupom promocional', desktop: '../admin/screens/novo-cupom.html?codigo=NIVELO5' }
              ]
            },
            {
              id: 'admin-cupom-detalhe',
              label: 'Detalhe do cupom',
              desktop: '../admin/screens/cupom-detalhe.html?codigo=NIVELO20',
              variants: [
                { id: 'admin-cupom-detalhe-promocional', label: 'Cupom promocional', desktop: '../admin/screens/cupom-detalhe.html?codigo=NIVELO5' },
                { id: 'admin-cupom-detalhe-semuso', label: 'Sem utilizações', desktop: '../admin/screens/cupom-detalhe.html?codigo=PARCEIROVERDE15' },
                { id: 'admin-cupom-detalhe-naoencontrado', label: 'Não encontrado', desktop: '../admin/screens/cupom-detalhe.html?codigo=INEXISTENTE' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'admin-videos-journey',
      label: 'Jornada · Vídeos',
      screens: [
        {
          id: 'admin-videos-epico',
          label: 'Épico · Vídeos',
          type: 'flow',
          screens: [
            {
              id: 'admin-videos',
              label: 'Vídeos',
              desktop: '../admin/screens/videos.html'
            },
            {
              id: 'admin-novo-video',
              label: 'Novo vídeo',
              desktop: '../admin/screens/novo-video.html',
              variants: [
                { id: 'admin-novo-video-editar', label: 'Editar vídeo', desktop: '../admin/screens/novo-video.html?id=VID-001' },
                { id: 'admin-novo-video-naoencontrado', label: 'Vídeo não encontrado', desktop: '../admin/screens/novo-video.html?id=INEXISTENTE' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'admin-canal-ideias-journey',
      label: 'Jornada · Canal de Ideias',
      screens: [
        {
          id: 'admin-canal-ideias-epico',
          label: 'Épico · Canal de Ideias',
          type: 'flow',
          screens: [
            {
              id: 'admin-canal-ideias',
              label: 'Canal de Ideias',
              desktop: '../admin/screens/canal-ideias.html',
              variants: [
                { id: 'admin-canal-ideias-vazio', label: 'Nenhuma ideia encontrada', desktop: '../admin/screens/canal-ideias.html#state=empty' }
              ]
            },
            {
              id: 'admin-ideia-detalhe',
              label: 'Detalhe da ideia',
              desktop: '../admin/screens/ideia-detalhe.html?codigo=ID-0001',
              variants: [
                { id: 'admin-ideia-detalhe-semcomentarios', label: 'Sem comentários', desktop: '../admin/screens/ideia-detalhe.html?codigo=ID-0003' },
                { id: 'admin-ideia-detalhe-naoencontrada', label: 'Ideia não encontrada', desktop: '../admin/screens/ideia-detalhe.html?codigo=INEXISTENTE' }
              ]
            },
            {
              id: 'admin-nova-ideia',
              label: 'Nova ideia',
              desktop: '../admin/screens/nova-ideia.html'
            }
          ]
        }
      ]
    }
  ]
};
