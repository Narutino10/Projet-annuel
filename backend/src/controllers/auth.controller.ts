import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hash.util";
import jwt from "jsonwebtoken";
import pool from "../db";
import crypto from "crypto";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

// Configuration de l'envoi d'email
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Inscription avec vérification d'email
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      "INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3)",
      [email, hashedPassword, verificationToken]
    );

    // Envoi de l'email de vérification
    const verificationLink = `http://localhost:3000/auth/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vérifiez votre email",
      html: `<p>Merci de vous être inscrit ! Cliquez <a href="${verificationLink}">ici</a> pour valider votre compte.</p>`,
    });

    res.status(201).json({ message: "Utilisateur créé ! Vérifiez votre email." });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
};

// ✅ Vérification d'email
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await pool.query("SELECT * FROM users WHERE verification_token = $1", [token]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Token invalide ou expiré." });
    }

    await pool.query("UPDATE users SET is_verified = true, verification_token = NULL WHERE email = $1", [user.rows[0].email]);

    res.json({ message: "Email vérifié avec succès !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la vérification de l'email." });
  }
};

// ✅ Connexion avec refresh token
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
    }

    if (!(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

    await pool.query("UPDATE users SET refresh_token = $1 WHERE email = $2", [refreshToken, email]);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la connexion" });
  }
};

// ✅ Rafraîchir le token JWT
export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE refresh_token = $1", [token]);

    if (user.rows.length === 0) {
      return res.status(403).json({ error: "Refresh Token invalide." });
    }

    const newAccessToken = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: "15m" });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du rafraîchissement du token." });
  }
};

// ✅ Réinitialisation du mot de passe
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(32).toString("hex");

  await pool.query("UPDATE users SET reset_token = $1 WHERE email = $2", [resetToken, email]);

  const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Réinitialisation du mot de passe",
    html: `<p>Cliquez <a href="${resetLink}">ici</a> pour réinitialiser votre mot de passe.</p>`,
  });

  res.json({ message: "Email de réinitialisation envoyé." });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const hashedPassword = await hashPassword(newPassword);

  await pool.query("UPDATE users SET password = $1, reset_token = NULL WHERE reset_token = $2", [hashedPassword, token]);

  res.json({ message: "Mot de passe réinitialisé avec succès." });
};
