import exporess from "express";
import authController from "../controllers/auth.controllers";
const router = exporess.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
export default router;
