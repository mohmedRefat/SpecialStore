import { useState } from 'react';

export default function HeavyInstallmentForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', phone: '', desc: '', total: '', down: '', installments: '', paid: 0, date: '', frequency: 'monthly',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>🚛 عميل نقل تقيل جديد</h3>
      <div className="field"><label>اسم العميل</label><input value={form.name} onChange={set('name')} /></div>
      <div className="field"><label>رقم الهاتف</label><input value={form.phone} onChange={set('phone')} /></div>
      <div className="field">
        <label>البيان (المنتجات) — اكتب كل صنف في سطر لوحده</label>
        <textarea
          rows={3}
          value={form.desc}
          onChange={set('desc')}
          placeholder={'مثال:\n6 كاوتش نقل 750/16\n2 بطارية 200 أمبير'}
        />
      </div>
      <div className="field-row">
        <div className="field"><label>الإجمالي المستحق</label><input type="number" value={form.total} onChange={set('total')} /></div>
        <div className="field"><label>المقدّم</label><input type="number" value={form.down} onChange={set('down')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>عدد الأقساط</label><input type="number" value={form.installments} onChange={set('installments')} /></div>
        <div className="field"><label>أقساط مدفوعة</label><input type="number" value={form.paid} onChange={set('paid')} /></div>
      </div>
      <div className="field">
        <label>نوع القسط</label>
        <select value={form.frequency} onChange={set('frequency')}>
          <option value="monthly">شهري</option>
          <option value="weekly">أسبوعي</option>
        </select>
      </div>
      <div className="field"><label>تاريخ أول قسط (سيبها فاضية لو لسه محدّدتش)</label><input type="date" value={form.date} onChange={set('date')} /></div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button className="btn primary" onClick={() => { onSave(form); onClose(); }}>حفظ</button>
      </div>
    </>
  );
}
