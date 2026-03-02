# TaskBoard

A Kanban-style task management app built with Next.js 15, TypeScript, Redux Toolkit, and Supabase. Organize work into drag-and-drop columns with real-time history tracking, expiry notifications, and offline draft saving.

## Features

- **Authentication** — Email/password registration and login via Supabase Auth with protected routes
- **Board Management** — Create, rename, reorder, and delete columns with drag and drop
- **Task Tracking** — Tickets with title, description, due date, and custom priority levels
- **Drag and Drop** — Native HTML5 API for reordering columns and moving tickets between categories
- **Draft Auto-Save** — Unsaved edits are persisted as drafts and restored on next open
- **Expiry Notifications** — Color-coded badges and toast alerts for approaching and overdue tasks
- **Board History** — Paginated slide-out panel showing all board-level activity grouped by date
- **Mobile Support** — Responsive layout with tab-based column navigation on small screens

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| State | Redux Toolkit |
| Backend | Supabase (Auth + PostgreSQL) |
| Drag & Drop | Native HTML5 API |
| Containerization | Docker + Docker Compose |

## Prerequisites

- Node.js 18 or later
- A [Supabase](https://supabase.com) account with a new project

## Installation

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todoboard
npm install
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy the project URL and anon key into `.env.local`
3. Go to **SQL Editor** and run the contents of `src/db/schema.sql` to create the required tables
4. Under **Authentication → Providers**, ensure Email is enabled

## Docker Setup

Make sure `.env.local` exists with your Supabase credentials, then:

```bash
docker-compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000).

To run in the background:

```bash
docker-compose up --build -d
```

Stop containers:

```bash
docker-compose down
```

## Usage

- **Create a column** — Click "Add column" on the board
- **Add a task** — Click "Add task" inside any column, or press **N** to quickly open a new task form for the first column
- **Edit a task** — Click any ticket card to open the detail view
- **Move tickets** — Drag and drop tickets between columns or reorder within a column
- **Reorder columns** — Drag columns by their header
- **Board history** — Click "History" in the navbar to open the activity panel
- **Notifications** — Click the bell icon to configure expiry warning thresholds

## Folder Structure

```
app/                        # Next.js App Router pages
├── api/register/           # Registration endpoint
├── board/                  # Main board page
└── login/                  # Login page

src/
├── components/
│   ├── board/              # Board, columns, cards, modals, history panel
│   ├── notifications/      # Toast system and notification settings
│   └── ui/                 # Shared UI primitives (Button, Input, ConfirmDialog)
├── db/
│   └── schema.sql          # Supabase table definitions
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api/                # Supabase data access (tickets, categories, history)
│   ├── auth.ts             # Auth helpers
│   ├── notifications.ts    # Expiry calculation logic
│   └── supabase.ts         # Supabase client
├── store/
│   ├── slices/             # Redux slices (auth, board, tickets, history, drafts)
│   ├── store.ts            # Store configuration and typed hooks
│   └── provider.tsx        # Redux Provider wrapper
└── types/
    └── index.ts            # Shared TypeScript interfaces
```

## Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # Run ESLint
```

## License

MIT
