"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { config, type Day } from "@/lib/config";

type Booked = {
  when: string;
  texted: boolean;
};

export default function HomePage() {
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState<Booked | null>(null);

  async function loadSlots() {
    const response = await fetch("/api/slots", { cache: "no-store" });
    const data = (await response.json()) as { days: Day[] };
    setDays(data.days);
    setSelectedDate((current) => current || data.days[0]?.date || "");
    setLoading(false);
  }

  useEffect(() => {
    loadSlots().catch(() => {
      setError("Could not load open slots.");
      setLoading(false);
    });
  }, []);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate) ?? days[0],
    [days, selectedDate],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, name, phone, vehicle, notes }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Booking failed.");
      }
      setBooked({ when: data.when, texted: data.texted });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
      await loadSlots();
    } finally {
      setBusy(false);
    }
  }

  if (booked) {
    return (
      <main className="page">
        <Header />
        <section className="panel success-card">
          <p className="section-label">Booked</p>
          <h2>See you then.</h2>
          <p>
            {name}, you&apos;re down for <strong>{booked.when}</strong>. Bring the {vehicle} to{" "}
            <a href={config.mapsUrl} target="_blank" rel="noreferrer">
              {config.shopAddress}
            </a>
            .
          </p>
          <p className="success">
            {booked.texted
              ? "A confirmation text is on its way."
              : "Your booking is saved. Add Twilio keys to send the confirmation text."}
          </p>
          <p>
            <a href="/">Book another slot</a>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <Header />
      <h1>Book undercoating. We&apos;ll text you.</h1>
      <p className="lede">
        Vehicle undercoating at{" "}
        <a href={config.mapsUrl} target="_blank" rel="noreferrer">
          {config.shopAddress}
        </a>
        . Pick a two-hour window, bring the vehicle here, and we&apos;ll confirm by text.
      </p>

      <section className="panel">
        <p className="section-label">Available slots</p>
        {loading ? <p className="note">Loading Ottawa times…</p> : null}
        <div className="days">
          {days.map((day) => (
            <button
              key={day.date}
              className={`day ${selectedDay?.date === day.date ? "selected" : ""}`}
              type="button"
              onClick={() => {
                setSelectedDate(day.date);
                setSlotId("");
              }}
            >
              <small>{day.weekday}</small>
              <b>{Number(day.dayNumber)}</b>
              <small>{day.month}</small>
            </button>
          ))}
        </div>

        <div className="slots">
          {selectedDay?.slots.map((slot) => (
            <button
              key={slot.id}
              className={`slot ${slotId === slot.id ? "selected" : ""}`}
              type="button"
              disabled={!slot.available}
              onClick={() => setSlotId(slot.id)}
            >
              {slot.label}
              <small>{slot.available ? "Open" : "Taken"}</small>
            </button>
          ))}
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Mobile number
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              placeholder="613-447-5428"
              required
            />
          </label>
          <label>
            Vehicle
            <input
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
              placeholder="2018 Ford F-150"
              required
            />
          </label>
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Rust spots, extra coverage, anything we should know"
            />
          </label>
          <button className="book" type="submit" disabled={!slotId || busy}>
            {busy ? "Booking…" : "Text me to confirm"}
          </button>
          {error ? <p className="error">{error}</p> : null}
          <p className="note">
            Closed Sundays. Same-day slots disappear once the window has started.
          </p>
        </form>
      </section>
    </main>
  );
}

function Header() {
  return (
    <div className="top">
      <div className="brand">{config.businessName}</div>
      <a className="city" href={`tel:+1${config.phoneDisplay.replace(/\D/g, "")}`}>
        {config.phoneDisplay}
      </a>
    </div>
  );
}
