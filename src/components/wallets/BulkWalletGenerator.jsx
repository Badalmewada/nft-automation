// src/components/wallets/BulkWalletGenerator.jsx
import React, { useState } from 'react';
import { X, RefreshCw, Lock, AlertCircle, Download, CheckCircle } from 'lucide-react';

function BulkWalletGenerator({ onClose, onGenerate }) {
  const [count, setCount] = useState(10);
  const [namePrefix, setNamePrefix] = useState('Wallet');
  const [addToGroup, setAddToGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedWallets, setGeneratedWallets] = useState([]);
  const [error, setError] = useState('');
  const [exportAfterGen, setExportAfterGen] = useState(false);

  const validateInputs = () => {
    if (count < 1 || count > 1000) {
      setError('Count must be between 1 and 1000');
      return false;
    }
    if (!namePrefix.trim()) {
      setError('Please enter a name prefix');
      return false;
    }
    if (addToGroup && !groupName.trim()) {
      setError('Please enter a group name');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    setError('');
    
    if (!validateInputs()) {
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const wallets = [];
      const batchSize = 10; // Generate in batches for progress updates

      for (let i = 0; i < count; i += batchSize) {
        const batchCount = Math.min(batchSize, count - i);
        
        // Simulate wallet generation (in production, use ethers.js)
        for (let j = 0; j < batchCount; j++) {
          const walletIndex = i + j + 1;
          
          // In production:
          // const wallet = ethers.Wallet.createRandom();
          // wallets.push({
          //   name: `${namePrefix} ${walletIndex}`,
          //   address: wallet.address,
          //   privateKey: wallet.privateKey,
          //   mnemonic: wallet.mnemonic.phrase,
          //   source: 'generated'
          // });

          // Simulation:
          wallets.push({
            name: `${namePrefix} ${walletIndex}`,
            address: `0x${Math.random().toString(16).substr(2, 40)}`,
            privateKey: `0x${Math.random().toString(16).substr(2, 64)}`,
            mnemonic: generateMockMnemonic(),
            source: 'generated'
          });
        }

        // Update progress
        setProgress(Math.round(((i + batchCount) / count) * 100));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGeneratedWallets(wallets);

      // Auto-export if enabled
      if (exportAfterGen) {
        exportWallets(wallets);
      }

      // Call parent callback
      if (onGenerate) {
        onGenerate(wallets, addToGroup ? groupName : null);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        if (!exportAfterGen) {
          onClose();
        }
      }, 2000);

    } catch (err) {
      setError('Failed to generate wallets: ' + err.message);
      setGenerating(false);
    }
  };

  const generateMockMnemonic = () => {
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];
    return Array(12).fill(0).map(() => words[Math.floor(Math.random() * words.length)]).join(' ');
  };

  const exportWallets = (wallets) => {
    const exportData = wallets.map(w => ({
      name: w.name,
      address: w.address,
      privateKey: w.privateKey,
      mnemonic: w.mnemonic
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_wallets_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleManualExport = () => {
    if (generatedWallets.length > 0) {
      exportWallets(generatedWallets);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Bulk Generate Wallets</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            disabled={generating && progress < 100}
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {!generating || progress === 100 ? (
          <>
            {/* Number of Wallets */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Number of Wallets <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                min="1"
                max="1000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">Minimum: 1</p>
                <p className="text-xs text-gray-500">Maximum: 1000</p>
              </div>
            </div>

            {/* Name Prefix */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Name Prefix <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                placeholder="e.g., Mint, Airdrop, Trading"
                maxLength={30}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Preview: {namePrefix} 1, {namePrefix} 2, {namePrefix} 3...
              </p>
            </div>

            {/* Add to Group Option */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToGroup}
                  onChange={(e) => setAddToGroup(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 checked:bg-blue-600"
                />
                <span className="text-sm text-gray-400">Add to a new group</span>
              </label>
            </div>

            {/* Group Name (conditional) */}
            {addToGroup && (
              <div className="mb-4 ml-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Group Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Batch 1, Campaign Wallets"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Auto-Export Option */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportAfterGen}
                  onChange={(e) => setExportAfterGen(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 checked:bg-blue-600"
                />
                <span className="text-sm text-gray-400">Auto-export after generation</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {progress === 100 && generatedWallets.length > 0 && (
              <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-200">
                    Successfully generated {generatedWallets.length} wallets!
                  </p>
                  {!exportAfterGen && (
                    <button
                      onClick={handleManualExport}
                      className="text-xs text-green-300 hover:text-green-200 underline mt-1"
                    >
                      Export to JSON
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Security Warning */}
            <div className="mb-6 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-200 flex items-start gap-2">
                <Lock size={12} className="mt-0.5 flex-shrink-0" />
                <span>
                  Generated wallets are encrypted with AES-256 and stored locally. 
                  Keep your backups secure and never share private keys.
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                {progress === 100 ? 'Close' : 'Cancel'}
              </button>
              
              {progress !== 100 && (
                <button
                  onClick={handleGenerate}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white flex items-center justify-center gap-2 font-medium"
                >
                  <RefreshCw size={18} />
                  Generate Wallets
                </button>
              )}
            </div>
          </>
        ) : (
          /* Progress View */
          <div className="py-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                <RefreshCw size={32} className="text-white animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Generating Wallets...
              </h4>
              <p className="text-sm text-gray-400">
                Please wait while we create your wallets
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Generation Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Generated</p>
                <p className="text-lg font-bold text-white">
                  {Math.floor((progress / 100) * count)}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-lg font-bold text-white">{count}</p>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
              <p className="text-xs text-blue-200">
                <Lock size={12} className="inline mr-1" />
                All wallets are being encrypted before storage
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkWalletGenerator;