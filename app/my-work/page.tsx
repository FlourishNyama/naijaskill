"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Calendar, MapPin, Layers, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../../utils/supabase/client';
import { useToast } from '@/components/ToastProvider';

export default function MyWorkPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [stages, setStages] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [evidenceText, setEvidenceText] = useState<Record<string, string>>({});
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWork = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

      if (!bookings) { setLoading(false); return; }
      setJobs(bookings);

      const stagedIds = bookings.filter(b => b.is_staged).map(b => b.id);
      if (stagedIds.length > 0) {
        const { data: stageData } = await supabase
          .from('job_stages')
          .select('*')
          .in('booking_id', stagedIds)
          .order('stage_number', { ascending: true });

        if (stageData) {
          const grouped: Record<string, any[]> = {};
          for (const s of stageData) {
            if (!grouped[s.booking_id]) grouped[s.booking_id] = [];
            grouped[s.booking_id].push(s);
          }
          setStages(grouped);
        }
      }
      setLoading(false);
    };
    fetchWork();
  }, [router]);

  const updateStatus = async (jobId: string, newStatus: string) => {
    if (!window.confirm(`Mark job as ${newStatus}?`)) return;
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', jobId);
    if (!error) setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
  };

  const submitStage = async (stageId: string, bookingId: string) => {
    const note = evidenceText[stageId]?.trim();
    if (!note) { toast.error("Please describe the work done before submitting."); return; }
    setSubmitting(stageId);

    const { error } = await supabase
      .from('job_stages')
      .update({ status: 'submitted', evidence_note: note, submitted_at: new Date().toISOString() })
      .eq('id', stageId);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Stage submitted for admin approval.");
      setStages(prev => ({
        ...prev,
        [bookingId]: prev[bookingId].map(s => s.id === stageId ? { ...s, status: 'submitted', evidence_note: note } : s),
      }));
      setEvidenceText(prev => { const n = { ...prev }; delete n[stageId]; return n; });
    }
    setSubmitting(null);
  };

  const stageStatusColor = (status: string) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'submitted') return 'bg-blue-100 text-blue-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="w-10 h-10 animate-spin text-green-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/artisan-dashboard" className="mr-4"><ArrowLeft className="w-6 h-6 text-gray-500" /></Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Work</h1>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No jobs yet. Go to 'Find Work' to apply.</div>
          ) : jobs.map((job) => {
            const jobStages = stages[job.id] || [];
            const activeStageIndex = jobStages.findIndex(s => s.status === 'pending' || s.status === 'rejected');
            const activeStage = activeStageIndex !== -1 ? jobStages[activeStageIndex] : null;
            const canSubmitActive = activeStageIndex === 0 || (activeStageIndex > 0 && jobStages[activeStageIndex - 1]?.status === 'approved');

            return (
              <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{job.job_description}</h3>
                    <p className="text-xs text-gray-500">Client: {job.client_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.is_staged && <Layers className="w-3 h-3 text-green-500" />}
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>{job.status}</span>
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{job.date}</span>
                  <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{job.location}</span>
                  <span className="font-bold text-green-600">₦{job.budget?.toLocaleString()}</span>
                </div>

                {/* Staged payment section */}
                {job.is_staged && jobStages.length > 0 && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 mb-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment Stages</p>
                    {jobStages.map((stage, idx) => {
                      const isActive = activeStage?.id === stage.id;
                      const canSubmit = isActive && canSubmitActive;
                      return (
                        <div key={stage.id} className={`p-3 rounded-lg border ${isActive && canSubmit ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-slate-800'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{stage.stage_number}. {stage.label}</span>
                              {idx > 0 && jobStages[idx - 1]?.status !== 'approved' && stage.status === 'pending' && (
                                <span className="text-[9px] text-gray-400 italic">Locked</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-green-600">₦{stage.amount?.toLocaleString()}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${stageStatusColor(stage.status)}`}>{stage.status}</span>
                            </div>
                          </div>
                          {stage.evidence_note && stage.status !== 'pending' && (
                            <p className="text-xs text-gray-500 italic mt-1">"{stage.evidence_note}"</p>
                          )}
                          {canSubmit && stage.status !== 'submitted' && stage.status !== 'approved' && (
                            <div className="mt-2 space-y-2">
                              <textarea
                                value={evidenceText[stage.id] || ''}
                                onChange={e => setEvidenceText(prev => ({ ...prev, [stage.id]: e.target.value }))}
                                placeholder="Describe work done at this stage..."
                                className="w-full text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 rounded-lg p-2 h-16 focus:ring-2 focus:ring-green-500 outline-none dark:text-white resize-none"
                              />
                              <button
                                onClick={() => submitStage(stage.id, job.id)}
                                disabled={submitting === stage.id}
                                className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-60"
                              >
                                {submitting === stage.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3" /> Submit Stage for Admin Approval</>}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Non-staged artisan actions */}
                {!job.is_staged && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    {job.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(job.id, 'accepted')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700">Accept Job</button>
                        <button onClick={() => updateStatus(job.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-xs font-bold hover:bg-red-100">Decline</button>
                      </>
                    )}
                    {job.status === 'accepted' && (
                      <button onClick={() => updateStatus(job.id, 'in_progress')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700">Start Work</button>
                    )}
                    {job.status === 'in_progress' && (
                      <button onClick={() => updateStatus(job.id, 'completed')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700">Mark Completed</button>
                    )}
                    <Link href={`/messages?chatWith=${job.client_id}`} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">Chat</Link>
                  </div>
                )}

                {job.is_staged && (
                  <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Link href={`/messages?chatWith=${job.client_id}`} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold">Chat with Client</Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
