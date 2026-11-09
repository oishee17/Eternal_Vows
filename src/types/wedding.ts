export type UserRole = 'couple' | 'guest' | 'vendor' | 'admin';

export type RSVPStatus = 'attending' | 'declined' | 'tentative' | 'pending';

export type GuestCategory = 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Relatives';

export type DietaryPreference = 'Standard' | 'Vegetarian' | 'Vegan' | 'Halal' | 'Kosher' | 'Gluten-Free' | 'Nut Allergy' | 'Other';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: GuestCategory;
  partySize: number;
  rsvp: RSVPStatus;
  accompanyingNames?: string[];
  dietary: DietaryPreference;
  dietaryRestrictions?: string[];
  dietaryNotes?: string;
  isSevereAllergy?: boolean;
  allergySeverity?: string;
  allergies?: string[];
  courseSelection?: { starter?: string; main?: string; entree?: string; dessert?: string };
  catererInstructions?: string;
  tableId: number | null;
  seatNumber?: number;
  inviteCode: string;
  invitationSent: boolean;
  notes?: string;
}

export interface SeatingTable {
  id: number;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangular';
  isVip?: boolean;
  zone: 'Lakeside' | 'Terrace' | 'Ballroom' | 'Garden';
}

export interface SeatingConstraint {
  id: string;
  guestAId: string;
  guestBId: string;
  type: 'must_sit_together' | 'must_separate';
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  iconName: string;
}

export interface ExpenseItem {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  vendorName?: string;
  amount: number;
  isPaid: boolean;
  dueDate?: string;
  invoiceUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface Ceremony {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  location: string;
  dressCode: string;
  description: string;
  specialInstructions: string;
  audienceFilter: 'all' | 'family' | 'vip' | 'friends';
}

export type AlbumCategory =
  | 'Bride'
  | 'Groom'
  | 'Couple portraits'
  | 'Family photographs'
  | 'Friends'
  | 'Wedding rituals'
  | 'Decorations'
  | 'Food and catering'
  | 'Candid moments';

export interface AlbumMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  uploaderName: string;
  uploaderRole: 'guest' | 'couple' | 'photographer';
  category: AlbumCategory;
  tags: string[];
  detectedFaces?: string[];
  isFavorite?: boolean;
  isFlagged?: boolean;
  timestamp: string;
  eventCeremonyId?: string;
}

export type VendorCategory =
  | 'Catering'
  | 'Photography'
  | 'Videography'
  | 'Decoration & Florals'
  | 'Wedding Venues'
  | 'Makeup & Styling'
  | 'Entertainment & Music'
  | 'Transportation'
  | 'Wedding Planning'
  | 'Stationery & Invitations';

export interface VendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: VendorCategory;
  location: string;
  startingPrice: number;
  portfolio: string[];
  description: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  availableDates: string[];
  reviews: Array<{ author: string; rating: number; comment: string; date: string }>;
}

export interface ServiceRequirement {
  id: string;
  category: VendorCategory;
  title: string;
  eventDate: string;
  eventLocation: string;
  budgetMin: number;
  budgetMax: number;
  duration: string;
  deliverables: string;
  specialRequirements: string;
  status: 'open' | 'awarded' | 'closed';
  createdAt: string;
}

export interface VendorBid {
  id: string;
  requirementId: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorVerified: boolean;
  category: VendorCategory;
  proposedPrice: number;
  includedServices: string[];
  additionalChargesNotes?: string;
  deliveryTimeline: string;
  terms: string;
  status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface WeddingTask {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  category: string;
}

export interface VendorMessage {
  id: string;
  bidId: string;
  sender: 'couple' | 'vendor';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface VowOrSpeech {
  id: string;
  title?: string;
  type: 'vows' | 'toast';
  role: 'Bride' | 'Groom' | 'Maid of Honor' | 'Best Man' | 'Parent' | 'Officiant';
  speakerName: string;
  recipientName: string;
  tone: string;
  keyMemories?: string;
  content: string;
  wordCount?: number;
  estimatedMinutes?: number;
  isRehearsed?: boolean;
  createdAt?: string;
}

export interface RunSheetItem {
  id: string;
  time: string;
  title: string;
  location: string;
  leadPerson: string;
  vendorContact?: string;
  phone?: string;
  notes?: string;
  priority: 'critical' | 'standard';
  isCompleted: boolean;
}

export interface SongRequest {
  id: string;
  songTitle: string;
  artist: string;
  requestedBy: string;
  ceremonyMoment:
    | 'Ceremony Walk'
    | 'Cocktail Hour'
    | 'First Dance'
    | 'Dinner Banquet'
    | 'Evening Party'
    | 'Late Night Dance'
    | 'Cake Cutting'
    | 'Bouquet Toss';
  dedicationMessage?: string;
  upvotes: number;
  status: 'pending' | 'approved' | 'played' | 'rejected' | 'queued' | 'blacklisted';
}

export interface RegistryItemContribution {
  id: string;
  contributorName: string;
  amount: number;
  message: string;
  timestamp: string;
}

export interface RegistryItem {
  id: string;
  title: string;
  category: 'Honeymoon Experience' | 'Home & Kitchen' | 'Cash Fund' | 'Charity Fund' | 'Custom';
  targetAmount: number;
  contributedAmount: number;
  imageUrl?: string;
  description: string;
  contributions: RegistryItemContribution[];
}

