import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/auth.routes";
import pool from "./db";  // Importer la connexion à la base de données

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

// Vérification de la connexion à PostgreSQL
pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err: unknown) => console.error("❌ Erreur de connexion PostgreSQL", err));

// Test de connexion à PostgreSQL via API
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: "Connexion à PostgreSQL réussie", time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion à la base de données" });
  }
});

app.get('/', (req, res) => {
  res.send('Hello, Projet Annuel!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
