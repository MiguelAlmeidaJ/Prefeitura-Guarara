# Atualização visual — Header, Footer e Sidebar

## Portal público
- A única marca do cabeçalho é a imagem enviada em **Configurações → Identidade visual**.
- Se a logo estiver indisponível ou não carregar, aparece um **skeleton** neutro — sem símbolo/letra substituto nem nome duplicado.
- O menu público fica **centralizado** independentemente do número de itens. Em telas menores vira menu expansível.
- O rodapé agora usa fundo claro, a logo real e quatro áreas: identidade, institucional, serviços e atendimento.
- As rotas de navegação são sem acentuação, incluindo `/servicos/protocolo` e `/servicos/emails`.

## Administração
- Sidebar branca com divisórias suaves, marca oficial e ícones SVG **apenas nos grupos**.
- Seções expansíveis: Conteúdo, Transparência, Serviços, Secretarias e Configurações.
- Itens filhos usam rótulos sem ícones, estado ativo e linha guia.
- Barra recolhível; estado salvo no armazenamento local do navegador. Ao clicar em um grupo no modo reduzido, o menu se expande.
- No celular, abre como drawer com fundo escurecido e botão de fechar.
- A área de trabalho e o cabeçalho administrativo permanecem disponíveis com o menu recolhido.

## Atualização
Não há mudanças no Prisma nem migrações:
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
```
Verificar em `http://localhost:3006` e `http://localhost:3006/admin`.

Nota: a logo real já cadastrada em `/admin/configuracoes/identidade` é usada no header, rodapé e sidebar; o arquivo é mantido no armazenamento persistente do site. Nenhuma imagem oficial foi inventada ou substituída por arte gráfica.

Teste manual após o build: desktop com sidebar expandida e recolhida, drawer no celular, links de todos os grupos, submenu público, skeleton (simulando imagem indisponível), contraste e página de login.
