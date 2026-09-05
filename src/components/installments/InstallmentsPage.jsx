import { useMemo, useState } from "react";
import StatStrip from "../layout/StatStrip.jsx";
import SearchBar from "../layout/SearchBar.jsx";
import {
  fuzzyMatch,
  fmt,
  computeInstallmentStatus,
  computePaidAmount,
  computeListStatus,
  formatFullDate,
  generateInstallmentSchedule,
} from "../../utils/helpers.js";
import "../../styles/ledger.css";
import "../../styles/installments.css";

export default function InstallmentsPage({
  items,
  onOpenAdd,
  onOpenPaymentForm,
  onUndoPayment,
  onOpenDateForm,
  onDelete,
  kind, // 'light' (نص نقل) أو 'heavy' (نقل تقيل) — يحدد اتجاه زرار النقل
  onTransfer, // (customer) => Promise<boolean>
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const overdueCount = items.filter(
    (c) => computeInstallmentStatus(c) === "متأخر",
  ).length;
  const totalOwed = items.reduce((s, c) => s + (Number(c.remaining) || 0), 0);

  const filtered = useMemo(
    () =>
      items
        .filter((c) => fuzzyMatch(query, c.name))
        .filter((c) => !overdueOnly || computeInstallmentStatus(c) === "متأخر"),
    [items, query, overdueOnly],
  );

  const selected = items.find((c) => c.id === selectedId);

  if (selected) {
    const paidAmount = computePaidAmount(selected);
    const schedule = generateInstallmentSchedule(selected);
    const descLines = (selected.desc || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const isWeekly = selected.frequency === "weekly";
    const unitLabel = isWeekly ? "أسبوع" : "شهر";
    const targetLabel = kind === "heavy" ? "نص النقل" : "النقل التقيل";

    const handleTransfer = async () => {
      const ok = window.confirm(
        `متأكد إنك عايز تنقل "${selected.name}" لحسابات ${targetLabel}؟\n\nهيتشال من هنا بكل بياناته (المشتريات، الدفعات، الجدول) ويتحط هناك بالظبط.`,
      );
      if (!ok) return;
      const success = await onTransfer(selected);
      if (success) setSelectedId(null);
    };

    return (
      <>
        <button
          className="btn ghost inst-back-btn"
          onClick={() => setSelectedId(null)}
        >
          ▶ رجوع لكل العملاء
        </button>

        <div className="inst-detail-header">
          <div>
            <div className="section-title" style={{ marginTop: 0 }}>
              {selected.name}
            </div>
            {selected.phone && (
              <div className="inst-phone">{selected.phone}</div>
            )}
          </div>
          <span className={`pill ${computeListStatus(selected).cls}`}>
            {computeListStatus(selected).label}
          </span>
        </div>

        <div className="inst-product-box">
          <div className="inst-product-label">المنتج</div>
          {descLines.length > 0 ? (
            descLines.map((line, i) => (
              <div key={i} className="inst-product-line">
                {line}
              </div>
            ))
          ) : (
            <div className="inst-product-line muted">—</div>
          )}
          {selected.receivedDate && (
            <div className="inst-received">
              📦 تاريخ الاستلام: {formatFullDate(selected.receivedDate)}
            </div>
          )}
        </div>

        <StatStrip
          stats={[
            { value: fmt(selected.total), label: "الإجمالي" },
            { value: fmt(paidAmount), label: "المدفوع", variant: "success" },
            {
              value: fmt(selected.remaining),
              label: "الباقي",
              variant: "warn",
            },
            {
              value: `${selected.paid} / ${selected.installments}`,
              label: "الأقساط المدفوعة",
              variant: "gold",
            },
          ]}
        />

        <div className="inst-detail-meta">
          <span>
            قسط كل {unitLabel}: <b className="num">{fmt(selected.monthly)}</b>
          </span>
          <span>
            المقدّم: <b className="num">{fmt(selected.down)}</b>
          </span>
          {selected.firstInstallmentDate && (
            <span>
              أول قسط: <b>{formatFullDate(selected.firstInstallmentDate)}</b>
            </span>
          )}
        </div>

        <div
          className="item-actions"
          style={{ marginBottom: 16, flexWrap: "wrap", gap: 8 }}
        >
          {computeInstallmentStatus(selected) !== "مسدد" && (
            <button
              className="btn primary"
              onClick={() => onOpenPaymentForm(selected.id)}
            >
              ✅ سجّل دفعة
            </button>
          )}
          {selected.paid > 0 && (
            <button
              className="btn ghost"
              onClick={() => onUndoPayment(selected.id)}
            >
              ↩️ تراجع
            </button>
          )}
          <button
            className="btn ghost"
            onClick={() => onOpenDateForm(selected.id)}
          >
            📅 تاريخ البداية
          </button>
          {onTransfer && (
            <button className="btn ghost" onClick={handleTransfer}>
              🔁 نقل لـ{targetLabel}
            </button>
          )}
        </div>

        {schedule.length === 0 ? (
          <div className="empty">حدّد تاريخ أول قسط عشان يظهر الجدول</div>
        ) : (
          <div className="ledger-wrap">
            <table className="ledger-table inst-schedule-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>التاريخ</th>
                  <th>يوم الفعلي للدفع</th>
                  <th>الحالة</th>
                  <th>السداد</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr
                    key={row.index}
                    className={row.status === "متأخر" ? "inst-row-late" : ""}
                  >
                    <td className="num">{row.index}</td>
                    <td className="ledger-date">
                      {formatFullDate(row.dueDate)}
                    </td>
                    <td className="ledger-date">
                      {row.actualDate ? formatFullDate(row.actualDate) : "—"}
                    </td>
                    <td>
                      {row.status === "مسدد" ? (
                        <span className="pill success">مسدد</span>
                      ) : row.status === "متأخر" ? (
                        <span className="pill danger">متأخر</span>
                      ) : (
                        <span className="pill gold">جاري التقسيط</span>
                      )}
                    </td>
                    <td className="inst-settled">
                      {row.settled ? (
                        <span className="inst-check">✓</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <StatStrip
        stats={[
          { value: items.length, label: "عدد العملاء" },
          {
            value: overdueCount,
            label: overdueOnly ? "المتأخرين ✕" : "المتأخرين",
            variant: "warn",
            onClick: () => setOverdueOnly((v) => !v),
            active: overdueOnly,
          },
          { value: fmt(totalOwed), label: "إجمالي المتبقي", variant: "gold" },
        ]}
      />
      <SearchBar
        inputId="inst-search-input"
        value={query}
        onChange={setQuery}
        placeholder="🔎 دور باسم العميل..."
        onAdd={onOpenAdd}
      />
      {filtered.length === 0 ? (
        <div className="empty">
          {overdueOnly
            ? "مفيش متأخرين دلوقتي 👍"
            : "مفيش عملاء — دوس ＋ عشان تضيف عميل"}
        </div>
      ) : (
        <div className="ledger-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>اسم العميل</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>الباقي</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const listStatus = computeListStatus(c);
                const paidAmount = computePaidAmount(c);
                return (
                  <tr
                    key={c.id}
                    className="ledger-row-clickable"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="ledger-strong sticky-col">
                      {c.name}
                      {c.desc && (
                        <div className="inst-list-sub">
                          {(c.desc.split("\n")[0] || "").trim()}
                        </div>
                      )}
                    </td>
                    <td className="num">{fmt(c.total)}</td>
                    <td className="num" style={{ color: "var(--success)" }}>
                      {fmt(paidAmount)}
                    </td>
                    <td
                      className="num"
                      style={{
                        color:
                          Number(c.remaining) > 0
                            ? "var(--danger)"
                            : "var(--success)",
                      }}
                    >
                      {fmt(c.remaining)}
                    </td>
                    <td>
                      <span className={`pill ${listStatus.cls}`}>
                        {listStatus.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="mini-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                      >
                        🗑️
                      </button>
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
