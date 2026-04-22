import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();

  // Verify caller is an admin
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { data: admin } = await supabase.from('admins').select('id').eq('email', user.email).single();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { stageId, action } = body; // action: 'approve' | 'reject'
  if (!stageId || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Missing stageId or invalid action' }, { status: 400 });
  }

  // Load the stage + booking
  const { data: stage } = await supabase
    .from('job_stages')
    .select('*, booking:bookings(artisan_id, escrow_amount, budget, job_description)')
    .eq('id', stageId)
    .single();

  if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 });
  if (stage.status !== 'submitted') return NextResponse.json({ error: 'Stage is not in submitted state' }, { status: 409 });

  if (action === 'reject') {
    await supabase.from('job_stages').update({ status: 'rejected' }).eq('id', stageId);
    return NextResponse.json({ success: true, action: 'rejected' });
  }

  // APPROVE: release funds to artisan
  const booking = stage.booking as any;
  const artisanId = booking.artisan_id;
  const payout = stage.amount; // already the post-fee amount

  // 1. Credit artisan wallet
  const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', artisanId).single();
  const currentBalance = wallet?.balance ?? 0;

  if (wallet) {
    await supabase.from('wallets').update({ balance: currentBalance + payout }).eq('user_id', artisanId);
  } else {
    await supabase.from('wallets').insert({ user_id: artisanId, balance: payout });
  }

  // 2. Record transaction
  await supabase.from('transactions').insert({
    user_id: artisanId,
    type: 'payment',
    amount: payout,
    description: `Stage ${stage.stage_number} payment — ${booking.job_description || 'Service'}`,
    status: 'success',
  });

  // 3. Mark stage approved
  await supabase.from('job_stages')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', stageId);

  // 4. If stage 3 approved, mark booking completed
  if (stage.stage_number === 3) {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', stage.booking_id);
  }

  return NextResponse.json({ success: true, action: 'approved', payout });
}
