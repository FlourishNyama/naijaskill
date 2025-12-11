"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Briefcase, MessageSquare, Wallet, Settings, TrendingUp, CheckCircle, Clock, Loader2, Search } from 'lucide-react';
import Navbar from '@/components/Navbar'; 
import { createClient } from '../../utils/supabase/client';

export default function ArtisanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [balance, setBalance] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 1. Fetch Wallet Balance (Earnings)
      const { data: wallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
      if (wallet) setBalance(wallet.balance);

      // 2. Fetch Job Stats
      // Active: 'accepted' or 'in_progress'
      const { count: active } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', user.id)
        .in('status', ['accepted', 'in_progress']);
      
      // Completed: 'completed'
      const { count: completed } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('artisan_id', user.id)
        .eq('status', 'completed');

      setActiveJobsCount(active || 0);
      setCompletedJobsCount(completed || 0);

      // 3. Fetch Recent Job Requests (Pending)
      const { data: pending } = await supabase
        .from('bookings')
        .select('*')
        .eq('artisan_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (pending) setRecentJobs(pending);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="flex pb-20 md:pb-0">
        {/* DESKTOP SIDEBAR */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-[calc(100vh-64px)] z-10" style={{top: '64px'}}>
          <nav className="flex-1 px-4 space-y-2 mt-6">
            <Link href="/artisan-dashboard" className="flex items-center px-4 py-3 bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 rounded-lg font-medium"><LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard</Link>
            <Link href="/my-work" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Briefcase className="w-5 h-5 mr-3" /> My Work</Link>
            <Link href="/find-work" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Search className="w-5 h-5 mr-3" /> Find Work</Link>
            <Link href="/messages?returnTo=/artisan-dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><MessageSquare className="w-5 h-5 mr-3" /> Messages</Link>
            <Link href="/wallet" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Wallet className="w-5 h-5 mr-3" /> Wallet</Link>
            <Link href="/artisan-settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition"><Settings className="w-5 h-5 mr-3" /> Settings</Link>
          </nav>
        </aside>

        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artisan Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-bold text-green-600">{user?.user_metadata?.full_name || "Pro"}</span>.
            </p>
          </div>

          {/* MOBILE NAV GRID (For Phones) */}
          <div className="md:hidden grid grid-cols-4 gap-3 mb-8">
            <Link href="/my-work" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Briefcase className="w-6 h-6 text-green-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">My Jobs</span>
            </Link>
            <Link href="/find-work" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Search className="w-6 h-6 text-purple-600 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Find Work</span>
            </Link>
            <Link href="/wallet" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Wallet className="w-6 h-6 text-orange-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Wallet</span>
            </Link>
            <Link href="/artisan-settings" className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-95 transition">
                <Settings className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Settings</span>
            </Link>
          </div>

          {/* REAL STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <Link href="/wallet" className="bg-green-900 dark:bg-green-950 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-24 h-24" /></div>
              <div className="relative z-10">
                <div className="text-green-200 text-sm font-medium mb-2">Total Earnings</div>
                <div className="text-3xl font-bold mb-1">₦{balance.toLocaleString()}</div>
                <p className="text-xs text-green-200">Available for withdrawal</p>
              </div>
            </Link>

            <Link href="/my-work" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 transition cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-green-600">Active Jobs</span>
                  <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobsCount}</div>
            </Link>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4"><span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Completed</span><CheckCircle className="w-5 h-5 text-green-500" /></div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedJobsCount}</div>
            </div>
          </div>

          {/* RECENT REQUESTS */}
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Job Requests</h3>
          <div className="space-y-4">
            {recentJobs.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 text-sm">
                    No pending job requests.
                </div>
            ) : (
                recentJobs.map((job) => (
                    <div key={job.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{job.job_description.substring(0, 30)}...</h4>
                            <p className="text-xs text-gray-500">{job.client_name} • ₦{job.budget.toLocaleString()}</p>
                        </div>
                        <Link href="/my-work" className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700">
                            View
                        </Link>
                    </div>
                ))
            )}
          </div>

        </main>
      </div>
    </div>
  );
}