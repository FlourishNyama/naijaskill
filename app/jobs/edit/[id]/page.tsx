"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';
export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const jobId = params.id;

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch existing Job Data
  useEffect(() => {
    const fetchJobDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error || !data) {
        setError("Could not find this job post.");
        setLoading(false);
        return;
      }

      // Security Check: Ensure only the owner can edit
      if (data.client_id !== user.id) {
        setError("You do not have permission to edit this job.");
        setLoading(false);
        return;
      }

      // Check if job is still editable
      if (data.status !== 'open') {
        setError("This job is already active or closed and cannot be edited.");
        setLoading(false);
        return;
      }

      // Fill the form
      setTitle(data.title);
      setCategory(data.category);
      setBudget(data.budget.toString());
      setLocation(data.location);
      setDescription(data.description);
      setLoading(false);
    };

    fetchJobDetails();
  }, [jobId, router, supabase]);

  // 2. Handle Update Logic
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        title,
        category,
        budget: parseInt(budget),
        location,
        description,
      })
      .eq('id', jobId);


    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
        router.refresh(); // <--- Refresh first
        router.push('/jobs'); // <--- Then navigate
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="mb-8 flex items-center">
          <Link href="/jobs" className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition">
            <ArrowLeft className="w-6 h-6 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Job Post</h1>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget (₦)</label>
                <input 
                  type="number"
                  value={budget} 
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                <input 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
              <textarea 
                rows={5}
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-[#1D5C30] hover:bg-[#26753d] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}