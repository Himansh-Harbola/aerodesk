create or replace function public.reserve_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_user_id uuid,
  p_total_price numeric,
  p_pnr_code text,
  p_passenger jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_seat public.seats%rowtype;
  new_booking_id uuid;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Not authorized';
  end if;

  select * into locked_seat
  from public.seats
  where id = p_seat_id and flight_id = p_flight_id
  for update;

  if not found then
    raise exception 'Seat does not exist for this flight';
  end if;

  if locked_seat.is_available is false then
    raise exception 'Seat is no longer available';
  end if;

  update public.seats
  set is_available = false
  where id = p_seat_id;

  insert into public.bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  values (p_user_id, p_flight_id, p_seat_id, 'confirmed', p_total_price, p_pnr_code)
  returning id into new_booking_id;

  insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
  values (
    new_booking_id,
    coalesce(p_passenger ->> 'full_name', ''),
    coalesce(p_passenger ->> 'passport_no', ''),
    coalesce(p_passenger ->> 'nationality', ''),
    nullif(p_passenger ->> 'dob', '')::date
  );

  return new_booking_id;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_booking public.bookings%rowtype;
begin
  select * into target_booking
  from public.bookings
  where id = p_booking_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = p_booking_id;

  update public.seats
  set is_available = true
  where id = target_booking.seat_id;
end;
$$;

create or replace function public.reschedule_booking(p_booking_id uuid, p_new_flight_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_booking public.bookings%rowtype;
  old_flight public.flights%rowtype;
  new_flight public.flights%rowtype;
  fee numeric(10, 2);
begin
  select * into target_booking
  from public.bookings
  where id = p_booking_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  select * into old_flight from public.flights where id = target_booking.flight_id;
  select * into new_flight from public.flights where id = p_new_flight_id;

  if not found then
    raise exception 'New flight not found';
  end if;

  if old_flight.origin <> new_flight.origin or old_flight.destination <> new_flight.destination then
    raise exception 'Reschedule flight must be on the same route';
  end if;

  fee := greatest(0, new_flight.base_price - old_flight.base_price);

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, old_flight.id, new_flight.id, fee);

  update public.bookings
  set flight_id = new_flight.id,
      status = 'rescheduled',
      total_price = total_price + fee
  where id = p_booking_id;
end;
$$;

grant execute on function public.reserve_seat(uuid, uuid, uuid, numeric, text, jsonb) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.reschedule_booking(uuid, uuid) to authenticated;
