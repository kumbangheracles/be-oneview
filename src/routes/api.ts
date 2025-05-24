import exporess from "express";
import authController from "../controllers/auth.controllers";
import authMiddleware from "../middlewares/auth.middleware";
const router = exporess.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
export default router;
