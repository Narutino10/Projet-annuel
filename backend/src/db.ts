import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(async () => {
    console.log("✅ Connecté à PostgreSQL");

    // Création de la table utilisateurs avec nouvelles colonnes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verification_token TEXT,
        refresh_token TEXT,
        reset_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Table 'users' mise à jour avec les nouvelles colonnes");

  })
  .catch(err => console.error("❌ Erreur de connexion PostgreSQL", err));

export default pool;
