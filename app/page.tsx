"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, ShieldCheck, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';

// --- COMPONENT: ARTISAN CARD ---
function ArtisanCard({ artisan }: { artisan: any }) {
  return (
    <Link href="/profile" className="block group bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-600 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
      <div className="h-48 w-full bg-gray-100 dark:bg-slate-800 relative">
        <Image src={artisan.imageUrl} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
        {artisan.verified && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{artisan.name}</h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">{artisan.profession}</p>
          </div>
          <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{artisan.rating}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center text-gray-500 dark:text-gray-400 text-sm">
          <MapPin className="w-4 h-4 mr-1" />{artisan.location}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
          <span className="text-lg font-bold text-gray-900 dark:text-white">₦{artisan.rate}<span className="text-sm text-gray-400 font-normal">/hr</span></span>
          <button className="bg-gray-900 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 dark:hover:bg-green-700 transition-colors">Book Now</button>
        </div>
      </div>
    </Link>
  );
}

// --- MAIN PAGE DATA ---
const MOCK_ARTISANS = [
  { name: "Emmanuel Okafor", profession: "Master Plumber", rating: 4.8, rate: "5,000", location: "Lekki, Lagos", verified: true, imageUrl: "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop" },
  { name: "Aisha Bello", profession: "Event Photographer", rating: 4.9, rate: "15,000", location: "Abuja, FCT", verified: true, imageUrl: "https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2835&auto=format&fit=crop" },
  { name: "Chinedu West", profession: "Interior Painter", rating: 4.6, rate: "3,500", location: "Yaba, Lagos", verified: false, imageUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=3131&auto=format&fit=crop" },
];

export default function Home() {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/browse');
  };

  return (
    // MAIN BACKGROUND: Changes from White to Dark Slate
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      
      {/* HERO SECTION: Changes from Green-50 to Slate-900 */}
      <section className="relative bg-green-50 dark:bg-slate-900 py-16 sm:py-24 text-center px-4 transition-colors duration-300">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
          Expert Artisans,<br />
          <span className="text-green-600 dark:text-green-400">Securely Hired.</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect with verified Nigerian professionals for your home and business needs.
        </p>
        
        {/* SEARCH BAR: Changes from White to Slate-800 */}
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg flex items-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
          <input 
            type="text" 
            placeholder="What service do you need?" 
            className="flex-1 p-3 outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white px-6 py-3 rounded-full font-medium transition"
          >
            Search
          </button>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Rated Pros</h2>
            <p className="text-gray-500 dark:text-gray-400">Verified artisans near you</p>
          </div>
          <Link href="/browse" className="text-green-600 dark:text-green-400 font-medium hover:underline">View All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_ARTISANS.map((artisan, index) => (<ArtisanCard key={index} artisan={artisan} />))}
        </div>
      </section>
    </main>
  );
}