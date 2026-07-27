const TABS = [
  { id: "tires", label: "📦 المخزون" },
  { id: "batteries", label: "🔋 البطاريات" },
  { id: "hardware", label: "🔩 الحديد" }, // ← جديد
  { id: "installments", label: "💳 التقسيط" },
];
export default function Tabs({ activeTab, onChange }) {
  return (
    <div className="tabs">
      {TABS.map((t) => (
        <div
          key={t.id}
          className={`tab${activeTab === t.id ? " active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
