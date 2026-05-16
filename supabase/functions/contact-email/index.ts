const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ContactPayload = {
  name: string;
  email: string;
  reason: string;
  message: string;
};

function cleanText(value: unknown, maxLength: number) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function sendEmail({
  apiKey,
  from,
  to,
  replyTo,
  subject,
  html,
  text,
}: {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}) {
  const body: Record<string, unknown> = {
    from,
    to,
    subject,
    html,
    text,
  };

  if (replyTo) {
    body.reply_to = replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = (await req.json()) as ContactPayload;

    const name = cleanText(payload.name, 60);
    const email = cleanText(payload.email, 120).toLowerCase();
    const reason = cleanText(payload.reason, 80);
    const message = cleanText(payload.message, 2000);

    if (
      !name ||
      !email ||
      !email.includes("@") ||
      !reason ||
      message.length < 10
    ) {
      return jsonResponse({ error: "Invalid form data" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const toEmail = Deno.env.get("CONTACT_TO_EMAIL") || "Contact@pixxivo.com";
    const fromEmail =
      Deno.env.get("CONTACT_FROM_EMAIL") || "Pixxivo <onboarding@resend.dev>";

    if (!resendApiKey) {
      return jsonResponse({ error: "Missing RESEND_API_KEY" }, 500);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeReason = escapeHtml(reason);
    const safeMessage = escapeHtml(message);

    const adminHtml = `
      <div style="margin:0; padding:0; background:#fbf8ef; font-family:Arial, Helvetica, sans-serif; color:#0b0b0b;">
        <div style="max-width:640px; margin:0 auto; padding:32px 14px;">
          <div style="background:#ffffff; border:1px solid rgba(0,0,0,0.1); border-radius:28px; overflow:hidden;">
            <div style="padding:28px;">
              <div style="display:inline-block; width:44px; height:44px; line-height:44px; text-align:center; border-radius:14px; background:#0b0b0b; color:#ffffff; font-size:22px; font-weight:800;">
                <img src="https://pixxivo.com/favicon-32x32.png" alt="P" style="width:20px; height:20px; vertical-align:middle;">
              </div>

              <p style="margin:24px 0 0; display:inline-block; padding:8px 12px; border-radius:999px; background:#ccff00; color:#111; font-size:12px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">
                New website inquiry
              </p>

              <h1 style="margin:22px 0 0; font-size:42px; line-height:0.95; letter-spacing:-0.06em; color:#0b0b0b;">
                New Pixxivo contact message.
              </h1>

              <div style="margin-top:24px; padding:18px; border-radius:20px; background:#f4f1ea; border:1px solid rgba(0,0,0,0.08);">
                <p style="margin:0 0 8px;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin:0 0 8px;"><strong>Email:</strong> ${safeEmail}</p>
                <p style="margin:0;"><strong>Reason:</strong> ${safeReason}</p>
              </div>

              <div style="margin-top:18px; padding:20px; border-radius:20px; background:#0b0b0b; color:#ffffff;">
                <p style="margin:0; white-space:pre-line; line-height:1.65;">${safeMessage}</p>
              </div>

              <p style="margin:20px 0 0; color:#6a6a6a; font-size:13px; line-height:1.6;">
                Reply directly to this email to respond to ${safeName}.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;

    const adminText = `New Pixxivo Contact Message

Name: ${name}
Email: ${email}
Reason: ${reason}

${message}`;

    const autoReplyHtml = `
  <div style="margin:0; padding:0; background:#fbf8ef; font-family:Arial, Helvetica, sans-serif; color:#0b0b0b;">
    <div style="max-width:640px; margin:0 auto; padding:32px 14px;">
      <div style="background:#ffffff; border:1px solid rgba(0,0,0,0.1); border-radius:28px; overflow:hidden;">
        <div style="padding:28px 28px 18px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block; width:44px; height:44px; line-height:44px; text-align:center; border-radius:14px; background:#0b0b0b; color:#ffffff; font-size:22px; font-weight:800;">
                  <img src="https://pixxivo.com/favicon-32x32.png" alt="P" style="width:20px; height:20px; vertical-align:middle;">
                </div>
              </td>
              <td align="right" style="font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#6a6a6a; font-weight:700;">
                Pixxivo
              </td>
            </tr>
          </table>
        </div>

        <div style="padding:10px 28px 0;">
          <div style="display:inline-block; padding:8px 12px; border-radius:999px; background:#ccff00; color:#111; font-size:12px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase;">
            Message received
          </div>

          <h1 style="margin:22px 0 0; font-size:46px; line-height:0.95; letter-spacing:-0.06em; color:#0b0b0b;">
            Thanks, ${safeName}.
          </h1>

          <p style="margin:20px 0 0; font-size:17px; line-height:1.65; color:#5b5b5b;">
            Hey ${safeName}, I’m Prateek, the founder of Pixxivo. I’ve received your message and I’ll review it soon.
          </p>

          <p style="margin:14px 0 0; font-size:17px; line-height:1.65; color:#5b5b5b;">
            Pixxivo is still early, but every serious message, suggestion, and collaboration request helps push the project forward.
          </p>
        </div>

        <div style="padding:28px;">
          <div style="padding:18px; border-radius:20px; background:#f4f1ea; border:1px solid rgba(0,0,0,0.08);">
            <p style="margin:0 0 8px; color:#0b0b0b;"><strong>Your reason:</strong> ${safeReason}</p>
            <p style="margin:0; color:#5f5f5f; line-height:1.6;">
              Your message has safely reached Pixxivo. I’ll get back to you as soon as possible.
            </p>
          </div>

          <a
            href="https://pixxivo.com"
            style="display:block; margin-top:20px; width:100%; box-sizing:border-box; padding:18px 20px; border-radius:18px; background:#0b0b0b; color:#ffffff; text-align:center; text-decoration:none; font-size:17px; font-weight:800;"
          >
            Visit Pixxivo →
          </a>

          <p style="margin:18px 0 0; font-size:13px; line-height:1.6; color:#777777;">
            This is an automatic confirmation, but your message is real and will be read.
          </p>
        </div>

        <div style="padding:22px 28px; background:#0b0b0b;">
          <p style="margin:0; color:#ffffff; font-size:14px; font-weight:800;">
            Prateek Shukla
          </p>
          <p style="margin:6px 0 0; color:rgba(255,255,255,0.62); font-size:13px; line-height:1.5;">
            Founder, Pixxivo · Useful AI hardware from India
          </p>
        </div>
      </div>

      <p style="max-width:620px; margin:16px auto 0; font-size:12px; line-height:1.5; color:#8b8b8b;">
        You received this email because you submitted the contact form on Pixxivo.
      </p>
    </div>
  </div>
`;

    const autoReplyText = `Hey ${name},

I’m Prateek, the founder of Pixxivo. I’ve received your message and I’ll review it soon.

Pixxivo is still early, but every serious message, suggestion, and collaboration request helps push the project forward.

Your reason: ${reason}

Your message has safely reached Pixxivo. I’ll get back to you as soon as possible.

Prateek Shukla
Founder, Pixxivo
Useful AI hardware from India`;

    const adminEmail = await sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `Pixxivo inquiry: ${reason}`,
      html: adminHtml,
      text: adminText,
    });

    if (!adminEmail.ok) {
      console.error("Admin email error:", adminEmail.data);
      return jsonResponse({ error: "Admin email could not be sent" }, 500);
    }

    const autoReply = await sendEmail({
      apiKey: resendApiKey,
      from: fromEmail,
      to: [email],
      subject: "Pixxivo received your message",
      html: autoReplyHtml,
      text: autoReplyText,
    });

    if (!autoReply.ok) {
      console.error("Auto reply error:", autoReply.data);
      return jsonResponse({
        success: true,
        warning: "Admin email sent, but auto-reply failed",
      });
    }

    return jsonResponse({
      success: true,
      message: "Admin email and auto-reply sent",
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "Server error" }, 500);
  }
});
