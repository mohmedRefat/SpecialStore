import { useState } from 'react';

export default function LoaderForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    brand: '', origin: '', size: '', qty: 0, threshold: 1, cost: '', wholesale: '', retail: '', place: '',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>➕ إضافة صنف لودر/زراعي</h3>
      <div className="field"><label>الصنف</label><input value={form.brand} onChange={set('brand')} /></div>
      <div className="field-row">
        <div className="field"><label>المنشأ</label><input value={form.origin} onChange={set('origin')} /></div>
        <div className="field"><label>المقاس</label><input value={form.size} onChange={set('size')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>الكمية</label><input type="number" value={form.qty} onChange={set('qty')} /></div>
        <div className="field"><label>الحد الأدنى</label><input type="number" value={form.threshold} onChange={set('threshold')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>سعر الشراء</label><input type="number" value={form.cost} onChange={set('cost')} /></div>
        <div className="field"><label>سعر جمله</label><input type="number" value={form.wholesale} onChange={set('wholesale')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>سعر قطاعي</label><input type="number" value={form.retail} onChange={set('retail')} /></div>
        <div className="field"><label>المورد</label><input value={form.place} onChange={set('place')} /></div>
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button className="btn primary" onClick={() => { onSave(form); onClose(); }}>حفظ</button>
      </div>
    </>
  );
}
