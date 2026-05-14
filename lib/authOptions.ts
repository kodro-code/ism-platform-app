import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Devuelve el timestamp (segundos) del día 2 del próximo mes a las 00:00
function next2ndOfMonth(): number {
  const now    = new Date()
  const this2nd = new Date(now.getFullYear(), now.getMonth(), 2, 0, 0, 0)
  const next2nd = new Date(now.getFullYear(), now.getMonth() + 1, 2, 0, 0, 0)
  const target  = now < this2nd ? this2nd : next2nd
  return Math.floor(target.getTime() / 1000)
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(process.env.GAS_AUTH_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          })
          const data = await res.json()

          if (data.success && data.user) {
            return { id: data.user.email, ...data.user }
          }
        } catch (e) {
          console.error('[Auth] GAS error:', e)
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Always recompute isAdmin — handles old JWTs and changes to ADMIN_EMAILS
      const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)

      // ── Initial sign-in ──────────────────────────────────────────────────────
      if (user) {
        const email = (user as any).email ?? ''
        token.email        = email
        token.nombre       = (user as any).nombre
        token.rol          = (user as any).rol
        token.turno_inicio = (user as any).turno_inicio
        token.turno_fin    = (user as any).turno_fin
        token.foto         = (user as any).foto    ?? ''
        token.pestana      = (user as any).pestana ?? ''
        token.isAdmin      = adminEmails.includes(String(email).toLowerCase())
        token.exp          = next2ndOfMonth()
        token.lastChecked  = Math.floor(Date.now() / 1000)
        return token
      }

      // Refresh isAdmin on every token rotation (fixes old JWTs without re-login)
      token.isAdmin = adminEmails.includes(String(token.email ?? '').toLowerCase())

      // ── Periodic active check (every 15 minutes) ─────────────────────────────
      const now         = Math.floor(Date.now() / 1000)
      const lastChecked = (token.lastChecked as number) ?? 0

      if (now - lastChecked > 15 * 60) {
        try {
          const url  = `${process.env.GAS_AUTH_URL}?action=checkActive&email=${encodeURIComponent(String(token.email))}`
          const res  = await fetch(url)
          const data = await res.json()

          if (data.active === false) {
            // User removed or deactivated — revoke token
            return { ...token, revoked: true }
          }
          token.lastChecked = now
        } catch {
          // GAS unreachable — keep session, retry next interval
          token.lastChecked = now
        }
      }

      return token
    },

    session({ session, token }) {
      // If token was revoked, return an empty session (forces sign-out on client)
      if ((token as any).revoked) return null as any

      session.user.email        = String(token.email ?? '')
      session.user.nombre       = token.nombre
      session.user.rol          = token.rol
      session.user.turno_inicio = token.turno_inicio
      session.user.turno_fin    = token.turno_fin
      session.user.foto         = token.foto
      session.user.pestana      = token.pestana
      session.user.isAdmin      = token.isAdmin ?? false
      return session
    },
  },
  pages: { signIn: '/login' },
  session: {
    strategy: 'jwt',
    maxAge: 33 * 24 * 60 * 60, // techo de 33 días; el JWT limita al día 2
  },
  secret: process.env.NEXTAUTH_SECRET,
}
