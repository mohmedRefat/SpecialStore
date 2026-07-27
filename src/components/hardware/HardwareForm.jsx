import { useState } from 'react';

export default function HardwareForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', qty: 0, cost: '', wholesale: '', retail: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>➕ إضافة صنف حديد</h3>
      <div className="field">
        <label>الصنف</label>
        <input value={form.name} onChange={set('name')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>سعر الشراء</label>
          <input type="number" value={form.cost} onChange={set('cost')} />
        </div>
        <div className="field">
          <label>الكمية</label>
          <input type="number" value={form.qty} onChange={set('qty')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>سعر البيع (جمله)</label>
          <input type="number" value={form.wholesale} onChange={set('wholesale')} />
        </div>
        <div className="field">
          <label>سعر البيع قطاعي</label>
          <input type="number" value={form.retail} onChange={set('retail')} />
        </div>
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
