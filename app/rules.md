# Nivelo App — Design System Snapshot

Escopo: área logada do produto (`app/`), separada da landing page (`landing/`).

## Storybook path
`../Storybook-Nivelo/` (relativo a `app/`)

From `screens/*.html`, todos os caminhos usam `../../Storybook-Nivelo/`

## CSS load order (toda tela)
```html
<link rel="stylesheet" href="../shared/fonts.css" />
<link rel="stylesheet" href="../../Storybook-Nivelo/src/tokens/tokens.css" />
<link rel="stylesheet" href="../../Storybook-Nivelo/src/tokens/typography.css" />
<link rel="stylesheet" href="../../Storybook-Nivelo/src/components/[Component]/[Component].module.css" />
<link rel="stylesheet" href="../shared/page-[tela].css" />
```

---

## ⚠️ Text styles — padrão obrigatório a partir de 2026-07-22

`Storybook-Nivelo/src/tokens/typography.css` define uma classe `.text-<categoria>-<tamanho>`
por text style do catálogo Figma (Heading/Subtitle/Body/Caption/Button — ver
`Typography.stories.tsx`, que renderiza a prévia com estas MESMAS classes, não com valores
inline recalculados). **A partir de agora, qualquer texto novo (heading, corpo, label, botão,
caption) em qualquer tela/componente novo, ou qualquer trecho de tipografia tocado num ajuste
futuro, deve usar uma dessas classes — nunca compor `font-size`/`font-weight`/`line-height`
soltos a partir dos tokens de escala (`--font-size-*`, `--font-weight-*`) diretamente num
seletor novo.** As tokens de escala continuam existindo (`typography.css` é construído a partir
delas), mas viram implementação interna, não a API pública de tipografia.

Lista completa de classes disponíveis:
| Categoria | Classes |
|---|---|
| Heading | `.text-heading-1-xl` (128px) · `.text-heading-1-l` (96px) · `.text-heading-1-m` (72px) · `.text-heading-2` (56px) · `.text-heading-3` (48px) · `.text-heading-4` (40px) · `.text-heading-5` (32px) · `.text-heading-6` (24px) |
| Subtitle | `.text-subtitle-xl` (20px) · `.text-subtitle-l` (18px) · `.text-subtitle-m` (16px) · `.text-subtitle-s` (14px) |
| Body | `.text-body-xxxl` (32px) · `.text-body-xxl` (24px) · `.text-body-xl` (20px) · `.text-body-l` (18px) · `.text-body-m` (16px) · `.text-body-s` (14px) · `.text-body-xs` (12px) · `.text-body-xxs` (10px) |
| Caption | `.text-caption-m` (20px) · `.text-caption-s` (16px) |
| Button | `.text-button-xl` (24px) · `.text-button-l` (20px) · `.text-button-m` (16px) · `.text-button-s` (14px) |

