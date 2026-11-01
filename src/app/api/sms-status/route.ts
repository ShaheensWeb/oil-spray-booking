import { NextResponse } from "next/server";
import { smsConfigured } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: smsConfigured(),
    template: process.env.TWILIO_SMS_TEMPLATE?.trim() || "sms_appointment_reminders",
  });
}
