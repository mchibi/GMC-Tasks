import { useState } from 'react';
import api, { getErrorMessage } from '../api/client';

// Formulaire de création d'une tâche : titre, description, priorité et date limite.
function TaskForm({ onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        priority,
        dueDate: dueDate || null,
      });
      onTaskCreated();
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card task-form">
      <h2>Nouvelle tâche</h2>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Titre *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Réviser le chapitre 3"
            maxLength={100}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails de la tâche (facultatif)"
            maxLength={1000}
            rows={3}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="priority">Priorité</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dueDate">Date limite</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Ajout…' : '+ Ajouter la tâche'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default TaskForm;