**Migração concluída em 2026-07-22 (todos os 17 componentes do Storybook)** — não ficou
pendente/oportunista, foi feita de uma vez a pedido explícito do usuário ("melhor já migrar
essas coisas pra não correr risco de esquecer depois"). Toda classe de texto real (não ícone)
em todo componente agora aplica a `.text-*` correspondente via `className` no `.tsx`.

**⚠️ Componentes de consumo duplo — a razão pela qual nem todo `.module.css` teve a tipografia
REMOVIDA, só documentada.** Vários `.module.css` do Storybook são carregados como stylesheet
global direto em telas estáticas do protótipo (`app/screens/*.html`), que usam a classe
(`class="btn primary"`, `class="th"`, `class="label"` etc.) escrita à mão no HTML — SEM passar
pelo componente React, e portanto sem nenhuma forma de receber a nova classe `.text-*`. Remover
a tipografia do `.module.css` desses componentes quebraria essas telas (perderiam
font-size/weight/line-height instantaneamente). Confirmado com `grep` de cada
`NomeDoComponente.module.css` dentro de `app/`:

| Componente | Consumo duplo (React + HTML estático)? | O que foi feito |
|---|---|---|
| Button, Table, Dropdown, Dialog, Tab, Feedback, Input, RadioButton | **Sim** — usados em `app/screens/*.html` | `.module.css` mantido como está (valores intactos), com comentário apontando pra classe `.text-*` equivalente; o componente React AINDA aplica a classe via `className` (redundante — a própria regra do `.module.css`, carregada depois de `typography.css`, continua vencendo — mas documenta a intenção sem risco) |
| AppHeader, Sidebar, SiteHeader, SiteFooter, Checkbox, Accordion, Tooltip, Breadcrumb, Toggle | Não — só React | `.module.css` migrado de verdade: tipografia removida das regras, `className` no `.tsx` passa a ser a única fonte |

**Regra para qualquer migração futura de um componente ainda não tocado:** antes de remover
tipografia de um `.module.css`, rodar `grep "NomeDoComponente.module.css" app/` — se aparecer em
algum `app/screens/*.html`, é consumo duplo (manter valores, só comentar); se não aparecer, é
seguro migrar de verdade (remover do CSS, aplicar a classe no React).

**Migração dos CSS de PÁGINA concluída em 2026-07-23** (`page-login.css` e todo CSS que o
compartilha — `page-recuperar-senha.css`/`page-codigo-verificacao.css`/
`page-criar-nova-senha.css`/`page-cadastro.css` —, `page-dashboard.css`, `page-cadastros.css`,
mais o tooltip da Sidebar) — a migração de 2026-07-22 acima só cobriu os `.module.css` dos 17
componentes; o CSS específico de cada tela (as classes `.login-*`/`.dash-*`/`.cadastros-*`/
`.cadastro-*`/`.otp-*`/`.pwd-criteria-*` etc., nunca tocadas antes) continuava com
`font-size`/`font-weight` soltos a partir dos tokens de escala, nunca as classes `.text-*`. Regra
seguida: **só migrar quando a combinação tamanho+peso (+line-height/letter-spacing, quando já
declarados) bate EXATAMENTE com uma classe existente** — nunca aproximar. Elementos cujo
tamanho+peso não tem nenhuma classe correspondente no catálogo (ex.: 12px+medium, 18px+medium,
20px+medium — combinações reais usadas neste protótipo que não têm variante "Extended") foram
deixados como estavam (100% tokens, só sem a classe semântica) — forçar uma classe aproximada
teria sido pior que não migrar. `typography.css` foi adicionado ao `<head>` de toda tela que
ainda não tinha (login, recuperar-senha, código de verificação, criar nova senha, os 3 steps de
criar conta, validar telefone, interface-principal). `page-shell.css`/`interface-principal.html`
recebeu só o essencial (tooltip) — é o protótipo HTML de referência do shell, não a fonte de
verdade (isso já são os componentes React `AppHeader`/`Sidebar`, que a auditoria confirmou já
estarem corretos).

**Tooltip da Sidebar (`.app-tooltip` em `page-shell.css` + `.tooltip` em `Sidebar.module.css`)
alinhado aos tokens reais do componente `Tooltip`:** usava `padding:6px 10px`/`border-radius:
var(--radius-sm)` hardcoded — o componente real usa `padding:var(--spacing-xs) var(--spacing-sm)`
(4px/8px) e `border-radius:var(--radius-xs)` (4px). Cor já batia visualmente (`--color-text-
primary`/`--color-bg-surface` resolvem pros mesmos valores de `--color-gray-900`/`--color-gray-
white` no tema claro), mas trocada pelos tokens literais do componente por rastreabilidade. A
seta (`.arrow`) do componente real NÃO foi replicada — arquitetura incompatível: o `Tooltip` real
é filho de um `.wrapper{position:relative}` com variante estática (`.top`/`.right`/etc.), este
precisa de `position:fixed` com coordenadas calculadas via JS pra escapar do `overflow-x:hidden`
da Sidebar.

---

## ⚠️ Colisão de classes entre componentes (leia antes de combinar 2+ componentes)

Os `.module.css` do Storybook são carregados aqui como stylesheets globais (não como CSS
Modules de verdade) — nomes de classe genéricos colidem entre componentes diferentes. Já
confirmados:

| Classe | Colide entre | Efeito se não corrigido |
|---|---|---|
| `.wrapper` | Input × Checkbox | `display`/`width` de um vaza pro outro |
| `.label` | Input × Checkbox | `font-weight` (bold × regular) trocado |
| `.input` | Input × Checkbox | Checkbox esconde (`1px/opacity:0`) os campos de texto inteiros |
| `.input` | Input × RadioButton | Mesmo efeito acima (RadioButton também esconde o radio nativo via `.input{position:absolute;1px;opacity:0}`) — apareceu em Estoque/Novo registo de estoque/Registrar saída-consumo-abatimento quando RadioButton foi adicionado a essas telas (Forma de entrada, Gerar Nota Fiscal); TODO campo de texto/número/data/textarea real ficava invisível (só o label aparecia). Corrigido com `.input:not([type="radio"])` reafirmando `position:static;opacity:1`, que isola a correção do radio nativo de verdade (única exceção que precisa continuar escondida) sem precisar de uma 2ª classe por campo — ver `page-estoque.css`/`page-novo-estoque.css` |
| `.error` | Input (wrapper) × Feedback (alert) | Feedback pinta fundo/borda vermelhos no campo do Input |
| `.error` | OTP group (`.otp-group`) × Feedback (alert) | Mesma colisão acima, no grupo de inputs OTP (`page-codigo-verificacao.css`) |
| `.error` | Campo de termos (`.cadastro-terms-field`) × Feedback (alert) | Mesma colisão acima, no grupo do checkbox de termos do Step 3 de Criar Conta (`page-cadastro.css`). Aqui o estado de erro correto nem é fundo/borda no grupo — é só a mensagem de erro + contorno vermelho no `.box` do próprio Checkbox |
| `.body` | Feedback (alert) × Table (cardHeader) × Dialog (modal) | No toast de sucesso do Dashboard (só tela que carrega os 3 juntos): `.body` do Dialog (`padding:16px...`, `color:text-secondary`) vencia por ser carregado por último, empurrando título/mensagem pra baixo (não alinhados com ícone/botão de fechar) e pintando o texto de cinza em vez da cor semântica (verde/vermelho) do alerta |
| `.title` | Feedback (alert) × Table (cardHeader) × Dialog (modal) | Mesmo toast: `.title` do Dialog (`18px`/`bold`/`text-primary`) vencia sobre o `.title` do Feedback (`16px`/`medium`, cor herdada do `.alert`), fazendo o título do toast usar o tamanho/peso/cor do TÍTULO DE MODAL em vez do próprio |

**Armadilha relacionada, não é bem uma colisão: reaproveitar só o NOME da classe sem carregar o
`.module.css` de onde ela vem.** `cadastro-planos.html` (Step 3) reaproveita o padrão
`.errorText`/`.msgIcon` do Input (ícone + texto de erro) pras mensagens de "selecione um
plano"/"aceite os termos", mas a tela não tem nenhum `<input>` de texto — então nunca carregava
`Input.module.css`, e essas classes ficavam sem NENHUM estilo próprio (sem `gap`, sem
`align-items`, sem cor), sobrando só o `display:none/flex` do collision-fix de
`page-login.css`. Sintoma: espaçamento entre ícone e texto da mensagem de erro incorreto/
ausente. **Corrigido carregando `Input.module.css` em `cadastro-planos.html` mesmo sem usar
o componente Input em si** — verificado que isso não quebra nada (Checkbox/RadioButton
carregam DEPOIS, então seus próprios `.input{position:absolute;...}` continuam vencendo pros
inputs nativos escondidos; qualquer propriedade extra que o Input.module.css também aplique a
esses inputs invisíveis não tem efeito visual). **Lição: ao reaproveitar uma classe de
componente (`.errorText`, `.msgIcon`, etc.) numa tela que não usa o componente inteiro, o
`.module.css` daquele componente precisa ser carregado mesmo assim — reaproveitar só o nome da
classe sem a folha de estilo correspondente deixa a classe "vazia".**

**Padrão de correção:** adicionar uma segunda classe específica da página em cada uso (ex:
`wrapper login-field` vs `wrapper login-checkbox`) e reafirmar os valores corretos no CSS da
página com um seletor composto de especificidade igual ou maior
(`.wrapper.login-field { ... }`). Ver `app/shared/page-login.css` pra um exemplo completo.
Antes de usar 2+ componentes juntos numa tela nova, leia os `.module.css` de ambos e confirme
se compartilham nomes de classe.

**Regra do Design System (2026-07-21): nunca fundo vermelho preenchido atrás de inputs ou
inputs OTP em estados de erro.** Estado de erro usa só contorno/borda vermelha (`.error .input`
em `Input.module.css`) + mensagem de erro vermelha (`.errorText`) — o preenchimento/background
do campo continua neutro, padrão do Storybook. Vale pra todo input e componente OTP existente
ou futuro, a menos que um componente do Storybook determine outro comportamento
explicitamente. Não é uma escolha de tela: se aparecer fundo vermelho atrás de um input/OTP em
erro, é a colisão `.error` acima vazando — corrigir com o mesmo padrão de override
(`.wrapper.login-field.error{background:transparent;...}` / `.otp-group.error{background:
transparent;...}`), nunca estilizando o erro daquela tela de um jeito diferente.

---

## ⚠️ Especificidade: shorthand (`padding`) pode vencer uma longhand mais específica (`padding-left`)

**Bug real (Cadastro, busca com ícone, 2026-07-23):** `.cadastros-filters .cad-filter.cad-filter-search
.input` (4 classes) só declarava `padding-top`/`padding-bottom` (pra ajustar a altura do campo pra
28px), sem tocar `padding-left`. A herança de `padding-left:40px` viria de `Input.module.css`'s
`.hasLeft .input` (2 classes, ver seção Input). Só que existia uma 3ª regra concorrente,
`.cadastros-filters .cad-filter .input { padding: var(--spacing-xs) var(--spacing-sm); }` (3
classes, pro campo de data "Inativo desde"), usando o **shorthand** `padding` — que expande pras
4 longhands (`padding-left` incluso). Comparando especificidade **por longhand, não pela regra
inteira**: pra `padding-left`, o candidato de 3 classes (shorthand) tem mais especificidade que o
de 2 classes (`.hasLeft`), e venceu — reduzindo o espaço do ícone de busca pro texto de 40px pra
8px (texto colado no ícone). O seletor de 4 classes que eu tinha escrito não "defendia"
`padding-left` porque nunca declarava essa propriedade. **Fix:** declarar `padding-left: 40px`
explicitamente na regra de 4 classes (não basta ter mais classes no seletor — precisa
efetivamente declarar a propriedade em disputa). **Lição: ao sobrescrever só ALGUNS lados de
padding/margin/border de um elemento que também recebe um `padding`/`margin` shorthand de outra
regra concorrente, confira (via `getComputedStyle`, não só o CSS-fonte) se os lados que você NÃO
declarou continuam corretos — a especificidade é resolvida por propriedade individual, não por
regra inteira, então uma regra "mais específica" que usa shorthand pode vencer em propriedades
que sua regra mais nova nunca mencionou.**

---

## Sidebar: navegação real entre telas existentes (2026-07-23)

Cada item do menu com uma tela real construída precisa navegar de verdade pra ela — não só o item
que originou a tela (ex.: "Cadastro" já navegava desde que `cadastros.html` foi criado, mas
"Dashboard" ainda só alternava o destaque visual, então ir de Cadastro pra Dashboard pela Sidebar
não funcionava). `interface-principal.js` centraliza isso num mapa `NAV_DESTINATIONS` + um loop
que liga `click` → `window.location.href` pra cada entrada — ao criar uma tela nova, adicionar
aqui em vez de escrever mais um `addEventListener` solto. Os demais itens do menu (Financeiro,
Vendas, Assistente IA, Configuração, Canal de ideias, Vídeos, Suporte) não têm tela construída
ainda — continuam só alternando `is-active` visualmente, de propósito (não inventar tela nova sem
pedido explícito).

> **ATUALIZAÇÃO (2026-07-27):** "Cadastro" deixou de ser um item único — virou o grupo expansível
> "Cadastros" (mesmo padrão de Financeiro/Vendas: `.app-nav-group`/`.app-nav-submenu`/
> `.app-nav-subitem`, accordion via `data-group-toggle`, `TOP_LEVEL_GROUP_IDS` em
> `interface-principal.js`) com 2 subitens: "Pessoas e empresas" (`data-nav="cadastro-pessoas"`,
> é quem navega de verdade agora, `NAV_DESTINATIONS = {dashboard:'dashboard.html', 'cadastro-
> pessoas':'cadastros.html', estoque:'estoque.html'}`) e "Produtos" (`data-nav="cadastro-
> produtos"`, sem tela ainda — só alterna `is-active`, mesmo padrão dos demais subitens sem
> destino). Essa estrutura (categoria expansível + subitens, um sem tela ainda) é o padrão pra
> futuras expansões de Cadastros.

---

## Storybook Components

### Input ✅
**CSS:** `../../Storybook-Nivelo/src/components/Input/Input.module.css`

```html
<div class="wrapper [error] [pageSpecificClass]">
  <label class="label [pageSpecificClass]" for="...">Label</label>
  <div class="inputWrap [hasLeft] [hasRight]">
    <input class="input [pageSpecificClass]" id="..." type="..." />
  </div>
  <span class="errorText">...</span>   <!-- ou successText, ou helperText -->
</div>
```
Classes: `wrapper`, `label`, `inputWrap`, `input`, `hasLeft`, `hasRight`, `iconLeft`,
`iconRight`, `error` (modificador em `wrapper`), `helperText`, `errorText`, `successText`,
`msgIcon`. Sem prop de tamanho — um só size. `iconLeft`/`iconRight` são decorativos
(`pointer-events:none`) — pra um botão clicável dentro do campo (ex: mostrar/ocultar senha),
crie seu próprio `<button>` posicionado, não use `iconRight`.

**Bug corrigido na fonte (2026-07-20):** `.input:focus-visible` usava
`box-shadow: 0 0 0 3px rgba(142, 68, 70, 0.18)` — um marrom/vinho residual de outro design
system, sem relação com a marca. Corrigido direto em `Input.module.css` para
`rgba(23, 82, 176, 0.18)` (brand-500, mesma cor de `--color-border-focus`/`--color-action-primary`
já usada por Button/Checkbox). Editado o componente compartilhado de propósito (não um
override de página) porque o Storybook é a fonte da verdade — a correção vale pra todo
consumidor do Input, não só pra esta tela.

### Checkbox ✅
**CSS:** `../../Storybook-Nivelo/src/components/Checkbox/Checkbox.module.css`

```html
<label class="wrapper [checked] [disabled] [pageSpecificClass]" for="cb-id">
  <input type="checkbox" id="cb-id" class="input [pageSpecificClass]" />
  <span class="box"><span class="mark"><!-- ícone check/minus --></span></span>
  <span class="label [pageSpecificClass]">Texto</span>
</label>
```
No componente React o `.mark` só é montado quando marcado/indeterminado; em HTML estático ele
fica sempre no DOM — esconda via CSS até a classe `checked` aparecer no wrapper (ver
`page-login.css`). JS deve alternar a classe `checked` no `change` do input real.

### Button ✅
**CSS:** `../../Storybook-Nivelo/src/components/Button/Button.module.css`

Igual ao já documentado em `landing/rules.md`: `class="btn [primary|secondary|destructive|ghost] [sm|lg] [hasLeft|hasRight|iconOnly]"`.
**`md` não é uma classe** — é o tamanho base do `.btn` (sem modificador nenhum), usado sempre
que nem `sm` nem `lg` forem adicionados.
**Sem prop de largura total** — full-width é sempre uma classe própria da página
(`.login-submit{width:100%}`), nunca do componente. **Sem estado de loading no componente** —
se precisar de spinner, é markup/CSS próprio da página (ver `.login-submit-spinner`).
Para ação de submit de formulário use `<button type="submit" class="btn ...">`, não `<a>`
(⁠`<a>` é só para navegação real, como já fazia a landing).

**Alturas corrigidas na fonte (2026-07-21):** `sm`/`md` estavam desproporcionalmente altos
(42px/50px). Ajustado `Button.module.css` (padding vertical) pra: `sm` = **36px**, `md` =
**44px**, `lg` = **54px** (mantido). Editado o componente compartilhado (não override de
página) pelo mesmo motivo do fix do focus-ring do Input: o Storybook é a fonte da verdade,
vale pra todo consumidor do Button (landing incluída — verificado visualmente que os botões
da landing continuam corretos depois da mudança). **Todo o fluxo de Login/Recuperação de
senha usa `md` agora** (removida a classe `lg` de todos os botões dessas telas) — antes
usava `lg` (54px), que ficou identificado como alto demais pra esse contexto.

### Dialog ✅ (primeiro uso: fluxo de Criar Conta, 2026-07-21)
**CSS:** `../../Storybook-Nivelo/src/components/Dialog/Dialog.module.css`

```html
<div class="overlay" id="..." hidden>
  <div class="dialog [sm|md|lg]" role="dialog" aria-modal="true" aria-labelledby="...">
    <div class="header">
      <h2 class="title" id="...">Título</h2>
      <button class="closeBtn" aria-label="Fechar"><i data-lucide="x" width="18" height="18"></i></button>
    </div>
    <div class="body">Conteúdo</div>
    <div class="footer"><button class="btn primary">Ação</button></div>
  </div>
</div>
```
Classes: `overlay` (fundo escurecido + centralização, `position:fixed`), `dialog` +
modificador de tamanho (`sm`=360px/`md`=540px/`lg`=720px, sem modificador = sem largura
definida), `header`/`title`/`closeBtn`, `body` (scroll interno se o conteúdo for maior que
`max-height:90vh`), `footer` (ações alinhadas à direita). Sem prop de abrir/fechar no CSS: é
JS puro que alterna o atributo `hidden` do `.overlay` (clique fora fecha, clique no
`.closeBtn` fecha, tecla Esc fecha) — mesmo padrão de outros componentes deste protótipo que
não têm estado embutido (Button não tem loading, Input não tem masks). Usado no fluxo de
Criar Conta pro modal de "Termos de Uso"/"Política de Privacidade" (um único `.overlay` por
tela, conteúdo trocado via JS conforme qual link foi clicado, não dois modais duplicados).

### RadioButton ✅ (primeiro uso: fluxo de Criar Conta, 2026-07-21)
**CSS:** `../../Storybook-Nivelo/src/components/RadioButton/RadioButton.module.css`

```html
<label class="option [checked]" for="...">
  <input type="radio" class="input" name="..." />
  <span class="circle"><span class="dot"></span></span>
  <span class="optionLabel">Texto</span>
</label>
```
Classes: `group`/`group horizontal` (container, se usar o `<fieldset>`+`<legend class="label">`
completo do componente), `option` (label clicável, `display:inline-flex` por padrão),
`input` (nativo, escondido via `position:absolute;1px;opacity:0` — mesmo truque do Checkbox),
`circle`/`dot` (indicador visual, `dot` só fica opaco quando o `option` tem a classe
`checked`), `optionLabel`. **Sem prop de seleção única automática via CSS**: quem alterna a
classe `checked` no `option` correto é JS, no `change` de cada input (o componente React faz
isso comparando `value === opt.value`, replicado aqui manualmente).

**Composição usada no Step 3 (Planos) — card em vez de opção de texto único:** o layout
`inline-flex` padrão do `.option` não comporta nome + preço + descrição, então um compound
selector `.option.cadastro-plan-card{display:flex;...}` (mesmo padrão de override já usado em
`.wrapper.login-field`) reorganiza o layout mantendo `circle`/`dot`/`input`/`checked` intocados
— o comportamento de seleção continua sendo o componente real, só o container visual ao redor
é específico da página (ver `app/shared/page-cadastro.css`).

**Reaproveitado como toggle binário Sim/Não (Estoque, 2026-07-27, round 24)**: `.group.horizontal`
com só 2 `option`s (ex. "Gerar Nota Fiscal" no modal de Registrar saída, "Forma de entrada" em
Novo registo de estoque) — mesmo componente, sem inventar um Toggle/switch novo pra esse caso de
uso mais simples que o card de planos.

### Table ✅ (primeiro uso real: Dashboard, 2026-07-22)
**CSS:** `../../Storybook-Nivelo/src/components/Table/Table.module.css`

```html
<div class="card [dash-card]">
  <div class="cardHeader">
    <h2 class="title">Título</h2>
    <p class="subtitle">Subtítulo</p>
  </div>
  <div class="tableWrap">
    <table class="table">
      <thead>
        <tr class="headerRow">
          <th class="th [th-right]">Coluna</th>
        </tr>
      </thead>
      <tbody>
        <tr class="tr">
          <td class="td [td-right]">Valor</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```
Classes: `card` (container: fundo, borda, radius), `cardHeader`/`title`/`subtitle` (cabeçalho),
`tableWrap` (scroll horizontal), `table`/`headerRow`/`th`/`tr`/`td` (zebra striping automática
via `nth-child`), `badge`/`badgeDot` (status), `cellLink`, `avatar`, `miniToggle`, `cellActions`/
`actionBtn`, `stateCell`/`loadingDot` (vazio/carregando). Sem prop de alinhamento de coluna em
HTML estático (o componente React usa `style={{textAlign}}` via prop `align`, mas isso é inline
style gerado por JS, não vale pra HTML estático) — `th-right`/`td-right` são classes de página
(`page-dashboard.css`) que replicam o mesmo efeito sem violar a regra "sem `style=""` inline".

**Reaproveitada como o "Card" genérico do sistema:** não existe um componente Card dedicado no
Storybook ainda — `.card`/`.cardHeader`/`.title`/`.subtitle` do Table servem de container/
cabeçalho pra QUALQUER card do Dashboard, não só os com tabela dentro (Safra, Estoque, Saldo e
Clima também usam `.card`/`.cardHeader`, com conteúdo próprio no lugar da tabela). Reforço visual
específico da página (sombra sutil, tamanho do título) via seletor composto `.card.dash-card`,
mesmo padrão de correção já documentado acima pra colisões Input×Checkbox. Se esse padrão se
repetir em telas futuras, considerar promover a um componente Card real no Storybook.

**Zebra striping específico do Dashboard (2026-07-22, ajustado no mesmo dia pra `gray-100`):** o
zebra padrão do Table (`--color-bg-subtle`/`--color-bg-default`, dois tons de cinza) foi
sobreposto SÓ nas tabelas de Contas a pagar/receber via seletor composto
(`.dash-table-body .tr:nth-child(odd/even) .td`, ver `page-dashboard.css`) pra alternar entre o
fundo do próprio card (`--color-bg-surface`, "invisível") e `--color-gray-100` — testado
primeiro com `--color-gray-50` (mais sutil), depois trocado pra `--color-gray-100` a pedido do
usuário (queria uma alternância mais perceptível). O cabeçalho (`.th`) também recebe
`--color-gray-100`, unificando o tom em vez de deixá-lo só nas linhas. `Table.module.css` em si
não muda; outros consumidores do componente continuam com o zebra padrão.

**`.badge`/`data-status` reaproveitado fora da tabela (2026-07-23):** a tag "Teste gratuito · N
dias restantes" do Dashboard (`#dash-trial-badge`) usa a classe `badge` real com
`data-status="info"` (padrão, azul)/`"warning"` (menos de 3 dias), alternado por
`dashboard.js` — **não** uma cor/forma própria da página. Foi corrigido depois de uma primeira
versão ter inventado `.dash-trial-badge` com `background`/`color` hardcoded a partir de tokens
soltos (`--color-bg-brand`/`--color-text-brand`), quando o `.badge` já cobria exatamente essa
necessidade (mesmo componente usado no Status do Cadastro). `.dash-trial-badge` (a classe da
página) hoje só acrescenta o que o `.badge` genérico não cobre (não quebrar linha, negrito no
número de dias) — nunca redefine cor/forma. **Lição: antes de estilizar um badge/pill/tag do
zero com tokens soltos, conferir se `Table.module.css`'s `.badge` já resolve — ele tem 8
variantes de cor prontas (`info`/`success`/`error`/`warning`/`orange`/`indigo`/`violet`/`pink`)
cobrindo a maioria dos casos de "tag colorida" do design system.**

**Variante visual alternativa da tabela (2026-07-24, Cadastro de pessoas e empresas) —
comparação, não substituição.** Ligada via `#state=tablealt`
(`.cadastros-table-card.table-variant-alt`, ver `cadastros.js`/`page-cadastros.css`):
cabeçalho fundo White (não gray-100) + labels Gray 700/**Semibold** (não mais Bold, peso
visual mais leve), ícone de ordenação Gray 500 (já era o padrão, só declarado
explicitamente), linhas White/Gray 50 (contraste mais sutil que White/Gray 100), bordas
Gray 200 (não Gray 100), células Gray 900/Regular (já era o padrão do Table, mantido).
`table-layout:fixed` + larguras por `nth-child` redistribuindo o espaço: Tipo reduzida
(era a coluna com maior auto-largura, "Cliente, Fornecedor, Transportadora" no pior caso),
Ações reduzida pra `116px` fixo (cabe os 3 `actionBtn` de 32px + gaps sem sobrar espaço).
**Precisou de um token novo:** `--font-weight-semibold: 600` (adicionado em `tokens.css` —
a escala só tinha light/regular/medium/bold; Semibold é um valor real e comum de design
system, não uma aproximação). Registrada como variante em `prototype-nav`
(`cadastros-listagem-tablealt`), pra comparar lado a lado com o padrão atual antes de
decidir qual adotar — o padrão (`.th` Gray 100/Bold, zebra White/Gray 100) continua
intocado e é o que a tela mostra por padrão.

**Terceira opção, `#state=tablecompact` (`.table-variant-compact`, 2026-07-24) —
independente das outras duas, também só pra comparação.** Cabeçalho: fundo Gray 100 (de
volta, diferente do White da `tablealt`), labels em CAIXA ALTA + `letter-spacing:0.06em`
(mesmo valor já usado em `.app-nav-section-title`, page-shell.css), 12px (já era o
padrão do Table), Gray 600, **Semibold** (testado contra Medium, Semibold leu melhor em
caixa alta/12px). Ícone de ordenação Gray 500. Linhas/bordas reaproveitam os MESMOS
valores da `tablealt` (White/Gray 50, Gray 200). Linhas mais compactas: `.th`/`.td` têm
`height` FIXO no Table.module.css (não só padding) — os dois precisaram ser reduzidos
juntos (37→32px/52→44px), só reduzir o padding não teria efeito algum.

**Bug real encontrado montando as larguras de coluna sem scroll horizontal:** a coluna
Ações em `%` (11% do total) ficava mais ESTREITA que o conteúdo real precisa — 3
`actionBtn` de 32px + 2 gaps de 4px + padding do `.cellActions` ≈ 112px, medido via
`getBoundingClientRect()`, contra ~105px alocados — o excedente (`.tableWrap.scrollWidth
> .clientWidth`) forçava a scrollbar horizontal que esta variante deveria eliminar.
**Lição: colunas com conteúdo de tamanho FIXO conhecido (ícones, botões) devem usar
`width` em `px`, nunca `%`, mesmo dentro de `table-layout:fixed` — só colunas de texto
variável (Nome, Cidade, Contato etc.) se beneficiam de `%`.** Mesmo ajuste já tinha sido
feito na variante `tablealt` (round anterior); ambas agora usam Ações em px fixo.

**Paginação nova (10 registros/página), só nesta variante:** composição própria a partir
de tokens (sem componente `Pagination` dedicado no Storybook ainda — mesmo raciocínio já
documentado pro Popover+calendário/OTP/step indicator), classes `.cad-pagination-*` em
page-cadastros.css. Botão de página ativa reaproveita o MESMO tratamento visual do dia
selecionado no calendário de "Data de cadastro" (fundo `--color-action-primary`, texto
`--color-text-inverse`); anterior/próxima reaproveitam `actionBtn` do Table. Implementado
em `cadastros.js` separando duas responsabilidades sobre o mesmo `row.hidden`: uma classe
nova `.is-filtered-out` marca "não bate com o filtro" (nunca aparece, em nenhuma página);
`applyPagination()` decide, só entre as linhas QUE batem, quais estão dentro da janela da
página atual. `state.page` reseta pra 1 ao mudar busca/aba/situação/período — NÃO ao
ordenar coluna nem excluir um cadastro (mantém a posição do usuário). `renderCards()` (a
visão mobile) não precisou de nenhuma mudança: já lê só `!row.hidden`, que passou a
refletir filtro+paginação juntos automaticamente.

**Nota de teste:** o dataset fictício de 12 linhas nunca ultrapassa 10 dentro de uma única
Situação (8 ativas / 2 inativas / 2 excluídas), então pra confirmar de verdade a navegação
entre 2+ páginas foi preciso reduzir `PAGE_SIZE` temporariamente durante o teste (revertido
pra 10 depois) — sem isso, só dava pra ver a paginação em "1 página", sem exercitar
próxima/anterior/clique direto de fato.

**Atualização (2026-07-24, round de fechamento): `tablealt` foi descartada e removida do
protótipo** (CSS/JS/variante de nav deletados) — `.table-variant-compact` (a "terceira opção"
acima) é a única versão da tabela daqui em diante. Ver seção "Tabela (Cadastro): versão final
definitiva" mais abaixo pra larguras de coluna atualizadas e o motivo (Contato virou só
telefone, Código ganhou mais respiro contra o ícone de ordenação).

**Bug corrigido na fonte (2026-07-22):** `.title`/`.subtitle` usavam `var(--font-display)` e
`var(--font-weight-semibold)` — nenhum dos dois existe em `tokens.css` (só `--font-heading`/
`--font-body` e pesos `light/regular/medium/bold`), então caíam pro valor inicial do navegador
em vez de herdar a tipografia do design system. Corrigido pra `var(--font-heading)` +
`var(--font-weight-medium)` (mesmo par já usado em todo título de card/h1 do restante do app).
Como o Table nunca tinha sido usado fora do Storybook até agora, ninguém tinha notado
visualmente.

### Dropdown ✅ (primeiro uso real: filtros do Dashboard, 2026-07-22)
**CSS:** `../../Storybook-Nivelo/src/components/Dropdown/Dropdown.module.css`

```html
<div class="wrapper [pageSpecificClass]" data-dropdown>
  <span class="label">Rótulo</span>
  <button type="button" class="trigger" data-dropdown-trigger>
    <span class="[placeholder]" data-dropdown-value>Texto atual</span>
    <span class="chevron"><i data-lucide="chevron-down" width="16" height="16"></i></span>
  </button>
  <div class="menu" data-dropdown-menu>
    <div class="option [selected]" data-value="...">Opção</div>
  </div>
</div>
```
Classes: `wrapper` (raiz, alterna `open` pra mostrar o menu), `label`, `trigger`/`chevron`
(gira 180° quando aberto), `placeholder` (cor apagada quando nada selecionado ainda), `menu`
(`position:absolute`, só relevante dentro de um `wrapper` com `position:relative` — já vem
disso), `option`/`.selected`. Sem estado embutido em HTML estático: `data-dropdown`/
`data-dropdown-trigger`/`data-dropdown-value`/`data-dropdown-menu` são hooks pro JS
(`initDropdown()` em `dashboard.js`) alternar `open` no clique, marcar `.selected` na opção
escolhida e fechar ao clicar fora/Esc — mesmo padrão dos outros componentes sem estado embutido
neste protótipo (Dialog, Button sem loading, etc).

**Conferido, sem colisão real com o Input:** `.wrapper`/`.label`/`.errorText`/`.msgIcon` existem
nos dois `.module.css`, mas com regras idênticas ou compatíveis (mesmo `display:flex;flex-
direction:column` etc.) — os dois arquivos podem ser carregados juntos sem override nenhum,
diferente da colisão real Input×Checkbox documentada acima. Confirmado lendo os dois arquivos
lado a lado antes de usar (regra geral desta seção).

**Bug corrigido na fonte (2026-07-22):** `.open .trigger` usava
`box-shadow: 0 0 0 3px rgba(142, 68, 70, 0.18)` — o MESMO marrom/vinho residual de outro design
system já corrigido no Input em 2026-07-20 (ver seção Input acima), só que ninguém tinha
notado essa cópia no Dropdown porque também nunca tinha sido usado fora do Storybook. Corrigido
pra `rgba(23, 82, 176, 0.18)` (brand-500), igual ao Input/Checkbox/demais focus rings do
sistema.

**Bug corrigido na fonte (2026-07-24): `.trigger` sem altura fixa, ficava mais baixo que
o `.input` do Input quando os dois aparecem lado a lado.** `.trigger` só tinha padding
(`--spacing-sm`/`--spacing-md`), sem `height` — a altura real dependia de padding+
line-height do texto, resultando em algo menor que os 44px fixos do `.input`. Sintoma
relatado no formulário de Novo cadastro: Placa (Input) e UF (Dropdown) lado a lado no
mesmo grid row com `align-items:end` tinham os TOPOS desalinhados mesmo com os fundos
alinhados ("não parecem estar no mesmo eixo"). Corrigido com `height:44px` explícito em
`.trigger`, igual ao Input — vale pra todo par Input+Dropdown lado a lado no sistema, não
só esse caso.

### Popover de período personalizado + Calendário (composição própria, sem componente
dedicado — primeiro uso: filtro de Período do Dashboard, 2026-07-22)

Sem `Popover`/`Calendar`/`DatePicker` no Storybook ainda. Dois padrões compostos a partir de
tokens + do que já existe:

**"Popover" flutuante:** mesma linguagem visual já usada duas vezes neste sistema (Popover da
Sidebar retraída, tooltip compartilhado) — `background:var(--color-bg-surface)`,
`border:1px solid var(--color-border-subtle)`, `border-radius:var(--radius-md)`,
`box-shadow:var(--shadow-lg)`, `position:fixed` com `top`/`left`/`width` calculados via JS
(`getBoundingClientRect()` do filtro), nunca no fluxo normal do documento — por isso nunca
empurra/altera o cabeçalho ou o resto do layout, só sobrepõe. Fecha ao Esc, ao clicar fora
(listener em `document` só anexado via `setTimeout(...,0)` DEPOIS do clique que abriu o
Popover — anexar na hora faria o próprio clique de abertura já disparar o fechamento) e ao
clicar em "Cancelar" (sem aplicar nada). Só aplica no clique em "Aplicar".

**Calendário:** grid de 7 colunas (`dash-calendar-grid`), botões redondos
(`border-radius:var(--radius-full)`) por dia, navegação de mês reaproveitando o `actionBtn` do
Table (ícone pequeno, hover `bg-subtle`, mesmo tratamento de botão-ícone já usado nas ações de
linha da Table). Intervalo (range): extremos (`is-start`/`is-end`) com fundo
`--color-action-primary` + texto invertido; dias entre os extremos (`is-in-range`) com um tom
mais claro (`--color-bg-brand`) e cantos menos arredondados (`--radius-xs`, não `full`) pra ler
como uma barra conectada em vez de bolinhas soltas — só os extremos precisam se destacar como
"pontas", o meio é só preenchimento.

**Sincronização com os campos De/Até:** os dois `<input type="date">` (reaproveitando
`Input.module.css`) e o calendário compartilham o mesmo estado (`draft.start`/`draft.end`) —
clicar num dia atualiza os inputs, digitar num input atualiza o calendário (`change` event,
`renderCalendar()`). Escolher uma data ANTES do início já escolhido reorganiza automaticamente
(a mais antiga vira início, a mais nova vira fim) — mesma lógica que qualquer date-range picker
padrão do mercado.

### DatePicker — padrão OFICIAL único de calendário do sistema (2026-08-04)

**Implementação única, compartilhada:** `app/shared/date-picker.js` — `window.NiveloDatePicker.
initDay(opts)`/`.initMonth(opts)`. Antes desta rodada, cada tela reimplementava sua própria cópia
(mesmo algoritmo, nomes de classe/função diferentes por arquivo): `novo-estoque.js` e
`produtos.js` tinham cada uma sua cópia do calendário de dia único; `nova-conta-pagar.js` e
`novo-lancamento-caixa.js` tinham cada uma sua cópia do seletor de mês (com prefixos de classe
`ncp-`/`nlc-` diferentes). Consolidado numa implementação só — **nenhuma tela nova deve copiar
este código, só chamar uma das 2 funções**.

- **`initDay(opts)`** — dia único, grade de 7 dias, navegação mês a mês. Padrão pra qualquer
  campo que precise escolher uma DATA (ex.: "Data prevista de entrega" em Novo registo de
  estoque, "Atualizado a partir de" em Produtos). `opts`: `{rootId, triggerId, valueId,
  popoverId, hiddenInputId?, clearId?, placeholder?, formatValue?(date), onChange?(isoOrNull)}`.
  Retorna `{getValue(), setValue(iso), setReadonly(bool)}`.
- **`initMonth(opts)`** — mês/ano, grade de 12 meses, navegação por ANO (nunca mês a mês, decisão
  explícita pra esse padrão). Padrão pra qualquer campo que só precise escolher um MÊS (ex.:
  "Competência" em Caixa/Contas a Pagar/Contas a Receber). `opts`: `{rootId, triggerId, valueId,
  popoverId, clearId?, placeholder?, onChange?(aaaaMmOrNull)}`. Retorna `{getValue(), setValue
  (aaaaMm), setReadonly(bool)}`. Valor sempre no formato `'AAAA-MM'`.
- **CSS promovido pro Storybook de verdade**: `Storybook-Nivelo/.../DatePicker/
  DatePicker.module.css` ganhou as classes do modo mês (`dpTriggerRow`/`dpClearBtn`/
  `dpMonthGrid`/`dpMonth`/`dpMonthSelected`) e o guard `.dpRoot.is-readonly` — nenhuma classe
  `ncp-*`/`nlc-*`/`prod-*` de calendário sobrevive em CSS de página, tudo migrado pro componente.
  `DatePicker.tsx` (React) continua só modo dia (single/range); o modo mês não foi portado pro
  componente React nesta rodada (as telas HTML consomem só o `.module.css`+`date-picker.js`,
  igual a todo o resto do sistema — nenhuma tela importa o `.tsx`).
- **HTML das telas que usam o padrão** deve usar SÓ as classes genéricas do componente (dpRoot/
  dpTrigger/dpTriggerRow/dpClearBtn/dpPopover/dpCalendarHeader/dpNavBtn/dpCalendarLabel/
  dpWeekdays/dpGrid/dpDay/dpDayEmpty/dpDaySelected/dpMonthGrid/dpMonth/dpMonthSelected) — nunca
  uma classe prefixada por tela (`xyz-competencia-*`) pra essa parte do markup.
- **Script tag**: `<script src="../shared/date-picker.js"></script>` sempre ANTES do script da
  própria tela (que chama `window.NiveloDatePicker.initDay/initMonth` no load).
- **Sites migrados (rollout completo, 2026-08-04):** todo campo de data/mês único do sistema
  passou a chamar este módulo — nenhum `<input type="date">`/`<input type="month">` nativo
  restante em formulário de criação/edição ou modal de ação. Dia único: `novo-estoque.js`
  ("Data prevista de entrega", "Data do registo"), `produtos.js` ("Atualizado a partir de"),
  `nova-conta-pagar.js`/`nova-conta-receber.js` ("Vencimento"/"Data de Emissão"),
  `novo-lancamento-caixa.js` ("Data"), `contas-a-pagar.js`/`detalhe-conta-pagar.js`
  ("Data do pagamento"), `contas-a-receber.js`/`detalhe-conta-receber.js`
  ("Data do recebimento"), `estoque.js`/`detalhe-estoque.js` ("Data da saída"/"Data do
  consumo"/"Data do abatimento"), `estoque.js` ("Vencimento" no modal Criar conta a receber),
  `novo-estoque.js` ("Vencimento" no modal Criar conta a pagar), `balancete.js` ("Data
  inicial"/"Data final"). Mês: `nova-conta-pagar.js`/`novo-lancamento-caixa.js`
  ("Competência"), `balancete.js` ("Mês/Ano"). Qualquer campo novo de data/mês em telas futuras
  deve chamar este módulo, nunca reimplementar — inclusive substituir um `<input type="date">`
  nativo simples, não só os campos que já tinham um calendário customizado antes.
- **Fora de escopo desta padronização**: os 3 pickers de INTERVALO de dias (Dashboard "Período
  personalizado", Notas Fiscais e Caixa, seção "Filtros por Período") — são um 3º padrão
  diferente (range, não single/mês), com vocabulário de classe próprio (`dash-calendar-day`),
  não tocado nesta rodada por não ter sido pedido.

**Bug real encontrado depois de publicado (2026-07-22): o Popover fechava sozinho a cada dia
clicado no calendário.** Causa: `pickDate()` chama `renderCalendar()`, que substitui
`calGrid.innerHTML` — isso desconecta o `<button>` clicado do documento ainda durante a fase de
bubble do MESMO evento de clique. Quando esse clique chegava no listener de "clicou fora"
(`document.addEventListener('click', ...)`), `event.target` já era um nó órfão, e
`periodPopoverEl.contains(nóÓrfão)` sempre retorna `false` — fechando o Popover por engano a
cada data escolhida. Fix: trocar `.contains(event.target)` por
`event.composedPath().indexOf(periodPopoverEl) === -1` — `composedPath()` guarda o caminho de
propagação de quando o evento foi disparado (com o nó ainda conectado), então continua correto
mesmo que um handler no meio do caminho desconecte o alvo original depois. **Lição: qualquer
handler de "clicou fora" que compara `event.target` contra `.contains()` é frágil se QUALQUER
listener no caminho de bubble puder substituir/remover o próprio alvo do clique (ex.: um
`innerHTML =` que regenera a lista clicada) — prefira `event.composedPath()` sempre que o alvo
do clique pode deixar de existir/ficar desconectado durante o mesmo evento.**

**Bug real encontrado na verificação (terceira vez neste projeto, mesmo padrão):**
`.dash-period-popover{display:flex}` sem guarda `:not([hidden])` derrotava o atributo `hidden`
de novo — igual ao `.dash-empty` (Dashboard round 1) e ao `.dash-filter-range` (Dashboard round
2, já removido). O Popover ficava visualmente aberto o tempo todo, mesmo com `.hidden===true`
via JS — só percebido comparando o property `hidden` (dizia `true`) contra
`getComputedStyle(el).display` (dizia `flex`), não apenas confiando na leitura do property.
Fixado com `.dash-period-popover:not([hidden])`. **Este bug já aconteceu 3 vezes no mesmo
projeto — vale checklist mental fixo: toda vez que um elemento novo usa o atributo `hidden`
pra estado padrão-escondido, sua regra de `display` (quando visível) PRECISA estar atrás de
`:not([hidden])`, nunca solta na classe base.**

**Bug real, `.menu` cortado por `overflow:hidden` de um `.card` ancestral (2026-07-24):**
`.menu` é `position:absolute` relativo ao `.wrapper` — qualquer campo perto do fim de um
`.card` (Table.module.css, `overflow:hidden`) tem o menu cortado pela borda arredondada
(achado no dropdown "Tipo de pessoa" de Novo Cadastro, mas o bug é genérico: afeta
QUALQUER Dropdown perto da borda de QUALQUER card). **Fix aplicado só na camada JS de cada
tela (`initDropdown()` em `novo-cadastro.js`/`cadastros.js`/`dashboard.js`), não em
`Dropdown.module.css`/`Dropdown.tsx`:** ao abrir, calcula `trigger.getBoundingClientRect()`
e seta inline `menu.style.position='fixed'` + `top`/`left`/`width`/`maxHeight` (abre pra
cima quando não há espaço suficiente abaixo, `maxHeight` sempre recalculado pro espaço real
disponível, nunca corta a caixa) — mesma técnica já usada no Popover/tooltip da Sidebar.
Fecha ao rolar a página/redimensionar (evita posição desatualizada). **Por que não editar
o `.module.css` do componente:** `Dropdown.tsx` (React) não tem NENHUMA lógica de
posicionamento própria, depende 100% do CSS `position:absolute` — mudar isso no
`.module.css` quebraria o componente real no Storybook (menu abriria sem coordenadas,
grudado em `top:0;left:0` da viewport). O fix via `style` inline, aplicado só pelas
telas estáticas, não toca o componente nem seu comportamento no Storybook.

**Regra a partir de agora: `.trigger` tem `height:44px` fixo (adicionado 2026-07-24, ver
seção Dropdown acima)** — qualquer tela que precise de um Dropdown mais compacto (ex.:
filtros do Cadastro, ver `.cad-dropdown .trigger{height:28px}` em page-cadastros.css)
precisa declarar sua PRÓPRIA altura explícita por cima, não assumir que o padrão do
componente ainda vai ficar pequeno.

**4ª e 5ª ocorrências (Cadastro, round 2/3 de ajustes, 2026-07-22):** `Dialog.module.css`'s
`.overlay` (`display:flex` incondicional) e `Table.module.css`'s `.actionBtn`
(`display:inline-flex` incondicional, reaproveitado como botão de "limpar período") — ambos
sem `:not([hidden])`. O padrão se repete porque os componentes React nunca dependem do atributo
`hidden` (resolvem com `if (!open) return null` ou simplesmente não renderizam o elemento);
o bug só aparece quando um `.module.css` do Storybook é reaproveitado num elemento HTML
estático controlado por `hidden`. Fix sempre no CSS DA PÁGINA (`.overlay[hidden]{display:none}`,
`.cad-filter-clear[hidden]{display:none}`), nunca editando o `.module.css` do componente.

### Feedback ✅
**CSS:** `../../Storybook-Nivelo/src/components/Feedback/Feedback.module.css`

Banner de alerta (não é erro inline de campo — para isso use o `error` do Input):
```html
<div class="alert [success|error|warning|info]" role="alert">
  <span class="icon"><!-- ícone --></span>
  <div class="body">
    <div class="title">Título opcional</div>
    <div class="message">Mensagem</div>
  </div>
  <button class="dismiss"><!-- ícone x --></button>   <!-- opcional -->
</div>
```
**Também serve de Toast**: não existe componente de Toast dedicado no Storybook — o fluxo de
"Criar nova senha" reaproveita o mesmo `.alert.success` posicionado fixo no topo da tela
(`.dashboard-toast-region`, ver `page-dashboard.css`), com only CSS de posição/animação
próprios da página. `.dismiss` já vem estilizado no Feedback, só falta o ícone (`x`) e o
listener de clique.

### Tab ✅ (primeiro uso real: Cadastro de pessoas e empresas, 2026-07-22)
**CSS:** `../../Storybook-Nivelo/src/components/Tab/Tab.module.css`

```html
<div class="wrapper">
  <div class="list" role="tablist">
    <button type="button" role="tab" aria-selected="true" class="tab active" data-tab="...">Todos</button>
    <button type="button" role="tab" aria-selected="false" class="tab" data-tab="...">Cliente</button>
  </div>
</div>
```
Classes: `wrapper`, `list` (`role="tablist"`, `overflow-x:auto` — rola horizontalmente sozinho
no mobile se as abas não couberem, sem precisar de nenhum CSS extra), `tab`/`.active` (borda
inferior azul + cor de destaque). O componente React usa um `panel` interno pra alternar o
conteúdo de cada aba, mas aqui as abas só filtram linhas de uma tabela já renderizada (não têm
conteúdo próprio pra trocar) — JS alterna `active`/`aria-selected` no clique e re-filtra a
tabela, sem usar a classe `panel`.

**Bug real corrigido NA FONTE (2026-07-23): a borda azul da aba ativa quase não aparecia**
(usuário reportou "a tab não parece estar correta"). Causa: `.list{overflow-x:auto}` força o
navegador a computar `overflow-y` como `auto` também (regra do próprio CSS — um eixo
non-visible força o outro a deixar de ser `visible`), e o layout flex calcula a altura da
linha pela MARGIN-BOX dos itens — `.tab{margin-bottom:-1px}` (truque pra sobrepor a borda do
item ativo na borda cinza do `.list`) reduz essa margin-box em 1px, deixando a altura
calculada 1px MENOR que a border-box de fato pintada (que inclui os 2px de
`border-bottom`). Resultado: `overflow-y:auto` corta esse 1px que "vaza", sumindo com quase
toda a borda de 2px do item ativo (sobrava ~0,2px visível, confirmado via
`list.scrollHeight > list.clientHeight`). **Isso afeta QUALQUER uso do componente Tab, não só
quando as abas de fato transbordam horizontalmente** — o corte acontece só de `overflow-x:auto`
estar declarado, mesmo com poucas abas cabendo inteiras (era o caso do Cadastro, 4 abas, sem
overflow real). Corrigido com `padding-bottom: 1px` em `.list` (compensa exatamente o
shortfall, `scrollHeight` volta a bater com `clientHeight`). **Lição: `overflow-x:auto` +
qualquer filho com margin negativo que "vaze" da caixa de conteúdo é uma combinação arriscada —
confirme com `element.scrollHeight > element.clientHeight` (não só visualmente) sempre que
usar as duas coisas juntas.**

**Ajustes na fonte (2026-07-24, pedido do usuário na tela de Cadastro):** `.active` ganhou
`font-weight:var(--font-weight-bold)` (reforça visualmente a aba selecionada, antes só
tinha a cor de marca). E um bug real de especificidade: `.tab:hover{color:text-primary}`
(2 partes: classe + pseudo-classe) é MAIS específico que `.active` sozinho (1 classe) —
sem um seletor dedicado, passar o mouse sobre a aba JÁ ATIVA trocava a cor de marca por
`--color-text-primary` (quase preto), contrariando a regra do Design System de nunca usar
preto pra estado de interação. Corrigido com `.tab.active:hover` (3 partes, vence os
dois) usando `--color-action-primary-hover` (brand mais escuro, o mesmo token já usado em
`.cellLink:hover` do Table e no hover dos dias do calendário) em vez de preto.

### Tooltip ✅ (primeiro uso REAL do hover/`:focus-within` nativo do componente: Novo cadastro, 2026-07-24)

**CSS:** `../../Storybook-Nivelo/src/components/Tooltip/Tooltip.module.css`

```html
<span class="wrapper [2ª classe pra vencer colisão]" tabindex="0">
  <i data-lucide="info" width="14" height="14"></i>
  <span class="tip text-body-xs top">
    <span class="arrow"></span>
    Texto do tooltip
  </span>
</span>
```
Classes: `wrapper` (`position:relative;display:inline-flex`), `tip`/`.top`/`.bottom`/`.left`/
`.right` (posição relativa ao `wrapper`), `arrow`. Abre via CSS puro
(`.wrapper:hover .tip, .wrapper:focus-within .tip { opacity:1 }`), sem nenhum JS — a Sidebar já
usava um tooltip antes, mas com uma composição PRÓPRIA (`position:fixed` calculado via JS,
necessário só lá por causa do `overflow-x:hidden` da Sidebar); aqui é o componente REAL,
primeira vez usado como projetado (hover simples, sem ancestral cortando o overflow).

**`.wrapper` colide com Input/Dropdown (ambos também usam essa classe)** — sempre usar uma 2ª
classe (`class="wrapper minha-classe"`) + seletor composto restaurando
`display:inline-flex;position:relative` (Input/Dropdown usam `display:flex;flex-direction:
column`, que quebraria o ícone pra baixo do texto do tooltip em vez de ficar ao lado). Ver
`.wrapper.novo-cadastro-tooltip` em `page-novo-cadastro.css`.

**Pegadinha de depuração encontrada durante a verificação (NÃO é um bug, registrar pra não
perder tempo de novo):** ao testar `:hover`/`:focus-within` via `element.focus()` + `getComputed
Style` neste ambiente de teste (Browser pane do agente), a opacidade do `.tip` sempre voltava
`0`, mesmo com `element.matches(':focus-within')` confirmando `true` e mesmo forçando um
seletor por ID com `!important` (especificidade máxima) — a causa raiz não era CSS: 
`document.hidden`/`document.visibilityState` reportavam `true`/`"hidden"` porque o Browser pane
não estava efetivamente exibido/composto no momento do teste (mesma limitação já documentada
pra `requestAnimationFrame` em abas não "fronted", ver [[prototype_navigator]]) — o motor de
estilos deste navegador não recalcula estados de `:hover`/`:focus-within` numa aba oculta, então
`getComputedStyle` nunca reflete a mudança ali, independente de quão correto o CSS esteja.
**Validado como correto por 3 vias independentes que NÃO dependem de compositing**: (1)
`element.matches(seletor)` confirma o match lógico, (2) cálculo manual de especificidade CSS
confirma que a regra `.wrapper:focus-within .tip` (3 "classes") vence a base `.tip` (1 classe),
(3) um elemento novo/idêntico criado do zero e anexado ao `<body>` (fora do contexto de teste)
computou corretamente. **Lição: se `getComputedStyle` não reflete uma mudança de estado
`:hover`/`:focus`/`:focus-within` mesmo com `matches()` confirmando `true`, suspeitar primeiro de
`document.hidden` (Browser pane não exibido) antes de mexer no CSS.**

**Achado colateral, não é bug:** `getComputedStyle` também reportou `display:flex` em vez do
`inline-flex` declarado quando o wrapper do tooltip é filho de um container `display:flex`
(`.novo-cadastro-code-help`) — isso é "blockification" real e documentada da spec CSS Display
(todo item de flex/grid tem seu `display` externo "blockificado": `inline-flex`→`flex`,
`inline-block`→`block` etc.) quando o próprio elemento é item de um flex/grid pai. Não afeta o
layout interno do tooltip (o wrapper continua formando uma linha flex com ícone+tip do mesmo
jeito) — só o VALOR COMPUTADO reportado por `getComputedStyle` muda, o comportamento visual não.

**⚠️ Dois bugs reais encontrados depois de publicado (2026-07-24), ambos levaram a
ABANDONAR o mecanismo CSS puro (`:hover`/`:focus-within` + `position:absolute`) do
Tooltip real nos 3 usos desta tela (ícone de info, campo Código inteiro, remover
veículo) em favor de JS (`initFixedTooltip()` em novo-cadastro.js):**

1. **Duas tooltips abrindo ao mesmo tempo.** Os dois triggers do campo Código (ícone +
   campo inteiro) são descendentes do MESMO `.wrapper` — o wrapper do próprio Input
   (`#code-field`). `.wrapper:hover .tip` (regra do Tooltip.module.css) é uma regra
   AMBIENTE: dispara pra QUALQUER `.tip` descendente de QUALQUER ancestral com classe
   `.wrapper` em hover, não só o `.tip` do elemento especificamente sob o cursor. Como
   `#code-field` é `.wrapper` (do Input) E ancestral dos dois `.tip`, passar o mouse em
   QUALQUER lugar do campo (input, label, ícone) já bastava pra mostrar os DOIS balões.
2. **Cortada pelo `overflow:hidden` de `.card`** — mesmo bug do Dropdown acima, agora no
   tooltip de remover veículo (perto do topo de um `.novo-cadastro-vehicle`, também
   `.card`).

**Fix:** os 3 triggers passaram a controlar `.tip` via `style.opacity` inline em
`mouseenter`/`mouseleave`/`focus`/`blur` (inline sempre vence CSS sem `!important`,
então a visibilidade fica 100% sob controle do JS, nunca da regra ambiente) +
`position:fixed` calculado via `getBoundingClientRect()` do trigger (escapa do
`overflow:hidden`, mesma técnica do Dropdown/Popover/Sidebar). Pra garantir que a regra
antiga do Tooltip.module.css nunca mais interfira nesses 2 tips específicos, adicionado
`#code-field .tip{opacity:0}` (ID vence contra as 3 classes de `.wrapper:hover .tip` sem
precisar de `!important`). Os triggers PERDERAM as classes `wrapper`/`novo-cadastro-
tooltip` (não precisam mais de `position:relative` como contexto de posicionamento, já
que o `.tip` não é mais posicionado relativo a eles) — só mantiveram classes decorativas
próprias (`novo-cadastro-tooltip-info`, `novo-cadastro-code-input-tooltip`,
`novo-cadastro-remove-vehicle-tooltip`).

**Lição geral: sempre que 2+ tooltips reais (`.wrapper`/`.tip` do Tooltip.module.css)
puderem ficar aninhados dentro de um ancestral comum que TAMBÉM tem classe `.wrapper`
(Input/Dropdown, extremamente comum neste app), a regra `.wrapper:hover .tip` do
componente vai vazar entre eles — não é uma composição segura por padrão. Preferir o
mecanismo JS (`position:fixed` + `style.opacity` inline) sempre que isso puder acontecer,
não só quando o overflow de um card for a preocupação inicial.**

### Popover "Data de cadastro" + Calendário (segundo uso da composição, ver seção
"Popover de período personalizado + Calendário" acima)

Mesma composição (Popover flutuante + calendário próprio, sem componente dedicado no
Storybook), reaproveitada no filtro "Data de cadastro" da tela de Cadastro — classes com
prefixo `cad-` em vez de `dash-` (`cad-period-popover`, `cad-calendar-*`), CÓPIA deliberada em
`page-cadastros.css`/`cadastros.js`, não um arquivo compartilhado com o Dashboard (mantém as
duas telas independentes; ver nota no topo de `page-cadastros.css`). Aqui o trigger é só um
botão com a cara de um Dropdown (`.trigger`/`.chevron`, sem `.menu`) que abre o Popover direto
— não existe uma lista de opções antes, "Data de cadastro" É sempre um filtro de intervalo.

### Ordenação de colunas (Table) — `.sortable`/`.thInner`/`.sortIcon`
`Table.module.css` já vem com um padrão de ordenação pronto (usado pelo componente React em
`col.sortable`), só nunca tinha sido usado numa tela estática antes de Cadastro (2026-07-22):

```html
<th class="th sortable" data-sort-key="nome" aria-sort="none">
  <span class="thInner">Nome
    <span class="sortIcon" data-sort-icon aria-hidden="true">
      <i data-lucide="chevrons-up-down" width="12" height="12"></i>
    </span>
  </span>
</th>
```
Ícone alterna entre `chevrons-up-down` (neutro), `chevron-up` (asc) e `chevron-down` (desc) —
mesmos três ícones que o componente React usa (`ChevronsUpDown`/`ChevronUp`/`ChevronDown`).
Um único listener de clique no `<tr class="headerRow">` (delegação) alterna `state.sortKey`/
`state.sortDir`, atualiza os ícones/`aria-sort` e reordena as linhas do `<tbody>` de verdade via
`tbody.appendChild(row)` (não é só cosmético). Só ganham essa classe as colunas onde ordenar
faz sentido — nem toda coluna precisa entrar.

### Dialog ✅ (segundo uso: Modal de exclusão em Cadastro, 2026-07-22 — primeiro uso foi o
Modal de Termos em `cadastro-planos.html`)
**CSS:** `../../Storybook-Nivelo/src/components/Dialog/Dialog.module.css`

```html
<div class="overlay" id="..." hidden>
  <div class="dialog sm" role="dialog" aria-modal="true" aria-labelledby="...">
    <div class="header">
      <h2 class="title" id="...">Título</h2>
      <button class="closeBtn" aria-label="Fechar"><i data-lucide="x" width="18" height="18"></i></button>
    </div>
    <div class="body"><p>Corpo.</p></div>
    <div class="footer">
      <button type="button" class="btn secondaryGray">Cancelar</button>
      <button type="button" class="btn destructive">Ação destrutiva</button>
    </div>
  </div>
</div>
```
**`.secondaryGray` (Button.module.css, adicionado 2026-07-29) é o padrão pro Cancelar de
qualquer modal destrutivo** — outline Gray 700 em vez do azul padrão de `.secondary`, pra não
competir visualmente com o `.destructive` ao lado. Usar sempre que o modal tiver uma ação
destrutiva como confirmação (mesmo visual já usado no modal "Excluir cadastro" de Cadastro).
**Mesmo bug de `hidden`+`display` documentado no topo deste arquivo, 4ª ocorrência:**
`.overlay` do `Dialog.module.css` define `display:flex` incondicional (o componente React
resolve isso com `if (!open) return null`, nunca precisa do atributo `hidden`) — em HTML
estático controlado por `hidden`, essa regra vence `[hidden]{display:none}` por especificidade
igual (CSS de autor ganha da UA stylesheet). Sempre que reaproveitar este Dialog em HTML
estático, adicionar `.overlay[hidden] { display: none; }` na CSS da própria tela (já existe em
`page-cadastro.css` e agora também em `page-cadastros.css`) — não editar o `Dialog.module.css`
do Storybook, o bug só aparece nesse contexto de HTML estático.
Modal centralizado de verdade (`position:fixed; inset:0` + `display:flex;align-items:center`
no `.overlay`) — nunca usar essa composição pra confirmar ações que a Design deveria mostrar
como drawer/popover lateral; Dialog é sempre centralizado.

**⚠️ Checklist: rodapé (`.footer`) com 2+ botões pode vazar/overflow — 2ª ocorrência
(round 3 Cadastro: "Cancelar"+"Excluir cadastro"; round 4 Dashboard: "Falar com
administrador"+"Realizar pagamento").** O `.footer` do Dialog usa `justify-content:flex-end`
sem `flex-wrap`; se a largura combinada dos botões (+ gap) passar da largura útil do
`.dialog` (descontado o padding), o conteúdo "vaza" pela margem ESQUERDA — os botões ficam
fora da área de conteúdo, mesmo alinhados à direita corretamente no fim. Sempre conferir com
`getBoundingClientRect()` nos dois extremos (não só olhar visualmente), tanto no mobile
quanto no desktop — o bug independe de viewport, é sobre a largura FIXA do `.dialog` (`sm`
360px / `md` 540px). Duas saídas, escolher pelo caso: (1) encurtar um rótulo redundante (ex.:
"Excluir cadastro" → "Excluir", quando o título do modal já deixa claro do que se trata); (2)
quando os rótulos são importantes e não dá pra encurtar, trocar `sm`→`md` (mais espaço) e/ou
empilhar os botões em largura total abaixo de ~480px (`flex-direction:column` + `.btn{width:
100%}`, escopado à tela, nunca no `Dialog.module.css` genérico).

---

### Avatar ✅ (novo componente, 2026-08-03 — primeiro uso: Canal de Ideias)
**CSS:** `../../Storybook-Nivelo/src/components/Avatar/Avatar.module.css`

```html
<!-- círculo de iniciais (sem imagem) -->
<span class="avatar initials sm" data-color="brand" role="img" aria-label="Nome do autor">RA</span>

<!-- com imagem real -->
<img class="avatar md" src="..." alt="Nome do autor" />
```
Classes: `avatar` (base), `sm`/`md`/`lg` (24/32/48px — **sempre em par com `.avatar`**, ver nota
de colisão abaixo), `initials` (só quando não há imagem, precisa do texto das iniciais como
conteúdo do elemento). `data-color` (`brand`/`green`/`orange`/`violet`/`pink`/`indigo`) escolhe o
par bg/fg — nunca uma cor solta. O componente React (`Avatar.tsx`) deriva a cor automaticamente
via `pickAvatarColor(name)` (hash simples do texto, sempre a mesma cor pro mesmo nome) quando
`color` não é passado; em HTML estático (`app/screens/*.html`), essa função precisa ser
replicada em JS puro por tela (mesmo princípio já documentado pra `initDropdown()` — o `.tsx`
nunca roda de verdade fora do Storybook), ver `canal-ideias.js`/`ideia-detalhe.js`.

**⚠️ Decisão de especificidade tomada já na criação (evitou uma colisão, não corrigiu uma):**
`Button.module.css` declara `.sm`/`.lg` soltos (1 classe) pro próprio `<button class="btn sm">`
— um `.sm`/`.md`/`.lg` igualmente solto aqui vazaria padding/border-radius de botão pro círculo
do avatar sempre que as duas folhas de estilo carregassem juntas (o caso comum: qualquer tela
com avatar quase certamente tem um Button perto). Por isso os modificadores de tamanho SEMPRE
usam seletor composto (`.avatar.sm`, não `.sm`) — mesma lição já registrada na seção de
colisões no topo deste arquivo, aplicada preventivamente em vez de reativamente.

### Chip ✅ (novo componente, 2026-08-03 — primeiro uso: categorias do Canal de Ideias)
**CSS:** `../../Storybook-Nivelo/src/components/Chip/Chip.module.css`

```html
<div class="row" id="chip-row">
  <button type="button" class="chip selected" data-categoria="todas" aria-pressed="true">Todas</button>
  <button type="button" class="chip" data-categoria="financeiro" aria-pressed="false">Financeiro</button>
  <!-- ... -->
</div>
```
Classes: `chip` (pílula clicável, sempre `<button>`), `chip.selected` (preenchimento de marca,
seletor composto pelo mesmo motivo do Avatar acima), `row` (wrapper com `overflow-x:auto` sem
scrollbar visível — mesma técnica de `Tab.module.css`'s `.list`, pensado pra rolagem horizontal
no mobile quando os chips não cabem). **Não confundir com `.badge` de Table.module.css**: Chip é
sempre interativo/clicável (filtro), Badge é sempre um rótulo de leitura (nunca clicável, nunca
tem estado "selecionado"). O card de ideia do Canal de Ideias usa `.badge` pra mostrar a
categoria (informação), e Chip pra FILTRAR por categoria no feed (ação) — os dois convivem na
mesma tela com papéis diferentes.

### VoteButton ✅ (novo componente, 2026-08-03 — primeiro uso: Canal de Ideias)
**CSS:** `../../Storybook-Nivelo/src/components/VoteButton/VoteButton.module.css`

```html
<button type="button" class="voteButton sm" data-action="votar" aria-pressed="false" aria-label="Votar nesta ideia">
  <i data-lucide="chevron-up" width="16" height="16"></i>
  <span class="count">342</span>
</button>
```
Classes: `voteButton` (base), `sm`/`md` (44px/56-60px, seletor composto `.voteButton.sm` pelo
mesmo motivo do Avatar), `voted` (estado ativo — preenchimento **sutil**, `--color-bg-brand`+
borda/texto `--color-action-primary`, nunca a cor de marca sólida: pedido explícito era "chamar
atenção sem roubar o foco do conteúdo", um botão azul cheio ao lado de cada card de feed
competiria demais com título/resumo). `size="sm"` é o usado dentro do card do feed (compacto,
lado a lado com o conteúdo); `size="md"` é o usado na página de detalhe da ideia (mais espaço,
número maior). Sem estado embutido em HTML estático: `toggleVoto()` em `ideias-data.js` decide
incrementar/decrementar e persiste em `sessionStorage`, a tela só chama a função e re-renderiza
(mesmo padrão de todo componente sem estado embutido neste protótipo).

---

## Tabela → Cards no mobile (Cadastro de pessoas e empresas, 2026-07-22)

Comprimir uma tabela de 8 colunas numa tela estreita fica ilegível — no mobile, cada linha vira
um Card próprio (reaproveita `.card` do `Table.module.css`, mesmo "Card genérico" do Dashboard),
não uma tabela encolhida. Breakpoint mobile-first: por padrão mostra `.cadastros-cards` e
esconde `.tableWrap`; a partir de 768px inverte (`page-cadastros.css`).

**Fonte única de dados:** os Cards são gerados via JS (`renderCards()` em `cadastros.js`) a
partir das linhas REAIS do `<tbody>` já filtradas/ordenadas — nunca uma segunda cópia estática
do dataset. Cada `<tr>` ganha um `id` estável (`cad-row-<código>`) e cada Card carrega
`data-row-id` apontando de volta pra ele. As Ações do Card (Nota fiscal/Editar/Excluir) chamam a
MESMA função compartilhada (`handleRowAction`) usada pela tabela — clicar Excluir num Card abre
o mesmo Modal e muta a linha REAL da tabela, então depois de `applyFilters()` os Cards se
regeneram já refletindo o soft delete. Sempre que filtro/busca/ordenação/soft-delete mudar
algo, chamar `applyFilters()` — ele já dispara `sortRows()` e `renderCards()` juntos.

Reaproveitar esse mesmo padrão (Card + `data-row-id` + handler compartilhado) em qualquer tela
futura que precise de tabela-vira-card no mobile, em vez de inventar outra abordagem.

---

## Tabela (Cadastro): versão final definitiva (2026-07-24, dois rounds de fechamento)

> **ATUALIZAÇÃO (2026-07-27, round 5 do dia de Estoque):** o item abaixo ("Card de filtros
> SEPARADO do card da tabela") foi **CONSCIENTEMENTE REVERTIDO** por pedido explícito do usuário
> — o container fundido de busca/filtro+tabela (que só existia em Estoque, `.estoque-list-card`)
> virou o padrão oficial de qualquer tabela do sistema, e Cadastro foi retrofitado pra usar a
> mesma arquitetura (`.cadastros-list-card`, ver linha "Estoque"/5º round na tabela "Screens
> registered" acima). O restante desta seção (larguras de coluna, regras de quebra de linha,
> paginação, cabeçalho compacto) continua válido e inalterado — só a relação filtro↔tabela mudou.

Depois de várias rodadas de variantes visuais, o usuário fechou a tela definitivamente em dois
rounds seguidos. `.table-variant-compact` é a ÚNICA versão da tabela (cabeçalho compacto/
uppercase + paginação); todas as demais tentativas foram **removidas do protótipo**, não só
desativadas — CSS, JS e entradas de `prototype-nav` referentes a elas foram deletados.

- ~~**Card de filtros SEPARADO do card da tabela**~~ (decisão final **NAQUELA ÉPOCA**, revertendo uma tentativa
  intermediária de incorporá-los ao mesmo card — ver nota de atualização acima, essa decisão foi
  revertida de novo em 2026-07-27): `.cadastros-filter-bar` é sibling de
  `.cadastros-table-card` no HTML (Tabs → espaçamento pequeno → card de filtros → espaçamento
  pequeno → card da tabela com tabela+paginação dentro). Compacto e discreto de propósito:
  padding `8px 16px` (bem menos que o padding de um `.card` de conteúdo normal), fundo White,
  borda `--color-gray-200` (mais visível que o `--color-border-subtle`/Gray 100 padrão do `.card`
  genérico, compensando a ausência de sombra), `border-radius:var(--radius-md)` (padrão do
  sistema), **sem sombra**. `.cadastros-page{gap:var(--spacing-sm)}` (8px) cobre os dois
  espaçamentos pequenos pedidos; `.cadastros-header` ganhou `margin-bottom:var(--spacing-md)`
  pra restaurar o respiro maior que só o par header→abas tinha antes (soma 8+16=24px, igual era).
  Data de cadastro/Situação continuam sem label (só placeholder/valor selecionado, ex.
  "Selecionar período"/"Ativos") — decisão permanente de uma rodada anterior, não mudou aqui.
- **Coluna Contato removida por completo da tabela** (não é mais uma coluna, nem em % nem
  escondida) — o telefone de cada cadastro (a coluna só continha telefone desde a rodada
  anterior, nunca mais e-mail) foi migrado pro `data-record` JSON de cada linha (novo campo
  `"telefone"`), preservando o dado pra alimentar a tela de Editar sem ocupar espaço na
  listagem. Tabela final com 7 colunas: **Nome | Código | Tipo | Status | CPF/CNPJ | Cidade |
  Ações**. Larguras redistribuídas com prioridade explícita pra Nome/Tipo/CPF-CNPJ (pedido do
  usuário): Nome 24% / Código 11% / Tipo 18% / Status 10% / CPF-CNPJ 20% / Cidade 14% / Ações
  120px fixo. Código mantém `padding-right` próprio + gap maior entre texto e ícone de
  ordenação (`.th.sortable .thInner{gap:var(--spacing-sm)}`, 8px) — o mesmo fix da rodada
  anterior, ainda necessário. **Migração de dados feita via script Node** (não editando 37
  linhas manualmente): regex captura o `<td>` de Contato de cada `<tr>` (sempre o último antes de
  `<td class="td tdActions">`), injeta o valor como `telefone` no JSON de `data-record` via
  `JSON.parse`/`JSON.stringify`, remove o `<td>`. **Lição pra migrações repetitivas e regulares
  em HTML estático: preferir um script (Node/Python) a dezenas de `Edit` manuais quando o padrão
  por linha é 100% regular — mais rápido e sem risco de erro humano linha a linha.**
- Regras por coluna contra quebra de palavra ruim (Tipo `overflow-wrap:normal`, Código
  `white-space:nowrap`, CPF/CNPJ `nowrap`+`ellipsis`) mantidas, só a regra de Contato foi
  removida (não existe mais).
- **Editar cadastro:** `openEditScreen()` agora lê telefone/e-mail direto de
  `record.telefone`/`record.email` (JSON), não mais de uma célula visível da tabela — a
  derivação antiga por `indexOf('@')` (que distinguia telefone de e-mail na mesma coluna) foi
  removida, já que essa distinção não é mais necessária uma vez que os dados vêm estruturados.
- **Variante "Cadastro realizado com sucesso" (`#state=created`) voltou à lista de variantes
  navegáveis** — tinha sido removida do `prototype-nav` na rodada anterior (só a entrada de nav,
  a lógica em `cadastros.js` sempre continuou funcionando pro fluxo real de criação), o usuário
  pediu de volta como estado formal. Texto do toast ajustado pra "Cadastro realizado com
  sucesso." (era "Cadastro incluído com sucesso!"). Tabela permanece visível ao fundo (este
  estado nunca ativa `.is-demo-empty`).
- **Estado "Nenhum cadastro" (`#state=empty`):** ícone trocado de `users` pro MESMO ícone
  `folder-plus` usado no item "Cadastro" da Sidebar (pedido explícito: "mantendo exatamente o
  mesmo padrão visual do ícone usado na navegação") — reforça a identidade visual entre o item
  de navegação e o estado vazio da tela que ele leva. Resto do comportamento (card da tabela
  mantido, Search+filtros no card separado de sempre, botão "Novo cadastro" navegando pro
  formulário) sem mudança da rodada anterior.
- **Variantes finais no `prototype-nav` pra esta tela: 3** — "Cadastro realizado com sucesso"
  (`#state=created`), "Edição concluída" (`#state=edited`), "Nenhum cadastro" (`#state=empty`).
- **Variantes finais registradas em `prototype-nav`** pra esta tela (só 3, todas as demais
  tentativas de tabela/filtro removidas): estado padrão (sem hash), "Edição concluída"
  (`#state=edited`), "Nenhum cadastro" (`#state=empty`).

## Regra de conteúdo: nunca usar travessão (—/–)

Nenhuma interface, título, descrição, mensagem, modal ou componente do protótipo deve usar
`—`/`–` como pontuação/separação textual (frase corrida com vírgula, dois pontos, ou frases
separadas no lugar). Regra vale a partir de 2026-07-22 pra toda tela nova e todo ajuste
futuro — não é uma varredura retroativa das telas já aprovadas. Exemplo já corrigido: o texto
aplicado do Popover "Data de cadastro" em Cadastro trocou `"dd/mm/aaaa – dd/mm/aaaa"` por
`"dd/mm/aaaa até dd/mm/aaaa"`. O separador `·` (interpunct, já usado em labels de jornada tipo
"Jornada · Cadastro") não é afetado por essa regra — só travessão/meia-risca são proibidos.

---

## Padrões compostos a partir do Input (sem componente dedicado)

Nem todo elemento visual tem um componente 1:1 no Storybook — quando não tem, a regra é
compor a partir dos primitivos existentes (Input/Button), nunca inventar uma classe nova do
zero. Dois exemplos do fluxo de recuperação de senha:

**OTP (código de verificação, 6 dígitos):** 6 `<input class="input otp-digit" maxlength="1">`
lado a lado, reaproveitando a borda/foco/disabled do Input — só tamanho e alinhamento de texto
são específicos (`page-codigo-verificacao.css`). JS cuida de avanço automático, backspace,
colar (paste distribui os 6 dígitos) e restringe a dígitos. Erro (código incorreto/incompleto)
reaproveita a mesma regra `.error .input` do Input pra borda vermelha — só alterna a classe
`error` no grupo (`#otp-group`), sem duplicar CSS de erro.

**Lista de critérios de senha:** `<ul class="pwd-criteria">` com um ícone "vazio"
(`circle`) e um ícone "atendido" (`check-circle`) por item, alternados via classe `met` no
`<li>` (mesmo padrão de esconder/mostrar já usado no `.mark` do Checkbox). Cor do texto muda
pra `--color-status-success-fg` quando atendido. Ver `page-criar-nova-senha.css` +
`criar-nova-senha.js`.

---

## ⚠️ Custom properties CSS (`--var`) só valem dentro de onde foram declaradas + descendentes

**Bug real (Dashboard, 2026-07-24): o toast de sucesso nunca saía de trás do Header, mesmo depois
de "corrigido" numa rodada anterior.** `page-shell.css` declarava `--shell-header-height: 64px`
dentro de `.app-shell { ... }`; `page-dashboard.css`'s `.dashboard-toast-region` usava
`top: calc(var(--shell-header-height) + var(--spacing-lg))` pra ficar abaixo do Header. Só que
`.dashboard-toast-region` é IRMÃ de `#app-shell` no HTML (`<div class="dashboard-toast-region">`
vem ANTES de `<div class="app-shell">`, ambos filhos diretos do `<body>`), não descendente —
então `var(--shell-header-height)` resolvia pra vazio ali, invalidando o `calc()` inteiro
(`top` caía pro valor inicial, `auto` → `0px` num `position:fixed`). A leitura do CSS parecia
correta (nomes batendo, `calc()` bem formado), e um teste anterior só viu o valor certo por
coincidência de timing/cache — só `getComputedStyle(el).top` (não o CSS-fonte) expôs que o
valor real computado era `0px`, não os ~88px esperados. **Fix:** mover `--shell-header-height`
pra `:root` (único valor precisado fora de `.app-shell`; `--shell-sidebar-width`/`--shell-nav-
text-indent` continuam em `.app-shell` porque só são consumidas por descendentes dela). **Lição:
sempre que uma custom property for consumida por um elemento que não é descendente de onde ela
foi declarada, ela precisa estar num ancestral comum aos dois (`:root` é o mais seguro) — e
`getComputedStyle(el).propriedade` (não o CSS-fonte, não um teste anterior "que passou") é a
única forma confiável de confirmar que um `var()` resolveu pro valor esperado.**

---

## Padrão: estados de demonstração via URL

Telas com múltiplos estados (idle/inválido/loading/erro) devem expor um pequeno switch via
`location.hash` (ex: `#state=invalid`), nunca `location.search` (`?state=`) — o servidor local
(`npx serve`) redireciona `*.html?query` descartando a query string (recurso de "clean URLs").
Hash nunca é enviado ao servidor, então sobrevive a qualquer redirect. Ver `app/shared/login.js`.

---

## Screens registered
| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `screens/login.html` | Estados: idle, `#state=invalid`, `#state=loading`, `#state=error` |
| Recuperar senha | `screens/recuperar-senha.html` | Estados: idle, `#state=required`, `#state=invalid`, `#state=senderror` |
| Código de verificação | `screens/codigo-verificacao.html` | Estados: idle, `#state=incorrect`, `#state=expired`, `#state=toomany`, `#state=commerror`. Código válido no protótipo: `111111`. No estado idle, exibe por ~4s um Feedback info (resposta neutra de segurança, texto reaproveitado do que antes ficava em Recuperar Senha) que some sozinho. Botão "Validar código" fica disabled até os 6 dígitos serem preenchidos (exceto nos estados expired/toomany, onde o mesmo botão vira "Enviar novo código"/reenvio) |
| Criar nova senha | `screens/criar-nova-senha.html` | Estados: idle, `#state=required`, `#state=criteriaunmet`, `#state=mismatch`, `#state=sameasold`, `#state=saveerror`. Sucesso real navega pra `dashboard.html#state=success` |
| Dashboard | `screens/dashboard.html` | Conteúdo real (2026-07-22, refinado em várias rodadas no mesmo dia): Safra, Estoque de grãos, Saldo em contas (linha 1, mesma altura, ícone no título, headline com o número principal + `Ver detalhes`), Contas a pagar/receber (linha 2, total em destaque no cabeçalho + tabela resumida de 4 lançamentos + `Ver todas as contas`), Clima atual + previsão 5 dias (linha 3). Filtros de Fazenda (só aparece com mais de uma fazenda cadastrada, escondido por padrão — quando visível, fica lado a lado com Período numa grid de 2 colunas, `.dashboard-filters.has-farm`, em qualquer largura acima de 320px) e Período (`Últimos 3/6/12 meses`, `Safra atual`, `Período personalizado`) no topo, reaproveitando `Dropdown`/`Input.module.css` (ver seções acima). Trocar qualquer filtro dispara um feedback de carregamento breve (~450ms): dim nos cards + spinner discreto (`#dashboard-refresh-indicator`, ícone `loader-2` girando), ver `flashLoading()` em `dashboard.js`. "Período personalizado" abre um Popover com calendário (não expande inline no layout, ver seção "Popover de período personalizado + Calendário" acima); depois de aplicado, o filtro mostra o intervalo (`dd/mm/aaaa – dd/mm/aaaa`). Tabelas de Contas a pagar/receber com zebra striping sutil (branco/`gray-50`, ver seção Table acima). Usa a Sidebar/Header do shell (mesma marcação de `interface-principal.html`) + `Table.module.css` como Card genérico (ver seção Table acima). Indicador de período de teste (`.dash-trial-badge`) com 3 variantes de estado: padrão (≥3 dias, tag azul), `#state=trialwarning` (2 dias, tag amarela `--color-status-warning-*`), `#state=trialexpired` (0 dias, modal de bloqueio real + `#app-shell` com `filter:blur(4px)` atrás, conteúdo do Dashboard permanece visível mas borrado/inacessível). `#state=empty` mostra o estado de fazenda recém-cadastrada: Safra/Contas a pagar/Contas a receber trocam pra ilustração+mensagem, mas Estoque/Saldo mostram "R$ 0,00" no headline em vez de sumir (ver `setCurrencyZero()` em `dashboard.js`); `#state=multifarm` simula um usuário com várias fazendas (mostra o filtro de Fazenda) — a 3ª fazenda da lista ("Boa Esperança") tem `hasData:false` e reaproveita o mesmo `setCurrencyZero()` ao ser selecionada, simulando uma fazenda recém-cadastrada sem nenhuma movimentação ainda. `#state=success` mostra o toast "Senha alterada com sucesso!"; `#state=signupsuccess` mostra "Conta criada com sucesso!" (ambos Feedback `.alert.success`, mesmo elemento, mensagem trocada por parâmetro; posição do toast agora soma a altura do Header, `top: calc(var(--shell-header-height) + var(--spacing-lg))`, pra nunca nascer coberto por ele) |
| Cadastro de pessoas e empresas | `screens/cadastros.html` | Nova jornada própria (2026-07-22, "Jornada · Cadastro"), acessada pelo item "Cadastro" da Sidebar (agora navega de verdade, ver `interface-principal.js`). Ordem do conteúdo: Abas → espaçamento pequeno → Card de filtros → espaçamento pequeno → Card da tabela (tabela/cards + paginação dentro). Abas Todos/Cliente/Fornecedor/Transportadora (`Tab`, ver seção acima) primeiro; o card de filtros (compacto, discreto, borda Gray 200, sem sombra, ver seção "Tabela (Cadastro): versão final definitiva" abaixo) reúne busca (nome/código/nome fantasia/CPF-CNPJ, ignora acento/pontuação) e filtros ("Data de cadastro" com Popover+calendário e botão de limpar próprio, sem label; "Situação" Ativos/Inativos/Excluídos sem label, com campo contextual "Inativo desde"/"Excluído desde" quando aplicável). Todos os filtros/busca/abas funcionam de verdade e se compõem entre si. Tabela final com 7 colunas: **Nome | Código | Tipo | Status | CPF/CNPJ | Cidade | Ações** (Contato foi removida por completo, telefone migrou pro `data-record` JSON de cada linha). Colunas Nome/Código/Tipo/Status/Cidade são ordenáveis de verdade (ver seção "Ordenação de colunas" acima); CPF/CNPJ e Ações não. Tipo é texto simples (ex. "Cliente, Fornecedor") — só Status usa badge. Ação "Excluir" abre um Modal centralizado (`Dialog`, ver seção acima, texto curto: "Este cadastro será marcado como excluído, mas continuará disponível para consulta através do filtro de situação.", botão "Excluir" destrutivo) antes de confirmar o soft delete; "Nota fiscal" sem destino real ainda, "Editar" navega pra `novo-cadastro.html#state=edit` com os dados pré-preenchidos, "Novo cadastro" navega pro formulário em branco. 37 linhas fictícias no dataset (12 originais + 25 adicionadas pra testar paginação) cobrindo pessoa física/empresa, todos os tipos e combinações, e os 3 status. **Mobile vira Cards de verdade** (não a tabela comprimida) — ver seção "Tabela → Cards no mobile" abaixo. **Tabela: versão final definitiva** — `.table-variant-compact` (cabeçalho Gray 100/uppercase/Semibold, zebra White/Gray 50, linhas compactas) + paginação (10/página) é a ÚNICA versão, sem alternativas de comparação. **Toast de sucesso** (`#state=created`/`#state=edited` ou flags `sessionStorage['nivelo.novocadastro.success']`/`['nivelo.editcadastro.success']`): "Cadastro realizado com sucesso."/"Cadastro editado com sucesso!", mesmo padrão Feedback-como-Toast do Dashboard. **Estado vazio "Nenhum cadastro"** (`#state=empty`): ícone `folder-plus` (mesmo da Sidebar), dentro do card da tabela. Tabs com `font-size` reduzido no mobile (`--font-size-sm`/12px, sobe pra `--font-size-base` a partir de 768px) pra caber sem cortar/rolar. |
| Novo cadastro | `screens/novo-cadastro.html` | Formulário de criação de Cliente/Fornecedor/Transportadora (2026-07-24), acessado pelo botão "Novo cadastro" de `cadastros.html` e também como thumbnail própria no prototype-nav (dentro de "Jornada · Cadastro"). 4 seções (`.card`/`.cardHeader` do Table como container): Dados do cadastro (Nome, Nome fantasia, Tipo, Código auto-gerado somente-leitura + Tooltip com DOIS triggers: ícone de info centralizado nele mesmo, e o campo inteiro centralizado no campo ao passar o mouse no input, ver seção Tooltip acima; Tipo de pessoa → um único campo de documento `#nc-document` que troca label/placeholder/máscara/valor entre CPF e CNPJ), Informações fiscais e contato (Inscrição estadual, Contribuinte, Telefone, E-mail opcional com `(opcional)` no mesmo padrão visual do Step 2 de Criar Conta), Endereço (mesma ORDEM do Step 2 de Criar Conta: CEP com autofill ViaCEP adaptado pra Dropdowns, Rua, Número+Complemento, Bairro, Cidade→Estado dependente), Cadastro de veículos (só aparece com Tipo=Transportadora). Veículos são uma lista dinâmica em memória (`vehicles[]` em `novo-cadastro.js`, nunca 3 campos fixos) — cada veículo é um `.card` (fundo Brand 50) com um botão de remover (ícone-só, tooltip "Remover veículo") no HEADER ao lado do título "Veículo N", Situação (Ativo/Inativo) + de 1 a 3 placas (Placa 1 removível assim que há 2+ placas, renumeração automática ao remover qualquer uma, ícone X centralizado verticalmente contra o input, "+ Adicionar outra placa" oculta ao atingir 3), cada placa com sua própria UF. Estado vazio de veículos tem ícone de caminhão. `#state=transportadora` (demo) pré-seleciona Tipo=Transportadora e já adiciona 1 veículo de exemplo; `#state=required`/`#state=vehiclesinvalid` (demo, 2026-07-24) acionam a validação sem navegar, pra exibir os estados de erro direto pelo prototype-nav. Validação mínima: Nome obrigatório, Placa 1+UF de cada veículo obrigatórias se Transportadora. "Cancelar" volta sem salvar; salvar com sucesso grava um flag em `sessionStorage` e volta pra `cadastros.html`, que mostra o toast de sucesso (ver linha acima). Primeiro uso real do componente `Tooltip` (ver seção própria acima). **Modo de edição (2026-07-24, `#state=edit`):** acessado clicando Editar numa linha de `cadastros.html`, ou direto pelo prototype-nav (usa um payload de demonstração fixo, `DEMO_EDIT_PAYLOAD`). Título vira "Editar cadastro", botão de salvar vira "Salvar alterações", todos os campos (incluindo veículos/placas) vêm pré-preenchidos com os dados do registro selecionado (ver seção "Tabela (Cadastro): versão final..." acima pra detalhes do mecanismo) |
| Estoque | `screens/estoque.html` | Nova jornada própria (2026-07-27, "Jornada · Estoque", refinada no mesmo dia num 2º round), acessada pelo item "Estoque" da Sidebar (agora navega de verdade, ver `interface-principal.js`, `NAV_DESTINATIONS`). Só a listagem — Novo lançamento e as telas de Registrar saída/consumo/abatimento e Ver detalhes ficam fora do escopo desta etapa (botões correspondentes usam o mesmo padrão de "ação sem tela ainda" do `notebookBtn`: flash disable/enable de ~300ms, sem navegação). Header (título + botão **"Novo lançamento"**, era "Novo estoque") → Resumo (3 cards de KPI independentes, **mesmo padrão visual/estrutural exato dos cards do Dashboard**: `.title` do Table como título, ícone+título+valor em destaque+legenda, cópia de classes `estoque-*`) → Abas (Tab, "Estoque de Vendas" selecionada por padrão) → 1 card de tabela por aba (mesmo cabeçalho compacto/uppercase + zebra Branco/Gray 50 da tabela final de Cadastro, cópia de regras, não de classe). **Cards de resumo (2º round): nunca listam produtos individualmente** — só 1 indicador principal + 1 informação secundária cada, sem lista/breakdown por produto (removido do card de Compras, que tinha isso no 1º round). Vendas: "1.250 sacas" (soma, unidade compatível) + "5 produtos" (contagem). Compras: "3 produtos" (contagem, nunca soma — unidades incompatíveis Saca/Kg/Litro no mock) + "3 tipos de produtos". Comprometido: "200 sacas pendentes" (soma do `pendente` calculado por linha, nunca o valor originalmente comprometido) + "2 compromissos" (contagem de linhas). **3 conceitos deliberadamente independentes, nunca somados entre si**: Estoque de Vendas (Produto/Unidade/Quantidade/Ações), Estoque de Compras (mesmas colunas), Estoque Comprometido (Produto/**Destinatário** — era "Cooperativa", renomeado pra não presumir que todo compromisso futuro é com uma cooperativa/Qtd. comprometida/Qtd. abatida/Qtd. pendente/Situação/Ações — `abatida` nunca é editada diretamente pelo usuário, é sempre o resultado de movimentações de abatimento; Situação usa `.badge` real, Pendente=warning/Quitado=success, mesmo mapeamento semântico do Status de Cadastro). **Ações em ícone (2º round): todas as 3 tabelas têm 2 ações agora** — "Ver detalhes" (ícone `eye`, comum às 3) + uma ação de redução específica por conceito (ícone `minus-circle`): "Registrar saída" (Vendas), "Registrar consumo" (Compras), "Registrar abatimento" (Comprometido) — nomes deliberadamente distintos pra não confundir os 3 conceitos (nunca "Registrar venda", já que venda é operação comercial que só FUTURAMENTE poderá gerar saída automática de estoque). Todas com Tooltip padrão, mesma técnica de `position:fixed`+reparent pra `document.body` já documentada em Cadastro/round 16 (necessária porque a zebra usa `filter:brightness()`, que vira "containing block" de `position:fixed`). Todas as 3 tabelas têm ordenação real por coluna (mesmo padrão de Cadastro); sem paginação nesta etapa (dataset mock tem só 2-5 linhas por aba, paginação real fica pra quando o volume justificar — "Paginação, se aplicável").

**3º round (2026-07-27, mesmo dia): Busca + Exportar Excel + Filtros + acertos finais de padrão visual.** Card `.estoque-filter-bar` (busca por Produto, ignora acento/caixa, + botão "Exportar Excel"), cópia exata do `.cadastros-filter-bar` de Cadastro — compartilhado pelas 3 abas, sempre agindo sobre a aba ativa. **Exportação real** (não só preparada): gera um CSV com BOM (abre acentuação corretamente no Excel) a partir das linhas VISÍVEIS no momento (respeita busca/filtros aplicados), delimitador `;` (padrão Excel pt-BR); não existe componente de exportação dedicado no Storybook ainda, então o botão reaproveita `Button.module.css` (`.btn.secondary.hasLeft`) puro, sem inventar um componente novo. **Filtros: só na aba Estoque Comprometido** (Situação + Destinatário), um único botão "Filtros" (mesmo tratamento do trigger "Data de cadastro" de Cadastro: ícone à esquerda, 28px) que abre um Popover (`position:fixed` via JS, mesma composição exata do Popover de "Data de cadastro"/"Período") com os 2 `Dropdown`s + Aplicar/Limpar — opções de Destinatário geradas dinamicamente a partir dos valores reais do mock (não hardcoded). Estado vazio por aba (`.estoque-table-empty`, ícone `search-x`) quando busca/filtros não retornam nada, mesmo padrão do `.cadastros-empty`. **Título dos cards de resumo corrigido pra bater com o do Dashboard de verdade** (18px/Bold/Gray 900, não o 24px/Medium/Gray 700 que `.title` sozinho declara) — investigação revelou que o resultado do Dashboard vem de uma colisão não intencional entre `Table.module.css`'s `.title` e `Dialog.module.css`'s `.title` (Dialog carrega depois no `<head>` daquela tela por causa do modal de bloqueio de trial, vence peso/cor por ordem de declaração em especificidade igual); replicado aqui com os mesmos tokens finais (`--font-size-lg`/`--font-weight-bold`/`--color-text-primary`) em vez de importar `Dialog.module.css` sem necessidade só pra reproduzir a colisão. **Container da tabela corrigido pra bater com Cadastro em sombra/borda/fundo**: `.estoque-table-card` era só `.card` puro (sem sombra) — agora replica exatamente `.cadastros-table-card` (transparente/sem borda/sem sombra no mobile, ganha `--color-bg-surface`+borda `--color-border-subtle`+`--shadow-sm` a partir de 768px), confirmado via `getComputedStyle` idêntico ao de Cadastro nos dois. **Nota de arquitetura (não implementada ainda):** próximo passo natural é extrair a tabela (`.card`+`.cardHeader`+`.tableWrap`+`.table`+zebra+ordenação+ações-em-ícone-com-Tooltip) como Main Component no Storybook, com Cadastro/Estoque virando instâncias configuradas por conteúdo — a implementação atual já segue essa filosofia na prática (cópia de regras/tokens idênticas entre as duas telas, nunca uma sombra/cor/espaçamento inventado só pra Estoque), só falta a extração formal em componente reutilizável quando o Storybook evoluir pra isso

**4º round (mesmo dia): mobile Tab promovido pro Storybook, Exportar Excel≈Filtros, fusão busca/tabela, Novo Lançamento.** (1) `Tab.module.css` virou mobile-first de verdade (`--font-size-sm`/`--spacing-xs`+`--spacing-sm` por padrão, sobe pro tamanho "desktop" a partir de 768px, scrollbar da `.list` escondida por padrão) — era um override só de `.cadastros-tabs .tab` em Cadastro; promovido pro componente, Cadastro e Estoque (e qualquer tela futura com Tab) ganham o tratamento mobile automaticamente, sem CSS próprio por tela. (2) `#estoque-export-btn` ganhou a MESMA linguagem visual compacta do trigger "Filtros" ao lado (altura 28px, borda `--color-border-muted`, `--radius-sm`, fonte `--font-size-sm`) — continua sendo o Button real (`.btn.secondary`), só visualmente ajustado pra conviver na mesma barra. (3) Busca/Filtros/Exportação fundidos com a tabela num único container (`.estoque-list-card`, `.card` com o mesmo tratamento responsivo que só `.estoque-table-card` tinha antes: transparente no mobile, fundo/borda/`--shadow-sm` a partir de 768px) — a barra de controles e a(s) tabela(s) viram 2 seções internas do mesmo card, separadas por um divisor (`border-bottom` na barra), sem crescer a altura da barra. (4) **Nova tela: `screens/novo-estoque.html`** (ver linha própria abaixo). |
| Novo lançamento | `screens/novo-estoque.html` | Formulário condicional de criação (2026-07-27, 4º round), acessado pelo botão "Novo lançamento" de `estoque.html` (já navega de verdade). Mesma estrutura de `novo-cadastro.html`: 1 `.card` único com subseções separadas por divisor. **1. Tipo de estoque** (`Dropdown`: Estoque de Vendas/Compras/Comprometido, dirige todo o resto do formulário). **2. Produto** — Produto ainda não é módulo próprio do sistema: em vez de um `Dropdown` fechado, é um **combobox** (Input de busca + menu próprio em `position:fixed`, escapa do `overflow:hidden` do `.card`) que filtra um catálogo em memória (derivado dos mesmos produtos mockados em `estoque.js`, copiado — telas independentes); se a busca não bate com nada, aparece "Cadastrar novo produto: '‹busca›'", que abre um painel de cadastro rápido inline (fundo Gray 50, mesmo tom do card de veículo de Novo Cadastro) com só 3 campos mínimos — Nome, Código de referência (opcional, auto-gerado `PRD-NNN` se vazio) e Unidade de medida — nada de NCM/CEST/ICMS/dimensões/peso (esse escopo fica pro futuro módulo completo de Produto). Produto selecionado preenche automaticamente um campo "Unidade de medida" somente-leitura (mesmo tratamento visual do Código em Novo Cadastro) — a unidade nunca é escolhida de novo no lançamento, evitando Soja+Kg por engano. Quantidade (rótulo vira "Quantidade comprometida" só no tipo Comprometido); Fornecedor (opcional, só Compras); Destinatário (obrigatório, só Comprometido — texto livre, nunca "Cooperativa" sozinho, mesmo motivo já documentado na listagem). **3. Detalhes do lançamento** — Data do lançamento (Vendas/Compras); Safra (opcional, `Dropdown` com anos-safra, e Data prevista de entrega (opcional), só Comprometido; Observações (opcional, todos os tipos) — não existe Textarea no Storybook ainda, reaproveita a classe `.input` do Input num `<textarea>` (mesma borda/radius/cor/foco), só ajustando altura/resize via CSS. Validação mínima: Produto selecionado (não só texto digitado) + Quantidade > 0 sempre; Destinatário obrigatório só se Comprometido. **Não faz parte deste formulário** (fluxos futuros, próprias ações da listagem): Registrar saída/consumo/abatimento, Venda, Compra, Transferência — o lançamento aqui é sempre a criação inicial. "Salvar lançamento" sem backend: grava uma mensagem de sucesso já com o texto certo pro tipo lançado (`sessionStorage['nivelo.novoestoque.success']`) e volta pra `estoque.html#tab=‹tipo›` (mesma convenção de estado via hash, nunca query string) — a aba do tipo lançado já vem selecionada, o toast usa o mesmo padrão Feedback-como-Toast das outras telas. Não injeta uma linha de verdade nas tabelas mockadas (dado ainda vive só em `estoque.js`) — decisão deliberada, ver instrução original: "não misturar Novo Lançamento com Movimentações futuras". |
**5º round (2026-07-27, mesmo dia): rename do CTA, padrão de tabela unificado (busca/filtro fundido virou o padrão do sistema, retrofit em Cadastro), Cards no mobile em Estoque, hierarquia do card Comprometido, Sidebar "Cadastro"→"Cadastros".**
1. **CTA + rename em cascata**: "Novo lançamento" → **"Novo registo de estoque"** em todo lugar visível da jornada — botão de `estoque.html`, `<title>`/`<h1>`/seção "Detalhes do registo"/label "Data do registo" de `novo-estoque.html`, texto do toast de sucesso ("Registo de estoque salvo com sucesso"), label no `prototype-nav`. Intenção explícita do usuário: diferenciar o conceito de estoque do conceito de "lançamento" usado no módulo Caixa (Financeiro). Nomes de arquivo/ids/chaves de `sessionStorage` continuam iguais, só texto visível mudou.
2. **REVERSÃO explícita de uma decisão anterior**: o container fundido de busca/filtro+tabela (`.estoque-list-card`, só existia em Estoque) virou **o padrão oficial de tabela do sistema** — por pedido do usuário, Cadastro foi retrofitado pra usar a mesma arquitetura (`.cadastros-list-card`), desfazendo a decisão "card de filtros SEPARADO" registrada em "Tabela (Cadastro): versão final definitiva" abaixo. `.cadastros-filter-bar` perdeu border/shadow/background/radius próprios (ganhou só `border-bottom` como divisor); `.cadastros-table-card` perdeu seu próprio border/shadow/background (o novo `.cadastros-list-card` que envolve os dois é quem fornece isso agora, mesmo tratamento responsivo — transparente no mobile, `--shadow-sm` a partir de 768px). Também fechadas 2 lacunas reais entre as duas tabelas: Estoque ganhou `border-color:var(--color-gray-200)` nos `.td` (Cadastro já tinha) e `table-layout:fixed` com larguras por coluna (`nth-child`, Ações sempre 120px fixo) — igual à disciplina que Cadastro já usava. **+8px de respiro** entre o divisor da barra de busca/filtros e o cabeçalho da tabela/cards em AMBAS as telas (`padding-top:var(--spacing-sm)` no `.tableWrap`/cards — antes o gap era só a borda de 1px do divisor).
3. **Estoque ganhou o mesmo padrão de Cards no mobile que Cadastro já tinha** — `.estoque-mobile-cards`/`.estoque-mobile-card*` (cópia renomeada de `.cadastros-mobile-card*`), um Card por linha, gerado via JS a partir das células REAIS já renderizadas na `<tr>` (texto formatado, badge/ações reaproveitados via `innerHTML`, nunca uma segunda fonte de dados) — mesmo princípio de `renderCards()` em `cadastros.js`. `<table>` escondida abaixo de 768px, Cards escondidos a partir daí (mesma troca de breakpoint de Cadastro). Vendas/Compras compartilham um único builder (mesmas 4 colunas); Comprometido tem o seu próprio (mais campos + badge de Situação).
4. **Card "Estoque Comprometido" — hierarquia corrigida**: era "200 sacas pendentes" (valor) + "2 compromissos" (legenda, contagem de TODAS as linhas). Virou **"200 sacas"** (valor, sem o sufixo "pendentes" — já é implícito, é a soma do `pendente`) + **"1 compromisso pendente"** (legenda — agora filtrada por `situacao === 'pendente'`, não mais a contagem total de linhas; com o mock atual, Milho já está Quitado e não conta mais, daí "1" e não "2").
5. **Sidebar: "Cadastro" (item único) virou o grupo expansível "Cadastros"** com 2 subitens — "Pessoas e empresas" (`data-nav="cadastro-pessoas"`, navega de verdade pra `cadastros.html`, mesmo destino de antes) e "Produtos" (`data-nav="cadastro-produtos"`, só alterna destaque visual — mesmo padrão de "ação sem tela ainda" já usado pelos demais subitens de Financeiro/Vendas/Configuração; tela real fica pra um momento futuro). Réplica exata do padrão já usado por Financeiro/Vendas (`.app-nav-group`/`.app-nav-submenu`/`.app-nav-subitem`, accordion via `data-group-toggle`, `TOP_LEVEL_GROUP_IDS` em `interface-principal.js` ganhou `'group-cadastro'`) — nenhuma CSS nova. Em `cadastros.html`/`novo-cadastro.html` (as 2 telas que marcavam `cadastro` como `is-active`) o grupo já nasce aberto (`is-open`/`aria-expanded="true"`) com "Pessoas e empresas" ativo. Essa estrutura (categoria expansível com subitens, um deles sem tela ainda) é a organização padrão pra futuras expansões de Cadastros.
**Nota de verificação**: o Browser pane apresentou a mesma instabilidade de cache já documentada no round anterior (arquivos recém-editados servidos de uma versão desatualizada até uma navegação genuinamente nova acontecer) — contornado com `fetch`+`eval` do arquivo atual direto no console pra confirmar comportamento real antes de reportar como funcionando.

| Cadastro da conta (Step 1) | `screens/cadastro.html` | Estados: idle, `#state=required`, `#state=criteriaunmet`, `#state=mismatch`. Mesmas regras de senha/CPF/telefone do restante do fluxo. Sem aceite de termos aqui (só no Step 3) |
| Validar telefone | `screens/cadastro-validar-telefone.html` | Estados: idle, `#state=incorrect`, `#state=expired`. Mesmo padrão de OTP do fluxo de recuperação de senha, código válido `111111`, sem os estados de "muitas tentativas"/"erro de comunicação" (não pedidos aqui) |
| Endereço (Step 2) | `screens/cadastro-endereco.html` | Estados: idle, `#state=required`. Número e Complemento lado a lado no desktop (`.cadastro-field-row`), Complemento com marcador "(opcional)". CEP válido consulta a API pública ViaCEP e preenche Rua/Bairro/Cidade/Estado automaticamente quando disponíveis, sem sobrescrever campos já preenchidos manualmente; todos continuam editáveis |
| Planos (Step 3) | `screens/cadastro-planos.html` | Estados: idle, `#state=planrequired`, `#state=termsrequired`. Planos idênticos aos da Landing Page. Nota para desenvolvimento (`.dev-note`) junto ao botão "Criar conta", só visível com o toggle do prototype-nav ligado. Sucesso navega pra `dashboard.html#state=signupsuccess` |
| Interface principal (Header + Sidebar) | `screens/interface-principal.html` (protótipo HTML de referência) **+ migrado pro Storybook (round 8)**: `Storybook-Nivelo/src/components/AppHeader` e `.../Sidebar`, componentes React reais | Padrão global de navegação da área logada. Light only (Dark Mode foi removido no round 6). Estados: idle, `#state=collapsed`, `#state=financeiro`, `#state=vendas`, `#state=configuracao`, `#state=configuracao-fiscal`, `#state=assistente-ia`. Sidebar organizada em 3 seções (Geral/Gestão/Suporte) com accordion (só um grupo de topo aberto por vez) e Popover ao clicar num grupo com a sidebar retraída; Assistente IA (Meus números, Nova conversa, Histórico) em Geral; Configuração contém um subgrupo de mais um nível (Fiscal). `#notebook-btn` (item "Caderno de campo" do Header, compartilhado por todas as telas) navega pra `caderno-de-campo.html` desde o round 41 — ver detalhes em `app/CLAUDE.md` |
| Caderno de Campo (listagem) | `screens/caderno-de-campo.html` | Nova jornada (round 41), acessada pelo item "Caderno de campo" do Header. Cards de fazenda (cópia estrutural de `.fazenda-card`) com Talhões/Anotações/Última anotação + resumo Despesas/Vendas/Colheitas registrados (`window.NiveloCaderno`, só informativo, nunca saldo). Estados: idle, `#state=empty`. "+ Nova anotação" → `nova-anotacao.html`; card/"Ver caderno" → `fazenda-detalhe.html#id=<id>` (tela OPERACIONAL, não a cadastral) |
| Nova anotação | `screens/nova-anotacao.html` | Formulário único (round 41, +Cultura/Safra no round 42): Data/hora automática (readonly), Fazenda/Talhão (`Dropdown`s dependentes), Cultura (`Dropdown`, opções de `window.NiveloProdutos` categoria "Grãos"/ativo, desabilitado até escolher Talhão, pré-seleciona a cultura da anotação mais recente daquele talhão via `NiveloCaderno.findUltimaCultura` ou cai pro `talhao.cultura`), Safra (`Dropdown` + "Adicionar nova safra" → Dialog, catálogo `window.NiveloSafras`/`safras-data.js`, localStorage, mesmo padrão de "Adicionar nova categoria" de `novo-produto.js`), Tipo de anotação (3 cards de seleção visual sobre `<input type="radio">` reais — sem componente "card de seleção" no Storybook, composição de página), Observação, Valor (R$, Despesa/Venda) ou Quantidade+Unidade (Saca/Kg/Litro, Colheita). Pré-seleção opcional via `?fazenda=&talhao=&tipo=` (query string, campos continuam editáveis). Salvar grava em `window.NiveloCaderno` (agora com `cultura`/`safra`) e volta pro contexto mais específico disponível (Talhão → Fazenda → Caderno de Campo) |
| Detalhe do talhão | `screens/talhao-detalhe.html` | Tela nova (round 41), resolvida por `#fazenda=<id>&talhao=<id>` (talhaoId sozinho não é único entre fazendas). Status (badge, mesmo `STATUS_TALHAO` de `fazenda-detalhe.js`), indicadores (Área/Cultura/Safra) + Despesas/Vendas/Colheitas registrados só deste talhão, lista de anotações (mais recente primeiro). Ações: "Nova anotação" (pré-preenchida) e "Alterar status" (`Dialog` + `Dropdown`, altera em memória, sem persistência entre páginas) |
| Certificado Digital | `screens/certificado-digital.html` | Nova jornada (round 56; round 57 removeu o Parceiro da experiência do cliente; round 58 trouxe o menu e o estado vazio com 2 opções de volta), Configuração > Fiscal > Certificado digital (`data-nav="fiscal-certificado"`, existia como stub desde o bloqueio de emissão de Nova Nota Fiscal). Tabela "Certificados cadastrados" (Nome/Tipo/Titular/CPF-CNPJ/Validade/Status/Origem/Ações), status sempre recalculado a partir de `dataValidade` (ativo/próximo do vencimento/expirado, exceto revogado — manual). Lista nasce VAZIA por padrão (preserva o bloqueio-padrão de Nova Nota Fiscal); `#state=comdados` popula 2 certificados de exemplo via `seedExemplo()`. Botão "+ Novo Certificado" abre um menu (Importar certificado/Emitir novo certificado, reaproveita `.menu`/`.option` do Dropdown ancorado num Button). **Estado vazio (round 58):** mensagem + 2 cards de opção (ícone/título/descrição/botão) — "Importar certificado" (navega pro form) e "Emitir novo certificado" (abre a URL do parceiro via `emitirComParceiro()`). Dialog Visualizar (somente leitura) + Dialog Excluir (confirmação) |
| Importar Certificado | `screens/importar-certificado.html` | Formulário em 2 cliques (round 56): 1º clique valida Nome/Arquivo(.pfx/.p12)/Senha e "extrai" os dados (mock determinístico por hash — Tipo A1/A3, Emissor, datas, Titular/CPF-CNPJ sempre do Emitente da conta), revela "Dados extraídos automaticamente" (somente leitura) e vira "Salvar Certificado"; 2º clique persiste. Bloqueia duplicidade por número de série; permite certificado expirado com um `alert.warning`. `?codigo=` edita Nome/Observações só (Arquivo/Senha não reexigidos). Só o fluxo de cadastro — sem nenhuma menção a parceiro (a seção "Não possui certificado?" do round 57 foi removida no round 58, redundante com o estado vazio da listagem) |
| Detalhe do certificado | `screens/certificado-detalhe.html` | Ação "Visualizar" (2026-08-04) — antes um Dialog modal, virou tela própria de leitura (`#codigo=`), mesmo padrão de "Ver detalhes" de Estoque/Talhão/Contas a Pagar. Reaproveita `.certdigital-view-grid` de `page-certificado-digital.css`. Botão Editar navega pra `importar-certificado.html?codigo=` |
| Detalhe do manifesto | `screens/manifesto-detalhe.html` | Ação "Ver detalhes" de Manifesto (2026-08-04) — antes reaproveitava `novo-manifesto.html?modo=ver` (form disabled), virou tela própria (`#numero=`), mesmo padrão das demais "Ver detalhes". Seções Dados gerais/Emitente/Motorista/Origem e destino/Documentos fiscais/Seguro (só se houver)/Pagamento; ações Editar/Cancelar manifesto escondidas quando já cancelado |
| Nova conversa (Assistente IA) | `screens/nova-conversa.html` | Chat com o Assistente de IA (2026-08-04), 2 colunas (conversa + histórico). Restrito a 2 temas (notas fiscais / Caderno de Campo, `assistente-data.js`'s `gerarResposta()`); indicador de digitação com delay mock; mensagens de texto e voz (player próprio, animação de progresso via `transition`); histórico ordenado por mensagem mais recente, paginado ("Ver mais", 5 por vez), item ativo destacado; "Histórico" removido da Sidebar de todas as telas — só existe aqui |

## Indicador de steps (fluxo de Criar Conta)

Sem componente "Stepper" no Storybook-Nivelo — composição própria (`.cadastro-steps`, ver
`app/shared/page-cadastro.css`) a partir de tokens, mesmo raciocínio já usado pro OTP e pela
lista de critérios de senha (compor a partir de tokens/padrões existentes em vez de inventar
um componente novo). Cada `<li class="cadastro-step">` recebe `is-current` ou `is-complete`
conforme a tela; a etapa de "Validar telefone" mantém o Step 1 como `is-current` (a validação
faz parte do cadastro da conta, não é um step à parte).

## Notas para desenvolvimento (feature do protótipo, não do produto)

Anotações (`.dev-note`, ver `page-cadastro.css`) visíveis só pro time de desenvolvimento,
escondidas por padrão (`display:none`) e reveladas via uma classe `dev-notes-on` no `<html>`,
controlada por `app/shared/dev-notes.js` lendo uma flag compartilhada no `localStorage`
(`nivelo.devNotes.enabled`). **O controle liga/desliga vive só no `prototype-nav` (sidebar,
botão "Notas para desenvolvimento")**, nunca dentro da tela do produto em si — o protótipo
precisa ficar limpo por padrão pra demonstração ao cliente, e colocar o switch na própria tela
seria expor ferramental de dev no que devia parecer produto real. Como nav e telas rodam na
mesma origem (`localStorage` compartilhado) e `dev-notes.js` escuta o evento `storage`, ligar o
toggle no nav atualiza uma tela já aberta em tempo real, sem precisar recarregar.

## Navegação entre telas do fluxo de recuperação de senha

Ao contrário dos estados de demonstração (`#state=`, todos dentro da MESMA tela), a navegação
entre telas é navegação real (`window.location.href = 'proxima-tela.html'`), porque cada uma é
um HTML separado. O telefone informado em Recuperar Senha e o flag de sucesso de Criar Nova
Senha atravessam telas via `sessionStorage` (`nivelo.recovery.phone`, `nivelo.recovery.success`)
em vez de query string — mesmo motivo do padrão de hash: sobrevive a qualquer comportamento do
servidor estático, e não precisa ser lido de volta na URL.
