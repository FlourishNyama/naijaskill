"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // <--- Import this
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, ShieldCheck, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || ""; // <--- Catch the search word

  const [searchTerm, setSearchTerm] = useState(initialQuery); // Set it as default
  const [category, setCategory] = useState("All");
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisans = async () => {
      const supabase = createClient();
      
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artisan');

      if (category !== "All") {
        query = query.ilike('job_title', `%${category}%`);
      }

      const { data } = await query;

      if (data) setArtisans(data);
      setLoading(false);
    };

    fetchArtisans();
  }, [category]);

  const filteredArtisans = artisans.filter((artisan) => {
    // If no search term, return everything
    if (!searchTerm) return true;
    
    // Fuzzy search: Check Name OR Job Title
    const nameMatch = artisan.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const jobMatch = artisan.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return nameMatch || jobMatch;
  });

  const CATEGORIES = ["All", "Plumber", "Electrician", "Photographer", "Painter", "Fashion Designer", "Carpenter"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* --- SEARCH & CATEGORIES --- */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search artisans (e.g. Emmanuel)..." 
              value={searchTerm} // <--- Controlled input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat 
                    ? "bg-green-600 text-white shadow-md" 
                    : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- RESULTS --- */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600 w-8 h-8"/></div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <section className="flex-1">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{filteredArtisans.length} Results</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArtisans.map((artisan) => (
                  <Link href={`/profile/${artisan.id}`} key={artisan.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-green-200 dark:hover:border-green-700 transition">
                    
                    <div className="h-48 bg-gray-100 dark:bg-slate-800 relative">
                      {artisan.avatar_url ? (
                         <Image src={artisan.avatar_url} alt={artisan.full_name} fill className="object-cover group-hover:scale-105 transition duration-500" />
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
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{artisan.full_name || "Artisan"}</h3>
                          <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase">{artisan.job_title || "Available"}</p>
                        </div>
                        <div className="flex items-center text-yellow-500 text-xs font-bold bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-current mr-1" /> 5.0
                        </div>
                      </div>
                      <div className="flex items-center text-gray-400 text-xs mb-4">
                        <MapPin className="w-3 h-3 mr-1" /> {artisan.location || "Nigeria"}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                        <span className="font-bold text-gray-900 dark:text-white">₦{artisan.hourly_rate?.toLocaleString() || "0"}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-green-600 font-medium">View Profile →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filteredArtisans.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 border-dashed">
                  <h3 className="font-bold text-gray-900 dark:text-white">No artisans found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your search filters.</p>
                  <button onClick={() => {setCategory("All"); setSearchTerm("")}} className="text-green-600 font-bold text-sm hover:underline">Clear Filters</button>
                </div>
              )}

            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600 w-8 h-8"/></div>}>
      <BrowseContent />
    </Suspense>
  );
}