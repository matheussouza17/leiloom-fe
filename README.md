Estrutura do projeto:

/nome-do-projeto
│
├── public/              # Arquivos estáticos (imagens, fontes, etc.)
├── src/
│   ├── components/      # Componentes reutilizáveis (botões, inputs, headers, etc.)
│   ├── layouts/         # Estrutura de layout (header, footer, etc.)
│   ├── pages/           # Páginas (Next cuida do roteamento aqui)
│   ├── styles/          # CSS/SCSS/Modules ou Tailwind config
│   ├── lib/             # Funções auxiliares, serviços externos, utils
│   ├── types/           # Tipagens globais
│   ├── hooks/           # Custom React Hooks
│   └── services/        # API clients (ex: Axios)