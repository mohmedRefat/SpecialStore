import { fmt, stockStatus } from '../../utils/helpers.js';

export default function LoaderCard({ item, onAdjust, onDelete }) {
  const st = stockStatus(item.qty, item.threshold);
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{item.brand}</div>
          <div className="item-sub">{item.origin || '—'} · مقاس {item.size}</div>
        </div>
        <span className={`pill ${st.cls}`}>{st.label}</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost"><div className="k">سعر الشراء</div><div className="v num">{fmt(item.cost)}</div></div>
        <div className="item-metric wholesale"><div className="k">جمله</div><div className="v num">{fmt(item.wholesale)}</div></div>
        <div className="item-metric retail"><div className="k">قطاعي</div><div className="v num">{fmt(item.retail)}</div></div>
      </div>
      <div className="item-sub" style={{ marginTop: 8 }}>
        الكمية: {item.qty}{item.place ? ` · المورد: ${item.place}` : ''}
      </div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onAdjust(item.id, 1)}>➕ زوّد قطعة</button>
        <button className="mini-btn" onClick={() => onAdjust(item.id, -1)}>➖ نقّص قطعة</button>
        <button className="mini-btn" onClick={() => onDelete(item.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
