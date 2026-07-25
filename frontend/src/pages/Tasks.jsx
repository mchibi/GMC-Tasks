import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';

// Page principale : formulaire de création + liste des tâches de l'utilisateur,
// avec mise à jour et suppression synchronisées avec la base de données.
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Ajoute la tâche nouvellement créée en tête de liste
  const handleTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  // Met à jour une tâche en base, puis remplace sa version locale par
  // celle renvoyée par l'API (source de vérité).
  const handleUpdate = async (id, changes) => {
    const { data } = await api.put(`/tasks/${id}`, changes);
    setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)));
  };

  // Supprime la tâche en base puis la retire de la liste affichée
  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <>
      <TaskForm onTaskCreated={handleTaskCreated} />

      <section className="task-list">
        <h2>
          Mes tâches
          {!loading && <span className="task-count"> ({tasks.length})</span>}
        </h2>

        {loading && <p className="muted">Chargement…</p>}
        {error && <div className="alert">{error}</div>}

        {!loading && !error && tasks.length === 0 && (
          <div className="card empty-state">
            <p>Aucune tâche pour le moment.</p>
            <p className="muted">Ajoutez votre première tâche avec le formulaire ci-dessus.</p>
          </div>
        )}

        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </section>
    </>
  );
}

export default Tasks;
