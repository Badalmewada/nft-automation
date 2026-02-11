// src/components/rpc/RPCModule.jsx
import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import AddRPCModal from './AddRPCModal';
import RPCHealthCheck from './RPCHealthCheck';
import RPCList from './RPCList';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import useRPC from '../../hooks/useRPC';

function RPCModule() {
  const toast = useToast();
  const rpcApi = useRPC() || {};

  const rpcs = rpcApi.rpcs || [];
  const loading = rpcApi.loading || false;

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const healthSummary = useMemo(() => {
    let healthy = 0;
    let degraded = 0;
    let down = 0;
    for (const rpc of rpcs) {
      const status = (rpc.healthStatus || '').toLowerCase();
      if (status === 'healthy') healthy += 1;
      else if (status === 'degraded') degraded += 1;
      else if (status === 'down') down += 1;
    }
    return {
      total: rpcs.length,
      healthy,
      degraded,
      down,
    };
  }, [rpcs]);

  const handleRefresh = async () => {
    try {
      await rpcApi.refresh?.();
      toast.success({
        title: 'Refreshed',
        message: 'RPC list reloaded.',
        duration: 2000,
      });
    } catch (err) {
      toast.error({
        title: 'Refresh failed',
        message: String(err),
      });
    }
  };

  const handleCreate = async (rpcConfig) => {
    try {
      await rpcApi.add?.(rpcConfig);
      toast.success({
        title: 'RPC added',
        message: rpcConfig.name,
      });
    } catch (err) {
      toast.error({
        title: 'Add failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleToggleEnabled = async (rpc) => {
    try {
      await rpcApi.update?.(rpc.id, { enabled: !rpc.enabled });
      toast.success({
        title: rpc.enabled ? 'RPC disabled' : 'RPC enabled',
        message: rpc.name,
        duration: 2000,
      });
    } catch (err) {
      toast.error({
        title: 'Update failed',
        message: String(err),
      });
    }
  };

  const handleCheckHealth = async (rpc) => {
    try {
      const result = await rpcApi.checkHealth?.(rpc.id);
      const status = result?.healthStatus || result?.status || 'unknown';
      toast.info({
        title: `Health: ${status}`,
        message: `Latency: ${result?.latencyMs ?? 'n/a'} ms`,
        duration: 3000,
      });
      // refresh list to reflect new status
      rpcApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Health check failed',
        message: String(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await rpcApi.remove?.(deleteTarget.id);
      toast.success({
        title: 'RPC deleted',
        message: deleteTarget.name,
      });
    } catch (err) {
      toast.error({
        title: 'Delete failed',
        message: String(err),
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            RPC endpoints
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {rpcs.length} configured • used by all tasks and wallet operations
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add RPC
          </Button>
        </div>
      </div>

      {/* Health summary */}
      <RPCHealthCheck summary={healthSummary} />

      {/* Main list */}
      <div className="min-h-0 flex-1 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <RPCList
          rpcs={rpcs}
          loading={loading}
          onToggleEnabled={handleToggleEnabled}
          onDelete={(rpc) => setDeleteTarget(rpc)}
          onCheckHealth={handleCheckHealth}
        />
      </div>

      {/* Add modal */}
      <AddRPCModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreate}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        type="danger"
        title="Delete RPC endpoint?"
        message={
          deleteTarget
            ? `You are about to delete the RPC endpoint "${deleteTarget.name}". Make sure at least one healthy endpoint remains for each chain you use.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}

export default RPCModule;
