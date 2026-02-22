create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null,
  email text not null,
  avatar_url text,
  notification_days_before integer default 1,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  position integer not null default 0,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  expiry_date timestamptz,
  priority_label text not null default 'Medium',
  priority_color text not null default '#eab308',
  priority_order integer not null default 1,
  category_id uuid not null references categories(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table drafts (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  title text default '',
  description text default '',
  user_id uuid not null references profiles(id) on delete cascade,
  updated_at timestamptz default now()
);

create table history (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('board', 'card')),
  action text not null,
  details jsonb default '{}',
  ticket_id uuid references tickets(id) on delete set null,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table categories enable row level security;
alter table tickets enable row level security;
alter table drafts enable row level security;
alter table history enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on profiles for delete
  using (auth.uid() = id);

create policy "Users can view their own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on categories for delete
  using (auth.uid() = user_id);

create policy "Users can view their own tickets"
  on tickets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tickets"
  on tickets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tickets"
  on tickets for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tickets"
  on tickets for delete
  using (auth.uid() = user_id);

create policy "Users can view their own drafts"
  on drafts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own drafts"
  on drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own drafts"
  on drafts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own drafts"
  on drafts for delete
  using (auth.uid() = user_id);

create policy "Users can view their own history"
  on history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own history"
  on history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own history"
  on history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own history"
  on history for delete
  using (auth.uid() = user_id);

create index profiles_id_idx on profiles(id);
create index categories_user_id_idx on categories(user_id);
create index tickets_user_id_idx on tickets(user_id);
create index tickets_category_id_idx on tickets(category_id);
create index drafts_user_id_idx on drafts(user_id);
create index history_user_id_idx on history(user_id);

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on tickets
  for each row execute function handle_updated_at();
