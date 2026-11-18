# Gerenciador do Menu do Portal

Acesse `/admin/menu` com uma sessão administrativa. O módulo utiliza a mesma identidade visual do restante do painel.

- **Nome**: texto do link exibido no menu
- **Ascendente**: item pai opcional, que cria submenus e níveis subordinados
- **Link**: rota interna (ex.: `/transparencia`) ou endereço HTTP(S) completo
- **Abrir em nova guia**: `target="_blank"` com `rel="noopener noreferrer"`; recomendado para destinos externos
- **Arrastar e soltar**: reordena apenas itens no mesmo nível; a ordem é gravada na API imediatamente
- **Mudar de nível**: editar o campo Ascendente; a API recusa hierarquias cíclicas
- **Excluir**: não é permitido apagar um item que ainda contém submenus, evitando perda acidental

Os endpoints de criação/alteração/exclusão exigem perfil `ADMINISTRADOR` ou `GESTOR`. O menu público em `GET /api/menu` é acessível sem autenticação e o Next.js revalida a consulta a cada 30 segundos. Antes do primeiro cadastro, mantém-se a navegação estática original.

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
