import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
  throw new Error('Missing required env vars: AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be set');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email?.toLowerCase() ?? null,
          image: profile.picture,
        };
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
    async jwt({ token, user, account, trigger, session: sessionData }) {
      if (user?.id) {
        token.id = user.id;
      }
      // When updateSession({ user: { name } }) is called client-side, merge it in
      if (trigger === 'update' && sessionData?.user?.name) {
        token.name = sessionData.user.name;
      }
      // On first GitHub OAuth sign-in, account is present. Stamp emailVerified directly
      // on the token and persist it to the DB in the same step, so the token is always
      // correct regardless of whether subsequent jwt calls have account available.
      if ((account?.provider === 'github' || account?.provider === 'google') && token.id) {
        const now = new Date();
        await db.user.update({
          where: { id: token.id as string },
          data: { emailVerified: now },
        });
        token.emailVerified = now;
      }
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { tier: true, emailVerified: true, name: true },
        });
        token.tier = dbUser?.tier ?? 'free';
        // Always read emailVerified from DB unless the token already carries a verified Date.
        // This ensures credentials users see the updated value after OTP verification
        // (updateSession re-runs this callback), while preserving the Date stamped above
        // for GitHub users in the same request where account is present.
        if (!token.emailVerified) {
          token.emailVerified = dbUser?.emailVerified ?? null;
        }
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
    error: '/auth-error',
  },
});
