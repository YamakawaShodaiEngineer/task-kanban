-- タスク管理カンバンのタスクテーブル
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 1000),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_status_created_at_idx on public.tasks (status, created_at);

-- updated_at を更新時に自動で現在時刻にする
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- 認証未導入のため、anon / authenticated にCRUDを許可する
alter table public.tasks enable row level security;

create policy "tasks_select_all" on public.tasks
  for select to anon, authenticated using (true);

create policy "tasks_insert_all" on public.tasks
  for insert to anon, authenticated with check (true);

create policy "tasks_update_all" on public.tasks
  for update to anon, authenticated using (true) with check (true);

create policy "tasks_delete_all" on public.tasks
  for delete to anon, authenticated using (true);
