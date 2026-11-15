-- 1) 회원 프로필
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz,
    deleted_at timestamptz
);

-- 2) 할 일
create table public.todos(
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    user_name text not null default '',
    status text not null default 'READY' check (status in ('READY', 'PROGRESS','DONE')),
    title text not null,
    content text not null default '',
    due_date date, -- 마감일 (D-day, 날짜순 정렬)
    pinned_at timestamptz, -- 핀 고정 시각 (null이면 고정 안 함)
    sort_order integer not null default 0, -- 같은 날짜 안 우선순위 (드래그)
    created_at timestamptz,
    updated_at timestamptz,
    deleted_at timestamptz -- 휴지통 (null이면 목록, 값이 있으면 휴지통)
);
create index todos_user_idx on public.todos (user_id, deleted_at);

-- 3) RLS -- 로그인한 이용자의 데이터만 읽고 쓰기 (보안 정책)
alter table public.profiles enable row level security;
alter table public.todos enable row level security;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.todos to authenticated;

create policy "본인 프로필 조회" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "본인 프로필 수정" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "본인 할일 조회" on public.todos for select to authenticated using (user_id = (select auth.uid()));
create policy "본인 할일 등록" on public.todos for insert to authenticated with check (user_id = (select auth.uid()));
create policy "본인 할일 수정" on public.todos for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "본인 할일 삭제" on public.todos for delete to authenticated using (user_id = (select auth.uid()));

-- 4) 회원가입 & 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();