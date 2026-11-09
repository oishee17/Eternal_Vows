import React, { useState } from 'react';
import {
  Utensils,
  AlertTriangle,
  ShieldAlert,
  Printer,
  Sparkles,
  CheckCircle2,
  Table as TableIcon,
  ChevronDown,
  Info,
  Layers,
  HeartPulse,
  ChefHat,
  Search,
} from 'lucide-react';
import { Guest, SeatingTable } from '../../types/wedding';
import { BANQUET_COURSE_MENU } from '../../data/initialData';

interface DietaryCateringHubProps {
  guests: Guest[];
  tables: SeatingTable[];
  coupleNames: string;
  venueName: string;
  weddingDate: string;
  onUpdateGuestDietary: (guestId: string, dietary: any, allergies: string[], severity: any, notes: string) => void;
}

export const DietaryCateringHub: React.FC<DietaryCateringHubProps> = ({
  guests,
  tables,
  coupleNames,
  venueName,
  weddingDate,
  onUpdateGuestDietary,
}) => {
  const [selectedTableFilter, setSelectedTableFilter] = useState<string>('All');
  const [searchGuest, setSearchGuest] = useState<string>('');
  const [isConsultingChefAI, setIsConsultingChefAI] = useState<boolean>(false);
  const [chefRecommendations, setChefRecommendations] = useState<{
    recommendations: string[];
    kitchenSafetyChecklist: string[];
  } | null>(null);

  const attendingGuests = guests.filter((g) => g.rsvp === 'attending');

  // Severe Anaphylaxis Alerts
  const severeAllergyGuests = attendingGuests.filter((g) => g.isSevereAllergy || g.allergySeverity?.includes('Severe'));

  // Aggregation of Diets
  const dietCounts = attendingGuests.reduce((acc, g) => {
    acc[g.dietary] = (acc[g.dietary] || 0) + g.partySize;
    return acc;
  }, {} as Record<string, number>);

  // Aggregation of Specific Allergens
  const allergenCounts = attendingGuests.reduce((acc, g) => {
    (g.allergies || []).forEach((allergen: string) => {
      acc[allergen] = (acc[allergen] || 0) + g.partySize;
    });
    return acc;
  }, {} as Record<string, number>);

  // Course Selections
  const starterCounts = attendingGuests.reduce((acc, g) => {
    const starter = g.courseSelection?.starter || 'Standard Tasting Starter';
    acc[starter] = (acc[starter] || 0) + g.partySize;
    return acc;
  }, {} as Record<string, number>);

  const mainCounts = attendingGuests.reduce((acc, g) => {
    const main = g.courseSelection?.main || 'Standard Tasting Main';
    acc[main] = (acc[main] || 0) + g.partySize;
    return acc;
  }, {} as Record<string, number>);

  const dessertCounts = attendingGuests.reduce((acc, g) => {
    const dessert = g.courseSelection?.dessert || 'Standard Tasting Dessert';
    acc[dessert] = (acc[dessert] || 0) + g.partySize;
    return acc;
  }, {} as Record<string, number>);

  const handleConsultChefAI = async () => {
    setIsConsultingChefAI(true);
    try {
      const res = await fetch('/api/ai/dietary-menu-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietarySummary: { dietCounts, allergenCounts, severeCount: severeAllergyGuests.length },
          courseMenu: BANQUET_COURSE_MENU,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChefRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConsultingChefAI(false);
    }
  };

  const handlePrintBEO = () => {
    window.print();
  };

  const filteredGuests = attendingGuests.filter((g) => {
    const matchesTable = selectedTableFilter === 'All' || g.tableId?.toString() === selectedTableFilter;
    const matchesSearch = g.name.toLowerCase().includes(searchGuest.toLowerCase()) ||
      g.dietary.toLowerCase().includes(searchGuest.toLowerCase()) ||
      (g.allergies || []).some((a: string) => a.toLowerCase().includes(searchGuest.toLowerCase()));
    return matchesTable && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HEADER & CATERER ACTIONS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <ChefHat className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Executive Chef & Banquet Order (BEO)</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Guest Dietary Restrictions & Catering Matrix
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Food safety protocol, critical allergy alerts, table-by-table kitchen sheets, and culinary course tallies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleConsultChefAI}
              disabled={isConsultingChefAI}
              className="bg-[#FAF8F5] border border-[#D9C3B0] text-[#5A1E2D] hover:bg-[#F5EFE9] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isConsultingChefAI ? 'Analyzing Menu...' : 'AI Chef Allergen Advice'}</span>
            </button>

            <button
              onClick={handlePrintBEO}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Caterer Kitchen Sheet (BEO)</span>
            </button>
          </div>
        </div>

        {/* Severe Allergy Red Warning Callout */}
        {severeAllergyGuests.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm block text-rose-900">
                  Critical Food Safety Alert: {severeAllergyGuests.length} Guests with Anaphylaxis / Severe Allergies
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-200 text-rose-900">
                  EpiPen Registered
                </span>
              </div>
              <p className="mt-1 leading-relaxed">
                Banquet Captain must ensure separate prep cloches, certified clean pans, and designated plating servers for:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {severeAllergyGuests.map((sg) => (
                  <span
                    key={sg.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-rose-300 font-semibold text-rose-900 shadow-2xs"
                  >
                    <span>{sg.name}</span>
                    <span>(Table 0{sg.tableId || '?'}: {sg.allergies?.join(', ') || sg.dietary})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Chef Recommendations Box */}
        {chefRecommendations && (
          <div className="mt-6 p-6 rounded-2xl bg-[#FAF8F5] border border-[#D9C3B0] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A1E2D] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <span>AI Executive Chef Guidance & Kitchen Adaptations</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-[#EDE2D8]">
                <span className="font-semibold text-[#23211F] block mb-2">Culinary Substitutions:</span>
                <ul className="space-y-1.5 text-[#55463E]">
                  {chefRecommendations.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#5A1E2D] font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EDE2D8]">
                <span className="font-semibold text-[#23211F] block mb-2">Banquet Service Checklist:</span>
                <ul className="space-y-1.5 text-[#55463E]">
                  {chefRecommendations.kitchenSafetyChecklist.map((check, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. THREE-PANEL BANQUET SUMMARY TILES */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Panel 1: Dietary Classification Tallies */}
        <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE3]">
              <h3 className="font-serif text-xl text-[#23211F]">Diets & Lifestyles</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#5A1E2D]">
                {attendingGuests.length} Guests
              </span>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              {Object.entries(dietCounts).map(([diet, count]) => (
                <div key={diet} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5]">
                  <span className="font-medium text-[#23211F]">{diet}</span>
                  <span className="font-serif font-bold text-sm text-[#5A1E2D]">{count} meals</span>
                </div>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-[#8C7A72] block mt-4 pt-3 border-t border-[#F0EAE3]">
            Verified against RSVP confirmations
          </span>
        </div>

        {/* Panel 2: Specific Allergens & Intolerances */}
        <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE3]">
              <h3 className="font-serif text-xl text-[#23211F]">Allergens Tally</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                Caution
              </span>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              {Object.entries(allergenCounts).map(([allergen, count]) => (
                <div key={allergen} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="font-semibold text-rose-950">{allergen}</span>
                  <span className="font-bold text-rose-900">{count} people</span>
                </div>
              ))}
              {Object.keys(allergenCounts).length === 0 && (
                <p className="text-xs text-[#8C7A72] italic py-4 text-center">No specific allergens registered.</p>
              )}
            </div>
          </div>
          <span className="text-[10px] text-[#8C7A72] block mt-4 pt-3 border-t border-[#F0EAE3]">
            Notify line cooks of cross-contact protocols
          </span>
        </div>

        {/* Panel 3: Course Selections Breakdown */}
        <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE3]">
              <h3 className="font-serif text-xl text-[#23211F]">Main Course Counts</h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#5A1E2D]">
                Plating Plan
              </span>
            </div>
            <div className="mt-4 space-y-2.5 text-xs">
              {Object.entries(mainCounts).map(([main, count]) => (
                <div key={main} className="p-2.5 rounded-xl bg-[#FAF8F5]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-[#23211F] truncate max-w-[200px]">{main}</span>
                    <span className="font-bold text-[#5A1E2D]">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EFE8DF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5A1E2D] rounded-full"
                      style={{ width: `${Math.min(100, (count / attendingGuests.length) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-[#8C7A72] block mt-4 pt-3 border-t border-[#F0EAE3]">
            Exact count for Cucina Lariana procurement
          </span>
        </div>
      </div>

      {/* 3. TABLE-BY-TABLE BANQUET EVENT ORDER (BEO) SHEETS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#F0EAE3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-[#23211F]">Table-by-Table Banquet Plating Sheet</h3>
            <p className="text-xs text-[#7A6B65]">
              Designed for banquet captains to verify dietary needs and course choices at each table.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Table Filter */}
            <select
              value={selectedTableFilter}
              onChange={(e) => setSelectedTableFilter(e.target.value)}
              className="text-xs border border-[#D9C3B0] bg-white rounded-full px-3.5 py-2 text-[#4A3B32] focus:outline-hidden"
            >
              <option value="All">All Tables (1-6)</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id.toString()}>
                  Table 0{t.id}: {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Table Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0EAE3] bg-[#FAF8F5] text-[10px] uppercase tracking-wider font-semibold text-[#8C7A72]">
                <th className="py-4 px-6">Table</th>
                <th className="py-4 px-4">Guest Name</th>
                <th className="py-4 px-4">Dietary Preference</th>
                <th className="py-4 px-4">Allergies & Severity</th>
                <th className="py-4 px-4">Selected Main Course</th>
                <th className="py-4 px-6">Special Kitchen Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE3]">
              {filteredGuests.map((guest) => {
                const isSevere = guest.isSevereAllergy || guest.allergySeverity?.includes('Severe');

                return (
                  <tr
                    key={guest.id}
                    className={`transition hover:bg-[#FAF8F5] ${
                      isSevere ? 'bg-rose-50/40 font-medium' : ''
                    }`}
                  >
                    {/* Table */}
                    <td className="py-4 px-6 font-serif text-sm font-semibold text-[#5A1E2D]">
                      {guest.tableId ? `Table 0${guest.tableId}` : 'Unseated'}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-sm text-[#23211F]">{guest.name}</div>
                      <span className="text-[10px] text-[#8C7A72] block">Party of {guest.partySize}</span>
                    </td>

                    {/* Dietary */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          guest.dietary === 'Standard'
                            ? 'bg-[#FAF8F5] text-[#6F5D54] border border-[#E5DAD1]'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {guest.dietary}
                      </span>
                    </td>

                    {/* Allergies & Severity */}
                    <td className="py-4 px-4">
                      {guest.allergies && guest.allergies.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {guest.allergies.map((a: string, i: number) => (
                              <span
                                key={i}
                                className={`text-[10px] px-2 py-0.2 rounded-md font-semibold ${
                                  isSevere
                                    ? 'bg-rose-200 text-rose-900 border border-rose-300'
                                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                          {guest.allergySeverity && (
                            <span className="text-[10px] text-rose-800 font-bold block">
                              ⚠️ {guest.allergySeverity}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#8C7A72] text-[11px] italic">None declared</span>
                      )}
                    </td>

                    {/* Main Course */}
                    <td className="py-4 px-4 text-[#4A3B32]">
                      <span className="font-medium text-xs">
                        {guest.courseSelection?.main || 'Pan-seared Sea Bass'}
                      </span>
                      {guest.courseSelection?.starter && (
                        <span className="text-[10px] text-[#8C7A72] block truncate max-w-[200px]">
                          Starter: {guest.courseSelection.starter}
                        </span>
                      )}
                    </td>

                    {/* Kitchen Instructions */}
                    <td className="py-4 px-6 text-xs text-[#55463E]">
                      {guest.catererInstructions ? (
                        <div className="p-2 rounded-lg bg-white border border-[#D9C3B0] text-rose-950 font-medium">
                          {guest.catererInstructions}
                        </div>
                      ) : guest.dietaryNotes ? (
                        <span>{guest.dietaryNotes}</span>
                      ) : (
                        <span className="text-[#8C7A72] italic text-[11px]">Standard banquet preparation</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
