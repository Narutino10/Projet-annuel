import express, { Request, Response } from "express";
import { register, login } from "../controllers/auth.controller";

const router = express.Router();

// Assurez-vous que register et login sont bien des fonctions async qui renvoient une `Promise`
router.post("/register", async (req: Request, res: Response) => {
  await register(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
  await login(req, res);
});

export default router;
