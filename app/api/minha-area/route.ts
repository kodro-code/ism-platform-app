import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const GAS = process.env.GAS_MINHA_AREA_URL

// ── Agregar una línea aquí cada mes nuevo ─────────────────────────────────────
const CONTROL_SHEETS: Record<string, string> = {
  '2026-04': '13CgeUCJIhVb1N43R8r46nqpaPMLVYFQgVM86_QrfRHg',
  '2026-05': '1b6ymL61Qa1b38SwyIj_L_xt1_TyxiHOw5fopRxH5_z0', // mes actual
  // '2026-06': 'ID_DEL_SHEET_DE_JUNIO',
}
const CURRENT_KEY = '2026-05'

function getControlId(month: string, year: string): string | null {
  const key = `${year}-${String(month).padStart(2, '0')}`
  return CONTROL_SHEETS[key] ?? null
}

function isAdminEmail(email: string) {
  const list = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return list.includes(email.toLowerCase())
}

export async function GET(req: NextRequest) {
  if (!GAS) return NextResponse.json({ success: false, error: 'GAS_MINHA_AREA_URL não configurada' }, { status: 503 })

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'getData'

  // ── Sales history (AOV-Sales spreadsheet) ────────────────────────────────────
  if (action === 'salesHistory') {
    let targetEmail = session.user.email
    const reqEmail  = searchParams.get('targetEmail')
    if (reqEmail && reqEmail !== targetEmail) {
      if (!isAdminEmail(session.user.email)) {
        return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
      }
      targetEmail = reqEmail
    }
    try {
      const res  = await fetch(`${GAS}?action=getSalesHistory&email=${encodeURIComponent(targetEmail)}`, { cache: 'no-store' })
      const data = await res.json()
      return NextResponse.json(data)
    } catch (err) {
      return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
    }
  }

  // ── Admin: list all managers (always from current spreadsheet) ───────────────
  if (action === 'managers') {
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    try {
      const controlId = CONTROL_SHEETS[CURRENT_KEY]
      const res  = await fetch(`${GAS}?action=getManagers&spreadsheetId=${controlId}`, { cache: 'no-store' })
      const data = await res.json()
      return NextResponse.json(data)
    } catch (err) {
      return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
    }
  }

  // ── getData: resolves the correct spreadsheet by month/year ──────────────────
  const month   = searchParams.get('month')  || String(new Date().getMonth() + 1)
  const year    = searchParams.get('year')   || String(new Date().getFullYear())

  let email   = session.user.email
  let pestana = session.user.pestana ?? ''

  const targetEmail   = searchParams.get('targetEmail')
  const targetPestana = searchParams.get('pestana')

  if (targetEmail && targetEmail !== email) {
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }
    email   = targetEmail
    pestana = targetPestana ?? ''
  } else if (targetPestana) {
    pestana = targetPestana
  }

  const controlId = getControlId(month, year)
  if (!controlId) return NextResponse.json({ success: false, error: 'Sem dados para este mês' }, { status: 404 })
  const url = `${GAS}?action=getData&email=${encodeURIComponent(email)}&pestana=${encodeURIComponent(pestana)}&month=${month}&year=${year}&spreadsheetId=${encodeURIComponent(controlId)}`

  try {
    const res  = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
