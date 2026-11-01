import twilio from "twilio";
import { config } from "./config";

const retiredFrom = "+17372508034";

const trialTemplate = "sms_appointment_reminders";

export type SmsResult = {
  sent: boolean;
  reason?: string;
};

function errorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return Number((error as { code: unknown }).code);
  }
  return null;
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "The confirmation text did not send.";
}

function fromNumber() {
  const fromEnv = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!fromEnv || fromEnv === retiredFrom) {
    return config.twilioFrom;
  }
  return fromEnv;
}

export function smsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      fromNumber(),
  );
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = fromNumber();

  if (!sid || !token || !from) {
    console.log(`[sms skipped] missing keys to=${to}`);
    return { sent: false, reason: "missing-keys" };
  }

  const template = process.env.TWILIO_SMS_TEMPLATE?.trim();
  const text = template && template !== "off" ? template : body;
  const client = twilio(sid, token);

  try {
    await client.messages.create({ to, from, body: text });
    return { sent: true };
  } catch (error) {
    if (errorCode(error) === 572006 && text !== trialTemplate) {
      try {
        await client.messages.create({ to, from, body: trialTemplate });
        return { sent: true };
      } catch (retryError) {
        console.error("[sms failed]", retryError);
        return { sent: false, reason: errorMessage(retryError) };
      }
    }
    console.error("[sms failed]", error);
    return { sent: false, reason: errorMessage(error) };
  }
}

export async function notifyShop(body: string) {
  return sendSms(config.shopAlertPhone, body);
}
