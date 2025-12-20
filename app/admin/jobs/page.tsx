"use client";
import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, CheckCircle, Clock, XCircle, Loader2, MoreHorizontal } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';

export default function JobManagement() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, dispute

  const supabase = createClient();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    // Fetch all bookings (Contracts)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookings) {
        // We need to fetch the Artisan's name for each job manually
        // (Since 'artisan_id' is just an ID)
        const artisanIds = bookings.map(b => b.artisan_id);
        const { data: artisans } = await supabase.from('profiles').select('id, full_name').in('id', artisanIds);
        
        // Merge names into the job list
        const detailedJobs = bookings.map(job => ({
            ...job,
            artisan_name: artisans?.find(a => a.id === job.artisan_id)?.full_name || "Unknown Artisan"
        }));
        
        setJobs(detailedJobs);
    }
    setLoading(false);
  };

  // Admin Action: Cancel a Job
  const handleCancel = async (jobId: string) => {
    if(!window.confirm("Are you sure? This will cancel the contract.")) return;
    
    const { error } = await supabase.from('bookings').update({ status: 'rejected' }).eq('id', jobId);
    
    if (!error) {
        alert("Job cancelled.");
        // Update UI instantly
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['accepted', 'in_progress'].includes(job.status);
    return job.status === filter;
  });

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Job & Contract Monitor</h1>
        
        {/* FILTERS */}
        <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
            {['all', 'active', 'completed', 'rejected'].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                        filter === f ? 'bg-slate-900 text-white dark:bg-slate-700' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      {/* JOBS TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase font-bold text-slate-500">
                <tr>
                    <th className="px-6 py-4">Job Details</th>
                    <th className="px-6 py-4">Parties</th>
                    <th className="px-6 py-4">Budget</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredJobs.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No jobs found.</td></tr>
                ) : filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{job.job_description}</div>
                            <div className="text-xs flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {job.location || "Remote"}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-xs">
                                <span className="block text-slate-500">Client: <span className="text-slate-900 dark:text-white font-medium">{job.client_name}</span></span>
                                <span className="block text-slate-500 mt-1">Artisan: <span className="text-slate-900 dark:text-white font-medium">{job.artisan_name}</span></span>
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">₦{job.budget?.toLocaleString()}</td>
                        <td className="px-6 py-4 flex items-center"><Calendar className="w-3 h-3 mr-2 text-slate-400"/> {job.date}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                job.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {job.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                             {/* Only show Cancel button if job is active */}
                             {['pending', 'accepted', 'in_progress'].includes(job.status) && (
                                <button onClick={() => handleCancel(job.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" title="Force Cancel Contract">
                                    <XCircle className="w-5 h-5" />
                                </button>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}