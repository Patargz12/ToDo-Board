## Getting started

You'll need Node 18+ and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todo-board
code .
npm install
Create a .env.local ( .env.example has the values , just copy and paste in the .env.local )
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're in.

## Using the app

**Setting up your board.** When you first log in, the board will be empty. Hit **Add column** to create your first one — "To Do", "In Progress", "Done", or whatever fits your workflow. You can add as many as you want and rename them later by double-clicking the header. Drag columns by their header to reorder them.

**Adding and editing tasks.** Click **Add task** at the bottom of any column to open the create form. Fill in a title, description, due date, and priority, then save. To edit something later, just click the card. Any unsaved changes are automatically kept as a draft, so if you close the detail view mid-edit, it'll be there when you come back.

**Moving tasks around.** Drag a card to a different column or drop it between other cards to reorder. The browser handles all of this natively so it's responsive without any extra plugins.

**Staying on top of due dates.** Tickets close to their due date show a colored badge, and overdue ones are marked differently so they're easy to spot. Click the bell icon in the navbar to set how far in advance you want warnings to appear — the default is a few days out.

**Board history.** The **History** button in the navbar opens a side panel with a full log of activity on your board. It's grouped by date and paginated, so even on an older board it doesn't become a wall of text.

## Running with Docker

The Docker setup is a multi-stage build it handles deps, the build step, and produces a lean Alpine production image. You'll need [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

Clone the repo and set up your environment variables:

```bash
git clone https://github.com/Patargz12/ToDo-Board.git
cd todo-board
Create a .env.local ( .env.example has the values , just copy and paste )
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Then build and start it:

```bash
docker compose --env-file .env.local up --build -d
```

Visit http://localhost:3000 and you're up.

A few other commands worth knowing:

```bash
# Stream live logs
docker compose logs -f

# Shut it down
docker compose down

```


## What's in it

**Columns you actually control.** Add them, rename them, reorder them, delete them. Drag a column header left or right to reorganize your layout however you want.

**Tasks with enough context to be useful.** Every ticket has a title, description, due date, and priority. Click any card to open the full detail view.

**Drag and drop.** Move tickets between columns or reorder them within a column. It's built on the native HTML5 drag API — no extra libraries, no bloat.

**Draft saving.** Started editing a ticket and closed it without saving? It remembers. Come back to it later and it'll restore exactly where you left off.

**Expiry alerts.** Tickets near or past their due date get color-coded badges so they stand out. You can configure how far in advance you want the warnings to kick in.

**Board history.** There's a slide-out panel in the navbar that logs everything that's happened — tasks created, moved, renamed, deleted — grouped by date and paginated so it stays readable.

**Mobile friendly.** On smaller screens, columns switch to a tab-based layout so it's actually usable on your phone.

**Auth.** Email/password login through Supabase Auth. Your board data stays tied to your account.

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Redux Toolkit, and Supabase for auth and the database. Drag and drop is native HTML5 so there are no extra dependencies there. Docker support is included if you'd rather run it in a container.

## Try the demo

There's a live instance running with some pre-seeded data. Log in with these credentials and poke around — no setup needed:

```
Email:    demo@taskboard.dev
Password: demo1234
```

