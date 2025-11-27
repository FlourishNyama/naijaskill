"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Save, 
  DollarSign, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

export default function ArtisanSettingsPage() {
  // Mock Data for Portfolio
  const [portfolio, setPortfolio] = useState([
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2940&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=2874&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2938&auto=format&fit=crop"
  ]);

  // Function to remove an image (Simulation)
  const removeImage = (index: number) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    setPortfolio(newPortfolio);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/artisan-dashboard" className="mr-4 text-gray-500 dark:text-gray-400 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Update your portfolio and rates.</p>
          </div>
        </div>

        {/* 1. IDENTITY SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Identity</h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800">
                <Image 
                  src="https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop" 
                  alt="Profile" 
                  fill 
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                <input type="text" defaultValue="Emmanuel Okafor" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Professional Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input type="text" defaultValue="Master Plumber" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PORTFOLIO SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">Portfolio</h3>
            <button className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center hover:underline">
              <UploadCloud className="w-4 h-4 mr-1" /> Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {portfolio.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image src={url} alt="Work" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button 
                    onClick={() => removeImage(index)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {/* Upload Placeholder */}
            <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition bg-gray-50 dark:bg-slate-800/50">
              <UploadCloud className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold">Upload</span>
            </button>
          </div>
        </div>

        {/* 3. RATES & LOCATION */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Service Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Hourly Rate (₦)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input type="number" defaultValue="5000" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white font-bold" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Base Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input type="text" defaultValue="Lekki Phase 1, Lagos" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition flex items-center justify-center transform active:scale-95">
          <Save className="w-5 h-5 mr-2" /> Save Changes
        </button>

      </main>
    </div>
  );
}