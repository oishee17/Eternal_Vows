import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  MessageCircle,
  Plus,
  Share2,
  Copy,
  Check,
  X,
  Edit2,
  Trash2,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Ceremony, GuestCategory } from '../../types/wedding';
import { generatePersonalizedItinerary } from '../../services/aiService';

interface ItineraryPlannerProps {
  ceremonies: Ceremony[];
  onAddCeremony: (ceremony: Omit<Ceremony, 'id'>) => void;
  onDeleteCeremony: (ceremonyId: string) => void;
  weddingTitle: string;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  ceremonies,
  onAddCeremony,
  onDeleteCeremony,
  weddingTitle,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryForAI, setSelectedCategoryForAI] = useState<GuestCategory>('Friends');
  const [guestNameForAI, setGuestNameForAI] = useState('Sophia Sterling');
  const [aiGeneratedMessage, setAiGeneratedMessage] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Ceremony Form State
  const [formData, setFormData] = useState<Omit<Ceremony, 'id'>>({
    title: '',
    date: '2026-10-14',
    startTime: '16:00',
    endTime: '18:00',
    venue: '',
    location: 'Lake Como, Italy',
    dressCode: 'Black Tie Optional',
    description: '',
    specialInstructions: '',
    audienceFilter: 'all',
  });

  const handleGenerateAIItinerary = async () => {
    setIsGeneratingAI(true);
    try {
      const msg = await generatePersonalizedItinerary(
        selectedCategoryForAI,
        guestNameForAI,
        ceremonies
      );
      setAiGeneratedMessage(msg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(aiGeneratedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppSend = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(aiGeneratedMessage)}`;
    window.open(url, '_blank');
  };

  const handleSaveCeremony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAddCeremony(formData);
    setShowAddModal(false);
    setFormData({
      title: '',
      date: '2026-10-14',
      startTime: '16:00',
      endTime: '18:00',
      venue: '',
      location: 'Lake Como, Italy',
      dressCode: 'Black Tie Optional',
      description: '',
      specialInstructions: '',
      audienceFilter: 'all',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Multi-Day Event Program</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Wedding Itinerary & Ceremony Schedules
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Curate schedules, venue logistics, dress codes, and dispatch AI-personalized WhatsApp updates to guests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ceremony / Event</span>
            </button>
          </div>
        </div>

        {/* 2. AI PERSONALIZED ITINERARY COMPOSER (Module 3.5 specification) */}
        <div className="mt-8 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <h3 className="font-serif text-lg text-[#23211F] font-medium">
                AI Personalized WhatsApp Schedule Dispatcher
              </h3>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider">
              Gemini Powered
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                Guest Category
              </label>
              <select
                value={selectedCategoryForAI}
                onChange={(e) => setSelectedCategoryForAI(e.target.value as GuestCategory)}
                className="w-full text-xs border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
              >
                <option value="Family">Immediate Family (Photos & Bridal Suite Call)</option>
                <option value="VIP">VIP Guests (Chauffeur & Front-row Reserve)</option>
                <option value="Friends">Friends (Cocktails, Party & Boat Tour)</option>
                <option value="Colleagues">Colleagues</option>
                <option value="Relatives">Out-of-Town Relatives (Hospitality & Shuttles)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4A3B32] mb-1">
                Example Guest Name
              </label>
              <input
                type="text"
                value={guestNameForAI}
                onChange={(e) => setGuestNameForAI(e.target.value)}
                placeholder="e.g. Sophia Sterling"
                className="w-full text-xs border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateAIItinerary}
                disabled={isGeneratingAI}
                className="w-full bg-[#5A1E2D] hover:bg-[#471522] text-white py-2 px-4 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{isGeneratingAI ? 'Composing...' : 'Generate Personalized Update'}</span>
              </button>
            </div>
          </div>

          {/* AI Output Box */}
          {aiGeneratedMessage && (
            <div className="p-4 rounded-xl bg-white border border-[#EDE2D8] mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider">
                  Generated WhatsApp Message Preview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMessage}
                    className="text-xs text-[#5A1E2D] hover:underline flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleWhatsAppSend}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#23211F] whitespace-pre-line leading-relaxed font-sans">
                {aiGeneratedMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. CEREMONIES TIMELINE CARDS */}
      <div className="space-y-6">
        {ceremonies.map((c, idx) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:border-[#C5A880] transition"
          >
            <div className="flex items-start gap-4 sm:gap-6 flex-1">
              {/* Date Box */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1] flex flex-col items-center justify-center shrink-0 text-center shadow-2xs">
                <span className="text-[10px] sm:text-xs font-bold text-[#5A1E2D] uppercase">
                  {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[#23211F]">
                  {new Date(c.date).getDate()}
                </span>
                <span className="text-[9px] text-[#8C7A72]">
                  {new Date(c.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>

              {/* Ceremony Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-2xl text-[#23211F]">{c.title}</h3>
                  <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF1EE] text-[#5A1E2D] border border-[#E5DAD1]">
                    {c.audienceFilter === 'all' ? 'All Guests' : c.audienceFilter}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A6B65]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>{c.startTime} – {c.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5A1E2D]" />
                    <span>{c.venue}, {c.location}</span>
                  </div>
                </div>

                <p className="text-xs text-[#4A3B32] leading-relaxed pt-1">
                  {c.description}
                </p>

                {c.specialInstructions && (
                  <div className="text-[11px] bg-[#FAF8F5] p-3 rounded-xl border border-[#EDE2D8] text-[#6D5D55]">
                    <strong>Special Instructions:</strong> {c.specialInstructions}
                  </div>
                )}

                <div className="text-xs text-[#8C7A72]">
                  <span className="font-semibold text-[#23211F]">Dress Code:</span> {c.dressCode}
                </div>
              </div>
            </div>

            <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#F0EAE3]">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Wedding Itinerary Update: ${c.title} on ${c.date} (${c.startTime} - ${c.endTime}) at ${c.venue}. Dress code: ${c.dressCode}. ${c.specialInstructions || ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full border border-[#D9C3B0] bg-[#FAF8F5] hover:bg-[#F5EFE9] text-xs font-medium text-[#4A3B32] flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Share Update</span>
              </a>

              <button
                onClick={() => onDeleteCeremony(c.id)}
                className="p-2 text-[#8C7A72] hover:text-rose-700 hover:bg-rose-50 rounded-full transition"
                title="Delete ceremony"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODAL: ADD CEREMONY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Program Schedule
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Add Ceremony or Event
            </h3>

            <form onSubmit={handleSaveCeremony} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Ceremony Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sangeet & Musical Night"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#5A1E2D]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Venue Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Villa Monastero"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Location / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Varenna, Lake Como"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Dress Code</label>
                <input
                  type="text"
                  placeholder="e.g. Formal Gala / Indian Traditional"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of the event celebration..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Special Instructions (Transport, Shuttles, etc.)</label>
                <input
                  type="text"
                  placeholder="e.g. Riva boat departure at 17:00 from Bellagio dock"
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Save Ceremony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
