-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Problems table
create table problems (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  leetcode_id integer not null,
  title text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  tags text[] default '{}',
  created_at timestamptz default now(),
  unique (user_id, leetcode_id)
);

-- Reviews table (SRS state per problem per user)
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid references problems(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'learning' check (status in ('unseen', 'learning', 'reviewing', 'mastered')),
  ease_factor decimal not null default 2.5,
  interval integer not null default 1,
  due_date date not null default current_date,
  last_reviewed_at timestamptz,
  unique (problem_id, user_id)
);

-- Review logs (history of each review session)
create table review_logs (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references reviews(id) on delete cascade not null,
  problem_id uuid references problems(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  error_type text not null check (error_type in ('no_idea', 'cant_code', 'bug', 'edge_case', 'too_slow', 'none')),
  note text default '',
  reviewed_at timestamptz default now()
);

-- RLS policies
alter table problems enable row level security;
alter table reviews enable row level security;
alter table review_logs enable row level security;

create policy "Users can manage own problems"
  on problems for all using (auth.uid() = user_id);

create policy "Users can manage own reviews"
  on reviews for all using (auth.uid() = user_id);

create policy "Users can manage own review logs"
  on review_logs for all using (auth.uid() = user_id);

-- Index for due reviews
create index reviews_due_date_idx on reviews(user_id, due_date);
