// src/components/settings/SettingsModule.jsx
import React, { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import GeneralSettings from './GeneralSettings';
import AdvancedSettings from './AdvancedSettings';
import SecuritySettings from './SecuritySettings';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function SettingsModule() {
  const toast = useToast();
  const ipc = useIPC();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await ipc.invoke('settings:getAll');
      setSettings(result || {});
    } catch (err) {
      toast.error({
        title: 'Failed to load settings',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Settings
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Tune how NFT Mint Pro behaves on your machine.
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center text-xs text-slate-500 dark:text-slate-400">
          Loading settings...
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="space-y-3">
            <GeneralSettings initialSettings={settings?.general || {}} />
            <AdvancedSettings initialSettings={settings?.advanced || {}} />
          </div>
          <div>
            <SecuritySettings initialSettings={settings?.security || {}} />
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsModule;
