'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Lock, CheckCircle, Loader, FileAudio, FileVideo, Trash2, Eye, EyeOff } from 'lucide-react'

const DARK = '#0D1545'
const NAVY = '#1B2A6B'
const GOLD = '#C9A030'

// ── Change this to a real env-var or Supabase auth once live ────
const ADMIN_PASSWORD = 'grm-admin-2025'

interface UploadForm {
  title: string
  speaker: string
  date: string
  series: string
  description: string
  audioFile:  File | null
  videoFile:  File | null
}

const EMPTY_FORM: UploadForm = {
  title:       '',
  speaker:     'Apostle Stanley Akpeji',
  date:        '',
  series:      '',
  description: '',
  audioFile:   null,
  videoFile:   null,
}

const SERIES_OPTIONS = [
  'Identity in Christ',
  'Grace Series',
  'Authority in Christ',
  'Gospel Foundations',
  'Other',
]

// Placeholder list of uploaded messages (replace with Supabase query)
const UPLOADED_MESSAGES = [
  { id: 1, title: 'Walking in Your True Reality',    date: 'Apr 2025', series: 'Identity in Christ', hasAudio: true,  hasVideo: true  },
  { id: 2, title: 'The Grace That Transforms',        date: 'Mar 2025', series: 'Grace Series',       hasAudio: true,  hasVideo: false },
  { id: 3, title: 'Seated in Heavenly Places',        date: 'Mar 2025', series: 'Authority in Christ', hasAudio: true, hasVideo: true  },
]

