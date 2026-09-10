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
| Assinantes | Done — `assinantes.html` (busca por nome + busca por e-mail + Agrupamento de Filtros com Plano/Situação da assinatura/Situação de acesso/Acesso recente (último acesso ≤14 ou >14 dias)/Próximo vencimento (até 7/8 a 15/16 a 30/mais de 30 dias)/Período da assinatura (mensal/anual)/Período de teste (até 3/4 a 7/8 a 14/mais de 14 dias) — mesmos grupos apresentados no Dashboard, faixas calculadas em `data-*` na montagem da linha + tabela de 11 colunas com Ações `position:sticky`, mesmo padrão de Planos/Usuários, Cards no mobile; "Plano atual" mostra nome + faixa de hectares contratada empilhados, "Hectares utilizados" logo após "Situação do teste" — ver round 1) + `assinante-detalhe.html` (resolvida por `#id=`; cards Dados do cliente/Assinatura/Período de teste — condicional/Uso de IA — só informativo/Pagamentos com histórico/Cupom e afiliado — condicional, só consulta/Histórico da assinatura em timeline). Ações administrativas em modal: Alterar plano (só planos ativos, ver round 1), Bloquear/Liberar cliente (situação de acesso sempre independente do status da assinatura, pode haver "Assinatura ativa + Acesso bloqueado"), Conceder dias gratuitos (individual, nunca altera o padrão do sistema), Gerar link de pagamento com cálculo de proporcionalidade de upgrade anual (nunca reinicia o ciclo — a data de renovação original permanece —, valor final editável para negociação comercial). Consome `planos-data.js` (Épico · Planos) como fonte de plano/preço, nunca duplica nome/valor. Consumo de tokens de IA é só informativo (sem cobrança/limite/configuração, regra de negócio explícita — não construída nesta primeira versão). Registrado como épico ("Épico · Assinantes") dentro da "Jornada · Assinantes" no navegador de protótipo. |

## Ajustes 2026-09-10 (round 1) — Assinantes: coluna "Hectares utilizados", faixa de
hectares contratada em "Plano atual", remoção de "Fiscal + WhatsApp"

Pedido em 4 partes sobre `assinantes.html` (listagem). Investigação prévia confirmou onde cada
informação já vive: `assinantes-data.js` é a fonte única dos assinantes (`planoId` referencia
`planos-data.js` via `plano()`); não existe nenhum vínculo real de dados entre `admin/` e
`app/` (cada superfície tem seu próprio `shared/`, por convenção do projeto — não há como
"consultar o Caderno de Campo do cliente" de verdade neste protótipo estático); não existia
nenhum campo de faixa de hectares em lugar nenhum, nem função que somasse hectares.

- **Coluna "Hectares utilizados"**, imediatamente após "Situação do teste" (9ª coluna → 10ª/
  11ª colunas viraram Tokens de IA/Último acesso/Ações, só reindexadas, nenhuma reordenada).
  Novo `assinante.hectaresUtilizados` (semente por assinante, mesmo espírito de
  `tokensConsumidos`/`ultimoAcesso` já existentes no mesmo arquivo — nenhum dos dois também é
  "calculado" ao vivo) + nova função `window.NiveloAssinantes.hectaresUtilizados(assinante)`
  (retorna `assinante.hectaresUtilizados || 0`, nunca `undefined` — cliente sem nada cadastrado
  mostra "0 ha"). Centralizada numa função só (não acessada direto pelas telas) de propósito:
  se um dia existir integração real com o Caderno de Campo do cliente (somando
  `fazenda.areaHa` de todas as fazendas da conta), só esta função precisa mudar.
