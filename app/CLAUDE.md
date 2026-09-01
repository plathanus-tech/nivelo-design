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

## Ajustes 2026-08-05 (round 70) — Nova jornada: Vídeos

Ativado o item de sidebar "Vídeos" (`data-nav="videos"`, ícone `circle-play`, stub visual desde a
criação do shell — sem `NAV_DESTINATIONS`). Escopo do pedido: só a listagem que os usuários
consomem (o cadastro/gestão é uma funcionalidade administrativa ainda não pedida como tela).

- **Arquivos novos:** `app/shared/videos-data.js` (`window.NiveloVideos`); `app/screens/
  videos.html` + `app/shared/page-videos.css` + `app/shared/videos.js`.
- **Vídeos nunca são armazenados no sistema** — só o vínculo com o YouTube (URL + metadados já
  extraídos) é persistido, conforme pedido. `videos-data.js` guarda só `videoId`/`titulo`/
  `categoria`/`thumbnail`/`canal`/`publicadoEm` por vídeo, nunca o vídeo em si.
- **Regras de negócio implementadas na CAMADA DE DADOS, mesmo sem tela de cadastro ainda**
  (mesmo raciocínio já usado em `certificado-digital-data.js` round 56 — `setParceiro()`/
  `registrarAcessoParceiro()` prontos antes de qualquer admin screen — e em `emitente-data.js`):
  `isValidYoutubeUrl()`/`extractVideoId()` aceitam `youtube.com/watch?v=`, `youtu.be/`,
  `/shorts/` e `/embed/`; `fetchMetadata()` usa o endpoint público de **oEmbed do YouTube**
  (`https://www.youtube.com/oembed?url=...&format=json`, sem chave de API) pra obter título
  automaticamente, e `buildThumbnailUrl()` usa o padrão público de thumbnail
  (`img.youtube.com/vi/<id>/hqdefault.jpg`) — ambos mecanismos documentados publicamente pelo
  YouTube, sem depender de nenhuma integração paga. `add()` rejeita (mensagem de erro) quando o
  link é inválido ou os metadados não puderem ser obtidos, e bloqueia vídeos duplicados (mesmo
  `videoId`). Nenhuma tela chama `add()` ainda — fica pronto pra quando a tela administrativa de
  cadastro for pedida.
- **Seed:** 7 vídeos fictícios (`videoId` inventado, ex. `nivelo0001` — mesma convenção de dado
  fictício plausível já usada em todo o protótipo, ex. CNPJ/número de série de certificado) com
  `thumbnail: null`, cobrindo as 6 categorias fixas (Primeiros passos/Notas Fiscais/Financeiro/
  Estoque/Caderno de Campo/Assistente IA). `list()` sempre ordena do mais recente pro mais antigo
  (`publicadoEm` desc), conforme pedido.
- **Card sem thumbnail real usa um placeholder de gradiente + ícone `play-circle`** (`.videos-
  thumb-placeholder`) em vez de tentar carregar uma URL de imagem inventada — evita depender de
  uma URL de conteúdo externo real que este protótipo não pode garantir que exista. Quando um
  vídeo tiver `thumbnail` real (fluxo de cadastro futuro), o card já renderiza a imagem de
  verdade via `<img>`, sem nenhuma mudança de código.
- **Card inteiro é clicável** (mesmo padrão de "card inteiro navegável" já usado no feed do
  Canal de Ideias: `role="link"`, `tabindex="0"`, Enter/Espaço funcionam) — clique abre
  `window.open(url, '_blank', 'noopener,noreferrer')`, nunca um player embutido, conforme
  pedido explícito ("Não utilizar player incorporado nesta versão"). Categoria como `.badge`
  colorido por categoria (mesma técnica de mapa `CATEGORIA_COR` já usada em `canal-ideias.js`),
  ícone do YouTube via SVG inline (mesma exceção documentada do WhatsApp — **correção do round
  71:** `data-lucide="youtube"` foi usado aqui inicialmente por engano; o Lucide não tem esse
  ícone na versão servida pelo CDN, ver round 71).
- **Grid responsivo `auto-fill`** (`minmax(280px,1fr)`, mesma técnica já usada em Fazendas/Canal
  de Ideias pra listas que crescem dinamicamente) — 1 coluna no mobile, várias no desktop
  conforme o espaço disponível, sem contagem fixa de colunas (o admin pode adicionar quantos
  vídeos quiser).
- **Bug evitado preventivamente, mesma classe já documentada dezenas de vezes neste projeto:**
  `.videos-grid`/`.videos-empty` (que alternam via atributo `hidden` conforme a lista está vazia
  ou não) já nasceram com os guards `[hidden]{display:none}` desde a primeira versão do CSS —
  sem isso, `display:grid`/`display:flex` incondicionais derrotariam o `hidden` do jeito que já
  aconteceu dezenas de vezes com `.overlay`/`.actionBtn`/`.btn`/`.alert`/etc.
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`videos: 'videos.html'`) ativa
  a navegação real em todas as telas que já tinham o item de sidebar. **`prototype-nav/
  nav.config.js`:** nova "Jornada · Vídeos" com a tela única.

Verificado ao vivo: os 7 vídeos seed renderizando ordenados do mais recente pro mais antigo;
clique no card (interceptando `window.open`) abrindo a URL certa do YouTube em nova aba, sem
player embutido; navegação real a partir da Sidebar de outra tela (Dashboard); estado vazio
(simulado via `NiveloVideos.list` sobrescrito) mostrando a mensagem central corretamente, sem o
bug de `hidden`+`display`; grid responsivo sem overflow horizontal em 375px; nenhum erro de
console real (só os 404 de `/fonts/*.otf` já pré-existentes em toda tela do sistema, não
relacionados a esta feature).

## Ajustes 2026-08-05 (round 71) — Nova área: Minha Conta + Fluxo completo de compra

Pedido grande em 2 partes: (1) área "Minha Conta" (3 abas: Dados/Plano/Pagamento), ativando o
stub de sidebar `config-minha-conta` (sem destino desde a criação do shell); (2) fluxo de
checkout completo (`comprar-plano.html`), acessível tanto do Dashboard ("Contratar agora") quanto
do modal de trial expirado ("Realizar pagamento") — **a mesma tela nos dois casos**, conforme
pedido explícito.

- **3 módulos de dados novos:** `app/shared/planos-data.js` (`window.NiveloPlanos` — os mesmos 4
  planos e valores mensais já usados na landing page, `list/findById/isUpgrade/
  precoPorModalidade`, desconto anual de 20% sobre 12x, mesma regra da landing — mantidos em
  sincronia manual, sem import cruzado entre `landing/` e `app/`, ver "Escopo" no topo deste
  arquivo); `app/shared/assinatura-data.js` (`window.NiveloAssinatura` — mock da assinatura atual
  por cenário, `TODAY` fixo `'2026-07-31'`, mesma convenção de `contas-pagar-data.js`, campos
  derivados `diasParaVencer`/`vencida`/`diasRestantesTeste` calculados a partir da data de
  vencimento, nunca guardados); `app/shared/minha-conta-data.js` (`window.NiveloMinhaConta` —
  dados cadastrais do titular, módulo NOVO e separado de `emitente-data.js` — os dois coexistem
  por design, sem import cruzado, mesmo raciocínio já documentado pra `natureza-operacao-data.js`
  × `naturezas-operacao-data.js`).
- **Minha Conta (`app/screens/minha-conta.html`):** 3 abas via `Tab` real (`#mc-tablist`), estado
  inicial/cenário de demonstração via hash combinado `#tab=X&state=Y` (mesmo mecanismo de
  `#step=N&state=X` já usado em `nova-fazenda.html`).
  - **Aba Dados:** Nome/CPF-CNPJ/E-mail/Telefone/Senha (campo vazio, placeholder "Deixe em branco
    para manter a senha atual" — nunca mostra a senha real) + Endereço completo (CEP com máscara
    + autofill via ViaCEP, mesma técnica de `cadastro-endereco.js`; Estado como `Dropdown` real,
    27 UFs) + seção **"Dados adicionais para cobrança (opcional)"** reservada pra uma futura
    exigência da Cielo (Data de nascimento + Documento do titular do cartão, se diferente) —
    nenhum dos dois é usado hoje em lugar nenhum do checkout, só reservados por precaução
    conforme pedido ("deixe espaço para esses campos"). Único botão: "Salvar alterações"
    (`NiveloMinhaConta.update()` + toast).
  - **Aba Plano:** card de resumo (Plano atual/Status/Forma de contratação/Data de início/
    vencimento, badge por status: teste=info, ativo=success, aguardando=warning,
    cancelado=error); card informativo de trial ("Você está utilizando o plano X gratuitamente
    até DD/MM/AAAA.", só quando `status==='teste'`); botão "Escolher outro plano" revela um
    seletor com toggle Mensal/Anual (mesmo padrão visual `.pricing-toggle` já usado na landing,
    reconstruído aqui com classes próprias `mc-picker-*` — `landing/` e `app/` não compartilham
    CSS) + os 4 planos em cards. **Decisão de escopo confirmada no código:** como este protótipo
    não tem (nem foi pedido) lógica de proração/downgrade automática, qualquer troca de plano
    escolhida aqui (não só upgrade, que foi o caso explicitamente descrito no pedido) abre o
    mesmo modal informativo — "O valor do upgrade será calculado proporcionalmente ao período
    restante da sua assinatura" + botão "Falar com Comercial" (WhatsApp, `wa.me/...`, mesmo SVG
    inline do ícone já usado no item Suporte da Sidebar) — nunca um upgrade automático. O fluxo
    de checkout completo (`comprar-plano.html`) é reservado só pra CONTRATAÇÃO NOVA (trial/sem
    plano/vencido), nunca pra troca de plano de quem já é assinante ativo.
  - **Aba Pagamento:** Forma de contratação atual/Situação/Próxima cobrança (mensal) ou
    Vencimento (anual). Aviso de renovação próxima (`.alert.warning`, licença anual, ≤30 dias,
    ainda não vencida) e aviso de plano vencido (`.alert.error` + "Comprar novamente" →
    `comprar-plano.html?motivo=vencido`) são mutuamente exclusivos e calculados a partir de
    `assinatura.diasParaVencer`/`vencida`, nunca hardcoded. "Renovar licença" (anual, não vencida)
    → `comprar-plano.html?motivo=renovacao` — mesmo fluxo de compra, conforme pedido ("Este botão
    abre novamente o mesmo fluxo de compra"). "Cancelar renovação" (mensal com renovação
    automática ativa) abre um modal de confirmação (`.btn.destructive`) e, ao confirmar, mostra a
    frase exata pedida: "O acesso permanecerá disponível até o final do período já pago." +
    toast. Histórico de compras (Data/Plano/Tipo/Valor/Status) — tabela padrão, estado vazio
    próprio quando não há nenhuma compra ainda.
