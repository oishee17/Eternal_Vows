import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  QrCode,
  MapPin,
  TrendingUp,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  WeddingMeta,
} from '../../data/initialData';
import {
  Guest,
  ExpenseItem,
  Ceremony,
  VendorBid,
  WeddingTask,
} from '../../types/wedding';

interface CoupleDashboardProps {
  meta: WeddingMeta;
  guests: Guest[];
  expenses: ExpenseItem[];
  ceremonies: Ceremony[];
  bids: VendorBid[];
  tasks: WeddingTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (title: string, category: string, dueDate: string) => void;
  onNavigate: (section: string) => void;
  onOpenQR: () => void;
  onUpdateBidStatus: (bidId: string, status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected') => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({
  meta,
  guests,
  expenses,
  ceremonies,
  bids,
  tasks,
  onToggleTask,
  onAddTask,
  onNavigate,
  onOpenQR,
  onUpdateBidStatus,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Live Countdown calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date(meta.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [meta.weddingDate]);

  // Derived metrics
  const totalBudget = meta.totalBudget;
  const totalCommitted = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalBudget - totalCommitted;

  const totalGuests = guests.reduce((sum, g) => sum + g.partySize, 0);
  const confirmedGuests = guests
    .filter((g) => g.rsvp === 'attending')
    .reduce((sum, g) => sum + g.partySize, 0);
  const pendingGuests = guests
    .filter((g) => g.rsvp === 'pending' || g.rsvp === 'tentative')
    .reduce((sum, g) => sum + g.partySize, 0);
  const declinedGuests = guests
    .filter((g) => g.rsvp === 'declined')
    .reduce((sum, g) => sum + g.partySize, 0);

  const budgetPercent = Math.min(100, Math.round((totalCommitted / totalBudget) * 100));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), 'Planning', '2026-09-15');
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. WELCOME & COUNTDOWN BANNER */}
      <div className="bg-white rounded-3xl border border-[#E8DFD8] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#5A1E2D] bg-[#F8EFEA] px-3 py-1 rounded-full mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>Wedding Countdown • {meta.venueCity}, {meta.venueCountry}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#23211F] font-normal tracking-tight">
              {meta.partnerOne} & {meta.partnerTwo}
            </h1>
            <p className="text-sm text-[#7A6B65] mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>{meta.venueName}</span>
              <span>•</span>
              <span>{new Date(meta.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </p>
          </div>

          {/* Luxury Countdown Box */}
          <div className="bg-[#FAF8F5] border border-[#E5DAD1] rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-6 shadow-2xs self-start lg:self-auto">
            <div className="text-center">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#5A1E2D] block">
                {timeLeft.days}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">Days</span>
            </div>
            <span className="text-lg text-[#D4C3B5]">:</span>
            <div className="text-center">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#23211F] block">
                {timeLeft.hours}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">Hours</span>
            </div>
            <span className="text-lg text-[#D4C3B5]">:</span>
            <div className="text-center">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#23211F] block">
                {timeLeft.minutes}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">Mins</span>
            </div>
            <span className="text-lg text-[#D4C3B5]">:</span>
            <div className="text-center">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#23211F] block">
                {timeLeft.seconds}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE METRICS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget */}
        <div
          onClick={() => onNavigate('budget')}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DAD1] hover:border-[#5A1E2D] cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#8C7A72]">
            <span className="uppercase font-semibold tracking-wider">Remaining Budget</span>
            <DollarSign className="w-4 h-4 text-[#5A1E2D]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#5A1E2D] mt-2 font-normal">
            ${remainingBudget.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#7A6B65]">
            <span>${totalCommitted.toLocaleString()} committed</span>
            <span>of ${totalBudget.toLocaleString()}</span>
          </div>
          {/* Mini progress */}
          <div className="w-full h-1.5 bg-[#F0EAE3] rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${budgetPercent > 90 ? 'bg-amber-600' : 'bg-[#5A1E2D]'} rounded-full`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Confirmed Guests */}
        <div
          onClick={() => onNavigate('guests')}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DAD1] hover:border-[#5A1E2D] cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#8C7A72]">
            <span className="uppercase font-semibold tracking-wider">Confirmed Guests</span>
            <Users className="w-4 h-4 text-[#5A1E2D]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#23211F] mt-2 font-normal">
            {confirmedGuests} <span className="text-sm font-sans text-[#7A6B65]">/ {totalGuests}</span>
          </p>
          <div className="mt-2 text-[11px] text-[#7A6B65] flex items-center justify-between">
            <span className="text-amber-700 font-medium">{pendingGuests} pending RSVP</span>
            <span className="text-rose-700">{declinedGuests} declined</span>
          </div>
          <div className="w-full h-1.5 bg-[#F0EAE3] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-700 rounded-full"
              style={{ width: `${totalGuests ? (confirmedGuests / totalGuests) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Seating Arrangement */}
        <div
          onClick={() => onNavigate('seating')}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DAD1] hover:border-[#5A1E2D] cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#8C7A72]">
            <span className="uppercase font-semibold tracking-wider">Seating Planned</span>
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#23211F] mt-2 font-normal">
            {Math.ceil(confirmedGuests / 8)} <span className="text-sm font-sans text-[#7A6B65]">Tables Required</span>
          </p>
          <div className="mt-2 text-[11px] text-[#7A6B65] flex items-center justify-between">
            <span>6 Tables Active</span>
            <span className="text-[#5A1E2D] font-medium">Solver Ready</span>
          </div>
          <div className="w-full h-1.5 bg-[#F0EAE3] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#C5A880] rounded-full" style={{ width: '75%' }} />
          </div>
        </div>

        {/* Metric 4: Vendor Quotes */}
        <div
          onClick={() => onNavigate('marketplace')}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DAD1] hover:border-[#5A1E2D] cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between text-xs text-[#8C7A72]">
            <span className="uppercase font-semibold tracking-wider">Vendor Marketplace</span>
            <TrendingUp className="w-4 h-4 text-[#5A1E2D]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#23211F] mt-2 font-normal">
            {bids.length} <span className="text-sm font-sans text-[#7A6B65]">Proposals</span>
          </p>
          <div className="mt-2 text-[11px] text-[#7A6B65] flex items-center justify-between">
            <span className="text-emerald-700 font-medium">
              {bids.filter((b) => b.status === 'accepted').length} Accepted
            </span>
            <span className="text-[#5A1E2D]">Compare side-by-side</span>
          </div>
          <div className="w-full h-1.5 bg-[#F0EAE3] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </div>

      {/* 3. SPLIT WORKSPACE: AGENDA & TASKS */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Scheduled Ceremonies (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-6 border-b border-[#F0EAE3]">
            <div>
              <h3 className="font-serif text-2xl text-[#23211F]">Ceremonies & Event Timeline</h3>
              <p className="text-xs text-[#7A6B65]">3-day celebrations across Lake Como venues.</p>
            </div>
            <button
              onClick={() => onNavigate('itinerary')}
              className="text-xs font-semibold text-[#5A1E2D] flex items-center gap-1 hover:underline"
            >
              <span>Manage Itinerary</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {ceremonies.slice(0, 4).map((c, idx) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE2D8] hover:border-[#D4C3B5] transition flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5DAD1] flex flex-col items-center justify-center shrink-0 text-center">
                  <span className="text-[9px] uppercase font-bold text-[#5A1E2D]">
                    {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xs font-bold text-[#23211F]">
                    {new Date(c.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif text-base text-[#23211F] font-medium truncate">
                      {c.title}
                    </h4>
                    <span className="text-[11px] font-mono text-[#7A6B65] shrink-0">
                      {c.startTime} – {c.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-[#6D5D55] mt-0.5 truncate">{c.venue}</p>
                  <p className="text-[11px] text-[#8C7A72] mt-1 italic">Dress Code: {c.dressCode}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EAE3] flex items-center justify-between">
            <span className="text-xs text-[#7A6B65]">Want custom notifications for each guest tier?</span>
            <button
              onClick={() => onNavigate('itinerary')}
              className="text-xs font-semibold text-[#5A1E2D] hover:underline"
            >
              Compose WhatsApp Updates →
            </button>
          </div>
        </div>

        {/* Right Column: Pending Tasks & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#F0EAE3]">
              <div>
                <h3 className="font-serif text-2xl text-[#23211F]">Studio Checklist</h3>
                <p className="text-xs text-[#7A6B65]">Prioritized planning milestones.</p>
              </div>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="p-1.5 text-[#5A1E2D] hover:bg-[#FAF8F5] rounded-full border border-[#D9C3B0]"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Inline add task input */}
            {showAddTask && (
              <form onSubmit={handleCreateTask} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Schedule final dress fitting"
                  className="flex-1 text-xs border border-[#D9C3B0] rounded-xl px-3 py-2 bg-[#FAF8F5] focus:outline-hidden focus:border-[#5A1E2D]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#5A1E2D] text-white px-3 py-2 rounded-xl text-xs font-medium hover:bg-[#471522]"
                >
                  Save
                </button>
              </form>
            )}

            <div className="mt-6 space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTask(task.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    task.completed
                      ? 'bg-[#FAF8F5] border-[#E8DFD8] text-[#8C7A72]'
                      : 'bg-white border-[#E5DAD1] hover:border-[#C5A880] text-[#23211F]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      task.completed
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'border-[#C5A880] bg-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${task.completed ? 'line-through text-[#8C7A72]' : ''}`}>
                      {task.title}
                    </p>
                    <span className="text-[10px] text-[#8C7A72] block">
                      Due: {task.dueDate} • {task.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Studio Tools */}
          <div className="mt-8 pt-6 border-t border-[#F0EAE3] space-y-2">
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">
              Quick Studio Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenQR}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DAD1] hover:border-[#5A1E2D] text-left transition"
              >
                <QrCode className="w-4 h-4 text-[#5A1E2D] mb-1" />
                <span className="text-xs font-medium text-[#23211F] block">Table Standee QR</span>
                <span className="text-[10px] text-[#8C7A72]">Print reception signs</span>
              </button>
              <button
                onClick={() => onNavigate('assistant')}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DAD1] hover:border-[#5A1E2D] text-left transition"
              >
                <Sparkles className="w-4 h-4 text-[#C5A880] mb-1" />
                <span className="text-xs font-medium text-[#23211F] block">AI Studio Query</span>
                <span className="text-[10px] text-[#8C7A72]">Grounded calculations</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT VENDOR BIDS QUICK REVIEW */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <h3 className="font-serif text-2xl text-[#23211F]">Recently Received Vendor Quotations</h3>
            <p className="text-xs text-[#7A6B65]">
              Competitive bids submitted by verified regional wedding artisans.
            </p>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="bg-[#FAF8F5] border border-[#D9C3B0] text-[#4A3B32] hover:bg-[#F5EFE9] px-4 py-2 rounded-full text-xs font-medium transition self-start sm:self-auto"
          >
            Open Bidding Comparison Matrix →
          </button>
        </div>

        <div className="mt-6 divide-y divide-[#F0EAE3]">
          {bids.slice(0, 3).map((b) => (
            <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-lg text-[#23211F] font-medium">{b.vendorName}</h4>
                  <span className="text-[10px] uppercase font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ★ {b.vendorRating} Verified
                  </span>
                </div>
                <p className="text-xs text-[#7A6B65]">{b.category} • {b.deliveryTimeline}</p>
                <p className="text-xs text-[#4A3B32] line-clamp-1">{b.includedServices[0]}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-[#8C7A72] block">Quoted Amount</span>
                  <span className="font-serif text-2xl text-[#5A1E2D] font-normal">
                    ${b.proposedPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'accepted' ? (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Accepted
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpdateBidStatus(b.id, 'accepted')}
                      className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-4 py-2 rounded-full text-xs font-medium transition"
                    >
                      Accept Quote
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
