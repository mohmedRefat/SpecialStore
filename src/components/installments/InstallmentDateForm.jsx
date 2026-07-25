import { useState } from 'react';

export default function InstallmentDateForm({ installment, onSave, onClose }) {
  const [date, setDate] = useState(installment?.firstInstallmentDate || '');
  if (!installment) return null;

  return (
    <>
      <h3>📅 تاريخ بداية القسط — {installment.name}</h3>
      <div className="field">
        <label>من امتى المفروض القسط يبدأ يتحسب؟</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(date);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
