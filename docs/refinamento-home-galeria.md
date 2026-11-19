# Refinamento visual da home e limite de imagens (19/11/2026)

## Seção inicial
A composição permanece em **40% / 60%** no desktop, mas agora privilegia a fotografia e a leitura.

- Fundo branco, títulos com hierarquia editorial e mais respiro.
- Coluna esquerda: galeria com cantos arredondados, legenda legível sobre gradiente escuro, contador de fotos, botões discretos de navegação no canto superior e indicadores de progresso.
- Coluna direita: acessos em lista minimalista com linhas divisórias, numeração pequena e seta, sem cartões, ícones grandes nem descrições.
- Em telas móveis, galeria e links ficam empilhados; os links passam a uma coluna em dispositivos estreitos.
- Transição automática a cada seis segundos, interrompida enquanto o usuário interage com a galeria.

## Limite de seis fotografias
- O endpoint público da home retorna **no máximo seis fotos ativas**, respeitando a ordem definida no painel.
- A API administrativa impede o **cadastro de uma sétima imagem** (HTTP 409).
- A tela `/admin/imagens-da-cidade` mostra quantas fotografias estão cadastradas e desativa o cadastro quando o limite é atingido.
- Fotografias existentes não são removidas automaticamente. Se houver mais de seis registros anteriores, remova os excedentes manualmente após conferir quais deseja manter.
- Não foi necessário alterar o Prisma nem executar novas migrações.

## Atualização
```bash
git pull origin create
npm run build
pm2 restart ecosystem.config.cjs --update-env
```

Reinicie o PM2 apenas se o build terminar com sucesso. Verifique a aparência em desktop, celular, navegação entre fotos e a tentativa de adicionar a sétima foto. O build ainda não foi executado no ambiente local do usuário.
