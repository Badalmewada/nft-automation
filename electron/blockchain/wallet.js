// electron/blockchain/wallet.js
const { ethers } = require('ethers');
const crypto = require('crypto');

class WalletManager {
  constructor() {
    this.wallets = new Map();
  }

  /**
   * Generate a new random wallet
   * @returns {Object} { address, privateKey, mnemonic }
   */
  generateWallet() {
    try {
      const wallet = ethers.Wallet.createRandom();
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic.phrase,
        path: wallet.mnemonic.path || "m/44'/60'/0'/0/0"
      };
    } catch (error) {
      throw new Error(`Failed to generate wallet: ${error.message}`);
    }
  }

  /**
   * Generate multiple wallets in bulk
   * @param {number} count - Number of wallets to generate
   * @returns {Array} Array of wallet objects
   */
  generateBulkWallets(count) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
      wallets.push(this.generateWallet());
    }
    return wallets;
  }

  /**
   * Import wallet from private key
   * @param {string} privateKey - The private key (with or without 0x prefix)
   * @returns {Object} { address, privateKey }
   */
  importFromPrivateKey(privateKey) {
    try {
      // Ensure proper format
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }

      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      throw new Error(`Invalid private key: ${error.message}`);
    }
  }

  /**
   * Import wallet from mnemonic phrase
   * @param {string} mnemonic - 12 or 24 word seed phrase
   * @param {string} path - Derivation path (default: "m/44'/60'/0'/0/0")
   * @param {number} index - Account index for multiple wallets from same seed
   * @returns {Object} { address, privateKey, mnemonic, path }
   */
  importFromMnemonic(mnemonic, path = "m/44'/60'/0'/0/0", index = 0) {
    try {
      // If index is provided and not 0, modify the path
      if (index > 0) {
        path = `m/44'/60'/0'/0/${index}`;
      }

      const wallet = ethers.Wallet.fromPhrase(mnemonic, null, path);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        path: path
      };
    } catch (error) {
      throw new Error(`Invalid mnemonic: ${error.message}`);
    }
  }

  /**
   * Derive multiple wallets from a single mnemonic
   * @param {string} mnemonic - Seed phrase
   * @param {number} count - Number of wallets to derive
   * @param {number} startIndex - Starting index
   * @returns {Array} Array of wallet objects
   */
  deriveMultipleFromMnemonic(mnemonic, count = 10, startIndex = 0) {
    const wallets = [];
    for (let i = startIndex; i < startIndex + count; i++) {
      wallets.push(this.importFromMnemonic(mnemonic, undefined, i));
    }
    return wallets;
  }

  /**
   * Import wallet from JSON keystore file
   * @param {string} json - JSON keystore string
   * @param {string} password - Keystore password
   * @returns {Promise<Object>} { address, privateKey }
   */
  async importFromJSON(json, password) {
    try {
      const wallet = await ethers.Wallet.fromEncryptedJson(json, password);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      throw new Error(`Failed to decrypt JSON: ${error.message}`);
    }
  }

  /**
   * Export wallet to encrypted JSON keystore
   * @param {string} privateKey - Wallet private key
   * @param {string} password - Encryption password
   * @param {Object} options - Encryption options
   * @returns {Promise<string>} Encrypted JSON string
   */
  async exportToJSON(privateKey, password, options = {}) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      const json = await wallet.encrypt(password, options);
      return json;
    } catch (error) {
      throw new Error(`Failed to encrypt wallet: ${error.message}`);
    }
  }

  /**
   * Sign a transaction
   * @param {string} privateKey - Wallet private key
   * @param {Object} transaction - Transaction object
   * @returns {Promise<string>} Signed transaction
   */
  async signTransaction(privateKey, transaction) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return await wallet.signTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Sign a message
   * @param {string} privateKey - Wallet private key
   * @param {string} message - Message to sign
   * @returns {Promise<string>} Signature
   */
  async signMessage(privateKey, message) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return await wallet.signMessage(message);
    } catch (error) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Validate Ethereum address
   * @param {string} address - Address to validate
   * @returns {boolean} True if valid
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Validate private key
   * @param {string} privateKey - Private key to validate
   * @returns {boolean} True if valid
   */
  isValidPrivateKey(privateKey) {
    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate mnemonic phrase
   * @param {string} mnemonic - Mnemonic to validate
   * @returns {boolean} True if valid
   */
  isValidMnemonic(mnemonic) {
    return ethers.Mnemonic.isValidMnemonic(mnemonic);
  }

  /**
   * Get wallet instance for signing
   * @param {string} privateKey - Wallet private key
   * @param {Object} provider - Ethers provider
   * @returns {ethers.Wallet} Connected wallet instance
   */
  getConnectedWallet(privateKey, provider) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return wallet.connect(provider);
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  /**
   * Generate random wallet name
   * @returns {string} Random wallet name
   */
  generateWalletName() {
    const adjectives = ['Swift', 'Bold', 'Smart', 'Bright', 'Quick', 'Silent', 'Strong', 'Brave'];
    const nouns = ['Tiger', 'Eagle', 'Wolf', 'Dragon', 'Phoenix', 'Lion', 'Hawk', 'Bear'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  }
}

module.exports = new WalletManager();