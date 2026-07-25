import { fmt, stockStatus } from '../../utils/helpers.js';

export default function BatteryCard({ battery, onAdjust, onDelete }) {
  const st = stockStatus(battery.qty, 1);
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{battery.brand}</div>
          <div className="item-sub">
            {battery.origin || '—'} · {battery.amp} أمبير
          </div>
        </div>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost">
          <div className="k">سعر الشراء</div>
          <div className="v num">{fmt(battery.cost)}</div>
        </div>
        <div className="item-metric wholesale">
          <div className="k">تجاري</div>
          <div className="v num">{fmt(battery.wholesale)}</div>
        </div>
        <div className="item-metric retail">
          <div className="k">قطاعي</div>
          <div className="v num">{fmt(battery.retail)}</div>
        </div>
      </div>
      <div className="item-sub" style={{ marginTop: 8 }}>الكمية: {battery.qty}</div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onAdjust(battery.id, 1)}>➕ زوّد قطعة</button>
        <button className="mini-btn" onClick={() => onAdjust(battery.id, -1)}>➖ نقّص قطعة</button>
        <button className="mini-btn" onClick={() => onDelete(battery.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
