import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getIP } from "@/lib/rate-limit";
import authConfig from "./auth.config";

class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
}

class LoginRateLimited extends CredentialsSignin {
  code = "rate_limit_exceeded";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) return `${baseUrl}/dashboard`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isPro: true },
        });
        token.isPro = dbUser?.isPro ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      session.user.isPro = (token.isPro as boolean | undefined) ?? false;
      return session;
    },
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const ip = getIP(req as Request);
        const { allowed } = await checkRateLimit(
          `login:${ip}:${email}`,
          5,
          "15 m"
        );
        if (!allowed) throw new LoginRateLimited();

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === "true";
        if (verificationEnabled && !user.emailVerified) throw new EmailNotVerified();

        return user;
      },
    }),
  ],
});
