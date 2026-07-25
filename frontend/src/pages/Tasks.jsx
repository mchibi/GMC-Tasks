import { useCallback, useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import TaskForm from '../components/TaskForm.jsx';
import TaskFilters from '../components/TaskFilters.jsx';
import TaskItem from '../components/TaskItem.jsx';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
};

// Page principale : formulaire de création, barre de filtres et liste des tâches.
// Le filtrage, la recherche et le tri sont effectués par l'API (paramètres de requête).
function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async (activeFilters) => {
    try {
      setError('');
      const { data } = await api.get('/tasks', { params: activeFilters });
      setTasks(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // La saisie de recherche est temporisée (300 ms) pour ne pas
  // envoyer une requête à chaque frappe.
  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, fetchTasks]);

  // Après création, modification ou suppression, on recharge la liste
  // afin qu'elle respecte les filtres et le tri en cours.
  const refresh = () => fetchTasks(filters);

  const handleUpdate = async (id, changes) => {
    await api.put(`/tasks/${id}`, changes);
    await refresh();
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    await refresh();
  };

  const hasActiveFilters = filters.search !== '' || filters.status !== '';

  return (
    <>
      <TaskForm onTaskCreated={refresh} />

      <TaskFilters filters={filters} onChange={setFilters} />

      <section className="task-list">
        <h2>
          Mes tâches
          {!loading && <span className="task-count"> ({tasks.length})</span>}
        </h2>

        {loading && <p className="muted">Chargement…</p>}
        {error && <div className="alert">{error}</div>}

        {!loading && !error && tasks.length === 0 && (
          <div className="card empty-state">
            {hasActiveFilters ? (
              <>
                <p>Aucune tâche ne correspond à votre recherche.</p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <p>Aucune tâche pour le moment.</p>
                <p className="muted">
                  Ajoutez votre première tâche avec le formulaire ci-dessus.
                </p>
              </>
            )}
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
