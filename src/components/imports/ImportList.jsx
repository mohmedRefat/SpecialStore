import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import ImportCard from './ImportCard.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';

export default function ImportList({ imports, onOpenAdd, onDelete }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [query, setQuery] = useState('');
  const isCrossDate = query.trim() !== '';

  const filtered = useMemo(() => {
    const list = isCrossDate ? imports : imports.filter((i) => i.itemDate === dateFilter);
    return list
      .filter((i) => fuzzyMatch(query, i.product) || fuzzyMatch(query, i.sizeOrAmp))
      .sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [imports, dateFilter, query, isCrossDate]);
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
      <div className="search-wrap">
        <input
          type="text"
          placeholder="🔎 دور باسم المنتج أو المقاس..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {isCrossDate && (
        <div className="item-sub" style={{ marginBottom: 10 }}>
          🔍 بتبحث في كل أيام الاستيراد، مش بس {dateFilter}
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="empty">مفيش عمليات استيراد مطابقة للبحث</div>
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
