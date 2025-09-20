import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken, generateToken2 } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";
import passport, { Passport } from "passport";
type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber: string;
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
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .min(13, "Phone number must be at least 13 digits")
    .max(13, "Phone number cannot be more than 13 digits"),
});
export default {
  async register(req: Request, res: Response) {
    /**
      #swagger.tags = ['Auth']
     */
    const {
      fullName,
      username,
      email,
      password,
      confirmPassword,
      role,
      phoneNumber,
    } = req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
        phoneNumber,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
        role,
        phoneNumber,
        provider: "local",
        isActive: true,
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
     #swagger.tags = ['Auth']
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

      // if (!validatePassword) {
      //   return res.status(403).json({
      //     message: "User not found",
      //     data: null,
      //   });
      // }

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

  async loginWithGoogle(req: Request, res: Response) {
    try {
      const { access_token } = req.body;

      const googleRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      const profile = await googleRes.json();

      let user = await UserModel.findOne({ email: profile.email });
      if (!user) {
        user = await UserModel.create({
          email: profile.email,
          fullName: profile.name,
          profilePicture: profile.picture,
          provider: "google",
        });
      }

      const token = generateToken2({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      console.log("Tokeen ===========: ", token);

      res.status(200).json({
        data: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          accessToken: token,
        },
      });
    } catch (error) {
      console.log("Error login with googlev==============: ", error);
      const err = error as Error;
      res.status(400).json({
        message: err.message,
        data: null,
      });
    }
  },

  async me(req: Request, res: Response) {
    /**
    #swagger.tags = ['Auth']
    #swagger.security = [{
     "bearerAuth": []
     }]
     */
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id)
        .select("-confirmPassword -__v -activationCode")
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

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({
        message: "Success",
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

  async activation(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ['Auth']
      #swagger.requestBody = {
      required: true,
      schema: {$ref: '#/components/schemas/ActivationRequest'}
      }
       */
    try {
      const { code } = req.body as { code: string };
      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActive: true,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        message: "Success get user profile",
        data: user,
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
