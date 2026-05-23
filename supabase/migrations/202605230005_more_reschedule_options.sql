insert into public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('00000000-0000-4000-8000-000000000103', 'AD 326', 'Delhi', 'Mumbai', now() + interval '5 days 7 hours', now() + interval '5 days 9 hours 10 minutes', 'Airbus A320neo', 'scheduled', 6900),
  ('00000000-0000-4000-8000-000000000104', 'AD 344', 'Delhi', 'Mumbai', now() + interval '7 days 20 hours', now() + interval '7 days 22 hours 15 minutes', 'Boeing 737', 'scheduled', 7600),
  ('00000000-0000-4000-8000-000000000203', 'AD 536', 'Mumbai', 'Bengaluru', now() + interval '5 days 10 hours', now() + interval '5 days 11 hours 45 minutes', 'Airbus A320', 'scheduled', 5600),
  ('00000000-0000-4000-8000-000000000204', 'AD 548', 'Mumbai', 'Bengaluru', now() + interval '8 days 18 hours', now() + interval '8 days 19 hours 50 minutes', 'Airbus A321', 'scheduled', 5900),
  ('00000000-0000-4000-8000-000000000303', 'AD 668', 'Bengaluru', 'Hyderabad', now() + interval '5 days 8 hours', now() + interval '5 days 9 hours 20 minutes', 'ATR 72', 'scheduled', 4100),
  ('00000000-0000-4000-8000-000000000304', 'AD 684', 'Bengaluru', 'Hyderabad', now() + interval '9 days 17 hours', now() + interval '9 days 18 hours 25 minutes', 'Airbus A320', 'scheduled', 4700),
  ('00000000-0000-4000-8000-000000000403', 'AD 828', 'Delhi', 'Kolkata', now() + interval '6 days 9 hours', now() + interval '6 days 11 hours 15 minutes', 'Boeing 737 MAX', 'scheduled', 7200),
  ('00000000-0000-4000-8000-000000000404', 'AD 846', 'Delhi', 'Kolkata', now() + interval '10 days 15 hours', now() + interval '10 days 17 hours 15 minutes', 'Airbus A321neo', 'scheduled', 7900)
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
where f.flight_no in ('AD 326', 'AD 344', 'AD 536', 'AD 548', 'AD 668', 'AD 684', 'AD 828', 'AD 846')
on conflict (flight_id, seat_number) do nothing;
