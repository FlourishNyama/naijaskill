'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Search, Play, Download, Headphones, Video,
  Filter, X, ChevronDown
} from 'lucide-react'

const DARK = '#0D1545'
const NAVY = '#1B2A6B'
const GOLD = '#C9A030'
const LIGHT = '#F7F8FC'

// ── Types ────────────────────────────────────────────────────────
type Format = 'audio' | 'video' | 'both'

interface Message {
  id: number
  title: string
  speaker: string
  date: string
  year: number
  series: string
  format: Format
  description: string
  audioUrl?: string
  videoUrl?: string
  duration?: string
}

// ── Placeholder data ─────────────────────────────────────────────
// Replace with Supabase fetch once messages are uploaded via admin page
const ALL_MESSAGES: Message[] = [
  { id: 1,  title: 'Walking in Your True Reality',        speaker: 'Apostle Stanley Akpeji', date: 'Apr 2025', year: 2025, series: 'Identity in Christ',    format: 'both',  duration: '58 min', description: 'Discover who you truly are in Christ and how to walk in that reality every day.' },
  { id: 2,  title: 'The Grace That Transforms',           speaker: 'Apostle Stanley Akpeji', date: 'Mar 2025', year: 2025, series: 'Grace Series',           format: 'audio', duration: '52 min', description: 'An in-depth look at the transforming power of God\'s grace in every area of life.' },
  { id: 3,  title: 'Seated in Heavenly Places',           speaker: 'Apostle Stanley Akpeji', date: 'Mar 2025', year: 2025, series: 'Authority in Christ',    format: 'both',  duration: '61 min', description: 'Understanding your position in Christ and operating from a place of authority.' },
  { id: 4,  title: 'The Word of His Grace',               speaker: 'Apostle Stanley Akpeji', date: 'Feb 2025', year: 2025, series: 'Grace Series',           format: 'audio', duration: '49 min', description: 'How the word of grace builds you up and gives you an inheritance among the sanctified.' },
  { id: 5,  title: 'Reigning in Life',                    speaker: 'Apostle Stanley Akpeji', date: 'Feb 2025', year: 2025, series: 'Authority in Christ',    format: 'both',  duration: '55 min', description: 'God\'s provision for every believer to reign in life through Jesus Christ.' },
  { id: 6,  title: 'The Mystery of the Gospel',           speaker: 'Apostle Stanley Akpeji', date: 'Jan 2025', year: 2025, series: 'Gospel Foundations',     format: 'video', duration: '64 min', description: 'Unveiling the mystery hidden for ages but now revealed in Christ Jesus.' },
  { id: 7,  title: 'Righteousness Consciousness',         speaker: 'Apostle Stanley Akpeji', date: 'Dec 2024', year: 2024, series: 'Identity in Christ',    format: 'both',  duration: '57 min', description: 'Cultivating a deep consciousness of your righteousness in Christ.' },
  { id: 8,  title: 'Wisdom and Revelation',               speaker: 'Apostle Stanley Akpeji', date: 'Nov 2024', year: 2024, series: 'Gospel Foundations',     format: 'audio', duration: '46 min', description: 'How the spirit of wisdom and revelation opens your understanding to Kingdom realities.' },
  { id: 9,  title: 'The New Creation Reality',            speaker: 'Apostle Stanley Akpeji', date: 'Oct 2024', year: 2024, series: 'Identity in Christ',    format: 'both',  duration: '60 min', description: 'A comprehensive study of what it means to be a new creation in Christ Jesus.' },
  { id: 10, title: 'Living Above the World',              speaker: 'Apostle Stanley Akpeji', date: 'Sep 2024', year: 2024, series: 'Authority in Christ',    format: 'audio', duration: '53 min', description: 'Practical keys to living above the systems and limitations of this world.' },
  { id: 11, title: 'The Father\'s Love',                  speaker: 'Apostle Stanley Akpeji', date: 'Aug 2024', year: 2024, series: 'Grace Series',           format: 'video', duration: '51 min', description: 'Experiencing the unconditional love of the Father and how it changes everything.' },
  { id: 12, title: 'Christ in You the Hope of Glory',     speaker: 'Apostle Stanley Akpeji', date: 'Jul 2024', year: 2024, series: 'Gospel Foundations',     format: 'both',  duration: '66 min', description: 'The mystery of Christ in you — your hope of glory revealed.' },
]

const ALL_SERIES  = ['All Series', ...Array.from(new Set(ALL_MESSAGES.map(m => m.series)))]
const ALL_YEARS   = ['All Years',  ...Array.from(new Set(ALL_MESSAGES.map(m => String(m.year)))).sort((a, b) => +b - +a)]
const FORMAT_TABS = [
  { label: 'All',   value: 'all'   },
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' },
] as const

type FormatFilter = 'all' | 'audio' | 'video'

