import { useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import { fmt, fuzzyMatch, stockStatus } from '../../utils/helpers.js';
import '../../styles/ledger.css';

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
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>سعر الشراء</th>
                <th>جملة</th>
                <th>قطاعي</th>
                <th>الكمية</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const st = stockStatus(h.qty, 0);
                return (
                  <tr key={h.id}>
                    <td className="ledger-strong sticky-col">{h.name}</td>
                    <td className="num">{fmt(h.cost)}</td>
                    <td className="num">{fmt(h.wholesale)}</td>
                    <td className="num">{fmt(h.retail)}</td>
                    <td className="num ledger-total">{h.qty}</td>
                    <td><span className={`pill ${st.cls}`}>{st.label}</span></td>
                    <td>
                      <div className="ledger-actions">
                        <button className="qty-btn" title="زوّد قطعة" onClick={() => onAdjust(h.id, 1)}>➕</button>
                        <button className="qty-btn" title="نقّص قطعة" onClick={() => onAdjust(h.id, -1)}>➖</button>
                        <button className="qty-btn danger" title="حذف" onClick={() => onDelete(h.id)}>🗑️</button>
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
