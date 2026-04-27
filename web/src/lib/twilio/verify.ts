interface TwilioVerifyResult {
  sid?: string;
  status?: string;
  valid?: boolean;
  message?: string;
}

function getTwilioVerifyConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error("Twilio Verify is not configured");
  }

  return { accountSid, authToken, verifyServiceSid };
}

async function twilioVerifyRequest(path: string, body: URLSearchParams): Promise<TwilioVerifyResult> {
  const { accountSid, authToken, verifyServiceSid } = getTwilioVerifyConfig();
  const response = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json().catch(() => ({}))) as TwilioVerifyResult;
  if (!response.ok) {
    throw new Error(data.message ?? "Twilio verification request failed");
  }

  return data;
}

export async function startPhoneVerification(phone: string) {
  const body = new URLSearchParams({ To: phone, Channel: "sms" });
  return twilioVerifyRequest("Verifications", body);
}

export async function checkPhoneVerification(phone: string, code: string) {
  const body = new URLSearchParams({ To: phone, Code: code });
  return twilioVerifyRequest("VerificationCheck", body);
}
