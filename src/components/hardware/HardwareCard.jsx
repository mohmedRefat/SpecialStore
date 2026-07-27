import { fmt, stockStatus } from '../../utils/helpers.js';

export default function HardwareCard({ item, onAdjust, onDelete }) {
  const st = stockStatus(item.qty, 0);
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{item.name}</div>
        </div>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost">
          <div className="k">سعر الشراء</div>
          <div className="v num">{fmt(item.cost)}</div>
        </div>
        <div className="item-metric wholesale">
          <div className="k">جمله</div>
          <div className="v num">{fmt(item.wholesale)}</div>
        </div>
        <div className="item-metric retail">
          <div className="k">قطاعي</div>
          <div className="v num">{fmt(item.retail)}</div>
        </div>
      </div>
      <div className="item-sub" style={{ marginTop: 8 }}>الكمية: {item.qty}</div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onAdjust(item.id, 1)}>➕ زوّد قطعة</button>
        <button className="mini-btn" onClick={() => onAdjust(item.id, -1)}>➖ نقّص قطعة</button>
        <button className="mini-btn" onClick={() => onDelete(item.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
