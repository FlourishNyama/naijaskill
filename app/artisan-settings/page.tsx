"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, User, MapPin, Briefcase, DollarSign, Save, Camera, ShieldCheck, Clock, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import { useToast } from '@/components/ToastProvider';
import RecommenderSearch from '@/components/RecommenderSearch';

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
  const { toast } = useToast();

  interface Recommender { id: string; name: string; status: string; }
  const [recommenders, setRecommenders] = useState<Recommender[]>([]);

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

      // Load existing recommendation requests
      const { data: recs } = await supabase
        .from('recommendations')
        .select('id, recommender_id, status')
        .eq('artisan_id', user.id);

      if (recs && recs.length > 0) {
        const ids = recs.map(r => r.recommender_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        setRecommenders(recs.map(r => ({
          id: r.recommender_id,
          name: profiles?.find(p => p.id === r.recommender_id)?.full_name || 'Unknown',
          status: r.status,
        })));
      }

      setLoading(false);
    };
    getData();
  }, [router]);

  const addRecommender = async (client: { id: string; full_name: string }) => {
    if (!user) return;
    const { error } = await supabase.from('recommendations').insert({
      artisan_id: user.id,
      recommender_id: client.id,
      status: 'pending',
    });
    if (error) {
      toast.error('Could not add recommender.');
      return;
    }
    setRecommenders(prev => [...prev, { id: client.id, name: client.full_name, status: 'pending' }]);
    toast.success(`Request sent to ${client.full_name}!`);
  };

  const removeRecommender = async (clientId: string) => {
    if (!user) return;
    await supabase.from('recommendations')
      .delete()
      .eq('artisan_id', user.id)
      .eq('recommender_id', clientId)
      .eq('status', 'pending');
    setRecommenders(prev => prev.filter(r => r.id !== clientId));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, or WebP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB.");
        return;
      }

      const fileExt = file.type.split('/')[1];
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title) {
        toast.warning("As an Artisan, you must have a Job Title.");
        return;
    }
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: formData.full_name,
        location: formData.location,
        bio: formData.bio,
        job_title: formData.job_title,
        hourly_rate: formData.hourly_rate,
        avatar_url: formData.avatar_url,
        role: 'artisan'
      });

    // Ensure wallet exists
    const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', user.id).single();
    if (!wallet) await supabase.from('wallets').insert({ user_id: user.id, balance: 0 });

    await supabase.auth.updateUser({ data: { role: 'artisan' } });
    setSaving(false);

    if (error) {
      toast.error("Error saving profile: " + error.message);
    } else {
      toast.success("Profile updated!");
      router.push('/artisan-dashboard');
      router.refresh();
    }
  };

  // HIGH CONTRAST INPUT STYLE
  const inputClass = "w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium outline-none focus:border-green-500 transition";

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Artisan Profile Settings</h1>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Avatar Upload */}
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
              <p className="text-xs text-gray-500">Professional Photo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input type="text" className={inputClass} value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input type="text" placeholder="e.g. Lagos" className={inputClass} value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-green-600 mb-4 uppercase tracking-wide">Professional Details</h3>
                <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                      <div className="relative">
                          <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input type="text" required className={`pl-10 ${inputClass}`} value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Hourly Rate (₦)</label>
                      <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input type="number" required className={`pl-10 ${inputClass}`} value={formData.hourly_rate} onChange={(e) => setFormData({...formData, hourly_rate: Number(e.target.value)})} />
                      </div>
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Professional Bio</label>
              <textarea className={`${inputClass} h-32`} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>

            <button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-70 flex justify-center items-center">
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Save & Go to Dashboard</>}
            </button>

          </form>
        </div>

        {/* RECOMMENDERS SECTION — outside the save form so it saves instantly */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Verification by Recommendation</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Add clients who can vouch for your work. When they confirm, your profile gets a verified badge and moves to the top of search results.
          </p>

          <RecommenderSearch
            onSelect={addRecommender}
            excluded={recommenders.map(r => r.id)}
          />

          {recommenders.length > 0 && (
            <div className="mt-4 space-y-2">
              {recommenders.map(r => (
                <div key={r.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.status === 'confirmed' ? (
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                      <p className={`text-xs font-medium ${r.status === 'confirmed' ? 'text-green-600' : 'text-orange-400'}`}>
                        {r.status === 'confirmed' ? 'Confirmed ✓' : 'Waiting for response...'}
                      </p>
                    </div>
                  </div>
                  {r.status === 'pending' && (
                    <button
                      onClick={() => removeRecommender(r.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                      title="Cancel request"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}