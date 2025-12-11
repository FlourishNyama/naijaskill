"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, MessageSquare, Wallet, Settings, Plus, Loader2, User } from 'lucide-react';
import { createClient } from '../../utils/supabase/client'; 
import Navbar from '@/components/Navbar'; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);

        // 1. Fetch Wallet
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (wallet) {
            setBalance(wallet.balance);
        } else {
            await supabase.from('wallets').insert({ user_id: user.id, balance: 0 });
        }

        // 2. Self-Healing Profile
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
        if (!profile) {
            await supabase.from('profiles').insert({ 
                id: user.id, 
                full_name: user.user_metadata?.full_name || 'New User',
                role: 'client'
            });
        }

        // 3. Count Active Jobs
        const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', user.id)
            .neq('status', 'completed')
            .neq('status', 'rejected');
        
        if (count !== null) setActiveJobsCount(count);
        
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300"> 
      <Navbar />

      <div className="flex pb-20 md:pb-0">
        
        {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-[calc(100vh-64px)] z-10" style={{top: '64px'}}>
          <nav className="flex-1 px-4 space-y-2 mt-6">
            <Link href="/dashboard" className="flex items-center px-4 py-3 bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 rounded-lg font-medium"><LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard</Link>
            <Link href="/jobs" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Briefcase className="w-5 h-5 mr-3" /> My Jobs</Link>
            <Link href="/messages?returnTo=/dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><MessageSquare className="w-5 h-5 mr-3" /> Messages</Link>
            <Link href="/wallet" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Wallet className="w-5 h-5 mr-3" /> Wallet</Link>
            <Link href="/settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Settings className="w-5 h-5 mr-3" /> Settings</Link>
          </nav>
        </aside>

        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-bold text-green-600">{user?.user_metadata?.full_name || "Client"}</span>.
            </p>
          </div>

          {/* --- MOBILE NAVIGATION GRID (Only shows on Phone) --- */}
          <div className="md:hidden grid grid-cols-4 gap-3 mb-8">
            <Link href="/jobs" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Briefcase className="w-6 h-6 text-green-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">My Jobs</span>
            </Link>
            <Link href="/wallet" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Wallet className="w-6 h-6 text-orange-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Wallet</span>
            </Link>
            <Link href="/messages?returnTo=/dashboard" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <MessageSquare className="w-6 h-6 text-blue-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Chats</span>
            </Link>
            <Link href="/settings" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Settings className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Settings</span>
            </Link>
          </div>

          {/* Action Button */}
          <div className="mb-8">
            <Link href="/post-job" className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition shadow-lg transform active:scale-95">
                <Plus className="w-5 h-5 mr-2" /> Post a New Job Request
            </Link>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            
            {/* Wallet Card */}
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

            {/* Active Jobs Card (Now Clickable) */}
            <Link href="/jobs" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4"><span className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400">Active Jobs</span><Briefcase className="w-5 h-5 text-green-500" /></div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobsCount}</div>
            </Link>

            {/* Messages Card */}
            <Link href="/messages?returnTo=/dashboard" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 dark:hover:border-green-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4"><span className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400">Unread Messages</span><MessageSquare className="w-5 h-5 text-orange-500" /></div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}