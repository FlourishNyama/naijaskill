"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Briefcase, MapPin, DollarSign, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    // 1. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first!");
      router.push('/login');
      return;
    }

    // 2. Insert into Supabase
    const { error } = await supabase.from('jobs').insert({
      title: title,
      description: description,
      budget: parseFloat(budget),
      location: location,
      client_id: user.id,
      client_name: user.user_metadata.full_name || 'Client',
      status: 'open'
    });

    if (error) {
      alert("Error posting job: " + error.message);
      setLoading(false);
    } else {
      alert("Job Posted Successfully! Artisans will see it instantly.");
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post a New Job</h1>
        
        <form onSubmit={handlePostJob} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fix Leaking Pipe in Kitchen"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done..."
              className="w-full p-4 h-32 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget (₦)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  required
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="10000"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  required
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lekki, Lagos"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center shadow-lg shadow-green-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Post Job Now"}
          </button>

        </form>
      </main>
    </div>
  );
}