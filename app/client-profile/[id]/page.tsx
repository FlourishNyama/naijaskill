"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, MapPin, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../../utils/supabase/client';
import ImageViewer from '@/components/ImageViewer'; // We will create this next

export default function ClientProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(data);
    };
    fetchProfile();
  }, [id]);

  if (!profile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/my-work" className="text-gray-500 mb-6 block hover:text-green-600 transition"><ArrowLeft className="inline w-4 h-4 mr-1"/> Back</Link>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-4 relative overflow-hidden">
                {profile.avatar_url ? (
                    <ImageViewer src={profile.avatar_url} alt="Profile" className="w-full h-full" />
                ) : <User className="w-12 h-12 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
            <p className="text-green-600 font-medium uppercase text-xs tracking-wide">Client</p>
            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
                <MapPin className="w-4 h-4 mr-1" /> {profile.location || "Nigeria"}
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-300">{profile.bio || "No bio provided."}</p>
        </div>
      </main>
    </div>
  );
}