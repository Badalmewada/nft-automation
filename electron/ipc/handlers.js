// electron/ipc/handlers.js
const { v4: uuidv4 } = require('uuid');
const walletCore = require('../blockchain/wallet');
const { ipcMain } = require('electron');
const { Interface } = require('ethers');
const { fetchContractAbi } = require('../blockchain/abi-fetcher');
const { getGasPrices } = require('../blockchain/gas');

const crypto = require('crypto');
const logger = require('../utils/logger');
const { runMintJob } = require('../workers/task-executor');
// Wallet service tumhare project ka existing implementation hai:
// const walletService = require('../services/wallet-service');

/**
 * Simple in-memory state (no persistence yet).
 * This lets the UI + IPC work without native SQLite.
 */
const state = {
  wallets: [],        // ✅ in-memory wallet list
  walletGroups: [],   // optional, future use

  rpcEndpoints: [],
  proxies: [],
  tasks: [],
  taskExecutions: [],
  nftHoldings: [],
  settings: {
    general: {},
    advanced: {},
    security: {},
    captcha_config: {},
  },
};

function genId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
}

/* ----------------------------- Helper ----------------------------- */

function safeHandle(channel, handler) {
  ipcMain.handle(channel, async (event, payload) => {
    try {
      logger.debug && logger.debug(`IPC invoke: ${channel}`, { payload });
      const result = await handler(event, payload || {});
      return result;
    } catch (err) {
      logger.error && logger.error(`IPC error on ${channel}`, { error: String(err) });
      throw new Error(err && err.message ? err.message : String(err));
    }
  });
}

/* ----------------------------- App Stats ----------------------------- */

function registerAppHandlers() {
  safeHandle('app:getStats', async () => {
    const totalWallets = state.wallets.length;

    const totalTasks = state.tasks.length;
    const runningTasks = state.tasks.filter((t) => t.status === 'running').length;

    const totalRpc = state.rpcEndpoints.length;
    const healthyRpc = state.rpcEndpoints.filter((r) => r.healthStatus === 'healthy').length;
    const degradedRpc = state.rpcEndpoints.filter((r) => r.healthStatus === 'degraded').length;
    const downRpc = state.rpcEndpoints.filter((r) => r.healthStatus === 'down').length;

    const totalProxies = state.proxies.length;
    const healthyProxies = state.proxies.filter((p) => p.status === 'healthy').length;

    return {
      wallets: {
        total: totalWallets,
      },
      tasks: {
        total: totalTasks,
        running: runningTasks,
      },
      rpc: {
        total: totalRpc,
        healthy: healthyRpc,
        degraded: degradedRpc,
        down: downRpc,
      },
      proxies: {
        total: totalProxies,
        healthy: healthyProxies,
      },
      engine: {
        status: 'online',
      },
    };
  });
}

/* ----------------------------- Wallets ----------------------------- */

