"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, User, MapPin, Briefcase, DollarSign, Save, Camera } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

export default function ArtisanSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
    job_title: '',
    hourly_rate: 0,
    avatar_url: '' 
  });

  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      alert("Image uploaded! Don't forget to click Save.");

    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title) {
        alert("As an Artisan, you must have a Job Title.");
        return;
    }
    setSaving(true);

    // 1. Save Data & Force Role to 'artisan'
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        location: formData.location,
        bio: formData.bio,
        job_title: formData.job_title,
        hourly_rate: formData.hourly_rate,
        avatar_url: formData.avatar_url,
        role: 'artisan' // <--- Crucial: Promotes them to Artisan
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      alert("Error updating profile: " + error.message);
    } else {
      alert("Artisan Profile updated successfully!");
      router.push('/artisan-dashboard');
      router.refresh();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artisan Profile Settings</h1>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50 dark:border-slate-800 shadow-sm relative bg-gray-100">
                  {formData.avatar_url ? (
                    <Image key={formData.avatar_url} src={formData.avatar_url} alt="Profile" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-10 h-10" /></div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition shadow-md">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-gray-500">Professional Photo Required</p>
            </div>

            {/* Inputs */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-green-600 mb-4 uppercase tracking-wide">Professional Details</h3>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title (e.g. Plumber)</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="text" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} />
                    </div>
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hourly Rate (₦)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="number" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:border-green-500" value={formData.hourly_rate} onChange={(e) => setFormData({...formData, hourly_rate: Number(e.target.value)})} />
                    </div>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-70 flex justify-center items-center">
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Save & Go to Dashboard</>}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}