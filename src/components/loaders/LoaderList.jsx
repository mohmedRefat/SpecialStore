import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import LoaderCard from './LoaderCard.jsx';
import { fuzzyMatch } from '../../utils/helpers.js';

export default function LoaderList({ loaders, onAdjust, onDelete, onOpenAdd }) {
  const [query, setQuery] = useState('');
  const low = loaders.filter((l) => l.qty <= l.threshold).length;
  const totalQty = loaders.reduce((s, l) => s + (l.qty || 0), 0);
  const filtered = loaders.filter((l) => fuzzyMatch(query, l.size) || fuzzyMatch(query, l.brand));

  return (
    <>
      <StatStrip
        stats={[
          { value: loaders.length, label: 'عدد الأصناف' },
          { value: low, label: 'تحت الحد', variant: 'warn' },
          { value: totalQty, label: 'إجمالي القطع', variant: 'gold' },
        ]}
      />
      <SearchBar
        inputId="loader-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور بالمقاس أو اسم الصنف..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش نتايج مطابقة</div>
      ) : (
        <div>
          {filtered.map((l) => (
            <LoaderCard key={l.id} item={l} onAdjust={onAdjust} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
