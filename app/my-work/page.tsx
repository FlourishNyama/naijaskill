"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function MyWorkPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchWork = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Fetch jobs where I am the artisan
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setJobs(data);
      setLoading(false);
    };
    fetchWork();
  }, [router]);

  const updateStatus = async (jobId: string, newStatus: string) => {
    if (!window.confirm(`Mark job as ${newStatus}?`)) return;
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);
    if (!error) {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/artisan-dashboard" className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-500" /></Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Work</h1>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? <div className="text-center py-10 text-gray-400">No jobs yet. Go to 'Find Work' to apply.</div> : 
          jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{job.job_description}</h3>
                    <p className="text-xs text-gray-500">Client: {job.client_name}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    job.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>{job.status}</span>
              </div>
              
              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {job.date}</span>
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {job.location}</span>
                <span className="font-bold text-green-600">₦{job.budget?.toLocaleString()}</span>
              </div>

              {/* Artisan Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                {job.status === 'pending' && (
                    <>
                        <button onClick={() => updateStatus(job.id, 'accepted')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700">Accept Job</button>
                        <button onClick={() => updateStatus(job.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Decline</button>
                    </>
                )}
                {job.status === 'accepted' && (
                    <button onClick={() => updateStatus(job.id, 'in_progress')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700">Start Work</button>
                )}
                {job.status === 'in_progress' && (
                    <button onClick={() => updateStatus(job.id, 'completed')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700">Mark Completed</button>
                )}
                <Link href={`/messages?chatWith=${job.client_id}`} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">Chat</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}