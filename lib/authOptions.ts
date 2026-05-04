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
    jwt({ token, user }) {
      if (user) {
        token.nombre       = (user as any).nombre
        token.rol          = (user as any).rol
        token.turno_inicio = (user as any).turno_inicio
        token.turno_fin    = (user as any).turno_fin
        token.foto         = (user as any).foto    ?? ''
        token.pestana      = (user as any).pestana ?? ''
        // Expira el día 2 del mes siguiente
        token.exp          = next2ndOfMonth()
      }
      return token
    },
    session({ session, token }) {
      session.user.nombre       = token.nombre
      session.user.rol          = token.rol
      session.user.turno_inicio = token.turno_inicio
      session.user.turno_fin    = token.turno_fin
      session.user.foto         = token.foto
      session.user.pestana      = token.pestana
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
