"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Home, LogOut, Settings, Search, ChevronDown, Briefcase, Repeat } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false); 
  
  const router = useRouter();
  const pathname = usePathname(); 
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 0); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    setIsProfileOpen(false);
  };

  const isArtisanMode = pathname?.includes('artisan');
  const dashboardLink = isArtisanMode ? '/artisan-dashboard' : '/dashboard';
  const switchLink = isArtisanMode ? '/dashboard' : '/artisan-dashboard';
  const switchLabel = isArtisanMode ? 'Switch to Client' : 'Switch to Artisan';
  const browseLink = isArtisanMode ? '/find-work' : '/browse';
  const browseLabel = isArtisanMode ? 'Find Work' : 'Browse Artisans';
  
  const navbarClasses = `sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
    isScrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-gray-200 dark:border-gray-800' : 'bg-white dark:bg-slate-950 border-gray-100 dark:border-gray-800'
  }`;

  return (
    <nav className={navbarClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-green-900 dark:text-white tracking-tight">
              Naija<span className="text-green-600 dark:text-green-400">Skill</span>
            </span>
          </Link>

          {!user ? (
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/browse" className="text-gray-600 dark:text-gray-300 hover:text-green-600 font-medium">Browse Artisans</Link>
                <Link href="/login" className="text-gray-900 dark:text-white font-bold hover:text-green-600 transition">Log In</Link>
                <Link href="/signup" className="bg-green-600 text-white px-5 py-2 rounded-full font-medium hover:bg-green-700 shadow-lg shadow-green-500/30">Join Now</Link>
              </div>
              <div className="md:hidden flex items-center">
                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 p-2">
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {pathname !== browseLink && (
                <Link href={browseLink} className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-green-600 font-medium mr-2">{browseLabel}</Link>
              )}

              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 focus:outline-none group">
                  <div className="relative h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
                      {user?.user_metadata?.avatar_url ? (
                        <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
                      ) : (
                        <span>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || "CN"}</span>
                      )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.user_metadata?.full_name}</p>
                          <p className="text-[10px] text-green-600 font-bold uppercase mt-1 tracking-wide">{isArtisanMode ? 'Artisan Mode' : 'Client Mode'}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          {pathname !== '/' && <Link href="/" className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsProfileOpen(false)}><Home className="w-4 h-4 mr-2" /> Home</Link>}
                          {pathname !== dashboardLink && <Link href={dashboardLink} className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsProfileOpen(false)}><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Link>}
                          {pathname !== browseLink && <Link href={browseLink} className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsProfileOpen(false)}><Briefcase className="w-4 h-4 mr-2" /> {browseLabel}</Link>}
                          <Link href={switchLink} className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsProfileOpen(false)}><Repeat className="w-4 h-4 mr-2" /> {switchLabel}</Link>
                          {pathname !== '/settings' && pathname !== '/artisan-settings' && <Link href={isArtisanMode ? "/artisan-settings" : "/settings"} className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsProfileOpen(false)}><Settings className="w-4 h-4 mr-2" /> Settings</Link>}
                        </div>
                        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                          <button onClick={handleLogout} className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"><LogOut className="w-4 h-4 mr-2" /> Log Out</button>
                        </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* MOBILE MENU */}
      {isOpen && !user && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-gray-800 absolute w-full left-0 animate-in slide-in-from-top-5 duration-200 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/browse" className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600" onClick={() => setIsOpen(false)}>Browse Artisans</Link>
            <Link href="/login" className="block px-3 py-4 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600" onClick={() => setIsOpen(false)}>Log In</Link>
            <Link href="/signup" className="block px-3 py-4 mt-4 text-center rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 shadow-md" onClick={() => setIsOpen(false)}>Join Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}