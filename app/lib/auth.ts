import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user) return null;

        const isValidPassword = await compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValidPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          className: user.className,
          department: user.department,
          isBoarder: user.isBoarder,
          profileImageUrl: user.profileImageUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.id = u.id;
        token.role = u.role;
        token.className = u.className;
        token.department = u.department;
        token.isBoarder = u.isBoarder;
        token.profileImageUrl = u.profileImageUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = session.user as any;
        s.id = token.id;
        s.role = token.role;
        s.className = token.className;
        s.department = token.department;
        s.isBoarder = token.isBoarder;
        s.profileImageUrl = token.profileImageUrl;
      }
      return session;
    },
  },
};
