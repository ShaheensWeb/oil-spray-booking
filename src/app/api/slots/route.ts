import { NextResponse } from "next/server";
import { availableDays } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  const days = await availableDays();
  return NextResponse.json({ days });
}
