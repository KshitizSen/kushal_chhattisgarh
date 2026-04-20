import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Modal component for dialogs and overlays
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Footer content (optional)
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} props.closeOnOverlayClick - Close when clicking overlay
 * @param {boolean} props.showCloseButton - Show X button in header
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className={`w-full ${sizeClasses[size]} animate-slide-up rounded-[1.75rem] border border-white/80 bg-white/95 shadow-[0_32px_80px_rgba(15,23,42,0.18)] dark:border-gray-800 dark:bg-gray-900/95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 p-6 dark:border-gray-800">
          <h3 id="modal-title" className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200/80 p-6 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage footer with buttons
export const ModalFooter = ({ onCancel, onConfirm, confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading = false }) => (
  <>
    <Button variant="ghost" onClick={onCancel}>
      {cancelLabel}
    </Button>
    <Button variant="primary" onClick={onConfirm} loading={loading}>
      {confirmLabel}
    </Button>
  </>
);

export { Modal };
export default Modal;
