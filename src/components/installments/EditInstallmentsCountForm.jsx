import { useState } from 'react';

export default function EditInstallmentsCountForm({ installment, onSave, onClose }) {
  const [count, setCount] = useState(installment?.installments || 1);
  if (!installment) return null;

  return (
    <>
      <h3>✏️ تعديل عدد الأقساط — {installment.name}</h3>
      <div className="item-sub" style={{ marginBottom: 12 }}>
        عدد الأقساط الحالي: <b>{installment.installments}</b> — دفع منهم <b>{installment.paid}</b>
      </div>
      <div className="field">
        <label>عدد الأقساط الجديد</label>
        <input
          type="number"
          min="1"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          autoFocus
        />
      </div>
      <div className="item-sub" style={{ marginBottom: 4 }}>
        ⚠️ ده بيغيّر قيمة "القسط" المرجعية بس (هتتحسب من جديد: المتبقي بعد المقدم ÷ العدد الجديد) —
        المبلغ المتبقي الفعلي عليه دلوقتي مش هيتغيّر.
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(Number(count) || 1);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
