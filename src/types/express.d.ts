import { IUserToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface User extends IUserToken {}
  }
}
