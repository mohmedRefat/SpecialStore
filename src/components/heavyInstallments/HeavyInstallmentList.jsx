import { useState } from "react";
import StatStrip from "../layout/StatStrip.jsx";
import SearchBar from "../layout/SearchBar.jsx";
import HeavyInstallmentCard from "./HeavyInstallmentCard.jsx";
import {
  fuzzyMatch,
  fmt,
  computeInstallmentStatus,
} from "../../utils/helpers.js";

export default function HeavyInstallmentList({
  heavyInstallments,
  onOpenPaymentForm,
  onUndoPayment,
  onOpenDateForm,
  onOpenAdd,
}) {
  const [query, setQuery] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  const overdueCount = heavyInstallments.filter(
    (c) => computeInstallmentStatus(c) === "متأخر",
  ).length;
  const totalOwed = heavyInstallments.reduce(
    (s, c) => s + (Number(c.remaining) || 0),
    0,
  );

  const filtered = heavyInstallments
    .filter((c) => fuzzyMatch(query, c.name))
    .filter((c) => !overdueOnly || computeInstallmentStatus(c) === "متأخر");

  return (
    <>
      <StatStrip
        stats={[
          { value: heavyInstallments.length, label: "عدد العملاء" },
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
        inputId="heavy-inst-search-input"
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
            <HeavyInstallmentCard
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