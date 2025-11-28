"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // To kick out strangers
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  Settings, 
  LogOut,
  Clock,
  CheckCircle,
  ShieldCheck,
  Plus,
  Repeat,
  Loader2
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client'; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- CHECK IF USER IS LOGGED IN ---
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex pb-20 md:pb-0 transition-colors duration-300"> 
      
      {/* 1. SIDEBAR (Desktop Only) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-green-900 dark:text-white tracking-tight">
            Naija<span className="text-green-600 dark:text-green-400">Skill</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center px-4 py-3 bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/jobs" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Briefcase className="w-5 h-5 mr-3" /> My Jobs
          </Link>
          <Link href="/messages?returnTo=/dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <MessageSquare className="w-5 h-5 mr-3" /> Messages
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
          </Link>
          <Link href="/wallet" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Wallet className="w-5 h-5 mr-3" /> Wallet
          </Link>
          <Link href="/settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Link href="/artisan-dashboard" className="flex items-center px-4 py-3 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg font-bold text-sm transition">
             <Repeat className="w-4 h-4 mr-3" /> Switch to Artisan
          </Link>
          <button onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium w-full transition">
            <LogOut className="w-5 h-5 mr-3" /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around items-center py-3 pb-safe">
        <Link href="/dashboard" className="flex flex-col items-center text-green-600 dark:text-green-400">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link href="/jobs" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400">
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Jobs</span>
        </Link>
        <Link href="/messages?returnTo=/dashboard" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 relative">
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full">3</span>
          <span className="text-[10px] font-medium mt-1">Chat</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Wallet</span>
        </Link>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8 mt-4 md:mt-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-bold text-green-600">{user?.user_metadata?.full_name || "Client"}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/artisan-dashboard" className="md:hidden p-2 bg-green-50 dark:bg-slate-800 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-slate-700">
                <Repeat className="w-5 h-5" />
             </Link>

             {/* DYNAMIC PROFILE PICTURE LOGIC */}
             <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-green-100 dark:bg-green-900/30">
                {user?.user_metadata?.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  // Fallback to initials if no image
                  user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || "CN"
                )}
             </div>
          </div>
        </div>

        {/* --- POST A JOB BUTTON --- */}
        <div className="mb-8">
          <Link href="/post-job" className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition shadow-lg transform active:scale-95">
            <Plus className="w-5 h-5 mr-2" /> Post a New Job Request
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          
          <Link href="/wallet" className="bg-green-900 dark:bg-green-950 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer transition transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-200 text-sm font-medium group-hover:text-white transition">Wallet Balance</span>
                <div className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">₦45,000</div>
              <p className="text-xs text-green-200 group-hover:text-white transition">Click to view history</p>
            </div>
          </Link>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Jobs</span>
              <Briefcase className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1</div>
          </div>

          <Link href="/messages?returnTo=/dashboard" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 dark:hover:border-green-500 transition cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400">Unread Messages</span>
              <MessageSquare className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
          </Link>
          
        </div>

        {/* ACTIVE JOB CARD */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Active Jobs</h2>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800">
                <Image 
                  src="https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop"
                  alt="Emmanuel"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Kitchen Pipe Repair</h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Hired: Emmanuel Okafor</p>
              </div>
            </div>
            <span className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold flex items-center">
              <Clock className="w-3 h-3 mr-1" /> In Progress
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 flex flex-col md:flex-row justify-between items-center gap-3">
             <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm w-full md:w-auto text-center">
               View Contract
             </button>
             <button className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white px-6 py-3 md:py-2 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center w-full md:w-auto">
               <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete & Release
             </button>
          </div>
        </div>

      </main>
    </div>
  );
}