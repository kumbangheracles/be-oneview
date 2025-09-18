import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
export interface User {
  fullName: string;
  username: string;
  email: string;
  password?: string | undefined;
  role: string;
  profilePicture: string;
  isActive: boolean;
  activationCode: string;
  // phoneNumber: string;
  provider?: "local" | "google";
  providerId?: string;
  avatar?: string;
  googleId?: string;
}

const Schema = mongoose.Schema;
const UserSchema = new Schema<User>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      // required: true,
      unique: true,
    },
    avatar: {
      type: Schema.Types.String,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      // required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: ["admin", "user"],
      default: "user",
    },
    profilePicture: {
      type: Schema.Types.String,
      default: "user.jpg",
    },
    isActive: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    providerId: {
      type: Schema.Types.String,
    },
    googleId: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  const user = this as any;
  if (user.password) {
    user.password = encrypt(user.password);
  }
  next();
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
