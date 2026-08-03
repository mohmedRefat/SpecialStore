import { useState } from 'react';

export default function AccountItemForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    product: '',
    sizeOrAmp: '',
    origin: '',
    price: '',
    qty: 1,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>➕ إضافة حركة للدفتر</h3>
      <div className="field">
        <label>المنتج</label>
        <input value={form.product} onChange={set('product')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>المقاس/الأمبير</label>
          <input value={form.sizeOrAmp} onChange={set('sizeOrAmp')} />
        </div>
        <div className="field">
          <label>المنشأ</label>
          <input value={form.origin} onChange={set('origin')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>سعر البيع</label>
          <input type="number" value={form.price} onChange={set('price')} />
        </div>
        <div className="field">
          <label>الكمية</label>
          <input type="number" value={form.qty} onChange={set('qty')} />
        </div>
      </div>
      <div className="field">
        <label>التاريخ</label>
        <input type="date" value={form.date} onChange={set('date')} />
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
