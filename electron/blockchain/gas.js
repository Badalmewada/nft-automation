// electron/blockchain/gas.js
const { JsonRpcProvider } = require('ethers');
const logger = require('../utils/logger');

// Free public RPCs just for dev. Later: tie this into your RPC module.
const DEFAULT_RPCS = {
  1: 'https://eth.llamarpc.com',          // Ethereum
  8453: 'https://base.llamarpc.com',      // Base
};

function getProvider(chainId) {
  const id = Number(chainId) || 1;
  const url = DEFAULT_RPCS[id];

  if (!url) {
    throw new Error(`No RPC configured for chainId ${id}`);
  }

  return new JsonRpcProvider(url);
}

/**
 * Simple EIP-1559 gas estimator using eth_feeHistory.
 * Returns prices in Gwei.
 */
async function getGasPrices(chainId) {
  const id = Number(chainId) || 1;
  const provider = getProvider(id);

  // eth_feeHistory(blockCount, newestBlock, rewardPercentiles)
  const history = await provider.send('eth_feeHistory', [
    '5',
    'latest',
    [25, 50, 75],
  ]);

  // baseFeePerGas is array of hex strings per block
  const baseFeeHex = history.baseFeePerGas[history.baseFeePerGas.length - 1];
  const baseFeeWei = BigInt(baseFeeHex);
  const baseFeeGwei = Number(baseFeeWei) / 1e9;

  // priority fee (reward) arrays: history.reward[blockIndex][percentileIndex]
  const latestRewards = history.reward[history.reward.length - 1] || [];
  const slowPriorityWei = latestRewards[0] ? BigInt(latestRewards[0]) : 0n;
  const normalPriorityWei = latestRewards[1] ? BigInt(latestRewards[1]) : slowPriorityWei;
  const fastPriorityWei = latestRewards[2] ? BigInt(latestRewards[2]) : normalPriorityWei;

  const slowGwei =
    Number(baseFeeWei + slowPriorityWei) / 1e9;
  const normalGwei =
    Number(baseFeeWei + normalPriorityWei) / 1e9;
  const fastGwei =
    Number(baseFeeWei + fastPriorityWei) / 1e9;

  const result = {
    chainId: id,
    baseFee: Number(baseFeeGwei.toFixed(2)),
    slow: Number(slowGwei.toFixed(2)),
    normal: Number(normalGwei.toFixed(2)),
    fast: Number(fastGwei.toFixed(2)),
    updatedAt: Date.now(),
  };

  logger.info('Gas prices updated', result);
  return result;
}

module.exports = {
  getGasPrices,
};
