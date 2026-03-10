"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, ArrowDownLeft, Loader2, CreditCard, Building2 } from 'lucide-react';
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
  
  // Funding State
  const [amountToFund, setAmountToFund] = useState(5000); 

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

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

  // --- 1. KORAPAY PAYMENT FUNCTION ---
  const handleKorapayPayment = () => {
    // Check if script loaded
    if (!(window as any).Korapay) {
        alert("System loading... please wait 2 seconds.");
        return;
    }

    // Check for Keys
    const key = process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY;
    if (!key) {
        alert("Error: Korapay Public Key is missing in .env.local file!");
        return;
    }

    (window as any).Korapay.initialize({
      key: key,
      reference: `elite_kora_${Date.now()}`,
      amount: amountToFund,
      currency: "NGN",
      methods: ["card", "bank_transfer", "ussd", "mobile_money"],
      customer: {
        name: user?.user_metadata?.full_name || 'Elitejob User',
        email: user?.email || 'user@elitejob.com',
      },
      onSuccess: async function (data: any) {
        const newBalance = balance + amountToFund;
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
        
        await supabase.from('transactions').insert({
          user_id: user.id, type: 'deposit', amount: amountToFund,
          description: 'Funded via Bank Transfer (Korapay)', reference: data.reference, status: 'success'
        });
        alert("Payment Successful! Balance Updated.");
        window.location.reload();
      },
      onClose: function () { console.log("Closed"); }
    });
  };

  // --- 2. WITHDRAWAL LOGIC (With Bank Details) ---
  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) return alert("Enter valid amount.");
    if (amount > balance) return alert("Insufficient funds.");
    if (!bankName || !accountNumber) return alert("Please enter your Bank Name and Account Number.");
    if (accountNumber.length < 10) return alert("Account number seems too short.");

    if (!window.confirm(`Withdraw ₦${amount.toLocaleString()} to ${bankName} (${accountNumber})?`)) return;

    setIsWithdrawing(true);

    // 1. Deduct Balance
    const newBalance = balance - amount;
    const { error } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

    if (!error) {
        // 2. Save Request with Bank Details in description
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'withdrawal',
            amount: amount,
            description: `Withdrawal to ${bankName} - ${accountNumber}`, // <--- Saved Here
            status: 'pending' 
        });

        setBalance(newBalance);
        setWithdrawAmount('');
        setBankName('');
        setAccountNumber('');
        alert("Withdrawal Request Submitted! Admin will process it shortly.");
        window.location.reload(); 
    } else {
        alert("Error: " + error.message);
    }
    setIsWithdrawing(false);
  };

  // Paystack Backup Config
  const paystackConfig = {
    email: user?.email || 'user@elitejob.com',
    amount: amountToFund * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    text: "Pay with Card (Backup)",
    onSuccess: async (reference: any) => {
        const newBalance = balance + amountToFund;
        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
        await supabase.from('transactions').insert({
          user_id: user.id, type: 'deposit', amount: amountToFund,
          description: 'Funded via Card (Paystack)', reference: reference.reference, status: 'success'
        });
        window.location.reload();
    },
    onClose: () => alert("Cancelled"),
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-green-600" /></div>;
// DEBUG LINE - DELETE LATER
console.log("MY KEY IS:", process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        
        <div className="flex items-center mb-6">
          <Link href="/dashboard" className="mr-3 text-gray-500 hover:text-green-600"><ArrowLeft className="w-6 h-6" /></Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-8 border border-slate-700">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-32 h-32" /></div>
          
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium mb-1">Available Balance</p>
            <h2 className="text-4xl font-bold mb-8">₦{balance.toLocaleString()}</h2>
            
            {/* --- FUNDING SECTION --- */}
            <div className="space-y-4">
               <div>
                   <label className="block text-[10px] text-slate-300 uppercase font-bold mb-1">Fund Wallet (₦)</label>
                   <input 
                      type="number" 
                      value={amountToFund} 
                      onChange={(e) => setAmountToFund(Number(e.target.value))} 
                      className="w-full pl-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white font-bold outline-none focus:border-green-500" 
                   />
               </div>
               
               {/* KORAPAY BUTTON */}
               {process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY ? (
                   <button 
                     onClick={handleKorapayPayment}
                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center transition shadow-lg shadow-green-900/20"
                   >
                     <ArrowDownLeft className="w-5 h-5 mr-2" /> Pay with Bank Transfer
                   </button>
               ) : (
                   <button className="w-full bg-red-900/50 text-red-200 py-3 rounded-lg text-xs font-mono border border-red-800">
                       ❌ API KEY MISSING (Check .env.local)
                   </button>
               )}

               {/* PAYSTACK BACKUP */}
               {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && (
                   <div className="text-center">
                       <PaystackButton {...paystackConfig} className="text-xs text-slate-400 hover:text-white underline decoration-dotted">
                           Or pay with Card (Paystack)
                       </PaystackButton>
                   </div>
               )}
            </div>
            
            {/* --- WITHDRAWAL SECTION (New Inputs) --- */}
            <div className="pt-6 mt-6 border-t border-slate-700">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center"><Building2 className="w-4 h-4 mr-2"/> Withdraw to Bank</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input 
                        type="text" 
                        placeholder="Bank Name (e.g., GTBank)" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="pl-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs outline-none" 
                    />
                    <input 
                        type="number" 
                        placeholder="Account Number" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="pl-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs outline-none" 
                    />
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="Amount to Withdraw" 
                        value={withdrawAmount} 
                        onChange={(e) => setWithdrawAmount(e.target.value)} 
                        className="flex-1 pl-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm outline-none" 
                    />
                    <button 
                        onClick={handleWithdraw} 
                        disabled={isWithdrawing}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                    >
                        {isWithdrawing ? '...' : 'Withdraw'}
                    </button>
                </div>
            </div>

          </div>
        </div>

        {/* --- HISTORY --- */}
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
           {transactions.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">No transactions found.</div> : 
             transactions.map((tx) => (
               <div key={tx.id} className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center text-sm">
                 <div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{tx.description}</p>
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