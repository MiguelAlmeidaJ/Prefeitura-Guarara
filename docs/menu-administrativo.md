# Gerenciador do Menu do Portal

Acesse `/admin/menu` com uma sessão administrativa. O módulo utiliza a mesma identidade visual do restante do painel.

- **Nome**: texto do link exibido no menu
- **Ascendente**: item pai opcional, que cria submenus e níveis subordinados
- **Link**: rota interna (ex.: `/transparencia`) ou endereço HTTP(S) completo
- **Abrir em nova guia**: `target="_blank"` com `rel="noopener noreferrer"`; recomendado para destinos externos
- **Arrastar e soltar**: reordena apenas itens no mesmo nível; a ordem é gravada na API imediatamente
- **Mudar de nível**: editar o campo Ascendente; a API recusa hierarquias cíclicas
- **Excluir**: não é permitido apagar um item que ainda contém submenus, evitando perda acidental

Os endpoints de criação/alteração/exclusão exigem perfil `ADMINISTRADOR` ou `GESTOR`. O menu público em `GET /api/menu` é acessível sem autenticação e o Next.js consulta a API a cada carregamento da página, sem cache. Antes do primeiro cadastro, mantém-se a navegação estática original.

## Atualização local

```powershell
git pull origin create
npm install
npm run db:generate
npm run db:migrate
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

A migração adiciona a tabela `MenuItem`. Não exclui tabelas ou dados já existentes.

## Menu público e atualização imediata

O layout público usa `dynamic = 'force-dynamic'` e consulta `GET /api/menu` com `cache: 'no-store'`. Assim, a navegação não fica congelada no HTML pré-renderizado durante `next build`. A API continua na porta 3007 (configurada como `API_URL` no processo `guarara-web` do PM2).

Para conferir os dados salvos, abra `http://localhost:3007/api/menu`: deve retornar um array JSON contendo o item cadastrado. Se o retorno tiver o item mas o portal ainda mostrar a navegação antiga, atualize o build e reinicie o processo web; confira os logs de `guarara-web`. O menu padrão só aparece quando a API retorna lista vazia ou não pode ser consultada.

Depois de cadastrar um item, recarregue o portal em `http://localhost:3006` para vê-lo. Não é necessário alterar o Prisma nem migrar o banco para esta correção.
