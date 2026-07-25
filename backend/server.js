import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import protect from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';
import { authLimiter, apiLimiter } from './middleware/rateLimit.js';

// Charge les variables d'environnement depuis .env
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Connexion à la base de données
connectDB();

const app = express();

// En production, l'application est servie derrière un reverse proxy
// (nginx puis Cloudflare) : sans cette option, toutes les requêtes
// sembleraient provenir de la même IP et la limitation de débit
// pénaliserait tous les utilisateurs ensemble.
if (isProduction) app.set('trust proxy', 1);

// ----- Sécurité et performance -----
app.use(helmet());
app.use(compression());

// CORS : en production, seules les origines déclarées sont autorisées.
// CLIENT_URL accepte plusieurs domaines séparés par des virgules.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: isProduction && allowedOrigins.length ? allowedOrigins : true,
  })
);

app.use(express.json({ limit: '100kb' }));

// ----- Routes de l'API -----
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API de gestion des tâches - opérationnelle' });
});

app.use('/api/auth', authLimiter, authRoutes); // inscription / connexion (publiques)
app.use('/api/tasks', apiLimiter, protect, taskRoutes); // réservées aux utilisateurs connectés

// Toute route /api inconnue renvoie du JSON (et non la page React)
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// ----- Frontend -----
// En production, Express sert les fichiers React compilés ; toute autre URL
// renvoie index.html pour laisser React Router gérer la navigation.
if (isProduction) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientBuild = path.join(__dirname, '..', 'frontend', 'dist');

  app.use(express.static(clientBuild));
  app.get(/.*/, (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
} else {
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'API en développement — frontend sur le port 5173' });
  });
}

// Gestion centralisée des erreurs (doit être le dernier middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
