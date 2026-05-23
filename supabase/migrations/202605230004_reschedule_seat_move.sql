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
  old_seat public.seats%rowtype;
  new_seat public.seats%rowtype;
  fee numeric(10, 2);
begin
  select * into target_booking
  from public.bookings
  where id = p_booking_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;

  if target_booking.status = 'cancelled' then
    raise exception 'Cancelled bookings cannot be rescheduled';
  end if;

  select * into old_flight from public.flights where id = target_booking.flight_id;
  select * into new_flight from public.flights where id = p_new_flight_id;

  if not found then
    raise exception 'New flight not found';
  end if;

  if old_flight.origin <> new_flight.origin or old_flight.destination <> new_flight.destination then
    raise exception 'Reschedule flight must be on the same route';
  end if;

  select * into old_seat
  from public.seats
  where id = target_booking.seat_id
  for update;

  select * into new_seat
  from public.seats
  where flight_id = p_new_flight_id and seat_number = old_seat.seat_number
  for update;

  if not found then
    raise exception 'The same seat number is not available on the new flight';
  end if;

  if new_seat.is_available is false then
    raise exception 'Seat % is occupied on the new flight', new_seat.seat_number;
  end if;

  fee := greatest(0, new_flight.base_price - old_flight.base_price);

  update public.seats
  set is_available = true
  where id = old_seat.id;

  update public.seats
  set is_available = false
  where id = new_seat.id;

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, old_flight.id, new_flight.id, fee);

  update public.bookings
  set flight_id = new_flight.id,
      seat_id = new_seat.id,
      status = 'rescheduled',
      total_price = total_price + fee
  where id = p_booking_id;
end;
$$;

grant execute on function public.reschedule_booking(uuid, uuid) to authenticated;
