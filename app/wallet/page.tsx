"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import dynamic from 'next/dynamic';

// --- THE FIX: Load Paystack only on the client side ---
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [amountToFund, setAmountToFund] = useState(5000); 

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (wallet) setBalance(wallet.balance);
      setLoading(false);
    };
    getData();
  }, [router]);

  const componentProps = {
    email: user?.email || 'user@example.com',
    amount: amountToFund * 100, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '', 
    text: "Fund Wallet Now",
    onSuccess: async (reference: any) => {
      alert("Payment Successful! Reference: " + reference.reference);
      const supabase = createClient();
      const newBalance = balance + amountToFund;
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
      setBalance(newBalance);
    },
    onClose: () => alert("Transaction canceled"),
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 mb-20">
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-3 text-gray-500 hover:text-green-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
        </div>

        <div className="bg-green-900 dark:bg-green-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-6">₦{balance.toLocaleString()}</h2>
            
            <div className="flex gap-3 items-center">
               <div className="flex-1">
                 <label className="text-[10px] text-green-200 uppercase font-bold">Amount to Add</label>
                 <input 
                   type="number" 
                   value={amountToFund}
                   onChange={(e) => setAmountToFund(Number(e.target.value))}
                   className="w-full p-2 rounded text-green-900 font-bold text-sm outline-none"
                 />
               </div>
               
               <div className="flex-1 pt-4">
                 {/* Only render Paystack if key exists to prevent crashes */}
                 {process.env.NEXT_PUBLIC_PAYSTACK_KEY && (
                   <PaystackButton 
                      {...componentProps} 
                      className="w-full bg-white text-green-900 py-2.5 rounded-lg font-bold text-sm hover:bg-green-50 transition flex items-center justify-center shadow-lg"
                   />
                 )}
                 {!process.env.NEXT_PUBLIC_PAYSTACK_KEY && (
                   <button className="w-full bg-gray-400 text-white py-2.5 rounded-lg font-bold text-sm cursor-not-allowed">Missing Key</button>
                 )}
               </div>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white mb-4">History</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-8 text-center text-gray-400 text-sm">
           Transactions will appear here.
        </div>
      </main>
    </div>
  );
}