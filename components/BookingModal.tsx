"use client";
import { useState } from 'react';
import { X, ShieldCheck, CreditCard, CheckCircle } from 'lucide-react';

export default function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("");

  if (!isOpen) return null;

  // Calculate fees
  const amount = parseFloat(budget) || 0;
  const serviceFee = Math.round(amount * 0.05); // 5% fee
  const total = amount + serviceFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-gray-900">
            {step === 3 ? "Booking Confirmed" : "Secure Booking"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: JOB DETAILS */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe the job</label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 h-24 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="I need a leaky pipe fixed in my kitchen..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Budget (₦)</label>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold text-gray-900 focus:ring-2 focus:ring-green-500 outline-none" 
                placeholder="5000"
              />
            </div>
            <button 
              onClick={() => setStep(2)} 
              disabled={!budget}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Review Price
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT BREAKDOWN */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3 text-sm text-green-800">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <p>Funds are held securely in <strong>NaijaSkill Escrow</strong> until the job is completed to your satisfaction.</p>
            </div>
            
            <div className="space-y-3 py-2">
              <div className="flex justify-between text-gray-600">
                <span>Artisan Fee</span>
                <span>₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Fee (5%)</span>
                <span>₦{serviceFee.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total to Pay</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(3)} 
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <CreditCard className="w-4 h-4" /> Pay Securely
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm hover:text-gray-900">
              Back to edit
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-6">
              We have notified Emmanuel. Your funds are safe in Escrow.
            </p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold">
              Return to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}