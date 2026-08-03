import { useState } from 'react';

export default function ReceiptForm({ accounts = [], defaultAccountId = '', defaultName = '', onSave, onClose }) {
  const [form, setForm] = useState({
    name: defaultName,
    phone: '',
    amount: '',
    desc: '',
    date: new Date().toISOString().slice(0, 10),
    accountId: defaultAccountId,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <h3>💵 استلام مبلغ</h3>
      <div className="field">
        <label>اسم الشخص</label>
        <input value={form.name} onChange={set('name')} />
      </div>
      <div className="field-row">
        <div className="field">
          <label>رقم الهاتف (اختياري)</label>
          <input value={form.phone} onChange={set('phone')} />
        </div>
        <div className="field">
          <label>المبلغ</label>
          <input type="number" value={form.amount} onChange={set('amount')} />
        </div>
      </div>
      {!defaultAccountId && accounts.length > 0 && (
        <div className="field">
          <label>ربط بحساب عميل (اختياري)</label>
          <select value={form.accountId} onChange={set('accountId')}>
            <option value="">بدون ربط</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label>البيان (سبب الاستلام)</label>
        <input value={form.desc} onChange={set('desc')} placeholder="مثلاً: سلفة، دفعة، تسوية حساب..." />
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
