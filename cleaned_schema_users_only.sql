-- =============================================
-- CORE: Extensions
-- =============================================
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =============================================
-- HELPER: updated_at trigger
-- =============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================
-- TABLE: users
-- =============================================
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  phone varchar(20),
  avatar_url varchar(500),
  avatar_public_id varchar(255),
  address text,
  city varchar(100),
  state varchar(100),
  zip_code varchar(20),
  role varchar(20) not null default 'user' check (role in ('user','admin')),
  is_verified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_users_updated_at
before update on public.users
for each row execute function set_updated_at();

-- =============================================
-- TABLE: food_donations
-- =============================================
create table if not exists public.food_donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  food_type varchar(50) not null,
  quantity varchar(100) not null,
  expiry_date date not null,
  pickup_location text not null,
  image_url varchar(500),
  image_public_id varchar(255),
  status varchar(20) not null default 'available'
    check (status in ('available','reserved','picked_up','expired','cancelled')),
  donor_contact jsonb,
  additional_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_food_donations_updated_at
before update on public.food_donations
for each row execute function set_updated_at();

-- =============================================
-- TABLE: pickup_requests
-- =============================================
create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references public.food_donations(id) on delete cascade,
  requester_id uuid not null references public.users(id) on delete cascade,
  status varchar(20) not null default 'pending'
    check (status in ('pending','approved','rejected','cancelled','completed')),
  message text,
  pickup_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger trg_pickup_requests_updated_at
before update on public.pickup_requests
for each row execute function set_updated_at();

-- =============================================
-- TABLE: ai_recipes
-- =============================================
create table if not exists public.ai_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  ingredients jsonb not null,
  instructions jsonb not null,
  prep_time varchar(50),
  servings int,
  difficulty varchar(20) check (difficulty in ('Easy','Medium','Hard')),
  created_at timestamptz default now()
);

-- =============================================
-- TABLE: feedback
-- =============================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  name varchar(100),
  email varchar(255),
  subject varchar(255),
  message text not null,
  rating int check (rating between 1 and 5),
  category varchar(50) not null default 'general'
    check (category in ('general','bug_report','feature_request','complaint','praise')),
  status varchar(20) not null default 'open'
    check (status in ('open','in_progress','resolved','closed')),
  created_at timestamptz default now()
);

-- =============================================
-- TABLE: user_ratings
-- =============================================
create table if not exists public.user_ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references public.users(id) on delete cascade,
  rated_user_id uuid not null references public.users(id) on delete cascade,
  donation_id uuid references public.food_donations(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);

create index if not exists idx_food_donations_donor_id on public.food_donations(donor_id);
create index if not exists idx_food_donations_status on public.food_donations(status);
create index if not exists idx_food_donations_food_type on public.food_donations(food_type);
create index if not exists idx_food_donations_expiry_date on public.food_donations(expiry_date);
create index if not exists idx_food_donations_created_at on public.food_donations(created_at);

create index if not exists idx_pickup_requests_donation_id on public.pickup_requests(donation_id);
create index if not exists idx_pickup_requests_requester_id on public.pickup_requests(requester_id);
create index if not exists idx_pickup_requests_status on public.pickup_requests(status);

create index if not exists idx_ai_recipes_user_id on public.ai_recipes(user_id);
create index if not exists idx_ai_recipes_created_at on public.ai_recipes(created_at);

create index if not exists idx_feedback_user_id on public.feedback(user_id);
create index if not exists idx_feedback_status on public.feedback(status);
create index if not exists idx_feedback_category on public.feedback(category);
create index if not exists idx_feedback_created_at on public.feedback(created_at);

create index if not exists idx_user_ratings_rater_id on public.user_ratings(rater_id);
create index if not exists idx_user_ratings_rated_user_id on public.user_ratings(rated_user_id);
create index if not exists idx_user_ratings_donation_id on public.user_ratings(donation_id);

-- =============================================
-- RLS ENABLE
-- =============================================
alter table public.users enable row level security;
alter table public.food_donations enable row level security;
alter table public.pickup_requests enable row level security;
alter table public.ai_recipes enable row level security;
alter table public.feedback enable row level security;
alter table public.user_ratings enable row level security;

-- =============================================
-- RLS POLICIES
-- =============================================

-- USERS
drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users
  for update using (auth.uid() = id);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users
  for insert with check (auth.uid() = id);

-- Allow admins to view all users (optional, used by admin UIs)
drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin" on public.users
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- FOOD DONATIONS
drop policy if exists "donations_public_available" on public.food_donations;
create policy "donations_public_available" on public.food_donations
  for select using (status = 'available' and expiry_date >= current_date);

