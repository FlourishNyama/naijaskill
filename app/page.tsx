"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, ShieldCheck, MapPin, Loader2, ArrowRight, UserCheck, Calendar, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../utils/supabase/client';

export default function Home() {
  const router = useRouter();
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // FETCH REAL ARTISANS (Top 3)
  useEffect(() => {
    const fetchArtisans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artisan')
        .limit(3); 

      if (data) setFeaturedArtisans(data);
      setLoading(false);
    };
    fetchArtisans();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/browse?q=${searchQuery}`); 
    } else {
      router.push('/browse');
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-green-50 dark:bg-slate-900 py-12 md:py-24 text-center px-4 transition-colors duration-300">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 md:mb-6 leading-tight">
          Expert Artisans,<br />
          <span className="text-green-600 dark:text-green-400">Securely Hired.</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
          Connect with verified Nigerian professionals. Payments are held in escrow until you are 100% satisfied.
        </p>
        
        {/* SEARCH BAR */}
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg flex items-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
          <input 
            type="text" 
            placeholder="What service do you need? (e.g. Plumber)" 
            className="flex-1 p-2 md:p-3 outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400 text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white px-5 py-2 md:px-6 md:py-3 rounded-full font-medium transition text-sm md:text-base"
          >
            Search
          </button>
        </div>

        {/* Categories Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 md:gap-3">
          {['Plumber', 'Carpenter', 'Makeup Artist', 'Electrician'].map((cat) => (
            <Link key={cat} href={`/browse?q=${cat}`} className="px-3 py-1.5 md:px-4 md:py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs md:text-sm text-gray-600 dark:text-gray-300 hover:border-green-500 hover:text-green-600 transition">
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS (NEW SECTION) --- */}
      <section className="py-12 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">How NaijaSkill Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">1. Hire Verified Pros</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Browse profiles, check ratings, and chat directly with artisans.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 mb-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">2. Secure Payment</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Pay into Escrow. Money is only released when the job is done.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">3. Track the Job</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Manage timelines and approve work directly from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      <section className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Featured Pros</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Verified artisans near you</p>
          </div>
          <Link href="/browse" className="text-green-600 dark:text-green-400 font-medium hover:underline flex items-center text-sm md:text-base">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featuredArtisans.length === 0 ? (
              <p className="text-gray-500 col-span-3 text-center">No artisans found yet. Be the first to join!</p>
            ) : (
              featuredArtisans.map((artisan) => (
                <Link href={`/profile/${artisan.id}`} key={artisan.id} className="block group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-600 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="h-48 w-full bg-gray-100 dark:bg-slate-800 relative">
                    {artisan.avatar_url ? (
                      <Image src={artisan.avatar_url} alt={artisan.full_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 dark:text-gray-600">
                        {artisan.full_name?.substring(0,1)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{artisan.full_name}</h3>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">{artisan.job_title || "Artisan"}</p>
                      </div>
                      <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">5.0</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />{artisan.location || "Nigeria"}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₦{artisan.hourly_rate?.toLocaleString() || "N/A"}<span className="text-sm text-gray-400 font-normal">/hr</span></span>
                      <button className="bg-gray-900 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 dark:hover:bg-green-700 transition-colors">Book Now</button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}