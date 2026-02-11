// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { CHAINS } from '../../utils/constants';

export default function Header() {
  const [activeChainId, setActiveChainId] = useState(CHAINS[0]?.id);

  return (
    <header className="w-full px-6 pt-4 pb-2 bg-slate-950/80 backdrop-blur border-b border-slate-800 flex flex-col gap-3">
      {/* Time row (IST / UTC / UNIX etc. – abhi static placeholder) */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-300">
        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700">
          IST: {new Date().toLocaleTimeString('en-IN')}
        </div>
        <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700">
          UTC: {new Date().toUTCString().slice(17, 25)}
        </div>
      </div>

      {/* Chain cards row */}
      <div className="flex flex-wrap gap-4">
        {CHAINS.map((chain) => {
          const active = chain.id === activeChainId;
          return (
            <button
              key={chain.id}
              type="button"
              onClick={() => setActiveChainId(chain.id)}
              className={`relative px-4 py-3 rounded-2xl border text-left min-w-[180px] transition
                ${
                  active
                    ? 'border-cyan-400 bg-gradient-to-r ' + chain.color
                    : 'border-slate-700 bg-slate-900/80 hover:border-cyan-400/60'
                }`}
            >
              <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
                {chain.symbol} Network
              </div>
              <div className="text-sm font-semibold">{chain.name}</div>
              <div className="mt-1 text-[11px] opacity-80">
                Gas: — • RPC: —
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
}
