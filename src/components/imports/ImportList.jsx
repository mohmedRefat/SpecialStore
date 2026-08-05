import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import ImportCard from './ImportCard.jsx';
import { fmt } from '../../utils/helpers.js';

export default function ImportList({ imports, onOpenAdd, onDelete }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState(todayStr);

  const filtered = useMemo(
    () => imports.filter((i) => i.itemDate === dateFilter).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [imports, dateFilter]
  );
  const dayCost = filtered.reduce((s, i) => s + (Number(i.totalCost) || 0), 0);
  const dayQty = filtered.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  return (
    <>
      <StatStrip
        stats={[
          { value: filtered.length, label: 'عدد العمليات' },
          { value: dayQty, label: 'إجمالي القطع', variant: 'gold' },
          { value: fmt(dayCost), label: 'إجمالي التكلفة', variant: 'warn' },
        ]}
      />
      <div className="search-wrap">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="add-btn" onClick={onOpenAdd}>＋</button>
      </div>
      {filtered.length === 0 ? (
        <div className="empty">مفيش عمليات استيراد في اليوم ده</div>
      ) : (
        <div>
          {filtered.map((i) => (
            <ImportCard key={i.id} item={i} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
