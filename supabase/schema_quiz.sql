-- Tabla de puntuaciones de los quizzes de la formación en IA
-- Ejecutar en Supabase: SQL Editor → New query → pegar → Run

create table if not exists quiz_scores (
  id uuid primary key default gen_random_uuid(),
  quiz text not null default 'fundamentos',
  nick text not null,
  score integer not null default 0,
  hits integer not null default 0,
  ms integer not null default 0,
  created_at timestamptz not null default now()
);

alter table quiz_scores enable row level security;

create policy "quiz_scores_select" on quiz_scores
  for select using (true);

create policy "quiz_scores_insert" on quiz_scores
  for insert with check (true);
