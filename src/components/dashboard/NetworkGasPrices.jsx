// src/components/dashboard/NetworkGasPrices.jsx
import React from 'react';
import useGasPrice from '../../hooks/useGasPrice';
import { CHAINS } from '../../utils/constants';

const TRACKED_CHAIN_IDS = [1, 8453]; // Ethereum + Base

function GasCard({ chainId }) {
  const chain = CHAINS.find((c) => Number(c.id) === Number(chainId)) || {
    id: chainId,
    name: `Chain ${chainId}`,
    symbol: '',
  };

  const { gas, loading, error } = useGasPrice(chainId);

  const label = chain.name;
  const normal = gas?.normal;
  const fast = gas?.fast;
  const base = gas?.baseFee;

  let statusText = '';
  if (loading && !gas) statusText = 'Loading...';
  else if (error) statusText = 'Error';
  else if (normal) statusText = `${normal} Gwei`;
  else statusText = '—';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/80 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {chain.symbol || 'ETH'} Network
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {label}
          </div>
        </div>
        <div className="rounded-full bg-slate-900/90 px-2 py-[2px] text-[10px] text-slate-50 dark:bg-slate-800">
          {statusText}
        </div>
      </div>

      <div className="mt-1 grid grid-cols-3 gap-2 text-[10px] text-slate-600 dark:text-slate-300">
        <div className="flex flex-col">
          <span className="mb-[2px] text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Base
          </span>
          <span className="font-mono text-xs text-slate-900 dark:text-slate-50">
            {base ? `${base} Gwei` : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="mb-[2px] text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Normal
          </span>
          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-300">
            {normal ? `${normal} Gwei` : '—'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="mb-[2px] text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fast
          </span>
          <span className="font-mono text-xs text-orange-500 dark:text-orange-300">
            {fast ? `${fast} Gwei` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NetworkGasPrices() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {TRACKED_CHAIN_IDS.map((id) => (
        <GasCard key={id} chainId={id} />
      ))}
    </div>
  );
}
