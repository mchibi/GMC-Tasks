import rateLimit from 'express-rate-limit';

// Limitation de débit sur les routes d'authentification.
// Objectif : empêcher qu'un attaquant teste des milliers de mots de passe
// sur /api/auth/login. Les tentatives réussies ne sont pas comptabilisées,
// afin de ne pas gêner un utilisateur légitime.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
  },
});

// Limite générale sur l'API, volontairement large :
// elle ne bloque qu'un usage anormal (script automatisé).
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de requêtes. Veuillez patienter un instant.',
  },
});
