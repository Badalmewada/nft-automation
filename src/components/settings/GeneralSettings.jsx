// src/components/settings/GeneralSettings.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function GeneralSettings({ initialSettings }) {
  const toast = useToast();
  const ipc = useIPC();

  const [appLanguage, setAppLanguage] = useState(initialSettings?.appLanguage || 'en');
  const [theme, setTheme] = useState(initialSettings?.theme || 'system');
  const [autoUpdate, setAutoUpdate] = useState(
    initialSettings?.autoUpdate ?? true
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ipc.invoke('settings:update', {
        general: { appLanguage, theme, autoUpdate },
      });
      toast.success({
        title: 'General settings saved',
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
        General
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Language
          </label>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            value={appLanguage}
            onChange={(e) => setAppLanguage(e.target.value)}
          >
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Theme
          </label>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="flex items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                id="auto-update"
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
              />
              <label
                htmlFor="auto-update"
                className="text-[11px] text-slate-600 dark:text-slate-300"
              >
                Enable auto-updates
              </label>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Uses Electron auto-updater to keep you on the latest build.
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          loading={loading}
        >
          Save general settings
        </Button>
      </div>
    </div>
  );
}

export default GeneralSettings;
