import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';
import '../../styles/ledger.css';

export default function AccountsPage({
  accounts,
  itemsFor,
  receipts,
  onOpenAddAccount,
  onOpenAddItem,
  onOpenReceipt,
  onDeleteAccount,
  onDeleteItem,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  const paidFor = (accountId) =>
    receipts.filter((r) => r.accountId === accountId).reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const accountsWithTotals = useMemo(
    () =>
      accounts.map((a) => {
        const total = itemsFor(a.id).reduce((s, i) => s + (Number(i.total) || 0), 0);
        const paid = paidFor(a.id);
        return { ...a, total, paid, remaining: Math.max(0, total - paid) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts, receipts]
  );

  const filtered = accountsWithTotals.filter((a) => fuzzyMatch(query, a.name));
  const selected = accountsWithTotals.find((a) => a.id === selectedId);

  /* ============ فتح دفتر عميل واحد ============ */
  if (selected) {
    const items = itemsFor(selected.id).sort((a, b) => (a.id < b.id ? 1 : -1));
    return (
      <>
        <button
          className="btn ghost"
          style={{ marginBottom: 14, width: 'auto', padding: '9px 18px' }}
          onClick={() => setSelectedId(null)}
        >
          ▶ رجوع لكل الحسابات
        </button>
        <div className="section-title">{selected.name}</div>
        <StatStrip
          stats={[
            { value: fmt(selected.total), label: 'الإجمالي' },
            { value: fmt(selected.paid), label: 'المدفوع', variant: 'success' },
            { value: fmt(selected.remaining), label: 'الباقي', variant: 'warn' },
          ]}
        />
        <div className="item-actions" style={{ marginBottom: 16 }}>
          <button className="btn primary" onClick={() => onOpenAddItem(selected.id)}>➕ إضافة حركة</button>
          <button className="btn ghost" onClick={() => onOpenReceipt(selected.id, selected.name)}>💵 استلام دفعة</button>
        </div>

        {items.length === 0 ? (
          <div className="empty">مفيش حركات مسجلة</div>
        ) : (
          <div className="ledger-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المنتج</th>
                  <th>المقاس/الأمبير</th>
                  <th>المنشأ</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td className="ledger-date">{new Date(i.itemDate).toLocaleDateString('ar-EG')}</td>
                    <td className="ledger-strong sticky-col">{i.product}</td>
                    <td>{i.sizeOrAmp || '—'}</td>
                    <td>{i.origin || '—'}</td>
                    <td className="num">{i.qty}</td>
                    <td className="num">{fmt(i.price)}</td>
                    <td className="num ledger-total">{fmt(i.total)}</td>
                    <td>
                      <button className="mini-btn" onClick={() => onDeleteItem(i.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="ledger-foot-label">الإجمالي الكلي</td>
                  <td className="num ledger-total">{fmt(selected.total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </>
    );
  }

  /* ============ جدول كل الحسابات ============ */
  return (
    <>
      <SearchBar
        inputId="account-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم العميل..."
        onAdd={onOpenAddAccount}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش حسابات لسه — دوس ＋ عشان تضيف عميل</div>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>الباقي</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="ledger-row-clickable" onClick={() => setSelectedId(a.id)}>
                  <td className="ledger-strong sticky-col">{a.name}</td>
                  <td className="num">{fmt(a.total)}</td>
                  <td className="num" style={{ color: 'var(--success)' }}>{fmt(a.paid)}</td>
                  <td className="num" style={{ color: a.remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {fmt(a.remaining)}
                  </td>
                  <td>
                    <span className={`pill ${a.remaining > 0 ? 'danger' : 'success'}`}>
                      {a.remaining > 0 ? 'باقي عليه' : 'متسوّى'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="mini-btn"
                      onClick={(e) => { e.stopPropagation(); onDeleteAccount(a.id); }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}