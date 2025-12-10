"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || ""; 

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [category, setCategory] = useState("All");
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisans = async () => {
      const supabase = createClient();
      
      // 1. Fetch profiles that are marked as artisans OR have a job title
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('role.eq.artisan,job_title.neq.""'); // "Role is artisan OR Job Title is not empty"

      if (error) {
        console.error("Error fetching artisans:", error);
      } else {
        setArtisans(data || []);
      }
      setLoading(false);
    };

    fetchArtisans();
  }, [category]);

  const filteredArtisans = artisans.filter((artisan) => {
    if (!searchTerm) return true;
    const nameMatch = artisan.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const jobMatch = artisan.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || jobMatch;
  });

  const CATEGORIES = ["All", "Plumber", "Electrician", "Photographer", "Painter"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* SEARCH & FILTER */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search artisans (e.g. Plumber)..." 
              value={searchTerm}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm outline-none focus:border-green-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => { setCategory(cat); setSearchTerm(cat === "All" ? "" : cat); }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat ? "bg-green-600 text-white shadow-md" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600 w-8 h-8"/></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArtisans.map((artisan) => (
              <Link href={`/profile/${artisan.id}`} key={artisan.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gray-100 dark:bg-slate-800 relative">
                  {artisan.avatar_url ? (
                      <Image src={artisan.avatar_url} alt={artisan.full_name} fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 dark:text-gray-600">
                        {artisan.full_name?.substring(0,1) || "A"}
                      </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center text-[10px] font-bold text-green-700 shadow-sm">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{artisan.full_name || "Artisan"}</h3>
                  <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-2">{artisan.job_title || "Available"}</p>
                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3 mr-1" /> {artisan.location || "Nigeria"}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ₦{artisan.hourly_rate?.toLocaleString() || "0"}/hr
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {filteredArtisans.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-400">No artisans found matching your criteria.</div>
        )}

      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}