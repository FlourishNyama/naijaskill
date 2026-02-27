"use client";
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';
import { createClient } from '../../utils/supabase/client'; // Your phone line

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    // Initialize your client
    const supabase = createClient();
  
    // The core login logic
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard'); // Or wherever your home page is
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* LEFT SIDE (Visuals) */}
      <div className="hidden lg:flex w-1/2 relative bg-green-900 items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1581578731117-104f2a8d23e9?q=80&w=2940&auto=format&fit=crop" 
          alt="Artisan working"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 p-12 text-white">
          <h2 className="text-4xl font-bold mb-6">Mastery at your service.</h2>
          <p className="text-lg text-green-100 max-w-md">
            Welcome back to Nigeria's most trusted artisan marketplace.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (Form) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        
        <div className="mb-10">
          <Link href="/" className="flex items-center text-gray-500 hover:text-green-600 transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400">Please enter your details to access your account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Password
  </label>
  <div className="relative w-full">
    
    {/* Left Icon: The Lock */}
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Lock className="h-5 w-5 text-gray-400" />
    </div>
    
    {/* The Input Field */}
<input
  type={showPassword ? "text" : "password"} 
  name="password"
  id="password"
  required // Added this to make sure it's not empty
  value={password} // <--- THIS WAS MISSING
  onChange={(e) => setPassword(e.target.value)} // <--- THIS WAS MISSING
  placeholder="Enter your password"
  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C853] dark:bg-slate-900 dark:text-white transition-colors" 
/>
    
    {/* Right Toggle: The Eye */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#00C853] focus:outline-none"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>

  </div>
</div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-500">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/30 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold text-green-600 hover:text-green-500">
              Create free account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}