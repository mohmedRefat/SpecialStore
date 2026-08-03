import { useState } from 'react';

export default function ImportForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    product: '',
    sizeOrAmp: '',
    origin: '',
    qty: '',
    unitCost: '',
    supplier: '',
    notes: '',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>📥 تسجيل استيراد</h3>
      <div className="field">
        <label>الصنف / البيان</label>
        <input value={form.product} onChange={set('product')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>الأمبير/المقاس</label>
          <input value={form.sizeOrAmp} onChange={set('sizeOrAmp')} />
        </div>
        <div className="field">
          <label>المنشأ</label>
          <input value={form.origin} onChange={set('origin')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>الكمية</label>
          <input type="number" value={form.qty} onChange={set('qty')} />
        </div>
        <div className="field">
          <label>تكلفة الوحدة</label>
          <input type="number" value={form.unitCost} onChange={set('unitCost')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>المورد</label>
          <input value={form.supplier} onChange={set('supplier')} />
        </div>
        <div className="field">
          <label>التاريخ</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>
      <div className="field">
        <label>ملاحظات (اختياري)</label>
        <input value={form.notes} onChange={set('notes')} />
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
