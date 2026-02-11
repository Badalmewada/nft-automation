// src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex h-9 items-center justify-between border-t border-slate-200/70 bg-white/80 px-3 text-[11px] text-slate-500 shadow-inner shadow-black/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <span className="font-medium">NFT Mint Pro</span>
        <span className="hidden text-slate-400 sm:inline">
          • High-performance NFT minting & wallet automation
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline">
          v0.1.0 • Internal Dev Build
        </span>
        <span className="text-slate-400">© {year}</span>
      </div>
    </footer>
  );
}

export default Footer;
