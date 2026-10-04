import { Guest, SeatingTable } from '../types/wedding';

/**
 * Format number into Indonesian Rupiah format: Rp 1.500.000
 */
export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse input string into numeric value (handles "1500000", "Rp 1.500.000", "1.500.000")
 */
export function parseRupiahInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Indonesian month names
 */
const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const HARI_INDONESIA = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

/**
 * Format YYYY-MM-DD into Indonesian full date: "Sabtu, 12 Desember 2026"
 */
export function formatTanggalIndonesia(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  if (isNaN(dateObj.getTime())) return dateStr;

  const hari = HARI_INDONESIA[dateObj.getDay()];
  const bulan = BULAN_INDONESIA[dateObj.getMonth()];

  return `${hari}, ${day} ${bulan} ${year}`;
}

/**
 * Format YYYY-MM-DD into short Indonesian date: "12 Des 2026"
 */
export function formatTanggalSingkat(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  if (isNaN(dateObj.getTime())) return dateStr;

  const bulanShort = BULAN_INDONESIA[dateObj.getMonth()]?.substring(0, 3) || '';
  return `${day} ${bulanShort} ${year}`;
}

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalHours: number;
}

/**
 * Calculate countdown toward wedding date
 */
export function calculateCountdown(
  dateStr: string,
  timeStr: string = '08:00'
): CountdownResult {
  if (!dateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, totalHours: 0 };
  }

  // Parse time (e.g. "08:00 WIB" -> "08:00")
  const cleanTime = timeStr.replace(/[^0-9:]/g, '').slice(0, 5) || '08:00';
  const [targetHour, targetMin] = cleanTime.split(':').map((x) => parseInt(x, 10) || 0);

  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
  const targetDate = new Date(y, m - 1, d, targetHour, targetMin, 0);

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalHours: 0 };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  return { days, hours, minutes, seconds, isPast: false, totalHours };
}

/**
 * Generate CSV text for guest list
 */
export function generateGuestCsv(guests: Guest[], tables: SeatingTable[]): string {
  const tableMap = new Map(tables.map((t) => [t.id, t.name]));

  const headers = [
    'Nama Tamu',
    'Kelompok',
    'Jumlah Orang (Pax)',
    'Nomor WhatsApp',
    'Status RSVP',
    'Meja',
    'Catatan / Alergi',
  ];

  const escapeField = (val: string | number | undefined) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = guests.map((g) => [
    escapeField(g.name),
    escapeField(g.group),
    escapeField(g.pax),
    escapeField(g.phone),
    escapeField(g.rsvpStatus),
    escapeField(g.tableId ? tableMap.get(g.tableId) || g.tableId : '-'),
    escapeField(g.notes || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Parse CSV text into partial guests
 */
export function parseGuestCsv(csvText: string): Array<{
  name: string;
  group: Guest['group'];
  pax: number;
  phone: string;
  rsvpStatus: Guest['rsvpStatus'];
  notes: string;
}> {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const results: Array<{
    name: string;
    group: Guest['group'];
    pax: number;
    phone: string;
    rsvpStatus: Guest['rsvpStatus'];
    notes: string;
  }> = [];

  // Parse lines taking care of quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells: string[] = [];
    let cur = '';
    let inQuote = false;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        if (inQuote && line[c + 1] === '"') {
          cur += '"';
          c++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());

    if (cells[0]) {
      const name = cells[0];
      const rawGroup = cells[1] || 'Teman';
      const pax = parseInt(cells[2], 10) || 1;
      const phone = cells[3] || '';
      const rawRsvp = cells[4] || 'Belum diundang';
      const notes = cells[6] || cells[5] || '';

      const validGroups: Guest['group'][] = [
        'Keluarga Pria',
        'Keluarga Wanita',
        'Teman',
        'Rekan Kerja',
        'VIP',
      ];
      const validRsvp: Guest['rsvpStatus'][] = [
        'Belum diundang',
        'Diundang',
        'Hadir',
        'Tidak hadir',
      ];

      const group = validGroups.find(
        (g) => g.toLowerCase() === rawGroup.toLowerCase()
      ) || 'Teman';

      const rsvpStatus = validRsvp.find(
        (r) => r.toLowerCase() === rawRsvp.toLowerCase()
      ) || 'Belum diundang';

      results.push({
        name,
        group,
        pax: Math.max(1, pax),
        phone,
        rsvpStatus,
        notes,
      });
    }
  }

  return results;
}

/**
 * Trigger file download helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