export default function AdminPage() {
  const [authed,      setAuthed]      = useState(false)
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [authError,   setAuthError]   = useState('')

  const [form,        setForm]        = useState<UploadForm>(EMPTY_FORM)
  const [uploading,   setUploading]   = useState(false)
  const [uploadDone,  setUploadDone]  = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const audioRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password. Please try again.')
    }
  }

  function handleField(key: keyof UploadForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleFileChange(type: 'audio' | 'video', file: File | null) {
    if (!file) return
    if (type === 'audio') {
      setForm(prev => ({ ...prev, audioFile: file }))
      setAudioPreview(URL.createObjectURL(file))
    } else {
      setForm(prev => ({ ...prev, videoFile: file }))
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  function removeFile(type: 'audio' | 'video') {
    if (type === 'audio') {
      setForm(prev => ({ ...prev, audioFile: null }))
      setAudioPreview(null)
      if (audioRef.current) audioRef.current.value = ''
    } else {
      setForm(prev => ({ ...prev, videoFile: null }))
      setVideoPreview(null)
      if (videoRef.current) videoRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.audioFile && !form.videoFile) {
      setUploadError('Please upload at least an audio or video file.')
      return
    }
    setUploading(true)
    setUploadError('')

    try {
      /* ── Supabase upload ────────────────────────────────────────
         When Supabase is wired up, replace this block:

         import { createClient } from '@/utils/supabase/client'
         const supabase = createClient()

         // 1. Upload audio to storage
         if (form.audioFile) {
           const { data, error } = await supabase.storage
             .from('grace-realm-messages')
             .upload(`audio/${Date.now()}-${form.audioFile.name}`, form.audioFile)
           audioUrl = data?.path
         }

         // 2. Upload video to storage
         if (form.videoFile) { ... same pattern ... }

         // 3. Insert record into `grace_realm_messages` table
         await supabase.from('grace_realm_messages').insert({
           title:       form.title,
           speaker:     form.speaker,
           date:        form.date,
           series:      form.series,
           description: form.description,
           audio_url:   audioUrl,
           video_url:   videoUrl,
           format:      form.audioFile && form.videoFile ? 'both'
                        : form.audioFile ? 'audio' : 'video',
         })
      ──────────────────────────────────────────────────────────── */

      // Placeholder: simulate upload delay
      await new Promise(r => setTimeout(r, 1800))
      setUploadDone(true)
      setForm(EMPTY_FORM)
      setAudioPreview(null)
      setVideoPreview(null)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // ── Login screen ─────────────────────────────────────────────
  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: `linear-gradient(135deg, ${DARK}, ${NAVY})` }}
      >
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ backgroundColor: GOLD }}
          >
            <Lock size={24} color={DARK} />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: DARK }}>Admin Access</h1>
          <p className="text-gray-400 text-sm mb-8">Gracerealm Ministries — Message Upload</p>

          <form onSubmit={handleLogin} className="text-left space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none pr-10"
                  placeholder="Enter admin password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-red-500 text-xs">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: DARK }}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <Link href="/grace-realm" className="text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5">
              <ArrowLeft size={12} /> Back to site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Admin dashboard ──────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FC', fontFamily: "'Georgia', serif" }}>

      {/* Header */}
      <div style={{ backgroundColor: DARK, borderBottom: `2px solid ${GOLD}` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/grace-realm" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ArrowLeft size={16} /> Back to site
            </Link>
            <div className="w-px h-5 bg-white/20" />
            <div>
              <div className="text-white font-bold text-sm">Message Upload Admin</div>
              <div className="text-xs" style={{ color: GOLD }}>Gracerealm Ministries International</div>
            </div>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── Upload form ──────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-1" style={{ color: DARK }}>Upload New Message</h2>
              <p className="text-sm text-gray-400 mb-8">Fill in the details and attach audio and/or video files.</p>

              {uploadDone && (
                <div className="mb-6 rounded-xl p-4 flex items-start gap-3 bg-green-50 border border-green-200">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Message uploaded successfully!</p>
                    <button
                      onClick={() => setUploadDone(false)}
                      className="text-xs text-green-600 underline mt-0.5"
                    >
                      Upload another
                    </button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mb-6 rounded-xl p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message Title *</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={e => handleField('title', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    placeholder="e.g. Walking in Your True Reality"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Speaker *</label>
                    <input
                      required
                      type="text"
                      value={form.speaker}
                      onChange={e => handleField('speaker', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                    <input
                      required
                      type="month"
                      value={form.date}
                      onChange={e => handleField('date', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Series *</label>
                  <select
                    required
                    value={form.series}
                    onChange={e => handleField('series', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"
                  >
                    <option value="">Select a series…</option>
                    {SERIES_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => handleField('description', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                    placeholder="Brief summary of the message…"
                  />
                </div>

                {/* Audio upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Audio File (MP3)</label>
                  {audioPreview ? (
                    <div className="rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileAudio size={20} style={{ color: NAVY }} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{form.audioFile?.name}</p>
                          <p className="text-xs text-gray-400">
                            {form.audioFile ? (form.audioFile.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('audio')} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 transition-colors"
                      style={{ borderColor: `${NAVY}30` }}
                      onClick={() => audioRef.current?.click()}
                    >
                      <FileAudio size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-400">Click to upload audio file</p>
                      <p className="text-xs text-gray-300 mt-1">MP3 recommended · max 200 MB</p>
                    </div>
                  )}
                  <input
                    ref={audioRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={e => handleFileChange('audio', e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Video upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Video File (MP4)</label>
                  {videoPreview ? (
                    <div className="rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileVideo size={20} style={{ color: GOLD }} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{form.videoFile?.name}</p>
                          <p className="text-xs text-gray-400">
                            {form.videoFile ? (form.videoFile.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('video')} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-yellow-300 transition-colors"
                      style={{ borderColor: `${GOLD}40` }}
                      onClick={() => videoRef.current?.click()}
                    >
                      <FileVideo size={24} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-400">Click to upload video file</p>
                      <p className="text-xs text-gray-300 mt-1">MP4 recommended · max 2 GB</p>
                    </div>
                  )}
                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={e => handleFileChange('video', e.target.files?.[0] ?? null)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: DARK }}
                >
                  {uploading ? (
                    <><Loader size={16} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><Upload size={16} /> Publish Message</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ── Uploaded messages list ───────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-1" style={{ color: DARK }}>Published Messages</h3>
              <p className="text-xs text-gray-400 mb-5">Placeholder list — wire to Supabase to show live data</p>
              <div className="space-y-3">
                {UPLOADED_MESSAGES.map(msg => (
                  <div
                    key={msg.id}
                    className="rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{msg.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{msg.series} · {msg.date}</p>
                    <div className="flex gap-1.5 mt-2">
                      {msg.hasAudio && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${NAVY}12`, color: NAVY }}>
                          Audio
                        </span>
                      )}
                      {msg.hasVideo && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: GOLD }}>
                          Video
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup note */}
            <div
              className="mt-5 rounded-2xl p-5 text-xs leading-relaxed"
              style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}15`, color: NAVY }}
            >
              <p className="font-bold mb-2">To go live with uploads:</p>
              <ol className="space-y-1.5 list-decimal list-inside text-gray-600">
                <li>Create Supabase table <code className="bg-gray-100 px-1 rounded">grace_realm_messages</code></li>
                <li>Create Supabase Storage bucket <code className="bg-gray-100 px-1 rounded">grace-realm-messages</code></li>
                <li>Replace the simulate block in <code className="bg-gray-100 px-1 rounded">handleSubmit</code> with real Supabase calls (comments included)</li>
                <li>Replace the placeholder array in messages page with a Supabase query</li>
                <li>Move <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code> to an env variable or use Supabase Auth</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
