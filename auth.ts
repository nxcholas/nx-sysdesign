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

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
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
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }
      console.log('[jwt] trigger:', trigger, '| token.id:', token.id, '| user?.id:', user?.id);
      // Re-read tier from DB on sign-in and whenever update() is called (e.g. post-checkout)
      if (token.id && (user?.id || trigger === 'update')) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { tier: true },
        });
        console.log('[jwt] DB tier read:', dbUser?.tier, '| for userId:', token.id);
        token.tier = dbUser?.tier ?? 'free';
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
        session.user.tier = (token.tier as string) ?? 'free';
      }
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
});
