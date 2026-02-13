class NonceManager {
  constructor() {
    this.nonceMap = new Map();
  }

  async getNextNonce(address, provider) {
    if (!this.nonceMap.has(address)) {
      const nonce = await provider.getTransactionCount(address, "pending");
      this.nonceMap.set(address, nonce);
      return nonce;
    }

    const nextNonce = this.nonceMap.get(address);
    this.nonceMap.set(address, nextNonce + 1);
    return nextNonce;
  }

  reset(address) {
    this.nonceMap.delete(address);
  }
}

module.exports = NonceManager;
