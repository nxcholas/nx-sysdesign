import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const normalizedEmail = (credentials.email as string).toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user?.password) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // GitHub OAuth: stamp emailVerified if not already set so users bypass the OTP gate.
      // PrismaAdapter may or may not write it depending on the GitHub profile payload.
      if (account?.provider === 'github' && user?.id) {
        await db.user.updateMany({
          where: { id: user.id, emailVerified: null },
          data: { emailVerified: new Date() },
        }).catch(() => null);
      }
      return true;
    },
    async jwt({ token, user, trigger, session: sessionData }) {
      if (user?.id) {
        token.id = user.id;
      }
      // When updateSession({ user: { name } }) is called client-side, merge it in
      if (trigger === 'update' && sessionData?.user?.name) {
        token.name = sessionData.user.name;
      }
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { tier: true, emailVerified: true, name: true },
        });
        token.tier = dbUser?.tier ?? 'free';
        token.emailVerified = dbUser?.emailVerified ?? null;
        // Only overwrite name from DB if not in the middle of a client-triggered update
        if (trigger !== 'update') {
          token.name = dbUser?.name ?? token.name ?? null;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.tier = (token.tier as string) ?? 'free';
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
        if (token.name != null) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
