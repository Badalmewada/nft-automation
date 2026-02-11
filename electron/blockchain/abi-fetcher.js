// electron/blockchain/abi-fetcher.js
const axios = require('axios');
const { getChainConfig } = require('../config/chains');
const logger = require('../utils/logger');

function normalizeAddress(address) {
  return String(address || '').trim();
}
console.log("== DEBUG API KEY ==", process.env.ETHERSCAN_API_KEY);

/**
 * Fetch contract ABI from Etherscan V2 (multichain)
 * Works for Ethereum, Base, etc. using `chainid`.
 */
async function fetchContractAbi(address, chainId) {
  const normalized = normalizeAddress(address);

  if (!normalized || !normalized.startsWith('0x') || normalized.length !== 42) {
    throw new Error('Invalid contract address');
  }

  const chain = getChainConfig(chainId || 1);
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported for ABI fetch`);
  }

  const apiUrl = chain.explorerApi; // https://api.etherscan.io/v2/api
  const apiKey =
    (chain.explorerApiKeyEnv && process.env[chain.explorerApiKeyEnv]) || '';

  const params = {
    module: 'contract',
    action: 'getabi',
    address: normalized,
    chainid: chain.etherscanChainId || String(chain.id),
  };

  if (apiKey) {
    params.apikey = apiKey;
  }

  logger.info('Fetching ABI from Etherscan V2', {
    chainId: chain.id,
    chainidParam: params.chainid,
    url: apiUrl,
    address: normalized,
  });

  const { data } = await axios.get(apiUrl, {
    params,
    timeout: 10000,
  });

  if (!data) {
    throw new Error('No response from explorer');
  }

  if (String(data.status) !== '1') {
    const msg = data.result || data.message || 'Explorer returned error';
    throw new Error(msg);
  }

  let abi;
  try {
    abi = JSON.parse(data.result);
  } catch (err) {
    logger.error('Failed to parse ABI JSON from explorer', {
      error: String(err),
    });
    throw new Error('Failed to parse ABI JSON');
  }

  if (!Array.isArray(abi)) {
    throw new Error('Explorer returned invalid ABI format');
  }

  return abi;
}

module.exports = {
  fetchContractAbi,
};