- **Fluxo de compra (`app/screens/comprar-plano.html`), chrome minimalista sem Sidebar** (decisão
  deliberada — checkout de e-commerce convencionalmente remove distrações de navegação pra
  manter o foco, mesmo espírito "moderno/profissional/transmitir confiança" pedido) — só um topo
  com logo + "Cancelar e voltar" (pro Dashboard). Indicador de 3 etapas (mesma linguagem visual
  do wizard de `nova-fazenda.html`/Criar Conta, classes próprias `cp-step*` — não reaproveita
  `page-cadastro.css`, que é auth-only). **Mesma tela em ambas as origens** (Dashboard "Contratar
  agora" e modal de trial expirado "Realizar pagamento"), como pedido explicitamente — só um
  parâmetro `?motivo=renovacao|vencido` opcional ajusta um banner de contexto no topo, nunca o
  comportamento.
  - **Etapa 1 (Plano):** 4 cards comparáveis (nome/tagline/recursos/preço "a partir de
    R$X/mês"), clicar em "Escolher plano" já avança pra Etapa 2 (auto-avanço, conforme pedido:
    "Ao selecionar um plano, seguir para a próxima etapa" — diferente da Etapa 2, que exige um
    clique explícito em "Continuar"). **Sem seletor Mensal/Anual nesta etapa** — decisão
    corrigida durante a implementação: a Etapa 2 inteira já existe pra decidir isso; um toggle na
    Etapa 1 duplicaria a decisão e contradiria o desenho de 2 etapas distintas pedido.
  - **Etapa 2 (Modalidade):** 2 cards clicáveis (não radio nativo) — Licença mensal (preço +
    "Cobrança recorrente automática, uma vez por mês. Cancele quando quiser.") e Licença anual
    (preço mensal-equivalente + selo "Economize 20%" + "Pague o ano inteiro de uma vez... e
    economize"), atendendo o pedido de "explicar rapidamente a diferença". "Continuar" só habilita
    depois de uma escolha.
  - **Etapa 3 (Pagamento):** método só aparece pra escolher (Cartão/PIX) quando `modalidade===
    'anual'` — mensal é sempre só Cartão, com a frase exata pedida ("A assinatura será renovada
    automaticamente todos os meses.") abaixo dos campos. Cartão: Número (máscara de 4 em 4)/Nome
    impresso/Validade (MM/AA)/CVV, nenhuma técnica de máscara de cartão existia no projeto antes
    (implementada do zero, mesma filosofia de máscara progressiva sem lib externa já usada em
    Área/Moeda/CPF-CNPJ). Parcelamento 1x-12x **só quando Anual + Cartão** (mensal não parcela —
    é uma assinatura recorrente, não uma compra única), sem juros (decisão de escopo, não
    especificada no pedido, documentada no código). PIX (só quando Anual escolhido): QR code
    **ilustrativo mas visualmente real** (SVG gerado via grade 21×21 determinística com padrão de
    "olhos" nos 3 cantos, técnica nova no projeto, sem lib externa — decisão deliberada de não
    usar um placeholder tracejado genérico aqui, já que "transmitir confiança" foi pedido
    explicitamente) + código copia-e-cola fictício com botão Copiar (Clipboard API) +
    instruções + badge "Aguardando pagamento". **Botão "Verificar pagamento" com mock de 2
    cliques** (1º "ainda não identificamos", 2º confirma) — simula o atraso real de compensação
    de um PIX sem precisar de backend/webhook, mesmo espírito do código OTP fixo (`111111`) do
    Login. **Cupom de desconto:** `NIVELO10`/`NIVELO20` válidos (10%/20% off), qualquer outro
    "Cupom inválido" — atualiza o Resumo automaticamente. **Resumo da compra** (aside sticky):
    Plano/Modalidade/Valor/Desconto (só se houver cupom)/Parcelamento (só cartão parcelado)/
    Total, sempre recalculado a cada mudança (método, parcelas, cupom).
  - **Cartão de teste pra recusa, interativo:** número terminado em `0002` sempre recusa
    (`.alert.error` inline, "Verifique os dados do cartão ou tente outro cartão."), qualquer
    outro aprova — mesmo padrão de "valor mágico de teste" já usado no OTP do Login, já que não
    há gateway real neste protótipo. Overlay de carregamento (~1,3s, "Processando pagamento...")
    entre o clique em "Confirmar pagamento" e o resultado.
  - **Confirmação:** ícone de sucesso + "Pagamento realizado com sucesso." + Plano contratado/
    Tipo da assinatura/Próxima renovação (mensal, +1 mês) ou Próximo vencimento (anual, +12
    meses) + "Ir para o Dashboard". Indicador de etapas escondido nesta tela (não faz sentido
    mostrar "Etapa 3" numa tela que já não é mais uma etapa do formulário).
- **Dashboard:** "Contratar agora" (`#dash-trial-upgrade-btn`) e "Realizar pagamento" (modal de
  trial expirado, `#trial-block-pay`) — eram flash-disable, agora navegam de verdade pra
  `comprar-plano.html`. "Falar com administrador" continua flash-disable (fora do escopo deste
  pedido, não é fluxo de pagamento). **2 variantes novas de demonstração:** `#state=
  renewalwarning` (banner `.dash-renewal-banner`, licença anual vencendo em breve, com "Renovar
  licença" → `comprar-plano.html?motivo=renovacao`) e `#state=planoexpirado` (novo modal de
  bloqueio `#plan-expired-overlay`, mesma composição exata do bloqueio de trial — sem X, sem
  fechar por fora/Esc — mas com a mensagem "Seu plano expirou." + "Comprar novamente" →
  `comprar-plano.html?motivo=vencido`; **conceitualmente distinto** do bloqueio de trial: é pra
  quem JÁ foi assinante pago, não pra quem nunca contratou).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS` (`'config-minha-conta':
  'minha-conta.html'`) ativa a navegação real em todas as telas que já tinham o item de sidebar.
- **`prototype-nav/nav.config.js`:** nova "Jornada · Minha Conta" (Minha Conta × 3 variantes de
  aba/estado + Contratar plano × 2 variantes de origem) + 2 novas variantes em "Jornada · Sistema"
  (Dashboard: `renewalwarning`/`planoexpirado`).
- **Bug real de uma feature ANTERIOR encontrado e corrigido nesta rodada, ao testar o ícone do
  YouTube de `videos.js` (round 70) num teste comparativo de ícones:** `data-lucide="youtube"`
  não existe na build do Lucide servida pelo CDN (`unpkg.com/lucide@latest`) — o ícone nunca
  renderizava (confirmado via `Object.keys(window.lucide.icons)`, vazio pra qualquer variação de
  "youtube"). Corrigido trocando pro mesmo padrão já usado pro WhatsApp: SVG inline com
  `fill="currentColor"` (exceção documentada à regra "sem SVG inline" — a marca não existe no
  Lucide). **Lição:** o `lucide.icons` object usa chaves PascalCase (`ChevronDown`, não
  `chevron-down`) — pra checar se um ícone existe de verdade via console, converter o nome
  kebab-case pro PascalCase antes de checar `window.lucide.icons[nome]`.
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma
  compra concluída/cancelamento de renovação/edição de dados só existe durante a sessão de JS da
  própria página — ao navegar pra outra tela, os dados voltam ao mock seed. O toast/tela de
  sucesso aparece corretamente; a mudança em si não persiste na Sidebar/Dashboard.

Verificado ao vivo (servidor `app-preview-2`, porta 8091): Minha Conta com as 3 abas trocando
(hash `#tab=&state=`), formulário de Dados pré-preenchido + CEP/Estado funcionando, aba Plano com
os 4 cenários de status corretos (badge/datas/card de trial), "Escolher outro plano" abrindo o
seletor com toggle Mensal/Anual funcionando e o modal de WhatsApp abrindo com o plano certo; aba
Pagamento com os 5 cenários (mensal ativo/cancelado, aguardando, renovação próxima, vencido) todos
mostrando o aviso/botão certo, fluxo completo de "Cancelar renovação" (modal → confirmação →
nota + toast) testado; fluxo de compra completo testado 3 vezes (Cartão anual com cupom aplicado
e total recalculado corretamente R$1.622,40→R$1.460,16; PIX com QR/código/2 cliques de
"Verificar pagamento" até confirmação; cartão terminado em 0002 recusando com a mensagem certa),
confirmação mostrando plano/tipo/data de renovação corretos nos 2 casos (mensal +1 mês, anual +12
meses); "Contratar agora" e "Realizar pagamento" do Dashboard navegando de verdade pro checkout;
`#state=renewalwarning`/`#state=planoexpirado` do Dashboard mostrando banner/modal corretos;
navegação real da Sidebar até Minha Conta; nenhum erro de console real em nenhuma das 3 telas
novas (só os 404 de `/fonts/*.otf` já documentados como pré-existentes em todo o sistema).

## Ajustes 2026-08-05 (round 72) — Fluxo de compra: Etapa 1 redesenhada + 3 bugs reais corrigidos

Pedido em 4 partes, sobre `comprar-plano.html` (round 71). Reduziu o wizard de 3 etapas pra 2
(Plano → Pagamento) — Modalidade deixou de ser uma etapa própria.

- **Etapa 1 redesenhada: de "cards de landing page" pra acordeão vertical.** Os 4 planos eram
  cards lado a lado com preço em destaque, idêntico ao visual da landing — pedido explícito pra
  não parecer página comercial, já que o usuário já está dentro do produto contratando/alterando
  um plano. Agora é uma lista vertical (`.cp-plan-accordion`/`.cp-plan-item`), um plano por linha,
  que expande in-place ao clicar (accordion, só um aberto por vez): dentro do item expandido,
  lista de recursos + as 2 opções de modalidade (Mensal/Anual, cada uma com preço + badge
  "Economize 20%" na anual) + botão "Continuar" (escopado àquele plano, só habilita depois de
  escolher uma modalidade). **Isso elimina a Etapa 2 (Modalidade) como passo próprio** — a escolha
  de modalidade acontece dentro do mesmo passo que a escolha do plano. Indicador de etapas
  reduzido de 3 pra 2 (`Plano`/`Pagamento`).
- **Texto do topo corrigido pra refletir as regras reais de troca de plano** (antes dizia "Você
  pode trocar de plano quando quiser depois, em Minha Conta" — impreciso, já que as regras
  variam por modalidade): "No plano mensal, a troca de plano vale a partir do próximo ciclo de
  cobrança. No plano anual, é possível fazer upgrade a qualquer momento — a troca para um plano
  inferior só é permitida na renovação."
- **3 bugs reais corrigidos na Etapa de Pagamento** (renumerada pra Etapa 2), todos a mesma causa
  raiz: `RadioButton.module.css` é carregado nesta tela (pro método Cartão/PIX) e colide com
  classes genéricas de outros componentes, mesmo padrão documentado dezenas de vezes neste
  projeto:
  1. **Campos do cartão invisíveis:** `RadioButton.module.css`'s `.input{opacity:0;position:
     absolute;width:1px;height:1px}` (esconde o radio nativo) vazava pra QUALQUER `<input
     class="input">` de texto real da página — número/nome/validade/CVV do cartão, cupom, código
     PIX. Fix: `.input:not([type="radio"]) { position:static;opacity:1;width:100%;height:auto; }`
     em `page-comprar-plano.css` (mesmo padrão preventivo já usado em Estoque/Nova Natureza de
     Operação/Balancete pra essa exata colisão).
  2. **Parcelamento agrupado horizontalmente, não empilhado:** `RadioButton.module.css`'s
     `.option{display:inline-flex}` colidia com o `.option` do MENU do Dropdown de parcelas
     (mesmo nome de classe, componente diferente) — as 12 opções (1x a 12x) ficavam lado a lado
     em vez de uma por linha. Fix escopado só ao menu de parcelas (`#cp-parcelas-menu .option {
     display:block; width:100%; }`), sem tocar no `.option` real do RadioButton (usado por
     Cartão/PIX e pelas novas opções de modalidade, que precisam continuar `inline-flex`).
  3. **Radio de método de pagamento não aparecia marcado:** `RadioButton.module.css` pinta o dot
     via classe `.checked` no `<label class="option">`, nunca via `:checked` do input nativo — o
     JS original nunca sincronizava essa classe ao trocar Cartão/PIX. Fix: `.checked` sincronizada
     em `setupStep2()` e no handler `change` dos radios de método, mais um reforço via CSS
     `:has()` (`.cp-method-option:has(.input:checked) .dot { opacity:1; }`) que garante o efeito
     visual mesmo se a sincronização via JS falhar por qualquer motivo — aplicado também nas
     novas opções de modalidade dentro do acordeão.
- **Resumo/lógica de preço/cupom/parcelamento não foram tocados** — só a apresentação da Etapa 1
  e os 3 bugs da Etapa de Pagamento. `pedido.planoId`/`modalidade` continuam preenchidos do mesmo
  jeito, só a origem da escolha (clique no botão "Continuar" dentro do item expandido) mudou.

Verificado ao vivo: acordeão expande um plano por vez (fechando os outros automaticamente); opção
de modalidade marca o radio de verdade (dot visível, borda azul) e habilita "Continuar" só depois
de escolher; clique em "Continuar" leva pra Pagamento com os campos do cartão TOTALMENTE visíveis
(`position:static`, `opacity:1`, largura real ~568px, confirmado via `getComputedStyle`); rádio de
Cartão/PIX aparecendo marcado ao trocar; as 12 opções de parcelamento empilhadas verticalmente
(mesma coordenada X, Y sequencial, confirmado via `getBoundingClientRect`); fluxo completo até a
confirmação testado de novo, sem regressão; nenhum erro de console real (só os 404 de
`/fonts/*.otf` já documentados).

## Ajustes 2026-08-05 (round 73) — Minha Conta: modo leitura/edição, nova aba Segurança,
modal de troca de plano com regra de downgrade; Fluxo de compra: navegação e cupom

Pedido em 9 partes sobre Minha Conta (round 71/72) e o fluxo de compra (round 72).

- **Aba Dados vira tela de detalhes (leitura por padrão):** todos os campos nascem
  `disabled`; botão "Editar" (`.btn.secondary.sm.hasLeft`, ícone `pencil`) no lado oposto do
  título "Dados cadastrais" habilita os campos + revela "Cancelar"/"Salvar alterações"
  (escondidos em modo leitura). "Cancelar" recarrega os valores originais de
  `NiveloMinhaConta.getConta()` e volta ao modo leitura sem persistir nada.
- **Campo "Data de nascimento" promovido pra dado real** (antes reservado/vazio pra uma
  futura exigência da Cielo) — agora faz parte de "Dados cadastrais" com valor preenchido.
  **Seção "Dados adicionais para cobrança" removida por completo** (Data de nascimento
  migrada pra cima; "Documento do titular do cartão" removido do HTML/JS/dado — não tinha
  nenhum consumidor real no checkout).
- **Aba Plano: modal de troca de plano com acordeão** (mesma linguagem visual de
  `comprar-plano.html`, prefixo `mc-modal-*` pra não colidir com as classes `cp-*` da outra
  tela) substitui o painel inline de toggle Mensal/Anual + 4 cards. Clicar "Escolher outro
  plano" abre `#mc-plan-modal-overlay`; expandir um plano revela Mensal/Anual + "Continuar";
  ao confirmar, fecha esse modal e abre o já existente `#mc-upgrade-overlay` (Falar com
  Comercial) — a arquitetura "qualquer troca de plano de assinante ativo vai pro Comercial"
  (round 71) não mudou, só a INTERAÇÃO de escolha.
  - **Regra de downgrade implementada:** `isPlanoElegivel()` em `minha-conta.js` — numa
    licença ANUAL `ativa`, planos igual/inferior ao atual (downgrade, via
    `NiveloPlanos.isUpgrade()`) só entram na lista quando `diasParaVencer <= 30`; upgrades
    sempre aparecem; mensal/teste/aguardando/cancelado não têm essa restrição. Testado nos 2
    extremos: cenário `ativo` (plano mais alto, longe da renovação) mostra a lista vazia com
    mensagem explicativa; cenário `mensal` mostra os 3 outros planos sem restrição.
  - **Bug de footer cortado corrigido preventivamente:** `#mc-upgrade-overlay`/
    `#mc-plan-modal-overlay` passaram de `dialog sm` (360px) pra `dialog md` (540px) + `.footer
    {flex-wrap:wrap}` — evita o padrão já documentado (round 4) de rótulo longo ("Falar com
    Comercial") cortando o botão vizinho num modal estreito. Confirmado via
    `getBoundingClientRect()`: os 2 botões cabem lado a lado sem sobreposição.
- **Espaçamento padrão entre cards:** `.mc-panel{display:flex;flex-direction:column;gap:
  var(--spacing-lg)}` (com guard `[hidden]{display:none}`, mesmo bug recorrente) — resolve de
  uma vez tanto o espaçamento pedido entre o card do Plano e o botão "Escolher outro plano"
  quanto entre as informações de Pagamento e o Histórico de compras (nenhum dos dois tinha gap
  antes, só ordem de bloco sem `flex`).
- **Nova aba "Segurança":** senha mascarada (`********`, nunca a senha real) + "Última
  alteração: DD/MM/AAAA" + botão "Alterar senha". `minha-conta-data.js` ganhou
  `senhaUltimaAlteracao`/`senhaAtualMock` (valor mágico de teste, mesmo espírito do OTP fixo
  do Login — sem backend real).
- **Modal "Alterar senha":** Senha atual/Nova senha/Confirmar, reaproveitando literalmente os
  critérios de segurança de `criar-nova-senha.html` (lista `.pwd-criteria`, CSS copiado pra
  `page-minha-conta.css` já que a tela não carrega `page-criar-nova-senha.css`). Validação:
  senha atual incorreta (compara com `senhaAtualMock`), critérios de senha, confirmação
  divergente — cada uma com mensagem própria, borda vermelha só no campo errado (`.errorText`
  com o guard padrão `.wrapper .errorText{display:none}`/`.wrapper.error .errorText{display:
  flex}`, já que `Input.module.css`'s `.errorText{display:flex}` é incondicional).
- **RadioButton.module.css passou a ser carregado em `minha-conta.html`** (pro Mensal/Anual do
  modal de troca de plano) — aplicado PREVENTIVAMENTE o fix já conhecido da colisão com
  `Input`/`Dropdown` (`.input:not([type="radio"])`, `#mc-estado-field .menu .option{display:
  block}`) desde a criação, sem esperar o bug aparecer.
- **Fluxo de compra (`comprar-plano.html`):** texto da Etapa 1 corrigido (travessão → vírgula,
  nova regra permanente de copy). Link "Cancelar e voltar" do topo ganhou ícone + cor mais
  forte (secundária, não mais terciária) pra ficar mais perceptível. Novo botão "Voltar"
  (`.btn.secondaryGray.hasLeft`) abaixo do formulário de pagamento, além do link "Trocar de
  plano" já existente no topo do passo — nenhuma mudança de JS necessária (`[data-back-to]` já
  era genérico). Cupom de desconto ganhou a classe `sm` do Button (estava sem) e o bloco
  inteiro foi movido pra ANTES do painel do PIX (satisfaz tanto o pedido do cartão quanto do
  PIX, já que os dois compartilham o mesmo trecho de HTML). Botão "Confirmar pagamento" já não
  aparecia no PIX antes deste round (`submitRow.hidden = isPix`), confirmado ao vivo — nenhuma
  mudança necessária ali. Nenhum título geral novo foi adicionado à página (avaliado e
  descartado): cada etapa já tem um `<h1>` próprio ("Escolha o plano..."/"Pagamento") que
  cumpre esse papel sem duplicar informação.

Verificado ao vivo: modo leitura→edição→cancelar preservando os valores originais; modal de
troca de plano com a lista de planos elegíveis correta nos 2 cenários extremos (`ativo`/
`mensal`); rádio de modalidade marcando visualmente (dot/borda); footer do modal de Comercial
sem sobreposição de botões; aba Segurança com data formatada; modal de alterar senha
bloqueando senha atual errada, aceitando o fluxo completo (critérios + confirmação + toast +
data atualizada); Etapa 1 do checkout sem travessão; cupom antes do Pix no DOM; PIX sem botão
de Confirmar pagamento; campos do cartão com `position:static/opacity:1/width:100%`; botão
Voltar navegando pra Etapa 1; nenhum erro de console real em nenhuma das 2 telas.

## Ajustes 2026-08-05 (round 74) — Minha Conta: espaçamento/toast/mensagens; Fluxo de compra:
breadcrumb, ação de pagamento unificada, resumo primeiro no mobile

Pedido em 8 partes, refinando o round 73.

- **Dados cadastrais:** `.mc-actions` ganhou `gap: var(--spacing-md)` (16px, padrão de
  botão×botão do sistema) — antes os dois botões ficavam colados. Toast de sucesso
  **corrigido pra bater com o padrão EXATO do resto do sistema**: era `top-right` (só desta
  tela), virou centralizado no topo (`left:0;right:0;justify-content:center`, mesma estrutura
  de `page-produtos.css`/`page-categorias-financeiras.css`), incluindo o fix de colisão
  Feedback×Table×Dialog (`.mc-toast .body{padding:0;color:inherit}`) que faltava.
- **Aba Plano:**
  - **Mensagem de licença anual sem repetição:** antes o hint fixo do modal E a mensagem de
    lista vazia repetiam a mesma explicação sobre downgrade/renovação. Agora o hint só
    aparece quando `modalidade==='anual' && status==='ativo'` (explica a regra uma vez),
    e a lista vazia virou só "Nenhum plano disponível para troca no momento." (sem repetir).
  - **Período de teste:** botão "Escolher outro plano" → **"Contratar agora"**, navega direto
    pra `comprar-plano.html` (contratação nova, sem passar pelo modal de troca — não faz
    sentido "trocar" de um trial). A mensagem de sucesso de "Dados" reaproveita o mesmo toast
    corrigido acima, então o pedido de espaçamento em período de teste já fica resolvido.
  - **Licença mensal não passa mais pelo Comercial** (mudança de arquitetura sobre o round
    71/73, restrita à MENSAL — anual continua indo pro Comercial, proração não é calculável
    neste protótipo): novo modal `#mc-mensal-change-overlay` mostra o plano escolhido + "A
    cobrança continua normalmente. O novo plano passa a valer a partir de `<data exata =
    assinatura.dataVencimento>`, quando o ciclo atual terminar." + botão "Ir para pagamento"
    que navega pra `comprar-plano.html?motivo=trocaplano&plano=&modalidade=&vigencia=`.
  - `comprar-plano.js` ganhou suporte a esses query params: quando presentes, pula a Etapa 1
    por completo (`pularParaPagamento`), preenche `pedido.planoId`/`modalidade` direto e já
    abre a Etapa 2, com o banner de contexto mostrando a data exata de vigência.
- **Aba Segurança virou "Senha", reposicionada ao lado de "Dados"** (era a última aba) — só
  reordenação de markup (tab + painel), nenhuma mudança de comportamento.
- **Modal "Alterar senha":** largura de `sm`(360px)→`md`(540px, resolve o "Cancelar cortado"
  de vez); espaçamento reconstruído seguindo literalmente o padrão de `page-login.css`
  (`.login-form{gap:16px}` → `.mc-password-body{gap:var(--spacing-md)}`; descrição nova
  "Escolha uma nova senha segura..." com `margin-bottom:var(--spacing-sm)`, resultando em 24px
  de respiro até o 1º campo, igual à razão gap+margin do Login); footer ganhou
  `gap:var(--spacing-md)` (era 8px do Dialog padrão, agora 16px do padrão botão×botão) +
  `flex-wrap` de segurança.
- **Histórico de compras (Pagamento):** tabela ganhou o mesmo padrão visual das demais
  tabelas do sistema — cabeçalho Brand 50/caixa-alta/semibold + zebra branco/gray-50
  (`page-categorias-financeiras.css` como referência), confirmado via `getComputedStyle`.
- **Fluxo de compra — navegação:** removidos "Cancelar e voltar" do topo E "Trocar de plano"
  do topo da Etapa 2 (pedido explícito, item 8) — a navegação agora é só o **breadcrumb**
  (`#cp-steps`), clicável pra voltar a uma etapa já concluída (`is-clickable`, JS rastreia
  `currentStepNum`; tentar avançar clicando numa etapa futura não faz nada).
  - **Etapa de pagamento: ação unificada numa linha só** (`.cp-payment-actions-row`) —
    "Voltar" sempre à esquerda; "Confirmar pagamento" (Cartão) OU "Verificar pagamento"
    (PIX) sempre à direita, nunca os dois botões de submissão juntos (o botão de PIX saiu de
    dentro do painel do QR Code pra esta linha compartilhada).
  - **Mobile: resumo da compra agora aparece ANTES do formulário** (`.cp-summary-card{order:
    -1}`, revertido pra `order:0` a partir de 900px onde vira grid de 2 colunas) — confirmado
    via `getBoundingClientRect()` nos dois breakpoints.

Verificado ao vivo: gap de 16px entre Cancelar/Salvar; toast centralizado
(`toastCenter≈viewportCenter`); modal de troca de plano sem repetição de texto; "Contratar
agora" (teste) navegando direto pro checkout; troca de plano mensal abrindo o modal novo (sem
Comercial) com a data exata e navegando pro checkout já na Etapa 2 com os campos do cartão
totalmente visíveis; aba "Senha" ao lado de "Dados"; modal de senha com 540px de largura e
footer sem sobreposição; histórico com zebra/cabeçalho corretos; breadcrumb voltando de Etapa
2→1 mas bloqueando avançar de 1→2 por clique; linha de ação do Pix com Voltar+Verificar
pagamento lado a lado, sem Confirmar pagamento; resumo antes do formulário no mobile (375px) e
depois dele no desktop (1280px, grid 2 colunas); nenhum erro de console real em nenhuma das
2 telas.

## Ajustes 2026-08-05 (round 75) — Bug real do Cancelar/Salvar; toast/alertas no padrão certo;
mostrar/ocultar senha; texto do modal de plano; reversão da navegação do checkout

- **Bug real corrigido: Cancelar/Salvar apareciam sempre, mesmo em modo leitura.**
  `.mc-actions{display:flex}` (round 73) não tinha guard `[hidden]` — mesmo padrão de bug
  `hidden`+`display` incondicional documentado dezenas de vezes neste projeto. Fix:
  `.mc-actions[hidden]{display:none}`. Confirmado via `getComputedStyle` que o container vai
  de `none`→`flex` só depois de clicar "Editar".
- **Toast/alertas de Minha Conta fora do padrão — causa raiz era a colisão de 3 vias
  Feedback×Table×Dialog (Dialog carregado por último no `<head>`), só tinha sido corrigida
  pro toast (round 73), não pros outros `.alert` da página** (card de trial, avisos de
  renovação/vencimento). Generalizado: `.alert .body`/`.alert .title` restaurados pros
  valores originais do Feedback pra QUALQUER `.alert` da tela, não só `.mc-toast`. Toast
  ganhou também a animação de entrada (`mc-toast-in`, mesma de `page-produtos.css`) e
  `z-index:80` (era 90, sem motivo pra divergir do padrão).
- **Mostrar/ocultar senha** nos 3 campos do modal "Alterar senha" — mesmo ícone/comportamento
  de `page-login.css`'s `.login-toggle-password` (`eye`/`eye-off`, `aria-pressed`), classes
  próprias `.mc-password-wrap`/`.mc-password-toggle`. Reseta pra oculto/ícone `eye` sempre que
  o modal reabre (`resetPasswordVisibility()`, chamado de dentro de `resetModal()`).
- **Modal "Escolher outro plano": texto sem jargão em inglês.** "só upgrades... downgrades..."
  → "você só pode mudar para um plano superior... mudança para um plano inferior..." — mesma
  regra de negócio (round 73), só a redação simplificada, sem inglês.
- **Fluxo de compra: revertida a navegação do round 74** (breadcrumb clicável como navegação
  principal) — pedido explícito do usuário pra voltar ao padrão original: topbar com
  "Cancelar e voltar" de volta, "Trocar de plano" de volta no topo da Etapa 2, breadcrumb
  (`#cp-steps`) voltou a ser só indicador visual, não clicável (`is-clickable`/handler de
  clique removidos). A ação unificada da Etapa de pagamento (Voltar esquerda + Confirmar/
  Verificar direita, `.cp-payment-actions-row`) e o resumo-primeiro-no-mobile do round 74
  NÃO foram tocados — só a navegação de cabeçalho voltou atrás.

Verificado ao vivo: Cancelar/Salvar escondidos por padrão, aparecendo só após "Editar"; toast
com título 16px/500/verde (bate com o padrão de sucesso do sistema) e card de trial com cor/
padding info corretos; toggle de senha alternando type+ícone nos 3 campos; texto novo do modal
de plano sem "upgrade"/"downgrade"; "Cancelar e voltar" e "Trocar de plano" de volta no
checkout; nenhum erro de console em nenhuma das 2 telas.

## Ajustes 2026-08-05 (round 76) — Nova tela: Relatórios > LCDPR (Livro Caixa Digital do
Produtor Rural)

Segundo relatório real dentro de Relatórios (depois de Balancete, round 66) — clique no card
"LCDPR" agora navega de verdade pra `lcdpr.html` (`relatorios.js`'s `REAL_DESTINATIONS`
generalizado de um único `if` pra um mapa report→tela, cobrindo os dois casos). DRE/Entradas e
saídas continuam só com o flash-disable, sem tela própria.

- **Arquivos novos:** `app/screens/lcdpr.html` + `app/shared/page-lcdpr.css` +
  `app/shared/lcdpr.js`. Mesmo padrão visual/de interação de Balancete (round 66) — filtros em
  card recolhível, cabeçalho de resultado com resumo+ações (Exportar PDF/Excel/Imprimir, sem
  Compartilhar), cards de KPI, tabela com rolagem horizontal + 1ª coluna sticky — só que
  **simplificado**: sem gráfico (não pedido) e a tabela é uma lista CRONOLÓGICA (Data/
  Documento/Histórico/Categoria/Entradas/Saídas), não uma matriz de categorias × período como
  o Balancete. Sem módulo de dados próprio — agrega `window.NiveloCaixa` (mesma fonte do
  Balancete), filtrado por `window.NiveloContasFinanceiras`/`window.NiveloCategoriasFinanceiras`.
- **Filtros:** "Tipo de período" (RadioButton Ano-calendário/Intervalo personalizado — campos
  aparecem dinamicamente, mesma técnica de `syncTipoPeriodo()` de Balancete); Ano-calendário usa
  um `Dropdown` simples (2024-2027, não um DatePicker de mês/dia — não fazia sentido pro
  conceito "ano inteiro"); Intervalo personalizado reaproveita os mesmos `NiveloDatePicker.
  initDay()` de Data inicial/final já usados em Balancete. Conta/Categoria são o MESMO
  combobox pesquisável (`initCombobox`, código copiado de `balancete.js` verbatim — os dois
  relatórios/telas continuam sem compartilhar JS entre si, por convenção do projeto, mas usam a
  mesma técnica). Sem campo "Agrupamento" (não pedido — o LCDPR é sempre linha a linha, nunca
  agregado por período).
- **"Documento" (coluna da tabela):** `NiveloCaixa` não tem um campo de número de documento
  próprio — usado o `codigo` do lançamento (`LC-NNNN`, já auto-gerado e único) como referência
  de documento, decisão de prototipagem documentada no código.
- **Cards de resumo:** "Total de receitas"/"Total de despesas"/"Resultado do período" (nomes
  literais do pedido, diferente de "Total de entradas/saídas" do Balancete) — mesma cópia
  estrutural exata (12px/24px fixo em qualquer largura).
- **Tabela cronológica, 1ª coluna (Data) sticky:** diferente do Balancete (sticky é a coluna
  Categoria, numa tabela matricial), aqui é uma listagem simples ordenada por data ascendente,
  então a coluna que precisa ficar fixa durante o scroll horizontal é a Data (contexto
  temporal). Zebra striping (branco/gray-50) nas linhas do corpo; nunca vira Cards no mobile
  (relatório financeiro, mesmo princípio do Balancete).
- **Rodapé da tabela** com Total de entradas/Total de saídas (1ª linha) + Resultado do período
  (2ª linha, `colspan` 2 na última coluna), destaque visual (fundo Brand 50, negrito).
- **Bug real pego ao vivo e corrigido:** as regras de zebra striping do corpo da tabela
  (`.tr:nth-child(odd/even) .td`, escritas com o seletor genérico `.lcdpr-table ...`) também
  batiam nas 2 linhas do `<tfoot>` — `:nth-child` conta os `<tr>` relativos ao PAI DIRETO
  (`<tbody>` ou `<tfoot>`, independentemente), então a 1ª linha do rodapé é sempre ímpar e a 2ª
  sempre par dentro do próprio `<tfoot>`, e essas regras (4 níveis de especificidade,
  `.lcdpr-table`+`.tr`+`:nth-child`+`.td`) venciam a regra de destaque do rodapé (3 níveis,
  `.lcdpr-table`+`.lcdpr-foot-row`+`.td`), apagando o fundo Brand 50 esperado. Corrigido
  escopando as regras de zebra ao `#lcdpr-tbody` (seletor por ID, nunca alcança o `<tfoot>`) em
  vez do `.lcdpr-table` genérico. **Lição nova, generalização do padrão de colisão de
  especificidade já documentado várias vezes neste projeto:** ao estilizar `<tfoot>` com
  destaque próprio numa tabela que também tem zebra striping por `:nth-child` no `<tbody>`,
  sempre escopar a zebra a um seletor que não alcance o `<tfoot>` (ID do `<tbody>`, nunca uma
  classe genérica da tabela) — `:nth-child` reinicia a contagem em cada `<tbody>`/`<tfoot>`,
  então a interação é sutil e só aparece testando o rodapé de verdade via `getComputedStyle`.
- **`prototype-nav/nav.config.js`:** novo item leaf "LCDPR" na journey "Jornada · Financeiro",
  logo após "Balancete".

Verificado ao vivo: geração com filtros padrão (Ano-calendário 2026) reproduzindo os mesmos
totais exatos de Caixa/Balancete (R$ 102.200,00/R$ 45.039,00/R$ 57.161,00, 14 lançamentos);
filtros recolhem depois de gerar, "Exibir filtros" reabre; alternar Ano-calendário ⇄ Intervalo
personalizado troca os campos corretamente; intervalo 01/07 a 31/07/2026 isola as 13 linhas
certas; ano sem nenhum lançamento (2024) mostra o estado vazio com a mensagem exata pedida;
rodapé com as 2 linhas em Brand 50 (bug de zebra corrigido, confirmado via `getComputedStyle`
nas 2 linhas × todas as células); mobile (375px): scroll horizontal real (895px de conteúdo em
341px de viewport), coluna Data sticky confirmada via `getBoundingClientRect` antes/depois do
scroll, cards de resumo empilhados verticalmente; clique no card "LCDPR" em Relatórios
navegando de verdade; nenhum erro de console em nenhum estado testado.

## Ajustes 2026-08-05 (round 77) — LCDPR: dados gerais do relatório, colunas
Documento Fiscal/Natureza/Saldo, tipografia da tabela, rodapé com nota de emissão

Ajustes de UX/UI sobre o relatório LCDPR (round 76), preservando identidade visual/
componentes/estrutura — pedido explícito de dar cara de documento contábil/profissional.

- **Nova seção "Dados gerais do relatório"** (`.card.lcdpr-info-card`, `dl`/`dt`/`dd`
  read-only, grid 1/2/4 colunas mobile/tablet/desktop), posicionada logo abaixo dos filtros
  e antes dos cards de resumo (a antiga linha de resumo dentro do cabeçalho —
  `#lcdpr-resumo-filtros`, "Período: X · Conta: Y · Categoria: Z" — foi removida, virou
  redundante com esta seção mais completa). Campos: Produtor Rural/CPF (de
  `window.NiveloMinhaConta.getConta()` — `nome`/`documento`, já no formato CPF, mais fiel a
  "Produtor Rural" do que `emitente-data.js`, que modela uma empresa com CNPJ), Propriedade/
  Município-UF (primeira fazenda de `window.NiveloFazendas.list()` — este protótipo não tem
  seleção de fazenda no relatório, mesmo raciocínio de "assume 1 propriedade" já usado em
  outros defaults do sistema), Exercício (ano escolhido no filtro Ano-calendário, ou
  ano/intervalo de anos coberto pelo período personalizado), Período consultado (mesmo texto
  já calculado como `periodoLabel`), Data e hora da emissão (`new Date()` real, não o `TODAY`
  fixo do resto do protótipo — mesma exceção documentada em `nova-conversa.js`: é o instante
  real do clique em "Gerar relatório", não um registro de negócio simulado).
- **Ações Exportar PDF/Excel/Imprimir já estavam no canto superior direito do relatório**
  desde o round 76 — conferido, nenhuma mudança necessária.
- **Título da tabela** → "Lançamentos do Livro Caixa (LCDPR)".
- **Coluna "Categoria" → "Natureza"** (só o rótulo do cabeçalho, o dado continua vindo de
  `NiveloCategoriasFinanceiras`).
- **Coluna "Documento" → "Documento Fiscal / Documento"**, mostrando um TIPO de documento
  (NF-e/DARF/Recibo/TED) em destaque + o código interno (`LC-NNNN`) como legenda pequena
  abaixo (`.lcdpr-doc-tipo`/`.lcdpr-doc-ref`). `NiveloCaixa` não tem um campo de tipo de
  documento — `inferDocumentoFiscal(l)` é uma heurística de prototipagem (documentada no
  código, mesmo espírito do round 76 pro "Documento" original): impostos (`CAT-006`) → DARF;
  lançamento com contraparte identificada (`pessoaDocumento`) → NF-e; pago em dinheiro →
  Recibo; caso contrário → TED. Não modela PIX (nenhum dado do mock sugere esse meio) — a
  lista do pedido era só exemplos do que a coluna PODE mostrar, não uma exigência de cobrir
  os 5 valores.
- **Nova coluna "Saldo"**, saldo acumulado após cada lançamento (soma corrida de
  entrada−saída ao longo das linhas já ordenadas cronologicamente, começando em zero — este
  protótipo não modela saldo de exercícios anteriores, decisão documentada no código).
  Rodapé: linha "Total" ganhou uma 3ª célula numérica com o saldo final (bate com o
  Resultado do período, mesmo valor); linha "Resultado do período" passou a ocupar
  `colspan="3"` (Entradas+Saídas+Saldo) em vez de 2.
- **Tipografia da tabela aumentada levemente**: 12px→14px (`--font-size-md`) no cabeçalho,
  corpo e rodapé (`.lcdpr-table .th, .lcdpr-table .td`).
- **Alinhamento monetário à direita reforçado em TODA a tabela**, incl. a linha de Totais —
  **bug real pego ao vivo**: as células do rodapé (com `colspan`) caem nas primeiras posições
  de `:nth-child` do `<tr>` (mesmo mecanismo do bug de zebra×tfoot do round 76 — `colspan`
  não altera a contagem de `nth-child`, só o span visual), então a regra existente
  `.lcdpr-table .td:nth-child(-n+4){text-align:left}` (3 níveis de especificidade) vencia as
  classes de alinhamento à direita do rodapé (`.lcdpr-td-label`/`.lcdpr-foot-value`, só 2
  níveis) — TODAS as células do rodapé, incluindo os valores em R$, ficavam alinhadas à
  esquerda. Corrigido reforçando os 2 seletores pra 3 níveis
  (`.lcdpr-table .lcdpr-foot-row .lcdpr-td-label`/`.lcdpr-foot-value`), empatando a
  especificidade e vencendo por ordem no arquivo (regra mais específica declarada depois).
  **Generalização da lição do round 76**: `colspan` não é só uma armadilha para zebra
  striping por `:nth-child` — qualquer regra baseada em posição de `:nth-child` (incl.
  alinhamento) pode colidir com células de rodapé/colspan; sempre verificar a especificidade
  real, não assumir que uma classe nova "helper" vai vencer.
- **Linha de Totais com destaque sutil**: fundo Brand 50 mantido (já sutil), peso reduzido de
  Bold pra Semibold (`--font-weight-semibold`) — "tipografia sem exageros", como pedido.
  Resultado do período continua em Bold + cor de marca (`--color-text-brand`), reforçando que
  é o valor mais importante da tabela, alinhado à direita junto aos demais.
- **Cores mantidas**: verde/vermelho só nos 2 KPIs de receita/despesa e no Resultado
  condicional (positivo/negativo) — nenhuma cor nova introduzida na tabela em si (Saldo
  aparece em preto/neutro, não colorido por linha — não pedido, e coloriria demais uma
  coluna que já tem 14 valores por página).
- **Nova nota de rodapé do relatório** (`#lcdpr-emission-note`, abaixo da tabela): "Relatório
  emitido em: dd/mm/aaaa hh:mm • Filtros aplicados: Exercício 2026 (ou Período: dd/mm/aaaa a
  dd/mm/aaaa) • Conta: X • Categoria: Y" — texto exato sugerido pelo usuário, generalizado
  pra também citar Conta/Categoria quando filtrados (não só Exercício/Período).
- **`lcdpr.html` ganhou 2 novos `<script>`**: `minha-conta-data.js` (Produtor Rural/CPF) e
  `fazendas-data.js` (Propriedade/Município-UF) — nenhum dos dois carregava nesta tela antes.

Verificado ao vivo: totais batendo (R$ 102.200,00/R$ 45.039,00/R$ 57.161,00, saldo corrente
da última linha = R$ 57.161,00 = Resultado); rodapé com alinhamento à direita e fundo Brand
50 confirmados via `getComputedStyle` nas 2 linhas × todas as células (bug de especificidade
corrigido); tipografia da tabela em 14px; Dados gerais preenchidos corretamente (Miguel
Fernando da Silva/123.456.789-00/Fazenda São João/Tijucas-SC); mobile (375px): Dados gerais
e cards de resumo em 1 coluna, tabela com scroll horizontal (1146px em 341px de viewport);
nenhum erro de console.

## Ajustes 2026-08-05 (round 78) — LCDPR: remoção de Propriedade/Município, alinhamento
do rodapé, exportação real (PDF/Excel) + Imprimir nativo

4 ajustes pontuais sobre o relatório LCDPR (round 77).

- **Campos Propriedade/Município-UF removidos** de "Dados gerais do relatório" (pedido
  explícito) — a seção ficou só com Produtor Rural/CPF/Exercício/Período consultado/Data e
  hora da emissão. `fazendas-data.js` (adicionado no round 77 só pra esses 2 campos) saiu do
  `<head>` de `lcdpr.html`, sem consumidor restante nesta tela.
- **Bug real de alinhamento no rodapé, causa raiz igual à já documentada no round 77 (mesma
  classe de colisão, ainda não totalmente resolvida):** ao reforçar a especificidade de
  `.lcdpr-td-label`/`.lcdpr-foot-value` pra 3 classes no round anterior, o rótulo
  ("Total"/"Resultado do período") tinha sido deixado à DIREITA junto com os valores — pedido
  explícito agora corrige pra o padrão certo de tabela contábil: rótulo à ESQUERDA, só os
  valores monetários à direita (no mesmo alinhamento das colunas Entradas/Saídas/Saldo do
  corpo). Fix: `.lcdpr-table .lcdpr-foot-row .lcdpr-td-label { text-align: left; }` (mantendo
  `.lcdpr-foot-value` à direita, já correto desde o round 77).
- **Exportação real, primeira vez no sistema** (todas as outras telas de relatório —
  Balancete, e o próprio LCDPR até este round — usavam flash-disable, documentado como "fora
  de escopo real neste protótipo estático"). Duas bibliotecas novas via CDN (mesmo padrão já
  usado pro Lucide): **jsPDF** (`unpkg.com/jspdf`, global `window.jspdf.jsPDF`) e **SheetJS**
  (`unpkg.com/xlsx`, global `window.XLSX`).
  - **Exportar PDF:** `exportarPdf(report)` monta um PDF de verdade (cabeçalho, dados gerais,
    KPIs, tabela completa com paginação automática quando o conteúdo passa da página, rodapé
    de totais) e chama `doc.save('LCDPR-<exercício>.pdf')` — download real do navegador.
    Layout é texto simples posicionado por coordenadas (sem `autotable`, que exigiria mais uma
    dependência) — suficiente pra um documento funcional, não pixel-perfect com a tela.
  - **Exportar Excel:** `exportarExcel(report)` monta uma planilha real (`XLSX.utils.
    aoa_to_sheet`, mesmas seções do PDF + cabeçalho de tabela + linhas + totais, valores
    monetários como números de verdade, não texto formatado) e chama `XLSX.writeFile(wb,
    'LCDPR-<exercício>.xlsx')` — download real (`.xlsx`).
  - **Imprimir:** passou a chamar `window.print()` de verdade (antes também era só
    flash-disable, apesar do rótulo já sugerir impressão nativa) — usa o diálogo de impressão
    nativo do navegador, sem nenhum CSS de impressão dedicado (não pedido).
  - Os 3 botões só funcionam depois de "Gerar relatório" (já ficavam dentro de
    `#lcdpr-resultado`, que só é revelado após gerar — nenhuma guarda adicional necessária).

Verificado ao vivo: Dados gerais com só 5 campos; rodapé com "Total"/"Resultado do período"
à esquerda e os valores em R$ à direita (`getComputedStyle` confirmando `text-align` de cada
célula); clique em Exportar PDF gera um Blob real (`application/pdf`, ~12,9 KB) via
`URL.createObjectURL` interceptado; clique em Exportar Excel gera um Blob real
(`application/octet-stream`, ~21,9 KB, arquivo `.xlsx`); clique em Imprimir chama
`window.print()` (interceptado e confirmado); nenhum erro de console.

## Ajustes 2026-08-05 (round 79) — Nova tela: Relatórios > DRE (Demonstração do
Resultado do Exercício)

Terceiro relatório real dentro de Relatórios (depois de Balancete round 66 e LCDPR round
76/77/78) — clique no card "DRE" agora navega de verdade pra `dre.html`
(`relatorios.js`'s `REAL_DESTINATIONS` ganhou a entrada `dre`). Só "Entradas e saídas"
continua com o flash-disable, sem tela própria.

- **Arquivos novos:** `app/screens/dre.html` + `app/shared/page-dre.css` +
  `app/shared/dre.js`. Mesmo padrão visual/de interação de Balancete/LCDPR (filtros em card
  recolhível, cabeçalho de resultado com resumo+ações Exportar PDF/Excel/Imprimir sem
  Compartilhar, gráfico SVG puro, tabela hierárquica com 1ª coluna sticky, nunca vira Cards
  no mobile). Sem módulo de dados próprio — agrega `window.NiveloCaixa` (mesma fonte de
  Balancete/LCDPR) por `window.NiveloCategoriasFinanceiras`.
- **Filtros: sem campo Conta** (diferente de Balancete/LCDPR) — o pedido só especificou
  Período/Categoria/Agrupamento pra este relatório, respeitado literalmente. Tipo de período
  (RadioButton Mês/Intervalo personalizado, mesma técnica de Balancete) + Categoria (mesmo
  combobox pesquisável `initCombobox`, código copiado — telas de relatório continuam sem
  compartilhar JS entre si, por convenção do projeto) + Agrupamento (Dropdown Automático/
  Diário/Semanal/Mensal, mesma heurística `chooseAgrupamento` de Balancete pro modo
  automático: ≤31 dias vira Diário, ≤180 Semanal, acima Mensal).
- **Classificação da DRE — decisão de mapeamento documentada no código
  (`dre.js`'s `classifyDreBucket`):** o campo `classificacaoDre` de
  `categorias-financeiras-data.js` (5 valores fixos desde o round 38: deducoes/despesas-
  operacionais/outras/tributos/taxas-tarifas) não cobre 1:1 os 6 grupos pedidos aqui
  (Receitas Operacionais/Outras Receitas/Custos/Despesas Operacionais/Despesas
  Financeiras/Outras Despesas) — não existe nenhuma opção de receita além de "outras", e
  "Custos" (insumo de produção) não é um valor próprio do enum. Heurística aplicada: toda
  receita vira **Receitas Operacionais** (caso comum no agronegócio — venda de safra);
  despesas com nome de insumo direto de produção (fertilizante/combustível/semente/adubo/
  defensivo, regex `CUSTOS_KEYWORDS_RE`) viram **Custos**; `classificacaoDre==='taxas-
  tarifas'` vira **Despesas Financeiras** (tarifa/juro bancário é financeiro, não
  operacional); `'outras'`/`'deducoes'` viram **Outras Despesas**; o restante (`despesas-
  operacionais`/`tributos`) vira **Despesas Operacionais**. "Outras Receitas" fica vazia com
  o dataset seed atual (nenhuma categoria de receita não classificada como "outras" existe
  hoje) — a linha aparece mesmo assim, sem toggle de expandir (nenhuma categoria dentro).
  Categorias com `consideraDre=false` (ex. "Transferência entre contas próprias") ficam de
  fora de todos os cálculos, como já era o campo pra isso desde o round 38.
- **KPIs (4, não 3 como Balancete/LCDPR):** Receita Bruta, Total de Despesas, Resultado do
  Período (verde quando ≥0/vermelho quando <0) e **Margem (%)** — nova métrica neste
  relatório (`resultado/receitaBruta*100`, 1 casa decimal; `—` quando a receita bruta é
  zero, evita divisão por zero). Mesma cópia estrutural exata de card de KPI (12px/24px
  fixo em qualquer largura), grid 1→2→4 colunas (mobile/~640px/1024px+, mesmo padrão de
  Contas a Pagar/Receber, que também têm 4 KPIs).
- **Gráfico: barra ÚNICA divergente (Resultado por coluna), não um par Entradas×Saídas
  lado a lado como Balancete.** Primeira vez no sistema com esse tipo de gráfico — a linha
  de base (zero) não fica fixa embaixo, é calculada pela proporção entre o maior valor
  positivo e o maior valor negativo do período (`baseline = top + usableH * maxPos/(maxPos+
  maxNeg)`), permitindo barras subirem (verde, lucro) ou descerem (vermelho, prejuízo) a
  partir dela. Legenda com 2 dots (Resultado positivo/negativo) em vez de Entradas/Saídas.
  Tooltip por coluna mostra só "Resultado" (não 3 linhas como Balancete). Não permite trocar
  o tipo de gráfico (pedido explícito) — sem nenhum controle de configuração visual.
- **Tabela: hierarquia sequencial Receitas→Total das Receitas→(-) Despesas→Total das
  Despesas→(=) Resultado do Exercício**, diferente da estrutura de Balancete (que tem
  Entradas/Saídas como 2 blocos colapsáveis independentes seguidos de um bloco "Resultado"
  separado no fim). Aqui os subtotais ("Total das Receitas"/"Total das Despesas") aparecem
  logo depois de cada bloco correspondente, e nunca ficam `parentGroup`-ados a nenhum grupo
  colapsável (sempre visíveis, mesmo se Receitas/Despesas estiverem recolhidos) — mesmo
  princípio já usado pro bloco "Resultado" de Balancete. Nível 0 (Receitas/"(-) Despesas")
  e nível 1 (os 6 buckets, só com toggle quando têm categoria dentro) são colapsáveis;
  nível 2 (categorias, zebra) são as folhas. **"(=) Resultado do Exercício" tem destaque
  visual SUPERIOR a qualquer outra linha** (pedido explícito) — fundo de marca + negrito +
  cor de marca + `font-size` maior (`--font-size-md`, as demais linhas usam o tamanho
  padrão da tabela), e vira vermelho (`--color-status-error-fg`) quando o resultado do
  período é negativo (classe `dre-row-negativo`).
- **`prototype-nav/nav.config.js`:** novo item leaf "DRE" na journey "Jornada ·
  Financeiro", logo após "LCDPR".
- **Mesma limitação de sempre:** sem `localStorage`, o relatório é sempre recalculado a
  partir dos dados seed de `caixa-data.js` — nenhum lançamento criado em outra sessão de JS
  aparece aqui. Exportação (PDF/Excel/Imprimir) fica como flash-disable, mesmo padrão de
  Balancete — não foi pedido export real nesta rodada (diferente do LCDPR, que teve essa
  função implementada de verdade numa rodada anterior, sob pedido explícito).

Verificado ao vivo: geração com filtros padrão (mês 07/2026, agrupamento automático →
Diário, 31 colunas) reproduzindo os totais exatos esperados (Receita Bruta R$ 102.200,00,
Total de Despesas R$ 42.239,00 — exclui corretamente CAT-008/Transferência entre contas
próprias, que tem `consideraDre=false` — Resultado R$ 59.961,00, Margem 58,7%); estrutura
hierárquica renderizando os 6 buckets corretos, com "Outras Receitas"/"Outras Despesas"
sem toggle (vazias); expandir/recolher o grupo "Receitas" esconde corretamente as 2
subgrupos+2 categorias (4 linhas), sem afetar Despesas; linha "(=) Resultado do Exercício"
com fundo/cor de marca e sticky confirmados via `getComputedStyle`; filtros recolhem
depois de gerar, "Exibir filtros" reabre; alternar Mês ⇄ Intervalo personalizado troca os
campos corretamente; mobile (375px): cards de resumo em 1 coluna, gráfico com 140px de
altura, tabela com scroll horizontal real (2824px de conteúdo em 341px de viewport),
filtros permanecem recolhidos; nenhum erro de console em nenhum estado testado.

## Ajustes 2026-08-05 (round 80) — DRE: camadas contábeis (Deduções/Receita Líquida,
Lucro Bruto, Resultado Operacional), cross-highlight gráfico↔tabela, gráfico colapsável

Refinamento da tela de DRE (round 79) motivado por uma consultoria de UX explícita sobre
estrutura contábil (comparação com padrão de mercado tipo Olist) — 5 melhorias
implementadas na ordem combinada com o usuário.

- **Classificação: `classificacaoDre==='deducoes'` ganhou bucket próprio.** Antes caía sem
  distinção dentro de "Outras Despesas" (round 79) — `classifyDreBucket()` agora checa esse
  valor ANTES do `grupo`, então tem prioridade mesmo que a categoria seja tecnicamente
  `grupo:'despesa'`. Nenhuma categoria seed hoje usa esse valor (nenhuma mudança visível
  sem cadastro novo), mas a estrutura já está pronta.
- **Nova camada Deduções da Receita → Receita Líquida**, entre "Total da Receita Bruta"
  (renomeado de "Total das Receitas") e "(-) Custos". Estilo visual integrado ao bloco de
  Receitas (mesmo peso de `.dre-row-subtotal`/nível 1, nunca o brand-background forte de
  nível 0) — reforça que deduções corrigem a receita, não são uma despesa.
  **Oculta por completo quando zerada em todas as colunas** (`report.hasDeducoes`) — evita
  2 linhas mortas (Deduções + Receita Líquida) pra quem não usa essa classificação; some a
  camada inteira, não deixa um "0" residual.
- **2 subtotais novos, fechando a cascata contábil completa:** Receita Bruta → Receita
  Líquida → **Lucro Bruto** (Receita Líquida − Custos) → **Resultado Operacional**
  (Lucro Bruto − Despesas Operacionais, agrupando os antigos buckets "Despesas
  Operacionais" + "Outras Despesas" sob um único grupo `(-) Despesas Operacionais`) → **(+/-)
  Resultado Financeiro** (Despesas Financeiras com sinal invertido — é "resultado", não
  "despesa bruta", coerente com poder incluir receita financeira no futuro) → Resultado do
  Exercício. Antes disso, uma única subtração colapsava Custos+DespesasOperacionais+
  DespesasFinanceiras+OutrasDespesas de uma vez, escondendo se o resultado vinha da
  operação core ou só de efeito financeiro.
- **Peso visual crescente nos subtotais** (pedido explícito da consultoria): `.dre-row-
  subtotal` (gray-50/semibold — Receita Líquida/Lucro Bruto) → `.dre-row-subtotal-strong`
  (NOVA classe, gray-100/bold — Resultado Operacional) → `.dre-row-resultado-final`
  (inalterado, brand bg/bold/cor de marca/fonte maior — Resultado do Exercício).
- **KPI "Total de Despesas" passou a incluir Deduções na soma** (`grandDespesas =
  Σdeduções+Σcustos+ΣdespesasOperacionaisGrupo+ΣdespesasFinanceiras`) — matematicamente
  necessário pra `Receita Bruta − Total de Despesas = Resultado do Período` continuar
  batendo nos 3 KPIs, agora que Deduções saiu de dentro do bucket de despesas genérico.
  Confirmado por álgebra e testado ao vivo (bate com a cascata completa da tabela).
- **Cross-highlight gráfico ↔ tabela** (`setActiveColumn()`/`clearActiveColumn()`, novo em
  `dre.js`): hover numa barra do gráfico ilumina a coluna inteira na tabela (cabeçalho +
  todas as linhas, incl. subtotais) e o rótulo do eixo correspondente; hover no cabeçalho
  de uma coluna ilumina a barra equivalente no gráfico. Implementado com `filter:
  brightness(0.94)` nas células (`.dre-col-active`, preserva a cor de fundo que cada linha
  já tem — nível 0 brand/nível 1 gray-50/zebra/subtotal — em vez de um `background` sólido
  que apagaria essas cores) e `stroke`+opacidade na barra ativa (`.dre-chart-bar.is-active`).
  Transforma o gráfico de "resumo decorativo" em índice de navegação da tabela densa.
- **Gráfico virou um card colapsável** (mesmo padrão accordion de Filtros — cabeçalho
  inteiro clicável, chevron rotaciona), com a preferência de expandido/recolhido persistida
  em `localStorage` (`nivelo.dre.chartCollapsed`, mesmo raciocínio de
  `nivelo.shell.sidebarCollapsed`) — nasce expandido na primeira geração de qualquer sessão
  nova, mas lembra a escolha do usuário entre gerações/reloads seguintes. Reduz a
  competição por espaço vertical agora que a tabela ficou mais alta (9 linhas de estrutura
  fixa, antes eram 3).
- **`(+/-) Resultado Financeiro` e suas categorias mostram valores NEGADOS** (`-v`, não a
  magnitude bruta da despesa) — única linha de "despesa" que já se apresenta como
  resultado assinado, coerente com o nome da linha e com a convenção de sinal já usada em
  `(=) Resultado do Exercício`.

Verificado ao vivo: com o dataset seed (sem nenhuma categoria `deducoes`), a camada de
Deduções/Receita Líquida não aparece (confirmado no HTML gerado); cascata Lucro Bruto/
Resultado Operacional/Resultado Financeiro com os valores corretos por coluna e batendo
com o Resultado do Exercício final; toggle do grupo "(-) Despesas Operacionais" escondendo
as 2 sub-linhas + 2 categorias (4 linhas); os 3 KPIs continuam batendo exatamente
(R$ 102.200,00/R$ 42.239,00/R$ 59.961,00/58,7%); toggle do gráfico colapsando/expandindo e
persistindo em `localStorage` (confirmado `getItem` após clique); hover no cabeçalho de
uma coluna (índice 4) ilumina as 20 células da coluna + a barra correspondente do gráfico,
some ao tirar o mouse; hover na área de uma barra do gráfico ilumina as mesmas 20 células
+ mostra o tooltip; mobile (375px): tabela mais alta continua com scroll horizontal real
(2824px em 341px) e 1ª coluna sticky; nenhum erro de console em nenhum estado testado.

## Ajustes 2026-08-05 (round 81) — DRE: reestruturação completa da hierarquia da tabela
(validada e adaptada pro contexto de produtor rural, não reprodução literal de um DRE
de varejo)

Pedido grande do usuário: reorganizar a hierarquia da tabela do DRE seguindo um modelo de
mercado (estilo Olist), incluindo linhas como "Notas fiscais/Ticket médio", "CMV", pacote
fixo de tributos (ICMS/IR/IPI/ISS/INSS/CSLL/PIS/COFINS), "FGTS". Pedido explícito do
usuário: **validar antes de implementar literalmente**, adaptando pro contexto real do
sistema (produtor rural pequeno/médio) em vez de reproduzir um DRE empresarial genérico.
A validação (mensagem anterior, antes deste round) identificou que boa parte da estrutura
proposta não tinha lastro nos dados do sistema — decisões tomadas e implementadas nesta
rodada:

- **Removido por falta de dado/sentido no contexto:** "Notas fiscais/Notas de serviços/
  Quantidade/Ticket médio" (conceito de e-commerce com muitos pedidos pequenos;
  `NiveloNotasFiscais` não tem vínculo com `NiveloCaixa`, e não faria sentido pra vendas de
  safra, poucas e de alto valor); "CMV"/"Estorno de CMV" (terminologia de revenda; o
  equivalente rural já existe — bucket "Custos", insumo de produção); lista fixa de
  siglas de imposto (ICMS/IR/IPI/ISS/INSS/CSLL/PIS/COFINS) e "Estorno de impostos de
  devoluções" (nenhum dado sustenta by-sigla; categoria é texto livre do usuário); segunda
  seção "(-) Tributos > Imposto Simples/FGTS/INSS" no fim (duplicava a dedução de
  impostos já tratada acima, e não há módulo de folha de pagamento no sistema);
  "Comissões"/"Taxas e tarifas" fixas em Despesas Operacionais (Taxas bancárias já existe
  como categoria real e já tinha sido classificada como Despesas Financeiras — mover pra
  Despesas Operacionais seria um retrocesso conceitual, mantido como estava).
- **`classifyDreBucket()` reescrito** (`dre.js`): `classificacaoDre==='deducoes'` e
  `==='tributos'` agora são verificados ANTES de tudo (prioridade absoluta), os dois
  alimentando `(-) Deduções da Receita`. **Decisão nova, não estava na v1 do DRE:**
  `tributos` (ex.: CAT-006 "Impostos sobre a produção") saiu do bucket "Despesas
  Operacionais" e foi pra dentro de Deduções — imposto sobre produção/venda rural (ex.:
  Funrural) costuma ser retido na fonte pelo comprador, reduzindo a receita bruta na
  prática, mais parecido com ICMS-sobre-vendas do que uma despesa operacional recorrente.
  Efeito colateral positivo: "Impostos" agora tem dado real (R$ 2.100,00 em julho/2026),
  diferente de "Devoluções" (`deducoes`, ainda sem categoria seed).
- **Nova hierarquia completa** (cascata, cada subtotal alimenta o próximo):
  ```
  Receita Bruta                      (bucket receitas-operacionais, direto — sem
                                       sub-nível, já que Outras Receitas saiu daqui)
  Total da Receita Bruta
  (-) Deduções da Receita            [só aparece se houver valor]
    Devoluções    (classificacaoDre='deducoes')
    Impostos      (classificacaoDre='tributos' — NOVO, movido de Despesas Operacionais)
  Receita Líquida
  (-) Custos
  Lucro Bruto
  (-) Despesas Operacionais          (agora só classificacaoDre='despesas-operacionais')
  Resultado Operacional
  (+) Outras Receitas                [NOVO: reposicionado pós-operacional, sempre visível]
  (-) Outras Despesas                [NOVO: saiu de dentro de Despesas Operacionais]
  (+/-) Resultado Financeiro
  (=) Resultado do Exercício
  ```
- **KPI "Total de Despesas" agora é DERIVADO** (`grandDespesas = grandReceita −
  grandResultado`), não mais somado bucket a bucket — necessário porque "Outras Receitas"
  entra na cascata como uma ADIÇÃO depois do Resultado Operacional; a subtração manual
  antiga quebraria a consistência `Receita Bruta − Total de Despesas = Resultado` assim
  que Outras Receitas tivesse valor. Resultado do Exercício idêntico ao de antes da
  reclassificação (confirmado ao vivo, byte a byte por coluna) — a reorganização só move
  ONDE cada valor é subtraído, nunca muda o resultado final.
- **Tipografia das linhas principais (nível 0 — grupos: Receita Bruta/Deduções/Custos/
  Despesas Operacionais/Outras Receitas/Outras Despesas/Resultado Financeiro), pedido
  explícito:** `.dre-row-level-0 .td` ganhou `font-size:16px` (um nível acima do resto da
  tabela, que é 12px do componente `Table`), `font-weight:bold`, `color:--color-gray-900`
  (mais escuro), `padding-top/bottom:8px` (mais espaçamento vertical) — aparência de
  subtotal de relatório contábil. Linhas de detalhe (categorias, nível 2) mantidas
  intocadas, como pedido.
- **Regras de UX já cumpridas por herança do desenho anterior** (nenhuma mudança nova
  necessária): todo grupo com categorias tem toggle; a linha do grupo sempre mostra o
  total consolidado (`report.totals[bucket]`); itens internos só aparecem expandidos
  (`applyRowVisibility`/`data-parent-group`); alinhamento monetário à direita preservado;
  filtros/cards/gráfico/layout geral **não foram tocados**, conforme pedido explícito de
  escopo restrito só à tabela.
- **Validação da última linha:** confirmado com o usuário que "(=) Resultado / Lucro
  Bruto" da proposta original era um equívoco de nomenclatura — a estrutura já implementada
  desde o round 80 termina corretamente em "(=) Resultado do Exercício", sem alteração
  necessária aqui.

Verificado ao vivo: "Impostos" renderizando com dado real (R$ 2.100,00, dia 25) dentro de
Deduções da Receita; "Despesas Operacionais" agora só com Energia elétrica (Impostos
sobre a produção corretamente migrado); "(+) Outras Receitas"/"(-) Outras Despesas"
sempre visíveis (vazias no seed atual, sem toggle); toggle do grupo "Deduções" escondendo
as 2 sub-linhas (Devoluções/Impostos) + 1 categoria (3 linhas); linha final "(=) Resultado
do Exercício" com os MESMOS valores por coluna de antes da reclassificação (confirma que
a reorganização não alterou o resultado); os 3 KPIs continuam batendo exatamente
(R$ 102.200,00/R$ 42.239,00/R$ 59.961,00/58,7%); linhas de nível 0 confirmadas via
`getComputedStyle` (16px/700/rgb(23,23,23)/8px de padding); mobile (375px): tabela mais
alta continua com scroll horizontal real (2824px em 342px) e 1ª coluna sticky; nenhum
erro de console em nenhum estado testado.

## Ajustes 2026-08-06 (round 82) — Ajustes finos nos gráficos (Evolução do resultado + Entradas
x Saídas) e nova tela: Relatórios > Entradas e Saídas

Dois pedidos no mesmo dia: (1) refinamento visual dos 2 gráficos SVG já existentes (DRE/
Balancete), pra um visual de "dashboard financeiro profissional"; (2) quarto e último relatório
real dentro de Relatórios, fechando os 4 cards da tela (Balancete round 66, LCDPR round 76,
DRE round 79) — só "Entradas e saídas" ainda estava sem tela própria.

**Parte 1 — Refino dos gráficos:**
- **Dados mockados de `caixa-data.js` reescritos**: o único lançamento gigante (Venda de soja,
  R$ 74.400, ~5x maior que qualquer outro do mês) foi dividido em 2 remessas mais moderadas
  (R$ 18.200/R$ 24.000) + ~12 lançamentos novos espalhados por julho/2026, resultando num
  gradiente de valores diários de ~R$ 89 a R$ 24.000 sem nenhum pico isolado dominando a
  altura do gráfico "Evolução do resultado" — confirmado ao vivo (`getComputedStyle` das
  alturas das barras: escada suave, sem saltos bruscos).
- **Hover das barras (DRE e Balancete, idêntico nos 2):** trocado de `opacity+stroke` (turvava
  a cor, adicionava contorno escuro) pra expansão pura via `transform:scale(1.05,1.08)` —
  mesma cor, sem contorno, transição suave (160ms). `transform-box:fill-box` + origem ancorada
  na linha de zero (embaixo pra barras positivas, em cima pras negativas no DRE; sempre embaixo
  no Balancete, que só tem barras positivas) — a barra parece crescer a partir do próprio ponto
  de referência, nunca do centro do gráfico. No Balancete, hover em qualquer ponto do dia
  também expande as 2 barras (Entrada+Saída) juntas, já que o tooltip é por dia, não por barra.
- **Eixo X reescrito** (`buildAxisLabelsHTML`, função duplicada em `dre.js`/`balancete.js` por
  convenção — telas de relatório não compartilham JS entre si): no agrupamento diário, mostra
  "01 Mmm" só no 1º dia de cada mês representado + o dia isolado a cada 5 dias (05/10/15/20/
  25/30), nunca repetindo o mês em toda coluna.
- **Bug real pego ao vivo, 2 rodadas seguidas:** o rótulo "01 Jul" (6 caracteres) não cabia
  numa coluna de ~9-11px (31 dias divididos pela largura do gráfico) — `overflow:hidden`
  cortava o texto quase por completo, sumindo até o número isolado do dia no mobile. Fix
  definitivo: rótulo dividido em 2 `<span>` (`-day`/`-month`), `overflow:visible` na coluna
  (o texto vaza pras colunas vizinhas VAZIAS, seguro porque os rótulos só aparecem espaçados a
  cada 5 dias) + `.{prefix}-axis-label-month{display:none}` abaixo de 768px — mobile mostra só
  o número do dia inteiro (nunca cortado), desktop mostra "01 Jul" completo.
- **Linha de zero**: já existia como referência matemática real nos 2 gráficos (não decorativa,
  calculada pela proporção entre maior valor positivo/negativo no DRE; sempre a base no
  Balancete) — só isolada numa classe própria (`.dre/bal-chart-zero-line`) e clareada um tom
  (`--color-gray-300` → `--color-gray-200`), pedido explícito.
- **Legenda "Resultado positivo/negativo" removida do DRE** (as cores das barras já são
  autoexplicativas nesse contexto) — a legenda "Entradas/Saídas" do Balancete foi MANTIDA (ali
  as cores distinguem 2 séries de dados diferentes, não um sinal óbvio só pela cor). Gap de
  8px (`--spacing-sm`) adicionado entre o eixo/gráfico e a legenda do Balancete, pedido à parte.
- **Raio das barras reduzido** de `0.9` pra `0.5` nos 2 gráficos — visual mais limpo.
- **Eixo Y removido nos 2 gráficos** (decisão de UX, pedido explícito de avaliar a melhor
  alternativa): as 3 gridlines horizontais que existiam (25/50/75%) nunca tinham valor numérico
  associado — eram só decorativas, não ajudavam a interpretar grandeza nenhuma. Adicionar um
  eixo Y de verdade exigiria reservar uma coluna lateral pro rótulo (o `<svg>` usa
  `preserveAspectRatio="none"`, que distorce texto embutido nele mesmo), uma mudança de layout
  desproporcional ao ganho. Optado por remover as gridlines e manter só a linha de zero (única
  referência horizontal com significado real) + o tooltip rico no hover (valor exato por
  coluna) — mesma filosofia "Stripe/Linear/Vercel" já documentada no código do Balancete desde
  a criação.

Verificado ao vivo (`getComputedStyle`/`getBoundingClientRect`, técnica já documentada em
rounds anteriores por causa da lentidão de composição do sandbox): hover crescendo 5%/8% sem
stroke/opacidade nos 2 gráficos; eixo X mostrando "01 Jul"/dias isolados no desktop e só os
dias (sem mês) no mobile, todos os números completos (não cortados, `getBoundingClientRect`
confirmando largura igual à do texto); linha de zero num tom mais claro; legenda do DRE
removida, a do Balancete com 8px de gap; raio das barras em 0.5; KPIs recalculando certo com o
dataset novo (R$ 140.900,00/R$ 56.159,00/R$ 84.741,00); nenhum erro de console.

**Parte 2 — Nova tela: Relatórios > Entradas e Saídas.**

Quarto relatório real dentro de Relatórios — `relatorios.js`'s `REAL_DESTINATIONS` ganhou a
entrada `'entradas-saidas'`, fechando os 4 cards da tela de entrada (Balancete/LCDPR/DRE/
Entradas e saídas, todos com fluxo real agora).

- **Arquivos novos:** `app/screens/entradas-saidas.html` + `app/shared/page-entradas-saidas.css`
  + `app/shared/entradas-saidas.js`. Mesmo padrão visual/de interação de Balancete/DRE/LCDPR
  (filtros em card recolhível, cabeçalho de resultado com resumo+ações Exportar PDF/Excel/
  Imprimir sem Compartilhar, tabela com 1ª coluna sticky, nunca vira Cards no mobile). Sem
  módulo de dados próprio — agrega `window.NiveloCaixa` (mesma fonte de Balancete/LCDPR/DRE).
- **"Agrupar por" (Categoria padrão / Cliente)** — `Dropdown` simples de 2 opções — troca
  dinamicamente qual combobox de filtro aparece (`#categoria-field`/`#cliente-field`, um
  `hidden` por vez, mesma posição no grid) e qual coluna a tabela usa.
- **Decisão de mapeamento documentada no código (`entradas-saidas.js`):** "Cliente" é a
  CONTRAPARTE do lançamento (`pessoaNome`/`pessoaDocumento` de `NiveloCaixa`, mesmo vocabulário
  livre já usado no combobox "Cliente ou Fornecedor" de Novo Lançamento de Caixa, round 43) —
  não restrito a cadastros com `tipo` incluindo `"cliente"` em `NiveloCadastros`. Boa parte das
  despesas do mock tem uma contraparte FORNECEDORA (ex. "Insumos Agrícolas Vale Ltda"); a
  proposta da tela é mostrar de onde vêm as receitas e pra onde vão as despesas por contraparte,
  então restringir a lista só a `tipo:cliente` deixaria a maioria das despesas sem grupo
  selecionável. Lançamentos sem nenhuma contraparte (tarifas, impostos, combustível avulso)
  caem no grupo "Sem cliente identificado" na tabela/donuts, mas não viram opção do filtro (não
  há "quem" escolher).
- **KPIs (4):** Total de entradas/Total de saídas/Saldo do período (cor semântica)/
  Movimentações (contagem inteira, sem formatação monetária) — mesma cópia estrutural exata de
  card de resumo (12px/24px fixo em qualquer largura), grid 1→2→4 colunas (mobile/~640px/
  1024px+, mesmo padrão de Contas a Pagar/Receber/DRE).
- **2 donuts (primeiro donut do sistema, SVG puro, sem lib)** — "Distribuição das entradas"/
  "Distribuição das saídas", lado a lado no desktop (1024px+)/empilhados no mobile. Técnica de
  círculos empilhados via `stroke-dasharray`/`stroke-dashoffset` (cada fatia é um `<circle>` de
  mesmo raio com um trecho tracejado do tamanho da própria fração + deslocamento acumulado das
  fatias anteriores); `<svg>` inteiro gira -90° via CSS pra a 1ª fatia nascer no topo (12h,
  convenção universal de pizza/donut). Paleta qualitativa de 8 cores (tokens já existentes:
  brand/green/orange/indigo/pink/yellow/red/blue, cicla se houver mais grupos), com um detalhe
  de consistência: a mesma categoria/cliente usa SEMPRE a mesma cor nos 2 donuts (mapa de cor
  construído 1x a partir da ordem da tabela — sorted por saldo — e reaproveitado pelos 2
  gráficos, não recalculado por donut). Centro do círculo mostra o total (bônus não pedido
  explicitamente, mas convenção comum de donut chart moderno — soma o mesmo valor do KPI
  correspondente). Legenda abaixo/ao lado com dot+nome+percentual+valor por fatia. **Somem por
  completo (`#es-donuts-row[hidden]`)** quando o filtro dinâmico está numa categoria/cliente
  específico (deixam de representar uma distribuição), e mostram uma mensagem própria
  ("Nenhuma entrada/saída no período") quando o lado correspondente está zerado.
- **Tabela: lista simples, não hierárquica** (diferente de Balancete/DRE, que são matriciais/em
  árvore) — 1 linha por categoria ou cliente, ordenada do maior pro menor saldo (`rows.sort`
  desc), 1ª coluna sticky ("Categoria" ou "Cliente", rótulo trocado conforme o agrupamento).
  Rodapé: 1 linha só ("Total", com Entradas/Saídas/Saldo final cada um sob a coluna certa),
  destaque de marca (fundo brand/negrito/cor de marca), mesma escala visual de "linha mais
  importante da tabela" já usada em Balancete/LCDPR/DRE. Zebra do corpo escopada a `#es-tbody`
  (ID, não classe genérica) — mesma lição de especificidade já documentada em LCDPR/DRE
  (`:nth-child` reinicia a contagem em cada `<tbody>`/`<tfoot>`, então uma regra de zebra
  genérica também pintaria a linha de rodapé, competindo com o destaque de Total).
- **Estado vazio:** quando não há nenhum lançamento pro período+filtros (`qtdMovimentacoes===
  0`), esconde KPIs/donuts/tabela e mostra um card central (ícone+título+texto), mesmo padrão
  de estado vazio já usado em outras listagens do sistema.
- **`prototype-nav/nav.config.js`:** novo item leaf "Entradas e Saídas" na journey "Jornada ·
  Financeiro" já existente, logo após "DRE".

Verificado ao vivo: geração com filtros padrão (mês 07/2026, Categoria) reproduzindo os mesmos
totais exatos de Caixa/Balancete/LCDPR/DRE (R$ 140.900,00/R$ 56.159,00/R$ 84.741,00, 25
movimentações, mesmo dataset reescrito na Parte 1); tabela com 7 categorias ordenadas
corretamente do maior pro menor saldo; donuts com percentuais/valores batendo com os totais
(Entradas: Venda de soja 60,3%/Venda de milho 39,7%; Saídas: 5 categorias somando 100%); troca
pra Agrupar por Cliente reclassificando a mesma base em 9 contrapartes (incl. "Sem cliente
identificado" com saldo -23.759, ordenado corretamente); selecionar um cliente específico
("Cerealista Bom Grão S.A.") escondendo os donuts e isolando 1 linha na tabela; mês sem nenhum
lançamento (janeiro/2024) mostrando o estado vazio com a mensagem correta; mobile (375px):
filtros recolhidos após gerar, donuts empilhados (1 coluna), tabela com scroll horizontal real
(550px em 341px de viewport) e 1ª coluna sticky confirmada via `getBoundingClientRect`
antes/depois do scroll; navegação real a partir do card "Entradas e saídas" em Relatórios;
nenhum erro de console em nenhum estado testado.

## Ajustes 2026-08-06 (round 83) — Notas Fiscais: prefill via Cadastro + rótulo; consistência de
label nos relatórios; tooltip e agrupamento em Entradas e Saídas

Pedido em 6 partes sobre Notas Fiscais e os relatórios financeiros, focado em reduzir
preenchimento manual e reforçar consistência visual.

1. **"Cadastrar Nota Fiscal" (Cadastro de Pessoas e Empresas) ganhou destino real.** Era
   flash-disable desde a criação da tela (round de origem do Cadastro). `cadastros.js`'s
   `openNovaNotaFiscal()`: grava só o `codigo` do cadastro de origem em `sessionStorage`
   (`nivelo.novanotafiscal.prefill`, mesmo mecanismo de uso único já usado pelo handoff de
   edição) e navega pra `nova-nota-fiscal.html`. Lido e removido no primeiro load de
   `nova-nota-fiscal.js`, só quando a tela abre em modo de CRIAÇÃO (nunca em `?numero=`).
2. **Participante pré-preenchido (nota de saída):** quando o cadastro de origem tem o papel
   "cliente", `destinatarioDropdown.selectValue(codigo)` seleciona automaticamente o mesmo
   participante no campo Cliente/Transportadora (documento/UF preenchidos de graça, já era o
   comportamento do `onChange` existente) — o usuário pode trocar normalmente depois.
3. **Tipo da nota definido automaticamente:** quando o cadastro de origem tem
   EXCLUSIVAMENTE o papel "fornecedor" (`tipo.length===1 && tipo[0]==='fornecedor'`), o radio
   "Nota de entrada" é marcado programaticamente antes do primeiro render (`refreshTipoNota
   Visibility()` já roda depois, então a tela abre direto no formulário de entrada — upload de
   XML, sem Certificado Digital). Qualquer outra combinação (Cliente sozinho, Cliente+
   Fornecedor, Fornecedor+Transportadora etc.) mantém o padrão atual (Saída pré-selecionada,
   usuário escolhe) — regra explícita do pedido.
4. **Rótulo "Cliente" → "Cliente / Transportadora"** em `nova-nota-fiscal.html` (campo do
   formulário + `dt` do modo de visualização) — só nomenclatura, a fonte de dados do dropdown
   continua sendo `NiveloCadastros.findByTipo('cliente')` (comportamento intocado, pedido
   explícito de manter).
5. **Consistência tipográfica do label "Mês/Ano" em Balancete/DRE/Entradas e Saídas — 2 bugs
   reais encontrados, não 1.** Investigação (`getComputedStyle`) achou:
   - **`DatePicker.module.css`'s `.dpLabel` só tinha `color` definido** (herdava peso/tamanho/
     entrelinha do body: 16px, mas peso ~300/light e sem letter-spacing) — nunca tinha a
     mesma tipografia de `.label` (Input/Dropdown: 16px/Medium/1.4/0.01em). Corrigido NA FONTE
     do componente (não um patch por página) — vale pra toda tela que já usa o DatePicker
     (Balancete/DRE/LCDPR/Entradas e Saídas/Contas a Pagar/Receber/Caixa/Estoque/Produtos), não
     só as 3 pedidas.
   - **Bug PRÉ-EXISTENTE achado no processo:** `RadioButton.module.css` declara `.label{font-
     weight:bold}` (rótulo do próprio grupo de radio, "Período") — carregado depois de `Input.
     module.css` no `<head>`, vencia por ordem e deixava TODOS os labels normais de campo
     (Categoria/Conta/Agrupamento/Agrupar por/Cliente) em Bold em vez do Medium correto do
     componente Input, nas 3 telas. Corrigido com um seletor mais específico
     (`.{prefix}-filtros-grid .label`) em cada `page-balancete.css`/`page-dre.css`/`page-
     entradas-saidas.css` — mesmo padrão de fix já usado várias vezes neste projeto pra essa
     classe de colisão, só que desta vez em `font-weight`, não em `opacity`/`position`. Sem os
     2 fixes juntos, "Mês/Ano" ficaria consistente com um valor ainda errado (Bold, por causa
     do 2º bug) — os dois precisavam ser corrigidos pra "Mês/Ano" bater de verdade com "Categoria"/
     "Agrupamento"/etc.
6. **Entradas e Saídas — tooltip nos donuts:** mesmo padrão visual/estrutural do tooltip dos
   gráficos de barra (DRE/Balancete — fundo escuro `--color-gray-900`, `position:fixed`,
   cabeçalho com borda inferior sutil, linhas rótulo+valor), classes próprias `.es-donut-
   tooltip*` (cópia deliberada, não uma função compartilhada — telas de relatório não
   compartilham JS entre si, mesma convenção já documentada). Um único elemento reaproveitado
   pelos 2 donuts; hover delegado no `<svg>` (persiste entre renders) via `e.target.closest(
   '.es-donut-slice')`, cada fatia carrega `data-label`/`data-value`/`data-percent` gravados
   no momento da construção do SVG. Mostra nome do grupo + Valor + Participação (%).
7. **Entradas e Saídas — títulos de agrupamento na tabela:** 2 linhas de cabeçalho ("Entradas"/
   "Saídas", `colspan="4"`, fundo de marca/negrito/cor de marca — mesma linguagem visual de
   "linha de grupo" já usada em Balancete/DRE) inseridas entre os blocos da tabela, sem alterar
   a ordenação existente (`report.rows`, já vem ordenado do maior pro menor saldo) — só
   reparticionada visualmente: uma linha entra em "Entradas" quando `entrada>0`, senão em
   "Saídas" quando `saida>0` (prioridade documentada no código; na prática cada categoria/
   cliente do dataset é sempre puramente um ou outro, mas a regra cobre com segurança o caso
   raro de uma mesma linha ter os dois tipos de lançamento no período). Bloco escondido por
   completo quando não há nenhuma linha daquele tipo (ex.: filtrar um cliente que só vendeu,
   sem nenhuma despesa, esconde o cabeçalho "Saídas"). Zebra do corpo (`#es-tbody .tr:nth-
   child`) precisou de um seletor com `.tr` explícito no cabeçalho de grupo pra igualar
   especificidade e vencer por ordem — mesma lição de zebra×linha-especial já documentada em
   LCDPR/DRE — e a célula (colspan) teve o `position:sticky` da 1ª coluna desligado (`position:
   static`), já que uma célula que já ocupa a largura inteira não precisa (nem deveria) grudar
   à esquerda durante o scroll horizontal.

Verificado ao vivo: ação "Cadastrar nota fiscal" em 3 cenários (fornecedor puro → abre em
Nota de entrada; cliente puro → Saída + destinatário/documento/UF pré-preenchidos; cliente+
fornecedor → mantém Saída, mas ainda pré-preenche o participante); rótulo "Cliente /
Transportadora" no formulário e na visualização; label "Mês/Ano" com peso/tamanho/entrelinha/
letter-spacing IDÊNTICOS aos demais labels de filtro nas 3 telas (`getComputedStyle`: 16px/
500/22.4px/0.16px em todos); LCDPR (não pedido, mas usa o mesmo componente) sem regressão;
tooltip do donut mostrando nome/valor/percentual corretos no hover e escondendo no mouseleave;
tabela de Entradas e Saídas com os cabeçalhos "Entradas"/"Saídas" corretos nos 2 modos de
agrupamento (Categoria e Cliente), incl. "Sem cliente identificado" corretamente dentro do
bloco Saídas; rodapé de Total intacto; nenhum erro de console em nenhuma das telas tocadas.

## Ajustes 2026-08-06 (round 84) — Nova tela Fiscal (Nota de entrada); auditoria de itens
diversos já implementados em rounds anteriores

Pedido em várias partes cobrindo Cadastro/Financeiro/Manifesto/Certificado Digital/
Configuração/KPIs/Tabelas/Mobile/Criar Conta. Boa parte já tinha sido resolvida em rounds
anteriores (confirmado por auditoria antes de tocar em qualquer arquivo); os itens abaixo
foram os que precisaram de trabalho de verdade nesta rodada.

- **Nova tela `app/screens/fiscal.html`** (+ `page-fiscal.css` + `fiscal.js`) — landing da
  Configuração > Fiscal, ativando o subsubitem "Nota de entrada" (`data-nav="fiscal-nota-
  entrada"`, já existia no HTML de todas as 52 telas com Sidebar completa, mas sem
  `NAV_DESTINATIONS`; provavelmente deixado por uma rodada/sessão anterior sem a tela real).
  Confirmado com o usuário via pergunta explícita: "Nota de entrada" ganha uma página própria
  "Fiscal" (não emenda em Certificado Digital nem em Natureza da Operação). Conteúdo: card
  único com descrição ("notas de entrada são as NF-es emitidas por terceiros para o CNPJ da
  empresa") + RadioButton Sim/Não "Deseja receber automaticamente as notas de entrada?" +
  botão Salvar, persistido em `localStorage` (`nivelo.fiscal.notaEntrada.autoReceber`, mesma
  convenção de configuração de conta já usada em `categorias-financeiras-data.js`/
  `safras-data.js`) + toast de sucesso. `interface-principal.js`: `NAV_DESTINATIONS['fiscal-
  nota-entrada'] = 'fiscal.html'`. `prototype-nav/nav.config.js`: novo leaf "Fiscal" na
  Jornada · Configuração, logo após o épico Certificado Digital.
- **Login e Criar Conta: campo CPF → "CPF ou CNPJ"** (`login.html`/`login.js`,
  `cadastro.html`/`cadastro.js`) — documento único com máscara auto-detectada por tamanho
  (até 11 dígitos formata como CPF, a partir do 12º vira CNPJ), mesma técnica já usada em
  `novo-manifesto.js` pro documento do motorista/responsável pelo frete. Validação com
  dígitos verificadores reais dos dois documentos (`isValidCPF`/`isValidCNPJ` completos, não
  só checagem de tamanho) — `isValidCNPJ` novo, adicionado às 2 telas (só existia uma versão
  simplificada, sem dígito verificador, em `nova-fazenda.js`). `maxlength` subiu de 14 pra 18
  (tamanho de um CNPJ formatado); textos de rótulo/erro atualizados nas 2 telas.
- **Padronização de largura: Contas Financeiras e Contas Bancárias.** `page-contas-
  financeiras.css`/`page-contas-bancarias.css` usavam `max-width:1200px`, destoando do padrão
  do resto das telas de Configuração (Produtos/Categorias/Fazendas, todas `1440px`). Corrigido
  nos 2 arquivos.
- **Categorias de receitas e despesas: tabela agora preenche 100% da largura disponível
  (Fill).** A tabela (round 39) tinha largura FIXA de 1100px mesmo dentro de um container de
  até 1440px, sobrando espaço morto à direita em telas largas. Corrigido: `.table` passou de
  `width:1100px` pra `width:100%;min-width:1100px`, e a coluna Descrição perdeu sua largura
  fixa (`width:auto` sob `table-layout:fixed` = recebe todo o espaço restante) — a tabela
  estica de verdade em telas largas, mas mantém a rolagem horizontal (via `min-width`) em
  telas mais estreitas que 1100px, sem quebrar o sticky de Ações.
- **Itens já implementados em rounds anteriores, confirmados por auditoria (nenhuma mudança
  necessária):** rename "Produtos" → "Produtos e serviços" (título+sidebar, round 26/47);
  filtro de Período em Contas a Pagar/Receber/Caixa (já existia desde a criação de cada
  jornada, rounds 43/45/65); título "Manifesto eletrônico" (round 64); botões de Novo
  Manifesto (Manifestar primário/Salvar manifesto secundário/Cancelar já em `.btn.ghost`,
  round 64); campo "Data de validade" em Importar Certificado (round 56) e seção
  "Observação" (nunca existiu nessa tela, ou já removida no round 57); padronização de
  título/espaçamento dos cards de KPI (round 55); coluna Ações com largura "Hug" (cada
  tabela do sistema já usa uma largura própria dimensionada pro número de ícones daquela
  tabela especificamente — 96px/1 ícone, 120px/2, 170px/4 — não uma largura genérica
  sobrando); vídeo da Landing Page travado em 00:00:05 no mobile (implementado junto com a
  seção Hero, sem round numerado específico).

Verificado ao vivo: `fiscal.html` renderizando o card/descrição/radio corretos, subsubitem
"Nota de entrada" `is-active`, alternar Sim/Não sincronizando a classe `.checked` do dot,
Salvar persistindo em `localStorage` e mostrando o toast; lógica de máscara/validação de
CPF/CNPJ conferida via Node (CNPJ real com dígito verificador válido passa, inválido não
passa; CNPJ auto-formatado corretamente a partir do 12º dígito) — a verificação visual no
Browser pane deste sandbox mostrou JS desatualizado mesmo após reload forçado (mesma
instabilidade de cache já documentada em rounds anteriores), contornada validando a lógica
isoladamente fora do navegador; `page-contas-financeiras.css`/`page-contas-bancarias.css`
com `max-width:1440px` confirmado; Categorias de receitas e despesas sem mudança de
comportamento fora do preenchimento de largura.

## Ajustes 2026-08-06 (round 85) — Estoque de Uso ganha tratamento V2 completo (paridade com
Vendas/Comprometido)

Estoque de Uso (aba "Estoque de Uso" em `estoque-v2.html`) não tinha nenhum tratamento V2 até
esta rodada — lia direto de `window.NiveloEstoqueCompras` (V1), uma linha por COMPRA (não por
produto), sem depósito/custo médio/histórico rico. Pedido explícito: dar o mesmo tratamento já
existente em Vendas (`estoque-vendas-v2-data.js`) e Comprometido
(`estoque-comprometido-v2-data.js`).

- **Novo módulo `app/shared/estoque-uso-v2-data.js`** (`window.NiveloEstoqueUsoV2` —
  `list/findByCodigo/registrarEntrada/registrarConsumo/ajustarEstoque`). Códigos NOVOS
  `USO-00N` (não reaproveitados os `CMP-00N` do V1) — decisão documentada no arquivo: o V1 tinha
  1 código por COMPRA (14 registros), o V2 tem 1 código por PRODUTO (5 registros agregados, cada
  um com o histórico das compras antigas dentro) — não há mapeamento 1:1 entre os dois conjuntos.
  `estoque-compras-data.js` (V1) ficou órfão, mesmo princípio já usado em `bancos-data.js`.
  `custoMedio` de cada produto seed calculado como média ponderada por quantidade das compras que
  tinham `valorUnitario` informado (a compra original de Defensivo, CMP-003, nunca teve preço —
  mantido `null`/excluído do cálculo). 2 consumos de demonstração adicionados ao seed (Adubo/
  Defensivo), usando Fazenda/Talhão reais de `fazendas-data.js`, pra o histórico da tela de "Ver
  detalhes" já nascer com pelo menos 1 exemplo de cada tipo.
- **Tabela da aba Compras** (`estoque-v2.js`'s `renderCompras`): Quantidade agora segue o mesmo
  padrão visual de Vendas/Comprometido (`.estoquev2-row-qty`/`-qty-unit`/`-conversao`, com linha
  de conversão quando aplicável via `getConversao()`); colunas novas Custo médio/Valor em estoque;
  coluna "Unidade" solta removida (sigla já inline com a quantidade). 4 ações por linha/card
  (Registrar entrada/Registrar consumo/Ver detalhes/Ajustar estoque, mesmo padrão ícone+Tooltip).
  Cards do mobile ganharam `buildComprasCardHTML` próprio (antes compartilhava
  `buildQuantidadeCardHTML` com nada, já que Comprometido tem o seu). `EXPORT_CONFIG.compras`
  atualizado pras novas colunas.
- **"Ajustar estoque" generalizado**: `ajusteState`/`openAjustarEstoqueModal`/
  `ajusteConfirmBtn` (antes hardcoded pra `window.NiveloEstoqueVendasV2`) agora aceitam um
  `modulo` (qual API chamar) + `onAfterAjuste` (callback de re-render) — mesmo modal/markup/
  lógica reaproveitado por Vendas e por Uso, sem duplicar HTML/JS.
- **Nova tela: "Registrar entrada — Estoque de Uso"** (`registrar-entrada-estoque-uso-v2.html`
  + `.js`), estrutura idêntica à de Vendas: tag "Estoque de Uso" no topo (mesmo
  `.estoquev2-tipo-tag` já usado em Comprometido); Produto (readonly)+Data lado a lado;
  Fornecedor (`NiveloCadastros.findByTipo('fornecedor')`)+Depósito (`NiveloLocais.list()`) lado
  a lado; Quantidade com sufixo de unidade + preview de conversão; Preço unitário (máscara R$)+
  Valor total (readonly, calculado) lado a lado; Nota fiscal/Documento em campo único opcional.
  Submit chama `registrarEntrada()` (atualiza custo médio via média ponderada, última compra,
  depósito, histórico) e redireciona com toast, mesmo padrão sessionStorage de sempre.
  **Vendas' `registrar-entrada-estoque-v2.html` também ganhou a tag "Estoque de Vendas"** (pedido
  explícito à parte, mesmo visual).
- **"Registrar consumo" (modal existente em `estoque-v2.html`) estendido**: Fazenda/Talhão
  (dependente, mesma técnica exata do bloco "Origem da entrada" de Vendas) + Custo (readonly,
  `custoMedio × quantidade`, recalculado ao vivo a cada tecla). Confirmar chama
  `registrarConsumo()` (reduz do depósito com maior saldo — simplificação documentada, já que o
  fluxo não tem campo de depósito de saída) em vez de mutar o registro direto.
- **Nova tela: "Ver detalhes — Estoque de Uso"** (`detalhe-estoque-uso-v2.html` + `.js`),
  mesma estrutura de Vendas: tag "Estoque de Uso", 4 KPIs fixos (Saldo total/Custo médio/Valor
  em estoque/Última compra — tamanho fixo em qualquer largura, regra do round 55), "Estoque por
  depósito", histórico de movimentações (timeline). Histórico: ENTRADA mostra Fornecedor/Origem
  + Depósito (Destino/Talhão omitido); CONSUMO mostra Fornecedor/Origem "—" + Destino/Talhão
  ("Fazenda X · Talhão Y", Depósito omitido — mesma decisão documentada no código: este fluxo
  não rastreia depósito de saída). Ações no cabeçalho: Registrar entrada (navega)/Registrar
  consumo (mesmo modal, réplica de markup+lógica)/Ajustar estoque (popover "mais", réplica do
  padrão de Vendas). `renderCompras`'s ação "ver-detalhes" agora aponta pra esta tela nova só
  no painel `compras` — Comprometido continua indo pro V1 `detalhe-estoque.html`, intocado.
- **Bug real corrigido (mais uma ocorrência do padrão `hidden`+`display` incondicional, já
  documentado dezenas de vezes neste arquivo):** `.detalhev2-header-actions` (bloco de botões do
  cabeçalho de "Ver detalhes") não tinha guard `[hidden]` — o bloco continuaria visível no estado
  "Registro não encontrado" mesmo com `hidden` setado via JS, tanto na tela de Vendas (bug
  pré-existente, nunca notado) quanto na nova de Uso. Corrigido em
  `page-detalhe-estoque-v2.css` (`.detalhev2-header-actions[hidden]{display:none}`), beneficia as
  duas telas.
- **`app/shared/page-estoque-uso-v2.css`** (novo): larguras de coluna da tabela de Compras, cópia
  do `.estoquev2-tipo-tag` (pra não precisar carregar `page-registrar-entrega-estoque-v2.css`,
  que traz CSS irrelevante pras 2 telas novas), gap padrão de "Ver detalhes".
- **`prototype-nav/nav.config.js`:** 2 novas entradas dentro do grupo Estoque V2 já existente
  (`estoque-detalhe-uso-v2` com variante "não encontrado", `estoque-registrar-entrada-uso-v2`).

Verificado ao vivo (servidor `http-server`, porta 8090): aba "Estoque de Uso" com as novas
colunas/ações renderizando corretamente (5 produtos agregados, custo médio/valor em estoque
batendo com o cálculo manual); Registrar entrada salvando e atualizando custo médio via média
ponderada — confirmado com uma 2ª entrada que o novo custo médio pondera corretamente contra o
saldo anterior; Registrar consumo com Fazenda/Talhão reais reduzindo a quantidade do depósito de
maior saldo e mostrando o Custo calculado ao vivo; Ajustar estoque funcionando identicamente ao
de Vendas (modal reaproveitado, `modulo`/`onAfterAjuste` corretos); Ver detalhes mostrando os 4
KPIs corretos e histórico populado com Fazenda · Talhão nas linhas de consumo e Fornecedor/
Depósito nas de entrada; bug do `.detalhev2-header-actions[hidden]` confirmado corrigido nas 2
telas (Vendas e Uso); nenhum erro de console em nenhuma das 4 telas tocadas/criadas.

## Ajustes 2026-08-31 (round 86) — Caderno de Campo V2: nova versão completa,
V1 aposentado só pro navegador de protótipo

Pedido grande: construir a V2 do Caderno de Campo, que passa a ser a versão do produto que a
Sidebar real navega pra sempre a partir de agora. V1 (`caderno-de-campo.html`, `fazenda-
detalhe.html`, `talhao-detalhe.html`, `nova-anotacao.html`, `caderno-data.js`) foi preservada
100% intacta — nenhum arquivo tocado, nenhum dado renomeado — e ficou acessível só pelo navegador
de protótipo, dentro do novo grupo "Caderno de Campo (V1)".

- **Arquivos novos:** `app/shared/caderno-v2-data.js` (`window.NiveloCadernoV2`); `app/screens/
  caderno-de-campo-v2.html` + `page-caderno-de-campo-v2.css` + `caderno-de-campo-v2.js` (Tela 1,
  listagem de fazendas); `app/screens/fazenda-detalhe-caderno-v2.html` + `page-fazenda-detalhe-
  caderno-v2.css` + `fazenda-detalhe-caderno-v2.js` (Tela 2, Entrada na Fazenda, com a Tela 3 —
  tabela de Talhões — embutida na mesma página, mesma estrutura já usada pelo V1); `app/screens/
  talhao-detalhe-v2.html` + `page-talhao-detalhe-v2.css` + `talhao-detalhe-v2.js` ("Ver
  detalhes" de um talhão, ação da tabela de Talhões); `app/screens/nova-anotacao-v2.html` +
  `page-nova-anotacao-v2.css` + `nova-anotacao-v2.js` (Tela 4, criação de registro).
- **Novo módulo de dados em vez de estender `caderno-data.js` (V1):** o shape diverge o
  suficiente (novos tipos de registro com campos próprios, `talhaoId` deixando de ser opcional)
  pra justificar um módulo próprio, mesmo princípio já usado em outras V2 do sistema (ex.
  `estoque-vendas-v2-data.js` ao lado de `estoque-compras-data.js`). `caderno-data.js` (V1)
  continua 100% funcional e intocado.
- **Decisão de escopo confirmada no código: "Tipo de registro" ganhou um 4º tipo, Colheita,
  além dos 3 pedidos explicitamente (Anotação/Aplicação de insumo/Despesa manual).** O pedido
  listou os 3 tipos como "pelo menos estes" (não uma lista fechada), e os KPIs pedidos pra
  Tela 1/Tela 2 (Produtividade, Produtividade média, Produção registrada) exigem uma fonte de
  dado de produção/colheita — sem um tipo próprio pra isso, essas métricas nunca teriam nenhum
  dado real pra agregar. Colheita foi posicionado por último nos 4 cards de seleção (Anotação
  continua sendo o primeiro, como pedido), com Produto (Grãos)/Quantidade/Unidade (auto).
- **Regra central, sem exceção: todo registro tem `fazendaId` + `talhaoId`.** Não existe mais
  nenhum caminho de criação a nível de fazenda (V1 tinha `?fazenda=` sem `?talhao=` como entrada
  válida) — `nova-anotacao-v2.html` só é alcançável com `?fazenda=&talhao=` na URL (a partir da
  ação "Nova anotação" da tabela de Talhões ou do cabeçalho de Talhão > Ver detalhes); sem os
  dois parâmetros válidos, a tela mostra um card de erro ("Nenhum talhão selecionado...") e
  esconde o `<form>` inteiro (`form.hidden = true`) — verificado ao vivo que o formulário não
  fica acessível nesse estado.
- **Fazenda/Talhão/Cultura atual/Safra: sempre contexto não editável.** Os 4 campos são
  `<input disabled readonly>` (mesmo padrão visual já usado em "Emitente" de Nova Nota Fiscal),
  nunca dropdowns — Cultura atual/Safra vêm direto de `talhao.cultura`/`talhao.safra`
  (`fazendas-data.js`), não mais da última anotação do talhão como o V1 fazia (mudança de
  comportamento deliberada, pedida explicitamente).
- **Tela 1 (`caderno-de-campo-v2.html`):** cada card de fazenda ganhou **Área total** (já
  existia em `fazenda.areaHa`, só não era mostrada no card do V1) e um bloco de KPIs substituindo
  o resumo simples de despesas/vendas/colheitas do V1: **Produtividade** (total unit-aware, nunca
  soma unidades diferentes — agrupa por sigla e mostra a maior como destaque, o resto como linhas
  secundárias "+ N un"), **Produtividade média** (total ÷ `areaHa`, "sc/ha"), **Despesa
  acumulada** (renomeada de "Despesas", mesmo conceito de soma total) e **Despesa média por
  hectare** (despesa acumulada ÷ `areaHa`). **Decisão documentada no código:** "Despesa
  acumulada"/"Custo acumulado" somam tanto `despesa-manual.valor` quanto
  `aplicacao-insumo.custoCalculado` — os dois representam gasto real da operação, mesmo a
  Aplicação de insumo não sendo literalmente um registro do "tipo Despesa".
- **Tela 2 (`fazenda-detalhe-caderno-v2.html`):** removido o card "Safra" (pedido explícito).
  "Talhões" manteve a posição; logo depois entraram, na ordem exata pedida: **Custo acumulado**,
  **Produção registrada** (unit-aware, mesmas regras da Tela 1), **Produtividade média**,
  **Custo médio por hectare**, **Anotações registradas** (conta só `tipo==='anotacao'`, não
  Despesa/Aplicação de insumo, como pedido explicitamente). **"Cultura atual" foi preservada**
  (não estava na lista de remoção, só "Safra" foi removida) e reposicionada pro final do grid,
  já que os 5 KPIs novos precisavam entrar logo depois de Talhões — resultando num resumo de 8
  cards (grid ganhou um degrau extra de 3 colunas antes de virar 4, pra não espremer demais em
  telas médias).
- **Tela 3 (tabela de Talhões, embutida na Tela 2):** o V1 usava linhas clicáveis inteiras
  (`.talhao-row`, sem ações em ícone). Com a coluna nova **Última Anotação**
  (`dd/mm/aaaa · hh:mm`, do registro mais recente de QUALQUER tipo daquele talhão — não é
  específico de "anotação") mais as 3 ações pedidas (Nova anotação/Encerrar safra/Ver detalhes),
  "linha inteira clicável" deixaria de ser inequívoco — decisão explícita de virar uma tabela de
  verdade (`.table`/`.tr`/`.td`, mesma cópia visual de Estoque já usada em outras tabelas do
  sistema) com Cards no mobile, ações via `.actionBtn`+`.tip` (mesmo padrão de tooltip fixo já
  usado em `fazenda-detalhe-cadastro.js`/`produtos.js`).
- **"Encerrar safra" — decisão de comportamento, documentada explicitamente por não estar
  pinada no pedido:** é uma ação REAL (não um stub), com confirmação num Dialog explicando o que
  vai acontecer — limpa `talhao.cultura`/`talhao.safra` (`null`) e volta o `status` pra
  `'disponivel'`, mesmo espírito de "Alterar status" que o V1 já tinha pra outro propósito. Modal
  reaproveitado tanto na tabela de Talhões (Tela 2) quanto no cabeçalho de Talhão > Ver detalhes
  (Tela "talhao-detalhe-v2"), sem duplicar lógica de negócio (cada tela tem sua própria cópia de
  markup+handler, mesmo princípio de "réplica de página" já documentado em Estoque/Contas a
  Pagar — as duas telas não compartilham JS entre si).
- **Nova tela "Ver detalhes" de talhão (`talhao-detalhe-v2.html`):** mirror estrutural de
  `talhao-detalhe.html` (V1) — indicadores de Área/Cultura/Safra + registros do Caderno (Custo
  registrado/Produção registrada/Anotações) + lista de registros (mais recente primeiro, ícone
  por tipo) — adaptado aos 4 tipos de registro do V2 em vez dos 4 do V1 (Despesa/Venda/Colheita/
  Anotação). Ações no cabeçalho: Nova anotação (fazenda+talhão pré-selecionados) e Encerrar
  safra (mesmo modal da Tela 2).
- **Tela 4 (`nova-anotacao-v2.html`):**
  - **Tipo de registro** renomeado de "Tipo de anotação" (V1), com "Anotação" como 1º card
    (pedido explícito), seguido de "Aplicação de insumo" (renomeado de "Venda", mudança de
    comportamento completa — não é mais uma venda comercial, é o registro de um insumo aplicado
    no talhão) e "Despesa manual".
  - **Anotação:** Título (novo campo, texto livre) + Descrição (renomeada de "Observação").
  - **Aplicação de insumo:** Produto via combobox-com-busca (`initProductCombobox`, novo —
    input de texto + menu filtrado em `position:fixed`, mesmo espírito do combobox de Produto já
    usado em Estoque/Contas a Pagar, mas construído do zero pra esta tela por não compartilhar
    JS entre telas) sobre `window.NiveloProdutos.list()`; Quantidade; Unidade sempre auto-
    preenchida a partir do Produto (`disabled`, nunca escolhida, mesma regra já estabelecida em
    Estoque); Depósito via `Dropdown` só com `window.NiveloLocais.list()` filtrado por `ativo`
    (nunca cria um depósito novo inline aqui, ao contrário de outras telas do sistema que
    permitem isso); Custo calculado (`disabled`, recalculado ao vivo a cada tecla em Produto/
    Quantidade) via `window.NiveloCadernoV2.getCustoMedioBySku()`, que lê o `custoMedio` real de
    `window.NiveloEstoqueUsoV2` quando o produto tem entrada ali (fallback `0` caso contrário,
    documentado no código — nem todo produto do catálogo tem uma compra registrada no Estoque de
    Uso V2 ainda).
  - **Despesa manual:** Categoria (`Dropdown` novo, exatamente Serviço/Frete/Outro, como pedido)
    + Valor (R$, mesma máscara de centavos já usada em todo o sistema) + Observação (opcional) —
    mantendo os campos de valor/data já existentes no conceito de Despesa do V1.
  - **Colheita (4º tipo, ver decisão acima):** Produto (`Dropdown`, só `categoria==='Grãos'`,
    ativos) + Quantidade + Unidade (auto, `disabled`) — pré-seleciona o produto cujo nome bate
    com `talhao.cultura`, mesma conveniência que o V1 tinha pra Cultura (só um default, o
    usuário pode trocar livremente).
  - **Sigla de unidade sempre dinâmica por produto** (`UNIDADE_SIGLA`, mapa Saca→sc/Kg→kg/
    Litro→L/Unidade→un) — nunca um "sc"/"kg" hardcoded fora desse único ponto, mesmo princípio
    do card "Estoque de grãos" do Dashboard.
- **`interface-principal.js`:** `NAV_DESTINATIONS['caderno-campo']` repontado de
  `'caderno-de-campo.html'` pra `'caderno-de-campo-v2.html'` — essa ÚNICA linha já ativa a V2
  como destino real do item "Caderno de campo" em toda tela com Sidebar completa, sem precisar
  de mass-edit nas ~90 telas do sistema (o item de sidebar em si, `data-nav="caderno-campo"`, já
  existia igual em todas). Nenhuma tela precisou ser editada além desta linha.
- **`prototype-nav/nav.config.js`:** dentro da "Jornada · Caderno de Campo", o épico antigo
  virou **"Caderno de Campo (V1)"** (rótulos internos das 4 telas também sufixados "(V1)" pra
  desambiguar visualmente no navegador) e um novo épico **"Caderno de Campo (V2)"** foi
  adicionado ANTES dele, com as 4 telas novas + variantes (`#state=empty`, sem talhões, talhão
  não encontrado, sem talhão pré-selecionado em Nova anotação — demonstra o card de erro).
- **Guard `hidden`+`display` aplicado preventivamente em todo CSS novo** (`.overlay[hidden]`,
  `.talhoes-empty:not([hidden])`, `.anotacoes-empty:not([hidden])`, `.nova-anotacao-error-
  card:not([hidden])`, `.nova-anotacao-subsection[hidden]`, etc.) — nenhum bug desta classe foi
  necessário corrigir depois, por ter sido guardado desde a criação de cada arquivo, seguindo a
  regra permanente já documentada dezenas de vezes neste arquivo.
- **Mesma limitação de sempre, já documentada em todo o protótipo:** `caderno-v2-data.js` usa
  `sessionStorage` (não `localStorage`) pros registros criados na sessão — sobrevivem à
  navegação entre as 4 telas da mesma aba, mas não a uma sessão nova, mesmo padrão de
  `caderno-data.js` (V1) e `fazendas-data.js`.

Verificado ao vivo (servidor `http-server`, porta 8090, preserva query string/hash): fluxo
completo Tela 1 → card de fazenda (Área total/KPIs corretos) → Tela 2 (sem card Safra, KPIs na
ordem pedida, tabela de Talhões com Última Anotação + 3 ações) → Nova anotação nos 4 tipos
(Anotação/Aplicação de insumo — combobox de Produto, Unidade auto "L", Depósito só com opções
reais, Custo calculado recalculando ao vivo/Despesa manual — Categoria fixa Serviço-Frete-Outro/
Colheita — Produto pré-selecionado pela cultura do talhão, Unidade auto "sc") → volta pro Talhão
certo com o registro novo no histórico e o toast de sucesso; validação bloqueando submit sem
talhão selecionado (formulário genuinamente escondido, não só desabilitado) e por tipo (bordas
vermelhas nos campos obrigatórios, sem navegar); "Encerrar safra" com confirmação real, limpando
cultura/safra e voltando o talhão pra "Disponível" (testado na tabela da Tela 2 e no cabeçalho
da tela "Ver detalhes"); mobile (375px): tabela de Talhões vira Cards sem overflow horizontal
(`scrollWidth` igual à viewport); navegação real a partir da Sidebar (Dashboard → Caderno de
campo → V2); V1 (`caderno-de-campo.html` e as demais 3 telas) confirmado intocado e ainda
funcional, acessível só pelo `prototype-nav`; nenhum erro de console real em nenhuma das 4 telas
novas (só os 404 de `/fonts/*.otf` já documentados como pré-existentes em todo o sistema).

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
| Detalhe da fazenda — operacional (Caderno de Campo) | **V1: Nova (round 29, 2026-07-28; recategorizada round 30).** `fazenda-detalhe.html` preservada 100% intacta, acessível só via "Jornada · Caderno de Campo (V1)" no `prototype-nav` — não é mais o destino real da Sidebar. **V2 (round 86, 2026-08-31): é a versão real do produto agora.** Ver seção própria "Caderno de Campo V2" abaixo e "Ajustes round 86". |
| Categorias de receitas e despesas (Configuração) | **Nova (round 38, 2026-07-30)** — Done. Listagem (`categorias-financeiras.html`, tabela+Agrupamento de Filtros+Cards mobile, sem paginação) + cadastro/edição (`nova-categoria-financeira.html`, Dados básicos/Configuração do DRE/Configuração do LCDPR/Competência). Exclusão bloqueada (mock `emUso`) quando a categoria já está vinculada a lançamentos. Classificação específica do LCDPR deliberadamente não implementada ainda (estrutura de dado preparada, sem inventar opções). Ver "Ajustes round 38" acima |
| Notas fiscais (Vendas) | **Nova (round 40, 2026-07-31)** — Done. Central de Notas Fiscais (`notas-fiscais.html`, tabs Saída/Entrada com colunas próprias, busca+Período+Status incl. Rejeitadas) + fluxo de Nova Nota Fiscal (`nova-nota-fiscal.html`, só saída estruturada: Emitente/Destinatário/Itens/Pagamento/Categoria/Transporte/Natureza da operação com CFOP/Observação), com visualização/correção via `?numero=&modo=ver\|corrigir`. Bloqueio de emissão sem Certificado Digital cadastrado (Dialog explicativo, fechável). Certificado Digital continua como tela de configuração não construída (stub de dado); Natureza de Operação/RF402 ganhou tela real no round 51 (ver abaixo). Ver "Ajustes round 40" acima |
| Caixa (Financeiro) | **V1: Nova (round 43, 2026-07-31)** — preservada 100% intacta, acessível só via "Jornada · Financeiro" épico "Caixa (V1)" no `prototype-nav`, não é mais o destino real da Sidebar. **V2 (round 90, 2026-08-31): é a versão real do produto agora.** Ver "Ajustes round 90" abaixo |
| Contas a Pagar (Financeiro) | **V1: Nova (round 45, 2026-07-31)** — preservada 100% intacta, acessível só via "Jornada · Financeiro" épico "Contas a pagar (V1)" no `prototype-nav`, não é mais o destino real da Sidebar. **V2 (round 91, 2026-08-31): é a versão real do produto agora.** Abas Todas/Em aberto/Pagas, Descrição/Valor original/Pago/Saldo, só 3 status, só a ação Registrar pagamento (página própria com Histórico de Pagamentos em accordion + separação principal×juros×desconto). Ver "Ajustes round 91" abaixo |
| Contas a Receber (Financeiro) | **V1: Nova (round 65, 2026-08-04)** — segue disponível/intacta em `contas-a-receber.html`. **V2 reescrita por completo (round 92, 2026-08-31), espelhando a arquitetura de Contas a Pagar V2** — é a versão real do produto agora. Abas Todas/Em aberto/Recebidas, Cliente/Descrição/Documento-NF/Vencimento/Status/Valor original/Recebido/Saldo, só 3 status, só a ação Registrar recebimento (página própria com Histórico de recebimentos em accordion + separação principal×juros×desconto, Conta de entrada = Contas Financeiras). Ver "Ajustes round 92" abaixo |
| Canal de Ideias | **Nova (round 50, 2026-08-03)** — Done. Comunidade de sugestões: feed (`canal-ideias.html`, busca+ordenação+chips de categoria+cards com voto inline), detalhe (`ideia-detalhe.html`, coluna única, sem sidebar de conteúdo, comentários), criação (`nova-ideia.html`, página simples de 3 campos). 3 componentes novos no Storybook (`Avatar`/`Chip`/`VoteButton`). Sem status/aprovação/backlog/priorização, por instrução explícita — só espaço colaborativo. Ver "Ajustes round 50" acima |
| Contas Bancárias (Configuração > Conta bancária) | **Done (round 56, 2026-08-03; corrigido round 59, 2026-08-04)** — Listagem (`contas-bancarias.html`, busca+ordenação+paginação+Excluir REAL com confirmação) + cadastro/edição (`nova-conta-bancaria.html`, Código auto-increment+Banco (catálogo real)+Descrição+Agência/Conta com máscara+Conta Financeira). "Conta Financeira" referenciava um stand-in (Categorias de receitas e despesas) até o round 59, quando a entidade real (`contas-financeiras.html`) foi construída e o vínculo corrigido. Migrou a fonte do campo Banco de Caixa do stub antigo (`bancos-data.js`) pro catálogo real. Ver "Ajustes round 56/59" acima |
| Conta Financeira (Configuração > Conta Financeira) | **Nova (round 59, 2026-08-04)** — Done. Listagem (`contas-financeiras.html`, busca por Código/Nome+ordenação (Código como padrão)+paginação+Excluir bloqueado quando vinculada a Caixa/Conta Bancária, com mensagem explicando o motivo) + cadastro/edição (`nova-conta-financeira.html`, só Código auto-increment readonly+Nome único). Usada pra gerar o DRE (preparação de dados, sem tela de relatório ainda) e como novo campo obrigatório em todo lançamento de Caixa. Ver "Ajustes round 59" acima |
| Natureza da Operação (Configuração > Fiscal) | **Nova (round 51, 2026-08-03)** — Done. Substitui o item "Notas fiscais" removido do submenu Fiscal. Listagem (`naturezas-operacao.html`, abas Entrada/Saída+busca+filtro de Situação+Ativar/Desativar com confirmação) + cadastro/edição (`nova-natureza-operacao.html`, Dados Gerais+Padrões pré-configurados+Configuração Tributária em `Accordion` com 5 blocos independentes: Simples Nacional/IPI/ISSQN/PIS/COFINS). Primeiro uso real do componente `Accordion` do Storybook. Ver "Ajustes round 51" acima |
| Relatórios (Financeiro > Relatórios) | **Nova (round 53, 2026-08-03)** — Done, página de entrada. `relatorios.html`: 4 cards clicáveis (Balancete/LCDPR/DRE/Entradas e saídas), grid 2 colunas desktop/1 mobile, sem abas. Todos os 4 relatórios têm tela própria completa desde o round 82. Ver "Ajustes round 53/66/76/79/82" acima |
| LCDPR (Financeiro > Relatórios > LCDPR) | **Nova (round 76, 2026-08-05)** — Done. `lcdpr.html`: filtros (Ano-calendário/Intervalo personalizado + Conta/Categoria pesquisáveis) em card recolhível, KPIs (Total de receitas/despesas/Resultado do período), tabela cronológica (Data/Documento/Histórico/Categoria/Entradas/Saídas) com 1ª coluna (Data) sticky, rodapé com totais em destaque, estado vazio. Mesmo padrão visual de Balancete, sem gráfico. Ver "Ajustes round 76" acima |
| DRE (Financeiro > Relatórios > DRE) | **Nova (round 79, 2026-08-05)** — Done. `dre.html`: filtros (Mês/Intervalo personalizado + Categoria pesquisável + Agrupamento, sem Conta) em card recolhível, 4 KPIs (Receita Bruta/Total de Despesas/Resultado do Período/Margem %), gráfico de barra única divergente (Resultado por período, sobe verde/desce vermelho), tabela hierárquica (Receitas→Receitas Operacionais/Outras Receitas→Total das Receitas→(-) Despesas→Custos/Despesas Operacionais/Despesas Financeiras/Outras Despesas→Total das Despesas→(=) Resultado do Exercício, com destaque visual máximo) com 1ª coluna sticky. Mesmo padrão visual de Balancete/LCDPR. Gráfico refinado no round 82 (hover por expansão, eixo X "01 Mmm"+dias a cada 5, sem eixo Y, raio de barra reduzido). Ver "Ajustes round 79/82" acima |
| Entradas e Saídas (Financeiro > Relatórios > Entradas e Saídas) | **Nova (round 82, 2026-08-06)** — Done, fecha os 4 relatórios de Relatórios. `entradas-saidas.html`: filtros (Mês/Intervalo personalizado + Agrupar por Categoria/Cliente + filtro dinâmico correspondente) em card recolhível, 4 KPIs (Entradas/Saídas/Saldo/Movimentações), 2 donuts (Distribuição das entradas/saídas — primeiro donut SVG do sistema, somem quando um item específico é filtrado), tabela flat ordenada por saldo desc com 1ª coluna sticky. "Cliente" = contraparte do lançamento (`pessoaNome`), não restrito a cadastros `tipo:cliente`. Ver "Ajustes round 82" acima |
| Vídeos | **Nova (round 70, 2026-08-05)** — Done, só a listagem (pedido explícito). `videos.html`: cards com thumbnail/título/categoria/CTA "Assistir no YouTube", grid `auto-fill` responsivo, clique abre o vídeo em nova aba (`window.open`, sem player embutido). Sem tela de cadastro/admin ainda — `videos-data.js` já implementa a extração automática de metadados via oEmbed público do YouTube e a validação de link, prontas pra uma futura tela administrativa. Ver "Ajustes round 70" acima |
| Minha Conta (Dados/Plano/Pagamento) | **Nova (round 71, 2026-08-05)** — Done. `minha-conta.html`, 3 abas via `Tab` real, hash `#tab=&state=` pros cenários de demonstração. Dados: form completo + CEP/ViaCEP + Estado (Dropdown). Plano: status/card de trial/seletor "Escolher outro plano" (sempre via Comercial/WhatsApp, nunca upgrade automático). Pagamento: renovar/cancelar renovação/aviso de vencimento próximo/histórico. Ver "Ajustes round 71" acima |
| Contratar plano (fluxo de compra) | **Nova (round 71, 2026-08-05); Etapa 1 redesenhada + 3 bugs corrigidos (round 72)** — Done. `comprar-plano.html`, chrome minimalista sem Sidebar, **2 etapas** (Plano→Pagamento) + Confirmação — Plano é um acordeão vertical (plano expande e já mostra Mensal/Anual dentro dele, sem parecer landing page). Cartão (mensal/anual, parcelamento 1-12x empilhado) ou PIX (só anual, QR ilustrativo+copia-e-cola+mock de verificação em 2 cliques). Cupom de desconto, resumo ao vivo, estados de erro/carregamento. Acessível de "Contratar agora" (Dashboard) e "Realizar pagamento" (modal de trial expirado) — mesma tela nos 2 casos. Ver "Ajustes round 71/72" acima |

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

## Ajustes 2026-08-31 (round 87) — V2 Caderno de Campo: Histórico de Safras do
Talhão, KPIs novos e "Encerrar safra" fechando o histórico de verdade

Pedido pontual só em `talhao-detalhe-v2.html` (tela "Ver detalhes" de um talhão, Jornada ·
Caderno de Campo V2, criada no round 86) — nenhuma outra tela V2 nem nenhuma tela V1 foi tocada,
exceto o `encerrarSafraTalhao` compartilhado descrito abaixo (que também precisou de um ajuste
mínimo em `fazenda-detalhe-caderno-v2.js`, mesmo botão "Encerrar safra" do round anterior).

- **Cabeçalho:** novo subtítulo `.talhao-detalhe-subtitle` logo abaixo do título, formato
  "Cultura · Safra 2026/27 · 80 ha" (ou "Sem cultura · 80 ha" quando o talhão não tem plantio
  ativo) — área sempre presente, cultura/safra condicionados a haver `talhao.cultura`. Não existia
  nenhum subtítulo ali antes (só a linha separada "🚜 Nome da fazenda" abaixo).
- **KPIs renomeados:** "Custo registrado" → **"Custo acumulado"**, "Cultura" → **"Cultura
  atual"** (mesmos nomes já usados em `fazenda-detalhe-caderno-v2.js`, pra manter os dois níveis
  de KPI com vocabulário consistente).
- **3 KPIs novos, reaproveitando o MESMO card de KPI já usado nesta tela** (`.talhao-resumo-card`,
  sem `@media(min-width)` de aumento de fonte, já "mesmo tamanho em qualquer largura" desde a
  criação, regra do round 55):
  - **Produtividade** (`total colhido ÷ áreaHa`, ex. "15 kg/ha") e **Custo / hectare**
    (`custoAcumulado ÷ áreaHa`) e **Custo / [unidade]** (`custoAcumulado ÷ total colhido`, ex.
    "R$ 48,20/kg") — todos "unit-aware", nunca um "sc" hardcoded fora do único ponto que lê a
    unidade real do produto colhido (mesmo princípio já usado no card "Produção registrada" desta
    mesma tela desde o round 86, e no Dashboard).
  - **Decisão de rótulo, documentada no código:** o pedido usava "Custo / saca" (palavra cheia) no
    texto do exemplo, mas o valor do mesmo exemplo já abreviava pra "R$ 48,20/sc". Pra não ter
    dois vocabulários diferentes pra unidade dentro do mesmo card, o rótulo também usa a sigla
    (`Custo / sc`, `Custo / kg`, `Custo / L`), igual ao valor e igual à Produtividade
    ("15 kg/ha"). Sem produção registrada, cai no rótulo padrão `Custo / sc` (produto de Grãos
    mais comum do catálogo) com valor "—".
  - **Reordenação dos 9 KPIs em 3 linhas de 3, por hierarquia** (status/contexto → produção →
    custo), pedido explícito: Área/Cultura atual/Safra (linha 1, inalterada) → Produtividade/
    Produção registrada/Anotações (linha 2) → Custo acumulado/Custo por hectare/Custo por
    unidade (linha 3, nova).
- **Nova seção "Histórico de Safras do Talhão"**, posicionada DEPOIS de "Registros do Caderno"
  (pedido explícito de ordem). Tabela real (`.table`/`.tr`/`.td`, mesma cópia visual de Estoque/
  Talhões) a partir de 768px, Cards abaixo disso (`.historico-safra-mobile-card`) — mesma
  arquitetura "Tabela → Cards no mobile" da tabela de Talhões em
  `fazenda-detalhe-caderno-v2.js`/`page-fazenda-detalhe-caderno-v2.css`, replicada 1:1 (guard
  `display:none` + `:not([hidden])` no wrap desktop desde a criação, sem precisar corrigir depois).
  Colunas: Safra | Cultura | Período | Status.
  - **Status:** badge real (`.badge`/`data-status`), `data-status="success"` pra "Em produção"
    (mesmo token de "Em produção" do badge de status do talhão no cabeçalho) e `data-status="info"`
    pra "Encerrada" (mesmo token neutro/fechado já usado em "Disponível" no resto do sistema).
  - **Período:** "Xm Yd" (meses+dias, ex. "3m 30d"), calculado por `formatPeriodo(dataInicio,
    dataFim)` (novo helper em `talhao-detalhe-v2.js`, aritmética de calendário com borrow de mês
    quando o dia final é menor que o inicial). A safra ainda ativa usa `TODAY` como `dataFim`
    (mesma data de referência fixa `'2026-07-31'` já usada em `contas-pagar-data.js`/`dre.js`/
    etc., nunca `new Date()` — reexportada por `window.NiveloFazendas.TODAY` pra não duplicar o
    literal em mais um arquivo).
- **Decisão de modelo de dados (documentada no código, `fazendas-data.js` e
  `talhao-detalhe-v2.js`): a safra CORRENTE não é duplicada em `historicoSafras`.** Os campos
  flat `talhao.cultura`/`talhao.safra` (+ um novo `talhao.safraInicio`, data de início da safra
  em curso) continuam sendo a ÚNICA fonte de verdade da safra ativa — exatamente como o round 86
  já deixou (Fazenda/Talhão/Cultura/Safra de `nova-anotacao-v2.html` continuam lendo só daí,
  nenhuma mudança nesse ponto, verificado ao vivo que a regressão não aconteceu).
  `talhao.historicoSafras` (array novo) guarda só as safras JÁ ENCERRADAS. A linha "Em produção"
  da tabela é sintetizada em memória a cada render (`buildHistoricoSafras()`), nunca persistida
  como um registro próprio — evita a fonte de verdade duplicada/podendo divergir que a alternativa
  (guardar a safra atual também dentro do array) introduziria.
  - Seed: cada um dos 17 talhões das 3 fazendas ganhou 1 entrada histórica (`2025/26`, sempre
    `Encerrada`) mais `safraInicio` pros talhões com cultura ativa no seed (datas plausíveis por
    cultura: cana em torno de abril, café em torno de abril, grãos anuais em maio/junho).
- **"Encerrar safra" agora fecha o histórico de verdade, não só limpa os campos flat.** A ação já
  existia desde o round 86 (2 cópias de UI: tabela de Talhões em `fazenda-detalhe-caderno-v2.js` e
  o cabeçalho desta tela), mas cada cópia mutava `talhao.cultura`/`safra`/`status` direto, sem
  registrar nada em `historicoSafras` (que nem existia ainda). Extraído um `encerrarSafraTalhao
  (fazendaId, talhaoId)` NOVO em `fazendas-data.js` (camada de dados, já importada pelas duas
  telas) que: empurra `{safra, cultura, dataInicio: talhao.safraInicio, dataFim: TODAY, status:
  'Encerrada'}` pra `historicoSafras` (só se `talhao.cultura` existir, senão é no-op) e SÓ DEPOIS
  limpa `cultura`/`safra`/`safraInicio` e volta `status` pra `'disponivel'`. As duas telas
  chamam essa única função em vez de duplicar a regra de negócio. **Isso não fere a convenção
  "sem JS compartilhado entre páginas"** do sistema (já documentada dezenas de vezes) — essa
  convenção é sobre lógica de UI/DOM de cada tela, não sobre mutação de um catálogo de dados
  central que as duas já importam via `<script>` de qualquer forma.
  - **Mesma limitação de sempre, sem mudança:** a mutação continua só em memória (não usa
    `persistEdit`/sessionStorage, igual ao comportamento já existente desde o round 86) — uma
    navegação real de página (não uma troca de hash) perde o encerramento. Documentado no código,
    não é uma regressão desta rodada.
- **Guard `hidden`+`display` aplicado preventivamente em todo CSS novo**
  (`.historico-safras-table-wrap`/`.historico-safras-mobile-list`/`.historico-safras-empty`,
  mesmos 3 seletores da tabela de Talhões) — nenhum bug desta classe precisou ser corrigido depois.

Verificado ao vivo (servidor `http-server`, porta 8090): subtítulo do cabeçalho com área em
talhões de culturas diferentes (Soja/Milho/Cana-de-açúcar); KPIs renomeados e os 3 novos
corretos, inclusive um talhão cuja colheita é em `kg` (Santa Rita, Talhão 01, Cana-de-açúcar) em
vez de `sc` (Produtividade "15 kg/ha", "Custo / kg" com o rótulo dinâmico certo) e um talhão sem
nenhuma colheita registrada (Produtividade/Custo por unidade mostrando "—", Custo/hectare ainda
calculado normalmente); Histórico de Safras renderizando a safra corrente como "Em produção" e a
anterior como "Encerrada", Período batendo à mão em pelo menos 2 linhas (ex. 2026-06-01 até TODAY
2026-07-31 = "1m 30d"; 2025-06-01 até 2026-05-15 = "11m 14d"); tabela real em 1280px, Cards em
375px sem overflow horizontal (`scrollWidth` igual a `innerWidth`); "Encerrar safra" testado de
ponta a ponta tanto no cabeçalho desta tela quanto na tabela de Talhões de
`fazenda-detalhe-caderno-v2.html` (mesma função `encerrarSafraTalhao`), confirmando em ambos:
toast de sucesso, talhão volta pra "Disponível", subtítulo vira "Sem cultura", e a linha da safra
que estava "Em produção" passa a aparecer como "Encerrada" com o Período fechado em `TODAY`;
`nova-anotacao-v2.html` confirmado sem regressão (Fazenda/Talhão/Cultura atual/Safra continuam
`disabled readonly`); nenhum erro real de console (só os 404 de `/fonts/*.otf` já documentados
como pré-existentes em todo o sistema).

## Ajustes 2026-08-31 (round 88) — V2 Caderno de Campo: renomes de KPI, ordem/colunas
da tabela de Talhões, card "Informações do talhão" e confirmação de Depósitos/Locais de Estoque

Continuação direta dos rounds 86/87. Pedido em 4 itens sobre as 4 telas V2 já existentes
(Caderno de Campo, Entrada na Fazenda, Nova Anotação, Detalhe do Talhão) + confirmação/ajuste
da jornada Depósitos/Locais de Estoque, que já tinha sido construída por outra sessão em
paralelo neste mesmo repositório (mencionado nos rounds 86/87 como trabalho concorrente). V1
não foi tocado em nenhum arquivo.

- **Tela 1 (`caderno-de-campo-v2.html`):** indicador "Produtividade" renomeado pra
  **"Colheita"** (`caderno-de-campo-v2.js`) — o cálculo em si já era o TOTAL colhido por unidade
  (unit-aware, `buildProdutividadeHTML`, já existia desde o round 86), só o rótulo estava
  incorreto (sugeria uma média). Nenhuma lógica de agregação foi tocada. "Produtividade média",
  "Despesa acumulada" e "Despesa média por hectare" confirmados intactos. "Área total" já
  aparecia em cada card de fazenda desde o round 86 — confirmado, nenhuma mudança necessária.
- **Tela 2 (`fazenda-detalhe-caderno-v2.html`):** KPI "Produção registrada" renomeado pra
  **"Colheita"**. "Custo acumulado"/"Produtividade média"/"Cultura atual" confirmados mantidos
  (nenhum dos dois fazia parte do pedido de remoção).
  - **Tabela de Talhões: colunas reordenadas pra exatamente Talhão | Cultura atual | Safra
    atual | Última Anotação | Status | Ações** (era Talhão | Área (ha) | Cultura | Safra |
    Status | Última Anotação | Ações desde o round 86/87) — a coluna Área foi removida por
    completo (não fazia parte da lista de colunas pedida desta vez) e "Cultura"/"Safra" viraram
    "Cultura atual"/"Safra atual", batendo com o vocabulário já usado no resto do sistema (Nova
    Anotação/Detalhe do Talhão). "Última Anotação" já vinha depois de Status desde o round 86 —
    confirmado que precisava mesmo mudar de posição (agora antes de Status, como pedido).
  - **Ações reordenadas pra Ver detalhes → Nova anotação → Encerrar safra** (era Nova anotação →
    Encerrar safra → Ver detalhes desde o round 86) — mudança só de ordem de renderização em
    `buildAcoesHTML()`, nenhum handler/ícone/tooltip alterado.
  - `page-fazenda-detalhe-caderno-v2.css`: larguras de coluna (`nth-child`) recalculadas pras 6
    colunas novas (era 7).
- **Nova Anotação (`nova-anotacao-v2.html`):** revalidado item a item — sem opção de criar
  anotação direta pra fazenda (form inteiro fica `hidden` sem `?fazenda=&talhao=` válidos, desde
  o round 86, confirmado intacto); Fazenda/Talhão/Cultura atual/Safra sempre `disabled readonly`
  (confirmado); "Tipo de anotação"→"Tipo de registro" e "Anotação" como 1ª opção (confirmados,
  já corretos desde o round 86). **Único ajuste real: rótulo "Safra" → "Safra atual"** (campo
  continua não editável, só o texto do `<label>` mudou).
  - **Depósito em Aplicação de insumo, mudança real do pedido:** já estava correto desde o
    round 86 — `deposito-menu` é populado só por `window.NiveloLocais.list().filter(l =>
    l.ativo !== false)`, sem nenhum item "+ Adicionar novo depósito" (confirmado lendo
    `nova-anotacao-v2.js` e inspecionando o `innerHTML` do menu ao vivo). Nenhuma mudança de
    código foi necessária aqui — o pedido pedia pra "verificar e remover se houver", e não havia.
- **Detalhe do Talhão (`talhao-detalhe-v2.html`):** mudança mais substancial dos 4 itens.
  - **Novo card "Informações do talhão"** (`.talhao-info-card`, `dl`/`dt`/`dd` read-only, grid
    1/2/4 colunas mobile/tablet/desktop — mesmo padrão já usado em outras telas de "dados
    gerais", ex. LCDPR round 77), posicionado ACIMA do grid de KPIs, logo depois do cabeçalho.
    Contém exatamente os 4 campos pedidos: Fazenda, Hectares, Cultura atual, Safra atual.
  - **Removidos do cabeçalho:** o subtítulo "Cultura · Safra · Xx,x ha" (`#talhao-detalhe-
    subtitle`, adicionado no round 87) e a linha separada "🚜 Nome da fazenda"
    (`.talhao-detalhe-fazenda`) — as duas duplicavam informação que agora vive só no novo card.
    CSS morto (`.talhao-detalhe-subtitle`/`.talhao-detalhe-fazenda`) removido de
    `page-talhao-detalhe-v2.css` junto.
  - **Removidos do grid de KPI:** os 3 cards redundantes "Área"/"Cultura atual"/"Safra" (1ª
    linha do grid desde o round 86/87) — ficaram só no novo card. **Os demais KPIs foram
    mantidos** (Produtividade, Produção registrada, Anotações, Custo acumulado, Custo/hectare,
    Custo/un) por não serem redundantes com Fazenda/Hectares/Cultura/Safra — release explícito
    no pedido ("Anotações registradas"/"Custo acumulado"/etc que não sejam redundantes
    continuam"), documentado como decisão no código (`talhao-detalhe-v2.js`).
  - **Confirmado, sem necessidade de mudança:** nenhum outro trecho do código lia
    `resumo-area`/`resumo-cultura`/`resumo-safra` de volta do DOM — todos os cálculos
    (Produtividade/Custo por hectare/Custo por unidade) já liam `currentTalhao.areaHa`/
    `.cultura` direto do objeto de dados, nunca do elemento visual removido. `renderResumo()`
    só escrevia nesses 3 elementos, nunca lia; a remoção não quebrou nenhum cálculo.
  - Seção Anotações e Histórico de Safras do Talhão (round 87) preservadas sem nenhuma mudança,
    confirmado ao vivo que a reorganização acima não afetou nenhuma das duas.
- **Depósitos / Locais de Estoque (`depositos.html`/`novo-deposito.html`):** já construídas por
  uma sessão paralela seguindo exatamente o spec pedido — auditado item a item, nenhum ajuste
  de código foi necessário: subtítulo "Locais próprios ou de terceiros usados para armazenar
  produtos da propriedade." (`depositos.html`); tabela com as colunas Nome/Tipo/Fazenda
  Vinculada/Uso/Status/Ações; ações Editar (navega pra `novo-deposito.html?nome=`) + Ativar/
  Desativar (reaproveitando `window.NiveloLocais.toggleAtivo()`, real, com modal de
  confirmação); botão "Novo depósito" navegando pra `novo-deposito.html`. Formulário com
  subtítulo "Cadastre um silo, cooperativa ou depósito de produtos.", campos Nome do local/Tipo
  (Dropdown Silo próprio/Terceiro-cooperativa/Depósito de produtos)/Fazenda vinculada (Dropdown
  de `window.NiveloFazendas.list()`, help text "Fazendas cadastradas em Configurações >
  Fazendas e Talhões.")/Uso (Dropdown Produto de venda/Produtos de uso/Ambos)/Status (Dropdown
  Ativo/Inativo, iniciando em Ativo ao criar — confirmado em `novo-deposito.js`, nunca reseta
  pra Ativo em modo edição); botões Voltar/Salvar local. Já registradas em `nav.config.js`
  (épico "Depósitos" dentro da Jornada · Configuração) e com `NAV_DESTINATIONS['config-
  depositos'] = 'depositos.html'` em `interface-principal.js` — o item de sidebar "Depósitos"
  (dentro de Configurações, dado que também já existia) já navega de verdade.
- **Regra cross-cutting confirmada:** nenhuma tela V2 do sistema tem atalho de criação inline
  de depósito — só o Dropdown de Aplicação de insumo (Nova Anotação V2) e o de Registrar
  entrada/consumo (Estoque V2, fora do escopo deste pedido) consomem `window.NiveloLocais`,
  nenhum dos dois com "+ Adicionar novo". Nenhuma tela V1 foi tocada — os atalhos de criação
  inline que já existiam em telas V1 (ex. `novo-estoque.js`) continuam intocados.

Verificado ao vivo (servidor `http-server`, porta 8090, preserva query string/hash): Tela 1 com
"Colheita" mostrando o total por unidade (ex. "1.100 sc"/"1.200 kg") e "Área total" presente nos
3 cards de fazenda; Tela 2 com "Colheita" renomeada e a tabela de Talhões com as 6 colunas na
ordem exata pedida (Talhão | Cultura atual | Safra atual | Última Anotação | Status | Ações) e
as 3 ações na ordem Ver detalhes → Nova anotação → Encerrar safra (confirmado lendo o texto
renderizado da página, não só o HTML-fonte); Nova Anotação com "Safra atual" nos 4 campos de
contexto não-editáveis e o Dropdown de Depósito confirmado (via `innerHTML` do menu) contendo só
os 4 locais reais ativos, sem nenhum item de criação; Detalhe do Talhão com o novo card
"Informações do talhão" acima dos KPIs (Fazenda/Hectares/Cultura atual/Safra atual) e o grid de
KPI só com os 6 indicadores de desempenho/custo (sem Área/Cultura/Safra duplicados); mobile
(375px) sem overflow horizontal em nenhuma das 4 telas tocadas (`scrollWidth` igual a
`innerWidth` em todas); Depósitos/Novo depósito confirmados batendo com o spec sem necessidade
de alteração de código; nenhum erro real de console em nenhuma das telas (só os 404 de
`/fonts/*.otf` já documentados como pré-existentes em todo o sistema); V1 (`caderno-de-
campo.html`/`fazenda-detalhe.html`/`talhao-detalhe.html`/`nova-anotacao.html`/`caderno-
data.js`) confirmado 100% intocado nesta rodada.

## Ajustes 2026-08-31 (round 89) — Estoque V2 (Uso + Comprometido mobile), Registrar
Entrega V2, Dashboard (auditoria) e Pedidos de Venda (linha de Remessa)

Continuação em paralelo dos rounds 86-88 (que cobriram Caderno de Campo V2 + Depósitos/Locais
de Estoque, itens 1-4 de um pedido maior). Este round cobre os itens 5-9 do mesmo pedido, em 4
telas independentes: Estoque V2, Registrar Entrega V2, Dashboard e Pedidos de Venda. Trabalho
dividido em 4 sub-tarefas paralelas, cada uma verificada ao vivo com `http-server` antes de
reportar.

- **Estoque de Uso + Estoque Comprometido mobile (`estoque-v2.html`, item 5-6):** investigação
  completa (não só leitura de código — inspeção via Browser tool/`getComputedStyle` em 375px e
  1280px) não reproduziu NENHUM dos sintomas do pedido no estado atual do arquivo: a coluna
  Unidade da aba "Estoque de Uso" já está presente e sem sobreposição de conteúdo, os ícones de
  ação da aba Uso já aparecem corretamente no card mobile, o card mobile da aba "Estoque
  Comprometido" já segue o mesmo padrão estrutural dos demais cards (Vendas/Compras/Uso), e o
  rótulo da aba "Estoque comprometido" já quebra/exibe sem corte no mobile. Nenhuma mudança de
  código foi necessária — tratado como confirmação, não como implementação nova. Nenhum arquivo
  tocado.
- **Registrar Entrega V2 (`registrar-entrega-estoque-v2.html`, item 7):** 3 mudanças reais.
  - A tag "Estoque Comprometido" (`.estoquev2-tipo-tag`, já documentada no round 85) foi movida
    pra ficar ao lado do nome do cliente, e esse bloco (nome+tag) posicionado abaixo do título
    da tela — novo par de classes `.historicov2-title-block`/`.historicov2-subtitle-row`,
    reaproveitando o mesmo padrão já usado pela tela irmã `historico-entrega-estoque-v2.html`
    em vez de inventar um layout próprio.
  - Status "Em aberto" (antes texto solto) passou a usar o componente real `.badge`/`.badgeDot`,
    seguindo o mesmo mapa `SITUACAO_BADGE` já usado em `estoque-v2.js` pra badges de situação —
    não um texto/cor inventados pra esta tela.
  - Espaçamento entre a linha de KPIs e "Dados da entrega" aumentado de 16px pra 24px
    (`--spacing-lg`), seguindo a mesma lógica já documentada pra `.mc-panel` (Minha Conta) de
    dar mais respiro entre blocos de conteúdo distintos.
  - Arquivos: `registrar-entrega-estoque-v2.html`, `registrar-entrega-estoque-v2.js`,
    `page-registrar-entrega-estoque-v2.css`.
- **Dashboard (`dashboard.html`, item 8) — auditoria confirmou que os 4 sub-pedidos já
  estavam implementados em rounds anteriores, sem nenhuma mudança de código necessária:**
  - Produção/Colheita (heading "Produção / Colheita", subtítulo "Últimas Safras", quantidade
    produzida unit-aware nos destaques, linha "X ha · média Y sc/ha" abaixo do produto, tag de
    safra tipo "Safra 2025/26" via `.badge`) — já presente.
  - Estoque de grãos em sacas (unit-aware) — já implementado desde o round 49 (2026-08-03),
    confirmado ainda correto.
  - Contas a pagar/receber: "Vencidas" (não mais "Em atraso") em vermelho nos dois cards, sem
    número solto em destaque, período futuro dinâmico ("Out/2026" em vez de "Seguinte",
    calculado a partir da data de referência que o Dashboard já usa, nunca hardcoded) — já
    presente.
  - Clima: probabilidade de chuva por dia nos 5 dias de previsão — já presente.
  - Nenhum arquivo tocado (`dashboard.html`/`page-dashboard.css`/`dashboard.js` só lidos, não
    editados).
- **Pedidos de Venda (`pedidos-de-venda.html`, item 9):** nova linha de exemplo `PV-0004`
  (`tipo: 'remessa'`) adicionada ao seed de dados, vinculada ao pedido existente `PV-0002` via
  novo campo `pedidoOrigemNumero`. Renderizada como legenda sob a célula Cliente/Destinatário
  (`.pv-cell-vinculo`) indicando o vínculo com o pedido pai — reaproveitando literalmente a
  mesma técnica já usada pra "Parcela N/M" em Contas a Pagar (`.ctp-cell-parcela`, round 45),
  em vez de inventar um indicador novo (indentação, ícone, etc). Mesmas colunas/estilo de
  célula da tabela original, sem quebra de alinhamento/responsividade. Dados fictícios, sem
  nenhuma lógica de negócio nova de fato ligada a remessas. Arquivos: `pedidos-venda-data.js`,
  `pedidos-de-venda.js`, `page-pedidos-de-venda.css`.

Verificado ao vivo (servidor `http-server`, preserva query string/hash) em cada uma das 4
telas, em 1280px e 375px: Estoque V2 (Uso e Comprometido) sem nenhum sintoma reproduzido —
coluna Unidade, ícones de ação mobile, paridade visual do card Comprometido e rótulo da aba
todos corretos via screenshot/`getComputedStyle`; Registrar Entrega V2 com a tag "Estoque
Comprometido" ao lado do cliente e abaixo do título, badge real "Em aberto" e espaçamento de
24px confirmado via `getBoundingClientRect`; Dashboard com os 4 itens (Produção/Colheita,
Estoque de grãos, Vencidas em vermelho + período dinâmico, chuva %) confirmados presentes e
corretos sem alteração; Pedidos de Venda com a linha `PV-0004` renderizando a legenda de
vínculo com `PV-0002` em desktop e mobile, sem overflow horizontal. Nenhum erro real de console
em nenhuma das 4 telas (só os 404 de `/fonts/*.otf` já documentados como pré-existentes em todo
o sistema).

## Ajustes 2026-08-31 (round 90) — Caixa V2: nova versão completa (Consolidado +
Contas financeiras), V1 aposentado só pro navegador de protótipo

Pedido grande: construir a V2 do Caixa, que passa a ser a versão do produto que a Sidebar real
navega pra sempre a partir de agora. V1 (`caixa.html`, `novo-lancamento-caixa.html`,
`transferencia-entre-contas.html`) foi preservada 100% intacta — nenhum arquivo tocado, nenhuma
lógica alterada — e ficou acessível só pelo navegador de protótipo, dentro do novo épico "Caixa
(V1)".

- **Arquivos novos:** `app/screens/caixa-v2.html` + `page-caixa-v2.css` + `caixa-v2.js` (Tela
  1, listagem com 2 abas); `app/screens/novo-lancamento-caixa-v2.html` +
  `page-novo-lancamento-caixa-v2.css` + `novo-lancamento-caixa-v2.js` (Incluir Lançamento);
  `app/screens/transferencia-entre-contas-v2.html` + `page-transferencia-entre-contas-v2.css` +
  `transferencia-entre-contas-v2.js` (Transferência entre Contas).
- **`caixa-data.js` (módulo compartilhado com V1) estendido de forma aditiva, nunca quebrado:**
  ganhou `saldoPorContaFinanceira(codigo)` (soma entradas menos saídas de todos os lançamentos
  vinculados a uma Conta Financeira — usada pela aba "Contas financeiras", pelo Resumo
  financeiro de Incluir Lançamento V2 e pelo Saldo disponível de Transferência V2) e 2 campos
  novos por lançamento: `notaFiscalNumero` (opcional, 3 lançamentos seed de venda de soja/milho
  ganharam um número de demonstração) e `documento` (texto livre digitado no formulário V2).
  Nenhum dos dois é lido por V1.
- **Abas Consolidado × Contas financeiras (`Tab` real do Storybook, primeira vez usado nesta
  tela):** texto de apoio abaixo das abas reforça a distinção pedida — Consolidado é "o que
  aconteceu com o dinheiro" (extrato), Contas financeiras é "onde o dinheiro está distribuído"
  (composição do MESMO saldo, nunca somado a ele).
- **Consolidado:** colunas exatas Data/Descrição/Documento/Conta/Entrada/Saída/Saldo — "Histórico"
  virou "Descrição", "Banco" virou "Conta" (agora mostra o nome da Conta Financeira, não mais o
  texto livre de banco). Removidas Cliente/Fornecedor/Categoria/Tipo/Valor; Entrada/Saída são 2
  colunas separadas (cada lançamento preenche só uma, a outra mostra "—"), verde/vermelho via os
  mesmos tokens semânticos já usados (`--color-status-success-fg`/`-error-fg`). **Saldo é o saldo
  ACUMULADO linha a linha** (`computeConsolidado()` em `caixa-v2.js`: ordena TODOS os lançamentos
  cronologicamente asc pra calcular a soma corrida, grava o valor em `_saldoAcumulado` por
  lançamento, só DEPOIS inverte pra exibir do mais recente pro mais antigo — reordenar por outra
  coluna não recalcula esse valor, só reordena a lista, mesmo princípio de "saldo é uma foto do
  momento" já usado no LCDPR). Documento: mostra o texto livre digitado em Incluir Lançamento V2
  quando existe, senão "NF-e <número>" (campo aditivo `notaFiscalNumero`), senão "Extrato".
  Filtro "Banco" do V1 virou filtro "Conta" (mesmo mecanismo, populado a partir de
  `NiveloContasFinanceiras` em vez dos valores de texto livre únicos do dataset). Busca,
  Agrupamento de Filtros (Período+Conta), ordenação de colunas, paginação (10/página), Cards no
  mobile e Exportar Excel preservados do V1, adaptados pras novas 7 colunas.
- **Contas financeiras — decisão de fonte de dados, documentada no código:** o pedido especificou
  a fonte como `contas-financeiras-data.js` (Código+Nome, o plano de contas de Configuração >
  Conta Financeira) — só que essa entidade não modela banco/número de conta reais (isso é
  `contas-bancarias-data.js`, uma entidade diferente, com múltiplas contas bancárias podendo
  apontar pra uma mesma Conta Financeira). Seguido o pedido literalmente: "Banco" mostra o nome
  da Conta Financeira; "Conta" mostra um número mascarado SINTÉTICO gerado deterministicamente a
  partir do código (`maskedContaNumero()`, ex. "•••• 5523") — decisão explícita de não inventar
  uma 2ª fonte nem misturar com Contas Bancárias. Saldo de cada linha via
  `NiveloCaixa.saldoPorContaFinanceira()`; linha de Total no rodapé soma todas as 4 linhas.
  **Confirmado ao vivo que a soma bate exatamente com o Saldo Atual do Consolidado**
  (R$ 125.941,00 nos dois lugares) — mesma fonte de dados, só reparticionada.
- **Incluir Lançamento V2:** subtítulo novo ("Registre uma entrada ou saída..."); campo "Código"
  removido por completo (não era mais um dado real, só um preview cosmético no V1); 1ª linha
  Data (auto-preenchida com `TODAY='2026-07-31'`, mesma constante fixa de `contas-pagar-data.js`
  — nunca `new Date()`, usuário pode alterar) + "Tipo de movimento" (renomeado de "Tipo"); 2ª
  linha "Contas financeiras" (renomeado de "Banco", fonte real `NiveloContasFinanceiras`, help
  text "Contas cadastradas em Configurações → Contas Financeiras") + Valor; 3ª linha Categoria
  Financeira + Documento (novo, texto livre opcional); "Histórico" virou "Descrição".
- **Resumo financeiro do lançamento (novo):** `dl` de conferência com Saldo atual da conta
  selecionada, Entrada ou Saída (rótulo e valor mudam conforme o Tipo escolhido), Novo saldo
  estimado (saldo atual ± valor) e Tipo de movimento — `updateResumo()` roda a cada mudança de
  Conta financeira/Tipo/Valor (dropdown `onChange` + `input` do campo de valor). Confirmado ao
  vivo: conta com saldo R$ 107.241,00 + Entrada de R$ 100,00 → Novo saldo R$ 107.341,00.
- **Aviso de duplicidade (novo):** `Feedback` real (`.alert.info`, fica sempre visível, não é um
  toast) com o texto exato pedido, só a mensagem (sem título), pra não competir visualmente com
  o resto do formulário.
- **Nota para desenvolvimento:** comentário HTML (não renderizado) com o texto exato pedido sobre
  o que acontece ao salvar (movimenta a Conta Financeira, aparece no Caixa/Livro Caixa, aplica
  classificação/competência da categoria quando configurada pro DRE).
- **Transferência entre Contas V2:** "Valor" → "Valor da transferência", "Histórico" → "Descrição"
  (só rótulos, comportamento/fonte de dados — `NiveloContasBancarias` — intactos). Bloco novo
  "Saldo disponível"/"Novo saldo estimado" (`dl` com fundo `--color-bg-subtle`) aparece só depois
  da Conta de origem ser escolhida, recalculado a cada mudança de Origem/Valor via
  `NiveloCaixa.saldoPorContaFinanceira(contaOrigem.contaFinanceiraCodigo)`.
- **Bug real encontrado e corrigido ao vivo, nas 2 telas de formulário (Incluir Lançamento V2 e
  Transferência V2), herdado da estrutura de V1 (não visível lá porque nunca tinha sido
  verificado visualmente, só via leitura de código):** `Input.module.css`'s `.errorText` tem
  `display:flex` incondicional — o guard existente (`.wrapper .errorText{display:none}`) só
  cobre campos dentro de `.wrapper` (Input/Dropdown), nunca campos de `DatePicker` (`.dpRoot`,
  usado pelo campo Data nas 2 telas). Sem o guard, a mensagem de erro da Data ficava SEMPRE
  visível, mesmo com o campo preenchido — confirmado via `getComputedStyle` (`display:flex`
  mesmo com `TODAY` já preenchido). Corrigido com o mesmo padrão em `page-novo-lancamento-
  caixa-v2.css`/`page-transferencia-entre-contas-v2.css`: `.dpRoot .errorText{display:none}` +
  `.dpRoot.error .errorText{display:flex}`. Fix aplicado só nas 2 telas V2 (V1 não foi tocado).
- **`interface-principal.js`:** uma linha em `NAV_DESTINATIONS`
  (`'financeiro-caixa': 'caixa-v2.html'`) ativa a V2 como destino real do item "Caixa" em toda
  tela com Sidebar completa, sem precisar de mass-edit — o item de sidebar em si já existia
  igual em todas as telas.
- **`prototype-nav/nav.config.js`:** dentro da "Jornada · Financeiro", o épico "Caixa" virou
  **"Caixa (V1)"** (rótulos internos das 3 telas também sufixados "(V1)") e um novo épico
  **"Caixa V2"** foi adicionado ANTES dele, com as 3 telas novas (Caixa com variante "Aba Contas
  financeiras", Incluir Lançamento, Transferência entre Contas).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, um
  lançamento/transferência criado numa das 2 telas de formulário só existe durante a sessão de
  JS daquela página — ao redirecionar pra `caixa-v2.html`, o script daquela tela recarrega os
  dados seed do zero. O toast de sucesso aparece corretamente; a operação em si não persiste na
  listagem (mesmo comportamento de V1 e da maioria dos módulos do sistema).

Verificado ao vivo (servidor `app-preview`/`http-server`, porta 8090, preserva query string/
hash): Consolidado com os 30 lançamentos seed (Total de Entradas R$ 200.400,00/Total de Saídas
R$ 74.459,00/Saldo Atual R$ 125.941,00), saldo acumulado linha a linha conferido manualmente
(cada linha soma exatamente entrada−saída da anterior), coluna Documento mostrando "NF-e 12401"
nos lançamentos com número vinculado e "Extrato" nos demais; aba Contas financeiras com as 4
contas somando R$ 125.941,00 (idêntico ao Saldo Atual do Consolidado); busca ("soja" isolando 7
linhas) e ordenação (coluna Saldo ascendente confirmada via `dataset.saldo`) funcionando; Cards
no mobile (375px, tabela `display:none`/cards `display:flex`, sem overflow horizontal) nas duas
abas; Incluir Lançamento V2 sem o campo Código, Data auto-preenchida com `TODAY`, aviso de
duplicidade visível, Resumo financeiro recalculando ao vivo (Entrada de R$ 100,00 numa conta com
R$ 107.241,00 → Novo saldo R$ 107.341,00), submit completo salvando via `NiveloCaixa.add()` e
redirecionando com toast "Lançamento salvo com sucesso."; Transferência V2 com os rótulos
renomeados e o bloco Saldo disponível/Novo saldo estimado aparecendo só após escolher a Conta de
origem e recalculando corretamente (R$ 107.241,00 − R$ 5.000,00 = R$ 102.241,00), submit
completo criando os 2 lançamentos (saída+entrada) e redirecionando; bug do `.errorText` da Data
corrigido e confirmado nas 2 telas; nenhum erro real de console em nenhuma das 3 telas (só os
404 de `/fonts/*.otf` já documentados como pré-existentes em todo o sistema); V1 (`caixa.html`,
`novo-lancamento-caixa.html`, `transferencia-entre-contas.html`) confirmado intocado.

## Ajustes 2026-08-31 (round 91) — Contas a Pagar V2: abas, Descrição/Pago/Saldo, status
simplificado, Registrar pagamento como página própria com principal × juros × desconto

Pedido grande: construir a V2 de Contas a Pagar, que passa a ser a versão que a Sidebar real
navega pra sempre a partir de agora. V1 (`contas-a-pagar.html`, `nova-conta-pagar.html`,
`detalhe-conta-pagar.html`) foi preservada 100% intacta — nenhum arquivo tocado — e ficou
acessível só pelo navegador de protótipo, dentro do novo épico "Contas a pagar (V1)". Mesmo
padrão exato já usado em Contas a Receber V1/V2 e Caixa V1/V2 (faixa de versão com link "Ver
versão anterior (V1)", épico V2 antes do V1 relabeled no `prototype-nav`).

- **Arquivos novos:** `app/screens/contas-a-pagar-v2.html` + `page-contas-a-pagar-v2.css`
  (delta sobre `page-contas-a-pagar.css`, mesma técnica de Contas a Receber V2) +
  `contas-a-pagar-v2.js` (listagem); `app/screens/nova-conta-pagar-v2.html` +
  `page-nova-conta-pagar-v2.css` (delta sobre `page-nova-conta-pagar.css`) +
  `nova-conta-pagar-v2.js` (formulário); `app/screens/registrar-pagamento-conta-pagar-v2.html`
  + `page-registrar-pagamento-conta-pagar-v2.css` + `registrar-pagamento-conta-pagar-v2.js`
  (nova página própria, não mais modal). Novo módulo de dados
  `app/shared/contas-pagar-v2-data.js` (`window.NiveloContasPagarV2`), independente de
  `window.NiveloContasPagar` (V1), mesma convenção de coexistência já usada em
  `contas-receber-v2-data.js`.
- **Modelo de dados V2, estrutura nova (não reaproveita o shape da V1):** cada título guarda
  `valorOriginal` (nunca alterado por pagamento) + `pago` (soma só do PRINCIPAL já pago) +
  `pagamentos[]` (array de eventos imutáveis, cada um com `valorPago`/`juros`/`desconto`/
  `totalSaida`/`saldoApos`/`contaFinanceiraCodigo`) — `saldoPrincipal` é sempre DERIVADO
  (`valorOriginal - pago`), nunca gravado. Só 3 status (`em-aberto`/`vencida`/`paga`, pedido
  explícito, contra os 5 da V1) — `refreshStatuses()` recalculado a cada `list()`, mesmo
  princípio de auto-flip pra "vencida" já usado em toda conta a pagar/receber do sistema.
- **Regra de negócio central, documentada em detalhe no topo do arquivo de dados (pedido
  explícito, exemplo literal do usuário: "compra de R$ 5.000,00 gera 5 títulos"):** uma conta
  parcelada é UMA compra/origem que gera N títulos individuais vinculados por
  `grupoParcelamento` (mesmo mecanismo já usado na V1), cada um pagável separadamente. À vista
  gera só 1 título. **Separação principal × juros × desconto:** "Valor pago" (informado no
  pagamento) reduz o principal 1:1; juros/acréscimos NUNCA reduzem o principal; desconto também
  não reduz o principal nesta modelagem — só entra no cálculo do dinheiro que sai do banco
  (`totalSaida = valorPago + juros − desconto`, fórmula pedida literalmente). Pagamento parcial
  nunca encerra a conta (só quando `saldoPrincipal` chega a zero ela vira `paga`). Conta
  bancária/financeira NUNCA é pedida no cadastro da obrigação — só no momento do pagamento
  (`registrarPagamento()`), que também gera um lançamento de SAÍDA real em `window.NiveloCaixa`
  no valor do `totalSaida` (fluxo completo pedido: Caixa/Livro Caixa atualizados de verdade).
- **Listagem V2:** 3 abas (`Tab` real, primeira vez usado nesta jornada) — "Todas"/"Em
  aberto"/"Pagas", onde "Em aberto" agrupa `em-aberto` E `vencida` (ambos ainda devidos, decisão
  documentada no código: as 3 abas cobrem os 3 status sem sobreposição). Tabela: Fornecedor,
  **Descrição** (era "Histórico" na V1), Nº Documento, Vencimento, Status, **Valor original**,
  Pago, Saldo, Ações — **só 1 ação** (Registrar pagamento, navega pra página própria em vez de
  abrir modal; Ver detalhes/Editar/Cancelar removidos por completo, pedido explícito). Filtros
  de Forma de Pagamento e Categoria removidos do popover (pedido explícito) — restaram só
  Período/Situação de Pagamento/Status (3 valores). KPIs (Total a pagar/Vencido/Vence hoje/
  Próximos vencimentos) mantidos, mesma cópia estrutural da V1.
- **Nova Conta a Pagar V2:** subtítulo "Cadastre uma obrigação à vista ou parcelada." Campo
  Código e o card "Classificação" inteiro removidos (pedido explícito) — **Forma de Pagamento e
  Ocorrência (o vocabulário de recorrência semanal/mensal/etc da V1) também saíram do
  formulário**, já que o pedido não os listou entre os campos da V2 e "Forma de Pagamento" nem
  faz mais sentido definida na criação, já que o pagamento em si só acontece depois. Único
  card "Dados da conta": Fornecedor (linha própria) → Data de emissão/lançamento (auto-hoje,
  editável) + Data de vencimento (obrigatória) → Categoria Financeira (help text "Cadastrada em
  Configurações → Categorias Financeiras.") + Documento (opcional) → Valor total + Condição de
  pagamento (RadioButton À vista/Parcelado) → Descrição (linha própria, ocupa a linha
  inteira). **Atalho "+ Cadastrar novo fornecedor" da V1 não foi replicado** — decisão de
  escopo, não fazia parte do pedido e adicionaria round-trip de rascunho/sessionStorage sem
  necessidade pra esta rodada.
- **Card "Parcelamento" (só quando Condição = Parcelado), estrutura de parcelas copiada
  literalmente do padrão já usado em Pedidos de Venda > Condição de pagamento > A prazo**
  (pedido explícito: "estrutura semelhante à utilizada em Pedidos de Venda, mantendo os mesmos
  campos e padrão de interação"): Número de parcelas → "Valor total"/"Soma das parcelas" (2
  campos readonly, **sempre visíveis** — diferente de Pedidos de Venda, onde o resumo só
  aparece quando diverge; aqui o pedido foi explícito em "permitir verificar visualmente se a
  soma corresponde ao valor total", então o campo Soma fica sempre presente) → N cards de
  parcela (`.ncp2-parcela-card`, mesmo visual cinza-claro do cadastro de veículos/Pedidos de
  Venda), cada um com Vencimento (DatePicker, sugestão inicial = vencimento base + N meses) +
  Valor (editável, sugestão de divisão igual com resto na última parcela). Alerta de divergência
  (mesmo padrão visual de erro já usado em Pedidos de Venda) só aparece quando a soma diverge do
  Valor total, e a soma é validada ANTES de permitir salvar (`runValidation()` bloqueia o
  submit).
- **Registrar Pagamento virou página própria** (`registrar-pagamento-conta-pagar-v2.html?
  codigo=`, resolução direta pelo catálogo global, mesma técnica de `detalhe-conta-pagar.js`,
  sem handoff via sessionStorage), não mais um modal — pedido explícito. Subtítulo: "Permite
  pagamento total ou parcial e mantém o histórico da conta."
  - **Accordion "Histórico de Pagamentos"** no topo, recolhido por padrão (pedido explícito de
    não ocupar espaço quando não consultado) — mesmo padrão exato de accordion já usado em
    "Filtros" de Balancete/DRE (cabeçalho inteiro clicável, chevron gira, `hidden` no
    conteúdo), primeira vez reaproveitado fora de um relatório. Colunas: Data/Conta/Valor
    pago/Juros/Desconto/Total saída/Saldo Após — direto de `titulo.pagamentos[]`, mais recente
    primeiro.
  - **Card "Conta" (somente-leitura):** Fornecedor/Descrição/Documento-NF/Valor original/Pago/
    Saldo principal, grid `dl`/`dt`/`dd` (1 coluna mobile, 3 no desktop).
  - **Card "Novo Pagamento":** Data (auto-hoje, editável) → Conta de saída (Dropdown de
    `window.NiveloContasFinanceiras.list()`, pedido explícito — nunca Conta Bancária) + Valor
    pago → Juros/Acréscimos + Desconto obtido (ambos opcionais) → Total que sai da conta +
    Saldo principal após este pagamento (2 campos calculados ao vivo a cada tecla, `disabled`).
  - Botões "Voltar"/"Confirmar pagamento" (mesmo `.ncp-actions` de todo formulário do sistema).
    Confirmar valida Conta de saída + Valor pago (>0 e ≤ saldo principal), chama
    `registrarPagamento()`, mostra toast e redireciona pra listagem.
  - **Card `.card`/`.cardHeader` (Table.module.css) não fornece padding de corpo sozinho** (só
    o cabeçalho tem padding embutido) — mesmo padrão de fix já aplicado em `fiscal.html` neste
    mesmo dia: os 3 cards novos desta página (`rpg-historico-content`, `rpg-conta-fields`,
    `.rpg-pagamento-card .ncp-grid`) ganharam `padding: 0 var(--spacing-lg) var(--spacing-lg)`
    explícito desde a criação, não como correção posterior.
- **`interface-principal.js`:** `NAV_DESTINATIONS['financeiro-pagar']` trocado de
  `'contas-a-pagar.html'` pra `'contas-a-pagar-v2.html'` — ativa a V2 em toda a navegação real
  do produto de uma vez. **`prototype-nav/nav.config.js`:** novo épico "Contas a pagar (V2)"
  inserido ANTES do épico V1 (que teve o label ajustado pra "Contas a pagar (V1)" nos 3 lugares,
  mesmo padrão já usado em Contas a Receber/Relatórios/Caixa), com as 3 telas novas + 2
  variantes de Registrar pagamento (título parcelado já com pagamento, conta não encontrada).
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, um
  título criado/pago só existe durante a sessão de JS daquela página — ao navegar pra outra
  tela, o script daquela página recarrega os dados seed do zero. O toast de sucesso aparece
  corretamente; a operação em si não persiste na listagem.

Verificado ao vivo (servidor `app-preview`, porta 8090): listagem com os 15 títulos seed (3
status presentes, incl. "Vencida"); aba "Em aberto" isolando `em-aberto`+`vencida` corretamente,
aba "Pagas" isolando só CTP-0002/CTP-0009; KPIs recalculando (Total a pagar R$ 50.190,00/Vencido
R$ 40.240,00 no carregamento); Nova Conta a Pagar V2 com Condição=Parcelado gerando 5 cards de
parcela com soma R$ 5.000,00 já batendo com o Valor total; editar uma parcela isoladamente
disparando o alerta de divergência (R$ 100,00 abaixo) corretamente; Registrar Pagamento
(CTP-0010, saldo R$ 650,00) com Histórico mostrando o pagamento seed exato (R$ 350,00/juros
R$ 25,00/desconto R$ 10,00/total saída R$ 365,00/saldo após R$ 650,00); Novo Pagamento
calculando ao vivo (Valor pago R$ 300 + Juros R$ 20 − Desconto R$ 5 = Total saída R$ 315,00;
Saldo após R$ 350,00) e confirmando com sucesso (toast + redirecionamento, `NiveloCaixa` recebeu
o lançamento de saída); card "Conta" (CTP-0004) mostrando Fornecedor/Descrição/Documento/Valor
original/Pago/Saldo principal corretos via `get_page_text`; nenhum erro de console real em
nenhuma das 3 telas (só os 404 de `/fonts/*.otf` já documentados); V1 (`contas-a-pagar.html`,
`nova-conta-pagar.html`, `detalhe-conta-pagar.html`) confirmado intocado.

## Ajustes 2026-08-31 (round 92) — Contas a Receber V2: reescrita completa espelhando
Contas a Pagar V2 (abas, Descrição/Recebido/Saldo, status simplificado, Registrar recebimento
como página própria com principal × juros × desconto)

Pedido explícito: dar a Contas a Receber V2 o MESMO tratamento/arquitetura que Contas a Pagar V2
ganhou no round 91 ("seguindo o mesmo padrão visual, estrutural e de usabilidade já utilizado em
Contas a Pagar"). A V2 anterior (round 65) — que usava Contas Bancárias, múltiplos recebimentos
por título sem separação principal×juros×desconto, e 5 status — foi **substituída por completo**
(não incrementada), mesma decisão de reescrita já tomada em Caixa V2 (round 90). V1
(`contas-a-receber.html`) permanece 100% intacta e acessível pelo `prototype-nav`.

- **`app/shared/contas-receber-v2-data.js` reescrito do zero**, espelhando a arquitetura de
  `contas-pagar-v2-data.js`: `valorOriginal` (nunca alterado por um recebimento) + `recebido`
  (soma só do PRINCIPAL) + `recebimentos[]` (eventos imutáveis, cada um com `valorRecebido`/
  `juros`/`desconto`/`totalEntrada`/`saldoApos`/`contaFinanceiraCodigo`) — `saldoPrincipal`
  sempre DERIVADO (`valorOriginal - recebido`). Só 3 status (`em-aberto`/`vencida`/`recebida`,
  pedido explícito, contra os 5 da versão anterior). Mesma separação de regra de negócio já
  usada em Pagar: "Valor recebido" reduz o principal 1:1; juros NUNCA reduzem o principal;
  desconto também não reduz o principal — só entra no `totalEntrada = valorRecebido + juros −
  desconto`. Recebimento parcial nunca encerra a conta. `registrarRecebimento()` gera um
  lançamento de ENTRADA real em `window.NiveloCaixa` no valor do total que entra na conta.
  **`addFromNotaFiscal()`/`addFromPedido()` preservados com a mesma assinatura** (chamados por
  `nova-nota-fiscal.js`/`pedidos-venda-data.js`, guardados atrás de `if (window.NiveloX)` +
  try/catch — nenhuma mudança necessária nesses 2 arquivos). `add()` mantém a geração automática
  de parcelas/recorrência já existente na versão anterior (Parcelada divide o valor; Semanal/
  Quinzenal/Mensal/Semestral/Anual geram 12 lançamentos futuros com valor integral) — não fazia
  parte do pedido remover essa capacidade, só simplificar status/ações da listagem.
- **Listagem (`contas-a-receber-v2.html`/`.js`), mirror estrutural exato de Contas a Pagar V2:**
  3 abas (Todas/Em aberto/Recebidas — "Em aberto" agrupa `em-aberto`+`vencida`); tabela Cliente/
  Descrição (era "Histórico" → "Descrição", logo após Cliente)/**Documento / NF** (renomeado de
  "Nº Documento")/Vencimento/Status/Valor original (nova)/Recebido (nova)/Saldo (nova)/Ações;
  colunas Banco/Data de emissão/Categoria removidas da tabela (continuam no cadastro, só não
  aparecem mais na listagem, pedido explícito). **Só 1 ação na tabela: Registrar recebimento**
  (Ver detalhes/Editar/Cancelar removidos — mesma decisão de Contas a Pagar V2). KPIs (Total a
  receber/Vencido/Vence hoje/Próximos vencimentos) mantidos, mesma cópia estrutural. Popover de
  Filtros reduzido a Período + Situação de Recebimento (integral/parcial/não recebido) + Status
  — Categoria (múltipla escolha)/Forma de Recebimento/Banco removidos do popover (mesma poda já
  aplicada a Pagar).
- **"Registrar recebimento" virou página própria** (`registrar-recebimento-conta-receber-v2.html?
  codigo=`, resolução direta pelo catálogo global, mirror exato de `registrar-pagamento-conta-
  pagar-v2.html/js/css`, só os rótulos trocados: Fornecedor→Cliente, Pago→Já recebido, Conta de
  saída→Conta de entrada, Valor pago→Valor recebido, Total que sai da conta→Total que entra na
  conta, Saldo principal após pagamento→Saldo principal após recebimento, Histórico de
  Pagamentos→Histórico de recebimentos) — não é mais um modal (a versão anterior abria um
  `Dialog`). Accordion "Histórico de recebimentos" recolhido por padrão (Data/Conta/Valor
  recebido/Juros/Desconto/Total Entrada/Saldo Após); card "Conta" somente-leitura (Cliente/
  Descrição/Documento-NF/Valor original/Já recebido/Saldo principal); card "Novo Recebimento"
  (Data auto-hoje editável; Conta de entrada — **Contas Financeiras cadastradas em Configuração,
  pedido explícito, nunca Contas Bancárias como a versão anterior usava** — + Valor recebido;
  Juros + Desconto; Total que entra na conta + Saldo principal após, calculados ao vivo,
  `disabled`). Confirmar valida Conta de entrada + Valor recebido (>0 e ≤ saldo principal),
  chama `registrarRecebimento()`, toast e redireciona pra listagem.
- **`nova-conta-receber-v2.html`/`.js` (formulário de criação) não precisou de reescrita** — o
  payload que já envia (`clienteCodigo`/`formaRecebimentoCodigo`/`vencimento`/`valor`/
  `numeroDocumento`/`historico`/`categoriaCodigo`/`ocorrencia`/`numeroParcelas`/
  `diaVencimento`) já bate 1:1 com o que o novo `add()`/`update()` aceitam — só o rótulo do
  campo "Nº Documento" foi renomeado pra "Documento / NF" (mesma nomenclatura pedida pro
  sistema inteiro). O caminho `?modo=editar`/"Cancelar conta" (round 65) ficou órfão — sem
  status "cancelada" na V2 nova, sem link algum na listagem apontando pra lá — `cancelar()` foi
  mantido no módulo de dados só como no-op de segurança (evita erro em runtime se alguém
  acessar a URL direto), mesmo princípio de "função órfã preservada, não removida" já
  documentado várias vezes neste arquivo (`bancos-data.js`, `contas-pagar-data.js`'s
  `excluir()`). **`detalhe-conta-receber-v2.html`/`.js` (Ver detalhes, round 65) também ficou
  órfão** — nenhuma tela aponta mais pra lá (ação "Ver detalhes" saiu da tabela); arquivo
  preservado intacto, mesma convenção.
- **"Documento / NF" também aplicado em Contas a Pagar V2** (pedido explícito: usar essa
  nomenclatura nos dois módulos) — cabeçalho da tabela, rótulo do campo em Nova Conta a Pagar
  V2, `<dt>` do card "Conta" de Registrar Pagamento (já estava certo lá desde o round 91),
  legenda do card mobile e cabeçalho do CSV de exportação, todos trocados de "Nº Documento"
  pra "Documento / NF" em `contas-a-pagar-v2.html`/`nova-conta-pagar-v2.html`/
  `contas-a-pagar-v2.js`.
- **`prototype-nav/nav.config.js`:** dentro do épico "Contas a receber (V2)", a variante
  "Editar" de Nova Conta a Receber e a entrada inteira de "Ver detalhes" (com suas 2 variantes)
  foram removidas — substituídas por uma nova entrada "Registrar Recebimento (V2)" com
  variantes "Com histórico de recebimentos"/"Conta não encontrada".
- **Mesma limitação de sempre, já documentada em todo o protótipo:** sem `localStorage`, uma
  conta criada/recebida só existe durante a sessão de JS daquela página — ao redirecionar pra
  `contas-a-receber-v2.html`, o script daquela tela recarrega os dados seed do zero. O toast de
  sucesso aparece corretamente; a operação em si não persiste na listagem.

Verificado ao vivo (servidor `app-preview`, porta 8090): listagem com os 12 títulos seed (3
status presentes, incl. "Vencida"/"Recebida"); KPIs corretos no carregamento (Total a receber
R$ 110.900,00/Vencido R$ 103.150,00); Registrar Recebimento (CTR-0008, saldo R$ 650,00) com
Histórico mostrando o recebimento seed exato (R$ 350,00/juros R$ 25,00/desconto R$ 10,00/total
entrada R$ 365,00/saldo após R$ 650,00) via accordion expandido; Novo Recebimento com Conta de
entrada populada a partir de `NiveloContasFinanceiras` (não bancárias), submit completo
validando e redirecionando de volta pra listagem com sucesso (`NiveloCaixa` recebendo o
lançamento de entrada); Nova Conta a Receber V2 carregando sem erro com o novo módulo de dados
(payload compatível, nenhuma mudança de código necessária ali além do rótulo "Documento / NF");
nenhum erro de console real em nenhuma das 3 telas tocadas/criadas (só os 404 de
`/fonts/*.otf` já documentados); V1 (`contas-a-receber.html`) confirmado intocado.

## Ajustes 2026-08-31 (round 93) — Caixa V2: KPIs acima das abas, Contas financeiras
com banco/conta reais, "Impacto na conta de origem" distinto, texto de duplicidade

5 ajustes pontuais sobre a V2 do Caixa (round 90), sem tocar em nenhum arquivo V1
(`caixa.html`/`novo-lancamento-caixa.html`/`transferencia-entre-contas.html`).

- **KPIs movidos pra fora do painel Consolidado.** Os 3 cards de resumo (Total de
  Entradas/Total de Saídas/Saldo Atual) pertenciam ao conteúdo condicional de
  `#panel-consolidado` desde o round 90 — sumiam ao trocar pra "Contas financeiras". Movidos
  em `caixa-v2.html` pra um bloco comum entre `.caixa-header` e o `Tab` (`#caixa-tablist`),
  agora visíveis nas duas abas o tempo todo. Nenhuma mudança de CSS/JS foi necessária (a
  classe `.caixa-summary-row` não dependia de estar dentro do painel).
- **Contas financeiras: Banco e Conta agora vêm de dado real, distinto e claro.** Antes
  (round 90), "Banco" mostrava o nome da própria Conta Financeira (plano de contas) e "Conta"
  um número mascarado SINTÉTICO — os dois vinham da mesma entidade, o que não separava de
  verdade "nome do banco" de "nome da conta". `caixa-v2.js`'s `renderContasFinanceiras()`
  reescrita: cada linha continua sendo 1 Conta Financeira (pra manter a soma batendo com o
  Saldo Atual do Consolidado, sem contar 2x o mesmo saldo), mas agora resolve a Conta Bancária
  REAL vinculada (`window.NiveloContasBancarias`, primeira encontrada quando há mais de uma) pra
  mostrar **Banco = nome real do banco** (catálogo Febraban via `NiveloBancosCatalogo`) e
  **Conta = nome da Conta Financeira + máscara dos ÚLTIMOS 4 DÍGITOS REAIS** do número de conta
  bancária (`maskedContaSuffix()`, novo — extrai dígitos com regex e pega os 4 finais, nunca mais
  um hash sintético), formato "Conta Corrente Operacional · •••• 6541" (exemplo real do seed,
  bate com o pedido "Conta principal · •••• 4521"). Contas Financeiras sem nenhuma conta
  bancária vinculada (ex. "Caixa Geral", dinheiro em espécie) mostram "—" no Banco e só o
  próprio nome na coluna Conta, sem máscara. Saldo negativo em vermelho (`.caixa-valor-saida`)
  também na aba Contas financeiras — antes só a cor neutra aparecia ali (confirmado ao vivo:
  "Caixa Geral" com -R$ 13.500,00 em vermelho).
- **Transferência entre Contas: "Impacto na conta de origem" virou seção própria e
  reposicionada.** O bloco de conferência (Saldo disponível/Novo saldo estimado) já existia
  desde o round 90, mas sem nenhum título — corrigido adicionando `<h2 class="tec-subsection-
  title">Impacto na conta de origem</h2>` (nome deliberadamente diferente de "Resumo financeiro
  do lançamento", que é exclusivo de Incluir Lançamento V2, evitando qualquer confusão entre as
  duas telas) + reposicionado pra depois de TODOS os campos do formulário (incl. Descrição, que
  antes vinha depois do resumo) e antes dos botões de ação, como pedido. Novo bloco CSS
  `.tec-impacto-subsection` com o guard `[hidden]{display:none}` de sempre (mesmo bug recorrente
  documentado dezenas de vezes neste arquivo — o elemento já usava `hidden` via JS, só faltava a
  regra). "Valor" → "Valor da transferência" e "Histórico" → "Descrição" já estavam corretos
  desde o round 90, confirmado sem mudança necessária.
- **Texto exato do aviso de duplicidade corrigido em Incluir Lançamento V2:** "Novo Lançamento"
  → "**Incluir Lançamento**" (nome real do botão/tela) — resto do texto já batia
  literalmente com o pedido. Confirmado ao vivo em mobile (375px) que o texto não é cortado nem
  sobreposto (`.alert`/`.body`/`.message` já quebram linha livremente, sem `white-space:nowrap`
  em nenhum ancestral).
- **Campo "Classificação" — nada a remover.** Investigado a fundo: não existe (e nunca existiu
  na V2) um campo de formulário chamado "Classificação" — o que existe é uma SUBSEÇÃO com esse
  título, contendo 2 campos reais e distintos (Competência opcional + Cliente ou Fornecedor
  opcional), nenhum dos dois chamado "Classificação" em si. Nenhuma mudança feita — remover a
  subseção inteira apagaria os 2 campos de contexto do lançamento, o que não foi pedido
  explicitamente (o pedido falava em "campo", não em "seção").

Verificado ao vivo (servidor `app-preview`, porta 8090): KPIs permanecendo visíveis e com os
mesmos valores (R$ 200.400,00/R$ 74.459,00/R$ 125.941,00) ao alternar entre as 2 abas, em
desktop e mobile (375px, cards empilhados acima do Tab); aba Contas financeiras com Banco/Conta/
Saldo claramente distintos ("Banco do Brasil" / "Conta Corrente Operacional · •••• 6541" /
R$ 107.241,00), total da coluna Saldo (R$ 125.941,00) batendo exatamente com o Saldo Atual do
Consolidado, "Caixa Geral" (sem conta bancária vinculada) mostrando "—" no Banco e saldo negativo
em vermelho, tudo replicado nos Cards do mobile; Transferência entre Contas com "Impacto na conta
de origem" aparecendo só após escolher a Conta de origem, posicionado depois da Descrição e antes
dos botões, recalculando ao vivo (R$ 107.241,00 − R$ 50,00 = R$ 107.191,00 testado), sem nenhuma
duplicação com "Resumo financeiro do lançamento" (tela diferente); texto de duplicidade exato
("Incluir Lançamento") sem corte em mobile; nenhum erro real de console em nenhuma das 3 telas
(só os 404 de `/fonts/*.otf` já documentados como pré-existentes em todo o sistema).

## Ajustes 2026-09-01 (round 94) — 5 renomeações/remoções pontuais: Caixa V2, sidebar

5 ajustes de rótulo/remoção, sem tocar em nenhuma lógica/comportamento além do estritamente
necessário pra cada item.

- **Caixa V2 — aba "Contas financeiras" → "Contas bancárias"** (`caixa-v2.html`): texto do
  botão da aba (`data-tab="contas-financeiras"` preservado) e o texto de apoio abaixo das abas
  (`TAB_HINTS['contas-financeiras']` em `caixa-v2.js`, que agora diz "cada conta bancária" em
  vez de "cada Conta Financeira") trocados — a lógica de agrupamento por Conta Financeira em si
  não mudou, é só o rótulo visível apontando o usuário pra pensar nisso como "conta bancária".
- **Incluir Lançamento V2 — label "Contas financeiras" → "Contas bancárias"**
  (`novo-lancamento-caixa-v2.html`, campo `id="conta-financeira-field"`): label, placeholder
  ("Selecione a conta bancária") e help text ("Contas cadastradas em Configurações → Contas
  Bancárias") trocados; mensagem de erro do campo também ajustada. `id`/`name`/lógica JS de
  leitura do valor intactos — o campo continua tecnicamente a Conta Financeira/
  `NiveloContasFinanceiras` por trás.
- **Removido "Conta Financeira" da Sidebar > Configuração:** o `<button data-nav="config-conta-
  financeira">` (label "Conta Financeira", ícone `banknote`) removido de 92 arquivos
  `app/screens/*.html` via script Node de mass-edit (regex multi-linha). Linha correspondente
  removida de `NAV_DESTINATIONS` em `interface-principal.js`. `contas-financeiras.html`/
  `contas-financeiras.js`/`page-contas-financeiras.css`/`contas-financeiras-data.js`
  preservados intactos (continuam existindo como módulo de dados consumido por Contas
  Bancárias/Caixa V2/DRE, e acessíveis pelo `prototype-nav`) — só saíram da navegação real.
- **Sidebar: grupo "Vendas e fiscal" → "Vendas"** (só o texto visível — tooltip
  `data-tooltip="Vendas · opções"` e `<span class="app-nav-label">Vendas</span>`, `id="group-
  vendas"`/`data-group-toggle="group-vendas"` intactos) — mass-edit via script Node
  (substituição de string exata) em 93 arquivos.
- **Sidebar: subitem "Clientes e fornecedores" (grupo Cadastro) → "Parceiros"** (só o texto
  visível, `data-nav="cadastro-pessoas"` intacto, tela de destino `cadastros.html` intacta) —
  mesmo script de mass-edit, 93 arquivos.

Verificado ao vivo (`http-server`, porta 8090, preserva query string/hash): `dashboard.html`
com Sidebar mostrando "Vendas" (não "Vendas e fiscal"), "Parceiros" dentro de Cadastro, e
"Conta Financeira" ausente de Configuração (confirmado via busca de texto na página);
`caixa-v2.html` com a aba "Contas bancárias"; `novo-lancamento-caixa-v2.html` com o label/
placeholder/help text "Contas bancárias"/"Selecione a conta bancária"/"Contas cadastradas em
Configurações → Contas Bancárias"; `grep -rc` confirmando 0 ocorrências restantes de
"config-conta-financeira"/"Vendas e fiscal"/"Clientes e fornecedores" em `app/screens`; nenhum
erro de console nas telas verificadas.
