//C:\Users\Lenovo\Desktop\Highers\nft-mint-pro\electron\services\wallet-service.js
const walletManager = require('../blockchain/wallet');
const encryption = require('../security/encryption');
const database = require('../db/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

let walletCounter = 1;

class WalletService {
  constructor() {
    this.cache = new Map();
  }

  /* --------------------------- helpers --------------------------- */

  nextName(prefix = "Wallet") {
    return `${prefix} ${walletCounter++}`;
  }

  sanitizeWallet(wallet) {
    const { encryptedPrivateKey, encryptedMnemonic, ...safe } = wallet;
    return {
      ...safe,
      hasPrivateKey: !!encryptedPrivateKey,
      hasMnemonic: !!encryptedMnemonic
    };
  }

  /* --------------------------- create --------------------------- */

  async createWallet(options = {}) {
    try {
      const walletData = walletManager.generateWallet();
      const walletId = uuidv4();
      // groupId: options.groupId || null
      const wallet = {
        id: walletId,
        name: options.name || this.nextName(),
        address: walletData.address,
        encryptedPrivateKey: encryption.encrypt(walletData.privateKey),
        encryptedMnemonic: walletData.mnemonic
          ? encryption.encrypt(walletData.mnemonic)
          : null,
        groupId: options.groupId ?? null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          lastUsed: null,
          transactionCount: 0,
          ...options.metadata
        }
      };

      await database.wallets.create(wallet);

      this.cache.set(walletId, walletData.privateKey);

      logger.info(`Wallet created ${wallet.address}`);
      return this.sanitizeWallet(wallet);

    } catch (err) {
      logger.error("Create wallet failed", err);
      throw err;
    }
  }

  /* --------------------------- bulk create --------------------------- */

  async createBulkWallets(count, options = {}) {
    try {
      const amount = Number(count) || 1;
      const walletDataArray = walletManager.generateBulkWallets(amount);

      const wallets = walletDataArray.map((walletData, i) => {
        const id = uuidv4();

        const record = {
          id,
          name: options.namePrefix
            ? `${options.namePrefix} ${i + 1}`
            : this.nextName(),
          address: walletData.address,
          encryptedPrivateKey: encryption.encrypt(walletData.privateKey),
          encryptedMnemonic: walletData.mnemonic
            ? encryption.encrypt(walletData.mnemonic)
            : null,
          groupId: options.groupId ?? null,
          tags: options.tags || [],
          metadata: {
            createdAt: Date.now(),
            lastUsed: null,
            transactionCount: 0,
            batchIndex: i
          }
        };

        this.cache.set(id, walletData.privateKey);
        return record;
      });

      await database.wallets.createMany(wallets);

      logger.info(`Bulk created ${wallets.length} wallets`);

      return wallets.map(w => this.sanitizeWallet(w));

    } catch (err) {
      logger.error("Bulk create failed", err);
      throw err;
    }
  }

  /* --------------------------- imports --------------------------- */

  async importFromPrivateKey(privateKey, options = {}) {
    try {
      const walletData = walletManager.importFromPrivateKey(privateKey);

      const existing = await database.wallets.findByAddress(walletData.address);
      if (existing) throw new Error("Wallet already exists");

      const id = uuidv4();

      const wallet = {
        id,
        name: options.name || this.nextName(),
        address: walletData.address,
        encryptedPrivateKey: encryption.encrypt(walletData.privateKey),
        encryptedMnemonic: null,
        groupId: options.groupId || null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          importedAt: Date.now(),
          importMethod: "privateKey",
          lastUsed: null,
          transactionCount: 0
        }
      };

      await database.wallets.create(wallet);
      this.cache.set(id, walletData.privateKey);

      return this.sanitizeWallet(wallet);

    } catch (err) {
      logger.error("Import private key failed", err);
      throw err;
    }
  }

  async importMultipleFromMnemonic(mnemonic, count, options = {}) {
    try {
      const start = options.startIndex || 0;

      const derived = walletManager.deriveMultipleFromMnemonic(
        mnemonic,
        count,
        start
      );

      const encryptedMnemonic = encryption.encrypt(mnemonic);

      const wallets = [];

      for (let i = 0; i < derived.length; i++) {
        const data = derived[i];

        const exists = await database.wallets.findByAddress(data.address);
        if (exists) continue;

        const id = uuidv4();

        const record = {
          id,
          name: options.namePrefix
            ? `${options.namePrefix} ${start + i + 1}`
            : this.nextName(),
          address: data.address,
          encryptedPrivateKey: encryption.encrypt(data.privateKey),
          encryptedMnemonic,
          derivationPath: data.path,
          groupId: options.groupId || null,
          tags: options.tags || [],
          metadata: {
            createdAt: Date.now(),
            importedAt: Date.now(),
            importMethod: "mnemonic",
            accountIndex: start + i,
            lastUsed: null,
            transactionCount: 0
          }
        };

        wallets.push(record);
        this.cache.set(id, data.privateKey);
      }

      if (wallets.length) {
        await database.wallets.createMany(wallets);
      }

      return wallets.map(w => this.sanitizeWallet(w));

    } catch (err) {
      logger.error("Mnemonic import failed", err);
      throw err;
    }
  }

  /* --------------------------- read --------------------------- */

  async getWallet(id) {
    const wallet = await database.wallets.findById(id);
    return wallet ? this.sanitizeWallet(wallet) : null;
  }

  async getAllWallets(filters = {}) {
    const list = await database.wallets.findAll(filters);
    return list.map(w => this.sanitizeWallet(w));
  }

  async getWalletsByGroup(groupId) {
    const list = await database.wallets.findByGroup(groupId);
    return list.map(w => this.sanitizeWallet(w));
  }

  /* --------------------------- update --------------------------- */

  async updateWallet(id, updates) {
    try {
      const allowed = ["name", "groupId", "tags", "metadata"];
      const safe = {};

      for (const key of allowed) {
        if (updates[key] !== undefined) {
          safe[key] = updates[key];
        }
      }

      await database.wallets.update(id, safe);
      return this.getWallet(id);

    } catch (err) {
      logger.error("Update wallet failed", err);
      throw err;
    }
  }

  /* --------------------------- delete --------------------------- */

  async deleteWallet(id) {
    try {
      await database.wallets.delete(id);
      this.cache.delete(id);
      return true;
    } catch (err) {
      logger.error("Delete wallet failed", err);
      throw err;
    }
  }

  async deleteWallets(walletIds) {
    try {
      const ids = Array.isArray(walletIds) ? walletIds : [];

      if (!ids.length) return 0;

      const count = await database.wallets.deleteMany(ids);

      ids.forEach(id => this.cache.delete(id));

      return count;

    } catch (err) {
      logger.error("Delete many wallets failed", err);
      throw err;
    }
  }

  /* --------------------------- crypto access --------------------------- */

  async getPrivateKey(id) {
    if (this.cache.has(id)) return this.cache.get(id);

    const wallet = await database.wallets.findById(id);
    if (!wallet) throw new Error("Wallet not found");

    const pk = encryption.decrypt(wallet.encryptedPrivateKey);
    this.cache.set(id, pk);

    return pk;
  }

  /* --------------------------- export --------------------------- */

  async exportWallet(id, password) {
    const wallet = await database.wallets.findById(id);
    if (!wallet) throw new Error("Wallet not found");

    const pk = encryption.decrypt(wallet.encryptedPrivateKey);

    const payload = {
      address: wallet.address,
      privateKey: pk,
      name: wallet.name,
      tags: wallet.tags,
      exportedAt: Date.now()
    };

    return encryption.encrypt(JSON.stringify(payload), password);
  }

  /* --------------------------- memory --------------------------- */

  clearCache() {
    this.cache.clear();
  }
}

module.exports = new WalletService();
