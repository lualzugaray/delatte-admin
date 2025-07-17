import '../styles/confirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

export function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Eliminar'
}: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
