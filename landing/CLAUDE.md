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
