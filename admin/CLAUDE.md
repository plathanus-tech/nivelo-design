# CLAUDE.md — Nivelo Admin (painel administrativo)

## Project context
Painel administrativo da Nivelo — separado de `app/` (produto, área logada do
cliente/produtor) e de `landing/` (site público). Público: equipe interna
Nivelo (suporte, comercial, operações), não o produtor rural.

Pasta própria de propósito, mesmo raciocínio já documentado em `app/CLAUDE.md`
("Escopo"): cada superfície do sistema (`landing/`, `app/`, `admin/`) tem seu
próprio `shared/` (fonts, CSS, ícones) e não referencia arquivos de outra
pasta, mesmo quando o conteúdo parece duplicado. `admin/` é acessado por um
link/rota diferente do login do produto (`app/screens/login.html`) — nunca a
mesma tela.

**Tema: Light only**, mesma regra do resto do sistema (`app/CLAUDE.md`) — nunca
`data-theme="dark"`.

## Storybook
Sempre `Storybook-Nivelo/` — nunca `Storybook/`. Reaproveitar componentes e
tokens reais (ver `app/rules.md` pro mapeamento já validado de cada
componente — Input, Button, Table, Dialog, etc. funcionam igual aqui, mesma
técnica de carregar o `.module.css` como stylesheet global).

## Identidade visual
Mesma identidade visual do resto do sistema (Storybook, tokens, tipografia,
espaçamento) — admin não é uma superfície visualmente distinta, só uma área
de acesso/conteúdo diferente. Fluxo de autenticação do admin é réplica 1:1 do
layout de duas colunas do produto (`app/shared/page-login.css`): painel
institucional com imagem (`admin nivelo.png`, não `gestão com nivelo.png`)
no desktop 1024px+, card sobreposto à imagem, mesmo shell/tipografia/
espaçamento/animações.

## Behavior rules
Mesmas regras de `app/CLAUDE.md` (Mobile First, sem hardcoded, sem `<style>`
inline, sem SVG inline exceto ícones sem equivalente no Lucide, copy sem
travessão).

## File paths from `screens/*.html`
- Tokens: `../../Storybook-Nivelo/src/tokens/tokens.css`
- Componentes: `../../Storybook-Nivelo/src/components/[Name]/[Name].module.css`
- Fonts: `../shared/fonts.css`
- Layout/CSS da tela: `../shared/page-[tela].css`
- Logos: `../../Storybook-Nivelo/public/logo-azul.svg` | `logo-branco.svg` | `logo-preto.svg`

## Navegação (navegador de protótipo PRÓPRIO do admin)
`admin/` tem seu próprio navegador de protótipo, separado de
`prototype-nav/` (que cobre só `app/`/`landing/`, o produto do cliente) —
pedido explícito do usuário, acessado por um link/pasta diferente:
`admin-prototype-nav/index.html`. Mesma ferramenta (`nav.js`/`nav.css`
idênticos, só a chave de `localStorage` do estado da árvore é própria, ver
`admin-prototype-nav/nav.js`), config própria em
`admin-prototype-nav/nav.config.js`. Toda tela nova criada aqui deve ser
registrada LÁ (nunca em `prototype-nav/nav.config.js`, que não referencia
mais nenhuma tela de `admin/`).

