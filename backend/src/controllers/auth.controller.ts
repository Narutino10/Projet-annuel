import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash.util";
import jwt from "jsonwebtoken";
import pool from "../db";  // Importation de la connexion PostgreSQL

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Inscription
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Insérer le nouvel utilisateur
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);

    res.status(201).json({ message: "Utilisateur créé !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
};

// Connexion
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
};
