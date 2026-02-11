// src/components/tasks/TaskCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Clock, Play, Square, Trash2, List, Cpu } from 'lucide-react';
import Button from '../common/Button';
import TaskStatusBadge from './TaskStatusBadge';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function TaskCard({
  task,
  onStart,
  onStop,
  onDelete,
  onViewLogs,
}) {
  const {
    id,
    name,
    type,
    status,
    chainId,
    createdAt,
    updatedAt,
    totalWallets,
    processedWallets,
    failedWallets,
  } = task;

  const progress =
    totalWallets && totalWallets > 0
      ? Math.round(((processedWallets || 0) / totalWallets) * 100)
      : null;

  const canStart = status === 'pending' || status === 'queued' || status === 'stopped' || status === 'failed';
  const canStop = status === 'running';

  return (
    <div className="flex flex-col rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-900/90">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              {name || 'Unnamed Task'}
            </h3>
            <TaskStatusBadge status={status} />
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {type || 'generic'} • Chain ID {chainId || '—'}
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
          <Cpu className="h-4 w-4" />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col">
          <span>
            Wallets:{' '}
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {processedWallets || 0}
            </span>{' '}
            / {totalWallets || 0}
          </span>
          <span>
            Failed:{' '}
            <span className="font-medium text-red-500">
              {failedWallets || 0}
            </span>
          </span>
        </div>
        {progress != null && (
          <div className="text-right">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {progress}%
            </span>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mb-2 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="truncate">
            Created: {formatDate(createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="truncate">
            Updated: {formatDate(updatedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            disabled={!canStart}
            onClick={() => onStart?.(task)}
          >
            <Play className="mr-1 h-3.5 w-3.5" />
            Start
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!canStop}
            onClick={() => onStop?.(task)}
          >
            <Square className="mr-1 h-3.5 w-3.5" />
            Stop
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewLogs?.(task)}
          >
            <List className="mr-1 h-3.5 w-3.5" />
            Logs
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete?.(task)}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Hidden ID for debug */}
      <div className="mt-1 truncate text-[9px] text-slate-400 dark:text-slate-500">
        ID: {id}
      </div>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    chainId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalWallets: PropTypes.number,
    processedWallets: PropTypes.number,
    failedWallets: PropTypes.number,
  }),
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onDelete: PropTypes.func,
  onViewLogs: PropTypes.func,
};

export default TaskCard;
