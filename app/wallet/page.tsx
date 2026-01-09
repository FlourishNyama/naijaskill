"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ArrowDownLeft, Loader2, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import dynamic from 'next/dynamic';

// Import Paystack as Backup
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [amountToFund, setAmountToFund] = useState(5000); 
  const [amountToWithdraw, setAmountToWithdraw] = useState(0); 

  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Get Balance
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
      if (wallet) setBalance(wallet.balance);

      // Get History
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

  // --- 1. THE NEW KORAPAY FUNCTION (Uses the Script you just added) ---
  const handleKorapayPayment = () => {
    // Check if script is loaded
    if (!(window as any).Korapay) {
        alert("Payment system loading... please wait 2 seconds and try again.");
        return;
    }

    // Initialize Korapay Window
    (window as any).Korapay.initialize({
      key: process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY,
      reference: `elite_kora_${Date.now()}`,
      amount: amountToFund, // Korapay uses Naira
      currency: "NGN",
      customer: {
        name: user?.user_metadata?.full_name || 'Elitejob User',
        email: user?.email || 'user@elitejob.com',
      },
      onSuccess: async function (data: any) {
        // Payment Success Logic
        const newBalance = balance + amountToFund;
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
        
        await supabase.from('transactions').insert({
          user_id: user.id, type: 'deposit', amount: amountToFund,
          description: 'Funded via Bank Transfer (Korapay)', reference: data.reference, status: 'success'
        });
        alert("Payment Successful! Balance Updated.");
        window.location.reload();
      },
      onClose: function () {
        console.log("Payment window closed.");
      }
    });
  };

  // --- WITHDRAWAL LOGIC ---
  const handleWithdraw = async () => {
    if (amountToWithdraw <= 0) return alert("Enter valid amount.");
    if (amountToWithdraw > balance) return alert("Insufficient funds.");

    if (!window.confirm(`Request withdrawal of ₦${amountToWithdraw.toLocaleString()}?`)) return;

    const newBalance = balance - amountToWithdraw;
    const { error } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

    if (!error) {
        await supabase.from('transactions').insert({
            user_id: user.id, type: 'withdrawal', amount: amountToWithdraw,
            description: 'Withdrawal Request', status: 'pending' 
        });
        setBalance(newBalance);
        setAmountToWithdraw(0);
        alert("Withdrawal Request Submitted!");
        window.location.reload(); 
    }
  };

  // Paystack Config (Backup)
  const paystackConfig = {
    email: user?.email || 'user@elitejob.com',
    amount: amountToFund * 100, // Paystack uses Kobo!
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    text: "Pay with Card (Backup)",
    onSuccess: async (reference: any) => {
        const newBalance = balance + amountToFund;
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
        await supabase.from('transactions').insert({
          user_id: user.id, type: 'deposit', amount: amountToFund,
          description: 'Funded via Card (Paystack)', reference: reference.reference, status: 'success'
        });
        alert("Payment Successful!");
        window.location.reload();
    },
    onClose: () => alert("Transaction Canceled"),
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-3 text-gray-500 hover:text-green-600"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Elitejob Wallet</h1>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8 border border-slate-700">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32" /></div>
          
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-8">₦{balance.toLocaleString()}</h2>
            
            {/* FUNDING SECTION */}
            <div className="space-y-3">
               <label className="block text-[10px] text-slate-300 uppercase font-bold">Fund Wallet (₦)</label>
               <input 
                  type="number" 
                  value={amountToFund} 
                  onChange={(e) => setAmountToFund(Number(e.target.value))} 
                  className="w-full pl-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold outline-none focus:border-green-500" 
               />
               
               {/* OPTION 1: KORAPAY BUTTON (Calls our new function) */}
               {process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY && (
                   <button 
                     onClick={handleKorapayPayment}
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition shadow-lg shadow-green-900/20"
                   >
                     <ArrowDownLeft className="w-5 h-5 mr-2" /> Pay with Bank Transfer (Recommended)
                   </button>
               )}

               {/* OPTION 2: PAYSTACK BUTTON (Backup) */}
               {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && (
                   <div className="pt-2 text-center">
                       <p className="text-xs text-slate-500 mb-2">Having network issues? Try the backup:</p>
                       <PaystackButton {...paystackConfig} className="text-sm text-slate-300 hover:text-white underline decoration-dotted flex items-center justify-center w-full">
                           <CreditCard className="w-3 h-3 mr-1"/> Pay with Card (Paystack)
                       </PaystackButton>
                   </div>
               )}
            </div>
            
            {/* WITHDRAWAL SECTION */}
            <div className="pt-6 mt-6 border-t border-slate-700">
                <div className="flex gap-2">
                    <input type="number" placeholder="Amount" value={amountToWithdraw === 0 ? '' : amountToWithdraw} onChange={(e) => setAmountToWithdraw(Number(e.target.value))} className="flex-1 pl-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm outline-none" />
                    <button onClick={handleWithdraw} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Withdraw</button>
                </div>
            </div>

          </div>
        </div>

        {/* HISTORY */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
           {transactions.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">No transactions found.</div> : 
             transactions.map((tx) => (
               <div key={tx.id} className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center text-sm">
                 <div>
                    <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                 </div>
                 <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                 </div>
               </div>
             ))
           }
        </div>

      </main>
    </div>
  );
}