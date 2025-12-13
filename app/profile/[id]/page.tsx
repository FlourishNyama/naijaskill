"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Briefcase, MessageSquare, CheckCircle, ArrowLeft, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import { createClient } from '../../../utils/supabase/client';
import ImageViewer from '@/components/ImageViewer'; // Now works

export default function ProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Profile
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(data);

      // Reviews
      const { data: revs } = await supabase.from('reviews').select('*').eq('artisan_id', id);
      setReviews(revs || []);
    };
    fetchData();
  }, [id]);

  if (!profile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <Link href="/browse" className="text-gray-500 mb-6 block hover:text-green-600 transition"><ArrowLeft className="inline w-4 h-4 mr-1"/> Back to Browse</Link>
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-600 to-green-800"></div>
           
           <div className="relative z-10 -mt-2">
             <div className="w-32 h-32 mx-auto bg-white dark:bg-slate-900 rounded-full p-2 mb-3">
               <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                 {profile.avatar_url ? (
                    <ImageViewer src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full" />
                 ) : <User className="w-16 h-16 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
               </div>
             </div>
             
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                {profile.full_name} 
                <CheckCircle className="w-5 h-5 text-green-500" />
             </h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium">{profile.job_title}</p>
             
             <div className="flex justify-center gap-4 mt-4 text-sm">
                <span className="flex items-center text-gray-600 dark:text-gray-300"><MapPin className="w-4 h-4 mr-1 text-green-600"/> {profile.location}</span>
                <span className="flex items-center text-gray-600 dark:text-gray-300"><Star className="w-4 h-4 mr-1 text-yellow-500"/> {reviews.length > 0 ? '4.8' : 'New'} ({reviews.length} reviews)</span>
             </div>
           </div>
        </div>

        {/* Bio & Rate */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">About Me</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{profile.bio || "No bio available."}</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
                <p className="text-gray-500 text-xs font-bold uppercase mb-1">Hourly Rate</p>
                <h2 className="text-3xl font-bold text-green-600">₦{profile.hourly_rate?.toLocaleString()}</h2>
                
                <div className="mt-6 space-y-3">
                    <button onClick={() => setBookingOpen(true)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition flex items-center justify-center">
                        Book Now
                    </button>
                    {/* Fixed Chat Link */}
                    <Link href={`/messages?chatWith=${id}`} className="w-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-white py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 mr-2" /> Chat
                    </Link>
                </div>
            </div>
        </div>

        {/* Reviews */}
        <div className="mt-8">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Client Reviews</h3>
            <div className="space-y-4">
                {reviews.length === 0 ? <p className="text-gray-500">No reviews yet.</p> : reviews.map((r) => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white">{r.client_name}</span>
                            <div className="flex text-yellow-400"><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /><Star className="w-3 h-3 fill-current" /></div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{r.rating_text}</p>
                    </div>
                ))}
            </div>
        </div>

        <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} artisanId={id} />
      </main>
    </div>
  );
}