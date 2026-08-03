import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import ImportCard from './ImportCard.jsx';
import { fuzzyMatch, fmt } from '../../utils/helpers.js';

export default function ImportList({ imports, onOpenAdd, onDelete }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => imports.filter((i) => fuzzyMatch(query, i.product) || fuzzyMatch(query, i.supplier)).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [imports, query]
  );
  const totalCost = imports.reduce((s, i) => s + (Number(i.totalCost) || 0), 0);
  const totalQty = imports.reduce((s, i) => s + (Number(i.qty) || 0), 0);

  return (
    <>
      <StatStrip
        stats={[
          { value: imports.length, label: 'عدد العمليات' },
          { value: totalQty, label: 'إجمالي القطع', variant: 'gold' },
          { value: fmt(totalCost), label: 'إجمالي التكلفة', variant: 'warn' },
        ]}
      />
      <SearchBar
        inputId="import-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم الصنف أو المورد..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش عمليات استيراد</div>
      ) : (
        filtered.map((i) => <ImportCard key={i.id} item={i} onDelete={onDelete} />)
      )}
    </>
  );
}
