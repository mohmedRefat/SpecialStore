import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import TireCard from './TireCard.jsx';
import { fuzzyMatch } from '../../utils/helpers.js';

export default function TireList({ tires, onAdjust, onDelete, onOpenAdd }) {
  const [query, setQuery] = useState('');
  const low = tires.filter((t) => t.qty <= t.threshold).length;
  const totalQty = tires.reduce((s, t) => s + (t.qty || 0), 0);
  const filtered = tires.filter((t) => fuzzyMatch(query, t.size) || fuzzyMatch(query, t.brand));

  return (
    <>
      <StatStrip
        stats={[
          { value: tires.length, label: 'عدد الأصناف' },
          { value: low, label: 'تحت الحد', variant: 'warn' },
          { value: totalQty, label: 'إجمالي القطع', variant: 'gold' },
        ]}
      />
      <SearchBar
        inputId="tire-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور بالمقاس أو اسم الماركة..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش نتايج مطابقة</div>
      ) : (
        <div>
          {filtered.map((t) => (
            <TireCard key={t.id} tire={t} onAdjust={onAdjust} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
