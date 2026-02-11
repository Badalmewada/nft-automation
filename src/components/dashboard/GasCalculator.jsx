// src/components/dashboard/GasCalculator.jsx
import React, { useMemo, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export default function GasCalculator() {
  const [gasPriceGwei, setGasPriceGwei] = useState('30');
  const [gasLimit, setGasLimit] = useState('200000');
  const [ethPriceUsd, setEthPriceUsd] = useState('');

  const { totalGasEth, totalGasGwei, totalGasUsd } = useMemo(() => {
    const gp = parseNumber(gasPriceGwei);
    const gl = parseNumber(gasLimit);
    const ethUsd = parseNumber(ethPriceUsd, 0);

    // gwei * gasLimit
    const totalGwei = gp * gl;
    const totalEth = totalGwei / 1e9;
    const totalUsd = ethUsd ? totalEth * ethUsd : 0;

    return {
      totalGasGwei: totalGwei,
      totalGasEth: totalEth,
      totalGasUsd: totalUsd,
    };
  }, [gasPriceGwei, gasLimit, ethPriceUsd]);

  const handlePreset = (multiplier) => {
    const base = parseNumber(gasPriceGwei || '0');
    if (!base) return;
    const next = (base * multiplier).toFixed(1);
    setGasPriceGwei(String(next));
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-white/90 p-4 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Gas cost calculator
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Quick estimate for a single transaction. Use this as a reference for
            batch mints and tasks.
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePreset(0.8)}
            className="text-[11px]"
          >
            -20%
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePreset(1.0)}
            className="text-[11px]"
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePreset(1.2)}
            className="text-[11px]"
          >
            +20%
          </Button>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3">
          <Input
            label="Gas price (gwei)"
            value={gasPriceGwei}
            onChange={(e) => setGasPriceGwei(e.target.value)}
            placeholder="e.g. 15, 20, 30"
          />
          <Input
            label="Gas limit"
            value={gasLimit}
            onChange={(e) => setGasLimit(e.target.value)}
            placeholder="e.g. 21000 for transfer, 200000+ for mints"
          />
        </div>

        <div className="space-y-3">
          <Input
            label="ETH price (USD)"
            value={ethPriceUsd}
            onChange={(e) => setEthPriceUsd(e.target.value)}
            placeholder="Optional – e.g. 3500"
          />
          <div className="rounded-lg border border-dashed border-slate-300/80 bg-slate-50/70 p-3 dark:border-slate-700/80 dark:bg-slate-900/70">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Totals
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Total gas (gwei)
                </span>
                <span className="font-mono text-[12px] text-slate-900 dark:text-slate-50">
                  {totalGasGwei ? totalGasGwei.toLocaleString() : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Total gas (ETH)
                </span>
                <span className="font-mono text-[12px] text-emerald-600 dark:text-emerald-300">
                  {totalGasEth ? totalGasEth.toFixed(6) : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Approx. cost (USD)
                </span>
                <span className="font-mono text-[12px] text-sky-600 dark:text-sky-300">
                  {ethPriceUsd && totalGasUsd
                    ? `$${totalGasUsd.toFixed(2)}`
                    : 'Enter ETH price'}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
              For batch mints, multiply these values by the number of
              transactions or use the Tasks module for aggregate estimation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
