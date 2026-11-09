import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { CoupleDashboard } from './components/dashboard/CoupleDashboard';
import { GuestManager } from './components/planning/GuestManager';
import { BudgetTracker } from './components/planning/BudgetTracker';
import { SeatingPlanner } from './components/planning/SeatingPlanner';
import { ItineraryPlanner } from './components/planning/ItineraryPlanner';
import { WeddingAlbum } from './components/album/WeddingAlbum';
import { QRCodeModal } from './components/album/QRCodeModal';
import { VendorMarketplace } from './components/marketplace/VendorMarketplace';
import { AIAssistantChat } from './components/assistant/AIAssistantChat';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GuestPortalView } from './components/guest/GuestPortalView';
import {
  INITIAL_WEDDING_META,
  INITIAL_BUDGET_CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_CONSTRAINTS,
  INITIAL_CEREMONIES,
  INITIAL_PHOTOS,
  INITIAL_VENDORS,
  INITIAL_REQUIREMENTS,
  INITIAL_BIDS,
  INITIAL_TASKS,
  INITIAL_MESSAGES,
  WeddingMeta,
} from './data/initialData';
import {
  UserRole,
  Guest,
  BudgetCategory,
  ExpenseItem,
  SeatingTable,
  SeatingConstraint,
  Ceremony,
  AlbumMedia,
  VendorProfile,
  ServiceRequirement,
  VendorBid,
  WeddingTask,
  VendorMessage,
  RSVPStatus,
  DietaryPreference,
} from './types/wedding';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'ETERNAL_VOWS_PLATFORM_V1';

