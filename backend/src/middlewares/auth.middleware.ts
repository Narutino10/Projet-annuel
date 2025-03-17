import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Middleware d'authentification : Vérifie le JWT et l'état de l'utilisateur
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifie si l'en-tête Authorization contient un Bearer Token
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token manquant ou mal formaté" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Vérifie si l'utilisateur existe toujours
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable ou supprimé" });
    }

    const user = userResult.rows[0];

    // Vérifie si l'utilisateur a validé son email
    if (!user.is_verified) {
      return res.status(403).json({ error: "Compte non vérifié, veuillez valider votre email." });
    }

    // Stocke l'utilisateur dans `req.user` pour une utilisation future
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
};

// Middleware d'autorisation : Vérifie si l'utilisateur est un administrateur
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Accès refusé, admin uniquement" });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
