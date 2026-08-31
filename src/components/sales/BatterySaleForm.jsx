import { useState } from 'react';

export default function BatterySaleForm({ batteries, onSave, onClose }) {
  const [form, setForm] = useState({
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

  const labelFor = (b) => `${b.brand}${b.amp ? ' - ' + b.amp + ' أمبير' : ''}${b.origin ? ' (' + b.origin + ')' : ''}`;

  const handleItemChange = (e) => {
    const id = e.target.value;
    const item = batteries.find((b) => b.id === id);
    setForm({ ...form, itemId: id, price: item?.retail ?? form.price });
  };

  const total = (Number(form.qty) || 0) * (Number(form.price) || 0);
  const remaining = total - (form.paidAmount === '' ? total : Number(form.paidAmount) || 0);
  const selectedBattery = batteries.find((b) => b.id === form.itemId);

  return (
    <>
      <h3>🔋 تسجيل بيع بطارية</h3>

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
        <label>البطارية</label>
        <select value={form.itemId} onChange={handleItemChange}>
          <option value="">اختار...</option>
          {batteries.map((b) => (
            <option key={b.id} value={b.id}>
              {labelFor(b)} (متاح: {b.qty})
            </option>
          ))}
        </select>
      </div>
      {selectedBattery && selectedBattery.qty <= 0 && (
        <div className="item-sub" style={{ color: 'var(--danger)', marginBottom: 10 }}>
          ⚠️ الصنف ده خلص من المخزون
        </div>
      )}

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
            <option value="cash">نقدي</option>
            <option value="credit">آجل</option>
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
            onSave({ ...form, itemType: 'battery', mode: 'stock' });
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
