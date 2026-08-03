import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import AccountCard from './AccountCard.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';

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

  if (selected) {
    const items = itemsFor(selected.id).sort((a, b) => (a.id < b.id ? 1 : -1));
    return (
      <>
        <button className="btn ghost" style={{ marginBottom: 14, width: 'auto', padding: '9px 18px' }} onClick={() => setSelectedId(null)}>
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
          items.map((i) => (
            <div className="item-card" key={i.id}>
              <div className="item-top">
                <div>
                  <div className="item-name">{i.product}</div>
                  <div className="item-sub">
                    {[i.sizeOrAmp, i.origin].filter(Boolean).join(' · ')}
                    {i.sizeOrAmp || i.origin ? ' · ' : ''}
                    {new Date(i.itemDate).toLocaleDateString('ar-EG')}
                  </div>
                </div>
                <span className="pill gold">{fmt(i.total)} ج</span>
              </div>
              <div className="item-grid">
                <div className="item-metric cost"><div className="k">الكمية</div><div className="v num">{i.qty}</div></div>
                <div className="item-metric wholesale"><div className="k">السعر</div><div className="v num">{fmt(i.price)}</div></div>
                <div className="item-metric retail"><div className="k">الإجمالي</div><div className="v num">{fmt(i.total)}</div></div>
              </div>
              <div className="item-actions">
                <button className="mini-btn" onClick={() => onDeleteItem(i.id)}>🗑️ حذف</button>
              </div>
            </div>
          ))
        )}
      </>
    );
  }

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
        filtered.map((a) => (
          <AccountCard
            key={a.id}
            account={a}
            total={a.total}
            paid={a.paid}
            remaining={a.remaining}
            onOpen={setSelectedId}
            onDelete={onDeleteAccount}
          />
        ))
      )}
    </>
  );
}