function FormatBadge({ format }: { format: Format }) {
  return (
    <div className="flex gap-1.5">
      {(format === 'audio' || format === 'both') && (
        <span
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${NAVY}15`, color: NAVY }}
        >
          <Headphones size={10} /> Audio
        </span>
      )}
      {(format === 'video' || format === 'both') && (
        <span
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: GOLD }}
        >
          <Video size={10} /> Video
        </span>
      )}
    </div>
  )
}

export default function MessagesPage() {
  const [query,        setQuery]        = useState('')
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all')
  const [series,       setSeries]       = useState('All Series')
  const [year,         setYear]         = useState('All Years')
  const [activeMsg,    setActiveMsg]    = useState<number | null>(null)

  const filtered = useMemo(() => {
    return ALL_MESSAGES.filter(m => {
      const matchesQuery  = m.title.toLowerCase().includes(query.toLowerCase()) ||
                            m.series.toLowerCase().includes(query.toLowerCase()) ||
                            m.description.toLowerCase().includes(query.toLowerCase())
      const matchesFormat = formatFilter === 'all' ||
                            (formatFilter === 'audio' && (m.format === 'audio' || m.format === 'both')) ||
                            (formatFilter === 'video' && (m.format === 'video' || m.format === 'both'))
      const matchesSeries = series === 'All Series' || m.series === series
      const matchesYear   = year   === 'All Years'  || String(m.year) === year
      return matchesQuery && matchesFormat && matchesSeries && matchesYear
    })
  }, [query, formatFilter, series, year])

  function clearFilters() {
    setQuery('')
    setFormatFilter('all')
    setSeries('All Series')
    setYear('All Years')
  }

  const hasActiveFilters = query || formatFilter !== 'all' || series !== 'All Series' || year !== 'All Years'

  return (
    <div className="min-h-screen" style={{ backgroundColor: LIGHT, fontFamily: "'Georgia', serif" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40" style={{ backgroundColor: DARK, borderBottom: `2px solid ${GOLD}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/grace-realm"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft size={16} /> Back
              </Link>
              <div className="w-px h-5 bg-white/20" />
              <div>
                <div className="text-white font-bold text-sm">Messages Library</div>
                <div className="text-xs" style={{ color: GOLD }}>Gracerealm Ministries International</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">{filtered.length} message{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div
        className="py-16 px-4 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${DARK} 0%, ${NAVY} 100%)` }}
      >
        <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
          Resources
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Messages Archive</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Audio and video messages by Apostle Stanley Akpeji — download, stream, and grow in your true reality.
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="sticky top-[65px] z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">

          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search messages, series, topics…"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Format tabs + dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Format tabs */}
            <div
              className="flex rounded-xl overflow-hidden border"
              style={{ borderColor: `${NAVY}20` }}
            >
              {FORMAT_TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFormatFilter(tab.value)}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={
                    formatFilter === tab.value
                      ? { backgroundColor: NAVY, color: 'white' }
                      : { backgroundColor: 'white', color: '#666' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Series dropdown */}
            <div className="relative">
              <select
                value={series}
                onChange={e => setSeries(e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl pl-4 pr-8 py-2 text-sm focus:outline-none bg-white text-gray-700"
              >
                {ALL_SERIES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Year dropdown */}
            <div className="relative">
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="appearance-none border border-gray-200 rounded-xl pl-4 pr-8 py-2 text-sm focus:outline-none bg-white text-gray-700"
              >
                {ALL_YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors hover:bg-red-50"
                style={{ color: '#e53e3e' }}
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Message grid ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Filter size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 font-medium mb-2">No messages match your filters</p>
            <button onClick={clearFilters} className="text-sm underline" style={{ color: NAVY }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(msg => {
              const isExpanded = activeMsg === msg.id
              return (
                <div
                  key={msg.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-video flex items-center justify-center relative cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${DARK}, ${NAVY})` }}
                    onClick={() => setActiveMsg(isExpanded ? null : msg.id)}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center">
                      <Play size={22} className="text-white ml-1" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ backgroundColor: `${GOLD}CC`, color: DARK }}
                      >
                        {msg.series}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 leading-snug mb-1">{msg.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{msg.speaker} · {msg.date}</p>
                    {msg.duration && (
                      <p className="text-xs text-gray-400 mb-2">⏱ {msg.duration}</p>
                    )}

                    <FormatBadge format={msg.format} />

                    {/* Expandable description */}
                    {isExpanded && (
                      <p className="text-xs text-gray-500 mt-3 leading-relaxed">{msg.description}</p>
                    )}

                    <button
                      onClick={() => setActiveMsg(isExpanded ? null : msg.id)}
                      className="text-xs mt-2 text-left transition-colors"
                      style={{ color: GOLD }}
                    >
                      {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
                    </button>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {(msg.format === 'audio' || msg.format === 'both') && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-85"
                          style={{ backgroundColor: NAVY }}
                          onClick={() => msg.audioUrl && window.open(msg.audioUrl, '_blank')}
                        >
                          <Headphones size={13} /> Listen
                        </button>
                      )}
                      {(msg.format === 'video' || msg.format === 'both') && (
                        <button
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-85 text-white"
                          style={{ backgroundColor: GOLD }}
                          onClick={() => msg.videoUrl && window.open(msg.videoUrl, '_blank')}
                        >
                          <Play size={13} /> Watch
                        </button>
                      )}
                      <button
                        className="flex items-center justify-center px-3 py-2 rounded-xl text-xs border transition-colors hover:bg-gray-50"
                        style={{ borderColor: NAVY, color: NAVY }}
                        onClick={() => {
                          const url = msg.audioUrl || msg.videoUrl
                          if (url) window.open(url, '_blank')
                        }}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Footer strip ───────────────────────────────────────── */}
      <div
        className="py-8 text-center text-xs text-gray-500"
        style={{ borderTop: `1px solid ${NAVY}12` }}
      >
        <p>
          Messages by{' '}
          <strong style={{ color: DARK }}>Apostle Stanley Akpeji</strong> ·{' '}
          <Link href="/grace-realm" className="underline" style={{ color: NAVY }}>
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  )
}
