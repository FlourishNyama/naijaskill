"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, MapPin, DollarSign, FileText, Briefcase } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert("Please log in to post a job.");
        router.push('/login');
        return;
    }

    const { error } = await supabase.from('jobs').insert({
        client_id: user.id,
        client_name: user.user_metadata?.full_name || "Client",
        title: formData.title,
        description: formData.description,
        budget: Number(formData.budget),
        location: formData.location,
        status: 'open'
    });

    setLoading(false);

    if (error) {
        alert("Error posting job: " + error.message);
    } else {
        alert("Job Posted Successfully!");
        router.push('/jobs'); 
    }
  };

  // Shared class for high-contrast inputs
  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium outline-none focus:border-green-500 transition";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Post a New Job</h1>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. Fix Kitchen Sink" 
                            className={inputClass}
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea 
                            required 
                            placeholder="Describe what you need done..." 
                            className={`${inputClass} h-32`}
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Budget (₦)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="number" 
                                required 
                                placeholder="5000" 
                                className={inputClass}
                                value={formData.budget} 
                                onChange={(e) => setFormData({...formData, budget: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. Lagos" 
                                className={inputClass}
                                value={formData.location} 
                                onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-70 flex justify-center items-center">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Post Job Publicly"}
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}