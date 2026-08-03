import { fmt } from '../../utils/helpers.js';

export default function ImportCard({ item, onDelete }) {
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{item.product}</div>
          <div className="item-sub">
            {[item.sizeOrAmp, item.origin].filter(Boolean).join(' · ')}
            {item.sizeOrAmp || item.origin ? ' · ' : ''}
            {new Date(item.itemDate).toLocaleDateString('ar-EG')}
          </div>
          {item.supplier && <div className="item-sub">المورد: {item.supplier}</div>}
        </div>
        <span className="pill gold">{fmt(item.totalCost)} ج</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost"><div className="k">الكمية</div><div className="v num">{item.qty}</div></div>
        <div className="item-metric wholesale"><div className="k">تكلفة الوحدة</div><div className="v num">{fmt(item.unitCost)}</div></div>
        <div className="item-metric retail"><div className="k">التكلفة الإجمالية</div><div className="v num">{fmt(item.totalCost)}</div></div>
      </div>
      {item.notes && <div className="item-sub" style={{ marginTop: 8 }}>📝 {item.notes}</div>}
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onDelete(item.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
