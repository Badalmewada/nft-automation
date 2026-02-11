// src/components/proxies/ProxiesModule.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import AddProxyModal from './AddProxyModal';
import ProxyList from './ProxyList';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function ProxiesModule() {
  const toast = useToast();
  const ipc = useIPC();

  const [proxies, setProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await ipc.invoke('proxies:list');
      setProxies(result || []);
    } catch (err) {
      toast.error({
        title: 'Failed to load proxies',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (proxyConfig) => {
    try {
      await ipc.invoke('proxies:add', proxyConfig);
      toast.success({
        title: 'Proxy added',
        message: proxyConfig.label || `${proxyConfig.host}:${proxyConfig.port}`,
      });
      load();
    } catch (err) {
      toast.error({
        title: 'Add failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleCheck = async (proxy) => {
    try {
      const res = await ipc.invoke('proxies:check', { id: proxy.id });
      const status = res?.status || 'unknown';
      toast.info({
        title: `Health: ${status}`,
        message: res?.latencyMs != null ? `Latency: ${res.latencyMs} ms` : '',
      });
      load();
    } catch (err) {
      toast.error({
        title: 'Check failed',
        message: String(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await ipc.invoke('proxies:delete', { id: deleteTarget.id });
      toast.success({
        title: 'Proxy deleted',
        message:
          deleteTarget.label ||
          `${deleteTarget.protocol}://${deleteTarget.host}:${deleteTarget.port}`,
      });
      load();
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Proxy pool
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            {proxies.length} proxies configured for wallet tasks and minting workers.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={load}
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
            Add proxy
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <ProxyList
          proxies={proxies}
          loading={loading}
          onCheck={handleCheck}
          onDelete={(p) => setDeleteTarget(p)}
        />
      </div>

      {/* Modals */}
      <AddProxyModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreate}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        type="danger"
        title="Delete proxy?"
        message={
          deleteTarget
            ? `You are about to delete proxy "${deleteTarget.label ||
                `${deleteTarget.host}:${deleteTarget.port}`}".`
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

export default ProxiesModule;
