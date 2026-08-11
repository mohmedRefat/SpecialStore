import { useState } from 'react';
import { fmt } from '../../utils/helpers.js';

export default function SalePaymentForm({ sale, onSave, onClose }) {
  const [amount, setAmount] = useState('');
  if (!sale) return null;

  const paidSoFar = sale.paidAmount === null || sale.paidAmount === undefined ? sale.total : Number(sale.paidAmount);
  const remaining = Math.max(0, Number(sale.total) - paidSoFar);

  return (
    <>
      <h3>💵 تسجيل دفعة — {sale.customerName || 'عميل بدون اسم'}</h3>
      <div className="item-sub" style={{ marginBottom: 12 }}>
        الإجمالي: <b>{fmt(sale.total)}</b> · مدفوع لحد دلوقتي: <b>{fmt(paidSoFar)}</b> · الباقي: <b style={{ color: 'var(--danger)' }}>{fmt(remaining)}</b>
      </div>
      <div className="field">
        <label>المبلغ اللي دفعه دلوقتي (ج.م)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`أقصى حاجة: ${remaining}`}
          autoFocus
        />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(Number(amount) || 0);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
