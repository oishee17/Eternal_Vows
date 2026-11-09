import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Users,
  Search,
  Printer,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  MoveRight,
  ShieldAlert,
  HelpCircle,
  X,
  Link2,
  Unlink,
  Eye,
  EyeOff,
  GitMerge,
  AlertTriangle,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Guest, SeatingTable, SeatingConstraint } from '../../types/wedding';
import { solveSeatingArrangement } from '../../utils/seatingSolver';

interface SeatingPlannerProps {
  guests: Guest[];
  tables: SeatingTable[];
  constraints: SeatingConstraint[];
  onUpdateGuestTable: (guestId: string, tableId: number | null) => void;
  onApplyAutoSeating: (assignments: Array<{ guestId: string; tableId: number }>) => void;
  onAddConstraint: (guestAId: string, guestBId: string, type: 'must_sit_together' | 'must_separate') => void;
  onRemoveConstraint: (constraintId: string) => void;
}

interface ConnectionLine {
  constraintId: string;
  type: 'must_sit_together' | 'must_separate';
  guestA: Guest;
  guestB: Guest;
  isConflict: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  tableAName: string;
  tableBName: string;
}

export const SeatingPlanner: React.FC<SeatingPlannerProps> = ({
  guests,
  tables,
  constraints,
  onUpdateGuestTable,
  onApplyAutoSeating,
  onAddConstraint,
  onRemoveConstraint,
}) => {
  const [searchGuest, setSearchGuest] = useState('');
  const [selectedGuestToMove, setSelectedGuestToMove] = useState<Guest | null>(null);
  const [showConstraintModal, setShowConstraintModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [showConnectionLines, setShowConnectionLines] = useState(true);
  const [highlightConstraintId, setHighlightConstraintId] = useState<string | null>(null);
  const [selectedConflictToResolve, setSelectedConflictToResolve] = useState<{
    constraint: SeatingConstraint;
    guestA: Guest;
    guestB: Guest;
  } | null>(null);

  const [constraintGuestA, setConstraintGuestA] = useState(guests[0]?.id || '');
  const [constraintGuestB, setConstraintGuestB] = useState(guests[1]?.id || '');
  const [constraintType, setConstraintType] = useState<'must_sit_together' | 'must_separate'>('must_sit_together');
  const [solverFeedback, setSolverFeedback] = useState<string | null>(null);

  // Layout container and guest element tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const guestDomRefs = useRef<Record<string, HTMLElement | null>>({});
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);

  // Filter attending guests only for seating
  const attendingGuests = guests.filter((g) => g.rsvp === 'attending');
  const seatedGuests = attendingGuests.filter((g) => g.tableId !== null);
  const unseatedGuests = attendingGuests.filter((g) => g.tableId === null);

  // Recalculate connection lines across guest elements
  const updateConnectionCoordinates = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lines: ConnectionLine[] = [];

    constraints.forEach((c) => {
      const elA = guestDomRefs.current[c.guestAId];
      const elB = guestDomRefs.current[c.guestBId];
      const guestA = guests.find((g) => g.id === c.guestAId);
      const guestB = guests.find((g) => g.id === c.guestBId);

      if (!guestA || !guestB) return;

      const isTogether = c.type === 'must_sit_together';
      let isConflict = false;

      if (isTogether) {
        // Conflict if separated or one/both unseated
        isConflict =
          guestA.tableId === null ||
          guestB.tableId === null ||
          guestA.tableId !== guestB.tableId;
      } else {
        // Must separate conflict if at same table
        isConflict =
          guestA.tableId !== null &&
          guestB.tableId !== null &&
          guestA.tableId === guestB.tableId;
      }

      if (elA && elB) {
        const rectA = elA.getBoundingClientRect();
        const rectB = elB.getBoundingClientRect();

        const x1 = rectA.left + rectA.width / 2 - containerRect.left;
        const y1 = rectA.top + rectA.height / 2 - containerRect.top;
        const x2 = rectB.left + rectB.width / 2 - containerRect.left;
        const y2 = rectB.top + rectB.height / 2 - containerRect.top;

        lines.push({
          constraintId: c.id,
          type: c.type,
          guestA,
          guestB,
          isConflict,
          x1,
          y1,
          x2,
          y2,
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2,
          tableAName: guestA.tableId ? `Table 0${guestA.tableId}` : 'Unseated',
          tableBName: guestB.tableId ? `Table 0${guestB.tableId}` : 'Unseated',
        });
      }
    });

    setConnectionLines(lines);
  }, [constraints, guests]);

  // Recalculate when layout changes, resizes, or guests move
  useEffect(() => {
    updateConnectionCoordinates();
    const handleResize = () => updateConnectionCoordinates();
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(updateConnectionCoordinates, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [updateConnectionCoordinates, guests, tables, constraints, selectedGuestToMove]);

  // Count active conflicts
  const activeConflicts = constraints.filter((c) => {
    const guestA = guests.find((g) => g.id === c.guestAId);
    const guestB = guests.find((g) => g.id === c.guestBId);
    if (!guestA || !guestB) return false;
    if (c.type === 'must_sit_together') {
      return (
        guestA.tableId === null ||
        guestB.tableId === null ||
        guestA.tableId !== guestB.tableId
      );
    } else {
      return (
        guestA.tableId !== null &&
        guestB.tableId !== null &&
        guestA.tableId === guestB.tableId
      );
    }
  });

  const handleRunSolver = () => {
    const result = solveSeatingArrangement(guests, tables, constraints);
    onApplyAutoSeating(result.assignments.map((a) => ({ guestId: a.guestId, tableId: a.tableId })));
    setSolverFeedback(
      `Solver completed! Placed ${result.metrics.totalSeated} guests across ${result.metrics.tablesUsed} tables. ${result.metrics.constraintsSatisfied} constraints satisfied.`
    );
    setTimeout(() => {
      setSolverFeedback(null);
      updateConnectionCoordinates();
    }, 6000);
  };

  const handleMoveGuestToTable = (tableId: number) => {
    if (!selectedGuestToMove) return;
    onUpdateGuestTable(selectedGuestToMove.id, tableId);
    setSelectedGuestToMove(null);
  };

  const handleUnseatGuest = (guestId: string) => {
    onUpdateGuestTable(guestId, null);
  };

  const handleCreateConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (constraintGuestA === constraintGuestB) {
      alert('Please select two different guests.');
      return;
    }
    onAddConstraint(constraintGuestA, constraintGuestB, constraintType);
    setShowConstraintModal(false);
  };

  // Quick Resolve: move either guest to the other guest's table
  const handleResolveConflict = (targetTableId: number) => {
    if (!selectedConflictToResolve) return;
    const { guestA, guestB } = selectedConflictToResolve;
    onUpdateGuestTable(guestA.id, targetTableId);
    onUpdateGuestTable(guestB.id, targetTableId);
    setSelectedConflictToResolve(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & ACTIONS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Constraint-Aware Intelligent Seating</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Reception Seating Chart & Table Allocator
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Visual connection lines highlight paired guests and immediately pinpoint seating separation conflicts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Visual Lines Toggle */}
            <button
              onClick={() => setShowConnectionLines(!showConnectionLines)}
              className={`px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 border shadow-2xs ${
                showConnectionLines
                  ? 'bg-[#5A1E2D] text-white border-[#5A1E2D]'
                  : 'bg-white text-[#4A3B32] border-[#D9C3B0] hover:bg-[#FAF8F5]'
              }`}
              title="Toggle visual connection lines on seating canvas"
            >
              {showConnectionLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showConnectionLines ? 'Connection Lines: ON' : 'Connection Lines: OFF'}</span>
            </button>

            {/* Visual Graph View Modal Button */}
            <button
              onClick={() => setShowGraphModal(true)}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <GitMerge className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Visual Conflict Graph</span>
            </button>

            <button
              onClick={() => setShowConstraintModal(true)}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#5A1E2D]" />
              <span>Seating Rules ({constraints.length})</span>
            </button>

            <button
              onClick={handlePrint}
              className="border border-[#D9C3B0] bg-white hover:bg-[#FAF8F5] text-[#4A3B32] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Chart</span>
            </button>

            <button
              onClick={handleRunSolver}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Run Smart Seating Solver</span>
            </button>
          </div>
        </div>

        {/* PROMINENT CONFLICT DETECTION BANNER */}
        {activeConflicts.length > 0 ? (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-950 block">
                  Seating Conflict Alert: {activeConflicts.length} Pair(s) Separated!
                </span>
                <div className="mt-1 space-y-1">
                  {activeConflicts.map((c) => {
                    const guestA = guests.find((g) => g.id === c.guestAId);
                    const guestB = guests.find((g) => g.id === c.guestBId);
                    const isTogether = c.type === 'must_sit_together';
                    return (
                      <div key={c.id} className="text-xs text-rose-800 flex items-center gap-2">
                        <span>•</span>
                        <strong>{guestA?.name}</strong> and <strong>{guestB?.name}</strong>{' '}
                        {isTogether
                          ? `must sit together, but are currently at ${guestA?.tableId ? `Table 0${guestA.tableId}` : 'Unseated'} and ${guestB?.tableId ? `Table 0${guestB.tableId}` : 'Unseated'}.`
                          : `must be separated, but are currently both at Table 0${guestA?.tableId}.`}
                        <button
                          type="button"
                          onClick={() => {
                            if (guestA && guestB) {
                              setSelectedConflictToResolve({
                                constraint: c,
                                guestA,
                                guestB,
                              });
                            }
                          }}
                          className="underline font-bold text-rose-950 hover:text-rose-700 ml-1"
                        >
                          [Resolve Together]
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleRunSolver}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shrink-0 transition"
            >
              Auto-Resolve All
            </button>
          </div>
        ) : (
          <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>
                All {constraints.length} seating rules are satisfied! Every pair requested to sit together is seated at the same table.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Zero Conflicts
            </span>
          </div>
        )}

        {/* Solver feedback notification */}
        {solverFeedback && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{solverFeedback}</span>
          </div>
        )}

        {/* Move Helper Prompt */}
        {selectedGuestToMove && (
          <div className="mt-4 p-4 rounded-xl bg-[#FAF1EE] border border-[#5A1E2D] flex items-center justify-between">
            <div className="text-xs text-[#5A1E2D]">
              <strong>Moving "{selectedGuestToMove.name}"</strong>: Click "Assign Here" on any table below to place this guest.
            </div>
            <button
              onClick={() => setSelectedGuestToMove(null)}
              className="text-xs text-[#8C7A72] hover:text-[#23211F] underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Seating Stats Strip & Connection Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#7A6B65] pt-2 border-t border-[#F0EAE3]">
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#E5DAD1]">
              <span>Attending: <strong className="text-[#23211F]">{attendingGuests.length}</strong></span>
            </div>
            <div className="bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#E5DAD1]">
              <span>Seated: <strong className="text-emerald-800">{seatedGuests.length}</strong></span>
            </div>
            <div className="bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#E5DAD1]">
              <span>Unassigned: <strong className="text-amber-800">{unseatedGuests.length}</strong></span>
            </div>
          </div>

          {/* Connection Legend */}
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 rounded-full inline-block" />
              <span>Must Sit Together (Satisfied)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-rose-600 inline-block" />
              <span className="text-rose-700 font-semibold">Separation Conflict!</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b-2 border-dotted border-purple-600 inline-block" />
              <span>Must Separate Rule</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. UNSEATED GUESTS TRAY (if any) */}
      {unseatedGuests.length > 0 && (
        <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Unassigned Attending Guests ({unseatedGuests.length})</span>
            </div>
            <span className="text-[11px] text-amber-800">
              Click a guest to place them at a specific table
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {unseatedGuests.map((g) => (
              <button
                key={g.id}
                ref={(el) => {
                  guestDomRefs.current[g.id] = el;
                }}
                onClick={() => setSelectedGuestToMove(g)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-2 ${
                  selectedGuestToMove?.id === g.id
                    ? 'bg-[#5A1E2D] text-white border-[#5A1E2D] shadow-xs'
                    : 'bg-white border-amber-300 text-amber-950 hover:border-[#5A1E2D]'
                }`}
              >
                <span>{g.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                  +{g.partySize - 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE TABLES GRID WITH SVG CONNECTION GRAPH OVERLAY */}
      <div className="relative" ref={containerRef}>
        {/* SVG Connection Graph Overlay Layer */}
        {showConnectionLines && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            style={{ minHeight: '100%' }}
          >
            <defs>
              {/* Glow filter for conflicts */}
              <filter id="conflictGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {connectionLines.map((line) => {
              const {
                constraintId,
                type,
                guestA,
                guestB,
                isConflict,
                x1,
                y1,
                x2,
                y2,
                midX,
                midY,
                tableAName,
                tableBName,
              } = line;

              // Generate a smooth cubic curve between coordinates
              const dx = x2 - x1;
              const dy = y2 - y1;
              const curveOffset = Math.min(60, Math.abs(dx) * 0.2 + 20);
              const pathD = `M ${x1} ${y1} C ${x1 + (dx > 0 ? curveOffset : -curveOffset)} ${y1 + dy * 0.3}, ${x2 - (dx > 0 ? curveOffset : -curveOffset)} ${y2 - dy * 0.3}, ${x2} ${y2}`;

              const isHighlighted = highlightConstraintId === constraintId;
              const strokeColor = isConflict ? '#E11D48' : '#059669';
              const strokeWidth = isHighlighted ? 3.5 : isConflict ? 2.5 : 2;

              return (
                <g
                  key={constraintId}
                  className="transition-all duration-300"
                  onMouseEnter={() => setHighlightConstraintId(constraintId)}
                  onMouseLeave={() => setHighlightConstraintId(null)}
                >
                  {/* Outer glow line for conflict */}
                  {isConflict && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#FDA4AF"
                      strokeWidth={strokeWidth + 4}
                      strokeOpacity={0.6}
                      filter="url(#conflictGlow)"
                    />
                  )}

                  {/* Main Connection Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isConflict ? '6 4' : 'none'}
                    className={isConflict ? 'animate-pulse' : ''}
                  />

                  {/* End Endpoint Dots */}
                  <circle cx={x1} cy={y1} r={isHighlighted ? 6 : 4} fill={strokeColor} stroke="#FFFFFF" strokeWidth={1.5} />
                  <circle cx={x2} cy={y2} r={isHighlighted ? 6 : 4} fill={strokeColor} stroke="#FFFFFF" strokeWidth={1.5} />

                  {/* Midpoint Interactive Status Badge (clickable to resolve!) */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="pointer-events-auto cursor-pointer"
                    onClick={() => {
                      if (isConflict) {
                        setSelectedConflictToResolve({
                          constraint: constraints.find((c) => c.id === constraintId)!,
                          guestA,
                          guestB,
                        });
                      }
                    }}
                  >
                    {isConflict ? (
                      <>
                        <rect
                          x="-105"
                          y="-13"
                          width="210"
                          height="26"
                          rx="13"
                          fill="#FFF1F2"
                          stroke="#E11D48"
                          strokeWidth="1.5"
                          className="shadow-sm hover:fill-rose-100"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#9F1239"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          ⚠️ Conflict: {guestA.name.split(' ')[0]} & {guestB.name.split(' ')[0]} Separated!
                        </text>
                      </>
                    ) : (
                      <>
                        <rect
                          x="-80"
                          y="-11"
                          width="160"
                          height="22"
                          rx="11"
                          fill="#ECFDF5"
                          stroke="#059669"
                          strokeWidth="1"
                          className="shadow-2xs"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#065F46"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          ✓ Together ({tableAName})
                        </text>
                      </>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        )}

        {/* The 6 Tables Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {tables.map((table) => {
            const tableGuests = guests.filter((g) => g.tableId === table.id && g.rsvp === 'attending');
            const totalOccupiedSeats = tableGuests.reduce((sum, g) => sum + g.partySize, 0);
            const isFull = totalOccupiedSeats >= table.capacity;

            return (
              <div
                key={table.id}
                className={`bg-white rounded-3xl border transition shadow-xs flex flex-col justify-between overflow-hidden ${
                  table.isVip ? 'border-[#C5A880] ring-1 ring-[#C5A880]/30' : 'border-[#E5DAD1]'
                }`}
              >
                {/* Table Top Header */}
                <div className="p-5 pb-3 border-b border-[#F0EAE3] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-xl text-[#23211F]">{table.name}</h4>
                      {table.isVip && (
                        <span className="text-[9px] uppercase font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          VIP Head Table
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#8C7A72] block mt-0.5">
                      Zone: {table.zone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isFull ? 'bg-rose-100 text-rose-800' : 'bg-[#FAF8F5] text-[#5A1E2D] border border-[#E5DAD1]'
                    }`}>
                      {totalOccupiedSeats} / {table.capacity}
                    </span>
                  </div>
                </div>

                {/* Visual Table Surface with Centerpiece */}
                <div className="p-6 bg-[#FDFBF8] flex flex-col items-center justify-center relative">
                  {/* Centerpiece Disc */}
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#D4C3B5] bg-white flex flex-col items-center justify-center text-center p-2 shadow-2xs">
                    <span className="font-serif text-lg text-[#5A1E2D] font-bold">0{table.id}</span>
                    <span className="text-[8px] uppercase tracking-wider text-[#8C7A72]">Centerpiece</span>
                  </div>

                  {/* Move target trigger */}
                  {selectedGuestToMove && (
                    <button
                      disabled={isFull}
                      onClick={() => handleMoveGuestToTable(table.id)}
                      className={`mt-4 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition ${
                        isFull
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-[#5A1E2D] hover:bg-[#471522] text-white animate-pulse'
                      }`}
                    >
                      {isFull ? 'Table Full' : `Assign "${selectedGuestToMove.name}" Here`}
                    </button>
                  )}
                </div>

                {/* Seated Guest List for this Table */}
                <div className="p-5 pt-3 space-y-2 flex-1">
                  <span className="text-[10px] uppercase font-semibold text-[#8C7A72] tracking-wider block">
                    Seated Guests ({tableGuests.length})
                  </span>

                  {tableGuests.map((g) => {
                    // Check if this guest has constraints
                    const guestConstraints = constraints.filter(
                      (c) => c.guestAId === g.id || c.guestBId === g.id
                    );
                    const hasConflict = guestConstraints.some((c) => {
                      const otherId = c.guestAId === g.id ? c.guestBId : c.guestAId;
                      const other = guests.find((item) => item.id === otherId);
                      if (!other) return false;
                      if (c.type === 'must_sit_together') {
                        return other.tableId !== g.tableId;
                      } else {
                        return other.tableId === g.tableId;
                      }
                    });

                    return (
                      <div
                        key={g.id}
                        ref={(el) => {
                          guestDomRefs.current[g.id] = el;
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                          hasConflict
                            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                            : 'bg-[#FAF8F5] border-[#EDE2D8]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#23211F]">{g.name}</span>
                            {hasConflict && (
                              <span
                                className="inline-flex items-center text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full"
                                title="Seating constraint separation conflict"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Conflict
                              </span>
                            )}
                            {guestConstraints.length > 0 && !hasConflict && (
                              <span
                                className="inline-flex items-center text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full"
                                title="Must sit together constraint satisfied"
                              >
                                <Check className="w-2.5 h-2.5 mr-0.5" /> Paired
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-[#8C7A72] flex items-center gap-1.5 mt-0.5">
                            <span>{g.category}</span>
                            <span>•</span>
                            <span>Party of {g.partySize}</span>
                            {((g.dietaryRestrictions && g.dietaryRestrictions.length > 0) || g.dietary !== 'Standard') && (
                              <span className="text-amber-900 bg-amber-100/70 px-1.5 py-0.2 rounded-full font-medium">
                                {g.dietaryRestrictions && g.dietaryRestrictions.length > 0
                                  ? g.dietaryRestrictions.join(', ')
                                  : g.dietary}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnseatGuest(g.id)}
                          className="p-1 text-[#8C7A72] hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                          title="Unassign seat"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {tableGuests.length === 0 && (
                    <p className="text-center text-xs text-[#8C7A72] italic py-4">
                      Empty table. Run Smart Solver or assign guests manually.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODAL: QUICK CONFLICT RESOLVER POPOVER */}
      {selectedConflictToResolve && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-rose-300 shadow-2xl relative">
            <button
              onClick={() => setSelectedConflictToResolve(null)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs text-rose-800 font-semibold bg-rose-100 px-2.5 py-1 rounded-full mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Resolve Seating Conflict</span>
            </div>

            <h3 className="font-serif text-2xl text-[#23211F] mt-1">
              Seat Pair Together
            </h3>
            <p className="text-xs text-[#7A6B65] mt-1 mb-6">
              <strong>{selectedConflictToResolve.guestA.name}</strong> and{' '}
              <strong>{selectedConflictToResolve.guestB.name}</strong> are currently separated across{' '}
              {selectedConflictToResolve.guestA.tableId
                ? `Table 0${selectedConflictToResolve.guestA.tableId}`
                : 'Unseated'}{' '}
              and{' '}
              {selectedConflictToResolve.guestB.tableId
                ? `Table 0${selectedConflictToResolve.guestB.tableId}`
                : 'Unseated'}
              .
            </p>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-[#8C7A72] tracking-wider block">
                Choose target table to place both guests:
              </span>

              {tables.map((tbl) => {
                const tableGuests = guests.filter((g) => g.tableId === tbl.id && g.rsvp === 'attending');
                const seatsOccupied = tableGuests.reduce((sum, g) => sum + g.partySize, 0);
                const isCurrentA = selectedConflictToResolve.guestA.tableId === tbl.id;
                const isCurrentB = selectedConflictToResolve.guestB.tableId === tbl.id;

                return (
                  <button
                    key={tbl.id}
                    onClick={() => handleResolveConflict(tbl.id)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#E5DAD1] hover:border-[#5A1E2D] text-left flex items-center justify-between text-xs transition group shadow-2xs"
                  >
                    <div>
                      <div className="font-serif text-base font-medium text-[#23211F] group-hover:text-[#5A1E2D]">
                        {tbl.name}
                      </div>
                      <span className="text-[11px] text-[#7A6B65]">
                        Occupied: {seatsOccupied} / {tbl.capacity} seats {isCurrentA ? '(Guest A seated here)' : isCurrentB ? '(Guest B seated here)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[#5A1E2D] font-semibold text-xs">
                      <span>Seat Both Here</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: DEDICATED VISUAL CONSTRAINT & AFFINITY GRAPH VIEW */}
      {showGraphModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative my-8">
            <button
              onClick={() => setShowGraphModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <GitMerge className="w-3.5 h-3.5" />
              <span>Visual Affinity & Conflict Graph</span>
            </div>
            <h3 className="font-serif text-3xl text-[#23211F] mt-1">
              Affinity Network & Constraint Verification
            </h3>
            <p className="text-xs text-[#7A6B65] mt-1 mb-6">
              Review all guest connection relationships at a glance. Conflicting pairs are highlighted with instant 1-click resolution.
            </p>

            {/* Network Connections Cards Grid */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {constraints.map((c) => {
                const guestA = guests.find((g) => g.id === c.guestAId);
                const guestB = guests.find((g) => g.id === c.guestBId);
                if (!guestA || !guestB) return null;

                const isTogether = c.type === 'must_sit_together';
                let isConflict = false;

                if (isTogether) {
                  isConflict =
                    guestA.tableId === null ||
                    guestB.tableId === null ||
                    guestA.tableId !== guestB.tableId;
                } else {
                  isConflict =
                    guestA.tableId !== null &&
                    guestB.tableId !== null &&
                    guestA.tableId === guestB.tableId;
                }

                return (
                  <div
                    key={c.id}
                    className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isConflict
                        ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400'
                        : 'bg-white border-[#E5DAD1]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                          isConflict ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {isConflict ? <AlertTriangle className="w-6 h-6" /> : <Link2 className="w-6 h-6" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg text-[#23211F]">
                            {guestA.name} <span className="text-[#8C7A72] font-sans text-xs">↔</span> {guestB.name}
                          </h4>
                        </div>

                        <div className="text-xs text-[#7A6B65] mt-0.5 flex flex-wrap gap-3">
                          <span>
                            <strong>{guestA.name.split(' ')[0]}:</strong>{' '}
                            {guestA.tableId ? `Table 0${guestA.tableId}` : 'Unseated'}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>{guestB.name.split(' ')[0]}:</strong>{' '}
                            {guestB.tableId ? `Table 0${guestB.tableId}` : 'Unseated'}
                          </span>
                        </div>

                        <div className="mt-1">
                          {isConflict ? (
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full inline-block">
                              ⚠️ Conflict: Required to sit together, but currently placed at different tables
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                              ✓ Satisfied: Seated together at Table 0{guestA.tableId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConflict && (
                        <button
                          onClick={() => {
                            setShowGraphModal(false);
                            setSelectedConflictToResolve({
                              constraint: c,
                              guestA,
                              guestB,
                            });
                          }}
                          className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-4 py-2 rounded-full font-medium transition shadow-xs"
                        >
                          Resolve Placement
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveConstraint(c.id)}
                        className="p-2 text-[#8C7A72] hover:text-rose-700 rounded-full hover:bg-white"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F0EAE3] flex justify-between items-center text-xs">
              <span className="text-[#7A6B65]">
                {activeConflicts.length === 0
                  ? 'All guest connections are in harmony.'
                  : `${activeConflicts.length} separation conflict(s) remaining.`}
              </span>
              <button
                onClick={() => setShowGraphModal(false)}
                className="bg-[#5A1E2D] text-white px-5 py-2 rounded-full font-medium"
              >
                Return to Canvas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CONFIGURE SEATING RULES */}
      {showConstraintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setShowConstraintModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Seating Rules
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-2">
              Seating Constraints & Affinities
            </h3>
            <p className="text-xs text-[#7A6B65] mb-6">
              Specify guests who must sit at the same table (partners/families) or who should be separated.
            </p>

            {/* List Existing Constraints */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
              {constraints.map((c) => {
                const guestA = guests.find((g) => g.id === c.guestAId);
                const guestB = guests.find((g) => g.id === c.guestBId);
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-white border border-[#E5DAD1] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#23211F]">
                        {guestA?.name || 'Guest A'} & {guestB?.name || 'Guest B'}
                      </span>
                      <span
                        className={`block text-[10px] font-semibold ${
                          c.type === 'must_sit_together' ? 'text-emerald-800' : 'text-rose-800'
                        }`}
                      >
                        {c.type === 'must_sit_together' ? '✓ Must Sit Together' : '✕ Must Separate Tables'}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveConstraint(c.id)}
                      className="p-1 text-[#8C7A72] hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add New Constraint Form */}
            <form onSubmit={handleCreateConstraint} className="space-y-3 border-t border-[#F0EAE3] pt-4 text-xs">
              <span className="font-semibold text-[#23211F] block">Add New Seating Rule</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#7A6B65] mb-1">First Guest</label>
                  <select
                    value={constraintGuestA}
                    onChange={(e) => setConstraintGuestA(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                  >
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#7A6B65] mb-1">Second Guest</label>
                  <select
                    value={constraintGuestB}
                    onChange={(e) => setConstraintGuestB(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                  >
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#7A6B65] mb-1">Rule Relationship</label>
                <select
                  value={constraintType}
                  onChange={(e) => setConstraintType(e.target.value as any)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-2.5 py-2 bg-white focus:outline-hidden"
                >
                  <option value="must_sit_together">Must Sit Together (Same Table)</option>
                  <option value="must_separate">Must Separate (Different Tables)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConstraintModal(false)}
                  className="px-4 py-2 border border-[#D9C3B0] bg-white rounded-full font-medium"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] text-white px-5 py-2 rounded-full font-medium hover:bg-[#471522]"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
