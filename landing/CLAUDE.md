# CLAUDE.md — Nivelo Landing Page

## Project context
One Page landing page for Nivelo (rural management SaaS).
Target: small and medium rural producers. Theme: Light only (no dark mode).

## Storybook
Always use `Storybook-Nivelo/` — never `Storybook/`.

## Behavior rules

- Mobile First always. Base styles = mobile. Enhancements inside `@media (min-width: ...)`.
- No hardcoded values anywhere. Use `var(--token)` for all colors, spacing, radius, shadow, font.
- No `<style>` blocks in HTML. No `style=""` attributes.
- No inline SVG. Lucide icons via `data-lucide`. WhatsApp icon via `<img src="../shared/icons/whatsapp.svg">`.
- Project logos via `<img src="../../Storybook-Nivelo/public/logo-*.svg">`.
- Light theme only. Never set `data-theme="dark"` on the html element.
- Copy rule: no em dash (—). Use period, comma or colon to separate ideas.

## Reutilizar SiteHeader e SiteFooter

Toda nova landing page deve usar os componentes do Storybook:
- **Header:** carregar `SiteHeader.module.css` + classes `.header .inner .logo` etc. (ver `rules.md`)
- **Footer:** carregar `SiteFooter.module.css` + classes `.footer .inner .columns` etc. (ver `rules.md`)
- Nunca recriar navbar ou rodapé do zero. Sempre reutilizar os componentes existentes.

## Adding a new section
1. Read `rules.md` to check if needed components already exist.
2. If a component is missing, show the user a spec before creating it.
3. New CSS goes in `shared/page-mobile.css` with a descriptive comment block.
4. New components go in `Storybook-Nivelo/src/components/` with `.tsx`, `.module.css`, `.stories.tsx`.
5. Update `rules.md` after any component addition.

## File paths from `screens/*.html`
- Tokens: `../../Storybook-Nivelo/src/tokens/tokens.css`
- Components: `../../Storybook-Nivelo/src/components/[Name]/[Name].module.css`
- Fonts: `../shared/fonts.css`
- Layout: `../shared/page-mobile.css`
- Logos: `../../Storybook-Nivelo/public/logo-azul.svg` | `logo-branco.svg` | `logo-preto.svg`
- Hero image: `../../magnific_horizontal-169-cinematic-_3Gwy7WqREY.png`
- WhatsApp icon: `../shared/icons/whatsapp.svg`

## CTAs
- Área do Cliente: `../../app/screens/login.html` (tela de Login real, ver `app/`)
- WhatsApp: `https://wa.me/PLACEHOLDER` (placeholder — update when ready)

## Ajustes 2026-08-04 — Planos: seletor Mensal/Anual

Seção `#planos` (`index-v3.html` + `page-v3.css`) ganhou um seletor de pílulas
"Mensal / Anual" acima do grid de cards (`.pricing-toggle-*`, CSS ad-hoc, sem
componente novo no Storybook). Só troca a EXIBIÇÃO do valor de cada plano,
não é uma escolha de contratação: o CTA continua "Começar agora" e o link
continua o mesmo (`app/screens/login.html`) nos dois modos.

Cada card tem dois blocos `.pricing-price[data-billing="mensal|anual"]` e duas
`.pricing-billing-note`, alternados via JS (`[hidden]`) conforme o botão
clicado. Desconto anual: 20% sobre o total de 12 meses do valor mensal,
parcelável em 12x (valores fixos no HTML, não calculados em runtime).
Pílula "Anual" tem destaque visual maior (preenchida quando ativa) e um rótulo
flutuante "Melhor custo-benefício" acima dela, junto do badge "Economize 20%".

Também atualizados nesta rodada: benefícios do plano Fiscal (passou a listar
Cadastro de clientes/transportadoras, Cadastro de produtos, Configurações de
emissão, em vez de "Estoque de vendas"); último item do plano Gestão Completa
+ WhatsApp trocado de "Caderno de Talhões" para "Caderno de Campo" (nome real
da feature); texto de apoio da seção atualizado para "8 dias grátis...".

**Ajuste (mesmo dia): cada card mostra só 1 preço por vez, sem poluição
visual.** Anual não mostra o total do ano em destaque, mostra o valor
mensal-equivalente (`R$ 23,92/mês`, etc.) com um selo pequeno "Cobrado
anualmente R$ 287,04" + selo "Economize 20%" ao lado (mesmo raciocínio de
"ancoragem" do briefing do usuário). Mensal mostra `Cobrança mensal. Cancele
quando quiser.` como legenda.
**Bug real corrigido, mesma classe do 6º/7º/8º casos já documentados neste
projeto:** `.pricing-price`/`.pricing-billing-note` tinham `display: flex`
incondicional, então o atributo `[hidden]` do navegador não escondia nada
(o `display:flex` da própria classe vencia). Corrigido com
`.pricing-price[hidden], .pricing-billing-note[hidden] { display: none; }`.

