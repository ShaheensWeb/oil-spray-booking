"use client";

import { FormEvent, useState } from "react";
import type { Booking } from "@/lib/config";
import { formatSlotLong } from "@/lib/time";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/bookings?password=${encodeURIComponent(password)}`);
    const data = await response.json();
    if (!response.ok) {
      setBookings(null);
      setError(data.error || "Could not load bookings.");
      return;
    }
    setBookings(data.bookings);
  }

  return (
    <main className="page">
      <div className="top">
        <div className="brand">Bookings</div>
        <a href="/">Back to booking</a>
      </div>
      <section className="panel admin">
        <form className="form" onSubmit={onSubmit}>
          <label>
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="book" type="submit">
            Show bookings
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        {bookings?.length === 0 ? <p>No bookings yet.</p> : null}
        {bookings?.map((booking) => (
          <article className="booking" key={booking.id}>
            <strong>{formatSlotLong(booking.slotId)}</strong>
            {booking.status ? <div>{booking.status}</div> : null}
            <div>{booking.name}</div>
            <div>{booking.phone}</div>
            <div>
              {booking.vehicle || booking.address}
              {booking.vehicleType ? ` · ${booking.vehicleType}` : ""}
              {booking.startingPrice ? ` · $${booking.startingPrice} cash starting` : ""}
            </div>
            {booking.notes ? <div>{booking.notes}</div> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
