// src/components/nft-tools/NFTDetector.jsx
import React, { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Table from '../common/Table';
import { useToast } from '../common/Toast';
import useIPC from '../../hooks/useIPC';

function NFTDetector() {
  const toast = useToast();
  const ipc = useIPC();

  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [chainId, setChainId] = useState(1);
  const [nfts, setNfts] = useState([]);

  const columns = [
    {
      key: 'collection',
      title: 'Collection',
      dataIndex: 'collectionName',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">
            {value || 'Unknown collection'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {row.contractAddress}
          </span>
        </div>
      ),
    },
    {
      key: 'token',
      title: 'Token',
      dataIndex: 'tokenId',
      render: (value) => (
        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-100">
          #{value}
        </span>
      ),
    },
    {
      key: 'balance',
      title: 'Balance',
      dataIndex: 'balance',
    },
    {
      key: 'standard',
      title: 'Type',
      dataIndex: 'standard',
    },
  ];

  const handleDetect = async () => {
    if (!walletAddress.trim()) {
      toast.error({
        title: 'Wallet required',
        message: 'Enter a wallet address to scan.',
      });
      return;
    }
    setLoading(true);
    try {
      const result = await ipc.invoke('nft:detect', {
        address: walletAddress.trim(),
        chainId: Number(chainId) || 1,
      });
      setNfts(result || []);
      toast.success({
        title: 'Scan complete',
        message: `${(result || []).length} NFT(s) found.`,
      });
    } catch (err) {
      toast.error({
        title: 'Scan failed',
        message: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              NFT detector
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Scan wallet for ERC-721 / ERC-1155 holdings
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            label="Wallet"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="h-8 w-40 sm:w-56"
          />
          <Input
            label="Chain ID"
            type="number"
            value={chainId}
            onChange={(e) => setChainId(e.target.value)}
            className="h-8 w-24"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={handleDetect}
            loading={loading}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Scan
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <Table
          columns={columns}
          data={nfts}
          loading={loading}
          keyField={(row) => `${row.contractAddress}-${row.tokenId}`}
          emptyMessage="No NFTs found yet. Run a scan to see holdings."
        />
      </div>
    </div>
  );
}

export default NFTDetector;
