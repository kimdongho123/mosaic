create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  prompt text not null,
  input_image_url text not null,
  input_image_key text not null,
  output_image_url text,
  output_image_key text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "generations_select_own"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "generations_insert_own"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "generations_update_own"
  on public.generations for update
  using (auth.uid() = user_id);
