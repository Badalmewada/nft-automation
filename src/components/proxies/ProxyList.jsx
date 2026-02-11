// src/components/proxies/ProxyList.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Globe2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import Table from '../common/Table';
import Button from '../common/Button';

function ProxyList({ proxies, loading, onCheck, onDelete }) {
  const columns = useMemo(
    () => [
      {
        key: 'endpoint',
        title: 'Proxy',
        dataIndex: 'host',
        render: (_, row) => (
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <Globe2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                {row.label || 'Unnamed proxy'}
              </div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                {row.protocol || 'http'}://{row.host}:{row.port}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'auth',
        title: 'Auth',
        dataIndex: 'username',
        render: (_, row) => (
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {row.username ? `User: ${row.username}` : 'No auth'}
          </div>
        ),
      },
      {
        key: 'health',
        title: 'Health',
        dataIndex: 'status',
        render: (value, row) => {
          const status = (value || '').toLowerCase();
          const latency = row.latencyMs;
          let Icon = AlertTriangle;
          let label = 'Unknown';
          let cls =
            'bg-slate-100 text-slate-600 dark:bg-slate-900/70 dark:text-slate-300';

          if (status === 'healthy') {
            Icon = CheckCircle2;
            label = 'Healthy';
            cls =
              'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200';
          } else if (status === 'degraded') {
            Icon = AlertTriangle;
            label = 'Degraded';
            cls =
              'bg-amber-50 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200';
          } else if (status === 'down') {
            Icon = XCircle;
            label = 'Down';
            cls =
              'bg-red-50 text-red-700 dark:bg-red-900/60 dark:text-red-200';
          }

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
        key: 'actions',
        title: '',
        dataIndex: 'id',
        render: (_, row) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[10px]"
              onClick={() => onCheck?.(row)}
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
    [onCheck, onDelete]
  );

  return (
    <Table
      columns={columns}
      data={proxies}
      loading={loading}
      keyField="id"
      emptyMessage="No proxies configured. You can mint without proxies, but using them helps avoid rate limits and bans."
    />
  );
}

ProxyList.propTypes = {
  proxies: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onCheck: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProxyList;
