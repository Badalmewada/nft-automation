// electron/workers/task-executor.js
// Core job executor for multi-wallet mint tasks

const { executeContractCall } = require('../blockchain/contract');

/**
 * Run a Mint Job for multiple wallets.
 *
 * This is intentionally stateless: sab data upar se aata hai.
 * DB logging, queue system, retries, proxies sab baad mein add karenge.
 *
 * @param {Object} job
 * @param {string} job.jobId
 * @param {string} job.rpcUrl
 * @param {number} [job.chainId]
 * @param {Array|Object} job.abi
 * @param {string} job.contractAddress
 * @param {string} job.functionName
 * @param {Array<{walletId:string, address:string, privateKey:string}>} job.wallets
 *        -> privateKey = decrypted PK (wallet-service se nikal ke)
 * @param {Array} [job.commonArgs]    - Same args for all wallets
 * @param {Object} [job.gasOverrides] - { gasLimit, maxFeePerGas, maxPriorityFeePerGas, value }
 *
 * @returns {Promise<Array<{walletId, address, status, txHash?, error?}>>}
 */
async function runMintJob(job) {
  const {
    jobId,
    rpcUrl,
    chainId,
    abi,
    contractAddress,
    functionName,
    wallets,
    commonArgs = [],
    gasOverrides = {},
  } = job;

  if (!Array.isArray(wallets) || wallets.length === 0) {
    throw new Error('runMintJob: wallets array is empty');
  }

  const results = [];

  for (const wallet of wallets) {
    const { walletId, address, privateKey } = wallet;

    const resultItemBase = {
      walletId,
      address,
    };

    try {
      const { txHash } = await executeContractCall({
        rpcUrl,
        chainId,
        privateKey,
        abi,
        address: contractAddress,
        functionName,
        args: commonArgs,
        overrides: gasOverrides,
      });

      results.push({
        ...resultItemBase,
        status: 'success',
        txHash,
      });
    } catch (err) {
      // For now just push error message – later we log to DB / logs file
      results.push({
        ...resultItemBase,
        status: 'error',
        error: err?.message || String(err),
      });
    }
  }

  return {
    jobId,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    results,
  };
}

module.exports = {
  runMintJob,
};
