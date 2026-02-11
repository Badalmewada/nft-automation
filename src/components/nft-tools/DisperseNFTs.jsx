// src/components/nft-tools/DisperseNFTs.jsx
import React, { useState } from 'react';
import { SplitSquareHorizontal } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function DisperseNFTs() {
  const toast = useToast();
  const ipc = useIPC();

  const [sourceWallet, setSourceWallet] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [chainId, setChainId] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleDisperse = async () => {
    if (!sourceWallet.trim()) {
      toast.error({
        title: 'Source wallet required',
        message: 'Enter the wallet address to disperse from.',
      });
      return;
    }
    if (!targetGroupId.trim()) {
      toast.error({
        title: 'Target group required',
        message: 'Specify the wallet group to disperse into.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await ipc.invoke('nft:disperse', {
        fromAddress: sourceWallet.trim(),
        toGroupId: targetGroupId.trim(),
        chainId: Number(chainId) || 1,
      });
      toast.success({
        title: 'Disperse started',
        message:
          typeof result === 'string'
            ? result
            : 'A disperse task has been created.',
      });
    } catch (err) {
      toast.error({
        title: 'Disperse failed',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center gap-2">
        <SplitSquareHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Disperse NFTs
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Spread NFTs from one wallet across all wallets in a group.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Source wallet"
          value={sourceWallet}
          onChange={(e) => setSourceWallet(e.target.value)}
          placeholder="0x..."
        />
        <Input
          label="Target group ID"
          value={targetGroupId}
          onChange={(e) => setTargetGroupId(e.target.value)}
          placeholder="wallet-group-id"
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
          onClick={handleDisperse}
          loading={loading}
        >
          Start disperse
        </Button>
      </div>
    </div>
  );
}

export default DisperseNFTs;
