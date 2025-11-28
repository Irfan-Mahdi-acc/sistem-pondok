import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
            return {
              ...user,
              roles: (user.roles || undefined) as string | object | undefined
            }
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
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // User exists, link Google account if not already linked
            const existingAccount = await prisma.account.findFirst({
              where: {
                provider: "google",
                providerAccountId: account.providerAccountId
              }
            })

            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                }
              })
            }

            // Update user info from Google
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                avatarUrl: user.image || existingUser.avatarUrl,
              }
            })

            return true
          } else {
            // Create new user from Google account
            const username = user.email!.split('@')[0] + Math.random().toString(36).substring(7)
            
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                username: username,
                password: '', // No password for OAuth users
                role: 'SANTRI', // Default role
                avatarUrl: user.image,
                emailVerified: new Date(), // Auto-verify email from Google
              }
            })

            // Create account link
            await prisma.account.create({
              data: {
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              }
            })

            return true
          }
        } catch (error) {
          console.error("Error in Google sign in:", error)
          return false
        }
      }

      return true
    },
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
      // Force localhost instead of 0.0.0.0
      const correctBaseUrl = baseUrl.replace('0.0.0.0', 'localhost')
      const correctedUrl = url.replace('0.0.0.0', 'localhost')
      
      // If redirecting after login
      if (correctedUrl === correctBaseUrl || correctedUrl === `${correctBaseUrl}/login`) {
        return `${correctBaseUrl}/select-role`
      }
      // Allow callback URLs on the same origin
      if (correctedUrl.startsWith(correctBaseUrl)) {
        return correctedUrl
      }
      return correctBaseUrl
    },
  },
  pages: {
    signIn: '/login',
  },
})
