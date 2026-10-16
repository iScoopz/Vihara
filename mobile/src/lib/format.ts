// All dates are shown in WITA (Asia/Makassar, UTC+8, no daylight saving), like the web app.

export const TIME_ZONE = 'Asia/Makassar';
const WITA_OFFSET_MS = 8 * 60 * 60 * 1000;

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const WEEKDAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export type WitaParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

let formatter: Intl.DateTimeFormat | null | undefined;
function getFormatter() {
  if (formatter !== undefined) return formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
      weekday: 'short',
    });
  } catch {
    formatter = null;
  }
  return formatter;
}

const WEEKDAY_EN: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Calendar parts of a moment as seen in WITA. month is 0-based. */
export function witaParts(input: string | number | Date): WitaParts {
  const date = input instanceof Date ? input : new Date(input);
  const f = getFormatter();
  if (f) {
    try {
      const parts: Record<string, string> = {};
      for (const p of f.formatToParts(date)) parts[p.type] = p.value;
      return {
        year: Number(parts.year),
        month: Number(parts.month) - 1,
        day: Number(parts.day),
        hour: Number(parts.hour) % 24,
        minute: Number(parts.minute),
        weekday: WEEKDAY_EN[parts.weekday] ?? 0,
      };
    } catch {
      // fall through to the fixed offset below
    }
  }
  // Engines without time zone data: WITA has a fixed offset, so plain arithmetic is exact.
  const shifted = new Date(date.getTime() + WITA_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-10-16" in WITA, used as a stable key for calendar days. */
export function dayKey(input: string | number | Date) {
  const p = witaParts(input);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

export function keyOf(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function formatTime(input: string) {
  const p = witaParts(input);
  return `${pad(p.hour)}.${pad(p.minute)}`;
}

/** "Sabtu, 1 Agustus 2026" */
export function formatLongDate(input: string) {
  const p = witaParts(input);
  return `${WEEKDAYS[p.weekday]}, ${p.day} ${MONTHS[p.month]} ${p.year}`;
}

/** "1 Agu 2026" */
export function formatShortDate(input: string) {
  const p = witaParts(input);
  return `${p.day} ${MONTHS_SHORT[p.month]} ${p.year}`;
}

/** "08.00 - 11.30 WITA", or a date range when the event spans several days. */
export function formatTimeRange(start: string, end?: string | null) {
  if (!end) return `${formatTime(start)} WITA`;
  if (dayKey(start) === dayKey(end)) return `${formatTime(start)} - ${formatTime(end)} WITA`;
  return `${formatShortDate(start)} ${formatTime(start)} sampai ${formatShortDate(end)} ${formatTime(end)} WITA`;
}

export function greeting(now = new Date()) {
  const h = witaParts(now).hour;
  if (h >= 4 && h < 11) return 'Selamat pagi';
  if (h >= 11 && h < 15) return 'Selamat siang';
  if (h >= 15 && h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export function rupiah(amount: number) {
  const rounded = Math.round(amount);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rounded < 0 ? '-' : ''}Rp ${digits}`;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Indonesian numbers to international form for wa.me links: 0812... -> 62812... */
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function telNumber(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}
