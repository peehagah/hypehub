# HypeHub NEO — Marketing AI Platform

Dashboard de operações de marketing com IA, integrado ao Opensquad.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — banco de dados (PostgreSQL)
- **Claude API** (Anthropic) — agentes de IA
- **Apify** — scraping de métricas sociais

## Setup local

```bash
npm install
npm run dev   # http://localhost:3000
```

Variáveis de ambiente necessárias (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
APIFY_API_TOKEN=
```

## Deploy (Vercel)

1. Conectar repo `peehagah/hypehub` no Vercel
2. Adicionar todas as env vars acima nas configurações do projeto
3. Deploy automático a cada push na branch `master`

## Estrutura

```
app/
  (dashboard)/     # Páginas protegidas (dashboard, workspaces, prospects, office)
  api/             # Route handlers (chat, metrics, seed, migrations)
  auth/            # Login
components/        # Componentes React
lib/               # Supabase client, types, utils
supabase/          # Migrations SQL
scripts/           # Scripts utilitários
```
