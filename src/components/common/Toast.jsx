// src/components/common/Toast.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

const TYPE_STYLES = {
  info: 'bg-slate-900 text-slate-50 border-slate-700',
  success: 'bg-emerald-600 text-white border-emerald-500',
  error: 'bg-red-600 text-white border-red-500',
  warning: 'bg-amber-500 text-slate-900 border-amber-400',
};

const TYPE_ICON = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warning: '⚠️',
};

function ToastContainer({ toasts, remove }) {
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end gap-2 p-4 sm:p-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto mb-2 flex w-full max-w-sm translate-y-0 transform flex-col rounded-lg border ' +
              'shadow-lg shadow-black/30 ring-1 ring-black/5 backdrop-blur-md transition-all',
            TYPE_STYLES[toast.type]
          )}
        >
          <div className="flex items-start gap-3 p-3">
            <div className="mt-0.5 text-lg">{TYPE_ICON[toast.type]}</div>
            <div className="flex-1">
              {toast.title && (
                <div className="text-sm font-semibold leading-tight">
                  {toast.title}
                </div>
              )}
              {toast.message && (
                <div className="mt-0.5 text-xs leading-snug opacity-90">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              type="button"
              className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/80 hover:bg-white/20"
              onClick={() => remove(toast.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {toast.action && (
            <button
              type="button"
              className="m-2 mt-0 rounded-md bg-white/10 px-2 py-1 text-xs font-medium hover:bg-white/20"
              onClick={() => {
                toast.action?.onClick?.();
                remove(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
      title: PropTypes.string,
      message: PropTypes.string,
      duration: PropTypes.number,
      action: PropTypes.shape({
        label: PropTypes.string,
        onClick: PropTypes.func,
      }),
    })
  ),
  remove: PropTypes.func.isRequired,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ type = 'info', title, message, duration = 3500, action }) => {
    toastIdCounter += 1;
    const id = toastIdCounter;

    setToasts((prev) => [...prev, { id, type, title, message, duration, action }]);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }, [remove]);

  const api = useMemo(
    () => ({
      show,
      info: (opts) => show({ ...opts, type: 'info' }),
      success: (opts) => show({ ...opts, type: 'success' }),
      error: (opts) => show({ ...opts, type: 'error' }),
      warning: (opts) => show({ ...opts, type: 'warning' }),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node,
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
