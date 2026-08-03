import { useState } from 'react';

export default function AccountForm({ onSave, onClose }) {
  const [name, setName] = useState('');
  return (
    <>
      <h3>➕ حساب عميل جديد</h3>
      <div className="field">
        <label>اسم العميل</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="modal-actions">
        <button className="btn ghost" onClick={onClose}>إلغاء</button>
        <button
          className="btn primary"
          onClick={() => {
            onSave(name);
            onClose();
          }}
        >
          حفظ
        </button>
      </div>
    </>
  );
}
