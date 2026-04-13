"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ShieldCheck, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { useToast } from './ToastProvider';

// We now accept 'artisanId' as a prop
export default function BookingModal({ isOpen, onClose, artisanId }: { isOpen: boolean; onClose: () => void; artisanId: string }) {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (!isOpen) return null;

  // Calculate fees
  const amount = parseFloat(budget) || 0;
  const serviceFee = Math.round(amount * 0.05); // 5% fee
  const total = amount + serviceFee;

  const handleBooking = async () => {
    setLoading(true);
    const supabase = createClient();

    // 1. Get Current User (Client)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.warning("Please log in to book.");
        router.push('/login');
        return;
    }

    // 2. Insert Booking into DB
    const { error } = await supabase.from('bookings').insert({
        client_id: user.id,
        artisan_id: artisanId,
        client_name: user.user_metadata.full_name || "Client",
        job_description: description,
        budget: amount,
        location: user.user_metadata.location || "Nigeria", // Use profile location or default
        date: new Date().toLocaleDateString(),
        status: 'pending'
    });

    if (error) {
        toast.error("Error: " + error.message);
        setLoading(false);
    } else {
        setStep(3); // Show Success Screen
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {step === 3 ? "Booking Sent!" : "Secure Booking"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: JOB DETAILS */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Describe the job</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-3 h-24 text-sm focus:ring-2 focus:ring-green-500 outline-none dark:text-white" 
                placeholder="I need a leaky pipe fixed in my kitchen..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Budget (₦)</label>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 rounded-lg p-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="5000"
              />
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!budget || !description}
              className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2 transition"
            >
              Review Price
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT BREAKDOWN */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-start gap-3 text-sm text-green-800 dark:text-green-300">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>Funds are held securely in <strong>Escrow</strong>. The artisan only gets paid after you confirm the job is done.</p>
            </div>
            
            <div className="space-y-3 py-2 border-t border-b border-gray-100 dark:border-gray-800 my-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Artisan Fee</span>
                <span>₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Service Fee (5%)</span>
                <span>₦{serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                <span>Total to Pay</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleBooking} 
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4" /> Pay & Book</>}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white pt-2">
              Back to edit
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Sent!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              We have notified the artisan. Your funds are held safely in Escrow.
            </p>
            <button onClick={onClose} className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-lg font-bold">
              Return to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}