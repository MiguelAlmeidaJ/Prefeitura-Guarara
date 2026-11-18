# Autenticação administrativa

- Login independente em `/admin/login`, sem header nem footer públicos.
- Área protegida em `/admin` e `/admin/tabelas`; o layout do Next.js consulta `/api/admin/me` da API NestJS antes de renderizar.
- A rota Next.js `POST /api/admin-login` encaminha credenciais à API e grava o JWT em cookie `HttpOnly`, `SameSite=Lax`. Sem "lembrar", cookie de sessão; com "lembrar", cookie persistente por até 8 horas, limitado à validade atual do JWT.
- O navegador usa `/api/admin-proxy/admin/...`, que injeta o JWT no servidor. O token não fica em localStorage nem é devolvido ao JavaScript do painel.
- `POST /api/admin-logout` remove o cookie. Sem revogação server-side de JWT nesta versão.
- `/admin/esqueci-senha` informa que a recuperação automática não foi implementada; não promete enviar e-mails.
- Em ambientes com HTTPS, o cookie deve ser `Secure`. Para desenvolvimento com HTTP em localhost, ajuste `COOKIE_SECURE=false` no processo Next.js, se necessário. Em produção use HTTPS.
- Antes de produção: rate limit / lockout de login, recuperação segura por token único, auditoria, proteção CSRF adicional para ações mutáveis, revisão de tempo de sessão e rotação/revogação de tokens.

**Não use este fluxo em produção pública antes da revisão de segurança.**
