import { useMemo, useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'tire', label: 'كاوتش' },
  { value: 'battery', label: 'بطارية' },
  { value: 'hardware', label: 'حديد' },
  { value: 'loader', label: 'لودر/زراعي' },
];

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'نقدي' },
  { value: 'credit', label: 'آجل' },
];

export default function SalesForm({ tires, batteries, hardware, loaders, onSave, onClose }) {
  const [form, setForm] = useState({
    itemType: 'tire',
    itemId: '',
    qty: 1,
    price: '',
    paidAmount: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
    paymentMethod: 'cash',
    notes: '',
  });

  const itemsForType = useMemo(() => {
    if (form.itemType === 'tire') return tires;
    if (form.itemType === 'battery') return batteries;
    if (form.itemType === 'loader') return loaders || [];
    return hardware;
  }, [form.itemType, tires, batteries, hardware, loaders]);

  const labelFor = (item) =>
    item.brand
      ? `${item.brand}${item.size ? ' - ' + item.size : ''}${item.amp ? ' - ' + item.amp + ' أمبير' : ''}`
      : item.name;

  const handleItemChange = (e) => {
    const id = e.target.value;
    const item = itemsForType.find((i) => i.id === id);
    setForm({ ...form, itemId: id, price: item?.retail ?? form.price });
  };

  const total = (Number(form.qty) || 0) * (Number(form.price) || 0);
  const remaining = total - (form.paidAmount === '' ? total : Number(form.paidAmount) || 0);

  return (
    <>
      <h3>💰 تسجيل عملية بيع</h3>

      <div className="field-row">
        <div className="field">
          <label>اسم العميل (اختياري)</label>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        </div>
        <div className="field">
          <label>رقم الهاتف (اختياري)</label>
          <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label>النوع</label>
        <select
          value={form.itemType}
          onChange={(e) => setForm({ ...form, itemType: e.target.value, itemId: '', price: '' })}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>الصنف</label>
        <select value={form.itemId} onChange={handleItemChange}>
          <option value="">اختار...</option>
          {itemsForType.map((i) => (
            <option key={i.id} value={i.id}>
              {labelFor(i)} (متاح: {i.qty})
            </option>
          ))}
        </select>
      </div>
      <div className="field-row">
        <div className="field">
          <label>الكمية</label>
          <input type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
        </div>
        <div className="field">
          <label>سعر البيع</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>طريقة الدفع</label>
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {PAYMENT_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>تاريخ البيع</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
      </div>

      {form.paymentMethod === 'credit' && (
        <div className="field">
          <label>المبلغ المدفوع دلوقتي (سيبها فاضية لو مفيش حاجة اتدفعت)</label>
          <input
            type="number"
            value={form.paidAmount}
            onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
            placeholder={`الإجمالي: ${total || 0}`}
          />
          {total > 0 && (
            <div className="cell-sub" style={{ marginTop: 6 }}>
              الباقي عليه بعد الحفظ: <b style={{ color: 'var(--danger)' }}>{Math.max(0, remaining)}</b>
            </div>
          )}
        </div>
      )}

      <div className="field">
        <label>ملاحظات (اختياري)</label>
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(form);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
