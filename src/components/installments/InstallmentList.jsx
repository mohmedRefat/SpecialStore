import { useState } from "react";
import StatStrip from "../layout/StatStrip.jsx";
import SearchBar from "../layout/SearchBar.jsx";
import InstallmentCard from "./InstallmentCard.jsx";
import {
  fuzzyMatch,
  fmt,
  computeInstallmentStatus,
} from "../../utils/helpers.js";

export default function InstallmentList({
  installments,
  onOpenPaymentForm,
  onUndoPayment,
  onOpenDateForm,
  onOpenAdd,
}) {
  const [query, setQuery] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const overdueCount = installments.filter(
    (c) => computeInstallmentStatus(c) === "متأخر",
  ).length;
  const totalOwed = installments.reduce(
    (s, c) => s + (Number(c.remaining) || 0),
    0,
  );

  const filtered = installments
    .filter((c) => fuzzyMatch(query, c.name))
    .filter((c) => !overdueOnly || computeInstallmentStatus(c) === "متأخر");

  return (
    <>
      <StatStrip
        stats={[
          { value: installments.length, label: "عدد العملاء" },
          {
            value: overdueCount,
            label: overdueOnly ? "متأخرين (دوس تلغي)" : "متأخرين",
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
          {overdueOnly ? "مفيش متأخرين دلوقتي 👍" : "مفيش عملاء مطابقين"}
        </div>
      ) : (
        <div>
          {filtered.map((c) => (
            <InstallmentCard
              key={c.id}
              c={c}
              onOpenPaymentForm={onOpenPaymentForm}
              onUndoPayment={onUndoPayment}
              onOpenDateForm={onOpenDateForm}
              onOpenEditCount={onOpenEditCount}
            />
          ))}
        </div>
      )}
    </>
  );
}