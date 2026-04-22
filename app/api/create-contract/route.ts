import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { artisanId, description, budget, location, jobId, serviceType, isStaged } = body;
  if (!artisanId || !budget || budget <= 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Fee split: client pays +2.5%, artisan receives -2.5% — platform earns 5% total
  const clientFee   = Math.round(budget * 0.025);
  const artisanFee  = Math.round(budget * 0.025);
  const clientCharge  = budget + clientFee;   // deducted from client wallet now
  const artisanPayout = budget - artisanFee;  // paid to artisan on release

  // 1. Check client wallet balance
  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  const balance = wallet?.balance ?? 0;

  if (balance < clientCharge) {
    return NextResponse.json({
      error: 'insufficient_funds',
      required: clientCharge,
      current: balance,
      shortfall: clientCharge - balance,
    }, { status: 402 });
  }

  // 2. Deduct from client wallet
  const { error: walletErr } = await supabase
    .from('wallets')
    .update({ balance: balance - clientCharge })
    .eq('user_id', user.id);

  if (walletErr) return NextResponse.json({ error: walletErr.message }, { status: 500 });

  // 3. Record the escrow hold as a transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'escrow_hold',
    amount: clientCharge,
    description: `Escrow hold${jobId ? ` — Job #${String(jobId).substring(0, 6)}` : ''}`,
    status: 'success',
  });

  // 4. Create the booking
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      client_id: user.id,
      artisan_id: artisanId,
      client_name: user.user_metadata?.full_name || 'Client',
      job_description: description || '',
      service_type: serviceType || '',
      budget,
      escrow_amount: artisanPayout,
      location: location || 'Nigeria',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      is_staged: isStaged ?? false,
    })
    .select('id')
    .single();

  if (bookingErr) {
    // Refund client wallet if booking insert failed
    await supabase.from('wallets').update({ balance }).eq('user_id', user.id);
    return NextResponse.json({ error: bookingErr.message }, { status: 500 });
  }

  // 5. If staged, create the 3 stage records
  if (isStaged && booking) {
    const stages = [
      { stage_number: 1, label: 'Materials Deposit', amount: Math.round(artisanPayout * 0.30) },
      { stage_number: 2, label: 'Mid-Work Progress',  amount: Math.round(artisanPayout * 0.50) },
      { stage_number: 3, label: 'Final Completion',   amount: artisanPayout - Math.round(artisanPayout * 0.30) - Math.round(artisanPayout * 0.50) },
    ];
    await supabase.from('job_stages').insert(
      stages.map(s => ({ ...s, booking_id: booking.id, status: 'pending' }))
    );
  }

  // 6. Close the source job post if this came from a job post hire
  if (jobId) {
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId);
    await supabase.from('job_applications').update({ status: 'accepted' }).eq('id', body.applicationId).eq('job_id', jobId);
  }

  return NextResponse.json({ success: true, bookingId: booking.id });
}
