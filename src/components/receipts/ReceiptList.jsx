import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import ReceiptCard from './ReceiptCard.jsx';
import { fuzzyMatch, fmt } from '../../utils/helpers.js';

export default function ReceiptList({ receipts, onOpenAdd, onDelete }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => receipts.filter((r) => fuzzyMatch(query, r.name)).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [receipts, query]
  );
  const totalAmount = receipts.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAmount = receipts
    .filter((r) => r.receivedAt === todayStr)
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <>
      <StatStrip
        stats={[
          { value: receipts.length, label: 'عدد العمليات' },
          { value: fmt(todayAmount), label: 'المستلم النهارده', variant: 'gold' },
          { value: fmt(totalAmount), label: 'إجمالي المستلم', variant: 'success' },
        ]}
      />
      <SearchBar
        inputId="receipt-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم الشخص..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش عمليات استلام</div>
      ) : (
        <div>
          {filtered.map((r) => (
            <ReceiptCard key={r.id} receipt={r} onDelete={onDelete} />
          ))}
        </div>
      )}
    </>
  );
}
