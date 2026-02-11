// electron/config/chains.js

// Unified Etherscan V2 endpoint for all supported EVM chains
// Docs: https://api.etherscan.io/v2/api (GET Get Contract ABI)
const ETHERSCAN_V2_API = 'https://api.etherscan.io/v2/api';

// Minimal chain config – we just need IDs + labels
const CHAINS = {
  1: {
    id: 1,
    key: 'eth-mainnet',
    name: 'Ethereum',
    etherscanChainId: '1',
  },
  8453: {
    id: 8453,
    key: 'base-mainnet',
    name: 'Base',
    etherscanChainId: '8453',
  },
  // aur bhi add kar sakte ho:
  // 10: { id: 10, key: 'optimism', name: 'Optimism', etherscanChainId: '10' },
  // 42161: { id: 42161, key: 'arbitrum-one', name: 'Arbitrum One', etherscanChainId: '42161' },
};

function getChainConfig(chainId) {
  const idNum = Number(chainId || 1);
  const chain = CHAINS[idNum];
  if (!chain) return null;

  // Etherscan V2 ko use karne ke liye hum yaha extra fields add kar dete hain
  return {
    ...chain,
    explorerApi: ETHERSCAN_V2_API,
    explorerApiKeyEnv: 'ETHERSCAN_API_KEY',
  };
}

module.exports = {
  CHAINS,
  getChainConfig,
  ETHERSCAN_V2_API,
};
