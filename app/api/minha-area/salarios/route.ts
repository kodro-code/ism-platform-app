import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

const GAS_URL = process.env.GAS_SALARIOS_URL ?? ''

function toDateRaw(raw: string): string | null {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toDateLabel(raw: string): string {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

function groupMonths(payments: any[]) {
  const map: Record<string, any> = {}
  for (const p of payments) {
    const [y, m] = p.dateRaw.split('-').map(Number)
    let year = y, mon = m - 1
    if (p.isClosing) { mon -= 1; if (mon < 0) { mon = 11; year -= 1 } }
    const key   = `${year}-${String(mon + 1).padStart(2, '0')}`
    const label = new Date(year, mon, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!map[key]) map[key] = { key, label, fix: 0, commission: 0, bonus: 0, fines: 0, totalSalary: 0, payments: [] }
    map[key].fix         += p.fix
    map[key].commission  += p.commission
    map[key].bonus       += p.bonus
    map[key].fines       += p.fines
    map[key].totalSalary += p.totalSalary
    map[key].payments.push(p)
  }
  return Object.values(map).sort((a: any, b: any) => a.key < b.key ? -1 : 1)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GAS_URL) {
    return NextResponse.json({ error: 'GAS_SALARIOS_URL not configured' }, { status: 500 })
  }

  try {
    const res  = await fetch(`${GAS_URL}?action=getAll`, { cache: 'no-store' })
    const text = await res.text()
    let raw: any[]
    try { raw = JSON.parse(text) } catch {
      return NextResponse.json({ error: 'GAS returned non-JSON: ' + text.slice(0, 200) }, { status: 502 })
    }

    const email = session.user.email.toLowerCase()
    const mgr   = raw.find((m: any) => String(m.email || '').toLowerCase() === email)
    if (!mgr) return NextResponse.json(null)

    const payments = (mgr.payments ?? [])
      .map((p: any) => {
        const dateRaw = toDateRaw(p.dateRaw)
        if (!dateRaw) return null
        return { ...p, dateRaw, date: toDateLabel(p.dateRaw) }
      })
      .filter(Boolean)

    return NextResponse.json({ ...mgr, payments, months: groupMonths(payments) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
