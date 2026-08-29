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
  onAddReceipt,
  onDeleteAccount,
  onDeleteItem,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptDesc, setReceiptDesc] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));

  const paidFor = (accountId) =>
    receipts.filter((r) => r.accountId === accountId).reduce((s, r) => s + (Number(r.amount) || 0), 0);

  // balance > 0 يعني العميل لسه عليه فلوس، balance < 0 يعني هو دفع أكتر من مشترياته (له رصيد فاضل)
  const accountsWithTotals = useMemo(
    () =>
      accounts.map((a) => {
        const total = itemsFor(a.id).reduce((s, i) => s + (Number(i.total) || 0), 0);
        const paid = paidFor(a.id);
        return { ...a, total, paid, balance: total - paid };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts, receipts]
  );

  const filtered = accountsWithTotals.filter((a) => fuzzyMatch(query, a.name));
  const selected = accountsWithTotals.find((a) => a.id === selectedId);

  const openAccount = (id) => {
    setSelectedId(id);
    setShowReceiptForm(false);
    setReceiptAmount('');
    setReceiptDesc('');
    setReceiptDate(new Date().toISOString().slice(0, 10));
  };

  const saveReceipt = () => {
    const amount = Number(receiptAmount) || 0;
    if (amount <= 0) return;
    onAddReceipt({
      name: selected.name,
      phone: '',
      amount,
      desc: receiptDesc,
      date: receiptDate,
      accountId: selected.id,
    });
    setShowReceiptForm(false);
    setReceiptAmount('');
    setReceiptDesc('');
  };

  /* ============ فتح دفتر عميل واحد ============ */
  if (selected) {
    const items = itemsFor(selected.id).sort((a, b) => (a.id < b.id ? 1 : -1));
    const hasCredit = selected.balance < 0; // دفع أكتر من إجمالي مشترياته
    const balanceAmount = Math.abs(selected.balance);

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
            { value: fmt(selected.total), label: 'إجمالي المشتريات' },
            { value: fmt(selected.paid), label: 'المدفوع', variant: 'success' },
            hasCredit
              ? { value: fmt(balanceAmount), label: 'رصيد متبقي له', variant: 'success' }
              : { value: fmt(balanceAmount), label: 'الباقي عليه', variant: 'warn' },
          ]}
        />

        <div className="item-actions" style={{ marginBottom: 12 }}>
          <button className="btn primary" onClick={() => onOpenAddItem(selected.id)}>➕ إضافة حركة</button>
          <button className="btn ghost" onClick={() => setShowReceiptForm((v) => !v)}>
            💵 استلام دفعة
          </button>
        </div>

        {showReceiptForm && (
          <div className="item-card" style={{ marginBottom: 16 }}>
            <div className="field-row">
              <div className="field">
                <label>المبلغ</label>
                <input
                  type="number"
                  value={receiptAmount}
                  onChange={(e) => setReceiptAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="field">
                <label>التاريخ</label>
                <input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>البيان (اختياري)</label>
              <input
                value={receiptDesc}
                onChange={(e) => setReceiptDesc(e.target.value)}
                placeholder="مثلاً: دفعة، تسوية حساب..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setShowReceiptForm(false)}>إلغاء</button>
              <button className="btn primary" onClick={saveReceipt}>حفظ</button>
            </div>
          </div>
        )}

        {hasCredit && (
          <div className="item-sub" style={{ marginBottom: 14, color: 'var(--success)' }}>
            💡 العميل ده دفع أكتر من إجمالي مشترياته الحالية — الفرق ({fmt(balanceAmount)}) هيتخصم تلقائي من أي مشتريات جديدة يضيفها.
          </div>
        )}

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
                <th>الباقي / الرصيد</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const hasCredit = a.balance < 0;
                const settled = a.balance === 0;
                const amount = Math.abs(a.balance);
                return (
                  <tr key={a.id} className="ledger-row-clickable" onClick={() => openAccount(a.id)}>
                    <td className="ledger-strong sticky-col">{a.name}</td>
                    <td className="num">{fmt(a.total)}</td>
                    <td className="num" style={{ color: 'var(--success)' }}>{fmt(a.paid)}</td>
                    <td className="num" style={{ color: hasCredit ? 'var(--success)' : settled ? 'var(--success)' : 'var(--danger)' }}>
                      {settled ? '—' : (hasCredit ? '+' : '') + fmt(amount)}
                    </td>
                    <td>
                      <span className={`pill ${hasCredit || settled ? 'success' : 'danger'}`}>
                        {hasCredit ? 'له رصيد' : settled ? 'متسوّى' : 'باقي عليه'}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}