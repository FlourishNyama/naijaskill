import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, NotificationType } from '@/utils/notify';
import { createAdminClient } from '@/utils/supabase/admin';

// Simple in-memory rate limit: max 30 notifications per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  // 1. Verify caller is an authenticated Elite Job user
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  if (isRateLimited(user.id)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // 2. Parse and validate body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { targetUserId, title, body: notifBody, type, link } = body;
  if (!targetUserId || !title || !notifBody || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 3. Send — errors are caught internally and logged
  await sendNotification({
    targetUserId,
    title,
    body: notifBody,
    type: type as NotificationType,
    link,
  });

  return NextResponse.json({ success: true });
}
