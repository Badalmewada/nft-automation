// electron/blockchain/provider.js
// Simple JsonRpcProvider factory for EVM chains

const { JsonRpcProvider } = require('ethers');

function createProvider({ rpcUrl, chainId }) {
  if (!rpcUrl) {
    throw new Error('RPC URL is required to create provider');
  }

  // chainId optional for now
  const provider = new JsonRpcProvider(rpcUrl, chainId || undefined);

  return provider;
}

module.exports = {
  createProvider,
};
