import { fmt } from '../../utils/helpers.js';

const CATEGORY_LABELS = { tire: 'كاوتش', battery: 'بطارية', hardware: 'حديد' };

export default function SalesCard({ sale, onDelete }) {
  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{sale.itemName}</div>
          <div className="item-sub">
            {CATEGORY_LABELS[sale.itemType] || sale.itemType} · {new Date(sale.soldAt).toLocaleDateString('ar-EG')}
          </div>
          {(sale.customerName || sale.customerPhone) && (
            <div className="item-sub" style={{ marginTop: 2 }}>
              {sale.customerName || 'بدون اسم'}
              {sale.customerPhone ? ` · ${sale.customerPhone}` : ''}
            </div>
          )}
        </div>
        <span className="pill success">{fmt(sale.total)} ج</span>
      </div>
      <div className="item-grid">
        <div className="item-metric cost">
          <div className="k">الكمية</div>
          <div className="v num">{sale.qty}</div>
        </div>
        <div className="item-metric wholesale">
          <div className="k">سعر البيع</div>
          <div className="v num">{fmt(sale.price)}</div>
        </div>
        <div className="item-metric retail">
          <div className="k">الإجمالي</div>
          <div className="v num">{fmt(sale.total)}</div>
        </div>
      </div>
      <div className="item-actions">
        <button className="mini-btn" onClick={() => onDelete(sale.id)}>🗑️ حذف</button>
      </div>
    </div>
  );
}
