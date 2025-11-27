"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, MapPin, ShieldCheck } from 'lucide-react';
import BookingModal from '@/components/BookingModal'; 

export default function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. HEADER */}
      <div className="relative h-60 bg-green-900">
        <Image 
          src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2938&auto=format&fit=crop"
          alt="Cover"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center hover:bg-white/30 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>
      </div>

      {/* 2. PROFILE CARD */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden -mt-16 sm:-mt-20 bg-gray-200">
                <Image 
                   src="https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop"
                   alt="Profile"
                   fill
                   className="object-cover"
                />
              </div>
              <div className="text-center sm:text-left mb-2">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                  Emmanuel Okafor
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </h1>
                <p className="text-lg text-gray-600 font-medium">Master Plumber & Pipe Fitter</p>
                <div className="flex items-center justify-center sm:justify-start text-gray-500 mt-1 text-sm">
                  <MapPin className="w-4 h-4 mr-1" /> Lekki Phase 1, Lagos
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {/* MESSAGE BUTTON (NOW LINKED TO MESSAGES) */}
              <Link 
                href="/messages?returnTo=/profile"
                className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                Message
              </Link>
              
              {/* BOOK NOW BUTTON (Opens Modal) */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-500/30 hover:bg-green-700"
              >
                Book Now
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-8">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-1">
                4.9 <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rating</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900">98%</div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Job Success</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900">₦5,000</div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Per Hour</p>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-bold text-gray-900">5 Yrs</div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INFO GRID */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Emmanuel</h3>
            <p className="text-gray-600 leading-relaxed">
              I am a certified plumber with over 5 years of experience handling residential and commercial plumbing needs in Lagos.
            </p>
          </section>
        </div>

        <div className="space-y-6">
           <div className="bg-green-900 text-white p-6 rounded-xl shadow-lg">
             <h4 className="font-bold text-lg mb-2">Safety Guarantee</h4>
             <p className="text-green-100 text-sm mb-4">
               All payments are held in Escrow until the job is completed to your satisfaction.
             </p>
             <div className="flex items-center text-xs text-green-200">
               <ShieldCheck className="w-4 h-4 mr-2" /> Verified by NaijaSkill
             </div>
           </div>
        </div>
      </div>

      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </main>
  );
}