"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, MapPin, Save, Camera } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import { useToast } from '@/components/ToastProvider';
import Image from 'next/image';

export default function ClientSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    bio: '',
    avatar_url: '' 
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          location: profile.location || '',
          bio: profile.bio || '',
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
    setSaving(true);

    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: formData.full_name,
        location: formData.location,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        role: 'client'
    });

    // Ensure wallet exists
    const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', user.id).single();
    if (!wallet) await supabase.from('wallets').insert({ user_id: user.id, balance: 0 });

    setSaving(false);

    if (error) {
      toast.error("Error saving: " + error.message);
    } else {
      toast.success("Profile updated successfully!");
      router.push('/dashboard'); // Redirect to Client Dashboard
      router.refresh();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Client Profile Settings</h1>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSave} className="space-y-6">
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
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
               <input type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium outline-none focus:border-green-500 transition" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
               <input type="text" className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium outline-none focus:border-green-500 transition" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-medium outline-none focus:border-green-500 transition h-32" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
            </div>

            <button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition disabled:opacity-70 flex justify-center items-center">
              {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}