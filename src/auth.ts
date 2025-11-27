import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ username: z.string(), password: z.string() })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({
            where: { username },
          })

          if (!user) return null

          // Check if account is locked
          if (user.lockedUntil && new Date() < user.lockedUntil) {
            console.log(`Account locked until ${user.lockedUntil}`)
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            // Reset failed login attempts on successful login
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: 0,
                lockedUntil: null
              }
            })
            return user
          } else {
            // Record failed login attempt
            const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
            const lockDuration = parseInt(process.env.LOCK_DURATION_MINUTES || '30')
            const newAttempts = (user.failedLoginAttempts || 0) + 1
            const shouldLock = newAttempts >= maxAttempts

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: newAttempts,
                lockedUntil: shouldLock 
                  ? new Date(Date.now() + lockDuration * 60 * 1000)
                  : null
              }
            })
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        // PostgreSQL Json type - no need to stringify
        token.roles = typeof user.roles === 'string' 
          ? user.roles 
          : JSON.stringify(user.roles || [user.role])
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.roles = token.roles as string
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If redirecting after login
      if (url === baseUrl || url === `${baseUrl}/login`) {
        return `${baseUrl}/select-role`
      }
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
})
