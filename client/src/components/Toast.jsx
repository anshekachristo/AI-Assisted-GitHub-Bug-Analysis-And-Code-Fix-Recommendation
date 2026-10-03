export default function Toast({ message = '', type = 'info', onClose = () => {} }) {
  if (!message) return null;

  return (
    <div className="toast-portal">
      <div className={`toast-card-item ${type}`}>
        <span className="toast-message-text">{message}</span>
        <button
          className="toast-close-btn"
          onClick={() => {
            console.log('[UI] Toast closed');
            onClose();
          }}
          title="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
