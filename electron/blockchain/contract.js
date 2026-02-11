// electron/blockchain/contract.js
// Generic contract execution helpers for mint + other write calls

const { Wallet, Contract } = require('ethers');
const { createProvider } = require('./provider');

/**
 * Execute a write function on a contract (e.g. mint)
 *
 * @param {Object} params
 * @param {string} params.rpcUrl      - JSON RPC URL
 * @param {number} [params.chainId]   - Optional chainId
 * @param {string} params.privateKey  - Decrypted private key of the wallet
 * @param {Array|Object} params.abi   - Contract ABI
 * @param {string} params.address     - Contract address
 * @param {string} params.functionName - Function to call (e.g. "mint", "mintPublic")
 * @param {Array} [params.args]       - Function arguments
 * @param {Object} [params.overrides] - Tx overrides (gasLimit, maxFeePerGas, value, etc.)
 *
 * @returns {Promise<{txHash: string, receipt: Object}>}
 */
async function executeContractCall({
  rpcUrl,
  chainId,
  privateKey,
  abi,
  address,
  functionName,
  args = [],
  overrides = {},
}) {
  if (!rpcUrl) throw new Error('executeContractCall: rpcUrl is required');
  if (!privateKey) throw new Error('executeContractCall: privateKey is required');
  if (!abi) throw new Error('executeContractCall: abi is required');
  if (!address) throw new Error('executeContractCall: contract address is required');
  if (!functionName) throw new Error('executeContractCall: functionName is required');

  const provider = createProvider({ rpcUrl, chainId });
  const wallet = new Wallet(privateKey, provider);
  const contract = new Contract(address, abi, wallet);

  if (typeof contract[functionName] !== 'function') {
    throw new Error(`Contract function "${functionName}" does not exist`);
  }

  // Ethers v6: tx = await contract[fn](...args, overrides)
  const tx = await contract[functionName](...(args || []), overrides || {});
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    receipt,
  };
}

module.exports = {
  executeContractCall,
};
