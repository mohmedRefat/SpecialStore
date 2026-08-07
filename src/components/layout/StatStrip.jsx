export default function StatStrip({ stats }) {
  return (
    <div className="stat-strip">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`stat${s.variant ? " " + s.variant : ""}${s.onClick ? " clickable" : ""}${s.active ? " active" : ""}`}
          onClick={s.onClick}
        >
          <div className="v num">{s.value}</div>
          <div className="l">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