function registerWalletHandlers() {
  // Private helper – never send secrets to renderer
  const sanitizeWallet = (w) => {
    if (!w) return w;
    const { privateKey, mnemonic, ...rest } = w;
    return rest;
  };

  // Create a wallet record for our in-memory store
  const createWalletRecord = (coreWallet, options = {}) => {
    const now = Date.now();
    return {
      id: uuidv4(),
      name: options.name || `Wallet ${state.wallets.length + 1}`,
      address: coreWallet.address,
      privateKey: coreWallet.privateKey,
      chainId: options.chainId || 1,
      groupId: options.groupId || null,
      tags: options.tags || [],
      metadata: {
        createdAt: now,
        importedAt: now,
        importMethod: options.importMethod || 'generated',
        accountIndex: options.accountIndex != null ? options.accountIndex : 0,
        lastUsed: null,
        transactionCount: 0,
      },
    };
  };

  const getAllWallets = () => state.wallets.map((w) => sanitizeWallet(w));

  const deleteByIds = (ids = []) => {
    const idSet = new Set(ids.map(String));
    const before = state.wallets.length;
    state.wallets = state.wallets.filter((w) => !idSet.has(String(w.id)));
    return { deleted: before - state.wallets.length };
  };

  /* --------- READ: list & groups & stats --------- */

  safeHandle('wallet:getAll', async () => getAllWallets());
  safeHandle('wallets:getAll', async () => getAllWallets()); // alias

  safeHandle('wallet:getGroups', async () => state.walletGroups);

  safeHandle('wallets:getStats', async () => {
    const total = state.wallets.length;
    const byGroup = state.wallets.reduce((acc, w) => {
      const key = w.groupId || 'ungrouped';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return { total, byGroup };
  });

  /* --------- CREATE: single + bulk --------- */

  // Single random wallet
  const handleCreate = async (_event, options = {}) => {
    const coreWallet = await walletCore.generateWallet();
    const record = createWalletRecord(coreWallet, {
      ...options,
      importMethod: 'generated',
    });
    state.wallets.push(record);
    return sanitizeWallet(record);
  };

  safeHandle('wallet:create', handleCreate);
  safeHandle('wallet:createWallet', handleCreate); // alias

  // Bulk generate
  const handleCreateBulk = async (_event, payload = {}) => {
    // support both shape: { count, groupId, baseName } OR { count, options }
    let { count = 1, groupId = null, baseName = 'Wallet', options = {} } = payload;

    if (options) {
      groupId = options.groupId ?? groupId;
      baseName = options.baseName || baseName;
    }

    const n = Math.max(1, Math.min(Number(count) || 1, 1000));
    const generated = await walletCore.generateBulkWallets(n);

    const records = generated.map((core, idx) =>
      createWalletRecord(core, {
        name: `${baseName} ${idx + 1}`,
        groupId,
        importMethod: 'generated',
        accountIndex: idx,
      })
    );

    state.wallets.push(...records);
    return records.map(sanitizeWallet);
  };

  safeHandle('wallet:createBulk', handleCreateBulk);
  safeHandle('wallet:createBulkWallets', handleCreateBulk); // alias

  /* --------- IMPORT: private key + mnemonic --------- */

  // Import from private key
  const handleImportPrivateKey = async (_event, payload = {}) => {
    const { privateKey, name, groupId = null } = payload;
    if (!privateKey) throw new Error('Private key is required');

    const coreWallet = await walletCore.importFromPrivateKey(privateKey);

    const record = createWalletRecord(coreWallet, {
      name,
      groupId,
      importMethod: 'privateKey',
    });

    state.wallets.push(record);
    return sanitizeWallet(record);
  };

  safeHandle('wallet:importPrivateKey', handleImportPrivateKey);

  // Multiple from mnemonic
  const handleImportMultipleFromMnemonic = async (_event, payload = {}) => {
    const {
      mnemonic,
      count = 1,
      startIndex = 0,
      derivationPath,
      groupId = null,
      baseName = 'Account',
    } = payload;

    if (!mnemonic) throw new Error('Mnemonic is required');

    const derived = await walletCore.deriveMultipleFromMnemonic(
      mnemonic,
      count,
      startIndex,
      derivationPath
    );

    const records = derived.map((core, idx) =>
      createWalletRecord(core, {
        name: `${baseName} ${startIndex + idx}`,
        groupId,
        importMethod: 'mnemonic',
        accountIndex: startIndex + idx,
      })
    );

    state.wallets.push(...records);
    return records.map(sanitizeWallet);
  };

  safeHandle('wallet:importMultipleFromMnemonic', handleImportMultipleFromMnemonic);
  safeHandle('wallet:importFromMnemonic', handleImportMultipleFromMnemonic); // alias
  safeHandle('wallet:importMnemonic', handleImportMultipleFromMnemonic); // alias for your hook
  safeHandle('wallet:importMultipleMnemonic', handleImportMultipleFromMnemonic); // alias for your hook

  /* --------- DELETE --------- */

  const handleDeleteMany = async (_event, payload = {}) => {
    const { ids, walletIds } = payload;
    const list = ids || walletIds || [];
    if (!Array.isArray(list) || list.length === 0) {
      return { deleted: 0 };
    }
    return deleteByIds(list);
  };

  safeHandle('wallet:deleteMany', handleDeleteMany);
  safeHandle('wallet:deleteWallets', handleDeleteMany);

  const handleDeleteOne = async (_event, payload = {}) => {
    const { id, walletId } = payload;
    const targetId = id || walletId;
    if (!targetId) return { deleted: 0 };
    return deleteByIds([targetId]);
  };

  safeHandle('wallet:delete', handleDeleteOne);
  safeHandle('wallet:deleteWallet', handleDeleteOne);

  /* --------- OPTIONAL: get private key (dangerous!) --------- */

  safeHandle('wallet:getPrivateKey', async (_event, { id, walletId }) => {
    const targetId = id || walletId;
    const w = state.wallets.find((x) => String(x.id) === String(targetId));
    if (!w) throw new Error('Wallet not found');
    // ⚠️ In production you’d require a master password here.
    return {
      id: w.id,
      address: w.address,
      privateKey: w.privateKey,
    };
  });
}

/* ----------------------------- RPC endpoints ----------------------------- */

function registerRpcHandlers() {
  safeHandle('rpc:list', async () => {
    return [...state.rpcEndpoints].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });

  safeHandle('rpc:add', async (_event, rpc) => {
    const id = genId();
    const now = Date.now();
    state.rpcEndpoints.push({
      id,
      name: rpc.name,
      url: rpc.url,
      chainId: rpc.chainId || 1,
      type: rpc.type || 'primary',
      weight: rpc.weight || 1,
      maxRequestsPerSecond: rpc.maxRequestsPerSecond || 0,
      enabled: !!rpc.enabled,
      healthStatus: 'unknown',
      latencyMs: null,
      createdAt: now,
      updatedAt: now,
    });
    return true;
  });

  safeHandle('rpc:update', async (_event, { id, updates }) => {
    const item = state.rpcEndpoints.find((r) => r.id === id);
    if (!item) return false;
    Object.assign(item, updates, { updatedAt: Date.now() });
    return true;
  });

  safeHandle('rpc:delete', async (_event, { id }) => {
    state.rpcEndpoints = state.rpcEndpoints.filter((r) => r.id !== id);
    return true;
  });

  safeHandle('rpc:checkHealth', async (_event, { id }) => {
    const rpc = state.rpcEndpoints.find((r) => r.id === id);
    if (!rpc) throw new Error('RPC not found');

    const start = Date.now();
    let status = 'down';
    let latencyMs = null;

    try {
      const res = await fetch(rpc.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_blockNumber',
          params: [],
        }),
      });
      const json = await res.json();
      if (json && json.result) {
        latencyMs = Date.now() - start;
        status = latencyMs > 1500 ? 'degraded' : 'healthy';
      }
    } catch (err) {
      logger.warn && logger.warn('RPC health check failed', { id, error: String(err) });
      status = 'down';
    }

    rpc.healthStatus = status;
    rpc.latencyMs = latencyMs;
    rpc.updatedAt = Date.now();

    return { healthStatus: status, latencyMs };
  });
}

