import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // To move pages
import { ArrowLeft, User, Briefcase, Mail, Lock, Phone, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '../../utils/supabase/client'; // Your connection tool

export default function SignUpPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'client' | 'artisan'>('client');
  
  // 1. STATE VARIABLES (To hold the typed data)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. THE REAL SIGN UP FUNCTION
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Stop page from refreshing
    setLoading(true);

    const supabase = createClient();

    // Talk to Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        // We save the Name and Role inside the user's "Metadata"
        data: {
          full_name: fullName,
          phone: phone,
          role: userType, 
        },
      },
    });

    if (error) {
      alert("❌ Error: " + error.message);
      setLoading(false);
    } else {
      // Success!
      alert("✅ Account Created! Please check your email to verify.");
      // Usually, we redirect to a "Verify Email" page or Login
      router.push('/login');
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* LEFT SIDE (Visuals) */}
      <div className={`hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden transition-colors duration-500 ${userType === 'client' ? 'bg-green-900' : 'bg-orange-900'}`}>
        <Image 
          src={userType === 'client' 
            ? "https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop" 
            : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2938&auto=format&fit=crop"
          }
          alt="Background"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 p-12 text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            {userType === 'client' ? "Hire expert hands." : "Find your next job."}
          </h2>
          <p className="text-lg opacity-90">
            {userType === 'client' 
              ? "Join thousands of Nigerian homeowners getting things done with peace of mind." 
              : "Showcase your skills, set your rates, and get paid securely via Escrow."
            }
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-8 lg:py-12">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gray-500 hover:text-green-600 transition text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Join NaijaSkill today.</p>
        </div>

        {/* TOGGLE SWITCH */}
        <div className="bg-gray-100 dark:bg-slate-900 p-1 rounded-xl flex mb-8 relative">
          <button 
            type="button"
            onClick={() => setUserType('client')}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all duration-300 ${userType === 'client' ? 'bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 shadow-sm' : 'text-gray-500'}`}
          >
            <User className="w-4 h-4 mr-2" /> I want to Hire
          </button>
          <button 
            type="button"
            onClick={() => setUserType('artisan')}
            className={`flex-1 flex items-center justify-center py-3 rounded-lg text-sm font-bold transition-all duration-300 ${userType === 'artisan' ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-gray-500'}`}
          >
            <Briefcase className="w-4 h-4 mr-2" /> I want to Work
          </button>
        </div>

        {/* FORM START */}
        <form onSubmit={handleSignUp} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Full Name</label>
            <input 
              required
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Flourish Nyama"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                required
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="080 1234 5678" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 dark:text-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">Password</label>
            <div className="relative w-full">
  <input
    type={showPassword ? "text" : "password"} 
    name="password"
    id="password"
    placeholder="Enter your password"
    className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C853]" 
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#00C853]"
  >
    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
  </button>
</div>
          </div>

          {userType === 'artisan' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-900 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">
                As an artisan, you will need to upload a valid ID card and a portfolio photo after signing up.
              </p>
            </div>
          )}

          <div className="pt-4">
            <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 flex justify-center items-center ${userType === 'client' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (userType === 'client' ? "Create Client Account" : "Create Artisan Account")}
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className={`font-bold hover:underline ${userType === 'client' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}