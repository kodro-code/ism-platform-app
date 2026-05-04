import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const GAS = process.env.GAS_VENTAS_URL!

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.pestana) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

  const url = `${GAS}?pestana=${encodeURIComponent(session.user.pestana)}`
  const res  = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.pestana) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

  const { rowIndex } = await req.json()
  const res  = await fetch(GAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', pestana: session.user.pestana, rowIndex }),
  })
  const data = await res.json()
  return NextResponse.json(data)
}
