export default function SearchBar({ value, onChange, placeholder, onAdd, inputId }) {
  return (
    <div className="search-wrap">
      <input
        id={inputId}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="add-btn" onClick={onAdd}>
        ＋
      </button>
    </div>
  );
}
