"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, MapPin, Briefcase, DollarSign, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
    job_title: '',
    hourly_rate: 0,
    avatar_url: '' // We will add image upload later
  });

  useEffect(() => {
    const getData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch existing profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          location: profile.location || '',
          bio: profile.bio || '',
          job_title: profile.job_title || '',
          hourly_rate: profile.hourly_rate || 0,
          avatar_url: profile.avatar_url || ''
        });
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        location: formData.location,
        bio: formData.bio,
        job_title: formData.job_title,
        hourly_rate: formData.hourly_rate,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Profile updated successfully!");
      // Determine dashboard link properly
      const dashboard = user?.user_metadata?.role === 'artisan' ? '/artisan-dashboard' : '/dashboard';
      router.push(dashboard);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  const isArtisan = user?.user_metadata?.role === 'artisan';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location (City, State)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* ARTISAN ONLY FIELDS */}
            {isArtisan && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title / Profession</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Professional Plumber"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition"
                      value={formData.job_title}
                      onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hourly Rate (₦)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input 
                      type="number" 
                      placeholder="2000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData({...formData, hourly_rate: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bio / About Me</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500 transition h-32 text-sm"
                placeholder="Tell clients about your experience..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-70 flex justify-center items-center"
            >
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}