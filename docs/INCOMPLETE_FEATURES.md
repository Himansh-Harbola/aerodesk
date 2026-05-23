# Incomplete Features and Future Scope

This project is focused on the flight-management assignment requirements: search, booking, seat selection, authentication, booking management, cancellation, rescheduling, Supabase persistence, Realtime seat updates, and PWA support.

Some UI elements are intentionally present as product-direction placeholders so the app feels like a broader travel product without overstating completed scope.

## Implemented Core Scope

- Flight search by origin, destination, date, and passenger count.
- Flight result cards with fare, aircraft, timing, status, sorting, pagination, and booking entry.
- Supabase Auth login/signup/logout.
- Seat map and passenger details during booking.
- Atomic booking through the `reserve_seat` RPC.
- Supabase Realtime seat availability updates.
- My Bookings view with cached offline visibility.
- Cancellation with confirmation and late-cancellation guard.
- Rescheduling to same-route flights with date filtering, confirmation, fare-difference display, and automatic seat fallback.
- PWA manifest, service worker, install prompt, and offline page.

## Known Placeholder UI

- **Hotels**: Landing-page tab/card only. No hotel search or booking backend is implemented.
- **Cars**: Landing-page tab/card only. No car rental search or booking backend is implemented.
- **New AI search**: Promotional card only. No AI itinerary/search assistant is implemented.
- **Explore everywhere**: Promotional card only. No flexible-destination discovery flow is implemented.
- **Add nearby airports**: Checkbox UI only. Search currently uses exact airport/city matching from the available flight data.
- **Direct flights**: Checkbox UI only. Seeded flights are currently direct routes, so the filter does not change results.
- **Traveller cabin-class selector on the landing layout**: Displayed as economy/passenger-focused UI. Cabin selection is handled during seat selection rather than through a full fare-family selector.

## Assignment-Aligned Tradeoffs

- The dummy travel-product buttons were kept visually present to make the landing page feel closer to a real flight-search product, but they are not part of the committed backend workflow.
- The completed backend is intentionally concentrated on flights, seats, bookings, cancellations, and reschedules rather than spreading implementation thinly across hotels/cars.
- Rescheduling automatically assigns the same or fallback seat instead of opening a full reschedule seat picker. This keeps the flow fast and transactional while still avoiding occupied seats.

## Future Scope

- Implement hotel and car modules as separate search/book/manage flows.
- Add nearby-airport grouping with airport latitude/longitude and distance-based expansion.
- Add direct/connecting-flight filtering once multi-leg itineraries exist.
- Add flexible-destination exploration and fare calendar views.
- Add fare families and cabin-class pricing from the search form.
- Add a reschedule seat picker so users can choose the exact replacement seat.
- Add admin screens for managing airports, flights, fares, and seat inventory.
- Add automated Playwright end-to-end tests for search, booking, cancellation, rescheduling, and offline behavior.
- Add CI checks for lint, build, and migration validation.
