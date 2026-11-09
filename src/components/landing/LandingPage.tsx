import React from 'react';
import {
  Users,
  Camera,
  DollarSign,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
  ChevronRight,
  Check,
  QrCode,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (section: string) => void;
  onOpenQR: () => void;
  totalBudget: number;
  remainingBudget: number;
  confirmedGuests: number;
  pendingGuests: number;
  activeBidsCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenQR,
  totalBudget,
  remainingBudget,
  confirmedGuests,
  pendingGuests,
  activeBidsCount,
}) => {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative px-6 lg:px-16 pt-12 md:pt-20 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D9C3B0] bg-[#F4EFEA]/80 text-xs font-medium text-[#654B3E] mb-8 shadow-xs">
          <span className="font-semibold bg-[#E8DDD1] px-2.5 py-0.5 rounded-full text-[11px] text-[#4A3227]">
            Wedding technology, done quietly
          </span>
          <span className="text-[#A39288]">•</span>
          <span className="tracking-wider">PLANNING</span>
          <span className="text-[#A39288]">•</span>
          <span className="tracking-wider">ALBUM</span>
          <span className="text-[#A39288]">•</span>
          <span className="tracking-wider">MARKETPLACE</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#23211F] font-normal tracking-tight leading-[1.08] max-w-4xl">
          The whole wedding, <br className="hidden sm:block" />
          in one <span className="italic font-serif text-[#5A1E2D]">calm</span> place.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-8 text-base sm:text-lg md:text-xl text-[#6D635D] max-w-2xl font-light leading-relaxed">
          From the first guest list to the last photograph, Eternal Vows holds the details so you can hold the moment. An intelligent planning studio, a collaborative album, and a fair vendor marketplace — connected, not scattered.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-[#5A1E2D] hover:bg-[#471522] text-[#FAF8F5] px-8 py-4 rounded-full text-sm font-medium tracking-wide transition flex items-center gap-2 shadow-sm"
          >
            <span>Enter Planner Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('marketplace')}
            className="bg-white border border-[#D5C7BD] text-[#3E3430] hover:bg-[#F5EFE9] px-7 py-4 rounded-full text-sm font-medium tracking-wide transition shadow-xs"
          >
            Explore Vendor Marketplace
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs text-[#7B706A]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#94786A]" />
            <span>Private by default with token security</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#94786A]" />
            <span>AI with real wedding records only</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#94786A]" />
            <span>Built for couples, planners & guests</span>
          </div>
        </div>

        {/* Live Snapshot Strip */}
        <div className="mt-12 w-full max-w-4xl bg-white/80 border border-[#E8DFD8] rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-xs text-left">
          <div className="border-r border-[#F0EAE3] pr-3">
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">Live Budget</span>
            <span className="font-serif text-2xl text-[#5A1E2D] font-medium">${remainingBudget.toLocaleString()}</span>
            <span className="text-[11px] text-[#7A6B65] block">remaining of ${totalBudget.toLocaleString()}</span>
          </div>
          <div className="border-r border-[#F0EAE3] pr-3">
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">RSVP Status</span>
            <span className="font-serif text-2xl text-[#23211F] font-medium">{confirmedGuests} Confirmed</span>
            <span className="text-[11px] text-[#7A6B65] block">{pendingGuests} pending responses</span>
          </div>
          <div className="border-r border-[#F0EAE3] pr-3">
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">Vendor Bids</span>
            <span className="font-serif text-2xl text-[#23211F] font-medium">{activeBidsCount} Quotes</span>
            <span className="text-[11px] text-[#7A6B65] block">standardized itemized format</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">Venue Album</span>
            <button
              onClick={onOpenQR}
              className="text-xs font-semibold text-[#5A1E2D] flex items-center gap-1 mt-1 hover:underline"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Show QR Standee</span>
            </button>
            <span className="text-[11px] text-[#7A6B65] block">zero-app guest uploads</span>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS SHOWCASE */}
      <section className="bg-[#F4EFEA] border-t border-b border-[#E8DFD8] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C7A72] font-semibold">
              The Connected Ecosystem
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#23211F] mt-2">
              Planning is easier when nothing lives in a different place.
            </h2>
            <p className="mt-4 text-[#6D635D] text-base leading-relaxed">
              Every module shares the same wedding record. Accepting a vendor quotation writes the expense directly into your budget; changing a ceremony updates the guest itinerary; the album knows which ceremony each photograph belongs to.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E3D7CE] shadow-xs hover:border-[#C5A880] transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E3D7CE] flex items-center justify-center text-[#5A1E2D] mb-6 shadow-2xs">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9C8B82] font-semibold">
                  01 / Intelligent Planning
                </span>
                <h3 className="font-serif text-2xl text-[#23211F] mt-2 mb-3">
                  Studio & Seating Engine
                </h3>
                <p className="text-sm text-[#6D635D] leading-relaxed mb-6">
                  CSV guest import, personalized RSVP web invitations, real-time expenditure variance, and constraint-aware automated seating charts that avoid drama.
                </p>
                <ul className="space-y-2 text-xs text-[#55463E] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Live budget breakdown & alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>WhatsApp invitation link generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Family & VIP seating optimization</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('seating')}
                className="text-xs font-semibold text-[#5A1E2D] flex items-center gap-1 group hover:underline"
              >
                <span>Explore Seating Planner</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </button>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E3D7CE] shadow-xs hover:border-[#C5A880] transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E3D7CE] flex items-center justify-center text-[#5A1E2D] mb-6 shadow-2xs">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9C8B82] font-semibold">
                  02 / Shared Memories
                </span>
                <h3 className="font-serif text-2xl text-[#23211F] mt-2 mb-3">
                  Live Collaborative Album
                </h3>
                <p className="text-sm text-[#6D635D] leading-relaxed mb-6">
                  Zero-app guest uploads via printed venue QR codes. Vision AI automatically categorizes photos for ceremonies, couple portraits, food, and candid table moments.
                </p>
                <ul className="space-y-2 text-xs text-[#55463E] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Instant camera & video uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Automatic category tagging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Fullscreen ambient slideshow mode</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('album')}
                className="text-xs font-semibold text-[#5A1E2D] flex items-center gap-1 group hover:underline"
              >
                <span>View Live Album</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </button>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E3D7CE] shadow-xs hover:border-[#C5A880] transition flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E3D7CE] flex items-center justify-center text-[#5A1E2D] mb-6 shadow-2xs">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9C8B82] font-semibold">
                  03 / Transparent Procurement
                </span>
                <h3 className="font-serif text-2xl text-[#23211F] mt-2 mb-3">
                  Fair Bidding Marketplace
                </h3>
                <p className="text-sm text-[#6D635D] leading-relaxed mb-6">
                  Post requirements once. Receive standardized itemized quotations from verified artisans with side-by-side comparison and zero secret markups.
                </p>
                <ul className="space-y-2 text-xs text-[#55463E] mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Itemized deliverables breakdown</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Auto-sync accepted bids into ledger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>Direct couple-vendor messaging</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('marketplace')}
                className="text-xs font-semibold text-[#5A1E2D] flex items-center gap-1 group hover:underline"
              >
                <span>Review Quotations</span>
                <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GROUNDED ASSISTANT HIGHLIGHT (Screenshot 3 alignment) */}
      <section className="bg-[#4A1521] text-[#FAF8F5] py-20 px-6 lg:px-16 mx-4 sm:mx-8 rounded-3xl shadow-xl">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#D8B4A6] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE ASSISTANT</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-tight">
            It reads your wedding. <br />
            Not the internet’s.
          </h2>

          <p className="mt-6 text-[#D8CBC4] text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            Ask how much is left after the venue deposit, how many tables your confirmed guests need, or which photographers start within your budget. Answers are grounded in your saved records. If a question needs data you have not added, it says so.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl text-xs sm:text-sm text-[#EADBD5] my-10">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#5D1F2D] flex items-center justify-center text-[#D8B4A6] shrink-0 font-medium">
                ✓
              </div>
              <span>Budget splits benchmarked against real allocations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#5D1F2D] flex items-center justify-center text-[#D8B4A6] shrink-0 font-medium">
                ✓
              </div>
              <span>Vendor suggestions ranked from the live marketplace</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#5D1F2D] flex items-center justify-center text-[#D8B4A6] shrink-0 font-medium">
                ✓
              </div>
              <span>Seating and itinerary logic that respects your rules</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#5D1F2D] flex items-center justify-center text-[#D8B4A6] shrink-0 font-medium">
                ✓
              </div>
              <span>No invented bookings, payments, or availability</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('assistant')}
              className="bg-[#D9C3B0] text-[#2C181D] hover:bg-[#E5D4C5] font-semibold px-8 py-3.5 rounded-full text-xs sm:text-sm transition flex items-center gap-2 shadow-sm"
            >
              <span>Ask it something</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#D8B4A6]">
              Powered by server-side Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </section>

      {/* 4. FOOTER NOTE */}
      <section className="text-center max-w-2xl mx-auto px-6 pt-4">
        <h4 className="font-serif text-2xl text-[#23211F]">
          "We wanted our guests to be present, our budget transparent, and our memories captured."
        </h4>
        <p className="text-xs text-[#7A6B65] mt-2">
          Julian Vance & Evelyn Montgomery • Celebrating at Villa del Balbianello
        </p>
      </section>
    </div>
  );
};
