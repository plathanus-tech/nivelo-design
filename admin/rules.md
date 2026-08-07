# rules.md — Nivelo Admin

Snapshot do que já existe em `admin/`. Ver `app/rules.md` pro catálogo
completo de componentes/tokens/classes de página já validados no resto do
sistema — `admin/` reaproveita o MESMO Storybook, então qualquer componente
documentado lá (Input, Button, Table, Dialog, Dropdown, Feedback, etc.) já
está disponível aqui sem repetir a documentação.

## Componentes usados até agora
- **Input** (`Input.module.css`) — campo Usuário/E-mail e Senha do login.
- **Button** (`Button.module.css`) — botão "Entrar".
- **Feedback** (`Feedback.module.css`) — banner de erro de autenticação
  (`.alert.error`), mesmo padrão de `app/screens/login.html`.

## Colisão de classes conhecida (herdada do resto do sistema)
Input×Checkbox (`.wrapper`/`.label`/`.input` compartilhados entre
`Input.module.css` e `Checkbox.module.css`) — mesma causa raiz documentada em
`app/rules.md`/`app/CLAUDE.md`. Login do admin hoje só usa Input, sem
Checkbox — se um "Lembrar-me" for adicionado, replicar o mesmo fix já usado
em `app/shared/page-login.css` (`.wrapper.login-field`/`.wrapper.login-checkbox`
com classe extra + especificidade reforçada).

## Guard hidden+display
Toda classe que alterna via atributo `hidden` precisa de
`[hidden]{display:none}` desde a criação (regra permanente do projeto,
`.login-alert[hidden]` já nasce coberta em `page-admin-login.css`).

## Screens registered
### Login (admin)
`admin/screens/login.html` + `admin/shared/page-admin-login.css` +
`admin/shared/admin-login.js`. Réplica 1:1 do layout de 2 colunas do login
do produto (`app/shared/page-login.css`): painel institucional com
`admin nivelo.png` (em vez de `gestão com nivelo.png`) no desktop 1024px+,
card sobreposto à imagem, mesmo shell/tipografia/espaçamento/animações.
Título "Painel Administrativo", subtítulo mencionando clientes/usuários/
assinaturas/configurações. Card da imagem (`.admin-login-panel-copy`) com
texto próprio ("Gestão da plataforma em um só lugar"). Campo CPF/CNPJ
substituído por **E-mail** (validação de formato, sem máscara de documento).
Link "Criar conta" removido por completo (administradores não têm
self-signup) — "Lembrar-me" e "Esqueci minha senha" mantidos, mesmo
comportamento do produto. Banner de sucesso novo (`#admin-login-success-
banner`) exibido via `#state=passwordchanged`, usado como retorno do fluxo
de recuperação de senha (ver abaixo — não há dashboard administrativo ainda,
então a confirmação de sucesso do fluxo de senha aparece aqui). Estados via
hash (não query string, mesmo motivo documentado em `app/shared/login.js`):
`invalid`, `loading`, `error`, `passwordchanged`.

### Recuperar senha (admin) — fluxo de recuperação de senha, etapa 1
`admin/screens/recuperar-senha.html` + `admin/shared/page-admin-recuperar-
senha.css` + `admin/shared/admin-recuperar-senha.js`. Réplica exata de
`app/screens/recuperar-senha.html`, só com o campo Telefone substituído por
**E-mail** (validação de formato via regex, sem máscara). Textos adaptados
pra mencionar e-mail em vez de WhatsApp/SMS. Redireciona pra
`codigo-verificacao.html`, gravando o e-mail em
`sessionStorage['nivelo.admin.recovery.email']` (mesmo padrão de handoff
entre páginas já usado no produto). Estados: `required`, `invalid`,
`senderror`.

### Código de verificação (admin) — etapa 2
`admin/screens/codigo-verificacao.html` + `admin/shared/page-admin-codigo-
verificacao.css` + `admin/shared/admin-codigo-verificacao.js`. Réplica exata
de `app/screens/codigo-verificacao.html` (6 `Input` avulsos formando o OTP,
contagem regressiva de 5 minutos, reenvio, código de teste fixo `111111`,
mesmo limite de 5 tentativas). Só o texto/mascaramento do destinatário
mudou: `maskEmail()` (em vez de `maskPhone()`) mostra a 1ª letra do e-mail +
pontos + domínio completo (ex. `a•••••@nivelo.com.br`). Todos os banners
mencionam e-mail, nunca telefone/WhatsApp/SMS. Redireciona pra
`criar-nova-senha.html`. Estados: `incorrect`, `expired`, `toomany`,
`commerror`.

### Criar nova senha (admin) — etapa 3
`admin/screens/criar-nova-senha.html` + `admin/shared/page-admin-criar-nova-
senha.css` + `admin/shared/admin-criar-nova-senha.js`. Réplica exata de
`app/screens/criar-nova-senha.html` (2 campos de senha com mostrar/ocultar,
5 critérios de segurança validados em tempo real, banner de "senha igual à
anterior" preparado pro futuro). **Única adaptação de destino:** como o
painel administrativo ainda não tem uma tela de Dashboard, o redirecionamento
final (etapas 5 "confirmação de sucesso" + 6 "retorno para o login" do
fluxo) aponta pra `login.html#state=passwordchanged` em vez de
`dashboard.html#state=success` — mesmo mecanismo (`sessionStorage` + toast/
banner no destino), só o destino mudou por não existir dashboard ainda.
Estados: `required`, `criteriaunmet`, `mismatch`, `sameasold`, `saveerror`.
