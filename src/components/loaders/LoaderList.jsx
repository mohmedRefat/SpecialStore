import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import { fmt, fuzzyMatch, stockStatus } from '../../utils/helpers.js';
import '../../styles/ledger.css';

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
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>المنشأ</th>
                <th>المقاس</th>
                <th>سعر الشراء</th>
                <th>جملة</th>
                <th>قطاعي</th>
                <th>الكمية</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const st = stockStatus(l.qty, l.threshold);
                return (
                  <tr key={l.id}>
                    <td className="ledger-strong sticky-col">{l.brand}</td>
                    <td>{l.origin || '—'}</td>
                    <td>{l.size || '—'}</td>
                    <td className="num">{fmt(l.cost)}</td>
                    <td className="num">{fmt(l.wholesale)}</td>
                    <td className="num">{fmt(l.retail)}</td>
                    <td className="num ledger-total">{l.qty}</td>
                    <td><span className={`pill ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div className="ledger-actions">
                        <button className="qty-btn" title="زوّد قطعة" onClick={() => onAdjust(l.id, 1)}>➕</button>
                        <button className="qty-btn" title="نقّص قطعة" onClick={() => onAdjust(l.id, -1)}>➖</button>
                        <button className="qty-btn danger" title="حذف" onClick={() => onDelete(l.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
