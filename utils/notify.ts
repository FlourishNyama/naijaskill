/**
 * Server-side notification utility.
 * Called from /api/notify — never import this in client components.
 */
import { Resend } from 'resend';
import { createAdminClient } from './supabase/admin';

export type NotificationType =
  | 'booking_request'
  | 'hired'
  | 'escrow_funded'
  | 'payment_released'
  | 'new_application'
  | 'message'
  | 'job_completed'
  | 'review_received'
  | 'identity_verified'
  | 'security_alert';

export interface NotifyOptions {
  targetUserId: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string; // relative path e.g. "/jobs"
}

// These types also get an email — high-value, money-related events
const EMAIL_TYPES: NotificationType[] = [
  'booking_request',
  'hired',
  'escrow_funded',
  'payment_released',
  'new_application',
];

export async function sendNotification(opts: NotifyOptions) {
  const { targetUserId, title, body, type, link } = opts;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://elitejobinternational.com';
  const fullLink = link ? `${appUrl}${link}` : appUrl;

  // Run all three delivery channels concurrently; failures are logged, not thrown
  const results = await Promise.allSettled([
    saveInAppNotification(targetUserId, title, body, type, link),
    sendPush(targetUserId, title, body, fullLink),
    ...(EMAIL_TYPES.includes(type)
      ? [sendEmail(targetUserId, title, body, fullLink)]
      : []),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notify] channel ${i} failed:`, r.reason);
    }
  });
}

// ─── In-app (Supabase notifications table) ────────────────────────────────────

async function saveInAppNotification(
  userId: string,
  title: string,
  body: string,
  type: string,
  link?: string
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, title, body, type, link: link ?? null });
  if (error) throw error;
}

// ─── OneSignal Push ────────────────────────────────────────────────────────────

async function sendPush(targetUserId: string, title: string, body: string, link: string) {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  if (!appId || !apiKey) return; // silently skip if not configured

  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      target_channel: 'push',
      include_aliases: { external_id: [targetUserId] },
      headings: { en: title },
      contents: { en: body },
      url: link,
      web_url: link,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OneSignal: ${res.status} ${text}`);
  }
}

// ─── Resend Email ──────────────────────────────────────────────────────────────

async function sendEmail(targetUserId: string, title: string, body: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.admin.getUserById(targetUserId);
  if (!user?.email) return;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: 'Elite Job <notifications@send.elitejobinternational.com>',
    to: user.email,
    subject: title,
    html: buildEmailHtml(title, body, link, user.user_metadata?.full_name),
  });
}

function buildEmailHtml(title: string, body: string, link: string, name?: string): string {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <div style="background:#15803d;padding:28px 32px">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px">Elite Job International</h1>
      <p style="color:#bbf7d0;margin:6px 0 0;font-size:13px">Nigeria's trusted artisan marketplace</p>
    </div>

    <div style="padding:36px 32px">
      ${name ? `<p style="color:#6b7280;font-size:14px;margin:0 0 20px">Hi <strong>${name}</strong>,</p>` : ''}
      <h2 style="color:#111827;font-size:20px;font-weight:700;margin:0 0 12px;line-height:1.3">${title}</h2>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 32px">${body}</p>
      <a href="${link}"
         style="display:inline-block;background:#16a34a;color:#ffffff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
        View on Elite Job &rarr;
      </a>
    </div>

    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="color:#9ca3af;font-size:12px;margin:0">Elite Job International &bull; Lagos, Nigeria</p>
      <p style="color:#d1d5db;font-size:11px;margin:6px 0 0">
        You received this because you have an account on Elite Job.
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://elitejobinternational.com'}/settings" style="color:#6b7280;text-decoration:underline">Manage notifications</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
