"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, DollarSign, MapPin, Briefcase, FileText, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AvatarUpload from '@/components/AvatarUpload';
import { createClient } from '../../utils/supabase/client';

export default function ArtisanSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form Data
  const [jobTitle, setJobTitle] = useState("");
  const [rate, setRate] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  // 1. Load Data on Start
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
        setJobTitle(profile.job_title || "");
        setRate(profile.hourly_rate || "");
        setLocation(profile.location || "");
        setBio(profile.bio || "");
      }
      setLoading(false);
    };
    getData();
  }, [router]);

  // 2. Save Data & UPGRADE ROLE
  const handleSave = async () => {
    setSaving(true);
    
    // Check required fields
    if (!jobTitle || !rate) {
        alert("Please enter your Job Title and Hourly Rate.");
        setSaving(false);
        return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        job_title: jobTitle,
        hourly_rate: parseFloat(rate),
        location: location,
        bio: bio,
        role: 'artisan' // <--- THIS IS THE FIX! It makes them visible in Browse.
      })
      .eq('id', user.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push('/artisan-dashboard');
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        <div className="flex items-center mb-6">
          <Link href="/artisan-dashboard" className="mr-4 text-gray-500 dark:text-gray-400 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        </div>

        {/* PROFILE PIC */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 flex flex-col items-center">
           <AvatarUpload 
             uid={user.id} 
             url={user.user_metadata.avatar_url} 
             onUpload={(url) => console.log("Uploaded", url)} 
           />
           <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tap camera to update</p>
        </div>

        {/* DETAILS FORM */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-8 space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Professional Title <span className="text-red-500">*</span></label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                required
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Master Plumber"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition dark:text-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Hourly Rate (₦) <span className="text-red-500">*</span></label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  required
                  type="number" 
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition dark:text-white" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Base Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lagos"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition dark:text-white" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Bio / About Me</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your skills and experience..."
                className="w-full pl-10 pr-4 py-3 h-32 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition resize-none dark:text-white" 
              />
            </div>
          </div>

        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition flex items-center justify-center transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Profile</>}
        </button>

      </main>
    </div>
  );
}