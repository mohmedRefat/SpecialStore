import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SalesCard from './SalesCard.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';

function remainingFor(s) {
  const paid = s.paidAmount === null || s.paidAmount === undefined ? s.total : Number(s.paidAmount);
  return Math.max(0, Number(s.total) - paid);
}

export default function SalesList({ sales, onOpenAdd, onDelete, onOpenPaymentForm }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [query, setQuery] = useState('');
  const [owingOnly, setOwingOnly] = useState(false);

  // البحث بالاسم أو فلتر "اللي عليهم فلوس" بيدوروا في كل التواريخ،
  // مش بس اليوم المختار — عشان تقدر تلاقي عميل قديم بسهولة
  const isCrossDate = query.trim() !== '' || owingOnly;

  const filtered = useMemo(() => {
    let list = isCrossDate ? sales : sales.filter((s) => s.soldAt === dateFilter);
    list = list.filter((s) => fuzzyMatch(query, s.customerName));
    if (owingOnly) list = list.filter((s) => remainingFor(s) > 0);
    return list.sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [sales, dateFilter, query, owingOnly, isCrossDate]);

  const total = filtered.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const qty = filtered.reduce((s, x) => s + (Number(x.qty) || 0), 0);
  const totalRemaining = filtered.reduce((s, x) => s + remainingFor(x), 0);
  const allOwingCount = sales.filter((s) => remainingFor(s) > 0).length;

  return (
    <>
      <StatStrip
        stats={[
          { value: filtered.length, label: 'عدد العمليات' },
          { value: fmt(total), label: 'إجمالي المبيعات', variant: 'success' },
          {
            value: owingOnly ? fmt(totalRemaining) : allOwingCount,
            label: owingOnly ? 'باقي على العملاء (دوس تلغي)' : 'عليهم فلوس',
            variant: 'warn',
            onClick: () => setOwingOnly((v) => !v),
            active: owingOnly,
          },
        ]}
      />
      <div className="search-wrap">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="add-btn" onClick={onOpenAdd}>＋</button>
      </div>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="🔎 دور باسم العميل..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {isCrossDate && (
        <div className="item-sub" style={{ marginBottom: 10 }}>
          🔍 بتبحث في كل الأيام دلوقتي، مش بس {dateFilter}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="empty">
          {owingOnly ? 'مفيش حد عليه فلوس 👍' : 'مفيش مبيعات مطابقة'}
        </div>
      ) : (
        <div>
          {filtered.map((s) => (
            <SalesCard key={s.id} sale={s} onDelete={onDelete} onOpenPaymentForm={onOpenPaymentForm} />
          ))}
        </div>
      )}
    </>
  );
}