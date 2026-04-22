"use client";
import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock, Loader2, Download, Layers } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pendingStages, setPendingStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals' | 'stages'>('ledger');
  const [processing, setProcessing] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalVolume: 0, pendingPayouts: 0, pendingStageCount: 0 });

  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    // Transactions
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txs) {
      const userIds = [...new Set(txs.map(t => t.user_id))];
      const { data: users } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      setTransactions(txs.map(tx => ({
        ...tx,
        user_name: users?.find(u => u.id === tx.user_id)?.full_name || 'Unknown User',
      })));
      const volume = txs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const pending = txs.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      setStats(s => ({ ...s, totalVolume: volume, pendingPayouts: pending }));
    }

    // Submitted stages
    const { data: stages } = await supabase
      .from('job_stages')
      .select('*, booking:bookings(artisan_id, job_description, client_name)')
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true });

    if (stages && stages.length > 0) {
      const artisanIds = [...new Set(stages.map((s: any) => s.booking?.artisan_id).filter(Boolean))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', artisanIds);
      setPendingStages(stages.map((s: any) => ({
        ...s,
        artisan_name: profiles?.find(p => p.id === s.booking?.artisan_id)?.full_name || 'Unknown Artisan',
      })));
      setStats(prev => ({ ...prev, pendingStageCount: stages.length }));
    } else {
      setPendingStages([]);
    }

    setLoading(false);
  };

  const handleWithdrawalApproval = async (txId: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this withdrawal?`)) return;
    setProcessing(txId);
    const newStatus = action === 'approve' ? 'success' : 'failed';
    const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', txId);
    if (!error) {
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: newStatus } : t));
    } else {
      alert("Error: " + error.message);
    }
    setProcessing(null);
  };

  const handleStageAction = async (stageId: string, action: 'approve' | 'reject') => {
    const stage = pendingStages.find(s => s.id === stageId);
    const label = stage ? `Stage ${stage.stage_number} (₦${Number(stage.amount).toLocaleString()})` : 'this stage';
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} ${label}?`)) return;
    setProcessing(stageId);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/release-stage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session!.access_token}`,
      },
      body: JSON.stringify({ stageId, action }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Error: " + (data.error || 'Unknown error'));
    } else {
      setPendingStages(prev => prev.filter(s => s.id !== stageId));
      setStats(prev => ({ ...prev, pendingStageCount: prev.pendingStageCount - 1 }));
    }
    setProcessing(null);
  };

  const filteredData = activeTab === 'withdrawals'
    ? transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending')
    : transactions;

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finance Manager</h1>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total Transaction Volume</p>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₦{stats.totalVolume.toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Pending Payouts</p>
          <h2 className="text-3xl font-bold text-orange-500">₦{stats.pendingPayouts.toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Staged Approvals Waiting</p>
          <h2 className="text-3xl font-bold text-blue-500">{stats.pendingStageCount}</h2>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-sm font-bold transition ${activeTab === 'ledger' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500'}`}
        >
          General Ledger
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 text-sm font-bold transition ${activeTab === 'withdrawals' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500'}`}
        >
          Withdrawal Requests
          {stats.pendingPayouts > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs ml-2">Action Required</span>}
        </button>
        <button
          onClick={() => setActiveTab('stages')}
          className={`pb-3 text-sm font-bold transition ${activeTab === 'stages' ? 'text-green-600 border-b-2 border-green-600' : 'text-slate-500'}`}
        >
          Stage Approvals
          {stats.pendingStageCount > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ml-2">{stats.pendingStageCount} Pending</span>}
        </button>
      </div>

      {/* STAGE APPROVALS TAB */}
      {activeTab === 'stages' && (
        <div className="space-y-4">
          {pendingStages.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-400">
              No stages awaiting approval.
            </div>
          ) : pendingStages.map((stage) => (
            <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-slate-900 dark:text-white">Stage {stage.stage_number}: {stage.label}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Submitted</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">Artisan: <span className="font-medium text-slate-700 dark:text-slate-300">{stage.artisan_name}</span></p>
                  <p className="text-sm text-slate-500 mb-2">Job: {stage.booking?.job_description || '—'}</p>
                  {stage.evidence_note && (
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 italic">
                      "{stage.evidence_note}"
                    </div>
                  )}
                  {stage.submitted_at && (
                    <p className="text-xs text-slate-400 mt-2">Submitted: {new Date(stage.submitted_at).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-3">
                  <p className="text-2xl font-bold text-green-600">₦{Number(stage.amount).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStageAction(stage.id, 'approve')}
                      disabled={processing === stage.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {processing === stage.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve & Pay</>}
                    </button>
                    <button
                      onClick={() => handleStageAction(stage.id, 'reject')}
                      disabled={processing === stage.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEDGER / WITHDRAWALS TABLE */}
      {activeTab !== 'stages' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredData.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No records found.</td></tr>
              ) : filteredData.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white capitalize">
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-orange-500" />}
                      {tx.type}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{tx.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{tx.user_name}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₦{Number(tx.amount).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase flex w-fit items-center gap-1 ${
                      tx.status === 'success' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    {tx.type === 'withdrawal' && tx.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleWithdrawalApproval(tx.id, 'approve')}
                          disabled={processing === tx.id}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          title="Approve Payout"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWithdrawalApproval(tx.id, 'reject')}
                          disabled={processing === tx.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
