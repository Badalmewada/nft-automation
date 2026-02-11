// src/components/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import useGasPrice from '../../hooks/useGasPrice';
import { CHAINS } from '../../utils/constants';
import ContractMethodGenerator from './ContractMethodGenerator';
import GasCalculator from './GasCalculator';
import NetworkGasPrices from './NetworkGasPrices';

function formatGwei(value) {
  if (!value && value !== 0) return '--';
  if (value < 1) return value.toFixed(3);
  if (value < 10) return value.toFixed(2);
  return value.toFixed(1);
}

/* ----------------- Top ETH / Base summary cards ----------------- */

function TopNetworkCard({ chainId }) {
  const chain =
    CHAINS.find((c) => Number(c.id) === Number(chainId)) || {
      id: chainId,
      name: `Chain ${chainId}`,
      symbol: 'ETH',
      color: 'from-slate-600 to-slate-500',
    };

  const { gas, loading, error } = useGasPrice(chainId, {
    intervalMs: 15000,
  });

  const base = gas?.baseFee;
  const normal = gas?.normal;
  const fast = gas?.fast;

  let gasLabel = 'Gas: --';
  if (loading && !gas) gasLabel = 'Gas: loading...';
  else if (error) gasLabel = 'Gas: error';
  else if (normal) gasLabel = `Gas: ${formatGwei(normal)} gwei`;

  return (
    <div
      className={`relative flex min-h-[96px] flex-col justify-between rounded-2xl bg-gradient-to-r px-4 py-3 text-xs shadow-md shadow-black/30 ${chainId === 8453 ? 'from-sky-500 to-cyan-400' : 'from-emerald-500 to-teal-400'}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100/90">
        ETH Network
      </div>
      <div className="mt-1 text-lg font-semibold text-white">
        {chain.name}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-100/90">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-slate-100/80">
            {gasLabel}
          </span>
         
        </div>
        
      </div>
    </div>
  );
}

/* ------------------------- Stats row cards ------------------------- */

function StatCard({ title, value, subtitle, accent = 'slate' }) {
  const accentClasses =
    accent === 'green'
      ? 'border-emerald-500/40 bg-emerald-950/40'
      : accent === 'purple'
      ? 'border-violet-500/40 bg-violet-950/30'
      : 'border-slate-700/70 bg-slate-950/40';

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border px-4 py-3 text-xs text-slate-100 shadow-sm shadow-black/40 ${accentClasses}`}
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-300/80">
        {title}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {subtitle && (
        <div className="mt-[2px] text-[11px] text-slate-300/80">
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Main ----------------------------- */

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (!window.electron || typeof window.electron.invoke !== 'function') {
          return;
        }
        const result = await window.electron.invoke('app:getStats');
        if (!cancelled) {
          setStats(result || null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load app stats:', err);
      }
    };

    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const totalWallets = stats?.wallets?.total ?? 0;
  const totalTasks = stats?.tasks?.total ?? 0;
  const runningTasks = stats?.tasks?.running ?? 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Top ETH/Base strip */}
      <div className="grid gap-3 sm:grid-cols-2">
        <TopNetworkCard chainId={1} />
    
      </div>

      {/* Stats row */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          title="Wallets"
          value={totalWallets}
          subtitle="No groups yet"
        />
        <StatCard
          title="Tasks"
          value={`${runningTasks} running`}
          subtitle={`${totalTasks} queued`}
        />
        <StatCard
          title="Network conditions"
          value="Live gas"
          subtitle="Updated every 15s"
          accent="green"
        />
        <StatCard
          title="Engine status"
          value="Idle"
          subtitle="Workers start when tasks run"
          accent="purple"
        />
      </div>

      {/* Gas + calculator row */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <NetworkGasPrices />
        <GasCalculator />
      </div>

      {/* Contract method generator */}
      <ContractMethodGenerator />
    </div>
  );
}
