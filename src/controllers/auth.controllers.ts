import { Request, Response } from "express";
import * as Yup from "yup";
type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
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
    const { fullName, confirmPassword, email, password, username } =
      req.body as unknown as TRegister;

    try {
      await registerValidateSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      res.status(200).json({
        message: "Success Registration!",
        data: {
          fullName,
          username,
          email,
        },
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
};
