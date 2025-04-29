import exporess from "express";
import authController from "../controllers/auth.controllers";
const router = exporess.Router();

router.post("/auth/register", authController.register);
export default router;
