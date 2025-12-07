"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User, CheckCircle, MessageSquare, Calendar, MapPin, ShieldCheck, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReviewModal from '@/components/ReviewModal'; // <--- Import
import { createClient } from '../../utils/supabase/client';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    setUser(user);

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setJobs(data);
    setLoading(false);
  };

  const handleReleaseFunds = async (jobId: string, budget: number) => {
    const confirm = window.confirm(`Are you sure you want to release ₦${budget.toLocaleString()}?`);
    if (!confirm) return;

    setProcessingId(jobId);
    const { error } = await supabase.rpc('release_funds', { job_id: jobId });

    if (error) {
      alert("Transaction Failed: " + error.message);
    } else {
      alert("Funds Released Successfully!");
      fetchJobs(); 
    }
    setProcessingId(null);
  };

  // Open the modal for a specific job
  const openReview = (job: any) => {
    setSelectedJob(job);
    setReviewModalOpen(true);
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'active') return ['pending', 'accepted', 'in_progress'].includes(job.status);
    return ['completed', 'rejected'].includes(job.status);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Jobs</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Track ongoing and past projects.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm flex mb-6 border border-gray-100 dark:border-gray-800">
          <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'active' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>Active</button>
          <button onClick={() => setActiveTab('completed')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'completed' ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>History</button>
        </div>

        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No jobs found.</div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start gap-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="relative w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold shrink-0"><User className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div><h3 className="font-bold text-gray-900 dark:text-white text-sm">Job #{job.id.substring(0,6)}</h3><p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Budget: ₦{job.budget?.toLocaleString()}</p></div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${job.status === "accepted" ? "bg-orange-50 text-orange-600" : job.status === "completed" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"}`}>{job.status}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mt-2">{job.job_description}</h4>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 dark:bg-slate-800/30 grid grid-cols-2 gap-y-3">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400"><Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />{job.date}</div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400"><MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />{job.location}</div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 col-span-2"><ShieldCheck className="w-3.5 h-3.5 mr-2 text-green-500" />Escrow Secure</div>
                </div>

                {/* --- ACTIONS --- */}
                <div className="p-3 flex gap-3">
                  {activeTab === 'active' ? (
                    <>
                      <Link href={`/messages?returnTo=/jobs`} className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-700 transition"><MessageSquare className="w-4 h-4 mr-2" /> Chat</Link>
                      <button onClick={() => handleReleaseFunds(job.id, job.budget)} disabled={processingId === job.id} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-green-700 transition shadow-lg shadow-green-500/20 disabled:opacity-70">{processingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Release Funds</>}</button>
                    </>
                  ) : (
                    // HISTORY TAB BUTTONS
                    job.status === 'completed' && (
                        <button 
                            onClick={() => openReview(job)} 
                            className="w-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition"
                        >
                            <Star className="w-4 h-4 mr-2" /> Rate Artisan
                        </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* REVIEW MODAL */}
        <ReviewModal 
            isOpen={reviewModalOpen} 
            onClose={() => setReviewModalOpen(false)} 
            jobId={selectedJob?.id} 
            artisanId={selectedJob?.artisan_id}
            clientName={user?.user_metadata?.full_name || "Client"}
        />

      </main>
    </div>
  );
}