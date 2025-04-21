Estrutura do projeto:

/radar-leilao-fe
├── public/
├── src/
│   ├── components/      # Componentes reutilizáveis (botões, inputs, headers, etc.)
│   ├── layouts/         # Estrutura de layout (header, footer, etc.)
│   ├── pages/           # Páginas (Next cuida do roteamento aqui)
│   ├── styles/          # CSS/SCSS/Modules ou Tailwind config
│   ├── lib/             # Funções auxiliares, serviços externos, utils
│   ├── types/           # Tipagens globais
│   ├── hooks/           # Custom React Hooks
│   └── services/        # API clients (ex: Axios)
├── .gitignore
├── README.md
├── global.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
