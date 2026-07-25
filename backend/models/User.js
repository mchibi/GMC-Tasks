import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Modèle User : représente un compte utilisateur.
// Le mot de passe est haché avec bcrypt avant chaque enregistrement
// et n'est jamais renvoyé par défaut dans les requêtes (select: false).
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Adresse email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false, // jamais renvoyé par défaut
    },
  },
  {
    timestamps: true,
  }
);

// Hache le mot de passe avant enregistrement (uniquement s'il a changé)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare un mot de passe en clair avec le hash stocké
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
