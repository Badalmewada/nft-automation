// src/components/rpc/AddRPCModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const TYPES = [
  { value: 'primary', label: 'Primary' },
  { value: 'fallback', label: 'Fallback' },
  { value: 'archive', label: 'Archive' },
];

function AddRPCModal({ open, onClose, onCreate, defaultChainId }) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    chainId: defaultChainId || 1,
    type: 'primary',
    weight: 1,
    maxRequestsPerSecond: 10,
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.url.trim()) throw new Error('RPC URL is required');

      const payload = {
        name: form.name.trim(),
        url: form.url.trim(),
        chainId: Number(form.chainId) || 1,
        type: form.type,
        weight: Number(form.weight) || 1,
        maxRequestsPerSecond: Number(form.maxRequestsPerSecond) || 0,
        enabled: !!form.enabled,
      };

      await onCreate?.(payload);
      onClose?.();
    } catch (err) {
      console.error('AddRPCModal submit error:', err);
      // parent surfaces error via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={loading ? undefined : onClose}
      title="Add RPC endpoint"
      size="lg"
      showCloseButton={!loading}
    >
      <div className="space-y-3 text-xs">
        <Input
          label="Name"
          required
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g. Base mainnet primary"
        />

        <Input
          label="RPC URL"
          required
          value={form.url}
          onChange={(e) => updateField('url', e.target.value)}
          placeholder="https://base-mainnet.example.com"
          helperText="Use a dedicated key / project for this tool. Never paste sensitive admin URLs."
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Chain ID"
            type="number"
            value={form.chainId}
            onChange={(e) => updateField('chainId', e.target.value)}
            helperText="1=ETH, 8453=Base, 10=Optimism, etc."
          />
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Type
            </label>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Weight"
            type="number"
            min={0}
            value={form.weight}
            onChange={(e) => updateField('weight', e.target.value)}
            helperText="Higher = more traffic routed here."
          />
        </div>

        <Input
          label="Max requests per second"
          type="number"
          min={0}
          value={form.maxRequestsPerSecond}
          onChange={(e) => updateField('maxRequestsPerSecond', e.target.value)}
          helperText="0 = no client-side limit (let provider throttle)."
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="rpc-enabled"
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => updateField('enabled', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
          />
          <label
            htmlFor="rpc-enabled"
            className="text-[11px] text-slate-600 dark:text-slate-300"
          >
            Enabled
          </label>
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
          Add RPC
        </Button>
      </div>
    </Modal>
  );
}

AddRPCModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  defaultChainId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default AddRPCModal;