- **"Plano atual" ganhou uma 2ª linha com a faixa de hectares CONTRATADA** (`assn-plano-nome`/
  `assn-plano-faixa`, empilhados, mesmo padrão visual já usado na coluna Cliente — nome+e-mail).
  Novo `assinante.faixaHectaresId` (enum fechado: `ate-100`/`101-200`/`201-300`/`acima-300`,
  mapeado por `FAIXA_HECTARES_LABELS` em `assinantes-data.js`) + `faixaHectaresLabel(assinante)`.
  **Nunca calculada a partir de `hectaresUtilizados`** — as 2 informações são independentes por
  design (pedido explícito, com exemplo literal: cliente com faixa contratada "101 a 200
  hectares" mas só 87 ha utilizados de fato — reproduzido no seed do assinante id 1).
- **"Fiscal + WhatsApp" removido das opções disponíveis pra novos usos/cadastros** — nunca
  excluído do catálogo (`planos-data.js` já tinha a regra "sem criação/exclusão de plano",
  só Ativar/Desativar), só `ativo:false`. Os 2 pontos que populam um dropdown de ESCOLHA de
  plano (`assinantes.js` e `assinante-detalhe.js`, cada um com "Alterar plano" e "Gerar link de
  pagamento") passaram a filtrar por `p.ativo` — "Alterar plano" ainda mostra o plano ATUAL do
  cliente mesmo se desativado (senão o dropdown não refletiria a realidade dele), mas não
  oferece nenhum outro plano inativo pra reatribuição; "Gerar link de pagamento" exclui
  qualquer plano inativo por completo (nunca é um destino válido de upgrade). O dropdown de
  FILTRO da listagem (`#dropdown-plano`) continua mostrando todos os planos, incl. inativos —
  intencional, é pra encontrar/visualizar assinantes legados, não pra atribuir um plano novo.
- **Bug real pego durante a implementação:** "Gestão Completa + WhatsApp" (um dos 3 tipos
  válidos exigidos pelo pedido) já estava `ativo:false`/`assinantesAtivos:0` no seed desde
  antes desta rodada (motivo não documentado) — sem corrigir, a filtragem por `ativo` teria
  deixado só 2 planos disponíveis (Fiscal/Gestão Completa), contradizendo o pedido. Reativado
  (`ativo:true`), `assinantesAtivos` ajustado pra 1 (bate com o assinante id 1, que já estava
  nesse plano no seed).
- **2 casos legados de "Fiscal + WhatsApp" no seed, preservados sem alteração automática**
  (pedido explícito): assinante id 3 (Marcelo Henrique Duarte, mensal, 45 ha) e id 6 (Diego
  Almeida Ferreira, anual, 340 ha) — `plano()` continua resolvendo nome/valor certos pra eles
  (o registro do plano em si nunca foi removido, só desativado), e o dropdown "Alterar plano"
  mostra o plano atual deles corretamente selecionado.

**Arquivos alterados:** `admin/shared/planos-data.js` (desativa Fiscal + WhatsApp, reativa
Gestão Completa + WhatsApp), `admin/shared/assinantes-data.js` (novos campos/funções),
`admin/screens/assinantes.html` (novo `<th>`), `admin/shared/assinantes.js` (nova célula +
"Plano atual" com faixa + filtro `ativo` nos 2 dropdowns de escolha + Cards mobile
reindexados), `admin/shared/assinante-detalhe.js` (mesmo filtro `ativo` nos 2 dropdowns),
`admin/shared/page-admin-assinantes.css` (largura da nova coluna, `min-width` da tabela
recalculado, estilos de `.assn-hectares`/`.assn-plano-nome`/`.assn-plano-faixa`).

Verificado ao vivo (`http-server`): cabeçalho com "Hectares utilizados" na posição certa;
Roberto (id 1) mostrando "87 ha" e "101 a 200 hectares" (bate com o exemplo literal do pedido);
Juliana (id 4) mostrando "245 ha" e "201 a 300 hectares" (2º exemplo do pedido); Fernanda (id 2,
em teste) mostrando "0 ha"; "Alterar plano" de um assinante comum oferecendo só os 3 planos
válidos, nunca "Fiscal + WhatsApp"; "Alterar plano" de um assinante legado (id 3) mostrando
"Fiscal + WhatsApp" pré-selecionado sem quebrar; "Gerar link de pagamento" nunca oferecendo
plano inativo; filtro da listagem continuando a mostrar "Fiscal + WhatsApp" pra achar os
legados; Planos (`planos.html`) confirmando 3 planos "Ativo" e só "Fiscal + WhatsApp"
"Inativo"; busca/Agrupamento de Filtros e Cards no mobile (375px, sem overflow horizontal)
sem nenhuma regressão; nenhum erro de console em nenhuma das 3 telas tocadas.

## Ajustes 2026-09-10 (round 2) — Assinantes: "—" no Fiscal + remoção definitiva do "Fiscal + WhatsApp"

Correção sobre o round 1 acima, pedido explícito do usuário: o plano Fiscal não tem Caderno de
Campo (só Emissão de Nota Fiscal/Cadastro de clientes e transportadoras/Cadastro de produtos/
Configurações de emissão de nota, ver `beneficios` em `planos-data.js` — só Gestão Completa e
Gestão Completa + WhatsApp têm "Cadastro Rural"/"Anotações no Caderno de Campo via WhatsApp"),
então não faz sentido cadastrar hectares nesse plano; e "Fiscal + WhatsApp" não deve mais
existir de forma alguma (o round 1 tinha optado por só desativar, não excluir).

- **"Hectares utilizados" mostra "—" pra assinantes do plano Fiscal**, nunca "0 ha" — são 2
  significados diferentes ("0 ha" = tem a funcionalidade, não cadastrou nada ainda; "—" =
  funcionalidade indisponível nesse plano). `window.NiveloAssinantes.hectaresUtilizados(
  assinante)` (`assinantes-data.js`) agora retorna `null` quando `assinante.planoId === 'fiscal'`;
  novo helper `formatHectares(hectares)` em `assinantes.js` traduz `null` → "—" na célula da
  tabela (Cards mobile não precisaram de mudança — só copiam o texto já renderizado da célula).
  `faixaHectaresLabel` não muda: a faixa CONTRATADA continua existindo pra clientes Fiscal (é
  informação de preço/contrato, não de uso).
- **"Fiscal + WhatsApp" removido de vez do catálogo** (`planos-data.js`) — não só `ativo:false`
  como no round 1, o objeto do plano foi apagado do array `PLANOS`. Só foi seguro fazer isso
  porque os 2 assinantes de exemplo que usavam esse plano foram reatribuídos (não havia
  assinante real usando `fiscal-whatsapp`, eram exemplos inventados no round 1 pra demonstrar o
  tratamento de plano legado — com o plano deixando de existir, o exemplo também deixa de fazer
  sentido).
- **Marcelo Henrique Duarte (id 3)** reatribuído de `fiscal-whatsapp` → `gestao-completa`
  (mesma faixa/hectares utilizados, `pagamentos[].descricao` atualizado pra "Mensalidade —
  Gestão Completa" com o valor mensal correto, R$ 169,00). **Diego Almeida Ferreira (id 6)**
  reatribuído de `fiscal-whatsapp` → `gestao-completa-whatsapp` (mesma faixa/hectares,
  `pagamentos[].descricao` atualizado pra "Assinatura anual — Gestão Completa + WhatsApp" com
  o valor anual correto, R$ 1.910,40). Comentários de "caso legado" removidos de ambos — não
  são mais casos especiais, são assinantes normais em planos ativos.

**Arquivos alterados:** `admin/shared/planos-data.js` (remove o objeto `fiscal-whatsapp`),
`admin/shared/assinantes-data.js` (`hectaresUtilizados()` retorna `null` pro plano Fiscal,
Marcelo/Diego reatribuídos), `admin/shared/assinantes.js` (novo helper `formatHectares`).

Verificado ao vivo (`http-server`): Fernanda (id 2) e Cerealista (id 5, ambos Fiscal) mostrando
"—" em Hectares utilizados, tanto na tabela desktop quanto nos Cards mobile; Planos (`planos.html`)
listando só os 3 planos válidos (Fiscal/Gestão Completa/Gestão Completa + WhatsApp), sem nenhum
vestígio de "Fiscal + WhatsApp"; Marcelo (id 3) e Diego (id 6) exibindo "Gestão Completa"/"Gestão
Completa + WhatsApp" corretamente, com hectares utilizados normais (45 ha/340 ha); dropdown
"Alterar plano" oferecendo só os 3 planos válidos (testado no assinante id 1); nenhum erro de
console.

## Ajustes 2026-09-10 (round 3) — Planos: preço por faixa de hectares

Mudança estrutural em `admin/shared/planos-data.js`: cada plano deixou de ter um único "valor
mensal"/"valor anual" — passou a ter `faixas`, um objeto com 1 entrada por faixa de hectares
(`ate-100`/`101-200`/`201-300`/`acima-300`, mesmos ids de `assinantes-data.js`/
`FAIXA_HECTARES_LABELS`). Cada faixa guarda só os 2 valores realmente digitados pelo admin —
`anualMensal` (equivalente mensal do plano anual) e, quando o plano tem `cobrancaMensal:true`
(Gestão Completa/Gestão Completa + WhatsApp; o Fiscal é sempre `false`), `mensal` (cobrança
mensal avulsa). `anualTotal` (=`anualMensal`×12) e `economia` (=`mensal`×12−`anualTotal`)
NUNCA são digitados à parte — só existe 1 função (`recalcularFaixa`) que os recalcula, chamada
sempre que `anualMensal`/`mensal` mudam (`updateFaixa`, o único ponto de escrita de preço do
sistema agora). Único plano com só anual (Fiscal) nunca recebe/grava `mensal`, mesmo que
alguém tente passar no patch.

**Compatibilidade com o resto do sistema, sem duplicar lógica:** `assinantes.js`/
`assinante-detalhe.js` (dropdowns de troca de plano, prorateamento de upgrade) e
`historico-pagamentos.js`/`pagamentos-data.js` continuam lendo `plano.valorMensal`/
`plano.valorAnual` como antes — esses 2 campos continuam existindo no plano (não só na
faixa), mas agora são só um ESPELHO somente-leitura da faixa "Até 100 hectares"
(`sincronizarCompat`, chamada toda vez que essa faixa muda). Nenhum desses 4 arquivos foi
tocado nesta rodada — zero risco de regressão nas telas de Assinantes, confirmado ao vivo
rodando `calcularProrateamentoUpgrade` no console sem erro.

**Tela `planos.html` reestruturada** (Opção A do pedido do usuário — resumo na listagem +
modal de edição detalhada, escolhida por ser o padrão já usado na própria tela: Editar/
Ativar-Desativar já eram modais, não telas próprias, então "Preços" virou um 3º modal em vez
de uma tela nova, mais consistente com a área): colunas "Valor mensal"/"Valor anual" da
tabela viraram uma só, "Faixa de preços" (menor a maior valor mensal-equivalente entre as 4
faixas, ex. "R$ 14,90 a R$ 46,90/mês, conforme hectares" — nunca os 12+ valores individuais,
só o resumo; `admin/shared/planos.js`, `faixaRange()` em `planos-data.js`, nunca guardado,
sempre derivado na hora de renderizar). Novo 3º ícone de ação "Preços" (`dollar-sign`) abre o
modal `#pln-faixas-dialog-overlay` (Dialog `lg`, corpo montado dinamicamente por JS porque os
campos variam conforme `plano.cobrancaMensal`): 4 blocos, um por faixa, cada um com o painel
"Anual" (fundo com leve tonalidade de marca, mesmo tratamento visual já validado na landing
page pro par Anual/Mensal) mostrando o input "Valor mensal equivalente" + os 2 textos
derivados somente-leitura (Cobrado anualmente/Economia anual, recalculados ao vivo a cada
tecla digitada, num preview client-side que espelha exatamente `recalcularFaixa` — a
gravação de verdade só acontece no Salvar) e, quando o plano tem cobrança mensal, um 2º
bloco "Mensal" ao lado com o input do valor mensal avulso. Confirmação de alteração de valor
(modal que já existia) reaproveitada, agora chamada pelo Salvar do modal de Preços em vez do
antigo Salvar do modal de Editar plano.

Modal "Editar plano" perdeu os campos Valor mensal/Valor anual (preço não mora mais lá) —
ficou só com Nome (disabled)/Descrição/Status/Benefícios, com um aviso de texto avisando que
os valores agora se editam pela ação "Preços".

**Plano "Fiscal + WhatsApp"**: já não existia mais no catálogo desde o round 2 (removido por
completo, não só desativado) — confirmado nesta rodada que continua fora (`list()` retorna só
`fiscal`/`gestao-completa`/`gestao-completa-whatsapp`) e que a nova estrutura de faixas não o
reintroduziu em lugar nenhum.

**Arquivos alterados:** `admin/shared/planos-data.js` (reescrito: `faixas`/`cobrancaMensal`/
`recalcularFaixa`/`sincronizarCompat`/`listFaixas`/`faixaRange`/`updateFaixa`, `update()` não
aceita mais `valorMensal`/`valorAnual`), `admin/shared/planos.js` (reescrito: nova coluna/
célula de faixa de preços, 3º ícone de ação, modal de Preços inteiro, máscara de moeda e
recálculo ao vivo por faixa), `admin/screens/planos.html` (coluna da tabela trocada, campos
de preço removidos do modal de Editar, novo modal de Preços), `admin/shared/page-admin-
planos.css` (larguras de coluna recalculadas pra 7 colunas, `.pln-preco-*`, `.pln-faixa-*`,
`.pln-edit-precos-hint`, remoção do CSS morto de "Modal em md... Valor mensal/Status lado a
lado").

Verificado ao vivo (`http-server`): tabela mostrando "R$ 14,90 a R$ 46,90"/"R$ 109,90 a
R$ 299,90"/"R$ 159,90 a R$ 379,90" pros 3 planos; modal de Preços do Fiscal só com o painel
Anual (sem Mensal); modal de Preços de Gestão Completa com Anual+Mensal lado a lado
(desktop) e empilhados (mobile 375px); edição ao vivo testada (mudar o valor anual da faixa
"Até 100" recalculou "Cobrado anualmente"/"Economia anual" na hora, sem reload); Salvar
disparando a confirmação de alteração de valor, aplicando e atualizando a tabela + toast de
sucesso; modal de Editar plano sem os campos de preço, com o aviso explicando onde editá-los;
tela de Assinantes (dropdowns "Alterar plano"/"Gerar link de pagamento", prorateamento de
upgrade) testada ao vivo sem nenhuma regressão; nenhum erro de console em nenhuma das 2 telas.
