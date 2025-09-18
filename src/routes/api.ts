import exporess from "express";
import authController from "../controllers/auth.controller";
import authMiddleware, { IReqUser } from "../middlewares/auth.middleware";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Request, Response } from "express";
import { SECRET, CLIENT_HOST } from "../utils/env";
import { IUserToken } from "../utils/jwt";
const router = exporess.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google",
  passport.authenticate("google", { session: false }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as IUserToken;
      const token = jwt.sign({ id: user?.id, email: user?.email }, SECRET);
      res.redirect(`${CLIENT_HOST}/auth-success?token=${token}`);
    } catch (error) {
      console.error("Google login error", error);
      res.redirect(`${CLIENT_HOST}/login?error=google_failed`);
    }
  }
);

router.get("/auth/me", authMiddleware, authController.me);
export default router;
