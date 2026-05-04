import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      email: string
      nombre: string
      rol: 'manager' | 'admin'
      turno_inicio: string
      turno_fin: string
      foto?: string
      pestana?: string
    }
  }
  interface User {
    id: string
    email: string
    nombre: string
    rol: 'manager' | 'admin'
    turno_inicio: string
    turno_fin: string
    foto?: string
    pestana?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    nombre: string
    rol: 'manager' | 'admin'
    turno_inicio: string
    turno_fin: string
    foto?: string
    pestana?: string
  }
}
