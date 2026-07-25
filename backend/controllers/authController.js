import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Génère un jeton JWT signé contenant l'id de l'utilisateur
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Formate la réponse d'authentification (jeton + infos publiques du compte)
const authResponse = (user) => ({
  token: generateToken(user._id),
  user: { id: user._id, name: user.name, email: user.email },
});

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, data: authResponse(user) });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion d'un utilisateur existant
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Email et mot de passe requis' });
    }

    // Le mot de passe étant en select:false, on le demande explicitement
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Message volontairement identique dans les deux cas pour ne pas
    // révéler si l'email existe (bonne pratique de sécurité)
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }

    res.status(200).json({ success: true, data: authResponse(user) });
  } catch (error) {
    next(error);
  }
};

// @desc    Profil de l'utilisateur connecté
// @route   GET /api/auth/me (protégée)
export const getMe = async (req, res) => {
  const { _id, name, email, createdAt } = req.user;
  res.status(200).json({ success: true, data: { id: _id, name, email, createdAt } });
};
