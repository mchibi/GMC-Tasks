import Task from '../models/Task.js';

// @desc    Récupérer toutes les tâches (triées par date de création décroissante)
// @route   GET /api/tasks
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer une tâche par son id
// @route   GET /api/tasks/:id
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer une nouvelle tâche
// @route   POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.create({ title, description, status, dueDate });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Modifier une tâche existante
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
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

// @desc    Supprimer une tâche
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
