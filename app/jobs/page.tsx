"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User, Users, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import ReviewModal from '@/components/ReviewModal';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'posts'>('contracts');
  const [contracts, setContracts] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Review Modal Logic
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // 1. Fetch Contracts
      const { data: bookings } = await supabase.from('bookings').select('*').eq('client_id', user.id).order('created_at', { ascending: false });
      if (bookings) setContracts(bookings);

      // 2. Fetch Posted Jobs + Application Counts
      const { data: posts } = await supabase
  .from('jobs')
  .select(`
    *,
    job_applications (
      id,
      status
    )
  `)
  .eq('client_id', user.id)
  .order('created_at', { ascending: false });

if (posts) {
  const formattedPosts = posts.map(p => ({
    ...p,
    appCount: p.job_applications ? p.job_applications.length : 0
  }));
  setPostedJobs(formattedPosts);
}
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleReleaseFunds = async (jobId: string, budget: number) => {
    if(!window.confirm(`Release ₦${budget.toLocaleString()} to artisan?`)) return;
    setProcessingId(jobId);
    const { error } = await supabase.rpc('release_funds', { job_id: jobId });
    if (error) alert("Error: " + error.message);
    else { alert("Funds Released!"); window.location.reload(); }
    setProcessingId(null);
  };

  const openReview = (job: any) => { setSelectedJob(job); setReviewModalOpen(true); };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-500" /></Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm flex mb-6 border border-gray-100 dark:border-gray-800">
          <button onClick={() => setActiveTab('contracts')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'contracts' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}>Hired (Contracts)</button>
          <button onClick={() => setActiveTab('posts')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'posts' ? 'bg-green-50 text-green-700' : 'text-gray-500'}`}>Posted Jobs</button>
        </div>

        <div className="space-y-4">
          
          {/* TAB 1: CONTRACTS (The Work) */}
          {activeTab === 'contracts' && (
            contracts.length === 0 ? <div className="text-center py-10 text-gray-400">No active contracts.</div> :
            contracts.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">Contract #{job.id.substring(0,4)}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded font-bold uppercase">{job.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{job.job_description}</p>
                
                {job.status === 'accepted' || job.status === 'in_progress' ? (
                   <button onClick={() => handleReleaseFunds(job.id, job.budget)} disabled={processingId === job.id} className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold">
                     {processingId === job.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Release Funds"}
                   </button>
                ) : job.status === 'completed' ? (
                   <button onClick={() => openReview(job)} className="w-full bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-bold flex justify-center items-center"><Star className="w-4 h-4 mr-2"/> Rate Artisan</button>
                ) : null}
              </div>
            ))
          )}

          {/* TAB 2: POSTS (The Hiring) */}
          {activeTab === 'posts' && (
            postedJobs.length === 0 ? <div className="text-center py-10 text-gray-400">No posted jobs.</div> :
            postedJobs.map((post) => (
              <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{post.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${post.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{post.status}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-4 mt-4">
                    <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {post.appCount || 0} Applicants
                    </div>
                    {post.status === 'open' && (
                        <Link href={`/jobs/manage/${post.id}`} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold">
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