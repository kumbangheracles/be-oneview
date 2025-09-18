import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";
import passport, { Passport } from "passport";
type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().required(),
  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password")], "Password not match"),
});
export default {
  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
        provider: "local",
      });
      res.status(200).json({
        message: "Success Registration!",
        data: result,
      });
    } catch (error: any) {
      const err = error as Error;
      console.log("error validate register: ", err);
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async login(req: Request, res: Response) {
    /**
     #swagger.requestBody = {
     required: true,
     schema: {
     $ref: "#components/schemas/LoginRequest"}
     }
     
     */
    const { identifier, password } = req.body as unknown as TLogin;
    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            username: identifier,
          },
          {
            email: identifier,
          },
        ],
        provider: "local",
      });

      // validasi identifier
      if (!userByIdentifier) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      // validasi password
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return res.status(403).json({
          message: "User not found",
          data: null,
        });
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });
      res.status(200).json({
        message: "Login success",
        data: token,
      });
    } catch (error: any) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
  /**
     #swagger.requestBody = {
     required: false,
     schema: {
     $ref: "#components/schemas/GoogleLoginRequest"}
     }
     
     */
  async googleLogin(req: Request, res: Response) {
    try {
      const { email, fullName, profilePicture, providerId } = req.body;

      let user = await UserModel.findOne({
        $or: [{ providerId }, { email }],
        provider: "google",
      });

      if (!user) {
        user = await UserModel.create({
          fullName,
          username: email.split("@")[0],
          email,
          profilePicture,
          provider: "google",
          providerId,
          isActive: true,
        });
      }

      const token = generateToken({
        id: user._id,
        role: user.role,
      });

      return res.status(200).json({
        message: "Google login success",
        data: token,
      });
    } catch (error) {
      const err = error as Error;
      return res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async me(req: IReqUser, res: Response) {
    /**
    #swagger.security = [{
     "bearerAuth": []
     }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id)
        .select("-password -__v -confirmPassword -__v -activationCode")
        .lean();

      res.status(200).json({
        message: "Success get user profile",
        data: result,
      });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },
};
