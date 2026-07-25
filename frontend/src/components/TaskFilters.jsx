// Barre d'outils : recherche, filtre par statut et tri de la liste.
// Les valeurs sont pilotées par la page Tasks, qui interroge l'API à chaque changement.

const STATUS_TABS = [
  { value: '', label: 'Toutes' },
  { value: 'todo', label: 'À faire' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'done', label: 'Terminées' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'dueDate', label: 'Échéance' },
  { value: 'priority', label: 'Priorité' },
  { value: 'title', label: 'Titre' },
];

function TaskFilters({ filters, onChange }) {
  const update = (changes) => onChange({ ...filters, ...changes });

  const toggleOrder = () =>
    update({ order: filters.order === 'asc' ? 'desc' : 'asc' });

  return (
    <section className="card filters">
      <div className="field search-field">
        <label htmlFor="search">Rechercher</label>
        <input
          id="search"
          type="search"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Par titre ou description…"
        />
      </div>

      <div className="filters-row">
        <div className="status-tabs" role="group" aria-label="Filtrer par statut">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              type="button"
              className={`tab ${filters.status === tab.value ? 'tab-active' : ''}`}
              onClick={() => update({ status: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <label htmlFor="sortBy">Trier par</label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => update({ sortBy: e.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={toggleOrder}
            title={filters.order === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
          >
            {filters.order === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default TaskFilters;
