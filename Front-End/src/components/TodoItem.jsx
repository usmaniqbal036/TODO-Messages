import { useState } from 'react';
import { HiTrash, HiPencil, HiCalendar } from 'react-icons/hi';

const PRIORITIES = ['low', 'medium', 'high'];

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);


const todayKey = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};



const formatDueDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatCreated = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const TodoItem = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const startEdit = () => {
    setDraft({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : '',
    });
    setEditing(true);
  };

  const handleChange = (e) =>
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanTitle = draft.title.trim();
    if (!cleanTitle || saving) return;

    setSaving(true);
    const ok = await onUpdate(todo, {
      title: cleanTitle,
      description: draft.description.trim(),
      priority: draft.priority,
      dueDate: draft.dueDate || null, 
    });
    setSaving(false);
    if (ok) setEditing(false);
  };

  const isOverdue =
    !todo.completed && todo.dueDate && todo.dueDate.slice(0, 10) < todayKey();

  if (editing) {
    return (
      <form className={`todo-item priority-${draft.priority}`} onSubmit={handleSave}>
        <div className="todo-edit">
          <input
            name="title"
            type="text"
            className="field-input"
            aria-label="Task title"
            value={draft.title}
            onChange={handleChange}
            maxLength={200}
            required
            autoFocus
          />

          <textarea
            name="description"
            className="field-input"
            aria-label="Task description"
            placeholder="Description (optional)"
            value={draft.description}
            onChange={handleChange}
            maxLength={1000}
          />

          <div className="todo-edit-row">
            <label className="composer-field">
              <span>Priority</span>
              <select
                name="priority"
                className="field-input"
                value={draft.priority}
                onChange={handleChange}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {capitalize(p)}
                  </option>
                ))}
              </select>
            </label>

            <label className="composer-field">
              <span>Due date</span>
              <input
                name="dueDate"
                type="date"
                className="field-input"
                value={draft.dueDate}
                onChange={handleChange}
              />
            </label>

            <div className="todo-edit-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!draft.title.trim() || saving}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}
    >
      <input
        type="checkbox"
        className="todo-checkbox"
        aria-label={todo.completed ? 'Mark as not done' : 'Mark as done'}
        checked={todo.completed}
        onChange={() => onToggle(todo)}
      />

      <div className="todo-body">
        <div className="todo-title">{todo.title}</div>
        {todo.description && <div className="todo-desc">{todo.description}</div>}

        <div className="todo-meta">
          <span className={`todo-badge badge-${todo.priority}`}>
            {capitalize(todo.priority)}
          </span>

          {todo.dueDate && (
            <span className={`todo-date ${isOverdue ? 'overdue' : ''}`}>
              <HiCalendar />
              {isOverdue ? 'Overdue: ' : 'Due '}
              {formatDueDate(todo.dueDate)}
            </span>
          )}

          <span className="todo-date">Added {formatCreated(todo.createdAt)}</span>
        </div>
      </div>

      <div className="todo-actions">
        <button
          className="btn-icon btn-icon-edit"
          title="Edit task"
          aria-label="Edit task"
          onClick={startEdit}
        >
          <HiPencil />
        </button>
        <button
          className="btn-icon"
          title="Delete task"
          aria-label="Delete task"
          onClick={() => onDelete(todo)}
        >
          <HiTrash />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;
