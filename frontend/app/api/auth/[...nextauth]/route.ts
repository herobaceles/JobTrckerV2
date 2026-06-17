import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    Google({
      // Fallback strings prevent compilation drops on serverless platforms
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // 🛠️ FIX 1: Enforce explicit runtime secret evaluation
  secret: process.env.NEXTAUTH_SECRET,

  // 🛠️ FIX 2: Force NextAuth to store sessions in JWT format explicitly on Vercel
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.id_token = account.id_token;

        try {
          // Construct the endpoint cleanly using the base URL
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
          const targetUrl = `${baseUrl}/api/auth/google`;

          const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: account.id_token,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Capture the precise database object strings
            token.userId = data.user_id;
            token.googleId = data.google_id;
          } else {
            console.error("Backend auth path returned error code:", response.status);
          }
        } catch (error) {
          console.error("Failed to sync user with backend serverless route:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Explicitly map the string references down to the client session wrapper
        (session as any).id_token = token.id_token;
        (session.user as any).id = token.userId;
        (session.user as any).googleId = token.googleId;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };