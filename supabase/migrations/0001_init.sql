-- Questions table
create table questions (
  id uuid primary key default gen_random_uuid(),
  stage int not null,
  order_in_stage int not null,
  prompt text not null,
  options jsonb not null,
  correct_idx int not null,
  explanation text not null,
  created_at timestamptz default now(),
  unique (stage, order_in_stage)
);

-- User progress table
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id),
  chosen_idx int not null,
  correct boolean not null,
  answered_at timestamptz default now(),
  unique (user_id, question_id)
);

-- RLS policies
alter table questions enable row level security;
alter table user_progress enable row level security;

-- Anyone authenticated (including anon) can read questions
create policy "Questions are readable by authenticated users"
  on questions for select
  to authenticated
  using (true);

-- Users can only read their own progress
create policy "Users can read own progress"
  on user_progress for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can only insert their own progress
create policy "Users can insert own progress"
  on user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);
