import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-green-500 mb-4">Elitejob International</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Connecting Nigeria's finest artisans with clients who value quality. Secure, fast, and reliable.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-lg mb-4">Platform</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/browse" className="hover:text-white transition">Browse Artisans</Link></li>
            <li><Link href="/post-job" className="hover:text-white transition">Post a Job</Link></li>
            <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            <li><Link href="/signup" className="hover:text-white transition">Sign Up</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold text-lg mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white transition">Safety Tips</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Abuja, Nigeria</li>
            <li>+234 806 977 0191</li>
            <li>+234 808 505 4532</li>
            <li>costumercare@elitejobinternational.com</li>
          </ul>
        </div>

      </div>
      
      <div className="text-center text-gray-600 text-xs mt-12 border-t border-gray-800 pt-8">
        © {new Date().getFullYear()} Elitejob International. All rights reserved.
      </div>
    </footer>
  );
}