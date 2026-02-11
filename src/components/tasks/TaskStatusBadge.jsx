// src/components/tasks/TaskStatusBadge.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function TaskStatusBadge({ status }) {
  const normalized = (status || '').toLowerCase();

  const config = {
    running: {
      label: 'Running',
      className:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-800',
    },
    queued: {
      label: 'Queued',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
    },
    pending: {
      label: 'Pending',
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800',
    },
    completed: {
      label: 'Completed',
      className:
        'bg-slate-900 text-slate-50 border-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-200',
    },
    failed: {
      label: 'Failed',
      className:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-200 dark:border-red-800',
    },
    stopped: {
      label: 'Stopped',
      className:
        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-200 dark:border-slate-800',
    },
  }[normalized] || {
    label: status || 'Unknown',
    className:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-[2px] text-[10px] font-medium',
        config.className
      )}
    >
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}

TaskStatusBadge.propTypes = {
  status: PropTypes.string,
};

export default TaskStatusBadge;
