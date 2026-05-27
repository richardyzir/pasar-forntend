export default function Alert({ type = "info", message, onClose }) {
  return (
    <div className={`alert alert-${type}`}>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          &times;
        </button>
      )}
    </div>
  );
}
