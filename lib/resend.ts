import { Resend } from "resend";
import { getSiteSetting } from "@/lib/setting";

const resendApiKey = process.env.RESEND_API_KEY;
const resendDomain = process.env.RESEND_EMAIL_DOMAIN || "sociolizy.com";

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Common HTML email wrapper with modern styling
 */
function emailLayout({
  title,
  preheader,
  contentHtml,
  siteName = "Sociolizy",
  siteUrl = "https://sociolizy.com",
}: {
  title: string;
  preheader: string;
  contentHtml: string;
  siteName?: string;
  siteUrl?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 30px; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .footer { background-color: #f1f5f9; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 12px 26px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 20px; text-align: center; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .item-row:last-child { border-bottom: none; }
    .item-label { color: #64748b; font-weight: 500; }
    .item-value { color: #0f172a; font-weight: 700; font-family: monospace; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 20px;">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1>${siteName}</h1>
            <p>${title}</p>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px;">Need assistance? Contact our 24/7 support desk at <a href="${siteUrl}/page/contact-us" style="color: #059669; text-decoration: none; font-weight: 600;">Support Center</a></p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * 1. Sender Notifikasi: Registrasi Berhasil
 */
export async function sendRegistrationEmail({
  email,
  username,
  serverArea = "SG",
}: {
  email: string;
  username: string;
  serverArea?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!resend) {
      console.warn("[Resend] RESEND_API_KEY not configured. Skipping registration email.");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const setting = await getSiteSetting();
    const siteName = setting.site_name || "Sociolizy";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com";

    const contentHtml = `
      <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Welcome aboard, ${username}! 🎉</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your account on <strong>${siteName}</strong> has been created successfully. You are now ready to place automated SMM orders, manage balances, and integrate direct reseller APIs.
      </p>

      <div class="card">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Username:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Registered Email:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Cluster Node:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669; font-size: 13px;">${serverArea}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Account Tier:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">MEMBER</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${siteUrl}/auth/login" class="btn">Log In to Your Dashboard &rarr;</a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; text-align: center;">
        Security Notice: We will never ask for your password or sensitive payment credentials via email.
      </p>
    `;

    const html = emailLayout({
      title: "Account Created Successfully",
      preheader: `Welcome to ${siteName}! Your account is now active and ready.`,
      contentHtml,
      siteName,
      siteUrl,
    });

    const result = await resend.emails.send({
      from: `${siteName} <noreply@${resendDomain}>`,
      to: email,
      subject: `Welcome to ${siteName} - Account Created Successfully`,
      html,
    });

    if (result.error) {
      console.error("[Resend] sendRegistrationEmail error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[Resend] sendRegistrationEmail unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * 2. Sender Notifikasi: Membuat Pesanan (Order Created)
 */
export async function sendOrderCreatedEmail({
  email,
  username,
  invoice,
  orderId,
  serviceName,
  target,
  quantity,
  price,
  status = "Pending",
  remainingBalance,
}: {
  email: string;
  username: string;
  invoice: string;
  orderId?: string | null;
  serviceName: string;
  target: string;
  quantity: number;
  price: number;
  status?: string;
  remainingBalance?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!resend) {
      console.warn("[Resend] RESEND_API_KEY not configured. Skipping order email.");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const setting = await getSiteSetting();
    const siteName = setting.site_name || "Sociolizy";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com";

    const contentHtml = `
      <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Order Confirmation 🚀</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Hi <strong>${username}</strong>, your new SMM order has been accepted and dispatched to our high-speed fulfillment queue.
      </p>

      <div class="card">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Invoice Number:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669; font-size: 13px;">${invoice}</td>
          </tr>
          ${
            orderId
              ? `<tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Provider Order ID:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">#${orderId}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Service:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Target URL / Link:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #2563eb; font-size: 12px; word-break: break-all;">${target}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Quantity:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${quantity.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Total Charged:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669; font-size: 14px;">$${Number(price).toFixed(4)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Status:</td>
            <td style="padding: 6px 0; text-align: right;"><span class="badge">${status}</span></td>
          </tr>
          ${
            remainingBalance !== undefined
              ? `<tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Remaining Balance:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">$${remainingBalance.toFixed(2)}</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${siteUrl}/member/history/order" class="btn">Track Order Progress &rarr;</a>
      </div>
    `;

    const html = emailLayout({
      title: "Order Placed Successfully",
      preheader: `Your order ${invoice} for ${serviceName} has been submitted!`,
      contentHtml,
      siteName,
      siteUrl,
    });

    const result = await resend.emails.send({
      from: `${siteName} <noreply@${resendDomain}>`,
      to: email,
      subject: `Order Confirmation [${invoice}] - ${siteName}`,
      html,
    });

    if (result.error) {
      console.error("[Resend] sendOrderCreatedEmail error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[Resend] sendOrderCreatedEmail unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * 3. Sender Notifikasi: Deposit Berhasil (Deposit Credited)
 */
export async function sendDepositSuccessEmail({
  email,
  username,
  orderId,
  amount,
  currency = "USD",
  newBalance,
  txid,
}: {
  email: string;
  username: string;
  orderId: string;
  amount: number;
  currency?: string;
  newBalance?: number;
  txid?: string | null;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!resend) {
      console.warn("[Resend] RESEND_API_KEY not configured. Skipping deposit email.");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const setting = await getSiteSetting();
    const siteName = setting.site_name || "Sociolizy";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com";

    const contentHtml = `
      <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Deposit Confirmed &amp; Credited 💳</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Hi <strong>${username}</strong>, your deposit has been verified and added to your balance. You can immediately use your credits to place SMM orders.
      </p>

      <div class="card">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Transaction ID:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #059669; font-size: 13px;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Amount Credited:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #059669; font-size: 15px;">+$${Number(amount).toFixed(2)} ${currency}</td>
          </tr>
          ${
            newBalance !== undefined
              ? `<tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">New Account Balance:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 800; color: #0f172a; font-size: 15px;">$${newBalance.toFixed(2)}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Payment Status:</td>
            <td style="padding: 6px 0; text-align: right;"><span class="badge" style="background-color: #d1fae5; color: #065f46;">COMPLETED</span></td>
          </tr>
          ${
            txid
              ? `<tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Blockchain TXID:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 500; color: #64748b; font-size: 11px; word-break: break-all;">${txid}</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${siteUrl}/member/order" class="btn">Place New Order &rarr;</a>
      </div>
    `;

    const html = emailLayout({
      title: "Deposit Confirmed",
      preheader: `Deposit of $${Number(amount).toFixed(2)} has been credited to your account balance!`,
      contentHtml,
      siteName,
      siteUrl,
    });

    const result = await resend.emails.send({
      from: `${siteName} <noreply@${resendDomain}>`,
      to: email,
      subject: `Deposit Confirmed ($${Number(amount).toFixed(2)}) - ${siteName}`,
      html,
    });

    if (result.error) {
      console.error("[Resend] sendDepositSuccessEmail error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[Resend] sendDepositSuccessEmail unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * 4. Sender Notifikasi: Lupa Password (Forgot / Reset Password)
 */
export async function sendPasswordResetEmail({
  email,
  username,
  resetToken,
}: {
  email: string;
  username: string;
  resetToken: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    if (!resend) {
      console.warn("[Resend] RESEND_API_KEY not configured. Skipping password reset email.");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const setting = await getSiteSetting();
    const siteName = setting.site_name || "Sociolizy";
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com";
    const resetUrl = `${siteUrl}/auth/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(email)}`;

    const contentHtml = `
      <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Password Reset Request 🔐</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Hi <strong>${username}</strong>, we received a request to reset your password for your <strong>${siteName}</strong> account.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Click the button below to choose a new password. This reset link is valid for <strong>1 hour</strong>.
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" class="btn" style="background-color: #0f172a;">Reset Your Password &rarr;</a>
      </div>

      <div class="card" style="font-size: 12px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 6px;">If the button above does not work, copy and paste the following URL into your browser:</p>
        <p style="margin: 0; word-break: break-all; color: #2563eb; font-family: monospace;">${resetUrl}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
        If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    `;

    const html = emailLayout({
      title: "Password Reset Request",
      preheader: `Reset your ${siteName} account password. Link expires in 1 hour.`,
      contentHtml,
      siteName,
      siteUrl,
    });

    const result = await resend.emails.send({
      from: `${siteName} <noreply@${resendDomain}>`,
      to: email,
      subject: `Reset Your Password - ${siteName}`,
      html,
    });

    if (result.error) {
      console.error("[Resend] sendPasswordResetEmail error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error("[Resend] sendPasswordResetEmail unexpected error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

