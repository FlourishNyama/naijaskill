"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, Briefcase, DollarSign, 
  ShieldAlert, Settings, LogOut, Loader2 
} from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!admin) {
        alert("Access Denied: You do not have admin permissions.");
        router.push('/dashboard'); // Kick them back to regular dashboard
        return;
      }

      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin w-10 h-10"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex-col hidden md:flex fixed h-full z-50">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-green-500 tracking-wider">NAIJA<span className="text-white">ADMIN</span></h1>
          <p className="text-xs text-slate-400 mt-1">God Mode</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <LayoutDashboard className="w-5 h-5 mr-3 text-blue-400" /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <Users className="w-5 h-5 mr-3 text-purple-400" /> User Management
          </Link>
          <Link href="/admin/jobs" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <Briefcase className="w-5 h-5 mr-3 text-orange-400" /> Jobs & Gigs
          </Link>
          <Link href="/admin/finance" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <DollarSign className="w-5 h-5 mr-3 text-green-400" /> Finance & Ledger
          </Link>
          <Link href="/admin/disputes" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <ShieldAlert className="w-5 h-5 mr-3 text-red-400" /> Disputes
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
            <Settings className="w-5 h-5 mr-3 text-gray-400" /> Platform Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition">
             <LogOut className="w-5 h-5 mr-3" /> Logout
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}