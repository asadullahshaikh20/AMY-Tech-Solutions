import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api.js';

const POLL_MS = 15000;

/** Loads tasks from the API, polls for team updates, and exposes mutations that keep local state in sync. */
export default function useTasks({ notify, onUnauthorized }) {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState(null);
  const [busyIds, setBusyIds] = useState(() => new Set());
  const mounted = useRef(true);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onUnauthorized();
      else notify({ type: 'error', title: err.message });
    },
    [notify, onUnauthorized]
  );

  const load = useCallback(
    async (silent = false) => {
      try {
        const { tasks } = await api.tasks();
        if (mounted.current) {
          setTasks(tasks);
          setError(null);
        }
      } catch (err) {
        if (err.status === 401) onUnauthorized();
        else if (!silent && mounted.current) setError(err.message);
      }
    },
    [onUnauthorized]
  );

  useEffect(() => {
    mounted.current = true;
    load();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, POLL_MS);
    const onFocus = () => load(true);
    window.addEventListener('focus', onFocus);
    return () => {
      mounted.current = false;
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const replace = (task) => setTasks((all) => (all || []).map((t) => (t.id === task.id ? task : t)));

  const withBusy = async (id, fn) => {
    setBusyIds((s) => new Set(s).add(id));
    try {
      return await fn();
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  const update = useCallback(
    (task, patch) =>
      withBusy(task.id, async () => {
        // Optimistic update for snappy drag-and-drop; rolled back on error.
        const before = task;
        replace({ ...task, ...patch });
        try {
          const { task: saved } = await api.updateTask(task.id, patch);
          replace(saved);
          return saved;
        } catch (err) {
          replace(before);
          handleError(err);
          return null;
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleError]
  );

  const create = useCallback(
    async (data) => {
      try {
        const { task } = await api.createTask(data);
        setTasks((all) => [task, ...(all || [])]);
        return task;
      } catch (err) {
        handleError(err);
        return null;
      }
    },
    [handleError]
  );

  const comment = useCallback(
    async (task, text) => {
      try {
        const { task: saved } = await api.commentTask(task.id, text);
        replace(saved);
        return saved;
      } catch (err) {
        handleError(err);
        return null;
      }
    },
    [handleError]
  );

  const remove = useCallback(
    async (task) => {
      try {
        await api.deleteTask(task.id);
        setTasks((all) => all.filter((t) => t.id !== task.id));
        return true;
      } catch (err) {
        handleError(err);
        return false;
      }
    },
    [handleError]
  );

  return { tasks, setTasks, error, reload: load, update, create, comment, remove, busyIds };
}
