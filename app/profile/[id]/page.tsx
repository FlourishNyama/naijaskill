"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, MapPin, ShieldCheck, MessageSquare, Loader2, User } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import BookingModal from '@/components/BookingModal'; 
import Navbar from '@/components/Navbar';

export default function DynamicProfilePage() {
  const params = useParams();
  const id = params?.id as string; 

  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const supabase = createClient();
      
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (profileError) {
        setErrorMsg(profileError.message);
        setLoading(false);
        return;
      }

      // 2. Fetch Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('artisan_id', id)
        .order('created_at', { ascending: false });

      if (profileData) setProfile(profileData);
      
      if (reviewsData && reviewsData.length > 0) {
        setReviews(reviewsData);
        // Calculate Average
        const total = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(total / reviewsData.length);
      } else {
        setAverageRating(5.0); // Default for new users (Optimism)
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-green-600 w-8 h-8" /></div>;

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-slate-950 dark:text-white p-4 text-center">
      <h2 className="text-xl font-bold mb-2">User not found</h2>
      <Link href="/browse" className="mt-4 text-green-600 font-bold hover:underline">Go back to Browse</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      
      {/* HEADER */}
      <div className="relative h-60 bg-green-900">
        <div className="absolute inset-0 bg-green-900 opacity-80" />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/browse" className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center hover:bg-white/30 transition text-sm font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* AVATAR */}
              <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden -mt-16 sm:-mt-20 bg-gray-200 dark:bg-slate-800">
                {profile.avatar_url ? (
                   <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400 dark:text-gray-500">
                     {profile.full_name?.substring(0, 2).toUpperCase() || "?"}
                   </div>
                )}
              </div>
              
              <div className="text-center sm:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                  {profile.full_name || "Unknown Artisan"}
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </h1>
                <p className="text-lg text-green-600 font-medium">{profile.job_title || "Artisan"}</p>
                <div className="flex items-center justify-center sm:justify-start text-gray-500 dark:text-gray-400 mt-1 text-sm">
                  <MapPin className="w-4 h-4 mr-1" /> {profile.location || "Nigeria"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Link 
                href={`/messages?returnTo=/profile/${id}`}
                className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Chat
              </Link>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-500/30 hover:bg-green-700"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-1">
                {averageRating.toFixed(1)} <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rating ({reviews.length} reviews)</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">₦{profile.hourly_rate?.toLocaleString() || "N/A"}</div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Per Hour</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: BIO */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {profile.full_name}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          {/* REVIEWS LIST */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Client Reviews ({reviews.length})</h3>
            
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">No reviews yet.</p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                          {review.client_name ? review.client_name.substring(0,1) : <User className="w-4 h-4"/>}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{review.client_name || "Client"}</span>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SAFETY BADGE */}
        <div>
           <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/30 sticky top-24">
              <ShieldCheck className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">NaijaSkill Guarantee</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your payment is held in escrow. The artisan only gets paid when you are 100% satisfied with the work.
              </p>
              <div className="text-xs text-green-700 dark:text-green-500 font-bold uppercase tracking-wide">100% Money Back Protection</div>
           </div>
        </div>

      </div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} artisanId={id} />

    </main>
  );
}