drop policy if exists "donations_select_own" on public.food_donations;
create policy "donations_select_own" on public.food_donations
  for select using (auth.uid() = donor_id);

drop policy if exists "donations_insert_own" on public.food_donations;
create policy "donations_insert_own" on public.food_donations
  for insert with check (auth.uid() = donor_id);

drop policy if exists "donations_update_own" on public.food_donations;
create policy "donations_update_own" on public.food_donations
  for update using (auth.uid() = donor_id);

drop policy if exists "donations_delete_own" on public.food_donations;
create policy "donations_delete_own" on public.food_donations
  for delete using (auth.uid() = donor_id);

-- PICKUP REQUESTS
-- View if requester or donor of the related donation
drop policy if exists "requests_select_requester_or_donor" on public.pickup_requests;
create policy "requests_select_requester_or_donor" on public.pickup_requests
  for select using (
    auth.uid() = requester_id
    or auth.uid() in (select donor_id from public.food_donations where id = donation_id)
  );

-- Create by requester (self)
drop policy if exists "requests_insert_self" on public.pickup_requests;
create policy "requests_insert_self" on public.pickup_requests
  for insert with check (auth.uid() = requester_id);

-- Update by donor (approval/reject/complete) or requester (cancel their own)
drop policy if exists "requests_update_donor" on public.pickup_requests;
create policy "requests_update_donor" on public.pickup_requests
  for update using (
    auth.uid() in (select donor_id from public.food_donations where id = donation_id)
  );

drop policy if exists "requests_update_requester" on public.pickup_requests;
create policy "requests_update_requester" on public.pickup_requests
  for update using (auth.uid() = requester_id);

-- Optional: delete by requester (cancel) or donor (manage)
drop policy if exists "requests_delete_requester_or_donor" on public.pickup_requests;
create policy "requests_delete_requester_or_donor" on public.pickup_requests
  for delete using (
    auth.uid() = requester_id
    or auth.uid() in (select donor_id from public.food_donations where id = donation_id)
  );

-- AI RECIPES
drop policy if exists "recipes_select_own" on public.ai_recipes;
create policy "recipes_select_own" on public.ai_recipes
  for select using (auth.uid() = user_id);

drop policy if exists "recipes_insert_own" on public.ai_recipes;
create policy "recipes_insert_own" on public.ai_recipes
  for insert with check (auth.uid() = user_id);

drop policy if exists "recipes_update_own" on public.ai_recipes;
create policy "recipes_update_own" on public.ai_recipes
  for update using (auth.uid() = user_id);

drop policy if exists "recipes_delete_own" on public.ai_recipes;
create policy "recipes_delete_own" on public.ai_recipes
  for delete using (auth.uid() = user_id);

-- FEEDBACK
-- Public can read a curated subset
drop policy if exists "feedback_public_read_curated" on public.feedback;
create policy "feedback_public_read_curated" on public.feedback
  for select using (
    status in ('open','resolved')
    and category in ('general','praise','feature_request')
  );

-- Users can read their own feedback
drop policy if exists "feedback_select_own" on public.feedback;
create policy "feedback_select_own" on public.feedback
  for select using (auth.uid() = user_id);

-- Anyone can create feedback (anonymous allowed)
drop policy if exists "feedback_insert_any" on public.feedback;
create policy "feedback_insert_any" on public.feedback
  for insert with check (true);

-- User can update/delete their own feedback; admins can manage all
drop policy if exists "feedback_update_own_or_admin" on public.feedback;
create policy "feedback_update_own_or_admin" on public.feedback
  for update using (
    auth.uid() = user_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

drop policy if exists "feedback_delete_own_or_admin" on public.feedback;
create policy "feedback_delete_own_or_admin" on public.feedback
  for delete using (
    auth.uid() = user_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- USER RATINGS
-- View ratings if you are the rated user or you donated the related donation
drop policy if exists "ratings_select_rated_or_donor" on public.user_ratings;
create policy "ratings_select_rated_or_donor" on public.user_ratings
  for select using (
    auth.uid() = rated_user_id
    or auth.uid() in (select donor_id from public.food_donations where id = donation_id)
  );

-- Create/update/delete your own ratings
drop policy if exists "ratings_insert_own" on public.user_ratings;
create policy "ratings_insert_own" on public.user_ratings
  for insert with check (auth.uid() = rater_id);

drop policy if exists "ratings_update_own" on public.user_ratings;
create policy "ratings_update_own" on public.user_ratings
  for update using (auth.uid() = rater_id);

drop policy if exists "ratings_delete_own" on public.user_ratings;
create policy "ratings_delete_own" on public.user_ratings
  for delete using (auth.uid() = rater_id);