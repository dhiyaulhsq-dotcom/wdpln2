export type ChecklistPeriod =
  | '12_bulan'
  | '9_bulan'
  | '6_bulan'
  | '3_bulan'
  | '1_bulan'
  | '1_minggu'
  | 'hari_h';

export type Assignee =
  | 'Calon Pengantin Pria'
  | 'Calon Pengantin Wanita'
  | 'Keluarga'
  | 'Wedding Organizer'
  | 'Bersama';

export type Priority = 'rendah' | 'sedang' | 'tinggi';

export interface ChecklistItem {
  id: string;
  title: string;
  period: ChecklistPeriod;
  dueDate: string;
  assignee: Assignee;
  notes?: string;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
}

export type BudgetCategory =
  | 'Gedung/Venue'
  | 'Katering'
  | 'Dekorasi'
  | 'Rias & Busana'
  | 'Foto & Video'
  | 'Hiburan/MC'
  | 'Undangan & Souvenir'
  | 'Seserahan & Mahar'
  | 'Transportasi'
  | 'Akomodasi'
  | 'Dokumen & Administrasi'
  | 'Lain-lain';

export type PaymentStatus = 'Belum bayar' | 'DP' | 'Lunas';

export interface BudgetItem {
  id: string;
  name: string;
  category: BudgetCategory;
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate?: string;
  notes?: string;
}

export type GuestGroup =
  | 'Keluarga Pria'
  | 'Keluarga Wanita'
  | 'Teman'
  | 'Rekan Kerja'
  | 'VIP';

export type RsvpStatus = 'Belum diundang' | 'Diundang' | 'Hadir' | 'Tidak hadir';

export interface Guest {
  id: string;
  name: string;
  group: GuestGroup;
  pax: number;
  phone: string;
  rsvpStatus: RsvpStatus;
  tableId?: string;
  notes?: string;
  invitedAt?: string;
}

export type VendorCategory =
  | 'Venue'
  | 'Katering'
  | 'Dekor'
  | 'MUA'
  | 'Fotografer'
  | 'Videografer'
  | 'Musik/Band'
  | 'WO'
  | 'Lainnya';

export type VendorStatus = 'Prospek' | 'Negosiasi' | 'Deal' | 'Batal';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  whatsapp: string;
  instagram: string;
  quotationPrice: number;
  dealPrice?: number;
  status: VendorStatus;
  rating: number; // 1-5
  notes: string;
}

export interface RundownItem {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  location: string;
  pic: string;
  picPhone?: string;
  notes?: string;
  order: number;
}

export interface SeatingTable {
  id: string;
  name: string;
  shape: 'round' | 'rect';
  capacity: number;
  notes?: string;
}

export interface MoodboardItem {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  colorHex?: string;
  notes?: string;
}

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  category: string;
}

export interface CoupleProfile {
  groomName: string;
  brideName: string;
  groomNickname: string;
  brideNickname: string;
  weddingDate: string; // YYYY-MM-DD
  weddingTime: string; // e.g. "09:00 WIB"
  venueName: string;
  venueAddress: string;
  totalBudget: number;
  motto: string;
}

export interface WeddingData {
  couple: CoupleProfile;
  checklist: ChecklistItem[];
  budget: BudgetItem[];
  guests: Guest[];
  vendors: Vendor[];
  rundown: RundownItem[];
  tables: SeatingTable[];
  moodboards: MoodboardItem[];
  palette: PaletteColor[];
  notes: NoteItem[];
  invitationTemplate: string;
  darkMode: boolean;
}
