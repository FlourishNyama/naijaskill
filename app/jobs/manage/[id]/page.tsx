"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../../../utils/supabase/client';
import { useToast } from '@/components/ToastProvider';
import { notify } from '@/utils/notifyClient';

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // 1. Fetch Job Info — only if current user owns it
      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single();

      if (!jobData || jobData.client_id !== user.id) {
        toast.error("Access denied.");
        router.push('/jobs');
        return;
      }

      setJob(jobData);

      // 2. Fetch Pending Applications
      const { data: apps } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'pending');

      if (apps && apps.length > 0) {
        // 3. Fetch Applicant Profiles
        const artisanIds = apps.map(app => app.artisan_id);
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', artisanIds);
        
        const merged = apps.map(app => ({
            ...app,
            profile: profiles?.find(p => p.id === app.artisan_id)
        }));
        setApplications(merged);
      }
      setLoading(false);
    };
    fetchData();
  }, [jobId]);

  const handleHire = async (app: any) => {
    const clientFee = Math.round(job.budget * 0.025);
    const totalCharge = job.budget + clientFee;

    const confirm = window.confirm(
      `Hire ${app.profile?.full_name || 'this artisan'}?\n\n` +
      `Job budget: ₦${job.budget.toLocaleString()}\n` +
      `Your platform fee (2.5%): ₦${clientFee.toLocaleString()}\n` +
      `Total deducted from wallet: ₦${totalCharge.toLocaleString()}\n\n` +
      `This will be held in Escrow until you release it.`
    );
    if (!confirm) return;
    setProcessing(app.id);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch('/api/create-contract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session!.access_token}`,
      },
      body: JSON.stringify({
        artisanId: app.artisan_id,
        description: job.description,
        budget: job.budget,
        location: job.location,
        jobId,
        applicationId: app.id,
        serviceType: job.title,
      }),
    });

    const data = await res.json();

    if (res.status === 402) {
      toast.error(
        `Insufficient wallet balance. You need ₦${data.shortfall.toLocaleString()} more to hire this artisan. Please top up your wallet first.`
      );
      setProcessing(null);
      return;
    }

    if (!res.ok) {
        toast.error("Error hiring: " + (data.error || 'Unknown error'));
        setProcessing(null);
        return;
    }

    // Notify artisan (fire and forget)
    notify({
      targetUserId: app.artisan_id,
      title: "You've been hired! 🎉",
      body: `Congratulations! You have been hired for "${job?.title}". The client will be in touch shortly.`,
      type: 'hired',
      link: '/jobs',
    });

    toast.success("Hired! Redirecting to your contracts...");
    router.push('/jobs'); // Go to My Jobs -> Contracts tab
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/jobs" className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-500" /></Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Review Applicants</h1>
            <p className="text-sm text-gray-500">{job?.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500">
                No pending applications yet.
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="relative w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        {app.profile?.avatar_url ? (
                            <Image src={app.profile.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                        ) : (<User className="w-full h-full p-2 text-gray-400"/>)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{app.profile?.full_name || "Artisan"}</h3>
                        <p className="text-sm text-green-600 font-medium">{app.profile?.job_title}</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleHire(app)}
                    disabled={processing === app.id}
                    className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center"
                >
                    {processing === app.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <><CheckCircle className="w-4 h-4 mr-2"/> Hire</>}
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}