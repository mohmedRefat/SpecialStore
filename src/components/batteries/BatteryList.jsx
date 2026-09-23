import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import StockTable from '../layout/StockTable.jsx';
import { fuzzyMatch } from '../../utils/helpers.js';

export default function BatteryList({ batteries, onAdjust, onDelete, onEdit, onOpenAdd }) {
  const [query, setQuery] = useState('');
  const low = batteries.filter((b) => b.qty <= 1).length;
  const totalQty = batteries.reduce((s, b) => s + (b.qty || 0), 0);
  const filtered = batteries.filter(
    (b) => fuzzyMatch(query, String(b.amp)) || fuzzyMatch(query, b.brand)
  );

  return (
    <>
      <StatStrip
        stats={[
          { value: batteries.length, label: 'عدد الأصناف' },
          { value: low, label: 'تحت الحد', variant: 'warn' },
          { value: totalQty, label: 'إجمالي القطع', variant: 'gold' },
        ]}
      />
      <SearchBar
        inputId="battery-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔋 دور بالأمبير أو اسم الماركة..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش نتايج مطابقة</div>
      ) : (
        <StockTable
          items={filtered}
          groupLabel="الأمبير"
          getGroup={(battery) => battery.amp}
          isBattery
          onAdjust={onAdjust}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
    </>
  );
}
