"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, MessageSquare, MapPin, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const JOBS = [
    {
      id: 1,
      artisan: "Emmanuel Okafor",
      role: "Plumber",
      img: "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop",
      title: "Kitchen Sink Leak Repair",
      date: "Today, 2:00 PM",
      location: "Lekki Phase 1",
      price: "10,000",
      status: "In Progress",
      type: "active"
    },
    {
      id: 2,
      artisan: "Aisha Bello",
      role: "Photographer",
      img: "https://images.unsplash.com/photo-1554048612-387768052bf7?q=80&w=2835&auto=format&fit=crop",
      title: "Birthday Photo Session",
      date: "Nov 12, 2024",
      location: "Abuja",
      price: "45,000",
      status: "Completed",
      type: "completed"
    },
    {
      id: 3,
      artisan: "Tunde Bakare",
      role: "Electrician",
      img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2938&auto=format&fit=crop",
      title: "Generator Wiring",
      date: "Oct 28, 2024",
      location: "Surulere",
      price: "8,500",
      status: "Cancelled",
      type: "completed"
    }
  ];

  const filteredJobs = JOBS.filter(job => job.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header with BACK BUTTON */}
        <div className="mb-6 flex items-center">
          <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
            <p className="text-gray-500 text-sm">Track your ongoing and past projects.</p>
          </div>
        </div>

        {/* TABS (Mobile Friendly) */}
        <div className="bg-white p-1 rounded-xl shadow-sm flex mb-6">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'active' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Active (1)
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'completed' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            History (2)
          </button>
        </div>

        {/* JOB LIST */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              
              {/* Top Section: Artisan Info */}
              <div className="p-4 flex items-start gap-4 border-b border-gray-50">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <Image src={job.img} alt={job.artisan} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{job.artisan}</h3>
                      <p className="text-xs text-green-600 font-medium uppercase">{job.role}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      job.status === "In Progress" ? "bg-orange-50 text-orange-600" :
                      job.status === "Completed" ? "bg-green-50 text-green-600" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mt-2">{job.title}</h4>
                </div>
              </div>

              {/* Middle Section: Job Details */}
              <div className="p-4 bg-gray-50/50 grid grid-cols-2 gap-y-3">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  {job.date}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-green-500" />
                  Escrow: ₦{job.price}
                </div>
              </div>

              {/* Bottom Section: Actions */}
              {activeTab === 'active' && (
                <div className="p-3 flex gap-3">
                  <Link href="/messages?returnTo=/jobs" className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-50 transition">
                    <MessageSquare className="w-4 h-4 mr-2" /> Chat
                  </Link>
                  <button className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center hover:bg-green-700 transition shadow-lg shadow-green-500/20">
                    <CheckCircle className="w-4 h-4 mr-2" /> Release Funds
                  </button>
                </div>
              )}
              
              {activeTab === 'completed' && job.status === "Completed" && (
                <div className="p-3">
                  <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-black transition">
                    Book Again
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}