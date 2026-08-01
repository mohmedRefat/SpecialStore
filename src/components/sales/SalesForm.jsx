import { useMemo, useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'tire', label: 'كاوتش' },
  { value: 'battery', label: 'بطارية' },
  { value: 'hardware', label: 'حديد' },
];

export default function SalesForm({ tires, batteries, hardware, onSave, onClose }) {
  const [form, setForm] = useState({
    itemType: 'tire',
    itemId: '',
    qty: 1,
    price: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
  });

  const itemsForType = useMemo(() => {
    if (form.itemType === 'tire') return tires;
    if (form.itemType === 'battery') return batteries;
    return hardware;
  }, [form.itemType, tires, batteries, hardware]);

  const labelFor = (item) =>
    item.brand
      ? `${item.brand}${item.size ? ' - ' + item.size : ''}${item.amp ? ' - ' + item.amp + ' أمبير' : ''}`
      : item.name;

  const handleItemChange = (e) => {
    const id = e.target.value;
    const item = itemsForType.find((i) => i.id === id);
    setForm({ ...form, itemId: id, price: item?.retail ?? form.price });
  };

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
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
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
      <div className="field">
        <label>تاريخ البيع</label>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
