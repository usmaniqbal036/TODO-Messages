import { useState, useEffect, useMemo } from 'react';
import { HiPlus } from 'react-icons/hi';
import api from '../api/axios';
import TodoItem from '../components/TodoItem';
import { getErrorMessage } from '../utils/getErrorMessage';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await api.get('/api/todos');
        setTodos(res.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load your tasks.'));
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;

    setSaving(true);
    setError('');
    try {
      const res = await api.post('/api/todos', {
        title: cleanTitle,
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
      });
      setTodos((prev) => [res.data, ...prev]);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not add the task. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  
  const handleUpdate = async (todo, changes) => {
    try {
      const res = await api.put(`/api/todos/${todo._id}`, changes);
      setTodos((prev) => prev.map((t) => (t._id === todo._id ? res.data : t)));
      return true;
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the task.'));
      return false;
    }
  };

  const handleToggle = (todo) => handleUpdate(todo, { completed: !todo.completed });

  const handleDelete = async (todo) => {
    if (!window.confirm(`Delete "${todo.title}"?`)) return;
    try {
      await api.delete(`/api/todos/${todo._id}`);
      setTodos((prev) => prev.filter((t) => t._id !== todo._id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete the task.'));
    }
  };

  const counts = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;
    return { all: todos.length, completed, active: todos.length - completed };
  }, [todos]);

  const visibleTodos = useMemo(() => {
    const list = todos.filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'priority') {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (sortBy === 'dueDate') {
        
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return new Date(b.createdAt) - new Date(a.createdAt); 
    });
  }, [todos, filter, sortBy]);

  const percentDone = counts.all ? Math.round((counts.completed / counts.all) * 100) : 0;

  const emptyMessage = () => {
    if (counts.all === 0) {
      return { head: 'No tasks yet', body: 'Type a title above and press Add task.' };
    }
    if (filter === 'active') {
      return { head: 'All caught up', body: 'You have no active tasks left.' };
    }
    return { head: 'Nothing completed yet', body: 'Tick a task to see it here.' };
  };

  return (
    <div className="page-container todos-page">
      <div className="todos-header">
        <h1 className="page-title">My Todos</h1>

        {counts.all > 0 && (
          <div className="todos-progress" aria-live="polite">
            <strong>{counts.completed}</strong> of <strong>{counts.all}</strong> done
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percentDone}%` }} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <form className="todo-composer" onSubmit={handleAdd}>
        <input
          type="text"
          className="composer-title"
          placeholder="What needs to be done?"
          aria-label="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />

        <textarea
          className="composer-desc"
          placeholder="Add a description (optional)"
          aria-label="Task description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />

        <div className="composer-footer">
          <div className="composer-field">
            <span id="priority-label">Priority</span>
            <div className="seg" role="group" aria-labelledby="priority-label">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  className={`seg-btn ${p.value} ${priority === p.value ? 'active' : ''}`}
                  aria-pressed={priority === p.value}
                  onClick={() => setPriority(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="composer-field">
            <span>Due date</span>
            <input
              type="date"
              className="field-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary composer-submit"
            disabled={!title.trim() || saving}
          >
            <HiPlus /> {saving ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </form>

      <div className="todo-filters">
        <div className="filter-group" role="tablist" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={filter === f.value}
              className={`btn-filter ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
              <span className="filter-count">{counts[f.value]}</span>
            </button>
          ))}
        </div>

        <label className="sort-control">
          Sort by
          <select
            className="field-input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="spinner">Loading tasks…</div>
      ) : visibleTodos.length === 0 ? (
        <div className="empty-state">
          <strong>{emptyMessage().head}</strong>
          <p>{emptyMessage().body}</p>
        </div>
      ) : (
        <div className="todo-list">
          {visibleTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Todos;
