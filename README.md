# TaskBoard

A personal kanban board I built to actually keep track of things without relying on a third-party SaaS tool. It's a full-stack Next.js app backed by Supabase — you can drag tasks between columns, set due dates, get notified before things go overdue, and see a running history of everything that's happened on the board.

Nothing groundbreaking here, just a well-built tool that does what it needs to do.

## What's in it

- **Columns you control** — add, rename, reorder, and delete columns however you like. Drag them around by the header to reorganize.
- **Tasks with context** — each ticket has a title, description, due date, and priority. Click any card to open the full detail view.
- **Drag and drop** — move tickets between columns or reorder them within a column. Built with the native HTML5 drag API, no extra libraries.
- **Draft saving** — if you start editing a ticket and close it without saving, the draft is kept and restored next time you open it.
- **Expiry alerts** — tickets close to or past their due date get color-coded badges. You can also configure how far in advance you want to be warned.
- **Board history** — there's a slide-out panel in the navbar that shows everything that's happened on the board, grouped by date and paginated.
- **Works on mobile** — columns switch to a tab-based layout on smaller screens so it's actually usable.
- **Auth** — email/password login via Supabase Auth. Board data is tied to your account.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Redux Toolkit, Supabase (Auth + Postgres). Drag and drop is native HTML5 — no extra deps for that. Docker support included if you'd rather not run it bare.

## Demo

A live instance is running with pre-seeded data. You can log in with these credentials without any setup:

```
Email:    demo@taskboard.dev
Password: demo1234
```

> This account is read/write — feel free to create, move, and delete tasks.

## Getting started

You'll need Node 18+ and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todoboard
npm install
cp .env.example .env.local
```

Open `.env.local` and drop in your Supabase project URL and anon key:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then set up the database — go to the Supabase SQL editor and run the contents of `src/db/schema.sql`. That'll create all the tables. Make sure Email is enabled under **Authentication → Providers** and you're good.

```bash
npm run dev
```

Hit [http://localhost:3000](http://localhost:3000) and you're in.

## Using the app

Once you're logged in, here's how everything works:

**Setting up your board**

When you first land on the board, it'll be empty. Click **Add column** to create your first column — something like "To Do", "In Progress", "Done", or whatever workflow makes sense for you. You can add as many columns as you want and rename them later by double-clicking the column header. Drag columns left or right by their header to reorder them.

**Adding and editing tasks**

Click **Add task** at the bottom of any column to open the create form. Give it a title, optionally a description, a due date, and a priority level, then save. To edit a task later, just click the card and the detail view opens. Any changes you leave unsaved are automatically kept as a draft — if you come back to that ticket, it'll restore where you left off.

Press **N** anywhere on the board to quickly open a new task form for the first column, handy if you're just trying to capture something fast.

**Moving tasks around**

Drag any ticket card to a different column or drop it between cards to reorder it. The board uses the browser's native drag and drop — no plugins — so it's pretty responsive.

**Staying on top of due dates**

Tickets that are close to their due date will show a colored badge. Overdue ones are marked differently so they stand out. Click the bell icon in the navbar to configure how far in advance you want to start seeing warnings — default is a few days out, but you can tune it.

**Board history**

The **History** button in the navbar opens a side panel with a log of everything that's happened on your board — tasks created, moved, renamed, deleted. It's grouped by date and paginated so it doesn't get overwhelming.

## Docker

Runs as a multi-stage build — deps, build, and a lean Alpine production image. Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

**1. Clone and set up environment variables**

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todoboard
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

You can find all three values at **Supabase Dashboard → Project Settings → API**.

Before building, set up the database — go to your Supabase SQL editor and run the contents of `src/db/schema.sql`.

**2. Build and start**

```bash
docker compose --env-file .env.local up --build -d
```

**3. Open the app**

Visit [http://localhost:3000](http://localhost:3000).

**Other useful commands**

```bash
# View live logs
docker compose logs -f

# Stop the container
docker compose down

# Rebuild after code changes
docker compose --env-file .env.local up --build -d
```