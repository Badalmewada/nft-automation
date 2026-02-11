// src/components/wallets/WalletList.jsx
import React from 'react';
import { Copy, MoreHorizontal, ShieldCheck } from 'lucide-react';
import Loader from '../common/Loader';

function maskAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function WalletRow({
  wallet,
  selected,
  onToggleSelect,
  onCopyAddress,
  onMoreAction,
}) {
  const createdAt = wallet.metadata?.createdAt
    ? new Date(wallet.metadata.createdAt)
    : null;

  const createdLabel = createdAt
    ? createdAt.toLocaleString()
    : 'Unknown';

  const txCount = wallet.metadata?.transactionCount ?? 0;

  return (
    <div
      className="group flex items-center gap-3 border-b border-slate-100/70 bg-slate-50/40 px-3 py-2 text-xs transition hover:bg-slate-100/80 dark:border-slate-800/70 dark:bg-slate-950/40 dark:hover:bg-slate-900/80"
    >
      {/* Checkbox */}
      <div className="flex w-8 flex-shrink-0 justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.(wallet.id)}
          className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
        />
      </div>

      {/* Name + address + meta */}
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <div className="flex items-center gap-2">
          <div className="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-50">
            {wallet.name || 'Unnamed wallet'}
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-[1px] text-[10px] uppercase tracking-wide text-emerald-500">
            Auto
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-mono">
            <span className="opacity-70">Addr</span>
            <span>{maskAddress(wallet.address)}</span>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <span className="opacity-70">Created</span>
            <span>{createdLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="opacity-70">Tx</span>
            <span>{txCount}</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="hidden w-32 flex-shrink-0 items-center justify-end gap-1 text-[11px] text-slate-500 dark:text-slate-400 md:flex">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>Encrypted</span>
      </div>

      {/* Actions */}
      <div className="flex w-28 flex-shrink-0 items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onCopyAddress?.(wallet)}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-[3px] text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
        <button
          type="button"
          onClick={() => onMoreAction?.(wallet)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function WalletList({
  wallets = [],
  selectedWalletIds = [],
  loading = false,
  onToggleSelect,
  onCopyAddress,
  onMoreAction,
}) {
  const selectedSet = new Set(
    (selectedWalletIds || []).map((id) => String(id))
  );

  if (loading && !wallets.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader label="Loading wallets..." />
      </div>
    );
  }

  if (!loading && wallets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200/80 bg-slate-50/40 text-xs text-slate-500 dark:border-slate-700/70 dark:bg-slate-950/40 dark:text-slate-400">
        No wallets yet. Use &ldquo;Import / Generate&rdquo; to add wallets.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-slate-200/80 bg-slate-50/30 dark:border-slate-800/80 dark:bg-slate-950/30">
      {/* header row */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200/80 bg-slate-100/90 px-3 py-2 text-[11px] font-medium text-slate-600 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-300">
        <div className="flex w-8 flex-shrink-0 justify-center">
          {/* empty header for checkbox column */}
        </div>
        <div className="flex flex-1 items-center">
          Name / address / details
        </div>
        <div className="hidden w-32 flex-shrink-0 justify-end md:flex">
          Status
        </div>
        <div className="flex w-28 flex-shrink-0 justify-end">
          Actions
        </div>
      </div>

      {/* rows */}
      {wallets.map((wallet) => (
        <WalletRow
          key={wallet.id}
          wallet={wallet}
          selected={selectedSet.has(String(wallet.id))}
          onToggleSelect={onToggleSelect}
          onCopyAddress={onCopyAddress}
          onMoreAction={onMoreAction}
        />
      ))}
    </div>
  );
}
