import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Leaf,
  Wheat,
  Plus,
  ChevronDown,
} from 'lucide-react';

export interface DietaryOption {
  id: string;
  label: string;
  category: 'allergy' | 'intolerance' | 'lifestyle' | 'religious' | 'health';
  iconType?: string;
}

export const COMMON_DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'Gluten-Free', label: 'Gluten-Free', category: 'intolerance' },
  { id: 'Vegan', label: 'Vegan', category: 'lifestyle' },
  { id: 'Vegetarian', label: 'Vegetarian', category: 'lifestyle' },
  { id: 'Nut Allergy', label: 'Nut Allergy (Peanuts & Tree Nuts)', category: 'allergy' },
  { id: 'Dairy-Free', label: 'Dairy-Free / Lactose-Free', category: 'intolerance' },
  { id: 'Halal', label: 'Halal', category: 'religious' },
  { id: 'Kosher', label: 'Kosher', category: 'religious' },
  { id: 'Shellfish Allergy', label: 'Shellfish Allergy', category: 'allergy' },
  { id: 'Egg Allergy', label: 'Egg Allergy', category: 'allergy' },
  { id: 'Soy Allergy', label: 'Soy Allergy', category: 'allergy' },
  { id: 'Fish Allergy', label: 'Fish Allergy', category: 'allergy' },
  { id: 'Sesame Allergy', label: 'Sesame Allergy', category: 'allergy' },
  { id: 'Pescatarian', label: 'Pescatarian', category: 'lifestyle' },
  { id: 'Diabetic / Low Sugar', label: 'Diabetic / Low Sugar', category: 'health' },
  { id: 'Low Sodium', label: 'Low Sodium', category: 'health' },
  { id: 'Onion & Garlic-Free', label: 'Onion & Garlic-Free (Jain)', category: 'religious' },
  { id: 'FODMAP Friendly', label: 'FODMAP Friendly', category: 'health' },
  { id: 'Pregnancy-Safe', label: 'Pregnancy-Safe (No Raw/Unpasteurized)', category: 'health' },
];

export function getDietaryBadgeStyle(restriction: string): {
  bg: string;
  text: string;
  border: string;
  isAllergy: boolean;
} {
  const lower = restriction.toLowerCase();
  if (lower.includes('allergy') || lower.includes('nut') || lower.includes('shellfish') || lower.includes('egg') || lower.includes('sesame')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      border: 'border-rose-300',
      isAllergy: true,
    };
  }
  if (lower.includes('gluten') || lower.includes('dairy') || lower.includes('lactose')) {
    return {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      isAllergy: false,
    };
  }
  if (lower.includes('vegan') || lower.includes('vegetarian') || lower.includes('pescatarian')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      isAllergy: false,
    };
  }
  if (lower.includes('halal') || lower.includes('kosher') || lower.includes('jain')) {
    return {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-300',
      isAllergy: false,
    };
  }
  return {
    bg: 'bg-sky-50',
    text: 'text-sky-900',
    border: 'border-sky-300',
    isAllergy: false,
  };
}

interface DietaryMultiSelectProps {
  selectedRestrictions: string[];
  onChange: (restrictions: string[]) => void;
  placeholder?: string;
}

