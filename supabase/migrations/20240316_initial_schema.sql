
-- Create tables for our application
create table confessions (
  id bigint primary key generated always as identity,
  text text not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_anonymous boolean default true
);

create table comments (
  id bigint primary key generated always as identity,
  confession_id bigint references confessions(id) on delete cascade,
  text text not null,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table confession_likes (
  confession_id bigint references confessions(id) on delete cascade,
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (confession_id, user_id)
);

-- Set up Row Level Security (RLS)
alter table confessions enable row level security;
alter table comments enable row level security;
alter table confession_likes enable row level security;

-- Create policies
create policy "Confessions are viewable by everyone"
  on confessions for select
  using (true);

create policy "Users can insert their own confessions"
  on confessions for insert
  with check (auth.uid() = user_id);

create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Users can insert their own comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can manage confession likes"
  on confession_likes for all
  using (auth.uid() = user_id);
