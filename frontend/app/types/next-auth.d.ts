// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      google_id?: string;
      user_id?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    google_id?: string;
  }
}