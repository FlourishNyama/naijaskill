"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-900 dark:text-white tracking-tight">
              Naija<span className="text-green-600 dark:text-green-400">Skill</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/browse" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium">
              Browse Artisans
            </Link>
            
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium flex items-center">
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Link>

            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700"></div>

            <Link href="/login" className="text-gray-900 dark:text-white font-bold hover:text-green-600 dark:hover:text-green-400 transition">
              Log In
            </Link>
            <Link href="/signup" className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 transition shadow-lg shadow-green-500/30">
              Join Now
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center gap-4">
             <button 
               onClick={() => setIsOpen(!isOpen)} 
               className="text-gray-600 dark:text-gray-300 hover:text-green-600 focus:outline-none p-2"
             >
               {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 absolute w-full left-0 animate-in slide-in-from-top-5 duration-200 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              href="/browse" 
              className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Browse Artisans
            </Link>
            
            <Link 
              href="/dashboard" 
              className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
            </Link>

            <Link 
              href="/login" 
              className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="block px-3 py-4 mt-4 text-center rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 shadow-md"
              onClick={() => setIsOpen(false)}
            >
              Join Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}