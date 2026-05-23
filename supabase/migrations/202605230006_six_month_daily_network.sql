-- Generates a dense six-month network from the airports already present in public.flights.
-- With the current five airports, this creates 5 * 4 * 180 = 3600 scheduled flights.
-- Each generated flight also receives a full 18-row, 6-column seat map.

with airports as (
  select distinct airport
  from (
    select origin as airport from public.flights
    union
    select destination as airport from public.flights
  ) known_airports
),
routes as (
  select
    origin.airport as origin,
    destination.airport as destination,
    row_number() over (order by origin.airport, destination.airport) as route_no
  from airports origin
  cross join airports destination
  where origin.airport <> destination.airport
),
schedule as (
  select
    routes.*,
    day_no,
    (
      current_date
      + day_no::int
      + make_interval(hours => 6 + ((routes.route_no * 3 + day_no) % 15)::int)
      + make_interval(mins => ((routes.route_no * 11 + day_no * 7) % 60)::int)
    )::timestamptz as departs_at
  from routes
  cross join generate_series(1, 180) as day_no
),
generated as (
  select
    gen_random_uuid() as id,
    'AX' || lpad(route_no::text, 2, '0') || lpad(day_no::text, 3, '0') as flight_no,
    origin,
    destination,
    departs_at,
    departs_at + make_interval(mins => (75 + ((route_no * 13) % 130))::int) as arrives_at,
    case route_no % 5
      when 0 then 'Airbus A320'
      when 1 then 'Boeing 737'
      when 2 then 'Airbus A321neo'
      when 3 then 'Boeing 737 MAX'
      else 'Airbus A320neo'
    end as aircraft_type,
    'scheduled'::public.flight_status as status,
    (3500 + ((route_no * 425 + day_no * 37) % 7200))::numeric(10, 2) as base_price
  from schedule
)
insert into public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
select id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price
from generated
on conflict (flight_no) do nothing;

insert into public.seats (flight_id, seat_number, class, extra_fee)
select
  f.id,
  row_no::text || col_letter,
  case
    when row_no <= 2 then 'first'::public.seat_class
    when row_no <= 6 then 'business'::public.seat_class
    else 'economy'::public.seat_class
  end,
  case
    when row_no <= 2 then 9000
    when row_no <= 6 then 4500
    when row_no <= 9 then 750
    else 0
  end
from public.flights f
cross join generate_series(1, 18) as row_no
cross join unnest(array['A', 'B', 'C', 'D', 'E', 'F']) as col_letter
where f.flight_no ~ '^AX[0-9]{5}$'
on conflict (flight_id, seat_number) do nothing;
