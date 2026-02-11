// src/components/wallets/WalletsModule.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, Plus, RefreshCw, Download, Upload } from 'lucide-react';
import WalletGroupManager from './WalletGroupManager';
import WalletList from './WalletList';
import WalletImportModal from './WalletImportModal';
import Button from '../common/Button';
import Input from '../common/Input';
import ConfirmDialog from '../common/ConfirmDialog';
import { useToast } from '../common/Toast';
import useWallets from '../../hooks/useWallets';
import { CHAINS } from '../../utils/constants';

/* ---------------------- Chain filter strip ---------------------- */

function ChainFilter({ activeChainId, onChange }) {
  const hasChains = Array.isArray(CHAINS) && CHAINS.length > 0;

  // "All networks" pill + configured chains
  const items = [
    {
      id: 'all',
      label: 'All Networks',
      symbol: 'ALL',
      color: 'from-slate-600 to-slate-500',
    },
    ...(hasChains
      ? CHAINS.map((c) => ({
          id: String(c.id),
          label: c.name,
          symbol: c.symbol || 'NET',
          color: c.color || 'from-sky-500 to-cyan-400',
        }))
      : []),
  ];

  return (
    <div className="mb-3 flex flex-wrap gap-3">
      {items.map((item) => {
        const active = activeChainId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative min-w-[140px] rounded-2xl border px-3 py-2 text-left text-xs font-medium transition
              ${
                active
                  ? 'border-cyan-400 bg-gradient-to-r ' + item.color + ' text-slate-50 shadow-lg shadow-cyan-500/30'
                  : 'border-slate-300/70 bg-slate-50/80 text-slate-700 hover:border-cyan-400/70 hover:text-slate-900 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200'
              }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{item.label}</span>
              <span className="rounded-full bg-black/10 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] dark:bg-white/10">
                {item.symbol}
              </span>
            </div>
            {active && (
              <div className="mt-1 text-[10px] text-slate-200/90 dark:text-slate-200/80">
                Active network
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------- Main module --------------------------- */

function WalletsModule() {
  const toast = useToast();

  const walletsApi = useWallets() || {};

  const wallets = walletsApi.wallets || [];
  const groups = walletsApi.groups || [];
  const loading = walletsApi.loading || false;
  const error = walletsApi.error || null;
  const selectedWallets = walletsApi.selectedWallets || [];
  const selectedGroup = walletsApi.selectedGroup ?? null;
  const searchQuery = walletsApi.searchQuery ?? '';
  const sortBy = walletsApi.sortBy || 'createdAt';
  const sortOrder = walletsApi.sortOrder || 'desc';

  const [showImportModal, setShowImportModal] = useState(false);
  const [activeChainId, setActiveChainId] = useState('all'); // 🔹 default: all networks
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Initial load
  useEffect(() => {
    walletsApi.refresh?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Toast for errors from hook
  useEffect(() => {
    if (error) {
      toast.error({
        title: 'Wallet error',
        message: String(error),
      });
    }
  }, [error, toast]);

  const selectedCount = selectedWallets.length;

  const displayedWallets = useMemo(() => {
    let list = wallets;

    // 🔹 Filter by selected group
    if (selectedGroup) {
      list = list.filter((w) => w.groupId === selectedGroup);
    }

    // 🔹 Filter by active chain
    if (activeChainId && activeChainId !== 'all') {
      list = list.filter((w) => {
        const chainId =
          w.chainId ??
          w.metadata?.chainId ??
          w.metadata?.chain ??
          null;
        if (!chainId) return false;
        return String(chainId) === String(activeChainId);
      });
    }

    // 🔹 Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.name?.toLowerCase().includes(q) ||
          w.address?.toLowerCase().includes(q)
      );
    }

    // 🔹 Sorting
    if (sortBy === 'createdAt') {
      list = [...list].sort((a, b) => {
        const aTime = a.metadata?.createdAt || 0;
        const bTime = b.metadata?.createdAt || 0;
        return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
      });
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => {
        const an = (a.name || '').toLowerCase();
        const bn = (b.name || '').toLowerCase();
        if (an < bn) return sortOrder === 'asc' ? -1 : 1;
        if (an > bn) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [
    wallets,
    selectedGroup,
    activeChainId,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  // Actions
  const handleRefresh = async () => {
    try {
      await walletsApi.refresh?.();
      toast.success({
        title: 'Refreshed',
        message: 'Wallet list reloaded.',
        duration: 2000,
      });
    } catch (err) {
      toast.error({
        title: 'Refresh failed',
        message: String(err),
      });
    }
  };

  const handleCopyAddress = async (wallet) => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      toast.success({
        title: 'Address copied',
        message: wallet.address,
        duration: 2000,
      });
    } catch {
      toast.error({
        title: 'Copy failed',
        message: 'Could not copy address to clipboard.',
      });
    }
  };

  const handleCreateGenerated = async ({ name, groupId }) => {
    try {
      await walletsApi.createWallet?.({
        name,
        groupId,
      });
      toast.success({
        title: 'Wallet created',
        message: 'New wallet generated successfully.',
      });
      walletsApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Create failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleCreateBulk = async ({ count, groupId }) => {
    try {
      await walletsApi.createBulkWallets?.(
        count,{
        groupId,
      });
      toast.success({
        title: 'Bulk generation started',
        message: `${count} wallets requested.`,
      });
      walletsApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Bulk generation failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleImportPrivateKey = async ({ privateKey, name, groupId }) => {
    try {
      await walletsApi.importFromPrivateKey?.(privateKey, { name, groupId });
      toast.success({
        title: 'Imported',
        message: 'Wallet imported from private key.',
      });
      walletsApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Import failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleImportMnemonic = async ({
    mnemonic,
    count,
    startIndex,
    derivationPath,
    groupId,
    baseName,
  }) => {
    try {
      await walletsApi.importMultipleFromMnemonic?.(
        mnemonic,
        count,
        {
          startIndex,
          derivationPath,
          groupId,
          baseName,
        }
      );
      toast.success({
        title: 'Accounts derived',
        message: `${count} accounts derived from mnemonic.`,
      });
      walletsApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Import failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;
    setDeleteLoading(true);
    try {
      await walletsApi.deleteWallets?.(selectedWallets);
      toast.success({
        title: 'Deleted',
        message: `${selectedCount} wallet(s) removed.`,
      });
      walletsApi.clearSelection?.();
      walletsApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Delete failed',
        message: String(err),
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const selectedGroupObject =
    groups.find((g) => g.id === selectedGroup) || null;

  return (
    <div className="flex h-full gap-4">
      {/* Left: Groups */}
      <aside className="hidden w-64 flex-shrink-0 md:block">
        <div className="h-full rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
          <WalletGroupManager />
        </div>
      </aside>

      {/* Right: Wallet list */}
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200/80 bg-white/80 p-3 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        {/* 🔹 Chain / Network filter strip */}
        <ChainFilter activeChainId={activeChainId} onChange={setActiveChainId} />

        {/* Toolbar */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {selectedGroupObject?.name || 'All Wallets'}
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-[2px] text-[11px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {displayedWallets.length} wallets
            </span>
            {selectedCount > 0 && (
              <span className="rounded-full bg-blue-50 px-2 py-[2px] text-[11px] text-blue-600 dark:bg-blue-900/40 dark:text-blue-200">
                {selectedCount} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => walletsApi.setSearchQuery?.(e.target.value)}
              placeholder="Search by name or address..."
              className="h-8 w-40 sm:w-56"
            />

            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Refresh
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="mr-1 h-3.5 w-3.5" />
              Import / Generate
            </Button>

            <Button
              size="sm"
              variant="danger"
              disabled={selectedCount === 0}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Secondary toolbar: selection + export (future) */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => walletsApi.selectAllWallets?.()}
              className="rounded-full px-2 py-[2px] hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => walletsApi.clearSelection?.()}
              className="rounded-full px-2 py-[2px] hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <Download className="h-3 w-3" />
              Export (soon)
            </button>
          </div>
        </div>

        {/* Wallet list */}
        <div className="min-h-0 flex-1">
          <WalletList
            wallets={displayedWallets}
            selectedWalletIds={selectedWallets}
            loading={loading}
            onToggleSelect={(id) => walletsApi.toggleWalletSelection?.(id)}
            onCopyAddress={handleCopyAddress}
            onMoreAction={(wallet) => {
              // @todo: context menu / actions
              // eslint-disable-next-line no-console
              console.log('Wallet actions clicked:', wallet);
            }}
          />
        </div>
      </section>

      {/* Import / generate modal */}
      <WalletImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onCreateGenerated={handleCreateGenerated}
        onCreateBulk={handleCreateBulk}
        onImportPrivateKey={handleImportPrivateKey}
        onImportMnemonic={handleImportMnemonic}
        defaultGroupId={selectedGroup || null}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        type="danger"
        title="Delete selected wallets?"
        message={`You are about to permanently delete ${selectedCount} wallet(s). This will remove them from the local database. Make sure you have backups of any private keys you still need.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSelected}
        loading={deleteLoading}
      />
    </div>
  );
}

export default WalletsModule;
