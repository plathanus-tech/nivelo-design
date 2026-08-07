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
de acesso/conteúdo diferente. Fluxo de autenticação do admin segue a mesma
direção visual documentada em `app/CLAUDE.md` ("Direção visual — fluxo de
autenticação"): card sobre fundo com radiais azuis sutis, mesma tipografia/
espaçamento/tokens. Sem painel institucional com imagem (não existe asset de
marketing para o admin) — card centralizado numa coluna só, em qualquer
largura de tela.

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

## Navegação (prototype-nav)
Toda tela criada aqui deve ser registrada em `../prototype-nav/nav.config.js`
("Jornada · Admin"), mesma convenção já usada por `app/`/`landing/`.

## Screens status
| Tela | Status |
|---|---|
| Login (admin) | Done |
| Recuperar senha (admin) | Done |
| Código de verificação (admin) | Done |
| Criar nova senha (admin) | Done |
