-- Overview tab: business-area items
-- Run this ONCE in Supabase SQL Editor (New query → paste → Run)

create table overview_items (
  id uuid primary key default uuid_generate_v4(),
  section_path text not null,      -- e.g. 'iod/facturacion', 'asset/agro/ejecucion/cliente'
  company text not null,
  goal text,
  status text default 'Pendiente', -- Pendiente, En curso, Completado, Bloqueado
  next_steps text,
  owner text,                      -- Angeles, Alberto, Andrés
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger overview_items_updated_at
  before update on overview_items
  for each row execute function update_updated_at();

alter table overview_items enable row level security;

create policy "Public read overview" on overview_items for select using (true);
create policy "Public insert overview" on overview_items for insert with check (true);
create policy "Public update overview" on overview_items for update using (true);
create policy "Public delete overview" on overview_items for delete using (true);
