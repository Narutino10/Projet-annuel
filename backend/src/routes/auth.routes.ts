import express from "express";
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Utiliser des fonctions `async` explicites
router.post("/register", async (req, res) => await register(req, res));
router.get("/verify", async (req, res) => await verifyEmail(req, res));
router.post("/login", async (req, res) => await login(req, res));
router.post("/refresh-token", async (req, res) => await refreshToken(req, res));
router.post("/forgot-password", async (req, res) => await forgotPassword(req, res));
router.post("/reset-password", async (req, res) => await resetPassword(req, res));

// Route protégée par `authMiddleware`
router.get("/profile", authMiddleware, async (req, res) => {
  res.json({ message: "Voici votre profil", user: (req as any).user });
});

// Route admin protégée
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  res.json({ message: "Bienvenue, admin !" });
});

export default router;
