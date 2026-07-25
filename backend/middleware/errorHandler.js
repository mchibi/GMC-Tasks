// Middleware centralisé de gestion des erreurs.
// Transforme les erreurs Mongoose courantes en réponses HTTP claires.
const errorHandler = (err, req, res, next) => {
  // Id MongoDB mal formé (ex : GET /api/tasks/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Identifiant invalide' });
  }

  // Erreurs de validation du schéma (titre manquant, statut invalide...)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
};

export default errorHandler;
