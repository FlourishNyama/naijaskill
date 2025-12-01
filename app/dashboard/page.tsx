"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, Briefcase, MessageSquare, Wallet, Settings, LogOut, Clock, CheckCircle, ShieldCheck, Plus, Repeat, Loader2, ChevronDown
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client'; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
        // FETCH WALLET BALANCE
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();
        if (wallet) setBalance(wallet.balance);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex pb-20 md:pb-0 transition-colors duration-300"> 
      
      {/* 1. SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-green-900 dark:text-white tracking-tight">
            Naija<span className="text-green-600 dark:text-green-400">Skill</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center px-4 py-3 bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 rounded-lg font-medium"><LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard</Link>
          <Link href="/jobs" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Briefcase className="w-5 h-5 mr-3" /> My Jobs</Link>
          <Link href="/messages?returnTo=/dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><MessageSquare className="w-5 h-5 mr-3" /> Messages</Link>
          <Link href="/wallet" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Wallet className="w-5 h-5 mr-3" /> Wallet</Link>
          <Link href="/settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Settings className="w-5 h-5 mr-3" /> Settings</Link>
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Link href="/artisan-dashboard" className="flex items-center px-4 py-3 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg font-bold text-sm transition"><Repeat className="w-4 h-4 mr-3" /> Switch to Artisan</Link>
          <button onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium w-full transition"><LogOut className="w-5 h-5 mr-3" /> Log Out</button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around items-center py-3 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center text-green-600 dark:text-green-400"><LayoutDashboard className="w-6 h-6" /><span className="text-[10px] font-medium mt-1">Home</span></Link>
        <Link href="/jobs" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"><Briefcase className="w-6 h-6" /><span className="text-[10px] font-medium mt-1">Jobs</span></Link>
        <Link href="/messages?returnTo=/dashboard" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 relative"><MessageSquare className="w-6 h-6" /><span className="text-[10px] font-medium mt-1">Chat</span></Link>
        <Link href="/wallet" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"><Wallet className="w-6 h-6" /><span className="text-[10px] font-medium mt-1">Wallet</span></Link>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8 mt-4 md:mt-0 relative z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Welcome back, <span className="font-bold text-green-600">{user?.user_metadata?.full_name || "Client"}</span>.</p>
          </div>
          <div className="relative">
             <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 focus:outline-none">
                {/* --- IMAGE FIX: Added 'relative' class and 'object-cover' to Image --- */}
                <div className="relative h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                      <span>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || "CN"}</span>
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 md:hidden" />
             </button>
             {isProfileOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.user_metadata?.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link href="/artisan-dashboard" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"><Repeat className="w-4 h-4 mr-2" /> Switch to Artisan</Link>
                      <Link href="/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"><Settings className="w-4 h-4 mr-2" /> Settings</Link>
                    </div>
                    <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout} className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"><LogOut className="w-4 h-4 mr-2" /> Log Out</button>
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>

        <div className="mb-8">
          <Link href="/post-job" className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition shadow-lg transform active:scale-95"><Plus className="w-5 h-5 mr-2" /> Post a New Job Request</Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          
          {/* REAL WALLET BALANCE CARD */}
          <Link href="/wallet" className="bg-green-900 dark:bg-green-950 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer transition transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-24 h-24" /></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-200 text-sm font-medium group-hover:text-white transition">Wallet Balance</span>
                <div className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition"><Plus className="w-4 h-4 text-white" /></div>
              </div>
              <div className="text-3xl font-bold mb-1">₦{balance.toLocaleString()}</div>
              <p className="text-xs text-green-200 group-hover:text-white transition">Click to view history</p>
            </div>
          </Link>

          {/* Active Jobs & Messages ... (Keeping these simple for stability) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4"><span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Jobs</span><Briefcase className="w-5 h-5 text-green-500" /></div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
          </div>

          <Link href="/messages?returnTo=/dashboard" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 dark:hover:border-green-500 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-4"><span className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400">Unread Messages</span><MessageSquare className="w-5 h-5 text-orange-500" /></div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
          </Link>
        </div>

         {/* Active Jobs Placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-8 text-center text-gray-400 text-sm">Your recent jobs will appear here.</div>
        </div>

      </main>
    </div>
  );
}