const TaskQueue = require("../core/TaskQueue");
const ExecutionPool = require("../core/ExecutionPool");
const NonceManager = require("../core/NonceManager");
const GasManager = require("../core/GasManager");
const { Worker } = require("worker_threads");
const path = require("path");


class TaskService {
  constructor() {
    this.queue = new TaskQueue();
    this.pool = new ExecutionPool(10); // concurrency limit
    this.nonceManager = new NonceManager();
  }
  
   //Run taks
  async runTask(task) {
      this.queue.updateStatus(task.id, "running");
      
      try {
          await this.pool.run(async () => {
              await this.executeTask(task);
            });
            
            this.queue.updateStatus(task.id, "success");
        } catch (err) {
            console.error(err);
            this.queue.updateStatus(task.id, "failed");
        }
    }

 ///Execution function
  async executeTask(task) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "../workers/task-worker.js")
    );

    worker.postMessage(task);

    worker.on("message", (result) => {
      worker.terminate();

      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error));
      }
    });

    worker.on("error", reject);
  });
}

//add tasks
addTask(task) {
    this.queue.addTask(task);
}

startTask(taskId) {
    const task = this.queue.getTask(taskId);
    if (!task) return;
    this.runTask(task);
}

}

module.exports = new TaskService();


