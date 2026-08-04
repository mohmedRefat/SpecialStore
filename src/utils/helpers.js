/* ============ SHARED HELPERS ============ */
export const fmt = (n) =>
  n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString('ar-EG');

export function norm(s) {
  return String(s || '').replace(/[\/\s\-،,]/g, '').toLowerCase();
}

export function fuzzyMatch(query, target) {
  const q = norm(query);
  if (!q) return true;
  return norm(target).includes(q);
}

export function stockStatus(qty, threshold) {
  if (qty <= threshold) return { label: '⚠️ تحت الحد', cls: 'danger' };
  if (qty <= threshold * 1.3) return { label: '🔔 قريب', cls: 'gold' };
  return { label: '✅ متاح', cls: 'success' };
}

export function monthsElapsed(start, end) {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return Math.max(0, months);
}

export function weeksElapsed(start, end) {
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.floor(days / 7));
}

// c.frequency: 'monthly' (الافتراضي) أو 'weekly' — يحدد إيقاع استحقاق الأقساط
export function computeInstallmentStatus(c) {
  if (Number(c.remaining) <= 0) return 'مسدد';
  if (!c.firstInstallmentDate) return 'جاري';
  const start = new Date(c.firstInstallmentDate);
  const today = new Date();
  if (start > today) return 'جاري';
  const elapsed = c.frequency === 'weekly' ? weeksElapsed(start, today) : monthsElapsed(start, today);
  const expectedDue = Math.min(c.installments, elapsed + 1);
  if (Number(c.paid) < expectedDue) return 'متأخر';
  return 'جاري';
}
