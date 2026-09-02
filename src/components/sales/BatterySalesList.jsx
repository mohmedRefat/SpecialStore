import { useMemo, useState } from 'react';
import StatStrip from '../layout/StatStrip.jsx';
import { fmt, fuzzyMatch } from '../../utils/helpers.js';
import '../../styles/ledger.css';

const PAYMENT_LABELS = { cash: 'نقدي', credit: 'آجل' };

function remainingFor(s) {
  const paid = s.paidAmount === null || s.paidAmount === undefined ? s.total : Number(s.paidAmount);
  return Math.max(0, Number(s.total) - paid);
}

export default function BatterySalesList({ sales, batteries, onOpenAdd, onDelete }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [query, setQuery] = useState('');

  // بس بيع البطاريات (نوع الصنف = battery)
  const batterySales = useMemo(() => sales.filter((s) => s.itemType === 'battery'), [sales]);

  const isCrossDate = query.trim() !== '';
  const filtered = useMemo(() => {
    let list = isCrossDate ? batterySales : batterySales.filter((s) => s.soldAt === dateFilter);
    list = list.filter((s) => fuzzyMatch(query, s.customerName) || fuzzyMatch(query, s.itemName));
    return list.sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [batterySales, dateFilter, query, isCrossDate]);

  const dayTotal = filtered.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const dayQty = filtered.reduce((s, x) => s + (Number(x.qty) || 0), 0);
  const dayRemaining = filtered.reduce((s, x) => s + remainingFor(x), 0);

  // بيدوّر على الكمية الحالية في المخزون لصنف البطارية ده (لو لسه موجود ومربوط)
  const stockQtyFor = (sale) => {
    if (!sale.itemId) return null;
    const b = batteries.find((x) => x.id === sale.itemId);
    return b ? b.qty : null;
  };

  // بيدوّر على الأمبير من المخزون الحالي؛ لو الصنف اتمسح من المخزون بعدين،
  // بيحاول يطلعه من اسم الصنف المحفوظ وقت البيع (لو كان متسجل فيه)
  const ampFor = (sale) => {
    if (sale.itemId) {
      const b = batteries.find((x) => x.id === sale.itemId);
      if (b && b.amp) return b.amp;
    }
    const match = String(sale.itemName || '').match(/(\d+)\s*أمبير/);
    return match ? match[1] : null;
  };

  return (
    <>
      <StatStrip
        stats={[
          { value: filtered.length, label: 'عدد العمليات' },
          { value: dayQty, label: 'إجمالي القطع', variant: 'gold' },
          { value: fmt(dayTotal), label: 'إجمالي المبيعات', variant: 'success' },
          { value: fmt(dayRemaining), label: 'باقي على العملاء', variant: 'warn' },
        ]}
      />
      <div className="search-wrap">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        <button className="add-btn" onClick={onOpenAdd}>＋</button>
      </div>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="🔎 دور باسم العميل أو البطارية..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {isCrossDate && (
        <div className="item-sub" style={{ marginBottom: 10 }}>
          🔍 بتبحث في كل الأيام دلوقتي، مش بس {dateFilter}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">مفيش مبيعات بطاريات في اليوم ده</div>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>العميل</th>
                <th>البطارية</th>
                <th>الأمبير</th>
                <th>الكمية المباعة</th>
                <th>متبقي بالمخزن</th>
                <th>سعر البيع</th>
                <th>الإجمالي</th>
                <th>الدفع</th>
                <th>الباقي</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const rem = remainingFor(s);
                const stockQty = stockQtyFor(s);
                const amp = ampFor(s);
                return (
                  <tr key={s.id}>
                    <td className="ledger-date">{new Date(s.soldAt).toLocaleDateString('ar-EG')}</td>
                    <td className="ledger-strong sticky-col">
                      {s.customerName || 'عميل بدون اسم'}
                      {s.customerPhone && <div className="inst-list-sub">{s.customerPhone}</div>}
                    </td>
                    <td>{s.itemName}</td>
                    <td className="num">{amp ? `${amp} أمبير` : '—'}</td>
                    <td className="num">{s.qty}</td>
                    <td className="num" style={{ color: stockQty !== null && stockQty <= 1 ? 'var(--danger)' : undefined }}>
                      {stockQty !== null ? stockQty : '—'}
                    </td>
                    <td className="num">{fmt(s.price)}</td>
                    <td className="num ledger-total">{fmt(s.total)}</td>
                    <td>
                      <span className={`pill ${s.paymentMethod === 'credit' ? 'gold' : 'success'}`}>
                        {PAYMENT_LABELS[s.paymentMethod] || s.paymentMethod}
                      </span>
                    </td>
                    <td className="num" style={{ color: rem > 0 ? 'var(--danger)' : undefined }}>
                      {rem > 0 ? fmt(rem) : '—'}
                    </td>
                    <td>
                      <button className="mini-btn" onClick={() => onDelete(s.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}