import { useState } from 'react';

export default function EditInstallmentDescriptionForm({ installment, onSave, onClose }) {
  const [description, setDescription] = useState(installment?.desc || '');
  if (!installment) return null;

  return (
    <>
      <h3>✏️ تعديل وصف المنتج — {installment.name}</h3>
      <div className="field">
        <label>وصف المنتج — كل صنف في سطر</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          autoFocus
        />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(description);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
