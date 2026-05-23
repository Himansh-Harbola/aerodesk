insert into public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('00000000-0000-4000-8000-000000000101', 'AD 214', 'Delhi', 'Mumbai', now() + interval '1 day 8 hours', now() + interval '1 day 10 hours 10 minutes', 'Airbus A320', 'scheduled', 6200),
  ('00000000-0000-4000-8000-000000000102', 'AD 318', 'Delhi', 'Mumbai', now() + interval '1 day 18 hours', now() + interval '1 day 20 hours 15 minutes', 'Boeing 737', 'scheduled', 7100),
  ('00000000-0000-4000-8000-000000000201', 'AD 431', 'Mumbai', 'Bengaluru', now() + interval '1 day 9 hours', now() + interval '1 day 10 hours 45 minutes', 'Airbus A321', 'scheduled', 5400),
  ('00000000-0000-4000-8000-000000000202', 'AD 519', 'Mumbai', 'Bengaluru', now() + interval '2 days 14 hours', now() + interval '2 days 15 hours 45 minutes', 'Airbus A320', 'delayed', 5100),
  ('00000000-0000-4000-8000-000000000301', 'AD 622', 'Bengaluru', 'Hyderabad', now() + interval '1 day 7 hours', now() + interval '1 day 8 hours 15 minutes', 'ATR 72', 'scheduled', 3900),
  ('00000000-0000-4000-8000-000000000302', 'AD 647', 'Bengaluru', 'Hyderabad', now() + interval '3 days 19 hours', now() + interval '3 days 20 hours 20 minutes', 'Airbus A320', 'scheduled', 4300),
  ('00000000-0000-4000-8000-000000000401', 'AD 783', 'Delhi', 'Kolkata', now() + interval '2 days 6 hours', now() + interval '2 days 8 hours 10 minutes', 'Boeing 737 MAX', 'scheduled', 6800),
  ('00000000-0000-4000-8000-000000000402', 'AD 812', 'Delhi', 'Kolkata', now() + interval '4 days 16 hours', now() + interval '4 days 18 hours 10 minutes', 'Airbus A321neo', 'scheduled', 7350)
on conflict (flight_no) do nothing;

insert into public.seats (flight_id, seat_number, class, extra_fee)
select
  f.id,
  row_no::text || col_letter,
  case when row_no <= 2 then 'first'::public.seat_class when row_no <= 6 then 'business'::public.seat_class else 'economy'::public.seat_class end,
  case when row_no <= 2 then 9000 when row_no <= 6 then 4500 when row_no <= 9 then 750 else 0 end
from public.flights f
cross join generate_series(1, 18) as row_no
cross join unnest(array['A', 'B', 'C', 'D', 'E', 'F']) as col_letter
on conflict (flight_id, seat_number) do nothing;

update public.seats
set is_available = false
where seat_number in ('2B', '4D', '7A', '11C', '15F');

-- Create a Supabase Auth user from the dashboard for local testing:
-- email: demo@aerodesk.test
-- password: DemoPass123!
