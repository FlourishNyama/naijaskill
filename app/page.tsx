"use client";
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, Star, ShieldCheck, MapPin, Loader2, ArrowRight,
  UserCheck, Calendar, CreditCard, Lock, ChevronRight, CheckCircle2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { createClient } from '../utils/supabase/client';

const POPULAR_SERVICES = [
  "Plumber", "Electrician", "Carpenter", "Makeup Artist",
  "Photographer", "Painter", "Mechanic", "Tailor",
  "Web Developer", "Caterer", "Cleaner", "AC Repair"
];

// 1. We keep this as a "Fallback" in case the database is empty or loading
const FALLBACK_WORKERS = [
  { name: "Adebayo K.", role: "Licensed Electrician", location: "Abuja", rating: "4.9", color: "#1D5C30", initial: "A" },
  { name: "Chinyere O.", role: "Master Plumber", location: "Lagos", rating: "4.8", color: "#7A3EA5", initial: "C" },
];

export default function Home() {
  const router = useRouter();
  const [featuredArtisans, setFeaturedArtisans] = useState<any[]>([]);
  // New state for the hero carousel
  const [carouselWorkers, setCarouselWorkers] = useState<any[]>(FALLBACK_WORKERS);
  const [loading, setLoading] = useState(true);

  // ... (keep search and suggestions state)

  // ── Updated Supabase Fetch ──
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Fetch 5 artisans for the rotating hero card
      const { data: artisans } = await supabase
        .from('profiles')
        .select('full_name, job_title, location, id')
        .eq('role', 'artisan')
        .not('job_title', 'is', null)
        .limit(5);

      if (artisans && artisans.length > 0) {
        // Map DB data to the carousel format
        const mapped = artisans.map(a => ({
          name: a.full_name,
          role: a.job_title,
          location: a.location || "Nigeria",
          rating: "5.0", // You can calculate actual ratings here later
          color: ["#1D5C30", "#7A3EA5", "#2A6BA5", "#C9593A", "#3A8A5C"][Math.floor(Math.random() * 5)],
          initial: a.full_name?.charAt(0) || "E"
        }));
        setCarouselWorkers(mapped);
        setFeaturedArtisans(artisans.slice(0, 3)); // For the "Featured" section below
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ── Updated Carousel Timer ──
  useEffect(() => {
    if (carouselWorkers.length <= 1) return;

    carouselRef.current = setInterval(() => {
      setCurrentWorker(prev => (prev + 1) % carouselWorkers.length);
    }, 3000);
    
    return () => { if (carouselRef.current) clearInterval(carouselRef.current); };
  }, [carouselWorkers]); // Re-run timer if list changes

  // ... (keep search handlers)
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Rotating worker carousel state
  const [currentWorker, setCurrentWorker] = useState(0);
  const carouselRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Plan tab state
  const [activePlan, setActivePlan] = useState<'client' | 'worker'>('client');

  // ── Supabase fetch (unchanged) ──
  useEffect(() => {
    const fetchArtisans = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'artisan')
        .limit(3);

      if (data) setFeaturedArtisans(data);
      setLoading(false);
    };
    fetchArtisans();
  }, []);

  // ── Carousel autoplay ──
  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCurrentWorker(prev => (prev + 1) % PREVIEW_WORKERS.length);
    }, 3000);
    return () => { if (carouselRef.current) clearInterval(carouselRef.current); };
  }, []);

  // ── Search handlers (unchanged) ──
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      const matches = POPULAR_SERVICES.filter(service =>
        service.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const executeSearch = (term: string) => {
    if (term.trim()) {
      router.push(`/browse?q=${term}`);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const worker = PREVIEW_WORKERS[currentWorker];

  return (
    <main className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* ══════════════════════════════════════════
          ONE-LINER ANNOUNCEMENT BAR
          Book: repeat your message everywhere
      ══════════════════════════════════════════ */}
      <div className="bg-[#C9973A] text-[#0F1A12] text-center py-2.5 px-4 text-xs sm:text-sm font-semibold">
        Most Nigerians get scammed hiring skilled workers — EliteJob verifies every pro &amp; holds your payment in escrow until you&apos;re satisfied.
      </div>

      {/* ══════════════════════════════════════════
          HERO SECTION
          Book: grunt test — what? how? what do I do?
      ══════════════════════════════════════════ */}
      <section className="relative bg-[#0F1A12] dark:bg-slate-900 overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#1D5C30]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#C9973A]/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-28 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT: copy */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#C9973A]/12 border border-[#C9973A]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#C9973A] animate-pulse" />
              <span className="text-[#C9973A] text-xs font-semibold tracking-wide">Nigeria&apos;s Trusted Skilled Worker Marketplace</span>
            </div>

            {/* Headline — grunt test */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
              Find a Trusted<br />
              Skilled Worker.{" "}
              <span className="text-[#C9973A]">Get the<br className="hidden sm:block" /> Job Done Right.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Hire verified plumbers, electricians, carpenters and more across Nigeria. Every payment held in escrow — only released when you&apos;re 100% satisfied or your money back.
            </p>

            {/* CTA buttons — direct + transitional (book p.145) */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-2 bg-[#C9973A] hover:bg-[#E8B85A] text-[#0F1A12] font-bold px-7 py-3.5 rounded-xl text-base transition-all active:scale-95 shadow-lg shadow-[#C9973A]/20"
              >
                Find a Skilled Worker Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#lead-gen"
                className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/6 hover:bg-white/12 text-white font-medium px-7 py-3.5 rounded-xl text-base transition-all"
              >
                Get Our Free Hiring Guide
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 flex-wrap">
              {[
                { num: "500+", label: "Verified workers" },
                { num: "1,200+", label: "Jobs completed" },
                { num: "100%", label: "Escrow protected" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#C9973A] leading-none font-serif">{s.num}</div>
                  <div className="text-xs text-white/40 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Search card with rotating worker preview */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Find the Right Pro Today</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Search by skill, name, or location</p>

              {/* Search bar (original logic preserved) */}
              <div className="relative" ref={searchRef}>
                <div className="flex items-center bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden mb-3 focus-within:ring-2 focus-within:ring-[#C9973A]/40 transition-all">
                  <div className="pl-4 pr-2 text-gray-400 flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Plumber in Abuja, Electrician Lagos…"
                    className="flex-1 py-3 px-2 outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400 text-sm min-w-0"
                    value={searchQuery}
                    onChange={handleInput}
                    onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                  />
                  <button
                    onClick={() => executeSearch(searchQuery)}
                    className="bg-[#1D5C30] hover:bg-[#2A7A3F] text-white px-5 py-3 text-sm font-bold transition flex-shrink-0 active:scale-95"
                  >
                    Search
                  </button>
                </div>

                {/* Auto-suggestions dropdown (original logic preserved) */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => { setSearchQuery(suggestion); executeSearch(suggestion); }}
                        className="px-4 py-3 hover:bg-green-50 dark:hover:bg-slate-700 cursor-pointer flex items-center text-sm text-gray-700 dark:text-gray-200 border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                      >
                        <Search className="w-3.5 h-3.5 mr-3 text-gray-400 flex-shrink-0" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick tags (original logic preserved) */}
              <div className="flex flex-wrap gap-2 mb-5">
                {['🔧 Plumber', '⚡ Electrician', '🪵 Carpenter', '💄 Makeup Artist', '💻 Web Dev', '🎨 Painter'].map((cat) => {
                  const term = cat.split(' ').slice(1).join(' ');
                  return (
                    <Link
                      key={cat}
                      href={`/browse?q=${term}`}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-[#C9973A] hover:text-[#C9973A] transition active:scale-95"
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>

              {/* ── ROTATING WORKER PREVIEW ── */}
<div
  className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 mb-3"
  style={{ height: '76px' }}
  onMouseEnter={() => { if (carouselRef.current) clearInterval(carouselRef.current); }}
  onMouseLeave={() => {
    carouselRef.current = setInterval(() => {
      setCurrentWorker(prev => (prev + 1) % carouselWorkers.length);
    }, 3000);
  }}
>
  {carouselWorkers.map((w, i) => (
    <div
      key={i}
      className="absolute inset-0 flex items-center gap-3 px-4 bg-gray-50 dark:bg-slate-700 transition-all duration-500"
      style={{
        opacity: i === currentWorker ? 1 : 0,
        transform: i === currentWorker ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: i === currentWorker ? 'auto' : 'none',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: w.color }}
      >
        {w.initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{w.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{w.role} · {w.location}</div>
      </div>
      {/* ... (Star and Verified badge stays same) */}
    </div>
  ))}
</div>

{/* Update Carousel dots to use carouselWorkers.length */}
<div className="flex justify-center gap-1.5 mb-4">
  {carouselWorkers.map((_, i) => (
    <button
      key={i}
      onClick={() => setCurrentWorker(i)}
      className={`h-1.5 rounded-full border-none cursor-pointer ${
        i === currentWorker ? 'w-4 bg-[#C9973A]' : 'w-1.5 bg-gray-300'
      }`}
    />
  ))}
</div>        <span className="text-[10px] font-semibold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-full px-2 py-0.5 border border-green-200 dark:border-green-800">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel dots */}
              <div className="flex justify-center gap-1.5 mb-4">
                {PREVIEW_WORKERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentWorker(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${
                      i === currentWorker
                        ? 'w-4 bg-[#C9973A]'
                        : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Escrow trust pill */}
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-3 py-2.5">
                <Lock className="w-4 h-4 text-[#C9973A] flex-shrink-0" />
                <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Payment held in escrow — released only when you&apos;re satisfied
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LEAD GENERATOR STRIP
          Book: transitional CTA + email capture
      ══════════════════════════════════════════ */}
      <section id="lead-gen" className="bg-[#1D5C30] dark:bg-green-900 py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/90 text-sm sm:text-base font-medium text-center sm:text-left">
            <span className="font-bold text-white">📥 Free Guide:</span>{" "}
            &ldquo;5 Mistakes Nigerians Make When Hiring Skilled Workers (and How to Avoid Them)&rdquo;
          </p>
          <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 sm:w-52 px-4 py-2.5 rounded-lg text-sm outline-none font-medium text-gray-800 border-none min-w-0"
            />
            <button className="bg-[#C9973A] hover:bg-[#E8B85A] text-[#0F1A12] font-bold px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition active:scale-95 flex-shrink-0">
              Send Me the Guide →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STAKES SECTION
          Book: what is the cost of NOT using you?
      ══════════════════════════════════════════ */}
      <section className="bg-[#1A2B1E] dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">The Problem</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Every unverified hire is a gamble with your money.
            </h2>
            <p className="text-white/55 text-base leading-relaxed">
              Millions of Nigerians lose money every year to skilled workers who collect upfront and vanish, do poor work with no accountability, or simply cannot be trusted. You deserve better. EliteJob exists to end this.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: "💸", title: "Paid and abandoned", desc: "You hand over your money upfront — they collect and disappear, leaving you with an incomplete job and no recourse." },
              { icon: "🔍", title: "No way to verify who you're hiring", desc: "Anyone can claim to be a professional. Without verification, you are gambling with your home, your money, and your safety." },
              { icon: "😤", title: "No recourse when things go wrong", desc: "Substandard work, broken promises, and no platform to hold anyone accountable — the client always loses." },
            ].map(item => (
              <div key={item.title} className="flex gap-4 items-start bg-white/4 border border-white/8 rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/12 border border-red-500/20 flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VALUE PROPOSITION
          Book: list benefits specifically and visually
      ══════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] dark:bg-slate-950">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">Why EliteJob</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Built to give you complete peace of mind
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            We rebuilt trust in Nigeria&apos;s skilled worker market from the ground up — with the verification, protection, and transparency you need to hire with confidence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: "🛡️", bg: "bg-amber-50 dark:bg-amber-900/20", title: "100% Verified Profiles", desc: "Every skilled worker is background-checked and identity-verified before they can receive a single job. No imposters. No fakes.", stat: "ID-verified", statColor: "text-[#1D5C30] dark:text-green-400" },
              { icon: "🔒", bg: "bg-green-50 dark:bg-green-900/20", title: "Escrow Payment Protection", desc: "Your money is held securely and only released to the worker once you personally confirm the work meets your standard.", stat: "₦0 lost to scams", statColor: "text-[#1D5C30] dark:text-green-400" },
              { icon: "⭐", bg: "bg-blue-50 dark:bg-blue-900/20", title: "Real Ratings & Reviews", desc: "Genuine reviews from verified clients tell you exactly what to expect before you commit a single naira.", stat: "4.8 avg. rating", statColor: "text-[#1D5C30] dark:text-green-400" },
            ].map(card => (
              <div key={card.title} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-2xl mb-4`}>{card.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{card.desc}</p>
                <div className={`text-xl font-extrabold ${card.statColor} font-serif`}>{card.stat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      {/* ══════════════════════════════════════════
          THE GUIDE SECTION
          Book: empathy + authority one-two punch
      ══════════════════════════════════════════ */}
      <section className="bg-[#0F1A12] dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Founder quote card */}
          <div className="bg-[#1A2B1E] dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-[#1D5C30] border-2 border-[#C9973A] flex items-center justify-center text-white font-extrabold text-2xl">
              EJ
            </div>
            <blockquote className="text-white/68 text-base italic leading-relaxed border-l-2 border-[#C9973A] pl-4 text-left">
              &ldquo;I was scammed by a plumber who collected ₦80,000 and never returned. I built EliteJob so no one in Nigeria ever has to feel that helpless again.&rdquo;
            </blockquote>
            <p className="text-white/35 text-xs">— Founder, EliteJob International · Abuja</p>
            <div className="flex flex-wrap gap-3 justify-center text-xs text-white/40">
              <span>📰 Featured in TechCabal</span>
              <span>🏆 Startup Lagos 2024</span>
            </div>
          </div>
          {/* Authority copy */}
          <div>
            <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">We Understand</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-5 leading-tight">
              We know exactly how this feels — because it happened to us too.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed mb-4">
              We understand what it feels like to lose money to someone you trusted with your home. That experience drove us to spend years building EliteJob — Nigeria&apos;s verified, escrow-protected skilled worker marketplace.
            </p>
            <p className="text-white/55 text-sm leading-relaxed mb-6">
              We have helped over 1,200 Nigerians complete jobs safely. Not a single client who used our escrow system has lost money to a skilled worker. That is our promise.
            </p>
            <div className="flex flex-wrap gap-2">
              {["🏛️ CAC Registered", "🔐 SSL Secured", "📞 Live Support", "🇳🇬 Abuja-Based", "✅ 1,200+ Jobs Done"].map(b => (
                <span key={b} className="flex items-center gap-1.5 bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/65">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — THE PLAN
          Book: 3-step plan for both sides
      ══════════════════════════════════════════ */}
      <section className="py-16 bg-[#FAF7F2] dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">How it Works</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              Three simple steps. Zero guesswork.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">Getting a job done safely has never been this straightforward.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActivePlan('client')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activePlan === 'client'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                I need a skilled worker
              </button>
              <button
                onClick={() => setActivePlan('worker')}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activePlan === 'worker'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                I am a skilled worker
              </button>
            </div>
          </div>

          {/* Client steps */}
          {activePlan === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: <UserCheck className="w-6 h-6" />, num: "01", title: "Search or Post a Job", desc: "Browse verified skilled worker profiles by skill and city, or post your job and let pros apply — you choose. Takes two minutes.", bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
                { icon: <CreditCard className="w-6 h-6" />, num: "02", title: "Pay Securely into Escrow", desc: "Fund the job through our secure escrow. Your money is locked safely — the worker cannot touch it until you approve.", bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
                { icon: <CheckCircle2 className="w-6 h-6" />, num: "03", title: "Approve & Release Payment", desc: "Once the job is done to your satisfaction, release the payment with one tap. Not satisfied? Raise a dispute — we have your back.", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-gray-100 dark:text-slate-800 select-none">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  {i < 2 && <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-700 hidden md:block" />}
                </div>
              ))}
            </div>
          )}

          {/* Artisan steps */}
          {activePlan === 'worker' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { icon: <UserCheck className="w-6 h-6" />, num: "01", title: "Create Your Free Profile", desc: "Sign up free, submit your ID and skill credentials, and get verified in 24–48 hours. No upfront cost, ever.", bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
                { icon: <Calendar className="w-6 h-6" />, num: "02", title: "Receive Job Requests", desc: "Browse available jobs near you or get direct requests from clients. Chat, agree on terms, and confirm — all in the app.", bg: "bg-amber-100 dark:bg-amber-900/30", color: "text-amber-600 dark:text-amber-400" },
                { icon: <CreditCard className="w-6 h-6" />, num: "03", title: "Complete Work & Get Paid", desc: "Finish the job, get the client to approve, and your payment is released immediately — guaranteed. No chasing, no delays.", bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
              ].map((step, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                    <span className="text-4xl font-extrabold text-gray-100 dark:text-slate-800 select-none">{step.num}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  {i < 2 && <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 dark:text-gray-700 hidden md:block" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
          Book: short soundbites, specific, with headshots
      ══════════════════════════════════════════ */}
      <section className="bg-[#1A2B1E] dark:bg-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">Real Stories</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Nigerians who hired without fear.</h2>
            <p className="text-white/45 text-sm">Real clients. Real skilled workers. Real results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { initial: "F", color: "#1D5C30", name: "Fatima A.", role: "Homeowner · Abuja", text: "I was sceptical about putting my money in escrow with a new platform. But after the electrician finished perfectly, I released payment with one click. I've never felt this safe hiring someone." },
              { initial: "K", color: "#7A3EA5", name: "Kelechi M.", role: "Property Developer · Port Harcourt", text: "The carpenter quoted me fairly, arrived on time, and built exactly what I asked for. EliteJob even followed up to make sure I was happy. That never happens with the usual way of hiring." },
              { initial: "E", color: "#2A6BA5", name: "Emmanuel O.", role: "Verified Plumber · Lagos", text: "As a skilled worker in Lagos, I used to worry every job whether I would get paid. Since joining EliteJob, every payment hits my account on time. My income has doubled in six months." },
            ].map(t => (
              <div key={t.name} className="bg-white/4 border border-white/8 rounded-2xl p-6">
                <div className="text-[#C9973A] text-sm mb-3">★★★★★</div>
                <p className="text-white/65 text-sm leading-relaxed italic mb-5">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: t.color }}>
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-white/38 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          OBJECTION HANDLING + SEO PARAGRAPH
          Book: overcome top 4 objections
      ══════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">About EliteJob</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Nigeria&apos;s Platform for Verified Skilled Workers
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-4">
            At EliteJob International we know you are the kind of person who wants to run a home or business without unnecessary stress. You need skilled professionals you can trust. The problem is that finding genuinely trustworthy skilled workers in Nigeria is difficult and risky — leaving you frustrated and powerless when things go wrong.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10">
            That is why we built EliteJob — Nigeria&apos;s first fully verified, escrow-protected skilled worker marketplace covering Abuja, Lagos, Port Harcourt, Kano, and beyond. Search our verified database, fund your job through secure escrow, and release payment only when you are completely satisfied.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              { q: "What if I'm not satisfied with the work?", a: "Our dispute resolution team will review your case and ensure you are fairly protected. You never lose money for substandard work." },
              { q: "Is my payment actually safe in escrow?", a: "Funds are held in a regulated account and can only be released by you — the client — after you confirm the job is done." },
              { q: "How do I know the verification is real?", a: "We manually verify every skilled worker's NIN, check references, and confirm trade credentials before approving their profile." },
              { q: "Are there hidden charges or fees?", a: "None. Browsing is free. There is a small, transparent platform fee only on successful job completion — nothing hidden." },
            ].map(obj => (
              <div key={obj.q} className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-start gap-2">
                  <span className="text-[#C9973A] mt-0.5 flex-shrink-0">💭</span> {obj.q}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{obj.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRICING — 2 tiers only (Priority removed)
          Book: spell out what they get
      ══════════════════════════════════════════ */}
      <section className="bg-[#FAF7F2] dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#C9973A] text-xs font-bold uppercase tracking-widest mb-3 block">Simple, Honest Pricing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
              Free to join. Only pay when the job gets done.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">No subscriptions. No hidden fees. Just fair and transparent pricing.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Client */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9973A] bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full inline-block mb-4">For Clients</span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">Browse &amp; Hire</h3>
              <div className="text-4xl font-extrabold text-[#1D5C30] dark:text-green-400 my-4 font-serif">Free</div>
              <p className="text-sm text-gray-400 mb-5">to browse, chat &amp; compare</p>
              <div className="flex flex-col gap-2 mb-6">
                {["Unlimited skilled worker browsing", "Direct chat before hiring", "Escrow on every payment", "Dispute resolution access"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/browse" className="block text-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold py-3 rounded-xl text-sm transition active:scale-95">
                Find a Skilled Worker →
              </Link>
            </div>
            {/* Artisan */}
            <div className="bg-[#0F1A12] dark:bg-slate-800 rounded-2xl p-7 border border-[#C9973A]/40">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9973A] bg-[#C9973A]/12 px-3 py-1 rounded-full inline-block mb-4">For Skilled Workers</span>
              <h3 className="text-xl font-extrabold text-white mb-1">Get Hired Faster</h3>
              <div className="text-4xl font-extrabold text-[#C9973A] my-4 font-serif">Free</div>
              <p className="text-sm text-white/40 mb-5">join free · small % on earnings only</p>
              <div className="flex flex-col gap-2 mb-6">
                {["Free verified profile", "Access to thousands of clients", "Guaranteed escrow payments", "Build your reputation with ratings"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/65">
                    <CheckCircle2 className="w-4 h-4 text-[#C9973A] flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/signup" className="block text-center bg-[#C9973A] hover:bg-[#E8B85A] text-[#0F1A12] font-bold py-3 rounded-xl text-sm transition active:scale-95">
                Join as a Skilled Worker →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SKILLED WORKER CTA
      ══════════════════════════════════════════ */}
      <section className="bg-[#1D5C30] dark:bg-green-900 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-white/55 text-xs font-bold uppercase tracking-widest mb-3 block">For Skilled Workers</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
          Are you a skilled worker?<br />Start earning more today.
        </h2>
        <p className="text-white/72 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Join 500+ verified skilled workers earning consistently and getting paid on time — every time. Set up your free profile in under 10 minutes.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1D5C30] font-bold px-8 py-3.5 rounded-xl text-base transition active:scale-95"
        >
          Join as a Verified Skilled Worker — It&apos;s Free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

    </main>
  );
}