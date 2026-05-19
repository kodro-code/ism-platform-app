import { NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_SALARIOS_URL ?? '';

function toDateRaw(raw: string): string | null {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toDateLabel(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function groupMonths(payments: any[]) {
  const map: Record<string, any> = {};
  for (const p of payments) {
    const [y, m] = p.dateRaw.split('-').map(Number);
    let year = y, mon = m - 1;
    if (p.isClosing) { mon -= 1; if (mon < 0) { mon = 11; year -= 1; } }
    const key   = `${year}-${String(mon + 1).padStart(2, '0')}`;
    const label = new Date(year, mon, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!map[key]) map[key] = { key, label, fix: 0, commission: 0, bonus: 0, fines: 0, totalSalary: 0, payments: [] };
    map[key].fix         += p.fix;
    map[key].commission  += p.commission;
    map[key].bonus       += p.bonus;
    map[key].fines       += p.fines;
    map[key].totalSalary += p.totalSalary;
    map[key].payments.push(p);
  }
  return Object.values(map).sort((a: any, b: any) => a.key < b.key ? -1 : 1);
}

export async function GET() {
  try {
    const res = await fetch(`${GAS_URL}?action=getAll`, { cache: 'no-store' });
    const text = await res.text();
    let raw: any[];
    try { raw = JSON.parse(text); } catch {
      console.error('GAS non-JSON response:', text.slice(0, 500));
      return NextResponse.json({ error: 'GAS returned non-JSON: ' + text.slice(0, 200) }, { status: 502 });
    }

    const data = raw.map((mgr: any) => {
      const payments = (mgr.payments ?? [])
        .map((p: any) => {
          const dateRaw = toDateRaw(p.dateRaw);
          if (!dateRaw) return null;
          return { ...p, dateRaw, date: toDateLabel(p.dateRaw) };
        })
        .filter(Boolean);

      return { ...mgr, payments, months: groupMonths(payments) };
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { mgrRow, col, status } = await req.json();
    const url = `${GAS_URL}?action=setApproval&mgrRow=${mgrRow}&col=${col}&status=${encodeURIComponent(status)}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
