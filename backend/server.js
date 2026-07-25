import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import protect from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

// Charge les variables d'environnement depuis .env
dotenv.config();

// Connexion à la base de données
connectDB();

const app = express();

// Middlewares globaux
app.use(cors()); // autorise le futur frontend React à appeler l'API
app.use(express.json()); // parse les corps de requête JSON

// Route de santé (vérification rapide que l'API tourne)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API de gestion des tâches - opérationnelle' });
});

// Routes de l'API
app.use('/api/auth', authRoutes); // inscription / connexion (publiques)
app.use('/api/tasks', protect, taskRoutes); // tâches : réservées aux utilisateurs connectés

// Gestion des routes inexistantes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// Gestion centralisée des erreurs (doit être le dernier middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
