import Task from '../models/Task.js';

// Toutes les opérations sont limitées aux tâches de l'utilisateur connecté
// (req.user est fourni par le middleware d'authentification).

const STATUSES = ['todo', 'in-progress', 'done'];
const SORT_FIELDS = ['createdAt', 'dueDate', 'priority', 'title'];

// Neutralise les caractères spéciaux d'une recherche pour éviter
// qu'une saisie comme "(" ne casse l'expression régulière.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Construit le filtre MongoDB à partir des paramètres de requête
const buildFilter = (userId, { status, search }) => {
  const filter = { user: userId };

  if (status && STATUSES.includes(status)) {
    filter.status = status;
  }

  // Recherche insensible à la casse dans le titre ET la description
  const term = search?.trim();
  if (term) {
    const regex = new RegExp(escapeRegex(term), 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  return filter;
};

// Construit l'étape de tri.
// - priorité : haute > moyenne > basse (et non l'ordre alphabétique)
// - échéance : les tâches sans date limite sont toujours reléguées à la fin
const buildSortStage = (sortBy, order) => {
  const direction = order === 'asc' ? 1 : -1;
  const field = SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';

  if (field === 'priority') return { priorityRank: direction, createdAt: -1 };
  if (field === 'dueDate') return { noDueDate: 1, dueDate: direction };
  return { [field]: direction };
};

// @desc    Récupérer les tâches de l'utilisateur connecté,
//          avec filtrage par statut, recherche textuelle et tri
// @route   GET /api/tasks?status=&search=&sortBy=&order=
export const getTasks = async (req, res, next) => {
  try {
    const { status, search, sortBy, order } = req.query;

    const tasks = await Task.aggregate([
      { $match: buildFilter(req.user._id, { status, search }) },
      {
        $addFields: {
          // Rang numérique permettant de trier les priorités par importance
          priorityRank: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'high'] }, then: 3 },
                { case: { $eq: ['$priority', 'low'] }, then: 1 },
              ],
              default: 2, // moyenne (couvre aussi les tâches sans priorité)
            },
          },
          // 1 si la tâche n'a pas d'échéance : sert à les placer en dernier
          noDueDate: { $cond: [{ $ifNull: ['$dueDate', false] }, 0, 1] },
        },
      },
      { $sort: buildSortStage(sortBy, order) },
      { $project: { priorityRank: 0, noDueDate: 0 } },
    ]);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer une tâche par son id
// @route   GET /api/tasks/:id
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer une nouvelle tâche pour l'utilisateur connecté
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.user._id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier une tâche existante (si elle appartient à l'utilisateur)
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, status, priority, dueDate },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une tâche (si elle appartient à l'utilisateur)
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
