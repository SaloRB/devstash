import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export default {
  providers: [
    GitHub,
    Credentials({
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
