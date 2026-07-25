export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="overlay show"
      onClick={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className="modal">{children}</div>
    </div>
  );
}
