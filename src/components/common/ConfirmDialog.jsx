// src/components/common/ConfirmDialog.jsx
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info: {
    icon: Info,
    iconClass: 'text-sky-500',
    ringClass: 'bg-sky-500/10',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    ringClass: 'bg-emerald-500/10',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    ringClass: 'bg-amber-500/10',
  },
  danger: {
    icon: XCircle,
    iconClass: 'text-rose-500',
    ringClass: 'bg-rose-500/10',
  },
};

export default function ConfirmDialog({
  isOpen,
  type = 'info',
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = config.icon;

  const handleCancel = () => {
    if (loading) return;
    if (onCancel) onCancel();
  };

  const handleConfirm = async () => {
    if (loading) return;
    if (onConfirm) await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel} // esc / backdrop -> cancel
      size="sm"
      showCloseButton={false}
    >
      <div className="flex flex-col gap-4 p-4 text-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${config.ringClass}`}
          >
            <Icon className={`h-5 w-5 ${config.iconClass}`} />
          </div>
        </div>

        <div className="text-center">
          <h2 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          {message && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {message}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={type === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
