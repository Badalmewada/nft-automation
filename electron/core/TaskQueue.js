class TaskQueue {
  constructor() {
    this.tasks = new Map();
    this.running = false;
  }

  addTask(task) {
    this.tasks.set(task.id, {
      ...task,
      status: "idle",
      retries: 0,
    });
  }

  removeTask(taskId) {
    this.tasks.delete(taskId);
  }

  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  updateStatus(taskId, status) {
    const task = this.tasks.get(taskId);
    if (!task) return;
    task.status = status;
    this.tasks.set(taskId, task);
  }
}

module.exports = TaskQueue;
