import { fmt, stockStatus } from '../../utils/helpers.js';

export default function TireCard({ tire, onAdjust, onDelete }) {
  const st = stockStatus(tire.qty, tire.threshold);
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{tire.brand}</div>
          <div className="item-sub">
            {tire.origin || '—'} · مقاس {tire.size}
          </div>
        </div>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost">
          <div className="k">سعر الشراء</div>
          <div className="v num">{fmt(tire.cost)}</div>
        </div>
        <div className="item-metric wholesale">
          <div className="k">تجاري</div>
          <div className="v num">{fmt(tire.wholesale)}</div>
        </div>
        <div className="item-metric retail">
          <div className="k">قطاعي</div>
          <div className="v num">{fmt(tire.retail)}</div>
        </div>
      </div>
      <div className="item-sub" style={{ marginTop: 8 }}>
        الكمية: {tire.qty}
        {tire.place ? ` · عند: ${tire.place}` : ''}
      </div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onAdjust(tire.id, 1)}>➕ زوّد قطعة</button>
        <button className="mini-btn" onClick={() => onAdjust(tire.id, -1)}>➖ نقّص قطعة</button>
        <button className="mini-btn" onClick={() => onDelete(tire.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
