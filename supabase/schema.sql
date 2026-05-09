-- Run this in: Supabase Dashboard → SQL Editor → Run

create table if not exists audit_results (
  id         uuid primary key,
  result     jsonb not null,
  ai_summary text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id           uuid default gen_random_uuid() primary key,
  email        text not null,
  audit_id     uuid references audit_results(id) on delete set null,
  total_spend  integer,
  total_saving integer,
  created_at   timestamptz not null default now()
);

alter table audit_results enable row level security;
alter table leads enable row level security;

-- Anyone can read an audit by its UUID (needed for share links)
create policy "Public read audit_results"
  on audit_results for select using (true);

create index if not exists idx_leads_audit_id    on leads(audit_id);
create index if not exists idx_audit_created_at  on audit_results(created_at desc);
