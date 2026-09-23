import { Fragment } from 'react';
import { fmt } from '../../utils/helpers.js';

function sortGroups(groups) {
  return [...groups].sort(([first], [second]) =>
    String(first || '—').localeCompare(String(second || '—'), 'ar', {
      numeric: true,
      sensitivity: 'base',
    })
  );
}

export default function StockTable({ items, groupLabel, getGroup, isBattery, onAdjust, onDelete, onEdit }) {
  const groups = new Map();
  items.forEach((item) => {
    const group = getGroup(item) || 'غير محدد';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  });

  return (
    <div className="stock-table-wrap">
      <table className="stock-table">
        <thead>
          <tr>
            <th>الصنف</th>
            <th>المنشأ</th>
            <th>{groupLabel}</th>
            <th>سعر الشراء</th>
            <th>سعر البيع</th>
            <th>الكمية</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {sortGroups(groups).map(([group, groupItems]) => (
            <Fragment key={`group-${group}`}>
              <tr className="stock-group-row">
                <th colSpan="7">{groupLabel}: {group} <span>{groupItems.length} أصناف</span></th>
              </tr>
              {groupItems.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="stock-name">{item.brand}</td>
                    <td>{item.origin || '—'}</td>
                    <td className="stock-emphasis">{isBattery ? `${item.amp} أمبير` : item.size}</td>
                    <td className="num">{fmt(item.cost)}</td>
                    <td className="num stock-wholesale">{fmt(item.wholesale)}</td>
                    <td className="stock-qty">{fmt(item.qty)}</td>
                    <td>
                      <div className="stock-actions">
                        <button className="stock-action" onClick={() => onAdjust(item.id, 1)} title="زيادة قطعة">＋</button>
                        <button className="stock-action" onClick={() => onAdjust(item.id, -1)} title="نقص قطعة">−</button>
                        <button className="stock-action" onClick={() => onEdit(item)} title="تعديل">✎</button>
                        <button className="stock-action danger" onClick={() => onDelete(item.id)} title="حذف">×</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}