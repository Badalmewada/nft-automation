// src/components/tasks/MintJobRunner.jsx
import React, { useState } from 'react';
import useWallets from '../../hooks/useWallets';
import useMintJob from '../../hooks/useMintJob';
import Button from '../common/Button';

function MintJobRunner() {
  const {
    wallets,
    selectedWallets,
    toggleWalletSelection,
    clearSelection,
  } = useWallets();

  const { running, runMintJob } = useMintJob();

  const selectedCount = selectedWallets.length;

  const handleRun = async () => {
    if (selectedCount === 0) return;

    await runMintJob({
      jobId: `mint-${Date.now()}`,
      walletIds: selectedWallets,
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ===================== TASK CARDS ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['Opensea mint', 'Scatter mint', 'nerds', 'boni'].map((name, i) => (
          <div
            key={i}
            className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-800 p-4 shadow-lg hover:shadow-cyan-500/20 transition"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-cyan-400 font-semibold">{name}</div>
              <div className="text-xs bg-cyan-500/20 px-2 py-1 rounded-full">
                100
              </div>
            </div>

            <div className="flex gap-2">
              <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                ✓ 0
              </div>
              <div className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
                ✕ 0
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== WALLET TABLE ===================== */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 px-4 py-3 text-xs text-cyan-400 font-semibold border-b border-slate-700">
          <div>✓</div>
          <div>Wallet</div>
          <div>Platform</div>
          <div>Gas</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-800">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="grid grid-cols-6 items-center px-4 py-3 text-xs hover:bg-slate-800 transition"
            >
              <div>
                <input
                  type="checkbox"
                  checked={selectedWallets.includes(w.id)}
                  onChange={() => toggleWalletSelection(w.id)}
                />
              </div>

              <div className="font-mono text-cyan-300 truncate">
                {w.address.slice(0, 10)}...
              </div>

              <div>
                <div className="w-6 h-6 rounded-full bg-blue-500" />
              </div>

              <div className="text-cyan-300">
                Auto-NORMAL
              </div>

              <div className="text-slate-400">
                Idle
              </div>

              <div className="flex justify-end gap-2">
                <button className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400">
                  ▶
                </button>
                <button className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-400">
                  ■
                </button>
                <button className="w-8 h-8 rounded-full bg-red-600/30 text-red-400">
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================== BOTTOM ACTION BAR ===================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-slate-900/90 backdrop-blur px-6 py-3 rounded-full border border-slate-700 shadow-xl">

        <Button variant="ghost">
          + Create Task
        </Button>

        <Button
          onClick={handleRun}
          disabled={selectedCount === 0 || running}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Run ({selectedCount})
        </Button>

        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
          Stop ({selectedCount})
        </Button>

        <Button className="bg-red-600 hover:bg-red-700 text-white">
          Delete ({selectedCount})
        </Button>

      </div>
    </div>
  );
}

export default MintJobRunner;
