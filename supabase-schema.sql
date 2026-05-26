-- =============================
-- MindBase - Supabase SQL Schema
-- شغّل هذا في Supabase SQL Editor
-- =============================

-- جدول المحادثات الخاصة
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'محادثة جديدة',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- جدول الغرف المشتركة
create table if not exists shared_rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users(id) on delete set null,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: كل مستخدم يرى محادثاته فقط
alter table conversations enable row level security;

drop policy if exists "user sees own conversations" on conversations;
create policy "user sees own conversations"
  on conversations for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- RLS: الغرف المشتركة يراها كل المستخدمين المسجّلين
alter table shared_rooms enable row level security;

drop policy if exists "authenticated users see shared rooms" on shared_rooms;
drop policy if exists "authenticated users read shared rooms" on shared_rooms;
drop policy if exists "authenticated users create shared rooms" on shared_rooms;
drop policy if exists "authenticated users post to shared rooms" on shared_rooms;
drop policy if exists "owners delete shared rooms" on shared_rooms;

create policy "authenticated users read shared rooms"
  on shared_rooms for select
  to authenticated
  using (true);

create policy "authenticated users create shared rooms"
  on shared_rooms for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

create policy "authenticated users post to shared rooms"
  on shared_rooms for update
  to authenticated
  using (true)
  with check (true);

create policy "owners delete shared rooms"
  on shared_rooms for delete
  to authenticated
  using ((select auth.uid()) = created_by);

-- أعضاء الغرفة يحدّثون الرسائل فقط؛ الاسم والمالك غير قابلين للتعديل منهم.
revoke update on table shared_rooms from authenticated;
grant update (messages, updated_at) on table shared_rooms to authenticated;
