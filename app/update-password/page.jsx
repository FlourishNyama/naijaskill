'use client';
import { useState, useEffect } from 'react'; // Added useEffect
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function UpdatePassword() {
  const router = useRouter();
  const supabase = createClient();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true); // New state to wait for token
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // STEP 1: Wait for the secret token to be processed
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      // If we don't have a session, we wait a tiny bit and try one last time
      // This gives the browser time to read the URL fragment (#)
      if (!data.session) {
        setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession();
          if (!retryData.session) {
            setError("Session expired or invalid link. Please request a new reset link.");
          }
          setIsVerifying(false);
        }, 1500);
      } else {
        setIsVerifying(false);
      }
    };
    checkSession();
  }, [supabase]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // STEP 2: Update the password now that we know the session is active
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    }
    setLoading(false);
  };

  // While checking the token, show a loading spinner
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-[#00C853]" />
      </div>
    );
  }

  return (
    // ... keep your existing return UI here ...
    // (Ensure your "Save" button is inside the form)
  );
}
  
    // 1. First, we tell Supabase to look at the URL and "grab" the secret token
    // This ensures the session is active before updating
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
    if (sessionError || !sessionData.session) {
      setError("Your session has expired. Please request a new reset link.");
      setLoading(false);
      return;
    }
  
    // 2. Now that we've confirmed the token is valid, we update the password
    const { error } = await supabase.auth.updateUser({
      password: password
    });
  
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    
    setLoading(false);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-lg shadow-md border dark:border-gray-800">
        <h2 className="text-2xl font-bold text-center text-[#081b33] dark:text-white mb-6">Create New Password</h2>
        
        {success ? (
          <div className="text-center">
            <p className="text-[#00C853] font-bold text-lg">Password updated successfully! 🎉</p>
            <p className="text-gray-500 mt-2">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            
            {/* NEW PASSWORD FIELD */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                New Password
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C853] dark:bg-slate-800 dark:text-white transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#00C853] focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
                Confirm Password
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Type it again"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C853] dark:bg-slate-800 dark:text-white transition-colors" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-[#00C853] focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-bold text-white bg-[#00C853] rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save New Password"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}