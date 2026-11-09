import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Check,
  Star,
  Shield,
  MessageCircle,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Send,
  X,
  ChevronRight,
  ExternalLink,
  Briefcase,
} from 'lucide-react';
import {
  VendorProfile,
  ServiceRequirement,
  VendorBid,
  VendorCategory,
  VendorMessage,
} from '../../types/wedding';

interface VendorMarketplaceProps {
  vendors: VendorProfile[];
  requirements: ServiceRequirement[];
  bids: VendorBid[];
  messages: VendorMessage[];
  onAddRequirement: (req: Omit<ServiceRequirement, 'id' | 'createdAt' | 'status'>) => void;
  onSubmitBid: (bid: Omit<VendorBid, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateBidStatus: (bidId: string, status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected') => void;
  onSendMessage: (bidId: string, text: string, sender: 'couple' | 'vendor') => void;
  activeRole: string;
}

export const VendorMarketplace: React.FC<VendorMarketplaceProps> = ({
  vendors,
  requirements,
  bids,
  messages,
  onAddRequirement,
  onSubmitBid,
  onUpdateBidStatus,
  onSendMessage,
  activeRole,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRequirementId, setSelectedRequirementId] = useState<string>(requirements[0]?.id || '');
  const [showRequirementModal, setShowRequirementModal] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [activeChatBidId, setActiveChatBidId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>('');

  // Requirement Form State
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState<VendorCategory>('Photography');
  const [reqDate, setReqDate] = useState('2026-10-14');
  const [reqLocation, setReqLocation] = useState('Villa del Balbianello, Lake Como');
  const [reqMinBudget, setReqMinBudget] = useState('5000');
  const [reqMaxBudget, setReqMaxBudget] = useState('8000');
  const [reqDuration, setReqDuration] = useState('2 Days Coverage');
  const [reqDeliverables, setReqDeliverables] = useState('');
  const [reqSpecial, setReqSpecial] = useState('');

  // Vendor Bid Form State
  const [bidVendorName, setBidVendorName] = useState('Lumière Fine Art Cinematography');
  const [bidPrice, setBidPrice] = useState('6500');
  const [bidServices, setBidServices] = useState('');
  const [bidTimeline, setBidTimeline] = useState('Teaser in 72 hours; Full gallery in 4 weeks');
  const [bidTerms, setBidTerms] = useState('50% deposit on contract signing');

  const categories: Array<VendorCategory | 'All'> = [
    'All',
    'Photography',
    'Videography',
    'Decoration & Florals',
    'Catering',
    'Entertainment & Music',
    'Transportation',
    'Wedding Venues',
    'Makeup & Styling',
  ];

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    onAddRequirement({
      title: reqTitle.trim(),
      category: reqCategory,
      eventDate: reqDate,
      eventLocation: reqLocation,
      budgetMin: parseFloat(reqMinBudget) || 0,
      budgetMax: parseFloat(reqMaxBudget) || 0,
      duration: reqDuration,
      deliverables: reqDeliverables,
      specialRequirements: reqSpecial,
    });

    setReqTitle('');
    setShowRequirementModal(false);
  };

  const handleCreateBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidPrice) return;

    const matchedVendor = vendors.find((v) => v.businessName === bidVendorName) || vendors[0];
    const matchedReq = requirements.find((r) => r.id === selectedRequirementId) || requirements[0];

    onSubmitBid({
      requirementId: matchedReq.id,
      vendorId: matchedVendor.id,
      vendorName: matchedVendor.businessName,
      vendorRating: matchedVendor.rating,
      vendorVerified: matchedVendor.isVerified,
      category: matchedReq.category,
      proposedPrice: parseFloat(bidPrice) || 0,
      includedServices: bidServices
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      deliveryTimeline: bidTimeline,
      terms: bidTerms,
    });

    setShowBidModal(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatBidId) return;
    onSendMessage(activeChatBidId, chatInput.trim(), activeRole === 'vendor' ? 'vendor' : 'couple');
    setChatInput('');
  };

  // Bids for currently focused requirement
  const currentReq = requirements.find((r) => r.id === selectedRequirementId) || requirements[0];
  const bidsForCurrentReq = bids.filter((b) => b.requirementId === currentReq?.id);

  // Active chat details
  const activeBidForChat = bids.find((b) => b.id === activeChatBidId);
  const activeChatMessages = messages.filter((m) => m.bidId === activeChatBidId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Competitive Bidding & Quotation System</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Vendor Marketplace & Side-by-Side Bids
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Post service requirements, receive itemized proposals, compare side-by-side, and auto-sync accepted contracts into your ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeRole === 'vendor' ? (
              <button
                onClick={() => setShowBidModal(true)}
                className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Quotation Bid</span>
              </button>
            ) : (
              <button
                onClick={() => setShowRequirementModal(true)}
                className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Service Requirement</span>
              </button>
            )}
          </div>
        </div>

