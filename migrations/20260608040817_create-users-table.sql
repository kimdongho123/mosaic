-- users 테이블: auth.users와 1:1 연동
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.users enable row level security;

-- 본인 프로필만 조회 가능
create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

-- 본인 프로필만 수정 가능
create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- 신규 사용자 등록 시 자동으로 users 행 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    new.profile->>'name',
    new.profile->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
