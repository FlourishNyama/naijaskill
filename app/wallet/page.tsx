"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ArrowUpRight, Loader2, ArrowDownLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import dynamic from 'next/dynamic';

// Dynamic Import to fix Build Error
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

export default function WalletPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Two inputs: One for adding money, one for taking money out
  const [amountToFund, setAmountToFund] = useState(5000); 
  const [amountToWithdraw, setAmountToWithdraw] = useState(0); 

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

  // --- SMART WITHDRAWAL LOGIC ---
  const handleWithdraw = async () => {
    // 1. Validation Checks
    if (amountToWithdraw <= 0) {
        alert("Please enter a valid amount to withdraw.");
        return;
    }
    if (amountToWithdraw > balance) {
        alert("Insufficient funds! You cannot withdraw more than your balance.");
        return;
    }

    const confirm = window.confirm(`Withdraw ₦${amountToWithdraw.toLocaleString()} to your bank account?`);
    if (!confirm) return;

    // 2. Calculate Remainder
    const newBalance = balance - amountToWithdraw;

    // 3. Update Database (Simulated)
    const supabase = createClient();
    const { error } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
    
    if (!error) {
        setBalance(newBalance); // Update UI
        setAmountToWithdraw(0); // Reset Input
        alert(`Withdrawal Successful! ₦${amountToWithdraw.toLocaleString()} has been sent to your bank.`);
    } else {
        alert("Error: " + error.message);
    }
  };

  // PAYSTACK CONFIG
  const componentProps = {
    email: user?.email || 'user@example.com',
    amount: amountToFund * 100, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '', 
    text: "Fund Wallet",
    onSuccess: async (reference: any) => {
      alert("Payment Successful! Ref: " + reference.reference);
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
            <h2 className="text-4xl font-bold mb-8">₦{balance.toLocaleString()}</h2>
            
            {/* --- SECTION 1: FUND WALLET --- */}
            <div className="flex gap-3 items-end mb-6">
               <div className="flex-1">
                 <label className="block text-[10px] text-green-200 uppercase font-bold mb-1">Fund Wallet</label>
                 <div className="relative">
                    <ArrowDownLeft className="absolute left-2 top-2.5 w-4 h-4 text-green-700" />
                    <input 
                      type="number" 
                      placeholder="Amount"
                      value={amountToFund}
                      onChange={(e) => setAmountToFund(Number(e.target.value))}
                      className="w-full pl-8 pr-2 py-2 rounded text-green-900 font-bold text-sm outline-none"
                    />
                 </div>
               </div>
               
               <div className="flex-1">
                 {process.env.NEXT_PUBLIC_PAYSTACK_KEY ? (
                   <PaystackButton 
                      {...componentProps} 
                      className="w-full bg-white text-green-900 py-2 rounded font-bold text-sm hover:bg-green-50 transition shadow-lg h-[36px]"
                   />
                 ) : (
                   <button className="w-full bg-gray-400 text-white py-2 rounded font-bold text-sm cursor-not-allowed h-[36px]">Missing Key</button>
                 )}
               </div>
            </div>
            
            {/* --- SECTION 2: WITHDRAW FUNDS --- */}
            <div className="pt-4 border-t border-green-800/50 flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-[10px] text-green-200 uppercase font-bold mb-1">Withdraw Funds</label>
                    <div className="relative">
                        <ArrowUpRight className="absolute left-2 top-2.5 w-4 h-4 text-green-700" />
                        <input 
                          type="number" 
                          placeholder="Amount"
                          value={amountToWithdraw === 0 ? '' : amountToWithdraw}
                          onChange={(e) => setAmountToWithdraw(Number(e.target.value))}
                          className="w-full pl-8 pr-2 py-2 rounded text-green-900 font-bold text-sm outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <button 
                        onClick={handleWithdraw}
                        className="w-full bg-green-800 hover:bg-green-700 border border-green-700 text-white py-2 rounded font-bold text-sm transition h-[36px]"
                    >
                        Withdraw
                    </button>
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