"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Calendar, Clock, DollarSign, Briefcase, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import { useToast } from '@/components/ToastProvider';
import { notify } from '@/utils/notifyClient';

export default function FindWorkPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState<any>(null);
  const [applying, setApplying] = useState<string | null>(null); // Track which job is being applied to
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set()); // Track IDs of applied jobs

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 1. Fetch Open Jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open') // Only show open jobs
        .order('created_at', { ascending: false });

      if (jobsData) setJobs(jobsData);

      // 2. Check which ones I already applied to (if logged in)
      if (user) {
        const { data: applications } = await supabase
            .from('job_applications')
            .select('job_id')
            .eq('artisan_id', user.id);
        
        if (applications) {
            const ids = new Set(applications.map(app => app.job_id));
            setAppliedJobs(ids);
        }
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    if (!user) {
        toast.warning("Please log in to apply.");
        return;
    }
    setApplying(jobId);

    // 1. Submit Application
    const { error } = await supabase
        .from('job_applications')
        .insert({
            job_id: jobId,
            artisan_id: user.id,
            status: 'pending'
        });

    if (error) {
        toast.error("Error applying: " + error.message);
    } else {
        // 2. Update UI
        const newApplied = new Set(appliedJobs);
        newApplied.add(jobId);
        setAppliedJobs(newApplied);

        // 3. Notify the client who posted the job (fire and forget)
        const job = jobs.find(j => j.id === jobId);
        if (job?.client_id) {
          const artisanName = user.user_metadata?.full_name || 'An artisan';
          notify({
            targetUserId: job.client_id,
            title: 'New Application Received',
            body: `${artisanName} applied for your job: "${job.title}". Review their profile now.`,
            type: 'new_application',
            link: `/jobs/manage/${jobId}`,
          });
        }

        toast.success("Application sent! The client will contact you if interested.");
    }
    setApplying(null);
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Work</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Browse open opportunities posted by clients.</p>
        </div>

        {/* SEARCH */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex gap-3">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search jobs (e.g. Plumbing)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* JOB LIST */}
        <div className="space-y-4">
            {filteredJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">No jobs found.</div>
            ) : (
                filteredJobs.map((job) => (
                    <div key={job.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 gap-3">
                                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {job.location}</span>
                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Posted recently</span>
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                                ₦{job.budget?.toLocaleString()}
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">
                            {job.description}
                        </p>

                        <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-4">
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {job.status}
                            </span>
                            
                            {appliedJobs.has(job.id) ? (
                                <button disabled className="bg-gray-100 dark:bg-slate-800 text-green-600 px-6 py-2 rounded-lg text-sm font-bold flex items-center cursor-default">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Applied
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleApply(job.id)}
                                    disabled={applying === job.id}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-green-500/20 flex items-center"
                                >
                                    {applying === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Now"}
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>

      </main>
    </div>
  );
}