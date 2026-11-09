import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  MessageCircle,
  Share2,
  Check,
  X,
  Mail,
  Phone,
  Utensils,
  Sparkles,
  QrCode,
  Copy,
  ChevronDown,
  AlertTriangle,
  Edit2,
  Info,
} from 'lucide-react';
import { Guest, GuestCategory, RSVPStatus, DietaryPreference } from '../../types/wedding';
import {
  DietaryMultiSelect,
  getDietaryBadgeStyle,
  COMMON_DIETARY_OPTIONS,
} from './DietaryMultiSelect';

interface GuestManagerProps {
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id' | 'inviteCode' | 'invitationSent'>) => void;
  onUpdateGuestRSVP: (
    guestId: string,
    status: RSVPStatus,
    dietary?: DietaryPreference,
    partySize?: number
  ) => void;
  onUpdateGuestDietary?: (
    guestId: string,
    restrictions: string[],
    dietaryNotes?: string
  ) => void;
  onDeleteGuest: (guestId: string) => void;
  weddingTitle: string;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  guests,
  onAddGuest,
  onUpdateGuestRSVP,
  onUpdateGuestDietary,
  onDeleteGuest,
  weddingTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRSVP, setSelectedRSVP] = useState<string>('All');
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDietaryGuest, setEditingDietaryGuest] = useState<Guest | null>(null);
  const [editDietaryRestrictions, setEditDietaryRestrictions] = useState<string[]>([]);
  const [editDietaryNotes, setEditDietaryNotes] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper to extract restrictions array safely
  const getGuestRestrictions = (guest: Guest): string[] => {
    if (guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0) {
      return guest.dietaryRestrictions;
    }
    if (guest.dietary && guest.dietary !== 'Standard') {
      return [guest.dietary];
    }
    return [];
  };

  // New Guest Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    category: GuestCategory;
    partySize: number;
    dietary: DietaryPreference;
    dietaryRestrictions: string[];
    dietaryNotes: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    category: 'Friends',
    partySize: 1,
    dietary: 'Standard',
    dietaryRestrictions: [],
    dietaryNotes: '',
    notes: '',
  });

  // Filtered Guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery);

    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesRSVP = selectedRSVP === 'All' || g.rsvp === selectedRSVP;

    const guestRestrictions = getGuestRestrictions(g);
    const matchesDietary =
      selectedDietaryFilter === 'All' ||
      (selectedDietaryFilter === 'Standard/None' && guestRestrictions.length === 0) ||
      (selectedDietaryFilter === 'Allergies' &&
        guestRestrictions.some((r) => getDietaryBadgeStyle(r).isAllergy)) ||
      guestRestrictions.includes(selectedDietaryFilter);

    return matchesSearch && matchesCategory && matchesRSVP && matchesDietary;
  });

  // Dietary Aggregation for Caterer across all multi-select items
  const dietaryCounts = guests.reduce((acc, g) => {
    if (g.rsvp === 'attending') {
      const restrictions = getGuestRestrictions(g);
      if (restrictions.length === 0) {
        acc['Standard / None'] = (acc['Standard / None'] || 0) + g.partySize;
      } else {
        restrictions.forEach((r) => {
          acc[r] = (acc[r] || 0) + g.partySize;
        });
      }
    }
    return acc;
  }, {} as Record<string, number>);

  // Count total allergy alerts for attending guests
  const totalAllergyGuestCount = guests
    .filter((g) => g.rsvp === 'attending')
    .filter((g) => getGuestRestrictions(g).some((r) => getDietaryBadgeStyle(r).isAllergy))
    .reduce((sum, g) => sum + g.partySize, 0);

  // CSV Export with multi-select dietary restrictions
  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Category',
      'Party Size',
      'RSVP Status',
      'Primary Dietary',
      'Dietary Restrictions',
      'Dietary Notes',
      'Table',
      'Invite Code',
    ];
    const rows = guests.map((g) => {
      const restrictions = getGuestRestrictions(g);
      return [
        `"${g.name}"`,
        `"${g.email}"`,
        `"${g.phone}"`,
        `"${g.category}"`,
        g.partySize,
        `"${g.rsvp}"`,
        `"${g.dietary}"`,
        `"${restrictions.join('; ')}"`,
        `"${g.dietaryNotes || ''}"`,
        g.tableId ? `"Table ${g.tableId}"` : '"Unseated"',
        `"${g.inviteCode}"`,
      ];
    });
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `EternalVows-GuestList-Dietary-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import Simulation
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n');
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts[0]) {
          const rawRestrictions = parts[7]
            ? parts[7].split(';').map((s) => s.trim()).filter(Boolean)
            : [];
          const primaryDiet = (parts[6] as DietaryPreference) || (rawRestrictions[0] as DietaryPreference) || 'Standard';

          onAddGuest({
            name: parts[0],
            email: parts[1] || `${parts[0].toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: parts[2] || '+1 555 0100',
            category: (parts[3] as GuestCategory) || 'Friends',
            partySize: parseInt(parts[4], 10) || 1,
            rsvp: 'pending',
            dietary: primaryDiet,
            dietaryRestrictions: rawRestrictions,
            dietaryNotes: parts[8] || '',
            tableId: null,
          });
        }
      }
      alert('Guest list imported successfully with dietary profiles!');
    };
    reader.readAsText(file);
  };

  // WhatsApp Share Message
  const getWhatsAppLink = (guest: Guest) => {
    const inviteUrl = `${window.location.origin}/#guest?code=${guest.inviteCode}`;
    const text = `Dear ${guest.name}, Julian & Evelyn warmly invite you to their Lake Como wedding celebration! 🕊️✨ Please view ceremony schedules and confirm your attendance and dietary requirements here: ${inviteUrl}`;
    return `https://wa.me/${guest.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
  };

  const handleCopyInviteLink = (guest: Guest) => {
    const inviteUrl = `${window.location.origin}/#guest?code=${guest.inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const primaryDiet = (formData.dietaryRestrictions[0] as DietaryPreference) || 'Standard';

    onAddGuest({
      name: formData.name.trim(),
      email: formData.email.trim() || 'guest@example.com',
      phone: formData.phone.trim() || '+1 555 0000',
      category: formData.category,
      partySize: formData.partySize,
      rsvp: 'pending',
      dietary: primaryDiet,
      dietaryRestrictions: formData.dietaryRestrictions,
      dietaryNotes: formData.dietaryNotes,
      tableId: null,
      notes: formData.notes,
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'Friends',
      partySize: 1,
      dietary: 'Standard',
      dietaryRestrictions: [],
      dietaryNotes: '',
      notes: '',
    });
    setShowAddModal(false);
  };

  const openDietaryEditModal = (guest: Guest) => {
    setEditingDietaryGuest(guest);
    setEditDietaryRestrictions(getGuestRestrictions(guest));
    setEditDietaryNotes(guest.dietaryNotes || '');
  };

  const handleSaveQuickDietary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDietaryGuest) return;

    if (onUpdateGuestDietary) {
      onUpdateGuestDietary(
        editingDietaryGuest.id,
        editDietaryRestrictions,
        editDietaryNotes.trim()
      );
    } else {
      // Fallback to onUpdateGuestRSVP if handler not provided
      const primaryDiet = (editDietaryRestrictions[0] as DietaryPreference) || 'Standard';
      onUpdateGuestRSVP(
        editingDietaryGuest.id,
        editingDietaryGuest.rsvp,
        primaryDiet,
        editingDietaryGuest.partySize
      );
    }
    setEditingDietaryGuest(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & ACTIONS BAR */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Smart Guest Management & Live RSVP</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Guest Invitations & Dietary Profiles
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Personalized invite links, searchable multi-select dietary restrictions, allergy alerts, and catering tallies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>

            <button
              onClick={handleExportCSV}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Guest</span>
            </button>
          </div>
        </div>

        {/* Allergy Alert Banner if any attending guest has allergies */}
        {totalAllergyGuestCount > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  Allergy Notice: {totalAllergyGuestCount} Attending Guest(s) with Critical Allergies
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDietaryFilter('Allergies')}
                  className="text-[11px] font-semibold underline text-rose-800 hover:text-rose-950"
                >
                  Filter Allergy Guests →
                </button>
              </div>
              <p className="mt-0.5 text-rose-800 text-[11px]">
                Please provide this list to the executive chef at Villa del Balbianello for separate allergen-safe preparation.
              </p>
            </div>
          </div>
        )}

        {/* Dietary Tallies for Caterer (Interactive Filter Chips) */}
        <div className="mt-6 pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8C7A72] uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Live Catering Dietary Breakdown (Confirmed Meals)</span>
            </div>
            {selectedDietaryFilter !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedDietaryFilter('All')}
                className="text-[11px] text-[#5A1E2D] hover:underline font-semibold"
              >
                Reset Filter (Showing: {selectedDietaryFilter})
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(dietaryCounts).map(([diet, count]) => {
              const badgeStyle = getDietaryBadgeStyle(diet);
              const isSelected = selectedDietaryFilter === diet;

              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setSelectedDietaryFilter(isSelected ? 'All' : diet)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#5A1E2D] text-white border-[#5A1E2D] shadow-xs'
                      : `${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text} hover:opacity-90`
                  }`}
                  title={`Filter guest list by ${diet}`}
                >
                  {badgeStyle.isAllergy && !isSelected && (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span>{diet}:</span>
                  <span className="font-bold underline decoration-dotted">{count} meals</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C7A72] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-full border border-[#D9C3B0] bg-[#FAF8F5] focus:outline-hidden focus:border-[#5A1E2D]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* Dietary Filter Dropdown */}
            <select
              value={selectedDietaryFilter}
              onChange={(e) => setSelectedDietaryFilter(e.target.value)}
              className="text-xs border border-[#D9C3B0] bg-white rounded-full px-3 py-2 text-[#4A3B32] focus:outline-hidden font-medium"
            >
              <option value="All">All Dietary Profiles</option>
              <option value="Allergies">⚠️ Critical Allergies Only</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Vegan">Vegan</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Nut Allergy">Nut Allergy</option>
              <option value="Dairy-Free">Dairy-Free</option>
              <option value="Halal">Halal</option>
              <option value="Kosher">Kosher</option>
              <option value="Shellfish Allergy">Shellfish Allergy</option>
              <option value="Standard/None">Standard / No Restrictions</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border border-[#D9C3B0] bg-white rounded-full px-3 py-2 text-[#4A3B32] focus:outline-hidden"
            >
              <option value="All">All Groups</option>
              <option value="Family">Family</option>
              <option value="VIP">VIP</option>
              <option value="Friends">Friends</option>
              <option value="Colleagues">Colleagues</option>
              <option value="Relatives">Relatives</option>
            </select>

            {/* RSVP Filter */}
            <select
              value={selectedRSVP}
              onChange={(e) => setSelectedRSVP(e.target.value)}
              className="text-xs border border-[#D9C3B0] bg-white rounded-full px-3 py-2 text-[#4A3B32] focus:outline-hidden"
            >
              <option value="All">All RSVP Statuses</option>
              <option value="attending">Attending</option>
              <option value="pending">Pending</option>
              <option value="declined">Declined</option>
              <option value="tentative">Tentative</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. GUESTS TABLE LIST WITH PROMINENT DIETARY RESTRICTIONS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0EAE3] bg-[#FAF8F5] text-[10px] uppercase tracking-wider font-semibold text-[#8C7A72]">
                <th className="py-4 px-6">Guest / Family</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Group</th>
                <th className="py-4 px-4 text-center">Party</th>
                <th className="py-4 px-6 min-w-[260px]">Dietary Restrictions & Allergies</th>
                <th className="py-4 px-4">Table</th>
                <th className="py-4 px-4">RSVP Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE3]">
              {filteredGuests.map((guest) => {
                const restrictions = getGuestRestrictions(guest);
                const hasAllergy = restrictions.some((r) => getDietaryBadgeStyle(r).isAllergy);

                return (
                  <tr
                    key={guest.id}
                    className={`hover:bg-[#FAF8F5]/80 transition ${
                      hasAllergy ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Name & Notes */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-sm text-[#23211F]">{guest.name}</div>
                      {guest.notes && (
                        <div className="text-[11px] text-[#8C7A72] italic">{guest.notes}</div>
                      )}
                      <div className="text-[10px] font-mono text-[#8C7A72] mt-0.5">
                        CODE: {guest.inviteCode}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4 text-[#6D5D55]">
                      <div>{guest.email}</div>
                      <div className="text-[11px] font-mono">{guest.phone}</div>
                    </td>

                    {/* Group */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider ${
                          guest.category === 'VIP'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : guest.category === 'Family'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-[#F4EFEA] text-[#6F5D54] border border-[#E5DAD1]'
                        }`}
                      >
                        {guest.category}
                      </span>
                    </td>

                    {/* Party Size */}
                    <td className="py-4 px-4 text-center font-bold text-sm text-[#23211F]">
                      {guest.partySize}
                    </td>

                    {/* PROMINENT DIETARY RESTRICTIONS COLUMN */}
                    <td className="py-4 px-6">
                      <div className="space-y-1.5">
                        {/* Prominent Restriction Badges */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {restrictions.map((res) => {
                            const badgeStyle = getDietaryBadgeStyle(res);
                            return (
                              <span
                                key={res}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} shadow-2xs`}
                              >
                                {badgeStyle.isAllergy && (
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                )}
                                <span>{res}</span>
                              </span>
                            );
                          })}

                          {restrictions.length === 0 && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C7A72] border border-[#E5DAD1] font-medium">
                              Standard / None
                            </span>
                          )}

                          {/* Quick Edit Dietary Button */}
                          <button
                            type="button"
                            onClick={() => openDietaryEditModal(guest)}
                            className="p-1 text-[#8C7A72] hover:text-[#5A1E2D] hover:bg-[#FAF8F5] rounded-full transition ml-1"
                            title="Edit dietary restrictions"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Dietary Notes details */}
                        {guest.dietaryNotes && (
                          <div className="text-[11px] text-[#8C7A72] flex items-center gap-1 italic">
                            <Info className="w-3 h-3 shrink-0 text-[#C5A880]" />
                            <span>{guest.dietaryNotes}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Table Assignment */}
                    <td className="py-4 px-4">
                      {guest.tableId ? (
                        <span className="font-serif text-sm font-medium text-[#5A1E2D]">
                          Table 0{guest.tableId}
                        </span>
                      ) : (
                        <span className="text-[#8C7A72] italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* RSVP Status with Quick Toggle */}
                    <td className="py-4 px-4">
                      <select
                        value={guest.rsvp}
                        onChange={(e) => onUpdateGuestRSVP(guest.id, e.target.value as RSVPStatus)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium border focus:outline-hidden cursor-pointer ${
                          guest.rsvp === 'attending'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : guest.rsvp === 'declined'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="attending">✓ Attending</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="tentative">❓ Tentative</option>
                        <option value="declined">✕ Declined</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDietaryEditModal(guest)}
                          className="p-1.5 rounded-full hover:bg-amber-50 text-amber-800 transition"
                          title="Edit dietary restrictions"
                        >
                          <Utensils className="w-4 h-4" />
                        </button>
                        <a
                          href={getWhatsAppLink(guest)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-full hover:bg-emerald-50 text-emerald-700 transition"
                          title="Share invitation via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyInviteLink(guest)}
                          className="p-1.5 rounded-full hover:bg-[#FAF8F5] text-[#8C7A72] hover:text-[#5A1E2D] transition"
                          title="Copy direct invitation link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteGuest(guest.id)}
                          className="p-1.5 rounded-full hover:bg-rose-50 text-[#8C7A72] hover:text-rose-700 transition"
                          title="Remove guest"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="p-12 text-center text-xs text-[#8C7A72] italic">
            No guests found matching your search and filter criteria.
          </div>
        )}
      </div>

      {/* 3. MODAL: ADD GUEST (Expanded with Searchable Multi-Select Dietary Restrictions) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Registry
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-1">
              Add Wedding Guest
            </h3>
            <p className="text-xs text-[#7A6B65] mb-5">
              Enter contact details and configure multi-select dietary requirements for the caterer.
            </p>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">
                  Full Name or Couple <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Arthur & Lady Clara Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#5A1E2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+44 7700 900142"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Guest Group</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as GuestCategory })
                    }
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    <option value="Family">Family</option>
                    <option value="VIP">VIP</option>
                    <option value="Friends">Friends</option>
                    <option value="Colleagues">Colleagues</option>
                    <option value="Relatives">Relatives</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Total Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.partySize}
                    onChange={(e) =>
                      setFormData({ ...formData, partySize: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* SEARCHABLE MULTI-SELECT DIETARY RESTRICTIONS */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DAD1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#4A3B32] font-semibold text-xs">
                    Dietary Restrictions & Allergies (Multi-Select)
                  </label>
                  <span className="text-[10px] text-[#8C7A72]">Select all that apply</span>
                </div>

                <DietaryMultiSelect
                  selectedRestrictions={formData.dietaryRestrictions}
                  onChange={(newRestrictions) =>
                    setFormData({
                      ...formData,
                      dietaryRestrictions: newRestrictions,
                      dietary: (newRestrictions[0] as DietaryPreference) || 'Standard',
                    })
                  }
                  placeholder="Search dietary restrictions (e.g. Gluten-free, Vegan, Nut allergy)..."
                />

                <div className="pt-1">
                  <label className="block text-[11px] text-[#7A6B65] font-medium mb-1">
                    Specific Dietary & Allergen Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Severe peanut allergy (carries EpiPen), cross-contamination protocol"
                    value={formData.dietaryNotes}
                    onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-1.5 bg-[#FAF8F5] focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Special Notes / Seating Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Groom's sister, needs ground-floor seating"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-[#F0EAE3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-[#D9C3B0] bg-white text-[#4A3B32] px-4 py-2 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium shadow-sm"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: QUICK EDIT DIETARY RESTRICTIONS */}
      {editingDietaryGuest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setEditingDietaryGuest(null)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Utensils className="w-3.5 h-3.5" />
              <span>Dietary Profile Editor</span>
            </div>

            <h3 className="font-serif text-2xl text-[#23211F] mt-1">
              Dietary Profile: {editingDietaryGuest.name}
            </h3>
            <p className="text-xs text-[#7A6B65] mt-1 mb-5">
              Party of {editingDietaryGuest.partySize} • Status: {editingDietaryGuest.rsvp}
            </p>

            <form onSubmit={handleSaveQuickDietary} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-semibold mb-1">
                  Select Dietary Restrictions (Multi-Select)
                </label>
                <DietaryMultiSelect
                  selectedRestrictions={editDietaryRestrictions}
                  onChange={(newRestrictions) => setEditDietaryRestrictions(newRestrictions)}
                  placeholder="Search restrictions (Gluten-Free, Vegan, Nut Allergy)..."
                />
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">
                  Specific Allergen / Preparation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Strict gluten cross-contamination protocol, no soy sauce"
                  value={editDietaryNotes}
                  onChange={(e) => setEditDietaryNotes(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingDietaryGuest(null)}
                  className="border border-[#D9C3B0] bg-white text-[#4A3B32] px-4 py-2 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium shadow-sm"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
