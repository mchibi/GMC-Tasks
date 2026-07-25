import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';

// Page principale : formulaire de création + liste des tâches de l'utilisateur.
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
          <TaskItem key={task._id} task={task} />
        ))}
      </section>
    </>
  );
}

export default Tasks;
