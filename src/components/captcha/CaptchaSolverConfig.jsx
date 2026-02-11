// src/components/captcha/CaptchaSolverConfig.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Shield, RefreshCw } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

const PROVIDERS = [
  { value: '2captcha', label: '2Captcha' },
  { value: 'capmonster', label: 'CapMonster' },
  { value: 'anticaptcha', label: 'Anti-captcha' },
];

function CaptchaSolverConfig({ initialConfig }) {
  const toast = useToast();
  const ipc = useIPC();

  const [provider, setProvider] = useState(initialConfig?.provider || '2captcha');
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey || '');
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? false);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(initialConfig?.balance ?? null);

  const handleSave = async () => {
    setLoading(true);
    try {
      await ipc.invoke('captcha:saveConfig', {
        provider,
        apiKey: apiKey.trim(),
        enabled,
      });
      toast.success({
        title: 'Captcha config saved',
        message: provider,
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

  const handleCheckBalance = async () => {
    setLoading(true);
    try {
      const result = await ipc.invoke('captcha:getBalance', {
        provider,
      });
      setBalance(result?.balance ?? null);
      toast.success({
        title: 'Balance fetched',
        message: result?.balance != null ? `${result.balance} credits` : '',
      });
    } catch (err) {
      toast.error({
        title: 'Check failed',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Captcha solver
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Use external services to solve captchas during mint.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Provider
          </label>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="API key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          helperText="Stored encrypted on disk."
        />
        <div className="flex flex-col justify-end">
          <div className="flex items-center gap-2">
            <input
              id="captcha-enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
            />
            <label
              htmlFor="captcha-enabled"
              className="text-[11px] text-slate-600 dark:text-slate-300"
            >
              Enabled
            </label>
          </div>
          {balance != null && (
            <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              Last known balance: {balance}
            </div>
          )}
        </div>
      </div>

      <div className="mt-1 flex justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCheckBalance}
          loading={loading}
        >
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Check balance
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          loading={loading}
        >
          Save config
        </Button>
      </div>
    </div>
  );
}

CaptchaSolverConfig.propTypes = {
  initialConfig: PropTypes.object,
};

export default CaptchaSolverConfig;
