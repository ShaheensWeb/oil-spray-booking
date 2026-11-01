import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { toE164 } from "@/lib/phone";
import { createBooking } from "@/lib/store";
import { sendSms } from "@/lib/sms";
import { formatSlotLong } from "@/lib/time";
import { availableDays } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const vehicle = String(body?.vehicle ?? "").trim();
  const notes = String(body?.notes ?? "").trim();
  const slotId = String(body?.slotId ?? "").trim();
  const phone = toE164(String(body?.phone ?? ""));

  if (!name || !vehicle || !slotId || !phone) {
    return NextResponse.json(
      { error: "Name, phone, vehicle, and a time slot are required." },
      { status: 400 },
    );
  }

  const days = await availableDays();
  const slot = days.flatMap((day) => day.slots).find((item) => item.id === slotId);
  if (!slot?.available) {
    return NextResponse.json(
      { error: "That time is no longer open. Please pick another slot." },
      { status: 409 },
    );
  }

  try {
    const booking = await createBooking({
      slotId,
      name,
      phone,
      vehicle,
      notes,
    });

    const when = formatSlotLong(slotId);
    const sent = await sendSms(
      phone,
      `${config.businessName}: you're booked for undercoating ${when}. Questions? Text ${config.phoneDisplay}.`,
    );

    const ownerPhone = process.env.BUSINESS_PHONE
      ? toE164(process.env.BUSINESS_PHONE)
      : null;
    if (ownerPhone && ownerPhone !== phone) {
      await sendSms(
        ownerPhone,
        `New booking: ${name}, ${phone}, ${vehicle}, ${when}${notes ? `. Notes: ${notes}` : ""}`,
      );
    }

    return NextResponse.json({
      bookingId: booking.id,
      when,
      texted: sent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save that booking.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
