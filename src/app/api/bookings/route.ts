import { NextResponse } from "next/server";
import { listBookings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const password = new URL(request.url).searchParams.get("password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await listBookings();
  return NextResponse.json({
    bookings: bookings.slice().reverse(),
  });
}
