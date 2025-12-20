"use client";
import { useEffect, useState } from 'react';
import { Users, Briefcase, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    totalEscrow: 0,
    disputes: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Count Users
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      // 2. Count Active Jobs (Open or In Progress)
      const { count: jobCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).neq('status', 'completed');
      
      // 3. Calc Escrow (Sum of wallets - simplified for now)
      // Note: In production, you'd query a specific 'escrow_holds' table.
      // For now, let's just count transaction volume as a proxy or fetch wallet sums
      const { data: wallets } = await supabase.from('wallets').select('balance');
      const totalMoney = wallets?.reduce((acc, curr) => acc + (curr.balance || 0), 0) || 0;

      // 4. Fetch Recent Users
      const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);

      setStats({
        totalUsers: userCount || 0,
        activeJobs: jobCount || 0,
        totalEscrow: totalMoney,
        disputes: 0 // Placeholder until we build the disputes table
      });
      if (users) setRecentUsers(users);
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Overview</h1>
      
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold text-green-600 flex items-center bg-green-100 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/> +12%</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</h3>
          <p className="text-sm text-slate-500">Total Users</p>
        </div>

        {/* Active Jobs */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <Briefcase className="w-6 h-6" />
             </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeJobs}</h3>
          <p className="text-sm text-slate-500">Active Jobs</p>
        </div>

        {/* Platform Money (Wallets) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <DollarSign className="w-6 h-6" />
             </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₦{stats.totalEscrow.toLocaleString()}</h3>
          <p className="text-sm text-slate-500">Total System Liquidity</p>
        </div>

        {/* Disputes */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
             </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.disputes}</h3>
          <p className="text-sm text-slate-500">Open Disputes</p>
        </div>

      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Newest Users</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.full_name}</td>
                        <td className="px-6 py-4"><span className="capitalize">{u.role}</span></td>
                        <td className="px-6 py-4">{u.location || "N/A"}</td>
                        <td className="px-6 py-4">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}