import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import InstallmentCard from './InstallmentCard.jsx';
import { fuzzyMatch, fmt, computeInstallmentStatus } from '../../utils/helpers.js';

export default function InstallmentList({ installments, onLogPayment, onUndoPayment, onOpenDateForm, onOpenAdd }) {
  const [query, setQuery] = useState('');
  const overdueCount = installments.filter((c) => computeInstallmentStatus(c) === 'متأخر').length;
  const totalOwed = installments.reduce((s, c) => s + (Number(c.remaining) || 0), 0);
  const filtered = installments.filter((c) => fuzzyMatch(query, c.name));

  return (
    <>
      <StatStrip
        stats={[
          { value: installments.length, label: 'عدد العملاء' },
          { value: overdueCount, label: 'متأخرين', variant: 'warn' },
          { value: fmt(totalOwed), label: 'إجمالي المتبقي', variant: 'gold' },
        ]}
      />
      <SearchBar
        inputId="inst-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم العميل..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش عملاء مطابقين</div>
      ) : (
        <div>
          {filtered.map((c) => (
            <InstallmentCard
              key={c.id}
              c={c}
              onLogPayment={onLogPayment}
              onUndoPayment={onUndoPayment}
              onOpenDateForm={onOpenDateForm}
            />
          ))}
        </div>
      )}
    </>
  );
}
