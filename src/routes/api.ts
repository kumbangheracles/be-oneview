import exporess from "express";
import authController from "../controllers/auth.controller";
import authMiddleware, { IReqUser } from "../middlewares/auth.middleware";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Request, Response } from "express";
import { SECRET, CLIENT_HOST } from "../utils/env";
import { IUserToken } from "../utils/jwt";
import mediaController from "../middlewares/media.controller";
import mediaMiddleware from "../middlewares/media.middleware";
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

// Media
router.post(
  "/media/upload-single",
  [authMiddleware, mediaMiddleware.single("file")],
  mediaController.single
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            file: {
              type: "string",
              format: "binary"
            }
          }
        }
      }
    }
  }
  */
);
router.post(
  "/media/upload-multiple",
  [authMiddleware, mediaMiddleware.multiple("files")],
  mediaController.multiple
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            files: {
              type: "array",
              items: {
                type: "string",
                format: "binary"
              }
            }
          }
        }
      }
    }
  }
  */
);
router.delete(
  "/media/remove",
  [authMiddleware],
  mediaController.remove
  /*
  #swagger.tags = ['Media']
  #swagger.security = [{
    "bearerAuth": {}
  }]
  #swagger.requestBody = {
    required: true,
    schema: {
      $ref: "#/components/schemas/RemoveMediaRequest"
    }
  }
  */
);
export default router;
