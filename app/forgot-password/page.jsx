"use client";
import { useState } from 'react';
import { createClient } from '../../utils/supabase/client'; // Your exact Supabase connection
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Turn on the Supabase phone line
  const supabase = createClient();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://elitejobinternational.com/update-password',
      });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Success! Check your email inbox for the reset link.");
      setEmail(''); // Clear the input box
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-lg shadow-md border dark:border-gray-800">
        
        {/* Back to Login Button */}
        <div className="mb-6">
          <Link href="/login" className="flex items-center text-sm font-medium text-gray-500 hover:text-[#00C853] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center text-[#081b33] dark:text-white mb-2">Reset Password</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your email address and we will send you a link to reset your password.
        </p>
        
        <form onSubmit={handleResetPassword} className="space-y-5">
          
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase">
              Email Address
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00C853] dark:bg-slate-800 dark:text-white transition-colors"
              />
            </div>
          </div>

          {/* Success or Error Messages */}
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          {message && <p className="text-[#00C853] text-sm font-medium text-center">{message}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-3 font-bold text-white bg-[#00C853] rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
          </button>

        </form>
      </div>
    </div>
  );
}