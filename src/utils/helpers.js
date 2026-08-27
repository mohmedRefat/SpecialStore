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

export function computePaidAmount(c) {
  return Math.max(0, Number(c.total) - Number(c.remaining));
}

export function computeListStatus(c) {
  if (Number(c.remaining) <= 0) return { label: 'متسوّى', cls: 'success' };
  if (computeInstallmentStatus(c) === 'متأخر') return { label: 'متأخر', cls: 'danger' };
  return { label: 'باقي عليه', cls: 'warn' };
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
}

export function formatFullDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('ar-EG');
}

function addPeriod(baseDateStr, index, frequency) {
  const d = new Date(baseDateStr);
  if (frequency === 'weekly') {
    d.setDate(d.getDate() + index * 7);
  } else {
    d.setMonth(d.getMonth() + index);
  }
  return d.toISOString().slice(0, 10);
}

/** يولّد جدول الأقساط: تاريخ الاستحقاق، يوم الدفع الفعلي، الحالة، السداد */
export function generateInstallmentSchedule(c) {
  const count = Number(c.installments) || 0;
  const paid = Number(c.paid) || 0;
  if (!c.firstInstallmentDate || count <= 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const paymentDates = Array.isArray(c.paymentDates) ? c.paymentDates : [];

  return Array.from({ length: count }, (_, i) => {
    const dueDateStr = addPeriod(c.firstInstallmentDate, i, c.frequency || 'monthly');
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0);
    const isPaid = i < paid;
    let actualDate = '';
    if (isPaid) {
      actualDate = paymentDates[i] || (i === paid - 1 && c.lastPaymentDate ? c.lastPaymentDate : '');
    }
    let status = 'جاري التقسيط';
    if (isPaid) status = 'مسدد';
    else if (dueDate < today) status = 'متأخر';

    return {
      index: i + 1,
      dueDate: dueDateStr,
      actualDate,
      status,
      settled: isPaid,
    };
  });
}

export function addMonthToDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
