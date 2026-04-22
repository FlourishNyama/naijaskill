"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Users, Star, Layers, CheckCircle, Clock, XCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import ReviewModal from '@/components/ReviewModal';
import { useToast } from '@/components/ToastProvider';
import { notify } from '@/utils/notifyClient';
export const dynamic = 'force-dynamic';

const stageStatusIcon = (status: string) => {
  if (status === 'approved') return <CheckCircle className="w-3 h-3 text-green-500" />;
  if (status === 'submitted') return <Clock className="w-3 h-3 text-blue-500" />;
  if (status === 'rejected') return <XCircle className="w-3 h-3 text-red-500" />;
  return <div className="w-3 h-3 rounded-full border-2 border-gray-300" />;
};

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'posts'>('contracts');
  const [contracts, setContracts] = useState<any[]>([]);
  const [contractStages, setContractStages] = useState<Record<string, any[]>>({});
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteJob = async (jobId: string) => {
    const confirm = window.confirm("Are you sure? This removes the post and all applications. This cannot be undone.");
    if (!confirm) return;
    const supabase = createClient();
    await supabase.from('job_applications').delete().eq('job_id', jobId);
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Job deleted successfully.");
      window.location.reload();
    }
  };

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

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (bookings) {
        setContracts(bookings);

        const stagedIds = bookings.filter(b => b.is_staged).map(b => b.id);
        if (stagedIds.length > 0) {
          const { data: stageData } = await supabase
            .from('job_stages')
            .select('*')
            .in('booking_id', stagedIds)
            .order('stage_number', { ascending: true });

          if (stageData) {
            const grouped: Record<string, any[]> = {};
            for (const s of stageData) {
              if (!grouped[s.booking_id]) grouped[s.booking_id] = [];
              grouped[s.booking_id].push(s);
            }
            setContractStages(grouped);
          }
        }
      }

      const { data: posts } = await supabase
        .from('jobs')
        .select('*, job_applications(id, status)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (posts) {
        setPostedJobs(posts.map(p => ({ ...p, appCount: p.job_applications?.length ?? 0 })));
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const handleReleaseFunds = async (jobId: string, budget: number, artisanId: string, escrowAmount?: number) => {
    const payout = escrowAmount ?? Math.round(budget * 0.975);
    if (!window.confirm(
      `Release payment to artisan?\n\nArtisan receives: ₦${payout.toLocaleString()}\n(2.5% platform fee already deducted)`
    )) return;
    setProcessingId(jobId);
    const { error } = await supabase.rpc('release_funds', { job_id: jobId });
    if (error) {
      toast.error("Error: " + error.message);
    } else {
      notify({
        targetUserId: artisanId,
        title: `₦${payout.toLocaleString()} released to your wallet! 💰`,
        body: `Your payment of ₦${payout.toLocaleString()} has been released by the client. Check your wallet.`,
        type: 'payment_released',
        link: '/wallet',
      });
      toast.success("Funds Released!");
      window.location.reload();
    }
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

          {/* TAB 1: CONTRACTS */}
          {activeTab === 'contracts' && (
            contracts.length === 0
              ? <div className="text-center py-10 text-gray-400">No active contracts.</div>
              : contracts.map((job) => {
                const jobStages = contractStages[job.id] || [];
                const approvedCount = jobStages.filter(s => s.status === 'approved').length;

                return (
                  <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">Contract #{job.id.substring(0, 4)}</h3>
                        {job.is_staged && <Layers className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <span className="text-xs bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded font-bold uppercase">{job.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{job.job_description}</p>

                    {/* Staged contracts: show stage timeline */}
                    {job.is_staged && jobStages.length > 0 ? (
                      <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 mb-3 space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          Stage Progress — {approvedCount}/{jobStages.length} released
                        </p>
                        {jobStages.map((stage) => (
                          <div key={stage.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {stageStatusIcon(stage.status)}
                              <span className="text-gray-700 dark:text-gray-300">{stage.stage_number}. {stage.label}</span>
                              {stage.status === 'submitted' && (
                                <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">Pending Approval</span>
                              )}
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">₦{stage.amount?.toLocaleString()}</span>
                          </div>
                        ))}
                        {job.status === 'completed' && (
                          <p className="text-xs text-green-600 font-bold mt-1 pt-2 border-t border-gray-100 dark:border-gray-700">All stages complete.</p>
                        )}
                      </div>
                    ) : !job.is_staged && (
                      <>
                        {(job.status === 'accepted' || job.status === 'in_progress') && (
                          <button
                            onClick={() => handleReleaseFunds(job.id, job.budget, job.artisan_id, job.escrow_amount)}
                            disabled={processingId === job.id}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-bold"
                          >
                            {processingId === job.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Release Funds"}
                          </button>
                        )}
                      </>
                    )}

                    {job.status === 'completed' && (
                      <button onClick={() => openReview(job)} className="w-full bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-bold flex justify-center items-center mt-2">
                        <Star className="w-4 h-4 mr-2" /> Rate Artisan
                      </button>
                    )}
                  </div>
                );
              })
          )}

          {/* TAB 2: POSTS */}
          {activeTab === 'posts' && (
            postedJobs.length === 0
              ? <div className="text-center py-10 text-gray-400">No posted jobs.</div>
              : postedJobs.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{post.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${post.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{post.status}</span>
                  </div>
                  <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    {post.appCount || 0} Applicants
                  </div>
                  <div className="flex flex-wrap items-center gap-3 border-t border-gray-50 dark:border-gray-800 pt-4 mt-4">
                    <Link href={`/jobs/manage/${post.id}`} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold">
                      Review Applications
                    </Link>
                    {post.status === 'open' && (
                      <>
                        <Link href={`/jobs/edit/${post.id}`} className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                          Edit
                        </Link>
                        <button onClick={() => handleDeleteJob(post.id)} className="text-red-500 hover:text-red-700 text-sm font-bold transition px-2">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          jobId={selectedJob?.id}
          artisanId={selectedJob?.artisan_id}
          clientName={user?.user_metadata?.full_name}
        />
      </main>
    </div>
  );
}
