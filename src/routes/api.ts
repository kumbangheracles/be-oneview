import exporess from "express";
import authController from "../controllers/auth.controller";
import authMiddleware, { IReqUser } from "../middlewares/auth.middleware";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Request, Response } from "express";
import { SECRET, CLIENT_HOST } from "../utils/env";
import { generateToken, generateToken2, IUserToken } from "../utils/jwt";
import mediaController from "../controllers/media.controller";
import mediaMiddleware from "../middlewares/media.middleware";
const router = exporess.Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/callback/google",
  passport.authenticate("google", { session: false }),
  (req: Request, res: Response) => {
    /**
      #swagger.tags = ['Auth']
     */
    try {
      const user = req.user as IUserToken;
      const token = generateToken2(user);

      res.redirect(`${CLIENT_HOST}/google-login-success?token=${token}`);
    } catch (error) {
      console.error("Google login error", error);
      res.redirect(`${CLIENT_HOST}/failed-google-login`);
    }
  }
);

router.post("/auth/login-with-google", authController.loginWithGoogle);

router.get("/auth/me", authMiddleware, authController.me);

router.patch("/auth/update/:id", authMiddleware, authController.updateUser);
router.post("/auth/activation", authController.activation);

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
