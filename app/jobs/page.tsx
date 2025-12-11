"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User, CheckCircle, MessageSquare, Calendar, MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReviewModal from '@/components/ReviewModal';
import { createClient } from '../../utils/supabase/client';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'posts'>('contracts'); // New Tab Logic
  const [contracts, setContracts] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]); // Store posted jobs
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    setUser(user);

    // 1. Fetch Contracts (Bookings)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    if (bookings) setContracts(bookings);

    // 2. Fetch Posted Jobs
    const { data: posts } = await supabase
      .from('jobs')
      .select('*, job_applications(count)') // Get application count too
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });
    
    // Transform count data
    if (posts) {
        const postsWithCount = posts.map(p => ({
            ...p,
            appCount: p.job_applications?.[0]?.count || 0 
        }));
        setPostedJobs(postsWithCount);
    }

    setLoading(false);
  };

  // ... (Keep existing Release Funds Logic) ...
  const handleReleaseFunds = async (jobId: string, budget: number) => {
    const confirm = window.confirm(`Release ₦${budget.toLocaleString()}?`);
    if (!confirm) return;
    setProcessingId(jobId);
    const { error } = await supabase.rpc('release_funds', { job_id: jobId });
    if (error) { alert("Error: " + error.message); } 
    else { alert("Funds Released!"); fetchData(); }
    setProcessingId(null);
  };

  const openReview = (job: any) => { setSelectedJob(job); setReviewModalOpen(true); };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"><ArrowLeft className="w-6 h-6" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage hires and job posts.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm flex mb-6 border border-gray-100 dark:border-gray-800">
          <button onClick={() => setActiveTab('contracts')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'contracts' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>Hired (Contracts)</button>
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'posts' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>My Posted Jobs</button>
        </div>

        {/* CONTENT */}
        <div className="space-y-4">
          
          {/* --- TAB 1: CONTRACTS --- */}
          {activeTab === 'contracts' && (
            contracts.length === 0 ? <div className="text-center py-10 text-gray-400">No active contracts.</div> :
            contracts.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start gap-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="relative w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold shrink-0"><User className="w-6 h-6" /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div><h3 className="font-bold text-gray-900 dark:text-white text-sm">Contract #{job.id.substring(0,6)}</h3><p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Budget: ₦{job.budget?.toLocaleString()}</p></div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-gray-100 text-gray-600`}>{job.status}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mt-2">{job.job_description}</h4>
                  </div>
                </div>
                {/* Actions */}
                <div className="p-3 flex gap-3">
                    {job.status === 'accepted' || job.status === 'in_progress' ? (
                       <button onClick={() => handleReleaseFunds(job.id, job.budget)} disabled={processingId === job.id} className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 flex justify-center items-center">{processingId === job.id ? <Loader2 className="w-4 h-4 animate-spin"/> : "Release Funds"}</button>
                    ) : job.status === 'completed' ? (
                       <button onClick={() => openReview(job)} className="w-full bg-yellow-50 text-yellow-700 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center"><Star className="w-4 h-4 mr-2"/> Rate Artisan</button>
                    ) : null}
                </div>
              </div>
            ))
          )}

          {/* --- TAB 2: POSTED JOBS --- */}
          {activeTab === 'posts' && (
            postedJobs.length === 0 ? <div className="text-center py-10 text-gray-400">You haven't posted any jobs yet.</div> :
            postedJobs.map((post) => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{post.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${post.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{post.status}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.description}</p>
                <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-4">
                    <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {post.appCount || 0} Applicants
                    </div>
                    {post.status === 'open' && (
                        <Link href={`/jobs/manage/${post.id}`} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90">
                            Review Applications
                        </Link>
                    )}
                </div>
              </div>
            ))
          )}

        </div>

        <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} jobId={selectedJob?.id} artisanId={selectedJob?.artisan_id} clientName={user?.user_metadata?.full_name} />

      </main>
    </div>
  );
}