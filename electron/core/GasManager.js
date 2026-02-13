class GasManager {
  constructor(baseFee, priorityFee) {
    this.baseFee = baseFee;
    this.priorityFee = priorityFee;
  }

  escalate(multiplier = 1.1) {
    this.baseFee *= multiplier;
    this.priorityFee *= multiplier;
    return {
      maxFeePerGas: this.baseFee,
      maxPriorityFeePerGas: this.priorityFee,
    };
  }
}

module.exports = GasManager;
