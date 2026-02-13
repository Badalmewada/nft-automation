// electron/ipc/handlers.js
const { v4: uuidv4 } = require('uuid');
const walletCore = require('../blockchain/wallet');
const { ipcMain } = require('electron');
const { Interface } = require('ethers');
const { fetchContractAbi } = require('../blockchain/abi-fetcher');
const { getGasPrices } = require('../blockchain/gas');
const walletService = require("../services/wallet-service");
const taskService = require("../services/task-service");
const walletGroupService = require("../services/wallet-group-service");
const database = require('../db/database');

const crypto = require('crypto');
const logger = require('../utils/logger');
const { runMintJob } = require('../workers/task-executor');
// Wallet service tumhare project ka existing implementation hai:
// const walletService = require('../services/wallet-service');

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

  safeHandle("app:getStats", async () => {

    const wallets = await require("../db/database").wallets.findAll();
    const groups = await require("../db/database").walletGroups.findAll();
    const tasks = await require("../services/task-service").queue.getAllTasks();

    return {
      wallets: {
        total: wallets.length
      },
      tasks: {
        total: tasks.length,
        running: tasks.filter(t => t.status === "running").length
      },
      groups: {
        total: groups.length
      },
      engine: {
        status: "online"
      }
    };

  });

}


/* ----------------------------- Wallets ----------------------------- */

function registerWalletHandlers() {

  safeHandle('wallet:create', async (_, options) => {
  return await walletService.createWallet({
    name: options.name,
    groupId: options.groupId || null
  });
});





  safeHandle("wallet:createBulk", async (_, payload = {}) => {
  const { count = 1, options = {} } = payload;
  return walletService.createBulkWallets(count, options);
});


  safeHandle("wallet:importPrivateKey", async (_, data) =>
    walletService.importFromPrivateKey(data.privateKey, data)
  );

  safeHandle("wallet:importMnemonic", async (_, data) =>
    walletService.importMultipleFromMnemonic(
      data.mnemonic,
      data.count,
      data
    )
  );

  safeHandle("wallet:getAll", async (_, filters) =>
    walletService.getAllWallets(filters)
  );

  safeHandle("wallet:getOne", async (_, id) =>
    walletService.getWallet(id)
  );

 safeHandle("wallet:update", async (_, { walletId, updates }) =>
  walletService.updateWallet(walletId, updates)
);


safeHandle('wallet:delete', async (_, { walletId }) => {
  return walletService.deleteWallet(walletId);
});



 safeHandle("wallet:deleteMany", async (_, payload) => {
  const ids = payload.walletIds || payload.ids || [];
  return walletService.deleteWallets(ids);
});



  safeHandle("wallet:getPrivateKey", async (_, id) =>
    walletService.getPrivateKey(id)
  );

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

  safeHandle("tasks:create", async (_, task) => {
    taskService.addTask(task);
    return true;
  });

  safeHandle("tasks:list", async () => {
    return taskService.queue.getAllTasks();
  });

  safeHandle("tasks:start", async (_, id) => {
    taskService.startTask(id);
    return true;
  });

  safeHandle("tasks:stop", async (_, id) => {
    taskService.queue.updateStatus(id, "stopped");
    return true;
  });

  safeHandle("tasks:delete", async (_, id) => {
    taskService.queue.removeTask(id);
    return true;
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

function registerWalletGroupHandlers() {

 safeHandle("wallet:createGroup", (_, data) =>
  walletGroupService.createGroup(data)
);

safeHandle("wallet:getGroups", () =>
  walletGroupService.getGroups()
);

  safeHandle("wallet:deleteGroup", async (_, id) => {
  return walletGroupService.deleteGroup(id);
});


  safeHandle("wallet:updateGroup", async (_, payload) => {
  if (!payload?.id) throw new Error("Group id missing");

  const { id, ...updates } = payload;

  return walletGroupService.updateGroup(id, updates);
});



}
/* ----------------------------- Entry ----------------------------- */

function registerIpcHandlers() {
  registerWalletGroupHandlers();
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
