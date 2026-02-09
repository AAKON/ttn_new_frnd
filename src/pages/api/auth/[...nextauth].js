import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const loginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
          console.log("[NextAuth] Login URL:", loginUrl);

          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const user = await res.json();
          console.log("[NextAuth] Response status:", res.status);
          console.log("[NextAuth] Response body:", JSON.stringify(user));

          if (res.ok && user.data) {
            const tokenPayload = JSON.parse(
              atob(user?.data?.access_token.split(".")[1])
            );
            return {
              accessToken: user?.data?.access_token,
              exp: tokenPayload.exp,
              name: user?.data?.name,
              user_name: user?.data?.name,
              email: user?.data?.email,
              profile_image: user?.data?.profile_picture,
              roles: user?.data?.roles || [],
            };
          } else {
            console.log("[NextAuth] Login failed - res.ok:", res.ok, "user.data:", !!user.data);
            return null;
          }
        } catch (error) {
          console.error("[NextAuth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account && account.provider === "google") {
        try {
          const googleLoginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`;
          const res = await fetch(googleLoginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile?.email,
              token: account.access_token,
            }),
          });
          const apiResponse = await res.json();

          if (res.ok && apiResponse.data) {
            token.accessToken = apiResponse.data.access_token;
            token.email = apiResponse.data.email;
            token.roles = apiResponse.data.roles || [];
          } else {
            throw new Error(apiResponse.message || "Google login failed.");
          }
        } catch (error) {
          console.error("Google login API error:", error);
          throw new Error("Google login verification failed.");
        }
        token.name = profile?.name;
        token.user_name = profile?.given_name || profile?.name;
        token.picture = profile?.picture;
      } else if (user) {
        token.accessToken = user.accessToken;
        token.exp = user.exp;
        token.name = user.name;
        token.user_name = user.name;
        token.email = user.email;
        token.picture = user.profile_image;
        token.roles = user.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        full_name: token.name,
        user_name: token.user_name,
        email: token.email,
        profile_image: token.picture,
        roles: token.roles || [],
      };
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl + "/";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
