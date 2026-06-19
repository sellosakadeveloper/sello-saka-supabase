import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { normalizeEmail } from "./authHelpers";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: normalizeEmail(String(params.email || "")),
        };
      },
      validatePasswordRequirements(password) {
        if (!password || password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
      },
    }),
  ],
});
