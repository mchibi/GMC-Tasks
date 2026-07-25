import Task from '../models/Task.js';

// Toutes les opérations sont limitées aux tâches de l'utilisateur connecté
// (req.user est fourni par le middleware d'authentification).

// @desc    Récupérer les tâches de l'utilisateur connecté
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
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
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
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
    const { title, description, status, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, description, status, dueDate },
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
