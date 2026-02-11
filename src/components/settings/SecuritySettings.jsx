// src/components/settings/SecuritySettings.jsx
import React, { useState } from 'react';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function SecuritySettings({ initialSettings }) {
  const toast = useToast();
  const ipc = useIPC();

  const [requireMasterPassword, setRequireMasterPassword] = useState(
    initialSettings?.requireMasterPassword ?? true
  );
  const [lockAfterMinutes, setLockAfterMinutes] = useState(
    initialSettings?.lockAfterMinutes || 10
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ipc.invoke('settings:update', {
        security: {
          requireMasterPassword,
          lockAfterMinutes: Number(lockAfterMinutes) || 5,
        },
      });
      toast.success({
        title: 'Security settings saved',
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

  const handleResetMasterPassword = async () => {
    try {
      await ipc.invoke('security:resetMasterPassword');
      toast.success({
        title: 'Master password reset',
        message: 'Next launch will ask to set a new one.',
      });
    } catch (err) {
      toast.error({
        title: 'Reset failed',
        message: String(err),
      });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Security
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <input
            id="require-master-password"
            type="checkbox"
            checked={requireMasterPassword}
            onChange={(e) => setRequireMasterPassword(e.target.checked)}
            className="mt-[2px] h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
          />
          <label
            htmlFor="require-master-password"
            className="text-[11px] text-slate-600 dark:text-slate-300"
          >
            Require master password on startup and for sensitive operations.
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            Auto-lock after
          </span>
          <input
            type="number"
            min={1}
            max={120}
            value={lockAfterMinutes}
            onChange={(e) => setLockAfterMinutes(e.target.value)}
            className="h-7 w-16 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
          />
          <span className="text-[11px] text-slate-600 dark:text-slate-300">
            minutes of inactivity.
          </span>
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <div className="max-w-xs text-[10px] text-slate-400 dark:text-slate-500">
            Private keys and mnemonics are encrypted using AES-256-GCM with a key derived
            from your master password.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetMasterPassword}
          >
            Reset master password
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          loading={loading}
        >
          Save security settings
        </Button>
      </div>
    </div>
  );
}

export default SecuritySettings;
