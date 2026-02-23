# TaskFlow

A Kanban-style to-do board application built with Next.js, TypeScript, and Supabase.

## Features

**Authentication** — Email/password and Google sign-in via Supabase Auth. Protected routes with middleware.

**Task Management** — Create categories (columns) and tickets. Each ticket has a title, description, expiry date, and a user-defined priority level with custom colors.

**Drag and Drop** — Built with the native HTML Drag and Drop API. Supports reordering columns, moving tickets between categories, and updating priority via drag.

**Draft Auto-Save** — Ticket descriptions are saved as drafts automatically when editing is interrupted (blur, navigation, tab close).

**Expiry Notifications** — Color-coded badges based on expiry proximity, toast alerts for approaching deadlines, and a configurable notification threshold.

**Update History** — Board-level history (column reorders, category changes) and card-level history (edits, moves, priority updates) with timestamps.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4 + shadcn/ui
- Redux Toolkit
- Supabase (Auth + PostgreSQL)
- Native HTML Drag and Drop API

## Getting Started

### Prerequisites

- Node.js >= 18
- A Supabase project with Auth enabled

### Setup

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todoboard 
npm install
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then run:

```bash
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/             # Login, register
│   ├── (dashboard)/board/  # Main board page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── board/              # Board, Column, Card
│   ├── auth/               # Auth forms
│   ├── modals/             # Create/edit modals
│   ├── notifications/
│   └── history/
├── hooks/
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── validators.ts
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── boardSlice.ts
│   │   ├── historySlice.ts
│   │   └── notificationSlice.ts
│   ├── hooks.ts
│   └── index.ts
├── types/
└── middleware.ts
```

## Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript check
```

## Git Workflow

- `main` — production-ready
- `develop` — integration branch
- Feature branches: `feat/auth`, `feat/board-dnd`, `feat/notifications`, etc.
- Commit messages follow Conventional Commits

## License

MIT