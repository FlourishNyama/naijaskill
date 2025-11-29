"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  Settings, 
  LogOut,
  Star,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Eye,
  TrendingUp,
  Repeat,
  Loader2,
  Search,
  ChevronDown
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

export default function ArtisanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.push('/login');
      } else {
        setUser(user);

        // --- ONBOARDING CHECK ---
        const { data: profile } = await supabase
          .from('profiles')
          .select('job_title')
          .eq('id', user.id)
          .single();

        // If they don't have a Job Title, send them to settings IMMEDIATELY.
        // NO ALERT allows the redirect to happen instantly.
        if (profile && !profile.job_title) {
          router.push('/artisan-settings');
          return; // Stop loading the rest of the dashboard
        } 
        
        // Load Dashboard Data
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*')
          .eq('artisan_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (bookings) setRequests(bookings);
        
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Handle Accept/Decline
  const handleRequest = async (bookingId: string, newStatus: 'accepted' | 'rejected') => {
    const supabase = createClient();
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
    setRequests(requests.filter(r => r.id !== bookingId));
  };

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
            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-2 align-middle">PRO</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/artisan-dashboard" className="flex items-center px-4 py-3 bg-green-50 dark:bg-slate-800 text-green-700 dark:text-green-400 rounded-lg font-medium">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/artisan-projects" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Briefcase className="w-5 h-5 mr-3" /> My Projects
          </Link>
          <Link href="/messages?returnTo=/artisan-dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <MessageSquare className="w-5 h-5 mr-3" /> Messages
          </Link>
          <Link href="/wallet" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Wallet className="w-5 h-5 mr-3" /> Earnings
          </Link>
          <Link href="/artisan-settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium transition">
            <Settings className="w-5 h-5 mr-3" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <Link href="/dashboard" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg font-bold text-sm transition">
             <Repeat className="w-4 h-4 mr-3" /> Switch to Client
          </Link>
          <button onClick={handleLogout} className="flex items-center px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium w-full transition">
            <LogOut className="w-5 h-5 mr-3" /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around items-center py-3 pb-safe">
        <Link href="/artisan-dashboard" className="flex flex-col items-center text-green-600 dark:text-green-400">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </Link>
        <Link href="/artisan-projects" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400">
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Projects</span>
        </Link>
        <Link href="/messages?returnTo=/artisan-dashboard" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Chat</span>
        </Link>
        <Link href="/wallet" className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Wallet</span>
        </Link>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* Header with PROFILE DROPDOWN */}
        <div className="flex justify-between items-center mb-6 md:mb-8 mt-4 md:mt-0 relative z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artisan Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-bold text-green-600">{user?.user_metadata?.full_name || "Artisan"}</span>.
            </p>
          </div>
          
          <div className="relative">
             <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 focus:outline-none"
             >
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                    ) : (
                      user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || "AR"
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 md:hidden" />
             </button>

             {/* DROPDOWN MENU */}
             {isProfileOpen && (
               <>
                 <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.user_metadata?.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                        <Repeat className="w-4 h-4 mr-2" /> Switch to Client
                      </Link>
                      <Link href="/artisan-settings" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">
                        <Settings className="w-4 h-4 mr-2" /> Settings
                      </Link>
                    </div>

                    <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout} className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium">
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                      </button>
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          
          {/* Earnings Card */}
          <Link href="/wallet" className="col-span-2 bg-green-900 dark:bg-green-950 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <p className="text-green-200 text-xs font-medium uppercase mb-1">Total Earnings</p>
              <div className="text-3xl font-bold mb-1">₦145,000</div>
              <p className="text-xs text-green-200">+₦10k this week</p>
            </div>
          </Link>

          {/* Rating Card */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Rating</span>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.9</div>
            <p className="text-xs text-green-600 font-medium">Top Rated</p>
          </div>

          {/* Find Work Button */}
          <Link href="/find-work" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center group hover:border-green-500 dark:hover:border-green-500 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase group-hover:text-green-600">Find Work</span>
              <Search className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">Browse</div>
            <p className="text-xs text-gray-500">View open jobs</p>
          </Link>
        </div>

        {/* --- NEW JOB REQUESTS --- */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Job Requests ({requests.length})</h2>
        
        {requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No new job requests.</p>
            <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Make sure your profile is updated!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-gray-500 font-bold shrink-0">{req.client_name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">{req.client_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Needs: <span className="text-green-600 dark:text-green-400 font-bold">{req.job_description.substring(0,30)}...</span></p>
                      <div className="flex items-center text-xs text-gray-400 gap-3">
                        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {req.location}</span>
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {req.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 md:gap-2 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="block text-xs text-gray-400 uppercase font-bold">Proposed Budget</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">₦{req.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => handleRequest(req.id, 'rejected')} className="flex-1 md:flex-none px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-1" /> Decline
                      </button>
                      <button onClick={() => handleRequest(req.id, 'accepted')} className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Accept Job
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}