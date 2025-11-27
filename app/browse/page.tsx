"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, Filter, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/Navbar';

const ALL_ARTISANS = [
  { id: 1, name: "Emmanuel Okafor", job: "Plumber", loc: "Lekki, Lagos", rate: 5000, rating: 4.9, img: "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop" },
  { id: 2, name: "Aisha Bello", job: "Photographer", loc: "Abuja, FCT", rate: 15000, rating: 4.8, img: "https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2835&auto=format&fit=crop" },
  { id: 3, name: "Chinedu West", job: "Painter", loc: "Yaba, Lagos", rate: 3500, rating: 4.6, img: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=3131&auto=format&fit=crop" },
  { id: 4, name: "Grace Okon", job: "Makeup Artist", loc: "Ikeja, Lagos", rate: 8000, rating: 4.9, img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2938&auto=format&fit=crop" },
  { id: 5, name: "Tunde Bakare", job: "Electrician", loc: "Surulere, Lagos", rate: 4500, rating: 4.7, img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2938&auto=format&fit=crop" },
  { id: 6, name: "Blessing Johnson", job: "Fashion Designer", loc: "Enugu", rate: 10000, rating: 5.0, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2787&auto=format&fit=crop" },
];

const CATEGORIES = ["All", "Plumber", "Electrician", "Photographer", "Painter", "Fashion Designer", "Makeup Artist", "Carpenter"];

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  // Filter Logic
  const filteredArtisans = ALL_ARTISANS.filter((artisan) => {
    const matchesSearch = artisan.job.toLowerCase().includes(searchTerm.toLowerCase()) || artisan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === "All" || artisan.job === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* --- MOBILE: TOP SEARCH & SCROLLABLE CATEGORIES --- */}
        <div className="md:hidden mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search artisans..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Horizontal Scroll Categories (The "Instagram" style) */}
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === cat 
                    ? "bg-green-600 text-white shadow-md" 
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- DESKTOP: SIDEBAR FILTERS (Hidden on Mobile) --- */}
          <aside className="hidden md:block w-64 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </h3>
                <button onClick={() => {setCategory("All"); setSearchTerm("")}} className="text-xs text-green-600 font-bold hover:underline">
                  Reset
                </button>
              </div>
              
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center space-x-3 cursor-pointer group py-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${category === cat ? "border-green-600" : "border-gray-300"}`}>
                      {category === cat && <div className="w-2 h-2 rounded-full bg-green-600" />}
                    </div>
                    <input 
                      type="radio" 
                      name="category" 
                      className="hidden" 
                      onClick={() => setCategory(cat)}
                    />
                    <span className={`text-sm ${category === cat ? "text-green-700 font-bold" : "text-gray-600 group-hover:text-green-600"}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* --- MAIN GRID AREA --- */}
          <section className="flex-1">
            
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {category === "All" ? "All Artisans" : `${category}s`} 
                <span className="text-gray-400 text-lg font-normal ml-2">({filteredArtisans.length})</span>
              </h1>
              <div className="relative w-72">
                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search by name..." 
                   className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-green-500"
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>

            {/* Mobile Header (Just the count) */}
            <div className="md:hidden flex justify-between items-center mb-4">
               <span className="text-sm font-bold text-gray-500">{filteredArtisans.length} Results</span>
               <button className="flex items-center text-xs font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                  <SlidersHorizontal className="w-3 h-3 mr-1" /> Sort
               </button>
            </div>

            {/* THE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArtisans.map((artisan) => (
                <Link href="/profile" key={artisan.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-green-200 transition">
                  <div className="h-48 bg-gray-100 relative">
                    <Image src={artisan.img} alt={artisan.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full flex items-center text-[10px] font-bold text-green-700 shadow-sm">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{artisan.name}</h3>
                        <p className="text-xs text-green-600 font-bold uppercase">{artisan.job}</p>
                      </div>
                      <div className="flex items-center text-yellow-500 text-xs font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current mr-1" /> {artisan.rating}
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-xs mb-4">
                      <MapPin className="w-3 h-3 mr-1" /> {artisan.loc}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="font-bold text-gray-900">₦{artisan.rate.toLocaleString()}<span className="text-gray-400 text-xs font-normal">/hr</span></span>
                      <span className="text-xs text-gray-500 group-hover:text-green-600 font-medium">View Profile →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredArtisans.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 border-dashed">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                   <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900">No artisans found</h3>
                <p className="text-sm text-gray-500 mb-4">We couldn't find anyone matching "{searchTerm}"</p>
                <button onClick={() => {setCategory("All"); setSearchTerm("")}} className="text-green-600 font-bold text-sm hover:underline">Clear Filters</button>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}