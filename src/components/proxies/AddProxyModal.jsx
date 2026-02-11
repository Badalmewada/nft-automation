// src/components/proxies/AddProxyModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const PROTOCOLS = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks5', label: 'SOCKS5' },
];

function AddProxyModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    label: '',
    host: '',
    port: '',
    username: '',
    password: '',
    protocol: 'http',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!form.host.trim()) throw new Error('Host is required');
      if (!form.port.trim()) throw new Error('Port is required');

      const payload = {
        label: form.label.trim() || null,
        host: form.host.trim(),
        port: Number(form.port) || 0,
        username: form.username.trim() || null,
        password: form.password || null,
        protocol: form.protocol,
      };

      await onCreate?.(payload);
      onClose?.();
    } catch (err) {
      console.error('AddProxyModal submit error:', err);
      // parent shows toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={loading ? undefined : onClose}
      title="Add proxy"
      size="md"
      showCloseButton={!loading}
    >
      <div className="space-y-3 text-xs">
        <Input
          label="Label (optional)"
          value={form.label}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="e.g. Mint farm 1"
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Host"
            required
            value={form.host}
            onChange={(e) => updateField('host', e.target.value)}
            placeholder="127.0.0.1"
          />
          <Input
            label="Port"
            required
            type="number"
            min={1}
            max={65535}
            value={form.port}
            onChange={(e) => updateField('port', e.target.value)}
          />
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Protocol
            </label>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm outline-none ring-blue-500/0 focus:border-blue-500 focus:ring-1 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              value={form.protocol}
              onChange={(e) => updateField('protocol', e.target.value)}
            >
              {PROTOCOLS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Username (optional)"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
          />
          <Input
            label="Password (optional)"
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
          />
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
          Add proxy
        </Button>
      </div>
    </Modal>
  );
}

AddProxyModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
};

export default AddProxyModal;