        {/* Requirements Selection Tabs */}
        <div className="mt-6">
          <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block mb-2">
            Active Wedding Requirements:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {requirements.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequirementId(req.id)}
                className={`p-3 rounded-2xl border text-left text-xs transition min-w-[240px] shrink-0 ${
                  selectedRequirementId === req.id
                    ? 'border-[#5A1E2D] bg-[#FAF1EE] shadow-2xs'
                    : 'border-[#E5DAD1] bg-[#FAF8F5] hover:border-[#C5A880]'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#5A1E2D] block">
                  {req.category}
                </span>
                <span className="font-serif text-sm text-[#23211F] font-medium block truncate mt-0.5">
                  {req.title}
                </span>
                <span className="text-[11px] text-[#7A6B65] block mt-1">
                  Budget: ${req.budgetMin.toLocaleString()} – ${req.budgetMax.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SIDE-BY-SIDE BID COMPARISON MATRIX (Module 5.3 specification) */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">
              Selected Requirement Scope
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-0.5">{currentReq?.title}</h3>
            <p className="text-xs text-[#7A6B65] mt-1">
              Event Date: {currentReq?.eventDate} • Location: {currentReq?.eventLocation} • Target: ${currentReq?.budgetMin.toLocaleString()}–${currentReq?.budgetMax.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF8F5] text-[#5A1E2D] border border-[#E5DAD1]">
              {bidsForCurrentReq.length} Quotations Received
            </span>
          </div>
        </div>

        {/* Side by Side Cards Grid */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bidsForCurrentReq.map((bid) => {
            const isAccepted = bid.status === 'accepted';
            const isShortlisted = bid.status === 'shortlisted';

            return (
              <div
                key={bid.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition ${
                  isAccepted
                    ? 'border-emerald-500 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                    : isShortlisted
                    ? 'border-[#C5A880] bg-[#FAF8F5]'
                    : 'border-[#E5DAD1] bg-white hover:border-[#C5A880]'
                }`}
              >
                <div>
                  {/* Top Vendor Status */}
                  <div className="flex items-start justify-between gap-2 pb-4 border-b border-[#F0EAE3]">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif text-xl text-[#23211F] font-medium">{bid.vendorName}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#7A6B65] mt-0.5">
                        <span className="text-amber-700 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {bid.vendorRating}
                        </span>
                        <span>•</span>
                        {bid.vendorVerified && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            Verified Artisan
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#8C7A72] block">
                        Quoted Total
                      </span>
                      <span className="font-serif text-2xl text-[#5A1E2D] font-normal">
                        ${bid.proposedPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Included Deliverables */}
                  <div className="py-4 space-y-2 border-b border-[#F0EAE3]">
                    <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">
                      Services Included in Quotation:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#4A3B32]">
                      {bid.includedServices.map((srv, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span className="leading-snug">{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Timeline & Terms */}
                  <div className="py-3 text-[11px] text-[#7A6B65] space-y-1">
                    <div>
                      <strong className="text-[#23211F]">Timeline:</strong> {bid.deliveryTimeline}
                    </div>
                    <div>
                      <strong className="text-[#23211F]">Terms:</strong> {bid.terms}
                    </div>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="mt-6 pt-4 border-t border-[#F0EAE3] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveChatBidId(bid.id)}
                      className="flex-1 border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] py-2 rounded-full text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#5A1E2D]" />
                      <span>Direct Message</span>
                    </button>

                    {isAccepted ? (
                      <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Accepted
                      </div>
                    ) : (
                      <button
                        onClick={() => onUpdateBidStatus(bid.id, 'accepted')}
                        className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-4 py-2 rounded-full text-xs font-medium transition shadow-xs"
                      >
                        Accept Bid
                      </button>
                    )}
                  </div>

                  {!isAccepted && (
                    <div className="flex justify-between text-[11px] text-[#8C7A72] px-1">
                      <button
                        onClick={() => onUpdateBidStatus(bid.id, 'shortlisted')}
                        className="hover:text-[#5A1E2D] underline"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => onUpdateBidStatus(bid.id, 'rejected')}
                        className="hover:text-rose-700 underline"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {bidsForCurrentReq.length === 0 && (
          <div className="p-12 text-center text-xs text-[#8C7A72] italic">
            No bids submitted for this requirement yet. Vendors can submit proposals using the "Submit Quotation Bid" button.
          </div>
        )}
      </div>

      {/* 3. VERIFIED VENDOR DIRECTORY */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <h3 className="font-serif text-2xl text-[#23211F]">Verified Artisan Directory</h3>
            <p className="text-xs text-[#7A6B65]">
              Handpicked Lake Como regional specialists with transparent starting rates.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs transition ${
                  selectedCategory === cat
                    ? 'bg-[#5A1E2D] text-white'
                    : 'bg-[#FAF8F5] text-[#4A3B32] border border-[#E5DAD1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vendors
            .filter((v) => selectedCategory === 'All' || v.category === selectedCategory)
            .map((vendor) => (
              <div
                key={vendor.id}
                className="rounded-2xl border border-[#E5DAD1] bg-[#FAF8F5] overflow-hidden flex flex-col justify-between hover:border-[#C5A880] transition shadow-2xs"
              >
                <div className="aspect-16/10 overflow-hidden bg-gray-200">
                  <img
                    src={vendor.portfolio[0]}
                    alt={vendor.businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#5A1E2D]">
                        {vendor.category}
                      </span>
                      <span className="text-xs font-bold text-amber-700">★ {vendor.rating}</span>
                    </div>
                    <h4 className="font-serif text-lg text-[#23211F] font-medium mt-1">
                      {vendor.businessName}
                    </h4>
                    <p className="text-xs text-[#6D5D55] line-clamp-2 mt-1">{vendor.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EDE2D8] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#8C7A72] block">Starting Price</span>
                      <span className="font-serif font-bold text-[#23211F]">
                        ${vendor.startingPrice.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 4. CHAT DRAWER: COUPLE & VENDOR DIRECT IN-APP MESSAGING */}
      {activeChatBidId && activeBidForChat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative flex flex-col h-[520px]">
            <button
              onClick={() => setActiveChatBidId(null)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Chat Header */}
            <div className="pb-4 border-b border-[#E8DFD8]">
              <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">
                Direct Communication Channel
              </span>
              <h3 className="font-serif text-2xl text-[#23211F] mt-0.5">
                {activeBidForChat.vendorName}
              </h3>
              <p className="text-xs text-[#7A6B65]">
                Quoted: ${activeBidForChat.proposedPrice.toLocaleString()} for {activeBidForChat.category}
              </p>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {activeChatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    (m.sender === 'couple' && activeRole !== 'vendor') || (m.sender === 'vendor' && activeRole === 'vendor')
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  <span className="text-[9px] text-[#8C7A72] mb-0.5">{m.senderName}</span>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      (m.sender === 'couple' && activeRole !== 'vendor') || (m.sender === 'vendor' && activeRole === 'vendor')
                        ? 'bg-[#5A1E2D] text-white'
                        : 'bg-white border border-[#E5DAD1] text-[#23211F]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[8px] text-[#A39288] mt-0.5">{m.timestamp}</span>
                </div>
              ))}
              {activeChatMessages.length === 0 && (
                <div className="text-center text-xs text-[#8C7A72] italic py-8">
                  No messages yet. Send a note to discuss customized timeline and deliverables.
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-[#E8DFD8] flex gap-2">
              <input
                type="text"
                placeholder="Type message regarding requirements or dates..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs border border-[#D9C3B0] rounded-full px-4 py-2.5 bg-white focus:outline-hidden focus:border-[#5A1E2D]"
              />
              <button
                type="submit"
                className="bg-[#5A1E2D] hover:bg-[#471522] text-white p-2.5 rounded-full transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: POST NEW SERVICE REQUIREMENT */}
      {showRequirementModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative my-8">
            <button
              onClick={() => setShowRequirementModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Procurement Request
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Post Wedding Service Requirement
            </h3>

            <form onSubmit={handleCreateRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Requirement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Course Lake Como Banquet & Sommelier Selection"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Category</label>
                  <select
                    value={reqCategory}
                    onChange={(e) => setReqCategory(e.target.value as VendorCategory)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Min Budget ($)</label>
                  <input
                    type="number"
                    value={reqMinBudget}
                    onChange={(e) => setReqMinBudget(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Max Budget ($)</label>
                  <input
                    type="number"
                    value={reqMaxBudget}
                    onChange={(e) => setReqMaxBudget(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Expected Deliverables</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail exact items: e.g. 2 shooters, drone aerials, raw files, teaser..."
                  value={reqDeliverables}
                  onChange={(e) => setReqDeliverables(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Special Venue Restrictions</label>
                <input
                  type="text"
                  placeholder="e.g. Balbianello sound ordinances past midnight"
                  value={reqSpecial}
                  onChange={(e) => setReqSpecial(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequirementModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Post Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: VENDOR SUBMIT QUOTATION BID */}
      {showBidModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setShowBidModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Quotation Submission
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Submit Quotation for {currentReq?.title}
            </h3>

            <form onSubmit={handleCreateBid} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Your Business Name</label>
                <input
                  type="text"
                  required
                  value={bidVendorName}
                  onChange={(e) => setBidVendorName(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Total Proposed Price ($)</label>
                  <input
                    type="number"
                    required
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Delivery Timeline</label>
                  <input
                    type="text"
                    required
                    value={bidTimeline}
                    onChange={(e) => setBidTimeline(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">
                  Itemized Scope of Services (one per line)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="2 Master Shooters&#10;Full Day Drone Flight Coverage&#10;800 High-Res Edited Images"
                  value={bidServices}
                  onChange={(e) => setBidServices(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={bidTerms}
                  onChange={(e) => setBidTerms(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Submit Official Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
