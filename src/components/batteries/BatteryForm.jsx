import { useState } from 'react';

export default function BatteryForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    brand: '',
    origin: '',
    amp: '',
    qty: 0,
    cost: '',
    wholesale: '',
    retail: '',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>➕ إضافة بطارية</h3>
      <div className="field">
        <label>الماركة</label>
        <input value={form.brand} onChange={set('brand')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>المنشأ</label>
          <input value={form.origin} onChange={set('origin')} />
        </div>
        <div className="field">
          <label>الأمبير</label>
          <input type="number" value={form.amp} onChange={set('amp')} />
        </div>
      </div>
      <div className="field">
        <label>الكمية</label>
        <input type="number" value={form.qty} onChange={set('qty')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>سعر الشراء</label>
          <input type="number" value={form.cost} onChange={set('cost')} />
        </div>
        <div className="field">
          <label>سعر تجاري</label>
          <input type="number" value={form.wholesale} onChange={set('wholesale')} />
        </div>
      </div>
      <div className="field">
        <label>سعر قطاعي</label>
        <input type="number" value={form.retail} onChange={set('retail')} />
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
