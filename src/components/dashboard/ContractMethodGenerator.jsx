// src/components/dashboard/ContractMethodGenerator.jsx
import React, { useMemo, useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import { useToast } from '../common/Toast';
import { CHAINS } from '../../utils/constants';

const CHAIN_OPTIONS = (CHAINS || []).map((c) => ({
  value: String(c.id),
  label: c.name,
}));

function ContractMethodGenerator() {
  const toast = useToast();

  const [contractAddress, setContractAddress] = useState('');
  const [chainId, setChainId] = useState(
    CHAIN_OPTIONS[0]?.value || '1'
  );
  const [loading, setLoading] = useState(false);
  const [abi, setAbi] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(''); // dropdown selected index

  // Mint template state
  const [templateName, setTemplateName] = useState('');
  const [mintValueEth, setMintValueEth] = useState('0'); // msg.value
  const [quantityPerWallet, setQuantityPerWallet] = useState('1');
  const [savingTemplate, setSavingTemplate] = useState(false);

  const hasResult = abi && functions.length > 0;

  const selectedFnObj = useMemo(() => {
    if (selectedIndex === '' || !functions.length) return null;
    const idx = Number(selectedIndex);
    if (Number.isNaN(idx) || !functions[idx]) return null;
    return functions[idx];
  }, [functions, selectedIndex]);

  const quantityParamIndex = selectedFnObj
    ? (selectedFnObj.inputs || []).findIndex(
        (i) =>
          i.type.startsWith('uint') &&
          i.name &&
          i.name.toLowerCase().includes('quantity')
      )
    : -1;

  const hasQuantityParam = quantityParamIndex >= 0;

  const handleFetchAbi = async () => {
    if (
      !contractAddress ||
      !contractAddress.startsWith('0x') ||
      contractAddress.length !== 42
    ) {
      toast.error({
        title: 'Invalid address',
        message: 'Enter a valid 0x contract address.',
      });
      return;
    }

    if (!window.electron || typeof window.electron.invoke !== 'function') {
      toast.error({
        title: 'IPC not available',
        message: 'Electron bridge is not available in this environment.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await window.electron.invoke('contract:getAbi', {
        address: contractAddress,
        chainId: Number(chainId),
      });

      setAbi(result.abi || null);
      setFunctions(result.functions || []);
      if (result.functions && result.functions.length > 0) {
        setSelectedIndex('0');
      } else {
        setSelectedIndex('');
      }

      toast.success({
        title: 'ABI loaded',
        message: `Found ${result.functions?.length || 0} functions.`,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('ABI fetch error:', err);
      toast.error({
        title: 'Failed to load ABI',
        message: String(err?.message || err),
      });
      setAbi(null);
      setFunctions([]);
      setSelectedIndex('');
    } finally {
      setLoading(false);
    }
  };

  const methodOptions = functions.map((fn, idx) => ({
    value: String(idx),
    label: `${fn.name}(${fn.inputs
      .map((i) => i.type)
      .join(', ')}) [${fn.stateMutability}]`,
  }));

  const handleSelectFunction = (value) => {
    setSelectedIndex(value || '');
  };

  const handleSaveTemplate = async () => {
    if (!selectedFnObj) {
      toast.error({
        title: 'No function selected',
        message: 'Select a mint function first.',
      });
      return;
    }
    if (!contractAddress) {
      toast.error({
        title: 'Missing contract',
        message: 'Enter a contract address.',
      });
      return;
    }
    if (!templateName) {
      toast.error({
        title: 'Template name required',
        message: 'Give this template a short name.',
      });
      return;
    }
    if (!window.electron || typeof window.electron.invoke !== 'function') {
      toast.error({
        title: 'IPC not available',
        message: 'Electron bridge is not available in this environment.',
      });
      return;
    }

    try {
      setSavingTemplate(true);
      const numericChainId = Number(chainId || 1);

      const payload = {
        name: templateName,
        chainId: numericChainId,
        contractAddress,
        functionSignature: selectedFnObj.signature,
        functionStateMutability: selectedFnObj.stateMutability,
        abi,
        valueEth: mintValueEth || '0',
        quantityPerWallet: hasQuantityParam
          ? quantityPerWallet || '1'
          : null,
        quantityParamIndex: hasQuantityParam
          ? quantityParamIndex
          : null,
      };

      const result = await window.electron.invoke(
        'tasks:createMintTemplate',
        payload
      );

      toast.success({
        title: 'Mint template saved',
        message: `Template "${result.name}" is now available in Tasks.`,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save mint template:', err);
      toast.error({
        title: 'Save failed',
        message: String(err),
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Contract method generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fetch ABI from explorer and inspect available functions.
          </p>
        </div>
      </div>

      {/* Address + chain selector */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Input
            label="Contract address"
            placeholder="0x..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value.trim())}
          />
        </div>

        <div className="w-full md:w-48">
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Network
          </label>
          <Dropdown
            value={chainId}
            onChange={(val) => setChainId(val)}
            options={
              CHAIN_OPTIONS.length
                ? CHAIN_OPTIONS
                : [{ value: '1', label: 'Ethereum (1)' }]
            }
            placeholder="Select chain"
          />
        </div>

        <div className="flex w-full justify-end md:w-auto">
          <Button
            size="sm"
            className="w-full md:w-auto"
            onClick={handleFetchAbi}
            loading={loading}
          >
            {loading ? 'Loading ABI...' : 'Load ABI'}
          </Button>
        </div>
      </div>

      {/* Functions list + details */}
      {hasResult && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              Functions ({functions.length})
            </label>
            <Dropdown
              value={selectedIndex}
              onChange={handleSelectFunction}
              options={methodOptions}
              placeholder="Select a function"
            />
          </div>

          {selectedFnObj && (
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 text-xs dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="mb-2">
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedFnObj.signature}
                </div>
                <div className="mt-1 inline-flex items-center rounded-full bg-slate-900/80 px-2 py-[1px] text-[10px] uppercase tracking-[0.18em] text-slate-200 dark:bg-slate-800">
                  {selectedFnObj.stateMutability}
                </div>
              </div>

              <div className="mb-2">
                <div className="mb-1 font-semibold text-slate-800 dark:text-slate-100">
                  Inputs
                </div>
                {selectedFnObj.inputs.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400">
                    No inputs.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded border border-slate-200/80 dark:border-slate-700/80">
                    <table className="min-w-full border-collapse text-[11px]">
                      <thead className="bg-slate-100/80 dark:bg-slate-900/80">
                        <tr>
                          <th className="px-2 py-1 text-left font-medium text-slate-600 dark:text-slate-300">
                            #
                          </th>
                          <th className="px-2 py-1 text-left font-medium text-slate-600 dark:text-slate-300">
                            Name
                          </th>
                          <th className="px-2 py-1 text-left font-medium text-slate-600 dark:text-slate-300">
                            Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedFnObj.inputs.map((input, idx) => (
                          <tr
                            key={`${input.name}-${idx}`}
                            className="border-t border-slate-200/80 dark:border-slate-800/80"
                          >
                            <td className="px-2 py-1 text-slate-500 dark:text-slate-400">
                              {idx}
                            </td>
                            <td className="px-2 py-1 font-mono text-slate-700 dark:text-slate-200">
                              {input.name || (
                                <span className="opacity-60">_</span>
                              )}
                            </td>
                            <td className="px-2 py-1 font-mono text-slate-700 dark:text-slate-200">
                              {input.type}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-1 font-semibold text-slate-800 dark:text-slate-100">
                  Outputs
                </div>
                {selectedFnObj.outputs.length === 0 ? (
                  <div className="text-slate-500 dark:text-slate-400">
                    No explicit outputs.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {selectedFnObj.outputs.map((output, idx) => (
                      <li
                        key={`${output.name}-${idx}`}
                        className="flex items-center justify-between rounded border border-slate-200/80 bg-white/70 px-2 py-1 text-[11px] dark:border-slate-700/80 dark:bg-slate-900/70"
                      >
                        <span className="font-mono text-slate-700 dark:text-slate-100">
                          {output.type}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {output.name || `out_${idx}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Mint template creator */}
          {selectedFnObj && (
            <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-700/80 dark:bg-slate-950/70">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Mint template
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Save this function as a reusable mint configuration.
                    Later you can run it for selected wallets from the
                    Tasks module.
                  </p>
                </div>
              </div>

              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <Input
                  label="Template name"
                  placeholder="e.g. Chimpers public mint"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />

                <Input
                  label="ETH per transaction"
                  placeholder="0.0"
                  value={mintValueEth}
                  onChange={(e) => setMintValueEth(e.target.value)}
                  helperText="msg.value to send with each mint (0 for free mints)."
                />

                {hasQuantityParam && (
                  <Input
                    label="Quantity per wallet"
                    placeholder="1"
                    value={quantityPerWallet}
                    onChange={(e) =>
                      setQuantityPerWallet(e.target.value)
                    }
                    helperText="Will be used for the quantity parameter."
                  />
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This template stores: chain, contract, function
                  signature, ABI and your default mint parameters.
                  Execution is controlled from the Tasks &amp; Wallets
                  modules.
                </p>
                <Button
                  size="sm"
                  disabled={
                    !selectedFnObj ||
                    !contractAddress ||
                    !templateName ||
                    savingTemplate
                  }
                  loading={savingTemplate}
                  onClick={handleSaveTemplate}
                >
                  Save mint template
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !hasResult && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Enter an on-chain contract address and click &ldquo;Load
          ABI&rdquo; to inspect methods.
        </div>
      )}
    </div>
  );
}

export default ContractMethodGenerator;
