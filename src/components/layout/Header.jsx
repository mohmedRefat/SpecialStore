export default function Header({ onExport, onImportFile }) {
  return (
    <div className="header">
      <div className="header-row">
        <div className="logo">🔧</div>
        <div className="brand">
          <h1>مخزن الكاوتش والبطاريات</h1>
          <p></p>
        </div>
        <div className="header-actions">
          <button
            className="icon-btn"
            title="تصدير نسخة احتياطية"
            onClick={onExport}
          >
            ⬇️
          </button>
          <button
            className="icon-btn"
            title="استيراد نسخة"
            onClick={() => document.getElementById("import-file").click()}
          >
            ⬆️
          </button>
        </div>
      </div>
      <input
        type="file"
        id="import-file"
        accept=".json"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) onImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
