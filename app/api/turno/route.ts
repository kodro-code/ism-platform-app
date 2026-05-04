import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_TURNO_URL;

export async function GET() {
  if (!GAS_URL) return NextResponse.json({ success: false, error: 'GAS_TURNO_URL não configurada' });
  try {
    const res  = await fetch(`${GAS_URL}?action=managers`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}

export async function POST(req: NextRequest) {
  if (!GAS_URL) return NextResponse.json({ success: false, error: 'GAS_TURNO_URL não configurada' });
  try {
    const body = await req.json();
    const res  = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
