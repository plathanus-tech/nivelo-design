# Nivelo Landing Page — Design System Snapshot

## Storybook path
`../Storybook-Nivelo/` (relative to `landing/`)

From `screens/*.html`, all paths use `../../Storybook-Nivelo/`

## CSS load order (every screen)
```html
<link rel="stylesheet" href="../shared/fonts.css" />
<link rel="stylesheet" href="../../Storybook-Nivelo/src/tokens/tokens.css" />
<link rel="stylesheet" href="../../Storybook-Nivelo/src/components/[Component]/[Component].module.css" />
<link rel="stylesheet" href="../shared/page-mobile.css" />
```

---

## Design Tokens (key values)

| Token | Value |
|---|---|
| `--color-brand-500` | `#1752B0` (Brand Blue — primary) |
| `--color-accent-400` | `#EFCB34` (Accent Gold — details only) |
| `--color-gray-white` | `#FFFFFF` |
| `--font-heading` | Helvetica Neue, Arial, sans-serif |
| `--font-body` | Helvetica Neue, Arial, sans-serif |
| `--font-weight-light` | 300 (body) |
| `--font-weight-medium` | 500 (headings) |
| `--nav-height` | 64px (project token in page-mobile.css) |

---

## Storybook Components

### Button ✅
**CSS:** `../../Storybook-Nivelo/src/components/Button/Button.module.css`

HTML pattern:
```html
<button class="btn [variant] [size]">[label]</button>
<a     class="btn [variant] [size]" href="...">[label]</a>
```

| Class | Values |
|---|---|
| variant | `primary` `secondary` `ghost` `destructive` |
| size | `sm` `md` (default) `lg` |
| modifier | `iconOnly` `hasLeft` `hasRight` |
| icon wrapper | `<span class="icon">` inside button |

Border-radius: `--radius-button` = **12px** (todos os tamanhos e variantes).

With icon left:
```html
<button class="btn primary md hasLeft">
  <span class="icon"><i data-lucide="icon-name" width="20" height="20"></i></span>
  Label
</button>
```

### SiteHeader ✅
**CSS:** `../../Storybook-Nivelo/src/components/SiteHeader/SiteHeader.module.css`  
**React:** `Storybook-Nivelo/src/components/SiteHeader/SiteHeader.tsx`  
**Storybook:** `Landing/SiteHeader`

Navbar fixa da landing page. Responsivo: desktop (links + CTA) e mobile (hamburguer + drawer).
Comportamento: fundo transparente → branco sólido após scroll de 80px.
Logo alterna entre versão branca (hero) e colorida (após scroll).

Props: `logoWhiteSrc`, `logoColorSrc`, `logoAlt`, `navLinks[]`, `ctaLabel`, `ctaHref`

CSS classes (para uso em HTML via `<link>`):
`.header` `.inner` `.logo` `.logoWhite` `.logoColor` `.links` `.cta` `.hamburger`
`.scrolled` (JS-toggled) `.drawer` `.drawerOpen` `.drawerOverlay` `.drawerPanel`
`.drawerClose` `.drawerLinks` `.drawerCta`

### SiteFooter ✅
**CSS:** `../../Storybook-Nivelo/src/components/SiteFooter/SiteFooter.module.css`  
**React:** `Storybook-Nivelo/src/components/SiteFooter/SiteFooter.tsx`  
**Storybook:** `Landing/SiteFooter`

Rodapé da landing page. 3 colunas: Institucional (logo + redes + telefone), Navegação, Legal.
Mobile: empilhado. Desktop (768px+): linha horizontal.

Props: `logoSrc`, `logoAlt`, `socialLinks[]`, `phoneBlocks[]` (`{label, phone, phoneDisplay}` — 0, 1 ou mais, ex. Vendas+Suporte), `navLinks[]`, `legalLinks[]`, `copyright`

CSS classes (para uso em HTML via `<link>`):
`.footer` `.inner` `.columns` `.brand` `.logoLink` `.social` `.phoneBlock` `.phoneLabel`
`.phoneNumber` `.col` `.colTitle` `.navList` `.legalLinks` `.legalBtn` `.bottom` `.copy`

### Accordion ✅ (not yet used)
**CSS:** `../../Storybook-Nivelo/src/components/Accordion/Accordion.module.css`

