import mongoose from 'mongoose';

// Modèle Task : représente une tâche appartenant à un utilisateur.
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // accélère la récupération des tâches d'un utilisateur
    },
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Statut invalide : {VALUE} (valeurs possibles : todo, in-progress, done)',
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priorité invalide : {VALUE} (valeurs possibles : low, medium, high)',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt automatiquement
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
