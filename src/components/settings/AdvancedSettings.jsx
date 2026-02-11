// src/components/settings/AdvancedSettings.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function AdvancedSettings({ initialSettings }) {
  const toast = useToast();
  const ipc = useIPC();

  const [maxParallelTasks, setMaxParallelTasks] = useState(
    initialSettings?.maxParallelTasks || 3
  );
  const [defaultGasLimit, setDefaultGasLimit] = useState(
    initialSettings?.defaultGasLimit || 200000
  );
  const [rpcTimeoutMs, setRpcTimeoutMs] = useState(
    initialSettings?.rpcTimeoutMs || 30000
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ipc.invoke('settings:update', {
        advanced: {
          maxParallelTasks: Number(maxParallelTasks) || 1,
          defaultGasLimit: Number(defaultGasLimit) || 21000,
          rpcTimeoutMs: Number(rpcTimeoutMs) || 10000,
        },
      });
      toast.success({
        title: 'Advanced settings saved',
        message: '',
      });
    } catch (err) {
      toast.error({
        title: 'Save failed',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Advanced
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Max parallel tasks"
          type="number"
          min={1}
          max={20}
          value={maxParallelTasks}
          onChange={(e) => setMaxParallelTasks(e.target.value)}
          helperText="Number of tasks that can run simultaneously."
        />
        <Input
          label="Default gas limit"
          type="number"
          min={21000}
          value={defaultGasLimit}
          onChange={(e) => setDefaultGasLimit(e.target.value)}
        />
        <Input
          label="RPC timeout (ms)"
          type="number"
          min={1000}
          value={rpcTimeoutMs}
          onChange={(e) => setRpcTimeoutMs(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          loading={loading}
        >
          Save advanced settings
        </Button>
      </div>
    </div>
  );
}

export default AdvancedSettings;
