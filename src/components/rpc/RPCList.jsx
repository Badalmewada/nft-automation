// src/components/rpc/RPCList.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Table from '../common/Table';
import Button from '../common/Button';

function truncateUrl(url, max = 40) {
  if (!url) return '';
  if (url.length <= max) return url;
  return `${url.slice(0, max - 10)}…${url.slice(-8)}`;
}

function RPCList({
  rpcs,
  loading = false,
  onToggleEnabled,
  onDelete,
  onCheckHealth,
}) {
  const columns = useMemo(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        render: (value, row) => (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">
              {value || 'Unnamed'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Chain ID {row.chainId ?? '—'} • {row.type || 'primary'}
            </span>
          </div>
        ),
      },
      {
        key: 'url',
        title: 'Endpoint',
        dataIndex: 'url',
        render: (value) => (
          <span className="font-mono text-[10px] text-slate-700 dark:text-slate-200">
            {truncateUrl(value)}
          </span>
        ),
      },
      {
        key: 'health',
        title: 'Health',
        dataIndex: 'healthStatus',
        render: (value, row) => {
          const status = (value || '').toLowerCase();
          const latency = row.latencyMs;
          let icon = AlertTriangle;
          let label = 'Unknown';
          let cls =
            'text-slate-500 bg-slate-100 dark:bg-slate-900/70 dark:text-slate-300';

          if (status === 'healthy') {
            icon = CheckCircle2;
            label = 'Healthy';
            cls =
              'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/60 dark:text-emerald-200';
          } else if (status === 'degraded') {
            icon = AlertTriangle;
            label = 'Degraded';
            cls =
              'text-amber-600 bg-amber-50 dark:bg-amber-900/60 dark:text-amber-200';
          } else if (status === 'down') {
            icon = XCircle;
            label = 'Down';
            cls =
              'text-red-600 bg-red-50 dark:bg-red-900/60 dark:text-red-200';
          }

          const Icon = icon;

          return (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ${cls}`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {latency != null ? `${latency} ms` : '–'}
              </span>
            </div>
          );
        },
      },
      {
        key: 'limits',
        title: 'Limits',
        dataIndex: 'maxRequestsPerSecond',
        render: (value, row) => (
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            <div>Weight: {row.weight ?? 1}</div>
            <div>RPS: {value ?? 0}</div>
          </div>
        ),
      },
      {
        key: 'enabled',
        title: 'Status',
        dataIndex: 'enabled',
        render: (value) => (
          <span
            className={`inline-flex rounded-full px-2 py-[2px] text-[10px] ${
              value
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300'
            }`}
          >
            {value ? 'Enabled' : 'Disabled'}
          </span>
        ),
      },
      {
        key: 'actions',
        title: '',
        dataIndex: 'id',
        render: (_, row) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[10px]"
              onClick={() => onToggleEnabled?.(row)}
            >
              {row.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px]"
              onClick={() => onCheckHealth?.(row)}
            >
              Check
            </Button>
            <Button
              size="sm"
              variant="danger"
              className="h-7 px-2 text-[10px]"
              onClick={() => onDelete?.(row)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [onToggleEnabled, onCheckHealth, onDelete]
  );

  return (
    <Table
      columns={columns}
      data={rpcs}
      loading={loading}
      keyField="id"
      emptyMessage="No RPC endpoints configured. Add at least one to start minting."
    />
  );
}

RPCList.propTypes = {
  rpcs: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onToggleEnabled: PropTypes.func,
  onDelete: PropTypes.func,
  onCheckHealth: PropTypes.func,
};

export default RPCList;
