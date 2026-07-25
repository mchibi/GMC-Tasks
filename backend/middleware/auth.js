import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware de protection : vérifie le jeton JWT (en-tête "Authorization: Bearer <token>"),
// charge l'utilisateur correspondant et l'attache à req.user.
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Non autorisé : jeton manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Non autorisé : utilisateur introuvable' });
    }
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: 'Non autorisé : jeton invalide ou expiré' });
  }
};

export default protect;
