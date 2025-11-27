"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield, 
  ChevronRight,
  LogOut 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  // Mock State for Toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4 text-gray-500 hover:text-green-600 transition p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* 1. PROFILE PHOTO SECTION */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50">
              <Image 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop" 
                alt="Profile" 
                fill 
                className="object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full border-2 border-white hover:bg-green-700 transition shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Flourish Nyama</h2>
          <p className="text-sm text-gray-500">Client Account</p>
        </div>

        {/* 2. PERSONAL DETAILS FORM */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">
            Personal Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="text" defaultValue="Flourish Nyama" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="email" defaultValue="flourish@example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition text-sm font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="tel" defaultValue="+234 800 123 4567" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition text-sm font-medium" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECURITY & NOTIFICATIONS */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
          {/* Password Change */}
          <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition text-left">
            <div className="flex items-center">
              <div className="bg-blue-50 p-2 rounded-lg mr-3 text-blue-600">
                <Lock className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* 2FA */}
          <button className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition text-left">
            <div className="flex items-center">
              <div className="bg-purple-50 p-2 rounded-lg mr-3 text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-medium text-gray-700">Two-Factor Auth</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Notifications Toggles */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center">
              <div className="bg-yellow-50 p-2 rounded-lg mr-3 text-yellow-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive alerts on your device</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button 
              onClick={() => setPushNotif(!pushNotif)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${pushNotif ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${pushNotif ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gray-50 p-2 rounded-lg mr-3 text-gray-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-700">Email Updates</p>
                <p className="text-xs text-gray-500">Receive job summaries via email</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button 
              onClick={() => setEmailNotif(!emailNotif)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${emailNotif ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${emailNotif ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* 4. ACTIONS */}
        <div className="space-y-3">
          <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition transform active:scale-95">
            Save Changes
          </button>
          
          <button className="w-full flex items-center justify-center text-red-600 font-bold py-3 hover:bg-red-50 rounded-xl transition">
            <LogOut className="w-5 h-5 mr-2" /> Log Out
          </button>
        </div>

      </main>
    </div>
  );
}