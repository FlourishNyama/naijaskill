"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  Navigation,
  Clock
} from 'lucide-react';

export default function ArtisanProjectsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const PROJECTS = [
    {
      id: 1,
      client: "John Doe",
      title: "Kitchen Sink Repair",
      location: "12 Admiralty Way, Lekki Phase 1",
      date: "Today, 9:00 AM",
      price: "10,000",
      status: "In Progress",
      type: "active",
      avatar: "JD"
    },
    {
      id: 2,
      client: "Sarah Smith",
      title: "Bathroom Pipe Fitting",
      location: "Victoria Island, Lagos",
      date: "Nov 20, 2024",
      price: "25,000",
      status: "Completed",
      type: "completed",
      avatar: "SS"
    }
  ];

  const filteredProjects = PROJECTS.filter(p => p.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/artisan-dashboard" className="mr-4 text-gray-500 dark:text-gray-400 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your work and get paid.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm flex mb-6 border border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Active Jobs
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === 'completed' ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            History
          </button>
        </div>

        {/* PROJECT LIST */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              
              {/* Client Info Header */}
              <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-sm">
                    {project.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{project.client}</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full inline-block mt-1">
                      {project.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">₦{project.price}</p>
                  <p className="text-xs text-gray-400">Escrow Secured</p>
                </div>
              </div>

              {/* Job Details */}
              <div className="p-4">
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">{project.title}</h4>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                    {project.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    {project.date}
                  </div>
                </div>

                {/* ACTION BUTTONS (Only for Active Jobs) */}
                {activeTab === 'active' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/messages?returnTo=/artisan-projects" className="flex items-center justify-center py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700">
                      <MessageSquare className="w-4 h-4 mr-2" /> Chat
                    </Link>
                    <button className="flex items-center justify-center py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold border border-gray-200 dark:border-gray-700">
                      <Phone className="w-4 h-4 mr-2" /> Call
                    </button>
                    <button className="col-span-2 flex items-center justify-center py-3 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-500/20">
                      <Navigation className="w-4 h-4 mr-2" /> Start Navigation
                    </button>
                    <button className="col-span-2 flex items-center justify-center py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-lg text-sm font-bold hover:opacity-90">
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark Job as Completed
                    </button>
                  </div>
                )}
                
                {/* Completed State */}
                {activeTab === 'completed' && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" /> Funds Released to Wallet
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}