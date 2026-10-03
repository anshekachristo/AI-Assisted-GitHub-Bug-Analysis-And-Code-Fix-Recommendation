import { ShieldCheckIcon, XCircleIcon } from './Icons';

export default function ConfirmationModal({
  isOpen = false,
  title = 'Apply AI Fix?',
  description = 'This will update the selected file in the cloned repository with the AI-generated changes. A .backup file will be preserved.',
  confirmText = 'Apply Fix',
  cancelText = 'Cancel',
  type = 'confirm', // 'confirm' or 'reject'
  onConfirm = () => {},
  onCancel = () => {},
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onCancel}>
      <div
        className="confirmation-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-icon-badge">
          {type === 'reject' ? (
            <div className="icon-circle danger">
              <XCircleIcon size={24} />
            </div>
          ) : (
            <div className="icon-circle success">
              <ShieldCheckIcon size={24} />
            </div>
          )}
        </div>

        <h3 className="modal-title-heading">{title}</h3>
        <p className="modal-desc-body">{description}</p>

        <div className="modal-button-row">
          <button
            className="btn-modal-action cancel"
            onClick={() => {
              console.log('[UI] Modal cancel clicked');
              onCancel();
            }}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`btn-modal-action confirm ${type === 'reject' ? 'danger' : 'primary'}`}
            onClick={() => {
              console.log('[UI] Modal confirm clicked for:', title);
              onConfirm();
            }}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