**Ajuste (mesmo dia): hierarquia e alinhamento dos cards.** A lista de
benefícios (`hr` + `.pricing-features-intro` + `.pricing-features`) foi
movida no HTML pra ANTES do CTA em todos os 4 cards (antes vinha depois).
`.pricing-grid` perdeu `align-items: start` (agora usa o stretch padrão do
grid), então todos os cards de uma linha ficam com a mesma altura; `.pricing-
cta` ganhou `margin-top: auto` (o card já é flex-column) empurrando o botão
pro rodapé, então os 4 CTAs ficam sempre na mesma linha horizontal
independente do tamanho da lista de benefícios de cada plano. Card "Fiscal +
WhatsApp" (só 1 benefício) ganhou classe modificadora `.pricing-card--
balanced` com respiro extra (`margin-top` no divisor + `margin-bottom` maior
na lista) pra não parecer vazio ao lado dos outros 3. Nenhum texto, preço,
cor ou o seletor Mensal/Anual foram alterados.

## Ajustes 2026-09-10 — Funcionalidades: card WhatsApp

Card "Assistente de IA" da seção Funcionalidades virou "WhatsApp": ícone
trocado de `bot` (Lucide) pro ícone oficial (`../shared/icons/whatsapp.svg`,
mesmo padrão de `index.html`/`index-v2.html`, classe `feature-card-icon--
whatsapp` já existia no CSS mas nunca tinha sido definida em `page-v3.css` —
bug real corrigido: sem essa regra o ícone caía no fundo azul padrão com o
glifo branco quase invisível). Fundo do ícone: `var(--color-green-50)`, mesmo
degrau de tint que `--color-brand-50` usado nos ícones azuis dos outros
cards. Criado `whatsapp-green.svg` (mesmo path do ícone oficial, só com
`fill="#25D366"`) porque o SVG original tem `fill="white"` fixo no elemento
raiz (pensado pra ir sobre fundo verde sólido, como o FAB) — sem variante
verde própria, não dava pra recolorir com `color`/`currentColor` num `<img>`.
Outros 7 cards da seção também tiveram o texto interno reescrito (título
mantido, exceto "Cadastro" → "Cadastros" e "Vendas" → "Vendas e fiscal").

## Ajustes 2026-09-10 — Planos: reestruturação completa (seleção por hectares)

Mudança de fundo na seção `#planos`: a escolha global deixou de ser Mensal/
Anual (`.pricing-toggle-*`, removido) e passou a ser a faixa de hectares da
propriedade (`.hectares-toggle-*`, novo, mesmo padrão visual de pílulas do
toggle anterior — só que com 4 opções que quebram linha no mobile em vez de
2 lado a lado). Tag "Planos" acima do título removido (`section-tag`
retirado do header desta seção só). "8 dias grátis em todos os planos"
virou o `section-sub` da própria seção (era misturado com o texto do toggle
antigo, "Compare os valores mensal e anual...", que não fazia mais sentido).

**Plano "Fiscal + WhatsApp" removido por completo** (não só desativado): o
card saiu do HTML, restando só 3 planos (Fiscal, Gestão Completa, Gestão
Completa + WhatsApp). Referência a ele na FAQ ("Nos planos Fiscal + WhatsApp
e Gestão Completa + WhatsApp...") também corrigida pra citar só o plano que
ainda existe. `.pricing-grid` passou de 4 pra 3 colunas no desktop (breakpoint
900px), `is-mensal`/`pricing-card--balanced`/`pricing-savings-badge` (classes
só usadas pelo mecanismo antigo) removidas do CSS.

**Fiscal continua só anual** (`.pricing-annual-only`, sem mudança de
comportamento) — card com 1 preço só. **Gestão Completa e Gestão Completa +
WhatsApp passaram a mostrar Anual E Mensal ao mesmo tempo dentro do mesmo
card** (não é mais uma escolha exclusiva via toggle): novo bloco
`.pricing-billing-block` com rótulo pequeno "Anual"/"Mensal"
(`.pricing-billing-label`) acima de cada preço. Texto de economia anual
("R$ X a menos no ano") ganhou classe própria `.pricing-savings-text`, com
o padrão verde de sucesso (`--color-status-success-bg`/`-fg`) em vez do azul
de marca usado no resto da seção — deliberado, pra diferenciar "benefício"
de "informação neutra", consistente nos 2 planos que o exibem.

**Preços centralizados numa única estrutura de dados** (`PRICING_POR_FAIXA`,
no `<script>` de `index-v3.html`), chave = faixa de hectares (`ate-100`/
`101-200`/`201-300`/`acima-300`, mesmos ids do admin/`FAIXA_HECTARES_LABELS`),
cada plano guarda só `anualMensal` (e `mensal`, quando existir) — total anual
e economia SEMPRE derivados em runtime (`anualMensal * 12`, `mensal * 12 -
anualTotal`), nunca hardcoded em paralelo, mesmo padrão de
`calcularValorAnual` já usado em `admin/shared/planos-data.js`. Cada elemento
de preço no HTML carrega um `data-price-field` (ex.: `completa-anual-mensal`,
`whatsapp-economia`) que o JS localiza e atualiza via `textContent` ao trocar
de pílula — sem `[hidden]`/toggle de visibilidade como antes, os valores são
sempre visíveis, só o número muda.

Verificado ao vivo (`http-server`) nas 4 faixas: valores dos 3 cards batendo
exatamente com os 4 exemplos do pedido (incluindo o de "101 a 200 hectares"
citado explicitamente: Fiscal R$ 21,90/R$ 262,80, Gestão Completa
R$ 159,90/R$ 1.918,80/R$ 600,00 de economia/R$ 209,90 mensal, Gestão Completa
+ WhatsApp R$ 219,90/R$ 2.638,80/R$ 840,00/R$ 289,90 mensal); troca de faixa
atualiza os 3 cards instantaneamente, sem reload; nenhum vestígio de "Fiscal
+ WhatsApp" na página (grid, FAQ ou em qualquer outro texto); pílulas de
hectares em 2x2 no mobile (375px), sem overflow horizontal, cards do plano
com layout Anual/Mensal legível e sem altura excessiva; nenhum erro de
console novo em nenhuma das duas rodadas.

## Sections status
| Section | Status |
|---|---|
| Navbar | Done |
| Hero | Done |
| WhatsApp FAB | Done |
| Funcionalidades | Done |
| Planos | Done |
| Quem Somos | Done |
| FAQ | Done |
| Contato | Done |
| Footer | Done |
