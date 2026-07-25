import { useState } from 'react';
import { getErrorMessage } from '../api/client';

// Libellés des statuts
const STATUS_LABELS = {
  todo: 'À faire',
  'in-progress': 'En cours',
  done: 'Terminée',
};

const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));

// Une tâche est en retard si sa date limite est passée et qu'elle n'est pas terminée
const isOverdue = (task) =>
  task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

// Convertit une date ISO en valeur pour <input type="date"> (AAAA-MM-JJ)
const toInputDate = (isoDate) => (isoDate ? isoDate.slice(0, 10) : '');

function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(toInputDate(task.dueDate));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Changement rapide de statut depuis la carte
  const handleStatusChange = async (status) => {
    setError('');
    setBusy(true);
    try {
      await onUpdate(task._id, { status });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Ouvre le mode édition avec les valeurs actuelles
  const startEditing = () => {
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(toInputDate(task.dueDate));
    setError('');
    setEditing(true);
  };

  // Enregistre les modifications (titre, description, échéance)
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onUpdate(task._id, {
        title,
        description,
        dueDate: dueDate || null,
      });
      setEditing(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // Supprime la tâche après confirmation
  const handleDelete = async () => {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return;
    setError('');
    setBusy(true);
    try {
      await onDelete(task._id);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  // ----- Mode édition -----
  if (editing) {
    return (
      <article className={`card task-item editing status-${task.status}`}>
        <form className="task-edit-form" onSubmit={handleSave}>
          {error && <div className="alert">{error}</div>}
          <div className="field">
            <label htmlFor={`title-${task._id}`}>Titre *</label>
            <input
              id={`title-${task._id}`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="field">
            <label htmlFor={`desc-${task._id}`}>Description</label>
            <textarea
              id={`desc-${task._id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={2}
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor={`due-${task._id}`}>Date limite</label>
              <input
                id={`due-${task._id}`}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="task-edit-buttons">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
                {busy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      </article>
    );
  }

  // ----- Mode affichage -----
  return (
    <article className={`card task-item status-${task.status}`}>
      <div className="task-main">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
        {error && <div className="alert">{error}</div>}
        <div className="task-actions">
          <select
            className="status-select"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={busy}
            aria-label="Changer le statut"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm" onClick={startEditing} disabled={busy}>
            ✏️ Modifier
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={busy}>
            🗑 Supprimer
          </button>
        </div>
      </div>
      <div className="task-meta">
        <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
        {task.dueDate && (
          <span className={`due-date ${isOverdue(task) ? 'overdue' : ''}`}>
            📅 {formatDate(task.dueDate)}
            {isOverdue(task) && ' — en retard'}
          </span>
        )}
      </div>
    </article>
  );
}

export default TaskItem;
