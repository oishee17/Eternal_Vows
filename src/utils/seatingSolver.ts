import { Guest, SeatingTable, SeatingConstraint } from '../types/wedding';

export interface SolverResult {
  assignments: Array<{ guestId: string; tableId: number; seatNumber: number }>;
  unassignedGuests: Guest[];
  metrics: {
    totalSeated: number;
    tablesUsed: number;
    constraintsSatisfied: number;
    constraintsViolated: number;
  };
}

export function solveSeatingArrangement(
  guests: Guest[],
  tables: SeatingTable[],
  constraints: SeatingConstraint[]
): SolverResult {
  // Only seat guests who are attending (or tentative if specified)
  const attendingGuests = guests.filter((g) => g.rsvp === 'attending');

  // Clone table capacity track
  const tableCapacityRemaining = new Map<number, number>();
  const tableOccupants = new Map<number, string[]>(); // tableId -> guestIds

  tables.forEach((t) => {
    tableCapacityRemaining.set(t.id, t.capacity);
    tableOccupants.set(t.id, []);
  });

  // Group guests by priority and category
  // Priority: VIP & Immediate Family first (to Table 1 / VIP table)
  const vipAndFamily = attendingGuests.filter((g) => g.category === 'VIP' || g.category === 'Family');
  const friends = attendingGuests.filter((g) => g.category === 'Friends');
  const colleagues = attendingGuests.filter((g) => g.category === 'Colleagues');
  const relatives = attendingGuests.filter((g) => g.category === 'Relatives');

  const orderedGuests = [...vipAndFamily, ...friends, ...colleagues, ...relatives];

  const assignments: Array<{ guestId: string; tableId: number; seatNumber: number }> = [];
  const unassigned: Guest[] = [];

  for (const guest of orderedGuests) {
    let assignedTableId: number | null = null;

    // 1. Check if guest has a 'must_sit_together' constraint with someone already seated
    const togetherConstraint = constraints.find(
      (c) => c.type === 'must_sit_together' && (c.guestAId === guest.id || c.guestBId === guest.id)
    );

    if (togetherConstraint) {
      const partnerId = togetherConstraint.guestAId === guest.id ? togetherConstraint.guestBId : togetherConstraint.guestAId;
      // Is partner already placed at a table?
      for (const [tId, occupantIds] of tableOccupants.entries()) {
        if (occupantIds.includes(partnerId)) {
          const cap = tableCapacityRemaining.get(tId) || 0;
          if (cap >= guest.partySize) {
            assignedTableId = tId;
            break;
          }
        }
      }
    }

    // 2. If not forced by partner, check VIP / Family preference for VIP tables
    if (!assignedTableId) {
      if (guest.category === 'VIP' || guest.category === 'Family') {
        const vipTable = tables.find((t) => t.isVip && (tableCapacityRemaining.get(t.id) || 0) >= guest.partySize);
        if (vipTable) {
          assignedTableId = vipTable.id;
        }
      }
    }

    // 3. If still not assigned, find table with same category members and NO 'must_separate' conflict
    if (!assignedTableId) {
      for (const table of tables) {
        const remainingCap = tableCapacityRemaining.get(table.id) || 0;
        if (remainingCap < guest.partySize) continue;

        const currentOccupants = tableOccupants.get(table.id) || [];

        // Check for separation conflict
        const hasConflict = constraints.some(
          (c) =>
            c.type === 'must_separate' &&
            ((c.guestAId === guest.id && currentOccupants.includes(c.guestBId)) ||
              (c.guestBId === guest.id && currentOccupants.includes(c.guestAId)))
        );

        if (hasConflict) continue;

        // Affinity bonus: Check if table has guests of same category
        const sameCategoryPresent = currentOccupants.some((occId) => {
          const occ = guests.find((g) => g.id === occId);
          return occ?.category === guest.category;
        });

        if (sameCategoryPresent || currentOccupants.length === 0) {
          assignedTableId = table.id;
          break;
        }
      }
    }

    // 4. Fallback to any table with enough space without conflict
    if (!assignedTableId) {
      for (const table of tables) {
        const remainingCap = tableCapacityRemaining.get(table.id) || 0;
        if (remainingCap >= guest.partySize) {
          const currentOccupants = tableOccupants.get(table.id) || [];
          const hasConflict = constraints.some(
            (c) =>
              c.type === 'must_separate' &&
              ((c.guestAId === guest.id && currentOccupants.includes(c.guestBId)) ||
                (c.guestBId === guest.id && currentOccupants.includes(c.guestAId)))
          );
          if (!hasConflict) {
            assignedTableId = table.id;
            break;
          }
        }
      }
    }

    if (assignedTableId) {
      const currentList = tableOccupants.get(assignedTableId) || [];
      const seatNum = currentList.length + 1;
      currentList.push(guest.id);
      tableOccupants.set(assignedTableId, currentList);
      tableCapacityRemaining.set(
        assignedTableId,
        (tableCapacityRemaining.get(assignedTableId) || 0) - guest.partySize
      );

      assignments.push({
        guestId: guest.id,
        tableId: assignedTableId,
        seatNumber: seatNum,
      });
    } else {
      unassigned.push(guest);
    }
  }

  // Calculate satisfied constraints
  let satisfied = 0;
  let violated = 0;
  for (const c of constraints) {
    const aAssignment = assignments.find((a) => a.guestId === c.guestAId);
    const bAssignment = assignments.find((a) => a.guestId === c.guestBId);

    if (aAssignment && bAssignment) {
      if (c.type === 'must_sit_together') {
        if (aAssignment.tableId === bAssignment.tableId) satisfied++;
        else violated++;
      } else if (c.type === 'must_separate') {
        if (aAssignment.tableId !== bAssignment.tableId) satisfied++;
        else violated++;
      }
    }
  }

  return {
    assignments,
    unassignedGuests: unassigned,
    metrics: {
      totalSeated: assignments.length,
      tablesUsed: Array.from(tableOccupants.values()).filter((arr) => arr.length > 0).length,
      constraintsSatisfied: satisfied,
      constraintsViolated: violated,
    },
  };
}
