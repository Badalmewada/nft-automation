class ExecutionPool {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
  }

  async run(taskFn) {
    if (this.active >= this.concurrency) {
      await new Promise((resolve) => this.queue.push(resolve));
    }

    this.active++;

    try {
      return await taskFn();
    } finally {
      this.active--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
}

module.exports = ExecutionPool;
