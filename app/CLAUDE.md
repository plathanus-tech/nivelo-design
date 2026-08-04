# CLAUDE.md — Nivelo App (área logada / produto)

## Project context
Telas do produto Nivelo (não a landing page de marketing). Primeira tela: Login.
Público: pequenos e médios produtores rurais.

**Tema (atualizado 2026-07-21, round 6): o sistema inteiro é Light only.** O shell principal
(Header + Sidebar) chegou a ter suporte a Dark Mode (rounds 1-5), mas foi removido por pedido
explícito do usuário — nunca usar `data-theme="dark"`/`[data-theme="dark"]` em nenhuma tela
daqui pra frente, nem reintroduzir um botão de troca de tema sem pedido explícito.

## Ajustes 2026-07-22 (round 4) — Trial/bloqueio, navegação Cadastro, filtros, botões

- **Indicador de período de teste + modal de bloqueio (Dashboard):** badge discreto
  "Teste gratuito · N dias restantes" ao lado do título (`.dashboard-heading-row`, novo
  wrapper — mantém `.dashboard-topbar` com só 2 filhos pro `justify-content:space-between`
  já existente não quebrar). `#state=trialexpired` simula os 7 dias esgotados: mostra um
  modal de bloqueio (Dialog `md`, sem botão de fechar, sem dispensar por clique-fora/Esc —
  é bloqueio de verdade) com "Falar com administrador"/"Realizar pagamento" (nenhum dos
  dois com destino real ainda). Conteúdo do Dashboard continua visível atrás, dimmed pelo
  próprio scrim do `.overlay` — nenhum CSS extra de opacidade foi necessário.
- **Bug real corrigido no `prototype-nav/nav.js` (não no app em si):** trocar Desktop⇄Mobile
  enquanto uma tela sem `mobile:` próprio no `nav.config.js` (todas, hoje) estava selecionada
  forçava um reload via `about:blank` + `requestAnimationFrame` (pensado só pra troca de
  variante por hash) — se o rAF não disparasse a tempo, a prévia ficava travada em
  `about:blank` (reportado como "o protótipo sai da tela de Cadastro" ao trocar pra mobile).
  Corrigido: só recarrega de verdade se o `src` resolvido realmente mudar entre os dois
  devices; caso contrário o iframe só é redimensionado via CSS (`data-device`, já existia).
- **Cadastro — busca+filtros na mesma linha:** Search virou mais um item do mesmo flex row
  de `.cadastros-filters` (`.cad-filter-search`), mesma altura dos triggers de Dropdown
  (28px — não 36px, que era só do campo de data "Inativo desde"). Helper text removido,
  placeholder virou o texto que antes era o helper. Precisou de seletor com 4 classes pra
  vencer uma regra de 3 classes já existente (`.cadastros-filters .cad-filter .input`).
- **Modal de exclusão (Cadastro):** texto do corpo agora usa `.text-body-s`; botões do
  rodapé dividem a largura igualmente (`flex:1` cada), Cancelar em Outline Gray 700
  (reaproveita a estrutura do `.secondary`, só recolorido via seletor por id), Excluir
  continua `.btn.destructive` (já era o padrão certo).
- **Padrão recorrente identificado (2ª ocorrência) — rodapé de Dialog pode
  vazar/overflow:** quando os rótulos dos botões do `.footer` são largos o suficiente, o
  conteúdo do footer passa da largura útil e "vaza" pela margem esquerda (mesmo padrão do
  bug do Dialog de exclusão, round 3). Dessa vez os rótulos ("Falar com administrador"/
  "Realizar pagamento") não podiam ser encurtados — resolvido trocando `sm`→`md` (mais
  espaço) + empilhando os botões em largura total abaixo de 480px. Checklist mental: todo
  `.footer` de Dialog com 2+ botões de rótulo longo precisa ser conferido com
  `getBoundingClientRect()` nos extremos (mobile E desktop), não só visualmente.

## Ajustes 2026-07-23 (round 5) — Filtros lado a lado, loading, variantes de teste, R$ 0,00, sidebar

- **Fazenda + Período lado a lado:** quando o filtro de Fazenda aparece (mais de uma fazenda),
  `.dashboard-filters` vira uma grid de 2 colunas iguais (`.has-farm`, classe adicionada por
  `dashboard.js`) em vez do fluxo padrão que empilhava os dois abaixo de 1024px. Só stacka de
  volta abaixo de 320px (telas realmente muito estreitas).
- **Feedback de carregamento ao trocar Fazenda/Período:** `flashLoading()` em `dashboard.js` —
  dim breve (~450ms) nos cards + spinner discreto (`loader-2` girando) ao lado da tag de teste.
  Só dispara em troca real do usuário, não na seleção inicial/automática ao carregar a página.
- **3 variantes do indicador de período de teste**, todas acessíveis direto pelo prototype-nav:
  padrão (`≥3 dias`, tag azul), `#state=trialwarning` (2 dias, tag amarela), `#state=trialexpired`
  (0 dias, modal de bloqueio + `#app-shell` com `filter:blur(4px)` atrás — o overlay em si nunca
  borra, é irmão do `#app-shell` no HTML). **Reaproveita o componente `.badge` real do Table**
  (`data-status="info"`/`"warning"`, o mesmo já usado no Status do Cadastro) em vez de uma cor
  própria — corrigido depois de eu ter inicialmente inventado `.dash-trial-badge` com cor
  hardcoded via token solto, quando o componente certo já existia.
- **Toast de sucesso não fica mais coberto pelo Header:** `top` da `.dashboard-toast-region` passou
  a somar `--shell-header-height` (64px) + `--spacing-lg`, alinhando aproximadamente com a altura
  do `h1` da página em vez de nascer atrás do Header sticky.
- **Fazenda sem dados mostra "R$ 0,00":** tanto no `#state=empty` quanto ao selecionar "Fazenda
  Boa Esperança" (3ª opção do `#state=multifarm`, `hasData:false`) — Estoque/Saldo/Contas a
  pagar/Contas a receber mostram "R$ 0,00" de verdade (`setCurrencyZero()`) em vez de o campo
  sumir/ficar vazio. Safra continua com a ilustração de vazio (é "ha", não dinheiro).
- **Cadastro — ícone de busca:** placeholder estava colado no ícone (`padding-left` efetivo caindo
  pra 8px por causa de uma regra concorrente com shorthand `padding`, ver `rules.md` — bug de
  especificidade shorthand×longhand). Corrigido declarando `padding-left:40px` explícito.
- **Sidebar — navegação real:** "Dashboard" não navegava de volta ao Dashboard quando clicado a
  partir de outra tela (só "Cadastro"/"Sair" tinham destino real) — agora os dois usam o mesmo
  mapa `NAV_DESTINATIONS` em `interface-principal.js`. Os demais itens do menu continuam sem
  destino real (nenhuma tela construída ainda pra eles).

## Ajustes 2026-07-23 (round 6) — Auditoria de reaproveitamento + migração de tipografia de página

Usuário pediu confirmação de que tudo reaproveita componentes/tokens reais do Storybook — 3
agentes auditaram todo o `app/` (fluxo de autenticação, fluxo Criar conta, Dashboard/Cadastro/
Shell) procurando cor hardcoded e componentes reinventados. Achados corrigidos:

- **5 cores hardcoded em `page-login.css`** (`rgba(...)` reproduzindo `--color-brand-950`/
  `--color-brand-600`/`--color-gray-white` na mão) → trocadas por `color-mix(in srgb, var(--token)
  N%, transparent)`, mesmo padrão já usado em `.login-card` no mesmo arquivo.
- **Migração completa de tipografia de página pras classes `.text-*`** (só os `.module.css` dos
  17 componentes tinham sido migrados em 2026-07-22; o CSS de cada tela nunca tinha sido tocado) —
  ver `rules.md`, nova seção "Migração dos CSS de PÁGINA". Só migrado onde a combinação
  tamanho+peso batia exatamente com uma classe existente; o resto ficou como estava (tokens, sem
  classe semântica correspondente no catálogo).
- **Tooltip da Sidebar** (`page-shell.css` + `Sidebar.module.css`) alinhado aos tokens exatos do
  componente `Tooltip` real (padding/radius) — ver `rules.md`.

Guardada como regra permanente de memória: sempre checar se um componente/token do Storybook já
resolve antes de compor do zero (achados concretos: badge do trial period reinventado quando
`Table`'s `.badge` já resolvia; bug real em `Tab.module.css`, ver sessão anterior).

## Ajustes 2026-07-24 (round 7) — Toast de sucesso: dois bugs reais, não um

Usuário reportou que o conteúdo do toast (ícone/título+mensagem/botão de fechar) não estava
alinhado ao topo, e que a posição ainda não estava abaixo do Header. Investigação achou DOIS
bugs reais e distintos, ambos corrigidos:

1. **`--shell-header-height` fora de escopo:** estava declarada só dentro de `.app-shell`
   (`page-shell.css`), mas `.dashboard-toast-region` é irmã de `#app-shell` no HTML, não
   descendente — `var(--shell-header-height)` resolvia vazio ali, e o `top: calc(...)` do toast
   (adicionado numa rodada anterior, achando que já resolvia isso) nunca funcionou de verdade;
   o toast sempre esteve em `top:0`, atrás do Header. Corrigido movendo a variável pra `:root`.
2. **Colisão de classes de 3 vias** (`Feedback` × `Table` × `Dialog`, os 3 carregados como
   stylesheet global no Dashboard): `.body`/`.title` do toast (classes do Feedback) perdiam pro
   `.body` do Dialog (padding do corpo de modal) e pro `.title` do Dialog (tamanho/peso/cor de
   título de modal), por serem carregados depois no `<head>`. Isso empurrava título/mensagem
   pra baixo (não alinhado com ícone/botão de fechar) e trocava a cor semântica (verde/vermelho)
   por cinza. Corrigido com seletor composto `.dashboard-toast .body`/`.dashboard-toast .title`
   restaurando os valores originais do Feedback — ver `rules.md`.

Ambos os bugs juntos causavam exatamente o sintoma relatado. Ver `rules.md` pra detalhes
técnicos completos (nova seção sobre escopo de custom properties CSS + linhas novas na tabela
de colisão de classes).

## Ajustes 2026-07-24 (round 8) — Nova tela: Novo cadastro

Formulário completo de criação de Cliente/Fornecedor/Transportadora, acessado pelo botão "Novo
cadastro" de `cadastros.html` (que agora navega de verdade pra `novo-cadastro.html`, em vez do
flash-disable sem destino). Arquivos: `app/screens/novo-cadastro.html`,
`app/shared/page-novo-cadastro.css`, `app/shared/novo-cadastro.js`. Registrado no prototype-nav
dentro da "Jornada · Cadastro", com uma variante de demonstração
(`#state=transportadora`) que já pré-seleciona Tipo=Transportadora e adiciona um veículo de
exemplo. Detalhes completos (seções, campos, comportamento dos veículos/placas dinâmicos,
Tooltip) em `rules.md`, tabela "Screens registered" + nova seção "Tooltip".

**Nenhum componente novo do Storybook foi necessário** — tudo composto a partir de
`Input`/`Dropdown`/`Button`/`Table` (`.card` como container genérico, já estabelecido) +
`Tooltip` (primeiro uso real do componente, ver `rules.md`). A lista dinâmica de veículos/placas
é uma composição própria de página (sem componente "repeater" no Storybook), mesmo raciocínio já
documentado pra Popover+Calendário/indicador de steps: reaproveitar tokens/componentes em vez de
inventar, e só perguntar ao usuário quando um componente de verdade faria falta.

## Ajustes 2026-07-24 (round 9) — Novo cadastro (refinamentos) + Cadastro (tabela/abas)

Grande lista de ajustes pedidos pelo usuário nas duas telas mais recentes. Destaques:

- **Novo cadastro:** tooltip do Código agora tem DOIS triggers independentes (ícone de
  info centralizado nele mesmo; o campo inteiro, hover no input, centralizado no campo) —
  achado e corrigido um bug real no processo: o trigger do ícone estava herdando
  `width:100%` do `.wrapper` genérico de Input/Dropdown (nenhum dos dois módulos declara
  `width` condicional), esticando um ícone de 14px pra ~380px. CPF/CNPJ virou um único
  campo (`#nc-document`) que troca label/placeholder/máscara/valor ao mudar Tipo de
  pessoa, em vez de dois campos alternando `hidden`. Endereço reordenado pra bater com o
  Step 2 do fluxo de Criar Conta (CEP, Rua, Número+Complemento, Bairro, Cidade+Estado).
  Estado vazio de veículos ganhou ícone de caminhão. Cor de fundo do card de veículo
  trocada de `--color-bg-subtle` (gray-100, confundia com zebra de tabela) pra
  `--color-bg-brand` (Brand 50). Hierarquia de cor entre título do veículo
  (`--color-text-primary`) e labels dos campos (`--color-text-secondary`, escopado a
  `.novo-cadastro-vehicle .label`) — antes os dois liam quase no mesmo tom. "Placas"
  (título da seção) removido; botão de remover veículo virou ícone-só (lixeira) no
  HEADER do card, alinhado ao título, com tooltip explicativo. Placas: Placa 1 agora
  também é removível assim que há 2+ placas (renumeração automática já funcionava, só a
  visibilidade do botão na 1ª placa estava faltando); ícone X de remover placa
  centralizado verticalmente contra o INPUT (não a caixa label+input inteira) via um
  `.label` invisível espaçador acima do botão + `align-items:end` do row (mesmo
  princípio do resto do grid). Novos estados de demonstração `#state=required`/
  `#state=vehiclesinvalid` (aciona a validação sem navegar). Salvar com sucesso grava
  `sessionStorage['nivelo.novocadastro.success']` e volta pra `cadastros.html`, que agora
  mostra um toast "Cadastro incluído com sucesso!" (Feedback reaproveitado, mesmo padrão
  do Dashboard, incluindo a mesma colisão de 3 vias Feedback×Table×Dialog e o mesmo fix).
- **Componentes, corrigidos NA FONTE (afetam todo consumidor, não só estas telas):**
  `Dropdown.module.css`'s `.trigger` ganhou `height:44px` (igual ao Input — sem isso, UF
  ficava ~6px mais baixo que Placa, mesmo com `align-items:end`, porque o trigger não
  tinha altura fixa e dependia só de padding+line-height). `Tab.module.css`'s `.active`
  ganhou `font-weight:bold`; `.tab.active:hover` (seletor de 3 partes, mais específico
  que `.tab:hover` de 2 partes) corrigido pra usar `--color-action-primary-hover` em vez
  de deixar `.tab:hover{color:text-primary}` (quase preto) vencer no hover da aba ativa.
- **Cadastro (listagem):** tabela ganhou o MESMO zebra/cabeçalho do Dashboard
  (`.cadastros-table-card .th{background:gray-100}`, ímpar=bg-surface/par=gray-100),
  cópia do padrão `.dash-table-body`. Toast de sucesso novo (ver acima).
- **Nav do protótipo:** "Novo cadastro" já era uma thumbnail própria (screen de topo,
  não só variante) desde que foi criada — confirmado lendo `nav.js`
  (`buildScreenRow`/`collectEntries` tratam cada `screens[]` item como thumbnail própria,
  variantes só aparecem expandidas dentro dela). Adicionadas variantes novas:
  `#state=required`/`#state=vehiclesinvalid` em Novo cadastro, `#state=created` em
  Cadastro de pessoas e empresas.

Tudo verificado ao vivo via `getBoundingClientRect()`/`getComputedStyle()` (alinhamento
Placa×UF, centralização do X, larguras dos dois tooltips, cores de zebra/tabs) e um fluxo
E2E completo (preencher Nome → Salvar → toast na listagem).

## Ajustes 2026-07-24 (round 10) — Dropdown escapa de overflow:hidden, tooltips não duplicam, veículos Gray 50

Round curto de correções, todas achadas por testes reais (não só pedidos "de vista"):

- **Bug real, o mais importante deste round: dropdowns cortados por `.card{overflow:
  hidden}` (Table.module.css).** O `.menu` do Dropdown é `position:absolute` relativo ao
  `.wrapper`; qualquer campo perto do fim de um `.card` (ex.: "Tipo de pessoa" em Novo
  Cadastro) tinha o menu cortado pela borda arredondada do card. Fix: as 3 implementações
  de `initDropdown()` (`novo-cadastro.js`/`cadastros.js`/`dashboard.js`) agora reposicionam
  o `.menu` em `position:fixed` (inline, só nessas instâncias — `Dropdown.module.css`/
  `Dropdown.tsx` continuam com `position:absolute` padrão, intocados, já que o componente
  React não tem essa lógica de JS e mudar o CSS do componente quebraria o Storybook de
  verdade) calculado via `getBoundingClientRect()` do trigger, igual ao Popover/tooltip da
  Sidebar. Abre pra cima quando não há espaço suficiente abaixo, `maxHeight` sempre
  recalculado pro espaço real disponível (nunca corta a caixa, só limita quantos itens
  cabem sem rolar), fecha ao rolar a página/redimensionar (evita ficar com posição
  desatualizada). Verificado: o menu de "Tipo de pessoa" agora renderiza ~50px ABAIXO da
  borda do card (antes ficaria cortado) e continua totalmente visível.
- **Regressão own-goal do round anterior:** o `height:44px` que adicionei em
  `Dropdown.module.css`'s `.trigger` (pra alinhar Placa×UF) também afetou os dropdowns
  compactos de filtro do Cadastro (Situação/Data de cadastro), que ficaram 44px em vez dos
  28px combinados com o campo de busca — voltando a quebrar o alinhamento que uma rodada
  anterior já tinha corrigido. Fix: `height:28px` explícito em `.cad-dropdown .trigger`
  (page-cadastros.css), restaurando o visual compacto só nesta tela sem desfazer o fix
  global do Dropdown.
- **Tooltips do campo Código mostravam os DOIS balões ao mesmo tempo.** Causa: os dois
  triggers (ícone + campo inteiro) são descendentes do MESMO `.wrapper` (o wrapper do
  próprio Input, `#code-field`) — `.wrapper:hover .tip` do Tooltip.module.css é uma regra
  ambiente que dispara pros DOIS `.tip` sempre que o mouse está em QUALQUER lugar do campo,
  não só no elemento specificamente hovered. Reescrito pra JS (`initFixedTooltip()` em
  novo-cadastro.js): cada trigger tem seu próprio `mouseenter`/`mouseleave`/`focus`/`blur`
  controlando `style.opacity` inline (sempre vence contra CSS sem `!important`) +
  `position:fixed` calculado via `getBoundingClientRect()` (resolve de brinde o "cortado
  pelo overflow do card" que também afetava o tooltip de remover veículo). `#code-field
  .tip{opacity:0}` neutraliza a regra genérica do Tooltip.module.css (ID vence contra as 3
  classes da regra, sem precisar de `!important`). Verificado programaticamente: hover só
  no ícone → só o tip do ícone abre; hover só no campo → só o tip do campo abre.
- **Veículos: fundo voltou a ser cinza** (`--color-gray-50`, mais sutil que o
  `--color-bg-subtle`/gray-100 de antes) — o tom Brand 50 testado na rodada anterior foi
  removido por pedido do usuário.
- **Ícone de remover veículo "colado" ao título:** bug real, não só estético — o wrapper
  do tooltip (`.novo-cadastro-remove-vehicle-tooltip`) tinha herdado `width:100%` do
  `.wrapper` de Input/Dropdown (mesma classe compartilhada, ver Tooltip acima) mesmo
  depois do fix anterior, porque a regra ficava reaplicada a cada nova renderização de
  veículo. Resolvido de vez ao migrar pro `initFixedTooltip()` (que não usa mais a classe
  `wrapper`/`novo-cadastro-tooltip` nesses 3 triggers) + `display:inline-flex;flex-shrink:0`
  explícito. Confirmado via `getBoundingClientRect()`: ~766px de distância do título, ~16px
  da borda direita do card (exatamente o padding), título em uma linha só.
- **Placa+UF: alinhados lado a lado também no mobile** — removida a regra de
  `@media(max-width:479px)` que empilhava os dois campos em 1 coluna (pedido explícito do
  usuário: "deixar claro que os dois campos estão relacionados"). Verificado em 375px:
  mesma altura/topo pros dois campos, cabe confortavelmente.

## Ajustes 2026-07-24 (round 11) — Variante visual de tabela pra comparação (Cadastro)

Usuário pediu uma segunda opção de cores/tipografia/larguras pra tabela de Cadastro de
pessoas e empresas, explicitamente pra **comparar visualmente com o padrão atual antes de
decidir qual adotar** — não uma substituição. Implementado como uma classe modificadora
(`.table-variant-alt`) ligada via `#state=tablealt` (mesmo mecanismo de estados de
demonstração já usado em todo o app), registrada como variante no `prototype-nav`. O
padrão atual (header Gray 100/Bold, zebra White/Gray 100) continua sendo o que a tela
mostra por padrão, sem nenhuma mudança.

Variante: header White + labels Gray 700/Semibold (peso mais leve que Bold, novo token
`--font-weight-semibold:600` adicionado em `tokens.css` — a escala não tinha um valor
entre Medium/500 e Bold/700), ícone de ordenação Gray 500, linhas White/Gray 50 (contraste
mais sutil), bordas Gray 200, células Gray 900/Regular (já era o padrão). Larguras de
coluna redistribuídas via `table-layout:fixed` + `nth-child`: Tipo (antes a mais larga,
puxada pelo texto "Cliente, Fornecedor, Transportadora") e Ações (antes com mais espaço do
que 3 ícones precisam, agora 116px fixo) reduzidas, resto redistribuído. Ver `rules.md`,
seção Table, pra detalhes completos.

## Ajustes 2026-07-24 (round 12) — Segunda variante de tabela: cabeçalho compacto + paginação

Segunda opção de tabela pra comparação (além de `table-variant-alt` do round anterior),
ligada via `#state=tablecompact` (`.table-variant-compact`, independente das outras
duas — a padrão continua sendo o que a tela mostra sem hash nenhum). Cabeçalho: fundo
Gray 100 (de volta, diferente da 1ª variante que usava White), labels em CAIXA ALTA,
12px (já era o padrão do Table, "Text XS"), Gray 600, **Semibold (600)** — testado contra
Medium (500) e Semibold ficou melhor em CAIXA ALTA/12px sem precisar aumentar o
letter-spacing além do 0.06em já estabelecido em `.app-nav-section-title`
(page-shell.css). Precisou reaproveitar o token `--font-weight-semibold` já criado no
round anterior. Ícone de ordenação Gray 500 (mantido). Linhas/bordas reaproveitam OS
MESMOS valores da 1ª variante (White/Gray 50, Gray 200) por pedido explícito ("manter").

Linhas mais compactas: `.th`/`.td` do Table têm `height` FIXO (não só padding) —
reduzidos juntos (37→32px cabeçalho, 52→44px corpo). Larguras de coluna recalculadas com
`table-layout:fixed` pra caber sem `overflow-x:auto`: bug real encontrado nesse processo
— a coluna Ações em % (11%) ficava mais estreita que os 3 `actionBtn` de 32px+gaps
precisam (~112px reais, medido via `getBoundingClientRect()`), forçando scroll horizontal
mesmo com a tabela "cabendo" no total. Corrigido com Ações em `px` fixo (120px) em vez de
`%`, mesmo padrão já usado na 1ª variante.

**Paginação nova** (10 registros/página, só nesta variante): composição própria a partir
de tokens (sem componente Pagination no Storybook ainda — mesmo raciocínio já aplicado
ao Popover+calendário), botões de página no estilo do dia selecionado do calendário
(fundo `--color-action-primary` quando ativo), anterior/próxima reaproveitando
`actionBtn` do Table. Implementado separando "linha não bate com o filtro" (`.is-
filtered-out`, classe nova) de "linha fora da página atual" — os dois motivos controlam
o mesmo atributo `hidden` sem brigar entre si. Página reseta pra 1 ao mudar busca/aba/
situação/período, mas NÃO ao ordenar colunas ou excluir um cadastro (mantém a posição do
usuário nesses casos). Cards do mobile (`renderCards()`) já respeitam a paginação de
graça, sem nenhuma mudança — só leem `!row.hidden`, que já reflete filtro+página juntos.

Testado com `PAGE_SIZE` temporariamente reduzido (o dataset fictício de 12 linhas nunca
passa de 10 numa única Situação, então a paginação de verdade só ativa com um dataset
maior) — confirmado que próxima/anterior/clique direto na página funcionam, resetam
corretamente ao filtrar, e desabilitam nos extremos.

## Ajustes 2026-07-24 (round 13) — Tabela final, Editar cadastro, filtros incorporados

Mega-pedido de 6 partes, fechando a tela de Cadastro com o que o usuário definiu como versão
final. Ver `rules.md` (novas seções "Tabela (Cadastro): versão final de larguras de coluna +
paginação + Editar" e "Filtros + tabela: alternativa escolhida") pra detalhes técnicos
completos. Resumo:

- **Tabela: larguras de coluna finais** (`table-layout:fixed`, Ações em `px` fixo, resto em `%`)
  — corrigido um bug real de uma rodada anterior (`overflow-wrap:break-word` genérico quebrando
  "Transportadora" no meio da palavra) substituindo por regras por coluna (Tipo nunca quebra,
  Código nunca quebra, CPF/CNPJ e Contato usam ellipsis). **Esta é a versão final da tabela**,
  `.table-variant-compact` (cabeçalho compacto + paginação, já era a variante mais recente) virou
  o padrão direto no HTML, sem hash nenhum.
- **~25 linhas fictícias** adicionadas (37 no total) pra testar paginação de verdade (3 páginas
  de Ativos), todas com `data-record` JSON (endereço + veículos) alimentando o Editar.
- **Editar cadastro funcional:** navega pra `novo-cadastro.html#state=edit` com todos os campos
  pré-preenchidos a partir da linha clicada (via `sessionStorage`, payload grande demais pro
  hash). Salvar volta pra `cadastros.html` com um novo toast "Cadastro editado com sucesso!"
  (`#state=edited`).
- **Tabs mobile:** `font-size` reduzido (`--font-size-sm`) só abaixo de 768px, cabe sem cortar.
- **Filtros incorporados ao card da tabela** viraram o padrão final (Search+filtros+tabela+
  paginação como um componente só); variante "separada" (como era antes) e uma sub-variante
  "sem labels" continuam acessíveis pra comparação no prototype-nav.
- **Investigação de um falso alarme:** o toast de sucesso pareceu ter parado de funcionar durante
  a verificação, mas era só o `setTimeout` de 6s de auto-dismiss já existente combinado com o
  tempo gasto entre chamadas de ferramenta de debug — confirmado funcionando ao checar
  imediatamente após a navegação, nos dois estados (`created` e `edited`).

## Ajustes 2026-07-24 (round 14) — Fechamento da tela de Cadastro: tabela e variantes finais

Rodada de fechamento: o usuário decidiu definitivamente entre as opções testadas nos rounds
11-13 e pediu pra remover do protótipo tudo que não é a versão final. Ver `rules.md` (seções
"Tabela (Cadastro): versão final definitiva" e "Filtros: posição final... + Estado vazio") pra
detalhes técnicos completos. Resumo:

- **Tabela: `.table-variant-compact` é a única versão.** `.table-variant-alt`, o estado
  "original" sem paginação e as variantes de filtro incorporado/separado/sem-labels foram
  DELETADAS (CSS, JS, entradas de `prototype-nav`), não só desativadas.
- **Search + Filtros voltaram pra fora do card da tabela** (bloco próprio acima dela, como era
  antes de qualquer variante), mas usando a referência visual sem label testada na variante
  incorporada: Data de cadastro/Situação mostram só o placeholder/valor selecionado.
- **Colunas redistribuídas:** Contato passou a conter só telefone (os ~13 registros com e-mail
  no dataset fictício foram trocados por telefone), liberando espaço pra reduzir sua largura;
  Código ganhou mais largura + padding próprio, e o gap entre texto e ícone de ordenação
  aumentou em todas as colunas ordenáveis — o ícone de Código estava colado na borda com a
  coluna seguinte.
- **Novo estado "Nenhum cadastro" (`#state=empty`):** Search+filtros continuam visíveis; a área
  da tabela vira um bloco centralizado (ícone, mensagem, botão "Novo cadastro" que navega pro
  fluxo de criação).
- **Variantes finais no `prototype-nav`:** só 3 — padrão (sem hash), "Edição concluída"
  (`#state=edited`), "Nenhum cadastro" (`#state=empty`).

## Ajustes 2026-07-24 (round 15) — Cadastro: card de filtros separado, coluna Contato removida

Segundo round de fechamento no mesmo dia. Ver `rules.md` (seção "Tabela (Cadastro): versão
final definitiva") pra detalhes técnicos completos. Resumo:

- **Card de filtros voltou a ser separado do card da tabela** (revertendo a tentativa de
  incorporá-los ao mesmo card) — compacto/discreto (padding reduzido, borda Gray 200, sem
  sombra), Tabs → espaçamento pequeno → card de filtros → espaçamento pequeno → card da tabela.
- **Coluna Contato removida da tabela por completo.** O telefone de cada linha migrou pro
  `data-record` JSON (novo campo `telefone`), preservado só pra alimentar a tela de Editar.
  Tabela final: Nome | Código | Tipo | Status | CPF/CNPJ | Cidade | Ações, com prioridade de
  espaço pra Nome/Tipo/CPF-CNPJ. Migração das 37 linhas feita via script Node (regex +
  JSON.parse/stringify), não editando cada linha manualmente.
- **Variante "Cadastro realizado com sucesso" (`#state=created`) voltou ao `prototype-nav`**
  (tinha sido removida do nav no round anterior), texto do toast ajustado.
- **Estado "Nenhum cadastro":** ícone trocado pro mesmo `folder-plus` usado no item Cadastro
  da Sidebar.
- **Variantes finais no `prototype-nav`:** "Cadastro realizado com sucesso" (`#state=created`),
  "Edição concluída" (`#state=edited`), "Nenhum cadastro" (`#state=empty`).

## Ajustes 2026-07-24 (round 16) — Labels dos inputs em secondary, tooltip padrão nos ícones de ação

- **`.label` do Input/Dropdown (`Storybook-Nivelo/src/components/{Input,Dropdown}/*.module.css`)
  agora usa `--color-text-secondary`** (era `--color-text-primary`) — mudança de componente,
  vale pra toda tela que usa esses labels (Novo cadastro, Dashboard, Cadastro). O override
  `.novo-cadastro-vehicle .label` (que já deixava esses labels em secondary+medium pra não
  competir com o título "Veículo N") ficou só com `font-weight: medium` — a cor já é a mesma do
  padrão global agora, não precisa mais de override.
- **Tooltip padrão (Tooltip.module.css) nos ícones de ação da tabela de Cadastro** (Cadastrar
  nota fiscal / Editar / Excluir) — substituindo o `title` nativo do navegador. Mesma técnica
  `position:fixed` calculada via JS já usada em `novo-cadastro.js` (`initFixedTooltip`), agora
  também em `cadastros.js`, delegada em `document` (não `querySelectorAll` na carga) porque os
  botões da visão mobile são clonados/recriados a cada paginação.
  **Achado importante:** o `.tip` precisa ser reparentado pra `document.body` no primeiro hover
  — as linhas zebradas da tabela aplicam `filter:brightness()` no `<td>`, e qualquer `filter`
  num ancestral vira o "containing block" de um `position:fixed` (spec CSS), o que jogava o
  balão pra fora da tela quando ele ficava dentro do `<td>`. Referência de volta guardada em
  `btn.__tip` (propriedade direta no nó — depois de mover, `querySelector('.tip')` não acha
  mais). 111 botões (37 linhas × 3 ações) migrados via script Node (mesma técnica de
  regex/mass-edit do round 15), não editados manualmente.

## Ajustes 2026-07-24 (round 17) — Novo cadastro: card único + input/dropdown promovidos ao Storybook

Round em duas partes: primeiro um teste visual escopado só a `novo-cadastro.html`, depois
(mesmo dia, aprovado pelo usuário) promovido pros componentes reais.

- **Cadastro: revertido o fundo brand-50 do cabeçalho/botões** (tentativa errada de um round
  anterior) — `brand-50` fica só nos títulos das colunas da tabela (`.table-variant-compact
  .th`, era Gray 100).
- **Novo cadastro: as 4 seções do formulário (Dados/Fiscal/Endereço/Veículos) viraram 1 único
  `.card`**, separadas por `border-top` sutil (`.novo-cadastro-subsection + .novo-cadastro-
  subsection`) em vez de 4 cards empilhados. Títulos de seção reduzidos (eram `.title` do Table,
  24px) pra métrica de `.text-body-xl` (20px/1.5/0.01em) em Bold — `.novo-cadastro-subsection-
  title`, não mais `.title`/`text-subtitle-m`.
- **Nome + Nome fantasia lado a lado** (removido `.novo-cadastro-span-2` desses 2 campos — grid
  2 colunas já cuidava do resto).
- **Input/Dropdown: 4 ajustes promovidos pros `.module.css` reais** (`Storybook-Nivelo/src/
  components/{Input,Dropdown}/*.module.css`), depois de aprovados isolados em `novo-cadastro.html`
  — vale pro sistema inteiro agora, não só essa tela:
  - `.label` Medium (era Bold).
  - `.input::placeholder`/`.placeholder` (Dropdown) Gray 300 (era `--color-text-disabled`/Gray 400).
  - `.input:disabled`/`.trigger:disabled` mais suave: Gray 50 bg + Gray 100 border + Gray 500
    texto (era Gray 200 bg/border + Gray 400 texto) — Código (Novo cadastro) é o caso real.
  - Radius já era 8px (`--radius-sm`) em ambos, nenhuma mudança necessária aí.
  - **`page-login.css`'s `.label.login-field-label` (reafirmação de especificidade contra
    Checkbox, ver comentário "colisão de classes") também atualizado pra Medium** — sem isso, o
    Login teria ficado com labels Bold, inconsistente com o resto do sistema agora que o
    componente mudou.
  - `page-novo-cadastro.css`'s bloco de teste (escopado a `#novo-cadastro-form`) removido —
    virou redundante, os valores já são o padrão do componente.

## Ajustes 2026-07-27 (round 18) — Nova jornada: Estoque (só listagem)

Primeira tela da jornada de Estoque: `app/screens/estoque.html` + `app/shared/page-estoque.css`
+ `app/shared/estoque.js`, acessada pelo item "Estoque" da Sidebar (agora navega de verdade,
`NAV_DESTINATIONS` em `interface-principal.js`). Cadastro de Novo estoque e tela de Registro de
abatimento ficam fora do escopo — ver `app/rules.md` pra detalhes completos de estrutura/dados.

- Estrutura copiada de `cadastros.html` (header+botão primário, `Tab`, `.card`/`.cardHeader` como
  container de tabela, ações em ícone com Tooltip padrão via `position:fixed`+reparent) e do card
  de KPI do Dashboard (resumo com ícone+título+valor em destaque).
- 3 conceitos deliberadamente independentes (Vendas/Compras/Comprometido), nunca somados entre
  si — Compras usa contagem+lista por unidade em vez de soma, já que o mock tem unidades
  incompatíveis (Saca/Kg/Litro).
- Única ação de negócio: "Registrar abatimento" (ícone `minus-circle`) na tabela de Comprometido.
- **Bug real encontrado e corrigido na ordenação:** o ícone de sort (`chevrons-up-down`) precisa
  ser RECRIADO via `innerHTML` a cada clique, nunca só `setAttribute` num `<i>` que já existia —
  depois do primeiro `lucide.createIcons()`, o Lucide substitui o `<i data-lucide>` original por
  um `<svg>`, então um `querySelector('... i')` subsequente retorna `null` e quebra o handler
  silenciosamente antes de chegar no reorder de verdade (mesmo padrão que `cadastros.js` já usa
  corretamente — copiado de lá depois de identificar a causa).
- Sem busca/filtros/paginação nesta etapa (dataset mock pequeno demais pra justificar) e sem
  exportação (nenhum padrão de "Exportar para Excel" existe ainda em nenhuma tela do produto pra
  reaproveitar — inventar um novo violaria a diretriz de não criar padrões paralelos).
- Registrado em `prototype-nav/nav.config.js` como nova "Jornada · Estoque".

## Ajustes 2026-07-27 (round 19) — Estoque: ajustes finos nos cards, ações e nomenclatura

Segundo round no mesmo dia, refinando a listagem de Estoque construída no round anterior (não
reconstruída do zero, mesma estrutura geral mantida).

- Botão do header: "Novo estoque" → **"Novo lançamento"**.
- **Cards de resumo perderam a lista de produtos individuais** (o card de Compras tinha uma
  lista Adubo/Semente/Defensivo no round anterior) — agora só 1 indicador principal + 1
  informação secundária por card, mesma estrutura/altura/tratamento de ícone que os cards do
  Dashboard. Novo conteúdo: Vendas "1.250 sacas" + "5 produtos" (mock cresceu de 2 pra 5
  produtos pra bater com o exemplo do pedido); Compras "3 produtos" + "3 tipos de produtos"
  (nunca soma unidades incompatíveis); Comprometido "200 sacas pendentes" (computado a partir
  do `pendente` real de cada linha, não hardcoded) + "2 compromissos".
- Tabela de Estoque Comprometido: coluna **"Cooperativa" → "Destinatário"** (propriedade do
  mock também renomeada, `cooperativa` → `destinatario`) — evita presumir que todo compromisso
  futuro é com uma cooperativa.
- **Todas as 3 tabelas ganharam 2 ações em ícone** (antes só Comprometido tinha 1): "Ver
  detalhes" (`eye`, comum às 3) + uma ação de redução específica por conceito, todas ícone
  `minus-circle` + Tooltip padrão: "Registrar saída" (Vendas), "Registrar consumo" (Compras),
  "Registrar abatimento" (Comprometido, já existia). Nomes deliberadamente distintos — nunca
  "Registrar venda" (venda é operação comercial, não movimentação de estoque diretamente).
  `buildActionsHTML()` novo em `estoque.js` generaliza a montagem de `.cellActions` pra
  qualquer lista de {action, icon, label}, reaproveitado pelas 3 `render*()`.
- Handler de "ação sem tela ainda" generalizado de `[data-action="abatimento"]` pra
  `.actionBtn[data-action]` (cobre as 6 combinações de ação × tabela agora, mais "Novo
  lançamento").

## Ajustes 2026-07-27 (round 20) — Estoque: busca+exportação, filtros, paridade visual com Cadastro/Dashboard

Terceiro round no mesmo dia, sobre a mesma tela de listagem de Estoque (não reconstruída).

- **Busca + Exportar Excel** em `.estoque-filter-bar` (cópia exata de `.cadastros-filter-bar`),
  compartilhado pelas 3 abas, agindo sobre a aba ativa. Exportação é CSV real (BOM + delimitador
  `;`), respeita linhas visíveis (busca/filtros aplicados), não o dataset inteiro.
- **Filtros (Situação + Destinatário) só na aba Estoque Comprometido** — 1 botão "Filtros" abrindo
  um Popover com 2 `Dropdown`s + Aplicar/Limpar, mesma composição exata do Popover "Data de
  cadastro" de Cadastro (`position:fixed` via JS, fecha em clique-fora/Esc). Opções de
  Destinatário geradas dos valores reais do mock.
- **Bug real evitado nesta rodada:** ao escrever a regex de normalização de acento (`normalize
  ('NFD').replace(/[̀-ͯ]/g,...)`) e o BOM do CSV (`﻿`), digitar a sequência de
  escape Unicode diretamente inseriu os CARACTERES literais no arquivo em vez do texto de escape
  — corrigido construindo as duas strings via `String.fromCharCode(...)` explicitamente. Vale
  lembrar pra qualquer edição futura que precise inserir um escape `\u` num arquivo JS: verificar
  o resultado (`Read`/`Grep`) antes de assumir que o texto foi gravado como escape e não como
  caractere literal.
- **Título dos cards de resumo: causa raiz real encontrada.** O título "Safra 2025/2026" do
  Dashboard NÃO é 24px/Medium/Gray 700 (o que `.title` sozinho declara) — é 18px/Bold/Gray 900,
  resultado de uma colisão não intencional com `Dialog.module.css`'s `.title` (carregado depois
  no `<head>` daquela tela por causa do modal de trial). Replicado em Estoque com os mesmos
  tokens finais direto (`.estoque-summary-card .title`), sem importar `Dialog.module.css` à toa.
- **Container da tabela: `.estoque-table-card` não tinha sombra nenhuma** (só herdava `.card`
  puro) — Cadastro's `.cadastros-table-card` é transparente/sem borda/sombra no mobile e ganha
  fundo+borda+`--shadow-sm` a partir de 768px. Corrigido pra ser idêntico, confirmado via
  `getComputedStyle` byte-a-byte igual nas duas telas.
- Nota de arquitetura (não implementada): tabela é candidata natural a Main Component no
  Storybook — a implementação já segue essa filosofia (zero valores inventados, tudo cópia de
  regra/token de Cadastro/Dashboard), falta só a extração formal quando isso avançar.

## Ajustes 2026-07-27 (round 21) — Tab mobile promovido pro Storybook, fusão busca/tabela, Novo Lançamento

Quarto round no mesmo dia sobre Estoque: 3 ajustes na listagem já existente + a primeira versão
da tela de criação.

- **Tab mobile promovido pro componente:** `Tab.module.css` virou mobile-first de verdade
  (`--font-size-sm`+`--spacing-xs`/`--spacing-sm` por padrão, sobe pro tamanho "desktop" a partir
  de 768px; scrollbar da `.list` escondida por padrão) — antes era um override só de
  `.cadastros-tabs .tab` em `page-cadastros.css`. Removido o override redundante de Cadastro/
  Estoque (só um comentário apontando pro componente); qualquer tela nova que use `Tab` já ganha
  o tratamento mobile de graça, sem CSS próprio.
- **Exportar Excel ≈ Filtros:** `#estoque-export-btn` ganhou a mesma altura/borda/radius/fonte
  compactas do trigger "Filtros" ao lado (28px, `--color-border-muted`, `--radius-sm`,
  `--font-size-sm`) — ainda é o Button real (`.btn.secondary`), só ajustado visualmente pra
  conviver na mesma barra sem parecer um componente diferente.
- **Busca/Filtros/Exportação fundidos com a tabela:** novo wrapper `.estoque-list-card` (`.card`
  com o MESMO tratamento responsivo que só `.estoque-table-card` tinha antes — transparente no
  mobile, fundo/borda/`--shadow-sm` a partir de 768px) envolve a barra de controles + as 3
  `<section>` de tabela (só uma visível por vez); a barra ganhou um `border-bottom` como único
  divisor visual, perdendo a borda/sombra/fundo/`margin-bottom` próprios. Resultado: um único
  container visual (busca+filtros+exportação no topo, tabela embaixo), sem crescer a altura da
  barra de controles — igual ao pedido explicitamente nesta rodada, mesmo indo na direção
  OPOSTA da decisão final de Cadastro (que manteve os 2 cards separados de propósito, ver
  `app/rules.md`, "Tabela (Cadastro): versão final definitiva") — decisões independentes por
  tela, não uma contradição.
- **Nova tela: `screens/novo-estoque.html` + `page-novo-estoque.css` + `novo-estoque.js`**
  (ver `app/rules.md` pra descrição completa campo a campo). Mesma estrutura de
  `novo-cadastro.html` (1 `.card` único, subseções com divisor). Tipo de estoque
  (Vendas/Compras/Comprometido) dirige um formulário condicional. Produto é um **combobox**
  (Input de busca + menu próprio, não um `Dropdown` fechado) com cadastro rápido inline quando
  o produto buscado não existe (Nome + SKU opcional auto-gerado + Unidade — só os 3 campos
  mínimos, nada de NCM/CEST/ICMS/dimensões/peso). Unidade de medida do lançamento é sempre
  auto-preenchida a partir do Produto escolhido (nunca escolhida nova ali), evitando um
  descompasso tipo Soja+Kg. Campos condicionais por tipo: Fornecedor (opcional, Compras),
  Destinatário (obrigatório, Comprometido), Data do lançamento (Vendas/Compras) vs. Safra+Data
  prevista de entrega (opcional, Comprometido). Observações usa a classe `.input` do Input num
  `<textarea>` (não existe Textarea no Storybook ainda) — mesma aparência, só altura/resize
  ajustados via CSS. "Salvar lançamento" grava a mensagem de sucesso certa pro tipo lançado em
  `sessionStorage['nivelo.novoestoque.success']` e volta pra `estoque.html#tab=‹tipo›` (aba já
  vem selecionada); `estoque.js` ganhou a leitura desse flag (toast Feedback-como-Toast, mesmo
  padrão de Cadastro) + a leitura do hash `#tab=` pra pré-selecionar a aba. Este formulário só
  cria o lançamento inicial — não injeta uma linha de verdade nas tabelas mockadas (que vivem só
  em `estoque.js`) nem implementa Registrar saída/consumo/abatimento, por instrução explícita.
- **Nota sobre verificação neste round:** o Browser pane apresentou instabilidade real de cache/
  navegação nesta sessão (uma aba já aberta não recarregava CSS/JS novos mesmo após reload
  forçado ou abrir nova aba, e `navigate`/cliques reais por vezes não trocavam a página conforme
  reportado) — contornado testando a lógica via `fetch` com cache-bust + `eval` do arquivo atual
  direto no console da página já carregada, o que permitiu confirmar de verdade (não só por
  leitura de código) o combobox de Produto, o cadastro rápido com validação, os campos
  condicionais por Tipo, a validação do formulário e o fluxo de sucesso (toast + aba certa) — só
  não foi possível capturar screenshots nesta rodada por essa instabilidade do pane.

## Ajustes 2026-07-27 (round 22) — Rename, tabela unificada (retrofit em Cadastro), Cards mobile em Estoque, card Comprometido, Sidebar "Cadastros"

Quinto round no mesmo dia sobre Estoque, mais uma mudança que atravessa pra Cadastro e pro shell
inteiro (Sidebar).

- **Rename em cascata**: "Novo lançamento" → **"Novo registo de estoque"** em todo texto visível
  da jornada — botão de `estoque.html` (`#new-estoque-btn`), `<title>`/`<h1 id="novo-estoque-
  title">`/seção "Detalhes do lançamento"→"Detalhes do registo"/label "Data do lançamento"→"Data
  do registo" de `novo-estoque.html`, texto do botão "Salvar lançamento"→"Salvar registo", título
  do toast de sucesso ("Registo de estoque salvo com sucesso"), label no `prototype-nav`. Intenção
  explícita: diferenciar o conceito de estoque do conceito de "lançamento" já usado no módulo
  Caixa (Financeiro). Ids/`sessionStorage` keys/nomes de arquivo continuam iguais.
- **REVERSÃO deliberada de uma decisão anterior — busca/filtro fundido com a tabela vira o
  padrão do sistema, não mais uma escolha só de Estoque.** Pedido explícito do usuário nesta
  rodada. `app/rules.md` (seção "Tabela (Cadastro): versão final definitiva") tinha registrado
  "Card de filtros SEPARADO do card da tabela" como decisão final em 2026-07-24 — revertida agora
  por instrução direta, com nota de atualização datada acrescentada ali (histórico preservado, não
  apagado). `cadastros.html` ganhou um novo wrapper `<div class="card cadastros-list-card">`
  envolvendo `.cadastros-filter-bar` + `<section class="cadastros-table-card table-variant-
  compact">` (que perdeu a classe `.card` e o border/shadow/background próprios — o wrapper novo
  fornece isso agora, mesmo tratamento responsivo que só a tabela tinha sozinha: transparente no
  mobile, `--color-bg-surface`+borda+`--shadow-sm` a partir de 768px). `.cadastros-filter-bar`
  perdeu border/shadow/background/radius próprios, ganhou só `border-bottom:1px solid
  var(--color-gray-200)` como divisor. Confirmado via `getComputedStyle` que o resultado bate
  com `.estoque-list-card` (mesma arquitetura nas duas telas agora).
- **2 lacunas reais fechadas entre as tabelas de Estoque e Cadastro** (que na prática já
  compartilhavam cabeçalho/zebra/tipografia idênticos, só faltava isso): `.estoque-table-card .td`
  ganhou `border-color:var(--color-gray-200)` (Cadastro já tinha); as 3 tabelas de Estoque
  ganharam `table-layout:fixed` + larguras por coluna via `nth-child` (Vendas/Compras: 40/20/20% +
  Ações 120px fixo; Comprometido: 20/18/14/14/14/12% + Ações 120px fixo) — mesma disciplina que
  Cadastro já usava, evita a tabela depender do conteúdo pra decidir o layout.
- **+8px de respiro entre o divisor da barra de busca/filtros e o cabeçalho da tabela/cards**, nas
  duas telas — `padding-top:var(--spacing-sm)` em `.estoque-table-card .tableWrap`/`.estoque-
  mobile-cards` e em `.cadastros-table-card .tableWrap`/`.cadastros-cards` (antes o gap era só a
  borda de 1px do próprio divisor, sem respiro real).
- **Estoque ganhou Cards no mobile** (réplica do padrão já usado em Cadastro, nunca implementado
  antes em Estoque): `.estoque-mobile-cards`/`.estoque-mobile-card*` — cópia renomeada de
  `.cadastros-mobile-card*`, mesmo breakpoint (tabela escondida/Cards mostrados abaixo de 768px,
  invertido a partir daí). `estoque.js` ganhou `attachRecords()` com um 3º parâmetro (`panelKey`)
  pra atribuir um `row.id` estável (`vendas-row-0`, etc. — Estoque não tem um "código" único como
  Cadastro), um helper `buildQuantidadeCardHTML()` compartilhado por Vendas/Compras (mesmas 4
  colunas) + `buildComprometidoCardHTML()` próprio (mais campos + badge de Situação), e
  `renderMobileCards(panelKey)` chamado de dentro de `applyVisibility()` — Cards sempre espelham
  as `<tr>` visíveis na ordem atual (busca/filtro/ordenação já aplicados), nunca uma segunda fonte
  de dados. Ações/tooltips nos Cards funcionam de graça: os listeners delegados em `document` já
  usavam `.closest('.actionBtn[data-action]')`, então funcionam idêntico dentro de um Card.
- **Card "Estoque Comprometido" — hierarquia corrigida**: "200 sacas pendentes" (valor) + "2
  compromissos" (legenda, contagem de TODAS as linhas) virou **"200 sacas"** (valor, sem o sufixo
  redundante) + **"1 compromisso pendente"** (legenda, agora filtrada por `situacao ===
  'pendente'` — Milho já está Quitado e não conta mais; o "2" do pedido original contava todas as
  linhas sem esse filtro).
- **Sidebar: "Cadastro" (item único) virou o grupo expansível "Cadastros"** com 2 subitens —
  "Pessoas e empresas" (`data-nav="cadastro-pessoas"`, é quem navega de verdade agora pra
  `cadastros.html`) e "Produtos" (`data-nav="cadastro-produtos"`, sem tela ainda — só alterna
  `is-active`, mesmo padrão dos demais subitens sem destino de Financeiro/Vendas/Configuração).
  Réplica exata do padrão `.app-nav-group`/`.app-nav-submenu`/`.app-nav-subitem` já usado por
  Financeiro/Vendas — nenhuma CSS nova, só HTML+JS. `interface-principal.js`:
  `TOP_LEVEL_GROUP_IDS` ganhou `'group-cadastro'`; `NAV_DESTINATIONS` trocou a chave `cadastro`
  por `'cadastro-pessoas'`. As 6 telas com a Sidebar completa (`estoque.html`, `novo-estoque.html`,
  `dashboard.html`, `interface-principal.html`, `cadastros.html`, `novo-cadastro.html`) foram
  atualizadas; as 2 últimas (que marcavam `cadastro` como `is-active`) agora nascem com o grupo já
  aberto (`class="app-nav-group is-open"`, `aria-expanded="true"`) e "Pessoas e empresas" com
  `is-active`. Essa estrutura (categoria expansível + subitem sem tela ainda) é o padrão pra
  futuras expansões de Cadastros.
- **Nota sobre verificação**: mesma instabilidade de cache do Browser pane já documentada no
  round anterior (arquivos recém-editados servidos de uma versão desatualizada até uma navegação
  genuinamente nova acontecer, e cliques disparados via `javascript_tool` não navegam de verdade
  neste sandbox — só a navegação real da própria ferramenta ou um clique de usuário de verdade
  navegam) — contornado com `fetch`+`eval` do arquivo atual direto no console, e com a ferramenta
  de navegação (não cliques via script) pra confirmar os destinos reais. Tudo confirmado
  funcionando: CTA renomeado, tabela com bordas/larguras corretas, Cards no mobile nas 3 abas
  (com ações/tooltips funcionando), card Comprometido com a hierarquia nova, grupo "Cadastros"
  abrindo/fechando e navegando corretamente, nenhum erro de console em nenhuma tela tocada.

## Ajustes 2026-07-27 (round 23 — micro-ajustes: ícone Produtos + espaçamento de tabela)
- **Ícone do subitem "Produtos"** (Sidebar, grupo "Cadastros"): trocado de `data-lucide="box"`
  pra `data-lucide="wheat"` — mais representativo do produto agrícola. Aplicado nas 6 telas que
  têm a Sidebar completa (`estoque.html`, `novo-estoque.html`, `dashboard.html`,
  `interface-principal.html`, `cadastros.html`, `novo-cadastro.html`).
- **+8px de respiro extra entre a barra de busca/filtros e o conteúdo da tabela** (o "padrão de
  tabela do sistema" documentado no round anterior): o `padding-top` que fazia esse papel
  (`.estoque-table-card .tableWrap`, `.estoque-mobile-cards`, `.cadastros-table-card .tableWrap`,
  `.cadastros-cards`) subiu de `--spacing-sm` (8px) pra `--spacing-md` (16px) em
  `page-estoque.css` e `page-cadastros.css`. Mesmo mecanismo cobre os dois pedidos do usuário
  ("padding superior da tabela" e "gap entre busca/filtro e tabela") — é a mesma propriedade CSS
  vista de dois ângulos, não duas mudanças separadas. Nenhum outro espaçamento/estilo tocado.
- **+8px de padding vertical na área de Busca/Filtro**: `.estoque-filter-bar`/
  `.cadastros-filter-bar` tinham `padding: var(--spacing-sm) var(--spacing-md)` (8px vertical/16px
  horizontal) — vertical subiu pra `var(--spacing-md)` (16px), horizontal mantido em 16px. Só a
  barra de busca/filtro em si (o espaço interno dela, acima/abaixo dos campos) — não confundir com
  o gap entre essa barra e a tabela, ajustado no item anterior.
- **ATUALIZAÇÃO — respiro entre divisor e cabeçalho da tabela ZERADO de novo**: as duas rodadas
  anteriores tinham ido na direção de AUMENTAR esse gap (0 → 8px → 16px). Pedido explícito nesta
  rodada: colar os labels do cabeçalho da tabela no divisor da barra de busca/filtro, eliminando o
  espaço. `.estoque-table-card .tableWrap`/`.cadastros-table-card .tableWrap` voltaram pra
  `padding-top: 0`. Escopo deliberadamente restrito ao cabeçalho da TABELA real (desktop) —
  `.estoque-mobile-cards`/`.cadastros-cards` (Cards no mobile) mantiveram o respiro de 16px, já que
  o pedido falava especificamente de "labels dos cabeçalhos das colunas", que só existem na
  tabela, não nos Cards. Aplicado igualmente às duas telas por instrução explícita ("mesmo padrão
  visual e estrutural das demais tabelas").

## Ajustes 2026-07-27 (round 24) — Estoque: criação por tipo evoluída, 3 modais de ação reais, página de detalhes + histórico

Rodada grande: evolui a área de Estoque de "listagem + criação cosmética, sem ações reais" pra um
fluxo completo — criação com variantes por tipo (incl. importação de XML mockada), 3 modais de
ação que atualizam saldo/histórico de verdade, e uma página de detalhes nova com timeline de
movimentações. Decisões de arquitetura validadas com o usuário em plan mode antes de codar:

- **Sem `localStorage`/estado compartilhado entre páginas** — decisão explícita do usuário. Cada
  modal/ação muta o registro **só em memória, na página atual** (mesma fidelidade do resto do
  protótipo: busca/ordenação já eram só-de-sessão; "Novo registro" continua sem injetar linha real
  na tabela). A página de detalhes recebe o registro clicado via **handoff único em
  `sessionStorage`** (`nivelo.estoque.detalhe`, lido e IMEDIATAMENTE removido no boot — mesmo
  padrão já usado por `novo-estoque.js`→`estoque.html`), com fallback pra uma cópia local dos
  dados-seed (idêntica à de `estoque.js`, mesma convenção de duplicação já usada no projeto) se a
  página for aberta direto/recarregada — sem garantia de refletir operações feitas em outra aba.
- **Catálogo de Produtos centralizado**: novo `app/shared/produtos-data.js`
  (`window.NiveloProdutos`, `list/findByNome/findBySku/add`) — antes só existia dentro de
  `novo-estoque.js`. Usado agora por `novo-estoque.js`/`estoque.js`/`detalhe-estoque.js`. **Não**
  cria uma tela de gestão de Produtos (Sidebar continua um stub, decisão de rodadas anteriores) —
  arquitetado de propósito pra que, quando essa tela existir, leia direto deste mesmo arquivo.
- **Modelo de dados retrofitado** em `VENDAS`/`COMPRAS`/`COMPROMETIDO` (`estoque.js`): todo
  registro ganhou `codigo` estável (`VND-00N`/`CMP-00N`/`CMT-00N`, retrofit dos registros seed
  existentes), `sku` (+ `unidade` em Comprometido, gap real que não existia antes), e `historico`
  (array, começa com 1 entrada seed — `estoque-inicial`/`entrada`/`compromisso-inicial` — e só
  recebe novas entradas via `.push`, nunca reescrito). Vendas/Compras ganharam `quantidadeInicial`
  (nunca sobrescrita — só a `quantidade` viva diminui); Compras ganhou `tipoEntrada`
  (`manual`/`xml` — `Semente`/`CMP-002` é o exemplo com XML, pra a variante de detalhe ter conteúdo
  real), `fornecedor`/`valorUnitario`/`deposito`/`dataEntrada`.
- **Novo registo de estoque** (`novo-estoque.html`/`.js`/`page-novo-estoque.css`): ganhou um campo
  `#ne-codigo` (preview cosmético, sem persistência) e `#ne-codigo-referencia` (autofill do `sku`
  do Produto, ao lado de Unidade — antes só Unidade era exibida). Compras ganhou um segundo nível,
  "Forma de entrada" (`RadioButton.horizontal`, Manual/Importação de XML), alternando 2 blocos:
  **Manual** (existente + `#ne-valor-unitario` novo + Depósito opcional) e **XML** (Depósito +
  `input[type=file][accept=".xml"]` estilizado como dropzone + botão "Processar arquivo" que
  revela uma tabela de conferência mockada "Produtos identificados" — sem parsing real, sempre os
  3 primeiros produtos do catálogo central — com ação "remover" por linha; confirmar habilita o
  submit). Produto passou a ler de `window.NiveloProdutos` em vez do array local antigo. Submit
  continua sem injetar linha real (decisão já validada) — toast do fluxo XML menciona quantos
  produtos foram importados.
- **3 modais de ação reais** (`estoque.js`+`page-estoque.css`, Dialog do Storybook — 1ª vez nesta
  tela, precisou do guard `.overlay[hidden]{display:none}`, gotcha já documentado): substituem o
  "flash disable" antigo dos `data-action` de linha.
  - **Registrar saída** (Vendas): recap somente-leitura + Quantidade da saída (valida
    `0 < x <= quantidade`)/Preço de venda/Destinatário-Cliente (texto livre)/Data. **Gerar Nota
    Fiscal** (`RadioButton` Sim/Não) revela um recap mínimo reaproveitando os dados já digitados
    (Valor total calculado) + Natureza da operação — deliberadamente não uma emissão fiscal real.
    Botão de confirmar alterna de texto conforme a escolha.
  - **Registrar consumo** (Compras): recap + Quantidade de consumo (valida contra `quantidade`) +
    Data + Observação opcional.
  - **Registrar abatimento** (Comprometido): recap (Comprometida nunca muda) + Quantidade do
    abatimento (valida contra `pendente`) + Data + Observação opcional — recalcula
    `abatida`/`pendente`/`situacao` (lógica já existia, só roda de novo a cada confirmação).
  Cada confirmação: muta o registro, `historico.push(...)`, re-renderiza só a linha afetada +
  Card mobile + resumo da aba (nunca reconstrói o tbody inteiro, o que perderia ordenação/busca em
  andamento) + toast de sucesso. `Ver detalhes` passou a navegar de verdade (monta
  `{tipo, record}`, grava em `sessionStorage`, `location.href` pra `detalhe-estoque.html#codigo=`).
- **Nova página de detalhes** (`app/screens/detalhe-estoque.html`+`.js`+`page-detalhe-estoque.css`):
  seções "Informações principais" (Código/Tipo/Produto/Código de referência/Unidade/Depósito/
  Quantidade inicial/atual + badge de Status), "Informações específicas" (3 blocos por tipo,
  técnica `hidden` já usada em outros formulários), "Histórico de movimentações" (**timeline
  vertical**, não tabela — ícone+rótulo+quantidade+data+detalhe extra por entrada, linha conectora
  via CSS, termina numa linha "Saldo atual/disponível/comprometido"), e uma ação contextual (botão
  único conforme o tipo, abrindo os MESMOS modais da listagem — markup+lógica duplicados 1:1, já
  que não há módulo de estado entre páginas nesta rodada). Resolve o registro pelo `codigo` do hash
  via sessionStorage (handoff mais recente) → fallback pra cópia local dos dados-seed → estado
  "Registro não encontrado" se nada bater.
- **Bug real encontrado e corrigido durante a verificação**: o caminho de sucesso do `boot()` não
  resetava explicitamente `#detalhe-not-found`/`#detalhe-content` de volta — só o caminho de falha
  setava esse estado. Invisível num carregamento normal (só roda uma vez), mas ficou exposto ao
  reexecutar `boot()` (via `eval` do arquivo fresco, pra contornar cache do Browser pane) depois de
  um teste de "não encontrado" — as duas seções ficavam visíveis ao mesmo tempo. Corrigido:
  `boot()` agora seta os dois estados explicitamente em CADA branch, não só na falha.
- Registrado em `prototype-nav/nav.config.js`: novo item `estoque-detalhe` na jornada Estoque, com
  3 variantes (Compras/Manual, Compras/XML, Comprometido) via `#codigo=`.

**Nota de verificação**: sessionStorage é escopado por aba (spec do navegador, não um bug) — o
Browser pane às vezes abre uma ABA NOVA em vez de navegar a mesma aba ao usar a ferramenta de
`navigate`, o que quebra esse handoff só na ferramenta de teste (não no app real, onde
`window.location.href` sempre navega a mesma aba). Confirmado que a lógica de leitura está correta
replicando manualmente o payload exato na aba de destino. Mesma instabilidade de cache já
documentada em rodadas anteriores (JS servido desatualizado até `fetch`+`eval` forçar a versão
atual) apareceu de novo, incluindo hash da URL sendo descartado pela navegação da ferramenta
(contornado setando `location.hash` diretamente + reavaliando o script).

## Ajustes 2026-07-27 (round 25) — Bug real: colisão .input×RadioButton deixava campos invisíveis

Usuário reportou "vários labels sem input" no campo de busca do Estoque e nos formulários de Novo
registo/Registrar saída/consumo/abatimento. Uma auditoria anterior (ainda na rodada 24) já tinha
verificado o DOM e confirmado que todo `label` tem um input real correspondente — o que a
auditoria não fez foi olhar a tela renderizada. Desta vez, um screenshot + `getComputedStyle`
revelou a causa real: **exatamente a mesma colisão de classe `.input` entre Input×Checkbox já
documentada em `rules.md`, agora entre Input×RadioButton** — `RadioButton.module.css` declara um
`.input{position:absolute;width:1px;height:1px;opacity:0}` genérico pra esconder o radio nativo
atrás do círculo/dot customizado; como os `.module.css` do Storybook são carregados como
stylesheets globais (não CSS Modules de verdade), essa regra vazava pra QUALQUER `<input>`/
`<textarea class="input">` de texto real nas 3 telas que ganharam RadioButton na rodada 24 (Forma
de entrada em Novo registo de estoque; Gerar Nota Fiscal nos 3 modais de ação) — o campo de busca,
os 8+ campos de Novo registo de estoque, e todos os campos dos 3 modais ficavam com opacity:0 e
position:absolute (visualmente invisíveis, fora do fluxo do layout), sobrando só o label visível.
Bug real, não um falso-alarme como boa parte do pedido anterior (rodada 24 tinha, corretamente,
identificado que a maioria das alegações do usuário sobre "labels órfãos" e "placeholder em
inglês" não procedia — mas essa colisão específica, introduzida junto com o RadioButton daquela
mesma rodada, tinha passado despercebida por só ter sido verificada via manipulação de estado JS,
nunca visualmente).

**Correção** (sem nenhuma classe HTML nova, sem tocar em nenhuma lógica de negócio): `.input:
not([type="radio"])` em `page-estoque.css` e `page-novo-estoque.css`, reafirmando
`position:static;opacity:1` — o seletor `:not([type="radio"])` isola a correção só pros campos de
texto reais, sem tocar no radio nativo de verdade (que precisa continuar escondido do jeito que
está). Mais 2 ajustes de largura/altura pontuais: `width:100%` na regra já existente do campo de
busca, e uma nova regra `.estoque-modal-grid input.input:not([type="radio"])`/`.novo-estoque-grid
input.input:not([type="radio"])` pros campos dos modais/formulário que nunca tiveram uma regra de
largura própria (o seletor de TAG `input` nunca bate com `<textarea>`, então as textareas — que já
tinham sua própria regra de altura — não são afetadas). `detalhe-estoque.html` foi corrigido de
graça, já que carrega `page-estoque.css` e duplica o mesmo markup dos 3 modais.

**Lição, reforçando uma já registrada em rules.md**: verificação via `getComputedStyle`/
manipulação de estado em JS prova que a LÓGICA funciona, mas não prova que o campo está
VISUALMENTE correto — um bug de `opacity`/`position` como esse só aparece checando o computed
style de propriedades visuais (ou olhando o screenshot de verdade), nunca só testando se
`.value = 'x'` funciona. Ao adicionar um componente novo (RadioButton, Checkbox) numa tela que já
tem Input de texto, sempre checar a tabela de colisões em rules.md ANTES — nesse caso a colisão já
estava documentada há muito tempo pra Input×Checkbox, só não tinha sido generalizada mentalmente
pra "qualquer componente que esconda um input nativo via `.input{opacity:0}`" até agora.

## Ajustes 2026-07-28 (round 26) — Nova tela: Produtos (listagem + cadastro/edição)

Nova tela do cadastro central de Produtos, acessada pelo item "Produtos" da Sidebar
(`data-nav="cadastro-produtos"`, presente em todas as 7 telas com shell completo desde a rodada
22, mas até aqui um stub visual sem destino real). Pedido explícito do usuário: escopo isolado,
nenhuma tela/componente/padrão existente alterado além do estritamente necessário pra plugar a
nova tela na navegação. Investigação prévia (3 agentes Explore em paralelo) confirmou que toda a
base visual já existia (Table, Dropdown, Input, DatePicker, cards mobile, paginação, padrão de
formulário de `novo-estoque.html`) e que `app/shared/produtos-data.js` já tinha sido desenhado, por
comentário próprio, pra ser consumido por esta exata tela futura.

- **Arquivos novos:** `app/screens/produtos.html` + `app/shared/page-produtos.css` +
  `app/shared/produtos.js` (listagem, mirror estrutural de `cadastros.html`/`cadastros.js`);
  `app/screens/novo-produto.html` + `app/shared/page-novo-produto.css` +
  `app/shared/novo-produto.js` (formulário de criação/edição, mirror estrutural de
  `novo-estoque.html`/`novo-estoque.js`).
- **`produtos-data.js` estendido, nunca quebrado:** `nome`/`unidade`/`sku`/`list()`/
  `findByNome()`/`findBySku()`/`add()` continuam exatamente como estavam (consumidos por
  `novo-estoque.js`/`estoque.js`/`detalhe-estoque.js`). Campos novos por registro:
  `codigoReferencia` (o "Código Referência (SKU)" do formulário — deliberadamente **não**
  reaproveita o `sku` existente, que já é o "Código" auto-gerado formato `PRD-NNN`),
  `origemIcms`, `unidadeMedida`/`unidadeVolume` (vocabulário novo CX/UN/KG/LT/PT/FR/SC,
  deliberadamente separado do `unidade` legado em Saca/Kg/Litro/Unidade — os dois coexistem,
  nenhum substitui o outro; `novo-produto.js` mapeia o código novo pra um rótulo compatível com o
  vocabulário legado só ao CRIAR um produto, nunca ao editar um já existente), `cest`, `ncm`,
  `altura`/`largura`/`comprimento`/`pesoLiquido`/`pesoBruto`, `fatorConversao`, `controlaEstoque` +
  `qtdMinima`/`qtdMaxima`, `status` (`ativo`/`cancelado`/`bloqueado`), `estoqueAtual` (mock,
  isolado — ver decisão abaixo), `atualizadoEm`. Nova função `update(sku, patch)` pra edição.
- **Decisões confirmadas com o usuário antes de codar:**
  - As skills `/prototype-desktop`/`/prototype-mobile` citadas no pedido não existem neste
    ambiente — seguido os padrões responsivos já estabelecidos no próprio projeto (mobile-first,
    breakpoint 768px, cards no mobile).
  - Ações da linha da tabela: só **Editar** (sem Excluir) — Status já é um enum fechado de 3
    valores sem "Excluído", desativar um produto é editar o Status, não apagar a linha.
  - Coluna "Estoque": número **mockado isolado** direto em `produtos-data.js`, sem cruzar com os
    dados internos de `estoque.js` (que não expõe nada globalmente hoje).
- **Filtro "Atualizado a partir de" usa o componente DatePicker real** (`Storybook-Nivelo/src/
  components/DatePicker`, modo single-date) em vez de replicar o Popover+calendário feito à mão
  de Cadastro — reaproveita a mesma técnica já provada em "Data prevista de entrega"
  (`novo-estoque.js`), incluindo o fix de largura fixa (240px) que evita o calendário cortado (ver
  round 13 do arquivo de memória do Estoque).
- **`interface-principal.js`:** uma linha adicionada em `NAV_DESTINATIONS`
  (`'cadastro-produtos': 'produtos.html'`) — como esse arquivo é incluído do zero por cada
  página, essa única mudança ativa a navegação real do item "Produtos" em todas as 7 telas que já
  tinham o link de sidebar, sem precisar editar nenhuma delas.
- **`prototype-nav/nav.config.js`:** 2 novas entradas (`produtos-listagem`, `novo-produto`) dentro
  da journey `cadastro` já existente, seguindo o schema já usado por `cadastros-listagem`/
  `novo-cadastro`.
- Verificado ao vivo: navegação real pela Sidebar (de Estoque e de dentro da própria tela),
  listagem com os 8 produtos seed, busca/Status/"Atualizado a partir de" filtrando corretamente
  (incl. botão de limpar), ordenação texto+numérica, paginação, Cards no mobile, criação com
  validação bloqueando envio vazio e liberando com dados válidos, edição pré-preenchendo todos os
  campos (incl. Controla Estoque=Não escondendo Quantidade mínima/máxima), toast de sucesso, e
  nenhuma regressão em `estoque.html`/`cadastros.html`. Nota: o Browser pane deste sandbox
  descarta query strings (`?sku=...`) durante navegação via ferramenta — mesma classe de
  instabilidade já documentada pra hash em rodadas anteriores — contornado testando a lógica via
  `history.pushState`+`fetch`+`eval` do arquivo atual, confirmando que o fluxo funciona de verdade
  (o app real usa `window.location.href`, que preserva query string normalmente).

## Ajustes 2026-07-28 (round 27) — 5 ajustes pontuais: coluna Status, reorganização do formulário, gap no Detalhe do Estoque

Rodada de ajustes pontuais e escopo estritamente limitado (pedido explícito do usuário: só os 5
itens abaixo, nada mais tocado).

1. **Tabela de Produtos ganhou a coluna Status** (Nome/SKU/Estoque/Status/Ações), badge com os
   mesmos 3 valores do filtro (Ativo/Cancelado/Bloqueado), sortable como as demais colunas de
   dado (`STATUS_RANK` igual ao já usado em Cadastro). Larguras de coluna redistribuídas em
   `page-produtos.css` pra caber a 5ª coluna; índice de `row.children` usado por `buildCardHTML()`
   (Ações) atualizado de 3→4.
2. **Novo produto, "Informações principais" reorganizada:** Nome (1º campo agora) → Código
   Referência (SKU) → Código → Origem conforme ICMS → CEST → NCM. Unidade de Medida removida
   desta seção.
3. **"Conversão e armazenamento" virou a 2ª seção do formulário**, com Unidade de Medida (movida
   pra cá) → Unidade de Volume → Fator de Conversão. Dimensões e peso passou a ser a 3ª seção.
4. **Seção Status: label redundante removido** — só o título da seção "Status" permanece, o
   dropdown não repete mais o texto "Status" acima dele. Ativo continua o padrão pra produto novo.
5. **Detalhe do Estoque: gap de 16px entre os 3 cards** (`#detalhe-content`, que envolvia
   Informações principais/específicas/Histórico sem nenhum espaçamento).

**Bug real encontrado e corrigido no processo do item 5** (mais uma ocorrência do padrão já
documentado várias vezes neste projeto): a primeira versão do fix aplicou `display:flex` em
`#detalhe-content` sem guarda `:not([hidden])` — como esse elemento é escondido via atributo
`hidden` no estado "Registro não encontrado" (`detalhe-estoque.js`), o `display:flex` (seletor de
ID, especificidade maior que `[hidden]`) fazia o conteúdo REAL reaparecer por cima do estado de
erro. Corrigido pra `#detalhe-content:not([hidden])`. Verificado ao vivo nos dois estados
(registro real e "não encontrado") que só um aparece por vez.

Verificado ao vivo: coluna Status renderizando/ordenando corretamente (desktop e mobile, Ações não
quebrou), formulário com a nova ordem de seções e Unidade de Medida prefillando certo em modo
edição, label duplicado sumiu, gap de 16px confirmado via `getComputedStyle` nas duas telas de
Detalhe (com e sem registro), nenhuma regressão fora do escopo pedido.

## Ajustes 2026-07-28 (round 28) — Nova tela: Fazendas (Configuração > Cadastro de fazenda)

Ativado o item de sidebar "Configuração > Cadastro de fazenda" (`data-nav="config-fazenda"`, stub
visual desde a criação do shell — sem `NAV_DESTINATIONS`), com uma listagem em CARDS (não tabela,
pedido explícito: público-alvo tem normalmente 1-2 propriedades). Primeira journey própria de
Configuração no `prototype-nav` (`id: 'configuracao'`).

- **Arquivos novos:** `app/screens/fazendas.html` (shell completo, `#group-configuracao` já
  aberto + `config-fazenda` `is-active`), `app/shared/page-fazendas.css`, `app/shared/fazendas.js`,
  `app/shared/fazendas-data.js` (novo módulo central `window.NiveloFazendas`, mesma convenção IIFE
  de `produtos-data.js`/`cadastros-data.js`/`locais-data.js` — `{id, nome, cidade, estado, areaHa,
  talhoes, atualizadoEm}`, só `list()`). 3 fazendas seed, nomes reaproveitados de propósito do
  `FARMS` do Dashboard (São João/Santa Rita/Boa Esperança) só por consistência de nome entre telas
  — cópia de dado independente, sem import cruzado.
- **Grid responsivo novo no projeto:** `grid-template-columns: repeat(auto-fill, minmax(280px,
  1fr))` — os grids fixos de Dashboard/Estoque são sempre 3 colunas fixas (número de conceitos
  conhecido), mas a lista de fazendas cresce dinamicamente, então precisou de uma técnica nova
  (`auto-fill`) em vez de reaproveitar os grids fixos existentes.
- Cada card (`.card.fazenda-card`, o "Card genérico" de `Table.module.css`) mostra nome em
  destaque, localização (ícone `map-pin` + cidade/UF), Área total, Talhões, "Última atualização:
  dd/mm/aaaa" e um link "Ver fazenda →" no rodapé; o card inteiro é clicável.
- **Decisão confirmada com o usuário:** a página de detalhe da fazenda fica pra uma rodada futura
  ("vamos fazer no segundo momento essa tela"). Por isso, tanto o clique no card/"Ver fazenda"
  quanto "+ Nova fazenda"/"+ Cadastrar primeira fazenda" (do estado vazio) são só flash-disable
  (mesmo padrão já usado em ações sem tela pronta, ex. "Nota fiscal" em `cadastros.js`) — sem
  navegação real ainda.
- Estado vazio (`.fazendas-empty-global`, ícone `tractor` — mesmo ícone do item de Sidebar) mostra
  quando `NiveloFazendas.list()` está vazio ou via `#state=empty`; mirror exato do padrão já usado
  em `.produtos-empty-global`/`.cadastros-empty-global`.
- Sem busca, filtro, paginação ou tabela — pedido explícito ("não transforme a página em uma
  tabela administrativa complexa").
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'config-fazenda':
  'fazendas.html'`) ativa a navegação real nas 7 telas de uma vez, sem editar nenhuma delas.

Verificado ao vivo: navegação real da Sidebar (de Estoque e da própria tela) até Fazendas; os 3
cards seed renderizando com todos os campos pedidos (incl. os números exatos do exemplo do pedido
pra "Fazenda São João"); clique no card e nos botões de ação disparando só o flash-disable, sem
navegar; grid 1 coluna no mobile / múltiplas colunas no desktop via `auto-fill`; estado vazio
(`#state=empty`) mostrando corretamente; nenhuma regressão nas 7 telas existentes; nenhum erro de
console.

## Ajustes 2026-07-28 (round 29) — Nova tela: Detalhe da fazenda (Fazendas → Fazenda X)

A página de detalhe adiada no round 28 ("vamos fazer no segundo momento essa tela") foi pedida
agora. Contexto principal de uma propriedade: cabeçalho com breadcrumb/voltar, Resumo em 4
indicadores e a gestão dos talhões vinculados.

- **Arquivos novos:** `app/screens/fazenda-detalhe.html` (mesmo shell/sidebar de `fazendas.html`,
  `config-fazenda` continua `is-active`), `app/shared/page-fazenda-detalhe.css`,
  `app/shared/fazenda-detalhe.js`. Estrutura de página (← Voltar, estado "não encontrada", `.card`
  + `.cardHeader`/`.title`) copiada do mesmo padrão de `detalhe-estoque.html`/
  `page-detalhe-estoque.css` — incluindo o guard `#fazenda-detalhe-content:not([hidden])` pro mesmo
  bug de hidden+display já documentado nos rounds 21/27 deste arquivo.
- **Resolução por hash:** `fazenda-detalhe.html#id=<id>` — `NiveloFazendas.findById(id)` (nova
  função em `fazendas-data.js`, mesma convenção de `findBySku()`/`findByNome()` de
  `produtos-data.js`). Sem id ou id inexistente → estado "Fazenda não encontrada" (mirror do
  "Registro não encontrado" de Estoque).
- **`fazendas-data.js` estendido:** cada fazenda ganhou `talhoes` (array de talhões — `{id, nome,
  areaHa, cultura, safra, status}`, `status` é `'em-producao'` ou `'disponivel'`) e `culturaAtual`/
  `safraAtual`. **Decisão de consistência:** o número de talhões mostrado tanto no card da Listagem
  quanto no indicador "Talhões" do Resumo é sempre `talhoes.length` — uma única fonte, sem contagem
  duplicada — por isso os valores de área de cada talhão de uma fazenda somam exatamente a área
  total dela (`areaHa`); ajustei o `talhoes` da Santa Rita de 15 pra 5 (o número era só um valor
  inventado no round anterior, nunca especificado pelo usuário) pra bater com o tamanho da lista
  seed nova. `fazendas.js` (Listagem) mudou de `fazenda.talhoes` (era um número solto) pra
  `fazenda.talhoes.length`.
- **`fazendas.js`:** "Ver fazenda"/clique no card agora navega de verdade (`window.location.href =
  'fazenda-detalhe.html#id=' + id`) — não é mais flash-disable. "+ Nova fazenda"/"+ Cadastrar
  primeira fazenda" continuam sem destino (fluxo de cadastro de fazenda não foi pedido nesta
  rodada).
- **Resumo da fazenda:** 4 cards compactos (Área total/Talhões/Cultura atual/Safra), cópia
  deliberada do `.estoque-summary-card` (`page-estoque.css`) com classes próprias
  (`.fazenda-resumo-card`) e 4 colunas em vez de 3 (1 coluna mobile → 2 em ~560px → 4 em 1024px).
- **Seção Talhões:** lista compacta de linhas clicáveis (`.talhao-row`, um `<button>` cada, não
  tabela nem os cards em grid da Listagem — pedido explícito de manter simples), badge de status
  (`success`/"Em produção" ou `info`/"Disponível") sem um label "Status:" redundante ao lado (mesmo
  princípio do item 4 do round 27: badge já comunica o status sozinho). Estado vazio
  (`.talhoes-empty`, mirror de `.fazendas-empty-global`) via `#state=empty` no hash ou lista vazia
  de verdade.
- **Menu secundário (kebab):** botão `.actionBtn` (ícone `more-vertical`, já usado nos ícones de
  ação das tabelas) abre um popover próprio e novo (`.fazenda-detalhe-menu`) com "Excluir fazenda"
  (estilo danger) — não existe componente de menu-de-ícone no Storybook ainda, popover escopado só
  a esta página.
- Editar fazenda/Novo talhão/clique no talhão/Cadastrar primeiro talhão/Excluir fazenda continuam
  flash-disable — formulário de edição de fazenda e cadastro/detalhe de talhão ficam pra uma
  rodada futura (mesmo princípio já usado pra "Nova fazenda" no round 28).
- **`nav.config.js`:** novo screen `fazenda-detalhe` na journey `configuracao`, com variantes "Sem
  talhões cadastrados" (`#id=sao-joao&state=empty`) e "Fazenda não encontrada" (`#id=inexistente`).

Verificado ao vivo: clique real no card "Fazenda São João" navega pra
`fazenda-detalhe.html#id=sao-joao`; Resumo mostra 125 ha/8/Soja/2026/27; os 8 talhões renderizam
com área/cultura/safra/status corretos (área soma 125 ha, batendo com o total da fazenda); menu
kebab abre/fecha e "Excluir fazenda" dispara o flash-disable; clique num talhão dispara o
flash-disable (sem navegar — não existe tela de talhão ainda); sem hash e com `#id=inexistente`
mostram "Fazenda não encontrada"; `#state=empty` mostra o estado vazio de Talhões corretamente;
responsivo em mobile (375px, cards do Resumo em coluna única) e desktop; nenhum erro de console;
nenhuma regressão na Listagem de Fazendas nem nas demais telas.

## Ajustes 2026-07-28 (round 30) — Split "Detalhe da fazenda": Fazendas (cadastral) × Caderno de Campo (operacional)

O usuário decidiu que a tela `fazenda-detalhe.html` do round 29 é conceitualmente **operacional**
(contexto de campo/produção) e pertence à Jornada · Caderno de Campo (ainda não construída além
desta tela — só a categorização na navegação foi pedida). A Jornada · Fazendas ganhou uma tela
**cadastral** nova e distinta, com finalidade de consulta de dados da propriedade + gestão de
talhões.

- **Reorganização no `prototype-nav` (nav.config.js), sem tocar no arquivo antigo:**
  `fazenda-detalhe.html` (arquivo, JS e CSS 100% preservados, zero mudança de conteúdo) saiu do
  screen-entry da journey `configuracao` e foi pra uma nova journey `caderno-de-campo` ("Jornada ·
  Caderno de Campo"), como screen `fazenda-detalhe-operacional`. O nome do arquivo em si não mudou
  — só a entrada de navegação que apontava pra ele.
- **Arquivos novos pra tela cadastral:** `app/screens/fazenda-detalhe-cadastro.html` (mesmo shell/
  sidebar de `fazendas.html`), `app/shared/page-fazenda-detalhe-cadastro.css`,
  `app/shared/fazenda-detalhe-cadastro.js`. Registrada como screen `fazenda-detalhe-cadastro` na
  journey `configuracao` (no lugar que `fazenda-detalhe` ocupava).
- **`fazendas.js`:** "Ver fazenda"/clique no card agora navega pra
  `fazenda-detalhe-cadastro.html#id=<id>` (a tela CADASTRAL) — não mais pra `fazenda-detalhe.html`
  (a operacional, que só é alcançada via Jornada · Caderno de Campo no `prototype-nav` por
  enquanto).
- **Cabeçalho:** "← Fazendas" + nome + localização + só "Editar fazenda" (sem menu kebab — não
  pedido nesta tela).
- **"Dados da fazenda":** um único `.card` com 4 subgrupos internos (`dl`/`dt`/`dd`, consulta
  read-only, não formulário) — Identificação (Código/Nome/Proprietário/CNPJ/Inscrição Estadual/
  Matrícula), Localização (Endereço completo/Latitude/Longitude), Áreas (Área total/Área de
  agricultura), Arrendamento (só quando `fazenda.arrendamento` existe — São João e Boa Esperança não
  têm, Santa Rita tem, pra demonstrar os dois estados). **Bug pego e corrigido nesta rodada:** o
  grupo `.dados-group` tinha `display:flex` incondicional — mesmo bug de hidden+display já
  documentado várias vezes neste arquivo — corrigido com `.dados-group:not([hidden])`. A borda/
  padding entre grupos usa `.dados-group + .dados-group` (não `:first-of-type`, que nunca bateria
  aqui porque o `.cardHeader` — também um `<div>` — é o verdadeiro primeiro `div` da section).
- **Seção Talhões:** tabela de verdade (`.table`/`.tr`/`.td` do Table.module.css, colunas Código/
  Talhão/Área/Status/Ações — table-layout:fixed) a partir de 768px, cards compactos abaixo disso
  (mesmo padrão responsivo de `.produtos-table-card`/`.produtos-mobile-card`). Ações por linha:
  Visualizar/Editar/Excluir (`.actionBtn`+`.tip`, ícones eye/pencil/trash-2), todas flash-disable.
  **Bug pego e corrigido nesta rodada:** a tela não carregava `Tooltip.module.css` nem a lógica JS
  de posicionamento do `.tip` (mesma técnica de `produtos.js`/`cadastros.js`/`estoque.js`) — sem
  isso, o texto do tooltip (“Visualizar”/“Editar”/“Excluir”) ficava sempre visível ao lado de cada
  ícone em vez de aparecer só no hover. Corrigido adicionando o link do componente + a mesma lógica
  de `positionActionTooltip`/`hideActionTooltip` em `fazenda-detalhe-cadastro.js`.
- **`fazendas-data.js` estendido (aditivo, nada removido):** cada fazenda ganhou `codigo`,
  `proprietario`, `cnpj`, `inscricaoEstadual`, `matricula`, `enderecoCompleto`, `latitude`,
  `longitude`, `areaAgricultura`, `arrendamento` (opcional); cada talhão ganhou `codigo` ('001',
  '002'...). Novo status de talhão `'em-pousio'` (exemplo do pedido incluía "Em pousio") — como os
  talhões são dado COMPARTILHADO entre as duas telas de detalhe (decisão já tomada no round 29),
  `'em-pousio'` também precisou ser adicionado ao mapa de badge da tela operacional
  (`fazenda-detalhe.js`), senão quebraria pra qualquer talhão com esse status. As áreas dos talhões
  de São João e Boa Esperança continuam somando exatamente a `areaHa` da fazenda.
- Estado vazio de Talhões ("Nenhum talhão cadastrado" / "Cadastre os talhões desta fazenda para
  organizar sua estrutura produtiva." / "+ Novo talhão") via lista vazia de verdade ou `#state=empty`
  no hash. Estado "Fazenda não encontrada" (mirror do padrão já usado nas outras telas de detalhe).
  Editar fazenda/Novo talhão/ações de linha são flash-disable — formulário de fazenda e cadastro/
  detalhe de talhão continuam fora de escopo.

Verificado ao vivo: `fazenda-detalhe-cadastro.html#id=sao-joao` mostra todos os campos de
Identificação/Localização/Áreas corretos e Arrendamento escondido; `#id=santa-rita` mostra
Arrendamento preenchido e a borda/espaçamento entre grupos consistente (confirmado via
getComputedStyle, não só visualmente); tabela de Talhões no desktop (1280px) e cards no mobile
(375px), ambos com os ícones de ação SEM texto de tooltip vazando (bug corrigido); clique em "Ver
fazenda" na Listagem navega pra `fazenda-detalhe-cadastro.html`, não mais pra `fazenda-detalhe.html`;
a tela operacional (`fazenda-detalhe.html`) continua funcionando sem nenhuma mudança de conteúdo,
incluindo o novo status "Em pousio" no Talhão 05 de São João; estados vazio/não-encontrada de ambas
as telas OK; nenhum erro de console; nenhuma regressão.

## Ajustes 2026-07-31 (round 40) — Nova jornada: Central de Notas Fiscais + fluxo de Nova Nota Fiscal

Ativado "Vendas > Nota fiscal" (renomeado pra **"Notas fiscais"** em 15 telas com Sidebar
completa), com uma Central de Notas Fiscais (listagem) e um fluxo completo de emissão/consulta/
correção de nota de saída. Escopo estritamente isolado a esta jornada, por pedido explícito do
usuário.

- **Arquivos novos:** `app/screens/notas-fiscais.html` + `app/shared/page-notas-fiscais.css` +
  `app/shared/notas-fiscais.js` (listagem); `app/screens/nova-nota-fiscal.html` +
  `app/shared/page-nova-nota-fiscal.css` + `app/shared/nova-nota-fiscal.js` (criação/visualização/
  correção, uma única tela pras 3 finalidades via `?numero=&modo=ver|corrigir`); 4 novos módulos
  de dados: `notas-fiscais-data.js` (`window.NiveloNotasFiscais`), `emitente-data.js` (stub do
  futuro "Minha conta"), `natureza-operacao-data.js` (stub do futuro RF402 Natureza de Operação,
  **não construído nesta rodada por instrução explícita**), `certificado-digital-data.js` (stub
  do futuro Certificado Digital, também não construído).
- **Central (listagem):** arquitetura multi-tab-multi-tabela (padrão de `estoque.js`, não o
  padrão de tabela única filtrada de `cadastros.js`) — Notas de saída (Cliente) e Notas de
  entrada (Fornecedor) têm colunas genuinamente diferentes. Busca cobre Cliente/Fornecedor,
  Número, Produto. Filtro Período (range picker aninhado dentro do FilterPopover, mesmo padrão
  do Dashboard, com z-index maior por abrir por cima do Filtros já aberto) + Status (Pendentes/
  Emitidas/Canceladas/**Rejeitadas** — 4ª opção adicionada além do pedido original, necessária
  pra tornar notas rejeitadas filtráveis, já que a Central existe justamente pra rastrear esse
  ciclo de vida). Rejeição/erro representado por badge + linha de motivo sempre visível (não
  tooltip, mais acessível) abaixo do Status, sem coluna própria. Ações: "Ver detalhes" sempre;
  "Corrigir nota" só quando `tipo==='saida' && status==='rejeitada'`.
- **Nova Nota Fiscal:** radio Tipo de nota fiscal (saída/entrada) no topo; **só o fluxo de saída
  foi estruturado nesta rodada** (pedido explícito) — Nota de entrada mostra um aviso informativo
  antecipando a futura importação via integração de API (sem parse de XML manual). Campos:
  Emitente (readonly, auto-preenchido de `NiveloEmitente`), Destinatário (Dropdown de clientes de
  `NiveloCadastros`, CNPJ/CPF+UF derivados), Itens (lista dinâmica ligada a `NiveloProdutos`,
  Unidade auto-preenchida, total calculado ao vivo), Meio de pagamento, Categoria (só receita+
  ativas de `NiveloCategoriasFinanceiras`), Transporte (opcional, só transportadoras de
  `NiveloCadastros`, sem cadastro inline), Natureza da operação (Venda dentro/fora do estado,
  Remessa, Devolução — CFOP correspondente revelado ao selecionar, fonte `natureza-operacao-
  data.js`), Observação opcional.
- **Certificado Digital:** validado só no submit (depois das validações de campo), bloqueia com
  um Dialog explicativo + botão "Ir para Certificado Digital" (flash-disable, sem tela real
  ainda) — fechável (X/Fechar/fora/Esc), não um bloqueio rígido de conta como o modal de trial
  expirado do Dashboard, por ser um erro de validação de formulário, não um lockout.
  `#state=comcertificado` (via hash) ativa o certificado pra demonstrar o caminho de sucesso.
- **2 bugs reais do padrão recorrente `hidden`+`display` incondicional, pegos ao vivo:**
  `Feedback.module.css`'s `.alert` (`display:flex` sem guard) fazia `#nnf-rejection-alert` E
  `#nnf-entrada-info` aparecerem sempre, mesmo com `hidden` correto no HTML e o radio "Nota de
  saída" marcado por padrão; `.nnf-tipo-card{display:flex}` (sem guard) fazia o card "Tipo de
  nota fiscal" reaparecer em modo Ver/Corrigir mesmo com `hidden` setado por JS. Ambos corrigidos
  em `page-nova-nota-fiscal.css` com `[hidden]{display:none}` — mesmo padrão já documentado
  dezenas de vezes neste projeto (Dialog/Table/Input/RadioButton/etc.).
- **`?numero=&modo=ver|corrigir`:** mesma convenção de outras telas de edição (`?sku=`, `?codigo=`).
  Modo ver: todos os campos/dropdowns desabilitados via um novo método `setReadonly()` adicionado
  ao `initDropdown()` genérico (`.is-readonly` + `trigger.disabled`), submit escondido, "Voltar"
  no lugar de Cancelar, "Corrigir nota" visível só se rejeitada. Modo corrigir: totalmente
  editável, pré-preenchido, submit relabelado "Reenviar nota fiscal", chama
  `updateAfterCorrecao()` (mesmo número, status volta a `emitida`) em vez de `add()`.
- **Interface-principal.js:** `NAV_DESTINATIONS['vendas-nota-fiscal'] = 'notas-fiscais.html'`
  ativa a navegação real nas 15 telas que já tinham o item de sidebar.
- **Nota de arquitetura, mesma limitação já documentada em todo o protótipo:** como nenhuma tela
  usa `localStorage`, uma nota criada/corrigida em `nova-nota-fiscal.js` só existe durante a
  sessão de JS daquela página — ao redirecionar pra `notas-fiscais.html`, o script daquela tela
  recarrega os dados seed do zero (mesmo comportamento de `novo-produto.js`/`nova-fazenda.js`
  antes do fix de sessionStorage). O toast de sucesso aparece corretamente; a linha nova/corrigida
  em si não persiste na Central. Não corrigido nesta rodada por não ter sido pedido (só Fazendas
  recebeu esse tratamento, a pedido explícito, no round 36).

Verificado ao vivo: tabs/busca/filtros (incl. Período+Status compostos) na listagem; emitente
autopreenchido; destinatário selecionado autopreenchendo CNPJ/UF; item de produto autopreenchendo
Unidade, máscara de moeda e total recalculando corretamente; Categoria só com receitas ativas;
CFOP revelado ao escolher Natureza da operação; alternância do radio Tipo de nota escondendo/
mostrando o formulário e o submit; certificado ausente bloqueando o submit com o Dialog correto,
certificado presente permitindo emissão completa (toast + redirecionamento); `modo=ver` numa nota
emitida (fluxo somente-leitura, sem alerta/Corrigir) e numa rejeitada (alerta+motivo+Corrigir
visível); `modo=corrigir` totalmente editável, reenvio funcionando (`updateAfterCorrecao`, toast
correto); mobile (375px, cards com Cliente/Fornecedor corretos por aba); nenhum erro de console
em nenhuma das 2 telas.

## Ajustes 2026-07-31 (round 43) — Nova jornada: Caixa (Financeiro)

Ativado o item de sidebar "Financeiro > Caixa" (`data-nav="financeiro-caixa"`, stub visual desde
a criação do shell — sem `NAV_DESTINATIONS`). Escopo: listagem de lançamentos + fluxo de Incluir
Lançamento (nova página, não modal), seguindo à risca os padrões já estabelecidos (mesma
arquitetura de Categorias de receitas e despesas pra listagem, mesma de Nova Categoria/Novo
Produto pro formulário).

- **Arquivos novos:** `app/screens/caixa.html` + `app/shared/page-caixa.css` +
  `app/shared/caixa.js` (listagem); `app/screens/novo-lancamento-caixa.html` +
  `app/shared/page-novo-lancamento-caixa.css` + `app/shared/novo-lancamento-caixa.js`
  (formulário de inclusão); 2 novos módulos de dados: `app/shared/caixa-data.js`
  (`window.NiveloCaixa` — `list/findByCodigo/nextCodigo/add`, código `LC-NNNN` auto-gerado) e
  `app/shared/bancos-data.js` (`window.NiveloBancos`, stub fixo simulando a futura Configuração >
  Conta bancária, hoje também um item de Sidebar sem tela própria — mesmo raciocínio já usado em
  `emitente-data.js`/`natureza-operacao-data.js`).
- **Listagem:** busca (Histórico/Cliente/Fornecedor/Categoria) + Agrupamento de Filtros
  (Período — range picker copiado de Notas Fiscais/Dashboard — e Categoria, populada em runtime a
  partir de TODAS as categorias ativas, receita e despesa) + tabela padrão (`Table` como Card
  genérico) com as colunas pedidas (Data/Histórico/Cliente ou Fornecedor/Categoria/Tipo/Entrada/
  Saída), ordenação nas 5 primeiras colunas, Cards no mobile, e **paginação real** (10/página,
  mesmo algoritmo exato de Cadastro) — diferente de Categorias/Notas Fiscais (sem paginação, por
  volume esperado baixo), Caixa é um livro-caixa que cresce continuamente, então paginação real
  fazia mais sentido aqui desde o início.
- **Sem coluna Ações:** o pedido original listou só as 7 colunas de dado, sem nenhuma ação de
  editar/excluir especificada — não inventado por decisão de escopo (mesma diretriz de não
  adicionar funcionalidade além do pedido).
- **Colunas Entrada/Saída a partir de um único campo `valor` + `tipo`:** cada lançamento guarda
  `valor` sempre positivo; a tabela decide em qual das duas colunas mostrar o valor conforme
  `tipo`. Para `tipo:'saldo'` (nem entrada nem saída de verdade) — decisão de UI, não uma regra
  contábil formal: mostra em Entrada se o valor for positivo, em Saída (em módulo) se negativo,
  já que o pedido não define uma coluna própria pra Saldo. Documentado no código como uma escolha
  de exibição, não uma regra de negócio validada.
- **Formulário "Incluir lançamento":** 2 subseções ("Dados do lançamento": Código
  auto-gerado/Banco/Tipo/Data/Valor/Histórico; "Classificação": Categoria/Competência/Cliente ou
  Fornecedor). Campos obrigatórios: Banco, Categoria, Tipo, Data, Valor (> 0), Histórico —
  Competência e Cliente ou Fornecedor ficam opcionais (marcados "(opcional)"), já que nem todo
  lançamento tem uma contraparte (ex.: tarifa bancária, abastecimento à vista) nem uma competência
  definida — decisão de escopo, não estava explícita no pedido, mas evita bloquear lançamentos
  legítimos sem essa informação. Tipo é um Dropdown de 3 opções fixas (Entrada/Saída/Saldo),
  Valor usa a mesma máscara de moeda (`formatCentavosBRL`/centavos como estado) já usada em
  Estoque/Nova Nota Fiscal. Cliente ou Fornecedor combina os dois tipos do Cadastro de Pessoas e
  Empresas num único Dropdown (dedup por código, já que um cadastro pode ser cliente E
  fornecedor ao mesmo tempo).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'financeiro-caixa':
  'caixa.html'`) ativa a navegação real nas telas que já tinham o item de sidebar.
- **`prototype-nav/nav.config.js`:** nova journey "Jornada · Financeiro" com as 2 telas.
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, um
  lançamento criado em `novo-lancamento-caixa.js` só existe durante a sessão de JS daquela
  página — ao redirecionar pra `caixa.html`, o script daquela tela recarrega os dados seed do
  zero. O toast de sucesso aparece corretamente; o lançamento em si não persiste na listagem.
- **Oferta em aberto, não implementada nesta rodada por não ter sido pedida:** o usuário ofereceu
  elaborar as regras de negócio completas da tela de Caixa (atualização automática de saldo,
  validações adicionais, conciliação bancária, impacto no fluxo financeiro). Só a estrutura
  visual/de navegação pedida explicitamente foi construída — nenhuma dessas regras foi inventada
  ou assumida.

Verificado ao vivo: os 14 lançamentos seed renderizam corretamente (ordenados por data
decrescente); busca por "soja" isola as 2 linhas certas; filtro de Categoria (Combustível) isola
as 2 linhas certas; ordenação por Tipo agrupa Entrada/Saída/Saldo corretamente; paginação mostra
"1 a 10 de 14" e pagina corretamente; Cards no mobile com todos os campos; formulário bloqueia
envio sem Banco/Categoria/Tipo/Data/Valor/Histórico (Competência/Cliente ou Fornecedor
permanecem opcionais); máscara de moeda formatando corretamente; envio válido salva via
`NiveloCaixa.add()`, grava o toast e redireciona pra `caixa.html`; nenhum erro de console em
nenhuma das 2 telas.

## Ajustes 2026-07-31 (round 41) — Nova jornada: Caderno de Campo (registro informativo de campo)

Feature completa: item "Caderno de campo" do Header (`#notebook-btn`, existia desde o shell mas
era flash-disable em todas as telas) agora navega de verdade. Registro exclusivamente informativo
e de controle pessoal do produtor — **nunca gera lançamento em Financeiro nem movimentação em
Estoque** (regra central pedida, documentada em todo arquivo/comentário novo desta feature).

- **Arquivos novos:** `app/shared/caderno-data.js` (`window.NiveloCaderno`, mesma convenção IIFE
  de `fazendas-data.js` — anotações `{id, fazendaId, talhaoId, tipo, observacao, valor|
  quantidade+unidade, dataHora}`, persistência via sessionStorage pro mesmo padrão de
  `nivelo.fazendas.criadas`); `app/screens/caderno-de-campo.html` + `page-caderno-de-campo.css` +
  `caderno-de-campo.js` (tela geral, cards de fazenda — cópia estrutural de `fazendas.html`/
  `.fazenda-card`, com um bloco novo de resumo despesas/vendas/colheitas por fazenda); `app/
  screens/nova-anotacao.html` + `page-nova-anotacao.css` + `nova-anotacao.js` (formulário único,
  1 `.card`, mesmo padrão de `novo-estoque.html`); `app/screens/talhao-detalhe.html` +
  `page-talhao-detalhe.css` + `talhao-detalhe.js` (novo — não existia tela de detalhe de talhão
  antes desta rodada).
- **`talhaoId` NÃO é único no sistema** — cada fazenda numera seus talhões a partir de 't1' (ver
  `fazendas-data.js`), então `NiveloCaderno.listByTalhao(fazendaId, talhaoId)` exige os DOIS
  parâmetros (bug real pego em teste ao vivo: talhão "t1" de fazendas diferentes misturava
  anotações de fazendas diferentes na mesma tela de detalhe do talhão).
- **`fazenda-detalhe.html` (operacional, Jornada Caderno de Campo) ajustada, não reconstruída:**
  "Editar fazenda" → **"Nova anotação"** (pré-seleciona a fazenda via `?fazenda=`); menu kebab/
  "Excluir fazenda" removido (ação não pertence a esta tela); botão "+ Novo talhão" removido;
  "Cultura atual" passou a listar TODAS as culturas plantadas nos talhões (`Array.join(', ')`),
  não só `fazenda.culturaAtual` (uma única cultura "principal"); clique num talhão navega pra
  `talhao-detalhe.html#fazenda=<id>&talhao=<id>` (antes era flash-disable, sem tela).
- **Nova anotação:** Data/hora automática (campo `disabled readonly`, mesmo padrão de "Código" em
  Novo registo de estoque); Fazenda/Talhão como `Dropdown`s dependentes (Talhão só habilita após
  Fazenda escolhida, opções recarregadas a partir de `fazenda.talhoes`); Tipo de anotação como 3
  **cards de seleção visual** (Despesa/Venda/Colheita) — composição de página sobre `<input
  type="radio">` reais (mesma base acessível do RadioButton, seleção controlada por classe
  `.is-selected` via JS, não existe componente "card de seleção" no Storybook ainda); Valor (R$,
  máscara de centavos) para Despesa/Venda, Quantidade+Unidade (Saca/Kg/Litro, mesmo vocabulário de
  `produtos-data.js`) para Colheita, nunca os dois pares juntos. Pré-seleção opcional via
  `?fazenda=&talhao=` (query string, campos continuam editáveis) e `?tipo=` (só demonstração no
  prototype-nav). Volta pra Detalhe do talhão → Detalhe da fazenda → Caderno de Campo, na ordem de
  especificidade de contexto disponível. Toast de sucesso via `sessionStorage`, mesmo padrão
  Feedback-como-toast já usado no resto do sistema.
- **Detalhe do talhão (tela nova):** status atual (badge, reaproveita `STATUS_TALHAO` de
  `fazenda-detalhe.js`), indicadores (Área/Cultura/Safra) + registros do Caderno (Despesas/Vendas/
  Colheitas registrados, só deste talhão), lista de anotações (mais recente primeiro) e 2 ações:
  "Nova anotação" (fazenda+talhão pré-selecionados) e "Alterar status" (Dialog com `Dropdown`,
  altera `talhao.status` em memória, sem persistência entre páginas — mesma limitação já
  documentada em todo o protótipo por não haver `localStorage`).
- **2 bugs reais do padrão recorrente `hidden`+`display` incondicional, pegos ao vivo:**
  `Dialog.module.css`'s `.overlay` (`display:flex` sem guard) fazia o modal "Alterar status do
  talhão" abrir sozinho ao carregar a página — corrigido com `.overlay[hidden]{display:none}` em
  `page-talhao-detalhe.css` (mesmo fix já documentado em `page-novo-estoque.css`/
  `page-cadastros.css`); `Input.module.css`'s `.errorText{display:flex}` sem guard fazia as
  mensagens de erro de Nova Anotação aparecerem sempre — corrigido adotando o mesmo padrão de
  `page-novo-estoque.css` (`.wrapper .errorText{display:none}`/`.wrapper.error .errorText{display:
  flex}`, erro toggla `.error` no `.wrapper`, nunca `.hidden` direto no span).
- **`interface-principal.js`:** `notebookBtn` (compartilhado por TODAS as telas) agora navega pra
  `caderno-de-campo.html` em vez do flash-disable original.
- **`prototype-nav`:** novo épico "Caderno de Campo" (`type:'flow'`) dentro da Jornada · Caderno de
  Campo, com Caderno de Campo (listagem) → Detalhe da fazenda (operacional, já existia desde o
  round 30) → Detalhe do talhão → Nova anotação, cada um com variantes de estado.

Verificado ao vivo (servidor HTTP próprio desta sessão, sem clean-urls — `serve` com cleanUrls
teria descartado query strings em redirects, achado registrado só como nota de ambiente, não
afeta o app em produção): fluxo completo Caderno → card de fazenda → Detalhe da fazenda →
Talhão → Nova anotação (Despesa e Colheita) → toast → volta pro contexto certo; dependência
Fazenda→Talhão; Alterar status; estados vazio/não-encontrado de todas as telas novas; nenhuma
regressão nas 25 telas existentes; nenhum erro de console.

## Ajustes 2026-07-31 (round 42) — Nova Anotação: campos Cultura/Safra, "Em pouso", fix do Voltar

Quatro ajustes pontuais sobre a Jornada · Caderno de Campo do round 41, motivados por uma pergunta
do usuário sobre de onde vinha a "Cultura atual" mostrada na fazenda operacional (resposta: de
`talhao.cultura`, um campo estático do mock — nenhuma anotação alimentava isso).

- **Campo Cultura em Nova Anotação:** novo `Dropdown` (subseção "Cultura e safra", entre
  Localização e Tipo de anotação), opções vindas de `window.NiveloProdutos.list()` filtrado por
  `categoria==='Grãos' && status==='ativo'`. Fica desabilitado ("Selecione o talhão primeiro") até
  o Talhão ser escolhido — o valor padrão depende de qual talhão. Ao escolher/trocar o Talhão,
  `nova-anotacao.js`'s `applyCulturaDefault()` pré-seleciona a cultura da anotação MAIS RECENTE
  daquele talhão (`NiveloCaderno.findUltimaCultura(fazendaId, talhaoId)`, novo em `caderno-data.js`,
  ordena por `dataHora`); se o talhão ainda não tem nenhuma anotação, cai pro `talhao.cultura`
  estático. Sempre reseta pro placeholder antes de aplicar o novo default (bug pego ao vivo: sem
  isso, trocar de talhão sem cultura própria deixava a cultura do talhão ANTERIOR selecionada por
  engano). Usuário continua livre pra trocar manualmente.
- **`produtos-data.js` ganhou 2 produtos novos: Café (PRD-009) e Cana-de-açúcar (PRD-010)**,
  ambos `categoria:'Grãos'` (simplificação deliberada — nenhum dos dois é botanicamente um grão,
  mas evita inventar uma categoria nova só pra 2 itens). Sem isso, os talhões de Santa Rita/Boa
  Esperança (que já usavam essas strings soltas como `talhao.cultura` desde o round 29) ficariam
  de fora do Dropdown de Cultura, e a pré-seleção da última cultura nunca encontraria opção
  correspondente pra essas 2 fazendas.
- **Campo Safra em Nova Anotação:** novo `Dropdown` + item fixo "+ Adicionar nova safra" (mesmo
  padrão exato de "Adicionar nova categoria" em `novo-produto.js`) — abre um Dialog pequeno (Nome
  da safra, ex. "2027/28") que grava no catálogo compartilhado **`window.NiveloSafras`** (novo
  arquivo `app/shared/safras-data.js`, cópia do padrão de `categorias-data.js`: `localStorage`,
  não sessionStorage/memória — uma safra criada aqui precisa aparecer em qualquer anotação futura,
  mesmo depois de recarregar). Seed: `['2024/25','2025/26','2026/27','2027/28']`. Sem
  auto-seleção (diferente de Cultura) — não foi pedido.
- **`caderno-data.js`:** anotações ganharam os campos `cultura`/`safra` (aditivo — cada anotação
  agora é um "retrato" da cultura/safra do talhão naquele momento, não algo fixo por talhão).
  Ambos os campos são obrigatórios no formulário (mesma validação `.wrapper.error` de
  Fazenda/Talhão/Valor). 7 anotações seed atualizadas com `cultura`/`safra` coerentes com o
  `talhao.cultura`/`talhao.safra` de origem.
- **Status do talhão: "Em pousio" → "Em pouso"** (só o rótulo visível — a chave interna
  `'em-pousio'` não mudou, evita qualquer migração de dado). 3 ocorrências: `STATUS_TALHAO` em
  `fazenda-detalhe.js` e `talhao-detalhe.js`, e a opção do Dropdown "Alterar status" em
  `talhao-detalhe.html`.
- **Bug real corrigido: back-link de `fazenda-detalhe.html` (operacional) apontava pra
  `fazendas.html`** (a listagem CADASTRAL, "Configuração > Cadastro de fazenda") — sobra do round
  29, nunca atualizada quando a tela foi migrada pra Jornada · Caderno de Campo no round 30. Só
  quem chega em `fazenda-detalhe.html` é o Caderno de Campo agora, então tanto o link "←" do topo
  quanto o link do estado "Fazenda não encontrada" passaram a apontar/rotular pra
  `caderno-de-campo.html`/"Caderno de Campo".
- **Bug real do padrão recorrente `hidden`+`display` incondicional, pego de novo:** `Dialog.
  module.css`'s `.overlay` (sem guard) faria o modal "Adicionar nova safra" abrir sozinho ao
  carregar `nova-anotacao.html` — corrigido com `.overlay[hidden]{display:none}` em
  `page-nova-anotacao.css` (mesma classe de bug já documentada nos rounds 41/31/21/etc).

Verificado ao vivo: Talhão 01/02 de São João pré-selecionam Soja/Milho corretamente (cultura da
última anotação); Talhão 03 (sem anotação/sem cultura) reseta pro placeholder; trocar de fazenda
pra Santa Rita → Talhão 01 pré-seleciona "Cana-de-açúcar"; "Adicionar nova safra" cria "2028/29",
persiste em `localStorage` (confirmado após reload) e já vem selecionada; submit sem preencher
nada marca os 5 campos obrigatórios (Fazenda/Talhão/Cultura/Safra/Valor) com borda de erro, sem
navegar; fluxo completo de sucesso soma corretamente no resumo da fazenda; back-link de
`fazenda-detalhe.html` aponta pra Caderno de Campo; "Em pouso" aparece nas 2 telas + no Dropdown
do modal; nenhum erro de console.

## Ajustes 2026-07-31 (round 44) — Caixa: coluna Valor unificada, resumo, Tipo restrito, Competência com navegação por ano

4 ajustes pedidos pelo usuário sobre a jornada de Caixa (round 43).

- **Tabela: colunas Entrada/Saída unificadas numa única coluna Valor** (`caixa.js`'s
  `buildRowHTML()`), mostrando `+R$ X,XX` (verde, `--color-status-success-fg`) pra Entrada e
  `-R$ X,XX` (vermelho, `--color-status-error-fg`) pra Saída — classes `.caixa-valor-entrada`/
  `.caixa-valor-saida` novas em `page-caixa.css`. Cada `<tr>` ganhou `data-tipo`/`data-valor`
  (além dos atributos já existentes), usados tanto pelo resumo quanto pela ordenação nova
  (`SORTABLE_COLUMNS.valor`, `type:'number'`, comparando o valor com sinal aplicado conforme
  `data-tipo`). Cards mobile (`buildCardHTML`) idem, um único campo Valor no lugar dos dois.
  Tabela passou de 7 pra 6 colunas; larguras redistribuídas em `page-caixa.css`.
- **Resumo acima da tabela** (Total de Entradas/Total de Saídas/Saldo Atual): 3 cards novos
  (`.caixa-resumo*`, cópia estrutural do `.dash-card`/Estoque-summary-card — ícone circular+
  título/valor em destaque), calculados por `updateResumo()` (novo em `caixa.js`) somando
  `data-tipo`/`data-valor` das linhas FILTRADAS mas NÃO paginadas (`matching`, antes do slice de
  paginação) — reage a busca/categoria/período em tempo real, chamado de dentro de
  `applyFilters()`. Saldo Atual troca de cor (verde/vermelho) conforme o sinal.
- **Removida a opção "Saldo" do Tipo** — nunca fez sentido como tipo de lançamento (era um valor
  digitado manualmente); o saldo agora é sempre CALCULADO a partir de Entradas/Saídas. Removida
  do dropdown em `novo-lancamento-caixa.html`, do `TIPO_BADGE` em `caixa.js`, e os 2 registros
  seed que usavam `tipo:'saldo'` (`caixa-data.js`) foram convertidos em lançamentos reais
  (entrada/saída) em vez de removidos, preservando o tamanho do dataset de teste.
- **Competência: seletor de mês/ano com a mesma aparência do DatePicker real** (`dpRoot`/
  `dpTrigger`/`dpPopover`/`dpCalendarHeader`/`dpNavBtn` do Storybook, mesma técnica já usada no
  filtro "Atualizado a partir de" de Produtos), mas com grid de 12 meses (não 7 dias) e
  navegação por ANO (não mês a mês) — `data-competencia-prev-year`/`-next-year` no lugar de
  prev/next-month. Substituiu o `<input type="month">` nativo; valor continua armazenado como
  `'AAAA-MM'`, sem mudança no payload enviado. Botão de limpar (×) reaproveita `.actionBtn`.

Verificado ao vivo (servidor `http-server`, preserva query string/hash): coluna Valor com sinal
e cor corretos (desktop e cards mobile); resumo mostrando R$ 102.200,00/R$ 45.039,00/
R$ 57.161,00 no carregamento inicial (bate com a soma manual dos 14 lançamentos seed);
resumo recalculando corretamente ao filtrar por busca (ex. "soja", que também casa por
categoria); ordenação por Valor (asc/desc) considerando o sinal certo; Tipo do formulário só
com Entrada/Saída; Competência abrindo o popover, navegando por ano ("Ano anterior"/"Próximo
ano"), selecionando um mês ("Julho de 2026"), mostrando o botão de limpar; nenhum erro de
console em nenhuma das 2 telas.

**Ajuste no mesmo dia (pedido em seguida): resumo com a mesma aparência exata dos cards de
Estoque.** Os 3 cards do resumo, que na primeira versão eram uma composição própria (ícone
circular colorido por tipo + label separado do valor), foram refeitos como cópia estrutural
LITERAL de `.estoque-summary-row`/`.estoque-summary-card` (`page-estoque.css`): `cardHeader`
com ícone (18px, `--color-text-brand`, sem círculo/fundo colorido) + `<h2 class="title">` (mesmo
tratamento responsivo — 12px/bold no mobile, `--font-size-lg`/bold a partir de 1024px), e
`.caixa-summary-body` com o valor em destaque logo abaixo (24px/bold/`--font-body` no mobile,
`--font-size-3xl`/medium/`--font-heading` a partir de 1024px) — classes novas
`caixa-summary-row`/`-card`/`-title-row`/`-icon`/`-body`/`-value` em `page-caixa.css`, grid
`repeat(3,1fr)` só a partir de 1024px (igual Estoque, não mais 560px). O rótulo textual solto
(`.caixa-resumo-label`) foi removido — agora o título já é o rótulo, dentro do `cardHeader`,
igual Estoque.

**Bug real encontrado e corrigido durante esta migração:** `.caixa-valor-entrada`/
`.caixa-valor-saida` (as classes de cor verde/vermelho, reaproveitadas tanto na tabela quanto
no valor do resumo) tinham `font-weight: medium` fixo — como esse peso é aplicado sobre
`.caixa-summary-value` (mesma especificidade de 1 classe, `.caixa-valor-*` vem depois no
arquivo), ele vencia e forçava peso Medium no valor do resumo mesmo no mobile, onde Estoque usa
Bold. Corrigido restringindo o `font-weight` dessas 2 classes a `.caixa-table-card`/
`.caixa-mobile-card-fields` (only where a numeric text cell needs the extra weight), deixando
`.caixa-summary-value` livre para aplicar seu próprio peso responsivo (Bold no mobile, Medium no
desktop, idêntico a Estoque). Cor (verde/vermelho) continua aplicada nos dois contextos.

Verificado ao vivo via `getComputedStyle`: mobile (375px) — título 12px/700, valor 24px/700;
desktop (1280px) — grid 3 colunas iguais, título 18px/700, valor 30px/500, `box-shadow`
idêntico ao de `.estoque-summary-card`; totais recalculando certo após a mudança de CSS;
nenhum erro de console.

## Ajustes 2026-07-31 (round 45) — Nova jornada: Contas a Pagar (Financeiro)

Ativado o item de sidebar "Financeiro > Contas a pagar" (`data-nav="financeiro-pagar"`, stub
visual desde a criação do shell — sem `NAV_DESTINATIONS`). Escopo: listagem completa + fluxo de
criação/edição/visualização com geração automática de parcelas, seguindo à risca os padrões já
estabelecidos (mesma arquitetura de Caixa pra listagem/formulário, mesmo padrão de modal de ação
de Estoque pra "Registrar pagamento").

- **Arquivos novos:** `app/screens/contas-a-pagar.html` + `app/shared/page-contas-a-pagar.css` +
  `app/shared/contas-a-pagar.js` (listagem); `app/screens/nova-conta-pagar.html` +
  `app/shared/page-nova-conta-pagar.css` + `app/shared/nova-conta-pagar.js` (criação/edição/
  visualização, uma única tela pras 3 finalidades via `?codigo=&modo=ver|editar`, mesma convenção
  de Nova Nota Fiscal); 2 novos módulos de dados: `contas-pagar-data.js` (`window.
  NiveloContasPagar` — `list/findByCodigo/nextCodigo/add/update/registrarPagamento/cancelar/
  excluir`, código `CTP-NNNN` auto-gerado) e `formas-pagamento-data.js` (`window.
  NiveloFormasPagamento`, stub fixo — Dinheiro/PIX/Boleto/Cartão de crédito/Cartão de débito/
  Transferência bancária/Cheque — mesmo raciocínio de `bancos-data.js`).
- **Listagem:** busca (Fornecedor/Histórico/Nº Documento) + Agrupamento de Filtros (Categoria/
  Forma de Pagamento/Situação de Pagamento/Status do Pagamento) + tabela padrão com paginação
  real (10/página) + Cards no mobile + estado de carregamento breve (~350ms, mesmo padrão exato
  de Categorias de receitas e despesas). Colunas: Fornecedor/Histórico/Nº Documento/Vencimento/
  Valor/Saldo/Pago/Status/Ações — **coluna Status adicionada além do que foi pedido literalmente**
  (o pedido listou só as 8 colunas sem Status), decisão deliberada pra manter consistência com
  todas as outras tabelas do sistema que exibem o estado do registro como badge (Notas Fiscais,
  Cadastro, Estoque Comprometido) — sem essa coluna, o filtro "Status do Pagamento" não teria
  nenhum retorno visual na tabela.
- **"Situação de Pagamento" × "Status do Pagamento" são 2 dimensões DELIBERADAMENTE distintas**
  (o pedido listou os dois como filtros separados, mas só detalhou as opções do segundo): Status
  do Pagamento é o workflow pedido explicitamente (Em Aberto/Emitida/Paga/Atrasada/Cancelada,
  badges `info`/`indigo`/`success`/`error`/`warning`); Situação de Pagamento é uma dimensão nova,
  derivada de `saldo`×`pago` (Pago integralmente/Pago parcialmente/Não pago) — evita redundância
  entre os dois filtros, já que uma conta "Atrasada" pode estar tanto "Não paga" quanto "Pago
  parcialmente".
- **Ações da linha, condicionais por status** (Visualizar sempre; Editar escondido pra
  `cancelada`; Registrar pagamento escondido quando `saldo===0` ou `cancelada`; Excluir sempre) —
  Visualizar/Editar navegam pra `nova-conta-pagar.html?codigo=&modo=ver|editar`; Registrar
  pagamento abre um modal (`Dialog` `md`, mesmo markup exato de "Registrar abatimento" de
  Estoque: recap somente-leitura + Valor do pagamento com máscara de moeda + Data, valida
  `0 < x <= saldo`); Excluir abre um modal de confirmação (mesmo padrão do modal de exclusão de
  Cadastro, `.secondaryGray`+`.destructive`) e remove o registro DE VERDADE (não soft-delete —
  diferente de Cadastro/Categorias, aqui não há pedido explícito de preservar histórico de uma
  conta excluída).
- **Formulário "Nova Conta a Pagar":** 2 subseções ("Dados da conta": Código auto-gerado/Forma de
  Pagamento/Fornecedor (só `NiveloCadastros.findByTipo('fornecedor')`, não combina com cliente
  como Caixa faz)/Vencimento/Valor/Data de Emissão/Nº Documento/Histórico; "Classificação":
  Categoria/Competência (mesmo seletor mês/ano do Caixa)/Ocorrência/Nº de Parcelas (só quando
  Ocorrência = Parcelada)/Dia do Vencimento). Campos obrigatórios: Forma de Pagamento, Fornecedor,
  Vencimento, Valor (> 0), Data de Emissão, Histórico, Categoria, Ocorrência, Nº de Parcelas
  (> 1, só quando Parcelada) — Competência e Dia do Vencimento ficam opcionais.
- **Categoria: dropdown dinâmico (sem duplicar dado) + item fixo "+ Nova categoria"** que abre um
  Dialog mínimo (só Descrição, Grupo fixo em "Despesa") chamando
  `NiveloCategoriasFinanceiras.add()` direto — reutiliza o MESMO catálogo/função já usados por
  Categorias de receitas e despesas/Caixa/Nova Nota Fiscal, sem criar uma cópia paralela. Mesma
  técnica já usada pra "+ Adicionar nova safra" em `nova-anotacao.js`. Não foi construído um
  "modal de navegar/escolher entre as categorias existentes" à parte — o dropdown já cobre "carga
  dinâmica sem duplicação"; um browser dedicado seria um padrão novo sem precedente no sistema.
- **Ocorrência: só "Parcelada" gera múltiplos registros de verdade.** As outras 6 opções (Única/
  Semanal/Quinzenal/Mensal/Semestral/Anual) são só metadado da conta única criada — o pedido só
  especificou geração automática de parcelas para o caso Parcelada, então as periodicidades
  recorrentes não geram lançamentos futuros nesta rodada (ficaria pra uma automação de "próxima
  ocorrência" fora do escopo pedido).
- **Geração de parcelas** (`NiveloContasPagar.add()`): quando `ocorrencia==='parcelada'`, cria N
  registros de uma vez, cada um com Código próprio (`CTP-NNNN` sequencial, não um sufixo composto
  — não havia precedente de código composto em nenhum outro módulo do sistema), `parcelaAtual`/
  `parcelaTotal` pra exibir "3/12" (mostrado como uma legenda sob o Histórico na tabela/cards),
  mesmo `grupoParcelamento` (código da 1ª parcela) linkando o grupo, valor dividido igualmente
  (`Math.round`, a última parcela absorve a diferença de arredondamento), vencimento calculado por
  incremento de 1 mês a partir da 1ª parcela (usando Dia do Vencimento quando informado, com
  clamp pro último dia do mês quando o dia pedido não existe, ex. dia 31 em abril), Saldo/Status
  iniciais de cada parcela iguais a Valor/`emitida`.
- **Regras de negócio** (`contas-pagar-data.js`): Código sempre auto-gerado; Saldo inicia igual
  ao Valor; conta nasce `emitida`; `list()` recalcula (nunca persiste) o auto-flip pra `atrasada`
  quando `vencimento < TODAY` (data de referência fixa `'2026-07-31'`, sem relógio real neste
  protótipo) e `saldo > 0` — **atrasada tem prioridade sobre em-aberto** quando os dois critérios
  batem ao mesmo tempo (pagamento parcial de uma conta já vencida continua contando como
  atrasada, não volta a "em aberto"); `registrarPagamento()` reduz saldo/soma pago, vira `paga`
  quando o saldo zera; contas `cancelada` bloqueadas de receber pagamento (guard); `update()` só
  deixa o Valor ser alterado se a conta ainda não recebeu nenhum pagamento (`pago===0`), pra não
  quebrar a relação saldo/pago já registrada.
- **"Cancelar conta" — ação de negócio nova, fora da lista literal de 4 ações da tabela**: como o
  pedido não especificou nenhum caminho de UI pra alcançar o status "Cancelada" (só listou
  Visualizar/Editar/Excluir/Registrar Pagamento como ações da tabela), o botão "Cancelar conta"
  foi colocado dentro do formulário em modo Editar (rodapé, separado de Cancelar/Salvar), visível
  só pra contas ainda não pagas/canceladas — abre um modal de confirmação e chama
  `NiveloContasPagar.cancelar()`.
- **Bug real do padrão recorrente `hidden`+`display` incondicional, pego ao vivo**: `.btn`
  (Button.module.css) tem `display:flex` incondicional — sem guard, "Salvar" (escondido em
  `modo=ver`) e "Cancelar conta" (escondido fora do modo Editar) ficavam sempre visíveis mesmo com
  `hidden` correto via JS. Corrigido com `.btn[hidden]{display:none}` em
  `page-nova-conta-pagar.css` (mesma classe de bug já documentada dezenas de vezes neste arquivo,
  agora numa 1ª ocorrência específica pra `.btn` em vez de `.overlay`/`.errorText`/etc.).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'financeiro-pagar':
  'contas-a-pagar.html'`) ativa a navegação real em todas as telas que já tinham o item de
  sidebar. **`prototype-nav/nav.config.js`:** 2 novas entradas na journey "Jornada · Financeiro"
  já existente (`contas-a-pagar`, `nova-conta-pagar` com variantes de Editar/Visualizar usando
  `CTP-0001`).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma
  conta criada/editada/paga/cancelada em qualquer uma das duas telas só existe durante a sessão
  de JS daquela página — ao redirecionar pra `contas-a-pagar.html`, o script daquela tela
  recarrega os dados seed do zero. O toast de sucesso aparece corretamente; a operação em si não
  persiste na listagem.
- **Não implementado nesta rodada, por não ter sido pedido:** integração com Caixa/fluxo de
  pagamento real (o pagamento aqui é só registrado dentro do próprio módulo de Contas a Pagar,
  não gera uma saída correspondente em Caixa), conciliação bancária, relatórios.

Verificado ao vivo: 14 contas seed renderizando corretamente (incl. auto-flip pra "Atrasada" nas
vencidas, "Paga" na quitada, "Cancelada" na seed com esse status e sem ações de editar/pagamento);
filtro por Status do Pagamento isolando corretamente; Registrar pagamento parcial reduzindo
saldo/pago e recalculando o status (mantendo "Atrasada" quando a conta já estava vencida);
Excluir removendo a linha e o registro de verdade; criação de conta Parcelada (3 parcelas)
gerando os registros corretos com valores/vencimentos calculados; toast de sucesso em criação/
edição/cancelamento; modo `ver` com todos os campos desabilitados e Salvar/Cancelar conta
escondidos (bug do `.btn[hidden]` corrigido); modo `editar` com "Cancelar conta" visível e
funcional; "+ Nova categoria" criando a categoria de verdade no catálogo compartilhado e
selecionando-a automaticamente; Cards no mobile com todos os campos; nenhum erro de console em
nenhuma das 2 telas.

## Ajustes 2026-08-03 (round 46) — Sidebar (épicos Caixa/Contas a pagar), Contas a Pagar (tabela/
ações/Ver detalhes), Nova Conta a Pagar (bug de scroll no Dropdown)

Pedido em 3 partes sobre a jornada Financeiro (Caixa + Contas a Pagar) inteira.

- **Sidebar: "Caixa" e "Contas a pagar" viraram subgrupos de 2º nível**, mesmo padrão já usado
  por "Fiscal" dentro de Configuração (`.app-nav-subgroup`/`.app-nav-subsubmenu`/
  `.app-nav-subsubitem`). Dentro de Financeiro: épico **Caixa** (`group-caixa`) com os leafs
  "Caixa" (`financeiro-caixa` → `caixa.html`) e "Incluir lançamento" (`financeiro-caixa-incluir`
  → `novo-lancamento-caixa.html`, novo `NAV_DESTINATIONS`); épico **Contas a pagar**
  (`group-contas-pagar`) com "Contas a pagar" (`financeiro-pagar`) e "Nova conta"
  (`financeiro-pagar-nova` → `nova-conta-pagar.html`, novo). Aplicado nas 24 telas com Sidebar
  completa via script Node de migração (mass-edit, não editado tela por tela). **Generalização
  em `interface-principal.js`:** o que antes era um caso especial hardcoded só pra
  Fiscal/Configuração (`closeGroup('group-fiscal')` espalhado em 3 lugares) virou um mapa
  `SUBGROUP_PARENTS = {'group-fiscal':'group-configuracao', 'group-caixa':'group-financeiro',
  'group-contas-pagar':'group-financeiro'}` — qualquer subgrupo futuro só precisa entrar nesse
  mapa, sem tocar na lógica de accordion/popover. A CSS (`.app-nav-subgroup`/
  `.app-nav-subsubmenu`) já era genérica (nenhum seletor por ID pra Fiscal), então nenhuma
  mudança de CSS foi necessária pros 2 subgrupos novos.
- **Tabela de Contas a Pagar: cabeçalho não sobrepõe mais.** Mesmo bug/fix já documentado em
  Categorias de receitas e despesas (round 39): `.th` do Table.module.css tem `height:37px`
  fixo + `white-space:nowrap` por padrão — com Nº Documento/Vencimento/Valor em `%` estreito
  isso vazava o rótulo por cima da coluna vizinha. Fix: `height:auto`+`white-space:normal`
  (quebra em até 2 linhas) + colunas em `px` fixo somando 1230px (mais que a largura útil do
  card) — `.tableWrap` já tem `overflow-x:auto` de fábrica, então a rolagem horizontal aparece
  sozinha. **Coluna Ações sticky** (`position:sticky;right:0`, mesmo padrão de Categorias)
  permanece visível durante essa rolagem.
- **Ação "Excluir" → "Cancelar"**: ícone `trash-2`→`ban`, `data-action="excluir"`→`"cancelar"`,
  tooltip "Excluir"→"Cancelar". Clicar abre um NOVO modal de confirmação
  (`#cancelar-dialog-overlay`, mesmo padrão `.secondaryGray`+`.destructive` do antigo modal de
  exclusão) que chama `NiveloContasPagar.cancelar()` (já existia, usado até então só no
  formulário de edição) em vez de `excluir()` — a função `excluir()` em `contas-pagar-data.js`
  ficou órfã (não removida, sem pedido explícito pra isso, mas sem nenhum caminho de UI que a
  chame mais). Decisão de escopo: o ícone só aparece quando `status !== 'cancelada' && status
  !== 'paga'` (`podeCancelar`, mesmo padrão condicional de `podeEditar`/`podePagar`) — cancelar
  uma conta já paga/cancelada não faz sentido e o próprio `cancelar()` já teria esse guard
  silenciosamente.
- **Tooltip "Visualizar" → "Ver detalhes"** no ícone de olho da tabela/cards.
- **Nova tela: Ver detalhes de Contas a Pagar** (`detalhe-conta-pagar.html` + `page-detalhe-
  conta-pagar.css` + `detalhe-conta-pagar.js`), estrutura 1:1 copiada de Estoque > Ver detalhes
  (`detalhe-estoque.html`): cabeçalho voltar/título/badge de status + ação contextual, estado
  "não encontrada", 3 `.card`s ("Informações principais", "Informações financeiras", "Histórico
  de pagamentos" em timeline vertical com ícone+linha conectora, terminando em "Saldo atual").
  Ação contextual única: "Registrar pagamento" (mesmo modal da listagem, réplica de markup+
  lógica — mesmo princípio de "sem módulo de estado entre páginas" já documentado em Estoque),
  escondida quando a conta não permite pagamento. **Diferença arquitetural relevante vs.
  Estoque:** `window.NiveloContasPagar` é um catálogo GLOBAL (`contas-pagar-data.js`, carregado
  em toda página da jornada), então a resolução do registro é direta via
  `findByCodigo(new URLSearchParams(location.search).get('codigo'))` — não precisou do handoff
  via `sessionStorage` que Estoque usa (lá o dado vive só dentro de `estoque.js`, sem módulo
  próprio). Ação "Visualizar" da listagem repontada de `nova-conta-pagar.html?modo=ver` pra esta
  tela nova (o `modo=ver` de `nova-conta-pagar.js` não foi removido, só ficou sem nenhum caminho
  de UI que aponte pra ele). Registrada na journey "Jornada · Financeiro" existente, com
  variantes "Conta parcelada" (CTP-0009) e "Conta não encontrada".
- **Bug real do padrão recorrente `.btn[hidden]`, pego ao vivo nesta tela nova:** o botão
  "Registrar pagamento" (contextual, `hidden` por padrão até `renderAcaoContextual()` decidir)
  aparecia mesmo no estado "não encontrada" — `.btn` (Button.module.css) tem `display:flex`
  incondicional, mesma classe de bug já documentada dezenas de vezes neste arquivo. Fix:
  `.btn[hidden]{display:none}` em `page-detalhe-conta-pagar.css` (o guard de `.overlay[hidden]`
  já vinha de `page-contas-a-pagar.css`, carregado na mesma tela — não duplicado).
- **Bug real corrigido: dropdowns de Nova Conta a Pagar fechavam ao rolar a própria lista de
  opções** (reportado especialmente no de Fornecedor, que tem 16 opções e scrollbar visível).
  Causa raiz: eventos de `scroll` não borbulham, mas a fase de CAPTURA de um
  `window.addEventListener('scroll', close, true)` (usado pra fechar o menu quando a PÁGINA
  rola, já que ele é `position:fixed`) entrega ao listener do `window` TAMBÉM o scroll interno
  do próprio `.menu` (`overflow-y:auto`, ver Dropdown.module.css) — a captura sempre começa no
  `window` independente de onde o evento nasce. Fix, aplicado nos 2 `initDropdown()` afetados
  (`nova-conta-pagar.js` e `contas-a-pagar.js`, este último usado pelo Agrupamento de Filtros da
  listagem): o handler de scroll agora ignora o evento quando `menu.contains(event.target)`.
  Clicar dentro do menu (opção ou scrollbar) e clicar fora continuam funcionando como antes —
  só o scroll interno passou a não fechar mais o dropdown.

Verificado ao vivo: Sidebar com os 2 épicos novos abrindo/fechando corretamente (accordion,
popover na sidebar retraída) nas telas de Caixa e Contas a Pagar; cabeçalho da tabela sem
sobreposição (`getBoundingClientRect` confirmando larguras/posições corretas das 9 colunas) e
Ações sticky durante o scroll horizontal; ícone/tooltip "Cancelar" corretos, modal abrindo com a
mensagem certa, confirmação mudando o status pra "Cancelada" de verdade; "Ver detalhes"
navegando pra `detalhe-conta-pagar.html` com todos os campos corretos (incl. conta parcelada
CTP-0009), "Registrar pagamento" funcionando, estado "não encontrada" sem o botão vazando (bug
corrigido); dropdown de Fornecedor permanecendo aberto ao rolar a lista com scroll real do mouse
(testado no browser, não só via evento sintético) e continuando a fechar normalmente ao
selecionar uma opção ou clicar fora; nenhum erro de console em nenhuma das 3 telas tocadas.

## Ajustes 2026-08-03 (round 47) — Correção de escopo do Sidebar, Contas a Pagar, Nova Conta a
Pagar, Cadastro multi-tipo, Estoque de Uso, Dashboard alternativo

Pedido em 6 partes sobre a jornada Financeiro + Cadastro + Estoque + Dashboard, incluindo a
correção de um mal-entendido do round 46.

- **Sidebar do produto revertida pra flat: só "Caixa" e só "Contas a Pagar", sem subgrupos.**
  O round 46 tinha, por engano, aplicado o agrupamento em épicos (pedido pelo usuário só pro
  `prototype-nav`) na Sidebar REAL do produto (`interface-principal.js` + as 24 telas com shell
  completo). Revertido por completo: as 24 telas voltaram à estrutura flat original (só
  `financeiro-caixa`/`financeiro-pagar`, sem `group-caixa`/`group-contas-pagar`), e
  `interface-principal.js` voltou a ter `SUBGROUP_PARENTS = {'group-fiscal':
  'group-configuracao'}` (só Fiscal, como antes do round 46) — "Incluir lançamento"/"Nova
  conta" deixaram de ser itens de sidebar; a criação passa a acontecer DE DENTRO da própria
  tela de listagem (Caixa/Contas a Pagar), como já era o padrão antes do round 46.
- **O agrupamento em épicos continua existindo, mas só no `prototype-nav`** (`nav.config.js`),
  onde já fazia sentido desde o round 46 — "Caixa" e "Contas a pagar" continuam aparecendo como
  grupos `type:'flow'` dentro da Jornada · Financeiro no navegador de protótipo, cada um com a
  tela de listagem + a tela de criação como itens do mesmo épico.
- **Contas a Pagar (tabela): coluna Status reordenada** pra ficar logo depois de Vencimento
  (antes vinha depois de Pago) — informação de identificação rápida mais perto do início.
  **Coluna Ações sticky ganhou uma faixa de fundo ligeiramente mais escura** (`--color-gray-100`)
  pra se distinguir visualmente das colunas que passam por baixo durante o scroll horizontal —
  precisou de um seletor composto (`.tr .td:last-child`, 4 partes) pra vencer a regra de zebra
  já existente (`.tr:nth-child(odd/even) .td`, também 4 partes, específicidade empatada
  resolvida por ordem no arquivo) — sem isso a cor de zebra sempre vencia independente da ordem
  das regras. **Coluna Ações alargada** (140px → 170px) pra caber os 4 ícones (incl. Cancelar)
  sem cortar nenhum.
- **Nova Conta a Pagar: texto do Fornecedor selecionado alinhado à esquerda.** Bug real na
  FONTE do componente: `Dropdown.module.css`'s `.trigger` é um `<button>` sem `text-align`
  explícito, herdando o default do navegador (`text-align:center` pra botões) — invisível com
  texto curto numa linha só, mas visível quando o nome do fornecedor quebra em 2 linhas (2ª
  linha centralizada sob a 1ª). Corrigido com `text-align:left` no `.trigger` — vale pra
  qualquer dropdown do sistema, não só Fornecedor.
- **Atalho "+ Cadastrar novo fornecedor"** no menu do dropdown de Fornecedor, mesmo padrão
  visual do "+ Nova categoria" já usado no mesmo formulário (classe unificada
  `.ncp-dropdown-action-option`, renomeada de `.ncp-categoria-nova-option` pra deixar de ser
  específica de Categoria). Ao clicar, salva um rascunho do formulário em `sessionStorage`
  (`nivelo.novacontapagar.rascunho`) e redireciona pra `novo-cadastro.html?tipo=fornecedor&
  return=nova-conta-pagar` (Tipo pré-selecionado, back-link/cancelar repontados pra voltar pra
  Nova Conta a Pagar em vez de Cadastro). Salvar lá cria o fornecedor de verdade via
  `window.NiveloCadastros.add()` (novo — esse módulo só tinha leitura antes) e volta
  automaticamente pra Nova Conta a Pagar com o rascunho restaurado E o fornecedor recém-criado
  já selecionado no dropdown (toast de confirmação). O fornecedor criado persiste normalmente
  no catálogo de Cadastro (mesmo padrão sessionStorage já usado em `fazendas-data.js`).
- **Cadastro de Pessoas e Empresas: campo Tipo virou multi-seleção.** Um cadastro agora pode ser
  Cliente + Fornecedor + Transportadora simultaneamente, cada seleção aparecendo como uma tag
  dentro do campo. Implementado como uma função paralela `initMultiDropdown()` (menu-checkbox,
  fica aberto entre seleções, fecha só em clique-fora/Esc/no próprio trigger) ao lado do
  `initDropdown()` de seleção única já existente — os dois convivem na mesma tela, usados por
  campos diferentes. Geração de Código (`nextCodigo`) agora deriva o prefixo (C/F/T) de TODOS
  os tipos selecionados, não só um "tipo representativo" (a lógica antiga de "prioriza
  Transportadora" foi removida). Edição pré-seleciona todos os tipos da linha original.
- **Estoque de Uso: opção de criar a Conta a Pagar correspondente ao salvar uma compra** —
  checkbox "Criar também a conta a pagar correspondente a esta compra" (só na aba Compras),
  nunca automático. Marcado, revela Forma de Pagamento/Vencimento/Categoria (obrigatórios só
  quando marcado); ao salvar, chama `window.NiveloContasPagar.add()` com os dados calculados
  (valor = unitário × quantidade, histórico citando o produto). Deliberadamente sem persistência
  entre páginas (diferente do caso Fornecedor acima) — o pedido não exigia esse round-trip, só a
  criação em si.
- **Dashboard: nova variante alternativa (`dashboard-v2.html`), a original 100% preservada.**
  Pedido explícito do usuário pra testar um layout diferente sem arriscar a versão atual —
  `dashboard.html`/`.js`/`page-dashboard.css` não foram tocados (confirmado via grep: zero
  ocorrência de qualquer marcador da v2 no arquivo original). `dashboard-v2.html` +
  `dashboard-v2.js` (cópias) + `page-dashboard-v2.css` (novo, só classes `dashv2-*` aditivas)
  ganharam um badge "Versão alternativa (teste)" + link "Voltar pra versão atual" no cabeçalho, e
  uma visualização de **estoque comprometido** no card "Estoque de grãos": uma linha agregada no
  headline ("450 sc comprometidas de 2.430 sc, 18%") + uma barra de progresso + rótulo por
  cultura (Soja/Milho/Trigo), largura da barra calculada via JS (nunca inline no HTML, convenção
  já estabelecida no projeto). Registrada como tela própria (não variante) dentro da Jornada ·
  Sistema no `prototype-nav`, logo abaixo de "Dashboard".
- **3 novas ocorrências do bug recorrente `hidden`+`display` incondicional, pegas ao vivo:**
  `.novo-estoque-grid` (Estoque de Uso) sem guard `:not([hidden])`; colisão `.input` entre
  Checkbox×RadioButton (`page-novo-estoque.css`'s fix pré-existente pra RadioButton precisou
  também excluir `[type="checkbox"]`, senão o checkbox nativo reaparecia sem estilo).

Verificado ao vivo: Sidebar do produto flat de novo nas 24 telas, sem regressão de navegação;
tabela de Contas a Pagar com Status reposicionado e faixa cinza na coluna Ações durante scroll
horizontal, sem ícones cortados; Fornecedor alinhado à esquerda em texto de 1 e 2 linhas; fluxo
completo de "+ Cadastrar novo fornecedor" (rascunho preservado, fornecedor criado e
pré-selecionado ao voltar, persistido no catálogo); Tipo multi-seleção com tags, código com
prefixo composto, edição pré-selecionando múltiplos tipos; checkbox de Estoque de Uso criando a
conta a pagar de verdade só quando marcado; `dashboard-v2.html` renderizando sem erro de console,
badge/link/comprometido corretos, larguras de barra calculadas certas (24%/15%/0%); nenhuma
regressão detectada em `dashboard.html` original; nenhum erro de console em nenhuma das telas
tocadas.

## Ajustes 2026-08-03 (round 48) — Contas a Pagar (Ações sem destaque), Estoque (bug real de
layout + modal de Conta a Pagar), Dashboard alternativo (card de Estoque só em sacas)

Pedido em 3 partes.

- **Contas a Pagar: coluna Ações sticky sem destaque de fundo.** A faixa `--color-gray-100` +
  sombra adicionada no round 47 (pra marcar onde a coluna fixa termina) foi removida — a coluna
  agora segue o MESMO zebra ímpar/par de qualquer outra coluna (`.tr:nth-child(odd/even) .td`,
  já existia, nunca precisou de override). Separação visual agora é só uma borda `border-left`
  em `--color-gray-300` (um tom mais escura que `--color-gray-200`, usada nas demais divisões da
  tabela) — `.ctp-table-card .td:last-child`, sem precisar de seletor de 4 partes pra vencer o
  zebra (border não compete com background).
- **Estoque (Novo registo): bug real de layout, não um reskin.** O usuário reportou o formulário
  "desconfigurado" — investigação (`getComputedStyle`) achou a causa raiz: `Checkbox.module.css`
  (carregado nesta tela no round 47 pro checkbox "Criar também a conta a pagar") declara
  `.wrapper { display:inline-flex; align-items:center; ... }` como regra CRUA de 1 classe só,
  sem relação com o checkbox especificamente — como `.wrapper` é a mesma classe genérica usada
  por TODO campo de `Input`/`Dropdown` da tela, esse `align-items:center` vazava pra cada label+
  input do formulário, centralizando tudo horizontalmente (nenhuma propriedade de `text-align`
  mudou, é layout de flexbox mesmo). **Segunda consequência do mesmo vazamento, achada só depois
  de testar Estoque de Uso ao vivo:** o MESMO `.wrapper` do Checkbox também declara
  `display:inline-flex` sem guarda `:not([hidden])` (diferente de `Input.module.css`, que já
  protege isso) — como regra de autor sem guarda sempre vence o `[hidden]{display:none}` do user
  agent, campos escondidos por JS conforme o Tipo (Fornecedor/Destinatário/Valor unitário)
  voltavam a aparecer. Mesma classe de bug `hidden`+`display` incondicional já documentada
  dezenas de vezes neste arquivo, só que pela primeira vez a origem é o PRÓPRIO `.module.css` do
  componente colidindo consigo mesmo via nome de classe genérico, não um CSS de página.
- **Resolvido removendo a causa, não só o sintoma:** como o pedido de negócio (item seguinte)
  trocou o checkbox por um modal pós-salvamento, o `Checkbox.module.css` deixou de ser necessário
  nesta tela — o `<link>` foi removido do `<head>` de `novo-estoque.html`, e os 2 overrides de
  página que tinham sido escritos pra conter o vazamento (`.wrapper:not(...){align-items:normal}`
  e `.wrapper[hidden]:not(...){display:none}`) foram removidos também, já que sem o componente
  carregado a colisão nem existe mais — mais simples que manter um patch em volta de um problema
  evitável. `.input:not([type="checkbox"])`/`.option` também voltaram a excluir só RadioButton
  (a exclusão de Checkbox ficou órfã).
- **Contas a Pagar via Estoque de Uso: checkbox no formulário → modal depois de salvar.** Pedido
  explícito do usuário pra deixar a decisão contextual (a compra já confirmada) em vez de mais um
  campo pra decidir antes de salvar. O checkbox + os 3 campos condicionais (Forma de Pagamento/
  Vencimento/Categoria) saíram do `<form>` principal; um novo `#criar-conta-pagar-overlay`
  (Dialog `md`, mesmo padrão de "Registrar pagamento"/"Alterar status" já usados no sistema) abre
  IMEDIATAMENTE depois do submit válido, só quando `tipo==='compras' && !isXml` — "Não, obrigado"
  (ou o X) redireciona sem criar nada; "Criar conta a pagar" valida os 3 campos (mesmo padrão de
  borda vermelha) e só então chama `NiveloContasPagar.add()` + redireciona com a mensagem de
  toast estendida ("... Conta a pagar criada."). `redirectAfterSave()` novo, único ponto que seta
  o `sessionStorage` e navega, chamado nos 2 caminhos (com/sem conta).
- **Dashboard (alternativa): card "Estoque de grãos" só em sacas, sem estimativa financeira.**
  Pedido explícito: no topo, "Valor total estimado" (R$) → total de sacas consolidado ("2.430
  sc" / "Total em estoque" — soma de Soja+Milho+Trigo); em cada item, removida a linha "valor
  estimado R$ ..." que ficava abaixo da quantidade — só a quantidade + a barra/rótulo de
  comprometido (já existentes desde o round 47) permanecem. `dashboard-v2.js`: como
  `estoque-headline-value` deixou de ser um valor monetário, saiu da lista `CURRENCY_FIELD_IDS`
  (renomeada `ZERO_FIELD_VALUES`, agora um mapa id→valor-zero em vez de uma lista com uma
  constante só) — zera pra "0 sc" no `#state=empty`, não mais "R$ 0,00". Escopo estritamente
  isolado à v2: `dashboard.html`/`.js`/`page-dashboard.css` (a versão original) não foram
  tocados.

Verificado ao vivo: tabela de Contas a Pagar com Ações seguindo o zebra normal + borda esquerda
mais escura visível durante o scroll horizontal; Novo registo de estoque com todos os campos
alinhados à esquerda (label sobre o campo, padrão do resto do sistema) nos 3 tipos; campos
condicionais (Fornecedor/Destinatário/Valor unitário) escondendo/mostrando corretamente conforme
Tipo, sem vazar mais; fluxo completo do modal de Conta a Pagar (abre só em Compras/Manual, valida
os 3 campos com borda de erro, "Não, obrigado"/X pulam sem criar, "Criar conta a pagar" cria de
verdade — confirmado via `NiveloContasPagar.add()` interceptado, payload correto — e redireciona
com o toast certo); Vendas/Comprometido continuam redirecionando direto, sem modal; mobile
(375px) do formulário sem regressão; `dashboard-v2.html` mostrando "2.430 sc"/"Total em estoque"
no topo e só quantidade+comprometido por cultura, `#state=empty` zerando pra "0 sc"; nenhuma
regressão em `dashboard.html` original; nenhum erro de console em nenhuma das telas tocadas.

## Ajustes 2026-08-03 (round 49) — Dashboard: card "Estoque de grãos" definitivo, remoção da
variante alternativa de teste

Ajuste pontual, escopo estritamente restrito ao card "Estoque de grãos" do Dashboard ORIGINAL —
nenhuma outra seção/card/filtro do Dashboard foi tocado.

- **Card "Estoque de grãos" substituído pelo desenvolvido na versão alternativa** (round 47):
  `dashboard.html` ganhou o mesmo headline ("2.430 sc" / "Total em estoque" + linha agregada de
  comprometido) e, por cultura, a barra+rótulo de comprometido no lugar da antiga linha "valor
  estimado R$ ...". Classes CSS portadas de `dashv2-*` pra `dash-*` (mesmo prefixo do resto do
  Dashboard original, já que a variante "alternativa" deixou de existir) — `.dash-comprometido-
  total`/`-bar`/`-bar-fill`/`-label`, adicionadas em `page-dashboard.css`. Lógica de largura da
  barra (`data-comprometido`/`data-total` → `%` calculado via JS, nunca inline no HTML) portada
  pra `dashboard.js`.
- **`estoque-headline-value` deixou de ser um campo monetário** — `dashboard.js`'s mecanismo de
  zerar valores no `#state=empty`/fazenda sem dados (antes `CURRENCY_FIELD_IDS`, uma lista com uma
  constante `R$ 0,00` só) generalizado pra `ZERO_FIELD_VALUES` (mapa id→valor-zero): os 3 campos
  monetários continuam zerando pra "R$ 0,00", `estoque-headline-value` agora zera pra "0 sc".
- **Variante `dashboard-v2.html` removida por completo** (arquivo + `dashboard-v2.js` +
  `page-dashboard-v2.css` deletados, entrada "Dashboard (alternativa)" removida do
  `prototype-nav/nav.config.js`) — o teste de comparação terminou, o card ganhador já está
  incorporado no Dashboard real; manter os arquivos duplicados não servia mais propósito nenhum.
  `dashboard.html`/`.js`/`page-dashboard.css` (o resto do Dashboard, fora do card trocado) não
  foram tocados.

Verificado ao vivo: `dashboard.html` renderizando o card novo idêntico ao que era só da variante
(headline/comprometido agregado/barras por cultura), resto do Dashboard (Safra/Saldo/Contas a
pagar/receber/Clima/filtros) sem nenhuma mudança visual; nenhum erro de console; `prototype-nav`
sem mais o item "Dashboard (alternativa)"; `dashboard-v2.*` confirmados removidos do repositório.

## Ajustes 2026-08-03 (round 50) — Nova jornada: Canal de Ideias (comunidade)

Ativado o item de sidebar "Canal de ideias" (`data-nav="canal-ideias"`, ícone `lightbulb`, stub
visual desde a criação do shell — sem `NAV_DESTINATIONS`). Feature pedida com um brief de produto
completo: espaço colaborativo entre usuários pra compartilhar sugestões, votar e comentar —
explicitamente **sem** status de análise/aprovação/backlog/priorização (é comunidade, não
gestão). Inspiração declarada: Reddit/GitHub Discussions/Canny, adaptado à identidade visual do
sistema.

- **3 telas novas:** `canal-ideias.html` (feed principal), `ideia-detalhe.html` (página da
  ideia, coluna única, sem sidebar de conteúdo), `nova-ideia.html` (criação, página — não modal,
  pelo mesmo motivo de todo fluxo de criação do sistema: consistência com Novo Produto/Nova
  Fazenda/Novo Lançamento, nenhum precedente de modal pra criar um registro). Todas com o shell
  completo (Header+Sidebar), "Canal de ideias" `is-active`.
- **3 componentes novos no Storybook**, criados porque nenhum equivalente existia:
  - **`Avatar`** (`Storybook-Nivelo/src/components/Avatar`): círculo de iniciais (ou imagem),
    `sm`/`md`/`lg`, 6 cores fixas (`pickAvatarColor()`, hash do nome → sempre a mesma cor pro
    mesmo autor).
  - **`Chip`** (`.../Chip`): pílula de filtro clicável (categorias do feed), com `ChipRow` (fileira
    com rolagem horizontal sem scrollbar visível, mesma técnica de `Tab.module.css`'s `.list`).
  - **`VoteButton`** (`.../VoteButton`): a ação principal da interface — chevron-up + contagem,
    estado `voted` com preenchimento SUTIL (`--color-bg-brand`, não a cor de marca sólida) por
    pedido explícito de "chamar atenção sem roubar o foco do conteúdo". `sm` no card do feed,
    `md` na página de detalhe.
  - **Decisão de especificidade tomada JÁ NA CRIAÇÃO, não como correção posterior:** os 3
    componentes usam seletores compostos pros modificadores de tamanho (`.avatar.sm`,
    `.voteButton.sm`) em vez de classes soltas (`.sm`) — `Button.module.css` (carregado em
    praticamente toda tela, incl. as 3 novas) já declara `.sm`/`.lg` soltos pro próprio
    `<button class="btn sm">`; um modificador solto aqui vazaria padding/border-radius de botão
    pros elementos novos. Aplicado a lição da seção de colisões de `rules.md` de forma
    preventiva, não descoberta ao vivo desta vez.
- **`ideias-data.js`** (`window.NiveloIdeias`, mesma convenção IIFE de `fazendas-data.js`): 6
  categorias fixas (Financeiro/Estoque/Caderno de campo/Relatórios/Assistente de IA/Outros), 8
  ideias seed com votos/comentários variados. `toggleVoto()` sempre relativo ao valor SEED (que
  já exclui o próprio voto do usuário) — persistido via sessionStorage (`nivelo.ideias.votos`,
  só a presença da chave marca "votado por mim", nunca um contador acumulativo). `addComentario()`/
  `add()` (nova ideia) seguem o mesmo padrão de persistência de sessão já usado em
  `fazendas-data.js` — sobrevive à navegação entre as 3 telas na mesma aba, não a uma sessão nova.
- **Feed (`canal-ideias.html`):** busca + Dropdown "Ordenar por" (Mais votadas/Mais recentes) +
  chips de categoria (com "Todas") + cards. Cada card: `VoteButton sm` (vota sem abrir a ideia,
  `stopPropagation` de fato via checagem de `closest('[data-action="votar"]')` ANTES de
  qualquer navegação) + `.badge` de categoria (cor mapeada por categoria, nunca solta) + título +
  resumo (2 linhas, `-webkit-line-clamp`) + meta (avatar+autor+data+contagem de comentários). Card
  inteiro é clicável/navegável (`role="link"`, `tabindex`, Enter/Espaço funcionam). `#state=empty`
  força "Nenhuma ideia encontrada" via uma flag interna (`isEmptyDemo`), não mais digitando uma
  busca falsa no campo visível (1ª versão fazia isso, corrigido antes de finalizar — o usuário
  nunca deveria ver um valor de busca inventado).
- **Detalhe (`ideia-detalhe.html`, resolvida por `?codigo=`):** título/descrição completa/
  `VoteButton md`/categoria/autor/data em cima (sem sidebar, coluna única, mesma leitura mobile/
  desktop — pedido explícito), comentários abaixo de um divisor sutil (nunca um "card" de
  formulário — a intenção era ler como thread/artigo, não tela administrativa). Campo de
  comentário: textarea com a classe `.input` do Input (não existe Textarea no Storybook ainda,
  mesmo padrão já usado em Novo Registo de Estoque) + avatar do "usuário atual" (`CURRENT_USER =
  'Você'`, único conceito de identidade neste protótipo sem sessão real — mesmo autor usado em
  toda nova ideia/comentário). Timestamp de comentário/ideia nova usa `new Date()` real (não uma
  data fixa de referência como o resto do protótipo faz pra dados de negócio) — decisão
  deliberada: é conteúdo gerado pelo usuário NA hora, não um registro de negócio simulado, então
  "agora" é o valor correto.
- **Nova ideia (`nova-ideia.html`):** 1 `.card` só, 3 campos (Título/Categoria `Dropdown`/
  Descrição textarea), validação mínima (título não vazio, categoria escolhida, descrição com
  10+ caracteres), padrão de erro "só borda" (`.wrapper.error .errorText{display:flex}`, nunca
  fundo vermelho). Ao publicar, redireciona direto pra `ideia-detalhe.html` da ideia recém-criada
  (não pro feed) — gratificação imediata, o autor já vê o próprio post fica visível de verdade.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'canal-ideias':
  'canal-ideias.html'`) ativa a navegação real em todas as telas que já tinham o item de sidebar.
- **`prototype-nav/nav.config.js`:** nova "Jornada · Canal de Ideias" com as 3 telas + variantes
  (feed vazio, detalhe sem comentários, detalhe não encontrada).
- **Fora de escopo, por instrução explícita do pedido original:** status da ideia, fluxo de
  aprovação, badges administrativos, backlog, priorização interna — o Canal de Ideias é só um
  espaço colaborativo nesta etapa, nada de gestão/curadoria.

Verificado ao vivo: feed com busca+ordenação+chips se compondo corretamente; voto alternando
count+estado visual sem navegar; card inteiro clicável pra ideia certa; mobile (375px) com chips
rolando horizontalmente e cards legíveis; fluxo completo de comentário (post + contagem
atualizada); fluxo completo de nova ideia (validação bloqueando campos vazios, publicação
redirecionando pra ideia certa, ideia nova aparecendo no feed via sessionStorage); navegação real
da Sidebar (de Dashboard) até o Canal de Ideias; nenhum erro de console em nenhuma das 3 telas.

## Ajustes 2026-08-03 (round 51) — Nova jornada: Natureza da Operação (Configuração > Fiscal)

Item "Notas fiscais" removido do submenu Fiscal (era `data-nav="fiscal-nota-fiscal"`, sem link real
nenhum) e o item já existente "Natureza da operação" (`fiscal-natureza`, stub visual desde a criação
do shell) ganhou uma tela de configuração real: cadastro completo de Natureza de Operação (RF402),
listagem + criação/edição, com toda a Configuração Tributária vinculada.

- **Arquivos novos:** `app/screens/naturezas-operacao.html` + `app/shared/page-naturezas-operacao.css`
  + `app/shared/naturezas-operacao.js` (listagem); `app/screens/nova-natureza-operacao.html` +
  `app/shared/page-nova-natureza-operacao.css` + `app/shared/nova-natureza-operacao.js` (cadastro/
  edição); novo módulo de dados `app/shared/naturezas-operacao-data.js`
  (`window.NiveloNaturezasOperacao` — `list/findByCodigo/nextCodigo/add/update/toggleAtivo`, código
  `NOP-NNN` auto-gerado). **Não confundir com `natureza-operacao-data.js`** (singular, já existente
  desde a Jornada de Notas Fiscais) — aquele é um stub simples `{tipoOperacao, label, cfop}` consumido
  só pelo Dropdown "Natureza da operação" de Nova Nota Fiscal, mantido intacto e fora do escopo deste
  pedido (unificar os dois módulos é trabalho futuro, não pedido agora).
- **Listagem:** título + banner de alerta fiscal permanente (`alert.warning` do Feedback, não um
  toast — a mensagem "validar com contador/parceiro fiscal" precisa continuar visível, não desaparecer
  em 6s) + abas `Tab` Entrada/Saída (**mesma tabela filtrada por `data-tipo`**, diferente de Estoque,
  que usa 3 tabelas por ter colunas genuinamente diferentes por aba — aqui as colunas são idênticas
  nos dois tipos) + busca + Dropdown simples de Situação (Todas/Ativas/Desativadas, sem Agrupamento de
  Filtros por ser um único filtro) + botão primário "Nova Natureza de Operação". Tabela: Descrição/
  Padrão/Série/Consumidor Final/Status/Ações — booleanos como texto Sim/Não (não badge, pedido
  explícito), Status como badge Ativo/Inativo. Ação principal Ativar/Desativar com modal de
  confirmação (mesmo padrão exato de Categorias/Talhões: Desativar `.btn.destructive`, Ativar
  `.btn.primary`, Cancelar `.secondaryGray`) + Editar. Cards no mobile, mesma técnica de sempre.
- **Formulário:** "Padrões pré-configurados" (Venda/Remessa/Devolução, cards clicáveis próprios —
  nem `.chip` nem `.btn`, já reservados para outros usos no sistema — que preenchem Tipo/Descrição/
  Padrão/Série/Regime/Consumidor Final/CSOSN/CFOP/DIFAL com valores sugeridos, editáveis depois;
  escondido em modo edição). "Dados gerais": Tipo (Dropdown Entrada/Saída), Descrição, Finalizada/
  Padrão/Consumidor Final (RadioButton Sim/Não, mesmo componente do resto do sistema), Série, Código
  de Regime Tributário (Dropdown 1/2/3), Observação (única opcional, com o mesmo marcador visual
  "(opcional)" já usado em Novo Cadastro/Criar Conta). "Configuração tributária": **primeiro uso real
  do `Accordion` do Storybook** — 5 blocos independentes (Simples Nacional/IPI/ISSQN/PIS/COFINS), cada
  um abre/fecha sem afetar os outros (`allowMultiple` de fato, não só um por vez — impostos são
  independentes entre si, diferente do accordion de grupos da Sidebar). Simples Nacional com CSOSN
  (10 valores fixos)+CFOP+ICMS DIFAL+Observação+Informação ao Fisco; IPI com Código (50-55/99/"Não
  destacar IPI", pré-selecionado)+Alíquota+Código de Enquadramento+Observação+Informação ao Fisco;
  ISSQN com CST (Tributado/Isento/Outra situação)+Alíquota+Base+Descontar ISS+Observação+Informação
  ao Fisco; PIS/COFINS com CST (texto livre, sem lista fixa no pedido)+Alíquota+Base+Observação+
  Informação ao Fisco. Ações "Cancelar"/"Salvar natureza de operação" no mesmo padrão de rodapé já
  usado em todo formulário do sistema (`column-reverse` mobile, `row`+`flex-end` desktop).
- **Colisão preventiva já aplicada na criação** (mesma lição de RadioButton×Input já documentada
  dezenas de vezes neste arquivo): `.input:not([type="radio"])` reafirma `position:static;opacity:1`
  pros campos de texto/textarea reais, já que Finalizada/Padrão/Consumidor Final/ICMS DIFAL/Descontar
  ISS usam RadioButton na mesma tela.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'fiscal-natureza':
  'naturezas-operacao.html'`) ativa a navegação real nas 28 telas que já tinham o item de sidebar.
- **Remoção do item "Notas fiscais" do Fiscal:** as 28 telas com Sidebar completa (mass-edit via
  script Node, não editadas uma a uma) perderam o `<button data-nav="fiscal-nota-fiscal">` do
  submenu Fiscal — o item "Notas fiscais" da jornada Vendas (`vendas-nota-fiscal`, tela
  `notas-fiscais.html`) não foi tocado, é uma entrada de sidebar diferente, fora do escopo do pedido
  (que falava especificamente do item dentro de Configuração > Fiscal).
- **`prototype-nav/nav.config.js`:** novo épico "Natureza da Operação" (`type:'flow'`) dentro da
  Jornada · Configuração já existente, com as 2 telas + variante de edição (`?codigo=NOP-001`).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma natureza
  de operação criada/editada/ativada/desativada só existe durante a sessão de JS daquela página — ao
  redirecionar pra `naturezas-operacao.html`, o script daquela tela recarrega os dados seed do zero.
  O toast de sucesso aparece corretamente; a operação em si não persiste na listagem (mesmo
  comportamento de Categorias/Caixa/Contas a Pagar, que também não pediram tratamento especial pra
  isso — só Fazendas recebeu sessionStorage, por pedido explícito em outra rodada).

Verificado ao vivo: sidebar sem "Notas fiscais" e com "Natureza da operação" ativo/navegável nas 28
telas; listagem com abas Entrada/Saída filtrando corretamente, busca, Dropdown de Situação, Ativar/
Desativar com modal de confirmação alterando o badge de verdade; formulário com os 3 presets
preenchendo os campos certos (confirmado via inspeção de todos os valores), accordion com os 5 blocos
abrindo/fechando de forma independente, validação bloqueando Descrição/Série/Regime vazios (borda
vermelha), submit criando a natureza e voltando pra listagem com toast; modo edição
(`?codigo=NOP-001`) pré-preenchendo Dados Gerais e o bloco Simples Nacional corretamente, título
"Editar Natureza de Operação", presets escondidos; nenhum erro de console em nenhuma das 2 telas.

## Ajustes 2026-08-03 (round 52) — Natureza da Operação: 6 correções sobre o round 51

Todos os 6 pedidos eram bugs reais introduzidos no round 51, não pedidos de novo comportamento —
cada um foi rastreado até a causa raiz antes de corrigir:

1. **Modal Ativar/Desativar — botão "X" errado.** `naturezas-operacao.html` usava
   `class="close"`, mas `Dialog.module.css` define a classe como `.closeBtn`. Sem o `.module.css`
   reconhecer a classe, o botão ficava sem nenhum estilo próprio (mesma "armadilha de nome sem
   `.module.css`" documentada em outros rounds, só que aqui o nome da classe é que estava errado,
   não o arquivo faltando). Fix: `class="closeBtn"`.
2. **Banner de warning fora do padrão visual.** Colisão de 3 vias já documentada (`.body`/`.title`
   — Feedback × Table × Dialog): esta tela carrega os 3 `.module.css` juntos (Dialog só por causa
   do modal de Ativar/Desativar), e o `.body` do Dialog (`padding:16px…`, `color:text-secondary`)
   vencia por ser carregado por último — o banner ficava com o padding de modal e o texto cinza em
   vez da cor semântica do alerta. Mesmo fix já usado no toast de sucesso desta mesma tela e no
   banner de trial de Criar Conta: `.nop-warning-banner .body { padding:0; color:inherit;
   line-height:inherit; }`.
3. **Tipo (e TODOS os outros dropdowns da tela) sem borda/fundo.** Causa raiz: `Accordion.module.css`
   e `Dropdown.module.css` compartilham o nome de classe `.trigger`. Accordion era carregado depois
   de Dropdown no `<head>`, então seu `.trigger { background:none; border:none; }` vencia
   globalmente — apagando borda/fundo de TODOS os selects da tela (Tipo, Regime, CSOSN, Código do
   IPI, CST do ISSQN), não só do Tipo como o pedido sugeria. Fix definitivo: eliminar a causa —
   trocar a Configuração Tributária de Accordion pra Tab (ver item 6), removendo o
   `Accordion.module.css` da tela. Sem ele carregado, a colisão desaparece sozinha.
4. **Radio buttons não ficavam visualmente marcados após o clique.** `RadioButton.module.css`
   desenha a bolinha preenchida só via classe `.checked` no `<label class="option">` — não usa o
   pseudo-seletor `:checked` do input nativo. O JS original nunca sincronizava essa classe, então
   clicar mudava `input.checked` de verdade (formulário funcionava), mas a UI nunca refletia (bug
   puramente visual). Fix: `syncRadioChecked(name)` alterna `.checked` no `<label>` pai a cada
   `change`, e roda uma vez no load pra refletir os `checked` default do HTML. Mesmo bug já visto
   antes com "Forma de entrada" em Estoque (round 24) — recorrente porque cada tela reimplementa o
   grupo de radio na mão.
5. **Campo Observação não ocupava a largura total.** Mesma família de colisão do item 3, mas em
   `width`: `RadioButton.module.css` declara `.input { width:1px; height:1px; opacity:0 }` (pra
   esconder visualmente o radio nativo), carregado depois de `Input.module.css`. O fix preventivo
   já existente (`.input:not([type="radio"]) { position:static; opacity:1 }`) cobria posição e
   opacidade, mas nunca tinha precisado cobrir `width` porque a outra regra
   (`input.input:not([type="radio"]) { width:100% }`, qualificada pela tag `input`) sempre resolvia
   pra `<input>` de texto — só que `<textarea>` não é `<input>`, então essa segunda regra nunca
   pegava a Observação, e a largura ficava presa em 1px (mascarado porque a altura tinha
   `min-height` como rede de segurança, mas não existe `min-width`). Fix: adicionar `width:100%` na
   regra genérica `.input:not([type="radio"])`.
6. **Padrões pré-configurados — texto ambíguo + seleção não persistia.** Hint text reescrito
   deixando explícito que usar um preset é opcional; clique agora adiciona `.selected` ao botão
   (removendo dos outros) com um ícone de check, e o CSS pinta a borda/fundo/cor de marca — o preset
   aplicado fica visualmente marcado até outro ser escolhido ou o form ser resetado.
7. **Configuração Tributária: Accordion → Tab, um único card.** Reestruturação (não só fix):
   substituiu os 5 blocos independentes de `Accordion.module.css` por um único
   `.card.nnop-tax-card` com abas (`Tab.module.css`, mesmo padrão de `.list`/`.tab`/`.panel` já
   usado nas abas Entrada/Saída da listagem) — Simples Nacional/IPI/ISSQN/PIS/COFINS. Trocar de aba
   só alterna qual `.nnop-tax-panel` está `hidden`; o subtítulo do card (`#nnop-tax-subtitle`) muda
   junto pra descrever o imposto ativo. Resolveu o item 3 pela raiz (nenhum `.trigger` de Accordion
   sobrando na tela) e deixou o card com o padding/espaçamento padrão do resto do sistema (não
   precisa mais do `content`/`padding` próprio do Accordion).

Verificado ao vivo (via inspeção de DOM/CSS computado, não só screenshot — mesma técnica já usada
em rounds anteriores por causa da lentidão de composição do sandbox): `.closeBtn` com estilo
correto; `.nop-warning-banner .body` com `padding:0`/cor semântica herdada; Tipo e demais dropdowns
com borda/fundo restaurados após remover o Accordion; clique em radio sincroniza `.checked` no
label; Observação com `width` computado igual à largura do card; clique em preset persiste
`.selected`; troca de aba tributária alterna painel + subtítulo corretamente; nenhum erro de
console em nenhuma das 2 telas.

## Ajustes 2026-08-03 (round 53) — Nova tela: Relatórios (Financeiro > Relatórios)

Ativado o item de sidebar "Financeiro > Relatórios" (`data-nav="financeiro-relatorios"`, stub
visual desde a criação do shell — sem `NAV_DESTINATIONS`), com uma página de entrada pra
escolher entre os 4 tipos de relatório do sistema (Balancete/LCDPR/DRE/Entradas e saídas).

- **Arquivos novos:** `app/screens/relatorios.html` (shell completo, `group-financeiro` já
  aberto + `financeiro-relatorios` `is-active`) + `app/shared/page-relatorios.css` +
  `app/shared/relatorios.js`.
- **Deliberadamente sem abas** (pedido explícito) — cada relatório tem filtros/parâmetros
  próprios, então a tela é só um ponto de escolha, nunca uma alternância entre conteúdos.
  4 cards clicáveis (`<button class="card rel-card">`, reaproveitando `.card` de
  `Table.module.css` como container genérico), grid fixo de **2 colunas** a partir de 640px
  (não `auto-fill` como em Fazendas — aqui o número de itens é fixo e conhecido, sempre 4, cresce
  em pares) / 1 coluna no mobile. Cada card: ícone (`scale`/`book-text`/`line-chart`/
  `arrow-left-right`, todos discretos, sem exagero decorativo) + título + descrição curta +
  CTA "Gerar relatório →" (cor de link, nunca um `.btn` — reforça que é uma ação secundária
  dentro do card, o card inteiro é que é o alvo clicável) + hover com `box-shadow`+
  `translateY(-2px)`.
- **Nenhum dos 4 fluxos de configuração/visualização existe ainda** (Balancete/LCDPR/DRE/
  Entradas e saídas) — fora de escopo explícito deste pedido, que pediu só a página de entrada.
  Clicar num card por enquanto só dá o mesmo feedback de `flashDisabled()` já usado em outras
  telas pra ações sem destino real pronto (ver `estoque.js`/`fazendas.js`) — quando cada fluxo
  for construído, o card troca pra `window.location.href` de verdade, sem precisar reestruturar
  a página (arquitetura já pensada pra múltiplos relatórios crescerem sem tocar a Sidebar).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'financeiro-relatorios':
  'relatorios.html'`) ativa a navegação real em todas as telas que já tinham o item de sidebar.
- **`prototype-nav/nav.config.js`:** novo item leaf "Relatórios" na journey "Jornada ·
  Financeiro" já existente (fora dos épicos `type:'flow'` de Caixa/Contas a pagar, já que
  Relatórios não tem uma 2ª tela satélite ainda).

Verificado ao vivo: sidebar com "Relatórios" ativo/navegável; os 4 cards renderizando com
ícone/título/descrição/CTA corretos; grid 2 colunas no desktop, 1 coluna no mobile (375px), sem
overflow; clique em card dispara o flash-disable (sem navegar, sem erro); nenhum erro de console.

## Ajustes 2026-08-03 (round 54) — Contas a Pagar: KPIs no topo

Adicionada uma seção de 4 KPIs (Total a pagar/Vencido/Vence hoje/Próximos vencimentos) acima da
listagem de Contas a Pagar, cópia estrutural EXATA do padrão já usado em Caixa
(`.caixa-summary-row`/`.caixa-summary-card`, que por sua vez já era cópia de Estoque) — só a
contagem de colunas no desktop muda (4 em vez de 3, com um degrau extra em 2 colunas no
tablet/640px antes de virar 4 em 1024px). Nenhum componente/classe novo inventado.

- **Cálculo:** `updateKpis(matching)` em `contas-a-pagar.js`, chamada de dentro de
  `applyFilters()` (mesmo ponto de chamada de `updateResumo()` em `caixa.js`) — sempre reflete
  as linhas que casam com busca + Agrupamento de Filtros no momento, nunca o dataset inteiro,
  nunca só a página atual da paginação. Contas `cancelada` nunca entram em nenhum dos 4 totais
  (dívida cancelada não é "a pagar"); contas com `saldo<=0` (pagas) também ficam de fora.
  - Total a pagar: soma de `saldo` de todas as linhas filtradas não canceladas com saldo > 0.
  - Vencido: soma onde `vencimento < TODAY`.
  - Vence hoje: soma onde `vencimento === TODAY`.
  - Próximos vencimentos: soma onde `TODAY < vencimento <= TODAY + 7 dias` (`addDaysISO()`,
    novo helper local).
  - Usa `window.NiveloContasPagar.TODAY` (data de referência fixa do protótipo, `'2026-07-31'`)
    — nunca `new Date()` real, mesmo princípio de todo o resto do app.
- Verificado ao vivo: valores iniciais batem com a soma manual da seed (R$ 61.540,00/
  R$ 44.440,00/R$ 3.500,00/R$ 0,00); filtrar por busca ("sementes") recalcula os 4 KPIs pra
  refletir só a linha isolada; grid 1 coluna mobile → 2 colunas ~640px → 4 colunas 1024px+;
  nenhum erro de console.

## Ajustes 2026-08-03 (round 55) — Padrão de KPI: mesmo tamanho em qualquer largura de tela

Depois de comparar visualmente (pedido do usuário: "teste colocar em desktop mesmo tamanho do
mobile pra eu ver") as duas opções nos KPIs novos de Contas a Pagar, o usuário decidiu tornar o
tamanho do mobile (12px bold no título, 24px bold no valor) o padrão em qualquer largura de
tela — não mais um aumento pro desktop (era 18px/`--font-size-lg` no título, 30px/
`--font-size-3xl` medium no valor).

- **Aplicado nas 3 telas que usam este padrão de card de KPI/resumo:** `page-estoque.css`
  (`.estoque-summary-*`), `page-caixa.css` (`.caixa-summary-*`), `page-contas-a-pagar.css`
  (`.ctp-summary-*`) — os blocos `@media (min-width:1024px)` que aumentavam `.title`/
  `.summary-icon svg`/`.summary-value` foram removidos nos 3 arquivos.
- **Dashboard NÃO foi tocado, por instrução explícita** ("exceto no dashboard, não mexa no
  dash") — os cards do Dashboard (`.dash-card`, Safra/Estoque de grãos/Saldo em contas/etc.) são
  um padrão visual próprio e sempre foram, não fazem parte da família `*-summary-*` deste ajuste.
- `.estoque-summary-caption` (legenda secundária que só existe em Estoque, sem equivalente em
  Caixa/Contas a Pagar) manteve seu próprio ajuste de tamanho no desktop (10px→12px) — não fazia
  parte do padrão testado (que era só título+valor), então não foi alterado.

Verificado ao vivo (1280px): os 3 cards de Caixa, os 3 de Estoque e os 4 de Contas a Pagar
mostram título/valor no mesmo tamanho compacto do mobile; Dashboard continua exatamente como
estava, nenhuma mudança visual; nenhum erro de console em nenhuma das 4 telas.

## Ajustes 2026-08-03 (round 56) — Nova jornada: Contas Bancárias (Configuração > Conta bancária)

Ativado o item de sidebar "Configuração > Conta bancária" (`data-nav="config-conta-bancaria"`,
stub visual desde a criação do shell — sem `NAV_DESTINATIONS`). CRUD completo: listagem com
busca/ordenação/paginação + cadastro/edição + exclusão real mediante confirmação.

- **Arquivos novos:** `app/screens/contas-bancarias.html` + `app/shared/page-contas-bancarias.css`
  + `app/shared/contas-bancarias.js` (listagem); `app/screens/nova-conta-bancaria.html` +
  `app/shared/page-nova-conta-bancaria.css` + `app/shared/nova-conta-bancaria.js` (cadastro/
  edição); 2 novos módulos de dados: `app/shared/bancos-catalogo-data.js`
  (`window.NiveloBancosCatalogo` — catálogo de 10 instituições financeiras reais, código Febraban
  + nome, só `list/findByCodigo`, sem tela de gestão própria por não ter sido pedida) e
  `app/shared/contas-bancarias-data.js` (`window.NiveloContasBancarias` —
  `list/findByCodigo/nextCodigo/bancoNome/contaFinanceiraDescricao/add/update/remove`).
- **Decisão de arquitetura confirmada antes de codar — "Conta Financeira" (RF203, citado no
  pedido) mapeada pro catálogo já existente de Categorias de receitas e despesas**
  (`window.NiveloCategoriasFinanceiras`, Configuração > Categorias de receitas e despesas): este
  protótipo não tem (nem foi pedido) um cadastro de "Conta Financeira" separado de "Categoria
  financeira" — o catálogo já existente cumpre exatamente o papel descrito no pedido
  ("classificar/registrar automaticamente os lançamentos financeiros"), sendo o mesmo já usado
  por Caixa/Contas a Pagar/Nova Nota Fiscal pra esse fim. Decisão deliberada de reaproveitar em
  vez de inventar um segundo catálogo paralelo com o mesmo propósito — documentado com destaque
  em `contas-bancarias-data.js` pra qualquer trabalho futuro que precise revisitar essa escolha.
- **Listagem:** busca (Banco/Descrição) + tabela (Banco/Descrição/Agência/Conta/Ações) com
  ordenação nas 4 colunas + paginação real (10/página, mesmo algoritmo exato de Caixa/Contas a
  Pagar/Cadastro) + Cards no mobile. Ações Editar (sempre) + **Excluir com exclusão REAL**
  (Dialog `sm`, Cancelar cinza + Excluir destrutivo) — diferente de Categorias/Talhões, que só
  Ativam/Desativam pra preservar histórico; aqui o pedido foi explícito ("Excluir conta mediante
  confirmação"), sem menção a soft-delete, então a remoção é de verdade.
- **Formulário:** Código (readonly, auto-increment real — nunca reaproveita um código já
  excluído, mesmo comportamento de uma PK auto-increment de banco de dados real) + Banco
  (Dropdown do catálogo real, exibindo "código - nome") + Descrição da Conta + Agência e Dígito
  + Conta e Dígito (ambos com **máscara progressiva dígitos+hífen**, formato exato dos exemplos
  do pedido: "1234-5"/"987654-1" — técnica nova, sem biblioteca externa, generalizável via
  `maskDigitsHyphen(input, maxBeforeHyphen)`) + Conta Financeira (Dropdown só das categorias
  ativas). Todos os 5 campos obrigatórios com validação visual (borda vermelha + mensagem),
  mesmo padrão exato de erro já usado em todo o sistema.
- **Migração da fonte do campo "Banco" de Caixa:** `bancos-data.js` (stub fixo criado numa
  rodada anterior, com o comentário explícito "simulando o que a futura tela real de
  Configuração > Conta bancária já teria cadastrado") foi substituído como fonte de
  `novo-lancamento-caixa.js`'s Dropdown "Banco" — agora popula a partir do catálogo REAL
  (`window.NiveloContasBancarias.list()`), com o mesmo contrato de antes (valor salvo continua
  sendo um texto descritivo, só a fonte mudou). `bancos-data.js` ficou órfão (não removido, sem
  pedido explícito pra isso, mesmo princípio já documentado pra `contas-pagar-data.js`'s
  `excluir()` órfã) — nenhum arquivo carrega mais esse script.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'config-conta-bancaria':
  'contas-bancarias.html'`) ativa a navegação real nas telas que já tinham o item de sidebar.
- **`prototype-nav/nav.config.js`:** novo épico "Contas Bancárias" (`type:'flow'`) dentro da
  Jornada · Configuração já existente, com as 2 telas + variante de edição e de listagem vazia.
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma
  conta bancária criada/editada/excluída só existe durante a sessão de JS daquela página — ao
  redirecionar pra `contas-bancarias.html`, o script daquela tela recarrega os dados seed do
  zero. O toast de sucesso aparece corretamente; a operação em si não persiste na listagem (mesmo
  comportamento de Categorias/Caixa/Contas a Pagar/Natureza da Operação).

Verificado ao vivo (via inspeção de DOM/JS, técnica já documentada em rounds anteriores pra
contornar a lentidão de composição do sandbox): listagem com os 4 registros seed + banco
resolvido do catálogo; busca por "sicredi" isolando a linha certa; ordenação por Descrição
funcionando; exclusão real (modal com mensagem correta, confirmação removendo o registro de
`NiveloContasBancarias.list()` e da tabela, toast exibido); formulário com Código
auto-incrementado corretamente (nunca reaproveita código excluído), os 2 Dropdowns populados
(10 bancos, só as 7 categorias ativas), máscara de Agência/Conta formatando exatamente como os
exemplos do pedido; validação bloqueando submit vazio nos 5 campos obrigatórios; submit válido
navegando de volta pra listagem; modo edição (`?codigo=2`) pré-preenchendo todos os campos
corretamente; nenhum erro de console em nenhuma das 2 telas.

## Ajustes 2026-08-04 (round 60) — Conta Financeira: cadastro/edição em modal + sidebar reordenada

- **Cadastro/edição deixou de navegar pra `nova-conta-financeira.html`** — "Nova Conta
  Financeira" e "Editar" agora abrem um Dialog reaproveitado (`#ctf-form-dialog-overlay` em
  `contas-financeiras.html`, mesmo padrão sm+Cancelar `secondaryGray`/Salvar `primary` já usado
  no modal de exclusão da mesma tela), com Código readonly auto-gerado + Nome — MESMA validação
  de antes (obrigatório + duplicidade ignorando maiúsculas/espaços), portada de
  `nova-conta-financeira.js` pro novo bloco em `contas-financeiras.js`. Salvar fecha o modal,
  re-renderiza a listagem a partir de `NiveloContasFinanceiras.list()` (sem reload de página) e
  mostra o toast de sucesso já existente. `nova-conta-financeira.html`/`.js`/`page-nova-conta-
  financeira.css` ficaram órfãos (mantidos, sem link algum apontando pra eles, mesmo princípio já
  documentado pra `bancos-data.js`/`contas-pagar-data.js`'s `excluir()`).
- **Sidebar: "Conta Financeira" agora vem ANTES de "Conta bancária"** (era o contrário desde o
  round 59) — reordenado nas 37 telas com shell completo via script Node (mass-edit por índice de
  string, não regex de substituição direta, porque a indentação entre os 2 botões não fazia parte
  do match de nenhum dos dois blocos).

Verificado ao vivo: modal abre com Código previewado (nextCodigo), bloqueia submit vazio,
bloqueia nome duplicado (case-insensitive) em modo Nova E Editar, Editar pré-preenche Nome com
Código travado, salvar atualiza a listagem/toast sem reload, Cancelar descarta sem alterar nada;
sidebar com Conta Financeira acima de Conta bancária confirmado via DOM; nenhum erro de console.

## Ajustes 2026-08-04 (round 61) — Nova jornada: Meus números do WhatsApp (Assistente IA)

Ativado o item de sidebar "Assistente IA > Meus números" (`data-nav="assistente-numeros"`,
stub visual desde a criação do shell — sem `NAV_DESTINATIONS`). Gerencia os números de WhatsApp
autorizados a conversar com o Assistente de IA (hoje: solicitar notas fiscais + registrar no
Caderno de Campo).

- **Arquivos novos:** `app/shared/whatsapp-numeros-data.js` (`window.NiveloWhatsappNumeros` —
  `list/findById/normalizeNumero/isNumeroDuplicado/formatNumero/nextId/add/remove`, número
  guardado normalizado `'+55' + DDD + número` só dígitos além do `+`); `app/screens/meus-
  numeros-whatsapp.html` + `page-meus-numeros-whatsapp.css` + `meus-numeros-whatsapp.js`.
- **Cadastro em MODAL, não página própria** (pedido explícito) — mesmo padrão de Conta
  Financeira (round 60): Dialog `sm`, campo único "Número de WhatsApp" com máscara
  `+55 (DDD) NNNNN-NNNN` (mesma técnica de `formatPhone()` já usada em Criar Conta/Novo
  Cadastro, com DDI 55 fixo), erro "só borda" (`.errorText`, sem fundo cobrindo o campo).
  Validação: obrigatório, formato (10 ou 11 dígitos após o DDI), duplicidade (compara pelo
  número normalizado, não pela máscara). Salvar fecha o modal, re-renderiza a lista (sem
  reload) e mostra o toast "Número de WhatsApp adicionado com sucesso.".
- **Listagem é uma LISTA, não tabela** (pedido explícito): cada item = ícone do WhatsApp
  (mesmo SVG inline já usado no item "Suporte" da Sidebar, círculo verde
  `--color-status-success-bg`/`-fg`) + número formatado + ícone de lixeira. Remover abre modal
  de confirmação (`.secondaryGray`+`.destructive`, mesmo padrão de todo o sistema) com a
  mensagem exata pedida; confirmar remove de verdade, re-renderiza e mostra
  "Número removido com sucesso.".
- **Integração real com WhatsApp (mensagem de boas-vindas) — fora de escopo de implementação
  real, por não haver backend neste protótipo.** `simulateWelcomeMessage()` em
  `meus-numeros-whatsapp.js` documenta a integração esperada em produção (disparo único, no
  momento do cadastro) e só loga a mensagem via `console.info` — nenhuma chamada de rede.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'assistente-numeros':
  'meus-numeros-whatsapp.html'`) ativa a navegação real nas telas que já tinham o item de
  sidebar. **`prototype-nav/nav.config.js`:** novo item leaf dentro da Jornada · Sistema.
- **Banco de dados** (fora do escopo real deste protótipo estático, sem backend): a tabela
  descrita no pedido (`id/account_id/numero/created_at/updated_at` + índice único por conta)
  está documentada aqui como referência de arquitetura futura — o módulo de dados já modela o
  equivalente (`id/numero/createdAt/updatedAt` + `isNumeroDuplicado()` fazendo o papel do
  índice único, escopado à conta implícita do protótipo, que só tem uma).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, um
  número adicionado/removido só existe durante a sessão de JS desta página (não navega pra
  nenhuma outra tela, então não há perda perceptível de estado durante o uso normal).

Verificado ao vivo: modal abre com máscara `+55 (DDD) NNNNN-NNNN` formatando ao digitar;
bloqueia vazio, formato inválido e duplicado (mesmo com máscara diferente da já cadastrada);
salvar adiciona à lista sem reload + toast exato; remover abre confirmação com a mensagem exata
pedida, confirmar remove sem reload + toast exato; item de sidebar presente/navegável; nenhum
erro de console.

## Ajustes 2026-08-04 (round 62) — Navegador de Protótipos: remoções + variantes de
Contas a Pagar/Receber no Estoque

Pedido escopado exclusivamente ao `prototype-nav/nav.config.js` (organização de thumbnails),
não à interface do produto — 2 itens eram só reorganização, os outros 2 exigiram construir
funcionalidade nova, confirmada com o usuário antes de codar.

- **Removido thumbnail "Interface principal"** (`sistema` journey) — tela de referência do
  Shell (Header+Sidebar) migrado pro Storybook desde o round 8, sem mais uso real como demo.
- **Removida a variante "Visualizar (CTP-0001)"** do épico Contas a Pagar (`nova-conta-pagar`
  screen) — só a variante "Editar" permanece.
- **Nova funcionalidade real (não existia): "Criar conta a receber?" após Registrar saída**
  (Estoque > Vendas), mirror exato de "Criar conta a pagar?" (Compras/Manual, round 47/48) —
  pergunta contextual DEPOIS da saída confirmada, nunca um campo dentro do modal de saída em
  si. Novo módulo `app/shared/contas-receber-data.js` (`window.NiveloContasReceber` —
  `list/nextCodigo/add`, deliberadamente mínimo, sem tela própria de listagem, código
  `CTR-NNNN`). Novo modal `#criar-conta-receber-overlay` em `estoque.html` (Meio de
  Recebimento — reaproveita `NiveloFormasPagamento` — + Vencimento + Categoria, só as
  `grupo==='receita'` ativas). `estoque.js`: `abrirCriarContaReceberModal()`/
  `finalizarContaReceber()`, encadeado depois da mutação real de `record.quantidade`/
  `historico` no confirm de "Registrar saída" (Cliente/Valor/Histórico já vêm resolvidos da
  saída — Destinatário/Quantidade/Preço). Toast final soma "Conta a receber criada." quando
  aplicável, mesmo padrão de `redirectAfterSave()` de `novo-estoque.js`.
- **Estado de demonstração aditivo `#state=contareceber`** em `estoque.js` — simula uma
  Registrar saída válida (1º registro de Vendas) e a confirma de verdade via
  `saidaConfirmBtn.click()`, chegando ao modal novo sem interação manual. Mesmo estado
  `#state=contapagar` adicionado em `novo-estoque.js` (seleciona Compras, preenche
  Produto/Quantidade/Valor/Fornecedor, `form.dispatchEvent('submit')` de verdade) — os dois
  seguem o mecanismo `#state=` já estabelecido (ex. XML carregando/erro/pesado), só alcançável
  via prototype-nav, nunca pela navegação normal do usuário.
- **`nav.config.js`:** os 2 novos estados entraram como VARIANTE (não como thumbnail padrão)
  dos screens já existentes — `estoque-listagem` ("Estoque", padrão inalterado) ganhou a
  variante "Estoque de Vendas · Criar conta a receber?"; `estoque-novo-lancamento` ("Novo
  registo de estoque", padrão inalterado) ganhou a variante "Estoque · Criar conta a pagar?".
  **Correção de um ajuste anterior no mesmo round:** a primeira versão desta rodada tinha
  trocado o `desktop:` PADRÃO de cada screen pro novo estado (relegando a listagem/formulário
  normal a variante "(padrão)") — invertido depois, por pedido explícito do usuário, pra
  manter o thumbnail principal sempre a tela normal, com o fluxo de Contas a Pagar/Receber
  como mais uma opção dentro do mesmo screen.
- **Contas a Receber como jornada própria (com listagem/edição) continua fora de escopo** —
  só o vínculo Estoque→Contas a Receber foi pedido nesta rodada, mesmo raciocínio já aplicado
  à Conta Financeira (round 59) e ao DRE (Relatórios, round 53).

Verificado ao vivo: `novo-estoque.html#state=contapagar` abre "Criar conta a pagar?" direto no
load; `estoque.html#state=contareceber` abre "Criar conta a receber?" direto no load; modal
bloqueia submit vazio (Meio/Vencimento/Categoria) e cria a conta de verdade com valor calculado
corretamente (quantidade × preço) quando confirmado; "Não, obrigado" pula sem criar nada e sem
mencionar "conta a receber" no toast; navegador de protótipos sem "Interface principal" e sem
"Visualizar (CTP-0001)", com os 2 novos rótulos visíveis; nenhum erro de console em nenhuma
tela tocada.

## Ajustes 2026-08-04 (round 63) — Navegador de Protótipos: nova Jornada · Assistente IA +
Nota para desenvolvimento em Meus números do WhatsApp

- **`nav.config.js`:** "Meus números do WhatsApp" saiu da Jornada · Sistema e passou a ser o
  único screen de uma nova journey própria, "Jornada · Assistente IA" — reorganização só do
  navegador de protótipos, nenhuma tela/arquivo do produto tocado por este item.
- **Nota para desenvolvimento** adicionada em `meus-numeros-whatsapp.html`, mesmo padrão exato
  já usado em `cadastro-planos.html` (`.dev-note`/`.dev-note-tag`/`.dev-note-text`, controlado
  por `dev-notes.js` via classe `dev-notes-on` no `<html>`, flag em `localStorage` ligada pelo
  toggle do navegador de protótipos) — CSS copiado pra `page-meus-numeros-whatsapp.css` (esta
  tela não carrega `page-cadastro.css`) e o script `dev-notes.js` incluído. Conteúdo: texto
  exato pedido sobre a integração de boas-vindas via WhatsApp (disparo único, no cadastro do
  número) + a mensagem enviada, ipsis litteris. Escondida por padrão, só aparece com "Notas
  para desenvolvimento" habilitado — nunca faz parte da interface do produto final.

Verificado ao vivo: nova journey "Jornada · Assistente IA" presente no DOM do navegador de
protótipos com o thumbnail "Meus números do WhatsApp"; nota com `display:none` por padrão e
`display:block` com a classe `dev-notes-on`, texto completo correto; nenhum erro de console.

## Ajustes 2026-08-04 (round 64) — Menu lateral: "Vendas"→"Fiscal" + Nova jornada: Manifesto

- **Sidebar renomeada:** o grupo "Vendas" (id interno `group-vendas` preservado, só o texto
  visível mudou) virou **"Fiscal"** — removida a opção "Pedidos de venda" (`vendas-pedidos`,
  stub sem destino desde a criação do shell) e adicionada **"Manifesto"**
  (`data-nav="fiscal-manifesto"`, ícone `truck`) logo depois de "Notas fiscais". Mass-edit via
  script Node em 37 telas + 2 correções manuais (`notas-fiscais.html`/`nova-nota-fiscal.html`,
  que tinham o grupo com `is-open`/`aria-expanded="true"` e por isso não bateram com o regex do
  script). **Nota:** já existe um subgrupo "Fiscal" dentro de Configuração (Natureza da
  operação/Certificado digital) — são 2 itens de nomes iguais em níveis de hierarquia
  diferentes (grupo de topo vs. subgrupo de Configuração), decisão deliberada seguindo a
  instrução explícita do pedido, sem inventar um nome alternativo.
- **Novo módulo Manifesto**, mesmo padrão estrutural/visual de Notas Fiscais (listagem +
  criação/edição/visualização numa única tela via `?numero=&modo=ver|corrigir`):
  - `app/shared/manifestos-data.js` (`window.NiveloManifestos` — `list/findByNumero/
    nextNumero/add/update/cancelar`, código `MAN-NNNN`). Emitente NUNCA é persistido no
    registro — sempre lido de `window.NiveloEmitente` (mesma decisão de Nova Nota Fiscal).
  - `app/screens/manifestos.html` + `page-manifestos.css` + `manifestos.js` (listagem: busca
    por número/motorista/placa, ordenação, paginação 10/página, Cards no mobile, badge de
    Status, Ver detalhes sempre + Editar/Cancelar condicionais a `status !== 'cancelado'`,
    modal de confirmação de cancelamento — mesmo padrão de Contas a Pagar/Notas Fiscais).
  - `app/screens/novo-manifesto.html` + `page-novo-manifesto.css` + `novo-manifesto.js`
    (formulário único-card-várias-subseções, mesmo padrão de Nova Nota Fiscal/Novo Cadastro):
    Emitente (readonly, auto) · Veículos (Placa 1 obrigatória + Placa 2/3 opcionais,
    maiúsculas/alfanumérico) · Motorista (Nome+CPF/CNPJ, documento único com máscara
    auto-detectada por tamanho — CPF até 11 dígitos, CNPJ a partir do 12º — sem seletor de
    tipo, já que o pedido não previu um) + Endereço completo (CEP/Logradouro/Número/
    Complemento opcional/Bairro/Cidade/Estado, com autofill via ViaCEP, mesma lógica exata de
    `cadastro-endereco.js`/`nova-fazenda.js`) · Origem/Destino (Cidade+Estado) · Documentos da
    Carga (repeater em memória — Chave da NF/Origem/Destino por item, "Documento N" + remover
    só quando há mais de 1, mesmo raciocínio do repeater de Itens de Nova Nota Fiscal) ·
    Seguro da Carga — **único grupo opcional do formulário**, sem nenhuma validação, só
    persistido (`seguro: {...}` ou `null`) se ao menos um campo foi preenchido · Pagamento do
    Frete (CPF/CNPJ do responsável + Dados bancários/PIX, ambos obrigatórios).
  - `modo=ver`: todos os inputs desabilitados, botão "Adicionar documento" e Salvar escondidos,
    "Voltar" no lugar de Cancelar — mesmo padrão de Nova Conta a Pagar. `modo=corrigir`:
    totalmente editável, título "Editar Manifesto", submit "Salvar alterações",
    `NiveloManifestos.update()` reaproveita o mesmo número (mesma conta do manifesto, não um
    novo registro).
  - **Contas a Receber como jornada própria não foi construída** (fora de escopo deste
    pedido) — só o módulo de Manifesto em si.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'fiscal-manifesto':
  'manifestos.html'`) ativa a navegação real em todas as 38 telas que já tinham o item de
  sidebar. **`prototype-nav/nav.config.js`:** journey "Jornada · Vendas" renomeada pra
  "Jornada · Fiscal" (mesmo id interno `vendas`), com 2 novos screens (`manifestos`/
  `novo-manifesto`, este com variantes Ver detalhes/Editar usando `MAN-0001`).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, um
  manifesto criado/editado/cancelado só existe durante a sessão de JS daquela página — ao
  redirecionar pra `manifestos.html`, o script daquela tela recarrega os dados seed do zero.

Verificado ao vivo: listagem com os 3 manifestos seed (ordenação/badge/ações condicionais
corretos); criação bloqueando submit vazio (Placa 1/Motorista/Endereço/Documentos/Pagamento) e
salvando de verdade com `add()` quando válido (máscaras de placa/CPF conferidas); `modo=ver`
com todos os campos travados e Salvar/Adicionar documento escondidos; `modo=corrigir` editável
com os documentos pré-carregados (2 documentos do MAN-0003) e remoção de documento funcionando;
modal de Cancelar atualizando status/ações sem reload; sidebar com "Fiscal"/"Manifesto"
presentes e "Pedidos de venda" removido em telas não tocadas diretamente (ex. `dashboard.html`,
confirmando o mass-edit); navegador de protótipos com "Jornada · Fiscal"/"Manifestos"/"Novo
manifesto"; nenhum erro de console em nenhuma tela tocada.

## Ajustes 2026-08-04 (round 65) — Nova jornada: Contas a Receber (Financeiro)

Ativado o item de sidebar "Financeiro > Contas a receber" (`data-nav="financeiro-receber"`, stub
visual desde a criação do shell — sem `NAV_DESTINATIONS`, referenciado até aqui só pela
integração mínima Estoque > Vendas > Registrar saída → "Criar conta a receber?", round 62).
Pedido explícito do usuário: "seguindo o mesmo padrão visual, arquitetural e de usabilidade já
utilizado em Contas a Pagar" — módulo construído como espelho estrutural de Contas a Pagar
(round 45+), com as adaptações literais pedidas no spec (Cliente em vez de Fornecedor, Forma de
Recebimento própria, Ocorrência com geração automática de lançamentos futuros).

- **Arquivos novos:** `app/screens/contas-a-receber.html` + `app/shared/page-contas-a-receber.css`
  + `app/shared/contas-a-receber.js` (listagem); `app/screens/nova-conta-receber.html` +
  `app/shared/page-nova-conta-receber.css` + `app/shared/nova-conta-receber.js` (criação/edição/
  visualização via `?codigo=&modo=ver|editar`); `app/screens/detalhe-conta-receber.html` +
  `app/shared/page-detalhe-conta-receber.css` + `app/shared/detalhe-conta-receber.js` ("Ver
  detalhes", padrão dominante do sistema — nunca reaproveitar o form em modo disabled); 1 novo
  módulo de dados `app/shared/formas-recebimento-data.js` (`window.NiveloFormasRecebimento` —
  catálogo PRÓPRIO, distinto de `formas-pagamento-data.js`: Dinheiro/Cartão de Débito/Cartão de
  Crédito/Boleto/PIX/**Grão**, este último sem equivalente em Pagar, pedido explícito do spec).
- **`app/shared/contas-receber-data.js` reescrito por completo** — a versão anterior (round 62)
  era deliberadamente mínima (só `list/nextCodigo/add`, sem tela própria, criada só pra alimentar
  o modal "Criar conta a receber?" de Estoque). Agora é o catálogo central completo
  (`window.NiveloContasReceber` — `list/findByCodigo/nextCodigo/add/update/registrarRecebimento/
  cancelar`, mesma arquitetura de `contas-pagar-data.js`: `TODAY` fixo, auto-flip pra "atrasada"
  recalculado a cada `list()`, saldo/recebido/status por lançamento, sem persistência entre
  páginas). Consumidores existentes (`estoque.js`'s `finalizarContaReceber()`) migrados pro novo
  contrato de campos (`formaRecebimentoCodigo/Nome` no lugar de `meioRecebimentoCodigo/Nome`,
  fonte do dropdown migrada de `NiveloFormasPagamento` pra `NiveloFormasRecebimento`) —
  `estoque.html` trocou o `<script>` de `formas-pagamento-data.js` por `formas-recebimento-data.js`.
- **Recorrência gera lançamentos futuros automaticamente** (diferença real vs. Contas a Pagar,
  onde só "Parcelada" gera múltiplos registros — aqui o pedido foi explícito: "As recorrências
  devem gerar automaticamente os lançamentos futuros conforme a periodicidade escolhida").
  `contas-receber-data.js`'s `add()`: Ocorrência "Parcelada" continua dividindo o valor total
  entre N parcelas (campo "Nº de Parcelas", mesmo algoritmo de Pagar); qualquer OUTRA ocorrência
  recorrente (Semanal/Quinzenal/Mensal/Semestral/Anual) gera uma quantidade FIXA de 12 lançamentos
  futuros (`RECORRENCIA_COUNT`), cada um com o valor INTEGRAL informado (nunca dividido — é uma
  cobrança nova a cada período, não uma parcela de uma soma) — decisão de escopo documentada no
  código, já que o pedido não especificou uma data-limite/quantidade (impraticável gerar
  "para sempre" num protótipo estático sem cron). Vencimento calculado por tipo de intervalo
  (Semanal +7 dias/Quinzenal +15 dias por ocorrência; Mensal/Semestral/Anual por
  incremento de 1/6/12 meses com `diaVencimento` aplicando clamp pro último dia do mês, mesma
  técnica de Pagar); Data de Emissão de cada ocorrência gerada mantém o mesmo intervalo em dias
  da 1ª ocorrência. Todos os lançamentos do mesmo grupo (parcelados ou recorrentes) mostram
  "Parcela N/M" na listagem/detalhe, mesmo tratamento visual dos dois casos.
- **"Dia do Vencimento" só aparece quando Ocorrência ≠ Única** (pedido explícito, diferente de
  Pagar, onde o campo é sempre visível) — `nova-conta-receber.js` alterna `hidden` no `onChange`
  do dropdown de Ocorrência.
- **Cliente em vez de Fornecedor:** dropdown lê `window.NiveloCadastros.findByTipo('cliente')`
  (catálogo já existente, mesmo usado por Caixa/combinado com fornecedor) + item fixo
  "+ Cadastrar novo cliente" (mesmo padrão do atalho "+ Cadastrar novo fornecedor" de Pagar).
  **`novo-cadastro.js` generalizado** pra suportar os dois atalhos: o que antes era um `if
  (returnTarget === 'nova-conta-pagar')` hardcoded virou um mapa `RETURN_TARGETS` (tela de
  origem + chave de sessionStorage), sem duplicar a lógica de rascunho/persistência/retorno.
- **Sem campo Competência** (existe em Contas a Pagar, mas não foi pedido na tabela de campos de
  Contas a Receber) — formulário fiel ao spec literal: Código/Cliente/Vencimento/Valor/Data de
  Emissão/Nº Documento (opcional)/Histórico/Categoria/Forma de Recebimento/Ocorrência
  (+ Nº de Parcelas/Dia do Vencimento condicionais).
- **Listagem:** busca (Cliente/Nº Documento/Histórico) + Agrupamento de Filtros com **Categoria
  em múltipla escolha** (`initMultiDropdown()`, novo — checkbox por opção, menu fica aberto entre
  seleções, só fecha em clique-fora/Esc/no trigger — único filtro desta tela com "uma ou mais
  opções", pedido explícito; Forma de Recebimento e Status continuam seleção única, mesmo padrão
  de Pagar) + tabela com as 9 colunas exatas do pedido (Cliente/Nº Documento/Histórico/
  Vencimento/Valor/Data de Emissão/Categoria/Status/Ações — sem Saldo/Pago, que Pagar tem mas
  não foi pedido aqui) + paginação real (10/página) + Cards no mobile + KPIs no topo (Total a
  receber/Vencido/Vence hoje/Próximos vencimentos, cópia estrutural exata do padrão de Pagar,
  aplicado mesmo sem pedido explícito, por ser parte da "mesma arquitetura").
- **Ações da tabela além do mínimo pedido (Visualizar/Editar/Cancelar):** "Registrar recebimento"
  também foi incluída (mesmo padrão de "Registrar pagamento" de Pagar) — sem ela não haveria
  nenhum caminho de UI pra uma conta chegar ao status "Recebida" (presente no filtro de Status
  pedido explicitamente), então a ação é necessária pra essa dimensão do pedido funcionar de
  verdade, não uma extrapolação de escopo.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'financeiro-receber':
  'contas-a-receber.html'`) ativa a navegação real em todas as telas que já tinham o item de
  sidebar (nenhuma precisou de mass-edit, o item já existia). **`prototype-nav/nav.config.js`:**
  novo épico "Contas a receber" (`type:'flow'`) dentro da Jornada · Financeiro, entre "Contas a
  pagar" e "Relatórios" — mesmo padrão dos épicos já existentes.
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma
  conta criada/editada/recebida/cancelada só existe durante a sessão de JS daquela página — ao
  redirecionar pra `contas-a-receber.html`, o script daquela tela recarrega os dados seed do
  zero. O toast de sucesso aparece corretamente; a operação em si não persiste na listagem.

Verificado ao vivo: listagem com os 8 registros seed (status/badges/KPIs corretos, incl.
"Parcela 2/12" e "Parcela 3/4"); filtro multi-seleção de Categoria isolando corretamente mais de
uma categoria ao mesmo tempo, recalculando KPIs; geração de recorrência testada via `add()`
direto (mensal: 12 lançamentos com valor integral e vencimento/emissão corretos; parcelada:
divisão de valor com resto na última parcela; semanal: incremento de 7 dias) — lógica de negócio
confirmada correta antes mesmo da UI; `modo=ver` com todos os campos desabilitados, Dia do
Vencimento aparecendo corretamente pra uma conta com Ocorrência≠Única, submit escondido; estado
"não encontrada" do detalhe sem vazar o botão de ação contextual (guard `.btn[hidden]`
confirmado); nenhum erro de console em nenhuma das 3 telas novas.

## Ajustes 2026-08-04 (round 66) — Relatórios: tela de Balancete (geração + visualização)

Primeiro fluxo real dentro de Relatórios (os outros 3 cards — LCDPR/DRE/Entradas e saídas —
continuam só entrada, sem tela própria). `relatorios.js`: clique no card "Balancete" navega de
verdade pra `balancete.html` (só esse `data-report`; os outros 3 continuam com o flash-disable).

- **Arquivos novos:** `app/screens/balancete.html` + `app/shared/page-balancete.css` +
  `app/shared/balancete.js`. Sem módulo de dados próprio — o Balancete é uma AGREGAÇÃO em tempo
  real de `window.NiveloCaixa` (lançamentos) por `window.NiveloCategoriasFinanceiras`
  (receita/despesa), filtrável por `window.NiveloContasFinanceiras` (campo "Conta").
- **Fluxo sem navegação:** "Gerar relatório" nunca troca de página — monta o resultado abaixo
  dos filtros e recolhe automaticamente o card de Filtros (substituído por "Exibir filtros").
  Alterar qualquer filtro exige clicar em "Gerar relatório" de novo (pedido explícito, sem
  atualização automática/reativa).
- **Filtros:** Tipo de período (RadioButton Mês/Intervalo personalizado, mesmo componente já
  usado em "Forma de entrada" de Estoque) — Mês revela `<input type="month">`, Intervalo revela
  Data inicial/final (`type="date"`); Conta e Categoria como **select pesquisável** (`
  initSearchSelect()`, novo padrão no sistema — nenhuma tela tinha um dropdown com campo de busca
  DENTRO do menu + opção fixa "Todas as X" no topo; o combobox de Produto em Estoque é pesquisável
  mas sem essa opção fixa, e os Dropdowns de filtro do resto do sistema têm "Todas as X" mas sem
  busca — este é a fusão dos dois padrões, construído do zero); Agrupamento (Dropdown simples:
  Automática/Por dia/Por semana/Por mês).
- **Agrupamento "Automática":** heurística simples (`chooseAgrupamento()`) — período ≤31 dias
  vira "Por dia", ≤180 dias "Por semana", acima disso "Por mês". Colunas da tabela/gráfico são
  geradas conforme o agrupamento resolvido (`buildColumns()`), com rótulo "01/02/03" (dia),
  "Semana 1/2/3" (semana) ou "Jan/Fev/Mar" (mês) — exatamente os exemplos do pedido.
- **Tabela matricial — 1ª coluna (Categoria) sticky à ESQUERDA**, padrão novo no sistema (o único
  precedente de sticky era a coluna Ações à DIREITA em Contas a Pagar/Receber/Categorias). Nunca
  vira Cards no mobile (pedido explícito, é uma matriz financeira) — rolagem horizontal via
  `overflow-x:auto` do `.tableWrap` já existente. Estrutura de linhas: Entradas (nível 0,
  expansível) → Receitas (nível 1, expansível) → categorias de receita (nível 2, folha) / Saídas
  (nível 0) → Despesas (nível 1) → categorias de despesa (nível 2) / Resultado (nível 0, nunca
  recolhível) → Total de entradas/Total de saídas/Saldo do período (destaque visual próprio,
  `.bal-row-resultado`/`.bal-row-saldo`). Expandir/recolher implementado em JS puro (`
  collapsedGroups` + `data-parent-group` por linha, sem componente Accordion — não existe
  precedente de "accordion de linhas de tabela" no sistema, e o `Accordion.module.css` do
  Storybook não se aplica a `<tr>`). Valores sem centavos (`formatInt()`, separador de milhar
  pt-BR) — legibilidade em matriz com muitas colunas, mesma decisão documentada no código.
- **Gráfico de barras — construído do zero em SVG puro**, sem lib nenhuma (não existia NENHUM
  gráfico de dados real no projeto até agora — só uma barra de progresso estática no Dashboard).
  Barras agrupadas Entradas (verde)/Saídas (vermelho) por coluna, escala automática pelo maior
  valor do período, rótulos do eixo amostrados (nunca mais que ~12 rótulos, pra não empilhar
  texto em períodos diários longos). Altura do container reduzida no mobile (220px → 140px,
  `@media max-width:767px`) — pedido explícito de ocupar menos espaço vertical.
- **KPIs** (Total de entradas/Total de saídas/Saldo do período): mesma cópia estrutural exata do
  padrão de card de resumo já usado em Estoque/Caixa/Contas a Pagar/Receber (tamanho fixo
  12px/24px em qualquer largura), com cor semântica (verde/vermelho) nos 3 valores.
- **Exportar PDF/Excel/Imprimir:** sem Compartilhar (pedido explícito). Nenhum dos 3 tem
  implementação real (sem lib de PDF/planilha neste protótipo estático) — mesmo flash-disable já
  usado em ações sem fluxo real pronto em outras telas.
- **`prototype-nav/nav.config.js`:** novo item leaf "Balancete" na journey "Jornada · Financeiro"
  já existente, logo após "Relatórios".
- **Mesma limitação de sempre:** sem `localStorage`, o relatório é sempre recalculado a partir
  dos dados seed de `caixa-data.js` — nenhum lançamento criado em outra sessão de JS aparece aqui.

Verificado ao vivo: geração com filtros padrão (mês 07/2026, agrupamento automático → resolvido
pra "Por dia", 31 colunas) reproduzindo exatamente a soma dos 14 lançamentos seed (Total de
entradas R$ 102.200,00/Total de saídas R$ 42.239,00/Saldo R$ 59.961,00); filtros recolhem depois
de gerar, "Exibir filtros" reabre; alternar Tipo de período (Mês ⇄ Intervalo personalizado) troca
os campos corretamente; expandir/recolher grupo "Entradas" esconde Receitas + suas 2 categorias
(3 linhas), sem afetar Saídas; select pesquisável de Categoria abre com "Todas as categorias" +
lista completa; mobile (375px): tabela com scroll horizontal real (2804px de conteúdo em 342px
de viewport) e 1ª coluna confirmada `position:sticky;left:0` via `getComputedStyle`, gráfico com
140px de altura, filtros permanecem recolhidos; nenhum erro de console em nenhum estado testado.

## Ajustes 2026-08-04 (round 67) — Balancete: 2 bugs reais no radio "Tipo de período"

- **Radio "Mês"/"Intervalo personalizado" sem estado visual de selecionado.**
  `RadioButton.module.css` desenha a bolinha preenchida só via classe `.checked` no `<label
  class="option">` (não usa `:checked` do input nativo) — `balancete.js` nunca sincronizava essa
  classe, mesmo bug já documentado antes em outras telas (Estoque round 24, Natureza da Operação
  round 52) e recorrente porque cada tela reimplementa o grupo de radio na mão. Fix:
  `syncRadioChecked()` alterna `.checked` no `<label>` pai a cada `change` + uma vez no load.
- **Campos "Mês/Ano"/"Data inicial"/"Data final" invisíveis** (só o label aparecia, sem a caixa
  do input). Causa: `RadioButton.module.css`'s `.input{opacity:0;position:absolute;width:1px;
  height:1px}` (esconde o radio nativo) vazava pros `<input type="month">`/`<input type="date">`
  reais da mesma tela — colisão de classe `.input` já documentada dezenas de vezes neste projeto
  (Input×RadioButton/Input×Checkbox), só que faltava o fix preventivo nesta tela específica. Fix:
  `.input:not([type="radio"]){position:static;opacity:1;width:100%;height:auto}` em
  `page-balancete.css`.

Verificado ao vivo: radio marca visualmente ao clicar (bolinha azul preenchida); alternar Mês ⇄
Intervalo personalizado mostra/esconde os campos corretos, ambos com a caixa do input visível e
funcional; nenhum erro de console.

## Ajustes 2026-08-04 (round 68) — Padronização de calendário: 1 implementação única (dia + mês)

Pedido explícito do usuário: unificar os 2 padrões de calendário do sistema (dia único e mês/ano)
numa implementação só, promovida pro Storybook, repetida em todo o sistema — nunca mais uma
cópia por tela. Antes desta rodada, 4 telas tinham 4 cópias quase-idênticas (2 do calendário de
dia, 2 do de mês, com nomes de classe/função diferentes por arquivo — ver `app/rules.md`, seção
"DatePicker — padrão OFICIAL único de calendário do sistema" pra inventário completo e API).

- **Novo arquivo `app/shared/date-picker.js`**: `window.NiveloDatePicker.initDay(opts)`/
  `.initMonth(opts)`, única implementação a partir de agora — qualquer tela nova com campo de
  data/mês deve CHAMAR uma das 2 funções, nunca reimplementar o calendário na mão.
- **`Storybook-Nivelo/.../DatePicker/DatePicker.module.css`** ganhou as classes do modo mês
  (`dpTriggerRow`/`dpClearBtn`/`dpMonthGrid`/`dpMonth`/`dpMonthSelected`) + guard
  `.dpRoot.is-readonly` — essas classes existiam antes só como CSS de página com prefixo por
  tela (`ncp-competencia-*`/`nlc-competencia-*`), agora vivem no componente de verdade.
  `DatePicker.tsx` (React) não ganhou modo mês nesta rodada (as telas HTML não importam o `.tsx`,
  só o `.module.css` — mesma convenção de todo o resto do sistema).
- **4 sites migrados, cópias antigas removidas por completo:**
  - `novo-estoque.js` ("Data prevista de entrega") e `produtos.js` ("Atualizado a partir de") —
    cada uma tinha ~85 linhas de calendário de dia único, reduzidas a uma chamada de
    `initDay({...})`.
  - `nova-conta-pagar.js` e `novo-lancamento-caixa.js` ("Competência") — cada uma tinha ~95
    linhas de seletor de mês, reduzidas a uma chamada de `initMonth({...})`. HTML das 2 telas
    também migrado: classes `ncp-competencia-*`/`nlc-competencia-*` trocadas pelas genéricas
    `dpTriggerRow`/`dpClearBtn`/`dpMonthGrid`/`dpMonth`; CSS correspondente removido de
    `page-nova-conta-pagar.css`/`page-novo-lancamento-caixa.css` (vive só no componente agora).
  - `nova-conta-pagar.js` também precisou trocar `window.setCompetenciaValue`/
    `window.setCompetenciaReadonly` (globais) pelo handle retornado por `initMonth()`
    (`competenciaPicker.setValue()`/`.setReadonly()`) — API mais limpa, sem poluir `window`.
- **As 3 telas com calendário de INTERVALO de dias (Dashboard, Notas Fiscais, Caixa — filtro de
  Período) ficaram FORA de escopo desta rodada**, por instrução implícita do pedido (só "dia" e
  "mês" foram mencionados) — são um 3º padrão (range) com vocabulário de classe próprio
  (`dash-calendar-day`), não tocado.
- **`<script src="../shared/date-picker.js"></script>` adicionado nas 4 telas**, sempre antes do
  script da própria tela.

Verificado ao vivo (as 4 telas, via `javascript_tool` — sandbox sem composição de frame neste
round, contornado testando a lógica direto): Novo registo de estoque (Estoque Comprometido) abre
o calendário de dia, seleciona 15/08/2026 corretamente; Produtos abre o mesmo calendário no
filtro "Atualizado a partir de" dentro do Agrupamento de Filtros, seleciona dia 10 e atualiza o
texto/filtro; Nova Conta a Pagar abre o seletor de mês com as classes novas (`dpMonth`), seleciona
"Março de 2026", e o modo `?modo=editar` (CTP-0001) pré-preenche "Julho de 2026" via
`setValue()`; Novo Lançamento de Caixa abre o mesmo seletor de mês, seleciona "Junho de 2026";
zero erros de console em nenhuma das 4 telas.

## Ajustes 2026-08-04 (round 69) — Padronização de calendário: rollout completo em todo o sistema

O round 68 só migrou os 4 campos que JÁ tinham um calendário customizado antes (Data prevista de
entrega, Atualizado a partir de, Competência ×2). O usuário apontou que isso não bastava —
"quando precisar de dia" significa TODO campo de data do sistema, não só os que já tinham um
widget parecido. Auditoria encontrou **15 arquivos com 19 campos `<input type="date">`/
`type="month"` nativos** ainda fora do padrão (Vencimento/Data de Emissão em Contas a Pagar e
Contas a Receber, Data do pagamento/recebimento nas listagens e telas de detalhe, Data da saída/
consumo/abatimento em Estoque e seu detalhe, Vencimento nos modais "Criar conta a pagar/receber?",
Data em Incluir Lançamento de Caixa, Data inicial/final e Mês/Ano no Balancete).

- **Todos os 19 campos convertidos** para `window.NiveloDatePicker.initDay()`/`.initMonth()` —
  ver `app/rules.md`, seção "DatePicker — padrão OFICIAL único de calendário do sistema" pra
  lista completa e atualizada de sites.
- **Padrão de conversão usado em todos**: o `<input type="date">`/`type="month"` original vira
  um `<input type="hidden">` com o MESMO `id` (pro `initDay`'s `hiddenInputId`) — isso preserva
  100% do código de leitura (`campoInput.value`) já existente em cada arquivo sem precisar
  reescrever validação/payload/submit. Só as ESCRITAS (`campoInput.value = x`) precisaram trocar
  pra `picker.setValue(x)` (senão o trigger visual não atualiza, já que ele não é o mesmo
  elemento do `<input>`). Exceção: `balancete.js`'s `mesAnoInput` (modo mês não tem
  `hiddenInputId` na API) — trocado para `mesAnoPicker.getValue()` na leitura.
- **`nova-conta-pagar.js`/`nova-conta-receber.js`**: Vencimento/Data de Emissão ganharam pickers
  com `onChange` limpando o estado de erro (substituindo o antigo `addEventListener('input', ...)`
  nos inputs nativos, que não existe mais).
- **Arquivos "réplica" (mesmo id, mesmo markup, telas irmãs) migrados em par, sempre**:
  `contas-a-pagar.html`↔`detalhe-conta-pagar.html`, `contas-a-receber.html`↔
  `detalhe-conta-receber.html`, `estoque.html`↔`detalhe-estoque.html` (3 campos cada) — mesmo
  princípio de "réplica de markup+lógica" já documentado nesses módulos.
- **4 telas ganharam `DatePicker.module.css`/`date-picker.js` que não tinham antes**:
  `nova-conta-receber.html`, `contas-a-pagar.html`, `detalhe-conta-pagar.html`,
  `contas-a-receber.html`, `detalhe-conta-receber.html`, `estoque.html`, `detalhe-estoque.html`,
  `balancete.html` (alguns já tinham por outro motivo, ex. Competência).
- **Fora de escopo, confirmado de novo**: os 3 pickers de INTERVALO (Dashboard/Notas Fiscais/
  Caixa, filtro de Período — De/Até vinculados num só popover) continuam um 3º padrão
  (`dash-calendar-day`), não tocado — só "dia único" e "mês único" foram pedidos.

Verificado ao vivo (servidor `app-preview`, porta 8090): Balancete gera relatório com Mês/Ano via
picker de mês e reproduz os totais exatos de sempre; Nova Conta a Pagar seleciona Vencimento/
Emissão via calendário com hidden input sincronizado, e `?modo=editar` continua pré-preenchendo
corretamente; Estoque (`#state=contareceber`) e Novo Registo (`#state=contapagar`) abrem os
modais de conta a pagar/receber com o campo Vencimento funcionando (confirmado após entender que
uma "navegação" pro mesmo hash não recarrega a página de verdade — usado `location.reload()` pra
testar de fato); Detalhe de Conta a Pagar/Receber carregam sem erro; nenhum erro de console em
nenhuma das ~15 telas tocadas neste round.

## Storybook
Sempre usar `Storybook-Nivelo/` — nunca `Storybook/`.

**Text styles (2026-07-22):** `Storybook-Nivelo/src/tokens/typography.css` — classes `.text-*`
obrigatórias pra tipografia nova, ver `app/rules.md` ("Text styles"). **Antes de remover
font-size/weight de um `.module.css` component, rodar `grep "Componente.module.css" app/` —
Button/Table/Dropdown/Dialog/Tab/Feedback/Input/RadioButton são de CONSUMO DUPLO (também usados
como CSS cru em `app/screens/*.html`) e tiveram a tipografia mantida no CSS de propósito; só os
demais (AppHeader/Sidebar/SiteHeader/SiteFooter/Checkbox/Accordion/Tooltip/Breadcrumb/Toggle)
foram migrados de verdade.**

## Escopo
Esta pasta é separada de `landing/` de propósito: `landing/` é o site público (marketing,
one page). `app/` é a área logada do produto (Login, e futuramente Cadastro, Recuperar
senha, Dashboard, etc). Cada uma tem seu próprio `shared/` (fonts, CSS, ícones) — evite
referenciar arquivos de `landing/` a partir daqui (e vice-versa), mesmo que o conteúdo
pareça duplicado; são superfícies diferentes do produto.

## Behavior rules
- Mobile First sempre. Estilos base = mobile. Enhancements dentro de `@media (min-width: ...)`.
- Sem valores hardcoded. Usar `var(--token)` para cor, espaçamento, radius, shadow, fonte.
- Sem `<style>` inline no HTML. Sem `style=""`.
- Sem SVG inline. Ícones via Lucide (`data-lucide`).
- Sistema inteiro (fluxo de autenticação E shell principal/área logada): Light theme apenas,
  nunca `data-theme="dark"` no html. Ainda assim sempre construído só com tokens (nunca uma cor
  hardcoded) — não é "porque tem dark mode", é só a boa prática de sempre usar `var(--token)`.
- Copy: sem travessão (—). Usar ponto, vírgula ou dois-pontos.

## Reutilizar componentes do Storybook
Toda tela nova deve reaproveitar os componentes reais do Storybook-Nivelo (Button, Input,
Checkbox, Feedback, etc.) carregando o `.module.css` de cada um como stylesheet global e
replicando exatamente a estrutura de classes usada pelo componente React (ver `rules.md`
nesta pasta). Nunca recriar um componente que já existe — se faltar alguma variante, avisar
antes de estender o componente no Storybook.

## Adding a new screen
1. Ler `rules.md` (nesta pasta) pra checar componentes já mapeados.
2. Se faltar um componente, mostrar a spec pro usuário antes de criar.
3. CSS novo específico da tela vai em `shared/page-[tela].css` (ex: `page-login.css`), com bloco de comentário descrevendo a seção.
4. Depois de usar um componente novo do Storybook pela primeira vez, documentar a classe/API usada em `rules.md`.
5. Seguir a "Direção visual" abaixo — todas as telas do fluxo de autenticação (Login, Cadastro, Recuperar senha, Código de verificação, Criar nova senha) compartilham a mesma linguagem visual.

## Direção visual (fluxo de autenticação, atualizado 2026-07-20)
Identidade "SaaS premium": minimalista, clean, muito espaço em branco, boa hierarquia
tipográfica. Estabelecida em `app/shared/page-login.css`, replicar exatamente nas próximas
telas do fluxo (não é escolha por tela, é identidade compartilhada). Estado atual (fonte da
verdade é sempre o CSS — isto aqui é um resumo, releia o arquivo se algo parecer desatualizado):

- **Layout desktop (1024px+): duas colunas, compondo uma cena só.** Esquerda = `.login-panel`
  (~65% da largura, praticamente 100% da altura), imagem institucional (`gestão com
  nivelo.png`, ou equivalente por tela) cobrindo a coluna (`object-fit:cover`). Direita = card
  do formulário. **O card avança sobre a imagem** (`margin-left` negativo) — não são duas
  metades independentes, o card floating por cima é o que une a composição.
  - Card precisa de `position:relative;z-index:1` (senão o `.login-panel`, que é `position:
    relative` pros filhos absolutos dele, pinta por cima do card mesmo ele vindo depois no DOM
    — ver lição de stacking abaixo).
  - Card usa `width: clamp(420px, 40vw, 600px)` no desktop, NUNCA `width:100%`/só `max-width`:
    a coluna do formulário só tem ~35% da tela, então `100%` fica preso a essa faixa mesmo com
    `max-width` maior. `clamp()` com `vw` ignora o pai apertado.
  - Overlay da imagem (`.login-panel-overlay`) tem duas camadas: (1) fade longo e gradual
    (`color-mix(in srgb, var(--color-gray-50) N%, transparent)` em 5 estágios) dissolvendo a
    imagem na cor de fundo da página perto da borda direita, sem corte reto; (2) color grading
    `linear-gradient(160deg, rgba(3,13,32,0.10) 0%, rgba(18,68,154,0.07) 100%)` — mesma dupla
    de cor e ângulo do overlay do CTA final da Landing Page, só que numa fração da opacidade
    (lá precisa escurecer bastante pra legibilidade de texto branco; aqui só um grading sutil,
    a lavoura tem que continuar verde/realista).
  - Bloco institucional opcional sobre a imagem (`.login-panel-copy`): texto curto de reforço
    de marca, canto oposto ao card (evita colidir com a sobreposição), fundo translúcido +
    `backdrop-filter:blur()` (glassmorphism sutil), nunca mais chamativo que o formulário.
  - **Abaixo de 1024px o painel some inteiramente** (`.login-panel{display:none}`), single
    column com o card centralizado (768-1023px já usa esse tratamento, só o desktop largo
    ganha o painel).
- **Background da coluna do formulário:** nunca branco chapado. `.login-screen` (body) usa
  `--color-gray-50` como base + 1-2 radiais grandes e difusos em azul institucional
  (opacidade ~0.05–0.08). **Sempre o brand blue real (`#1752B0` / `--color-action-primary` /
  `rgba(23,82,176,...)`), nunca um hex à parte** mesmo que uma referência visual sugira outro
  tom — "sem hardcoded, sempre token" vale também pra overlay/gradiente.
- **Card:** `--color-bg-surface`, `--radius-lg` (24px — dentro de qualquer range 20-28px
  pedido, não existe token entre 24 e 32 então não invente um valor no meio). Sombra
  `--shadow-sm` (extremamente sutil — não usar shadow-md/lg/xl aqui). Borda discreta
  `1px solid var(--color-border-subtle)`.
- **Hierarquia tipográfica:** título > botão principal > formulário > logo, nessa ordem de
  atenção. Logo pequeno e com `opacity:0.92` (reforça marca sem competir), título no maior
  tamanho da tela (`font-size-4xl/5xl`), subtítulo reduzido (`font-size-md`, não
  `font-size-base` — é apoio, não corpo de texto normal) e aproximado do título
  (`spacing-sm`, título+subtítulo lêem como um par).
- **Sistema de espaçamento do formulário (não é um `gap` uniforme, é uma escala):**
  `.login-form` usa `gap: var(--spacing-md)` (16px) como base — isso já cobre input-a-input.
  Elementos que precisam de mais ou menos espaço usam `margin-top` pra somar/subtrair do gap
  base, nunca um valor solto:
  - Último input → bloco de opções (lembrar-me/esqueci senha): **8px** = gap(16) + `margin-top:
    calc(var(--spacing-sm) * -1)` no `.login-options`.
  - Bloco de opções → botão principal: **24px** = gap(16) + `margin-top: var(--spacing-sm)` no
    botão.
  - Botão → próximo elemento (ex.: link "Criar conta"): **24px** (`.login-signup{margin-top:
    var(--spacing-lg)}`).
  - **Botão × botão em sequência (quando houver, ex. Cancelar/Confirmar): 16px**
    (`--spacing-md`), não 24px — é a exceção à regra "depois de botão = 24px".
  - Regra geral: elementos do MESMO tipo/grupo (inputs entre si, botões entre si) ficam mais
    próximos (16px) pra ler como um conjunto (proximidade gestáltica); transições ENTRE grupos
    diferentes (campos → opções → ação) ganham mais respiro (8-24px conforme a relação).
- **Logo:** sempre `../../NIVELO azul header.svg` (não `Storybook-Nivelo/public/logo-azul.svg`
  — são arquivos diferentes; o header oficial é o da raiz do projeto).
- **Tipografia:** `--font-heading` pro título (h1), `--font-body` (herdado do body reset) pro
  resto — confirmado via `getComputedStyle` que renderiza "Helvetica Neue" de verdade, não um
  fallback do sistema.

### Lição de stacking (CSS) — vale pra qualquer card que sobreponha um elemento decorativo
Um elemento com `position` diferente de `static` SEMPRE pinta por cima de irmãos `static`,
**independente da ordem no DOM**. Se um card precisa sobrepor visualmente um painel/imagem
decorativa que já é `position:relative` (pra conter filhos absolutos), o card TAMBÉM precisa
de `position` (relative basta) + `z-index`, senão ele fica atrás mesmo vindo depois no HTML.

## File paths from `screens/*.html`
- Tokens: `../../Storybook-Nivelo/src/tokens/tokens.css`
- Componentes: `../../Storybook-Nivelo/src/components/[Name]/[Name].module.css`
- Fonts: `../shared/fonts.css`
- Layout/CSS da tela: `../shared/page-[tela].css`
- Logos: `../../Storybook-Nivelo/public/logo-azul.svg` | `logo-branco.svg` | `logo-preto.svg`

## Navegação (prototype-nav)
Toda tela criada aqui deve ser registrada em `../prototype-nav/nav.config.js` (jornada +
tela + variantes de estado), pra ficar navegável no navegador de protótipo. Ver
`../prototype-nav/nav.config.js` pra exemplos já existentes.

## Ajustes 2026-07-29 (round 31) — Detalhe da fazenda CADASTRAL: cards separados, tabela padrão, talhão Ativo/Inativo real

Ajuste pedido pelo usuário na tela cadastral (`fazenda-detalhe-cadastro.html`, Jornada Fazendas —
não confundir com a operacional do Caderno de Campo, ver round 30). Só esta tela foi tocada.

- **"Dados da fazenda" (1 card com 4 sub-grupos internos) virou 2 `.card` independentes**,
  mesmo padrão exato de `detalhe-estoque.html`/`.detalhe-estoque-fields` (cardHeader+`.title`
  próprio, um `dl` flat sem sub-título interno): **"Identificação da fazenda"** (Código, Nome,
  Proprietário, CNPJ, IE, Matrícula, Área total, Área de agricultura, + um segundo `dl`
  condicional de Arrendamento) e **"Localização"** (Endereço/Latitude/Longitude). Áreas e
  Arrendamento entraram no card de Identificação por não serem "localização" — decisão de
  design não literal no pedido, mas a única leitura que preserva os campos existentes sem
  inventar um 3º/4º card que o pedido não mencionou.
- **Bug real recorrente, pego de novo:** `.fazenda-cadastro-fields{display:grid}` (a classe do
  `dl` flat) não tinha guard nenhum — o `dl` de Arrendamento reaparecia mesmo com `hidden`
  quando a fazenda não tem arrendamento (São João), igual ao padrão já documentado várias vezes
  neste projeto. Fix: `#dados-arrendamento-group[hidden]{display:none}` por ID (bate a classe
  independente de ordem no arquivo).
- **"+ Novo talhão" virou small button** (`.btn.primary.sm.hasLeft`, ícone 16px) — não estica
  mais 100% no mobile (só os botões `md` de cabeçalho faziam isso; um `sm` esticado destoaria do
  uso de `sm` em toolbars/popovers no resto do sistema, sempre `auto`).
- **Coluna Código removida da tabela de Talhões.** Ficou só Talhão/Área (ha)/Status/Ações,
  exatamente como pedido. **Coluna Talhão vira "fill"**: sem `table-layout:fixed` (diferente de
  Produtos/Estoque/Cadastro, que continuam fixed — mudança local a esta tabela, não um novo
  padrão global), `width:100%`+`min-width:200px` na coluna Talhão, `width:1%`+`white-space:nowrap`
  nas outras 3 (truque padrão de shrink-to-content em tabela de layout automático). Testado sem
  scroll horizontal em 800px e 1024px de viewport.
- **Status do talhão: novo campo `ativo` (boolean) em `fazendas-data.js`, aditivo e
  INDEPENDENTE de `status`.** `status` (em-producao/disponivel/em-pousio) continua existindo
  exatamente como estava, só usado pela tela operacional (`fazenda-detalhe.js`) — não foi
  tocado. `ativo` é só lido/escrito pela tela cadastral, mapeado pro badge Ativo (success)/
  Inativo (warning), mesmo vocabulário Ativo/Inativo já usado em Cadastro
  (`cadastros.js`'s `ativo`/`inativo`). Um talhão pode estar "em pousio" (status) e "ativo"
  (cadastro) ao mesmo tempo — são conceitos diferentes por design.
- **Ações da tabela: Visualizar/Editar/Excluir (3 ícones) viraram 1 ação só** —
  Ativar/Desativar, real (não flash-disable): clicar altera `talhao.ativo` em memória e
  re-renderiza a linha/card, sem excluir o registro. Ícones `ban` (Desativar)/`check-circle`
  (Ativar), mesmo padrão de tooltip+ícone das outras tabelas do sistema.
- **Clicar na linha (ou no nome, no card mobile) abre "Editar talhão"** — preenchendo a lacuna
  deixada pela remoção de "Visualizar" ("as informações principais já ficam visíveis direto na
  tabela", conforme o próprio pedido). O botão de Ativar/Desativar tem `closest('.actionBtn')`
  checado ANTES da linha no handler de clique, pra não abrir o modal sem querer.
- **Modal único "Novo/Editar talhão"** (`#talhao-dialog-overlay`, reaproveitado pros dois casos —
  título/label do botão mudam via JS, os 3 campos são idênticos, então duplicar violaria a
  diretriz de não criar padrão paralelo): Nome (texto), Área (ha) (número), Status (Dropdown
  Ativo/Inativo, mesma estrutura de `.wrapper`/`.trigger`/`.menu` já usada em Novo produto).
  Segue a MESMA estrutura em Novo e Editar, como pedido. Salvar é real (não flash-disable): cria
  um novo objeto em `fazenda.talhoes` (Novo) ou atualiza o existente (Editar) e re-renderiza —
  não persiste entre reloads (mesmo princípio de todo o resto do protótipo). Validação mínima:
  Nome obrigatório, Área > 0.
- **2 bugs reais do padrão Dialog, pegos ao vivo (mesma causa-raiz documentada váras vezes):**
  `Dialog.module.css`'s `.overlay` e `Input.module.css`'s `.errorText` têm `display`
  incondicional — sem guard, o modal aparecia SEMPRE aberto (com a mensagem de erro do Nome
  também sempre visível) mesmo com os atributos `hidden` corretos no HTML. Fix, mesmo padrão já
  usado em `page-cadastros.css`/`page-estoque.css`/`page-dashboard.css`/`page-cadastro.css`:
  `.overlay[hidden]{display:none}` + `.errorText[hidden]{display:none}`.
  **Checklist reforçado:** qualquer tela nova que reutilize `Dialog.module.css`/
  `Input.module.css`'s `.errorText` via atributo `hidden` (em vez da técnica alternativa de
  `.wrapper.error .errorText` já usada em `page-estoque.css`) precisa dos dois overrides.
- Verificado ao vivo: São João (sem arrendamento, não vaza mais) e Santa Rita (com arrendamento,
  continua aparecendo) nos dois cards; toggle Ativar/Desativar real via clique (confirmado
  alterando o badge de Ativo→Inativo); Novo talhão cria uma linha nova de verdade (Talhão 09,
  7.5 ha); clicar na linha abre Editar talhão pré-preenchido; trocar o Status no modal e salvar
  reflete no badge/ação da linha; estado vazio e mobile (cards, sem coluna Código) OK; tabela sem
  scroll horizontal em 800/1024px. Tela operacional (`fazenda-detalhe.html`) e a Listagem de
  Fazendas não tiveram nenhum arquivo tocado nesta rodada, exceto o campo aditivo `ativo` em
  `fazendas-data.js`.

## Ajustes 2026-07-29 (round 32) — Talhões: tabela igual à de Estoque, Código de volta, Editar + toasts

Segundo round no mesmo dia na tela cadastral, complementar ao round 31. Pedido explícito:
tabela visualmente idêntica à de Estoque (não um padrão novo), trazer Código de volta
(auto-gerado), reintroduzir a ação Editar, e mensagens de sucesso pro fluxo inteiro.

- **Tabela de Talhões: cabeçalho/zebra/hover/bordas viraram cópia EXATA de
  `.estoque-table-card`** (`page-estoque.css`): `.th` com fundo Brand 50, texto Gray 600,
  Semibold, CAIXA ALTA, `letter-spacing:0.06em`, altura 32px; `.td` altura 44px, borda
  Gray 200; zebra branco (ímpar)/Gray 50 (par); hover só `filter:brightness(0.97)` (sem
  background próprio, herda do `.tr:hover .td` base do `Table.module.css`). Voltou a usar
  `table-layout:fixed` (a abordagem "shrink-to-content" do round 31, sem fixed, foi
  descartada) — Código 10%, Talhão 44%+`min-width:160px` (continua sendo a coluna "fill",
  só que agora via `%` como Estoque faz com sua maior coluna, não mais `width:100%` solto),
  Área (ha) 16%, Status 18%, Ações 120px fixo (mesma largura de Estoque pra 2 ícones — antes
  era só 1). Estoque não usa paginação, então nenhuma foi adicionada aqui.
- **Coluna Código de volta** (tabela + card mobile), gerada automaticamente
  (`nextCodigo(fazenda)`: pega o maior `codigo` numérico existente entre os talhões da
  fazenda, soma 1, zero-pad até 3 dígitos) — nunca preenchida pelo usuário, nem em Novo nem
  em Editar.
- **Ações: Editar voltou** (ícone `pencil`, sempre presente) + Ativar/Desativar (mesma
  lógica do round 31). **Removido o "clicar na linha/nome abre Editar" do round anterior** —
  agora só os 2 ícones de ação fazem algo, igual ao comportamento real de Estoque (linhas
  não são clicáveis por inteiro, só os ícones).
- **Modal de Editar talhão ganhou um campo Código**, só quando editando (`hidden` quando
  criando), sempre `disabled` — mostra o valor mas nunca é enviado como input do usuário.
  Mesma estrutura do modal de Novo talhão, como pedido ("mesma estrutura visual").
- **Toast de sucesso novo** (`Feedback.module.css` reaproveitado, mesma técnica de
  `cadastros.js`: `.alert.success` criado via JS, some sozinho em 6s ou no X) pros 3 fluxos:
  "Talhão cadastrado com sucesso." (Novo), "Talhão atualizado com sucesso." (Editar),
  "Talhão ativado/desativado com sucesso." (toggle) — cada um com uma linha de mensagem
  secundária citando o nome do talhão. Precisou da mesma correção de colisão de 3 vias
  (Feedback × Table × Dialog, os 3 carregados juntos nesta tela) já documentada em
  `page-cadastros.css`/`page-dashboard.css`.
- Verificado ao vivo: tabela sem scroll horizontal (891px de conteúdo em viewport 1280px,
  igual em 800px); Editar abre o modal com Código preenchido/desabilitado e "Editar talhão"
  no título; salvar edição atualiza a linha e mostra o toast certo; Novo talhão gera Código
  "009" (sequencial correto após 001-008) e mostra "Talhão cadastrado com sucesso."; toggle
  Ativar/Desativar muda o badge/ícone da linha e mostra o toast certo; toast confirmado via
  `getBoundingClientRect`/`getComputedStyle` (480px de largura, centralizado, fundo verde
  claro do `.alert.success`, `position:fixed`, `z-index:80`); mobile (cards) com Código+Área
  de volta e os 2 ícones de ação.

## Ajustes 2026-07-29 (round 33) — 3 ajustes pontuais e independentes

Pedido explícito de escopo restrito: só estes 3 pontos, sem tocar em mais nada.

- **Talhões: modal de confirmação pra Ativar/Desativar** (`fazenda-detalhe-cadastro.html`/.js).
  Clicar no ícone de ação não altera mais `t.ativo` direto — abre
  `#talhao-toggle-dialog-overlay` primeiro (mesma estrutura do modal "Excluir cadastro" de
  Cadastro: `.dialog.sm`, corpo com 1 parágrafo, rodapé Cancelar+confirmar). Desativar usa
  `.btn.destructive` (padrão visual destrutivo, igual "Excluir"); Ativar usa `.btn.primary`
  (padrão normal). Título/mensagem/classe do botão trocam via JS (`openToggleAtivoDialog`)
  conforme `t.ativo` no momento do clique. Só depois de confirmado é que `toggleAtivo(id)`
  roda de verdade e mostra o toast de sucesso já existente (comportamento mantido, só passou
  a exigir confirmação antes). Cancelar/fechar/clique fora/Esc não alteram nada.
- **Navegador de protótipo: épico "Fazendas" dentro da Jornada · Configuração**
  (`prototype-nav/nav.config.js`). Usa o mecanismo `type:'flow'` que já existia no config
  (mesmo usado por "Recuperar senha" dentro da Jornada · Login) — não é um padrão novo, só
  reaproveita o agrupamento que o `nav.js` já sabe renderizar (`buildFlowGroup`). Agrupa
  "Fazendas" (listagem) e "Detalhe de Fazenda" (renomeado de "Detalhe da fazenda
  (cadastral)" — o próprio agrupamento já desambigua da tela operacional, que continua
  numa jornada separada e não foi tocada). **Só a árvore do prototype-nav mudou** — a
  Sidebar real do produto (`interface-principal.js`/`NAV_DESTINATIONS`) não foi alterada.
- **Criar conta: help text no campo Telefone** (`cadastro.html`). `<span class="helperText">
  Enviaremos um código para validar este telefone.</span>` logo após o `.inputWrap`, antes
  do `.errorText` existente — mesmo padrão/classe já usado em vários campos de
  `novo-produto.html` (`.helperText`, `Input.module.css`), sem CSS novo.

Verificado ao vivo: modal de Desativar com botão vermelho, modal de Ativar com botão azul,
Cancelar não altera o status, Confirmar altera + mostra o toast certo; sidebar do
prototype-nav mostra o grupo "Fazendas" com as 2 telas aninhadas sob Configuração (a
operacional continua separada em Caderno de Campo); help text do Telefone visível abaixo do
campo em Criar conta, sem erros de console em nenhuma das 3 telas.

## Ajustes 2026-07-29 (round 34) — Copy do help text, padrão de Cancelar em modal destrutivo

Round bem pontual, 3 pedidos independentes.

- **Help text do Telefone (Criar conta)** atualizado pro texto exato pedido: "Ao clicar em
  Continuar, você receberá um código para validar este telefone." (`cadastro.html`).
- **Botão Cancelar do modal "Desativar talhão"** trocou de `.btn.secondary` (azul) pra um
  novo modificador `.secondaryGray` (outline Gray 700), igual ao Cancelar do modal "Excluir
  cadastro" de Cadastro.
- **`.secondaryGray` virou um modificador real do componente** (`Button.module.css`, ao lado
  de `.secondary`/`.destructive`), não mais um hack por ID — antes o Cancelar de "Excluir
  cadastro" só ficava cinza por causa de um override `#delete-dialog-cancel` isolado em
  `page-cadastros.css` (round 4). Esse override não foi tocado/removido (fora do escopo
  pedido), mas **`.secondaryGray` é agora o padrão oficial pra Cancelar em qualquer modal
  destrutivo novo do projeto** — usar `class="btn secondaryGray"` direto, sem precisar de
  CSS por ID de novo. `.destructive` continua sendo o botão de confirmação em todos.

Verificado ao vivo: help text exato no campo Telefone; modal de Desativar com Cancelar
cinza-outline + Desativar vermelho; Ativar continua com botão azul primário (só o Cancelar
mudou); nenhuma outra tela tocada.

## Ajustes 2026-07-29 (round 35) — Fluxo de Cadastro de Nova Fazenda (wizard 3 etapas)

Feature nova: `nova-fazenda.html` — wizard guiado (Dados da fazenda → Localização e áreas →
Talhões) acessado por "+ Nova fazenda"/"+ Cadastrar primeira fazenda" em `fazendas.html`
(antes flash-disable, agora navegação real).

- **Primeira tela do sistema com troca de etapa sem reload de página.** As 3
  `<section data-step-panel="N">` alternam via `hidden`, controlado por `goToStep()` em
  `nova-fazenda.js` — nenhuma outra tela usa esse padrão (o fluxo Criar conta é multi-página,
  com sessionStorage entre steps; aqui é tudo um objeto `wizardState` em memória, vivo só
  durante a página). Indicador de etapas: cópia exata das classes `.cadastro-steps`/
  `.cadastro-step*`/`.is-current`/`.is-complete` de `page-cadastro.css` (auth-only, não
  carregado aqui), copiada pra `page-nova-fazenda.css` — pedido explícito do usuário de usar
  "o mesmo step de cadastro de conta".
- **Etapa 1 (obrigatório: só Nome da Fazenda)**: Código readonly (preview cosmético, valor
  real gerado por `NiveloFazendas.add()`), Nome, Proprietário/CNPJ/IE/Matrícula opcionais.
  CNPJ com máscara (lógica isolada de `formatCNPJ` já usada em `novo-cadastro.js`).
- **Etapa 2 (tudo opcional)**: Localização da fazenda (Endereço/Latitude/Longitude — **sem
  seletor de mapa**, decisão confirmada com o usuário: não existe nenhum componente de mapa
  no protótipo, construir um agora seria escopo novo não pedido de forma explícita), Área da
  propriedade (Área total/Área de agricultura, ambas em ha), Arrendamento (só um campo Nome
  do arrendatário, opcional).
- **Etapa 3 (Talhões, totalmente opcional)**: lista simples de itens (não tabela — formato do
  exemplo do próprio pedido), "+ Adicionar talhão" abre um Dialog clonado do de
  `fazenda-detalhe-cadastro.js` (Nome/Área obrigatórios, Código auto-gerado, mesmo
  `initDropdown()` genérico), operando sobre `wizardState.talhoes` (array em memória, não a
  fazenda — que ainda não existe). **Status aqui tem 5 opções** (Disponível/Em produção/Em
  pousio/Arrendado/Inativo — `STATUS_TALHAO_WIZARD`), diferente do Ativo/Inativo (2 opções) de
  `fazenda-detalhe-cadastro.js`; cores dos badges (info/success/orange/indigo/warning)
  escolhidas pra não colidir com o `warning` já convencionado pra "Inativo" em `cadastros.js`.
  Editar/Remover cada item; Remover abre modal de confirmação destrutivo (mesmo padrão
  Cancelar `.secondaryGray` + Confirmar `.destructive` do round 34).
- **`NiveloFazendas.add(farm)`** (novo, `fazendas-data.js`): gera `id` via slug do nome
  (colisão resolvida com sufixo numérico) + `codigo` sequencial zero-padded (mesmo algoritmo
  de `nextCodigo()` de talhão). Aditivo — `list`/`findById` e os dados seed não mudaram.
- **Submit ("Cadastrar fazenda")**: monta o objeto fazenda completo (incl. `talhoes` já no
  formato usado por `fazenda-detalhe-cadastro.js`, com `ativo = status !== 'inativo'` pra
  manter os 2 campos, `status`/`ativo`, coerentes entre si), chama `NiveloFazendas.add()`,
  grava `sessionStorage.setItem('nivelo.novafazenda.success', ...)` e redireciona pra
  `fazenda-detalhe-cadastro.html#id=<novo-id>` — mesmo padrão de toast-via-sessionStorage já
  usado por `novo-produto.js → produtos.html`. `fazenda-detalhe-cadastro.js` agora lê essa
  flag no `boot()` e mostra o toast de sucesso (reaproveitando `showSuccessToast`, já
  existente nesse arquivo).
- **Limitação conhecida, não nova — mesma de todo o protótipo:** como nenhuma tela usa
  `localStorage` (decisão de projeto já documentada), uma fazenda criada aqui só existe
  durante a sessão de JS da própria `nova-fazenda.html`; ao navegar de verdade pra
  `fazenda-detalhe-cadastro.html`, o script daquela página recarrega os dados seed do zero e
  a fazenda recém-criada não é encontrada (mesmo comportamento, já presente, de
  `novo-produto.js → produtos.html` e de todo fluxo "criar X + redirecionar" do sistema —
  confirmado ao vivo comparando os dois fluxos). Não é um bug desta feature; corrigir isso
  exigiria uma camada de persistência real, contrariando a decisão explícita de não usar
  `localStorage` neste protótipo.
- **Fix corolário (necessário pra essa feature funcionar sem exibir dado quebrado):**
  fazendas criadas pelo wizard não coletam Cidade/Estado (fora do escopo pedido). Sem
  tratamento, o card de `fazendas.js` e o cabeçalho de `fazenda-detalhe-cadastro.js`
  mostrariam uma localização quebrada `", "`. Adicionado um helper `formatLocation(fazenda)`
  em cada um dos dois arquivos (omite a vírgula/mostra só o que existir) — puramente aditivo,
  fazendas existentes com cidade/estado completos continuam mostrando "Cidade, UF" igual
  antes (verificado ao vivo, sem regressão).

Registrado no `prototype-nav`: `nova-fazenda` como 3º item do épico "Fazendas" (mesmo grupo
`type:'flow'` de `fazendas-listagem` + `fazenda-detalhe-cadastro`).

Verificado ao vivo: Etapa 1 bloqueia sem Nome (erro visível) e libera com CNPJ mascarado;
avançar/voltar entre as 3 etapas preserva os dados digitados; Etapa 3 permite concluir vazia
E com talhões adicionados/editados/removidos (modal de confirmação de remoção funcionando);
submit chama `add()` com o shape correto (id/codigo/talhoes verificados via console);
`fazenda-detalhe-cadastro.html#id=sao-joao` (fazenda existente, com cidade/estado) sem
regressão após o fix de `formatLocation`; mobile (375px) sem overflow horizontal; nenhum erro
de console em nenhuma etapa.

## Ajustes 2026-07-29 (round 36) — Nova Fazenda: correções pontuais + fix do cadastro; Estoque: máscara + modal unificado

Round com 8 ajustes na tela `nova-fazenda.html` (a maioria correções sobre o round 35) + 2 ajustes
independentes em Estoque. Nenhuma outra tela/comportamento tocado.

**Nova Fazenda:**
- **Ordem Código/Nome**: já estava correta desde o round 35 (Código antes de Nome) — nenhuma
  mudança necessária, conferido no código antes de alterar.
- **Novos campos obrigatórios**: Proprietário, Inscrição Estadual, Matrícula (Etapa 1) e Área
  total (Etapa 2) — `errorText` + validação adicionados, mesmo padrão dos demais campos.
- **Help text no CNPJ**: "CNPJ do proprietário da fazenda." (`.helperText`, mesmo padrão do
  resto do sistema).
- **Endereço dividido em campos separados** — CEP/Rua/Número/Complemento(opcional)/Bairro/
  Cidade/Estado, **cópia exata do padrão e da lógica de `cadastro-endereco.html`/.js** (fluxo
  Criar conta): mesma máscara de CEP, mesmo autofill via ViaCEP (`fetch` público, preenche só
  campos vazios), mesmo uppercase automático em Estado. Novo `.nova-fazenda-field-row` em
  `page-nova-fazenda.css` (cópia de `.cadastro-field-row`, mesmo motivo de
  `.cadastro-steps` — arquivo de origem é auth-only). Endereço completo agora é composto
  (`composeEnderecoCompleto()`) a partir dos campos separados ao salvar. **Efeito colateral
  positivo**: a tela agora coleta Cidade/Estado de verdade (não existia no round 35), o que
  também resolve a base do problema que motivou o guard `formatLocation` adicionado naquele
  round (guard mantido mesmo assim, por segurança, pra fazendas com endereço vazio).
- **Máscara de Área (ha) no modal de talhão**: campo texto com máscara progressiva
  (milhar com ponto, decimal com vírgula — `formatAreaBRL`, mesma técnica de
  `formatCentavosBRL` do Estoque, sem o prefixo "R$" por não ser moeda).
  `talhao-area-input` virou `type="text"` (era `type="number"`).
  **Nota:** o item exibido na lista da Etapa 3 mostra a área com ponto decimal solto (`t.areaHa`
  interpolado cru, sem formatação pt-BR) — comportamento pré-existente do round 35, não
  alterado aqui (fora do escopo pedido, que era só a máscara de digitação).
- **Status do talhão voltou a Ativo/Inativo** (2 opções) — revertendo as 5 opções do round 35
  (Disponível/Em produção/Em pousio/Arrendado/Inativo, que foi pedido explicitamente
  desfeito). `STATUS_TALHAO_WIZARD` removido, substituído por `ATIVO_STATUS` (mesmo
  vocabulário/cores de `fazenda-detalhe-cadastro.js`: `true`→Ativo/success,
  `false`→Inativo/warning). Talhão do wizard agora usa campo `ativo` (boolean), igual à tela
  cadastral, em vez de `status` (string).
- **Fix do cadastro (bug real corrigido)**: antes, "Cadastrar fazenda" redirecionava pra
  `fazenda-detalhe-cadastro.html#id=<novo-id>`, que mostrava "Fazenda não encontrada" — porque
  cada tela recarrega `fazendas-data.js` do zero (nenhuma persistência entre páginas), a
  fazenda criada em memória se perdia na navegação. **Corrigido com uma camada de persistência
  em `sessionStorage`** (`fazendas-data.js`: `SESSION_KEY = 'nivelo.fazendas.criadas'`) — no
  load, o array seed recebe de volta as fazendas criadas nesta sessão; `add()` grava a nova
  fazenda lá além de no array em memória. sessionStorage (não localStorage) de propósito:
  sobrevive a navegação entre páginas da mesma aba, mas não a uma sessão nova — consistente
  com o resto do protótipo. O submit agora redireciona pra **`fazendas.html`** (não mais pro
  Detalhe), onde a fazenda já aparece na listagem de verdade; toast "Fazenda cadastrada com
  sucesso" (texto exato pedido, sem ponto final) construído com o mesmo padrão Feedback-como-
  toast já usado em outras telas — `fazendas.html`/`fazendas.js`/`page-fazendas.css` ganharam
  o toast-region/CSS que não existiam antes. O check de toast que tinha sido colocado no
  `boot()` de `fazenda-detalhe-cadastro.js` no round 35 (pra mostrar o toast lá) foi revertido
  — não é mais alcançado por este fluxo.
- **Estados de demonstração no `prototype-nav`**: novo mecanismo `#step=N&state=X` (primeira
  tela do sistema com múltiplas etapas — inédito, análogo ao `#state=` já usado em todo o
  resto, combinado com um seletor de etapa). 6 variantes registradas: Etapa 1 com erros,
  Etapa 2 default, Etapa 2 com erros, Etapa 3 vazia, Etapa 3 com talhões, Etapa 3 com o modal
  de talhão aberto e com erro — permitem abrir cada estado direto pelo `prototype-nav`, sem
  percorrer o fluxo desde o início.

**Estoque (2 ajustes independentes, fora da Fazenda):**
- **Máscara de valor em "Registrar saída"** (campo Preço de venda, `saida-preco-input`):
  mesma técnica de `formatCentavosBRL` já usada em "Valor unitário" (`novo-estoque.js`) —
  campo virou `type="text"`, estado sempre em centavos. Aplicado nos DOIS lugares que tinham
  esse modal (`estoque.js` e `detalhe-estoque.js`).
- **Modal de "Registrar saída" unificado entre Estoque (tabela) e Detalhes do registro**:
  a versão acionada pela tabela (`estoque.js`) já tinha um combobox de busca pro campo
  Destinatário/Cliente (`.estoque-combobox`, ligado a `NiveloCadastros`); a versão acionada
  pela tela de Detalhes (`detalhe-estoque.js`) tinha só um campo de texto solto — divergência
  real encontrada ao comparar os dois HTMLs lado a lado. Corrigido copiando o combobox (markup
  + toda a lógica de busca/posicionamento) pra `detalhe-estoque.html`/`.js`, que passou a
  carregar `cadastros-data.js` (só faltava esse script). CSS do combobox não precisou ser
  duplicado — `detalhe-estoque.html` já carrega `page-estoque.css` inteiro (convenção própria
  documentada nesta tela: reaproveita classes de Estoque em vez de copiar). Ordem dos radios
  "Gerar Nota Fiscal" também alinhada entre os dois (Sim primeiro, Não marcado por padrão).

Verificado ao vivo: todos os campos obrigatórios novos bloqueiam corretamente; CEP mascarado +
autofill via ViaCEP funcionando (testado com CEP real); máscara de Área formatando
progressivamente; Status só Ativo/Inativo; fluxo completo de cadastro cria a fazenda de
verdade, ela aparece na listagem com Cidade/UF corretos, toast exato exibido, sem tela de "não
encontrada"; as 6 variantes de `#step=/#state=` abrem o estado certo direto, visíveis e
navegáveis pelo `prototype-nav`; máscara de Preço de venda + combobox de Destinatário
funcionando idênticos em Estoque e em Detalhes do registro; nenhum erro de console em nenhuma
tela, nenhuma regressão nos fluxos já existentes.

## Ajustes 2026-07-29 (round 37) — Nova Fazenda: 6 correções pontuais sobre o round 36

- **Nome antes de Código** (Etapa 1) — ordem invertida, pedido explícito.
- **CNPJ virou obrigatório** — `isValidCNPJ()` agora exige exatamente 14 dígitos (antes aceitava
  vazio como válido); help text perdeu o ponto final ("CNPJ do proprietário da fazenda").
- **Bug real encontrado e corrigido: padrão de erro dos inputs tinha um fundo vermelho claro
  cobrindo o campo inteiro, não só a borda.** Causa: `Feedback.module.css`'s `.error` é uma
  classe crua (`background:var(--color-status-error-bg); border-color:...`), não escopada a
  `.alert.error` — carregada globalmente nesta tela pro toast de sucesso, vazava pra qualquer
  `.wrapper.error`. Mesma categoria de colisão já documentada em `page-cadastro.css`
  (`.cadastro-terms-field.error`). Fix: `.wrapper.error { background: transparent; border-color:
  transparent; }` em `page-nova-fazenda.css`, deixando só a borda do `.input` vermelha (regra já
  existente). **Este é agora o padrão oficial de erro de input desta tela** — help text de erro
  não muda, só a borda fica vermelha, nunca um fundo cobrindo o `.wrapper`.
- **Quirk de sandbox reencontrado durante a verificação, vale registrar**: `getComputedStyle`
  reportou a borda como cinza mesmo depois do fix — investigação encontrou que os 2 seletores CSS
  corretos (`.error .input` do componente + `.wrapper.error .input` da página, ambos
  `border-color: var(--color-action-error)`) realmente casam com o elemento (confirmado via
  `el.matches()`), e um teste isolado (`div.wrapper.error > input.input` recém-criado fora da
  árvore real) já retorna a cor certa (#DC2626) de primeira. A diferença: o `.input` real já
  estava renderizado com a borda cinza ANTES do erro, e tem `transition: border-color`; como o
  Browser pane deste sandbox não composita quando não está em foco/visível (mesmo erro já visto
  em "screenshot failed... not compositing frames"), a transição nunca avança e `getComputedStyle`
  fica preso no valor inicial. Forçar `element.style.transition = 'none'` antes de reler confirma
  a cor final correta (#DC2626) instantaneamente — **prova de que o CSS está certo, é só o
  sandbox que não anima nesta situação.** Lição: se uma cor/valor com `transition` parecer não
  aplicado neste ambiente, testar com `transition:none` antes de assumir bug real.
- **Etapa 2, Área total/agricultura ganharam máscara de milhar** (`10000` → `10.000`, ponto como
  separador, sem decimais) — mesma técnica de `formatCentavosBRL`/`formatAreaBRL` já usada em
  Estoque/no modal de talhão, aqui sem decimais (`formatMilhar`/`parseMilhar`, novo par de
  helpers). Campos passaram de `type="number"` pra `type="text"`; todo lugar que lia
  `Number(areaXInput.value)` (validação, submit) passou a usar `parseMilhar(...)`.
- **Nova validação: Área de agricultura deve ser sempre menor que a Área total** — checada em
  tempo real (`revalidateAreaComparison()`, chamada a cada tecla nos dois campos) e também dentro
  de `validateStep2()` antes de avançar. Usa o padrão de erro corrigido acima (só borda,
  `errorText` próprio: "A área de agricultura deve ser menor que a área total."). Nova variante
  no `prototype-nav` (`#step=2&state=areainvalida`, pré-preenche 100/150 e já mostra o erro) pra
  visualizar sem precisar preencher o fluxo inteiro.
- **Toast de sucesso do cadastro virou também uma variante standalone da tela de Fazendas** —
  `fazendas.js` ganhou um segundo gatilho pro mesmo toast: `#state=created` (além do fluxo real
  via `sessionStorage`, que continua intacto), mostrando "Fazenda cadastrada com sucesso" sem
  precisar completar o wizard. Nova variante registrada em `nav.config.js` na tela "Fazendas".

Verificado ao vivo: Nome aparece antes de Código; CNPJ bloqueia vazio e formato inválido; campo
de erro mostra só borda vermelha (sem fundo, confirmado via `transition:none` pelo motivo acima);
`10000` formata pra `10.000` ao digitar; Área agricultura ≥ Área total dispara erro e some ao
corrigir; variante `#step=2&state=areainvalida` mostra o erro direto; variante
`fazendas.html#state=created` mostra o toast exato sem precisar cadastrar; nenhum erro de
console; nenhuma regressão nos demais campos/etapas já existentes.

## Ajustes 2026-07-30 (round 38) — Nova tela: Categorias de receitas e despesas (Configuração)

Ativado o item de sidebar "Configuração > Categorias de receitas e despesas" (`data-nav="config-categorias"`,
stub visual desde a criação do shell — sem `NAV_DESTINATIONS`). Escopo: só a tela em si (listagem +
cadastro/edição), sem tocar na estrutura do Sidebar (já existia).

- **Arquivos novos:** `app/screens/categorias-financeiras.html` (listagem) + `app/shared/page-categorias-financeiras.css`
  + `app/shared/categorias-financeiras.js`; `app/screens/nova-categoria-financeira.html` (cadastro/edição) +
  `app/shared/page-nova-categoria-financeira.css` + `app/shared/nova-categoria-financeira.js`; novo módulo de
  dados `app/shared/categorias-financeiras-data.js` (`window.NiveloCategoriasFinanceiras`, mesma convenção IIFE
  de `produtos-data.js`/`fazendas-data.js` — `list/findByCodigo/nextCodigo/add/update/remove`).
- **Listagem** mirrora a arquitetura final de Produtos (`.card` único fundindo busca+Agrupamento de Filtros
  (`FilterPopover`, Grupo/Considera no DRE/Considera no LCDPR) com a tabela; tabela real no desktop, Cards no
  mobile; ordenação por Código/Descrição/Grupo). **Sem paginação** — mesma decisão já tomada em Fazendas/Estoque
  pro volume esperado de categorias de um produtor pequeno/médio. Colunas: Código, Descrição, Grupo, Considera
  no DRE (badge Sim/Não), Classificação no DRE (`—` quando não considera DRE), Considera no LCDPR (badge
  Sim/Não), Competência padrão, Ações (Editar/Excluir). Estado vazio global (`#state=empty`, ícone `tags`) e
  estado de erro (`#state=error`, sem backend real neste protótipo) somam-se ao estado de carregamento breve
  (~350ms, sempre na abertura da tela, mesmo espírito do `flashLoading()` do Dashboard).
- **Exclusão com regra de negócio real (mock):** cada categoria tem um campo `emUso` (boolean) simulando estar
  vinculada a lançamentos financeiros reais. O Dialog de confirmação (mesmo padrão `.secondaryGray`+`.destructive`
  de "Excluir cadastro") tem 2 corpos alternados via JS: exclusão normal quando `emUso=false`, ou uma mensagem de
  bloqueio (fundo `--color-status-warning-bg`) explicando que a categoria não pode ser excluída por estar em uso
  — nesse caso o botão "Excluir" fica escondido e "Cancelar" vira "Fechar". Só quando não bloqueada a exclusão é
  real (`NiveloCategoriasFinanceiras.remove()`), com toast de sucesso.
- **Formulário (`nova-categoria-financeira.html`), 1 `.card` único com 4 subseções** (mesmo padrão de
  Novo produto/Novo cadastro): **Dados básicos** (Código somente-leitura/auto-gerado `CAT-NNN`, Descrição
  obrigatória, Grupo Receita/Despesa obrigatório — únicos 2 valores pedidos explicitamente, sem inventar
  taxonomia maior); **Configuração do DRE** (`RadioButton` Sim/Não Considera no DRE; Classificação no DRE
  — Dropdown com as 5 opções fixas do pedido, só visível/obrigatório quando Considera no DRE=Sim, mesma técnica
  de `hidden`+revalidação já usada em "Controla Estoque"→Quantidade mínima/máxima de Novo Produto);
  **Configuração do LCDPR** (`RadioButton` Sim/Não Considera no LCDPR; **nenhum campo de classificação própria
  do LCDPR foi adicionado** — decisão explícita do pedido original, "não inventar opções", já que essa
  classificação ainda não foi especificada; o dado (`classificacaoLcdpr`) já existe no shape em
  `categorias-financeiras-data.js`, sempre `null`, pra não exigir migração quando for definida); **Competência**
  (Dropdown com as 4 opções pedidas + texto de ajuda explicando que é só uma sugestão, nunca obrigatória no
  lançamento). Edição via `?codigo=CAT-NNN` (mesmo padrão de `novo-produto.html?sku=`).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'config-categorias':
  'categorias-financeiras.html'`) ativa a navegação real nas 13 telas que já tinham o item de sidebar, sem
  editar nenhuma delas.
- **`prototype-nav/nav.config.js`:** 2 novas entradas dentro da journey `configuracao` já existente
  (`categorias-financeiras` com variantes vazio/erro/criado, `nova-categoria-financeira` com variante de edição).

Verificado ao vivo: navegação real, 8 categorias seed renderizando com os badges/classificações/competências
corretos (incl. `—` na Classificação do DRE de uma categoria com Considera no DRE=Não); busca, Agrupamento de
Filtros (Grupo/DRE/LCDPR) e ordenação funcionando e se compondo; exclusão bloqueada numa categoria `emUso=true`
mostrando a mensagem correta e sem remover a linha; exclusão real numa categoria não vinculada removendo a
linha e mostrando o toast; Cards no mobile; estados vazio/erro/carregamento; formulário bloqueando envio sem
Descrição/Grupo, campo Classificação no DRE aparecendo/desaparecendo com o Radio Considera no DRE, edição
pré-preenchendo todos os campos corretamente; nenhum erro de console em nenhuma das 2 telas.

## Ajustes 2026-07-30 (round 39) — Categorias: cabeçalho sem sobreposição, Ativar/Desativar, filtro e coluna de Status

4 ajustes pontuais na listagem de `categorias-financeiras.html`, todos sobre a tela criada no
round 38.

- **Cabeçalho da tabela sem sobreposição:** `.th` do componente tem `height:37px` fixo e nunca
  quebra linha por padrão — com os rótulos mais longos (mesmo já reduzidos: "Considera no
  DRE"→"DRE", "Classificação no DRE"→"Classificação DRE", "Considera no LCDPR"→"LCDPR",
  "Competência padrão"→"Competência") o texto vazava e sobrepunha a coluna vizinha. Corrigido com
  `height:auto`+`white-space:normal` (cada cabeçalho pode quebrar em até 2 linhas dentro da
  própria coluna) combinado com colunas em `px` fixo somando **1100px** (mais que a largura útil
  do card) — resultado: rolagem horizontal (`.tableWrap` já tem `overflow-x:auto` de fábrica,
  Table.module.css) em vez de espremer 9 colunas em 100%.
- **Coluna Ações fixa (sticky) durante a rolagem horizontal:** `.catfin-table-card .th:last-child`/
  `.td:last-child` com `position:sticky;right:0` + sombra sutil à esquerda pra indicar que há
  conteúdo por baixo. **Primeira vez que esse padrão (tabela larga + scroll horizontal + última
  coluna fixa) é usado no sistema** — documentado no CSS pra reuso futuro em outras tabelas que
  cresçam de colunas.
- **Excluir → Ativar/Desativar**, mesmo padrão exato de Talhões em `fazenda-detalhe-cadastro.js`:
  categoria nunca é removida de verdade — só `ativo` (novo campo boolean, substituiu `emUso`)
  alterna via modal de confirmação (Desativar = `.btn.destructive`, Ativar = `.btn.primary`,
  Cancelar = `.secondaryGray`). O conceito de exclusão bloqueada por "em uso" (round 38) foi
  removido por completo — não fazia mais sentido sem uma ação de exclusão na tela.
  `categorias-financeiras-data.js`: `remove()` virou `toggleAtivo(codigo)`.
- **Coluna Status + filtro por Status** (Ativo/Inativo) adicionados — badge na tabela/Cards
  (mesmo `success`/`warning` de Ativo/Inativo já usado em Cadastro/Talhões), dropdown a mais no
  Agrupamento de Filtros (Grupo/Status/DRE/LCDPR), sortável como Código/Descrição/Grupo.

Verificado ao vivo: cabeçalho sem sobreposição em 1280px (headers de 2 linhas quando necessário);
rolagem horizontal funcionando (scrollWidth 1120 > clientWidth do card) com Ações permanecendo
visível/fixa durante o scroll; filtro de Status isolando corretamente Ativos/Inativos; modal de
Desativar (botão vermelho) e o ciclo completo (badge Ativo→Inativo, ícone do botão trocando pra
"Ativar", toast de sucesso); Cards no mobile com o campo Status incluído; nenhum erro de console.

## Screens status
| Tela | Status |
|---|---|
| Login | Done |
| Criar conta (Step 1: Cadastro da conta) | Done |
| Criar conta (Validar telefone) | Done |
| Criar conta (Step 2: Endereço) | Done |
| Criar conta (Step 3: Planos) | Done |
| Recuperar senha (esqueci minha senha) | Done |
| Código de verificação (OTP) | Done |
| Criar nova senha | Done |
| Dashboard | **Conteúdo real (round 9, 2026-07-22)** — Done. Card "Estoque de grãos" reformulado no round 49 (2026-08-03, sacas em vez de valor estimado). Ver seção própria abaixo |
| Interface principal (Header + Sidebar) | **Migrado pro Storybook (round 8)** — `Storybook-Nivelo/src/components/AppHeader` e `.../Sidebar`, componentes reais em React. `app/screens/interface-principal.html` continua existindo como protótipo HTML de referência, mas a fonte da verdade agora são os componentes React |
| Cadastro de pessoas e empresas | **Nova (2026-07-22)** — Done. Nova jornada própria ("Jornada · Cadastro") no `prototype-nav`. Ver seção própria abaixo |
| Estoque (listagem + Novo registo + Detalhes) | **Done (round 24, 2026-07-27)** — 3 modais de ação reais (saída/consumo/abatimento), página de detalhes nova com histórico/timeline. Ver "Ajustes round 24" acima |
| Produtos (listagem + cadastro/edição) | **Nova (round 26, 2026-07-28)** — Done. Cadastro central de Produtos, registrado na journey "Jornada · Cadastro" no `prototype-nav`. Ver "Ajustes round 26" acima |
| Fazendas (Configuração > Cadastro de fazenda) | **Done (rounds 28-37, 2026-07-29)** — listagem em cards (round 28) + Detalhe da fazenda CADASTRAL (`fazenda-detalhe-cadastro.html`, rounds 30-33 — 2 cards de consulta + tabela de talhões padrão + toggle Ativar/Desativar com confirmação) + wizard de **Cadastro de Nova Fazenda** em 3 etapas (`nova-fazenda.html`, rounds 35-37 — Nome/Código/Proprietário/CNPJ obrigatório na Etapa 1; Localização em campos separados + Área total/agricultura com máscara de milhar e validação cruzada na Etapa 2; Talhões opcional na Etapa 3). Cadastro concluído persiste via sessionStorage e redireciona pra `fazendas.html` (fix round 36 — antes ia pro Detalhe e mostrava "não encontrada"), com toast de sucesso lá (também disponível como variante standalone `#state=created`, round 37). Padrão de erro de input (só borda vermelha, nunca fundo) fixado no round 37 e é o padrão oficial desta tela pra próximos ajustes. "+ Nova fazenda"/"Ver fazenda" navegam de verdade; edição da fazenda em si (não a criação) ainda é flash-disable. Registrada na journey "Jornada · Configuração" no `prototype-nav` (épico "Fazendas": Fazendas → Detalhe de Fazenda → Nova fazenda, com 7 variantes de step/state). Ver "Ajustes round 28/30-37" acima |
| Detalhe da fazenda — operacional (Caderno de Campo) | **Nova (round 29, 2026-07-28; recategorizada round 30)** — Done, mesma tela `fazenda-detalhe.html` do round 29 (Resumo 4 indicadores + lista de Talhões clicável), sem nenhuma mudança de conteúdo. Só a entrada de navegação mudou: agora vive na "Jornada · Caderno de Campo" no `prototype-nav` (não mais em Configuração). Resto da jornada Caderno de Campo (seleção de fazenda/talhão etc.) ainda não existe. Ver "Ajustes round 30" acima |
| Categorias de receitas e despesas (Configuração) | **Nova (round 38, 2026-07-30)** — Done. Listagem (`categorias-financeiras.html`, tabela+Agrupamento de Filtros+Cards mobile, sem paginação) + cadastro/edição (`nova-categoria-financeira.html`, Dados básicos/Configuração do DRE/Configuração do LCDPR/Competência). Exclusão bloqueada (mock `emUso`) quando a categoria já está vinculada a lançamentos. Classificação específica do LCDPR deliberadamente não implementada ainda (estrutura de dado preparada, sem inventar opções). Ver "Ajustes round 38" acima |
| Notas fiscais (Vendas) | **Nova (round 40, 2026-07-31)** — Done. Central de Notas Fiscais (`notas-fiscais.html`, tabs Saída/Entrada com colunas próprias, busca+Período+Status incl. Rejeitadas) + fluxo de Nova Nota Fiscal (`nova-nota-fiscal.html`, só saída estruturada: Emitente/Destinatário/Itens/Pagamento/Categoria/Transporte/Natureza da operação com CFOP/Observação), com visualização/correção via `?numero=&modo=ver\|corrigir`. Bloqueio de emissão sem Certificado Digital cadastrado (Dialog explicativo, fechável). Certificado Digital continua como tela de configuração não construída (stub de dado); Natureza de Operação/RF402 ganhou tela real no round 51 (ver abaixo). Ver "Ajustes round 40" acima |
| Caixa (Financeiro) | **Nova (round 43, 2026-07-31)** — Done. Listagem (`caixa.html`, tabela padrão+busca+Agrupamento de Filtros com Período/Categoria+paginação real 10/página+Cards mobile) + fluxo de Incluir Lançamento (`novo-lancamento-caixa.html`: Código auto/Banco/Categoria/Tipo Entrada-Saída-Saldo/Data/Valor/Histórico/Competência opcional/Cliente ou Fornecedor opcional). Sem coluna Ações (não pedida). Banco vem de um stub novo (`bancos-data.js`), antecipando a futura Configuração > Conta bancária. Regras de negócio mais profundas (saldo automático, conciliação) deliberadamente não implementadas, só a estrutura visual/de navegação pedida. Ver "Ajustes round 43" acima |
| Canal de Ideias | **Nova (round 50, 2026-08-03)** — Done. Comunidade de sugestões: feed (`canal-ideias.html`, busca+ordenação+chips de categoria+cards com voto inline), detalhe (`ideia-detalhe.html`, coluna única, sem sidebar de conteúdo, comentários), criação (`nova-ideia.html`, página simples de 3 campos). 3 componentes novos no Storybook (`Avatar`/`Chip`/`VoteButton`). Sem status/aprovação/backlog/priorização, por instrução explícita — só espaço colaborativo. Ver "Ajustes round 50" acima |
| Contas Bancárias (Configuração > Conta bancária) | **Done (round 56, 2026-08-03; corrigido round 59, 2026-08-04)** — Listagem (`contas-bancarias.html`, busca+ordenação+paginação+Excluir REAL com confirmação) + cadastro/edição (`nova-conta-bancaria.html`, Código auto-increment+Banco (catálogo real)+Descrição+Agência/Conta com máscara+Conta Financeira). "Conta Financeira" referenciava um stand-in (Categorias de receitas e despesas) até o round 59, quando a entidade real (`contas-financeiras.html`) foi construída e o vínculo corrigido. Migrou a fonte do campo Banco de Caixa do stub antigo (`bancos-data.js`) pro catálogo real. Ver "Ajustes round 56/59" acima |
| Conta Financeira (Configuração > Conta Financeira) | **Nova (round 59, 2026-08-04)** — Done. Listagem (`contas-financeiras.html`, busca por Código/Nome+ordenação (Código como padrão)+paginação+Excluir bloqueado quando vinculada a Caixa/Conta Bancária, com mensagem explicando o motivo) + cadastro/edição (`nova-conta-financeira.html`, só Código auto-increment readonly+Nome único). Usada pra gerar o DRE (preparação de dados, sem tela de relatório ainda) e como novo campo obrigatório em todo lançamento de Caixa. Ver "Ajustes round 59" acima |
| Natureza da Operação (Configuração > Fiscal) | **Nova (round 51, 2026-08-03)** — Done. Substitui o item "Notas fiscais" removido do submenu Fiscal. Listagem (`naturezas-operacao.html`, abas Entrada/Saída+busca+filtro de Situação+Ativar/Desativar com confirmação) + cadastro/edição (`nova-natureza-operacao.html`, Dados Gerais+Padrões pré-configurados+Configuração Tributária em `Accordion` com 5 blocos independentes: Simples Nacional/IPI/ISSQN/PIS/COFINS). Primeiro uso real do componente `Accordion` do Storybook. Ver "Ajustes round 51" acima |
| Relatórios (Financeiro > Relatórios) | **Nova (round 53, 2026-08-03)** — Done, só a página de entrada. `relatorios.html`: 4 cards clicáveis (Balancete/LCDPR/DRE/Entradas e saídas), grid 2 colunas desktop/1 mobile, sem abas (cada relatório terá filtros próprios). Os 4 fluxos de configuração/visualização em si ainda não existem (fora de escopo) — clique dá só o flash-disable por enquanto. Ver "Ajustes round 53" acima |

## Shell principal (Header + Sidebar) — migrado pro Storybook, 2026-07-21 (round 8)

**Migração concluída.** `AppHeader` e `Sidebar` (que antes eram um leftover de outro projeto —
branding "Espaço Prana", cores erradas, ver histórico) foram substituídos pelas versões reais
do Nivelo, portadas 1:1 do protótipo HTML (`app/screens/interface-principal.html` +
`app/shared/page-shell.css` + `app/shared/interface-principal.js`). Arquivos:
`Storybook-Nivelo/src/components/AppHeader/{AppHeader.tsx,.module.css,.stories.tsx}` e
`Storybook-Nivelo/src/components/Sidebar/{Sidebar.tsx,.module.css,.stories.tsx}`. Logo copiada
pra `Storybook-Nivelo/public/logos/nivelo-azul-header-sistema.svg`.

**Diferenças da porta pra React (comportamento idêntico, mecanismo diferente):**
- Ícones via `lucide-react` (imports reais, ex. `<Wallet size={20} />`), não mais
  `data-lucide="wallet"` — convenção já estabelecida em outros componentes do Storybook.
  WhatsApp (sem equivalente no Lucide) continua como SVG inline com `fill="currentColor"`,
  agora um componente local `WhatsAppIcon` dentro de `Sidebar.tsx`.
- Todo estado (collapsed, accordion, popover, tooltip, Fiscal) é `useState` interno do
  componente `Sidebar` — só `mobileOpen`/`onMobileOpenChange` (drawer mobile) e
  `activeItemId`/`onNavigate` (roteamento) são props controladas de fora, porque só esses dois
  precisam ser compartilhados com outro componente (o hamburger mora no `AppHeader`) ou com a
  página que consome o Sidebar (saber qual página está ativa). O resto é implementação interna
  que nenhum consumidor de fora precisa (nem deveria) controlar.
- O accordion (só um grupo de topo aberto por vez) fica **automático de graça**: o estado é um
  único `openGroupId: string | null` em vez do array de ids + loop "fecha os outros" que o JS
  vanilla precisava.
- Popover: posição calculada via `event.currentTarget.getBoundingClientRect()` direto no
  handler de clique (não precisa de refs armazenados). Fechar-ao-clicar-fora usa
  `data-group-id` + `element.closest()` num listener de `document`, mesma ideia do JS vanilla.
- **Bug real encontrado durante a migração (não existia no protótipo HTML):** o CSS do Popover
  usava um seletor de 1 classe só (`.navSubmenuPopover { display:flex }`), que tem a MESMA
  especificidade que a regra que esconde submenus no modo retraído
  (`.collapsed .navSubmenu { display:none }`, 2 classes — mais específica, então vencia,
  deixando o Popover com `display:none` mesmo aberto). O protótipo HTML original nunca teve
  esse bug porque sempre usou seletores longos e específicos
  (`.app-sidebar.is-collapsed .app-nav-group.is-popover-open > .app-nav-submenu`) — na
  "tradução" pra nomes de classe mais curtos do CSS Modules, a especificidade foi simplificada
  demais. Fix: `.sidebar.collapsed .navSubmenuPopover` (2 classes no mesmo elemento + 1
  descendente), suficiente pra vencer qualquer uma das duas regras concorrentes independente
  da ordem no arquivo. Verificado ao vivo no Storybook (`npm run storybook`, porta 6006) via
  `getComputedStyle`, não só lido no código.

Estágio anterior, mantido por completude histórica (protótipo HTML de referência):
estrutura/experiência visualmente; a extração pra componentes reais do Storybook (com
`.tsx`/`.module.css`/`.stories.tsx`) só acontece depois de aprovado. Não pule essa ordem.

- **CSS:** `app/shared/page-shell.css` (só tokens — nenhuma cor hardcoded).
- **JS:** `app/shared/interface-principal.js`. Uma preferência persiste via `localStorage`
  (chave `nivelo.shell.sidebarCollapsed`): se a sidebar está retraída.
- **Light only (2026-07-21, round 6):** Dark Mode existiu nos rounds 1-5 (botão de tema no
  Header, script inline no `<head>` pra aplicar o tema salvo antes do CSS pintar, logo
  azul/branca trocando por tema) — tudo isso foi **removido** por pedido explícito do usuário.
  Não recriar nenhuma dessas peças sem um pedido novo e explícito.
- **Sidebar:** expandida (ícone+texto) ⇄ retraída (só ícone) no desktop (botão circular na
  borda, 1024px+); vira drawer (`position:fixed` + `translateX`) com backdrop no mobile,
  acionado pelo hamburger do Header. Dentro de Configuração, Fiscal é um subgrupo de mais um
  nível (`.app-nav-subgroup`).
- **Accordion (2026-07-21, round 4):** só um grupo de topo (Financeiro/Vendas/Assistente
  IA/Configuração) fica aberto por vez — abrir um fecha automaticamente qualquer outro que
  estivesse aberto, inclusive Fiscal quando quem assume o lugar não é Configuração (Fiscal só
  faz sentido junto do pai). Fiscal em si NÃO entra no accordion de topo (é o único subgrupo do
  próprio nível, só abre/fecha ele mesmo). Lógica em `interface-principal.js`:
  `TOP_LEVEL_GROUP_IDS` + `closeGroup()`/`closeAllTopLevelGroups()`/`closeAllPopovers()`.
- **Popover na Sidebar retraída (2026-07-21, round 4):** clicar (nunca hover) num grupo de topo
  com a sidebar retraída NÃO expande mais a sidebar permanentemente — abre um Popover
  flutuando ao lado do ícone, reaproveitando o MESMO elemento `.app-nav-submenu` (sem duplicar
  HTML), reposicionado via `position:fixed` com `top`/`left` calculados do
  `getBoundingClientRect()` do botão (precisa ser `fixed`, não `absolute`: a Sidebar tem
  `overflow-x:hidden`, que cortaria um popover `absolute` tentando escapar pra direita). Fecha
  ao clicar fora (listener global de `click` checando `group.contains(event.target)`) ou ao
  selecionar um item (`closeAllPopovers()` no handler de "marcar item ativo"), nunca no hover.
  Fiscal, dentro do Popover de Configuração, expande inline no mesmo card (sem popover
  próprio) — funciona "de graça" por reaproveitar o DOM existente. CSS reverte, só dentro de
  `.is-popover-open`, o que o modo retraído normalmente esconde/centraliza (rótulo, chevron,
  alinhamento dos subitens). **Bug corrigido (round 6):** esses overrides usavam um seletor
  descendente solto (`.is-popover-open .app-nav-label`), que também batia no rótulo do PRÓPRIO
  botão que abriu o popover (irmão de `.app-nav-submenu` dentro do mesmo `.app-nav-group`) —
  fazendo o texto do item clicado (ex. "Financeiro") reaparecer espremido na trilha de 76px.
  Selectors corrigidos pra `> .app-nav-submenu .app-nav-label` (etc), escopando ao card do
  popover. Também removida a mudança de `background`/`color` persistente no ícone que abre o
  popover ("engajado") — por pedido do usuário, o ícone clicado deve ficar EXATAMENTE igual ao
  resto da trilha, só reagindo ao `:hover`/`:focus-visible` normal, como qualquer outro item.
- **Agrupamento visual (2026-07-21, ajustado em round seguinte):** três seções
  (`.app-nav-section`) com título discreto (`.app-nav-section-title`, maiúsculo/pequeno/cor
  terciária, some no modo retraído): Geral (Dashboard, Cadastro, Estoque, Financeiro, Vendas,
  Assistente IA), Gestão (Configuração, Canal de ideias, Vídeos), Suporte (Suporte, Sair).
  "Sair" ganha uma separação própria adicional (`.app-nav-item-exit`: margem + borda superior
  discreta) mesmo dentro da seção Suporte, pra reforçar que é uma ação do sistema, não mais um
  destino de navegação.
- **Assistente IA:** grupo expansível em Geral (ícone `bot`), com 3 subitens: Meus números
  (`smartphone`), Nova conversa (`message-square-plus`), Histórico (`history`).
- **Configuração:** 4 subitens leaf (Minha conta, Cadastro de fazenda, Conta bancária,
  Categorias de receitas e despesas) + o subgrupo Fiscal. "Vincular número WhatsApp" foi
  removido por pedido explícito do usuário (não faz mais parte da navegação).
- **Hierarquia dos submenus:** cada `.app-nav-submenu`/`.app-nav-subsubmenu` tem uma linha
  vertical de 1px (`::before`, `--color-border-muted`) ligando os subitens ao pai — bem
  discreta de propósito, alinhada ao centro horizontal do ícone do item pai (mesma regra em
  todos os níveis, incluindo Fiscal).
- **Hierarquia tipográfica (2026-07-21, round 4):** nível 0 (`.app-nav-item`) 16px
  `--font-weight-medium`; nível 1 (`.app-nav-subitem`) 14px (`--font-size-md`); nível 2
  (`.app-nav-subsubitem`, dentro de Fiscal) 12px (`--font-size-sm`) — nunca menor que 12px.
  Reforçado também por ícone menor (20px → 16px → 14px) e cor (secundária → secundária →
  terciária), não só pelo tamanho da fonte.
- **Chevron:** sempre o ícone `chevron-down`; abrir o grupo só faz `transform:rotate(180deg)`
  (dá o efeito visual de "chevron-up" com uma transição suave) em vez de trocar o ícone — trocar
  o SVG do Lucide não anima, girar sim. Mesmo padrão em grupos de topo e no subgrupo Fiscal.
- **Sidebar retraída — indicador de submenu:** um ponto discreto de 4px (`::after`, cor
  terciária) no canto do botão de qualquer `.app-nav-group` (Financeiro/Vendas/Configuração) —
  não é um badge, só sinaliza "este item tem opções" já que o chevron some junto com o texto.
- **Tooltip (revisado 2026-07-21, round 5) — JS + `position:fixed`, não mais CSS puro.** Todo
  item de topo tem `data-tooltip` (nome do item; nos grupos, "Nome · opções"); um único elemento
  compartilhado `#app-tooltip` (fora do `.app-shell` no HTML, pra nunca herdar um contexto de
  `transform`/`overflow` de algum ancestral) é posicionado via JS
  (`getBoundingClientRect()` do alvo) nos eventos `mouseenter`/`focus`/`mouseleave`/`blur` de
  qualquer `[data-tooltip]` na Sidebar. **Antes disso era um `::after` em CSS puro — só que ele
  nascia dentro de `.app-sidebar-body`, que tem `overflow-x:hidden` por outro motivo (evitar
  vazamento de texto durante a transição de largura), e isso CORTAVA o próprio tooltip, que
  precisa aparecer à direita da Sidebar.** Mesmo problema e mesma solução (`position:fixed`
  escapa do `overflow` do ancestral) já usados no Popover — ver função
  `showTooltip()`/`hideTooltip()` em `interface-principal.js`. Só aparece no modo retraído
  (`!sidebar.classList.contains('is-collapsed')` retorna cedo).
- **Scrollbar da Sidebar:** fino e discreto (`scrollbar-width:thin` + `::-webkit-scrollbar`
  customizado, 6px, cor `--color-border-muted` que escurece um pouco no hover) — nunca o
  scrollbar padrão do navegador.
- **Suporte / WhatsApp (revisado 2026-07-21, round 4):** o ícone é um SVG **inline** com
  `fill="currentColor"` (não `mask-image`) — mesma técnica que o próprio Lucide usa
  internamente. A tentativa anterior com `mask-image` renderizava sem cor visível em alguns
  contextos (suporte de `mask` no navegador variando); SVG inline elimina esse risco por
  completo. **Exceção documentada à regra "sem SVG inline"** (a marca WhatsApp não existe no
  Lucide, então não há alternativa via `data-lucide`).
- **Logo do Header:** `32px` de altura, só um `<img class="app-header-logo">`, sempre
  `NIVELO azul header sistema.svg` (não confundir com `NIVELO azul header.svg`, sem "sistema",
  usado só no fluxo de autenticação). Dois ajustes de alinhamento sobrepostos:
  - **Bloco inteiro vs. Sidebar (round 4):** `--shell-nav-text-indent` (token calculado em
    `.app-shell`) + `margin-left` em `.app-header-left` a partir de 1024px alinham o logo+
    tagline com o início do TEXTO dos itens da Sidebar logo abaixo.
  - **Logo vs. tagline, alinhamento pela esquerda (round 7 — fonte da verdade atual):**
    `.app-header-brand` usa `align-items: flex-start` explícito (não o `stretch` implícito do
    default de flex-column) + `text-align: left` no logo e na tagline. Isso faz cada filho
    (logo, tagline) ficar do tamanho do próprio conteúdo e começar exatamente na mesma borda
    esquerda do bloco — robusto independente do texto da tagline mudar de tamanho no futuro
    (ao contrário de `stretch`, que só "funcionava" aqui por coincidência: a largura natural do
    texto da tagline era parecida com a da logo). **Round 6 tinha tentado resolver isso com um
    `margin-left:1px` no logo** (compensando um suposto left-side-bearing de ~1px medido via
    `ctx.measureText(...).actualBoundingBoxLeft`) — esse ajuste ficou incorreto assim que
    `align-items` mudou de `stretch` pra `flex-start` (as posições de caixa mudaram
    ligeiramente) e foi REMOVIDO no round 7. Confirmado via duas técnicas independentes que
    logo e tagline hoje começam no mesmo pixel exato: (1) varredura de pixels do logo
    renderizado em `<canvas>` até achar a primeira tinta não-transparente, e (2)
    `Range.getBoundingClientRect()` sobre o texto da tagline (mede a tinta renderizada de
    verdade, mais confiável que `ctx.measureText` isolado). **Lição: um ajuste manual (como um
    `margin-left` de compensação) que depende de UM modelo de caixa específico pode virar
    incorreto se esse modelo de caixa mudar depois — prefira uma mudança estrutural
    (`align-items`) a um número mágico de compensação sempre que possível.**
- Estados de demonstração via `#state=`: idle (expandida) | `collapsed` | `financeiro` |
  `vendas` | `configuracao` | `configuracao-fiscal` | `assistente-ia`. Registrado em
  `prototype-nav` como jornada própria ("Jornada · Sistema"), separada da jornada de
  Login/autenticação.

## Dashboard (conteúdo real) — round 9, 2026-07-22

`app/screens/dashboard.html` deixou de ser um placeholder: agora usa a MESMA marcação de shell
(Header + Sidebar) de `interface-principal.html` — copiada 1:1, item "Dashboard" já com
`is-active` — em volta do conteúdo real, dentro de `<main class="app-main">`. Segue a mesma
ordem do "Adding a new screen" (protótipo HTML primeiro; só migra pra componente React do
Storybook depois de aprovado, como o Shell já fez no round 8).

**Seções (mobile-first, 3 linhas no desktop 1024px+):**
1. Linha 1 (3 colunas): Safra da safra atual (área total + por cultura, com produtividade média
   quando disponível) · Estoque de grãos (quantidade + valor estimado por cultura) · Saldo em
   contas (por conta + total).
2. Linha 2 (2 colunas): Contas a pagar e Contas a receber, últimos 6 meses, cada uma uma tabela
   real (ver componente Table abaixo) com uma linha de total ao final.
3. Linha 3 (1 card full-width): Clima atual (temperatura, condição, mín/máx, umidade, vento,
   chance de chuva, localização da fazenda) + previsão resumida de 5 dias, lado a lado no
   desktop (`.dash-weather` vira `flex-direction:row` a partir de 1024px).

**Sem componente Card dedicado no Storybook ainda:** todos os 7 cards reaproveitam
`.card`/`.cardHeader`/`.title`/`.subtitle` de `Table.module.css` como o "Card" genérico do
sistema (container com fundo/borda/radius + cabeçalho título/subtítulo), não só os dois com
tabela dentro — reforço visual da página (`.dash-card`: sombra sutil, tamanho do título) via
seletor composto, mesmo padrão de correção de colisão já usado pra Input×Checkbox. Ver detalhes
e o bug de tokens corrigido na fonte (`--font-display`/`--font-weight-semibold` inexistentes,
trocados por `--font-heading`/`--font-weight-medium`) na seção "Table" de `rules.md`.

**Estado vazio (`#state=empty`):** simula uma fazenda recém-cadastrada, sem dados — Safra,
Estoque, Saldo, Contas a pagar e Contas a receber trocam pra uma mensagem central + ícone (mesmo
padrão de "vazio" já usado no Table/Feedback do restante do sistema), Clima nunca entra nesse
estado (é dado externo, não "cadastro"). Implementado com um atributo `data-content`/`data-empty`
por seção + uma classe `is-demo-empty` no `<body>` (`dashboard.js` lê `#state=empty` do hash).
**Cuidado ao mexer nisso:** o CSS que estiliza `.dash-empty` (`display:flex`) precisa ficar
`display:none` por padrão e só virar `flex` sob `body.is-demo-empty` — colocar `display:flex`
direto na classe base derrota o atributo HTML `hidden` (mesma especificidade, mas o CSS de
autor definido depois do UA stylesheet vence), bug real encontrado e corrigido durante a
verificação neste round.

**Arquivos:** `app/screens/dashboard.html` (shell + conteúdo), `app/shared/page-dashboard.css`
(grid responsivo, `.dash-card`, `.dash-stat-*`, `.dash-table-total`, `.dash-weather*`,
`.dash-empty`, mantém o toast de sucesso herdado do placeholder anterior),
`app/shared/dashboard.js` (mantém a lógica de toast + adiciona o toggle de `#state=empty`,
reaproveita `interface-principal.js` pra toda a interatividade do shell, sem duplicar lógica).
Dados são fictícios (prototype sem backend), inspirados numa referência visual fornecida pelo
usuário mas não copiados literalmente (cores/cards/tipografia seguem o design system do Nivelo,
não o layout exato da referência).

## Dashboard — refinamento round 10, 2026-07-22 (mesmo dia do round 9)

Segunda passada no Dashboard, ainda como protótipo HTML (sem migração pro Storybook — mesma
regra de sempre, só migra depois de aprovado). Mudanças:

- **Filtros no topo (Fazenda + Período), título virou só "Dashboard"** (subtítulo
  "Safra 2025/2026 · Fazenda São João" removido, ficou redundante com os filtros). Fazenda
  reaproveita o componente `Dropdown` do Storybook (primeiro uso real, ver `rules.md`) e só
  aparece quando o usuário tem mais de uma fazenda cadastrada — regra dinâmica de verdade
  (`FARMS.length > 1` em `dashboard.js`), nunca um filtro fixo. `#state=multifarm` demonstra o
  filtro aparecendo (3 fazendas fictícias); o padrão (uma só fazenda) mantém o filtro escondido.
  Período tem 5 opções (`3m`/`6m`/`12m`/`safra`/`custom`, default `6m`), `Período personalizado`
  revela dois `<input type="date">` (reaproveitando `Input.module.css`). Sem backend real:
  trocar o período atualiza os RÓTULOS visíveis (ex. "Últimos 6 meses" → "Período
  personalizado" nos cabeçalhos de Contas a pagar/receber) mas não recalcula os valores em R$
  — comentado no código, mesma limitação de sempre neste protótipo sem API.
- **3 cards do topo (Safra/Estoque/Saldo) com a mesma altura.** `.dashboard-row-3` ganhou
  `align-items:stretch` (só a partir de 1024px, onde viram 3 colunas — no mobile empilhado isso
  não importa) + `.dash-card{display:flex;flex-direction:column;height:100%}` +
  `.dash-card-body{flex:1}`, empurrando o link `Ver detalhes` pro rodapé mesmo quando o conteúdo
  de um card é mais curto que o vizinho — sem scrollbar interna, só espaço em branco controlado.
- **Ícone discreto (18px, cor `--color-text-brand`) ao lado do título em todos os 5 cards de
  dado** (Safra=`sprout`, Estoque=`warehouse`, Saldo=`wallet`, Pagar=`arrow-up-circle`,
  Receber=`arrow-down-circle`, Clima=`cloud-sun`) — os dois últimos já eram os mesmos ícones
  usados na Sidebar pros mesmos conceitos (Financeiro → Contas a pagar/receber), reforçando a
  mesma linguagem visual em vez de escolher ícones novos.
- **Hierarquia: número principal em destaque (`.dash-headline`, 30px) acima do breakdown**, ao
  invés de uma linha "total" solta dentro da lista. Safra: "100 ha" (Área total plantada) acima
  de Soja/Milho/Trigo. Saldo: "R$ 119.500,00" (Saldo total) acima das contas. Estoque: soma dos
  3 grãos ("R$ 276.850,00", Valor total estimado) acima do detalhamento por grão — não pedido
  explicitamente pelo usuário pros 3 cards, mas aplicado por consistência com o padrão que ele
  pediu pra Safra/Saldo.
- **Contas a pagar/receber: total em destaque no CABEÇALHO** (`R$ 99.500,00 · Últimos 6 meses`,
  cor de erro/sucesso) em vez de uma linha de total separada dentro/depois da tabela (removida,
  virou redundante). Tabela reduzida pra 4 lançamentos (era 6) + link `Ver todas as contas →`
  no rodapé, pra funcionar como resumo de verdade em vez de listar tudo.
- **Bug de alinhamento da tabela corrigido:** a tabela começava flush na borda do card (`0`
  padding), enquanto o título tinha `--spacing-lg` (24px) de padding — parecia "deslocada" pra
  esquerda. Fix: `.dash-table-body{padding:0 var(--spacing-lg) var(--spacing-lg)}` envolvendo
  `tableWrap`+o link de rodapé, alinhando o início da tabela com o título/ícone do card.
- **Dois bugs REAIS encontrados durante a verificação no navegador (não só os pedidos do
  usuário):**
  1. `.dash-filter-range{display:flex}` (novo, pros campos De/Até) derrotava o atributo HTML
     `hidden` do mesmo jeito que `.dash-empty` já tinha feito no round anterior — os campos de
     data apareciam mesmo com Período = "Últimos 6 meses". Fix:
     `.dash-filter-range:not([hidden]){display:flex}`. **Padrão a vigiar de agora em diante:
     nunca dar `display` incondicional numa classe que também depende do atributo `hidden` pra
     ficar escondida por padrão** — ou o elemento nasce sem `display` nenhum (deixa o
     `hidden` do HTML mandar) ou o `display` fica atrás de `:not([hidden])`.
  2. A previsão de 5 dias no Clima (mobile) não alinhava com o ícone principal do clima atual
     como pedido — o `<ul class="dash-weather-forecast">` nunca teve `padding-left:0`
     explícito, então herdava os 40px padrão do navegador pra listas, empurrando a coluna
     inteira pra direita. Fix: `padding-left:0` (unificado num único `padding` shorthand).
     Confirmado via `getBoundingClientRect()` que o ícone principal e o ícone do primeiro dia
     (Seg) ficam no mesmo `x` exato depois do fix. **Lição: `<ul>`/`<ol>` sempre têm
     `padding-inline-start` do UA stylesheet — todo `<ul>` novo neste protótipo precisa zerar
     isso explicitamente, não só assumir que `margin:0` já resolve.**
- **Nav do protótipo, um erro à parte (apontado pelo usuário no meio do round anterior):**
  o Dashboard tinha sido registrado só como destino final do fluxo de recuperação de senha
  (`Jornada · Login → Recuperar senha → dashboard`), 3 níveis escondido — o usuário não achava a
  tela. Corrigido: `dashboard` virou entrada de primeiro nível em `Jornada · Sistema (área
  logada)`, ao lado de `interface-principal`, com todas as suas variantes de estado
  (`empty`/`multifarm`/`success`/`signupsuccess`) ali. O link antigo (`criar-nova-senha` →
  `dashboard.html#state=success`) continua existindo dentro do fluxo de recuperação, só o nó
  DUPLICADO de topo é que foi removido de lá.

## Dashboard — ajuste pontual round 11, 2026-07-22 (mesmo dia)

Dois pontos, ambos implementados:

- **"Período personalizado" virou um Popover** (Data inicial/final + calendário + Cancelar/
  Aplicar) em vez de expandir inline na linha de filtros (que empurrava o layout). Popover
  `position:fixed`, mesma linguagem visual do Popover da Sidebar/tooltip compartilhado — nunca
  altera a altura/posição do cabeçalho. Calendário é composição própria (sem componente
  dedicado no Storybook), documentada em `rules.md`. Só aplica no clique em "Aplicar"; "Cancelar"
  ou clique fora descarta a seleção em andamento. Depois de aplicado, o filtro mostra
  `dd/mm/aaaa – dd/mm/aaaa`.
- **Zebra striping sutil nas tabelas de Contas a pagar/receber** (branco do card ↔ `gray-50`),
  override só nessas duas tabelas via seletor composto — `Table.module.css` não muda.

**Bug real, terceira ocorrência do mesmo padrão neste projeto:** `.dash-period-popover` tinha
`display:flex` sem guarda `:not([hidden])`, derrotando o atributo `hidden` de novo (mesmo bug
do `.dash-empty` no round 9 e do `.dash-filter-range` no round 10, ambos já corrigidos). Dessa
vez passou despercebido por mais tempo porque a checagem via JS (`elemento.hidden === true`)
continuava correta — só um `getComputedStyle(...).display` ou uma screenshot de verdade expunha
que o Popover continuava visível na tela. **Checklist permanente agora em `rules.md`: todo
elemento que usa `hidden` pra estado padrão-escondido precisa ter sua regra de `display`
(quando visível) atrás de `:not([hidden])` — nunca solta na classe base.**

## Cadastro de pessoas e empresas — nova jornada, 2026-07-22

Primeira tela de uma jornada nova e independente ("Jornada · Cadastro" no `prototype-nav`),
acessada de verdade pelo item "Cadastro" da Sidebar (antes só alternava destaque visual, agora
`interface-principal.js` navega pra `cadastros.html` de verdade, mesmo padrão já usado por
"Sair"). Arquivos: `app/screens/cadastros.html`, `app/shared/page-cadastros.css`,
`app/shared/cadastros.js`.

Reaproveita só componentes reais do Storybook: `Input` (busca + campo de data "desde"),
`Dropdown` (Situação), `Tab` (Todos/Cliente/Fornecedor/Transportadora — primeiro uso real, ver
`rules.md`), `Table` (`.card`/tabela/`.badge` — Tipo pode ter mais de um badge por linha, ex.
Cliente + Fornecedor), `Button`. O filtro "Data de cadastro" reaproveita a MESMA composição de
Popover+calendário já construída pro Período do Dashboard (não existe componente de calendário
no Storybook), copiada com prefixo `cad-` em vez de compartilhada com o Dashboard — de
propósito, pra manter as duas telas independentes (ver nota no topo de `page-cadastros.css`).

**Regra de negócio central: "Excluir" é soft delete de verdade, não remoção.** Clicar excluir
(com `confirm()` antes) só troca `data-status` da linha pra `excluido` e atualiza o badge — a
linha nunca some da tabela, continua encontrável trocando o filtro de Situação pra "Excluídos".
Situação (Ativos/Inativos/Excluídos) tem um campo contextual de data ("Inativo desde"/"Excluído
desde") que só aparece quando faz sentido pra opção selecionada. "Cadastrar nota fiscal",
"Editar" e "Adicionar cadastro" existem visualmente mas não têm destino real ainda (fluxo de
criação/edição é uma etapa futura, como pedido).

Dados fictícios (12 linhas) cobrem pessoa física e empresa, os 3 status, e todas as combinações
de tipo (isolados, pares e o trio Cliente+Fornecedor+Transportadora), pra exercitar cada estado
visual da tela. Mobile: filtros/busca ocupam 100% da largura (mesmo padrão do Dashboard), abas
e tabela rolam horizontalmente sozinhas via `overflow-x:auto` (mecanismo responsivo já existente
no `Tab`/`Table`, nenhum componente novo pra isso).

## Cadastro de pessoas e empresas — ajustes round 2, 2026-07-22

- **Botão "Novo cadastro"** (era "Adicionar cadastro"), mesma posição.
- **Busca/filtros/abas já eram funcionais desde o round 1** e continuam se compondo entre si;
  confirmado de novo em browser neste round (busca por fantasia/CPF, Situação+data contextual,
  abas, tudo junto).
- **Ordenação de colunas de verdade** em Nome/Código/Tipo/Status/Cidade, usando o padrão
  `.sortable`/`.thInner`/`.sortIcon` que já existia (sem uso) em `Table.module.css` — ver
  `rules.md`. CPF/CNPJ, Contato e Ações ficam de fora (não agregam valor ordenados). Clique
  alterna asc/desc, reordena o `<tbody>` de verdade.
- **Coluna Tipo virou texto simples** (ex. "Cliente, Fornecedor") em vez de badges — badge fica
  reservado só pra Status, criando a distinção pedida entre "informação textual" (Tipo) e
  "estado visual" (Status).
- **Modal de exclusão real**, substituindo o `confirm()` do browser: `Dialog` do Storybook
  (mesmo componente já usado no Modal de Termos de `cadastro-planos.html`), centralizado,
  botão de confirmação com o padrão `.btn.destructive`. Continua soft delete de verdade.
- **Bug real, quarta ocorrência do padrão `hidden`+`display` incondicional neste projeto:**
  `Dialog.module.css`'s `.overlay` tem `display:flex` sem guarda (o componente React nunca
  precisa de `hidden`, resolve com `if (!open) return null`) — em HTML estático controlado por
  `hidden`, o modal abria sozinho ao carregar a página. Fix: `.overlay[hidden] { display: none; }`
  em `page-cadastros.css` (mesmo fix já existia em `page-cadastro.css` pro Modal de Termos, só
  não tinha sido copiado pra cá ainda).
- **Nova regra de conteúdo (a partir deste round): nunca usar travessão/meia-risca (—/–) em
  texto de interface.** Corrigido o único caso real de texto visível ao usuário nesta tela: o
  separador do intervalo aplicado no Popover "Data de cadastro" (`"dd/mm/aaaa – dd/mm/aaaa"` →
  `"dd/mm/aaaa até dd/mm/aaaa"`). Regra documentada em `rules.md` pra valer daqui pra frente em
  toda tela nova/ajuste futuro — não uma varredura retroativa do que já existia.

## Cadastro de pessoas e empresas — ajustes round 3, 2026-07-22

- **Ordem do conteúdo:** Abas agora vêm ANTES de Pesquisa+Filtros (antes: Pesquisa → Filtros →
  Abas → Tabela; agora: Abas → Pesquisa+Filtros → Tabela), deixando busca/filtros coladas na
  área da tabela/listagem.
- **Setas horizontais nas abas removidas** — não eram parte do nosso HTML/CSS, e sim a
  scrollbar horizontal nativa do navegador pro `overflow-x:auto` do `Tab` (renderizada com
  botões de seta nas laterais, mesmo sem conteúdo suficiente pra precisar rolar). Escondida via
  `scrollbar-width:none`/`::-webkit-scrollbar{display:none}`, mantendo a capacidade de rolar se
  um dia houver mais abas.
- **Modal de exclusão corrigido de verdade, não só cosmético:** o texto e os botões pareciam
  com paddings diferentes porque os rótulos "Cancelar" + "Excluir cadastro" juntos passavam da
  largura útil do conteúdo do Dialog `sm`, "vazando" pela margem esquerda (comprovado medindo
  `getBoundingClientRect()`: os botões começavam exatamente na borda externa do modal, ignorando
  os 24px de padding que título/texto respeitavam). Corrigido encurtando o rótulo do botão de
  confirmação pra só "Excluir" (também elimina a redundância com o título "Excluir cadastro").
  Texto do corpo também reduzido pro essencial, como pedido.
- **Botão de limpar o período** — `×` ao lado do trigger de "Data de cadastro", só aparece
  depois de "Aplicar"; reaproveita `.actionBtn` do Table. Limpa só esse filtro (não mexe em
  busca/abas/Situação).
- **Tabela vira Cards de verdade no mobile** (não mais a tabela comprimida) — ver seção dedicada
  em `rules.md` ("Tabela → Cards no mobile"). Ações dos Cards chamam a mesma função da tabela
  (`handleRowAction`), então Excluir num Card abre o mesmo Modal e afeta a linha real.
- **5ª ocorrência do bug `hidden`+`display` incondicional** (depois de `Dialog.module.css`'s
  `.overlay` no round 2): dessa vez em `Table.module.css`'s `.actionBtn`, reaproveitado como
  botão de limpar período — aparecia na tela mesmo sem nenhum período aplicado. Mesmo fix
  padrão: `.cad-filter-clear[hidden] { display: none; }` na CSS da página.

## Ajustes 2026-08-03 (round 56) — Nova jornada: Configuração > Certificado Digital

Ativado o item de sidebar "Configuração > Fiscal > Certificado digital" (`data-nav="fiscal-
certificado"`, existia como stub visual desde a criação do Fiscal — sem `NAV_DESTINATIONS`,
referenciado só pelo bloqueio de emissão de Nova Nota Fiscal). Duas telas novas + extensão de um
módulo de dados que já existia como stub.

- **Arquivos novos:** `app/screens/certificado-digital.html` (listagem + seção Parceiro +
  3 modais) + `app/shared/page-certificado-digital.css` + `app/shared/certificado-digital.js`;
  `app/screens/importar-certificado.html` (form de importação/edição) + `app/shared/page-
  importar-certificado.css` + `app/shared/importar-certificado.js`.
- **`app/shared/certificado-digital-data.js` deixou de ser stub** (era só `hasCertificado()`/
  `setCertificado()`, um booleano em `sessionStorage` simulando se a empresa tinha certificado,
  usado só pelo bloqueio de emissão de Nova Nota Fiscal) e ganhou o cadastro completo: `list/
  findByCodigo/findByNumeroSerie/nextCodigo/add/update/remove/revogar`, config do Parceiro
  (`getParceiro/setParceiro`, `localStorage` — catálogo de conta, mesma convenção de categorias-
  financeiras-data.js/safras-data.js) e `registrarAcessoParceiro` (histórico em `localStorage`).
  `hasCertificado()`/`setCertificado()` foram mantidos com a MESMA assinatura (Nova Nota Fiscal
  não precisou de nenhuma mudança além do botão "Ir para Certificado Digital", ver abaixo).
- **Status é sempre recalculado a partir de `dataValidade`** (`ativo`/`próximo do vencimento` ≤30
  dias/`expirado`), nunca guardado congelado — exceto `revogado`, que é a única ação manual/
  permanente (não derivada de data). Badge reaproveita `.badge[data-status]` do `Table` (`success`/
  `warning`/`error` pros 3 primeiros; `indigo` pra Revogado — token de status já existente no
  Storybook, só uma cor ainda não usada em nenhum outro lugar do app, escolhida por não ter
  nenhuma opção "cinza/neutro" no catálogo e por Revogado ser conceitualmente distinto de
  Expirado, que já é `error`).
- **Decisão importante de escopo — lista nasce VAZIA por padrão:** o cenário "sem certificado"
  já era usado como o estado PADRÃO de demonstração de `nova-nota-fiscal.html` (bloqueio de
  emissão, sem hash nenhum) desde o round 40, com `#state=comcertificado` sendo a variante que
  simula sucesso. Popular a lista com certificados de exemplo por padrão quebraria essa
  demonstração existente (o bloqueio nunca mais apareceria). Corrigido com uma função separada
  `seedExemplo()` (2 certificados de exemplo — 1 ativo, 1 expirado — usando `EMITENTE` de
  `emitente-data.js` como Titular/CPF-CNPJ, mesmo dado já usado em Nova Nota Fiscal), chamada só
  quando a URL tem `#state=comdados` (`certificado-digital.js`/`importar-certificado.js`
  checam o hash antes de renderizar). `prototype-nav` ganhou a variante "Com certificados
  cadastrados" pra isso; o padrão sem hash mostra o estado vazio (também um cenário real válido:
  conta nova, nenhum certificado ainda).
- **"+ Novo Certificado":** botão primário com um menu de ações (Importar Certificado/Emitir com
  Parceiro) — reaproveita `.menu`/`.option` de `Dropdown.module.css` (mesmo visual de menu já
  usado em todo o app), só que ancorado num `<button class="btn primary">` em vez de um trigger
  de formulário, com `position:fixed` calculado via JS (mesma técnica de sempre) alinhado à
  direita do botão. Nenhum componente novo — é uma composição, não um "menu de ações" novo no
  Storybook.
- **Fluxo 1 (Importar):** formulário em 2 cliques no mesmo botão, sem rota nova — 1º clique
  valida Nome/Arquivo(.pfx/.p12)/Senha e "extrai" os dados (mock determinístico via hash simples
  do nome+arquivo, já que não há parsing real de certificado num protótipo estático: Tipo A1/A3,
  Emissor de uma lista de ACs reais brasileiras, dias restantes/datas, Titular/CPF-CNPJ sempre
  do Emitente da conta), revela a seção "Dados extraídos automaticamente" (todos os campos
  somente leitura) e o botão vira "Salvar Certificado"; 2º clique persiste. Upload composto a
  partir de `Button` + `<input type="file" hidden>` (sem componente Upload no Storybook, mesmo
  raciocínio já usado pra Textarea/Pagination/Popover); senha com mostrar/ocultar copiado
  literalmente do padrão de `page-login.css` (`.login-password-wrap`/`.login-toggle-password`,
  renomeado pra `.impcert-*`). Duplicidade de número de série bloqueia o salvamento com uma
  mensagem de erro dedicada. Certificado expirado é permitido salvar, com um `alert.warning`
  (Feedback) explicando a restrição — nunca bloqueado.
- **Edição** reaproveita a mesma tela via `?codigo=`: Arquivo/Senha não são reexigidos (editar um
  certificado fiscal não deveria envolver reenviar o arquivo — pra trocar o certificado em si, o
  fluxo é importar um novo e excluir o antigo), só Nome/Observações são editáveis; a seção de
  dados extraídos já nasce visível com os dados existentes.
- **Fluxo 2 (Emitir com Parceiro):** Dialog explicando o redirecionamento; se não há Parceiro
  configurado, mostra aviso e esconde o botão "Acessar parceiro" (nunca um link morto). Com
  Parceiro configurado, abre a URL cadastrada (`window.open`, respeitando "Abrir em nova aba") e
  grava usuário+data/hora em `registrarAcessoParceiro` (`localStorage`, sem tela de histórico
  ainda — fora de escopo, só o registro do dado).
- **Seção "Parceiro de Certificado Digital"** (Nome/URL/"Abrir em nova aba"/Observações) usa o
  mesmo padrão RadioButton Sim/Não já estabelecido em Nova Natureza de Operação ("Padrão"/
  "Consumidor Final") em vez de introduzir `Toggle` (existe no Storybook mas não tinha nenhum
  precedente de uso nesse tipo de campo booleano no app) — reaproveitamento do padrão já
  validado, não do primeiro componente "disponível".
- **2 bugs reais encontrados ao testar ao vivo** (6ª e 7ª ocorrência do padrão `hidden`+`display`
  incondicional neste projeto, depois de `Dialog.module.css`'s `.overlay` e `Table.module.css`'s
  `.actionBtn`): `Button.module.css`'s `.btn{display:inline-flex}` (botão "Acessar parceiro"
  continuava visível mesmo com `hidden` quando não havia Parceiro configurado) e
  `Feedback.module.css`'s `.alert{display:flex}` (banner de "certificado expirado" aparecia no
  modo de edição de um certificado ATIVO). Fix padrão nos dois: `#emitir-dialog-acessar[hidden]`/
  `.impcert-expirado-banner[hidden] { display: none; }` na CSS de cada página.
- **`nova-nota-fiscal.js`:** o botão "Ir para Certificado Digital" do Dialog de bloqueio (antes um
  flash-disable, sem tela real pra navegar) agora navega de verdade pra `certificado-digital.html`.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'fiscal-certificado':
  'certificado-digital.html'`) ativa a navegação real em todas as telas que já tinham o item de
  sidebar (inclusive `naturezas-operacao.html`/`nova-nota-fiscal.html`, que já tinham o markup).
- **`prototype-nav/nav.config.js`:** novo épico `type:'flow'` "Certificado Digital" dentro da
  "Jornada · Configuração" (mesmo padrão do épico "Natureza da Operação"), com a variante "Com
  certificados cadastrados" e uma variante de edição (`?codigo=CERT-001#state=comdados`).

Verificado ao vivo (servidor próprio em `app-preview-2`, porta 8091, adicionado ao `.claude/
launch.json` — a porta 8090 já estava em uso por outra sessão): listagem vazia por padrão e
populada via `#state=comdados`; menu "+ Novo Certificado" abrindo/fechando; Emitir com Parceiro
bloqueado sem parceiro configurado e funcional depois de salvo (histórico gravado em
`localStorage`); importação completa (validação → extração mock com certificado expirado
exibindo o alerta → salvar → toast → volta pra listagem); edição de um certificado ativo (sem
mostrar o alerta indevidamente, confirmando o fix do bug 7); exclusão com confirmação e estado
vazio reaparecendo; card mobile (375px) com badge no cabeçalho; bloqueio de emissão em Nova Nota
Fiscal preservado por padrão (`hasCertificado()` continua `false` sem certificado real
cadastrado) e o botão "Ir para Certificado Digital" navegando de verdade; nenhum erro de console
em nenhuma das 2 telas novas.

## Ajustes 2026-08-03 (round 57) — Certificado Digital: Parceiro sai da experiência do cliente

Pedido explícito do usuário: "Parceiro de Certificado Digital" é configuração administrativa
interna e não deve aparecer pro usuário final. Ajuste sobre o round 56, sem recriar nenhuma tela.

- **`certificado-digital.html`:** removido o card "Parceiro de Certificado Digital" (form
  Nome/URL/Abrir em nova aba/Observações) e o Dialog "Emitir Certificado Digital" por completo.
  "+ Novo Certificado" deixou de abrir um menu (Importar/Emitir) — agora é um botão simples que
  navega direto pra `importar-certificado.html` (mesmo padrão de "+ Nova Natureza de Operação"),
  já que só resta 1 fluxo de adição nesta tela. Links de `Dropdown.module.css`/
  `RadioButton.module.css`/`Input.module.css` removidos do `<head>` (ficaram sem uso). Texto do
  estado vazio ajustado (não menciona mais "emita através do parceiro").
- **`importar-certificado.html`:** ganhou uma seção nova, **fora do `<form>`**, visível só no
  modo de adicionar (nunca na edição) — "Não possui um certificado digital?" + texto + botão
  "Emitir certificado digital". Reaproveita literalmente as classes já existentes desta mesma
  tela (`.impcert-card`/`.impcert-section-title`/`.impcert-section-hint`, mesmo visual das outras
  subseções) em vez de inventar um componente novo ou usar `Feedback`'s `.alert` (que não tem
  precedente de conter um botão de ação no app). Clique abre a URL do parceiro (respeitando
  "Abrir em nova aba") e grava o acesso em `localStorage`, sem modal de confirmação — o pedido
  foi explícito em não expor detalhe técnico do parceiro pro cliente.
- **`certificado-digital-data.js`:** como não sobra nenhuma UI pra configurar o parceiro,
  `getParceiro()` passou a cair num `DEFAULT_PARCEIRO` fixo (Nome/URL/Abrir em nova aba) quando
  não há override em `localStorage` — mesmo raciocínio de `emitente-data.js` (stub simulando um
  painel administrativo que ainda não existe no protótipo). `setParceiro()` continua exposto
  (API pronta pra quando essa tela admin for construída), só não é chamado por nenhuma tela hoje.
- Fluxo com certificado já cadastrado **não foi tocado** — mesma tabela/Status/Validade/Ações de
  antes, sem nenhuma menção a parceiro.

Verificado ao vivo: card Parceiro sumiu da listagem; botão "Novo Certificado" navega direto (sem
menu); seção "Não possui certificado?" aparece em `importar-certificado.html` (modo adicionar) e
some em `?codigo=` (modo edição); clique no botão grava histórico de acesso em `localStorage`;
listagem com certificados cadastrados (`#state=comdados`) inalterada; nenhum erro de console em
nenhuma das 2 telas.

## Ajustes 2026-08-03 (round 58) — Certificado Digital: menu volta, estado vazio ganha 2 opções

Pedido explícito do usuário reabriu parte do round 57: "Emitir novo certificado" não devia ter
sumido de vez — precisa continuar acessível em 2 lugares (menu do botão do topo + estado vazio
da listagem), só nunca como card/config independente (isso continua removido) e nunca dentro da
tela de importação (a seção adicionada no round 57 ali foi removida de novo).

- **`certificado-digital.html`:** "+ Novo Certificado" voltou a abrir um menu (`.menu`/`.option`
  de `Dropdown.module.css`, mesmo padrão do round 56) com "Importar certificado"/"Emitir novo
  certificado" — `Dropdown.module.css` voltou pro `<head>`. **Estado vazio reformulado**: em vez
  de só ícone+texto+botão único, agora tem a mensagem completa pedida + 2 cards de opção lado a
  lado (`.certdigital-empty-option`, 1 coluna no mobile/2 a partir de 640px) — cada um com
  ícone+título+descrição de apoio+botão (`Importar certificado`/`Emitir novo certificado`),
  mesma composição de "card com CTA" já usada em `relatorios.html`'s `.rel-card` (round 53), só
  com um Button real no lugar do link, porque o pedido queria botões de verdade.
- **`certificado-digital.js`:** `emitirComParceiro()` centraliza a ação (abre a URL do parceiro
  respeitando "Abrir em nova aba" + grava acesso) — chamada tanto pela opção do menu quanto pelo
  botão "Emitir novo certificado" do estado vazio, sem duplicar lógica.
- **`importar-certificado.html`/`.js`:** removida de novo a seção "Não possui um certificado
  digital?" (existia desde o round 57) — o pedido deste round deixou explícito que ela não faz
  sentido ali, já que quem chegou nessa tela já escolheu importar. A oferta de emissão agora vive
  só no menu do topo e no estado vazio da listagem.
- Regra que se manteve **igual ao round 57**: parceiro nunca é card/config separada — só
  `DEFAULT_PARCEIRO` em `certificado-digital-data.js` (stub administrativo, mesmo raciocínio de
  `emitente-data.js`), sem nenhuma tela pra editá-lo.

Verificado ao vivo: menu do "+ Novo Certificado" abre com as 2 opções, "Emitir novo certificado"
grava acesso em `localStorage`; estado vazio mostra a mensagem completa + os 2 cards de opção,
botões navegando/abrindo corretamente, responsivo (1 coluna mobile/2 desktop); tela de importação
sem a seção de parceiro (só o formulário); listagem com certificados cadastrados (`#state=
comdados`) inalterada; nenhum erro de console em nenhuma das 2 telas.

## Ajustes 2026-08-04 (round 59) — Nova jornada: Conta Financeira (Configuração > Conta Financeira)

Entidade real de "Conta Financeira" — usada pra gerar o DRE e vincular lançamentos de Caixa
(pedido explícito). Corrige de vez o stand-in temporário que `contas-bancarias-data.js` (round 56)
tinha deixado documentado ("Conta Financeira ainda não existe como entidade própria, reaproveita
`NiveloCategoriasFinanceiras`") — agora existe de verdade e os consumidores foram migrados.

- **Arquivos novos:** `app/shared/contas-financeiras-data.js` (`window.NiveloContasFinanceiras` —
  `list/findByCodigo/nextCodigo/isNomeDuplicado/isEmUso/add/update/remove`, entidade simples:
  `codigo` INT auto-increment + `nome` único); `app/screens/contas-financeiras.html` +
  `page-contas-financeiras.css` + `contas-financeiras.js` (listagem, cópia estrutural de Contas
  Bancárias — busca por Código/Nome, ordenação com Código como padrão inicial, paginação
  10/página, Cards no mobile); `app/screens/nova-conta-financeira.html` +
  `page-nova-conta-financeira.css` + `nova-conta-financeira.js` (cadastro/edição, só 2 campos:
  Código readonly auto-gerado + Nome).
- **Regra de exclusão bloqueada:** `isEmUso(codigo)` verifica se a conta está referenciada por
  algum lançamento de Caixa (`NiveloCaixa`) OU por alguma Conta Bancária (`NiveloContasBancarias`)
  — como este protótipo não tem uma tela de DRE com dataset próprio ainda (Relatórios > DRE
  continua só um card de entrada), "em uso no DRE" e "vinculada a Caixa" são cobertas pela MESMA
  fonte (lançamentos de Caixa são a base que alimentaria o DRE), não duas checagens
  independentes. Modal de exclusão mostra a mensagem de bloqueio (sem botão Excluir, só
  "Fechar") quando em uso — mesmo padrão visual do modal de confirmação, corpo trocado via JS.
- **Duplicidade de nome:** `isNomeDuplicado()` ignora maiúsculas/minúsculas e espaços nas pontas
  (`.trim().toLowerCase()`), checado tanto no submit do formulário quanto reaproveitável por
  qualquer tela futura. Edição só permite alterar o Nome (pedido explícito) — Código nunca é
  enviado como input do usuário, sempre `disabled readonly`.
- **`contas-bancarias-data.js` corrigido:** `contaFinanceiraCodigo` (campo já existia desde o
  round 56, apontando pra `NiveloCategoriasFinanceiras` como stand-in) agora referencia
  `NiveloContasFinanceiras` de verdade — os 4 registros seed migrados de código de Categoria
  (`CAT-00N`) pra código INT de Conta Financeira; `contaFinanceiraDescricao()` atualizada.
  `nova-conta-bancaria.js`'s dropdown "Conta Financeira" passou a ler do catálogo real (antes
  filtrava `NiveloCategoriasFinanceiras` por `ativo`, que não existe mais nesse contexto).
- **Caixa — novo campo obrigatório `contaFinanceiraCodigo`** em todo lançamento (pedido
  explícito: "toda movimentação financeira deve referenciar uma Conta Financeira"), **além** do
  campo `categoriaCodigo` já existente (dimensões diferentes: Categoria classifica receita/
  despesa pra DRE/LCDPR com vocabulário próprio; Conta Financeira é o plano de contas usado pra
  gerar o DRE em si e vincular o lançamento). `novo-lancamento-caixa.html`/`.js` ganharam o campo
  Dropdown "Conta Financeira" na subseção Classificação (ao lado de Categoria), validação
  bloqueando submit vazio, incluído no payload de `add()`. Os 14 lançamentos seed de
  `caixa-data.js` foram retrofitados com um código plausível (1=Caixa Geral pros lançamentos em
  dinheiro, 2=Conta Corrente Operacional pra a maioria via Banco do Brasil/Sicredi, 3=Conta
  Poupança Reserva pro lançamento via Caixa Econômica).
- **Sidebar: novo item "Conta Financeira"** (`data-nav="config-conta-financeira"`, ícone
  `banknote`) inserido entre "Conta bancária" e "Categorias de receitas e despesas" nas 35 telas
  com shell completo — mass-edit via script Node (regex + `fs.writeFileSync`), não editado tela
  por tela. `interface-principal.js`: `NAV_DESTINATIONS['config-conta-financeira'] =
  'contas-financeiras.html'`.
- **`prototype-nav/nav.config.js`:** novo épico "Contas Financeiras" (`type:'flow'`) dentro da
  Jornada · Configuração, entre os épicos "Contas Bancárias" e "Categorias de receitas e
  despesas".
- **Fora de escopo, por não haver dataset real:** o DRE em si (Relatórios > DRE) continua sem
  fluxo construído — "usar essa entidade na geração do DRE" foi atendido preparando o vínculo de
  dados (toda movimentação de Caixa já referencia uma Conta Financeira), não construindo a tela
  de relatório, que é um pedido de outra rodada (ver `relatorios.html`, round 53).

Verificado ao vivo: listagem ordenada por Código com os 4 registros seed; exclusão bloqueada em
conta vinculada (mensagem correta, sem botão Excluir) e lógica de `add()`/`isNomeDuplicado()`
confirmada (duplicidade ignora caixa/espaços, autoincremento sequencial correto); edição
pré-preenchendo Nome com Código travado; `nova-conta-bancaria.html` mostrando a Conta Financeira
migrada corretamente (código 2 → "Conta Corrente Operacional"); `novo-lancamento-caixa.html`
bloqueando submit sem Conta Financeira selecionada, dropdown com as 4 opções reais; item de
sidebar presente e navegável em todas as telas testadas; nenhum erro de console em nenhuma das
telas tocadas.

## Ajustes 2026-08-04 — Certificado Digital: "Visualizar" vira tela própria (Ver detalhes)

`certificado-digital.js` abria um Dialog modal pro botão "Visualizar" (round 56). Ajustado pra
seguir o mesmo padrão de "Ver detalhes" já usado em Estoque/Talhão/Fazenda/Contas a Pagar (tela
própria de leitura, nunca um Dialog): nova tela `app/screens/certificado-detalhe.html` (+
`page-certificado-detalhe.css` + `certificado-detalhe.js`), resolvida por `#codigo=<codigo>`
(mesmo padrão de hash já usado em Talhão/Fazenda). Reaproveita `.certdigital-view-grid` de
`page-certificado-digital.css` pros campos — só o container/cabeçalho/back-link são novos.
Botão "Editar" navega pra `importar-certificado.html?codigo=`. Modal "Visualizar" (overlay +
Dialog) removido de `certificado-digital.html`/`.js`. Registrado no `prototype-nav` com variante
"Certificado não encontrado". Verificado ao vivo: certificado ativo e cancelado renderizando
todos os campos corretamente, estado "não encontrado" funcionando, nenhum erro de console.

## Ajustes 2026-08-04 — Manifesto: "Ver detalhes" vira tela própria (não mais o form disabled)

Módulo de Manifesto (Fiscal > Manifesto, `manifestos.html`/`novo-manifesto.html`/
`manifestos-data.js`) reaproveitava o padrão `?modo=ver` de Nova Nota Fiscal — o form de criação
reaberto com todos os inputs `disabled`. Pedido explícito do usuário: seguir o padrão de "Ver
detalhes" dominante no resto do sistema (Estoque/Talhão/Contas a Pagar/Certificado Digital — tela
própria, nunca reaproveitar um form em modo disabled).

- **Nova tela: `app/screens/manifesto-detalhe.html`** (+ `page-manifesto-detalhe.css` +
  `manifesto-detalhe.js`), resolvida por `#numero=<numero>`. Seções: Dados gerais (número/data/
  placas), Emitente (via `NiveloEmitente`, mesmo dado de Nova Nota Fiscal), Motorista, Origem e
  destino, Documentos fiscais vinculados (lista), Seguro (só quando preenchido) e Pagamento do
  frete. Ações "Editar" (navega pro form em `modo=corrigir`) e "Cancelar manifesto" (mesmo Dialog
  de confirmação que já existia em `manifestos.html`, replicado aqui) — ambas escondidas quando o
  manifesto já está cancelado.
- **`manifestos.js`:** ação "ver" (ícone `eye`, rótulo "Ver detalhes") passou a navegar pra
  `manifesto-detalhe.html#numero=` em vez de `novo-manifesto.html?modo=ver`.
- **Bug real, 8ª ocorrência do padrão `hidden`+`display` incondicional já documentado dezenas de
  vezes neste projeto:** `Button.module.css`'s `.btn{display:inline-flex}` sem guard de
  `[hidden]` — os botões Editar/Cancelar continuavam visíveis num manifesto cancelado mesmo com o
  atributo presente. Fix: `#manidet-editar-btn[hidden], #manidet-cancelar-btn[hidden] {
  display:none}` em `page-manifesto-detalhe.css`.
- **`novo-manifesto.js`'s ramo `modo === 'ver'` não foi removido** (deliberado, não por
  esquecimento) — o módulo de Manifesto está sendo desenvolvido em paralelo por outra sessão
  neste mesmo período; mexer no form de criação/edição além do necessário pra esta correção
  pontual fica fora de escopo, pra não conflitar com esse trabalho concorrente.
- `prototype-nav/nav.config.js`: nova entrada "Detalhe do manifesto" com variantes Com seguro/
  Cancelado/Não encontrado; variante antiga "Ver detalhes" (`?modo=ver`) removida.

Verificado ao vivo: manifesto emitido (com seguro) e cancelado renderizando todas as seções
corretas; ações escondidas de verdade num manifesto cancelado (confirmado o fix do bug 8);
estado "não encontrado"; clique em "Ver detalhes" a partir da listagem chegando na tela nova;
nenhum erro de console.

## Ajustes 2026-08-04 — Nova jornada: Assistente IA > Nova Conversa (chat com IA)

Nova tela `app/screens/nova-conversa.html` (+ `page-nova-conversa.css` + `nova-conversa.js` +
`app/shared/assistente-data.js`), interface de chat com o Assistente de IA da Nivelo — layout de
2 colunas (chat + histórico), inspirado em ChatGPT/Claude mas 100% composto a partir de tokens/
componentes já existentes (`.card` do Table como container, `Button`/`Input` reais, sem nenhum
componente novo no Storybook).

- **Sidebar:** item "Histórico" removido de TODAS as 40 telas de `app/screens/*.html` (mass-edit
  via `perl -0777 -pi`, mesma técnica de scripts de edição em massa já documentada neste
  projeto) — o histórico de conversas passou a existir só dentro desta tela. `interface-
  principal.js` ganhou `'assistente-nova-conversa': 'nova-conversa.html'` em `NAV_DESTINATIONS`
  (o item de sidebar já existia como stub desde a criação do grupo Assistente IA).
- **`assistente-data.js`:** módulo de dados novo — `list/findById/create/addMensagem/
  gerarResposta/gerarRespostaAudio`, mesma convenção IIFE em memória dos demais módulos (sem
  persistência entre reloads). 6 conversas de exemplo (mix de origem `sistema`/`whatsapp`,
  incluindo uma com mensagem de voz). Conversas do WhatsApp e do Sistema usam o MESMO array,
  diferenciando-se só pelo campo `origem` — nunca duas listas separadas (nota de desenvolvimento
  explícita do pedido).
- **Assistente restrito a 2 temas** (regra de negócio explícita): `gerarResposta(texto)` usa 2
  regex (nota fiscal / Caderno de Campo) — qualquer outro assunto recebe a mensagem padrão "No
  momento, posso ajudar apenas com solicitações de notas fiscais e registros no Caderno de
  Campo...". Mensagens de voz sempre recebem uma resposta fixa explicando que a transcrição
  automática ainda não existe no protótipo.
- **Envio de mensagem:** bolha do usuário aparece imediatamente; indicador de digitação (3
  pontos animados, `Assistente está digitando...`) some sozinho depois de ~0,7-1,4s (mock de
  streaming/latência real, `setTimeout` — nota de desenvolvimento pede infraestrutura de tempo
  real, fora de escopo de um protótipo estático) e a resposta aparece automaticamente. Título da
  conversa é gerado a partir da 1ª mensagem de texto do usuário (trunca em ~48 caracteres),
  enquanto ainda estiver "Nova conversa".
- **Mensagem de voz (mock, sem captura de áudio real):** botão de microfone alterna estado de
  gravação (borda vermelha pulsante + cronômetro no lugar do campo de texto); ao parar, gera uma
  mensagem de áudio com a duração real decorrida. Player próprio (`.nc-audio-player`): botão play/
  pause, barra de progresso e duração — clique anima a barra via `transition` de largura pela
  duração exata da gravação (sem arquivo de áudio real, já que o protótipo não grava/reproduz
  som de verdade); só um áudio toca por vez.
- **Histórico:** ordenado sempre da conversa mais recente pra mais antiga (por horário da última
  mensagem, não da criação); cada item mostra título/data/origem; item ativo destacado
  (`.is-active`); "Ver mais" revela mais 5 por clique, sem reload, some quando não há mais nada
  pra carregar. "+ Nova conversa" limpa a área principal, foca o campo de mensagem e não cria o
  registro até a 1ª mensagem ser enviada (evita poluir o histórico com conversas vazias).
- `prototype-nav/nav.config.js`: nova tela "Nova conversa" na "Jornada · Assistente IA".

Verificado ao vivo: navegação real a partir da Sidebar (inclusive de outra tela, grupo Assistente
IA abrindo com "Nova conversa" já destacado); histórico com 6 conversas + paginação "Ver mais";
clique num item carrega a conversa certa (texto e áudio); envio de texto reconhecendo os 2 temas
E o fallback de assunto não suportado; player de áudio animando a barra de progresso pela duração
correta; gravação de voz (start/stop) criando a mensagem e recebendo a resposta padrão; nenhum
erro de console em nenhum dos 2 fluxos testados.
