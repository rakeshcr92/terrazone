create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid,
  parcel_id text,
  report_id text,
  properties jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists analytics_events_event_name_idx
on analytics_events (event_name);

create index if not exists analytics_events_created_at_idx
on analytics_events (created_at desc);

alter table analytics_events enable row level security;

drop policy if exists "Allow anon insert analytics events" on analytics_events;

create policy "Allow anon insert analytics events"
on analytics_events
for insert
to anon
with check (true);