export const DietaryMultiSelect: React.FC<DietaryMultiSelectProps> = ({
  selectedRestrictions,
  onChange,
  placeholder = 'Search & select dietary restrictions...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = COMMON_DIETARY_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExactMatch = COMMON_DIETARY_OPTIONS.some(
    (opt) => opt.id.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const toggleRestriction = (id: string) => {
    if (selectedRestrictions.includes(id)) {
      onChange(selectedRestrictions.filter((item) => item !== id));
    } else {
      onChange([...selectedRestrictions, id]);
    }
  };

  const removeRestriction = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(selectedRestrictions.filter((item) => item !== id));
  };

  const handleAddCustom = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (!selectedRestrictions.includes(trimmed)) {
      onChange([...selectedRestrictions, trimmed]);
    }
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        toggleRestriction(filteredOptions[0].id);
        setSearchQuery('');
      } else if (searchQuery.trim() && !isExactMatch) {
        handleAddCustom();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full text-xs" ref={dropdownRef}>
      {/* Input container / Trigger */}
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
        className={`min-h-[42px] p-2 rounded-xl border bg-white cursor-pointer transition flex flex-wrap items-center gap-1.5 ${
          isOpen ? 'border-[#5A1E2D] ring-2 ring-[#5A1E2D]/10' : 'border-[#D9C3B0] hover:border-[#8C7A72]'
        }`}
      >
        {/* Selected badge chips */}
        {selectedRestrictions.map((item) => {
          const style = getDietaryBadgeStyle(item);
          return (
            <span
              key={item}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border} shadow-2xs`}
            >
              {style.isAllergy && <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />}
              <span>{item}</span>
              <button
                type="button"
                onClick={(e) => removeRestriction(item, e)}
                className="hover:opacity-75 p-0.5 rounded-full"
                title={`Remove ${item}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {/* Placeholder if none selected */}
        {selectedRestrictions.length === 0 && !isOpen && (
          <span className="text-[#8C7A72] text-xs pl-1 select-none">
            {placeholder}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1 pl-1 text-[#8C7A72]">
          {selectedRestrictions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="text-[10px] text-[#8C7A72] hover:text-[#5A1E2D] pr-1 underline"
            >
              Clear
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#D9C3B0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Search Field */}
          <div className="p-2.5 border-b border-[#F0EAE3] bg-[#FAF8F5]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C7A72] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type to search (e.g. Gluten, Nut, Vegan)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#D9C3B0] rounded-lg focus:outline-hidden focus:border-[#5A1E2D]"
              />
            </div>

            {/* Quick Popular Picks */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[10px] text-[#8C7A72] uppercase font-semibold shrink-0">Quick:</span>
              {['Gluten-Free', 'Vegan', 'Nut Allergy', 'Dairy-Free', 'Halal'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => toggleRestriction(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition whitespace-nowrap ${
                    selectedRestrictions.includes(preset)
                      ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                      : 'bg-white text-[#4A3B32] border-[#D9C3B0] hover:bg-[#F5EFE9]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-[#F5EFEA] p-1">
            {filteredOptions.map((option) => {
              const isSelected = selectedRestrictions.includes(option.id);
              const badgeStyle = getDietaryBadgeStyle(option.id);

              return (
                <div
                  key={option.id}
                  onClick={() => toggleRestriction(option.id)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-[#FAF1EE]' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-[#5A1E2D] border-[#5A1E2D] text-white'
                          : 'border-[#D9C3B0] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {badgeStyle.isAllergy && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className={`text-xs ${isSelected ? 'font-semibold text-[#5A1E2D]' : 'text-[#23211F]'}`}>
                        {option.label}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#8C7A72]">
                    {option.category}
                  </span>
                </div>
              );
            })}

            {/* If custom query typed and not in predefined list */}
            {searchQuery.trim() && !isExactMatch && (
              <div
                onClick={handleAddCustom}
                className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 cursor-pointer text-xs text-amber-900 flex items-center gap-2 transition"
              >
                <Plus className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  Add custom dietary restriction: <strong>"{searchQuery.trim()}"</strong>
                </span>
              </div>
            )}

            {filteredOptions.length === 0 && !searchQuery.trim() && (
              <div className="p-4 text-center text-xs text-[#8C7A72]">
                No dietary options found.
              </div>
            )}
          </div>

          {/* Footer of Dropdown */}
          <div className="p-2 border-t border-[#F0EAE3] bg-[#FAF8F5] flex items-center justify-between text-[11px] text-[#7A6B65]">
            <span>{selectedRestrictions.length} restriction(s) selected</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-[#5A1E2D] hover:bg-[#471522] text-white rounded-full font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
