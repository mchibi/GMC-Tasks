import mongoose from 'mongoose';

// Modèle Task : représente une tâche de l'utilisateur.
// NOTE : le champ `user` (référence vers le propriétaire) sera ajouté
// lors de la phase d'authentification.
const taskSchema = new mongoose.Schema(
  {
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
