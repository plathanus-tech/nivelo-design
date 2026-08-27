/*
 * Configuração do Navegador de Protótipo.
 * Cada jornada agrupa telas; cada tela pode ter variantes (estados, versões antigas, etc).
 * Caminhos são relativos a esta pasta (prototype-nav/).
 * `mobile` é opcional: se omitido, usa o mesmo arquivo de `desktop` (tela responsiva).
 *
 * Para adicionar uma nova jornada/tela no futuro, basta incluir mais um item aqui.
 */
window.PROTO_NAV_CONFIG = {
  journeys: [
    {
      id: 'landing',
      label: 'Jornada · Landing Page',
      screens: [
        {
          id: 'home',
          label: 'Home',
          desktop: '../landing/screens/index-v3.html',
          variants: [
            { id: 'home-v2', label: 'v2 (versão anterior)', desktop: '../landing/screens/index-v2.html' },
            { id: 'home-v1', label: 'v1 (versão anterior)', desktop: '../landing/screens/index.html' }
          ]
        }
      ]
    },
    {
      id: 'login',
      label: 'Jornada · Login',
      screens: [
        {
          id: 'login',
          label: 'Login',
          desktop: '../app/screens/login.html',
          variants: [
            { id: 'login-invalid', label: 'Campos inválidos', desktop: '../app/screens/login.html#state=invalid' },
            { id: 'login-loading', label: 'Loading', desktop: '../app/screens/login.html#state=loading' },
            { id: 'login-error', label: 'Erro de autenticação', desktop: '../app/screens/login.html#state=error' }
          ]
        },
        {
          id: 'recuperar-senha-flow',
          label: 'Recuperar senha',
          type: 'flow',
          screens: [
            {
              id: 'recuperar-senha',
              label: 'Recuperar senha',
              desktop: '../app/screens/recuperar-senha.html',
              variants: [
                { id: 'recuperar-senha-required', label: 'Campo obrigatório', desktop: '../app/screens/recuperar-senha.html#state=required' },
                { id: 'recuperar-senha-invalid', label: 'Telefone inválido', desktop: '../app/screens/recuperar-senha.html#state=invalid' },
                { id: 'recuperar-senha-senderror', label: 'Erro ao enviar código', desktop: '../app/screens/recuperar-senha.html#state=senderror' }
              ]
            },
            {
              id: 'codigo-verificacao',
              label: 'Código de verificação',
              desktop: '../app/screens/codigo-verificacao.html',
              variants: [
                { id: 'codigo-verificacao-incorrect', label: 'Código incorreto', desktop: '../app/screens/codigo-verificacao.html#state=incorrect' },
                { id: 'codigo-verificacao-expired', label: 'Código expirado', desktop: '../app/screens/codigo-verificacao.html#state=expired' },
                { id: 'codigo-verificacao-toomany', label: 'Muitas tentativas', desktop: '../app/screens/codigo-verificacao.html#state=toomany' },
                { id: 'codigo-verificacao-commerror', label: 'Erro de comunicação', desktop: '../app/screens/codigo-verificacao.html#state=commerror' }
              ]
            },
            {
              id: 'criar-nova-senha',
              label: 'Criar nova senha',
              desktop: '../app/screens/criar-nova-senha.html',
              variants: [
                { id: 'criar-nova-senha-required', label: 'Campos obrigatórios', desktop: '../app/screens/criar-nova-senha.html#state=required' },
                { id: 'criar-nova-senha-criteriaunmet', label: 'Critérios não atendidos', desktop: '../app/screens/criar-nova-senha.html#state=criteriaunmet' },
                { id: 'criar-nova-senha-mismatch', label: 'Senhas diferentes', desktop: '../app/screens/criar-nova-senha.html#state=mismatch' },
                { id: 'criar-nova-senha-sameasold', label: 'Senha igual à anterior', desktop: '../app/screens/criar-nova-senha.html#state=sameasold' },
                { id: 'criar-nova-senha-saveerror', label: 'Erro ao salvar', desktop: '../app/screens/criar-nova-senha.html#state=saveerror' },
                { id: 'criar-nova-senha-success', label: 'Sucesso', desktop: '../app/screens/dashboard.html#state=success' }
              ]
            }
          ]
        },
        {
          id: 'cadastro-flow',
          label: 'Criar conta',
          type: 'flow',
          screens: [
            {
              id: 'cadastro',
              label: 'Cadastro da conta (Step 1)',
              desktop: '../app/screens/cadastro.html',
              variants: [
                { id: 'cadastro-required', label: 'Campos obrigatórios', desktop: '../app/screens/cadastro.html#state=required' },
                { id: 'cadastro-criteriaunmet', label: 'Critérios não atendidos', desktop: '../app/screens/cadastro.html#state=criteriaunmet' },
                { id: 'cadastro-mismatch', label: 'Senhas diferentes', desktop: '../app/screens/cadastro.html#state=mismatch' }
              ]
            },
            {
              id: 'cadastro-validar-telefone',
              label: 'Validar telefone',
              desktop: '../app/screens/cadastro-validar-telefone.html',
              variants: [
                { id: 'cadastro-validar-telefone-incorrect', label: 'Código incorreto', desktop: '../app/screens/cadastro-validar-telefone.html#state=incorrect' },
                { id: 'cadastro-validar-telefone-expired', label: 'Código expirado', desktop: '../app/screens/cadastro-validar-telefone.html#state=expired' }
              ]
            },
            {
              id: 'cadastro-endereco',
              label: 'Endereço (Step 2)',
              desktop: '../app/screens/cadastro-endereco.html',
              variants: [
                { id: 'cadastro-endereco-required', label: 'Campos obrigatórios', desktop: '../app/screens/cadastro-endereco.html#state=required' }
              ]
            },
            {
              id: 'cadastro-planos',
              label: 'Planos (Step 3)',
              desktop: '../app/screens/cadastro-planos.html',
              variants: [
                { id: 'cadastro-planos-planrequired', label: 'Plano não selecionado', desktop: '../app/screens/cadastro-planos.html#state=planrequired' },
                { id: 'cadastro-planos-termsrequired', label: 'Termos não aceitos', desktop: '../app/screens/cadastro-planos.html#state=termsrequired' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'sistema',
      label: 'Jornada · Sistema (área logada)',
      screens: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          desktop: '../app/screens/dashboard.html',
          variants: [
            { id: 'dashboard-empty', label: 'Fazenda recém-cadastrada (sem dados)', desktop: '../app/screens/dashboard.html#state=empty' },
            { id: 'dashboard-trialwarning', label: 'Teste: menos de 3 dias restantes (tag amarela)', desktop: '../app/screens/dashboard.html#state=trialwarning' },
            { id: 'dashboard-trialexpired', label: 'Teste: período expirado (modal de bloqueio + blur)', desktop: '../app/screens/dashboard.html#state=trialexpired' },
            { id: 'dashboard-renewalwarning', label: 'Licença anual vencendo em breve (aviso)', desktop: '../app/screens/dashboard.html#state=renewalwarning' },
            { id: 'dashboard-planoexpirado', label: 'Plano pago vencido (modal de bloqueio + blur)', desktop: '../app/screens/dashboard.html#state=planoexpirado' },
            { id: 'dashboard-success', label: 'Sucesso ao recuperar senha', desktop: '../app/screens/dashboard.html#state=success' },
            { id: 'dashboard-signupsuccess', label: 'Conta criada com sucesso', desktop: '../app/screens/dashboard.html#state=signupsuccess' }
          ]
        }
      ]
    },
    {
      id: 'assistente-ia',
      label: 'Jornada · Assistente IA',
      screens: [
        {
          id: 'meus-numeros-whatsapp',
          label: 'Meus números do WhatsApp',
          desktop: '../app/screens/meus-numeros-whatsapp.html'
        },
        {
          id: 'nova-conversa',
          label: 'Histórico',
          desktop: '../app/screens/nova-conversa.html'
        }
      ]
    },
    {
      id: 'cadastro',
      label: 'Jornada · Cadastro',
      screens: [
        {
          id: 'cadastros-listagem',
          label: 'Clientes e fornecedores',
          desktop: '../app/screens/cadastros.html',
          variants: [
            { id: 'cadastros-listagem-created', label: 'Cadastro realizado com sucesso', desktop: '../app/screens/cadastros.html#state=created' },
            { id: 'cadastros-listagem-edited', label: 'Edição concluída', desktop: '../app/screens/cadastros.html#state=edited' },
            { id: 'cadastros-listagem-empty', label: 'Nenhum cadastro', desktop: '../app/screens/cadastros.html#state=empty' }
          ]
        },
        {
          id: 'novo-cadastro',
          label: 'Novo cadastro',
          desktop: '../app/screens/novo-cadastro.html',
          variants: [
            { id: 'novo-cadastro-transportadora', label: 'Transportadora (com veículos)', desktop: '../app/screens/novo-cadastro.html#state=transportadora' },
            { id: 'novo-cadastro-required', label: 'Campos obrigatórios', desktop: '../app/screens/novo-cadastro.html#state=required' },
            { id: 'novo-cadastro-vehiclesinvalid', label: 'Veículo com placa/UF inválida', desktop: '../app/screens/novo-cadastro.html#state=vehiclesinvalid' },
            { id: 'novo-cadastro-edit', label: 'Editar cadastro (exemplo)', desktop: '../app/screens/novo-cadastro.html#state=edit' }
          ]
        },
        // V2 (variante em validação com o cliente) — tela separada, não
        // substitui `novo-cadastro` acima. Simplifica o formulário quando
        // Tipo = só Transportadora + Tipo de transportadora = Própria.
        {
          id: 'novo-cadastro-v2',
          label: 'Novo cadastro (V2)',
          desktop: '../app/screens/novo-cadastro-v2.html',
          variants: [
            { id: 'novo-cadastro-v2-transportadora', label: 'Somente Transportadora (escolher Própria/Terceira)', desktop: '../app/screens/novo-cadastro-v2.html#state=transportadora' },
            { id: 'novo-cadastro-v2-transportadoraoutro', label: 'Transportadora + outro tipo (cadastro normal)', desktop: '../app/screens/novo-cadastro-v2.html#state=transportadoraoutro' },
            { id: 'novo-cadastro-v2-propria', label: 'Transportadora Própria (formulário simplificado)', desktop: '../app/screens/novo-cadastro-v2.html#state=propria' },
            { id: 'novo-cadastro-v2-terceira', label: 'Transportadora Terceira (formulário completo)', desktop: '../app/screens/novo-cadastro-v2.html#state=terceira' },
            { id: 'novo-cadastro-v2-required', label: 'Campos obrigatórios', desktop: '../app/screens/novo-cadastro-v2.html#state=required' }
          ]
        },
        {
          id: 'produtos-listagem',
          label: 'Produtos e serviços',
          desktop: '../app/screens/produtos.html',
          variants: [
            { id: 'produtos-listagem-empty', label: 'Nenhum produto', desktop: '../app/screens/produtos.html#state=empty' }
          ]
        },
        {
          id: 'novo-produto',
          label: 'Novo produto',
          desktop: '../app/screens/novo-produto.html',
          variants: [
            { id: 'novo-produto-edit', label: 'Editar produto (exemplo)', desktop: '../app/screens/novo-produto.html?sku=PRD-001' }
          ]
        },
        // V2 — reconstrução da jornada de Produtos: listagem com 2 abas
        // (Produtos de venda/Produtos de uso, colunas próprias por tipo,
        // Ativar/Desativar real) + formulário condicional por Tipo de
        // produto (Dados Fiscais × Entrada Inicial no Estoque). É o destino
        // real da Sidebar (`NAV_DESTINATIONS['cadastro-produtos']`) — V1
        // acima continua só pro navegador de protótipo.
        {
          id: 'produtos-v2',
          label: 'Produtos (V2)',
          desktop: '../app/screens/produtos-v2.html',
          variants: [
            { id: 'produtos-v2-empty', label: 'Nenhum produto', desktop: '../app/screens/produtos-v2.html#state=empty' }
          ]
        },
        {
          id: 'novo-produto-v2',
          label: 'Novo produto (V2)',
          desktop: '../app/screens/novo-produto-v2.html',
          variants: [
            { id: 'novo-produto-v2-edit-venda', label: 'Editar Produto de venda (exemplo)', desktop: '../app/screens/novo-produto-v2.html?sku=PRD-001' },
            { id: 'novo-produto-v2-edit-uso', label: 'Editar Produto de uso (exemplo)', desktop: '../app/screens/novo-produto-v2.html?sku=PRD-006' }
          ]
        }
      ]
    },
    {
      id: 'configuracao',
      label: 'Jornada · Configuração',
      screens: [
        // Épico "Fazendas" (`type:'flow'`, mesmo mecanismo de agrupamento já
        // usado em "Recuperar senha" dentro da Jornada · Login) — deixa
        // explícito no navegador de protótipo que Fazendas e Detalhe de
        // Fazenda são a mesma jornada/épico dentro de Configuração. Só
        // reorganiza a árvore do prototype-nav; não altera a navegação real
        // do produto (Sidebar/`interface-principal.js` continuam iguais).
        {
          id: 'fazendas-epico',
          label: 'Fazendas',
          type: 'flow',
          screens: [
            {
              id: 'fazendas-listagem',
              label: 'Fazendas',
              desktop: '../app/screens/fazendas.html',
              variants: [
                { id: 'fazendas-listagem-empty', label: 'Nenhuma fazenda', desktop: '../app/screens/fazendas.html#state=empty' },
                { id: 'fazendas-listagem-created', label: 'Fazenda cadastrada com sucesso', desktop: '../app/screens/fazendas.html#state=created' }
              ]
            },
            {
              id: 'fazenda-detalhe-cadastro',
              label: 'Detalhe de Fazenda',
              desktop: '../app/screens/fazenda-detalhe-cadastro.html#id=sao-joao',
              variants: [
                { id: 'fazenda-detalhe-cadastro-com-arrendamento', label: 'Com arrendamento', desktop: '../app/screens/fazenda-detalhe-cadastro.html#id=santa-rita' },
                { id: 'fazenda-detalhe-cadastro-sem-talhoes', label: 'Sem talhões cadastrados', desktop: '../app/screens/fazenda-detalhe-cadastro.html#id=sao-joao&state=empty' },
                { id: 'fazenda-detalhe-cadastro-nao-encontrada', label: 'Fazenda não encontrada', desktop: '../app/screens/fazenda-detalhe-cadastro.html#id=inexistente' }
              ]
            },
            {
              id: 'nova-fazenda',
              label: 'Nova fazenda',
              desktop: '../app/screens/nova-fazenda.html#step=1',
              variants: [
                { id: 'nova-fazenda-etapa1-erros', label: 'Etapa 1 — Campos obrigatórios', desktop: '../app/screens/nova-fazenda.html#step=1&state=required' },
                { id: 'nova-fazenda-etapa2', label: 'Etapa 2 — Localização e áreas', desktop: '../app/screens/nova-fazenda.html#step=2' },
                { id: 'nova-fazenda-etapa2-erros', label: 'Etapa 2 — Campos obrigatórios', desktop: '../app/screens/nova-fazenda.html#step=2&state=required' },
                { id: 'nova-fazenda-etapa2-area-invalida', label: 'Etapa 2 — Área de agricultura inválida', desktop: '../app/screens/nova-fazenda.html#step=2&state=areainvalida' },
                { id: 'nova-fazenda-etapa3', label: 'Etapa 3 — Talhões (vazio)', desktop: '../app/screens/nova-fazenda.html#step=3' },
                { id: 'nova-fazenda-etapa3-com-talhoes', label: 'Etapa 3 — Com talhões cadastrados', desktop: '../app/screens/nova-fazenda.html#step=3&state=comtalhoes' },
                { id: 'nova-fazenda-etapa3-modal-erros', label: 'Etapa 3 — Modal de talhão com erro', desktop: '../app/screens/nova-fazenda.html#step=3&state=talhaomodal' },
                { id: 'nova-fazenda-editar', label: 'Editar fazenda existente', desktop: '../app/screens/nova-fazenda.html?id=sao-joao' }
              ]
            }
          ]
        },
        // Épico "Contas Bancárias" (`type:'flow'`) — Configuração > Conta
        // bancária, ativa o item de sidebar que antes não tinha destino.
        {
          id: 'contas-bancarias-epico',
          label: 'Contas Bancárias',
          type: 'flow',
          screens: [
            {
              id: 'contas-bancarias',
              label: 'Contas Bancárias',
              desktop: '../app/screens/contas-bancarias.html',
              variants: [
                { id: 'contas-bancarias-empty', label: 'Nenhuma conta bancária', desktop: '../app/screens/contas-bancarias.html#state=empty' }
              ]
            },
            {
              id: 'nova-conta-bancaria',
              label: 'Nova Conta Bancária',
              desktop: '../app/screens/nova-conta-bancaria.html',
              variants: [
                { id: 'nova-conta-bancaria-editar', label: 'Editar conta bancária (exemplo)', desktop: '../app/screens/nova-conta-bancaria.html?codigo=1' }
              ]
            }
          ]
        },
        // Épico "Conta Financeira" (`type:'flow'`) — Configuração > Conta
        // Financeira, usada pra gerar o DRE e vincular lançamentos de Caixa.
        {
          id: 'contas-financeiras-epico',
          label: 'Contas Financeiras',
          type: 'flow',
          screens: [
            {
              id: 'contas-financeiras',
              label: 'Contas Financeiras',
              desktop: '../app/screens/contas-financeiras.html',
              variants: [
                { id: 'contas-financeiras-empty', label: 'Nenhuma conta financeira', desktop: '../app/screens/contas-financeiras.html#state=empty' }
              ]
            },
            {
              id: 'nova-conta-financeira',
              label: 'Nova Conta Financeira',
              desktop: '../app/screens/nova-conta-financeira.html',
              variants: [
                { id: 'nova-conta-financeira-editar', label: 'Editar conta financeira (exemplo)', desktop: '../app/screens/nova-conta-financeira.html?codigo=1' }
              ]
            }
          ]
        },
        {
          id: 'categorias-financeiras',
          label: 'Categorias de receitas e despesas',
          desktop: '../app/screens/categorias-financeiras.html',
          variants: [
            { id: 'categorias-financeiras-empty', label: 'Nenhuma categoria', desktop: '../app/screens/categorias-financeiras.html#state=empty' },
            { id: 'categorias-financeiras-error', label: 'Erro ao carregar', desktop: '../app/screens/categorias-financeiras.html#state=error' },
            { id: 'categorias-financeiras-created', label: 'Categoria cadastrada com sucesso', desktop: '../app/screens/categorias-financeiras.html#state=created' }
          ]
        },
        {
          id: 'nova-categoria-financeira',
          label: 'Nova categoria',
          desktop: '../app/screens/nova-categoria-financeira.html',
          variants: [
            { id: 'nova-categoria-financeira-editar', label: 'Editar categoria (exemplo)', desktop: '../app/screens/nova-categoria-financeira.html?codigo=CAT-001' }
          ]
        },
        // Épico "Unidade de Medida" (`type:'flow'`) — Configuração > Unidade
        // de medida: listagem (KG/LT/UN padrão do sistema + unidades
        // customizadas) + cadastro/edição.
        {
          id: 'unidades-medida-epico',
          label: 'Unidade de Medida',
          type: 'flow',
          screens: [
            {
              id: 'unidades-medida',
              label: 'Unidade de medida',
              desktop: '../app/screens/unidades-medida.html'
            },
            {
              id: 'nova-unidade-medida',
              label: 'Nova unidade de medida',
              desktop: '../app/screens/nova-unidade-medida.html',
              variants: [
                { id: 'nova-unidade-medida-editar', label: 'Editar unidade (exemplo)', desktop: '../app/screens/nova-unidade-medida.html?sigla=SC' }
              ]
            }
          ]
        },
        // Épico "Natureza da Operação" (`type:'flow'`) — Fiscal > Natureza
        // da Operação, substitui o item "Notas fiscais" removido do Fiscal.
        {
          id: 'natureza-operacao-epico',
          label: 'Natureza da Operação',
          type: 'flow',
          screens: [
            {
              id: 'naturezas-operacao',
              label: 'Natureza da Operação',
              desktop: '../app/screens/naturezas-operacao.html'
            },
            {
              id: 'nova-natureza-operacao',
              label: 'Nova Natureza de Operação',
              desktop: '../app/screens/nova-natureza-operacao.html',
              variants: [
                { id: 'nova-natureza-operacao-editar', label: 'Editar natureza de operação (exemplo)', desktop: '../app/screens/nova-natureza-operacao.html?codigo=NOP-001' }
              ]
            }
          ]
        },
        // Épico "Certificado Digital" (`type:'flow'`) — Fiscal > Certificado
        // Digital, ativa o item de sidebar que antes não tinha destino
        // (usado pelo bloqueio de emissão de Nova Nota Fiscal).
        {
          id: 'certificado-digital-epico',
          label: 'Certificado Digital',
          type: 'flow',
          screens: [
            {
              id: 'certificado-digital',
              label: 'Certificado Digital',
              desktop: '../app/screens/certificado-digital.html',
              variants: [
                { id: 'certificado-digital-comdados', label: 'Com certificados cadastrados', desktop: '../app/screens/certificado-digital.html#state=comdados' }
              ]
            },
            {
              id: 'importar-certificado',
              label: 'Importar Certificado',
              desktop: '../app/screens/importar-certificado.html',
              variants: [
                { id: 'importar-certificado-editar', label: 'Editar certificado (exemplo)', desktop: '../app/screens/importar-certificado.html?codigo=CERT-001#state=comdados' }
              ]
            },
            {
              id: 'certificado-detalhe',
              label: 'Detalhe do certificado',
              desktop: '../app/screens/certificado-detalhe.html#codigo=CERT-001&state=comdados',
              variants: [
                { id: 'certificado-detalhe-nao-encontrado', label: 'Certificado não encontrado', desktop: '../app/screens/certificado-detalhe.html#codigo=inexistente' }
              ]
            }
          ]
        },
        // Fiscal > Nota de entrada — página de entrada do subgrupo Fiscal
        // (paralela a Natureza da Operação/Certificado Digital), com a
        // seção de opt-in pra recebimento automático de NF-es de terceiros.
        {
          id: 'fiscal-nota-entrada',
          label: 'Fiscal',
          desktop: '../app/screens/fiscal.html'
        },
        // Épico "Minha Conta" (`type:'flow'`) — reorganiza a jornada "Minha
        // Conta" pra dentro de Configuração; nenhuma tela/estado existente
        // foi alterado, só a posição na árvore do navegador de protótipo.
        {
          id: 'minha-conta-epico',
          label: 'Minha Conta',
          type: 'flow',
          screens: [
            {
              id: 'minha-conta-dados',
              label: 'Minha Conta',
              desktop: '../app/screens/minha-conta.html#tab=dados'
            },
            {
              id: 'minha-conta-plano',
              label: 'Minha Conta · Plano',
              desktop: '../app/screens/minha-conta.html#tab=plano',
              variants: [
                { id: 'minha-conta-plano-teste', label: 'Período de teste', desktop: '../app/screens/minha-conta.html#tab=plano&state=teste' },
                { id: 'minha-conta-plano-mensal', label: 'Ativo · Licença mensal', desktop: '../app/screens/minha-conta.html#tab=plano&state=mensal' },
                { id: 'minha-conta-plano-aguardando', label: 'Aguardando pagamento', desktop: '../app/screens/minha-conta.html#tab=plano&state=aguardando' },
                { id: 'minha-conta-plano-cancelado', label: 'Cancelado', desktop: '../app/screens/minha-conta.html#tab=plano&state=cancelado' }
              ]
            },
            {
              id: 'minha-conta-pagamento',
              label: 'Minha Conta · Pagamento',
              desktop: '../app/screens/minha-conta.html#tab=pagamento',
              variants: [
                { id: 'minha-conta-pagamento-mensal', label: 'Mensal · renovação automática ativa', desktop: '../app/screens/minha-conta.html#tab=pagamento&state=mensal' },
                { id: 'minha-conta-pagamento-mensal-cancelada', label: 'Mensal · renovação cancelada', desktop: '../app/screens/minha-conta.html#tab=pagamento&state=mensal-cancelada' },
                { id: 'minha-conta-pagamento-renovacaoproxima', label: 'Anual · vencendo em breve (aviso)', desktop: '../app/screens/minha-conta.html#tab=pagamento&state=renovacaoproxima' },
                { id: 'minha-conta-pagamento-vencido', label: 'Anual · plano vencido', desktop: '../app/screens/minha-conta.html#tab=pagamento&state=vencido' },
                { id: 'minha-conta-pagamento-aguardando', label: 'Aguardando pagamento', desktop: '../app/screens/minha-conta.html#tab=pagamento&state=aguardando' }
              ]
            },
            {
              id: 'comprar-plano',
              label: 'Contratar plano (fluxo de compra)',
              desktop: '../app/screens/comprar-plano.html',
              variants: [
                { id: 'comprar-plano-renovacao', label: 'Via renovação de licença', desktop: '../app/screens/comprar-plano.html?motivo=renovacao' },
                { id: 'comprar-plano-vencido', label: 'Via plano vencido', desktop: '../app/screens/comprar-plano.html?motivo=vencido' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'caderno-de-campo',
      label: 'Jornada · Caderno de Campo',
      screens: [
        // Épico "Caderno de Campo" (`type:'flow'`, mesmo mecanismo de
        // agrupamento já usado no épico "Fazendas" dentro de Configuração) —
        // Caderno de Campo (listagem) → Detalhe da fazenda (operacional) →
        // Detalhe do talhão → Nova anotação são a mesma jornada/fluxo.
        {
          id: 'caderno-de-campo-epico',
          label: 'Caderno de Campo',
          type: 'flow',
          screens: [
            {
              id: 'caderno-de-campo-listagem',
              label: 'Caderno de Campo',
              desktop: '../app/screens/caderno-de-campo.html',
              variants: [
                { id: 'caderno-de-campo-empty', label: 'Nenhuma fazenda', desktop: '../app/screens/caderno-de-campo.html#state=empty' }
              ]
            },
            {
              id: 'fazenda-detalhe-operacional',
              label: 'Detalhe da fazenda (operacional)',
              desktop: '../app/screens/fazenda-detalhe.html#id=sao-joao',
              variants: [
                { id: 'fazenda-detalhe-operacional-sem-talhoes', label: 'Sem talhões cadastrados', desktop: '../app/screens/fazenda-detalhe.html#id=sao-joao&state=empty' },
                { id: 'fazenda-detalhe-operacional-nao-encontrada', label: 'Fazenda não encontrada', desktop: '../app/screens/fazenda-detalhe.html#id=inexistente' }
              ]
            },
            {
              id: 'talhao-detalhe',
              label: 'Detalhe do talhão',
              desktop: '../app/screens/talhao-detalhe.html#fazenda=sao-joao&talhao=t1',
              variants: [
                { id: 'talhao-detalhe-sem-anotacoes', label: 'Sem anotações registradas', desktop: '../app/screens/talhao-detalhe.html#fazenda=santa-rita&talhao=t4' },
                { id: 'talhao-detalhe-nao-encontrado', label: 'Talhão não encontrado', desktop: '../app/screens/talhao-detalhe.html#fazenda=sao-joao&talhao=inexistente' }
              ]
            },
            {
              id: 'nova-anotacao',
              label: 'Nova anotação',
              desktop: '../app/screens/nova-anotacao.html',
              variants: [
                { id: 'nova-anotacao-fazenda', label: 'Com fazenda pré-selecionada', desktop: '../app/screens/nova-anotacao.html?fazenda=sao-joao' },
                { id: 'nova-anotacao-talhao', label: 'Com fazenda e talhão pré-selecionados', desktop: '../app/screens/nova-anotacao.html?fazenda=sao-joao&talhao=t1' },
                { id: 'nova-anotacao-colheita', label: 'Tipo Colheita pré-selecionado', desktop: '../app/screens/nova-anotacao.html?fazenda=sao-joao&talhao=t2&tipo=colheita' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'estoque',
      label: 'Jornada · Estoque',
      screens: [
        {
          id: 'estoque-listagem',
          label: 'Estoque',
          desktop: '../app/screens/estoque.html',
          variants: [
            { id: 'estoque-listagem-contareceber', label: 'Estoque de Vendas · Criar conta a receber?', desktop: '../app/screens/estoque.html#state=contareceber' }
          ]
        },
        {
          id: 'estoque-novo-lancamento',
          label: 'Novo registo de estoque',
          desktop: '../app/screens/novo-estoque.html',
          variants: [
            { id: 'estoque-novo-lancamento-contapagar', label: 'Estoque · Criar conta a pagar?', desktop: '../app/screens/novo-estoque.html#state=contapagar' },
            { id: 'estoque-novo-lancamento-xml-carregando', label: 'Importação de XML (carregando)', desktop: '../app/screens/novo-estoque.html#state=xml-carregando' },
            { id: 'estoque-novo-lancamento-xml-erro', label: 'Importação de XML (erro)', desktop: '../app/screens/novo-estoque.html#state=xml-erro' },
            { id: 'estoque-novo-lancamento-xml-pesado', label: 'Importação de XML (arquivo muito pesado)', desktop: '../app/screens/novo-estoque.html#state=xml-pesado' }
          ]
        },
        {
          id: 'estoque-detalhe',
          label: 'Detalhes do registo de estoque',
          desktop: '../app/screens/detalhe-estoque.html#codigo=VND-001',
          variants: [
            { id: 'estoque-detalhe-compras-manual', label: 'Compras (entrada Manual)', desktop: '../app/screens/detalhe-estoque.html#codigo=CMP-001' },
            { id: 'estoque-detalhe-compras-xml', label: 'Compras (Importação de XML)', desktop: '../app/screens/detalhe-estoque.html#codigo=CMP-002' },
            { id: 'estoque-detalhe-comprometido', label: 'Estoque Comprometido', desktop: '../app/screens/detalhe-estoque.html#codigo=CMT-001' },
            { id: 'estoque-detalhe-nao-encontrado', label: 'Registro não encontrado', desktop: '../app/screens/detalhe-estoque.html#codigo=inexistente' }
          ]
        }
      ]
    },
    {
      id: 'financeiro',
      label: 'Jornada · Financeiro',
      screens: [
        // Épicos "Caixa" e "Contas a pagar" (`type:'flow'`, mesmo mecanismo já
        // usado em "Fazendas"/"Caderno de Campo") — agrupamento pedido pelo
        // usuário vale só pro navegador de protótipo. O menu lateral real do
        // produto (Sidebar/`interface-principal.js`) continua com um item
        // leaf só pra cada tela de listagem (decisão revertida em
        // 2026-08-03, ver app/CLAUDE.md).
        {
          id: 'caixa-epico',
          label: 'Caixa',
          type: 'flow',
          screens: [
            {
              id: 'caixa',
              label: 'Caixa',
              desktop: '../app/screens/caixa.html'
            },
            {
              id: 'novo-lancamento-caixa',
              label: 'Incluir lançamento',
              desktop: '../app/screens/novo-lancamento-caixa.html'
            },
            {
              id: 'transferencia-entre-contas',
              label: 'Transferência entre contas',
              desktop: '../app/screens/transferencia-entre-contas.html'
            }
          ]
        },
        {
          id: 'contas-a-pagar-epico',
          label: 'Contas a pagar',
          type: 'flow',
          screens: [
            {
              id: 'contas-a-pagar',
              label: 'Contas a pagar',
              desktop: '../app/screens/contas-a-pagar.html'
            },
            {
              id: 'nova-conta-pagar',
              label: 'Nova Conta a Pagar',
              desktop: '../app/screens/nova-conta-pagar.html',
              variants: [
                { id: 'nova-conta-pagar-editar', label: 'Editar (CTP-0001)', desktop: '../app/screens/nova-conta-pagar.html?codigo=CTP-0001&modo=editar' }
              ]
            },
            {
              id: 'detalhe-conta-pagar',
              label: 'Ver detalhes (Contas a pagar)',
              desktop: '../app/screens/detalhe-conta-pagar.html?codigo=CTP-0001',
              variants: [
                { id: 'detalhe-conta-pagar-parcelada', label: 'Conta parcelada (CTP-0009)', desktop: '../app/screens/detalhe-conta-pagar.html?codigo=CTP-0009' },
                { id: 'detalhe-conta-pagar-nao-encontrada', label: 'Conta não encontrada', desktop: '../app/screens/detalhe-conta-pagar.html?codigo=inexistente' }
              ]
            }
          ]
        },
        // Contas a Receber V2 (padrão): geração automática a partir de Nota
        // Fiscal/Pedido, recebimentos parciais/múltiplos em bancos
        // diferentes com desconto, filtro/coluna de Banco na listagem. A V1
        // (épico seguinte) permanece intacta e disponível pra comparação —
        // pedido explícito do usuário de manter as duas versões visíveis.
        {
          id: 'contas-a-receber-v2-epico',
          label: 'Contas a receber (V2)',
          type: 'flow',
          screens: [
            {
              id: 'contas-a-receber-v2',
              label: 'Contas a receber (V2)',
              desktop: '../app/screens/contas-a-receber-v2.html'
            },
            {
              id: 'nova-conta-receber-v2',
              label: 'Nova Conta a Receber (V2)',
              desktop: '../app/screens/nova-conta-receber-v2.html',
              variants: [
                { id: 'nova-conta-receber-v2-editar', label: 'Editar (CTR-0003)', desktop: '../app/screens/nova-conta-receber-v2.html?codigo=CTR-0003&modo=editar' }
              ]
            },
            {
              id: 'detalhe-conta-receber-v2',
              label: 'Ver detalhes (Contas a receber V2)',
              desktop: '../app/screens/detalhe-conta-receber-v2.html?codigo=CTR-0009',
              variants: [
                { id: 'detalhe-conta-receber-v2-parcial', label: 'Recebimentos parciais/múltiplos bancos (CTR-0003)', desktop: '../app/screens/detalhe-conta-receber-v2.html?codigo=CTR-0003' },
                { id: 'detalhe-conta-receber-v2-nao-encontrada', label: 'Conta não encontrada', desktop: '../app/screens/detalhe-conta-receber-v2.html?codigo=inexistente' }
              ]
            }
          ]
        },
        // Contas a Receber V1 (versão anterior, mantida intacta pra comparação).
        {
          id: 'contas-a-receber-epico',
          label: 'Contas a receber (V1)',
          type: 'flow',
          screens: [
            {
              id: 'contas-a-receber',
              label: 'Contas a receber (V1)',
              desktop: '../app/screens/contas-a-receber.html'
            },
            {
              id: 'nova-conta-receber',
              label: 'Nova Conta a Receber (V1)',
              desktop: '../app/screens/nova-conta-receber.html',
              variants: [
                { id: 'nova-conta-receber-editar', label: 'Editar (CTR-0003)', desktop: '../app/screens/nova-conta-receber.html?codigo=CTR-0003&modo=editar' }
              ]
            },
            {
              id: 'detalhe-conta-receber',
              label: 'Ver detalhes (Contas a receber V1)',
              desktop: '../app/screens/detalhe-conta-receber.html?codigo=CTR-0001',
              variants: [
                { id: 'detalhe-conta-receber-parcelada', label: 'Conta recorrente (CTR-0003)', desktop: '../app/screens/detalhe-conta-receber.html?codigo=CTR-0003' },
                { id: 'detalhe-conta-receber-nao-encontrada', label: 'Conta não encontrada', desktop: '../app/screens/detalhe-conta-receber.html?codigo=inexistente' }
              ]
            }
          ]
        },
        // Relatórios V2 (padrão): landing V2 + Balancete/LCDPR/DRE V2 (filtros revisados
        // por relatório) + Relatório de Compras/Relatório de Safra (novos, só na V2). A
        // V1 (épico seguinte) permanece intacta e disponível pra comparação — mesmo
        // padrão já usado em Contas a Receber V1/V2.
        {
          id: 'relatorios-v2-epico',
          label: 'Relatórios (V2)',
          type: 'flow',
          screens: [
            {
              id: 'relatorios-v2',
              label: 'Relatórios (V2)',
              desktop: '../app/screens/relatorios-v2.html'
            },
            {
              id: 'balancete-v2',
              label: 'Balancete (V2)',
              desktop: '../app/screens/balancete-v2.html'
            },
            {
              id: 'lcdpr-v2',
              label: 'LCDPR (V2)',
              desktop: '../app/screens/lcdpr-v2.html'
            },
            {
              id: 'dre-v2',
              label: 'DRE (V2)',
              desktop: '../app/screens/dre-v2.html'
            },
            {
              id: 'relatorio-compras',
              label: 'Histórico de custos dos insumos',
              desktop: '../app/screens/relatorio-compras.html'
            },
            {
              id: 'relatorio-safra',
              label: 'Relatório de Safra',
              desktop: '../app/screens/relatorio-safra.html'
            }
          ]
        },
        // Relatórios V1 (versão anterior, mantida intacta pra comparação) — inclui
        // Entradas e Saídas, removido da V2.
        {
          id: 'relatorios-epico',
          label: 'Relatórios (V1)',
          type: 'flow',
          screens: [
            {
              id: 'relatorios',
              label: 'Relatórios (V1)',
              desktop: '../app/screens/relatorios.html'
            },
            {
              id: 'balancete',
              label: 'Balancete (V1)',
              desktop: '../app/screens/balancete.html'
            },
            {
              id: 'lcdpr',
              label: 'LCDPR (V1)',
              desktop: '../app/screens/lcdpr.html'
            },
            {
              id: 'dre',
              label: 'DRE (V1)',
              desktop: '../app/screens/dre.html'
            },
            {
              id: 'entradas-saidas',
              label: 'Entradas e Saídas (V1)',
              desktop: '../app/screens/entradas-saidas.html'
            }
          ]
        }
      ]
    },
    {
      id: 'vendas',
      label: 'Jornada · Fiscal',
      screens: [
        {
          id: 'pedidos-venda-epico',
          label: 'Pedidos de Venda',
          type: 'flow',
          screens: [
            {
              id: 'pedidos-de-venda',
              label: 'Pedidos de Venda',
              desktop: '../app/screens/pedidos-de-venda.html',
              variants: [
                { id: 'pedidos-de-venda-vazio', label: 'Nenhum pedido cadastrado', desktop: '../app/screens/pedidos-de-venda.html#state=empty' },
                { id: 'pedidos-de-venda-emitirnfe-semcertificado', label: 'Emitir nota fiscal · Sem certificado', desktop: '../app/screens/pedidos-de-venda.html#state=emitirnfe-semcertificado' },
                { id: 'pedidos-de-venda-emitirnfe-comcertificado', label: 'Emitir nota fiscal · Com certificado', desktop: '../app/screens/pedidos-de-venda.html#state=emitirnfe-comcertificado' }
              ]
            },
            {
              id: 'novo-pedido-venda',
              label: 'Novo pedido de venda',
              desktop: '../app/screens/novo-pedido-venda.html'
            },
            {
              id: 'nova-remessa',
              label: 'Nova remessa',
              desktop: '../app/screens/nova-remessa.html'
            },
            {
              id: 'pedido-venda-detalhe',
              label: 'Detalhes do pedido de venda',
              desktop: '../app/screens/pedido-venda-detalhe.html#numero=PV-0002',
              variants: [
                { id: 'pedido-venda-detalhe-nfe-emitida', label: 'NF-e já emitida', desktop: '../app/screens/pedido-venda-detalhe.html#numero=PV-0001' },
                { id: 'pedido-venda-detalhe-nao-encontrado', label: 'Pedido não encontrado', desktop: '../app/screens/pedido-venda-detalhe.html#numero=PV-9999' }
              ]
            }
          ]
        },
        {
          id: 'notas-fiscais',
          label: 'Notas fiscais (V1)',
          desktop: '../app/screens/notas-fiscais.html'
        },
        {
          id: 'notas-fiscais-v2',
          label: 'Notas fiscais (V2)',
          desktop: '../app/screens/notas-fiscais-v2.html',
          variants: [
            { id: 'notas-fiscais-v2-origem-remessa', label: 'Notas de saída filtradas por Origem = Remessa', desktop: '../app/screens/notas-fiscais-v2.html#state=demoremessa' }
          ]
        },
        {
          id: 'nova-nota-fiscal',
          label: 'Nova nota fiscal',
          desktop: '../app/screens/nova-nota-fiscal.html',
          variants: [
            { id: 'nova-nota-fiscal-com-certificado', label: 'Com Certificado Digital cadastrado (emissão)', desktop: '../app/screens/nova-nota-fiscal.html#state=comcertificado' },
            { id: 'nova-nota-fiscal-ver', label: 'Ver detalhes (nota emitida)', desktop: '../app/screens/nova-nota-fiscal.html?numero=NF-1001&modo=ver' },
            { id: 'nova-nota-fiscal-ver-rejeitada', label: 'Ver detalhes (nota rejeitada)', desktop: '../app/screens/nova-nota-fiscal.html?numero=NF-1004&modo=ver' },
            { id: 'nova-nota-fiscal-corrigir', label: 'Corrigir nota rejeitada', desktop: '../app/screens/nova-nota-fiscal.html?numero=NF-1004&modo=corrigir#state=comcertificado' }
          ]
        },
        {
          id: 'manifestos',
          label: 'MDF-e (Manifesto)',
          desktop: '../app/screens/manifestos.html'
        },
        {
          id: 'novo-manifesto',
          label: 'Novo manifesto',
          desktop: '../app/screens/novo-manifesto.html',
          variants: [
            { id: 'novo-manifesto-editar', label: 'Editar', desktop: '../app/screens/novo-manifesto.html?numero=MAN-0001&modo=corrigir' }
          ]
        },
        {
          id: 'manifesto-detalhe',
          label: 'Detalhe do manifesto',
          desktop: '../app/screens/manifesto-detalhe.html#numero=MAN-0001',
          variants: [
            { id: 'manifesto-detalhe-com-seguro', label: 'Com seguro', desktop: '../app/screens/manifesto-detalhe.html#numero=MAN-0001' },
            { id: 'manifesto-detalhe-cancelado', label: 'Cancelado', desktop: '../app/screens/manifesto-detalhe.html#numero=MAN-0003' },
            { id: 'manifesto-detalhe-nao-encontrado', label: 'Não encontrado', desktop: '../app/screens/manifesto-detalhe.html#numero=inexistente' }
          ]
        }
      ]
    },
    {
      id: 'canal-ideias',
      label: 'Jornada · Canal de Ideias',
      screens: [
        {
          id: 'canal-ideias-feed',
          label: 'Canal de Ideias',
          desktop: '../app/screens/canal-ideias.html',
          variants: [
            { id: 'canal-ideias-empty', label: 'Nenhuma ideia encontrada', desktop: '../app/screens/canal-ideias.html#state=empty' }
          ]
        },
        {
          id: 'ideia-detalhe',
          label: 'Detalhe da ideia',
          desktop: '../app/screens/ideia-detalhe.html?codigo=ID-0001',
          variants: [
            { id: 'ideia-detalhe-sem-comentarios', label: 'Sem comentários ainda', desktop: '../app/screens/ideia-detalhe.html?codigo=ID-0003' },
            { id: 'ideia-detalhe-nao-encontrada', label: 'Ideia não encontrada', desktop: '../app/screens/ideia-detalhe.html?codigo=inexistente' }
          ]
        },
        {
          id: 'nova-ideia',
          label: 'Nova ideia',
          desktop: '../app/screens/nova-ideia.html'
        }
      ]
    },
    {
      id: 'videos',
      label: 'Jornada · Vídeos',
      screens: [
        {
          id: 'videos-listagem',
          label: 'Vídeos',
          desktop: '../app/screens/videos.html'
        }
      ]
    }
  ]
};

/*
 * Nota: o painel administrativo (`admin/`) tem seu PRÓPRIO navegador de
 * protótipo, separado deste — ver `admin-prototype-nav/` (mesma ferramenta,
 * config própria, acessado por um link/pasta diferente). As telas de
 * `admin/` não são registradas aqui.
 */
