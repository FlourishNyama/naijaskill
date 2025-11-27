"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // LIST OF PAGES WHERE FOOTER SHOULD BE HIDDEN
  const hideFooterOn = [
    '/dashboard', 
    '/artisan-dashboard', // <--- Added this
    '/messages', 
    '/wallet', 
    '/profile', 
    '/settings',
    '/jobs'               // <--- Added this too (My Jobs page)
  ];
  
  // If the current URL starts with any of the words above, hide the footer
  if (hideFooterOn.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              Naija<span className="text-green-500">Skill</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting Nigerian homeowners with verified artisans. Secure payments, trusted service.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-green-500 transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-bold text-lg mb-4">Discover</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/browse" className="hover:text-white transition">Browse Artisans</Link></li>
              <li><Link href="/signup" className="hover:text-white transition">Become an Artisan</Link></li>
              <li><Link href="#" className="hover:text-white transition">Success Stories</Link></li>
              <li><Link href="#" className="hover:text-white transition">Safety Tips</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 shrink-0 text-green-500" />
                <span>123 Adetokunbo Ademola, VI, Lagos</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 shrink-0 text-green-500" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 shrink-0 text-green-500" />
                <span>support@naijaskill.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} NaijaSkill Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}