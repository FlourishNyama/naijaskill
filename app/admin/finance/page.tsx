"use client";
import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, Clock, Loader2, Download } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ledger' | 'withdrawals'>('ledger');
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({ totalVolume: 0, pendingPayouts: 0 });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch Transactions
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txs) {
        // 2. Fetch User Names for these transactions
        const userIds = txs.map(t => t.user_id);
        const { data: users } = await supabase.from('profiles').select('id, full_name').in('id', userIds);

        // Merge names
        const enrichedTxs = txs.map(tx => ({
            ...tx,
            user_name: users?.find(u => u.id === tx.user_id)?.full_name || "Unknown User"
        }));
        setTransactions(enrichedTxs);

        // 3. Calc Stats
        const volume = txs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const pending = txs
            .filter(t => t.type === 'withdrawal' && t.status === 'pending')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            
        setStats({ totalVolume: volume, pendingPayouts: pending });
    }
    setLoading(false);
  };

  const handleApproval = async (txId: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this withdrawal?`)) return;
    setProcessing(txId);

    const newStatus = action === 'approve' ? 'success' : 'failed';
    
    // Update DB
    const { error } = await supabase
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', txId);

    if (!error) {
        // If rejected, refund the money to wallet (Optional logic, skipping for simplicity)
        alert(`Withdrawal ${newStatus}!`);
        // Update UI
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: newStatus } : t));
    } else {
        alert("Error: " + error.message);
    }
    setProcessing(null);
  };

  // Filter for the specific tab
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

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Total Transaction Volume</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₦{stats.totalVolume.toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-sm text-slate-500 mb-1">Pending Payouts</p>
            <h2 className="text-3xl font-bold text-orange-500">₦{stats.pendingPayouts.toLocaleString()}</h2>
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
            Withdrawal Requests {stats.pendingPayouts > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs ml-2">Action Required</span>}
        </button>
      </div>

      {/* TABLE */}
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
                                {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-green-500"/> : <ArrowUpRight className="w-4 h-4 text-orange-500"/>}
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
                                {tx.status === 'pending' && <Clock className="w-3 h-3"/>}
                                {tx.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                            {/* APPROVAL ACTIONS (Only for pending withdrawals) */}
                            {tx.type === 'withdrawal' && tx.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleApproval(tx.id, 'approve')}
                                        disabled={processing === tx.id}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Approve Payout"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleApproval(tx.id, 'reject')}
                                        disabled={processing === tx.id}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject"
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
    </div>
  );
}