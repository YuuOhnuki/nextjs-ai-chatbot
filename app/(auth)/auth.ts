import { compare } from "bcrypt-ts";
import NextAuth, {
  type Account,
  type DefaultSession,
  type Session,
} from "next-auth";
import type { DefaultJWT, JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { createGuestUser, createUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
    account?: {
      provider: string;
      type: string;
    };
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Handle OAuth users - create them in database if they don't exist
      if (account?.provider && user?.email) {
        try {
          const existingUsers = await getUser(user.email);
          if (existingUsers.length === 0) {
            // Create new user in database
            const newUser = await createUser(user.email); // No password for OAuth users
            token.id = newUser[0].id;
          } else {
            // Use existing user ID
            token.id = existingUsers[0].id;
          }
        } catch (error) {
          console.error("Failed to create/find OAuth user:", error);
          // Fall back to a generated ID, but this might cause issues
          token.id = user.id as string;
        }
      } else if (user) {
        token.id = user.id as string;
      }

      if (user) {
        token.type = user.type || "regular";
      }

      return token;
    },
    session: ({
      session,
      token,
      account,
    }: {
      session: Session;
      token: JWT;
      account?: Account | null;
    }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      if (account) {
        session.account = {
          provider: account.provider,
          type: account.type,
        };
      }

      return session;
    },
  },
});
