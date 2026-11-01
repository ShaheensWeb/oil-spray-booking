import { promises as fs } from "fs";
import path from "path";
import type { Booking } from "./config";

const filePath = path.join(process.cwd(), "data", "bookings.json");

let writeQueue: Promise<void> = Promise.resolve();

async function readBookings() {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeBookings(bookings: Booking[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(bookings, null, 2));
}

export async function listBookings() {
  return readBookings();
}

export async function bookedSlotIds() {
  const bookings = await readBookings();
  return new Set(bookings.map((booking) => booking.slotId));
}

export async function createBooking(input: Omit<Booking, "id" | "createdAt">) {
  const run = writeQueue.then(async () => {
    const bookings = await readBookings();
    if (bookings.some((booking) => booking.slotId === input.slotId)) {
      throw new Error("That slot was just booked. Pick another time.");
    }
    const booking: Booking = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    bookings.push(booking);
    await writeBookings(bookings);
    return booking;
  });
  writeQueue = run.then(() => undefined, () => undefined);
  return run;
}
