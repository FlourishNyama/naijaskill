/**
 * Client-side helper to call /api/notify.
 * Fire-and-forget — never throws, never blocks the main action.
 */
import { createClient } from './supabase/client';
import type { NotificationType } from './notify';

interface NotifyPayload {
  targetUserId: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
}

export async function notify(payload: NotifyPayload): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Notifications failing must never break the main user action
    console.error('[notifyClient] failed:', err);
  }
}