## Screens status
| Tela | Status |
|---|---|
| Login (admin) | Done |
| Recuperar senha (admin) | Done |
| Código de verificação (admin) | Done |
| Criar nova senha (admin) | Done |
| Estrutura do menu (Header + Sidebar) | Done — navegação com Dashboard como primeiro item de "Geral", seguido de Usuários, Assinantes expansível, Cupons e afiliados, Vídeos, Canal de ideias |
| Dashboard | Done — `dashboard.html`, primeiro item do sidebar. Só leitura/navegação, nenhum dado próprio: agrega `assinantes-data.js`/`pagamentos-data.js`/`cupons-data.js` (mesmas fontes de verdade já usadas em Assinantes/Histórico/Cupons, nenhum dado fictício). Visão geral (Novos clientes/Clientes recentes/Sem acesso recente/Em período de teste — nunca "Ativo/Inativo" pra frequência de acesso, que é conceito independente da situação de acesso/assinatura), Requer atenção (Renovações anuais e Testes próximos do fim em faixas 🔴/🟠/🟡, cada faixa com "Ver clientes"), Acesso dos clientes (mini gráfico de barra + nota de risco), Financeiro (4 KPIs do mês atual + gráfico de evolução mensal em SVG puro, mesma técnica de `cupom-detalhe.js`) e Cupons e Afiliados (4 KPIs do mês atual + ranking dos mais utilizados). Todo indicador de lista é clicável e leva para Assinantes/Histórico de Pagamentos via query string — nunca uma lógica ou UI de filtro própria do Dashboard: o parâmetro (`?situacao=`/`?acesso=`/`?acessoRecente=`/`?vencimento=`/`?periodicidade=`/`?teste=`/`?status=`) usa os mesmos valores dos dropdowns reais do Agrupamento de Filtros de Assinantes/Histórico — ao carregar, o dropdown correspondente já aparece selecionado (mesmo `reset()` do dropdown) e a tabela já filtrada pela lógica de filtragem que já existia, sem nenhum banner/nota extra; busca e demais filtros continuam disponíveis e combináveis. Jornada própria no navegador de protótipo ("Jornada · Dashboard"). |
| Usuários | Done — `usuarios.html`. Busca (nome/e-mail) + Agrupamento de Filtros (Perfil/Status) + tabela (Nome/E-mail/Perfil/Status/Ações) + Cards no mobile. Ativar/Desativar com modal de confirmação (Desativar destrutivo/Ativar primário, mesmo padrão de Categorias de receitas e despesas/Talhões). "Adicionar usuário" em modal (Nome/E-mail/Perfil obrigatórios), usuário nasce Ativo. Sem paginação (mesmo raciocínio de Fazendas/Categorias). Jornada própria no navegador de protótipo ("Jornada · Usuários"). |
| Planos (Assinantes) | Done — `planos.html`. Tabela (Nome/Descrição/Valor mensal/Valor anual/Status/Assinantes ativos/Última alteração/Ações — cabeçalho Brand 50 + zebra branco/gray-50, mesmo padrão de Usuários; colunas em `px` fixo com Ações `position:sticky` à direita durante o scroll horizontal, mesmo padrão de Categorias de receitas e despesas/Contas a Pagar), Cards no mobile (padding `--spacing-md`, mesmo de `.usr-mobile-card`). Sem criação/exclusão de plano (regra de negócio explícita). Editar em modal `md` (540px, grid 2 colunas a partir de 768px — Descrição/Nome/Benefícios full-width, Valor mensal+Status lado a lado), com confirmação obrigatória só quando o Valor mensal muda. Ativar/Desativar via ícone (ban/check-circle) + modal de confirmação (Desativar destrutivo/Ativar primário, mesmo padrão de Usuários/Talhões) — Toggle inline removido. Registrado como épico ("Épico · Planos") dentro da "Jornada · Assinantes" no navegador de protótipo. |
| Canal de Ideias (admin) | Done — mesma estrutura/layout/componentes/comportamento do Cliente (`canal-ideias.html`/`ideia-detalhe.html`/`nova-ideia.html`), com moderação exclusiva do admin: "Excluir ideia" (feed e detalhe) e "Excluir comentário" (detalhe), cada um com modal de confirmação (`.secondaryGray`+`.destructive`) e toast de sucesso antes/depois de remover. `ideias-data.js` ganhou `removeComentario()` (remoção real, mesma persistência via sessionStorage de `remove()`). Jornada própria no navegador de protótipo ("Jornada · Canal de Ideias"). |
| Histórico de Pagamentos | Done — `historico-pagamentos.html` (busca por nome/e-mail + Agrupamento de Filtros com Período/Plano/Status/Cupom/Afiliado + 4 KPIs do período + tabela paginada de 9 colunas com Ações `position:sticky`) + `pagamento-detalhe.html` ("Ver detalhes" — Dados do pagamento/Valores/Nota fiscal condicional, "Ver perfil do assinante" leva pra Assinantes). Consome `pagamentos-data.js` como fonte única de verdade; a seção "Pagamentos" de `assinante-detalhe.html` linka pra aqui via "Ver histórico completo", pré-filtrado pelo cliente. Nenhuma ação de gestão do cliente (Alterar plano/Bloquear/Liberar/Conceder dias) duplicada aqui — essas continuam só em Assinantes. |
| Cupons e Afiliados | Done — `cupons.html` (5 KPIs — Cupons ativos/Afiliados ativos são totais; Clientes indicados/Utilizações/Desconto concedido respeitam um seletor de período — + busca por nome/código + Agrupamento de Filtros com Tipo/Status/Período de validade + tabela de 10 colunas com Ações `position:sticky`) + `novo-cupom.html` (Tipo de cupom via RadioButton alterna Dados do afiliado+Comissão opcional × Dados da campanha, Configuração do cupom comum aos dois; edição via `?codigo=`, Tipo travado após criado) + `cupom-detalhe.html` (Informações principais/Comissão condicional/Métricas/gráfico de utilização por mês em SVG puro/Histórico de utilização com exportação CSV real). Regra "mesmo cliente não pode usar o mesmo cupom mais de uma vez" implementada em `cupons-data.js`'s `podeUtilizar()`/`registrarUtilizacao()`. Ativar/Desativar manual com confirmação, nunca exclusão. |
| Assinantes | Done — `assinantes.html` (busca por nome + busca por e-mail + Agrupamento de Filtros com Plano/Situação da assinatura/Situação de acesso/Acesso recente (último acesso ≤14 ou >14 dias)/Próximo vencimento (até 7/8 a 15/16 a 30/mais de 30 dias)/Período da assinatura (mensal/anual)/Período de teste (até 3/4 a 7/8 a 14/mais de 14 dias) — mesmos grupos apresentados no Dashboard, faixas calculadas em `data-*` na montagem da linha + tabela de 10 colunas com Ações `position:sticky`, mesmo padrão de Planos/Usuários, Cards no mobile) + `assinante-detalhe.html` (resolvida por `#id=`; cards Dados do cliente/Assinatura/Período de teste — condicional/Uso de IA — só informativo/Pagamentos com histórico/Cupom e afiliado — condicional, só consulta/Histórico da assinatura em timeline). Ações administrativas em modal: Alterar plano, Bloquear/Liberar cliente (situação de acesso sempre independente do status da assinatura, pode haver "Assinatura ativa + Acesso bloqueado"), Conceder dias gratuitos (individual, nunca altera o padrão do sistema), Gerar link de pagamento com cálculo de proporcionalidade de upgrade anual (nunca reinicia o ciclo — a data de renovação original permanece —, valor final editável para negociação comercial). Consome `planos-data.js` (Épico · Planos) como fonte de plano/preço, nunca duplica nome/valor. Consumo de tokens de IA é só informativo (sem cobrança/limite/configuração, regra de negócio explícita — não construída nesta primeira versão). Registrado como épico ("Épico · Assinantes") dentro da "Jornada · Assinantes" no navegador de protótipo. |
