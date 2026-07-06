-- Deal Dashboard Schema
-- Run this in Supabase SQL Editor BEFORE running seed.sql

create extension if not exists "uuid-ossp";

-- Main deals table (seeded from Excel)
create table deals (
  id uuid primary key default uuid_generate_v4(),
  deal_name text not null,           -- Sheet name: Maye, IPO, Arca, etc.
  responsable text,                  -- Angeles, Alberto, Andrés
  potencial text,                    -- Investor/buyer name
  product_type text,                 -- Buy to Rent, Flex Living, etc.
  email text,
  fecha_envio date,
  seguimiento_1 text,
  seguimiento_2 text,
  seguimiento_3 text,
  feedback text,
  status text default 'Sin respuesta',  -- Pendiente, En proceso, Descartado, Con feedback, Sin respuesta, Sin contacto
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weekly updates log
create table deal_updates (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid references deals(id) on delete cascade,
  responsable text not null,
  feedback text,
  status text,
  next_followup date,
  notes text,
  created_at timestamptz default now()
);

-- Auto-update updated_at on deals
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

-- Enable Row Level Security (public read/write for simplicity — refine later)
alter table deals enable row level security;
alter table deal_updates enable row level security;

create policy "Public read deals" on deals for select using (true);
create policy "Public update deals" on deals for update using (true);
create policy "Public insert deal_updates" on deal_updates for insert with check (true);
create policy "Public read deal_updates" on deal_updates for select using (true);
