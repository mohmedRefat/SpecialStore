import { useMemo, useState } from 'react';
import { addMonthToDate, fmt } from '../../utils/helpers.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function InstallmentForm({ onSave, onClose, title = '➕ عميل تقسيط جديد', placeholder }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    desc: '',
    total: '',
    down: '',
    installments: '',
    paid: 0,
    receivedDate: today(),
    date: '',
    frequency: 'monthly',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onReceivedChange = (e) => {
    const receivedDate = e.target.value;
    const next = { ...form, receivedDate };
    if (receivedDate && !form.date) {
      next.date = addMonthToDate(receivedDate);
    }
    setForm(next);
  };

  const preview = useMemo(() => {
    const total = Number(form.total) || 0;
    const down = Number(form.down) || 0;
    const count = Number(form.installments) || 0;
    if (count <= 0 || total <= down) return null;
    return Math.round((total - down) / count);
  }, [form.total, form.down, form.installments]);

  const canSave = form.name.trim() && Number(form.total) > 0 && Number(form.installments) > 0;

  return (
    <>
      <h3>{title}</h3>

      <div className="inst-form-section">بيانات العميل</div>
      <div className="field">
        <label>اسم العميل</label>
        <input value={form.name} onChange={set('name')} placeholder="مثال: كريم بشيتو" autoFocus />
      </div>
      <div className="field">
        <label>رقم الهاتف</label>
        <input value={form.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" dir="ltr" />
      </div>

      <div className="inst-form-section">المنتج والاستلام</div>
      <div className="field">
        <label>المنتج — كل صنف في سطر</label>
        <textarea
          rows={3}
          value={form.desc}
          onChange={set('desc')}
          placeholder={
            placeholder ||
            'مثال:\n2 جوز رفيلو فيتنامي 22.5\nجوز جينو سنجل فيتنامي 24'
          }
        />
      </div>
      <div className="field-row">
        <div className="field">
          <label>تاريخ استلام المنتج</label>
          <input type="date" value={form.receivedDate} onChange={onReceivedChange} />
        </div>
        <div className="field">
          <label>تاريخ أول قسط</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>

      <div className="inst-form-section">التفاصيل المالية</div>
      <div className="field-row">
        <div className="field">
          <label>الإجمالي</label>
          <input type="number" value={form.total} onChange={set('total')} placeholder="0" />
        </div>
        <div className="field">
          <label>المقدّم</label>
          <input type="number" value={form.down} onChange={set('down')} placeholder="0" />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>عدد الأقساط</label>
          <input type="number" value={form.installments} onChange={set('installments')} placeholder="5" min="1" />
        </div>
        <div className="field">
          <label>أقساط مدفوعة مسبقاً</label>
          <input type="number" value={form.paid} onChange={set('paid')} min="0" />
        </div>
      </div>
      <div className="field">
        <label>نوع القسط</label>
        <select value={form.frequency} onChange={set('frequency')}>
          <option value="monthly">شهري</option>
          <option value="weekly">أسبوعي</option>
        </select>
      </div>

      {preview !== null && (
        <div className="inst-form-preview">
          <span className="label">قيمة القسط المتوقعة</span>
          <span className="value num">{fmt(preview)}</span>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          disabled={!canSave}
          onClick={() => {
            if (!canSave) return;
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
