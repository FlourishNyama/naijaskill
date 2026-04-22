"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, CheckCircle, Loader2, Layers } from 'lucide-react';
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
  const [stagedApps, setStagedApps] = useState<Set<string>>(new Set());

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: jobData } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (!jobData || jobData.client_id !== user.id) {
        toast.error("Access denied.");
        router.push('/jobs');
        return;
      }
      setJob(jobData);

      const { data: apps } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'pending');

      if (apps && apps.length > 0) {
        const artisanIds = apps.map(app => app.artisan_id);
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', artisanIds);
        setApplications(apps.map(app => ({ ...app, profile: profiles?.find(p => p.id === app.artisan_id) })));
      }
      setLoading(false);
    };
    fetchData();
  }, [jobId]);

  const toggleStaged = (appId: string) =>
    setStagedApps(prev => { const n = new Set(prev); n.has(appId) ? n.delete(appId) : n.add(appId); return n; });

  const handleHire = async (app: any) => {
    const isStaged = stagedApps.has(app.id);
    const clientFee = Math.round(job.budget * 0.025);
    const totalCharge = job.budget + clientFee;

    const confirmed = window.confirm(
      `Hire ${app.profile?.full_name || 'this artisan'}?\n\n` +
      `Budget: ₦${job.budget.toLocaleString()}\n` +
      `Your fee (2.5%): ₦${clientFee.toLocaleString()}\n` +
      `Total from wallet: ₦${totalCharge.toLocaleString()}\n` +
      (isStaged ? `\nPayment split: 30% → 50% → 20% (admin releases each stage)` : `\nFull escrow held until you release.`)
    );
    if (!confirmed) return;
    setProcessing(app.id);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/create-contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session!.access_token}` },
      body: JSON.stringify({
        artisanId: app.artisan_id,
        description: job.description,
        budget: job.budget,
        location: job.location,
        jobId,
        applicationId: app.id,
        serviceType: job.title,
        isStaged,
      }),
    });

    const data = await res.json();

    if (res.status === 402) {
      toast.error(`Insufficient balance. You need ₦${data.shortfall.toLocaleString()} more. Top up your wallet first.`);
      setProcessing(null);
      return;
    }
    if (!res.ok) {
      toast.error("Error: " + (data.error || 'Unknown error'));
      setProcessing(null);
      return;
    }

    notify({
      targetUserId: app.artisan_id,
      title: "You've been hired! 🎉",
      body: `You have been hired for "${job?.title}".${isStaged ? ' Payment is split into 3 stages.' : ''}`,
      type: 'hired',
      link: '/my-work',
    });

    toast.success("Hired! Redirecting...");
    router.push('/jobs');
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
              <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                      {app.profile?.avatar_url
                        ? <Image src={app.profile.avatar_url} alt="" fill className="object-cover" unoptimized />
                        : <User className="w-full h-full p-2 text-gray-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{app.profile?.full_name || 'Artisan'}</h3>
                      <p className="text-sm text-green-600 font-medium">{app.profile?.job_title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleHire(app)}
                    disabled={processing === app.id}
                    className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center transition"
                  >
                    {processing === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Hire</>}
                  </button>
                </div>

                {/* Staged payment toggle */}
                <button
                  type="button"
                  onClick={() => toggleStaged(app.id)}
                  className={`mt-4 w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${stagedApps.has(app.id) ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                >
                  <Layers className={`w-4 h-4 shrink-0 ${stagedApps.has(app.id) ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${stagedApps.has(app.id) ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      Split into 3 payment stages
                    </p>
                    <p className="text-[10px] text-gray-400">30% materials · 50% mid-work · 20% final — each released by admin</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${stagedApps.has(app.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
