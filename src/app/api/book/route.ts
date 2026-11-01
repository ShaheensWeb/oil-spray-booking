import { NextResponse } from "next/server";
import { config, priceLine, startingPrice, type VehicleType } from "@/lib/config";
import { toE164 } from "@/lib/phone";
import { createBooking } from "@/lib/store";
import { notifyShop, sendSms } from "@/lib/sms";
import { formatSlotLong } from "@/lib/time";
import { availableDays } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const vehicle = String(body?.vehicle ?? "").trim();
  const vehicleType = String(body?.vehicleType ?? "").trim() as VehicleType;
  const notes = String(body?.notes ?? "").trim();
  const slotId = String(body?.slotId ?? "").trim();
  const phone = toE164(String(body?.phone ?? ""));

  if (!name || !vehicle || !slotId || !phone || !config.vehicleTypes[vehicleType]) {
    return NextResponse.json(
      { error: "Name, phone, vehicle, sedan or truck, and a time slot are required." },
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
      vehicleType,
      startingPrice: startingPrice(vehicleType),
      notes,
    });

    const when = formatSlotLong(slotId);
    const typeLabel = config.vehicleTypes[vehicleType].label;
    const sms = await sendSms(
      phone,
      `${config.businessName}: Hi ${name}, you're booked ${when} for your ${vehicle} (${typeLabel}). ${priceLine(vehicleType)}. Reply Y to confirm or N to cancel. Questions? Text ${config.phoneDisplay}.`,
    );

    const shop = await notifyShop(
      `${config.businessName} NEW BOOKING: ${name}, ${phone}, ${vehicle} (${typeLabel}), ${priceLine(vehicleType)}, ${when}. Waiting for customer to reply Y.${notes ? ` Notes: ${notes}` : ""}`,
    );

    return NextResponse.json({
      bookingId: booking.id,
      when,
      texted: sms.sent,
      smsReason: sms.reason ?? null,
      shopTexted: shop.sent,
      shopSmsReason: shop.reason ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save that booking.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
