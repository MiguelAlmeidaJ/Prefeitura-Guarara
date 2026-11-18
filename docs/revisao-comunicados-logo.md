# Revisão do editor de comunicados, capa individual e logo — Guarará

## Editor
O antigo `textarea` exibia a sintaxe de Markdown ao usuário. Agora é uma área de **edição visual** com formatação direta (negrito, itálico, parágrafos, subtítulos, listas e links). Os dados continuam armazenados em Markdown compatível com as publicações anteriores. O conteúdo é renderizado por componentes React, sem `dangerouslySetInnerHTML` na página pública. Os links aceitam `https://`, `http://` e `mailto:` (como no exemplo do e-mail de contato).

## Capa de cada comunicado
No formulário `/admin/comunicados`, selecione **Usar imagem padrão** ou **Imagem exclusiva deste comunicado**.
- Se escolher imagem exclusiva, envie arquivo PNG/JPG/WebP com até 4 MB.
- A imagem é enviada ao endpoint autenticado `POST /api/admin-capa-comunicado`, que valida assinatura do arquivo e origem.
- A referência é gravada em `Comunicado.capaArquivo`. Com `null`, usa a capa padrão.
- A capa exclusiva aparece na home, listagem pública e página individual.
- Arquivos ficam em `apps/web/storage/capas-comunicados` (ou pasta irmã de `SITE_IDENTITY_DIR`), fora da compilação. Faça backup.

## Logo
- Foram removidos os textos do topo da sidebar: fica apenas a logo real.
- A logo é solicitada pela URL versionada `/api/identidade/logo?v=...`, com consulta prévia em `/api/identidade/status`.
- O armazenamento usa nomes imutáveis para reduzir problemas de substituição de arquivos no Windows.
- A configuração verifica se o arquivo realmente existe. Se não existir, o site mantém o skeleton, **sem criar brasão falso**.

### Diagnóstico quando aparecer somente skeleton
1. Acesse `http://localhost:3006/api/identidade/status`. O campo `logo` deve conter `version`, e não ser `null`.
2. Abra `http://localhost:3006/api/identidade/logo` e verifique se a imagem é servida (HTTP 200).
3. Se `logo: null` ou a imagem devolver HTTP 404, acesse `/admin/configuracoes/identidade` e envie novamente a logo oficial. A imagem original não está no repositório Git, apenas no armazenamento da máquina.
4. Confirme que o PM2 usa `cwd=apps/web` e que a pasta `apps/web/storage/identidade` possui `identity.json` e o arquivo físico da logo.

## Atualização (Windows e PM2)
A migração `20261118210000_capa_comunicado` cria apenas a coluna opcional `capaArquivo` e mantém os comunicados existentes.

```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```

Build, migração, visual e upload ainda precisam ser testados na máquina onde o projeto está instalado.
