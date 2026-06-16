-- ============================================================
-- BusinessOS — Fase 1: Schema base
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type business_plan as enum ('free', 'pro', 'business', 'agency');
create type user_role as enum ('owner', 'staff', 'client');
create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- ── businesses ──────────────────────────────────────────────
create table businesses (
  id                 uuid primary key default uuid_generate_v4(),
  name               text not null,
  slug               text not null unique,
  plan               business_plan not null default 'free',
  stripe_customer_id text,
  logo_url           text,
  settings           jsonb not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── business_users ──────────────────────────────────────────
create table business_users (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'staff',
  created_at  timestamptz not null default now(),
  unique(business_id, user_id)
);

-- ── services ────────────────────────────────────────────────
create table services (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references businesses(id) on delete cascade,
  name         text not null,
  description  text,
  duration_min integer not null default 60,
  price        integer not null default 0, -- céntimos de euro
  color        text not null default '#1A56DB',
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ── staff_members ───────────────────────────────────────────
create table staff_members (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  avatar_url  text,
  schedule    jsonb not null default '{}',  -- { "mon": ["09:00","18:00"], ... }
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── clients ─────────────────────────────────────────────────
create table clients (
  id          uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  tags        text[] not null default '{}',
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── appointments ────────────────────────────────────────────
create table appointments (
  id           uuid primary key default uuid_generate_v4(),
  business_id  uuid not null references businesses(id) on delete cascade,
  client_id    uuid references clients(id) on delete set null,
  staff_id     uuid references staff_members(id) on delete set null,
  service_id   uuid not null references services(id) on delete restrict,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  status       appointment_status not null default 'pending',
  notes        text,
  -- Para reservas sin cuenta registrada:
  client_name  text,
  client_email text,
  client_phone text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ── Índices ─────────────────────────────────────────────────
create index idx_business_users_user    on business_users(user_id);
create index idx_business_users_biz     on business_users(business_id);
create index idx_services_business      on services(business_id) where active = true;
create index idx_staff_business         on staff_members(business_id) where active = true;
create index idx_clients_business       on clients(business_id);
create index idx_clients_email          on clients(business_id, email);
create index idx_appointments_business  on appointments(business_id);
create index idx_appointments_starts    on appointments(business_id, starts_at);
create index idx_appointments_status    on appointments(business_id, status);

-- ── Triggers updated_at ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $body$
begin
  new.updated_at = now();
  return new;
end;
$body$;

create trigger trg_businesses_updated_at
  before update on businesses
  for each row execute function update_updated_at();

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table businesses     enable row level security;
alter table business_users enable row level security;
alter table services       enable row level security;
alter table staff_members  enable row level security;
alter table clients        enable row level security;
alter table appointments   enable row level security;

-- Helper: devuelve el business_id del usuario autenticado
create or replace function my_business_id()
returns uuid language sql security definer stable as $body$
  select business_id
  from business_users
  where user_id = auth.uid()
  limit 1;
$body$;

-- Helper: devuelve el rol del usuario en su negocio
create or replace function my_role()
returns user_role language sql security definer stable as $body$
  select role
  from business_users
  where user_id = auth.uid()
  limit 1;
$body$;

-- ── businesses ──────────────────────────────────────────────
-- Ver: sólo el negocio propio
create policy "businesses_select" on businesses
  for select using (id = my_business_id());

-- Crear: cualquier usuario autenticado puede crear un negocio
create policy "businesses_insert" on businesses
  for insert with check (auth.uid() is not null);

-- Editar: sólo el owner
create policy "businesses_update" on businesses
  for update using (id = my_business_id() and my_role() = 'owner');

-- ── business_users ──────────────────────────────────────────
create policy "business_users_select" on business_users
  for select using (business_id = my_business_id());

create policy "business_users_insert" on business_users
  for insert with check (auth.uid() is not null); -- el trigger en el wizard lo gestiona

create policy "business_users_update" on business_users
  for update using (business_id = my_business_id() and my_role() = 'owner');

-- ── services ────────────────────────────────────────────────
create policy "services_select" on services
  for select using (business_id = my_business_id());

create policy "services_insert" on services
  for insert with check (business_id = my_business_id() and my_role() in ('owner', 'staff'));

create policy "services_update" on services
  for update using (business_id = my_business_id() and my_role() in ('owner', 'staff'));

create policy "services_delete" on services
  for delete using (business_id = my_business_id() and my_role() = 'owner');

-- ── staff_members ───────────────────────────────────────────
create policy "staff_select" on staff_members
  for select using (business_id = my_business_id());

create policy "staff_insert" on staff_members
  for insert with check (business_id = my_business_id() and my_role() = 'owner');

create policy "staff_update" on staff_members
  for update using (business_id = my_business_id() and my_role() = 'owner');

create policy "staff_delete" on staff_members
  for delete using (business_id = my_business_id() and my_role() = 'owner');

-- ── clients ─────────────────────────────────────────────────
create policy "clients_select" on clients
  for select using (business_id = my_business_id());

create policy "clients_insert" on clients
  for insert with check (business_id = my_business_id());

create policy "clients_update" on clients
  for update using (business_id = my_business_id());

create policy "clients_delete" on clients
  for delete using (business_id = my_business_id() and my_role() = 'owner');

-- ── appointments ────────────────────────────────────────────
create policy "appointments_select" on appointments
  for select using (business_id = my_business_id());

create policy "appointments_insert" on appointments
  for insert with check (business_id = my_business_id());

create policy "appointments_update" on appointments
  for update using (business_id = my_business_id());

create policy "appointments_delete" on appointments
  for delete using (business_id = my_business_id() and my_role() in ('owner', 'staff'));

-- ============================================================
-- POLÍTICA ESPECIAL: reservas públicas (sin auth)
-- Permite a usuarios anónimos insertar citas en negocios que
-- tengan la reserva pública habilitada en settings
-- ============================================================
create policy "appointments_public_insert" on appointments
  for insert with check (
    exists (
      select 1 from businesses
      where id = appointments.business_id
        and (settings->>'public_booking')::boolean = true
    )
  );

-- ============================================================
-- Datos de ejemplo (opcional — comentar en producción)
-- ============================================================
-- Los datos reales se crean a través del SetupWizard en la app
