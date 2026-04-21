"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, User, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Rec {
  id: string;
  artisan_id: string;
  artisan_name: string;
  artisan_job: string;
  artisan_avatar: string | null;
}

export default function RecommendationPrompt() {
  const [queue, setQueue] = useState<Rec[]>([]);
  const [current, setCurrent] = useState<Rec | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'client') return;

      const { data: recs } = await supabase
        .from('recommendations')
        .select('id, artisan_id')
        .eq('recommender_id', user.id)
        .eq('status', 'pending');

      if (!recs || recs.length === 0) return;

      const dismissed: string[] = JSON.parse(sessionStorage.getItem('rec_dismissed') || '[]');
      const toShow = recs.filter(r => !dismissed.includes(r.id));
      if (toShow.length === 0) return;

      const artisanIds = toShow.map(r => r.artisan_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, job_title, avatar_url')
        .in('id', artisanIds);

      const built: Rec[] = toShow.map(r => {
        const p = profiles?.find(x => x.id === r.artisan_id);
        return {
          id: r.id,
          artisan_id: r.artisan_id,
          artisan_name: p?.full_name || 'Unknown Artisan',
          artisan_job: p?.job_title || '',
          artisan_avatar: p?.avatar_url || null,
        };
      });

      setQueue(built);
      setCurrent(built[0]);
    };
    init();
  }, []);

  const advance = (doneId: string) => {
    const remaining = queue.filter(r => r.id !== doneId);
    setQueue(remaining);
    setCurrent(remaining[0] || null);
  };

  const dismiss = () => {
    if (!current) return;
    const dismissed: string[] = JSON.parse(sessionStorage.getItem('rec_dismissed') || '[]');
    sessionStorage.setItem('rec_dismissed', JSON.stringify([...dismissed, current.id]));
    advance(current.id);
  };

  const confirm = async () => {
    if (!current || submitting) return;
    setSubmitting(true);
    await supabase.from('recommendations').update({ status: 'confirmed' }).eq('id', current.id);
    await supabase.from('profiles').update({ is_verified: true }).eq('id', current.artisan_id);
    setSubmitting(false);
    advance(current.id);
  };

  const decline = async () => {
    if (!current) return;
    await supabase.from('recommendations').update({ status: 'denied' }).eq('id', current.id);
    advance(current.id);
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in duration-200 overflow-hidden">

        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="font-bold text-gray-900 dark:text-white text-sm">Recommendation Check</span>
          </div>
          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 relative border-4 border-green-50 dark:border-slate-700">
            {current.artisan_avatar
              ? <Image src={current.artisan_avatar} alt="" fill className="object-cover" />
              : <User className="w-9 h-9 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            }
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{current.artisan_name}</h2>
          <p className="text-sm text-green-600 font-medium mb-5">{current.artisan_job}</p>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            <strong>{current.artisan_name}</strong> listed you as someone who recommended them on Elite Job.<br />
            Did you recommend them?
          </p>

          <div className="flex gap-3">
            <button
              onClick={decline}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              No, I didn&apos;t
            </button>
            <button
              onClick={confirm}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold transition shadow-lg shadow-green-500/20"
            >
              {submitting ? '...' : 'Yes, I did! ✓'}
            </button>
          </div>
        </div>

        {queue.length > 1 && (
          <p className="text-center text-xs text-gray-400 pb-4">
            {queue.length - 1} more waiting
          </p>
        )}
      </div>
    </div>
  );
}
