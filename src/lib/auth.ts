import NextAuth, { type DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import type { UserRole } from '@prisma/client'

// ---------------------------------------------------------------------------
// Module augmentation — extend the built-in session / JWT types
// ---------------------------------------------------------------------------

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      phone: string
      fullName: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    phone: string
    email?: string | null
    fullName: string
    role: UserRole
  }
}

// ---------------------------------------------------------------------------
// NextAuth configuration
// ---------------------------------------------------------------------------

export const { auth, signIn, signOut, handlers } = NextAuth({
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Phone & Password',

      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const phone = (credentials?.phone as string | undefined)?.trim()
        const password = credentials?.password as string | undefined

        if (!phone || !password) return null

        const user = await prisma.user.findUnique({ where: { phone } })

        if (!user || user.isBlocked) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        return {
          id: user.id,
          phone: user.phone,
          email: user.email ?? null,
          fullName: user.fullName,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    // Persist role + custom fields into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.phone = (user as { phone: string }).phone
        token.fullName = (user as { fullName: string }).fullName
        token.role = (user as { role: UserRole }).role
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.phone = token.phone as string
      session.user.fullName = token.fullName as string
      session.user.role = token.role as UserRole
      return session
    },
  },

  pages: {
    signIn: '/login',
  },
})
