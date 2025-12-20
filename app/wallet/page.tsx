"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ArrowUpRight, Loader2, ArrowDownLeft, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import dynamic from 'next/dynamic';

const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]); // New State for History
  
  const [amountToFund, setAmountToFund] = useState(5000); 
  const [amountToWithdraw, setAmountToWithdraw] = useState(0); 

  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // 1. Fetch Balance
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
      if (wallet) setBalance(wallet.balance);

      // 2. Fetch History (The Fix)
      const { data: history } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (history) setTransactions(history);
      
      setLoading(false);
    };
    getData();
  }, [router]);

  // --- WITHDRAWAL LOGIC ---
  // ... inside src/app/wallet/page.tsx

  const handleWithdraw = async () => {
    if (amountToWithdraw <= 0) return alert("Enter valid amount.");
    if (amountToWithdraw > balance) return alert("Insufficient funds.");

    const confirm = window.confirm(`Request withdrawal of ₦${amountToWithdraw.toLocaleString()}?`);
    if (!confirm) return;

    // 1. Deduct Balance Immediately (To prevent double withdrawal)
    const newBalance = balance - amountToWithdraw;
    const { error } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

    if (!error) {
        // 2. Record Transaction as PENDING
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'withdrawal',
            amount: amountToWithdraw,
            description: 'Withdrawal Request',
            status: 'pending' // <--- THIS IS THE KEY FIX
        });

        setBalance(newBalance);
        setAmountToWithdraw(0);
        alert("Withdrawal Request Submitted! Admin will review shortly.");
        window.location.reload(); 
    } else {
        alert("Error: " + error.message);
    }
  };

  // --- PAYSTACK LOGIC ---
  const componentProps = {
    email: user?.email || 'user@example.com',
    amount: amountToFund * 100, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '', 
    text: "Fund Wallet",
    onSuccess: async (reference: any) => {
      alert("Payment Successful! Ref: " + reference.reference);
      
      // 1. Add Balance
      const newBalance = balance + amountToFund;
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
      
      // 2. Record Transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount: amountToFund,
        description: 'Funded via Paystack',
        reference: reference.reference,
        status: 'success'
      });

      setBalance(newBalance);
      window.location.reload();
    },
    onClose: () => alert("Transaction canceled"),
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 mb-20">
        
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-3 text-gray-500 hover:text-green-600"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-green-900 dark:bg-green-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4"><Wallet className="w-32 h-32" /></div>
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-8">₦{balance.toLocaleString()}</h2>
            
            {/* FUNDING */}
            <div className="flex gap-3 items-end mb-6">
               <div className="flex-1">
                 <label className="block text-[10px] text-green-200 uppercase font-bold mb-1">Fund Wallet (₦)</label>
                 <div className="relative">
                    <ArrowDownLeft className="absolute left-2 top-2.5 w-4 h-4 text-green-700" />
                    <input type="number" value={amountToFund} onChange={(e) => setAmountToFund(Number(e.target.value))} className="w-full pl-8 pr-2 py-2 rounded text-green-900 font-bold text-sm outline-none" />
                 </div>
               </div>
               <div className="flex-1">
                 {process.env.NEXT_PUBLIC_PAYSTACK_KEY ? (
                   <PaystackButton {...componentProps} className="w-full bg-white text-green-900 py-2 rounded font-bold text-sm hover:bg-green-50 transition shadow-lg h-[36px]" />
                 ) : (
                   <button className="w-full bg-gray-400 text-white py-2 rounded font-bold text-sm cursor-not-allowed h-[36px]">Missing Key</button>
                 )}
               </div>
            </div>
            
            {/* WITHDRAWAL */}
            <div className="pt-4 border-t border-green-800/50 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-[10px] text-green-200 uppercase font-bold mb-1">Withdraw (₦)</label>
                    <div className="relative">
                        <ArrowUpRight className="absolute left-2 top-2.5 w-4 h-4 text-green-700" />
                        <input type="number" value={amountToWithdraw === 0 ? '' : amountToWithdraw} onChange={(e) => setAmountToWithdraw(Number(e.target.value))} className="w-full pl-8 pr-2 py-2 rounded text-green-900 font-bold text-sm outline-none" />
                    </div>
                </div>
                <div className="flex-1">
                    <button onClick={handleWithdraw} className="w-full bg-green-800 hover:bg-green-700 border border-green-700 text-white py-2 rounded font-bold text-sm transition h-[36px]">Withdraw</button>
                </div>
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><Clock className="w-4 h-4 mr-2"/> Transaction History</h3>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
           {transactions.length === 0 ? (
             <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
           ) : (
             transactions.map((tx) => (
               <div key={tx.id} className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center last:border-0">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                        tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5"/> : 
                         tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5"/> : <Wallet className="w-5 h-5"/>}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{tx.description || tx.type}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <span className={`font-bold text-sm ${
                    tx.type === 'deposit' ? 'text-green-600' : 
                    tx.type === 'withdrawal' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                 }`}>
                    {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                 </span>
               </div>
             ))
           )}
        </div>

      </main>
    </div>
  );
}