export default function App() {
  // Global Platform State with LocalStorage cache
  const [meta, setMeta] = useState<WeddingMeta>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_META`);
    return saved ? JSON.parse(saved) : INITIAL_WEDDING_META;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('couple');
  const [activeNav, setActiveNav] = useState<string>('landing');
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_GUESTS`);
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CATEGORIES`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_EXPENSES`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [tables, setTables] = useState<SeatingTable[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TABLES`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [constraints, setConstraints] = useState<SeatingConstraint[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CONSTRAINTS`);
    return saved ? JSON.parse(saved) : INITIAL_CONSTRAINTS;
  });

  const [ceremonies, setCeremonies] = useState<Ceremony[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_CEREMONIES`);
    return saved ? JSON.parse(saved) : INITIAL_CEREMONIES;
  });

  const [photos, setPhotos] = useState<AlbumMedia[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_PHOTOS`);
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_VENDORS`);
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [requirements, setRequirements] = useState<ServiceRequirement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_REQUIREMENTS`);
    return saved ? JSON.parse(saved) : INITIAL_REQUIREMENTS;
  });

  const [bids, setBids] = useState<VendorBid[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_BIDS`);
    return saved ? JSON.parse(saved) : INITIAL_BIDS;
  });

  const [tasks, setTasks] = useState<WeddingTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_TASKS`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [messages, setMessages] = useState<VendorMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_MESSAGES`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_META`, JSON.stringify(meta));
  }, [meta]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_GUESTS`, JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EXPENSES`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_PHOTOS`, JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BIDS`, JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TASKS`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_MESSAGES`, JSON.stringify(messages));
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Guest Actions
  const handleAddGuest = (guestData: Omit<Guest, 'id' | 'inviteCode' | 'invitationSent'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: `g-${Date.now()}`,
      inviteCode: `EV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      invitationSent: true,
    };
    setGuests([newGuest, ...guests]);
    showToast(`Added ${newGuest.name} to the guest registry.`);
  };

  const handleUpdateGuestRSVP = (
    guestId: string,
    status: RSVPStatus,
    dietary?: DietaryPreference,
    partySize?: number
  ) => {
    setGuests(
      guests.map((g) => {
        if (g.id === guestId) {
          return {
            ...g,
            rsvp: status,
            dietary: dietary || g.dietary,
            partySize: partySize !== undefined ? partySize : g.partySize,
          };
        }
        return g;
      })
    );
    showToast(`RSVP status updated to "${status}".`);
  };

  const handleUpdateGuestDietary = (
    guestId: string,
    restrictions: string[],
    dietaryNotes?: string
  ) => {
    setGuests(
      guests.map((g) => {
        if (g.id === guestId) {
          const primaryDiet = (restrictions[0] as DietaryPreference) || (restrictions.length === 0 ? 'Standard' : 'Other');
          return {
            ...g,
            dietary: primaryDiet,
            dietaryRestrictions: restrictions,
            dietaryNotes: dietaryNotes !== undefined ? dietaryNotes : g.dietaryNotes,
          };
        }
        return g;
      })
    );
    showToast('Updated guest dietary restrictions.');
  };

  const handleDeleteGuest = (guestId: string) => {
    setGuests(guests.filter((g) => g.id !== guestId));
    showToast('Guest removed from registry.');
  };

  // 2. Budget Actions
  const handleAddExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newExp: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setExpenses([newExp, ...expenses]);
    showToast(`Recorded expense: $${newExp.amount.toLocaleString()} for ${newExp.title}`);
  };

  const handleToggleExpensePaid = (expenseId: string) => {
    setExpenses(
      expenses.map((e) => (e.id === expenseId ? { ...e, isPaid: !e.isPaid } : e))
    );
    showToast('Expense payment status toggled.');
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(expenses.filter((e) => e.id !== expenseId));
    showToast('Expense removed from ledger.');
  };

  // 3. Seating Actions
  const handleUpdateGuestTable = (guestId: string, tableId: number | null) => {
    setGuests(guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)));
    showToast(tableId ? `Assigned to Table 0${tableId}` : 'Guest unassigned from table');
  };

  const handleApplyAutoSeating = (assignments: Array<{ guestId: string; tableId: number }>) => {
    const lookup = new Map(assignments.map((a) => [a.guestId, a.tableId]));
    setGuests(
      guests.map((g) => {
        if (lookup.has(g.id)) {
          return { ...g, tableId: lookup.get(g.id)! };
        }
        return g;
      })
    );
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#5A1E2D', '#D9C3B0'],
    });
    showToast(`Auto-seating applied for ${assignments.length} attendees.`);
  };

  const handleAddConstraint = (
    guestAId: string,
    guestBId: string,
    type: 'must_sit_together' | 'must_separate'
  ) => {
    const newConstraint: SeatingConstraint = {
      id: `c-${Date.now()}`,
      guestAId,
      guestBId,
      type,
    };
    setConstraints([...constraints, newConstraint]);
    showToast('New seating rule saved.');
  };

  const handleRemoveConstraint = (constraintId: string) => {
    setConstraints(constraints.filter((c) => c.id !== constraintId));
    showToast('Seating rule removed.');
  };

  // 4. Itinerary Actions
  const handleAddCeremony = (ceremonyData: Omit<Ceremony, 'id'>) => {
    const newCeremony: Ceremony = {
      ...ceremonyData,
      id: `cer-${Date.now()}`,
    };
    setCeremonies([...ceremonies, newCeremony]);
    showToast(`Added ceremony: ${newCeremony.title}`);
  };

  const handleDeleteCeremony = (ceremonyId: string) => {
    setCeremonies(ceremonies.filter((c) => c.id !== ceremonyId));
    showToast('Ceremony deleted from schedule.');
  };

  // 5. Album Actions
  const handleUploadMedia = (mediaData: Omit<AlbumMedia, 'id' | 'timestamp'>) => {
    const newPhoto: AlbumMedia = {
      ...mediaData,
      id: `ph-${Date.now()}`,
      timestamp: 'Just now',
    };
    setPhotos([newPhoto, ...photos]);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#5A1E2D', '#D9C3B0'],
    });
    showToast('Photo published to the live collaborative album!');
  };

  const handleToggleFavorite = (mediaId: string) => {
    setPhotos(
      photos.map((p) => (p.id === mediaId ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleFlagMedia = (mediaId: string) => {
    setPhotos(
      photos.map((p) => (p.id === mediaId ? { ...p, isFlagged: true } : p))
    );
    showToast('Photo reported to wedding administrator for review.');
  };

  const handleDeleteMedia = (mediaId: string) => {
    setPhotos(photos.filter((p) => p.id !== mediaId));
    showToast('Photo removed from album.');
  };

  // 6. Vendor Marketplace Actions
  const handleAddRequirement = (reqData: Omit<ServiceRequirement, 'id' | 'createdAt' | 'status'>) => {
    const newReq: ServiceRequirement = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRequirements([newReq, ...requirements]);
    showToast(`Requirement posted for ${newReq.category}. Vendors can now submit bids.`);
  };

  const handleSubmitBid = (bidData: Omit<VendorBid, 'id' | 'createdAt' | 'status'>) => {
    const newBid: VendorBid = {
      ...bidData,
      id: `bid-${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBids([newBid, ...bids]);
    showToast(`Quotation of $${newBid.proposedPrice.toLocaleString()} submitted by ${newBid.vendorName}.`);
  };

  const handleUpdateBidStatus = (
    bidId: string,
    status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected'
  ) => {
    const targetBid = bids.find((b) => b.id === bidId);
    setBids(bids.map((b) => (b.id === bidId ? { ...b, status } : b)));

    // When bid is accepted: automatically add to Budget Ledger! (Specification 5.4)
    if (status === 'accepted' && targetBid) {
      const existingExpense = expenses.find((e) => e.title.includes(targetBid.vendorName));
      if (!existingExpense) {
        const matchingCat = categories.find((c) => c.name.toLowerCase().includes(targetBid.category.toLowerCase())) || categories[0];
        const newContractExpense: ExpenseItem = {
          id: `exp-bid-${Date.now()}`,
          categoryId: matchingCat.id,
          categoryName: matchingCat.name,
          title: `${targetBid.vendorName} Contract (${targetBid.category})`,
          vendorName: targetBid.vendorName,
          amount: targetBid.proposedPrice,
          isPaid: false,
          dueDate: meta.weddingDate,
          notes: targetBid.terms,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setExpenses([...expenses, newContractExpense]);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5A1E2D', '#D9C3B0'],
        });
        showToast(
          `Bid accepted! Automatically created a $${targetBid.proposedPrice.toLocaleString()} commitment in your budget ledger.`
        );
        return;
      }
    }
    showToast(`Bid status changed to ${status}.`);
  };

  const handleSendMessage = (bidId: string, text: string, sender: 'couple' | 'vendor') => {
    const newMessage: VendorMessage = {
      id: `m-${Date.now()}`,
      bidId,
      sender,
      senderName: sender === 'couple' ? `${meta.partnerOne} & ${meta.partnerTwo}` : 'Antoine (Vendor)',
      text,
      timestamp: 'Just now',
    };
    setMessages([...messages, newMessage]);
  };

  // 7. Checklist Task Actions
  const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (title: string, category: string, dueDate: string) => {
    const newTask: WeddingTask = {
      id: `t-${Date.now()}`,
      title,
      category,
      dueDate,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    showToast('New milestone added to checklist.');
  };

  // 8. Admin Actions
  const handleToggleVerifyVendor = (vendorId: string) => {
    setVendors(
      vendors.map((v) => (v.id === vendorId ? { ...v, isVerified: !v.isVerified } : v))
    );
    showToast('Vendor verification badge updated.');
  };

  const handleApproveMedia = (mediaId: string) => {
    setPhotos(
      photos.map((p) => (p.id === mediaId ? { ...p, isFlagged: false } : p))
    );
    showToast('Photo approved and returned to public album.');
  };

  // Grounded context for AI Planner
  const totalCommitted = expenses.reduce((sum, e) => sum + e.amount, 0);
  const confirmedCount = guests.filter((g) => g.rsvp === 'attending').reduce((sum, g) => sum + g.partySize, 0);
  const pendingCount = guests.filter((g) => g.rsvp === 'pending').reduce((sum, g) => sum + g.partySize, 0);

  const aiPlannerContext = {
    coupleNames: `${meta.partnerOne} & ${meta.partnerTwo}`,
    weddingDate: meta.weddingDate,
    venue: `${meta.venueName}, ${meta.venueCity}`,
    totalBudget: meta.totalBudget,
    totalSpent: totalCommitted,
    confirmedGuests: confirmedCount,
    pendingGuests: pendingCount,
    tablesCount: tables.length,
    bidsSummary: bids.map((b) => ({
      vendor: b.vendorName,
      category: b.category,
      price: b.proposedPrice,
      status: b.status,
    })),
    ceremonies: ceremonies.map((c) => ({
      title: c.title,
      date: c.date,
      time: `${c.startTime} - ${c.endTime}`,
      venue: c.venue,
    })),
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#23211F] font-sans antialiased selection:bg-[#5A1E2D] selection:text-white flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#23211F] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-3 border border-[#4A3B32] animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#D9C3B0]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={(role) => {
          setCurrentRole(role);
          if (role === 'guest') setActiveNav('guest-portal');
          else if (role === 'vendor') setActiveNav('marketplace');
          else if (role === 'admin') setActiveNav('admin');
          else setActiveNav('dashboard');
        }}
        activeNav={activeNav}
        onNavigate={(nav) => setActiveNav(nav)}
        onOpenQRModal={() => setShowQRModal(true)}
      />

      {/* Main Routed Area */}
      <main className="flex-1">
        {/* 1. GUEST PORTAL (when role is guest or navigated to) */}
        {currentRole === 'guest' || activeNav === 'guest-portal' ? (
          <GuestPortalView
            currentGuest={guests[0]}
            ceremonies={ceremonies}
            photos={photos}
            coupleNames={`${meta.partnerOne} & ${meta.partnerTwo}`}
            venueName={meta.venueName}
            weddingDate={meta.weddingDate}
            onUpdateRSVP={handleUpdateGuestRSVP}
            onUpdateDietary={handleUpdateGuestDietary}
            onUploadPhoto={(url, caption) =>
              handleUploadMedia({
                url,
                caption,
                uploaderName: guests[0].name,
                uploaderRole: 'guest',
                category: 'Candid moments',
                tags: ['Live Reception Upload'],
                isFavorite: false,
                isFlagged: false,
              })
            }
          />
        ) : (
          <>
            {activeNav === 'landing' && (
              <LandingPage
                onNavigate={(section) => setActiveNav(section)}
                onOpenQR={() => setShowQRModal(true)}
                totalBudget={meta.totalBudget}
                remainingBudget={meta.totalBudget - totalCommitted}
                confirmedGuests={confirmedCount}
                pendingGuests={pendingCount}
                activeBidsCount={bids.length}
              />
            )}

            {activeNav === 'dashboard' && (
              <CoupleDashboard
                meta={meta}
                guests={guests}
                expenses={expenses}
                ceremonies={ceremonies}
                bids={bids}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                onNavigate={(section) => setActiveNav(section)}
                onOpenQR={() => setShowQRModal(true)}
                onUpdateBidStatus={handleUpdateBidStatus}
              />
            )}

            {activeNav === 'guests' && (
              <GuestManager
                guests={guests}
                onAddGuest={handleAddGuest}
                onUpdateGuestRSVP={handleUpdateGuestRSVP}
                onUpdateGuestDietary={handleUpdateGuestDietary}
                onDeleteGuest={handleDeleteGuest}
                weddingTitle={`${meta.partnerOne} & ${meta.partnerTwo}`}
              />
            )}

            {activeNav === 'budget' && (
              <BudgetTracker
                categories={categories}
                expenses={expenses}
                totalBudget={meta.totalBudget}
                onUpdateTotalBudget={(newB) => setMeta({ ...meta, totalBudget: newB })}
                onUpdateCategoryAllocation={(catId, amt) =>
                  setCategories(
                    categories.map((c) => (c.id === catId ? { ...c, allocatedAmount: amt } : c))
                  )
                }
                onAddExpense={handleAddExpense}
                onToggleExpensePaid={handleToggleExpensePaid}
                onDeleteExpense={handleDeleteExpense}
                onAskAIAboutBudget={(prompt) => {
                  setActiveNav('assistant');
                }}
              />
            )}

            {activeNav === 'seating' && (
              <SeatingPlanner
                guests={guests}
                tables={tables}
                constraints={constraints}
                onUpdateGuestTable={handleUpdateGuestTable}
                onApplyAutoSeating={handleApplyAutoSeating}
                onAddConstraint={handleAddConstraint}
                onRemoveConstraint={handleRemoveConstraint}
              />
            )}

            {activeNav === 'itinerary' && (
              <ItineraryPlanner
                ceremonies={ceremonies}
                onAddCeremony={handleAddCeremony}
                onDeleteCeremony={handleDeleteCeremony}
                weddingTitle={`${meta.partnerOne} & ${meta.partnerTwo}`}
              />
            )}

            {activeNav === 'album' && (
              <WeddingAlbum
                photos={photos}
                ceremonies={ceremonies}
                onUploadMedia={handleUploadMedia}
                onToggleFavorite={handleToggleFavorite}
                onFlagMedia={handleFlagMedia}
                onDeleteMedia={handleDeleteMedia}
                onOpenQRModal={() => setShowQRModal(true)}
                coupleNames={`${meta.partnerOne} & ${meta.partnerTwo}`}
              />
            )}

            {activeNav === 'marketplace' && (
              <VendorMarketplace
                vendors={vendors}
                requirements={requirements}
                bids={bids}
                messages={messages}
                onAddRequirement={handleAddRequirement}
                onSubmitBid={handleSubmitBid}
                onUpdateBidStatus={handleUpdateBidStatus}
                onSendMessage={handleSendMessage}
                activeRole={currentRole}
              />
            )}

            {activeNav === 'assistant' && (
              <AIAssistantChat context={aiPlannerContext} />
            )}

            {activeNav === 'admin' && (
              <AdminDashboard
                vendors={vendors}
                media={photos}
                guests={guests}
                onToggleVerifyVendor={handleToggleVerifyVendor}
                onApproveMedia={handleApproveMedia}
                onRemoveFlaggedMedia={handleDeleteMedia}
              />
            )}
          </>
        )}
      </main>

      {/* QR Code Standee Modal */}
      {showQRModal && (
        <QRCodeModal
          meta={meta}
          onClose={() => setShowQRModal(false)}
          onOpenGuestPortal={() => {
            setShowQRModal(false);
            setCurrentRole('guest');
            setActiveNav('guest-portal');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#E8DFD8] bg-[#F4EFEA] py-12 px-6 lg:px-16 text-xs text-[#84756D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5A1E2D] text-[#FAF8F5] flex items-center justify-center font-serif text-sm font-medium shadow-xs">
              E
            </div>
            <div>
              <span className="font-serif text-lg text-[#23211F] block">
                Eternal Vows Wedding Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#8C7A72]">
                Lake Como • Italy • Villa del Balbianello
              </span>
            </div>
          </div>

          <p className="text-center md:text-left">
            © 2026 Eternal Vows. An all-in-one platform for couples, guests, and verified wedding artisans.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-[#6D5D55]">
            <button onClick={() => setCurrentRole('couple')} className="hover:text-[#5A1E2D]">
              Couple Studio
            </button>
            <button onClick={() => setCurrentRole('guest')} className="hover:text-[#5A1E2D]">
              Guest Portal
            </button>
            <button onClick={() => setCurrentRole('vendor')} className="hover:text-[#5A1E2D]">
              Vendor Hub
            </button>
            <button onClick={() => setCurrentRole('admin')} className="hover:text-[#5A1E2D]">
              Administrator
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
