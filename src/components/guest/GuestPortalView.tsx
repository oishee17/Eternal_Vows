import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Check,
  Heart,
  Upload,
  Utensils,
  Sparkles,
  QrCode,
  Users,
} from 'lucide-react';
import { Guest, Ceremony, AlbumMedia, DietaryPreference, RSVPStatus } from '../../types/wedding';
import confetti from 'canvas-confetti';
import { DietaryMultiSelect } from '../planning/DietaryMultiSelect';

interface GuestPortalViewProps {
  currentGuest: Guest;
  ceremonies: Ceremony[];
  photos: AlbumMedia[];
  coupleNames: string;
  venueName: string;
  weddingDate: string;
  onUpdateRSVP: (guestId: string, status: RSVPStatus, dietary?: DietaryPreference, partySize?: number) => void;
  onUpdateDietary?: (guestId: string, restrictions: string[], notes?: string) => void;
  onUploadPhoto: (url: string, caption: string) => void;
}

export const GuestPortalView: React.FC<GuestPortalViewProps> = ({
  currentGuest,
  ceremonies,
  photos,
  coupleNames,
  venueName,
  weddingDate,
  onUpdateRSVP,
  onUpdateDietary,
  onUploadPhoto,
}) => {
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>(currentGuest.rsvp);
  const [partySize, setPartySize] = useState<number>(currentGuest.partySize);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    currentGuest.dietaryRestrictions && currentGuest.dietaryRestrictions.length > 0
      ? currentGuest.dietaryRestrictions
      : currentGuest.dietary !== 'Standard'
      ? [currentGuest.dietary]
      : []
  );
  const [dietaryNotes, setDietaryNotes] = useState<string>(currentGuest.dietaryNotes || '');
  const [submittedRSVP, setSubmittedRSVP] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryDiet = (dietaryRestrictions[0] as DietaryPreference) || 'Standard';
    onUpdateRSVP(currentGuest.id, rsvpStatus, primaryDiet, partySize);
    if (onUpdateDietary) {
      onUpdateDietary(currentGuest.id, dietaryRestrictions, dietaryNotes);
    }
    setSubmittedRSVP(true);
    if (rsvpStatus === 'attending') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#5A1E2D', '#D9C3B0', '#FAF8F5'],
      });
    }
    setTimeout(() => setSubmittedRSVP(false), 4000);
  };

  const handleGuestPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      setUploadedUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmPhotoPublish = () => {
    if (!uploadedUrl) return;
    onUploadPhoto(uploadedUrl, uploadCaption.trim() || `Captured by ${currentGuest.name}`);
    setUploadedUrl(null);
    setUploadCaption('');
    alert('Thank you! Your photo was added to the live couple album.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* 1. LUXURY INVITATION CARD */}
      <div className="bg-[#FAF8F5] border-2 border-[#D9C3B0] rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-[#5A1E2D] text-white flex items-center justify-center font-serif text-xl mx-auto mb-4 shadow-sm">
          E
        </div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#8C7A72] font-semibold block">
          Wedding Invitation Pass
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#23211F] mt-2 font-normal">
          {coupleNames}
        </h1>
        <p className="font-serif italic text-lg text-[#5A1E2D] mt-2">
          Request the pleasure of your company
        </p>

        <div className="my-6 py-4 border-y border-[#E8DFD8] text-xs sm:text-sm text-[#4A3B32] space-y-1">
          <p className="font-medium">{venueName}</p>
          <p className="font-serif text-base text-[#5A1E2D]">
            {new Date(weddingDate).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-[11px] text-[#8C7A72]">Lake Como, Lombardy, Italy</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EDE2D8] inline-block shadow-2xs text-left max-w-sm w-full mx-auto">
          <span className="text-[10px] uppercase font-bold text-[#8C7A72] block">Guest Record</span>
          <span className="font-serif text-lg text-[#23211F] font-medium block">{currentGuest.name}</span>
          <div className="flex items-center justify-between text-xs text-[#7A6B65] mt-1 pt-2 border-t border-[#F0EAE3]">
            <span>Tier: {currentGuest.category}</span>
            <span>Pass: {currentGuest.inviteCode}</span>
          </div>
        </div>
      </div>

      {/* 2. RSVP RESPONSE FORM */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="pb-4 border-b border-[#F0EAE3] mb-6">
          <h3 className="font-serif text-2xl text-[#23211F]">Your RSVP Response</h3>
          <p className="text-xs text-[#7A6B65]">
            Kindly reply by September 1st, 2026 to assist with seating and catering arrangements.
          </p>
        </div>

        {submittedRSVP && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Thank you! Your RSVP response has been confirmed and saved.</span>
          </div>
        )}

        <form onSubmit={handleRSVPSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#4A3B32] font-semibold mb-2">Will you be attending?</label>
            <div className="grid grid-cols-3 gap-2">
              {(['attending', 'declined', 'tentative'] as RSVPStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setRsvpStatus(status)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold capitalize transition border ${
                    rsvpStatus === status
                      ? 'bg-[#5A1E2D] text-white border-[#5A1E2D] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#4A3B32] border-[#D9C3B0] hover:bg-[#F5EFE9]'
                  }`}
                >
                  {status === 'attending' ? '✓ Attending' : status === 'declined' ? '✕ Regretfully Decline' : '❓ Maybe / Tentative'}
                </button>
              ))}
            </div>
          </div>

          {rsvpStatus === 'attending' && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Total Attending (Including You)</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value, 10) || 1)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="block text-[#4A3B32] font-semibold text-xs">
                  Dietary Restrictions & Food Allergies (Multi-Select)
                </label>
                <DietaryMultiSelect
                  selectedRestrictions={dietaryRestrictions}
                  onChange={setDietaryRestrictions}
                  placeholder="Select any dietary preferences (e.g. Gluten-free, Vegan, Nut allergy)..."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] text-[#7A6B65] font-medium mb-1">
                  Specific Allergy Notes / Intolerances
                </label>
                <input
                  type="text"
                  placeholder="e.g. Severe peanut allergy (carries EpiPen), lactose intolerance"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#5A1E2D] hover:bg-[#471522] text-white py-3 rounded-full text-xs font-semibold tracking-wide transition shadow-sm"
            >
              Submit RSVP Response
            </button>
          </div>
        </form>
      </div>

      {/* 3. CEREMONIES TIMELINE FOR GUESTS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-2xl text-[#23211F] mb-1">Ceremony & Event Program</h3>
        <p className="text-xs text-[#7A6B65] mb-6">Venues, start times, and recommended attire.</p>

        <div className="space-y-4">
          {ceremonies.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1] flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DAD1] flex flex-col items-center justify-center shrink-0 text-center">
                <span className="text-[9px] font-bold text-[#5A1E2D] uppercase">
                  {new Date(c.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-xs font-bold text-[#23211F]">{new Date(c.date).getDate()}</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-[#23211F] font-medium">{c.title}</h4>
                <div className="text-xs text-[#7A6B65] flex flex-wrap gap-3">
                  <span>{c.startTime} - {c.endTime}</span>
                  <span>•</span>
                  <span>{c.venue}</span>
                </div>
                <p className="text-xs text-[#4A3B32]">{c.description}</p>
                <div className="text-[11px] text-[#5A1E2D] font-medium pt-1">
                  Dress Code: {c.dressCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. GUEST QUICK PHOTO DROPZONE */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-5 h-5 text-[#5A1E2D]" />
          <h3 className="font-serif text-2xl text-[#23211F]">Live Guest Photo Dropzone</h3>
        </div>
        <p className="text-xs text-[#7A6B65] mb-6">
          Snapped a great picture during the celebrations? Add it straight to the live couple album!
        </p>

        {uploadedUrl ? (
          <div className="space-y-3">
            <img src={uploadedUrl} alt="Upload preview" className="w-full max-h-56 object-cover rounded-2xl" />
            <input
              type="text"
              placeholder="Add a toast or caption..."
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              className="w-full text-xs border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setUploadedUrl(null)}
                className="px-4 py-2 text-xs border border-[#D9C3B0] rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPhotoPublish}
                className="bg-[#5A1E2D] text-white px-5 py-2 rounded-full text-xs font-medium"
              >
                Publish Photo
              </button>
            </div>
          </div>
        ) : (
          <label className="cursor-pointer border-2 border-dashed border-[#D4C3B5] rounded-2xl p-8 bg-[#FAF8F5] block text-center hover:bg-[#F5EFE9] transition">
            <Upload className="w-8 h-8 text-[#5A1E2D] mx-auto mb-2" />
            <span className="font-serif text-lg text-[#23211F] block">Tap to Select Photo</span>
            <span className="text-[11px] text-[#7A6B65]">Take a picture with your smartphone camera</span>
            <input type="file" accept="image/*" onChange={handleGuestPhotoUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
};
