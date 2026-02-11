// src/components/nft-tools/NFTToolsModule.jsx
import React, { useState } from 'react';
import { Search, ArrowRightLeft, SplitSquareHorizontal } from 'lucide-react';
import Button from '../common/Button';
import NFTDetector from './NFTDetector';
import ConsolidateNFTs from './ConsolidateNFTs';
import DisperseNFTs from './DisperseNFTs';

const TABS = [
  { key: 'detect', label: 'Detector', icon: Search },
  { key: 'consolidate', label: 'Consolidate', icon: ArrowRightLeft },
  { key: 'disperse', label: 'Disperse', icon: SplitSquareHorizontal },
];

function NFTToolsModule() {
  const [activeTab, setActiveTab] = useState('detect');

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header + tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            NFT tools
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            Detect, consolidate, and disperse NFTs across your wallet fleet.
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                size="sm"
                variant={active ? 'primary' : 'ghost'}
                className="h-8 px-2 text-[11px]"
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className="mr-1 h-3.5 w-3.5" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1">
        {activeTab === 'detect' && <NFTDetector />}
        {activeTab === 'consolidate' && <ConsolidateNFTs />}
        {activeTab === 'disperse' && <DisperseNFTs />}
      </div>
    </div>
  );
}

export default NFTToolsModule;
