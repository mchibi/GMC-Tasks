// Libellés et couleurs des statuts
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

function TaskItem({ task }) {
  return (
    <article className={`card task-item status-${task.status}`}>
      <div className="task-main">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-description">{task.description}</p>}
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
