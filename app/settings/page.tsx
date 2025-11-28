"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Loader2, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AvatarUpload from '@/components/AvatarUpload'; // <--- Import the component
import { createClient } from '../../utils/supabase/client';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Load Data
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      
      setUser(user);
      setFullName(user.user_metadata.full_name || "");
      setPhone(user.user_metadata.phone || "");
      setLoading(false);
    };
    getUser();
  }, [router]);

  // Update Data
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone: phone }
    });
    
    // Also update the public 'profiles' table so search works with new name
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);

    if (error) alert("Error: " + error.message);
    else alert("Profile Updated!");
    
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>

        {/* 1. PROFILE PHOTO SECTION (Now Working!) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-col items-center">
          <AvatarUpload 
            uid={user.id} 
            url={user.user_metadata.avatar_url} 
            onUpload={(url) => console.log("New URL:", url)} 
          />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{fullName || "User"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.user_metadata.role} Account</p>
        </div>

        {/* 2. PERSONAL DETAILS FORM */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-50 dark:border-gray-800 pb-2">
            Personal Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 outline-none transition text-sm font-medium dark:text-white" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email (Cannot Change)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  value={user.email} 
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-500 cursor-not-allowed text-sm font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-green-500 outline-none transition text-sm font-medium dark:text-white" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition transform active:scale-95 flex items-center justify-center disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
        </button>

      </main>
    </div>
  );
}