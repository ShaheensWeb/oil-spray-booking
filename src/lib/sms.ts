import twilio from "twilio";

const trialTemplate = "sms_appointment_reminders";

export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.log(`[sms skipped] ${to}: ${body}`);
    return false;
  }

  const client = twilio(sid, token);
  const template = process.env.TWILIO_SMS_TEMPLATE?.trim();
  const text = template || body;

  try {
    await client.messages.create({ to, from, body: text });
    return true;
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === 572006 && text !== trialTemplate) {
      await client.messages.create({ to, from, body: trialTemplate });
      return true;
    }
    console.error("[sms failed]", error);
    return false;
  }
}
