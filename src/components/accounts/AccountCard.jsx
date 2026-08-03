import { fmt } from '../../utils/helpers.js';

export default function AccountCard({ account, total, paid, remaining, onOpen, onDelete }) {
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{account.name}</div>
          <div className="item-sub">إجمالي: {fmt(total)} · مدفوع: {fmt(paid)}</div>
        </div>
        <span className={`pill ${remaining > 0 ? 'danger' : 'success'}`}>
          {remaining > 0 ? `باقي ${fmt(remaining)}` : 'متسوّى'}
        </span>
      </div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onOpen(account.id)}>📖 فتح الدفتر</button>
        <button className="mini-btn" onClick={() => onDelete(account.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
