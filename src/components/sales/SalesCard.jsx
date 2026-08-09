import { fmt } from '../../utils/helpers.js';

const CATEGORY_LABELS = { tire: 'كاوتش', battery: 'بطارية', hardware: 'حديد', loader: 'لودر/زراعي', manual: 'يدوي' };
const PAYMENT_LABELS = { cash: 'نقدي', credit: 'آجل' };

export default function SalesCard({ sale, onDelete }) {
  const paid = sale.paidAmount === null || sale.paidAmount === undefined ? sale.total : Number(sale.paidAmount);
  const remaining = Math.max(0, Number(sale.total) - paid);

  return (
    <div className="item-card">
      <div className="item-top">
        <div>
          <div className="item-name">{sale.customerName || 'عميل بدون اسم'}</div>
          <div className="item-sub">
            {sale.customerPhone || '—'} · {new Date(sale.soldAt).toLocaleDateString('ar-EG')}
          </div>
          <div className="item-sub" style={{ marginTop: 2, whiteSpace: 'pre-line' }}>
            {sale.itemName} · {CATEGORY_LABELS[sale.itemType] || sale.itemType}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <span className={`pill ${sale.paymentMethod === 'credit' ? 'gold' : 'success'}`}>
            {PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}
          </span>
          {remaining > 0 && <span className="pill danger">باقي {fmt(remaining)}</span>}
        </div>
      </div>
      <div className="item-grid lg">
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