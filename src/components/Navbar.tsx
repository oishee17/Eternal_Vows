import React, { useState } from 'react';
import {
  Sparkles,
  QrCode,
  ArrowRight,
  Shield,
  UserCheck,
  Menu,
  X,
  Calendar,
  DollarSign,
  Users,
  Grid,
  Camera,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../types/wedding';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeNav: string;
  onNavigate: (section: string) => void;
  onOpenQRModal: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeNav,
  onNavigate,
  onOpenQRModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  const primaryNavItems = [
    { id: 'dashboard', label: 'Studio', roleAllowed: ['couple', 'admin'] },
    { id: 'guests', label: 'Guests & RSVP', roleAllowed: ['couple', 'admin'] },
    { id: 'dietary', label: 'Dietary & Kitchen', roleAllowed: ['couple', 'admin'] },
    { id: 'seating', label: 'Seating', roleAllowed: ['couple', 'admin'] },
    { id: 'budget', label: 'Budget', roleAllowed: ['couple', 'admin'] },
    { id: 'album', label: 'Album', roleAllowed: ['couple', 'guest', 'vendor', 'admin'] },
    { id: 'marketplace', label: 'Marketplace', roleAllowed: ['couple', 'vendor', 'admin'] },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, roleAllowed: ['couple', 'admin'] },
  ];

  const secondaryNavItems = [
    { id: 'dietary', label: 'Catering & Dietary BEO Sheet', desc: 'Allergen protocols & banquet tallies' },
    { id: 'registry', label: 'Digital Wishing Well & Registry', desc: 'Honeymoon fund & contributions' },
    { id: 'music', label: 'DJ Jukebox & Song Requests', desc: 'Collaborative guest playlist & dedications' },
    { id: 'vows', label: 'AI Vow & Toast Studio', desc: 'Couture speechwriter & rehearsal timer' },
    { id: 'runsheet', label: 'Day-of Logistics Run Sheet', desc: 'Minute-by-minute vendor coordinator' },
    { id: 'itinerary', label: 'Ceremony Schedules', desc: 'Multi-day program & WhatsApp updates' },
  ];

  const visibleNav = primaryNavItems.filter((item) => item.roleAllowed.includes(currentRole));

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    couple: { label: 'Couple / Organizer', badge: 'Bride & Groom', color: 'bg-[#5A1E2D] text-white' },
    guest: { label: 'Wedding Guest', badge: 'Guest Portal', color: 'bg-[#8F5A66] text-white' },
    vendor: { label: 'Verified Vendor', badge: 'Lumière Cinema', color: 'bg-[#9C7A58] text-white' },
    admin: { label: 'Administrator', badge: 'Super Admin', color: 'bg-[#2E282A] text-white' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#5A1E2D] text-[#FAF8F5] flex items-center justify-center font-serif text-xl font-medium shadow-sm transition-transform group-hover:scale-105">
              E
            </div>
            <div>
              <span className="font-serif text-2xl tracking-tight block text-[#23211F]">
                Eternal Vows
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A6B65] -mt-1 block font-medium">
                Wedding Studio
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#5F534E]">
            <button
              onClick={() => onNavigate('landing')}
              className={`transition hover:text-[#5A1E2D] pb-1 ${
                activeNav === 'landing' ? 'text-[#5A1E2D] border-b-2 border-[#5A1E2D] font-semibold' : ''
              }`}
            >
              Overview
            </button>
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`transition flex items-center gap-1.5 pb-1 hover:text-[#5A1E2D] ${
                    isActive ? 'text-[#5A1E2D] border-b-2 border-[#5A1E2D] font-semibold' : ''
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#C5A880]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* More Features Dropdown */}
            {currentRole !== 'guest' && (
              <div className="relative">
                <button
                  onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                  className={`flex items-center gap-1 pb-1 transition hover:text-[#5A1E2D] ${
                    ['registry', 'music', 'vows', 'runsheet', 'dietary'].includes(activeNav)
                      ? 'text-[#5A1E2D] font-semibold'
                      : ''
                  }`}
                >
                  <span>More Tools</span>
                  <ChevronDown className="w-3 h-3 text-[#7A6B65]" />
                </button>

                {moreToolsOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-[#E8DFD8] shadow-xl py-2 z-50">
                    <div className="px-3 py-1 border-b border-[#F0EAE3] text-[9px] uppercase tracking-wider font-semibold text-[#8C7A72]">
                      New Wedding Features
                    </div>
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setMoreToolsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#FAF8F5] transition ${
                          activeNav === item.id ? 'bg-[#FAF1EE] text-[#5A1E2D] font-semibold' : 'text-[#3E3430]'
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[10px] text-[#8C7A72]">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Actions & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Venue QR Code Quick Action */}
            <button
              onClick={onOpenQRModal}
              title="Generate printable venue QR signs for guest album uploads"
              className="flex items-center gap-2 border border-[#D9C3B0] bg-white px-3.5 py-2 rounded-full text-xs font-medium text-[#4A3B32] hover:bg-[#F4EFEA] transition shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span className="hidden xl:inline">Venue QR</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[#D9C3B0] bg-white text-[#23211F] hover:bg-[#FAF8F5] transition shadow-xs`}
              >
                <span className={`w-2 h-2 rounded-full ${currentRole === 'couple' ? 'bg-[#5A1E2D]' : currentRole === 'guest' ? 'bg-amber-600' : currentRole === 'vendor' ? 'bg-blue-600' : 'bg-purple-600'}`} />
                <span>{roleLabels[currentRole].badge}</span>
                <ChevronDown className="w-3 h-3 text-[#7A6B65]" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#E8DFD8] shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-[#F0EAE3] text-[10px] uppercase tracking-wider font-semibold text-[#8C7B73]">
                    Switch Perspective
                  </div>
                  {(['couple', 'guest', 'vendor', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onSelectRole(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FAF8F5] transition ${
                        currentRole === r ? 'font-semibold text-[#5A1E2D] bg-[#F8F2EC]' : 'text-[#3E3430]'
                      }`}
                    >
                      <span>{roleLabels[r].label}</span>
                      {currentRole === r && <span className="text-[10px] text-[#5A1E2D]">Active</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Main Action CTA */}
            <button
              onClick={() => onNavigate(currentRole === 'guest' ? 'itinerary' : 'dashboard')}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-[#FAF8F5] px-4 py-2 rounded-full text-xs font-medium tracking-wide transition shadow-sm flex items-center gap-1.5"
            >
              <span>{currentRole === 'guest' ? 'My RSVP & Pass' : 'Open Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={onOpenQRModal}
              className="p-2 text-[#5A1E2D] hover:bg-white rounded-full border border-[#D9C3B0]"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#23211F] hover:bg-white rounded-full border border-[#D9C3B0]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8DFD8] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#E8DFD8]">
            <span className="text-xs text-[#7A6B65]">Viewing Role:</span>
            <div className="flex gap-1">
              {(['couple', 'guest', 'vendor', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onSelectRole(r)}
                  className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-medium ${
                    currentRole === r ? 'bg-[#5A1E2D] text-white' : 'bg-white text-[#5A1E2D] border border-[#D9C3B0]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-white border border-[#E8DFD8] text-xs font-medium text-left text-[#3E3430]"
            >
              Home Overview
            </button>
            {visibleNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                  activeNav === item.id
                    ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                    : 'bg-white border-[#E8DFD8] text-[#3E3430]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
