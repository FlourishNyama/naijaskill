"use client";
import { useState, useEffect } from 'react';
import { Search, MoreVertical, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch profiles + transaction counts (simulated)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const toggleBan = async (userId: string, currentStatus: string) => {
    // Note: In a real app, you'd update a 'status' column. 
    // Since we don't have one yet, let's assume we're toggling a 'banned' boolean or role.
    // For this demo, let's just Alert the action.
    
    /* REAL IMPLEMENTATION:
       await supabase.from('profiles').update({ status: 'banned' }).eq('id', userId);
    */
    
    const action = currentStatus === 'banned' ? 'Unban' : 'Ban';
    if(!window.confirm(`${action} this user?`)) return;

    setProcessing(userId);
    // Simulate API call
    setTimeout(() => {
        alert(`User ${action}ned successfully! (Database update would happen here)`);
        setProcessing(null);
    }, 1000);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search users..." 
                className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{u.full_name}</div>
                            <div className="text-xs">{u.location || "No Location"}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                                u.role === 'artisan' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                                {u.role || 'client'}
                            </span>
                        </td>
                        <td className="px-6 py-4">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                            {u.role === 'artisan' ? (
                                <span className="flex items-center text-green-600 font-medium text-xs">
                                    <Shield className="w-3 h-3 mr-1" /> Verified
                                </span>
                            ) : <span className="text-slate-400 text-xs">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => toggleBan(u.id, 'active')}
                                disabled={processing === u.id}
                                className="text-red-500 hover:text-red-700 font-bold text-xs border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                            >
                                {processing === u.id ? <Loader2 className="w-3 h-3 animate-spin"/> : "Ban User"}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}