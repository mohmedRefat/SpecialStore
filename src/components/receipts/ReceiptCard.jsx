import { fmt } from '../../utils/helpers.js';

export default function ReceiptCard({ receipt, onDelete }) {
  return (
    <div className="inst-card">
      <div className="inst-top">
        <div>
          <div className="inst-name">{receipt.name}</div>
          {receipt.phone && <div className="inst-phone">{receipt.phone}</div>}
          {receipt.desc && <div className="inst-desc">🧾 {receipt.desc}</div>}
        </div>
        <span className="pill success">＋{fmt(receipt.amount)} ج</span>
      </div>
      <div className="inst-date">
        📅 {new Date(receipt.receivedAt).toLocaleDateString('ar-EG')}
      </div>
      <div className="inst-actions">
        <button className="btn ghost" onClick={() => onDelete(receipt.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
