-- User-owned bookmarks. The public recipe catalogue remains read-only app data.
create table if not exists public.saved_recipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

alter table public.saved_recipes enable row level security;
revoke all on table public.saved_recipes from anon, authenticated;
grant select, insert, delete on table public.saved_recipes to authenticated;

drop policy if exists "Users can view their own saved recipes" on public.saved_recipes;
create policy "Users can view their own saved recipes"
  on public.saved_recipes for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can save recipes for themselves" on public.saved_recipes;
create policy "Users can save recipes for themselves"
  on public.saved_recipes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can remove their own saved recipes" on public.saved_recipes;
create policy "Users can remove their own saved recipes"
  on public.saved_recipes for delete to authenticated
  using ((select auth.uid()) = user_id);
