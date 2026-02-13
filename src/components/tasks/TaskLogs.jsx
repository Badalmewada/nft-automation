// src/components/tasks/TaskLogs.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Terminal, RefreshCw } from 'lucide-react';
import Button from '../common/Button';

function TaskLogs({
  task,
  executions = {},
  onFetchLogs, // async function(taskId) => logs[]
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const taskId = task?.id;

  const execution = taskId ? executions[taskId] : null;

  const loadLogs = async () => {
    if (!taskId || !onFetchLogs) return;
    setLoading(true);
    try {
      const result = await onFetchLogs(taskId);
      if (Array.isArray(result)) {
        setLogs(result);
      }
    } catch (err) {
      console.error('TaskLogs loadLogs error:', err);
    } finally {
      setLoading(false);
    }
  };

}

export default TaskLogs;
