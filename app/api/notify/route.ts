import { NextRequest, NextResponse } from 'next/server';
import { sendNotification, NotificationType } from '@/utils/notify';
import { createAdminClient } from '@/utils/supabase/admin';

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
