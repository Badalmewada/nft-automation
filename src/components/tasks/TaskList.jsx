// src/components/tasks/TaskList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import TaskCard from './TaskCard';

function TaskList({
  tasks,
  loading = false,
  onStart,
  onStop,
  onDelete,
  onViewLogs,
}) {
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onStart={onStart}
          onStop={onStop}
          onDelete={onDelete}
          onViewLogs={onViewLogs}
        />
      ))}
    </div>
  );
}

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  onStart: PropTypes.func,
  onStop: PropTypes.func,
  onDelete: PropTypes.func,
  onViewLogs: PropTypes.func,
};

export default TaskList;
