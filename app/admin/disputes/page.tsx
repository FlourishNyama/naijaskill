"use client";
import { useState, useEffect } from 'react';
import { AlertTriangle, MessageSquare, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import Link from 'next/link';

export default function DisputeResolution() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    // In our system, a "Dispute" is a booking with status 'disputed' or 'rejected'
    // For this beta, let's fetch 'rejected' jobs as they might need review, 
    // or add a specific 'disputed' status in the future.
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['rejected', 'disputed']) // You might need to add 'disputed' to your status check
      .order('updated_at', { ascending: false });
      
    if (data) setDisputes(data);
    setLoading(false);
  };

  const resolveDispute = async (jobId: string, resolution: 'refund_client' | 'pay_artisan') => {
    if (!window.confirm(`Are you sure you want to ${resolution === 'refund_client' ? 'Refund the Client' : 'Release Funds to Artisan'}? This cannot be undone.`)) return;
    
    setProcessing(jobId);

    // 1. Update Job Status
    const newStatus = resolution === 'refund_client' ? 'cancelled' : 'completed';
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);

    if (error) {
        alert("Error updating job: " + error.message);
        setProcessing(null);
        return;
    }

    // 2. Handle Money (Logic would go here)
    // In a real app, you would trigger a database function to move the funds from the 'Escrow' wallet 
    // back to the Client's wallet or forward to the Artisan's wallet.
    
    alert(`Dispute Resolved: ${newStatus.toUpperCase()}`);
    
    // 3. Refresh List
    setDisputes(prev => prev.filter(d => d.id !== jobId));
    setProcessing(null);
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispute Resolution Center</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr>
                    <th className="px-6 py-4">Job ID</th>
                    <th className="px-6 py-4">Issue</th>
                    <th className="px-6 py-4">Parties</th>
                    <th className="px-6 py-4">Amount Held</th>
                    <th className="px-6 py-4 text-right">Verdict</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {disputes.length === 0 ? (
                    <tr><td colSpan={5} className="p-10 text-center text-slate-400">
                        <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20"/>
                        No active disputes. Peace reigns.
                    </td></tr>
                ) : disputes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{d.id.slice(0,8)}...</td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{d.job_description}</div>
                            <span className="text-xs text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded-full uppercase">{d.status}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                            <div className="flex flex-col gap-1">
                                <span>Client: <b>{d.client_name}</b></span>
                                <span>Artisan: (ID: {d.artisan_id.slice(0,5)})</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">₦{d.budget?.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 items-center">
                                {/* Link to view Chat Evidence */}
                                <Link href={`/messages?chatWith=${d.client_id}`} target="_blank" className="text-blue-500 hover:underline text-xs mr-2 flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-1"/> View Chat
                                </Link>

                                <button 
                                    onClick={() => resolveDispute(d.id, 'pay_artisan')}
                                    disabled={processing === d.id}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700"
                                >
                                    Pay Artisan
                                </button>
                                <button 
                                    onClick={() => resolveDispute(d.id, 'refund_client')}
                                    disabled={processing === d.id}
                                    className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-300"
                                >
                                    Refund Client
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}