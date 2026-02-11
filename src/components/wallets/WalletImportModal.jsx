// src/components/wallets/WalletImportModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TABS = [
  { key: 'generate', label: 'Generate' },
  { key: 'bulk', label: 'Bulk Generate' },
  { key: 'privateKey', label: 'Import Private Key' },
  { key: 'mnemonic', label: 'Import Mnemonic' },
];

function WalletImportModal({
  open,
  onClose,
  onCreateGenerated,
  onCreateBulk,
  onImportPrivateKey,
  onImportMnemonic,
  defaultGroupId = null,
}) {
  const [activeTab, setActiveTab] = useState('generate');
  const [form, setForm] = useState({
    name: '',
    groupId: defaultGroupId,
    bulkCount: 10,
    privateKey: '',
    mnemonic: '',
    accountCount: 5,
    startIndex: 0,
    derivationPath: "m/44'/60'/0'/0",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (activeTab === 'generate') {
        await onCreateGenerated?.({
          name: form.name,
          groupId: form.groupId,
        });
      } else if (activeTab === 'bulk') {
        const count = Number(form.bulkCount) || 0;
        if (count <= 0) throw new Error('Bulk count must be greater than 0');
        await onCreateBulk?.({
          count,
          groupId: form.groupId,
        });
      } else if (activeTab === 'privateKey') {
        if (!form.privateKey.trim()) {
          throw new Error('Private key is required');
        }
        await onImportPrivateKey?.({
          privateKey: form.privateKey.trim(),
          name: form.name,
          groupId: form.groupId,
        });
      } else if (activeTab === 'mnemonic') {
        if (!form.mnemonic.trim()) {
          throw new Error('Mnemonic phrase is required');
        }
        const count = Number(form.accountCount) || 1;
        const startIndex = Number(form.startIndex) || 0;

        await onImportMnemonic?.({
          mnemonic: form.mnemonic.trim(),
          count,
          startIndex,
          derivationPath: form.derivationPath || "m/44'/60'/0'/0",
          groupId: form.groupId,
          baseName: form.name,
        });
      }

      onClose?.();
    } catch (err) {
      // Error is handled by parent via toast; we just stop loading
      // eslint-disable-next-line no-console
      console.error('WalletImportModal error:', err);
    } finally {
      setLoading(false);
    }
  };

  const titleByTab = {
    generate: 'Generate Wallet',
    bulk: 'Bulk Generate Wallets',
    privateKey: 'Import from Private Key',
    mnemonic: 'Import from Mnemonic',
  }[activeTab];

  return (
    <Modal
      isOpen={open}
      onClose={loading ? undefined : onClose}
      title={titleByTab}
      size="lg"
      showCloseButton={!loading}
    >
      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100/80 p-1 text-xs dark:bg-slate-900/70">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex-1 rounded-md px-2 py-1.5 font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 text-xs">
        {/* Common fields */}
        <Input
          label={activeTab === 'bulk' ? 'Base name (optional)' : 'Name (optional)'}
          placeholder={activeTab === 'bulk' ? 'e.g. Mint Wallet #' : 'e.g. Mint Wallet 1'}
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />

        {/* For now groupId is hidden; later you can replace with Dropdown */}
        {/* <Input
          label="Group ID (optional)"
          value={form.groupId || ''}
          onChange={(e) => updateField('groupId', e.target.value || null)}
        /> */}

        {activeTab === 'bulk' && (
          <Input
            label="Number of wallets"
            type="number"
            min={1}
            max={5000}
            value={form.bulkCount}
            onChange={(e) => updateField('bulkCount', e.target.value)}
            helperText="Recommended: 10–100 per batch depending on your system and RPC limits."
          />
        )}

        {activeTab === 'privateKey' && (
          <Input
            label="Private key"
            type="password"
            required
            value={form.privateKey}
            onChange={(e) => updateField('privateKey', e.target.value)}
            placeholder="0x..."
            helperText="Your key will be encrypted and never sent outside this machine."
          />
        )}

        {activeTab === 'mnemonic' && (
          <>
            <Input
              label="Mnemonic phrase"
              type="password"
              required
              value={form.mnemonic}
              onChange={(e) => updateField('mnemonic', e.target.value)}
              placeholder="12 or 24-word seed phrase"
              helperText="Use a dedicated mnemonic for this tool. Never paste your main wallet seed."
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Account count"
                type="number"
                min={1}
                max={200}
                value={form.accountCount}
                onChange={(e) => updateField('accountCount', e.target.value)}
              />
              <Input
                label="Start index"
                type="number"
                min={0}
                max={100000}
                value={form.startIndex}
                onChange={(e) => updateField('startIndex', e.target.value)}
              />
            </div>
            <Input
              label="Derivation path"
              value={form.derivationPath}
              onChange={(e) => updateField('derivationPath', e.target.value)}
              helperText="Default: m/44'/60'/0'/0 (Ethereum / EVM standard)"
            />
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          loading={loading}
        >
          {activeTab === 'generate' && 'Generate'}
          {activeTab === 'bulk' && 'Bulk Generate'}
          {activeTab === 'privateKey' && 'Import'}
          {activeTab === 'mnemonic' && 'Derive Accounts'}
        </Button>
      </div>
    </Modal>
  );
}

WalletImportModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreateGenerated: PropTypes.func,
  onCreateBulk: PropTypes.func,
  onImportPrivateKey: PropTypes.func,
  onImportMnemonic: PropTypes.func,
  defaultGroupId: PropTypes.string,
};

export default WalletImportModal;
