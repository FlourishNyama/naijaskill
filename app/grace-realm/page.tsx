'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Menu, X, MapPin, Clock, Play, Download,
  ChevronRight, Phone, Mail, Facebook, Instagram,
  Twitter, Heart
} from 'lucide-react'

const DARK  = '#0D1545'
const NAVY  = '#1B2A6B'
const GOLD  = '#C9A030'
const LIGHT = '#F7F8FC'

const branches = [
  {
    name: 'Minna Branch',
    state: 'Niger State, Nigeria',
    address: 'Minna, Niger State',
    services: [
      { day: 'Friday',  time: '5:00 PM', name: 'Evening Service' },
      { day: 'Sunday',  time: '8:00 AM', name: 'Sunday Service'  },
    ],
  },
  {
    name: 'Abuja Branch',
    state: 'FCT, Nigeria',
    address: 'Abuja, Federal Capital Territory',
    services: [
      { day: 'Sunday', time: 'Times Coming Soon', name: 'Sunday Service' },
    ],
  },
]

const latestMessages = [
  {
    id: 1,
    title: 'Walking in Your True Reality',
    speaker: 'Apostle Stanley Akpeji',
    date: 'April 2025',
    series: 'Identity in Christ',
    hasAudio: true,
    hasVideo: true,
  },
  {
    id: 2,
    title: 'The Grace That Transforms',
    speaker: 'Apostle Stanley Akpeji',
    date: 'March 2025',
    series: 'Grace Series',
    hasAudio: true,
    hasVideo: false,
  },
  {
    id: 3,
    title: 'Seated in Heavenly Places',
    speaker: 'Apostle Stanley Akpeji',
    date: 'March 2025',
    series: 'Authority in Christ',
    hasAudio: true,
    hasVideo: true,
  },
]

const upcomingEvents = [
  { date: '9',  month: 'MAY', day: 'Fri', title: 'Friday Evening Service',    location: 'Minna Branch', time: '5:00 PM' },
  { date: '11', month: 'MAY', day: 'Sun', title: 'Sunday Worship Service',     location: 'Minna Branch', time: '8:00 AM' },
  { date: '16', month: 'MAY', day: 'Fri', title: 'Friday Evening Service',    location: 'Minna Branch', time: '5:00 PM' },
  { date: '—',  month: 'TBD', day: '—',  title: 'Abuja Branch Launch Service', location: 'Abuja Branch', time: 'TBD'     },
]

export default function GraceRealmPage() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [givingOpen,  setGivingOpen]  = useState(false)
  const [prayerForm,  setPrayerForm]  = useState({ name: '', email: '', request: '' })
  const [prayerSent,  setPrayerSent]  = useState(false)
  const [copied,      setCopied]      = useState(false)

  const navLinks = [
    { label: 'Home',     href: '#home'     },
    { label: 'About',    href: '#about'    },
    { label: 'Branches', href: '#branches' },
    { label: 'Messages', href: '/grace-realm/messages' },
    { label: 'Events',   href: '#events'   },
    { label: 'Contact',  href: '#contact'  },
  ]

  function handleCopyAccount() {
    navigator.clipboard.writeText('0000000000')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Georgia', serif", color: '#1a1a1a' }}>

      {/* ── NAVIGATION ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: DARK, borderBottom: `2px solid ${GOLD}` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo mark */}
            <Link href="/grace-realm" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: GOLD, color: DARK }}
              >
                GRM
              </div>
              <div className="leading-tight">
                <div className="text-white font-bold text-sm">Gracerealm Ministries</div>
                <div className="text-xs" style={{ color: GOLD }}>International</div>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-gray-300 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                )
              )}
              <button
                onClick={() => setGivingOpen(true)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD, color: DARK }}
              >
                Give
              </button>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden pb-5 pt-3 border-t border-white/10">
              {navLinks.map(link =>
                link.href.startsWith('/') ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block py-2 text-gray-300 text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block py-2 text-gray-300 text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              <button
                onClick={() => { setGivingOpen(true); setMenuOpen(false) }}
                className="mt-3 w-full py-2 rounded-full text-sm font-semibold"
                style={{ backgroundColor: GOLD, color: DARK }}
              >
                Give
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          paddingTop: '64px',
          background: `linear-gradient(150deg, ${DARK} 0%, ${NAVY} 55%, #1a3a6e 100%)`,
        }}
      >
        {/* Soft glow blobs */}
        <div
          className="absolute top-24 right-16 w-[28rem] h-[28rem] rounded-full pointer-events-none"
          style={{ background: GOLD, filter: 'blur(100px)', opacity: 0.08 }}
        />
        <div
          className="absolute bottom-24 left-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: GOLD, filter: 'blur(80px)', opacity: 0.07 }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-24">
          {/* Logo placeholder — swap with <Image> once logo file is available */}
          <div
            className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center font-bold text-2xl shadow-2xl"
            style={{ backgroundColor: GOLD, color: DARK, border: `4px solid rgba(255,255,255,0.2)` }}
          >
            GRM
          </div>

          <p
            className="uppercase tracking-[0.3em] text-xs mb-5 font-semibold"
            style={{ color: GOLD }}
          >
            Welcome to
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Gracerealm Ministries
            <br />
            <span style={{ color: GOLD }}>International</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 italic mb-12">
            …bringing men into their true reality!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="#branches"
              className="px-8 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: GOLD, color: DARK }}
            >
              Plan A Visit
            </a>
            <Link
              href="/grace-realm/messages"
              className="px-8 py-3 rounded-full font-semibold text-sm border-2 transition-colors hover:bg-white/10"
              style={{ borderColor: GOLD, color: 'white' }}
            >
              Watch Messages
            </Link>
          </div>

          {/* Quick service times */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {[
              { label: 'Minna · Friday',  detail: '5:00 PM — Evening Service' },
              { label: 'Minna · Sunday',  detail: '8:00 AM — Sunday Service'  },
              { label: 'Abuja · Sunday',  detail: 'Times Coming Soon'         },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl px-6 py-3 text-sm backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div className="font-semibold mb-0.5" style={{ color: GOLD }}>{item.label}</div>
                <div className="text-gray-300 text-xs">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-50 animate-bounce">
          <div className="w-5 h-8 border-2 border-white rounded-full flex items-start justify-center pt-1.5">
            <div className="w-0.5 h-2 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Pastor image placeholder */}
            <div className="relative">
              <div
                className="aspect-[4/5] rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${NAVY}18, ${GOLD}18)` }}
              >
                <div className="text-center text-gray-400 p-8">
                  <div
                    className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${DARK})` }}
                  >
                    SA
                  </div>
                  <p className="font-semibold text-gray-600">Apostle Stanley Akpeji</p>
                  <p className="text-sm text-gray-400 mt-1">Photo coming soon</p>
                </div>
              </div>
              {/* Decorative offset border */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl -z-10"
                style={{ border: `2px solid ${GOLD}`, borderRadius: '1.5rem' }}
              />
            </div>

            {/* Text */}
            <div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
                About Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight" style={{ color: DARK }}>
                A Church Built on<br />Grace, Truth &amp; Purpose
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Gracerealm Ministries International is an apostolic ministry committed to unveiling
                God's grace and helping every believer walk in their God-given identity and true reality.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Under the leadership of{' '}
                <strong style={{ color: DARK }}>Apostle Stanley Akpeji</strong>, we are dedicated to
                raising a generation that knows who they are in Christ — men and women who live, move,
                and operate in the fullness of what God has ordained.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                With branches in <strong style={{ color: DARK }}>Minna</strong> and{' '}
                <strong style={{ color: DARK }}>Abuja</strong>, we continue to grow as a community
                that honours God and transforms lives.
              </p>

              <div className="flex gap-10">
                {[
                  { stat: '2+',   label: 'Branches'       },
                  { stat: '10+',  label: 'Years of Ministry' },
                  { stat: '100s', label: 'Messages'        },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-3xl font-bold" style={{ color: NAVY }}>{item.stat}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BRANCHES ────────────────────────────────────────────── */}
      <section id="branches" className="py-24 px-4 text-white" style={{ backgroundColor: DARK }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
              Find Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Our Branches</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {branches.map(branch => (
              <div
                key={branch.name}
                className="rounded-2xl p-8"
                style={{
                  background: `linear-gradient(135deg, ${NAVY}60, ${NAVY}30)`,
                  border: `1px solid ${GOLD}30`,
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: GOLD }}
                  >
                    <MapPin size={20} color={DARK} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{branch.name}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{branch.address}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {branch.services.map(service => (
                    <div
                      key={service.name}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                      <Clock size={15} style={{ color: GOLD }} />
                      <div>
                        <div className="text-sm font-medium">{service.name}</div>
                        <div className="text-xs text-gray-400">{service.day} · {service.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST MESSAGES ─────────────────────────────────────── */}
      <section id="messages" className="py-24 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
                Resources
              </p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: DARK }}>
                Latest Messages
              </h2>
            </div>
            <Link
              href="/grace-realm/messages"
              className="hidden md:flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: NAVY }}
            >
              Browse All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {latestMessages.map(msg => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-video flex items-center justify-center relative"
                  style={{ background: `linear-gradient(135deg, ${DARK}, ${NAVY})` }}
                >
                  <div className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center cursor-pointer">
                    <Play size={22} className="text-white ml-1" />
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    {msg.hasAudio && (
                      <span className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                        Audio
                      </span>
                    )}
                    {msg.hasVideo && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: GOLD, color: DARK }}
                      >
                        Video
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: GOLD }}>
                    {msg.series}
                  </p>
                  <h3 className="font-bold text-gray-900 mb-1 leading-snug">{msg.title}</h3>
                  <p className="text-xs text-gray-400 mb-4">{msg.speaker} · {msg.date}</p>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
                      style={{ backgroundColor: NAVY }}
                    >
                      <Play size={13} /> Listen
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 rounded-lg text-sm border transition-colors hover:bg-gray-50"
                      style={{ borderColor: NAVY, color: NAVY }}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/grace-realm/messages"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              Browse All Messages <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── EVENTS ──────────────────────────────────────────────── */}
      <section id="events" className="py-24 px-4 text-white" style={{ backgroundColor: NAVY }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
              Calendar
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
          </div>

          <div className="space-y-4">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-6 rounded-2xl px-6 py-5"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-center min-w-[52px]">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">{event.month}</div>
                  <div className="text-2xl font-bold" style={{ color: GOLD }}>{event.date}</div>
                  <div className="text-xs text-gray-500">{event.day}</div>
                </div>
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {event.location}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRAYER REQUEST ──────────────────────────────────────── */}
      <section id="prayer" className="py-24 px-4" style={{ backgroundColor: LIGHT }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
            We Believe in Prayer
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: DARK }}>
            Submit a Prayer Request
          </h2>
          <p className="text-gray-500 text-sm mb-12">
            Our team will stand in faith with you. Submit your request and our prayer team will intercede.
          </p>

          {prayerSent ? (
            <div
              className="rounded-2xl p-10"
              style={{ background: `${NAVY}10`, border: `1px solid ${NAVY}20` }}
            >
              <Heart size={40} className="mx-auto mb-4" style={{ color: GOLD }} />
              <h3 className="font-bold text-xl mb-2" style={{ color: DARK }}>Prayer Request Received</h3>
              <p className="text-gray-500 text-sm">
                Our prayer team will be interceding for you. God is faithful!
              </p>
            </div>
          ) : (
            <form
              className="bg-white rounded-2xl p-8 shadow-sm text-left space-y-5"
              onSubmit={e => { e.preventDefault(); setPrayerSent(true) }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={prayerForm.name}
                  onChange={e => setPrayerForm({ ...prayerForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  placeholder="Full name"
                  style={{ '--tw-ring-color': NAVY } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={prayerForm.email}
                  onChange={e => setPrayerForm({ ...prayerForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Prayer Request</label>
                <textarea
                  required
                  rows={5}
                  value={prayerForm.request}
                  onChange={e => setPrayerForm({ ...prayerForm, request: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
                  placeholder="Share what you'd like us to pray about…"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: NAVY }}
              >
                Submit Prayer Request
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-4 text-white" style={{ backgroundColor: DARK }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="uppercase tracking-widest text-xs font-semibold mb-4" style={{ color: GOLD }}>
              Get in Touch
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Contact Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              {
                icon: <Mail size={20} color={DARK} />,
                title: 'Email Us',
                lines: ['info@gracerealmministries.org', '(placeholder — update me)'],
              },
              {
                icon: <Phone size={20} color={DARK} />,
                title: 'Call Us',
                lines: ['+234 — — — — —', '(placeholder — update me)'],
              },
              {
                icon: <MapPin size={20} color={DARK} />,
                title: 'Visit Us',
                lines: ['Minna, Niger State', 'Abuja, FCT'],
              },
            ].map(item => (
              <div
                key={item.title}
                className="text-center rounded-2xl p-8"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: GOLD }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                {item.lines.map((line, i) => (
                  <p
                    key={i}
                    className={i === 0 ? 'text-gray-300 text-sm' : 'text-gray-500 text-xs mt-0.5'}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-4">
            {[
              { href: 'https://facebook.com/GraceRealmInt', icon: <Facebook size={18} color={DARK} /> },
              { href: 'https://instagram.com/gracerealm_gmi', icon: <Instagram size={18} color={DARK} /> },
              { href: 'https://twitter.com/Gracerealm_1', icon: <Twitter size={18} color={DARK} /> },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="py-10 px-4 text-center text-sm"
        style={{ backgroundColor: '#06091F' }}
      >
        <div
          className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-sm"
          style={{ backgroundColor: GOLD, color: DARK }}
        >
          GRM
        </div>
        <p className="text-white font-semibold mb-1">Gracerealm Ministries International</p>
        <p className="italic mb-6 text-sm" style={{ color: GOLD + '99' }}>
          …bringing men into their true reality!
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
          {navLinks.map(link =>
            link.href.startsWith('/') ? (
              <Link key={link.label} href={link.href} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href} className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
                {link.label}
              </a>
            )
          )}
          <Link href="/grace-realm/admin" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
            Admin
          </Link>
        </div>
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Gracerealm Ministries International. All rights reserved.
        </p>
      </footer>

      {/* ── GIVING MODAL ────────────────────────────────────────── */}
      {givingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => setGivingOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ backgroundColor: GOLD }}
              >
                🙌
              </div>
              <h2 className="text-2xl font-bold mb-1" style={{ color: DARK }}>
                Give to God's Work
              </h2>
              <p className="text-gray-400 text-sm">
                Your giving supports the ministry and advances the Kingdom
              </p>
            </div>

            <div
              className="rounded-2xl p-6 mb-5"
              style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}18` }}
            >
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Bank Transfer</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Bank',         value: '[Bank Name — update me]'           },
                  { label: 'Account Name', value: "Gracerealm Ministries Int'l"       },
                  { label: 'Account No.',  value: '[Account Number — update me]', bold: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{row.label}:</span>
                    <span
                      className={`text-sm ${row.bold ? 'text-lg font-bold' : 'font-semibold'}`}
                      style={{ color: row.bold ? NAVY : DARK }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCopyAccount}
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: `${NAVY}12`, color: NAVY }}
              >
                {copied ? '✓ Copied!' : 'Copy Account Number'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 italic mb-6">
              "Bring the whole tithe into the storehouse…" — Malachi 3:10
            </p>

            <button
              onClick={() => setGivingOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: DARK }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
