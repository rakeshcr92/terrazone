-- Lead capture for the public Geozane landing page (/).
--
-- Replaces the TanStack Start `submitLead` server function that used to POST
-- to a Google Apps Script webhook. TerraZone is a static SPA with no server
-- runtime, so the form now inserts directly with the anon key.
--
-- Anonymous visitors may INSERT only. They cannot read, update, or delete
-- rows, so submitted leads are not enumerable from the browser.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  company text default '' check (char_length(company) <= 120),
  role text default '' check (char_length(role) <= 60),
  message text default '' check (char_length(message) <= 2000),
  source text default 'website-cta',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx
on public.leads (created_at desc);

create index if not exists leads_email_idx
on public.leads (email);

alter table public.leads enable row level security;

drop policy if exists "Allow anon insert leads" on public.leads;

create policy "Allow anon insert leads"
on public.leads
for insert
to anon
with check (true);

-- Authenticated pilot users may also submit (e.g. if the CTA is reachable
-- while signed in).
drop policy if exists "Allow authenticated insert leads" on public.leads;

create policy "Allow authenticated insert leads"
on public.leads
for insert
to authenticated
with check (true);
