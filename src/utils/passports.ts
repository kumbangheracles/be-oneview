import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { CLIENT_SECRET, CLIENTID, SECRET, CLIENT_CALLBACKURL } from "./env";
import { User } from "../models/user.model";
import UserModel from "../models/user.model";
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENTID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CLIENT_CALLBACKURL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: User) => void
    ) => {
      try {
        const userData: User = {
          fullName: profile.displayName,
          username: profile.emails?.[0].value.split("@")[0] as string,
          email: profile.emails?.[0].value as string,
          profilePicture: profile.photos?.[0].value as string,
          role: "user",
          isActive: true,
          provider: "google",
          providerId: profile.id,
          // phoneNumber: profile?.phoneNumber
          activationCode: "",
        };

        let user = await UserModel.findOne({ providerId: profile.id });

        if (!user) {
          user = await UserModel.create(userData);
        }
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;
