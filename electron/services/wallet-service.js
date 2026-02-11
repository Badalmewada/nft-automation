// electron/services/wallet-service.js
const walletManager = require('../blockchain/wallet');
const encryption = require('../security/encryption');
const database = require('../db/database');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class WalletService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Create a new wallet
   * @param {Object} options - Wallet creation options
   * @returns {Promise<Object>} Created wallet
   */
  async createWallet(options = {}) {
    try {
      const walletData = walletManager.generateWallet();
      const walletId = uuidv4();

      // Encrypt private key
      const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);
      const encryptedMnemonic = walletData.mnemonic 
        ? encryption.encrypt(walletData.mnemonic)
        : null;

      const wallet = {
        id: walletId,
        name: options.name || walletManager.generateWalletName(),
        address: walletData.address,
        encryptedPrivateKey,
        encryptedMnemonic,
        groupId: options.groupId || null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          lastUsed: null,
          transactionCount: 0,
          ...options.metadata
        }
      };

      await database.wallets.create(wallet);
      logger.info(`Wallet created: ${wallet.address}`);

      // Cache decrypted key temporarily (cleared on app close)
      this.cache.set(walletId, walletData.privateKey);

      return this.sanitizeWallet(wallet);
    } catch (error) {
      logger.error('Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Create multiple wallets in bulk
   * @param {number} count - Number of wallets to create
   * @param {Object} options - Wallet options
   * @returns {Promise<Array>} Created wallets
   */
  async createBulkWallets(count, options = {}) {
    try {
      const wallets = [];
      const walletDataArray = walletManager.generateBulkWallets(count);

      for (let i = 0; i < walletDataArray.length; i++) {
        const walletData = walletDataArray[i];
        const walletId = uuidv4();

        const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);
        const encryptedMnemonic = walletData.mnemonic
          ? encryption.encrypt(walletData.mnemonic)
          : null;

        const wallet = {
          id: walletId,
          name: options.namePrefix 
            ? `${options.namePrefix} ${i + 1}`
            : walletManager.generateWalletName(),
          address: walletData.address,
          encryptedPrivateKey,
          encryptedMnemonic,
          groupId: options.groupId || null,
          tags: options.tags || [],
          metadata: {
            createdAt: Date.now(),
            lastUsed: null,
            transactionCount: 0,
            batchIndex: i
          }
        };

        wallets.push(wallet);
        this.cache.set(walletId, walletData.privateKey);
      }

      await database.wallets.createMany(wallets);
      logger.info(`Bulk created ${count} wallets`);

      return wallets.map(w => this.sanitizeWallet(w));
    } catch (error) {
      logger.error('Failed to create bulk wallets:', error);
      throw error;
    }
  }

  /**
   * Import wallet from private key
   * @param {string} privateKey - Private key
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Imported wallet
   */
  async importFromPrivateKey(privateKey, options = {}) {
    try {
      const walletData = walletManager.importFromPrivateKey(privateKey);
      
      // Check if wallet already exists
      const existing = await database.wallets.findByAddress(walletData.address);
      if (existing) {
        throw new Error('Wallet already exists');
      }

      const walletId = uuidv4();
      const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);

      const wallet = {
        id: walletId,
        name: options.name || walletManager.generateWalletName(),
        address: walletData.address,
        encryptedPrivateKey,
        encryptedMnemonic: null,
        groupId: options.groupId || null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          importedAt: Date.now(),
          importMethod: 'privateKey',
          lastUsed: null,
          transactionCount: 0
        }
      };

      await database.wallets.create(wallet);
      logger.info(`Wallet imported: ${wallet.address}`);

      this.cache.set(walletId, walletData.privateKey);
      return this.sanitizeWallet(wallet);
    } catch (error) {
      logger.error('Failed to import wallet:', error);
      throw error;
    }
  }

  /**
   * Import wallet from mnemonic
   * @param {string} mnemonic - Seed phrase
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Imported wallet
   */
  async importFromMnemonic(mnemonic, options = {}) {
    try {
      const walletData = walletManager.importFromMnemonic(
        mnemonic,
        options.path,
        options.index || 0
      );

      const existing = await database.wallets.findByAddress(walletData.address);
      if (existing) {
        throw new Error('Wallet already exists');
      }

      const walletId = uuidv4();
      const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);
      const encryptedMnemonic = encryption.encrypt(walletData.mnemonic);

      const wallet = {
        id: walletId,
        name: options.name || walletManager.generateWalletName(),
        address: walletData.address,
        encryptedPrivateKey,
        encryptedMnemonic,
        derivationPath: walletData.path,
        groupId: options.groupId || null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          importedAt: Date.now(),
          importMethod: 'mnemonic',
          lastUsed: null,
          transactionCount: 0
        }
      };

      await database.wallets.create(wallet);
      logger.info(`Wallet imported from mnemonic: ${wallet.address}`);

      this.cache.set(walletId, walletData.privateKey);
      return this.sanitizeWallet(wallet);
    } catch (error) {
      logger.error('Failed to import from mnemonic:', error);
      throw error;
    }
  }

  /**
   * Import multiple wallets from mnemonic
   * @param {string} mnemonic - Seed phrase
   * @param {number} count - Number of wallets to derive
   * @param {Object} options - Import options
   * @returns {Promise<Array>} Imported wallets
   */
  async importMultipleFromMnemonic(mnemonic, count, options = {}) {
    try {
      const startIndex = options.startIndex || 0;
      const walletDataArray = walletManager.deriveMultipleFromMnemonic(
        mnemonic,
        count,
        startIndex
      );

      const wallets = [];
      const encryptedMnemonic = encryption.encrypt(mnemonic);

      for (let i = 0; i < walletDataArray.length; i++) {
        const walletData = walletDataArray[i];
        
        // Skip if already exists
        const existing = await database.wallets.findByAddress(walletData.address);
        if (existing) continue;

        const walletId = uuidv4();
        const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);

        const wallet = {
          id: walletId,
          name: options.namePrefix
            ? `${options.namePrefix} ${startIndex + i + 1}`
            : walletManager.generateWalletName(),
          address: walletData.address,
          encryptedPrivateKey,
          encryptedMnemonic,
          derivationPath: walletData.path,
          groupId: options.groupId || null,
          tags: options.tags || [],
          metadata: {
            createdAt: Date.now(),
            importedAt: Date.now(),
            importMethod: 'mnemonic',
            accountIndex: startIndex + i,
            lastUsed: null,
            transactionCount: 0
          }
        };

        wallets.push(wallet);
        this.cache.set(walletId, walletData.privateKey);
      }

      if (wallets.length > 0) {
        await database.wallets.createMany(wallets);
        logger.info(`Imported ${wallets.length} wallets from mnemonic`);
      }

      return wallets.map(w => this.sanitizeWallet(w));
    } catch (error) {
      logger.error('Failed to import multiple from mnemonic:', error);
      throw error;
    }
  }

  /**
   * Import wallet from JSON keystore
   * @param {string} json - JSON keystore
   * @param {string} password - Keystore password
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Imported wallet
   */
  async importFromJSON(json, password, options = {}) {
    try {
      const walletData = await walletManager.importFromJSON(json, password);

      const existing = await database.wallets.findByAddress(walletData.address);
      if (existing) {
        throw new Error('Wallet already exists');
      }

      const walletId = uuidv4();
      const encryptedPrivateKey = encryption.encrypt(walletData.privateKey);

      const wallet = {
        id: walletId,
        name: options.name || walletManager.generateWalletName(),
        address: walletData.address,
        encryptedPrivateKey,
        encryptedMnemonic: null,
        groupId: options.groupId || null,
        tags: options.tags || [],
        metadata: {
          createdAt: Date.now(),
          importedAt: Date.now(),
          importMethod: 'json',
          lastUsed: null,
          transactionCount: 0
        }
      };

      await database.wallets.create(wallet);
      logger.info(`Wallet imported from JSON: ${wallet.address}`);

      this.cache.set(walletId, walletData.privateKey);
      return this.sanitizeWallet(wallet);
    } catch (error) {
      logger.error('Failed to import from JSON:', error);
      throw error;
    }
  }

  /**
   * Get wallet by ID
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} Wallet
   */
  async getWallet(walletId) {
    const wallet = await database.wallets.findById(walletId);
    return wallet ? this.sanitizeWallet(wallet) : null;
  }

  /**
   * Get all wallets
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Wallets
   */
  async getAllWallets(filters = {}) {
    const wallets = await database.wallets.findAll(filters);
    return wallets.map(w => this.sanitizeWallet(w));
  }

  /**
   * Get wallets by group
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} Wallets
   */
  async getWalletsByGroup(groupId) {
    const wallets = await database.wallets.findByGroup(groupId);
    return wallets.map(w => this.sanitizeWallet(w));
  }

  /**
   * Update wallet
   * @param {string} walletId - Wallet ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated wallet
   */
  async updateWallet(walletId, updates) {
    try {
      const allowedUpdates = ['name', 'groupId', 'tags', 'metadata'];
      const filteredUpdates = {};

      for (const key of allowedUpdates) {
        if (updates.hasOwnProperty(key)) {
          filteredUpdates[key] = updates[key];
        }
      }

      await database.wallets.update(walletId, filteredUpdates);
      logger.info(`Wallet updated: ${walletId}`);

      return await this.getWallet(walletId);
    } catch (error) {
      logger.error('Failed to update wallet:', error);
      throw error;
    }
  }

  /**
   * Delete wallet
   * @param {string} walletId - Wallet ID
   * @returns {Promise<boolean>} Success
   */
  async deleteWallet(walletId) {
    try {
      await database.wallets.delete(walletId);
      this.cache.delete(walletId);
      logger.info(`Wallet deleted: ${walletId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete wallet:', error);
      throw error;
    }
  }

  /**
   * Delete multiple wallets
   * @param {Array<string>} walletIds - Wallet IDs
   * @returns {Promise<number>} Number of deleted wallets
   */
  async deleteWallets(walletIds) {
    try {
      const count = await database.wallets.deleteMany(walletIds);
      walletIds.forEach(id => this.cache.delete(id));
      logger.info(`Deleted ${count} wallets`);
      return count;
    } catch (error) {
      logger.error('Failed to delete wallets:', error);
      throw error;
    }
  }

  /**
   * Get decrypted private key (for signing)
   * @param {string} walletId - Wallet ID
   * @returns {Promise<string>} Private key
   */
  async getPrivateKey(walletId) {
    // Check cache first
    if (this.cache.has(walletId)) {
      return this.cache.get(walletId);
    }

    const wallet = await database.wallets.findById(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const privateKey = encryption.decrypt(wallet.encryptedPrivateKey);
    this.cache.set(walletId, privateKey);
    return privateKey;
  }

  /**
   * Export wallet to encrypted backup
   * @param {string} walletId - Wallet ID
   * @param {string} password - Export password
   * @returns {Promise<string>} Encrypted backup
   */
  async exportWallet(walletId, password) {
    try {
      const wallet = await database.wallets.findById(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const privateKey = encryption.decrypt(wallet.encryptedPrivateKey);
      const exportData = {
        address: wallet.address,
        privateKey,
        name: wallet.name,
        tags: wallet.tags,
        exportedAt: Date.now()
      };

      if (wallet.encryptedMnemonic) {
        exportData.mnemonic = encryption.decrypt(wallet.encryptedMnemonic);
        exportData.derivationPath = wallet.derivationPath;
      }

      const json = JSON.stringify(exportData);
      return await encryption.encryptWithPassword(json, password);
    } catch (error) {
      logger.error('Failed to export wallet:', error);
      throw error;
    }
  }

  /**
   * Remove sensitive data from wallet object
   * @param {Object} wallet - Wallet object
   * @returns {Object} Sanitized wallet
   */
  sanitizeWallet(wallet) {
    const { encryptedPrivateKey, encryptedMnemonic, ...safe } = wallet;
    return {
      ...safe,
      hasPrivateKey: !!encryptedPrivateKey,
      hasMnemonic: !!encryptedMnemonic
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new WalletService();