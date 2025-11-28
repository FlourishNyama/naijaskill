"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function FindWorkPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH JOBS FROM DB
  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient();
      
      // Get all jobs where status is 'open', newest first
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (data) setJobs(data);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Jobs</h1>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">No jobs available right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:border-green-500 transition cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-green-600 transition">{job.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Posted by {job.client_name} • <span className="text-green-600">Just now</span></p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">₦{job.budget.toLocaleString()}</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{job.description}</p>
                
                <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 mr-1" /> {job.location}
                  </div>
                  <button className="text-xs font-bold text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}