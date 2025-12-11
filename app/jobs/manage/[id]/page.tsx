"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User, MapPin, Star, MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../../../utils/supabase/client';

export default function ManageJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Job Details
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      setJob(jobData);

      // 2. Fetch Applications (and join with Profile data)
      // Note: We fetch the raw application, then manually fetch profiles to avoid complex joins for now
      const { data: apps } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .eq('status', 'pending'); // Only show pending apps

      if (apps && apps.length > 0) {
        const artisanIds = apps.map(app => app.artisan_id);
        const { data: profiles } = await supabase.from('profiles').select('*').in('id', artisanIds);
        
        // Merge profile data into applications
        const merged = apps.map(app => ({
            ...app,
            profile: profiles?.find(p => p.id === app.artisan_id)
        }));
        setApplications(merged);
      } else {
        setApplications([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [jobId]);

  const handleHire = async (app: any) => {
    const confirm = window.confirm(`Hire ${app.profile.full_name} for this job? This will create a contract.`);
    if (!confirm) return;
    setProcessing(app.id);

    // 1. Create a Booking (Contract)
    const { error: bookingError } = await supabase.from('bookings').insert({
        client_id: job.client_id,
        client_name: job.client_name || "Client",
        artisan_id: app.artisan_id,
        service_type: job.title,
        location: job.location,
        job_description: job.description,
        budget: job.budget,
        date: new Date().toISOString().split('T')[0],
        status: 'accepted' // Automatically accepted since client initiated
    });

    if (bookingError) {
        alert("Error creating contract: " + bookingError.message);
        setProcessing(null);
        return;
    }

    // 2. Mark Application as Accepted
    await supabase.from('job_applications').update({ status: 'accepted' }).eq('id', app.id);
    
    // 3. Close the Job Post (Optional: Remove this if you want multiple hires per job)
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', jobId);

    alert("Hired successfully! You can now track this in 'My Jobs'.");
    router.push('/jobs'); // Redirect to contracts page
  };

  const handleReject = async (appId: string) => {
    if(!window.confirm("Reject this application?")) return;
    setProcessing(appId);
    await supabase.from('job_applications').update({ status: 'rejected' }).eq('id', appId);
    setApplications(prev => prev.filter(a => a.id !== appId)); // Remove from list
    setProcessing(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/jobs" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Review Applications</h1>
            <p className="text-sm text-gray-500">{job?.title} • ₦{job?.budget?.toLocaleString()}</p>
          </div>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <p className="text-gray-500">No pending applications yet.</p>
            </div>
          ) : (
            applications.map((app) => (
              <div key={app.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
                
                {/* Applicant Profile */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        {app.profile?.avatar_url ? (
                            <Image src={app.profile.avatar_url} alt="Profile" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-6 h-6"/></div>
                        )}
                    </div>
                    <div>
                        <Link href={`/profile/${app.artisan_id}`} className="font-bold text-lg text-gray-900 dark:text-white hover:text-green-600 hover:underline">
                            {app.profile?.full_name || "Unknown Artisan"}
                        </Link>
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">{app.profile?.job_title}</p>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {app.profile?.location || "Nigeria"}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href={`/messages?returnTo=/jobs/manage/${jobId}`} className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                        <MessageSquare className="w-5 h-5" />
                    </Link>
                    <button 
                        onClick={() => handleReject(app.id)}
                        disabled={processing === app.id}
                        className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition flex items-center justify-center"
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                    </button>
                    <button 
                        onClick={() => handleHire(app)}
                        disabled={processing === app.id}
                        className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-500/20 transition flex items-center justify-center"
                    >
                        {processing === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Hire Now</>}
                    </button>
                </div>

              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}