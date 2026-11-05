-- Execute no SQL Editor do Supabase.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text,
 role text not null default 'student' check (role in ('student','admin')),
 created_at timestamptz not null default now()
);
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 120),
 subject text not null check (char_length(subject) between 1 and 50),
 due date,
 done boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
create policy "profile select own" on public.profiles for select to authenticated using (id=auth.uid());
create policy "profile update own name" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid() and role='student');
create policy "tasks own select" on public.tasks for select to authenticated using (user_id=auth.uid());
create policy "tasks own insert" on public.tasks for insert to authenticated with check (user_id=auth.uid());
create policy "tasks own update" on public.tasks for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "tasks own delete" on public.tasks for delete to authenticated using (user_id=auth.uid());
-- Create a profile automatically for each new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
 insert into public.profiles(id,display_name) values(new.id,coalesce(new.raw_user_meta_data->>'display_name',''));
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
-- To grant admin, run manually in SQL Editor after replacing the email:
-- update public.profiles set role='admin'
-- where id=(select id from auth.users where email='SEU_EMAIL');
