import { useState } from 'react';
import { fmt } from '../../utils/helpers.js';

export default function PaymentAmountForm({ customer, onSave, onClose }) {
  const [amount, setAmount] = useState(customer?.monthly || '');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  if (!customer) return null;

  const isWeekly = customer.frequency === 'weekly';

  return (
    <>
      <h3>✅ تسجيل دفعة — {customer.name}</h3>
      <div className="item-sub" style={{ marginBottom: 12 }}>
        المتبقي عليه حاليًا: <b>{fmt(customer.remaining)}</b> ج.م
        {' · '}تسجيل القسط رقم <b>{Number(customer.paid || 0) + 1}</b> من <b>{customer.installments}</b>
        {customer.monthly ? ` · القسط ${isWeekly ? 'الأسبوعي' : 'الشهري'} المتوقع: ${fmt(customer.monthly)}` : ''}
      </div>
      <div className="field">
        <label>المبلغ اللي دفعه دلوقتي (ج.م)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>تاريخ تسجيل الدفعة</label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
        />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(Number(amount) || 0, paymentDate);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
