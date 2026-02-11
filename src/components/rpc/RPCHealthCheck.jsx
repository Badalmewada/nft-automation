// src/components/rpc/RPCHealthCheck.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

function RPCHealthCheck({ summary }) {
  const total = summary?.total || 0;
  const healthy = summary?.healthy || 0;
  const degraded = summary?.degraded || 0;
  const down = summary?.down || 0;

  const statusIcon =
    down > 0
      ? XCircle
      : degraded > 0
      ? AlertTriangle
      : healthy > 0
      ? CheckCircle2
      : Activity;

  const Icon = statusIcon;

  let statusLabel = 'No endpoints';
  let statusColor =
    'bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200';

  if (total > 0) {
    if (down > 0) {
      statusLabel = 'Issues detected';
      statusColor =
        'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200';
    } else if (degraded > 0) {
      statusLabel = 'Partially degraded';
      statusColor =
        'bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200';
    } else if (healthy > 0) {
      statusLabel = 'All healthy';
      statusColor =
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200';
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-900/90">
      <div>
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          RPC health
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Total: {total} • Healthy: {healthy} • Degraded: {degraded} • Down: {down}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ${statusColor}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{statusLabel}</span>
        </span>
      </div>
    </div>
  );
}

RPCHealthCheck.propTypes = {
  summary: PropTypes.shape({
    total: PropTypes.number,
    healthy: PropTypes.number,
    degraded: PropTypes.number,
    down: PropTypes.number,
  }),
};

export default RPCHealthCheck;
