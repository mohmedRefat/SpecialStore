import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SalesCard from './SalesCard.jsx';
import { fmt } from '../../utils/helpers.js';

export default function SalesList({ sales, onOpenAdd, onDelete }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState(todayStr);

  const filtered = useMemo(
    () => sales.filter((s) => s.soldAt === dateFilter).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [sales, dateFilter]
  );
  const dayTotal = filtered.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const dayQty = filtered.reduce((s, x) => s + (Number(x.qty) || 0), 0);

  return (
    <>
      <StatStrip
        stats={[
          { value: filtered.length, label: 'عدد العمليات' },
          { value: dayQty, label: 'إجمالي القطع', variant: 'gold' },
          { value: fmt(dayTotal), label: 'إجمالي المبيعات', variant: 'success' },
        ]}
      />
      <div className="search-wrap">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="add-btn" onClick={onOpenAdd}>＋</button>
      </div>
      {filtered.length === 0 ? (
        <div className="empty">مفيش مبيعات في اليوم ده</div>
      ) : (
        <div>
          {filtered.map((s) => (
            <SalesCard key={s.id} sale={s} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
