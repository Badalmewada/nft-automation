// src/components/wallets/WalletCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { Copy, MoreVertical, KeyRound, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

function shortenAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function WalletCard({
  wallet,
  selected = false,
  onSelectToggle,
  onCopyAddress,
  onMoreAction,
}) {
  const { name, address, groupName, tags = [], metadata = {} } = wallet || {};
  const createdAt = metadata?.createdAt
    ? new Date(metadata.createdAt).toLocaleString()
    : null;

  return (
    <div
      className={clsx(
        'flex flex-col rounded-xl border bg-white/90 p-3 text-xs shadow-sm shadow-black/5 transition-all hover:-translate-y-[1px] hover:shadow-md dark:bg-slate-900/80',
        selected
          ? 'border-blue-500/80 ring-1 ring-blue-500/40'
          : 'border-slate-200/80 dark:border-slate-800/80'
      )}
    >
      {/* Top: checkbox + name + menu */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelectToggle}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="max-w-[160px] truncate text-xs font-semibold text-slate-900 dark:text-slate-50">
                {name || 'Unnamed Wallet'}
              </span>
              {metadata?.importMethod === 'generated' && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Auto
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {groupName || 'Ungrouped'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onMoreAction}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Address + copy */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <KeyRound className="h-3 w-3 text-slate-400" />
          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-200">
            {shortenAddress(address)}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopyAddress}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-[2px] text-[10px] text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-blue-50 px-2 py-[1px] text-[10px] font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-200"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-[1px] text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              +{tags.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Bottom meta */}
      <div className="mt-auto flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col gap-[2px]">
          {createdAt && (
            <span className="truncate">Created: {createdAt}</span>
          )}
          {typeof metadata?.transactionCount === 'number' && (
            <span className="truncate">
              Tx count: {metadata.transactionCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Optional actions (e.g. open in explorer) – keep minimal for now */}
      <div className="mt-2 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[10px]"
        >
          View
        </Button>
      </div>
    </div>
  );
}

WalletCard.propTypes = {
  wallet: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    groupName: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    metadata: PropTypes.object,
  }),
  selected: PropTypes.bool,
  onSelectToggle: PropTypes.func,
  onCopyAddress: PropTypes.func,
  onMoreAction: PropTypes.func,
};

export default WalletCard;
