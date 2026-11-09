import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageCircle,
  Plus,
  Shield,
  LifeBuoy,
  Check,
  X,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { RunSheetItem } from '../../types/wedding';

interface RunSheetTimelineProps {
  items: RunSheetItem[];
  onToggleComplete: (itemId: string) => void;
  onAddItem: (item: Omit<RunSheetItem, 'id' | 'isCompleted'>) => void;
  weddingDate: string;
  venueName: string;
}

export const RunSheetTimeline: React.FC<RunSheetTimelineProps> = ({
  items,
  onToggleComplete,
  onAddItem,
  weddingDate,
  venueName,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'All' | 'critical' | 'standard'>('All');

  // Form State
  const [time, setTime] = useState('16:00');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Balbianello Loggia');
  const [leadPerson, setLeadPerson] = useState('Wedding Coordinator');
  const [vendorContact, setVendorContact] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'critical' | 'standard'>('standard');

  const emergencyKitItems = [
    { title: 'Emergency Anaphylaxis EpiPen', location: 'Lead Coordinator Kit & Kitchen Banquet Station', checked: true },
    { title: 'Garment Steamer & Couture Sewing Kit', location: 'Bridal Suite 204 (Tremezzo)', checked: true },
    { title: 'Clear Umbrellas (24 Units)', location: 'Loggia Entrance Portico', checked: true },
    { title: 'Lake Como Water Taxi Dispatch Radio', location: 'Captain Marco Valli Direct Line', checked: true },
    { title: 'Backup Ceremony Wireless Audio Mic & Batteries', location: 'Sinfonia Sound Technician Console', checked: true },
    { title: 'Hydration Station & Cooling Lavender Towels', location: 'Villa Shore Arrival Dock', checked: true },
  ];

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddItem({
      time,
      title: title.trim(),
      location,
      leadPerson,
      vendorContact: vendorContact.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      priority,
    });

    setTitle('');
    setNotes('');
    setVendorContact('');
    setPhone('');
    setShowAddModal(false);
  };

  const filteredItems = items
    .filter((item) => filterPriority === 'All' || item.priority === filterPriority)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & PROGRESS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Day-Of Operations Run Sheet</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Minute-by-Minute Wedding Logistics
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Synchronized schedule for bridal party, vendor arrival calls, shuttle boats, and ceremony milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Run Sheet Item</span>
            </button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
          <div className="text-xs">
            <span className="font-bold text-[#23211F] block">Milestone Completion</span>
            <span className="text-[#7A6B65]">
              {completedCount} of {items.length} operational steps executed ({progressPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'critical', 'standard'] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setFilterPriority(pri)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  filterPriority === pri
                    ? 'bg-[#5A1E2D] text-white'
                    : 'bg-white text-[#55463E] border border-[#D9C3B0]'
                }`}
              >
                {pri === 'critical' ? '⚠️ Critical Only' : pri === 'standard' ? 'Standard' : 'All Tasks'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT: RUN SHEET & EMERGENCY KIT */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Minute-by-Minute Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleComplete(item.id)}
              className={`p-5 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs ${
                item.isCompleted
                  ? 'bg-[#FAF8F5] border-[#E8DFD8] opacity-75'
                  : item.priority === 'critical'
                  ? 'bg-white border-[#C5A880] ring-1 ring-[#C5A880]/30'
                  : 'bg-white border-[#E5DAD1] hover:border-[#C5A880]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="w-16 h-12 rounded-xl bg-[#FAF8F5] border border-[#E5DAD1] flex items-center justify-center shrink-0 font-mono text-sm font-bold text-[#5A1E2D]">
                  {item.time}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-serif text-lg font-medium ${item.isCompleted ? 'line-through text-[#8C7A72]' : 'text-[#23211F]'}`}>
                      {item.title}
                    </h4>
                    {item.priority === 'critical' && (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        Critical Milestone
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6B65]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5A1E2D]" /> {item.location}
                    </span>
                    <span>•</span>
                    <span>Lead: <strong>{item.leadPerson}</strong></span>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#6D5D55] italic pt-1">{item.notes}</p>
                  )}
                </div>
              </div>

              {/* Contact and Checkbox */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#F0EAE3]">
                {item.phone && (
                  <a
                    href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 flex items-center gap-1 text-[11px] font-medium transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Call Vendor</span>
                  </a>
                )}

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition ${
                    item.isCompleted ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-[#D9C3B0] bg-white'
                  }`}
                >
                  {item.isCompleted && <Check className="w-4 h-4" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Emergency Kit Checklist (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5DAD1] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#F0EAE3]">
              <div className="flex items-center gap-2 text-[#5A1E2D]">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-serif text-xl text-[#23211F]">Emergency Bridal Kit</h3>
              </div>
              <p className="text-xs text-[#7A6B65] mt-1">
                Essential supplies deployed on-site at Lake Como.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {emergencyKitItems.map((kit, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5DAD1] text-xs">
                  <div className="flex items-center gap-2 font-medium text-[#23211F]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{kit.title}</span>
                  </div>
                  <span className="text-[10px] text-[#8C7A72] block pl-6 mt-0.5">
                    Location: {kit.location}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0EAE3] text-xs text-[#7A6B65]">
            <span className="font-bold text-[#23211F] block">Emergency Coordinator Contact</span>
            <span>Villa del Balbianello Direct Concierge: +39 0344 56110</span>
          </div>
        </div>
      </div>

      {/* 3. MODAL: ADD RUN SHEET ITEM */}
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
              Operational Step
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Add Run Sheet Milestone
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    <option value="standard">Standard</option>
                    <option value="critical">Critical (Must Not Slip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Milestone Action / Task</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fireworks barge setup on Tremezzo water"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Lead Responsible Person</label>
                  <input
                    type="text"
                    value={leadPerson}
                    onChange={(e) => setLeadPerson(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Vendor Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Captain Valli"
                    value={vendorContact}
                    onChange={(e) => setVendorContact(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Vendor Phone</label>
                  <input
                    type="text"
                    placeholder="+39 031 950281"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Notes & Safety Reminders</label>
                <input
                  type="text"
                  placeholder="e.g. Check weather radar and lifejackets"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
