// src/components/tasks/TasksModule.jsx
import React, { useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import TaskList from './TaskList';
import TaskLogs from './TaskLogs';
import CreateTaskModal from './CreateTaskModal';
import ConfirmDialog from '../common/ConfirmDialog';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import useTasks from '../../hooks/useTasks';
import MintJobRunner from './MintJobRunner';

function TasksModule() {
  const toast = useToast();
  const tasksApi = useTasks() || {};

  const tasks = tasksApi.tasks || [];
  const executions = tasksApi.executions || {};
  const loading = tasksApi.loading || false;

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const handleRefresh = async () => {
    try {
      await tasksApi.refresh?.();
      toast.success({
        title: 'Refreshed',
        message: 'Task list reloaded.',
        duration: 2000,
      });
    } catch (err) {
      toast.error({
        title: 'Refresh failed',
        message: String(err),
      });
    }
  };

  const handleCreateTask = async (taskConfig) => {
    try {
      const id = await tasksApi.createTask?.(taskConfig);
      toast.success({
        title: 'Task created',
        message: `New task created (ID: ${id || 'unknown'})`,
      });
      tasksApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Create failed',
        message: String(err),
      });
      throw err;
    }
  };

  const handleStart = async (task) => {
    try {
      await tasksApi.startTask?.(task.id);
      toast.success({
        title: 'Task started',
        message: task.name || task.id,
      });
    } catch (err) {
      toast.error({
        title: 'Start failed',
        message: String(err),
      });
    }
  };

  const handleStop = async (task) => {
    try {
      await tasksApi.stopTask?.(task.id);
      toast.success({
        title: 'Task stopped',
        message: task.name || task.id,
      });
    } catch (err) {
      toast.error({
        title: 'Stop failed',
        message: String(err),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await tasksApi.deleteTask?.(deleteTarget.id);
      toast.success({
        title: 'Task deleted',
        message: deleteTarget.name || deleteTarget.id,
      });
      if (selectedTaskId === deleteTarget.id) {
        setSelectedTaskId(null);
      }
      tasksApi.refresh?.();
    } catch (err) {
      toast.error({
        title: 'Delete failed',
        message: String(err),
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleViewLogs = (task) => {
    setSelectedTaskId(task.id);
  };

  const handleFetchLogs = async (taskId) => {
    if (!tasksApi.getLogs) return [];
    return tasksApi.getLogs(taskId);
  };

  const runningCount = tasks.filter((t) => t.status === 'running').length;
  const queuedCount = tasks.filter(
    (t) => t.status === 'queued' || t.status === 'pending'
  ).length;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
        
        
      </div>

      {/* Main layout: list + logs */}
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white/90 p-3 shadow-sm shadow-black/5 dark:border-slate-800/80 dark:bg-slate-950/80">
          <TaskList
            tasks={tasks}
            loading={loading}
            onStart={handleStart}
            onStop={handleStop}
            onDelete={(task) => setDeleteTarget(task)}
            onViewLogs={handleViewLogs}
          />
        </div>

        <div className="hidden w-80 flex-shrink-0 md:block">
          <TaskLogs
            task={selectedTask}
            executions={executions}
            onFetchLogs={handleFetchLogs}
          />
        </div>
      </div>

      {/* 🔥 Mint Job Runner (multi-wallet mint) */}
      <MintJobRunner />

      {/* Create modal */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        type="danger"
        title="Delete task?"
        message={
          deleteTarget
            ? `You are about to delete the task "${deleteTarget.name ||
                deleteTarget.id}". This will not revert any on-chain actions already performed.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}

export default TasksModule;
