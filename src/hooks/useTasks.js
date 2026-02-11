// src/hooks/useTasks.js
import { useEffect, useState } from 'react';
import useIPC from './useIPC';

export default function useTasks() {
  const ipc = useIPC();

  const [tasks, setTasks] = useState([]);
  const [executions, setExecutions] = useState({});
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await ipc.invoke('tasks:list');
      setTasks(list || []);
    } catch (err) {
      console.error('useTasks refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskConfig) => {
    const id = await ipc.invoke('tasks:create', taskConfig);
    await refresh();
    return id;
  };

  const deleteTask = async (id) => {
    await ipc.invoke('tasks:delete', { id });
    await refresh();
  };

  const startTask = async (id) => {
    await ipc.invoke('tasks:start', { id });
  };

  const stopTask = async (id) => {
    await ipc.invoke('tasks:stop', { id });
  };

  const getLogs = async (id) => {
    return ipc.invoke('tasks:getLogs', { id });
  };

  // Push updates from worker
  useEffect(() => {
    const off = ipc.on('tasks:update', (event, payload) => {
      // update tasks list first
      if (payload.task) {
        setTasks((prev) =>
          prev.map((t) => (t.id === payload.task.id ? payload.task : t))
        );
      }

      // execution logs / progress
      if (payload.execution) {
        setExecutions((prev) => ({
          ...prev,
          [payload.taskId]: payload.execution,
        }));
      }
    });
    return off;
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  return {
    tasks,
    executions,
    loading,
    refresh,
    createTask,
    deleteTask,
    startTask,
    stopTask,
    getLogs,
  };
}
