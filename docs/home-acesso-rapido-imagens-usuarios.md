# Home e Usuários — Guarará

## Página inicial
A antiga seção “Como podemos ajudar?” passa a usar **duas colunas**, em desktop:
- **40% — Imagens da Cidade:** carrossel de fotos administradas pelo CMS, com legenda, setas de navegação, indicadores e reprodução automática a cada 6,5 segundos
- **60% — Acesso Rápido:** links objetivos com apenas o título e uma seta discreta, sem ícones, descrições ou cartões grandes

Em telas pequenas o layout adapta-se para uma coluna. As imagens não são inventadas ou importadas: são cadastradas no painel.

A migração inclui os **seis acessos anteriores** como registros iniciais editáveis, preservando o conteúdo da home. A galeria começa vazia até o envio das primeiras fotos.

## Administração / Conteúdo
- `/admin/acesso-rapido`: nome, link, abrir em nova guia, ativo/inativo; edição, exclusão e ordenação por arrastar e soltar
- `/admin/imagens-da-cidade`: título/legenda, imagem PNG/JPG/WebP até 4 MB, ativo/inativo; edição, exclusão e ordenação por arrastar e soltar
- As imagens são enviadas por `/api/admin-capa-comunicado` e persistidas no diretório já usado para uploads de imagens (`apps/web/storage/capas-comunicados`, ou configuração equivalente). Imagens publicadas são servidas por `/api/capas-comunicados/[arquivo]`.
- Os cadastros têm permissão de escrita para ADMINISTRADOR e GESTOR.

**Removidos somente do menu lateral**: “Páginas e conteúdos” e “Tabelas reutilizáveis”. As rotas antigas e seus registros foram preservados para evitar perda de dados.

## Configurações / Usuários
- `/admin/configuracoes/usuarios`: lista de usuários com nome, email, papel e situação
- Cadastro de novos usuários, edição de dados, papel e senha, ativação/desativação de contas
- Apenas **ADMINISTRADOR** pode consultar ou gerenciar esta página. O link fica escondido para outros perfis e a API valida permissões de forma independente.
- Senhas com mínimo de 12 caracteres, armazenadas com hash bcrypt.
- Impede desativar ou rebaixar o próprio perfil, e protege contra a desativação do último administrador ativo.
- As contas não são excluídas fisicamente, para preservar a rastreabilidade.

## API e banco
Migração `20261119100000_home_acesso_rapido_imagens`:
- Cria `AcessoRapido` e `ImagemCidade`
- Inicializa seis atalhos existentes
- Não remove `Pagina`, `Tabela`, `Usuario` ou qualquer dado preexistente

Endpoints públicos:
- `GET /api/home/conteudo` retorna acessos e fotos ativos, ordenados

Endpoints administrativos protegidos:
- `GET/POST /api/admin/home/acessos`, `PATCH/DELETE /api/admin/home/acessos/:id`, `POST /api/admin/home/acessos/ordenar`
- `GET/POST /api/admin/home/fotos`, `PATCH/DELETE /api/admin/home/fotos/:id`, `POST /api/admin/home/fotos/ordenar`
- `GET/POST /api/admin/usuarios`, `PATCH /api/admin/usuarios/:id`

## Atualização local
```bash
git pull origin create
pm2 stop guarara-api
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
pm2 status
```

Reinicie a API e o Next.js somente após a compilação terminar com sucesso. Testar a home no desktop e no celular, o carrossel com duas ou mais fotos, a ordenação de links e fotos, e as permissões de usuários. O build e a migração ainda precisam ser verificados na máquina local.
