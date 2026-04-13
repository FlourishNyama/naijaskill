"use client";
import { useState } from 'react';
import { Star, Loader2, X } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { useToast } from './ToastProvider';

export default function ReviewModal({ isOpen, onClose, jobId, artisanId, clientName }: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) { toast.warning("Please select a star rating."); return; }
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('reviews').insert({
      job_id: jobId,
      artisan_id: artisanId,
      client_id: user?.id,
      client_name: clientName,
      rating: rating,
      comment: comment
    });

    setSubmitting(false);
    if (!error) {
      toast.success("Review submitted!");
      onClose();
    } else {
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
        
        <h2 className="text-xl font-bold text-center mb-2 dark:text-white">Rate the Artisan</h2>
        <p className="text-sm text-gray-500 text-center mb-6">How was the service provided?</p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition transform hover:scale-110">
              <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
            </button>
          ))}
        </div>

        <textarea 
          placeholder="Write a brief comment..." 
          className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-gray-700 outline-none text-sm min-h-[100px] mb-4 dark:text-white"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-700 transition flex justify-center"
        >
          {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Review"}
        </button>
      </div>
    </div>
  );
}