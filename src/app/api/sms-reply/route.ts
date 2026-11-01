import { config } from "@/lib/config";
import { toE164 } from "@/lib/phone";
import { sendSms } from "@/lib/sms";
import { setLatestBookingStatus } from "@/lib/store";
import { formatSlotLong } from "@/lib/time";

export const dynamic = "force-dynamic";

function twiml(message: string) {
  const safe = message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const from = toE164(String(form.get("From") ?? ""));
  const incoming = String(form.get("Body") ?? "")
    .trim()
    .toUpperCase();

  if (!from) {
    return new Response(twiml("Sorry, we could not read that number."), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const answer = incoming.startsWith("Y")
    ? "confirmed"
    : incoming.startsWith("N")
      ? "cancelled"
      : null;

  if (!answer) {
    return new Response(
      twiml("Please reply Y to confirm your undercoating booking, or N to cancel."),
      { headers: { "Content-Type": "text/xml" } },
    );
  }

  const booking = await setLatestBookingStatus(from, answer);
  if (!booking) {
    return new Response(twiml("We could not find an open booking for this number."), {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const when = formatSlotLong(booking.slotId);
  const ownerPhone = toE164(process.env.BUSINESS_PHONE || config.phoneDisplay);
  if (ownerPhone) {
    await sendSms(
      ownerPhone,
      `${config.businessName}: ${booking.name} replied ${answer === "confirmed" ? "Y" : "N"} for ${booking.vehicle} on ${when}.`,
    );
  }

  return new Response(
    twiml(
      answer === "confirmed"
        ? `Thanks ${booking.name}. Your ${booking.vehicle} is confirmed for ${when}.`
        : `Okay ${booking.name}. Your ${booking.vehicle} booking for ${when} is cancelled.`,
    ),
    { headers: { "Content-Type": "text/xml" } },
  );
}
