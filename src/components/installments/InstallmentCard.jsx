import { fmt, computeInstallmentStatus } from '../../utils/helpers.js';

export default function InstallmentCard({ c, onLogPayment, onUndoPayment, onOpenDateForm }) {
  const pct = c.installments > 0 ? Math.min(100, Math.round((c.paid / c.installments) * 100)) : 0;
  const status = computeInstallmentStatus(c);
  const cls = status === 'متأخر' ? 'danger' : status === 'مسدد' ? 'success' : 'gold';
  const dateLabel = c.firstInstallmentDate
    ? new Date(c.firstInstallmentDate).toLocaleDateString('ar-EG')
    : 'لسه محدّدش';
  const descLines = (c.desc || '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="inst-card">
      <div className="inst-top">
        <div>
          <div className="inst-name">{c.name}</div>
          {c.phone && <div className="inst-phone">{c.phone}</div>}
          {descLines.length > 0 && (
            <div className="inst-desc">
              {descLines.map((line, i) => (
                <div key={i} className="inst-desc-line">🧾 {line}</div>
              ))}
            </div>
          )}
        </div>
        <span className={`pill ${cls}`}>
          {status === 'متأخر' ? '🔴' : status === 'مسدد' ? '✅' : '🟡'} {status}
        </span>
      </div>
      <div className="progress-wrap">
        <div className="progress-labels">
          <span>{c.paid} من {c.installments} قسط</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="inst-nums">
        <div>الإجمالي<b className="num">{fmt(c.total)}</b></div>
        <div>القسط الشهري<b className="num">{fmt(c.monthly)}</b></div>
        <div>المتبقي<b className="num" style={{ color: 'var(--danger)' }}>{fmt(c.remaining)}</b></div>
      </div>
      <div className="inst-date">
        📅 تاريخ أول قسط: {dateLabel}
        {c.lastPaymentDate ? ` · آخر دفعة: ${new Date(c.lastPaymentDate).toLocaleDateString('ar-EG')}` : ''}
      </div>
      <div className="inst-actions">
        <button className="btn ghost" onClick={() => onOpenDateForm(c.id)}>📅 تاريخ البداية</button>
        {c.paid > 0 && (
          <button className="btn ghost" onClick={() => onUndoPayment(c.id)}>↩️ تراجع</button>
        )}
        {status !== 'مسدد' && (
          <button className="btn primary" onClick={() => onLogPayment(c.id)}>✅ سجّل دفعة</button>
        )}
      </div>
    </div>
  );
}