### Tab ✅ (not yet used)
**CSS:** `../../Storybook-Nivelo/src/components/Tab/Tab.module.css`

### Tooltip ✅ (not yet used)
**CSS:** `../../Storybook-Nivelo/src/components/Tooltip/Tooltip.module.css`

### Feedback ✅ (not yet used)
**CSS:** `../../Storybook-Nivelo/src/components/Feedback/Feedback.module.css`

---

## Landing-specific components (page-mobile.css)

| Class | Description |
|---|---|
| `.nav-landing` | Fixed navbar wrapper |
| `.nav-inner` | Max-width flex row inside navbar |
| `.nav-logo` | Logo anchor |
| `.logo-white` / `.logo-color` | Swapped on scroll via `.nav-scrolled` |
| `.nav-links` | Desktop horizontal link list |
| `.nav-cta` | Desktop CTA (hidden mobile) |
| `.nav-hamburger` | Mobile menu toggle |
| `.nav-scrolled` | JS-toggled: solid bg + shadow |
| `.nav-drawer` | Mobile fullscreen overlay |
| `.nav-drawer.open` | Drawer visible state |
| `.nav-drawer-overlay` | Dark backdrop |
| `.nav-drawer-panel` | Sliding content panel |
| `.nav-drawer-close` | Close button |
| `.nav-drawer-links` | Vertical link list |
| `.nav-drawer-cta` | Full-width CTA in drawer |
| `.hero` | Full-viewport hero section |
| `.hero-bg` | Background image container |
| `.hero-overlay` | Gradient overlay |
| `.hero-content` | Centered content block |
| `.hero-tag` | Uppercase eyebrow label |
| `.hero-headline` | Main h1 |
| `.hero-sub` | Subheadline paragraph |
| `.hero-actions` | CTA flex group |
| `.hero-btn-primary` | Full-width on mobile modifier |
| `.hero-link` | Secondary text link with icon |
| `.whatsapp-fab` | Fixed circular WhatsApp button |
| `.whatsapp-fab-icon` | WhatsApp SVG img |
| `.whatsapp-tooltip` | Tooltip bubble |
| `.whatsapp-fab.tooltip-visible` | JS-toggled tooltip state |

---

## Icons
Use Lucide only. Load via CDN:
```html
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

Usage: `<i data-lucide="icon-name" width="20" height="20"></i>`

WhatsApp icon: `../shared/icons/whatsapp.svg` (official brand SVG, white fill)

---

## Grid
| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| < 480px | 4 | 16px | 16px (--spacing-md) |
| 480–768px | 8 | 16px | 24px (--spacing-lg) |
| 768–1280px | 12 | 24px | 32px (--spacing-xl) |
| > 1280px | 12 | 24px | 48px (--spacing-2xl) |

---

## Landing-specific layout — Funcionalidades (page-mobile.css)

| Class | Description |
|---|---|
| `.features` | Section wrapper — bg-default, padding 3xl/4xl |
| `.features-inner` | Max-width 1280px container |
| `.section-header` | Centered header block (reusável) |
| `.section-tag` | Eyebrow label uppercase brand-blue |
| `.section-headline` | h2 do section (3xl mobile, 4xl desktop) |
| `.section-sub` | Subtitle light, max-width 560px centralizado |
| `.features-grid` | CSS grid: 1col → 2col@768px → 3col@1280px |
| `.feature-card` | Card com borda muted, radius-md, hover lift |
| `.feature-card-icon` | 48×48px rounded-sm, bg brand-50, cor primary |
| `.feature-card-icon--whatsapp` | Variante verde WhatsApp |
| `.feature-card-name` | Título do módulo (lg, medium) |
| `.feature-card-desc` | Descrição curta (base, light) |
| `.feature-card-list` | ul sem bullets, flex column gap-sm |
| `.feature-card-list li` | Flex row align-start, ícone check success |
| `.feature-card-note` | Rodapé asterisco (xs, tertiary) |

---

## Screens registered in prototipo.html
| Screen ID | File | Description |
|---|---|---|
| `index` | `screens/index.html` | Landing page — Navbar, Hero, Funcionalidades, WhatsApp FAB |
