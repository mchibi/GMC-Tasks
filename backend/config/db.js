import mongoose from 'mongoose';

// Établit la connexion à MongoDB via Mongoose.
// L'URI est lue depuis la variable d'environnement MONGO_URI (voir .env).
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
