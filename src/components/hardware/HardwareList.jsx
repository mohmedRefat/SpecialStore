import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import HardwareCard from './HardwareCard.jsx';
import { fuzzyMatch } from '../../utils/helpers.js';

export default function HardwareList({ hardware, onAdjust, onDelete, onOpenAdd }) {
  const [query, setQuery] = useState('');
  const outOfStock = hardware.filter((h) => h.qty <= 0).length;
  const totalQty = hardware.reduce((s, h) => s + (h.qty || 0), 0);
  const filtered = hardware.filter((h) => fuzzyMatch(query, h.name));

  return (
    <>
      <StatStrip
        stats={[
          { value: hardware.length, label: 'عدد الأصناف' },
          { value: outOfStock, label: 'خلص من المخزن', variant: 'warn' },
          { value: totalQty, label: 'إجمالي القطع', variant: 'gold' },
        ]}
      />
      <SearchBar
        inputId="hardware-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم الصنف..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش نتايج مطابقة</div>
      ) : (
        <div>
          {filtered.map((h) => (
            <HardwareCard key={h.id} item={h} onAdjust={onAdjust} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