/* ----------------------------- Proxies ----------------------------- */

function registerProxyHandlers() {
  safeHandle('proxies:list', async () => {
    return [...state.proxies].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });

  safeHandle('proxies:add', async (_event, proxy) => {
    state.proxies.push({
      id: genId(),
      label: proxy.label || null,
      host: proxy.host,
      port: proxy.port,
      username: proxy.username || null,
      password: proxy.password || null,
      protocol: proxy.protocol || 'http',
      status: 'unknown',
      latencyMs: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  });

  safeHandle('proxies:delete', async (_event, { id }) => {
    state.proxies = state.proxies.filter((p) => p.id !== id);
    return true;
  });

  safeHandle('proxies:check', async (_event, { id }) => {
    const proxy = state.proxies.find((p) => p.id === id);
    if (!proxy) throw new Error('Proxy not found');

    const latencyMs = Math.round(50 + Math.random() * 150);
    const status = 'healthy';

    proxy.status = status;
    proxy.latencyMs = latencyMs;
    proxy.updatedAt = Date.now();

    return { status, latencyMs };
  });
}

/* ----------------------------- Tasks ----------------------------- */

function registerTaskHandlers() {
  // List all tasks (templates + normal tasks)
  safeHandle('tasks:list', async () => {
    return [...state.tasks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  });

  // Mint template create
  safeHandle('tasks:createMintTemplate', async (_event, payload = {}) => {
    const {
      name,
      chainId,
      contractAddress,
      functionSignature,
      functionStateMutability,
      abi,
      valueEth,
      quantityPerWallet,
      quantityParamIndex,
    } = payload;

    if (!name) throw new Error('Template name is required');
    if (!contractAddress) throw new Error('Contract address is required');
    if (!functionSignature) throw new Error('Function signature is required');
    if (!Array.isArray(abi) || !abi.length) {
      throw new Error('ABI is required to encode calls');
    }

    const now = Date.now();
    const template = {
      id: uuidv4(),
      type: 'mint-template',
      name,
      chainId: Number(chainId) || 1,
      contractAddress,
      functionSignature,
      functionStateMutability: functionStateMutability || 'nonpayable',
      abi,
      valueEth: valueEth || '0',
      quantityPerWallet: quantityPerWallet || null,
      quantityParamIndex:
        typeof quantityParamIndex === 'number' ? quantityParamIndex : null,
      createdAt: now,
      updatedAt: now,
      stats: {
        totalEnqueued: 0,
        totalSuccess: 0,
        totalFailed: 0,
      },
    };

    state.tasks.push(template);
    logger.info && logger.info('Mint template created', {
      id: template.id,
      name: template.name,
      chainId: template.chainId,
      contract: template.contractAddress,
      fn: template.functionSignature,
    });

    return template;
  });

  // Generic task create
  safeHandle('tasks:create', async (_event, taskConfig) => {
    const { name, type, chainId, config } = taskConfig;
    const id = genId();
    const now = Date.now();
    state.tasks.push({
      id,
      name,
      type: type || 'mint',
      chainId: chainId || 1,
      status: 'pending',
      config: config || {},
      createdAt: now,
      updatedAt: now,
    });
    return id;
  });

  safeHandle('tasks:delete', async (_event, { id }) => {
    state.taskExecutions = state.taskExecutions.filter((x) => x.taskId !== id);
    state.tasks = state.tasks.filter((t) => t.id !== id);
    return true;
  });

  safeHandle('tasks:start', async (_event, { id }) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    task.status = 'running';
    task.updatedAt = Date.now();
    return true;
  });

  safeHandle('tasks:stop', async (_event, { id }) => {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) throw new Error('Task not found');
    task.status = 'stopped';
    task.updatedAt = Date.now();
    return true;
  });

  safeHandle('tasks:getLogs', async (_event, { id }) => {
    return state.taskExecutions
      .filter((x) => x.taskId === id)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .slice(-500);
  });

  // 🔥 NEW: Multi-wallet mint execution
  safeHandle('tasks:runMintJob', async (_event, payload = {}) => {
    const {
      jobId,
      rpcUrl,
      chainId,
      abi,
      contractAddress,
      functionName,
      walletIds,
      commonArgs,
      gasOverrides,
    } = payload;

    if (!rpcUrl) throw new Error('RPC URL is required');
    if (!contractAddress) throw new Error('Contract address is required');
    if (!functionName) throw new Error('Function name is required');
    if (!Array.isArray(abi) || !abi.length) throw new Error('ABI is required');
    if (!Array.isArray(walletIds) || walletIds.length === 0) {
      throw new Error('At least one walletId is required');
    }

    // Resolve wallets + private keys from in-memory state
    const walletsForJob = walletIds.map((idRaw) => {
      const id = String(idRaw);
      const w = state.wallets.find((x) => String(x.id) === id);
      if (!w) {
        throw new Error(`Wallet not found: ${id}`);
      }
      return {
        walletId: String(w.id),
        address: w.address,
        privateKey: w.privateKey,
      };
    });

    const effectiveJobId = jobId || genId();

    const jobResult = await runMintJob({
      jobId: effectiveJobId,
      rpcUrl,
      chainId,
      abi,
      contractAddress,
      functionName,
      wallets: walletsForJob,
      commonArgs: commonArgs || [],
      gasOverrides: gasOverrides || {},
    });

    const now = Date.now();
    // Basic per-wallet logs
    (jobResult.results || []).forEach((r) => {
      state.taskExecutions.push({
        id: genId(),
        taskId: effectiveJobId,
        walletId: r.walletId,
        address: r.address,
        txHash: r.txHash || null,
        status: r.status,
        error: r.error || null,
        createdAt: now,
      });
    });

    logger.info && logger.info('Mint job executed', {
      jobId: effectiveJobId,
      walletCount: walletsForJob.length,
    });

    return jobResult;
  });
}

/* ----------------------------- Gas (stub) ----------------------------- */

function registerGasHandlers() {
  // Fetch gas for one or more chains
  safeHandle('gas:getPrices', async (_event, { chainIds } = {}) => {
    const ids =
      Array.isArray(chainIds) && chainIds.length ? chainIds : [1]; // default Ethereum

    const results = [];

    for (const id of ids) {
      try {
        const gas = await getGasPrices(id);
        results.push(gas);
      } catch (err) {
        logger.error && logger.error('Gas fetch failed', {
          chainId: id,
          error: String(err),
        });
        results.push({
          chainId: Number(id),
          error: String(err),
        });
      }
    }

    return results;
  });
}

/* ----------------------------- Contract helpers ----------------------------- */

function registerContractHandlers() {
  // 🔹 Fetch ABI + method list from explorer
  safeHandle('contract:getAbi', async (_event, { address, chainId }) => {
    if (!address) throw new Error('Contract address is required');

    const abi = await fetchContractAbi(address, chainId || 1);

    const iface = new Interface(abi);

    const functions = [];
    // ⚠️ ethers v6 style: forEachFunction se sab functions iterate karte hain
    iface.forEachFunction((fn) => {
      functions.push({
        name: fn.name,
        signature: fn.format(), // full signature: transfer(address,uint256)
        stateMutability: fn.stateMutability || fn.state || 'nonpayable',
        inputs: (fn.inputs || []).map((i) => ({
          name: i.name || '',
          type: i.type,
        })),
        outputs: (fn.outputs || []).map((o) => ({
          name: o.name || '',
          type: o.type,
        })),
      });
    });

    return {
      abi,
      functions,
    };
  });

  // 🔹 Encode calldata from ABI + functionName + args
  safeHandle('contract:encodeCall', async (_event, payload) => {
    const { abi, functionName, args } = payload;
    if (!Array.isArray(abi)) throw new Error('ABI must be an array');
    if (!functionName) throw new Error('Function name required');

    const iface = new Interface(abi);
    const data = iface.encodeFunctionData(functionName, args || []);
    return data;
  });
}

/* ----------------------------- NFT (stubs) ----------------------------- */

function registerNftHandlers() {
  safeHandle('nft:detect', async (_event, { address, chainId }) => {
    return state.nftHoldings.filter(
      (n) =>
        n.ownerAddress === address &&
        (!chainId || n.chainId === chainId)
    );
  });

  safeHandle('nft:consolidate', async () => {
    return 'Consolidation task created (stub, implement worker logic later).';
  });

  safeHandle('nft:disperse', async () => {
    return 'Disperse task created (stub, implement worker logic later).';
  });
}

/* ----------------------------- Captcha & settings ----------------------------- */

function registerCaptchaHandlers() {
  safeHandle('captcha:getConfig', async () => {
    return state.settings.captcha_config || {};
  });

  safeHandle('captcha:saveConfig', async (_event, config) => {
    state.settings.captcha_config = config || {};
    return true;
  });

  safeHandle('captcha:getBalance', async (_event, { provider }) => {
    return { balance: null, provider };
  });
}

function registerSettingsHandlers() {
  safeHandle('settings:getAll', async () => {
    const { general, advanced, security } = state.settings;
    return {
      general: general || {},
      advanced: advanced || {},
      security: security || {},
    };
  });

  safeHandle('settings:update', async (_event, payload) => {
    const { general, advanced, security } = payload || {};
    if (general) state.settings.general = { ...(state.settings.general || {}), ...general };
    if (advanced) state.settings.advanced = { ...(state.settings.advanced || {}), ...advanced };
    if (security) state.settings.security = { ...(state.settings.security || {}), ...security };
    return true;
  });

  safeHandle('settings:get', async (_event, { key }) => {
    return state.settings[key] || null;
  });
}

function registerSecurityHandlers() {
  safeHandle('security:resetMasterPassword', async () => {
    state.settings.security = {};
    return true;
  });
}

/* ----------------------------- Entry ----------------------------- */

function registerIpcHandlers() {
  registerWalletHandlers();
  registerRpcHandlers();
  registerProxyHandlers();
  registerTaskHandlers();
  registerGasHandlers();
  registerContractHandlers();
  registerNftHandlers();
  registerCaptchaHandlers();
  registerSettingsHandlers();
  registerSecurityHandlers();
  registerAppHandlers();
  logger.info && logger.info('IPC handlers registered (in-memory backend)');
}

module.exports = { registerIpcHandlers };
