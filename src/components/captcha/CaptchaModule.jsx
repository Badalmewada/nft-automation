// src/components/captcha/CaptchaModule.jsx
import React, { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import CaptchaSolverConfig from './CaptchaSolverConfig';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function CaptchaModule() {
  const toast = useToast();
  const ipc = useIPC();

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const result = await ipc.invoke('captcha:getConfig');
      setConfig(result || {});
    } catch (err) {
      toast.error({
        title: 'Failed to load config',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Captcha engine
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Managed captcha solving for protected mint flows.
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {loading && (
          <div className="flex h-40 items-center justify-center text-xs text-slate-500 dark:text-slate-400">
            Loading captcha configuration...
          </div>
        )}
        {!loading && (
          <CaptchaSolverConfig initialConfig={config || {}} />
        )}
      </div>
    </div>
  );
}

export default CaptchaModule;
