// src/components/tasks/CreateTaskModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TASK_TYPES = [
  { value: 'mint', label: 'NFT Mint' },
  { value: 'contractCall', label: 'Custom Contract Call' },
];

function CreateTaskModal({
  open,
  onClose,
  onCreate,
  defaultChainId,
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'mint',
    chainId: defaultChainId || 1,
    maxConcurrency: 5,
    maxPerWallet: 1,
    gasLimit: 200000,
    encodedCallData: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!form.name.trim()) {
        throw new Error('Task name is required');
      }

      const payload = {
        name: form.name.trim(),
        type: form.type,
        chainId: Number(form.chainId) || 1,
        config: {
          maxConcurrency: Number(form.maxConcurrency) || 1,
          maxPerWallet: Number(form.maxPerWallet) || 1,
          gasLimit: Number(form.gasLimit) || 0,
          encodedCallData: form.encodedCallData.trim() || null,
        },
      };

      await onCreate?.(payload);
      onClose?.();
    } catch (err) {
      console.error('CreateTaskModal submit error:', err);
      // error surfaced via toast by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={loading ? undefined : onClose}
      title="Create task"
      size="lg"
      showCloseButton={!loading}
    >
      <div className="space-y-3 text-xs">
        <Input
          label="Task name"
          required
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. Base mainnet mint for 1k wallets"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Task type
            </label>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              {TASK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Chain ID"
            type="number"
            value={form.chainId}
            onChange={(e) => updateField('chainId', e.target.value)}
            helperText="e.g. 1 = Ethereum, 8453 = Base"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Max concurrency"
            type="number"
            min={1}
            max={100}
            value={form.maxConcurrency}
            onChange={(e) => updateField('maxConcurrency', e.target.value)}
            helperText="Parallel wallets per batch."
          />
          <Input
            label="Max per wallet"
            type="number"
            min={1}
            max={100}
            value={form.maxPerWallet}
            onChange={(e) => updateField('maxPerWallet', e.target.value)}
            helperText="Transactions per wallet."
          />
          <Input
            label="Gas limit"
            type="number"
            min={21000}
            value={form.gasLimit}
            onChange={(e) => updateField('gasLimit', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Encoded call data (optional)
          </label>
          <textarea
            className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-[11px] text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            placeholder="0x..."
            value={form.encodedCallData}
            onChange={(e) => updateField('encodedCallData', e.target.value)}
          />
          <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
            You can generate this from the Dashboard &quot;Contract method generator&quot;.
            If empty, backend may use default method config.
          </div>
        </div>
      </div>

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
          Create task
        </Button>
      </div>
    </Modal>
  );
}

CreateTaskModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  defaultChainId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default CreateTaskModal;
