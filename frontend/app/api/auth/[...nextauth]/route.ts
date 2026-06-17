import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.id_token = account.id_token;

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: account.id_token,
              }),
            }
          );

          const data = await response.json();

          token.userId = data.user_id;
          token.googleId = data.google_id;
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      (session as any).id_token = token.id_token;

      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).googleId = token.googleId;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };

// TESTING TESTING