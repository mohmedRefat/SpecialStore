import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import SearchBar from '../layout/SearchBar.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';
import '../../styles/ledger.css';

export default function RetailersPage({
  accounts,
  itemsFor,
  receipts,
  onOpenAddAccount,
  onAddItem,
  onAddReceipt,
  onDeleteAccount,
  onDeleteItem,
  onDeleteReceipt,
}) {
  const showToast = useToast();
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');

  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptDesc, setReceiptDesc] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));

  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    product: '', sizeOrAmp: '', origin: '', price: '', qty: 1,
    date: new Date().toISOString().slice(0, 10),
  });
  const setItemField = (k) => (e) => setItemForm({ ...itemForm, [k]: e.target.value });

  const paidFor = (accountId) =>
    receipts.filter((r) => r.accountId === accountId).reduce((s, r) => s + (Number(r.amount) || 0), 0);

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

  const resetForms = () => {
    setShowReceiptForm(false);
    setReceiptAmount('');
    setReceiptDesc('');
    setReceiptDate(new Date().toISOString().slice(0, 10));
    setShowItemForm(false);
    setItemForm({ product: '', sizeOrAmp: '', origin: '', price: '', qty: 1, date: new Date().toISOString().slice(0, 10) });
  };

  const openAccount = (id) => {
    setSelectedId(id);
    resetForms();
  };

  const saveReceipt = () => {
    const amount = Number(receiptAmount) || 0;
    if (amount <= 0) {
      showToast('⚠️ اكتب مبلغ أكبر من صفر');
      return;
    }
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

  const saveItem = () => {
    if (!itemForm.product.trim()) {
      showToast('⚠️ اكتب اسم المنتج على الأقل');
      return;
    }
    onAddItem(selected.id, itemForm);
    setShowItemForm(false);
    setItemForm({ product: '', sizeOrAmp: '', origin: '', price: '', qty: 1, date: new Date().toISOString().slice(0, 10) });
  };

  /* ============ فتح دفتر تاجر واحد — دفتر حساب موحّد ============ */
  if (selected) {
    const items = itemsFor(selected.id);
    const receiptsForAccount = receipts.filter((r) => r.accountId === selected.id);

    // بندمج المنتجات والدفعات في جدول واحد، مرتبين بالتاريخ، وبنحسب "الباقي" كرصيد جاري
    // صف بصف — يعني ممكن يوم يبيع فيه بس، ويوم يدفع فيه بس، ويوم فيه الاتنين
    const entries = [
      ...items.map((i) => ({
        id: i.id,
        type: 'item',
        date: i.itemDate,
        qty: Number(i.qty) || 0,
        product: i.product,
        meta: [i.sizeOrAmp, i.origin].filter(Boolean).join(' · '),
        charged: Number(i.total) || 0,
        paid: 0,
      })),
      ...receiptsForAccount.map((r) => ({
        id: r.id,
        type: 'receipt',
        date: r.receivedAt,
        qty: null,
        product: r.desc || 'دفعة',
        meta: '',
        charged: 0,
        paid: Number(r.amount) || 0,
      })),
    ].sort((a, b) => {
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      if (da !== db) return da - db;
      return a.id < b.id ? -1 : 1;
    });

    let running = 0;
    const rows = entries.map((e) => {
      running += e.charged - e.paid;
      return { ...e, balance: running };
    });

    const hasCredit = selected.balance < 0;
    const balanceAmount = Math.abs(selected.balance);

    return (
      <>
        <button
          className="btn ghost"
          style={{ marginBottom: 14, width: 'auto', padding: '9px 18px' }}
          onClick={() => setSelectedId(null)}
        >
          ▶ رجوع لكل التجار
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
          <button className="btn primary" onClick={() => setShowItemForm((v) => !v)}>➕ إضافة حركة</button>
          <button className="btn ghost" onClick={() => setShowReceiptForm((v) => !v)}>💵 استلام دفعة</button>
        </div>

        {showItemForm && (
          <div className="item-card" style={{ marginBottom: 16 }}>
            <div className="field">
              <label>المنتج</label>
              <input value={itemForm.product} onChange={setItemField('product')} autoFocus />
            </div>
            <div className="field-row">
              <div className="field">
                <label>المقاس/الأمبير</label>
                <input value={itemForm.sizeOrAmp} onChange={setItemField('sizeOrAmp')} />
              </div>
              <div className="field">
                <label>المنشأ</label>
                <input value={itemForm.origin} onChange={setItemField('origin')} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>السعر</label>
                <input type="number" value={itemForm.price} onChange={setItemField('price')} />
              </div>
              <div className="field">
                <label>الكمية</label>
                <input type="number" value={itemForm.qty} onChange={setItemField('qty')} />
              </div>
            </div>
            <div className="field">
              <label>التاريخ</label>
              <input type="date" value={itemForm.date} onChange={setItemField('date')} />
            </div>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setShowItemForm(false)}>إلغاء</button>
              <button className="btn primary" onClick={saveItem}>حفظ</button>
            </div>
          </div>
        )}

        {showReceiptForm && (
          <div className="item-card" style={{ marginBottom: 16 }}>
            <div className="field-row">
              <div className="field">
                <label>المبلغ</label>
                <input type="number" value={receiptAmount} onChange={(e) => setReceiptAmount(e.target.value)} autoFocus />
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

        {rows.length === 0 ? (
          <div className="empty">مفيش حركات مسجلة</div>
        ) : (
          <div className="ledger-wrap ledger-detail-wrap">
            <div className="ledger-key" aria-label="مفتاح الحركات">
              <span className="ledger-key-item"><i /> شراء</span>
              <span className="ledger-key-receipt"><i /> دفعة مستلمة</span>
            </div>
            <table className="ledger-table ledger-detail-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الكمية</th>
                  <th>المنتج</th>
                  <th>إجمالي</th>
                  <th>واصل</th>
                  <th>الرصيد</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.type}-${r.id}`} className={`ledger-entry ledger-entry-${r.type}`}>
                    <td className="ledger-date">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                    <td className="num ledger-quantity">
                      {r.qty === null ? '—' : <span className="quantity-badge">{r.qty}</span>}
                    </td>
                    <td className="ledger-strong sticky-col">
                      <span className="ledger-entry-label">{r.type === 'item' ? 'شراء' : 'دفعة'}</span>
                      <span className="ledger-product">{r.product}</span>
                      {r.meta && <small className="ledger-meta">{r.meta}</small>}
                    </td>
                    <td className="num">{r.charged > 0 ? fmt(r.charged) : '—'}</td>
                    <td className="num">{r.paid > 0 ? fmt(r.paid) : '—'}</td>
                    <td className="num ledger-total" style={{ color: r.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {r.balance === 0 ? '—' : (r.balance < 0 ? '+' : '') + fmt(Math.abs(r.balance))}
                    </td>
                    <td>
                      <button
                        className="mini-btn"
                        onClick={() => (r.type === 'item' ? onDeleteItem(r.id) : onDeleteReceipt && onDeleteReceipt(r.id))}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="ledger-foot-label">الإجمالي</td>
                  <td className="num ledger-total">{fmt(selected.total)}</td>
                  <td className="num ledger-total">{fmt(selected.paid)}</td>
                  <td className="num ledger-total" style={{ color: hasCredit ? 'var(--success)' : 'var(--danger)' }}>
                    {(hasCredit ? '+' : '') + fmt(balanceAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </>
    );
  }

  /* ============ جدول كل التجار ============ */
  return (
    <>
      <SearchBar
        inputId="retailer-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم التاجر..."
        onAdd={onOpenAddAccount}
      />
      {filtered.length === 0 ? (
        <div className="empty">مفيش تجار لسه — دوس ＋ عشان تضيف تاجر</div>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>اسم التاجر</th>
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
                    <td className="num" style={{ color: hasCredit || settled ? 'var(--success)' : 'var(--danger)' }}>
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
