create extension if not exists "pgcrypto";

create type public.flight_status as enum ('scheduled', 'boarding', 'delayed', 'cancelled');
create type public.seat_class as enum ('economy', 'business', 'first');
create type public.booking_status as enum ('confirmed', 'rescheduled', 'cancelled');

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status public.flight_status not null default 'scheduled',
  base_price numeric(10, 2) not null check (base_price >= 0),
  created_at timestamptz not null default now(),
  check (arrives_at > departs_at)
);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class public.seat_class not null,
  is_available boolean not null default true,
  extra_fee numeric(10, 2) not null default 0 check (extra_fee >= 0),
  created_at timestamptz not null default now(),
  unique (flight_id, seat_number)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id),
  seat_id uuid not null references public.seats(id),
  status public.booking_status not null default 'confirmed',
  booked_at timestamptz not null default now(),
  total_price numeric(10, 2) not null check (total_price >= 0),
  pnr_code text not null unique,
  created_at timestamptz not null default now()
);

create unique index bookings_one_active_seat
  on public.bookings(seat_id)
  where status in ('confirmed', 'rescheduled');

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date,
  created_at timestamptz not null default now()
);

create table public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id),
  new_flight_id uuid not null references public.flights(id),
  requested_at timestamptz not null default now(),
  fee_charged numeric(10, 2) not null default 0 check (fee_charged >= 0)
);

alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

create policy "Flights are readable by everyone" on public.flights for select using (true);
create policy "Seats are readable by everyone" on public.seats for select using (true);

create policy "Users read own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users create own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users update own bookings" on public.bookings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own passengers" on public.passengers
  for select using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

create policy "Users create passengers for own bookings" on public.passengers
  for insert with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

create policy "Users read own reschedules" on public.reschedules
  for select using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

create policy "Users create own reschedules" on public.reschedules
  for insert with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

create or replace function public.reject_late_cancellation()
returns trigger
language plpgsql
as $$
declare
  departure_time timestamptz;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    select departs_at into departure_time from public.flights where id = old.flight_id;
    if departure_time <= now() + interval '2 hours' then
      raise exception 'Cancellations within 2 hours of departure are not allowed';
    end if;
  end if;
  return new;
end;
$$;

create trigger bookings_reject_late_cancellation
before update of status on public.bookings
for each row execute function public.reject_late_cancellation();
