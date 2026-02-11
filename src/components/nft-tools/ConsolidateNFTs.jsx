// src/components/nft-tools/ConsolidateNFTs.jsx
import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function ConsolidateNFTs() {
  const toast = useToast();
  const ipc = useIPC();

  const [fromGroupId, setFromGroupId] = useState('');
  const [targetWallet, setTargetWallet] = useState('');
  const [chainId, setChainId] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConsolidate = async () => {
    if (!fromGroupId.trim()) {
      toast.error({
        title: 'Group required',
        message: 'Specify the wallet group to consolidate from.',
      });
      return;
    }
    if (!targetWallet.trim()) {
      toast.error({
        title: 'Target wallet required',
        message: 'Specify the receiving wallet address.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await ipc.invoke('nft:consolidate', {
        fromGroupId: fromGroupId.trim(),
        toAddress: targetWallet.trim(),
        chainId: Number(chainId) || 1,
      });
      toast.success({
        title: 'Consolidation started',
        message:
          typeof result === 'string'
            ? result
            : 'A task has been created in the Tasks module.',
      });
    } catch (err) {
      toast.error({
        title: 'Consolidation failed',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Consolidate NFTs
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Move NFTs from all wallets in a group into a single destination wallet.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="From group ID"
          value={fromGroupId}
          onChange={(e) => setFromGroupId(e.target.value)}
          placeholder="wallet-group-id"
        />
        <Input
          label="Target wallet address"
          value={targetWallet}
          onChange={(e) => setTargetWallet(e.target.value)}
          placeholder="0x..."
        />
        <Input
          label="Chain ID"
          type="number"
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        />
      </div>

      <div className="mt-auto flex justify-end">
        <Button
          size="sm"
          variant="primary"
          onClick={handleConsolidate}
          loading={loading}
        >
          Start consolidation
        </Button>
      </div>
    </div>
  );
}

export default ConsolidateNFTs;
